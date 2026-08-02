const fs = require('fs');
let code = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

code = code.replace(/      \},\n      \{\n      return \(\) => clearTimeout\(timer\);/g, '      \},\n      return () => clearTimeout(timer);');

fs.writeFileSync('src/components/SolarSystem.tsx', code);
