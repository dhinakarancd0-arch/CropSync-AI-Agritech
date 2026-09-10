from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from app.database.connection import Base


class LogisticsRequest(Base):
    __tablename__ = "logistics_requests"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=True, index=True)
    pickup_points = Column(Text, nullable=True)  # JSON array
    destination = Column(String(255), nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
    vehicle_capacity = Column(Float, default=2000.0)
    status = Column(String(20), default="PENDING")  # PENDING, OPTIMIZED, IN_PROGRESS, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_type = Column(String(50), nullable=False)
    capacity_kg = Column(Float, nullable=False)
    rate_per_km = Column(Float, default=30.0)
    is_available = Column(String(10), default="YES")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    logistics_id = Column(Integer, nullable=True, index=True)
    sequence = Column(Text, nullable=True)  # JSON array of stops
    total_distance_km = Column(Float, nullable=True)
    estimated_time_minutes = Column(Float, nullable=True)
    capacity_used_kg = Column(Float, nullable=True)
    capacity_total_kg = Column(Float, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
