
from pydantic import BaseModel


class QuotationRequest(BaseModel):
    vehicle_id: str
    from_location: str
    to_location: str
    travel_date: str
    return_date: str | None = None
    travelers: int = 1
    trip_type: str = "outstation"
    distance_km: float | None = None
    duration_text: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None


class CallbackRequest(BaseModel):
    name: str
    phone: str
    email: str | None = None
    message: str | None = None
    vehicle_id: str | None = None
