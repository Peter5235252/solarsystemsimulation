const fs = require('fs');
let content = fs.readFileSync('src/components/CustomDropdown.tsx', 'utf8');

content = content.replace(
  /initial=\{\{ opacity: 0, y: -6, scale: 0.96 \}\}\s*animate=\{\{ opacity: 1, y: 0, scale: 1 \}\}/g,
  'initial={{ y: -6, scale: 0.96 }}\n              animate={{ y: 0, scale: 1 }}'
);

fs.writeFileSync('src/components/CustomDropdown.tsx', content);
