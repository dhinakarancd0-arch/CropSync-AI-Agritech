from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.notification import Notification
from app.models.order import Payment
from app.models.user import User
from app.schemas import NotificationResponse, PaymentResponse, PaymentUpdate
from app.auth.jwt_handler import get_current_user

router = APIRouter(tags=["Notifications & Payments"])


# ============ NOTIFICATIONS ============

@router.get("/api/notifications", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return [NotificationResponse.model_validate(n) for n in notifications]


@router.put("/api/notifications/{notification_id}/read")
def mark_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.put("/api/notifications/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read"}


# ============ PAYMENTS ============

@router.get("/api/payments", response_model=List[PaymentResponse])
def get_payments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    from app.models.order import Order
    if current_user.role in ("FARMER", "FPO"):
        order_ids = [o.id for o in db.query(Order).filter(Order.farmer_id == current_user.id).all()]
    elif current_user.role == "BUYER":
        order_ids = [o.id for o in db.query(Order).filter(Order.buyer_id == current_user.id).all()]
    elif current_user.role == "CONSUMER":
        order_ids = [o.id for o in db.query(Order).filter(Order.consumer_id == current_user.id).all()]
    else:
        order_ids = [o.id for o in db.query(Order).all()]

    payments = db.query(Payment).filter(Payment.order_id.in_(order_ids)).all()
    return [PaymentResponse.model_validate(p) for p in payments]


@router.put("/api/payments/{payment_id}")
def update_payment(payment_id: int, data: PaymentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = data.status
    db.commit()
    return {"message": f"Payment status updated to {data.status}"}
