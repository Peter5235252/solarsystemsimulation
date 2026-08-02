const fs = require('fs');
const files = [
  'src/components/SolarSystem.tsx',
  'src/components/GeminiSidePanel.tsx',
  'src/components/AIResearcher.tsx',
  'src/components/AITours.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/components/GeminiSidePanel.tsx') {
    content = content.replace(
      /open: { opacity: 1, pointerEvents: "auto", visibility: "visible" },\s*closed: { opacity: 0, pointerEvents: "none", transitionEnd: { visibility: "hidden" } }/g,
      'open: { pointerEvents: "auto", visibility: "visible" },\n        closed: { pointerEvents: "none", transitionEnd: { visibility: "hidden" } }'
    );
  }
  
  if (file === 'src/components/AITours.tsx') {
    content = content.replace(
      /className="fixed bottom-6 left-1\/2 -translate-x-1\/2 z-\[55\] w-\[calc\(100%-2rem\)\] max-w-\[388px\] dual-kawase-glass glass-specular shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-white\/20 ui-layer"/g,
      'className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] w-[calc(100%-2rem)] max-w-[388px] dual-kawase-glass glass-specular shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-white/20 ui-layer"'
    );
    // actually, let's just do a string replacement for AITours activeTour wrapper
    content = content.replace(
      /variants={{\n\s*open: { pointerEvents: "auto", visibility: "visible" },\n\s*closed: { pointerEvents: "none", transitionEnd: { visibility: "hidden" } }\n\s*}}/g,
      'variants={{\n          open: { pointerEvents: "auto", visibility: "visible" },\n          closed: { pointerEvents: "none", transitionEnd: { visibility: "hidden" } }\n        }}'
    );
  }

  if (file === 'src/components/SolarSystem.tsx' || file === 'src/components/AIResearcher.tsx') {
    // For SolarSystem.tsx settings and search modal
    content = content.replace(
      /variants={{\n\s*open: { opacity: 1 },\n\s*closed: { opacity: 0 }\n\s*}}\n\s*transition=\{uiAnimations \? { duration: 0.15 \/ uiAnimSpeed } : { duration: 0 }\}\n\s*className="panel/g,
      'className="panel'
    );
    content = content.replace(
      /variants={{\n\s*open: { opacity: 1 },\n\s*closed: { opacity: 0 }\n\s*}}\n\s*transition=\{uiAnimations \? { duration: 0.15 \/ uiAnimSpeed, ease: 'easeOut' } : { duration: 0 }\}\n\s*className="relative dual-kawase-glass/g,
      'className="relative dual-kawase-glass'
    );
  }
  
  fs.writeFileSync(file, content);
});
