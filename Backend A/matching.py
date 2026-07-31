# matching.py
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2
import models

# ------------------------------------------
# Freshness helper (used later if needed)
# ------------------------------------------
def calculate_freshness(last_updated) -> float:
    if last_updated is None:
        return 50
    minutes_old = (datetime.now(timezone.utc) - last_updated).total_seconds() / 60
    freshness = max(0, 100 - (minutes_old / 1.2))
    return round(freshness, 1)

# ------------------------------------------
# Person B's algorithm (unchanged logic)
# ------------------------------------------
COMPATIBILITY = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
}

def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def score_candidate(candidate, request):
    distance_score = 1 / max(candidate["distance"], 0.1)
    availability_score = min(candidate["available_quantity"] / 10, 1)
    urgency_weights = {"critical": 1.0, "high": 0.8, "medium": 0.5}
    urgency_score = urgency_weights.get(request["urgency"], 0.5)
    return 0.5 * distance_score + 0.3 * availability_score + 0.2 * urgency_score

def person_b_find_matches(request, hospitals):
    resource = request["resource"]
    quantity = request["quantity"]
    required_blood = request.get("blood_group")
    matches = []
    for hospital in hospitals:
        if hospital.get(resource, 0) < quantity:
            continue
        if required_blood:
            compatible = COMPATIBILITY.get(required_blood, [])
            available = hospital.get("blood", [])
            if not any(b in available for b in compatible):
                continue
        distance = haversine(request["lat"], request["lng"], hospital["lat"], hospital["lng"])
        candidate = hospital.copy()
        candidate["distance"] = round(distance, 2)
        candidate["available_quantity"] = hospital[resource]
        candidate["score"] = score_candidate(candidate, request)
        matches.append(candidate)
    matches.sort(key=lambda h: h["score"], reverse=True)
    return matches

# ------------------------------------------
# ADAPTER - bridges your database to Person B's algorithm
# main.py calls this exact function, unchanged: find_matches(db, request_id)
# ------------------------------------------
def find_matches(db: Session, request_id: int) -> list:
    req = db.query(models.PatientRequest).filter(models.PatientRequest.id == request_id).first()
    if not req:
        return []

    request_dict = {
        "lat": req.lat,
        "lng": req.lng,
        "resource": req.resource_type,
        "quantity": req.quantity or 1,
        "blood_group": req.blood_group,
        "urgency": req.urgency
    }

    all_hospitals = db.query(models.Hospital).all()
    hospitals_list = []

    for h in all_hospitals:
        inventories = db.query(models.Inventory).filter(models.Inventory.hospital_id == h.id).all()

        hospital_dict = {
            "hospital_id": h.id,
            "name": h.name,
            "lat": h.lat,
            "lng": h.lng,
            "blood": []
        }

        for inv in inventories:
            if inv.resource_type.startswith("BLOOD_"):
                blood_type = inv.resource_type.replace("BLOOD_", "")
                if inv.quantity > 0:
                    hospital_dict["blood"].append(blood_type)
            else:
                hospital_dict[inv.resource_type] = inv.quantity

        hospitals_list.append(hospital_dict)

    raw_matches = person_b_find_matches(request_dict, hospitals_list)

    candidates = []
    for m in raw_matches:
        candidates.append({
            "hospital_id": m["hospital_id"],
            "hospital_name": m["name"],
            "distance_km": m["distance"],
            "score": m["score"],
            "quantity_available": m["available_quantity"]
        })

    return candidates