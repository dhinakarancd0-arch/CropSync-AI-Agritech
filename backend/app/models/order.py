from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from datetime import datetime
from app.database.connection import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, nullable=True, index=True)
    requirement_id = Column(Integer, nullable=True, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)
    farmer_id = Column(Integer, nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING")  # PENDING, COUNTERED, ACCEPTED, REJECTED
    counter_price = Column(Float, nullable=True)
    counter_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, nullable=True)
    farmer_id = Column(Integer, nullable=False, index=True)
    buyer_id = Column(Integer, nullable=False, index=True)
    consumer_id = Column(Integer, nullable=True, index=True)
    crop = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String(30), default="CREATED")
    # CREATED, CONFIRMED, PICKUP_SCHEDULED, COLLECTED, IN_TRANSIT, DELIVERED, PAYMENT_RELEASED
    pickup_location = Column(String(255), nullable=True)
    delivery_location = Column(String(255), nullable=True)
    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)
    delivery_lat = Column(Float, nullable=True)
    delivery_lng = Column(Float, nullable=True)
    expected_delivery = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    listing_id = Column(Integer, nullable=True)
    crop = Column(String(100), nullable=True)
    quantity = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total = Column(Float, nullable=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="PENDING")  # PENDING, SECURED, RELEASED
    payment_method = Column(String(50), default="DEMO")
    transaction_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
