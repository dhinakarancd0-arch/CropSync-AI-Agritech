from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database.connection import Base


class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    quality = Column(String(20), default="Grade A")
    max_price = Column(Float, nullable=False)
    location = Column(String(255), nullable=True)
    delivery_deadline = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, FULFILLED, EXPIRED
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
