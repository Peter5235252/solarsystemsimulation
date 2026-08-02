const fs = require('fs');

let file = 'src/components/SolarSystem.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace colorful icon classes in search items generator
code = code.replace(/text-sky-400/g, 'text-slate-400');
code = code.replace(/text-amber-400/g, 'text-slate-400');
code = code.replace(/text-amber-500/g, 'text-slate-400');
code = code.replace(/text-indigo-400/g, 'text-slate-400');
code = code.replace(/text-indigo-300/g, 'text-slate-300');
code = code.replace(/text-indigo-200/g, 'text-slate-200');
code = code.replace(/text-cyan-400/g, 'text-slate-400');
code = code.replace(/text-purple-400/g, 'text-slate-400');
code = code.replace(/text-rose-400/g, 'text-slate-400');
code = code.replace(/text-emerald-400/g, 'text-slate-400');
code = code.replace(/text-emerald-300/g, 'text-slate-300');
code = code.replace(/text-blue-400/g, 'text-slate-400');

// Replace indigo backgrounds, borders and rings in SolarSystem
code = code.replace(/bg-indigo-500\/10/g, 'bg-slate-700/40');
code = code.replace(/bg-indigo-500\/15/g, 'bg-slate-700/40');
code = code.replace(/bg-indigo-500\/20/g, 'bg-slate-700/40');
code = code.replace(/bg-indigo-500\/5/g, 'bg-slate-800/40');
code = code.replace(/bg-indigo-500/g, 'bg-slate-700');
code = code.replace(/hover:bg-indigo-600/g, 'hover:bg-slate-600');
code = code.replace(/hover:bg-indigo-500\/10/g, 'hover:bg-slate-800');
code = code.replace(/hover:bg-indigo-500\/15/g, 'hover:bg-slate-800');
code = code.replace(/hover:bg-indigo-500\/20/g, 'hover:bg-slate-800');
code = code.replace(/border-indigo-500\/10/g, 'border-slate-700/50');
code = code.replace(/border-indigo-500\/20/g, 'border-slate-600/50');
code = code.replace(/border-indigo-500\/25/g, 'border-slate-600/50');
code = code.replace(/border-indigo-500\/30/g, 'border-slate-600/50');
code = code.replace(/border-indigo-500\/40/g, 'border-slate-600/50');
code = code.replace(/border-indigo-500/g, 'border-slate-600');
code = code.replace(/shadow-indigo-500\/10/g, 'shadow-slate-900/50');
code = code.replace(/shadow-indigo-500\/25/g, 'shadow-slate-900/50');
code = code.replace(/from-indigo-500 to-purple-500/g, 'from-slate-700 to-slate-600');
code = code.replace(/bg-indigo-950\/40/g, 'bg-slate-900/80');
code = code.replace(/border-indigo-800\/30/g, 'border-slate-700/60');
code = code.replace(/bg-indigo-600\/20/g, 'bg-slate-800');

// Replace emerald / rose / amber / cyan badge colors in search results
code = code.replace(/bg-emerald-500\/20 text-emerald-300 border border-emerald-500\/30/g, 'bg-slate-700/50 text-slate-200 border border-slate-600/60');
code = code.replace(/bg-amber-500\/10 text-amber-400 border-amber-500\/20/g, 'bg-slate-800 text-slate-300 border border-slate-700/60');
code = code.replace(/bg-cyan-500\/10 text-cyan-400 border-cyan-500\/20/g, 'bg-slate-800 text-slate-300 border border-slate-700/60');
code = code.replace(/bg-emerald-500\/10 text-emerald-400 border-emerald-500\/20/g, 'bg-slate-800 text-slate-300 border border-slate-700/60');
code = code.replace(/bg-purple-500\/10 text-purple-400 border-purple-500\/20/g, 'bg-slate-800 text-slate-300 border border-slate-700/60');
code = code.replace(/bg-rose-500\/10 text-rose-400 border-rose-500\/20/g, 'bg-slate-800 text-slate-300 border border-slate-700/60');
code = code.replace(/bg-blue-500\/10 text-blue-400 border-blue-500\/20/g, 'bg-slate-800 text-slate-300 border border-slate-700/60');
code = code.replace(/bg-rose-500\/10/g, 'bg-slate-800');
code = code.replace(/bg-emerald-500\/10/g, 'bg-slate-800');

fs.writeFileSync(file, code);
console.log('Updated SolarSystem.tsx theme');
