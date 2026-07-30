# matching.py
from sqlalchemy.orm import Session
from datetime import datetime, timezone

def calculate_freshness(last_updated) -> float:
    if last_updated is None:
        return 50  # default if unknown
    minutes_old = (datetime.now(timezone.utc) - last_updated).total_seconds() / 60
    # fresher = higher score; cap at 100, decay over ~2 hours
    freshness = max(0, 100 - (minutes_old / 1.2))
    return round(freshness, 1)

def find_matches(db: Session, request_id: int) -> list:
    """
    STUB — Person B replaces this with real Haversine + scoring logic.
    Must return: list of dicts matching MatchCandidate shape.
    """
    return [
        {"hospital_id": 1, "hospital_name": "City Hospital", "distance_km": 2.3, "score": 0.91, "quantity_available": 3}
    ]