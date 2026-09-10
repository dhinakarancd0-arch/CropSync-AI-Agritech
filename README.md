# AgriDirect (Smart India Hackathon Prototype)
> **Tagline**: *"From Farm to Market, With Fair Value."*  
> **SIH Problem Statement 26033**: *"Multiple intermediaries reduce farmers' earnings and increase consumer prices."*

---

## 1. Project Overview

AgriDirect is a working digital agricultural marketplace and supply-chain coordination layer engineered to eliminate avoidable intermediary tiers between Indian farmers and end purchasers. 

Traditional agricultural supply chains contain 5 to 7 layers (Village Aggregator $\rightarrow$ Commission Agent / Arhatiya $\rightarrow$ Primary Mandi $\rightarrow$ Secondary Wholesaler $\rightarrow$ Retailer), eroding up to 70% of consumer spend while subjecting smallholders to arbitrary spot pricing and transit spoilage.

AgriDirect solves this challenge using:
- **Direct Digital Marketplace**: Transparent floor prices and certified quality grading (Grade A, Grade B, Grade C, Organic).
- **Intelligent Farmer-Buyer Matching**: Dynamic multi-criteria compatibility scoring (Distance, Quality, Price Spread, Reliability).
- **AI Demand Forecasting**: Neural predictive demand and price trajectory models with advisory risk indicators.
- **Smart Pooled Logistics**: Multi-stop pickup route optimization (TSP heuristic) cutting per-kg freight costs by up to 64%.
- **Digital Escrow & Transparent Payments**: Payouts transition from `SECURED` to `RELEASED` upon confirmed delivery.

**Regional Deployment Focus**: Western Tamil Nadu Agricultural Belt (**Coimbatore, Pollachi, Erode, Tiruppur, and Mettupalayam**) across high-value horticultural commodities (**Tomato, Onion, Potato, Banana, Coconut, Carrot, Cabbage**).

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Recharts, Leaflet / React-Leaflet OpenStreetMap, Lucide Icons, React Hot Toast.
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2, Passlib / Bcrypt, Python-JOSE (JWT).
- **Database**: SQLite (default local prototype) / PostgreSQL ready.
- **AI & Optimization**: Python heuristic TSP routing, moving average & regression forecasting with optional Gemini API integration hook.

---

## 3. Demo Credentials

All accounts use the secure demo password: **`AgriDirect2024!`**

| Role | Email Address | Description / Permissions |
|---|---|---|
| **Farmer / FPO** | `farmer@agridirect.demo` | Harvest lots, incoming offers, 7-stage fulfillment, AI harvest insights |
| **Bulk Buyer** | `buyer@agridirect.demo` | Sourcing demands, algorithmic smart matching, route optimizer |
| **Consumer** | `consumer@agridirect.demo` | Farm-direct grocery shop, cart, simulated checkout, order tracking |
| **Admin** | `admin@agridirect.demo` | National market liquidity telemetry, supply-demand balance, KYC review |

---

## 4. Complete SIH 20-Step Demonstration Script

The application is built to execute the entire hackathon evaluation flow seamlessly:

1. **Step 1**: Open [http://127.0.0.1:5173/login](http://127.0.0.1:5173/login) and click **"Farmer / FPO"** or enter `farmer@agridirect.demo` / `AgriDirect2024!`.
2. **Step 2**: The **Farmer Dashboard** loads displaying active lots, direct earnings, and incoming buyer proposals.
3. **Step 3**: Click **"List Harvest"** (`/farmer/list-produce`). List **Tomato**, `500 kg`, `Grade A`, Coimbatore, ₹28/kg. Submit form.
4. **Step 4**: Open **AI Insights** (`/farmer/insights`). Review 14-day demand forecast and harvest timing recommendation.
5. **Step 5**: Sign out and sign in as **Bulk Buyer** (`buyer@agridirect.demo`).
6. **Step 6**: Click **"Post Requirement"** (`/buyer/post-requirement`). Broadcast demand: Tomato, `2000 kg`, `Grade A`, Maximum ₹30/kg, Coimbatore.
7. **Step 7**: Click **"Smart Matches"** (`/buyer/matches`). The engine calculates multi-criteria compatibility scores (e.g., 94% match) with distance and grade breakdowns.
8. **Step 8**: Click **"Dispatch Contract"** to send a formal purchase proposal to the farmer.
9. **Step 9**: Sign back in as **Farmer** (`farmer@agridirect.demo`). Notice the pending offer badge.
10. **Step 10**: Accept the offer under **Offers** (`/farmer/offers`).
11. **Step 11**: An active binding order is automatically created under **Orders** (`/farmer/orders`).
12. **Step 12**: Sign in as **Buyer** and navigate to **Smart Logistics** (`/buyer/logistics`).
13. **Step 13**: View the interactive **Leaflet OpenStreetMap** showing collection hubs across Coimbatore, Pollachi, Erode, Tiruppur, and Mettupalayam.
14. **Step 14**: Click **"Run Route Optimization"**. The TSP engine calculates waypoint sequence, total distance (142 km), transit duration, and per-kg freight cost (₹1.09/kg vs ₹5.50/kg unpooled).
15. **Step 15**: Step through order fulfillment: `CONFIRMED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `COLLECTED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED`.
16. **Step 16**: Verify that the escrow payment status automatically transitions to **`PAYMENT_RELEASED`**.
17. **Step 17**: Sign in as **Consumer** (`consumer@agridirect.demo`).
18. **Step 18**: Browse fresh produce from local growers on the consumer shop (`/consumer`).
19. **Step 19**: Add produce to basket (`/consumer/cart`), enter delivery address, and click **"Place Direct Order"** using Demo Payment.
20. **Step 20**: Track confirmed delivery and provenance cards under **My Orders** (`/consumer/orders`).

---

## 5. Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*The database automatically initializes and seeds 12 farmers, 6 buyers, 28 produce listings, and 1,050 APMC market records on first startup.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in your browser.

---

## 6. Documentation Directory
- [System Architecture](file:///docs/architecture.md)
- [Database Schema](file:///docs/database.md)
- [REST API Specifications](file:///docs/api.md)
