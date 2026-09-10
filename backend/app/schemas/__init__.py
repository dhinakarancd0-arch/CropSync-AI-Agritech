from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ============ AUTH SCHEMAS ============

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(FARMER|FPO|BUYER|CONSUMER|ADMIN)$")
    location: Optional[str] = None
    # Farmer fields
    farm_name: Optional[str] = None
    farm_location: Optional[str] = None
    primary_crops: Optional[str] = None
    farm_size_acres: Optional[float] = None
    farm_lat: Optional[float] = None
    farm_lng: Optional[float] = None
    # Buyer fields
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    # FPO fields
    fpo_name: Optional[str] = None
    registration_number: Optional[str] = None
    member_count: Optional[int] = None
    # Consumer fields
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    location: Optional[str] = None
    is_verified: bool = False
    created_at: Optional[datetime] = None
    profile: Optional[dict] = None

    class Config:
        from_attributes = True


# ============ PRODUCE SCHEMAS ============

class ProduceCreate(BaseModel):
    crop: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    unit: str = "kg"
    quality_grade: str = "Grade A"
    expected_harvest: Optional[datetime] = None
    location: Optional[str] = None
    min_price: float = Field(..., gt=0)
    description: Optional[str] = None
    image_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ProduceUpdate(BaseModel):
    crop: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    quality_grade: Optional[str] = None
    expected_harvest: Optional[datetime] = None
    location: Optional[str] = None
    min_price: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProduceResponse(BaseModel):
    id: int
    farmer_id: int
    crop: str
    quantity: float
    unit: str
    quality_grade: str
    expected_harvest: Optional[datetime] = None
    location: Optional[str] = None
    min_price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    created_at: Optional[datetime] = None
    farmer_name: Optional[str] = None
    farmer_verified: Optional[bool] = None

    class Config:
        from_attributes = True


# ============ BUYER REQUIREMENT SCHEMAS ============

class RequirementCreate(BaseModel):
    crop: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    quality: str = "Grade A"
    max_price: float = Field(..., gt=0)
    location: Optional[str] = None
    delivery_deadline: Optional[datetime] = None
    description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class RequirementResponse(BaseModel):
    id: int
    buyer_id: int
    crop: str
    quantity: float
    quality: str
    max_price: float
    location: Optional[str] = None
    delivery_deadline: Optional[datetime] = None
    description: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    buyer_name: Optional[str] = None

    class Config:
        from_attributes = True


# ============ OFFER SCHEMAS ============

class OfferCreate(BaseModel):
    listing_id: Optional[int] = None
    requirement_id: Optional[int] = None
    farmer_id: int
    quantity: float = Field(..., gt=0)
    price_per_kg: float = Field(..., gt=0)
    message: Optional[str] = None


class OfferResponse(BaseModel):
    id: int
    listing_id: Optional[int] = None
    requirement_id: Optional[int] = None
    buyer_id: int
    farmer_id: int
    quantity: float
    price_per_kg: float
    message: Optional[str] = None
    status: str
    counter_price: Optional[float] = None
    counter_message: Optional[str] = None
    created_at: Optional[datetime] = None
    buyer_name: Optional[str] = None
    farmer_name: Optional[str] = None
    crop: Optional[str] = None

    class Config:
        from_attributes = True


# ============ ORDER SCHEMAS ============

class OrderCreate(BaseModel):
    farmer_id: int
    buyer_id: Optional[int] = None
    consumer_id: Optional[int] = None
    crop: str
    quantity: float
    price_per_kg: float
    total: float
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    delivery_lat: Optional[float] = None
    delivery_lng: Optional[float] = None


class OrderResponse(BaseModel):
    id: int
    offer_id: Optional[int] = None
    farmer_id: int
    buyer_id: int
    consumer_id: Optional[int] = None
    crop: str
    quantity: float
    price_per_kg: float
    total: float
    status: str
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None
    expected_delivery: Optional[datetime] = None
    created_at: Optional[datetime] = None
    farmer_name: Optional[str] = None
    buyer_name: Optional[str] = None
    payment_status: Optional[str] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# ============ LOGISTICS SCHEMAS ============

class FarmerStop(BaseModel):
    farmer_id: int
    name: str
    lat: float
    lng: float
    quantity: float
    location: Optional[str] = None


class RouteOptimizeRequest(BaseModel):
    farmers: List[FarmerStop]
    destination: FarmerStop
    vehicle_capacity: float = 2000.0


class RouteOptimizeResponse(BaseModel):
    sequence: list
    total_distance_km: float
    estimated_time_minutes: float
    capacity_used_kg: float
    capacity_total_kg: float
    utilization_percent: float
    estimated_cost: float
    route_polyline: Optional[list] = None


# ============ MARKET SCHEMAS ============

class MarketPriceResponse(BaseModel):
    id: int
    crop: str
    location: str
    price: float
    demand_level: str
    trend: str
    volume_kg: Optional[float] = None
    date: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ FORECAST SCHEMAS ============

class ForecastResponse(BaseModel):
    crop: str
    location: str
    current_demand: float
    predicted_demand: float
    trend: str
    demand_level: str
    confidence: float
    historical: list
    forecast: list
    explanation: str


# ============ NOTIFICATION SCHEMAS ============

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: Optional[str] = None
    notification_type: str
    is_read: bool
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ PAYMENT SCHEMAS ============

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str
    payment_method: str
    transaction_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentUpdate(BaseModel):
    status: str


# ============ AI CHAT SCHEMAS ============

class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    data: Optional[dict] = None
