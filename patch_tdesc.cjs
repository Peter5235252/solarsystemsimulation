const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const target = `              const planet = allBodies.find(p => p.id === selectedPlanet);
              if (!planet) return null;
              const tName = ('nameKey' in planet && planet.nameKey) ? (t[planet.nameKey as keyof typeof t] || TRANSLATIONS['en'][planet.nameKey as keyof typeof TRANSLATIONS['en']] || planet.name) : (t[\`\${planet.id}_name\` as keyof typeof t] || TRANSLATIONS['en'][\`\${planet.id}_name\` as keyof typeof TRANSLATIONS['en']] || planet.name);
              const tDesc = ('descKey' in planet && planet.descKey) ? (t[planet.descKey as keyof typeof t] || TRANSLATIONS['en'][planet.descKey as keyof typeof TRANSLATIONS['en']] || planet.desc) : (t[\`\${planet.id}_desc\` as keyof typeof t] || TRANSLATIONS['en'][\`\${planet.id}_desc\` as keyof typeof TRANSLATIONS['en']] || planet.desc);`;

const replacement = `              const planet = allBodies.find(p => p.id === selectedPlanet);
              if (!planet) return null;
              const tName = ('nameKey' in planet && planet.nameKey) ? (t[planet.nameKey as keyof typeof t] || TRANSLATIONS['en'][planet.nameKey as keyof typeof TRANSLATIONS['en']] || planet.name) : (t[\`\${planet.id}_name\` as keyof typeof t] || TRANSLATIONS['en'][\`\${planet.id}_name\` as keyof typeof TRANSLATIONS['en']] || planet.name);
              let tDesc = ('descKey' in planet && planet.descKey) ? (t[planet.descKey as keyof typeof t] || TRANSLATIONS['en'][planet.descKey as keyof typeof TRANSLATIONS['en']] || planet.desc) : (t[\`\${planet.id}_desc\` as keyof typeof t] || TRANSLATIONS['en'][\`\${planet.id}_desc\` as keyof typeof TRANSLATIONS['en']] || planet.desc);
              if (!tDesc || (typeof tDesc === 'string' && tDesc.trim() === '')) {
                tDesc = BODY_DETAILS[planet.id]?.funFacts?.join(' ') || 'No description available.';
              }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/SolarSystem.tsx', content);
  console.log('Patched tDesc!');
} else {
  console.log('Target not found!');
}
