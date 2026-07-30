export type Hospital = {
  id: string;
  name: string;
  score: number;
  distance: number;
  eta: number;
  status: 'Available' | 'Limited' | 'Critical Stock';
  bedsAvailable: number;
  totalBeds: number;
};

const NAMES = [
  "St. Mary's Medical Center",
  "General Hospital Downtown",
  "Riverside University Hospital",
  "Harbor View Medical Center",
  "Eastside Regional Medical Center",
  "Mercy General Hospital",
  "Central Valley Medical Center",
  "Oceanside Trauma Center"
];

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  return Math.abs(hash);
}

export function generateHospitals(resourceType: string, bloodType: string, urgency: string): Hospital[] {
  const seed = hashString(`${resourceType}-${bloodType}-${urgency}`);
  
  const results: Hospital[] = [];
  
  for (let i = 0; i < 5; i++) {
    const pseudoRandom = (seed * (i + 1) * 17) % 100;
    
    // score between 40 and 99
    let score = 99 - (i * 12) - (pseudoRandom % 10);
    if (score < 40) score = 40 + (pseudoRandom % 20);
    
    // distance 1.2 to 25.0
    const distance = 1.2 + (pseudoRandom % 24) + (i * 2.5);
    
    // eta is roughly distance * 3 + some variance
    const eta = Math.round(distance * 3) + (pseudoRandom % 5);
    
    const statuses: ('Available' | 'Limited' | 'Critical Stock')[] = ['Available', 'Limited', 'Critical Stock'];
    let statusIndex = 0;
    if (score < 70) statusIndex = 1;
    if (score < 50) statusIndex = 2;
    
    const totalBeds = 20 + (pseudoRandom % 180);
    const bedsAvailable = Math.floor(totalBeds * (score / 100) * (pseudoRandom % 100 / 100));

    results.push({
      id: `HOSP-${seed}-${i}`,
      name: NAMES[i % NAMES.length],
      score,
      distance: Number(distance.toFixed(1)),
      eta,
      status: statuses[statusIndex],
      bedsAvailable,
      totalBeds
    });
  }
  
  return results.sort((a, b) => b.score - a.score);
}