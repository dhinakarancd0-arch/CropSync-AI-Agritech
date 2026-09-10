from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User, FarmerProfile, FPOProfile, BuyerProfile, ConsumerProfile
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth.jwt_handler import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=data.role,
        location=data.location,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create role-specific profile
    if data.role == "FARMER":
        profile = FarmerProfile(
            user_id=user.id,
            farm_name=data.farm_name,
            farm_location=data.farm_location or data.location,
            primary_crops=data.primary_crops,
            farm_size_acres=data.farm_size_acres,
            lat=data.farm_lat,
            lng=data.farm_lng
        )
        db.add(profile)
    elif data.role == "FPO":
        profile = FPOProfile(
            user_id=user.id,
            fpo_name=data.fpo_name,
            registration_number=data.registration_number,
            member_count=data.member_count,
            location=data.location
        )
        db.add(profile)
    elif data.role == "BUYER":
        profile = BuyerProfile(
            user_id=user.id,
            business_name=data.business_name,
            business_type=data.business_type,
            location=data.location
        )
        db.add(profile)
    elif data.role == "CONSUMER":
        profile = ConsumerProfile(
            user_id=user.id,
            address=data.address,
            phone=data.phone
        )
        db.add(profile)

    db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "location": user.location,
            "is_verified": user.is_verified
        }
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    profile = _get_profile(user, db)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "location": user.location,
            "is_verified": user.is_verified,
            "profile": profile
        }
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = _get_profile(current_user, db)
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role,
        location=current_user.location,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        profile=profile
    )


def _get_profile(user: User, db: Session) -> dict:
    if user.role == "FARMER":
        p = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if p:
            return {
                "farm_name": p.farm_name, "farm_location": p.farm_location,
                "primary_crops": p.primary_crops, "farm_size_acres": p.farm_size_acres,
                "lat": p.lat, "lng": p.lng, "trust_score": p.trust_score,
                "completed_orders": p.completed_orders
            }
    elif user.role == "BUYER":
        p = db.query(BuyerProfile).filter(BuyerProfile.user_id == user.id).first()
        if p:
            return {
                "business_name": p.business_name, "business_type": p.business_type,
                "location": p.location, "lat": p.lat, "lng": p.lng,
                "trust_score": p.trust_score, "completed_orders": p.completed_orders
            }
    elif user.role == "FPO":
        p = db.query(FPOProfile).filter(FPOProfile.user_id == user.id).first()
        if p:
            return {
                "fpo_name": p.fpo_name, "registration_number": p.registration_number,
                "member_count": p.member_count, "location": p.location
            }
    elif user.role == "CONSUMER":
        p = db.query(ConsumerProfile).filter(ConsumerProfile.user_id == user.id).first()
        if p:
            return {"address": p.address, "phone": p.phone}
    return {}
