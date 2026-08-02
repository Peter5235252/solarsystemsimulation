const fs = require('fs');

function unifyFile(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(/text-indigo-400/g, 'text-slate-400');
  code = code.replace(/text-indigo-300/g, 'text-slate-300');
  code = code.replace(/text-indigo-200/g, 'text-slate-200');
  code = code.replace(/text-indigo-100/g, 'text-slate-100');
  code = code.replace(/text-amber-400/g, 'text-slate-400');
  
  code = code.replace(/bg-indigo-500\/5/g, 'bg-slate-800/20');
  code = code.replace(/bg-indigo-500\/10/g, 'bg-slate-800/40');
  code = code.replace(/bg-indigo-500\/15/g, 'bg-slate-800/40');
  code = code.replace(/bg-indigo-500\/20/g, 'bg-slate-800/50');
  code = code.replace(/bg-indigo-500\/50/g, 'bg-slate-600/50');
  code = code.replace(/bg-indigo-500/g, 'bg-slate-700');
  code = code.replace(/bg-indigo-600\/20/g, 'bg-slate-800/80');
  code = code.replace(/bg-indigo-950\/40/g, 'bg-slate-900/80');
  code = code.replace(/hover:bg-indigo-600/g, 'hover:bg-slate-600');
  code = code.replace(/hover:bg-indigo-500\/15/g, 'hover:bg-slate-800');
  code = code.replace(/hover:bg-indigo-500\/20/g, 'hover:bg-slate-800');
  code = code.replace(/hover:bg-indigo-400/g, 'hover:bg-slate-300');

  code = code.replace(/border-indigo-500\/20/g, 'border-slate-700/60');
  code = code.replace(/border-indigo-500\/25/g, 'border-slate-700/60');
  code = code.replace(/border-indigo-500\/30/g, 'border-slate-700/60');
  code = code.replace(/border-indigo-500\/40/g, 'border-slate-700/60');
  code = code.replace(/border-indigo-500\/50/g, 'border-slate-600/60');
  code = code.replace(/focus:border-indigo-500\/30/g, 'focus:border-slate-600/60');
  code = code.replace(/focus:border-indigo-500\/50/g, 'focus:border-slate-600/60');
  code = code.replace(/focus:ring-indigo-500\/50/g, 'focus:ring-slate-600/50');

  code = code.replace(/shadow-indigo-500\/25/g, 'shadow-slate-900/50');
  code = code.replace(/from-indigo-500\/10 to-purple-500\/5/g, 'from-slate-800/20 to-slate-900/20');
  code = code.replace(/from-indigo-500 to-purple-500/g, 'from-slate-700 to-slate-600');

  fs.writeFileSync(file, code);
  console.log('Updated ' + file);
}

unifyFile('src/components/AIResearcher.tsx');
unifyFile('src/components/AITours.tsx');
unifyFile('src/components/GeminiSidePanel.tsx');
