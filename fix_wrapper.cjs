const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

content = content.replace(
  /open: { opacity: 1, pointerEvents: "auto", visibility: "visible" },\s*closed: { opacity: 0, pointerEvents: "none", transitionEnd: { visibility: "hidden" } }/g,
  'open: { pointerEvents: "auto", visibility: "visible" },\n          closed: { pointerEvents: "none", transitionEnd: { visibility: "hidden" } }'
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
