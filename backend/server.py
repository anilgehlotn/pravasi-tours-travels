from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import os
import logging
import httpx
import certifi
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import Request

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ============ ENV VAR VALIDATION ============
def validate_env_vars():
    """Validate required environment variables at startup, fail fast."""
    required_vars = ['MONGO_URL', 'DB_NAME']
    for var in required_vars:
        if not os.environ.get(var):
            raise RuntimeError(f"Missing required environment variable: {var}")
    
    # Google Maps API Key is optional but warn if missing
    if not os.environ.get('GOOGLE_API_KEY'):
        logging.warning("GOOGLE_API_KEY not set - distance calculations will use fallback data")
    
    # API Key for authentication
    if not os.environ.get('API_KEY'):
        raise RuntimeError("Missing required environment variable: API_KEY")

validate_env_vars()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[os.environ['DB_NAME']]

# Google Maps API key
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')

# API Key for authentication
API_KEY = os.environ['API_KEY']

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# ============ AUTHENTICATION ============
security = HTTPBearer(auto_error=False)

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify API key from Authorization header or X-API-Key header."""
    if credentials and credentials.credentials == API_KEY:
        return credentials.credentials
    raise HTTPException(status_code=401, detail="Invalid or missing API key")

# Alternative: verify via X-API-Key header
async def verify_api_key_header(x_api_key: str = Header(None)) -> str:
    """Verify API key from X-API-Key header."""
    if x_api_key == API_KEY:
        return x_api_key
    raise HTTPException(status_code=401, detail="Invalid or missing API key")

# ============ LIFESPAN CONTEXT MANAGER ============
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
        logger.info("✅ FastAPI startup complete - MongoDB connected, vehicles seeded")
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown: Close database client
    try:
        client.close()
        logger.info("✅ Database client closed")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")

# ============ APP INITIALIZATION ============
api_router = APIRouter(prefix="/api")

app = FastAPI(
    title="Pravasi Tours & Travels API",
    description="Backend API for travel booking application",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter state to app
app.state.limiter = limiter

# Exception handler for rate limiting
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded: 10 requests per minute allowed"}
    )

# ============ VEHICLE DATA ============
VEHICLES_DATA = [
    {
        "id": "sedan",
        "name": "Sedan",
        "category": "sedan",
        "seats": 4,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782894248/PHOTO-2026-07-01-13-52-09_nguxts.jpg",
        "description": "Comfortable sedan perfect for family trips and city transfers. Ideal for 2-4 passengers with luggage.",
        "features": ["Air Conditioned", "4 Seater", "Spacious Boot", "Music System", "GPS Navigation"],
        "pricing": {
            "local_8hrs_80km": 2200,
            "extra_km": 14,
            "extra_hr": 200,
            "outstation_km": 14,
            "min_km": 300,
            "driver_bata": 300
        }
    },
    {
        "id": "innova",
        "name": "Ertiga / Kia Carens",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782890280/ChatGPT_Image_Jul_1_2026_12_39_14_PM_iycbb1.png",
        "description": "Spacious Toyota Innova for comfortable group travel. Perfect for families and small groups.",
        "features": ["Air Conditioned", "7 Seater", "Ample Luggage Space", "Comfortable Seats", "Music System"],
        "pricing": {
            "local_8hrs_80km": 3000,
            "extra_km": 18,
            "extra_hr": 250,
            "outstation_km": 18,
            "min_km": 300,
            "driver_bata": 400
        }
    },
    {
        "id": "innova-crysta",
        "name": "Innova Crysta",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990193/vehicles/innova-crysta/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990193/vehicles/innova-crysta/img_001.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892248/WhatsApp_Image_2026-07-01_at_13.14.21_jn7gdb.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892652/PHOTO-2026-07-01-13-22-42_myw8fh.jpg"
        ],
        "description": "Premium Innova Crysta with captain seats for a luxurious travel experience.",
        "features": ["Air Conditioned", "7 Seater", "Captain Seats", "Premium Interior", "Rear AC Vents"],
        "pricing": {
            "local_8hrs_80km": 3500,
            "extra_km": 22,
            "extra_hr": 300,
            "outstation_km": 22,
            "min_km": 300,
            "driver_bata": 400
        }
    },
    {
        "id": "innova-hybrid",
        "name": "Hycross Hybrid",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782890930/ChatGPT_Image_Jul_1_2026_12_52_10_PM_bki0b1.png",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891845/PHOTO-2026-07-01-13-13-59_aumurb.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782890930/ChatGPT_Image_Jul_1_2026_12_52_10_PM_bki0b1.png",
            # "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891845/PHOTO-2026-07-01-13-13-59_aumurb.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892028/PHOTO-2026-07-01-13-14-21_sjpcxs.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892113/WhatsApp_Image_2026-07-01_at_13.16.33_z7lz0x.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782892248/WhatsApp_Image_2026-07-01_at_13.14.21_jn7gdb.jpg"
        ],
        "description": "Eco-friendly Innova Hybrid combining fuel efficiency with comfort. Premium hybrid technology.",
        "features": ["Air Conditioned", "7 Seater", "Hybrid Engine", "Fuel Efficient", "Premium Interior"],
        "pricing": {
            "local_8hrs_80km": 4200,
            "extra_km": 28,
            "extra_hr": 350,
            "outstation_km": 25,
            "min_km": 300,
            "driver_bata": 500
        }
    },
    {
        "id": "toyota-fortuner",
        "name": "Toyota Fortuner",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891423/ChatGPT_Image_Jul_1_2026_01_03_29_PM_l6febm.png",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891423/ChatGPT_Image_Jul_1_2026_01_03_29_PM_l6febm.png",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891573/PHOTO-2026-07-01-13-09-04_rofk1y.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891595/PHOTO-2026-07-01-13-09-04_zqtfsl.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782891621/PHOTO-2026-07-01-13-09-04_uwgkc2.jpg"
        ],
        "description": "Premium Toyota Fortuner for executive and luxury travel. Powerful SUV with commanding presence.",
        "features": ["Air Conditioned", "7 Seater", "4x4 Available", "Premium SUV", "Leather Seats"],
        "pricing": {
            "local_8hrs_80km": 5500,
            "extra_km": 50,
            "extra_hr": 500,
            "outstation_km": 45,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "tempo-non-ac",
        "name": "KIA CARNIVAL",
        "category": "van",
        "seats": 6,
        "ac": False,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893389/WhatsApp_Image_2026-07-01_at_13.31.48_3_szpnwh.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893389/WhatsApp_Image_2026-07-01_at_13.31.48_3_szpnwh.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893054/WhatsApp_Image_2026-07-01_at_13.31.46_vw2z6z.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893060/WhatsApp_Image_2026-07-01_at_13.31.46_2_usmxvx.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893095/WhatsApp_Image_2026-07-01_at_13.31.45_1_twm6x6.jpg",
            "https://res.cloudinary.com/dqp0pkern/image/upload/v1782893039/WhatsApp_Image_2026-07-01_at_13.31.47_dhsz5v.jpg"
        ],
        "description": "Budget-friendly Tempo Traveller without AC. Great for short group trips.",
        "features": [ "06 Seater", "Push-back Seats", "Music System", "Recliner Seats"],
        "pricing": {
            "local_8hrs_80km": 7000,
            "extra_km": 70,
            "extra_hr": 700,
            "outstation_km": 65,
            "min_km": 300,
            "driver_bata": 500
        }
    },
    {
        "id": "tempo-ac",
        "name": "Tempo Traveller AC",
        "category": "van",
        "seats": 12,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782894086/WhatsApp_Image_2026-07-01_at_1.51.04_PM_dgwszn.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894086/WhatsApp_Image_2026-07-01_at_1.51.04_PM_dgwszn.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894058/WhatsApp_Image_2026-07-01_at_1.50.06_PM_eowybx.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782893909/WhatsApp_Image_2026-07-01_at_1.47.10_PM_kt4seb.jpg"
        ],
        "description": "Air-conditioned Tempo Traveller for comfortable group travel. Ideal for pilgrimages and tours.",
        "features": ["Air Conditioned", "12 Seater", "Push-back Seats", "Luggage Carrier", "Curtains"],
        "pricing": {
            "local_8hrs_80km": 5000,
            "extra_km": 22,
            "extra_hr": 350,
            "outstation_km": 22,
            "min_km": 300,
            "driver_bata": 600
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 4500,
            "extra_km": 20,
            "extra_hr": 300,
            "outstation_km": 20,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "tt-luxury",
        "name": "TT 9 Seater Luxury",
        "category": "van",
        "seats": 9,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990202/vehicles/tt-luxury/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990202/vehicles/tt-luxury/img_001.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894980/WhatsApp_Image_2026-07-01_at_1.04.13_PM_1_rfipuu.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782894975/WhatsApp_Image_2026-07-01_at_1.04.12_PM_vru4ao.jpg"
        ],
        "description": "Luxury 9-seater Tempo Traveller with premium interiors. Perfect for VIP group travel.",
        "features": ["Air Conditioned", "9 Seater", "Luxury Interior", "Sofa Seats", "LED TV", "Refrigerator"],
        "pricing": {
            "local_8hrs_80km": 6500,
            "extra_km": 30,
            "extra_hr": 500,
            "outstation_km": 30,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "urbania",
        "name": "Urbania",
        "category": "van",
        "seats": 16,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990203/vehicles/urbania/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990203/vehicles/urbania/img_001.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895123/WhatsApp_Image_2026-07-01_at_2.05.08_PM_e1bvtl.jpg"
        ],
        "description": "Force Urbania for medium group travel. Available in 9, 12, and 16 seater configurations.",
        "features": ["Air Conditioned", "Premium Interior", "Push-back Seats", "USB Charging"],
        "pricing": {
            "local_8hrs_80km": 8000,
            "extra_km": 40,
            "extra_hr": 500,
            "outstation_km": 36,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_12_seater": {
            "local_8hrs_80km": 8000,
            "extra_km": 45,
            "extra_hr": 500,
            "outstation_km": 45,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_9_seater": {
            "local_8hrs_80km": 7000,
            "extra_km": 35,
            "extra_hr": 450,
            "outstation_km": 34,
            "min_km": 300,
            "driver_bata": 700
        }
    },
    {
        "id": "bus-21",
        "name": "21 Seater Bus",
        "category": "bus",
        "seats": 21,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896624/WhatsApp_Image_2026-07-01_at_2.29.26_PM_1_qwkzaj.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.35_PM_aigfsc.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895733/WhatsApp_Image_2026-07-01_at_2.16.34_PM_f8ed1p.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.34_PM_1_at0qg7.jpg"
        ],
        "description": "Comfortable 21-seater mini bus for medium-sized groups. Great for corporate events.",
        "features": ["Air Conditioned", "21 Seater", "Push-back Seats", "Luggage Storage", "PA System"],
        "pricing": {
            "local_8hrs_80km": 7000,
            "extra_km": 34,
            "extra_hr": 550,
            "outstation_km": 34,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 6000,
            "extra_km": 30,
            "extra_hr": 500,
            "outstation_km": 30,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-25",
        "name": "25 Seater Bus",
        "category": "bus",
        "seats": 25,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896581/WhatsApp_Image_2026-07-01_at_2.32.39_PM_pgkyq0.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782896624/WhatsApp_Image_2026-07-01_at_2.29.26_PM_1_qwkzaj.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.35_PM_aigfsc.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895733/WhatsApp_Image_2026-07-01_at_2.16.34_PM_f8ed1p.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782895730/WhatsApp_Image_2026-07-01_at_2.16.34_PM_1_at0qg7.jpg"
        ],
        "description": "Spacious 25-seater bus ideal for group tours and corporate outings.",
        "features": ["Air Conditioned", "25 Seater", "Reclining Seats", "Overhead Storage", "Music System"],
        "pricing": {
            "local_8hrs_80km": 7500,
            "extra_km": 38,
            "extra_hr": 650,
            "outstation_km": 38,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 7000,
            "extra_km": 34,
            "extra_hr": 600,
            "outstation_km": 34,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-33",
        "name": "33 Seater Bus",
        "category": "bus",
        "seats": 33,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990187/vehicles/bus-33/img_001.jpg",
        "images": [
            "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773990187/vehicles/bus-33/img_001.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897465/WhatsApp_Image_2026-07-01_at_2.45.28_PM_uswnvc.jpg"
        ],
        "description": "Large 33-seater bus for big group travel. Comfortable seating for long journeys.",
        "features": ["Air Conditioned", "33 Seater", "Reclining Seats", "Entertainment System", "Restroom"],
        "pricing": {
            "local_8hrs_80km": 10000,
            "extra_km": 48,
            "extra_hr": 700,
            "outstation_km": 44,
            "min_km": 300,
            "driver_bata": 800
        },
        "pricing_non_ac": {
            "local_8hrs_80km": 9500,
            "extra_km": 40,
            "extra_hr": 600,
            "outstation_km": 40,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-45",
        "name": "40/45 Seater Bus",
        "category": "bus",
        "seats": 45,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782897814/WhatsApp_Image_2026-07-01_at_2.50.59_PM_xhfebo.jpg",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897814/WhatsApp_Image_2026-07-01_at_2.50.59_PM_xhfebo.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897811/WhatsApp_Image_2026-07-01_at_2.51.00_PM_1_kao9tw.jpg",
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782897809/WhatsApp_Image_2026-07-01_at_2.51.00_PM_ixx9fr.jpg"
        ],
        "description": "Extra-large 45-seater bus for school trips, weddings and large group events.",
        "features": ["Air Conditioned", "45 Seater", "Reclining Seats", "GPS Tracking", "First Aid Kit"],
        "pricing": {
            "local_8hrs_80km": 13000,
            "extra_km": 55,
            "extra_hr": 800,
            "outstation_km": 55,
            "min_km": 300,
            "driver_bata": 1000
        }
    },
    {
        "id": "volvo-coach",
        "name": "Volvo Coach",
        "category": "coach",
        "seats": 45,
        "ac": True,
        "image": "https://res.cloudinary.com/dqp0pkern/image/upload/f_auto,q_auto,w_800/v1773998467/vehicles/volvo-coach/img_001.jpg",
        "description": "Premium Volvo Coach for luxury long-distance travel. Multi-axle with advanced suspension.",
        "features": ["Air Conditioned", "45 Seater", "Volvo Multi-Axle", "Individual Reading Lights", "Charging Points"],
        "pricing": {
            "local_8hrs_80km": 20000,
            "extra_km": 75,
            "extra_hr": 2000,
            "outstation_km": 75,
            "min_km": 400,
            "driver_bata": 1500
        }
    },
    {
        "id": "sleeper-coach",
        "name": "49 Seater",
        "category": "coach",
        "seats": 49,
        "ac": True,
        "image": "https://res.cloudinary.com/hioiaexf/image/upload/v1782898756/ChatGPT_Image_Jul_1_2026_03_08_36_PM_czu9rk.png",
        "images": [
            "https://res.cloudinary.com/hioiaexf/image/upload/v1782898756/ChatGPT_Image_Jul_1_2026_03_08_36_PM_czu9rk.png"
        ],
        "description": "49 Seater Sleeper Coach for overnight long-distance travel. Individual berths for a restful journey.",
        "features": ["Air Conditioned", "49 Sleeper Berths", "Individual Curtains", "Blanket & Pillow", "USB Charging"],
        "pricing": {
            "local_8hrs_80km": 20000,
            "extra_km": 70,
            "extra_hr": 1100,
            "outstation_km": 65,
            "min_km": 300,
            "driver_bata": 1500
        }
    }
]


# ============ HELPER FUNCTIONS ============

# Common Indian route distances (comprehensive fallback data in km)
COMMON_ROUTES = {
    # Bangalore routes
    ("bangalore", "mysore"): 150, ("bangalore", "mysuru"): 150,
    ("bangalore", "chennai"): 350, ("bangalore", "hyderabad"): 570,
    ("bangalore", "goa"): 560, ("bangalore", "ooty"): 270,
    ("bangalore", "coorg"): 265, ("bangalore", "pondicherry"): 310,
    ("bangalore", "mumbai"): 980, ("bangalore", "pune"): 840,
    ("bangalore", "kochi"): 560, ("bangalore", "cochin"): 560,
    ("bangalore", "trivandrum"): 730, ("bangalore", "thiruvananthapuram"): 730,
    ("bangalore", "mangalore"): 350, ("bangalore", "tirupati"): 250,
    ("bangalore", "madurai"): 440, ("bangalore", "coimbatore"): 365,
    ("bangalore", "hampi"): 340, ("bangalore", "wayanad"): 280,
    ("bangalore", "delhi"): 2150, ("bangalore", "new delhi"): 2150,
    ("bangalore", "jaipur"): 1850, ("bangalore", "rajasthan"): 1850,
    ("bangalore", "agra"): 2000, ("bangalore", "kolkata"): 1870,
    ("bangalore", "ahmedabad"): 1500, ("bangalore", "lucknow"): 2000,
    ("bangalore", "bhopal"): 1450, ("bangalore", "nagpur"): 1100,
    ("bangalore", "vizag"): 800, ("bangalore", "visakhapatnam"): 800,
    ("bangalore", "vijayawada"): 660, ("bangalore", "hubli"): 420,
    ("bangalore", "belgaum"): 500, ("bangalore", "shimoga"): 300,
    ("bangalore", "hassan"): 190, ("bangalore", "chikmagalur"): 250,
    ("bangalore", "nandi hills"): 60, ("bangalore", "pondicherry"): 310,
    ("bengaluru", "mysore"): 150, ("bengaluru", "mysuru"): 150,
    ("bengaluru", "chennai"): 350, ("bengaluru", "rajasthan"): 1850,
    ("bengaluru", "jaipur"): 1850, ("bengaluru", "delhi"): 2150,
    # Delhi routes
    ("delhi", "agra"): 230, ("delhi", "jaipur"): 280,
    ("delhi", "chandigarh"): 250, ("delhi", "shimla"): 350,
    ("delhi", "manali"): 540, ("delhi", "haridwar"): 220,
    ("delhi", "rishikesh"): 240, ("delhi", "amritsar"): 450,
    ("delhi", "lucknow"): 550, ("delhi", "varanasi"): 800,
    ("delhi", "dehradun"): 240, ("delhi", "mussoorie"): 280,
    ("delhi", "nainital"): 300, ("delhi", "jim corbett"): 250,
    ("delhi", "mathura"): 180, ("delhi", "vrindavan"): 160,
    ("delhi", "rajasthan"): 280, ("delhi", "mumbai"): 1400,
    ("delhi", "kolkata"): 1500, ("delhi", "chennai"): 2180,
    ("delhi", "hyderabad"): 1550, ("delhi", "pune"): 1400,
    ("delhi", "goa"): 1900, ("delhi", "ahmedabad"): 950,
    ("delhi", "udaipur"): 660, ("delhi", "jodhpur"): 590,
    ("delhi", "jaisalmer"): 780, ("delhi", "mcleodganj"): 480,
    ("new delhi", "agra"): 230, ("new delhi", "jaipur"): 280,
    # Mumbai routes
    ("mumbai", "pune"): 150, ("mumbai", "goa"): 590,
    ("mumbai", "nashik"): 170, ("mumbai", "lonavala"): 85,
    ("mumbai", "shirdi"): 250, ("mumbai", "mahabaleshwar"): 260,
    ("mumbai", "aurangabad"): 330, ("mumbai", "ahmedabad"): 530,
    ("mumbai", "surat"): 280, ("mumbai", "kolhapur"): 380,
    ("mumbai", "bangalore"): 980, ("mumbai", "hyderabad"): 710,
    ("mumbai", "delhi"): 1400, ("mumbai", "jaipur"): 1150,
    ("mumbai", "rajasthan"): 1150, ("mumbai", "udaipur"): 800,
    # Chennai routes
    ("chennai", "pondicherry"): 150, ("chennai", "madurai"): 460,
    ("chennai", "coimbatore"): 500, ("chennai", "trichy"): 330,
    ("chennai", "tirupati"): 135, ("chennai", "kanchipuram"): 75,
    ("chennai", "mahabalipuram"): 60, ("chennai", "ooty"): 570,
    ("chennai", "bangalore"): 350, ("chennai", "hyderabad"): 630,
    ("chennai", "mumbai"): 1340, ("chennai", "delhi"): 2180,
    ("chennai", "kolkata"): 1670, ("chennai", "kochi"): 690,
    # Hyderabad routes
    ("hyderabad", "tirupati"): 560, ("hyderabad", "vijayawada"): 270,
    ("hyderabad", "vizag"): 620, ("hyderabad", "nagpur"): 500,
    ("hyderabad", "bidar"): 580, ("hyderabad", "warangal"): 150,
    ("hyderabad", "bangalore"): 570, ("hyderabad", "chennai"): 630,
    ("hyderabad", "mumbai"): 710, ("hyderabad", "pune"): 560,
    ("hyderabad", "goa"): 650, ("hyderabad", "delhi"): 1550,
    # Kolkata routes
    ("kolkata", "darjeeling"): 615, ("kolkata", "digha"): 185,
    ("kolkata", "puri"): 500, ("kolkata", "siliguri"): 560,
    ("kolkata", "delhi"): 1500, ("kolkata", "mumbai"): 2050,
    ("kolkata", "chennai"): 1670, ("kolkata", "bangalore"): 1870,
    # Jaipur / Rajasthan routes
    ("jaipur", "udaipur"): 395, ("jaipur", "jodhpur"): 330,
    ("jaipur", "jaisalmer"): 560, ("jaipur", "pushkar"): 145,
    ("jaipur", "ajmer"): 135, ("jaipur", "delhi"): 280,
    ("jaipur", "agra"): 240, ("jaipur", "mumbai"): 1150,
    ("rajasthan", "delhi"): 280, ("rajasthan", "mumbai"): 1150,
    ("rajasthan", "bangalore"): 1850, ("rajasthan", "chennai"): 2080,
    # Goa routes
    ("goa", "mumbai"): 590, ("goa", "bangalore"): 560,
    ("goa", "pune"): 450, ("goa", "hyderabad"): 650,
    # Kerala routes
    ("kochi", "munnar"): 130, ("kochi", "alleppey"): 55,
    ("kochi", "trivandrum"): 200, ("kochi", "bangalore"): 560,
    ("kerala", "bangalore"): 560, ("kerala", "chennai"): 690,
}


def _normalize_location(loc: str) -> str:
    """Normalize a location string for cache key generation."""
    return loc.lower().strip().replace(",", "").replace("  ", " ")


def _make_cache_key(origin: str, destination: str) -> str:
    """Create a consistent cache key (sorted so A->B == B->A)."""
    a = _normalize_location(origin)
    b = _normalize_location(destination)
    return f"{min(a, b)}|{max(a, b)}"


def _get_hardcoded_fallback(origin: str, destination: str) -> Optional[int]:
    """Look up a route in the hardcoded COMMON_ROUTES dictionary."""
    o = origin.lower().strip()
    d = destination.lower().strip()
    for (a, b), dist in COMMON_ROUTES.items():
        if (a in o and b in d) or (b in o and a in d):
            return dist
    return None


async def _fetch_from_google_api(origin: str, destination: str) -> Optional[dict]:
    """Call Google Maps Distance Matrix API. Returns result dict or None on failure."""
    if not GOOGLE_API_KEY:
        return None

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origin,
        "destinations": destination,
        "key": GOOGLE_API_KEY,
        "units": "metric"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(url, params=params)
            data = response.json()

            if data.get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                if element.get("status") == "OK":
                    distance_km = element["distance"]["value"] / 1000
                    duration_text = element["duration"]["text"]
                    return {
                        "distance_km": round(distance_km, 1),
                        "duration_text": duration_text,
                        "status": "OK"
                    }
                else:
                    logger.error(f"Google Maps element status: {element.get('status')} for {origin} -> {destination}")
            else:
                logger.error(f"Google Maps API status: {data.get('status')}, error: {data.get('error_message', '')} for {origin} -> {destination}")
    except Exception as e:
        logger.error(f"Google Maps API exception for {origin} -> {destination}: {e}")

    return None


async def get_distance_from_google(origin: str, destination: str) -> dict:
    """
    Get distance between two locations using a 3-tier strategy:
      1. Check MongoDB cache (distances collection)
      2. Call Google Maps Distance Matrix API (and cache the result)
      3. Fall back to hardcoded COMMON_ROUTES, then 250km default
    """
    cache_key = _make_cache_key(origin, destination)

    # ── Tier 1: Check MongoDB cache ──
    try:
        cached = await db.distances.find_one({"cache_key": cache_key}, {"_id": 0})
        if cached:
            logger.info(f"Distance cache HIT for {origin} -> {destination}: {cached['distance_km']} km")
            return {
                "distance_km": cached["distance_km"],
                "duration_text": cached.get("duration_text", ""),
                "status": "CACHED"
            }
    except Exception as e:
        logger.warning(f"MongoDB cache lookup failed: {e}")

    # ── Tier 2: Google Maps API ──
    google_result = await _fetch_from_google_api(origin, destination)
    if google_result:
        logger.info(f"Google Maps OK for {origin} -> {destination}: {google_result['distance_km']} km, {google_result['duration_text']}")
        # Save to MongoDB cache for future lookups
        try:
            await db.distances.update_one(
                {"cache_key": cache_key},
                {"$set": {
                    "cache_key": cache_key,
                    "origin": origin,
                    "destination": destination,
                    "distance_km": google_result["distance_km"],
                    "duration_text": google_result["duration_text"],
                    "source": "google_maps",
                    "fetched_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            logger.info(f"Cached distance for {origin} -> {destination} in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to cache distance in MongoDB: {e}")
        return google_result

    # ── Tier 3: Hardcoded fallback ──
    hardcoded = _get_hardcoded_fallback(origin, destination)
    if hardcoded:
        logger.warning(f"Using hardcoded fallback for {origin} -> {destination}: {hardcoded} km")
        return {
            "distance_km": float(hardcoded),
            "duration_text": f"~{int(hardcoded / 50)} hours (estimated)",
            "status": "FALLBACK"
        }

    # ── Last resort: 250km default ──
    logger.warning(f"No distance data available for {origin} -> {destination}, using 250km default")
    return {
        "distance_km": 250.0,
        "duration_text": "~5 hours (estimated)",
        "status": "FALLBACK"
    }


def calculate_outstation_price(distance_km: float, pricing: dict, days: int) -> dict:
    """Calculate outstation (round trip) price."""
    total_distance = round(distance_km * 2, 1)  # Round trip

    if total_distance < pricing["min_km"]:
        total_distance = pricing["min_km"]

    vehicle_cost = round(total_distance * pricing["outstation_km"])
    driver_cost = pricing["driver_bata"] * days
    total_price = vehicle_cost + driver_cost

    return {
        "distance_km": round(distance_km, 1),
        "total_distance_km": total_distance,
        "vehicle_cost": vehicle_cost,
        "driver_cost": driver_cost,
        "total_price": total_price,
        "breakdown": {
            "rate_per_km": pricing["outstation_km"],
            "min_km": pricing["min_km"],
            "bata_per_day": pricing["driver_bata"],
            "days": days,
            "calculation": f"{total_distance} km x ₹{pricing['outstation_km']}/km = ₹{vehicle_cost}"
        }
    }


def calculate_local_price(distance_km: float, pricing: dict) -> dict:
    """Calculate local package (8hrs/80km) price."""
    base_price = pricing["local_8hrs_80km"]
    extra_km_cost = 0
    extra_km = 0

    if distance_km > 80:
        extra_km = round(distance_km - 80, 1)
        extra_km_cost = round(extra_km * pricing["extra_km"])

    driver_cost = pricing["driver_bata"]
    total_price = base_price + extra_km_cost + driver_cost

    return {
        "distance_km": round(distance_km, 1),
        "total_distance_km": round(distance_km, 1),
        "vehicle_cost": base_price + extra_km_cost,
        "driver_cost": driver_cost,
        "total_price": total_price,
        "breakdown": {
            "base_price_8hrs_80km": base_price,
            "extra_km": extra_km,
            "extra_km_rate": pricing["extra_km"],
            "extra_km_cost": extra_km_cost,
            "driver_bata": driver_cost,
            "calculation": f"Base ₹{base_price}" + (f" + {extra_km} extra km x ₹{pricing['extra_km']}/km = ₹{extra_km_cost}" if extra_km > 0 else "") + f" + Driver ₹{driver_cost}"
        }
    }


# ============ PYDANTIC MODELS ============
class QuotationRequest(BaseModel):
    vehicle_id: str
    from_location: str
    to_location: str
    travel_date: str
    return_date: Optional[str] = None
    travelers: int = 1
    trip_type: str = "outstation"
    distance_km: Optional[float] = None
    duration_text: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None


class CallbackRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None
    vehicle_id: Optional[str] = None


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "Pravasi Tours & Travels API is running"}


@api_router.get("/vehicles")
async def get_vehicles():
    vehicles = await db.vehicles.find({}, {"_id": 0}).to_list(100)
    return vehicles


@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@api_router.post("/getQuotation")
@limiter.limit("10/minute")
async def get_quotation(request: Request, req: QuotationRequest):
    # Validate vehicle
    vehicle = await db.vehicles.find_one({"id": req.vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Use frontend-provided distance (from Google Maps JS API) or fallback
    if req.distance_km and req.distance_km > 0:
        distance_km = req.distance_km
        duration_text = req.duration_text or ""
        logger.info(f"Using frontend-provided distance: {distance_km} km")
    else:
        distance_result = await get_distance_from_google(req.from_location, req.to_location)
        if distance_result["status"] not in ["OK", "CACHED", "FALLBACK"]:
            logger.warning(f"Google Maps API returned {distance_result['status']}, using fallback")
            distance_result = {"distance_km": 250.0, "duration_text": "~5 hours (estimated)", "status": "FALLBACK"}
        distance_km = distance_result["distance_km"]
        duration_text = distance_result.get("duration_text", "")
    pricing = vehicle["pricing"]

    # Calculate number of days
    days = 1
    if req.return_date and req.travel_date:
        try:
            travel = datetime.fromisoformat(req.travel_date.replace("Z", "+00:00"))
            ret = datetime.fromisoformat(req.return_date.replace("Z", "+00:00"))
            days = max(1, (ret - travel).days)
        except (ValueError, TypeError):
            days = 1

    # Calculate price based on trip type
    if req.trip_type == "local":
        price_data = calculate_local_price(distance_km, pricing)
    else:
        price_data = calculate_outstation_price(distance_km, pricing, days)

    # Build quotation document
    quote_id = str(uuid.uuid4())
    quotation = {
        "id": quote_id,
        "vehicle_id": req.vehicle_id,
        "vehicle_name": vehicle["name"],
        "vehicle_image": vehicle["image"],
        "vehicle_seats": vehicle["seats"],
        "from_location": req.from_location,
        "to_location": req.to_location,
        "travel_date": req.travel_date,
        "return_date": req.return_date,
        "travelers": req.travelers,
        "trip_type": req.trip_type,
        "days": days,
        "duration_text": duration_text,
        "distance_km": price_data["distance_km"],
        "total_distance_km": price_data["total_distance_km"],
        "vehicle_cost": price_data["vehicle_cost"],
        "driver_cost": price_data["driver_cost"],
        "total_price": price_data["total_price"],
        "breakdown": price_data["breakdown"],
        "customer_name": req.customer_name,
        "customer_phone": req.customer_phone,
        "customer_email": req.customer_email,
        "status": "quoted",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    # Save to MongoDB
    await db.quotations.insert_one(quotation)
    # Remove _id added by MongoDB
    quotation.pop("_id", None)

    return quotation


@api_router.get("/quotations/{quote_id}")
async def get_quotation_by_id(quote_id: str):
    quotation = await db.quotations.find_one({"id": quote_id}, {"_id": 0})
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation


@api_router.post("/callback")
async def request_callback(req: CallbackRequest):
    callback_doc = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "phone": req.phone,
        "email": req.email,
        "message": req.message,
        "vehicle_id": req.vehicle_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.callbacks.insert_one(callback_doc)
    callback_doc.pop("_id", None)
    return {"message": "Callback request submitted successfully", "data": callback_doc}


@api_router.post("/bookings")
async def confirm_booking(quote_id: str):
    quotation = await db.quotations.find_one({"id": quote_id}, {"_id": 0})
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")

    booking = {
        "id": str(uuid.uuid4()),
        "quotation_id": quote_id,
        **{k: v for k, v in quotation.items() if k != "id"},
        "status": "confirmed",
        "booked_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking)
    booking.pop("_id", None)

    # Update quotation status
    await db.quotations.update_one({"id": quote_id}, {"$set": {"status": "booked"}})

    return {"message": "Booking confirmed successfully!", "data": booking}


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
