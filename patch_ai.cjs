const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const target = `          const bodyId = body.id;
          const descKey = body.descKey || \`\${bodyId}_desc\`;
          
          const fallbackDesc = (tMap[descKey as keyof typeof tMap] || tEn[descKey as keyof typeof tEn] || body.desc);
          const resultDesc = fallbackDesc || "Celestial body details currently unavailable.";`;

const replacement = `          const bodyId = body.id;
          const descKey = body.descKey || \`\${bodyId}_desc\`;
          
          let fallbackDesc = (tMap[descKey as keyof typeof tMap] || tEn[descKey as keyof typeof tEn] || body.desc);
          if (!fallbackDesc || (typeof fallbackDesc === 'string' && fallbackDesc.trim() === '')) {
            fallbackDesc = BODY_DETAILS[bodyId]?.funFacts?.join(' ');
          }
          const resultDesc = fallbackDesc || "Celestial body details currently unavailable.";`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/SolarSystem.tsx', content);
  console.log('Patched AI desc!');
} else {
  console.log('Target not found!');
}
