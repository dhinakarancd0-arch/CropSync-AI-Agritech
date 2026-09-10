from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.ai.forecasting import generate_forecast
from app.ai.assistant import process_chat
from app.schemas import ForecastResponse, ChatMessage, ChatResponse
from app.auth.jwt_handler import get_current_user
from app.models.user import User

router = APIRouter(tags=["AI & Forecast"])


@router.get("/api/forecast", response_model=ForecastResponse)
def get_forecast(
    crop: str = Query(..., description="Crop name"),
    location: str = Query("Coimbatore", description="Location"),
    days: int = Query(7, description="Days to forecast"),
    db: Session = Depends(get_db)
):
    result = generate_forecast(crop, location, days, db)
    return ForecastResponse(**result)


@router.post("/api/ai/chat", response_model=ChatResponse)
def ai_chat(
    data: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = process_chat(data.message, current_user.role, current_user.id, db)
    return ChatResponse(**result)
