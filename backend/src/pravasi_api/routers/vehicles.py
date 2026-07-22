from fastapi import APIRouter, HTTPException

from ..database import db

router = APIRouter()


@router.get("/vehicles")
async def get_vehicles():
    vehicles = await db.vehicles.find({}, {"_id": 0}).to_list(100)
    return vehicles


@router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle
