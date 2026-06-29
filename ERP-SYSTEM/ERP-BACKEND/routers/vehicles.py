from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_vehicles():
    return {"message": "vehicles router working"}
