"""
AgriDirect AI Chat Assistant

Data-driven conversational assistant that uses application data
to provide advisory recommendations to farmers and buyers.
"""
from sqlalchemy.orm import Session
from app.models.market import MarketPrice
from app.models.produce import ProduceListing
from app.models.buyer import BuyerRequirement
from app.models.order import Order
from app.ai.forecasting import generate_forecast
from datetime import datetime


def process_chat(message: str, user_role: str, user_id: int, db: Session) -> dict:
    """Process a chat message and return a data-driven response."""
    msg_lower = message.lower()

    # Demand queries
    if any(w in msg_lower for w in ["demand", "forecast", "predict", "expected"]):
        crop = _extract_crop(msg_lower)
        if crop:
            forecast = generate_forecast(crop, "Coimbatore", 7, db)
            return {
                "response": forecast["explanation"],
                "data": {
                    "type": "forecast",
                    "crop": crop,
                    "current_demand": forecast["current_demand"],
                    "predicted_demand": forecast["predicted_demand"],
                    "trend": forecast["trend"],
                    "demand_level": forecast["demand_level"]
                }
            }
        return {
            "response": "Which crop would you like the demand forecast for? I can provide predictions for Tomato, Onion, Potato, Banana, Coconut, Carrot, and Cabbage.",
            "data": None
        }

    # Price queries
    if any(w in msg_lower for w in ["price", "cost", "rate", "₹"]):
        crop = _extract_crop(msg_lower)
        if crop:
            prices = db.query(MarketPrice).filter(
                MarketPrice.crop.ilike(f"%{crop}%")
            ).order_by(MarketPrice.date.desc()).limit(5).all()
            if prices:
                price_info = ", ".join([f"{p.location}: ₹{p.price}/kg" for p in prices])
                return {
                    "response": f"Current market prices for {crop}: {price_info}. "
                               f"Trend: {prices[0].trend}. Demand Level: {prices[0].demand_level}. "
                               f"Note: Prices shown are prototype/demo data and may differ from actual market prices.",
                    "data": {"type": "prices", "crop": crop}
                }
        return {
            "response": "Please specify a crop to check prices. Available crops: Tomato, Onion, Potato, Banana, Coconut, Carrot, Cabbage.",
            "data": None
        }

    # Best buyer / matching queries
    if any(w in msg_lower for w in ["buyer", "best", "match", "who", "sell"]):
        if user_role == "FARMER":
            requirements = db.query(BuyerRequirement).filter(
                BuyerRequirement.status == "ACTIVE"
            ).order_by(BuyerRequirement.max_price.desc()).limit(5).all()
            if requirements:
                buyer_info = ". ".join([
                    f"{r.crop}: {r.quantity}kg at max ₹{r.max_price}/kg ({r.location})"
                    for r in requirements
                ])
                return {
                    "response": f"Here are the top active buyer requirements: {buyer_info}. "
                               f"You can use Smart Matches to find the best fit for your produce.",
                    "data": {"type": "requirements", "count": len(requirements)}
                }
        return {
            "response": "I can help you find buyers. Please list your produce first, and the Smart Matching system will find the best buyers for you.",
            "data": None
        }

    # Listing / when to sell queries
    if any(w in msg_lower for w in ["list", "should i", "when", "sell now", "timing"]):
        crop = _extract_crop(msg_lower)
        if crop:
            forecast = generate_forecast(crop, "Coimbatore", 7, db)
            if forecast["trend"] == "INCREASING" and forecast["demand_level"] == "HIGH":
                advice = f"Based on current data, this appears to be a favorable time to list {crop}. Demand is {forecast['trend'].lower()} with {forecast['demand_level'].lower()} demand levels."
            elif forecast["trend"] == "DECREASING":
                advice = f"Demand for {crop} is currently {forecast['trend'].lower()}. You may want to wait for better conditions or explore alternative markets."
            else:
                advice = f"Demand for {crop} is currently stable. It's a reasonable time to list, though no urgent advantage is detected."
            return {
                "response": f"{advice} Current demand: {forecast['current_demand']:.0f} kg/day. "
                           f"Advisory: This is an AI-generated estimate and should not be treated as financial advice.",
                "data": {"type": "advice", "crop": crop, "trend": forecast["trend"]}
            }
        return {"response": "Which crop are you planning to sell? I can provide market insights.", "data": None}

    # Transport / logistics queries
    if any(w in msg_lower for w in ["transport", "delivery", "route", "logistics", "cost"]):
        return {
            "response": "For optimized delivery routes and cost estimates, go to the Logistics section. "
                       "The route optimizer considers distance, vehicle capacity, and pickup sequences to find the most efficient route. "
                       "Typical transport costs in the Coimbatore region range from ₹25-35 per km for standard agricultural vehicles.",
            "data": {"type": "logistics_info"}
        }

    # General help
    return {
        "response": "I'm AgriDirect AI, your agricultural market assistant. I can help you with:\n\n"
                   "• **Demand Forecasts** — \"What is the demand for tomatoes?\"\n"
                   "• **Market Prices** — \"What is the price of onions?\"\n"
                   "• **Selling Advice** — \"Should I list my tomatoes now?\"\n"
                   "• **Buyer Discovery** — \"Which buyer is best for my produce?\"\n"
                   "• **Transport Info** — \"How can I reduce transport cost?\"\n\n"
                   "All recommendations are advisory. Please make decisions based on your own judgment and local conditions.",
        "data": None
    }


def _extract_crop(text: str) -> str:
    """Extract crop name from text."""
    crops = ["tomato", "onion", "potato", "banana", "coconut", "carrot", "cabbage"]
    for crop in crops:
        if crop in text:
            return crop.capitalize()
    # Check plural forms
    for crop in crops:
        if crop + "es" in text or crop + "s" in text:
            return crop.capitalize()
    return ""
