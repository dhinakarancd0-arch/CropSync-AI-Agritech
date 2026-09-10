from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.database.connection import get_db
from app.models.order import Offer, Order, OrderItem, Payment
from app.models.produce import ProduceListing
from app.models.user import User
from app.models.notification import Notification
from app.schemas import OfferCreate, OfferResponse, OrderCreate, OrderResponse, OrderStatusUpdate
from app.auth.jwt_handler import get_current_user
import uuid

router = APIRouter(tags=["Offers & Orders"])


# ============ OFFER ENDPOINTS ============

@router.post("/api/offers", response_model=OfferResponse)
def create_offer(data: OfferCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("BUYER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Only buyers can create offers")

    listing = None
    crop_name = "produce"
    if data.listing_id:
        listing = db.query(ProduceListing).filter(ProduceListing.id == data.listing_id).first()
        if listing:
            crop_name = listing.crop

    offer = Offer(
        listing_id=data.listing_id,
        requirement_id=data.requirement_id,
        buyer_id=current_user.id,
        farmer_id=data.farmer_id,
        quantity=data.quantity,
        price_per_kg=data.price_per_kg,
        message=data.message,
        status="PENDING"
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)

    # Notify farmer
    notification = Notification(
        user_id=data.farmer_id,
        title="New Offer Received",
        message=f"{current_user.full_name} made an offer of ₹{data.price_per_kg}/kg for {data.quantity} kg of {crop_name}.",
        notification_type="OFFER",
        link=f"/farmer/offers"
    )
    db.add(notification)
    db.commit()

    return _offer_to_response(offer, db)


@router.get("/api/offers", response_model=List[OfferResponse])
def list_offers(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Offer)
    if current_user.role == "FARMER":
        query = query.filter(Offer.farmer_id == current_user.id)
    elif current_user.role == "BUYER":
        query = query.filter(Offer.buyer_id == current_user.id)
    if status:
        query = query.filter(Offer.status == status)
    offers = query.order_by(Offer.created_at.desc()).all()
    return [_offer_to_response(o, db) for o in offers]


@router.post("/api/offers/{offer_id}/accept")
def accept_offer(offer_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.farmer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    offer.status = "ACCEPTED"
    db.commit()

    # Get crop name from listing
    crop = "produce"
    pickup_location = current_user.location
    pickup_lat, pickup_lng = None, None
    if offer.listing_id:
        listing = db.query(ProduceListing).filter(ProduceListing.id == offer.listing_id).first()
        if listing:
            crop = listing.crop
            pickup_location = listing.location
            pickup_lat = listing.lat
            pickup_lng = listing.lng

    buyer = db.query(User).filter(User.id == offer.buyer_id).first()

    # Create order
    order = Order(
        offer_id=offer.id,
        farmer_id=offer.farmer_id,
        buyer_id=offer.buyer_id,
        crop=crop,
        quantity=offer.quantity,
        price_per_kg=offer.price_per_kg,
        total=offer.quantity * offer.price_per_kg,
        status="CREATED",
        pickup_location=pickup_location,
        delivery_location=buyer.location if buyer else None,
        pickup_lat=pickup_lat,
        pickup_lng=pickup_lng,
        expected_delivery=datetime.utcnow() + timedelta(days=7)
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Create payment
    payment = Payment(
        order_id=order.id,
        amount=order.total,
        status="PENDING",
        payment_method="DEMO",
        transaction_id=f"TXN-{uuid.uuid4().hex[:8].upper()}"
    )
    db.add(payment)

    # Notify buyer
    notification = Notification(
        user_id=offer.buyer_id,
        title="Offer Accepted",
        message=f"{current_user.full_name} accepted your offer for {crop}. Order #{order.id} has been created.",
        notification_type="ORDER",
        link=f"/buyer/orders"
    )
    db.add(notification)
    db.commit()

    return {"message": "Offer accepted", "order_id": order.id}


@router.post("/api/offers/{offer_id}/reject")
def reject_offer(offer_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer.farmer_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")

    offer.status = "REJECTED"
    db.commit()

    notification = Notification(
        user_id=offer.buyer_id,
        title="Offer Rejected",
        message=f"Your offer has been rejected by the farmer.",
        notification_type="OFFER",
        link=f"/buyer/offers"
    )
    db.add(notification)
    db.commit()

    return {"message": "Offer rejected"}


# ============ ORDER ENDPOINTS ============

@router.post("/api/orders", response_model=OrderResponse)
def create_order(data: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = Order(
        farmer_id=data.farmer_id,
        buyer_id=data.buyer_id or current_user.id,
        consumer_id=data.consumer_id,
        crop=data.crop,
        quantity=data.quantity,
        price_per_kg=data.price_per_kg,
        total=data.total,
        status="CREATED",
        pickup_location=data.pickup_location,
        delivery_location=data.delivery_location,
        pickup_lat=data.pickup_lat,
        pickup_lng=data.pickup_lng,
        delivery_lat=data.delivery_lat,
        delivery_lng=data.delivery_lng,
        expected_delivery=datetime.utcnow() + timedelta(days=5)
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Create payment
    payment = Payment(
        order_id=order.id,
        amount=order.total,
        status="PENDING",
        payment_method="DEMO",
        transaction_id=f"TXN-{uuid.uuid4().hex[:8].upper()}"
    )
    db.add(payment)
    db.commit()

    return _order_to_response(order, db)


@router.get("/api/orders", response_model=List[OrderResponse])
def list_orders(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if current_user.role == "FARMER":
        query = query.filter(Order.farmer_id == current_user.id)
    elif current_user.role == "BUYER":
        query = query.filter(Order.buyer_id == current_user.id)
    elif current_user.role == "CONSUMER":
        query = query.filter(Order.consumer_id == current_user.id)
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).all()
    return [_order_to_response(o, db) for o in orders]


@router.get("/api/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_to_response(order, db)


@router.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, data: OrderStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["CREATED", "CONFIRMED", "PICKUP_SCHEDULED", "COLLECTED", "IN_TRANSIT", "DELIVERED", "PAYMENT_RELEASED"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    order.status = data.status
    db.commit()

    # Auto-update payment status
    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    if payment:
        if data.status == "CONFIRMED":
            payment.status = "SECURED"
        elif data.status == "DELIVERED":
            payment.status = "RELEASED"
        db.commit()

    # Create notification for relevant users
    notify_user_id = order.buyer_id if current_user.id == order.farmer_id else order.farmer_id
    status_messages = {
        "CONFIRMED": "Order has been confirmed",
        "PICKUP_SCHEDULED": "Pickup has been scheduled",
        "COLLECTED": "Produce has been collected",
        "IN_TRANSIT": "Order is in transit",
        "DELIVERED": "Order has been delivered",
        "PAYMENT_RELEASED": "Payment has been released"
    }
    msg = status_messages.get(data.status, f"Order status updated to {data.status}")
    notification = Notification(
        user_id=notify_user_id,
        title=f"Order #{order.id} Update",
        message=msg,
        notification_type="ORDER"
    )
    db.add(notification)
    db.commit()

    return {"message": f"Order status updated to {data.status}", "payment_status": payment.status if payment else None}


def _offer_to_response(offer: Offer, db: Session) -> OfferResponse:
    buyer = db.query(User).filter(User.id == offer.buyer_id).first()
    farmer = db.query(User).filter(User.id == offer.farmer_id).first()
    crop = None
    if offer.listing_id:
        listing = db.query(ProduceListing).filter(ProduceListing.id == offer.listing_id).first()
        crop = listing.crop if listing else None
    return OfferResponse(
        id=offer.id, listing_id=offer.listing_id, requirement_id=offer.requirement_id,
        buyer_id=offer.buyer_id, farmer_id=offer.farmer_id,
        quantity=offer.quantity, price_per_kg=offer.price_per_kg,
        message=offer.message, status=offer.status,
        counter_price=offer.counter_price, counter_message=offer.counter_message,
        created_at=offer.created_at,
        buyer_name=buyer.full_name if buyer else None,
        farmer_name=farmer.full_name if farmer else None,
        crop=crop
    )


def _order_to_response(order: Order, db: Session) -> OrderResponse:
    farmer = db.query(User).filter(User.id == order.farmer_id).first()
    buyer = db.query(User).filter(User.id == order.buyer_id).first()
    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    return OrderResponse(
        id=order.id, offer_id=order.offer_id,
        farmer_id=order.farmer_id, buyer_id=order.buyer_id,
        consumer_id=order.consumer_id,
        crop=order.crop, quantity=order.quantity,
        price_per_kg=order.price_per_kg, total=order.total,
        status=order.status,
        pickup_location=order.pickup_location,
        delivery_location=order.delivery_location,
        expected_delivery=order.expected_delivery,
        created_at=order.created_at,
        farmer_name=farmer.full_name if farmer else None,
        buyer_name=buyer.full_name if buyer else None,
        payment_status=payment.status if payment else None
    )
