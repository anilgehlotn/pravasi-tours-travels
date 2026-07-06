import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import auth, bookings, billing, drivers, vehicles, b2b

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Pravasi Tours & Travels ERP")

# ── CORS ──────────────────────────────────────────────────────────────────────
# NOTE: allow_origins=["*"] is incompatible with allow_credentials=True in
# browsers. We enumerate explicit origins so credentials (Authorization header)
# work correctly AND CORS headers appear on error responses.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "https://pravasi-tours-travels-1xdh-qwvxilit8-anils-projects-a4722c73.vercel.app",
    "https://pravasi-tours-travels.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ── Global exception handler ──────────────────────────────────────────────────
# Unhandled exceptions bypass FastAPI's normal response pipeline, causing
# CORSMiddleware to NOT add headers. We catch them here and return a proper
# JSON response so CORS headers are always present.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error("Unhandled exception on %s: %s", request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {type(exc).__name__}"},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(billing.router,  prefix="/api/billing",  tags=["Billing"])
app.include_router(drivers.router,  prefix="/api/drivers",  tags=["Drivers"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(b2b.router,      prefix="/api/b2b",      tags=["B2B Billing"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
