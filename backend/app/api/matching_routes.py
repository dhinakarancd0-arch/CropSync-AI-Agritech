from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.produce import ProduceListing
from app.models.buyer import BuyerRequirement
from app.models.user import User, FarmerProfile
from app.auth.jwt_handler import get_current_user
import math

router = APIRouter(prefix="/api/matches", tags=["Matching"])


def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in km using Haversine formula."""
    if None in (lat1, lng1, lat2, lng2):
        return 50.0  # Default distance if coordinates missing
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def calculate_match_score(listing: ProduceListing, requirement: BuyerRequirement, farmer: User, farmer_profile: FarmerProfile):
    """Calculate multi-criteria match score between a produce listing and buyer requirement."""
    scores = {}

    # Crop compatibility (exact match = 100, else 0)
    scores["crop"] = 100 if listing.crop.lower() == requirement.crop.lower() else 0

    # Quantity compatibility (ratio-based)
    if requirement.quantity > 0:
        ratio = listing.quantity / requirement.quantity
        if ratio >= 1.0:
            scores["quantity"] = 100
        elif ratio >= 0.5:
            scores["quantity"] = int(ratio * 100)
        else:
            scores["quantity"] = int(ratio * 60)
    else:
        scores["quantity"] = 50

    # Quality compatibility
    grade_map = {"Grade A": 3, "Grade B": 2, "Grade C": 1}
    listing_grade = grade_map.get(listing.quality_grade, 2)
    req_grade = grade_map.get(requirement.quality, 2)
    if listing_grade >= req_grade:
        scores["quality"] = 100
    elif listing_grade == req_grade - 1:
        scores["quality"] = 70
    else:
        scores["quality"] = 40

    # Distance score
    distance = haversine_distance(
        listing.lat, listing.lng,
        requirement.lat, requirement.lng
    )
    if distance <= 10:
        scores["distance"] = 100
    elif distance <= 25:
        scores["distance"] = 90
    elif distance <= 50:
        scores["distance"] = 75
    elif distance <= 100:
        scores["distance"] = 60
    else:
        scores["distance"] = max(30, int(100 - distance / 2))

    # Price compatibility
    if listing.min_price <= requirement.max_price:
        price_ratio = listing.min_price / requirement.max_price
        scores["price"] = int(100 - (price_ratio * 20))
    else:
        overage = (listing.min_price - requirement.max_price) / requirement.max_price
        scores["price"] = max(0, int(70 - overage * 100))

    # Harvest/deadline alignment
    if listing.expected_harvest and requirement.delivery_deadline:
        days_diff = (requirement.delivery_deadline - listing.expected_harvest).days
        if days_diff >= 3:
            scores["timing"] = 100
        elif days_diff >= 0:
            scores["timing"] = 85
        elif days_diff >= -3:
            scores["timing"] = 60
        else:
            scores["timing"] = 30
    else:
        scores["timing"] = 70

    # Weighted overall score
    weights = {"crop": 0.25, "quantity": 0.15, "quality": 0.15, "distance": 0.15, "price": 0.20, "timing": 0.10}
    overall = sum(scores[k] * weights[k] for k in weights)

    # Trust bonus
    trust_bonus = 0
    if farmer_profile and farmer_profile.trust_score:
        trust_bonus = (farmer_profile.trust_score - 3) * 2
    overall = min(100, overall + trust_bonus)

    return {
        "overall": round(overall),
        "breakdown": scores,
        "distance_km": round(distance, 1)
    }


@router.get("/{requirement_id}")
def get_matches(requirement_id: int, db: Session = Depends(get_db)):
    requirement = db.query(BuyerRequirement).filter(BuyerRequirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    # Find matching produce listings
    listings = db.query(ProduceListing).filter(
        ProduceListing.crop.ilike(f"%{requirement.crop}%"),
        ProduceListing.status == "ACTIVE"
    ).all()

    matches = []
    for listing in listings:
        farmer = db.query(User).filter(User.id == listing.farmer_id).first()
        farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == listing.farmer_id).first()

        score = calculate_match_score(listing, requirement, farmer, farmer_profile)

        if score["overall"] >= 20:  # Minimum threshold
            matches.append({
                "listing_id": listing.id,
                "farmer_id": listing.farmer_id,
                "farmer_name": farmer.full_name if farmer else "Unknown",
                "farmer_verified": farmer.is_verified if farmer else False,
                "farm_name": farmer_profile.farm_name if farmer_profile else None,
                "crop": listing.crop,
                "quantity": listing.quantity,
                "unit": listing.unit,
                "quality_grade": listing.quality_grade,
                "min_price": listing.min_price,
                "location": listing.location,
                "expected_harvest": listing.expected_harvest.isoformat() if listing.expected_harvest else None,
                "lat": listing.lat,
                "lng": listing.lng,
                "match_score": score["overall"],
                "score_breakdown": score["breakdown"],
                "distance_km": score["distance_km"],
                "trust_score": farmer_profile.trust_score if farmer_profile else None,
                "completed_orders": farmer_profile.completed_orders if farmer_profile else 0,
                "match_explanation": _generate_explanation(score, listing, requirement)
            })

    # Sort by match score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return {"requirement": {
        "id": requirement.id,
        "crop": requirement.crop,
        "quantity": requirement.quantity,
        "quality": requirement.quality,
        "max_price": requirement.max_price,
        "location": requirement.location
    }, "matches": matches, "total": len(matches)}


def _generate_explanation(score: dict, listing: ProduceListing, requirement: BuyerRequirement) -> str:
    parts = []
    bd = score["breakdown"]
    if bd["crop"] == 100:
        parts.append(f"Exact crop match ({listing.crop})")
    if bd["quantity"] >= 80:
        parts.append(f"Sufficient quantity available ({listing.quantity} {listing.unit})")
    elif bd["quantity"] >= 50:
        parts.append(f"Partial quantity available ({listing.quantity} of {requirement.quantity} {listing.unit} needed)")
    if bd["quality"] >= 90:
        parts.append(f"Quality meets requirement ({listing.quality_grade})")
    if bd["distance"] >= 80:
        parts.append(f"Close proximity ({score['distance_km']} km)")
    if bd["price"] >= 80:
        parts.append(f"Competitive pricing (₹{listing.min_price}/kg)")
    if bd["timing"] >= 80:
        parts.append("Harvest aligns with delivery timeline")
    return ". ".join(parts) if parts else "Potential match based on available criteria"
