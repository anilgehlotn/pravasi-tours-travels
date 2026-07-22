import uuid
from datetime import datetime, timezone

from fastapi import APIRouter

from ..database import db
from ..models import CallbackRequest

router = APIRouter()


@router.post("/callback")
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
