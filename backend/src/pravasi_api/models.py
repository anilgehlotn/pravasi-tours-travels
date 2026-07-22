from typing import Optional

from pydantic import BaseModel


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
