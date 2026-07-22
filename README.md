# Pravasi Tours & Travels — ERP System

A full-stack ERP platform for managing a tours & travels business — vehicle fleet, driver records, bookings, quotations, and B2B billing — with an automated distance-based pricing engine.

## 🔗 Live Demo

**Dashboard:** [https://pravasi-tours-travels-1xdh.vercel.app/dashboard](https://pravasi-tours-travels-1xdh.vercel.app/dashboard)

**Login Credentials**
| Field | Value |
|---|---|
| Username | `admin` |
| Password | pravasi@123 |



## 🧱 Tech Stack

**Backend**
- Python 3 + FastAPI
- MongoDB (Motor async driver)
- Pydantic (schema validation)
- JWT-based authentication
- SlowAPI (rate limiting)

**Frontend**
- React + TypeScript (Vite)
- Deployed on Vercel

**Integrations**
- Google Maps Distance Matrix API (route distance/duration)
- Cloudinary (vehicle image hosting & optimization)

## ⚙️ Core Features

- **Automated Quotation Engine** — 3-tier distance resolution: MongoDB cache → Google Maps API → hardcoded fallback route table (100+ common Indian routes), so quotes never fail even if the external API is down
- **Booking Lifecycle** — quotation → confirmation → status tracking
- **Vehicle & Pricing Management** — local (8hr/80km) and outstation pricing tiers per vehicle
- **Driver Management** — driver records linked to bookings
- **B2B Billing** — separate invoicing/quotation flow for corporate clients
- **Admin Dashboard** — Dashboard, Bookings, Billing & Quotation, B2B Billing, Drivers, Vehicles, Settings
- **Production Hardening** — global exception handler ensuring CORS headers on 500s, explicit origin allowlisting, API key protection, rate-limited endpoints

## 📁 Project Structure

```
ERP-SYSTEM/
├── ERP-BACKEND/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── b2b.py
│   │   ├── billing.py
│   │   ├── bookings.py
│   │   ├── drivers.py
│   │   └── vehicles.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── migrate.py
│   ├── migrate_b2b.py
│   └── requirements.txt
└── ERP-FRONTEND/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── Bookings.tsx
        │   ├── Billing.tsx
        │   ├── B2BBilling.tsx
        │   ├── Drivers.tsx
        │   ├── Vehicles.tsx
        │   ├── Login.tsx
        │   └── Settings.tsx
        ├── utils/
        ├── App.tsx
        └── main.tsx
```

## 🚀 Getting Started

### Backend
```bash
cd ERP-SYSTEM/ERP-BACKEND
pip install -r requirements.txt
uvicorn main:app --reload
```

Required environment variables:
```
MONGO_URL=
DB_NAME=
API_KEY=
GOOGLE_API_KEY=   # optional — falls back to hardcoded routes if unset
CORS_ORIGINS=
```

### Frontend
```bash
cd ERP-SYSTEM/ERP-FRONTEND
npm install
npm run dev
```

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/{id}` | Get vehicle details |
| POST | `/api/getQuotation` | Generate a price quotation |
| GET | `/api/quotations/{id}` | Fetch a quotation by ID |
| POST | `/api/bookings` | Confirm a booking |
| POST | `/api/callback` | Submit a callback request |
| GET | `/health` | Health check |

## 📄 License

Internal project — all rights reserved.
