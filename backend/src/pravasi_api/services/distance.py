import logging
from datetime import datetime, timezone
from typing import Optional, TypedDict

import httpx

from ..config import GOOGLE_API_KEY
from ..data.routes import COMMON_ROUTES
from ..database import db

logger = logging.getLogger(__name__)


class DistanceResult(TypedDict):
    distance_km: float
    duration_text: str
    status: str


def _normalize_location(loc: str) -> str:
    """Normalize a location string for cache key generation."""
    return loc.lower().strip().replace(",", "").replace("  ", " ")


def _make_cache_key(origin: str, destination: str) -> str:
    """Create a consistent cache key (sorted so A->B == B->A)."""
    a = _normalize_location(origin)
    b = _normalize_location(destination)
    return f"{min(a, b)}|{max(a, b)}"


def _get_hardcoded_fallback(origin: str, destination: str) -> Optional[int]:
    """Look up a route in the hardcoded COMMON_ROUTES dictionary."""
    o = origin.lower().strip()
    d = destination.lower().strip()
    for (a, b), dist in COMMON_ROUTES.items():
        if (a in o and b in d) or (b in o and a in d):
            return dist
    return None


async def _fetch_from_google_api(origin: str, destination: str) -> Optional[DistanceResult]:
    """Call Google Maps Distance Matrix API. Returns result dict or None on failure."""
    if not GOOGLE_API_KEY:
        return None

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origin,
        "destinations": destination,
        "key": GOOGLE_API_KEY,
        "units": "metric"
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(url, params=params)
            data = response.json()

            if data.get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                if element.get("status") == "OK":
                    distance_km = element["distance"]["value"] / 1000
                    duration_text = element["duration"]["text"]
                    return {
                        "distance_km": round(distance_km, 1),
                        "duration_text": duration_text,
                        "status": "OK"
                    }
                else:
                    logger.error(f"Google Maps element status: {element.get('status')} for {origin} -> {destination}")
            else:
                logger.error(f"Google Maps API status: {data.get('status')}, error: {data.get('error_message', '')} for {origin} -> {destination}")
    except Exception as e:
        logger.error(f"Google Maps API exception for {origin} -> {destination}: {e}")

    return None


async def get_distance_from_google(origin: str, destination: str) -> DistanceResult:
    """
    Get distance between two locations using a 3-tier strategy:
      1. Check MongoDB cache (distances collection)
      2. Call Google Maps Distance Matrix API (and cache the result)
      3. Fall back to hardcoded COMMON_ROUTES, then 250km default
    """
    cache_key = _make_cache_key(origin, destination)

    # ── Tier 1: Check MongoDB cache ──
    try:
        cached = await db.distances.find_one({"cache_key": cache_key}, {"_id": 0})
        if cached:
            logger.info(f"Distance cache HIT for {origin} -> {destination}: {cached['distance_km']} km")
            return {
                "distance_km": cached["distance_km"],
                "duration_text": cached.get("duration_text", ""),
                "status": "CACHED"
            }
    except Exception as e:
        logger.warning(f"MongoDB cache lookup failed: {e}")

    # ── Tier 2: Google Maps API ──
    google_result = await _fetch_from_google_api(origin, destination)
    if google_result:
        logger.info(f"Google Maps OK for {origin} -> {destination}: {google_result['distance_km']} km, {google_result['duration_text']}")
        # Save to MongoDB cache for future lookups
        try:
            await db.distances.update_one(
                {"cache_key": cache_key},
                {"$set": {
                    "cache_key": cache_key,
                    "origin": origin,
                    "destination": destination,
                    "distance_km": google_result["distance_km"],
                    "duration_text": google_result["duration_text"],
                    "source": "google_maps",
                    "fetched_at": datetime.now(timezone.utc).isoformat()
                }},
                upsert=True
            )
            logger.info(f"Cached distance for {origin} -> {destination} in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to cache distance in MongoDB: {e}")
        return google_result

    # ── Tier 3: Hardcoded fallback ──
    hardcoded = _get_hardcoded_fallback(origin, destination)
    if hardcoded:
        logger.warning(f"Using hardcoded fallback for {origin} -> {destination}: {hardcoded} km")
        return {
            "distance_km": float(hardcoded),
            "duration_text": f"~{int(hardcoded / 50)} hours (estimated)",
            "status": "FALLBACK"
        }

    # ── Last resort: 250km default ──
    logger.warning(f"No distance data available for {origin} -> {destination}, using 250km default")
    return {
        "distance_km": 250.0,
        "duration_text": "~5 hours (estimated)",
        "status": "FALLBACK"
    }
