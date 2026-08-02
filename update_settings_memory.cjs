const fs = require('fs');

const file = 'src/components/SolarSystem.tsx';
let code = fs.readFileSync(file, 'utf8');

// Function to replace a simple useState with a localStorage-aware one
function addMemoryState(varName, defaultVal, isBoolean = false, isFloat = false) {
  const regex = new RegExp(`const \\\[${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}\\\] = useState\\(${defaultVal}\\);`, 'g');
  
  let initLogic = '';
  if (isBoolean) {
    initLogic = `() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('${varName}');
      return saved !== null ? saved === 'true' : ${defaultVal};
    }
    return ${defaultVal};
  }`;
  } else if (isFloat) {
    initLogic = `() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('${varName}');
      return saved !== null ? parseFloat(saved) : ${defaultVal};
    }
    return ${defaultVal};
  }`;
  } else {
    initLogic = `() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('${varName}');
      return saved !== null ? parseInt(saved, 10) : ${defaultVal};
    }
    return ${defaultVal};
  }`;
  }

  code = code.replace(regex, `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState(${initLogic});`);
}

// Target states
addMemoryState('speedMultiplier', '1', false, true);
addMemoryState('fpsCap', '60');
addMemoryState('showLabels', 'true', true);
addMemoryState('showOrbits', 'true', true);
addMemoryState('showAsteroids', 'true', true);
addMemoryState('showConstellations', 'true', true);
addMemoryState('showSpacecraft', 'true', true);
addMemoryState('hdMode', 'true', true);
addMemoryState('perfMode', 'false', true);
addMemoryState('resScale', '1', false, true);
addMemoryState('uiAnimSpeed', '1', false, true);
// useAI doesn't have a simple true, let's replace it manually if needed

// Now we need to add the useEffects to save these values.
// We can just add a single useEffect after the states are defined.
const effectsToAdd = `
  useEffect(() => {
    localStorage.setItem('speedMultiplier', String(speedMultiplier));
    localStorage.setItem('fpsCap', String(fpsCap));
    localStorage.setItem('showLabels', String(showLabels));
    localStorage.setItem('showOrbits', String(showOrbits));
    localStorage.setItem('showAsteroids', String(showAsteroids));
    localStorage.setItem('showConstellations', String(showConstellations));
    localStorage.setItem('showSpacecraft', String(showSpacecraft));
    localStorage.setItem('hdMode', String(hdMode));
    localStorage.setItem('perfMode', String(perfMode));
    localStorage.setItem('resScale', String(resScale));
    localStorage.setItem('uiAnimSpeed', String(uiAnimSpeed));
  }, [speedMultiplier, fpsCap, showLabels, showOrbits, showAsteroids, showConstellations, showSpacecraft, hdMode, perfMode, resScale, uiAnimSpeed]);
`;

// Insert the effects after uiAnimSpeed definition
const insertPoint = code.indexOf('const [uiAnimSpeed, setUiAnimSpeed] = useState(() => {');
if (insertPoint !== -1) {
  // Find the end of this statement
  const endOfStatement = code.indexOf(';  useEffect(() => {', insertPoint) !== -1 ? code.indexOf(';  useEffect(() => {', insertPoint) : code.indexOf('});', insertPoint) + 3;
  code = code.slice(0, endOfStatement) + effectsToAdd + code.slice(endOfStatement);
}

fs.writeFileSync(file, code);
