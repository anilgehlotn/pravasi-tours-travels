import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from ..database import db

router = APIRouter()


@router.post("/bookings")
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
