from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth import get_current_admin
from database import get_supabase

router = APIRouter()

# --- Pydantic Models ---

class BookingCreate(BaseModel):
    booking_ref: Optional[str] = None
    customer_name: str
    customer_phone: str
    whatsapp_number: Optional[str] = None
    trip_type: str
    from_city: str
    to_city: Optional[str] = None
    travel_date: str
    return_date: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    estimated_km: float = 0
    toll: float = 0
    parking: float = 0
    fuel: float = 0
    base_fare: float = 0
    gst_amount: float = 0
    total_amount: float = 0
    status: str = "ongoing"
    payment_status: Optional[str] = "pending"

class BookingUpdate(BaseModel):
    booking_ref: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    trip_type: Optional[str] = None
    from_city: Optional[str] = None
    to_city: Optional[str] = None
    travel_date: Optional[str] = None
    return_date: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    estimated_km: Optional[float] = None
    toll: Optional[float] = None
    parking: Optional[float] = None
    fuel: Optional[float] = None
    base_fare: Optional[float] = None
    gst_amount: Optional[float] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None


from postgrest.exceptions import APIError

# --- Helpers ---

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


def enrich_booking(booking: dict, vehicles: dict, drivers: dict) -> dict:
    """Attach vehicle_name and driver_name to a booking dict."""
    vid = booking.get("vehicle_id")
    did = booking.get("driver_id")
    booking["vehicle_name"] = vehicles.get(vid, "—") if vid else "—"
    booking["driver_name"] = drivers.get(did, "—") if did else "—"
    if "payment_status" not in booking:
        booking["payment_status"] = "pending"
    return booking


def get_lookup_maps(supabase):
    """Build id→name maps for vehicles and drivers."""
    v_res = supabase.table("vehicles").select("id, name").execute()
    d_res = supabase.table("drivers").select("id, name").execute()
    vehicles = {v["id"]: v["name"] for v in v_res.data}
    drivers = {d["id"]: d["name"] for d in d_res.data}
    return vehicles, drivers


# --- Endpoints ---

@router.get("/")
def get_all_bookings():
    """Fetch all bookings, joined with vehicle and driver names."""
    supabase = get_supabase()
    response = supabase.table("bookings").select("*").order("created_at", desc=True).execute()
    
    vehicles, drivers = get_lookup_maps(supabase)
    return [enrich_booking(b, vehicles, drivers) for b in response.data]


@router.get("/{id}")
def get_booking(id: str):
    """Fetch a single booking by id, with vehicle and driver names."""
    supabase = get_supabase()
    response = supabase.table("bookings").select("*").eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    vehicles, drivers = get_lookup_maps(supabase)
    return enrich_booking(response.data[0], vehicles, drivers)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_booking(booking: BookingCreate, admin: dict = Depends(get_current_admin)):
    """Create a new booking. Auto-generates booking_ref if not provided."""
    supabase = get_supabase()
    
    data = booking.model_dump()
    
    # Auto-generate booking_ref if not provided
    if not data.get("booking_ref"):
        data["booking_ref"] = generate_booking_ref(supabase)
    
    # Convert numeric fields to int (Supabase columns are integer)
    data["estimated_km"] = int(data.get("estimated_km") or 0)
    data["toll"] = int(data.get("toll") or 0)
    data["parking"] = int(data.get("parking") or 0)
    data["fuel"] = int(data.get("fuel") or 0)
    data["base_fare"] = int(data.get("base_fare") or 0)
    data["gst_amount"] = int(data.get("gst_amount") or 0)
    data["total_amount"] = int(data.get("total_amount") or 0)
    
    try:
        response = supabase.table("bookings").insert(data).execute()
    except APIError as e:
        # Fallback if payment_status column does not exist in Supabase table
        if "payment_status" in str(e):
            data.pop("payment_status", None)
            response = supabase.table("bookings").insert(data).execute()
        else:
            raise HTTPException(status_code=500, detail=str(e))
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create booking")
    
    vehicles, drivers = get_lookup_maps(supabase)
    return enrich_booking(response.data[0], vehicles, drivers)


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
        # Fallback if payment_status column does not exist in Supabase table
        if "payment_status" in str(e) and "payment_status" in update_data:
            update_data.pop("payment_status", None)
            if not update_data:
                # If payment_status was the only update, return the booking as is
                return get_booking(id)
            response = supabase.table("bookings").update(update_data).eq("id", id).execute()
        else:
            raise HTTPException(status_code=500, detail=str(e))
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found or update failed")
    
    vehicles, drivers = get_lookup_maps(supabase)
    return enrich_booking(response.data[0], vehicles, drivers)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(id: str, admin: dict = Depends(get_current_admin)):
    """Delete a booking by id."""
    supabase = get_supabase()
    response = supabase.table("bookings").delete().eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found or already deleted")
    
    return None
