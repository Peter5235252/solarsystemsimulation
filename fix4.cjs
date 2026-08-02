const fs = require('fs');
let code = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

// Fix the WebGPU ones:
code = code.replace(/      \},\n      \{\n          fragment:/g, '      \},\n          fragment:');
code = code.replace(/      \},\n      \{\n          primitive:/g, '      \},\n          primitive:');
code = code.replace(/      \},\n      \{\n        \}\);/g, '      \},\n        });');

// Fix the double `{` in items.push
code = code.replace(/      \{\n      \{/g, '      {');

// Fix the array elements in the Historic Events section:
// 4920:      {
// 4921:                          {
code = code.replace(/      \},\n      \{\n                          \{/g, '      \},\n                          {');

// What else?
fs.writeFileSync('src/components/SolarSystem.tsx', code);
