const fs = require('fs');
let code = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');
code = code.replace("      {\n        category: 'Settings',\n        title: 'Performance Mode',", "      {\n        id: 'set-perf',\n        category: 'Settings',\n        title: 'Performance Mode',");
fs.writeFileSync('src/components/SolarSystem.tsx', code);
