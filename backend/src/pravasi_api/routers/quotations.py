import logging
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, Request

from ..config import limiter
from ..database import db
from ..models import QuotationRequest
from ..services.distance import get_distance_from_google
from ..services.pricing import calculate_local_price, calculate_outstation_price

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/getQuotation")
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
            distance_result = {
                "distance_km": 250.0,
                "duration_text": "~5 hours (estimated)",
                "status": "FALLBACK",
            }
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
        "created_at": datetime.now(UTC).isoformat()
    }

    # Save to MongoDB
    await db.quotations.insert_one(quotation)
    # Remove _id added by MongoDB
    quotation.pop("_id", None)

    return quotation


@router.get("/quotations/{quote_id}")
async def get_quotation_by_id(quote_id: str):
    quotation = await db.quotations.find_one({"id": quote_id}, {"_id": 0})
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation
