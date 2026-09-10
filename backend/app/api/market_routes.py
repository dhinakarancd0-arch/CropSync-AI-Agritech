from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.market import MarketPrice
from app.schemas import MarketPriceResponse
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/market-prices", tags=["Market Prices"])


@router.get("/", response_model=List[MarketPriceResponse])
def get_market_prices(
    crop: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MarketPrice)
    if crop:
        query = query.filter(MarketPrice.crop.ilike(f"%{crop}%"))
    if location:
        query = query.filter(MarketPrice.location.ilike(f"%{location}%"))

    # Get latest prices (one per crop-location pair)
    from sqlalchemy import func
    subquery = db.query(
        MarketPrice.crop,
        MarketPrice.location,
        func.max(MarketPrice.date).label("max_date")
    ).group_by(MarketPrice.crop, MarketPrice.location).subquery()

    query = db.query(MarketPrice).join(
        subquery,
        (MarketPrice.crop == subquery.c.crop) &
        (MarketPrice.location == subquery.c.location) &
        (MarketPrice.date == subquery.c.max_date)
    )

    if crop:
        query = query.filter(MarketPrice.crop.ilike(f"%{crop}%"))
    if location:
        query = query.filter(MarketPrice.location.ilike(f"%{location}%"))

    prices = query.all()
    return [MarketPriceResponse.model_validate(p) for p in prices]


@router.get("/history")
def get_price_history(
    crop: str,
    location: Optional[str] = None,
    days: int = 30,
    db: Session = Depends(get_db)
):
    since = datetime.utcnow() - timedelta(days=days)
    query = db.query(MarketPrice).filter(
        MarketPrice.crop.ilike(f"%{crop}%"),
        MarketPrice.date >= since
    )
    if location:
        query = query.filter(MarketPrice.location.ilike(f"%{location}%"))

    prices = query.order_by(MarketPrice.date.asc()).all()
    return [{
        "date": p.date.isoformat() if p.date else None,
        "price": p.price,
        "location": p.location,
        "demand_level": p.demand_level,
        "volume_kg": p.volume_kg
    } for p in prices]
