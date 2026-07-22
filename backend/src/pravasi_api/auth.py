from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import API_KEY

security = HTTPBearer(auto_error=False)


async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify API key from Authorization header."""
    if credentials and credentials.credentials == API_KEY:
        return credentials.credentials
    raise HTTPException(status_code=401, detail="Invalid or missing API key")


async def verify_api_key_header(x_api_key: str = Header(None)) -> str:
    """Verify API key from X-API-Key header."""
    if x_api_key == API_KEY:
        return x_api_key
    raise HTTPException(status_code=401, detail="Invalid or missing API key")
