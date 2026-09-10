# AgriDirect: REST API Documentation

Base URL: `http://127.0.0.1:8000`  
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`  
ReDoc: `http://127.0.0.1:8000/redoc`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Register a new market participant with role-specific attributes.
- **Request Body**:
  ```json
  {
    "full_name": "Rajesh Kumar",
    "email": "rajesh@farm.in",
    "password": "SecurePassword123!",
    "role": "FARMER",
    "location": "Coimbatore, Tamil Nadu",
    "farm_name": "Kumar Organic Farm",
    "farm_size_acres": 12.5
  }
  ```
- **Response**: `201 Created` with JWT access token and user profile object.

### `POST /api/auth/login`
Authenticate user and obtain JSON Web Token.
- **Request Body**:
  ```json
  {
    "email": "farmer@agridirect.demo",
    "password": "AgriDirect2024!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "full_name": "Rajesh Kumar",
      "role": "FARMER",
      "is_verified": true
    }
  }
  ```

---

## 2. Produce Inventory Endpoints

### `GET /api/produce/`
List active produce lots with optional query filtering (`crop`, `location`, `quality_grade`, `max_price`).
- **Response**: `200 OK` (Array of `ProduceListing`)

### `POST /api/produce/`
Publish a new harvest lot (Requires `FARMER` or `FPO` role).
- **Request Body**:
  ```json
  {
    "crop": "Tomato",
    "quantity": 500,
    "unit": "kg",
    "quality_grade": "Grade A",
    "min_price": 28.0,
    "location": "Coimbatore",
    "expected_harvest": "2026-09-20T00:00:00Z"
  }
  ```

---

## 3. Buyer Requirements & Intelligent Matching

### `POST /api/requirements/`
Broadcast an institutional procurement demand.
- **Request Body**:
  ```json
  {
    "crop": "Tomato",
    "quantity": 2000,
    "quality": "Grade A",
    "max_price": 30.0,
    "location": "Coimbatore",
    "delivery_deadline": "2026-09-22T00:00:00Z"
  }
  ```

### `GET /api/matches/{requirement_id}`
Execute multi-criteria algorithmic matching against all active farmer harvest lots.
- **Response**: `200 OK`
  ```json
  {
    "requirement_id": 1,
    "crop": "Tomato",
    "matches": [
      {
        "listing_id": 3,
        "farmer_name": "Rajesh Kumar",
        "match_score": 0.94,
        "score_breakdown": {
          "crop_match": 100,
          "quantity_fit": 90,
          "quality_grade": 100,
          "distance_km": 95,
          "price_compatibility": 92
        },
        "distance_km": 18.4,
        "match_explanation": "Optimal match: Located only 18.4 km away in Coimbatore, offers Grade A matching specs, price is 6.7% below ceiling."
      }
    ]
  }
  ```

---

## 4. Smart Logistics & Route Optimization

### `POST /api/logistics/optimize-route`
Solve vehicle routing problem (TSP heuristic) across multiple pickup farms and destination depot.
- **Request Body**:
  ```json
  {
    "vehicle_capacity": 6000,
    "destination": {
      "farmer_id": 0,
      "name": "Coimbatore Wholesale Hub",
      "lat": 11.0168,
      "lng": 76.9558,
      "quantity": 0
    },
    "farmers": [
      { "farmer_id": 1, "name": "Pollachi Collective", "lat": 10.6609, "lng": 77.0083, "quantity": 1800 },
      { "farmer_id": 2, "name": "Erode Co-op", "lat": 11.3410, "lng": 77.7172, "quantity": 2200 },
      { "farmer_id": 3, "name": "Tiruppur FPO", "lat": 11.1085, "lng": 77.3411, "quantity": 950 }
    ]
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "total_distance_km": 142.8,
    "estimated_time_minutes": 210.5,
    "capacity_used_kg": 4950,
    "capacity_total_kg": 6000,
    "utilization_percent": 82.5,
    "estimated_cost": 4280.0,
    "sequence": [
      { "stop_number": 1, "name": "Pollachi Collective", "type": "PICKUP", "quantity_kg": 1800 },
      { "stop_number": 2, "name": "Tiruppur FPO", "type": "PICKUP", "quantity_kg": 950 },
      { "stop_number": 3, "name": "Erode Co-op", "type": "PICKUP", "quantity_kg": 2200 },
      { "stop_number": 4, "name": "Coimbatore Wholesale Hub", "type": "DESTINATION", "quantity_kg": 0 }
    ]
  }
  ```

---

## 5. Orders & Lifecycle Progression

### `PUT /api/orders/{id}/status`
Advance an order through its 7-stage operational lifecycle:
`CREATED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `COLLECTED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED` $\rightarrow$ `PAYMENT_RELEASED`.
- **Request Body**:
  ```json
  { "status": "IN_TRANSIT" }
  ```
