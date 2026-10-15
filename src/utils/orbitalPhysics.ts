export interface KeplerianElements {
  id: string;
  name: string;
  semiMajorAxisAU: number;      // AU
  eccentricity: number;          // e
  inclinationDeg: number;       // i (deg)
  longitudeOfPerihelionDeg: number; // varpi (deg)
  orbitalPeriodDays: number;    // Period in Earth days
  meanAnomalyEpochDeg: number;  // M0 at epoch
}

// Real-world astronomical orbital elements for solar system major planets & dwarf planets
export const KEPLERIAN_DATA: Record<string, KeplerianElements> = {
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    semiMajorAxisAU: 0.387098,
    eccentricity: 0.205630,
    inclinationDeg: 7.005,
    longitudeOfPerihelionDeg: 77.456,
    orbitalPeriodDays: 87.969,
    meanAnomalyEpochDeg: 174.794,
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    semiMajorAxisAU: 0.723332,
    eccentricity: 0.006772,
    inclinationDeg: 3.3947,
    longitudeOfPerihelionDeg: 131.563,
    orbitalPeriodDays: 224.701,
    meanAnomalyEpochDeg: 50.115,
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    semiMajorAxisAU: 1.000000,
    eccentricity: 0.0167086,
    inclinationDeg: 0.00005,
    longitudeOfPerihelionDeg: 102.947,
    orbitalPeriodDays: 365.256,
    meanAnomalyEpochDeg: 358.617,
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    semiMajorAxisAU: 1.523679,
    eccentricity: 0.093405,
    inclinationDeg: 1.850,
    longitudeOfPerihelionDeg: 336.040,
    orbitalPeriodDays: 686.980,
    meanAnomalyEpochDeg: 19.373,
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    semiMajorAxisAU: 5.2044,
    eccentricity: 0.048498,
    inclinationDeg: 1.303,
    longitudeOfPerihelionDeg: 14.728,
    orbitalPeriodDays: 4332.59,
    meanAnomalyEpochDeg: 20.020,
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    semiMajorAxisAU: 9.5826,
    eccentricity: 0.05555,
    inclinationDeg: 2.485,
    longitudeOfPerihelionDeg: 92.432,
    orbitalPeriodDays: 10759.22,
    meanAnomalyEpochDeg: 317.020,
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    semiMajorAxisAU: 19.2184,
    eccentricity: 0.046381,
    inclinationDeg: 0.773,
    longitudeOfPerihelionDeg: 170.964,
    orbitalPeriodDays: 30688.5,
    meanAnomalyEpochDeg: 142.238,
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    semiMajorAxisAU: 30.1104,
    eccentricity: 0.009456,
    inclinationDeg: 1.767,
    longitudeOfPerihelionDeg: 44.971,
    orbitalPeriodDays: 60182.0,
    meanAnomalyEpochDeg: 256.228,
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    semiMajorAxisAU: 39.482,
    eccentricity: 0.2488,
    inclinationDeg: 17.16,
    longitudeOfPerihelionDeg: 224.066,
    orbitalPeriodDays: 90560.0,
    meanAnomalyEpochDeg: 14.882,
  },
};

/**
 * Solve Kepler's Equation M = E - e*sin(E) for Eccentric Anomaly E using high-speed Newton-Raphson iteration.
 */
export function solveKepler(M: number, e: number): number {
  // Normalize M into [-PI, PI]
  let m = M % (Math.PI * 2);
  if (m > Math.PI) m -= Math.PI * 2;
  if (m < -Math.PI) m += Math.PI * 2;

  // Initial estimate
  let E = e > 0.8 ? Math.PI : m;
  for (let iter = 0; iter < 12; iter++) {
    const f = E - e * Math.sin(E) - m;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-8) break;
  }
  return E;
}

/**
 * Calculate physical Keplerian coordinates for a planet at a given simulation time.
 * Scales the semi-major axis proportionally with the visual distance mapping while preserving true eccentricity and angular momentum.
 */
export function getKeplerianOrbitalState(
  planetId: string,
  time: number,
  baseDistance: number,
  baseSpeed: number
): { x: number; y: number; r: number; trueAnomaly: number; speedMultiplier: number; perihelionX: number; perihelionY: number; aphelionX: number; aphelionY: number; a: number; b: number; focalOffset: number; perihelionDist: number; aphelionDist: number; varpi: number } {
  const data = KEPLERIAN_DATA[planetId];
  if (!data) {
    const angle = time * baseSpeed;
    return {
      x: Math.cos(angle) * baseDistance,
      y: Math.sin(angle) * baseDistance,
      r: baseDistance,
      trueAnomaly: angle,
      speedMultiplier: 1,
      perihelionX: baseDistance,
      perihelionY: 0,
      aphelionX: -baseDistance,
      aphelionY: 0,
      a: baseDistance,
      b: baseDistance,
      focalOffset: 0,
      perihelionDist: baseDistance,
      aphelionDist: baseDistance,
      varpi: 0
    };
  }

  const e = data.eccentricity;
  const varpi = (data.longitudeOfPerihelionDeg * Math.PI) / 180;
  
  // Semi-major axis mapped to viewport scale
  const a = baseDistance;
  const b = a * Math.sqrt(1 - e * e);
  const focalOffset = a * e;

  // Mean motion rate based on base speed
  const n = baseSpeed;
  const M = (data.meanAnomalyEpochDeg * Math.PI) / 180 + time * n;

  // Solve Kepler's Equation
  const E = solveKepler(M, e);

  // True Anomaly nu
  const sinNu = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);

  // Radius from Sun focus
  const r = a * (1 - e * Math.cos(E));

  // Orbital position with orientation of perihelion varpi
  const theta = nu + varpi;
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);

  // Kepler's 2nd Law: instantaneous orbital speed varies inversely with distance (v ~ sqrt(2/r - 1/a))
  const speedFactor = Math.sqrt(Math.max(0.01, (2 * a) / r - 1));

  // Perihelion and Aphelion positions
  const periDist = a * (1 - e);
  const aphDist = a * (1 + e);
  const periX = periDist * Math.cos(varpi);
  const periY = periDist * Math.sin(varpi);
  const aphX = aphDist * Math.cos(varpi + Math.PI);
  const aphY = aphDist * Math.sin(varpi + Math.PI);

  return {
    x,
    y,
    r,
    trueAnomaly: nu,
    speedMultiplier: speedFactor,
    perihelionX: periX,
    perihelionY: periY,
    aphelionX: aphX,
    aphelionY: aphY,
    a,
    b,
    focalOffset,
    perihelionDist: periDist,
    aphelionDist: aphDist,
    varpi
  };
}
