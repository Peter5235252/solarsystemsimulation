const fs = require('fs');
const file = 'src/components/SolarSystem.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const \[useAI, setUseAI\] = useState\(true\);/g;
const replace = `const [useAI, setUseAI] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('useAI');
    return saved !== null ? saved === 'true' : true;
  }
  return true;
});

useEffect(() => {
  localStorage.setItem('useAI', String(useAI));
}, [useAI]);
`;

code = code.replace(regex, replace);
fs.writeFileSync(file, code);
