# AgriDirect: Database Schema Documentation

AgriDirect utilizes an enterprise relational schema managed via SQLAlchemy ORM with PostgreSQL / SQLite compatibility.

---

## Entity Relationship Summary

```
[users] ──(1:1)─── [farmer_profiles]
   │    ──(1:1)─── [fpo_profiles]
   │    ──(1:1)─── [buyer_profiles]
   │    ──(1:1)─── [consumer_profiles]
   │    ──(1:N)─── [notifications]
   │
   ├──(1:N)─── [produce_listings] ─────────────┐
   │                                           ├──(Matching & Offers)
   ├──(1:N)─── [buyer_requirements] ───────────┘
   │
   ├──(1:N)─── [offers] ──(Accepted)──> [orders] ──(1:1)──> [payments]
```

---

## Table Specifications

### 1. `users`
Core user identity and authentication credentials.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Unique user identifier |
| `full_name` | String(255) | Not Null | Legal or registered name |
| `email` | String(255) | Unique, Indexed | Email address for login |
| `phone` | String(20) | Nullable | Contact mobile number |
| `password_hash`| String(255) | Not Null | Bcrypt hashed secret |
| `role` | String(20) | Not Null | `FARMER`, `FPO`, `BUYER`, `CONSUMER`, `ADMIN` |
| `location` | String(255) | Nullable | Primary district or mandi zone |
| `is_verified` | Boolean | Default False | Aadhaar, GST, or FSSAI verification |
| `is_active` | Boolean | Default True | Account state toggle |
| `created_at` | DateTime | UTC Timestamp | Creation datetime |

---

### 2. `farmer_profiles`
Farmer-specific agricultural attributes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Profile ID |
| `user_id` | Integer | FK(`users.id`), Unique | Link to parent user |
| `farm_name` | String(255) | Nullable | Farm or orchard entity name |
| `farm_location`| String(255) | Nullable | Village / Panchayat location |
| `primary_crops`| Text | Nullable | JSON string of cultivated commodities |
| `farm_size_acres`| Float | Nullable | Total landholding size in acres |
| `lat`, `lng` | Float | Nullable | Geographic pin for route optimization |
| `trust_score` | Float | Default 4.0 | Producer rating score out of 5 |
| `completed_orders`| Integer| Default 0 | Historical fulfillment tally |

---

### 3. `produce_listings`
Harvest inventory published by farmers & FPOs.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Lot listing ID |
| `farmer_id` | Integer | FK(`users.id`), Indexed | Listing producer user ID |
| `crop` | String(100) | Not Null, Indexed | Commodity (e.g. Tomato, Onion, Banana) |
| `quantity` | Float | Not Null | Available quantity |
| `unit` | String(20) | Default 'kg' | Unit of measure ('kg', 'quintal', 'tonnes') |
| `quality_grade`| String(20) | Default 'Grade A' | Quality certification tier |
| `min_price` | Float | Not Null | Floor price in ₹ / kg |
| `expected_harvest`| DateTime| Nullable | Readiness date |
| `location` | String(255) | Nullable | Farm location (e.g. Pollachi, Coimbatore) |
| `status` | String(20) | Default 'ACTIVE' | `ACTIVE`, `SOLD`, `EXPIRED` |

---

### 4. `buyer_requirements`
Institutional procurement demands broadcasted by bulk buyers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Requirement ID |
| `buyer_id` | Integer | FK(`users.id`), Indexed | Purchasing entity user ID |
| `crop` | String(100) | Not Null, Indexed | Target commodity |
| `quantity` | Float | Not Null | Sourcing demand volume in kg |
| `quality` | String(20) | Default 'Grade A' | Desired quality specification |
| `max_price` | Float | Not Null | Price ceiling in ₹ / kg |
| `delivery_deadline`| DateTime | Nullable | Required arrival date |
| `location` | String(255) | Nullable | Destination depot address |
| `status` | String(20) | Default 'OPEN' | `OPEN`, `FULFILLED`, `CANCELLED` |

---

### 5. `offers`
Direct contract negotiation proposals between buyers and farmers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Offer ID |
| `listing_id` | Integer | Nullable | Associated produce lot |
| `requirement_id`| Integer | Nullable | Associated buyer demand |
| `buyer_id` | Integer | Not Null | Proposing buyer ID |
| `farmer_id` | Integer | Not Null | Targeted farmer ID |
| `quantity` | Float | Not Null | Proposed contract volume (kg) |
| `price_per_kg` | Float | Not Null | Proposed rate (₹ / kg) |
| `message` | Text | Nullable | Terms & notes |
| `status` | String(20) | Default 'PENDING' | `PENDING`, `ACCEPTED`, `REJECTED`, `COUNTERED` |

---

### 6. `orders` & `payments`
Binding purchase agreements and digital escrow state tracking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | Primary Key | Unique order identifier |
| `farmer_id` | Integer | Not Null | Producer user ID |
| `buyer_id` | Integer | Not Null | Buyer user ID |
| `crop` | String(100) | Not Null | Commodity title |
| `quantity` | Float | Not Null | Final agreed volume |
| `price_per_kg` | Float | Not Null | Final agreed unit rate |
| `total` | Float | Not Null | Total settlement amount (₹) |
| `status` | String(30) | Default 'CREATED' | `CREATED`, `CONFIRMED`, `PICKUP_SCHEDULED`, `COLLECTED`, `IN_TRANSIT`, `DELIVERED`, `PAYMENT_RELEASED` |
| `payment_status`| String(30) | Default 'SECURED'| `PENDING`, `SECURED`, `RELEASED` |
