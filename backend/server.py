from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Google Maps API key
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ VEHICLE DATA ============
VEHICLES_DATA = [
    {
        "id": "sedan",
        "name": "Sedan",
        "category": "sedan",
        "seats": 4,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1758179128122-6079c9cb3e4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBzZWRhbiUyMGNhciUyMHdoaXRlfGVufDB8fHx8MTc3MjgwMzI4Mnww&ixlib=rb-4.1.0&q=85",
        "description": "Comfortable sedan perfect for family trips and city transfers. Ideal for 2-4 passengers with luggage.",
        "features": ["Air Conditioned", "4 Seater", "Spacious Boot", "Music System", "GPS Navigation"],
        "pricing": {
            "local_8hrs_80km": 2200,
            "extra_km": 14,
            "extra_hr": 180,
            "outstation_km": 14,
            "min_km": 300,
            "driver_bata": 300
        }
    },
    {
        "id": "innova",
        "name": "Innova",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1762195340046-415140d8b1b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB3aGl0ZSUyMHN1diUyMGNhciUyMHN0dWRpb3xlbnwwfHx8fDE3NzI4MDMyODF8MA&ixlib=rb-4.1.0&q=85",
        "description": "Spacious Toyota Innova for comfortable group travel. Perfect for families and small groups.",
        "features": ["Air Conditioned", "7 Seater", "Ample Luggage Space", "Comfortable Seats", "Music System"],
        "pricing": {
            "local_8hrs_80km": 3000,
            "extra_km": 18,
            "extra_hr": 300,
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
        "image": "https://images.unsplash.com/photo-1762195340046-415140d8b1b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB3aGl0ZSUyMHN1diUyMGNhciUyMHN0dWRpb3xlbnwwfHx8fDE3NzI4MDMyODF8MA&ixlib=rb-4.1.0&q=85",
        "description": "Premium Innova Crysta with captain seats for a luxurious travel experience.",
        "features": ["Air Conditioned", "7 Seater", "Captain Seats", "Premium Interior", "Rear AC Vents"],
        "pricing": {
            "local_8hrs_80km": 3500,
            "extra_km": 22,
            "extra_hr": 380,
            "outstation_km": 22,
            "min_km": 300,
            "driver_bata": 400
        }
    },
    {
        "id": "innova-hybrid",
        "name": "Innova Hybrid",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1762195340046-415140d8b1b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB3aGl0ZSUyMHN1diUyMGNhciUyMHN0dWRpb3xlbnwwfHx8fDE3NzI4MDMyODF8MA&ixlib=rb-4.1.0&q=85",
        "description": "Eco-friendly Innova Hybrid combining fuel efficiency with comfort. Premium hybrid technology.",
        "features": ["Air Conditioned", "7 Seater", "Hybrid Engine", "Fuel Efficient", "Premium Interior"],
        "pricing": {
            "local_8hrs_80km": 3800,
            "extra_km": 24,
            "extra_hr": 400,
            "outstation_km": 24,
            "min_km": 300,
            "driver_bata": 400
        }
    },
    {
        "id": "toyota-fortuner",
        "name": "Toyota Fortuner",
        "category": "suv",
        "seats": 7,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1762195340046-415140d8b1b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB3aGl0ZSUyMHN1diUyMGNhciUyMHN0dWRpb3xlbnwwfHx8fDE3NzI4MDMyODF8MA&ixlib=rb-4.1.0&q=85",
        "description": "Premium Toyota Fortuner for executive and luxury travel. Powerful SUV with commanding presence.",
        "features": ["Air Conditioned", "7 Seater", "4x4 Available", "Premium SUV", "Leather Seats"],
        "pricing": {
            "local_8hrs_80km": 5500,
            "extra_km": 30,
            "extra_hr": 500,
            "outstation_km": 30,
            "min_km": 300,
            "driver_bata": 500
        }
    },
    {
        "id": "tempo-non-ac",
        "name": "Tempo Traveller Non AC",
        "category": "van",
        "seats": 12,
        "ac": False,
        "image": "https://images.unsplash.com/photo-1554050767-0c512ab917ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNwcmludGVyJTIwdmFuJTIwZXh0ZXJpb3J8ZW58MHx8fHwxNzcyODAzMjgzfDA&ixlib=rb-4.1.0&q=85",
        "description": "Budget-friendly Tempo Traveller without AC. Great for short group trips.",
        "features": ["Non AC", "12 Seater", "Push-back Seats", "Luggage Carrier", "Music System"],
        "pricing": {
            "local_8hrs_80km": 4500,
            "extra_km": 22,
            "extra_hr": 400,
            "outstation_km": 20,
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
        "image": "https://images.unsplash.com/photo-1554050767-0c512ab917ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNwcmludGVyJTIwdmFuJTIwZXh0ZXJpb3J8ZW58MHx8fHwxNzcyODAzMjgzfDA&ixlib=rb-4.1.0&q=85",
        "description": "Air-conditioned Tempo Traveller for comfortable group travel. Ideal for pilgrimages and tours.",
        "features": ["Air Conditioned", "12 Seater", "Push-back Seats", "Luggage Carrier", "Curtains"],
        "pricing": {
            "local_8hrs_80km": 5500,
            "extra_km": 28,
            "extra_hr": 450,
            "outstation_km": 25,
            "min_km": 300,
            "driver_bata": 500
        }
    },
    {
        "id": "tt-luxury",
        "name": "TT 9 Seater Luxury",
        "category": "van",
        "seats": 9,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1554050767-0c512ab917ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNwcmludGVyJTIwdmFuJTIwZXh0ZXJpb3J8ZW58MHx8fHwxNzcyODAzMjgzfDA&ixlib=rb-4.1.0&q=85",
        "description": "Luxury 9-seater Tempo Traveller with premium interiors. Perfect for VIP group travel.",
        "features": ["Air Conditioned", "9 Seater", "Luxury Interior", "Sofa Seats", "LED TV", "Refrigerator"],
        "pricing": {
            "local_8hrs_80km": 7000,
            "extra_km": 35,
            "extra_hr": 500,
            "outstation_km": 32,
            "min_km": 300,
            "driver_bata": 600
        }
    },
    {
        "id": "urbania",
        "name": "Urbania 16+1",
        "category": "van",
        "seats": 17,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1554050767-0c512ab917ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHwxfHxtZXJjZWRlcyUyMHNwcmludGVyJTIwdmFuJTIwZXh0ZXJpb3J8ZW58MHx8fHwxNzcyODAzMjgzfDA&ixlib=rb-4.1.0&q=85",
        "description": "Force Urbania 16+1 seater for medium group travel. Modern design with premium comfort.",
        "features": ["Air Conditioned", "17 Seater", "Premium Interior", "Push-back Seats", "USB Charging"],
        "pricing": {
            "local_8hrs_80km": 8500,
            "extra_km": 40,
            "extra_hr": 500,
            "outstation_km": 38,
            "min_km": 300,
            "driver_bata": 800
        }
    },
    {
        "id": "bus-21",
        "name": "21 Seater Bus",
        "category": "bus",
        "seats": 21,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1626448167527-33aec453f913?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB0b3VyJTIwYnVzJTIwY29hY2h8ZW58MHx8fHwxNzcyODAzMjg0fDA&ixlib=rb-4.1.0&q=85",
        "description": "Comfortable 21-seater mini bus for medium-sized groups. Great for corporate events.",
        "features": ["Air Conditioned", "21 Seater", "Push-back Seats", "Luggage Storage", "PA System"],
        "pricing": {
            "local_8hrs_80km": 9000,
            "extra_km": 42,
            "extra_hr": 600,
            "outstation_km": 40,
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
        "image": "https://images.unsplash.com/photo-1626448167527-33aec453f913?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB0b3VyJTIwYnVzJTIwY29hY2h8ZW58MHx8fHwxNzcyODAzMjg0fDA&ixlib=rb-4.1.0&q=85",
        "description": "Spacious 25-seater bus ideal for group tours and corporate outings.",
        "features": ["Air Conditioned", "25 Seater", "Reclining Seats", "Overhead Storage", "Music System"],
        "pricing": {
            "local_8hrs_80km": 10000,
            "extra_km": 45,
            "extra_hr": 650,
            "outstation_km": 42,
            "min_km": 300,
            "driver_bata": 900
        }
    },
    {
        "id": "bus-33",
        "name": "33 Seater Bus",
        "category": "bus",
        "seats": 33,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1626448167527-33aec453f913?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB0b3VyJTIwYnVzJTIwY29hY2h8ZW58MHx8fHwxNzcyODAzMjg0fDA&ixlib=rb-4.1.0&q=85",
        "description": "Large 33-seater bus for big group travel. Comfortable seating for long journeys.",
        "features": ["Air Conditioned", "33 Seater", "Reclining Seats", "Entertainment System", "Restroom"],
        "pricing": {
            "local_8hrs_80km": 12000,
            "extra_km": 50,
            "extra_hr": 700,
            "outstation_km": 48,
            "min_km": 300,
            "driver_bata": 1000
        }
    },
    {
        "id": "bus-45",
        "name": "45 Seater Bus",
        "category": "bus",
        "seats": 45,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1626448167527-33aec453f913?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB0b3VyJTIwYnVzJTIwY29hY2h8ZW58MHx8fHwxNzcyODAzMjg0fDA&ixlib=rb-4.1.0&q=85",
        "description": "Extra-large 45-seater bus for school trips, weddings and large group events.",
        "features": ["Air Conditioned", "45 Seater", "Reclining Seats", "GPS Tracking", "First Aid Kit"],
        "pricing": {
            "local_8hrs_80km": 15000,
            "extra_km": 55,
            "extra_hr": 800,
            "outstation_km": 52,
            "min_km": 300,
            "driver_bata": 1200
        }
    },
    {
        "id": "volvo-coach",
        "name": "Volvo Coach",
        "category": "coach",
        "seats": 45,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1626448167527-33aec453f913?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB0b3VyJTIwYnVzJTIwY29hY2h8ZW58MHx8fHwxNzcyODAzMjg0fDA&ixlib=rb-4.1.0&q=85",
        "description": "Premium Volvo Coach for luxury long-distance travel. Multi-axle with advanced suspension.",
        "features": ["Air Conditioned", "45 Seater", "Volvo Multi-Axle", "Individual Reading Lights", "Charging Points"],
        "pricing": {
            "local_8hrs_80km": 18000,
            "extra_km": 65,
            "extra_hr": 1000,
            "outstation_km": 60,
            "min_km": 300,
            "driver_bata": 1500
        }
    },
    {
        "id": "sleeper-coach",
        "name": "Sleeper Coach",
        "category": "coach",
        "seats": 40,
        "ac": True,
        "image": "https://images.unsplash.com/photo-1626448167527-33aec453f913?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB0b3VyJTIwYnVzJTIwY29hY2h8ZW58MHx8fHwxNzcyODAzMjg0fDA&ixlib=rb-4.1.0&q=85",
        "description": "Sleeper Coach for overnight long-distance travel. Individual berths for a restful journey.",
        "features": ["Air Conditioned", "40 Sleeper Berths", "Individual Curtains", "Blanket & Pillow", "USB Charging"],
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
async def get_distance_from_google(origin: str, destination: str) -> dict:
    """Call Google Maps Distance Matrix API to get distance and duration."""

    # Common Indian route distances (fallback data)
    COMMON_ROUTES = {
        ("bangalore", "mysore"): 150, ("bangalore", "mysuru"): 150,
        ("bangalore", "chennai"): 350, ("bangalore", "hyderabad"): 570,
        ("bangalore", "goa"): 560, ("bangalore", "ooty"): 270,
        ("bangalore", "coorg"): 265, ("bangalore", "pondicherry"): 310,
        ("delhi", "agra"): 230, ("delhi", "jaipur"): 280,
        ("delhi", "chandigarh"): 250, ("delhi", "shimla"): 350,
        ("delhi", "manali"): 540, ("delhi", "haridwar"): 220,
        ("mumbai", "pune"): 150, ("mumbai", "goa"): 590,
        ("mumbai", "nashik"): 170, ("mumbai", "lonavala"): 85,
        ("chennai", "pondicherry"): 150, ("chennai", "madurai"): 460,
        ("hyderabad", "tirupati"): 560, ("kolkata", "darjeeling"): 615,
    }

    def get_fallback_distance(orig, dest):
        o = orig.lower().strip()
        d = dest.lower().strip()
        for (a, b), dist in COMMON_ROUTES.items():
            if (a in o and b in d) or (b in o and a in d):
                return dist
        return 250  # Default fallback

    if not GOOGLE_API_KEY:
        fb = get_fallback_distance(origin, destination)
        logger.warning("No Google API Key configured, using fallback distance")
        return {"distance_km": float(fb), "duration_text": f"~{int(fb/50)} hours (estimated)", "status": "FALLBACK"}

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
                    logger.error(f"Element status: {element.get('status')}")
            else:
                logger.error(f"API status: {data.get('status')}, error: {data.get('error_message', '')}")

        # Fallback for API failure
        fb = get_fallback_distance(origin, destination)
        return {"distance_km": float(fb), "duration_text": f"~{int(fb/50)} hours (estimated)", "status": "FALLBACK"}
    except Exception as e:
        logger.error(f"Google Maps API error: {e}")
        fb = get_fallback_distance(origin, destination)
        return {"distance_km": float(fb), "duration_text": f"~{int(fb/50)} hours (estimated)", "status": "FALLBACK"}


def calculate_outstation_price(distance_km: float, pricing: dict, days: int) -> dict:
    """Calculate outstation (round trip) price."""
    total_distance = distance_km * 2  # Round trip

    if total_distance < pricing["min_km"]:
        total_distance = pricing["min_km"]

    vehicle_cost = total_distance * pricing["outstation_km"]
    driver_cost = pricing["driver_bata"] * days
    total_price = vehicle_cost + driver_cost

    return {
        "distance_km": distance_km,
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
        extra_km = distance_km - 80
        extra_km_cost = extra_km * pricing["extra_km"]

    driver_cost = pricing["driver_bata"]
    total_price = base_price + extra_km_cost + driver_cost

    return {
        "distance_km": distance_km,
        "total_distance_km": distance_km,
        "vehicle_cost": base_price + extra_km_cost,
        "driver_cost": driver_cost,
        "total_price": total_price,
        "breakdown": {
            "base_price_8hrs_80km": base_price,
            "extra_km": round(extra_km, 1),
            "extra_km_rate": pricing["extra_km"],
            "extra_km_cost": extra_km_cost,
            "driver_bata": driver_cost,
            "calculation": f"Base ₹{base_price}" + (f" + {round(extra_km, 1)} extra km x ₹{pricing['extra_km']}/km = ₹{extra_km_cost}" if extra_km > 0 else "") + f" + Driver ₹{driver_cost}"
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
    return {"message": "LuxTravel API is running"}


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
async def get_quotation(req: QuotationRequest):
    # Validate vehicle
    vehicle = await db.vehicles.find_one({"id": req.vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Get distance from Google Maps
    distance_result = await get_distance_from_google(req.from_location, req.to_location)

    if distance_result["status"] not in ["OK", "FALLBACK"]:
        # Use fallback estimation when Google API is unavailable
        logger.warning(f"Google Maps API returned {distance_result['status']}, using fallback")
        distance_result = {"distance_km": 250.0, "duration_text": "~5 hours (estimated)", "status": "FALLBACK"}

    distance_km = distance_result["distance_km"]
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
        "duration_text": distance_result.get("duration_text", ""),
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


# ============ STARTUP & SHUTDOWN ============
@app.on_event("startup")
async def startup():
    # Seed vehicles if collection is empty
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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
