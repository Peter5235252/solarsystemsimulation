const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

content = content.replace(
  /initial=\{\{ opacity: 0, y: -4 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}/g,
  'initial={{ y: -4 }}\n                          animate={{ y: 0 }}'
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);

let cd = fs.readFileSync('src/components/CustomDropdown.tsx', 'utf8');
cd = cd.replace(
  /initial=\{\{ opacity: 0 \}\}\s*animate=\{\{ opacity: 1 \}\}/g,
  'initial={{ }}\n            animate={{ }}'
);
fs.writeFileSync('src/components/CustomDropdown.tsx', cd);

