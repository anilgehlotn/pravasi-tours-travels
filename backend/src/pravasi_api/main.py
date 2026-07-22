import logging
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from .config import CORS_ORIGINS, limiter
from .data.vehicles import VEHICLES_DATA
from .database import client, db
from .routers import bookings, callbacks, quotations, vehicles

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events using lifespan context manager."""
    # Startup: Seed vehicles if collection is empty
    try:
        count = await db.vehicles.count_documents({})
        if count == 0:
            for v in VEHICLES_DATA:
                await db.vehicles.insert_one(v.copy())
            logger.info(f"Seeded {len(VEHICLES_DATA)} vehicles into MongoDB")
        else:
            # Update existing vehicles with latest data
            for v in VEHICLES_DATA:
                await db.vehicles.update_one(
                    {"id": v["id"]},
                    {"$set": v},
                    upsert=True
                )
            logger.info(f"Updated {len(VEHICLES_DATA)} vehicles in MongoDB")
        logger.info("FastAPI startup complete - MongoDB connected, vehicles seeded")
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

    yield

    # Shutdown: Close database client
    try:
        client.close()
        logger.info("Database client closed")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")


api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Pravasi Tours & Travels API is running"}


api_router.include_router(vehicles.router)
api_router.include_router(quotations.router)
api_router.include_router(bookings.router)
api_router.include_router(callbacks.router)

app = FastAPI(
    title="Pravasi Tours & Travels API",
    description="Backend API for travel booking application",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter state to app
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded: 10 requests per minute allowed"}
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
