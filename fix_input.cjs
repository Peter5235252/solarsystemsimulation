const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');
content = content.replace(
  /onChange=\{\(e\) => setSearchQuery\(e.value \? e.value : \(e.target as HTMLInputElement\).value\)\}/,
  "onChange={(e) => setSearchQuery(e.target.value)}"
);
fs.writeFileSync('src/components/SolarSystem.tsx', content);
