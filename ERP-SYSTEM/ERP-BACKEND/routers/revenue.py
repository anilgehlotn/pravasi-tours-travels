from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_revenue():
    return {"message": "revenue router working"}
