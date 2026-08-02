const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

// Fix Settings Modal
content = content.replace(
  /className="fixed inset-0 z-50 bg-slate-950\/35 flex items-center justify-center p-4 ui-layer"\s*onClick=\{\(e\) => \{\s*if \(!\(e\.target as HTMLElement\)\.closest\('\.panel'\)\) \{\s*setIsSettingsOpen\(false\);\s*\}\s*\}\}\s*>\s*<motion\.div\s*className="panel rounded-2xl shadow-2xl w-full max-w-lg max-h-\[85vh\]/g,
  `className="fixed inset-0 z-50 flex items-center justify-center p-4 ui-layer"
      >
        <motion.div
          variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
          transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed } : { duration: 0 }}
          className="absolute inset-0 bg-slate-950/35 pointer-events-auto"
          onClick={() => setIsSettingsOpen(false)}
        />
        <motion.div
          className="panel relative z-10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh]`
);

// Fix Search Modal
content = content.replace(
  /className="fixed inset-0 z-50 bg-slate-950\/35 flex items-center justify-center p-4 ui-layer"\s*onClick=\{\(e\) => \{\s*if \(!\(e\.target as HTMLElement\)\.closest\('\.panel'\)\) \{\s*setIsSearchOpen\(false\);\s*\}\s*\}\}\s*>\s*<motion\.div\s*className="panel rounded-2xl shadow-2xl w-full max-w-lg max-h-\[82vh\]/g,
  `className="fixed inset-0 z-50 flex items-center justify-center p-4 ui-layer"
      >
        <motion.div
          variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
          transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed } : { duration: 0 }}
          className="absolute inset-0 bg-slate-950/35 pointer-events-auto"
          onClick={() => setIsSearchOpen(false)}
        />
        <motion.div
          className="panel relative z-10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[82vh]`
);

fs.writeFileSync('src/components/SolarSystem.tsx', content);
