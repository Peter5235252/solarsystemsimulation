const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const charonDetails = `  'charon': { type: 'Natural Satellite', mass: '0.00025 × Earth', temp: '-220°C', gravity: '0.288 m/s²', funFacts: ['Charon is about half the size of Pluto.', 'It has a reddish north pole region called Macula.'] },\n`;

content = content.replace(
  /'pluto': { type: 'Dwarf Planet', [^}]+ },/,
  match => match + '\n' + charonDetails
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
