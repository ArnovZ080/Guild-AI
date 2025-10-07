from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
import os
import httpx

router = APIRouter(prefix="/api", tags=["geocode"])


@router.get("/geocode")
async def geocode(q: str = Query(..., min_length=2)) -> Dict[str, Any]:
    """
    Lightweight geocoding endpoint.
    - If GOOGLE_MAPS_API_KEY is set, uses Google Maps Geocoding API (textsearch).
    - Otherwise returns mock suggestions for common cities and addresses.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    q_lower = q.lower()

    if api_key:
        try:
            # Use Places Text Search for broader suggestions
            url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            params = {"query": q, "key": api_key}
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                suggestions: List[Dict[str, Any]] = []
                for r in data.get("results", [])[:8]:
                    suggestions.append({
                        "description": r.get("name"),
                        "formatted_address": r.get("formatted_address"),
                        "lat": r.get("geometry", {}).get("location", {}).get("lat"),
                        "lng": r.get("geometry", {}).get("location", {}).get("lng"),
                    })
                return {"suggestions": suggestions}
        except Exception as e:
            # Fall through to mock if Google fails
            print(f"Geocode error: {e}")

    # Mock suggestions
    mock_db: Dict[str, List[str]] = {
        "cape town": [
            "1 Adderley St, Cape Town City Centre, Cape Town, 8000",
            "12 Kloof St, Gardens, Cape Town, 8001",
            "101 Main Rd, Sea Point, Cape Town, 8005",
        ],
        "johannesburg": [
            "24 Maude St, Sandton, Johannesburg, 2196",
            "155 West St, Sandown, Johannesburg, 2031",
        ],
        "london": [
            "10 Downing St, Westminster, London SW1A 2AA",
            "221B Baker St, London NW1 6XE",
        ],
        "new york": [
            "350 5th Ave, New York, NY 10118",
            "405 Lexington Ave, New York, NY 10174",
        ],
    }
    suggestions: List[Dict[str, Any]] = []
    for city, addrs in mock_db.items():
        if city.startswith(q_lower) or q_lower in city:
            for a in addrs:
                suggestions.append({"formatted_address": a})
    # generic partial matches
    if not suggestions:
        for addrs in mock_db.values():
            for a in addrs:
                if q_lower in a.lower():
                    suggestions.append({"formatted_address": a})

    return {"suggestions": suggestions[:8]}


