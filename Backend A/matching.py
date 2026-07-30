# matching.py  (Person B owns this file's internals — you just call find_matches())
from sqlalchemy.orm import Session

def find_matches(db: Session, request_id: int) -> list:
    """
    STUB — Person B replaces this with real Haversine + scoring logic.
    Must return: list of dicts matching MatchCandidate shape.
    """
    return [
        {"hospital_id": 1, "hospital_name": "City Hospital", "distance_km": 2.3, "score": 0.91, "quantity_available": 3}
    ]