from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, bookings, billing, drivers, vehicles, revenue

app = FastAPI(title="Pravasi Tours & Travels ERP")

# CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api prefix
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["Drivers"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Vehicles"])
app.include_router(revenue.router, prefix="/api/revenue", tags=["Revenue"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
