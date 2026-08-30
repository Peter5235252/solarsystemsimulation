export interface CelestialDossier {
  id: string;
  name: string;
  category: 'Planet' | 'Dwarf Planet' | 'Moon' | 'Star' | 'Black Hole' | 'Spacecraft' | 'Constellation';
  type: string;
  color: string;
  distanceAu?: string;
  radiusKm?: string;
  mass?: string;
  gravity?: string;
  tempRange?: string;
  orbitalPeriod?: string;
  rotationPeriod?: string;
  atmosphere?: string;
  moonsCount?: number;
  discoveryYear?: string;
  discoverer?: string;
  summary: string;
  keyFacts: string[];
  suggestedQuestions: string[];
}

export interface SpaceMission {
  id: string;
  name: string;
  agency: string;
  launchYear: string;
  status: 'Active' | 'Interstellar' | 'Completed' | 'En Route' | 'Planned';
  target: string;
  targetBodyId?: string;
  color: string;
  category: 'Flyby / Interstellar' | 'Orbiter' | 'Lander / Rover' | 'Observatory' | 'Crewed';
  description: string;
  milestones: string[];
  keyPayload: string;
}

export interface CosmicPhenomenon {
  id: string;
  title: string;
  category: 'Relativity' | 'Quantum Cosmos' | 'Stellar Evolution' | 'Cosmology' | 'Astrobiology';
  shortDesc: string;
  detailedInsight: string;
  keyEquationOrFact: string;
  promptQuestion: string;
  tag: string;
}

