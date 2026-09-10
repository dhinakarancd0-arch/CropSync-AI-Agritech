"""
AgriDirect Demo Data Seeder

Creates realistic fictional demo data for SIH demonstration.
All names and data are fictional.
"""
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models.user import User, FarmerProfile, FPOProfile, BuyerProfile, ConsumerProfile
from app.models.produce import ProduceListing
from app.models.buyer import BuyerRequirement
from app.models.order import Offer, Order, Payment
from app.models.market import MarketPrice, DemandForecast
from app.models.notification import Notification
from app.auth.jwt_handler import hash_password
from app.config import settings


# Demo coordinates around Coimbatore region
LOCATIONS = {
    "Coimbatore": (11.0168, 76.9558),
    "Pollachi": (10.6609, 77.0083),
    "Erode": (11.3410, 77.7172),
    "Tiruppur": (11.1085, 77.3411),
    "Mettupalayam": (11.2990, 76.9366),
    "Udumalpet": (10.5826, 77.2490),
    "Palladam": (10.9923, 77.2863),
    "Sulur": (11.0370, 77.1270),
    "Annur": (11.2330, 77.1050),
    "Kinathukadavu": (10.8020, 77.0050),
}

CROPS = [
    {"name": "Tomato", "base_price": 28, "unit": "kg"},
    {"name": "Onion", "base_price": 31, "unit": "kg"},
    {"name": "Potato", "base_price": 22, "unit": "kg"},
    {"name": "Banana", "base_price": 35, "unit": "kg"},
    {"name": "Coconut", "base_price": 25, "unit": "piece"},
    {"name": "Carrot", "base_price": 38, "unit": "kg"},
    {"name": "Cabbage", "base_price": 20, "unit": "kg"},
]

FARMER_NAMES = [
    "Rajesh Kumar", "Suresh Patel", "Anitha Devi", "Murugan Selvan",
    "Lakshmi Narayanan", "Karthik Rajan", "Priya Sundaram", "Venkatesh Babu",
    "Meena Kumari", "Senthil Kumar", "Ganesh Moorthy", "Kavitha Raman"
]

BUYER_NAMES = [
    "Fresh Mart Wholesale", "Green Valley Foods", "Sri Lakshmi Trading",
    "Coimbatore Vegetables Co.", "Tamil Nadu Agri Traders", "KVR Fresh Produce"
]

CONSUMER_NAMES = [
    "Arun Shankar", "Divya Raghavan", "Mahesh Iyer"
]


