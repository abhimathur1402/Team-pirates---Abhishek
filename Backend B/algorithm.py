from math import radians, sin, cos, sqrt, atan2

# ------------------------------------------
# Blood Compatibility Dictionary
# ------------------------------------------

COMPATIBILITY = {

    "O-": ["O-"],

    "O+": ["O-", "O+"],

    "A-": ["O-", "A-"],

    "A+": ["O-", "O+", "A-", "A+"],

    "B-": ["O-", "B-"],

    "B+": ["O-", "O+", "B-", "B+"],

    "AB-": ["O-", "A-", "B-", "AB-"],

    "AB+": [
        "O-", "O+",
        "A-", "A+",
        "B-", "B+",
        "AB-", "AB+"
    ]

}

# ------------------------------------------
# Haversine Function
# ------------------------------------------

def haversine(lat1, lng1, lat2, lng2):

    R = 6371

    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)

    a = (
        sin(dlat / 2) ** 2
        +
        cos(radians(lat1))
        *
        cos(radians(lat2))
        *
        sin(dlng / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c

def score_candidate(candidate, request):

    # Avoid division by zero
    distance_score = 1 / max(candidate["distance"], 0.1)

    # Number of available units (ICU or Ventilator)
    availability_score = min(candidate["available_quantity"] / 10, 1)

    # Urgency weight
    urgency_weights = {
        "critical": 1.0,
        "high": 0.8,
        "medium": 0.5
    }

    urgency_score = urgency_weights.get(
        request["urgency"],
        0.5
    )

    score = (
        0.5 * distance_score +
        0.3 * availability_score +
        0.2 * urgency_score
    )

    return score


# ------------------------------------------
# Hospital Matching Function
# ------------------------------------------

def find_matches(request, hospitals):

    resource = request["resource"]
    quantity = request["quantity"]

    required_blood = request.get("blood_group")

    matches = []

    for hospital in hospitals:

        # Check if hospital has enough resources
        if hospital[resource] < quantity:
            continue

        # Blood compatibility check (optional)
        if required_blood:

            compatible = COMPATIBILITY[required_blood]
            available = hospital["blood"]

            blood_found = False

            for blood in compatible:
                if blood in available:
                    blood_found = True
                    break

            if not blood_found:
                continue

        # Calculate distance
        distance = haversine(
            request["lat"],
            request["lng"],
            hospital["lat"],
            hospital["lng"]
        )

        # Create a copy of the hospital
        candidate = hospital.copy()

        candidate["distance"] = round(distance, 2)

        candidate["available_quantity"] = hospital[resource]

        candidate["score"] = score_candidate(candidate, request)

        matches.append(candidate)

    # Sort hospitals by highest score
    matches.sort(
        key=lambda hospital: hospital["score"],
        reverse=True
    )

    return matches