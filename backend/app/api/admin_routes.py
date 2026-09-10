from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.user import User, FarmerProfile, BuyerProfile
from app.models.produce import ProduceListing
from app.models.buyer import BuyerRequirement
from app.models.order import Order, Payment
from app.models.market import MarketPrice
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
def admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    total_farmers = db.query(User).filter(User.role == "FARMER").count()
    verified_farmers = db.query(User).filter(User.role == "FARMER", User.is_verified == True).count()
    total_buyers = db.query(User).filter(User.role == "BUYER").count()
    total_consumers = db.query(User).filter(User.role == "CONSUMER").count()
    active_listings = db.query(ProduceListing).filter(ProduceListing.status == "ACTIVE").count()
    total_orders = db.query(Order).count()
    active_orders = db.query(Order).filter(Order.status.notin_(["DELIVERED", "PAYMENT_RELEASED"])).count()

    # Transaction volume
    transaction_volume = db.query(func.sum(Order.total)).scalar() or 0

    # Average prices
    avg_farmer_price = db.query(func.avg(ProduceListing.min_price)).scalar() or 0
    avg_market_price = db.query(func.avg(MarketPrice.price)).scalar() or 0

    # Orders by status
    order_statuses = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()

    # Recent orders
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    return {
        "total_farmers": total_farmers,
        "verified_farmers": verified_farmers,
        "total_buyers": total_buyers,
        "total_consumers": total_consumers,
        "active_listings": active_listings,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "transaction_volume": round(transaction_volume, 2),
        "avg_farmer_price": round(avg_farmer_price, 2),
        "avg_market_price": round(avg_market_price, 2),
        "order_statuses": {s: c for s, c in order_statuses},
        "recent_orders": [{
            "id": o.id, "crop": o.crop, "quantity": o.quantity,
            "total": o.total, "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None
        } for o in recent_orders]
    }


@router.get("/users")
def admin_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{
        "id": u.id, "full_name": u.full_name, "email": u.email,
        "role": u.role, "location": u.location,
        "is_verified": u.is_verified, "created_at": u.created_at.isoformat() if u.created_at else None
    } for u in users]


@router.get("/supply-demand")
def supply_demand(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get supply vs demand data by crop."""
    crops = ["Tomato", "Onion", "Potato", "Banana", "Coconut", "Carrot", "Cabbage"]
    data = []
    for crop in crops:
        supply = db.query(func.sum(ProduceListing.quantity)).filter(
            ProduceListing.crop.ilike(f"%{crop}%"),
            ProduceListing.status == "ACTIVE"
        ).scalar() or 0

        demand = db.query(func.sum(BuyerRequirement.quantity)).filter(
            BuyerRequirement.crop.ilike(f"%{crop}%"),
            BuyerRequirement.status == "ACTIVE"
        ).scalar() or 0

        data.append({
            "crop": crop,
            "supply": round(supply, 1),
            "demand": round(demand, 1)
        })
    return data


@router.put("/users/{user_id}/verify")
def verify_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "ADMIN":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    u.is_verified = True
    db.commit()
    return {"message": "User verified", "user_id": user_id, "is_verified": True}
