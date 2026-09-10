from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base
import enum


class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    FPO = "FPO"
    BUYER = "BUYER"
    CONSUMER = "CONSUMER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    location = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    fpo_profile = relationship("FPOProfile", back_populates="user", uselist=False)
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False)
    consumer_profile = relationship("ConsumerProfile", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    farm_name = Column(String(255), nullable=True)
    farm_location = Column(String(255), nullable=True)
    primary_crops = Column(Text, nullable=True)  # JSON string
    farm_size_acres = Column(Float, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    trust_score = Column(Float, default=4.0)
    completed_orders = Column(Integer, default=0)
    cancellation_rate = Column(Float, default=0.0)
    response_rate = Column(Float, default=95.0)

    user = relationship("User", back_populates="farmer_profile")


class FPOProfile(Base):
    __tablename__ = "fpo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    fpo_name = Column(String(255), nullable=True)
    registration_number = Column(String(100), nullable=True)
    member_count = Column(Integer, nullable=True)
    location = Column(String(255), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    trust_score = Column(Float, default=4.0)

    user = relationship("User", back_populates="fpo_profile")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    business_name = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    trust_score = Column(Float, default=4.0)
    completed_orders = Column(Integer, default=0)

    user = relationship("User", back_populates="buyer_profile")


class ConsumerProfile(Base):
    __tablename__ = "consumer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)

    user = relationship("User", back_populates="consumer_profile")
