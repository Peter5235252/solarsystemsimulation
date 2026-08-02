const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');
content = content.replace(
  /selectedPlanetId: selectedPlanet,\s*resScale,\s*sharpenLevel/g,
  "selectedPlanetId: selectedPlanet"
);
fs.writeFileSync('src/components/SolarSystem.tsx', content);
