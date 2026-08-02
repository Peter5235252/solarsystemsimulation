const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');
content = content.replace(
  /          selectedPlanetId: selectedPlanet,\n          resScale,\n          sharpenLevel\n        \}\}/,
  "          selectedPlanetId: selectedPlanet\n        }}"
);
fs.writeFileSync('src/components/SolarSystem.tsx', content);
