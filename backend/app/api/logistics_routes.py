from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.logistics.optimizer import optimize_route
from app.schemas import RouteOptimizeRequest, RouteOptimizeResponse
from app.auth.jwt_handler import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/logistics", tags=["Logistics"])


@router.post("/optimize-route", response_model=RouteOptimizeResponse)
def optimize(data: RouteOptimizeRequest, db: Session = Depends(get_db)):
    farmers = [
        {
            "farmer_id": f.farmer_id,
            "name": f.name,
            "lat": f.lat,
            "lng": f.lng,
            "quantity": f.quantity,
            "location": f.location or ""
        }
        for f in data.farmers
    ]
    destination = {
        "name": data.destination.name,
        "lat": data.destination.lat,
        "lng": data.destination.lng,
        "location": data.destination.location or ""
    }

    result = optimize_route(farmers, destination, data.vehicle_capacity)
    return RouteOptimizeResponse(**result)
