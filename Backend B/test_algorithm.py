from algorithm import find_matches
from data import hospitals

request = {

    "lat": 23.250,
    "lng": 77.410,

    "resource": "ICU",
    "quantity": 500,

    "blood_group": "A+"

}

result = find_matches(request, hospitals)

print("Eligible Hospitals:\n")

for hospital in result:
    print(hospital)