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


def score_candidate(candidate):

    distance_score = 1 / candidate["distance"]

    inventory_score = candidate["inventory_freshness"] / 100

    capacity_score = candidate["capacity_headroom"] / 100

    score = (

        0.6 * distance_score

        + 0.2 * inventory_score

        + 0.2 * capacity_score

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

        hospital["distance"] = round(distance, 2)

        hospital["score"] = score_candidate(hospital)

        matches.append(hospital)

    # Sort hospitals by nearest distance
    matches.sort(
    key=lambda hospital: hospital["score"],
    reverse=True
)
    return matches