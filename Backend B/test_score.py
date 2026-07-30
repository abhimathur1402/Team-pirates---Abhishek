from algorithm import score_candidate

candidate = {
    "distance": 2,
    "inventory_freshness": 80,
    "capacity_headroom": 90
}

score = score_candidate(candidate)

print(score)