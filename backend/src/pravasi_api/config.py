import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from slowapi import Limiter
from slowapi.util import get_remote_address

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BACKEND_DIR / ".env")


def validate_env_vars() -> None:
    """Validate required environment variables at startup, fail fast."""
    required_vars = ["MONGO_URL", "DB_NAME"]
    for var in required_vars:
        if not os.environ.get(var):
            raise RuntimeError(f"Missing required environment variable: {var}")

    # Google Maps API Key is optional but warn if missing
    if not os.environ.get("GOOGLE_API_KEY"):
        logging.warning("GOOGLE_API_KEY not set - distance calculations will use fallback data")

    # API Key for authentication
    if not os.environ.get("API_KEY"):
        raise RuntimeError("Missing required environment variable: API_KEY")


validate_env_vars()

MONGO_URL: str = os.environ["MONGO_URL"]
DB_NAME: str = os.environ["DB_NAME"]
GOOGLE_API_KEY: str = os.environ.get("GOOGLE_API_KEY", "")
API_KEY: str = os.environ["API_KEY"]
CORS_ORIGINS: list[str] = os.environ.get("CORS_ORIGINS", "*").split(",")

limiter = Limiter(key_func=get_remote_address)