export const CELESTIAL_DOSSIERS: CelestialDossier[] = [
  {
    id: 'sun',
    name: 'The Sun',
    category: 'Star',
    type: 'G-type Main-Sequence Yellow Dwarf (G2V)',
    color: '#fbbf24',
    distanceAu: '0 AU (Center of System)',
    radiusKm: '696,340 km (109 × Earth)',
    mass: '1.989 × 10³⁰ kg (333,000 × Earth)',
    gravity: '274.0 m/s² (28 × Earth)',
    tempRange: '5,500°C (Surface) / 15,000,000°C (Core)',
    orbitalPeriod: '~230 Million Years (Galactic Center)',
    rotationPeriod: '25–35 Earth Days (Differential)',
    atmosphere: 'Hydrogen (73.46%), Helium (24.85%), Oxygen (0.77%)',
    summary: 'The Sun is the gravitational anchor and energetic heart of our solar system, containing 99.86% of all system mass and generating energy via proton-proton nuclear fusion.',
    keyFacts: [
      'Converts 600 million tons of hydrogen into helium every single second.',
      'Photons born in the core take up to 100,000 years to reach the convective surface.',
      'Generates intense solar winds and coronal mass ejections that trigger geomagnetic storms.'
    ],
    suggestedQuestions: [
      'How does the Sun generate energy via nuclear fusion?',
      'What will happen to the Sun when it runs out of hydrogen?',
      'Explain the solar cycle and coronal mass ejections.'
    ]
  },
  {
    id: 'mercury',
    name: 'Mercury',
    category: 'Planet',
    type: 'Terrestrial Metalliferous World',
    color: '#a8a29e',
    distanceAu: '0.39 AU (57.9 Million km)',
    radiusKm: '2,439.7 km (0.38 × Earth)',
    mass: '3.30 × 10²³ kg (0.055 × Earth)',
    gravity: '3.70 m/s² (0.38 × Earth)',
    tempRange: '-180°C (Night) to 430°C (Day)',
    orbitalPeriod: '87.97 Earth Days',
    rotationPeriod: '58.65 Earth Days (3:2 Spin-Orbit Resonance)',
    atmosphere: 'Ultra-tenuous exosphere (Oxygen, Sodium, Hydrogen, Helium)',
    moonsCount: 0,
    discoveryYear: 'Known since antiquity (Galileo 1610 telescopic)',
    discoverer: 'Ancient Astronomers',
    summary: 'The innermost planet, Mercury is a heavily cratered, airless sphere with an enormous iron core comprising nearly 85% of its radius and dramatic day-night thermal swings.',
    keyFacts: [
      'Experiences the most eccentric orbit of all 8 major planets in our solar system.',
      'Possesses permanent water ice in shadowed polar craters despite roasting daytime heat.',
      'Shifts by 43 arcseconds per century in perihelion precession, proving Einstein’s General Relativity.'
    ],
    suggestedQuestions: [
      'How did Mercury prove Einstein’s theory of General Relativity?',
      'Why is Mercury’s core so disproportionately large?',
      'How can water ice exist on Mercury’s poles?'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    category: 'Planet',
    type: 'Terrestrial Super-Greenhouse Planet',
    color: '#fcd34d',
    distanceAu: '0.72 AU (108.2 Million km)',
    radiusKm: '6,051.8 km (0.95 × Earth)',
    mass: '4.87 × 10²⁴ kg (0.815 × Earth)',
    gravity: '8.87 m/s² (0.90 × Earth)',
    tempRange: '464°C (Constant mean surface)',
    orbitalPeriod: '224.7 Earth Days',
    rotationPeriod: '243.02 Earth Days (Retrograde / Backwards)',
    atmosphere: 'Carbon Dioxide (96.5%), Nitrogen (3.5%), Sulfuric Acid Clouds',
    moonsCount: 0,
    discoveryYear: 'Known since antiquity',
    discoverer: 'Ancient Astronomers',
    summary: 'Venus is a hellish world of runaway greenhouse warming with atmospheric pressure 92 times that of Earth and dense clouds of sulfuric acid obscuring an active volcanic crust.',
    keyFacts: [
      'Hottest planet in the solar system, hotter even than Mercury despite being further from the Sun.',
      'Rotates clockwise (retrograde); its day is longer than its orbital year.',
      'Soviet Venera landers survived only 23 to 127 minutes in the corrosive, crushing surface environment.'
    ],
    suggestedQuestions: [
      'What caused Venus to undergo a runaway greenhouse catastrophe?',
      'Why does Venus rotate backwards compared to other planets?',
      'Could microbial life survive in Venus’ upper cloud decks?'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    category: 'Planet',
    type: 'Terrestrial Ocean Planet (Habitable Zone)',
    color: '#60a5fa',
    distanceAu: '1.00 AU (149.6 Million km)',
    radiusKm: '6,371.0 km',
    mass: '5.972 × 10²⁴ kg',
    gravity: '9.807 m/s²',
    tempRange: '-89.2°C to 56.7°C (Global Mean ~15°C)',
    orbitalPeriod: '365.256 Days',
    rotationPeriod: '23h 56m 04s (Sidereal Day)',
    atmosphere: 'Nitrogen (78.08%), Oxygen (20.95%), Argon (0.93%), CO₂ (0.04%)',
    moonsCount: 1,
    discoveryYear: 'Human Origin',
    discoverer: 'Humanity',
    summary: 'Earth is our home, the only celestial body confirmed to host active biology, dynamic plate tectonics, abundant surface liquid oceans, and a protective magnetosphere.',
    keyFacts: [
      'Liquid water covers approximately 71% of Earth’s surface.',
      'Dynamic geodynamo in the liquid iron outer core generates a magnetosphere shielding life from cosmic rays.',
      'The Moon’s gravitational tidal drag stabilizes Earth’s axial tilt at 23.4°, maintaining stable seasonal climates.'
    ],
    suggestedQuestions: [
      'How does Earth’s magnetic field protect the atmosphere from solar wind stripping?',
      'What role did plate tectonics play in stabilizing Earth’s climate?',
      'How will the expansion of the Sun alter Earth’s biosphere in 1 billion years?'
    ]
  },
  {
    id: 'moon',
    name: 'The Moon (Luna)',
    category: 'Moon',
    type: 'Major Differentiated Natural Satellite',
    color: '#d6d3d1',
    distanceAu: '384,400 km from Earth (0.00257 AU)',
    radiusKm: '1,737.4 km (0.27 × Earth)',
    mass: '7.34 × 10²² kg (0.0123 × Earth)',
    gravity: '1.62 m/s² (0.166 × Earth)',
    tempRange: '-173°C (Night) to 127°C (Day)',
    orbitalPeriod: '27.32 Earth Days (Synchronous)',
    rotationPeriod: '27.32 Earth Days (Tidally Locked)',
    atmosphere: 'Surface boundary exosphere (Helium, Neon, Hydrogen)',
    discoveryYear: 'Known since antiquity (Apollo 11 landed 1969)',
    discoverer: 'Humanity',
    summary: 'Earth’s only natural satellite, formed ~4.5 billion years ago in the Giant Impact (Theia collision), tidally locked to present the same iconic cratered face toward Earth.',
    keyFacts: [
      'Fifth-largest moon in the solar system, unusually large relative to its host planet.',
      'Receding from Earth at a measured rate of 3.8 cm per year due to tidal friction transfer.',
      'Shackleton and permanently shadowed south-polar craters contain gigatons of primordial water ice.'
    ],
    suggestedQuestions: [
      'Explain the Giant Impact Hypothesis (Theia) for lunar formation.',
      'Why is the Moon tidally locked to Earth?',
      'What makes the lunar South Pole so valuable for Artemis missions?'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    category: 'Planet',
    type: 'Terrestrial Oxidized Desert World',
    color: '#f87171',
    distanceAu: '1.52 AU (227.9 Million km)',
    radiusKm: '3,389.5 km (0.53 × Earth)',
    mass: '6.417 × 10²³ kg (0.107 × Earth)',
    gravity: '3.72 m/s² (0.38 × Earth)',
    tempRange: '-125°C to 20°C (Mean -63°C)',
    orbitalPeriod: '686.98 Earth Days (1.88 Years)',
    rotationPeriod: '24h 37m 22s (1 Sol)',
    atmosphere: 'Carbon Dioxide (95.32%), Nitrogen (2.6%), Argon (1.9%)',
    moonsCount: 2,
    discoveryYear: 'Known since antiquity',
    discoverer: 'Ancient Astronomers',
    summary: 'The Red Planet is a cold desert world marked by ancient river deltas, the solar system’s tallest volcano (Olympus Mons), and the colossal Valles Marineris canyon system.',
    keyFacts: [
      'Olympus Mons stands 21.9 km high—nearly three times the height of Mt. Everest.',
      'Possessed substantial liquid water lakes, rivers, and a thicker atmosphere 3.8 billion years ago.',
      'Lost its global dipole magnetic field ~4 billion years ago, allowing solar wind to strip its atmosphere.'
    ],
    suggestedQuestions: [
      'What evidence proves liquid water flowed on ancient Mars?',
      'How did Mars lose its primordial magnetic shield and atmosphere?',
      'What are the greatest engineering challenges of terraforming or colonizing Mars?'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    category: 'Planet',
    type: 'Gas Giant (Jovian Archetype)',
    color: '#d97706',
    distanceAu: '5.20 AU (778.5 Million km)',
    radiusKm: '69,911 km (11.0 × Earth)',
    mass: '1.898 × 10²⁷ kg (317.8 × Earth)',
    gravity: '24.79 m/s² (2.53 × Earth)',
    tempRange: '-145°C (Cloud Tops)',
    orbitalPeriod: '11.86 Earth Years',
    rotationPeriod: '9h 55m 30s (Fastest Planetary Rotation)',
    atmosphere: 'Hydrogen (89.8%), Helium (10.2%), Trace Methane, Ammonia',
    moonsCount: 95,
    discoveryYear: 'Known since antiquity (Galileo 1610 moons)',
    discoverer: 'Ancient Astronomers / Galileo Galilei',
    summary: 'The king of planets, Jupiter is an enormous gas giant containing more mass than all other planets combined, with a colossal magnetosphere and the centuries-old Great Red Spot storm.',
    keyFacts: [
      'The Great Red Spot is an anticyclonic storm larger than the entire diameter of Earth.',
      'Generates a magnetosphere 20,000 times stronger than Earth’s, spanning millions of kilometers.',
      'Harbors a liquid metallic hydrogen ocean deep within its interior that acts as an electrical dynamo.'
    ],
    suggestedQuestions: [
      'What is liquid metallic hydrogen and how does it generate Jupiter’s magnetic field?',
      'Why is the Great Red Spot shrinking and how has it persisted for centuries?',
      'Compare the Galilean moons: Io, Europa, Ganymede, and Callisto.'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    category: 'Planet',
    type: 'Ringed Gas Giant',
    color: '#fde68a',
    distanceAu: '9.58 AU (1.43 Billion km)',
    radiusKm: '58,232 km (9.14 × Earth)',
    mass: '5.683 × 10²⁶ kg (95.2 × Earth)',
    gravity: '10.44 m/s² (1.06 × Earth)',
    tempRange: '-178°C (Cloud Tops)',
    orbitalPeriod: '29.45 Earth Years',
    rotationPeriod: '10h 33m 38s',
    atmosphere: 'Hydrogen (96.3%), Helium (3.25%), Trace Methane, Ammonia',
    moonsCount: 146,
    discoveryYear: 'Known since antiquity (Huygens 1655 rings)',
    discoverer: 'Ancient Astronomers / Christiaan Huygens',
    summary: 'Celebrated for its iconic, razor-thin ring system spanning 282,000 km yet only 10 to 100 meters thick, Saturn is the least dense planet in the solar system—less dense than water.',
    keyFacts: [
      'Its mean density is 0.687 g/cm³, meaning Saturn would theoretically float in a giant bathtub of water.',
      'The rings are 99% pure water ice particles ranging in size from tiny dust specks to house-sized boulders.',
      'Possesses a mysterious persistent hexagonal jet stream storm at its north pole spanning 30,000 km.'
    ],
    suggestedQuestions: [
      'How did Saturn’s rings form and will they disappear over cosmic time?',
      'What causes the stable hexagonal storm at Saturn’s North Pole?',
      'Could life exist in Enceladus’ sub-surface hydrothermal vents or Titan’s methane lakes?'
    ]
  },
  {
    id: 'titan',
    name: 'Titan',
    category: 'Moon',
    type: 'Sub-Zero Cryo-Hydrological Moon',
    color: '#f59e0b',
    distanceAu: '1.22 Million km from Saturn',
    radiusKm: '2,574.7 km (Larger than Mercury)',
    mass: '1.345 × 10²³ kg (0.0225 × Earth)',
    gravity: '1.35 m/s² (0.14 × Earth)',
    tempRange: '-179.5°C',
    orbitalPeriod: '15.94 Earth Days',
    rotationPeriod: '15.94 Earth Days (Tidally Locked)',
    atmosphere: 'Nitrogen (94.2%), Methane (5.65%), Hydrogen (0.1%)',
    discoveryYear: '1655',
    discoverer: 'Christiaan Huygens',
    summary: 'The second-largest moon in the solar system, Titan is the only moon with a dense atmosphere and the only extraterrestrial world known to possess stable surface rivers, lakes, and seas of liquid methane.',
    keyFacts: [
      'Has a full hydrological cycle analogous to Earth’s, but using methane and ethane instead of water.',
      'Atmospheric surface pressure is 1.45 atmospheres, and air density is 4 times that of Earth.',
      'NASA’s Dragonfly rotorcraft mission is scheduled to explore Titan’s organic chemistry in the 2030s.'
    ],
    suggestedQuestions: [
      'How does Titan’s methane cycle mirror Earth’s water cycle?',
      'What prebiotic molecules exist in Titan’s nitrogen-methane haze?',
      'What will the NASA Dragonfly mission search for on Titan?'
    ]
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    category: 'Moon',
    type: 'Ocean World / Cryovolcanic Satellite',
    color: '#f8fafc',
    distanceAu: '238,000 km from Saturn',
    radiusKm: '252.1 km',
    mass: '1.08 × 10²⁰ kg',
    gravity: '0.113 m/s²',
    tempRange: '-201°C',
    orbitalPeriod: '32.9 Hours',
    rotationPeriod: 'Synchronous',
    atmosphere: 'Water Vapor (91%), Nitrogen (4%), Carbon Dioxide (3.2%)',
    discoveryYear: '1789',
    discoverer: 'William Herschel',
    summary: 'A tiny, brilliantly reflective moon that conceals a global liquid water ocean beneath its ice shell, venting water vapor, simple organics, and silica nanoparticles through south polar cryogeysers.',
    keyFacts: [
      'Cassini probe flew directly through Enceladus’ plumes, detecting water, salts, hydrogen, and complex organic macromolecules.',
      'Tidal flexing from orbital resonance with Dione keeps its subsurface ocean perpetually warm and liquid.',
      'Direct evidence of alkaline hydrothermal vents makes Enceladus one of the highest-priority astrobiology targets.'
    ],
    suggestedQuestions: [
      'What did the Cassini probe discover inside Enceladus’ geyser plumes?',
      'Why are hydrothermal vents on ocean worlds promising for the origin of life?',
      'How does orbital resonance with Dione provide internal heat for Enceladus?'
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    category: 'Planet',
    type: 'Ice Giant',
    color: '#2dd4bf',
    distanceAu: '19.2 AU (2.87 Billion km)',
    radiusKm: '25,362 km (4.0 × Earth)',
    mass: '8.681 × 10²⁵ kg (14.5 × Earth)',
    gravity: '8.69 m/s² (0.89 × Earth)',
    tempRange: '-224°C (Coldest atmosphere in Solar System)',
    orbitalPeriod: '84.01 Earth Years',
    rotationPeriod: '17h 14m 24s (Retrograde)',
    atmosphere: 'Hydrogen (83%), Helium (15%), Methane (2.3%)',
    moonsCount: 28,
    discoveryYear: '1781',
    discoverer: 'William Herschel',
    summary: 'An ice giant with an extreme axial tilt of 97.77°, Uranus literally rolls along its orbital path on its side, experiencing 42-year long polar nights and days.',
    keyFacts: [
      'First planet discovered in modern history using an astronomical telescope.',
      'Features the coldest planetary atmosphere recorded in the solar system at -224°C.',
      'Its magnetic field is tilted 59° from its rotational axis and offset from the planet’s center by one-third of its radius.'
    ],
    suggestedQuestions: [
      'What caused Uranus to tilt 98 degrees onto its side?',
      'Why is Uranus colder than Neptune despite being closer to the Sun?',
      'Explain Uranus’ bizarre offset magnetic field.'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    category: 'Planet',
    type: 'Ice Giant (Wind Dynamo)',
    color: '#3b82f6',
    distanceAu: '30.1 AU (4.50 Billion km)',
    radiusKm: '24,622 km (3.86 × Earth)',
    mass: '1.024 × 10²⁶ kg (17.15 × Earth)',
    gravity: '11.15 m/s² (1.14 × Earth)',
    tempRange: '-214°C',
    orbitalPeriod: '164.79 Earth Years',
    rotationPeriod: '16h 06m 36s',
    atmosphere: 'Hydrogen (80%), Helium (19%), Methane (1.5%)',
    moonsCount: 16,
    discoveryYear: '1846',
    discoverer: 'Urbain Le Verrier & Johann Galle',
    summary: 'The outermost major planet, Neptune is a deep azure world whipped by supersonic winds exceeding 2,100 km/h—the fastest atmospheric wind speeds ever recorded.',
    keyFacts: [
      'Discovered mathematically through gravitational perturbations in Uranus’ orbit before being observed visually.',
      'Radiates 2.6 times more thermal energy than it receives from the distant Sun due to primordial internal heat.',
      'Its largest moon, Triton, orbits in a retrograde direction and is a captured Kuiper Belt dwarf planet with active nitrogen cryovolcanoes.'
    ],
    suggestedQuestions: [
      'How was Neptune discovered through pure mathematical calculation?',
      'What drives the supersonic 2,100 km/h winds on Neptune?',
      'Why will Triton eventually be destroyed and form a ring around Neptune?'
    ]
  },
  {
    id: 'pluto',
    name: 'Pluto',
    category: 'Dwarf Planet',
    type: 'Kuiper Belt Dwarf Planet / Binary System',
    color: '#fed7aa',
    distanceAu: '39.48 AU (5.91 Billion km average)',
    radiusKm: '1,188.3 km (0.18 × Earth)',
    mass: '1.303 × 10²² kg (0.0022 × Earth)',
    gravity: '0.62 m/s² (0.06 × Earth)',
    tempRange: '-230°C',
    orbitalPeriod: '247.9 Earth Years',
    rotationPeriod: '6.387 Earth Days',
    atmosphere: 'Nitrogen (99%), Methane (0.5%), Carbon Monoxide (0.05%)',
    moonsCount: 5,
    discoveryYear: '1930',
    discoverer: 'Clyde Tombaugh',
    summary: 'Once classified as the ninth planet, Pluto is a dynamic world of nitrogen ice glaciers, towering water-ice mountains, and a double-planet gravitational dance with its massive moon Charon.',
    keyFacts: [
      'Features Tombaugh Regio, a magnificent 1,000-km-wide heart-shaped glacier of nitrogen and methane ice.',
      'Pluto and Charon orbit a common barycenter that sits in the empty space between them.',
      'Reclassified as a Dwarf Planet by the IAU in 2006 for not clearing the neighborhood around its orbit.'
    ],
    suggestedQuestions: [
      'Why was Pluto reclassified from a major planet to a dwarf planet in 2006?',
      'What did New Horizons reveal about Pluto’s nitrogen glaciers and mountains?',
      'How do Pluto and Charon function as a binary dwarf planet system?'
    ]
  },
  {
    id: 'sagittarius_a',
    name: 'Sagittarius A*',
    category: 'Black Hole',
    type: 'Supermassive Black Hole (SMBH)',
    color: '#f97316',
    distanceAu: '26,673 Light Years (Galactic Center)',
    radiusKm: 'Schwarzschild Radius ~12 Million km (~17 × Sun)',
    mass: '4.154 × 10⁶ Solar Masses (4.15 Million × Sun)',
    gravity: 'Infinite Singularity / Extreme Lensing',
    tempRange: '10,000,000°C (Accretion Plasma)',
    summary: 'The supermassive gravitational anchor residing at the exact rotational heart of our Milky Way galaxy, around which billions of stars, gas clouds, and dark matter orbit.',
    keyFacts: [
      'Directly imaged for the first time in radio waves by the Event Horizon Telescope (EHT) in 2022.',
      'Nobel Prize in Physics (2020) awarded to Andrea Ghez and Reinhard Genzel for tracking stars orbiting Sgr A* at 8% the speed of light.',
      'Its event horizon is surrounded by photon spheres and magnetic plasma flares emitting intense X-rays.'
    ],
    suggestedQuestions: [
      'How did astronomers prove Sagittarius A* exists using S-star orbits?',
      'Explain the Event Horizon Telescope image of Sagittarius A*.',
      'What happens to spacetime near a supermassive black hole event horizon?'
    ]
  }
];

export const SPACE_MISSIONS: SpaceMission[] = [
  {
    id: 'voyager1',
    name: 'Voyager 1',
    agency: 'NASA / JPL',
    launchYear: '1977',
    status: 'Interstellar',
    target: 'Jupiter, Saturn, Interstellar Space',
    targetBodyId: 'voyager1',
    color: '#94a3b8',
    category: 'Flyby / Interstellar',
    description: 'The farthest human-made object from Earth, currently traversing interstellar space over 24 billion kilometers away and carrying humanity’s Golden Record message.',
    milestones: [
      '1979: Discovered active volcanism on Jupiter’s moon Io.',
      '1980: Detailed flyby of Saturn and discovery of intricate ring structures.',
      '1990: Captured the iconic "Pale Blue Dot" photograph of Earth from 6 billion km.',
      '2012: Officially crossed the heliopause into interstellar space.'
    ],
    keyPayload: 'Golden Record, Magnetometer, Cosmic Ray Subsystem, Plasma Wave Sensor'
  },
  {
    id: 'voyager2',
    name: 'Voyager 2',
    agency: 'NASA / JPL',
    launchYear: '1977',
    status: 'Interstellar',
    target: 'Jupiter, Saturn, Uranus, Neptune',
    targetBodyId: 'voyager2',
    color: '#64748b',
    category: 'Flyby / Interstellar',
    description: 'The only spacecraft in human history to complete the grand tour of all four outer gas and ice giants: Jupiter, Saturn, Uranus, and Neptune.',
    milestones: [
      '1986: First and only close encounter with Uranus (discovered 10 new moons & 2 rings).',
      '1989: First and only encounter with Neptune (observed Great Dark Spot and Triton’s geysers).',
      '2018: Crossed the heliopause into interstellar space.'
    ],
    keyPayload: 'Golden Record, Imaging Science System, Ultraviolet Spectrometer'
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    launchYear: '2021',
    status: 'Active',
    target: 'Sun-Earth L2 Lagrange Point (1.5M km)',
    targetBodyId: 'jwst',
    color: '#fcd34d',
    category: 'Observatory',
    description: 'The premier deep-space infrared observatory, peering back over 13.5 billion years to observe the first stars and galaxies formed after the Big Bang and characterize exoplanet atmospheres.',
    milestones: [
      '2022: Unfolded 6.5-meter gold-coated beryllium primary mirror in deep space.',
      '2022: Delivered deepest infrared image of early universe (SMACS 0723).',
      '2023: Detected carbon dioxide and atmospheric signatures on temperate exoplanets.'
    ],
    keyPayload: 'NIRCam, NIRSpec, MIRI, FGS/NIRISS, Five-layer Kapton Sunshield'
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    agency: 'NASA / ESA / ASI',
    launchYear: '1997',
    status: 'Completed',
    target: 'Saturn, Titan, Enceladus',
    targetBodyId: 'cassini',
    color: '#f87171',
    category: 'Orbiter',
    description: 'A 13-year flagship expedition orbiting Saturn, discovering global subsurface oceans on Enceladus and landing the ESA Huygens probe on the hydrocarbon shores of Titan.',
    milestones: [
      '2004: Entered Saturn orbit.',
      '2005: Huygens probe successfully touched down on Titan.',
      '2005-2015: Discovered hydrothermal geysers venting from Enceladus’ ocean.',
      '2017: Executed the "Grand Finale" plunge into Saturn’s upper atmosphere.'
    ],
    keyPayload: 'Huygens Titan Lander, Radar Mapper, Cosmic Dust Analyzer, CIRS'
  },
  {
    id: 'newhorizons',
    name: 'New Horizons',
    agency: 'NASA / JHUAPL',
    launchYear: '2006',
    status: 'Interstellar',
    target: 'Pluto, Charon, Kuiper Belt (Arrokoth)',
    targetBodyId: 'newhorizons',
    color: '#f59e0b',
    category: 'Flyby / Interstellar',
    description: 'Launched at the highest velocity of any probe, New Horizons made history by conducting the first close reconnaissance of Pluto and the primordial Kuiper Belt object Arrokoth.',
    milestones: [
      '2007: Jupiter gravity assist capturing volcanic eruptions on Io.',
      '2015: Historic flyby of Pluto and Charon, revealing Tombaugh Regio.',
      '2019: Explored contact binary planetesimal Arrokoth (44 AU from Sun).'
    ],
    keyPayload: 'LORRI High-Resolution Imager, Ralph Visible/IR Imager, Alice UV Spectrometer'
  },
  {
    id: 'apollo11',
    name: 'Apollo 11',
    agency: 'NASA',
    launchYear: '1969',
    status: 'Completed',
    target: 'The Moon (Sea of Tranquility)',
    targetBodyId: 'apollo11',
    color: '#f8fafc',
    category: 'Crewed',
    description: 'Humanity’s historic first crewed landing on another celestial body, fulfilling the dream of landing Neil Armstrong and Buzz Aldrin on the lunar surface and returning them safely to Earth.',
    milestones: [
      'July 16, 1969: Saturn V rocket launched from Kennedy Space Center.',
      'July 20, 1969: Lunar Module Eagle landed in the Sea of Tranquility.',
      'July 21, 1969: "That’s one small step for man, one giant leap for mankind."',
      'July 24, 1969: Command Module Columbia splashed down in the Pacific Ocean.'
    ],
    keyPayload: 'Lunar Module Eagle, Command Module Columbia, Early Apollo Scientific Experiments (EASEP)'
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    agency: 'NASA / ESA',
    launchYear: '1990',
    status: 'Active',
    target: 'Low Earth Orbit (540 km)',
    targetBodyId: 'hubble',
    color: '#38bdf8',
    category: 'Observatory',
    description: 'One of the most transformative scientific instruments ever built, orbiting above atmospheric distortion to capture over 1.5 million astronomical observations across 34+ years.',
    milestones: [
      '1993: Space Shuttle servicing mission STS-61 installed corrective optics (COSTAR).',
      '1995: Captured the revolutionary Hubble Deep Field.',
      '1998: Key measurements pinpointing the accelerating expansion of the universe.'
    ],
    keyPayload: 'Wide Field Camera 3 (WFC3), Cosmic Origins Spectrograph (COS), ACS'
  },
  {
    id: 'iss',
    name: 'International Space Station (ISS)',
    agency: 'NASA / Roscosmos / ESA / JAXA / CSA',
    launchYear: '1998',
    status: 'Active',
    target: 'Low Earth Orbit (400 km altitude)',
    targetBodyId: 'iss',
    color: '#cbd5e1',
    category: 'Crewed',
    description: 'A modular, microgravity research laboratory and continuous home for international astronaut crews since November 2000, orbiting Earth every 90 minutes.',
    milestones: [
      '1998: Zarya and Unity modules mated in orbit.',
      '2000: Expedition 1 crew arrived, beginning 25+ years of continuous human space presence.',
      '2020: Hosted over 3,000 scientific experiments across physics, biology, and materials.'
    ],
    keyPayload: 'Alpha Magnetic Spectrometer (AMS-02), Cupola Observational Module, Columbus Laboratory'
  }
];

export const COSMIC_PHENOMENA: CosmicPhenomenon[] = [
  {
    id: 'gravitational_lensing',
    title: 'Gravitational Lensing',
    category: 'Relativity',
    tag: 'Einstein Field Equations',
    keyEquationOrFact: 'θ = (4GM) / (c² b)',
    shortDesc: 'Massive cosmic objects warp the fabric of spacetime, bending and magnifying light from background galaxies like a cosmic magnifying glass.',
    detailedInsight: 'Predicted by Albert Einstein in his 1915 Theory of General Relativity, gravitational lensing occurs because light follows null geodesics through curved spacetime. Astronomers use galaxy clusters as natural telescopes to discover the most distant stars and map invisible dark matter halos.',
    promptQuestion: 'Explain how Gravitational Lensing works and how it allows us to map invisible Dark Matter.'
  },
  {
    id: 'fermi_paradox',
    title: 'The Fermi Paradox & Great Filter',
    category: 'Astrobiology',
    tag: 'Drake Equation',
    keyEquationOrFact: 'N = R* · fp · ne · fl · fi · fc · L',
    shortDesc: 'With hundreds of billions of stars and habitable planets in the Milky Way, why haven’t we found any definitive evidence of extraterrestrial civilizations? "Where is everybody?"',
    detailedInsight: 'Enrico Fermi’s famous 1950 question underscores the apparent contradiction between high probabilistic estimates for the existence of extraterrestrial intelligence and the total lack of contact. Hypotheses range from the Great Filter (an existential evolutionary barrier) to the Zoo Hypothesis and Dark Forest Theory.',
    promptQuestion: 'Analyze the Fermi Paradox, the Great Filter hypothesis, and the Dark Forest Theory.'
  },
  {
    id: 'black_hole_thermodynamics',
    title: 'Hawking Radiation & Black Hole Evaporation',
    category: 'Quantum Cosmos',
    tag: 'Quantum Field Theory',
    keyEquationOrFact: 'T_H = (ℏ c³) / (8π G M k_B)',
    shortDesc: 'Quantum vacuum fluctuations near an event horizon cause black holes to emit thermal radiation and very slowly lose mass until they eventually evaporate.',
    detailedInsight: 'Proposed by Stephen Hawking in 1974, Hawking radiation combines quantum field theory with general relativity. Virtual particle-antiparticle pairs separated by the event horizon result in one particle falling in while the other escapes as real radiation, introducing the deep Black Hole Information Paradox.',
    promptQuestion: 'How does Hawking Radiation cause black holes to evaporate, and what is the Information Paradox?'
  },
  {
    id: 'dark_energy_expansion',
    title: 'Dark Energy & Cosmic Inflation',
    category: 'Cosmology',
    tag: 'Cosmological Constant Λ',
    keyEquationOrFact: 'Ω_Λ ≈ 68.3%, Ω_m ≈ 26.8%',
    shortDesc: 'Over 68% of the total energy density of the universe is Dark Energy—a mysterious repulsive force driving the accelerated expansion of the cosmos.',
    detailedInsight: 'Discovered in 1998 through observations of distant Type Ia supernovae, dark energy acts as a negative pressure pushing galaxies apart at ever-increasing rates. In the distant future (~100 billion years), all galaxies beyond our local group will be swept across the cosmic event horizon.',
    promptQuestion: 'What is Dark Energy and what are the possible ultimate fates of our universe (Big Freeze, Big Rip, Big Crunch)?'
  },
  {
    id: 'stellar_nucleosynthesis',
    title: 'Stellar Nucleosynthesis & Supernovae',
    category: 'Stellar Evolution',
    tag: 'Stellar Fusion Cycles',
    keyEquationOrFact: '3 He-4 → C-12 (Triple-Alpha Process)',
    shortDesc: 'Every element heavier than hydrogen and helium in our bodies was forged in the fiery cores of ancient stars and scattered across the galaxy during supernova explosions.',
    detailedInsight: 'As Carl Sagan famously proclaimed, "We are made of star-stuff." Stars fuse hydrogen into helium, carbon, oxygen, neon, and silicon. Fusion ceases at iron (Fe-56), triggering core collapse into neutron stars or black holes, while r-process neutron-capture in supernovae and kilonovae forges gold, platinum, and uranium.',
    promptQuestion: 'How do stars forge chemical elements in their cores and what happens during a core-collapse supernova?'
  },
  {
    id: 'time_dilation',
    title: 'Relativistic Time Dilation',
    category: 'Relativity',
    tag: 'Special & General Relativity',
    keyEquationOrFact: 'Δt\' = Δt / √(1 - v²/c²)',
    shortDesc: 'Time is not absolute: clocks tick measurably slower in strong gravitational fields and when traveling at velocities approaching the speed of light.',
    detailedInsight: 'Special Relativity dictates that moving clocks run slow relative to stationary observers (kinematic time dilation). General Relativity shows that clocks closer to massive gravitational bodies experience slower time progression. GPS satellites must adjust for both effects to maintain millimeter navigational accuracy.',
    promptQuestion: 'Explain Gravitational Time Dilation and how astronauts or GPS satellites experience differing flows of time.'
  }
];
