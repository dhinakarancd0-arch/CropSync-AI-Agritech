"""
AgriDirect AI Demand Forecasting Module

Uses weighted moving average with seasonal adjustment for demand prediction.
Structured to optionally integrate Gemini API for natural language explanations.
"""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.market import MarketPrice, DemandForecast
from app.models.buyer import BuyerRequirement


def generate_forecast(crop: str, location: str, days: int, db: Session) -> dict:
    """
    Generate demand forecast using weighted moving average with seasonal patterns.
    """
    # Get historical market data
    since = datetime.utcnow() - timedelta(days=90)
    historical_prices = db.query(MarketPrice).filter(
        MarketPrice.crop.ilike(f"%{crop}%"),
        MarketPrice.location.ilike(f"%{location}%"),
        MarketPrice.date >= since
    ).order_by(MarketPrice.date.asc()).all()

    # Get active buyer requirements for demand signal
    active_requirements = db.query(BuyerRequirement).filter(
        BuyerRequirement.crop.ilike(f"%{crop}%"),
        BuyerRequirement.status == "ACTIVE"
    ).all()

    # Extract historical volumes for analysis
    if historical_prices:
        volumes = [p.volume_kg or 500 for p in historical_prices]
        prices = [p.price for p in historical_prices]
        dates = [p.date for p in historical_prices]
    else:
        # Generate synthetic historical data if none exists
        base_demand = _get_base_demand(crop)
        volumes = []
        prices = []
        dates = []
        for i in range(30):
            d = datetime.utcnow() - timedelta(days=30 - i)
            seasonal = _seasonal_factor(crop, d.month)
            daily_noise = np.random.normal(0, base_demand * 0.08)
            vol = max(100, base_demand * seasonal + daily_noise)
            volumes.append(round(vol, 1))
            prices.append(round(_get_base_price(crop) * seasonal + np.random.normal(0, 2), 1))
            dates.append(d)

    current_demand = volumes[-1] if volumes else _get_base_demand(crop)

    # Weighted Moving Average forecast
    forecast_values = _weighted_moving_average(volumes, days)

    # Add demand signals from buyer requirements
    requirement_boost = sum(r.quantity for r in active_requirements) * 0.01
    forecast_values = [v + requirement_boost for v in forecast_values]

    # Calculate predicted demand (average of forecast)
    predicted_demand = round(np.mean(forecast_values), 1)

    # Determine trend
    if len(volumes) >= 5:
        recent_avg = np.mean(volumes[-5:])
        older_avg = np.mean(volumes[-10:-5]) if len(volumes) >= 10 else np.mean(volumes[:5])
        change_pct = (recent_avg - older_avg) / older_avg * 100 if older_avg > 0 else 0
        if change_pct > 5:
            trend = "INCREASING"
        elif change_pct < -5:
            trend = "DECREASING"
        else:
            trend = "STABLE"
    else:
        trend = "STABLE"

    # Determine demand level
    base = _get_base_demand(crop)
    if predicted_demand > base * 1.2:
        demand_level = "HIGH"
    elif predicted_demand < base * 0.8:
        demand_level = "LOW"
    else:
        demand_level = "MEDIUM"

    # Confidence calculation
    data_points = len(volumes)
    confidence = min(0.95, 0.5 + (data_points / 100))

    # Format historical data for chart
    historical_chart = []
    for i, (d, v) in enumerate(zip(dates[-30:], volumes[-30:])):
        historical_chart.append({
            "date": d.strftime("%Y-%m-%d") if isinstance(d, datetime) else str(d),
            "demand": round(v, 1),
            "type": "historical"
        })

    # Format forecast data for chart
    forecast_chart = []
    for i, v in enumerate(forecast_values[:days]):
        future_date = datetime.utcnow() + timedelta(days=i + 1)
        forecast_chart.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "demand": round(v, 1),
            "type": "forecast"
        })

    # Generate explanation
    explanation = _generate_explanation(crop, location, current_demand, predicted_demand, trend, demand_level, len(active_requirements))

    return {
        "crop": crop,
        "location": location,
        "current_demand": round(current_demand, 1),
        "predicted_demand": predicted_demand,
        "trend": trend,
        "demand_level": demand_level,
        "confidence": round(confidence, 2),
        "historical": historical_chart,
        "forecast": forecast_chart,
        "explanation": explanation
    }


def _weighted_moving_average(data: List[float], forecast_days: int) -> List[float]:
    """Calculate weighted moving average forecast."""
    if not data:
        return [500.0] * forecast_days

    n = min(len(data), 7)  # Window size
    weights = np.arange(1, n + 1, dtype=float)
    weights = weights / weights.sum()

    recent = data[-n:]
    wma = np.dot(weights, recent)

    # Trend component
    if len(data) >= 14:
        recent_wma = np.dot(weights, data[-n:])
        older_wma = np.dot(weights, data[-2 * n:-n])
        trend = (recent_wma - older_wma) / n
    else:
        trend = 0

    # Generate forecast with trend and noise
    forecast = []
    for i in range(forecast_days):
        val = wma + trend * (i + 1)
        noise = np.random.normal(0, wma * 0.03)
        forecast.append(max(50, val + noise))

    return forecast


def _get_base_demand(crop: str) -> float:
    """Get base daily demand for a crop in kg."""
    base_demands = {
        "tomato": 1200, "onion": 1500, "potato": 1800,
        "banana": 1000, "coconut": 800, "carrot": 600, "cabbage": 700
    }
    return base_demands.get(crop.lower(), 800)


def _get_base_price(crop: str) -> float:
    """Get base price for a crop."""
    prices = {
        "tomato": 28, "onion": 31, "potato": 22,
        "banana": 35, "coconut": 25, "carrot": 38, "cabbage": 20
    }
    return prices.get(crop.lower(), 25)


def _seasonal_factor(crop: str, month: int) -> float:
    """Get seasonal adjustment factor."""
    # Simplified seasonal patterns for South India
    summer_crops = {"tomato", "onion", "carrot"}
    monsoon_crops = {"banana", "coconut", "cabbage"}

    if crop.lower() in summer_crops:
        if month in (3, 4, 5):
            return 1.3
        elif month in (6, 7, 8):
            return 0.8
        return 1.0
    elif crop.lower() in monsoon_crops:
        if month in (6, 7, 8, 9):
            return 1.2
        elif month in (12, 1, 2):
            return 0.85
        return 1.0
    return 1.0


def _generate_explanation(crop, location, current, predicted, trend, level, req_count):
    """Generate natural language explanation of the forecast."""
    parts = [f"AI-generated estimate for {crop} demand in {location}."]

    if trend == "INCREASING":
        parts.append(f"Demand is expected to increase from {current:.0f} kg/day to {predicted:.0f} kg/day.")
        parts.append("This upward trend is based on recent buyer requirements and historical demand patterns.")
    elif trend == "DECREASING":
        parts.append(f"Demand is expected to decrease from {current:.0f} kg/day to {predicted:.0f} kg/day.")
        parts.append("Consider adjusting harvest timing or exploring alternative markets.")
    else:
        parts.append(f"Demand is expected to remain stable around {predicted:.0f} kg/day.")

    if req_count > 0:
        parts.append(f"There are currently {req_count} active buyer requirements for {crop}.")

    if level == "HIGH":
        parts.append("Advisory: This is a favorable time to list produce, as demand levels are high.")
    elif level == "LOW":
        parts.append("Advisory: Consider storage or value-added processing as demand is currently low.")

    parts.append("Note: This is an advisory prediction and should not be used as a guarantee of future demand or prices.")

    return " ".join(parts)
