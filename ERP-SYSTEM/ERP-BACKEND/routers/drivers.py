from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from auth import get_current_admin
from database import get_supabase

router = APIRouter()

# --- Pydantic Models ---

class DriverBase(BaseModel):
    name: str = Field(..., description="Full name of the driver")
    phone: str = Field(..., description="Contact phone number")
    license_no: Optional[str] = Field(None, description="Driving license number")
    status: str = Field("available", description="Driver status (e.g., available, on_trip, off_duty)")

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    license_no: Optional[str] = None
    status: Optional[str] = None

class DriverOut(DriverBase):
    id: str
    
    class Config:
        from_attributes = True

# --- Seed Data ---

DRIVERS_SEED_DATA = [
    {"name": "Ramesh Kumar", "phone": "+91 98765 11122", "license_no": "DL-RJ-1111", "status": "available"},
    {"name": "Suresh Nair", "phone": "+91 98765 22233", "license_no": "DL-KL-2222", "status": "available"},
    {"name": "Ajay Singh", "phone": "+91 98765 33344", "license_no": "DL-HR-3333", "status": "available"},
    {"name": "Pradeep Rao", "phone": "+91 98765 44455", "license_no": "DL-KA-4444", "status": "available"},
    {"name": "Manoj Verma", "phone": "+91 98765 55566", "license_no": "DL-MH-5555", "status": "available"},
]


# --- Endpoints ---

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_drivers(admin: dict = Depends(get_current_admin)):
    """Seed drivers data into the database if the table is empty or missing these drivers."""
    supabase = get_supabase()
    
    # Get existing drivers to avoid duplicates
    response = supabase.table("drivers").select("name").execute()
    existing_names = {d["name"] for d in response.data}
    
    inserted = []
    for driver_data in DRIVERS_SEED_DATA:
        if driver_data["name"] not in existing_names:
            res = supabase.table("drivers").insert(driver_data).execute()
            if res.data:
                inserted.append(res.data[0])
                
    return {"message": "Seed completed", "inserted": len(inserted), "drivers": inserted}


@router.get("/", response_model=List[DriverOut])
def get_all_drivers():
    """Fetch all drivers."""
    supabase = get_supabase()
    response = supabase.table("drivers").select("*").execute()
    return response.data


@router.get("/{id}", response_model=DriverOut)
def get_driver(id: str):
    """Fetch a single driver by id."""
    supabase = get_supabase()
    response = supabase.table("drivers").select("*").eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return response.data[0]


@router.post("/", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(driver: DriverCreate, admin: dict = Depends(get_current_admin)):
    """Create a new driver."""
    supabase = get_supabase()
    
    # Check if a driver with the same phone already exists
    existing = supabase.table("drivers").select("id").eq("phone", driver.phone).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Driver with this phone number already exists")
    
    response = supabase.table("drivers").insert(driver.model_dump()).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create driver")
        
    return response.data[0]


@router.put("/{id}", response_model=DriverOut)
def update_driver(id: str, driver_update: DriverUpdate, admin: dict = Depends(get_current_admin)):
    """Update a driver by id."""
    supabase = get_supabase()
    
    update_data = driver_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    response = supabase.table("drivers").update(update_data).eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Driver not found or update failed")
        
    return response.data[0]


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(id: str, admin: dict = Depends(get_current_admin)):
    """Delete a driver by id."""
    supabase = get_supabase()
    response = supabase.table("drivers").delete().eq("id", id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Driver not found or already deleted")
    
    return None