def seed_database(db: Session):
    """Seed the database with demo data."""
    # Check if already seeded
    if db.query(User).filter(User.email == "farmer@agridirect.demo").first():
        print("Database already seeded.")
        return

    print("Seeding database with demo data...")

    # ============ DEMO ACCOUNTS ============
    demo_password = hash_password(settings.DEMO_PASSWORD)

    # Demo Farmer
    farmer_demo = User(
        full_name="Rajesh Kumar", email="farmer@agridirect.demo",
        phone="+91-9876543210", password_hash=demo_password,
        role="FARMER", location="Coimbatore", is_verified=True
    )
    db.add(farmer_demo)
    db.flush()

    farmer_demo_profile = FarmerProfile(
        user_id=farmer_demo.id, farm_name="Kumar Organic Farm",
        farm_location="Coimbatore", primary_crops="Tomato, Onion, Potato",
        farm_size_acres=12.5, lat=11.0168, lng=76.9558,
        trust_score=4.5, completed_orders=28, response_rate=97.0
    )
    db.add(farmer_demo_profile)

    # Demo Buyer
    buyer_demo = User(
        full_name="Fresh Mart Wholesale", email="buyer@agridirect.demo",
        phone="+91-9876543211", password_hash=demo_password,
        role="BUYER", location="Coimbatore", is_verified=True
    )
    db.add(buyer_demo)
    db.flush()

    buyer_demo_profile = BuyerProfile(
        user_id=buyer_demo.id, business_name="Fresh Mart Wholesale",
        business_type="Wholesale", location="Coimbatore",
        lat=11.0048, lng=76.9610, trust_score=4.3, completed_orders=45
    )
    db.add(buyer_demo_profile)

    # Demo Consumer
    consumer_demo = User(
        full_name="Arun Shankar", email="consumer@agridirect.demo",
        phone="+91-9876543212", password_hash=demo_password,
        role="CONSUMER", location="Coimbatore", is_verified=True
    )
    db.add(consumer_demo)
    db.flush()

    consumer_demo_profile = ConsumerProfile(
        user_id=consumer_demo.id,
        address="42, Gandhipuram, Coimbatore - 641012",
        phone="+91-9876543212"
    )
    db.add(consumer_demo_profile)

    # Demo Admin
    admin_demo = User(
        full_name="Admin User", email="admin@agridirect.demo",
        phone="+91-9876543213", password_hash=demo_password,
        role="ADMIN", location="Coimbatore", is_verified=True
    )
    db.add(admin_demo)

    # ============ ADDITIONAL FARMERS ============
    farmer_ids = [farmer_demo.id]
    locations_list = list(LOCATIONS.items())

    for i, name in enumerate(FARMER_NAMES[1:], start=1):
        loc_name, (lat, lng) = locations_list[i % len(locations_list)]
        # Add small random offset to coordinates
        lat += random.uniform(-0.05, 0.05)
        lng += random.uniform(-0.05, 0.05)

        farmer = User(
            full_name=name,
            email=f"farmer{i}@agridirect.demo",
            phone=f"+91-98765{43210 + i}",
            password_hash=demo_password,
            role="FARMER",
            location=loc_name,
            is_verified=random.choice([True, True, True, False])
        )
        db.add(farmer)
        db.flush()
        farmer_ids.append(farmer.id)

        crops = random.sample([c["name"] for c in CROPS], k=random.randint(2, 4))
        profile = FarmerProfile(
            user_id=farmer.id,
            farm_name=f"{name.split()[0]}'s Farm",
            farm_location=loc_name,
            primary_crops=", ".join(crops),
            farm_size_acres=round(random.uniform(3, 25), 1),
            lat=lat, lng=lng,
            trust_score=round(random.uniform(3.5, 4.9), 1),
            completed_orders=random.randint(5, 50),
            response_rate=round(random.uniform(85, 99), 1)
        )
        db.add(profile)

    # ============ ADDITIONAL BUYERS ============
    buyer_ids = [buyer_demo.id]
    for i, name in enumerate(BUYER_NAMES[1:], start=1):
        loc_name, (lat, lng) = locations_list[i % len(locations_list)]
        buyer = User(
            full_name=name,
            email=f"buyer{i}@agridirect.demo",
            phone=f"+91-98765{53210 + i}",
            password_hash=demo_password,
            role="BUYER",
            location=loc_name,
            is_verified=True
        )
        db.add(buyer)
        db.flush()
        buyer_ids.append(buyer.id)

        bp = BuyerProfile(
            user_id=buyer.id,
            business_name=name,
            business_type=random.choice(["Wholesale", "Retail Chain", "Processor", "Exporter"]),
            location=loc_name,
            lat=lat + random.uniform(-0.02, 0.02),
            lng=lng + random.uniform(-0.02, 0.02),
            trust_score=round(random.uniform(3.8, 4.8), 1),
            completed_orders=random.randint(10, 60)
        )
        db.add(bp)

    # ============ CONSUMERS ============
    for i, name in enumerate(CONSUMER_NAMES[1:], start=1):
        consumer = User(
            full_name=name,
            email=f"consumer{i}@agridirect.demo",
            phone=f"+91-98765{63210 + i}",
            password_hash=demo_password,
            role="CONSUMER",
            location="Coimbatore",
            is_verified=True
        )
        db.add(consumer)
        db.flush()
        cp = ConsumerProfile(
            user_id=consumer.id,
            address=f"{random.randint(1, 200)}, RS Puram, Coimbatore",
            phone=consumer.phone
        )
        db.add(cp)

    db.commit()

    # ============ PRODUCE LISTINGS ============
    listing_ids = []
    for farmer_id in farmer_ids:
        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == farmer_id).first()
        num_listings = random.randint(1, 4)
        for _ in range(num_listings):
            crop = random.choice(CROPS)
            harvest_date = datetime.utcnow() + timedelta(days=random.randint(3, 30))
            listing = ProduceListing(
                farmer_id=farmer_id,
                crop=crop["name"],
                quantity=random.choice([200, 300, 500, 750, 1000, 1500, 2000]),
                unit=crop["unit"],
                quality_grade=random.choice(["Grade A", "Grade A", "Grade A", "Grade B"]),
                expected_harvest=harvest_date,
                location=profile.farm_location if profile else "Coimbatore",
                min_price=round(crop["base_price"] + random.uniform(-5, 8), 1),
                lat=profile.lat if profile else 11.0168,
                lng=profile.lng if profile else 76.9558,
                status="ACTIVE"
            )
            db.add(listing)
            db.flush()
            listing_ids.append(listing.id)

    # ============ BUYER REQUIREMENTS ============
    requirement_ids = []
    for buyer_id in buyer_ids:
        num_reqs = random.randint(1, 3)
        for _ in range(num_reqs):
            crop = random.choice(CROPS)
            bp = db.query(BuyerProfile).filter(BuyerProfile.user_id == buyer_id).first()
            req = BuyerRequirement(
                buyer_id=buyer_id,
                crop=crop["name"],
                quantity=random.choice([500, 1000, 1500, 2000, 3000, 5000]),
                quality="Grade A",
                max_price=round(crop["base_price"] + random.uniform(0, 10), 1),
                location=bp.location if bp else "Coimbatore",
                delivery_deadline=datetime.utcnow() + timedelta(days=random.randint(7, 30)),
                lat=bp.lat if bp else 11.0048,
                lng=bp.lng if bp else 76.9610,
                status="ACTIVE"
            )
            db.add(req)
            db.flush()
            requirement_ids.append(req.id)

    # ============ SAMPLE OFFERS & ORDERS ============
    # Create a few completed offers/orders for demo
    for i in range(5):
        if listing_ids and buyer_ids and farmer_ids:
            lid = random.choice(listing_ids)
            listing = db.query(ProduceListing).filter(ProduceListing.id == lid).first()
            if listing:
                offer = Offer(
                    listing_id=lid,
                    buyer_id=random.choice(buyer_ids),
                    farmer_id=listing.farmer_id,
                    quantity=min(listing.quantity, random.choice([200, 300, 500])),
                    price_per_kg=round(listing.min_price + random.uniform(-2, 5), 1),
                    message="Interested in your produce. Quality and proximity look good.",
                    status=random.choice(["ACCEPTED", "PENDING", "ACCEPTED"])
                )
                db.add(offer)
                db.flush()

                if offer.status == "ACCEPTED":
                    order = Order(
                        offer_id=offer.id,
                        farmer_id=offer.farmer_id,
                        buyer_id=offer.buyer_id,
                        crop=listing.crop,
                        quantity=offer.quantity,
                        price_per_kg=offer.price_per_kg,
                        total=offer.quantity * offer.price_per_kg,
                        status=random.choice(["CREATED", "CONFIRMED", "DELIVERED"]),
                        pickup_location=listing.location,
                        delivery_location="Coimbatore",
                        pickup_lat=listing.lat,
                        pickup_lng=listing.lng,
                        delivery_lat=11.0048,
                        delivery_lng=76.9610,
                        expected_delivery=datetime.utcnow() + timedelta(days=random.randint(3, 14))
                    )
                    db.add(order)
                    db.flush()

                    payment_status = "RELEASED" if order.status == "DELIVERED" else "SECURED" if order.status == "CONFIRMED" else "PENDING"
                    payment = Payment(
                        order_id=order.id,
                        amount=order.total,
                        status=payment_status,
                        payment_method="DEMO",
                        transaction_id=f"TXN-DEMO{i:04d}"
                    )
                    db.add(payment)

    # ============ MARKET PRICES (30 days history) ============
    for crop_info in CROPS:
        for loc_name in ["Coimbatore", "Pollachi", "Erode", "Tiruppur", "Mettupalayam"]:
            for day_offset in range(30):
                date = datetime.utcnow() - timedelta(days=30 - day_offset)
                base_price = crop_info["base_price"]
                # Add realistic variation
                seasonal = 1.0 + 0.1 * (day_offset / 30)
                noise = random.uniform(-3, 3)
                price = round(base_price * seasonal + noise, 1)
                volume = round(random.uniform(400, 2000), 1)

                trend = "STABLE"
                if day_offset > 20:
                    trend = random.choice(["INCREASING", "STABLE", "INCREASING"])
                elif day_offset < 10:
                    trend = random.choice(["DECREASING", "STABLE"])

                mp = MarketPrice(
                    crop=crop_info["name"],
                    location=loc_name,
                    price=max(5, price),
                    demand_level=random.choice(["HIGH", "MEDIUM", "MEDIUM", "LOW"]),
                    trend=trend,
                    volume_kg=volume,
                    date=date
                )
                db.add(mp)

    # ============ SAMPLE NOTIFICATIONS ============
    notifications_data = [
        (farmer_demo.id, "Welcome to AgriDirect!", "Your account has been verified. Start listing your produce to connect with buyers.", "INFO"),
        (farmer_demo.id, "New Buyer Match", "A buyer in Coimbatore is looking for 2000 kg of Grade A Tomatoes.", "MATCH"),
        (buyer_demo.id, "Welcome to AgriDirect!", "Your buyer account is active. Post your requirements to find matching farmers.", "INFO"),
        (consumer_demo.id, "Welcome!", "Browse fresh produce directly from verified farmers.", "INFO"),
    ]
    for uid, title, msg, ntype in notifications_data:
        n = Notification(user_id=uid, title=title, message=msg, notification_type=ntype)
        db.add(n)

    db.commit()
    print(f"Database seeded successfully!")
    print(f"  - {len(farmer_ids)} farmers")
    print(f"  - {len(buyer_ids)} buyers")
    print(f"  - {len(listing_ids)} produce listings")
    print(f"  - {len(requirement_ids)} buyer requirements")
    print(f"  - Market prices: {len(CROPS) * 5 * 30} records")
    print(f"\nDemo accounts (password: {settings.DEMO_PASSWORD}):")
    print(f"  farmer@agridirect.demo")
    print(f"  buyer@agridirect.demo")
    print(f"  consumer@agridirect.demo")
    print(f"  admin@agridirect.demo")
