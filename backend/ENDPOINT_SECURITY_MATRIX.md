# 🔐 Endpoint Security Matrix

## API Endpoint Access Control Overview

```
╔════════════════════════════════════════════════════════════════════════════╗
║                         ENDPOINT SECURITY MATRIX                           ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  METHOD  │ ENDPOINT                 │ AUTH REQUIRED │ RATE LIMIT │ STATUS ║
║  ────────┼──────────────────────────┼───────────────┼────────────┼────── ║
║                                                                            ║
║  PUBLIC ENDPOINTS (No Authentication Required)                             ║
║  ────────────────────────────────────────────────────────────────────────  ║
║  GET     │ /api/vehicles            │ ✅ None       │ ❌ None    │ ✅    ║
║  GET     │ /api/vehicles/{id}       │ ✅ None       │ ❌ None    │ ✅    ║
║  POST    │ /api/getQuotation        │ ✅ None       │ ✅ 10/min  │ ✅    ║
║                                                                            ║
║  PROTECTED ENDPOINTS (X-API-Key Header Required)                           ║
║  ────────────────────────────────────────────────────────────────────────  ║
║  GET     │ /api/quotations/{id}     │ ❌ X-API-Key  │ ❌ None    │ ✅    ║
║  POST    │ /api/bookings            │ ❌ X-API-Key  │ ❌ None    │ ✅    ║
║  POST    │ /api/callback            │ ❌ X-API-Key  │ ❌ None    │ ✅    ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INCOMING REQUEST                             │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Is PUBLIC ENDPOINT?   │
                    └────────────────────────┘
                         │              │
                    NO   │              │   YES
                         ▼              ▼
            ┌──────────────────────┐  Allow Request
            │ Check X-API-Key      │  (No Auth)
            │ Header               │
            └──────────────────────┘
                    │         │
              VALID │         │ INVALID/MISSING
                    ▼         ▼
            ✅ Allow       ❌ Return 401
            Request      Unauthorized
                    │         │
                    └─────────┴──────────────┐
                                            ▼
                    ┌─────────────────────────────────┐
                    │  Is Rate-Limited Endpoint?      │
                    │  (POST /api/getQuotation)       │
                    └─────────────────────────────────┘
                         │                │
                    YES  │                │  NO
                         ▼                ▼
            ┌─────────────────────┐  Execute Endpoint
            │ Check Rate Limit    │
            │ (10/minute/IP)      │
            └─────────────────────┘
                    │         │
              UNDER │         │ EXCEEDED
                    ▼         ▼
            ✅ Execute    ❌ Return 429
            Endpoint     Too Many Requests
```

## Rate Limiting Details

```
┌──────────────────────────────────────────────────────────────────┐
│                      RATE LIMITING SPECIFICS                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Endpoint: POST /api/getQuotation                               │
│  ─────────────────────────────────────────────────────────────── │
│  Limit:                    10 requests per minute               │
│  Scope:                    Per IP address                       │
│  Reset:                    Every 60 seconds                     │
│  Response on Exceeded:     HTTP 429 Too Many Requests           │
│  Response Headers:         X-RateLimit-Limit                   │
│                            X-RateLimit-Remaining               │
│                            X-RateLimit-Reset                   │
│  Retry-After:              Included in headers                 │
│                                                                  │
│  Example Usage:                                                 │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  Request 1:                                                     │
│  $ curl -X POST http://localhost:8000/api/getQuotation \       │
│    -H "Content-Type: application/json" \                       │
│    -d '{"vehicle_id": "sedan", ...}'                           │
│  Response: 200 OK                                               │
│            X-RateLimit-Remaining: 9                            │
│                                                                  │
│  Request 11:                                                    │
│  $ curl -X POST http://localhost:8000/api/getQuotation         │
│  Response: 429 Too Many Requests                               │
│  {                                                              │
│    "detail": "Rate limit exceeded: 10 requests per minute"     │
│  }                                                              │
│  X-RateLimit-Reset: 1710614400                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## API Key Authentication Details

```
┌──────────────────────────────────────────────────────────────────┐
│                   API KEY AUTHENTICATION                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Protected Endpoints:                                            │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  1. POST /api/bookings                                          │
│     - Requires: X-API-Key header                               │
│     - Action: Confirm booking from quotation                   │
│     - Returns 401 if auth fails                                │
│                                                                  │
│  2. GET /api/quotations/{quote_id}                              │
│     - Requires: X-API-Key header                               │
│     - Action: Retrieve specific quotation                      │
│     - Returns 401 if auth fails                                │
│                                                                  │
│  3. POST /api/callback                                          │
│     - Requires: X-API-Key header                               │
│     - Action: Submit callback request                          │
│     - Returns 401 if auth fails                                │
│                                                                  │
│  Header Format:                                                 │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  X-API-Key: your-secret-api-key-here                           │
│                                                                  │
│  Example cURL:                                                  │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  $ curl -X POST http://localhost:8000/api/bookings?quote_id=123│
│    -H "X-API-Key: your-secret-api-key-here"                   │
│                                                                  │
│  Success Response (200):                                        │
│  {                                                              │
│    "message": "Booking confirmed successfully!",               │
│    "data": { "id": "...", ...}                                 │
│  }                                                              │
│                                                                  │
│  Failure Response (401):                                        │
│  {                                                              │
│    "detail": "Invalid or missing API key"                      │
│  }                                                              │
│                                                                  │
│  .env Configuration:                                            │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  API_KEY=your-secret-api-key-here                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Environment Validation Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  APPLICATION STARTUP FLOW                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │  Load .env file              │
                │  (python-dotenv)            │
                └─────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │  validate_env_vars()        │
                │  (Module Load)              │
                └─────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
            Check       Check        Check
            MONGO_URL   DB_NAME      API_KEY
                │         │            │
                ├────┬────┤            │
                │    │    │            │
         FOUND  │    │    │  FOUND     │
                ▼    ▼    ▼            ▼
            ✅ All Required Vars ✅ API_KEY
               Found                 Found
                │                     │
                └──────────┬──────────┘
                           │
              Check Optional: GOOGLE_API_KEY
                           │
                ┌──────────┴──────────┐
                │                     │
            FOUND               NOT FOUND
                │                     │
                ✅                  ⚠️
            Continue          Warn: Using
                              Fallback Data
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Initialize MongoDB  │
                └──────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Create FastAPI App  │
                │  (with lifespan)     │
                └──────────────────────┘
                           │
                           ▼
            ┌───────────────────────────────┐
            │  Lifespan Startup Block:      │
            │  - Seed vehicles to MongoDB   │
            │  - Initialize connections    │
            └───────────────────────────────┘
                           │
                           ▼
            ┌───────────────────────────────┐
            │  ✅ SERVER READY              │
            │     All Features Enabled:     │
            │     ✅ API Key Auth           │
            │     ✅ Rate Limiting          │
            │     ✅ Database Connected     │
            └───────────────────────────────┘

