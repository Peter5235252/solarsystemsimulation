const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const isPlanetFix = `const isPlanet = PLANETS.some(p => p.id === b.id);
      const isMoon = !isConstellation && !isBlackHole && !isSpacecraft && !isStar && !isPlanet;`;

// Need to be careful because we have two places with `isPlanet`.

content = content.replace(/const isPlanet = !isConstellation && !isBlackHole && !isSpacecraft && !isStar;/g, isPlanetFix);

// Then in the second place where `let typeLabel = 'Moon'` is set:
content = content.replace(
  /} else if \(isPlanet\) \{\s*typeLabel = 'Planet • Solar System';\s*icon = <Globe className="w-4 h-4" style={{ color: b.color \|\| '#38bdf8' }} \/>;\s*\} else if/g,
  `} else if (isPlanet) {
        typeLabel = 'Planet • Solar System';
        icon = <Globe className="w-4 h-4" style={{ color: b.color || '#38bdf8' }} />;
      } else if (isMoon) {
        typeLabel = 'Moon • Natural Satellite';
        icon = <Globe className="w-4 h-4 text-slate-400" />;
      } else if`
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
