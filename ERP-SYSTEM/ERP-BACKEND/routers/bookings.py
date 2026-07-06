from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from postgrest.exceptions import APIError

from auth import get_current_admin
from database import get_supabase

router = APIRouter()


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    booking_ref: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    whatsapp_number: Optional[str] = None
    trip_type: str
    from_city: str
    to_city: Optional[str] = None
    travel_date: str
    return_date: Optional[str] = None
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    estimated_km: float = 0
    toll: float = 0
    parking: float = 0
    base_fare: float = 0
    gst_amount: float = 0
    total_amount: float = 0
    driver_batta: Optional[float] = None
    advance_amount: Optional[float] = None
    permit_charges: Optional[float] = None
    extra_hours: Optional[float] = None
    extra_hours_rate: Optional[float] = None
    extra_kms: Optional[float] = None
    extra_kms_rate: Optional[float] = None
    basic_slab: Optional[str] = None
    slab_rate: Optional[float] = None
    toll_breakdown: Optional[list] = None
    status: str = "ongoing"
    payment_status: Optional[str] = "pending"


class BookingUpdate(BaseModel):
    booking_ref: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    whatsapp_number: Optional[str] = None
    trip_type: Optional[str] = None
    from_city: Optional[str] = None
    to_city: Optional[str] = None
    travel_date: Optional[str] = None
    return_date: Optional[str] = None
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    estimated_km: Optional[float] = None
    toll: Optional[float] = None
    parking: Optional[float] = None
    base_fare: Optional[float] = None
    gst_amount: Optional[float] = None
    total_amount: Optional[float] = None
    driver_batta: Optional[float] = None
    advance_amount: Optional[float] = None
    permit_charges: Optional[float] = None
    extra_hours: Optional[float] = None
    extra_hours_rate: Optional[float] = None
    extra_kms: Optional[float] = None
    extra_kms_rate: Optional[float] = None
    basic_slab: Optional[str] = None
    slab_rate: Optional[float] = None
    toll_breakdown: Optional[list] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None


# ─── Helpers ─────────────────────────────────────────────────────────────────

def generate_booking_ref(supabase) -> str:
    """Auto-generate booking_ref as BK1001, BK1002, etc."""
    response = (
        supabase.table("bookings")
        .select("booking_ref")
        .like("booking_ref", "BK%")
        .order("booking_ref", desc=True)
        .limit(1)
        .execute()
    )
    if response.data and response.data[0].get("booking_ref"):
        last_ref = response.data[0]["booking_ref"]
        try:
            last_num = int(last_ref.replace("BK", ""))
            return f"BK{last_num + 1}"
        except ValueError:
            pass
    return "BK1001"


def enrich_booking(booking: dict, vehicles: dict) -> dict:
    """Fallback: if vehicle_name not stored, look it up from vehicles map."""
    vid = booking.get("vehicle_id")
    if not booking.get("vehicle_name") and vid:
        booking["vehicle_name"] = vehicles.get(vid, "—")
    elif not booking.get("vehicle_name"):
        booking["vehicle_name"] = "—"
    if "payment_status" not in booking:
        booking["payment_status"] = "pending"
    return booking


def get_vehicle_map(supabase):
    """Build id→name map for vehicles."""
    v_res = supabase.table("vehicles").select("id, name").execute()
    return {v["id"]: v["name"] for v in v_res.data}


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/")
def get_all_bookings():
    """Fetch all bookings ordered newest first."""
    supabase = get_supabase()
    response = supabase.table("bookings").select("*").order("created_at", desc=True).execute()
    vehicles = get_vehicle_map(supabase)
    return [enrich_booking(b, vehicles) for b in response.data]


@router.get("/{id}")
def get_booking(id: str):
    """Fetch a single booking by id."""
    supabase = get_supabase()
    response = supabase.table("bookings").select("*").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    vehicles = get_vehicle_map(supabase)
    return enrich_booking(response.data[0], vehicles)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_booking(booking: BookingCreate, admin: dict = Depends(get_current_admin)):
    """Create a new booking with all fields saved directly to Supabase."""
    supabase = get_supabase()

    # Dump model, skip None values (cleaner insert)
    data = {k: v for k, v in booking.model_dump().items() if v is not None}

    # Auto-generate booking_ref if not supplied
    if not data.get("booking_ref"):
        data["booking_ref"] = generate_booking_ref(supabase)

    # Numeric fields stored as INTEGER in DB — coerce floats to int
    INT_COLS = [
        "estimated_km", "toll", "parking", "base_fare", "gst_amount",
        "total_amount", "advance_amount", "driver_batta", "permit_charges",
        "extra_hours", "extra_hours_rate", "extra_kms", "extra_kms_rate", "slab_rate",
    ]
    for col in INT_COLS:
        if col in data and data[col] is not None:
            data[col] = int(data[col])

    try:
        response = supabase.table("bookings").insert(data).execute()
    except APIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not response.data:
        raise HTTPException(status_code=500, detail="Insert returned no data")

    vehicles = get_vehicle_map(supabase)
    return enrich_booking(response.data[0], vehicles)


@router.put("/{id}")
def update_booking(id: str, booking_update: BookingUpdate, admin: dict = Depends(get_current_admin)):
    """Update a booking by id."""
    supabase = get_supabase()

    update_data = booking_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    try:
        response = supabase.table("bookings").update(update_data).eq("id", id).execute()
    except APIError as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found or update failed")

    vehicles = get_vehicle_map(supabase)
    return enrich_booking(response.data[0], vehicles)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(id: str, admin: dict = Depends(get_current_admin)):
    """Delete a booking by id."""
    supabase = get_supabase()
    response = supabase.table("bookings").delete().eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found or already deleted")
    return None
