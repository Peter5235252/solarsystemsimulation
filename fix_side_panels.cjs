const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

// Replace opacity in initial and animate for the 3 side panels
content = content.replace(
  /initial=\{\{ opacity: 0, x: -20, y: 20 \}\}\s*animate=\{\{ opacity: 1, x: 0, y: 0 \}\}/g,
  'initial={{ x: -20, y: 20 }}\n            animate={{ x: 0, y: 0 }}'
);

content = content.replace(
  /initial=\{\{ opacity: 0, x: -20 \}\}\s*animate=\{\{ opacity: 1, x: 0 \}\}/g,
  'initial={{ x: -20 }}\n            animate={{ x: 0 }}'
);

content = content.replace(
  /initial=\{\{ opacity: 0, x: 20 \}\}\s*animate=\{\{ opacity: 1, x: 0 \}\}/g,
  'initial={{ x: 20 }}\n            animate={{ x: 0 }}'
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
