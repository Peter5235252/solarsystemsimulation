const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');
content = content.replace(
  /lockedPlanetId: null as string \| null,\n    focusFactor: 0\n  \}\);/,
  "lockedPlanetId: null as string | null,\n    focusFactor: 0,\n    mouseX: 0,\n    mouseY: 0\n  });"
);
fs.writeFileSync('src/components/SolarSystem.tsx', content);
