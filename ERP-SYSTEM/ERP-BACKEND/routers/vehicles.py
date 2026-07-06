from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth import get_current_admin
from database import get_supabase

router = APIRouter()

# --- Pydantic Models ---

class VehicleBase(BaseModel):
    name: str = Field(..., description="Name of the vehicle")
    seats: int = Field(..., description="Number of seats")
    ac: bool = Field(..., description="Whether it has AC")
    rate_per_km: float = Field(..., description="Rate per km")
    rate_local_8hr: float = Field(..., description="Flat rate for local 8 hours")

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    seats: Optional[int] = None
    ac: Optional[bool] = None
    rate_per_km: Optional[float] = None
    rate_local_8hr: Optional[float] = None

class VehicleOut(VehicleBase):
    id: str
    
    class Config:
        from_attributes = True

# --- Seed Data ---

VEHICLES_SEED_DATA = [
    {"name": "Sedan", "seats": 4, "ac": True, "rate_per_km": 14, "rate_local_8hr": 2200},
    {"name": "Innova", "seats": 7, "ac": True, "rate_per_km": 18, "rate_local_8hr": 2800},
    {"name": "Innova Crysta", "seats": 7, "ac": True, "rate_per_km": 22, "rate_local_8hr": 3200},
    {"name": "Innova Hybrid", "seats": 7, "ac": True, "rate_per_km": 24, "rate_local_8hr": 3400},
    {"name": "Toyota Fortuner", "seats": 7, "ac": True, "rate_per_km": 30, "rate_local_8hr": 4200},
    {"name": "Tempo Traveller Non AC", "seats": 12, "ac": False, "rate_per_km": 20, "rate_local_8hr": 3000},
    {"name": "Tempo Traveller AC", "seats": 12, "ac": True, "rate_per_km": 25, "rate_local_8hr": 3600},
    {"name": "TT 9 Seater Luxury", "seats": 9, "ac": True, "rate_per_km": 32, "rate_local_8hr": 4400},
    {"name": "Urbania 16+1", "seats": 17, "ac": True, "rate_per_km": 38, "rate_local_8hr": 5200},
    {"name": "21 Seater Bus", "seats": 21, "ac": True, "rate_per_km": 40, "rate_local_8hr": 5600},
    {"name": "25 Seater Bus", "seats": 25, "ac": True, "rate_per_km": 42, "rate_local_8hr": 6000},
    {"name": "33 Seater Bus", "seats": 33, "ac": True, "rate_per_km": 48, "rate_local_8hr": 6800},
    {"name": "45 Seater Bus", "seats": 45, "ac": True, "rate_per_km": 52, "rate_local_8hr": 7400},
    {"name": "Volvo Coach", "seats": 45, "ac": True, "rate_per_km": 60, "rate_local_8hr": 8400},
    {"name": "Sleeper Coach", "seats": 32, "ac": True, "rate_per_km": 65, "rate_local_8hr": 9000},
]


# --- Endpoints ---

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_vehicles(admin: dict = Depends(get_current_admin)):
    """Seed vehicles data into the database if the table is empty or missing these vehicles."""
    supabase = get_supabase()
    
    # Get existing vehicles to avoid duplicates
    response = supabase.table("vehicles").select("name").execute()
    existing_names = {v["name"] for v in response.data}
    
    inserted = []
    for vehicle_data in VEHICLES_SEED_DATA:
        if vehicle_data["name"] not in existing_names:
            res = supabase.table("vehicles").insert(vehicle_data).execute()
            if res.data:
                inserted.append(res.data[0])
                
    return {"message": "Seed completed", "inserted": len(inserted), "vehicles": inserted}


@router.get("/", response_model=List[VehicleOut])
def get_all_vehicles():
    """Fetch all vehicles."""
    supabase = get_supabase()
    response = supabase.table("vehicles").select("*").execute()
    return response.data


@router.get("/{id}", response_model=VehicleOut)
def get_vehicle(id: str):
    """Fetch a single vehicle by id."""
    supabase = get_supabase()
    response = supabase.table("vehicles").select("*").eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return response.data[0]


@router.post("/", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(vehicle: VehicleCreate, admin: dict = Depends(get_current_admin)):
    """Create a new vehicle."""
    supabase = get_supabase()
    
    # Check if a vehicle with the same name exists
    existing = supabase.table("vehicles").select("id").eq("name", vehicle.name).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Vehicle with this name already exists")
    
    response = supabase.table("vehicles").insert(vehicle.model_dump()).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create vehicle")
        
    return response.data[0]


@router.put("/{id}", response_model=VehicleOut)
def update_vehicle(id: str, vehicle_update: VehicleUpdate, admin: dict = Depends(get_current_admin)):
    """Update a vehicle by id."""
    supabase = get_supabase()
    
    update_data = vehicle_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    response = supabase.table("vehicles").update(update_data).eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Vehicle not found or update failed")
        
    return response.data[0]


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(id: str, admin: dict = Depends(get_current_admin)):
    """Delete a vehicle by id."""
    supabase = get_supabase()
    response = supabase.table("vehicles").delete().eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Vehicle not found or already deleted")
    
    return None
