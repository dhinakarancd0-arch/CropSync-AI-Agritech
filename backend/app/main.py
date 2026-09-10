from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import init_db, SessionLocal
from app.database.seed import seed_database
from app.api.auth_routes import router as auth_router
from app.api.produce_routes import router as produce_router
from app.api.buyer_routes import router as buyer_router
from app.api.matching_routes import router as matching_router
from app.api.order_routes import router as order_router
from app.api.market_routes import router as market_router
from app.api.forecast_routes import router as forecast_router
from app.api.logistics_routes import router as logistics_router
from app.api.notification_routes import router as notification_router
from app.api.admin_routes import router as admin_router

app = FastAPI(
    title="AgriDirect API",
    description="Agricultural marketplace API - From Farm to Market, With Fair Value",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(produce_router)
app.include_router(buyer_router)
app.include_router(matching_router)
app.include_router(order_router)
app.include_router(market_router)
app.include_router(forecast_router)
app.include_router(logistics_router)
app.include_router(notification_router)
app.include_router(admin_router)


@app.on_event("startup")
def startup():
    init_db()
    # Seed demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "name": "AgriDirect API",
        "version": settings.APP_VERSION,
        "description": "From Farm to Market, With Fair Value",
        "docs": "/docs"
    }


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "healthy"}
