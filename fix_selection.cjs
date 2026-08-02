const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const hitLogic = `const hits = [];
    
    for (const p of PLANETS) {
      const pAngle = stateRef.current.time * p.speed;
      const pRadius = getRadius(p.radius, p.id === 'sun');
      const pDistance = getDistance(p.distance);
      const px = Math.cos(pAngle) * pDistance;
      const py = Math.sin(pAngle) * pDistance;
      
      if (p.moons) {
        for (const m of p.moons) {
          const mAngle = stateRef.current.time * m.speed;
          const mRadius = getRadius(m.radius);
          const mDistance = getDistance(m.distance);
          const mx = px + Math.cos(mAngle) * mDistance;
          const my = py + Math.sin(mAngle) * mDistance;
          const mDist = Math.sqrt(Math.pow(worldX - mx, 2) + Math.pow(worldY - my, 2));
          const mHitRadius = Math.max(mRadius * 2, 12 / stateRef.current.zoom);
          if (mDist <= mHitRadius) {
            hits.push({ id: m.id, dist: mDist });
          }
        }
      }
      
      const dist = Math.sqrt(Math.pow(worldX - px, 2) + Math.pow(worldY - py, 2));
      const hitRadius = Math.max(pRadius, 10 / stateRef.current.zoom);
      if (dist <= hitRadius) {
        hits.push({ id: p.id, dist: dist });
      }
    }

    if (configRef.current.showConstellations) {
      for (const c of CONSTELLATIONS) {
        const cx = c.cx;
        const cy = c.cy;
        const dist = Math.sqrt(Math.pow(worldX - cx, 2) + Math.pow(worldY - cy, 2));
        if (dist <= c.hitRadius) {
          hits.push({ id: c.id, dist: dist });
        }
      }
    }

    for (const bh of BLACK_HOLES) {
      const dist = Math.sqrt(Math.pow(worldX - bh.cx, 2) + Math.pow(worldY - bh.cy, 2));
      if (dist <= bh.hitRadius) {
        hits.push({ id: bh.id, dist: dist });
      }
    }

    if (configRef.current.showSpacecraft) {
      for (const sc of SPACECRAFTS) {
        const dist = Math.sqrt(Math.pow(worldX - sc.cx, 2) + Math.pow(worldY - sc.cy, 2));
        if (dist <= sc.hitRadius) {
          hits.push({ id: sc.id, dist: dist });
        }
      }
    }

    let bestHitId = null;
    if (hits.length > 0) {
      hits.sort((a, b) => a.dist - b.dist);
      bestHitId = hits[0].id;
    }`;

content = content.replace(
  /let clickedPlanetId = null;\s*\/\/ Check intersection[\s\S]*?(?=if \(clickedPlanetId\) \{)/,
  hitLogic + '\n\n    let clickedPlanetId = bestHitId;\n    '
);

content = content.replace(
  /let hoveredId = null;\s*for \(const p of PLANETS\) \{[\s\S]*?(?=if \(hoveredId !== hoveredPlanet\) \{)/,
  hitLogic + '\n\n    let hoveredId = bestHitId;\n    '
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
