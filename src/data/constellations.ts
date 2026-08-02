interface ConstellationPoint {
  x: number;
  y: number;
  name?: string;
  mag?: number; // Relative magnitude (1-5, where 5 is brightest)
}

export interface Constellation {
  id: string;
  nameKey: string;
  descKey: string;
  color: string;
  hitRadius: number;
  cx: number;
  cy: number;
  scale: number;
  points: ConstellationPoint[];
  edges: [number, number][];
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'ursa_major',
    nameKey: 'const_ursa_major',
    descKey: 'const_ursa_major_desc',
    color: '#38bdf8',
    hitRadius: 400,
    cx: 800,
    cy: -1300,
    scale: 6,
    points: [
      { x: 45, y: 12 },   // Dubhe
      { x: 46, y: -2 },   // Merak
      { x: 13, y: -8 },   // Phecda
      { x: 0, y: 0 },     // Megrez
      { x: -24, y: -3 },  // Alioth
      { x: -43, y: -5 },  // Mizar
      { x: -58, y: -19 }  // Alkaid
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]]
  },
  {
    id: 'orion',
    nameKey: 'const_orion',
    descKey: 'const_orion_desc',
    color: '#facc15',
    hitRadius: 400,
    cx: -1000,
    cy: -900,
    scale: 6,
    points: [
      { x: -19, y: 34 },  // 0 Betelgeuse
      { x: 11, y: 30 },   // 1 Bellatrix
      { x: -5, y: -3 },   // 2 Alnitak
      { x: 0, y: 0 },     // 3 Alnilam
      { x: 4, y: 4 },     // 4 Mintaka
      { x: -12, y: -34 }, // 5 Saiph
      { x: 22, y: -28 }   // 6 Rigel
    ],
    edges: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]]
  },
  {
    id: 'cassiopeia',
    nameKey: 'const_cassiopeia',
    descKey: 'const_cassiopeia_desc',
    color: '#c084fc',
    hitRadius: 250,
    cx: 1400,
    cy: 800,
    scale: 6,
    points: [
      { x: -29, y: 6 },   // 0 Segin
      { x: -14, y: -1 },  // 1 Ruchbah
      { x: 0, y: 0 },     // 2 Gamma Cas
      { x: 8, y: -8 },    // 3 Schedar
      { x: 24, y: -3 }    // 4 Caph
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]]
  },
  {
    id: 'cygnus',
    nameKey: 'const_cygnus',
    descKey: 'const_cygnus_desc',
    color: '#fb7185',
    hitRadius: 400,
    cx: 600,
    cy: -1900,
    scale: 6,
    points: [
      { x: -14, y: 15 },  // 0 Deneb
      { x: 0, y: 0 },     // 1 Sadr
      { x: 39, y: -37 },  // 2 Albireo
      { x: 28, y: 15 },   // 3 Fawaris
      { x: -18, y: -19 }  // 4 Gienah
    ],
    edges: [[0, 1], [1, 2], [3, 1], [1, 4]]
  },
  {
    id: 'scorpius',
    nameKey: 'const_scorpius',
    descKey: 'const_scorpius_desc',
    color: '#f87171',
    hitRadius: 350,
    cx: -1600,
    cy: 600,
    scale: 6,
    points: [
      { x: 15, y: 1 },    // 0 Pi Sco
      { x: 15, y: 8 },    // 1 Delta Sco
      { x: 12, y: 13 },   // 2 Beta Sco
      { x: 0, y: 0 },     // 3 Antares
      { x: -3, y: -4 },   // 4 Tau Sco
      { x: -11, y: -16 }, // 5 Epsilon Sco
      { x: -11, y: -23 }, // 6 Mu Sco
      { x: -12, y: -32 }, // 7 Zeta Sco
      { x: -21, y: -34 }, // 8 Eta Sco
      { x: -33, y: -33 }, // 9 Theta Sco
      { x: -39, y: -27 }, // 10 Iota Sco
      { x: -36, y: -25 }, // 11 Kappa Sco
      { x: -32, y: -21 }  // 12 Lambda Sco
    ],
    edges: [[0, 3], [1, 3], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12]]
  },
  {
    id: 'crux',
    nameKey: 'const_crux',
    descKey: 'const_crux_desc',
    color: '#818cf8',
    hitRadius: 200,
    cx: -800,
    cy: 1600,
    scale: 6,
    points: [
      { x: 5, y: 32, name: 'Acrux', mag: 5 },
      { x: -28, y: 2, name: 'Mimosa', mag: 4.5 },
      { x: -5, y: -32, name: 'Gacrux', mag: 4.5 },
      { x: 22, y: -2, name: 'Delta Crucis', mag: 3.5 },
      { x: 12, y: 15, name: 'Epsilon Crucis', mag: 2.5 }
    ],
    edges: [[0, 2], [1, 3]]
  }
];
