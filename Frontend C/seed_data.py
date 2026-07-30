import json
import random
from faker import Faker

fake = Faker('en_IN')  # gives Indian-style names, use Faker() for generic

# Pick a rough center point for your city and a small radius around it
CENTER_LAT, CENTER_LNG = 23.2599, 77.4126  # Bhopal, change if you want
SPREAD = 0.05  # ~5km wobble

RESOURCE_TYPES = ["ICU", "GENERAL_BED", "BLOOD_A+", "BLOOD_O-", "BLOOD_O+"]

hospitals = []
for i in range(18):
    hospitals.append({
        "name": fake.company() + " Hospital",
        "lat": CENTER_LAT + random.uniform(-SPREAD, SPREAD),
        "lng": CENTER_LNG + random.uniform(-SPREAD, SPREAD),
        "resource_type": random.choice(RESOURCE_TYPES),
        "quantity": random.randint(1, 20)
    })

with open('seed_hospitals.json', 'w') as f:
    json.dump(hospitals, f, indent=2)

print(f"Generated {len(hospitals)} fake hospitals into seed_hospitals.json")
