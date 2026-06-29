from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

from auth import verify_password, create_access_token
from database import get_supabase

router = APIRouter()


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    supabase = get_supabase()
    # Fetch admin from Supabase where username matches
    response = (
        supabase.table("admin")
        .select("*")
        .eq("username", form_data.username)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    admin = response.data[0]

    # Verify password
    if not verify_password(form_data.password, admin["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create and return token
    token = create_access_token({"sub": admin["username"], "id": admin["id"]})
    return {"access_token": token, "token_type": "bearer"}

