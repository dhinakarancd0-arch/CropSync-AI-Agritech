from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.buyer import BuyerRequirement
from app.models.user import User
from app.schemas import RequirementCreate, RequirementResponse
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api/requirements", tags=["Buyer Requirements"])


@router.post("/", response_model=RequirementResponse)
def create_requirement(data: RequirementCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("BUYER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only buyers can post requirements")

    req = BuyerRequirement(
        buyer_id=current_user.id,
        crop=data.crop,
        quantity=data.quantity,
        quality=data.quality,
        max_price=data.max_price,
        location=data.location or current_user.location,
        delivery_deadline=data.delivery_deadline,
        description=data.description,
        lat=data.lat,
        lng=data.lng,
        status="ACTIVE"
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _to_response(req, db)


@router.get("/", response_model=List[RequirementResponse])
def list_requirements(
    crop: Optional[str] = None,
    location: Optional[str] = None,
    buyer_id: Optional[int] = None,
    status: Optional[str] = "ACTIVE",
    db: Session = Depends(get_db)
):
    query = db.query(BuyerRequirement)
    if crop:
        query = query.filter(BuyerRequirement.crop.ilike(f"%{crop}%"))
    if location:
        query = query.filter(BuyerRequirement.location.ilike(f"%{location}%"))
    if buyer_id:
        query = query.filter(BuyerRequirement.buyer_id == buyer_id)
    if status:
        query = query.filter(BuyerRequirement.status == status)
    reqs = query.order_by(BuyerRequirement.created_at.desc()).all()
    return [_to_response(r, db) for r in reqs]


@router.get("/{req_id}", response_model=RequirementResponse)
def get_requirement(req_id: int, db: Session = Depends(get_db)):
    req = db.query(BuyerRequirement).filter(BuyerRequirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return _to_response(req, db)


def _to_response(req: BuyerRequirement, db: Session) -> RequirementResponse:
    buyer = db.query(User).filter(User.id == req.buyer_id).first()
    return RequirementResponse(
        id=req.id,
        buyer_id=req.buyer_id,
        crop=req.crop,
        quantity=req.quantity,
        quality=req.quality,
        max_price=req.max_price,
        location=req.location,
        delivery_deadline=req.delivery_deadline,
        description=req.description,
        status=req.status,
        created_at=req.created_at,
        buyer_name=buyer.full_name if buyer else None
    )
