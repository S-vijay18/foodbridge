# FoodBridge – Smart Food Waste Donation & Management Platform

> **"Don't Waste Food. Share Hope."**  
> *Turning Surplus Food Into Someone's Hope.*

---

## 🌟 Executive Summary

**FoodBridge** is a modern, scalable, full-stack web application architected to eliminate commercial and domestic food waste by connecting food donors (hotels, restaurants, bakeries, supermarkets, caterers) with recipient charitable organizations (verified NGOs, orphanages, old-age homes, community kitchens) through coordinated volunteer courier delivery.

---

## 🚀 Key Platform Features

### 1. Multi-Role Architecture & Access Control
- **Food Donors (Hotels, Restaurants, Caterers):**
  - Create surplus food listings with food category, quantities, portion estimates, preparation timestamps, expiry deadlines, allergen disclosures, storage specifications, and pickup instructions.
  - Review incoming NGO requests with partial or full quantity reservations.
  - Approve or decline requests and view historical impact analytics.
- **NGOs / Charitable Recipients (Shelters, Orphanages):**
  - Explore the searchable, filterable **Food Donation Marketplace**.
  - Request food allocations based on exact beneficiary count.
  - Receive automated AI recommendations matching urgent nearby donations to shelter capacity.
  - Track in-transit volunteer couriers and confirm food delivery receipt with post-handover quality ratings.
- **Delivery Volunteers (Couriers & Drivers):**
  - Browse unassigned delivery assignments.
  - Claim missions with route maps from donor pickup to shelter drop-off.
  - Progress delivery status step-by-step (`ACCEPTED` ➔ `PICKUP_STARTED` ➔ `PICKED_UP` ➔ `IN_TRANSIT` ➔ `DELIVERED`).
  - Submit proof-of-delivery photos and recipient receiver signatures.
- **Administrators (Platform Oversight):**
  - Comprehensive KPI dashboard (users, kg diverted from landfill, meals served, carbon CO₂ emissions averted).
  - NGO organization verification management (Approve / Reject verification).
  - User suspension & account activation controls.
  - Audit logs tracking all administrative interventions.
  - Instant regulatory export of Donations, Users, and Deliveries in CSV format.

### 2. Live Dispatch & Route Tracking
- Interactive **OpenStreetMap / Leaflet** visualizer tracking pickup coordinates, shelter destination coordinates, and volunteer location.
- Live progress indicator tracking step-by-step transition from collection to dining hall delivery.
- Real-time event log with timestamps.

### 3. Food Safety & Legal Protections
- Strict temperature danger zone controls (Bacteria multiply fastest between **4°C and 60°C**).
- The **2-Hour Rule** enforced programmatically: perishable cooked food must be dispatched within the consumption deadline.
- Mandatory Food Safety & Hygiene declarations for donors.
- Direct reporting & complaint channel for safety investigations.
- Built-in alignment with national and state **Good Samaritan Food Donation Acts** protecting bona fide donors from civil liability.

### 4. AI-Powered Capabilities
- **Smart Food Matching:** Scores available donations based on proximity (km), shelf-life urgency (<12h remaining), and recipient meal capacity.
- **Portion & Environmental Estimator:** Dynamically converts food weight (kg/litres/packs) into estimated meal servings and calculates avoided greenhouse gas emissions (approx. 2.5 kg CO₂e saved per 1 kg food waste averted).
- **AI Food Assistant (BridgeBot):** Interactive floating chatbot providing instant answers on food safety policies, temperature charts, platform walkthroughs, and live donation status queries.
- **Smart Expiry Alerts:** Badges and prioritizes listings expiring within 12 hours.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Component-based modern SPA |
| **Styling & Icons** | Tailwind CSS v4 + Lucide React | Modern green-and-white theme (`#166534`, `#22C55E`, `#FACC15`) |
| **Animations** | Framer Motion + Canvas Confetti | Smooth modal transitions and celebratory delivery triggers |
| **Maps** | Leaflet + OpenStreetMap | Interactive GIS map with custom dynamic pins & route polyline |
| **Analytics Charts** | Recharts | Interactive area trends and category pie distribution charts |
| **Backend API** | Python 3.11+ / FastAPI | High-performance asynchronous REST API architecture |
| **Validation** | Pydantic v2 + Email-Validator | Strict type safety and data contract enforcement |
| **ORM & Database** | SQLAlchemy 2.0 + SQLite / PostgreSQL | Zero-config out-of-the-box SQLite; PostgreSQL ready |
| **Security & Auth** | JWT (python-jose) + Bcrypt | Cryptographically secure token auth with role enforcement |
| **Containerization** | Docker & Docker Compose | Multi-stage production container setup |

---

## 👥 Pre-Configured Demo Accounts (Ready for Immediate Testing)

You can sign in with any of the demo accounts below or use the **Quick Evaluation Switcher** banner at the top of the application to test any role with one click:

| Role | Email | Password | Organization / Notes |
|---|---|---|---|
| **Donor** | `hotel@grandplaza.com` | `Password123!` | Grand Plaza Hotel & Banquets (Has active listings & requests) |
| **Donor 2** | `donor@freshbake.com` | `Password123!` | FreshBake Artisan Bakery |
| **NGO / Recipient** | `contact@hopehaven.org` | `Password123!` | Hope Haven Orphanage & Shelter (Verified account) |
| **NGO 2** | `info@cityfoodrescue.org` | `Password123!` | City Community Kitchen |
| **Volunteer** | `alex@volunteer.org` | `Password123!` | Alex Rivera (Active Courier in Transit) |
| **Volunteer 2** | `priya@volunteer.org` | `Password123!` | Priya Sharma (Green Rider) |
| **Administrator** | `admin@foodbridge.org` | `Password123!` | Central Oversight Administrator |

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (3.11 or higher)

### 1. Clone & Setup Backend
```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database setup & automated seed data
python -c "from app.core.database import engine, Base, SessionLocal; from app.utils.seed_data import seed_database; Base.metadata.create_all(bind=engine); db = SessionLocal(); seed_database(db); db.close(); print('FoodBridge Seeded Successfully!')"

# Start the FastAPI backend server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and interactive Swagger documentation will be accessible at:
- **API URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

---

### 2. Setup & Run Frontend
```bash
# Open a new terminal in the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The application will launch at:
- **Frontend URL:** `http://localhost:5173`

---

## 🐳 Docker Deployment

To launch both the backend API and frontend with a single command:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

## 🧪 Running Automated Integration Tests

A comprehensive integration test suite verifies the end-to-end request-to-delivery lifecycle:
```bash
cd backend
python tests/test_foodbridge.py
```
**Test Coverage:**
- ✅ Health check & status endpoints
- ✅ Donor, NGO, and Admin authentication & JWT token generation
- ✅ Marketplace food listing and query filters
- ✅ AI portion estimation & carbon emission calculator
- ✅ Food safety validation (strict rejection of expired listings)
- ✅ Complete reservation workflow: NGO request creation ➔ Donor approval ➔ Inventory deduction ➔ Volunteer acceptance ➔ Handover progression ➔ Receipt confirmation
- ✅ Admin CSV report exports (`donations`, `users`, `deliveries`)

---

## 🛡️ Trust & Sustainability Alignment

- **United Nations SDG 2 (Zero Hunger):** Channelling unserved, clean culinary surpluses directly to vulnerable children and seniors.
- **United Nations SDG 12 (Responsible Consumption & Production):** Halving per capita commercial food waste and preventing methane generation from organic landfill dumping.
- **Safe Logistics:** Temperature-monitored distribution windows ensuring dignified nutrition.

