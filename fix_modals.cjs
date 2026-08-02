const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

// Fix HDModeModal
content = content.replace(
  /className="fixed inset-0 z-\[60\] bg-slate-950\/35 flex items-center justify-center p-4 ui-layer"\s*>\s*<motion\.div\s*className="relative dual-kawase-glass/g,
  `className="fixed inset-0 z-[60] flex items-center justify-center p-4 ui-layer"
    >
      <motion.div
        variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
        transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed } : { duration: 0 }}
        className="absolute inset-0 bg-slate-950/35 pointer-events-auto"
        onClick={() => { playTapSound && playTapSound(); onClose && onClose(); }}
      />
      <motion.div
        className="relative z-10 dual-kawase-glass`
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