If any required var missing:
            RuntimeError
            ↓
        Server fails to start
        (Fail-fast approach)
```

## Configuration Matrix

```
╔════════════════════════════════════════════════════════════════════╗
║                    CONFIGURATION REQUIREMENTS                      ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  ENV VAR             │ REQUIRED │ PURPOSE          │ EXAMPLE      ║
║  ─────────────────────┼──────────┼──────────────────┼────────────  ║
║  MONGO_URL           │ ✅ Yes   │ DB Connection    │ mongodb+srv://║
║  DB_NAME             │ ✅ Yes   │ DB Name          │ luxtravel    ║
║  API_KEY             │ ✅ Yes   │ API Auth         │ secret-123   ║
║  GOOGLE_API_KEY      │ ⚠️ No    │ Distance API     │ AIzaSy...   ║
║  CORS_ORIGINS        │ ✅ Yes   │ CORS Policy      │ * or URL     ║
║                                                                    ║
║  If missing:                                                       ║
║  ─────────────────────────────────────────────────────────────── ║
║  MONGO_URL:        RuntimeError - Server won't start             ║
║  DB_NAME:          RuntimeError - Server won't start             ║
║  API_KEY:          RuntimeError - Server won't start             ║
║  GOOGLE_API_KEY:   Warning logged - Fallback to hardcoded data  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Testing Endpoint Security

### Test 1: Public Endpoint (No Auth)
```bash
# ✅ Works without authentication
curl -X GET http://localhost:8000/api/vehicles
```

### Test 2: Public Endpoint with Rate Limiting
```bash
# ✅ First 10 work, 11th returns 429
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/getQuotation \
    -H "Content-Type: application/json" \
    -d '{"vehicle_id": "sedan", "from_location": "Mumbai", "to_location": "Bangalore", "travel_date": "2026-03-20"}'
  echo "Request $i"
done
```

### Test 3: Protected Endpoint Without Auth
```bash
# ❌ Returns 401
curl -X POST http://localhost:8000/api/bookings?quote_id=123
# Response: {"detail": "Invalid or missing API key"}
```

### Test 4: Protected Endpoint With Auth
```bash
# ✅ Works with API key
curl -X POST http://localhost:8000/api/bookings?quote_id=123 \
  -H "X-API-Key: your-secret-api-key-here"
```

---

## Summary

✅ **3 Protected Endpoints** require X-API-Key authentication
✅ **3 Public Endpoints** are available without authentication
✅ **1 Rate-Limited Endpoint** allows 10 requests per minute
✅ **4 Environment Variables** validated at startup
✅ **Fail-Fast Approach** prevents partial/broken deployments

**Status: Production Ready** 🚀
