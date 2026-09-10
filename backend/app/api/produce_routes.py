from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.produce import ProduceListing
from app.models.user import User, FarmerProfile
from app.schemas import ProduceCreate, ProduceUpdate, ProduceResponse
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/produce", tags=["Produce"])


@router.post("/", response_model=ProduceResponse)
def create_produce(data: ProduceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("FARMER", "FPO", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only farmers and FPOs can list produce")

    listing = ProduceListing(
        farmer_id=current_user.id,
        crop=data.crop,
        quantity=data.quantity,
        unit=data.unit,
        quality_grade=data.quality_grade,
        expected_harvest=data.expected_harvest,
        location=data.location or current_user.location,
        min_price=data.min_price,
        description=data.description,
        image_url=data.image_url,
        lat=data.lat,
        lng=data.lng,
        status="ACTIVE"
    )

    # Auto-fill coordinates from farmer profile if not provided
    if not listing.lat:
        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
        if profile:
            listing.lat = profile.lat
            listing.lng = profile.lng

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return _to_response(listing, db)


@router.get("/", response_model=List[ProduceResponse])
def list_produce(
    crop: Optional[str] = None,
    location: Optional[str] = None,
    quality: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = "ACTIVE",
    farmer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProduceListing)
    if crop:
        query = query.filter(ProduceListing.crop.ilike(f"%{crop}%"))
    if location:
        query = query.filter(ProduceListing.location.ilike(f"%{location}%"))
    if quality:
        query = query.filter(ProduceListing.quality_grade == quality)
    if min_price is not None:
        query = query.filter(ProduceListing.min_price >= min_price)
    if max_price is not None:
        query = query.filter(ProduceListing.min_price <= max_price)
    if status:
        query = query.filter(ProduceListing.status == status)
    if farmer_id:
        query = query.filter(ProduceListing.farmer_id == farmer_id)

    listings = query.order_by(ProduceListing.created_at.desc()).all()
    return [_to_response(l, db) for l in listings]


@router.get("/{listing_id}", response_model=ProduceResponse)
def get_produce(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(ProduceListing).filter(ProduceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return _to_response(listing, db)


@router.put("/{listing_id}", response_model=ProduceResponse)
def update_produce(listing_id: int, data: ProduceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.query(ProduceListing).filter(ProduceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.farmer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    db.commit()
    db.refresh(listing)
    return _to_response(listing, db)


@router.delete("/{listing_id}")
def delete_produce(listing_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    listing = db.query(ProduceListing).filter(ProduceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.farmer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully"}


def _to_response(listing: ProduceListing, db: Session) -> ProduceResponse:
    farmer = db.query(User).filter(User.id == listing.farmer_id).first()
    return ProduceResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        crop=listing.crop,
        quantity=listing.quantity,
        unit=listing.unit,
        quality_grade=listing.quality_grade,
        expected_harvest=listing.expected_harvest,
        location=listing.location,
        min_price=listing.min_price,
        description=listing.description,
        image_url=listing.image_url,
        status=listing.status,
        lat=listing.lat,
        lng=listing.lng,
        created_at=listing.created_at,
        farmer_name=farmer.full_name if farmer else None,
        farmer_verified=farmer.is_verified if farmer else None
    )
