from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database.connection import Base


class ProduceListing(Base):
    __tablename__ = "produce_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, nullable=False, index=True)
    crop = Column(String(100), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    quality_grade = Column(String(20), default="Grade A")
    expected_harvest = Column(DateTime, nullable=True)
    location = Column(String(255), nullable=True)
    min_price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, SOLD, EXPIRED
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
