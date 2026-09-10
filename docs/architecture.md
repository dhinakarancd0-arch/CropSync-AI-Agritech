# AgriDirect: System Architecture & Technical Design
> **Smart India Hackathon Prototype — SIH Problem Statement 26033**  
> *"Multiple intermediaries reduce farmers' earnings and increase consumer prices."*

---

## 1. High-Level Architectural Overview

AgriDirect is built as a disintermediated agricultural supply-chain coordination layer connecting **Farmers & FPOs** directly with **Institutional Buyers & Consumers**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AGRIDIRECT CLIENT                             │
│       React 19 + TypeScript + Vite + Tailwind CSS + Recharts           │
├──────────────────────────────────┬─────────────────────────────────────┤
│      🌾 Farmer / FPO Portal      │     🏢 Institutional Buyer Portal   │
│   • Produce Lots & Harvesting    │   • Sourcing Demand Broadcasting    │
│   • Direct Proposal Negotiation  │   • Algorithmic Smart Matching      │
│   • 7-Stage Order Fulfillment    │   • Pooled Route Optimization (TSP) │
│   • 14-Day AI Crop Forecasts     │   • Escrow Verification & Intake    │
├──────────────────────────────────┼─────────────────────────────────────┤
│     🛒 Consumer Farm Shop        │     📊 Governance & Telemetry       │
│   • Direct Produce Baskets       │   • National Participant Registry   │
│   • Origin & Farmer Provenance   │   • Supply vs Demand Equilibrium    │
│   • Simulated Escrow Checkout    │   • KYC / GST / Aadhaar Oversight   │
└──────────────────────────────────┴─────────────────────────────────────┘
                                   │
                                   │ HTTPS / REST (JSON) + JWT Bearer
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│   API Endpoints   │   AI Forecasting  │    Smart Logistics Engine      │
│  • /api/auth      │  • Time-series    │   • Multi-stop TSP Routing     │
│  • /api/produce   │    moving avg     │   • Vehicle capacity limits    │
│  • /api/matches   │  • Seasonal trend │   • Haversine geo-distance     │
│  • /api/orders    │  • Market price   │   • Freight per kg pooling     │
│  • /api/logistics │    correlations   │   • Leaflet waypoint sequence  │
└───────────────────┴───────────────────┴────────────────────────────────┘
                                   │
                                   │ SQLAlchemy ORM
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATABASE STORAGE LAYER (SQLite / PostgreSQL)       │
│  • Users & Profiles (Farmer, FPO, Buyer, Consumer, Admin)              │
│  • Produce Listings & Buyer Requirements                               │
│  • Direct Negotiated Offers & Binding Fulfillment Orders               │
│  • Escrow Payment States & Transaction Audits                          │
│  • Market Price Feeds (Coimbatore, Pollachi, Erode, Tiruppur, etc.)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Layer Breakdown

### Frontend (`/frontend`)
- **React 19 + TypeScript**: Strongly-typed component architecture with strict schema adherence.
- **Tailwind CSS**: Agriculture-inspired green design system with light slate backgrounds, neutral gray surfaces, and subtle elevation shadows.
- **React Router v7**: Role-based access control (`FARMER`, `FPO`, `BUYER`, `CONSUMER`, `ADMIN`) protecting respective dashboards.
- **Interactive Mapping**: Leaflet & OpenStreetMap (`react-leaflet`) visualizing coordinates in the Western Tamil Nadu agricultural cluster (Coimbatore, Pollachi, Erode, Tiruppur, Mettupalayam).
- **Recharts**: Data visualization for historical mandi trends, 7-day predictive curves, and demand indexes.

### Backend (`/backend/app`)
- **FastAPI**: Asynchronous Python REST microframework with auto-generated OpenAPI / Swagger specs (`/docs`).
- **SQLAlchemy 2.0 ORM**: Data persistence with declarative models, explicit ForeignKeys, and query optimization.
- **Pydantic v2**: Request/response payload validation and serialized data contracts.
- **JWT & Passlib / bcrypt**: Secure authentication with salt generation and password hashing.

---

## 3. Algorithmic Matching Engine

The multi-criteria matching engine evaluates compatibility between buyer procurement requirements and active farmer harvest lots:

$$\text{Match Score} = w_1 \cdot S_{\text{crop}} + w_2 \cdot S_{\text{quantity}} + w_3 \cdot S_{\text{quality}} + w_4 \cdot S_{\text{distance}} + w_5 \cdot S_{\text{price}}$$

1. **Crop Match ($S_{\text{crop}}$)**: Exact commodity matching (100% or 0%).
2. **Quantity Match ($S_{\text{quantity}}$)**: Proportional compatibility up to requirement ceiling.
3. **Quality Alignment ($S_{\text{quality}}$)**: Grade compatibility matrix (Grade A, Grade B, Grade C, Organic).
4. **Geo-Distance ($S_{\text{distance}}$)**: Haversine distance decay function penalizing long hauls.
5. **Price Compatibility ($S_{\text{price}}$)**: Bonus for lots pricing under buyer's maximum ceiling rate.

---

## 4. Smart Logistics & Route Optimization

Smallholder farmers typically transport small loads (e.g., 300–800 kg) individually, incurring exorbitant freight costs (₹5–₹8 per kg).  
AgriDirect's **Logistics Engine** consolidates stops using a **Capacity-Aware Traveling Salesperson / Nearest Neighbor Heuristic**:

1. Calculates pairwise distance matrix between all pickup farms and destination hub.
2. Sequences visits to minimize total route kilometers while respecting vehicle payload capacity (e.g., 5,000 kg reefer truck).
3. Computes capacity utilization and divides total vehicle trip expense across pooled weight, slashing freight down to **₹1.09 / kg**.
