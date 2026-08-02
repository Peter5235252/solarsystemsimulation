const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const plutoDetails = `
  'pluto': { type: 'Dwarf Planet', mass: '0.00218 × Earth', temp: '-225°C', gravity: '0.62 m/s²', funFacts: ['Pluto was reclassified from a planet to a dwarf planet in 2006.', 'It has a prominent heart-shaped glacier named Tombaugh Regio.'] },
`;

// Insert into BODY_DETAILS
content = content.replace(
  /'neptune': { type: 'Ice Giant', [^}]+ },/,
  match => match + plutoDetails
);

const plutoPlanet = `
  { id: 'pluto', name: 'Pluto', color: '#fed7aa', radius: 4, distance: 900, speed: 0.00005, sides: 5, desc: 'Pluto is a dwarf planet in the Kuiper belt, famously known for its heart-shaped surface feature.',
    moons: [{ id: 'charon', name: 'Charon', color: '#e7e5e4', radius: 2, distance: 15, speed: 0.03, sides: 4, desc: 'Charon is the largest of Pluto\\'s five moons and is so big that Pluto and Charon orbit each other like a double planet.' }]
  },`;

// Insert into PLANETS
content = content.replace(
  /{ id: 'neptune', [^}]+desc: 'Neptune is the most distant major planet, a dark and cold world whipped by supersonic winds.' },/g,
  match => match + plutoPlanet
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
