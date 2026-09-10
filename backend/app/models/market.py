from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database.connection import Base


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    price = Column(Float, nullable=False)
    demand_level = Column(String(20), default="MEDIUM")  # HIGH, MEDIUM, LOW
    trend = Column(String(20), default="STABLE")  # INCREASING, STABLE, DECREASING
    volume_kg = Column(Float, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    crop = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    predicted_demand = Column(Float, nullable=False)
    actual_demand = Column(Float, nullable=True)
    trend = Column(String(20), default="STABLE")
    demand_level = Column(String(20), default="MEDIUM")
    confidence = Column(Float, default=0.75)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
