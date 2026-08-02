import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ZoomIn, ZoomOut, MousePointer2, ChevronUp, ChevronDown, Settings, Play, Pause, RotateCcw, X, Info, AlertTriangle, Search, Globe, Star, Share2, Sun, Aperture, Rocket, Sparkles, Wand2, Loader2, Thermometer, Weight, Activity, BookOpen, Monitor, Sliders, Volume2, VolumeX, Eye, EyeOff, Gauge, Zap, Bot, Grid, Cpu, Layers, Languages, Check, Focus, Command, CornerDownLeft, SlidersHorizontal, Compass, History, Trash2, CircleDot, Moon, Maximize2, Snowflake, ShieldCheck, Orbit } from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import AIResearcher from './AIResearcher';
import { GeminiSidePanel } from './GeminiSidePanel';
import { CustomDropdown, DropdownOption } from './CustomDropdown';
import { LanguageCode, LANGUAGES, TRANSLATIONS } from '../i18n';
import { CONSTELLATIONS } from '../data/constellations';
import { BLACK_HOLES } from '../data/blackHoles';
import { SPACECRAFTS } from '../data/spacecrafts';
import { CelestialMiniPreview } from './CelestialMiniPreview';
import { WebGpuDisabledModal } from './WebGpuDisabledModal';

const BODY_DETAILS: Record<string, {
  type: string;
  mass?: string;
  gravity?: string;
  temp?: string;
  funFacts: string[];
}> = {
  'sun': { type: 'Yellow Dwarf Star', mass: '333,000 × Earth', temp: '5,500°C', gravity: '274 m/s²', funFacts: ['Accounts for 99.86% of the mass in the solar system.', 'Its core temperature is about 15 million degrees Celsius.'] },
  'mercury': { type: 'Terrestrial Planet', mass: '0.055 × Earth', temp: '-173°C to 427°C', gravity: '3.7 m/s²', funFacts: ['It has a completely molten core.', 'A year on Mercury is just 88 Earth days.'] },
  'venus': { type: 'Terrestrial Planet', mass: '0.815 × Earth', temp: '462°C', gravity: '8.87 m/s²', funFacts: ['Venus spins in the opposite direction to most planets.', 'Its atmospheric pressure is 92 times that of Earth.'] },
  'earth': { type: 'Terrestrial Planet', mass: '1 × Earth', temp: '-89°C to 58°C', gravity: '9.807 m/s²', funFacts: ['The only planet not named after a god.', 'Earth is actually a squashed sphere, not a perfect round ball.'] },
  'moon': { type: 'Natural Satellite', mass: '0.0123 × Earth', temp: '-173°C to 127°C', gravity: '1.62 m/s²', funFacts: ['Always shows the same face to Earth.', 'Its surface is actually dark, despite appearing bright in the sky.'] },
  'mars': { type: 'Terrestrial Planet', mass: '0.107 × Earth', temp: '-153°C to 20°C', gravity: '3.721 m/s²', funFacts: ['Home to the highest mountain in the solar system, Olympus Mons.', 'Sunsets on Mars appear blue.'] },
  'jupiter': { type: 'Gas Giant', mass: '318 × Earth', temp: '-145°C', gravity: '24.79 m/s²', funFacts: ['The Great Red Spot is a storm that has lasted for hundreds of years.', 'Jupiter has 95 officially recognized moons.'] },
  'saturn': { type: 'Gas Giant', mass: '95 × Earth', temp: '-178°C', gravity: '10.44 m/s²', funFacts: ['Saturn could float in water because it is mostly made of gas.', 'Its rings are made of chunks of ice and rock.'] },
  'titan': { type: 'Natural Satellite', mass: '0.0225 × Earth', temp: '-179°C', gravity: '1.35 m/s²', funFacts: ['The only moon in our solar system with a dense atmosphere.', 'Has lakes and rivers of liquid methane.'] },
  'rhea': { type: 'Natural Satellite', mass: '0.00039 × Earth', temp: '-174°C', gravity: '0.264 m/s²', funFacts: ['Saturn\'s second-largest moon.', 'May have a tenuous ring system of its own.'] },
  'enceladus': { type: 'Natural Satellite', mass: '0.000018 × Earth', temp: '-201°C', gravity: '0.113 m/s²', funFacts: ['Has water-rich plumes erupting from its south pole.', 'One of the most reflective bodies in the solar system.'] },
  'dione': { type: 'Natural Satellite', mass: '0.00018 × Earth', temp: '-186°C', gravity: '0.232 m/s²', funFacts: ['Features bright ice cliffs created by tectonic fractures.', 'Orbits Saturn in resonance with Enceladus.'] },
  'tethys': { type: 'Natural Satellite', mass: '0.00010 × Earth', temp: '-187°C', gravity: '0.146 m/s²', funFacts: ['Contains a massive impact crater named Odysseus.', 'Composed almost entirely of water ice.'] },
  'uranus': { type: 'Ice Giant', mass: '14.5 × Earth', temp: '-195°C', gravity: '8.69 m/s²', funFacts: ['Uranus rotates on its side.', 'It is the coldest planetary atmosphere in the solar system.'] },
  'neptune': { type: 'Ice Giant', mass: '17.1 × Earth', temp: '-201°C', gravity: '11.15 m/s²', funFacts: ['Wind speeds can reach 2,100 km/h here.', 'It has a very faint ring system.'] },
  'pluto': { type: 'Dwarf Planet', mass: '0.00218 × Earth', temp: '-225°C', gravity: '0.62 m/s²', funFacts: ['Pluto was reclassified from a planet to a dwarf planet in 2006.', 'It has a prominent heart-shaped glacier named Tombaugh Regio.'] },
  'charon': { type: 'Natural Satellite', mass: '0.00025 × Earth', temp: '-220°C', gravity: '0.288 m/s²', funFacts: ['Charon is about half the size of Pluto.', 'It has a reddish north pole region called Macula.'] },


  'iss': { type: 'Space Station', mass: '419,725 kg', temp: '20°C (Internal)', gravity: 'Microgravity', funFacts: ['Orbits Earth 16 times a day.', 'Has been continuously occupied since 2000.'] },
  'voyager1': { type: 'Space Probe', mass: '722 kg', temp: '-238°C (External)', gravity: 'N/A', funFacts: ['Farthest human-made object from Earth.', 'Carries the Golden Record.'] },
  'voyager2': { type: 'Space Probe', mass: '722 kg', temp: '-238°C (External)', gravity: 'N/A', funFacts: ['The only spacecraft to have visited Uranus and Neptune.', 'Currently in interstellar space.'] },
  'newhorizons': { type: 'Space Probe', mass: '478 kg', temp: '-230°C (External)', gravity: 'N/A', funFacts: ['First spacecraft to explore Pluto up close.', 'Flew by Arrokoth in the Kuiper Belt.'] },
  'cassini': { type: 'Space Probe', mass: '5,712 kg', temp: '-150°C (External)', gravity: 'N/A', funFacts: ['Orbited Saturn for 13 years.', 'Purposefully plunged into Saturn\'s atmosphere at the end of its mission.'] },
  'jwst': { type: 'Space Telescope', mass: '6,161 kg', temp: '-233°C (Sunshield)', gravity: 'Microgravity', funFacts: ['Largest optical telescope in space.', 'Optimized for infrared observation to look back in time.'] },
  'apollo11': { type: 'Spacecraft', mass: '45,468 kg', temp: '20°C (Internal)', gravity: 'N/A', funFacts: ['First crewed mission to land on the Moon.', 'Command module named Columbia, lunar module named Eagle.'] },
  'hubble': { type: 'Space Telescope', mass: '11,110 kg', temp: '20°C (Internal)', gravity: 'Microgravity', funFacts: ['Launched in 1990.', 'Has made over 1.5 million observations.'] },
  'sagittarius_a': { type: 'Supermassive Black Hole', mass: '4.1 Million × Sun', temp: '10M °C (Accretion Disk)', gravity: 'Singularity', funFacts: ['Located at the center of the Milky Way.', 'Discovered from the motion of nearby stars.'] },
  'm87_star': { type: 'Supermassive Black Hole', mass: '6.5 Billion × Sun', temp: '100M °C (Accretion Disk)', gravity: 'Singularity', funFacts: ['First black hole to be directly imaged.', 'Located in the Virgo galaxy cluster.'] },
  'cygnus_x1': { type: 'Stellar Black Hole', mass: '21 × Sun', temp: '2M °C (Accretion Disk)', gravity: 'Singularity', funFacts: ['First widely accepted black hole candidate.', 'Discovered in 1964 from intense X-ray emissions.'] },
  'orion': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['One of the most recognizable constellations.', 'Contains the red supergiant Betelgeuse.'] },
  'ursa_major': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Contains the Big Dipper asterism.', 'Its name means "Great Bear" in Latin.'] },
  'cassiopeia': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Easily recognizable "W" shape.', 'Named after a vain queen in Greek mythology.'] },
  'scorpius': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Contains the bright red star Antares.', 'One of the oldest known constellations.'] },
  'cygnus': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Also known as the Northern Cross.', 'Contains the black hole Cygnus X-1.'] },
  'crux': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['The smallest of the 88 modern constellations.', 'Featured on the flags of multiple Southern Hemisphere countries.'] },
  'canis_major': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Contains Sirius, the brightest star in the night sky.', 'Represents one of Orion\'s hunting dogs.'] },
  'lyra': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Contains Vega, the fifth brightest star.', 'Represents the lyre of Orpheus.'] },
  'virgo': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['The largest constellation of the Zodiac.', 'Contains the massive Virgo galaxy cluster.'] },
  'pegasus': { type: 'Constellation', mass: 'Stellar Region', temp: 'Varies', gravity: 'N/A', funFacts: ['Named after the winged horse of Greek mythology.', 'Contains the prominent Great Square asterism.'] }
};
const PLANETS = [
  { id: 'sun', name: 'Sun', color: '#fbbf24', radius: 45, distance: 0, speed: 0, sides: 12, desc: 'The Sun is a yellow dwarf star at the heart of our solar system, providing the energy that sustains all life on Earth.' },
  { id: 'mercury', name: 'Mercury', color: '#a8a29e', radius: 6, distance: 85, speed: 0.04, sides: 5, desc: 'Mercury is the smallest and fastest planet in the solar system, orbiting closest to the Sun with extreme temperature variances.' },
  { id: 'venus', name: 'Venus', color: '#fcd34d', radius: 12, distance: 130, speed: 0.015, sides: 6, desc: 'Venus is often called Earth\'s twin due to its similar size, but its thick, toxic atmosphere makes it the hottest planet in our system.' },
  { id: 'earth', name: 'Earth', color: '#60a5fa', radius: 14, distance: 180, speed: 0.01, sides: 7, desc: 'Earth is our home planet, the third from the Sun, and the only world known to harbor an abundance of life.', 
    moons: [{ id: 'moon', name: 'Moon', color: '#d6d3d1', radius: 3, distance: 22, speed: 0.05, sides: 4, desc: 'The Moon is Earth\'s only natural satellite, playing a crucial role in stabilizing our planet\'s wobble and driving the tides.' }] 
  },
  { id: 'mars', name: 'Mars', color: '#f87171', radius: 10, distance: 230, speed: 0.008, sides: 6, desc: 'Mars is known as the Red Planet due to iron oxide on its surface, and it is home to Olympus Mons, the largest volcano in the solar system.' },
  { id: 'jupiter', name: 'Jupiter', color: '#d97706', radius: 32, distance: 350, speed: 0.002, sides: 9, desc: 'Jupiter is a massive gas giant, the largest planet in our system, known for its Great Red Spot and dozens of moons.' },
  { id: 'saturn', name: 'Saturn', color: '#fde68a', radius: 26, distance: 480, speed: 0.0009, sides: 8, rings: true, desc: 'Saturn is famous for its complex and extensive ring system, the most spectacular in the solar system.',
    moons: [
      { id: 'titan', name: 'Titan', color: '#f59e0b', radius: 6, distance: 130, speed: 0.012, sides: 6, desc: 'Titan is Saturn\'s largest moon and the only moon known to have a dense atmosphere and liquid lakes on its surface.' },
      { id: 'rhea', name: 'Rhea', color: '#d1d5db', radius: 4, distance: 100, speed: 0.015, sides: 5, desc: 'Rhea is the second-largest moon of Saturn, heavily cratered and composed mainly of water ice.' },
      { id: 'enceladus', name: 'Enceladus', color: '#f8fafc', radius: 3, distance: 52, speed: 0.025, sides: 4, desc: 'Enceladus is an icy moon famous for its subsurface ocean and water-rich plumes erupting from its south pole.' },
      { id: 'dione', name: 'Dione', color: '#cbd5e1', radius: 3.5, distance: 80, speed: 0.018, sides: 5, desc: 'Dione is a small moon of Saturn with a heavily cratered surface and distinctive wispy cliffs.' },
      { id: 'tethys', name: 'Tethys', color: '#e2e8f0', radius: 3.5, distance: 65, speed: 0.02, sides: 5, desc: 'Tethys is a mid-sized icy moon featuring a massive impact crater called Odysseus.' }
    ]
  },
  { id: 'uranus', name: 'Uranus', color: '#2dd4bf', radius: 18, distance: 620, speed: 0.0004, sides: 7, desc: 'Uranus is an ice giant that is unique for its extreme tilt, rotating completely on its side compared to the other planets.' },
  { id: 'neptune', name: 'Neptune', color: '#3b82f6', radius: 18, distance: 750, speed: 0.0001, sides: 7, desc: 'Neptune is the most distant major planet, a dark and cold world whipped by supersonic winds.' },
  { id: 'pluto', name: 'Pluto', color: '#fed7aa', radius: 4, distance: 900, speed: 0.00005, sides: 5, desc: 'Pluto is a dwarf planet in the Kuiper belt, famously known for its heart-shaped surface feature.',
    moons: [{ id: 'charon', name: 'Charon', color: '#e7e5e4', radius: 2, distance: 15, speed: 0.03, sides: 4, desc: 'Charon is the largest of Pluto\'s five moons and is so big that Pluto and Charon orbit each other like a double planet.' }]
  },
];

const CELESTIAL_COLOR_BY_ID: Record<string, string> = {
  sun: '#fbbf24',
};
PLANETS.forEach(p => {
  CELESTIAL_COLOR_BY_ID[p.id.toLowerCase()] = p.color;
  if (p.moons) {
    p.moons.forEach(m => {
      CELESTIAL_COLOR_BY_ID[m.id.toLowerCase()] = m.color;
    });
  }
});
BLACK_HOLES.forEach(bh => {
  CELESTIAL_COLOR_BY_ID[bh.id.toLowerCase()] = bh.color;
});
SPACECRAFTS.forEach(sc => {
  CELESTIAL_COLOR_BY_ID[sc.id.toLowerCase()] = sc.color;
});
CONSTELLATIONS.forEach(c => {
  CELESTIAL_COLOR_BY_ID[c.id.toLowerCase()] = c.color || '#60a5fa';
});

const ASTEROIDS = Array.from({ length: 120 }).map(() => ({
  distance: 280 + Math.random() * 40,
  angle: Math.random() * Math.PI * 2,
  speed: 0.003 + Math.random() * 0.003,
  radius: 1 + Math.random() * 2,
  sides: Math.floor(3 + Math.random() * 3),
  color: Math.random() > 0.5 ? '#78716c' : '#57534e'
}));

const STARS = Array.from({ length: 15000 }).map(() => {
  const dist = Math.sqrt(Math.random()) * 80000;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: dist * Math.cos(angle),
    y: dist * Math.sin(angle),
    radius: 0.5 + Math.random() * 1.5,
    alpha: 0.2 + Math.random() * 0.6
  };
});

const getRadius = (r: number, isStar = false) => {
  if (isStar) return r;
  return Math.max(8, r * 0.7); // Planets are smaller but still visible and proportional
};

const getDistance = (d: number) => {
  if (d === 0) return d;
  return d * 2.5 + 80; // more balanced distances
};

function drawPolyPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number, reverse = false) {
  for (let i = 0; i <= sides; i++) {
    let index = reverse ? sides - i : i;
    const a = (Math.PI * 2 * index) / sides;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
}

const Toggle = ({ label, icon, checked, onChange }: { label: string, icon?: React.ReactNode, checked: boolean, onChange: (c: boolean) => void }) => (
  <label className="flex items-center justify-between cursor-pointer group py-0.5">
    <div className="flex items-center gap-2">
      {icon && <span className="text-slate-400 group-hover:text-slate-200 transition-colors shrink-0">{icon}</span>}
      <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors">{label}</span>
    </div>
    <div className="relative shrink-0">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-slate-400' : 'bg-slate-700'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

const GlassPanel = ({ children, className = '', lightColor }: { children: React.ReactNode, className?: string, lightColor?: string }) => {
  return (
    <div className={`relative overflow-hidden dual-kawase-glass glass-specular ${className}`}>
      <div className="relative z-10 w-full h-full flex flex-col min-h-0">{children}</div>
    </div>
  );
};

const HDModeModal = ({ isOpen, onClose, onConfirm, playTapSound, title, desc, btnCancel, btnConfirm, uiAnimations = true, uiAnimSpeed = 1 }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="hd-mode-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 ui-layer"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => { playTapSound && playTapSound(); onClose && onClose(); }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={uiAnimations ? { duration: 0.22 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
            className="relative z-10 dual-kawase-glass glass-specular rounded-2xl p-6 shadow-2xl max-w-sm w-full overflow-hidden border border-white/20 pointer-events-auto"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-slate-400 mb-4 tracking-tight flex items-center gap-3">
                <AlertTriangle className="w-7 h-7" /> {title}
              </h2>
              <p className="text-slate-300 mb-8 font-mono text-sm leading-relaxed">
                {desc}
              </p>
              <div className="flex gap-3 justify-end mt-2">
                <button 
                  onClick={() => { playTapSound(); onClose(); }} 
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium active:scale-[0.98] active:opacity-80 active:duration-75 transition-all outline-none"
                >
                  {btnCancel}
                </button>
                <button 
                  onClick={() => { playTapSound(); onConfirm(); }} 
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold active:scale-[0.98] active:opacity-80 active:duration-75 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] outline-none"
                >
                  {btnConfirm}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PerfModeModal = ({ isOpen, onClose, onConfirm, playTapSound, title, desc, btnCancel, btnConfirm, uiAnimations = true, uiAnimSpeed = 1 }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="perf-mode-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 ui-layer"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
            onClick={() => { playTapSound && playTapSound(); onClose && onClose(); }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={uiAnimations ? { duration: 0.22 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
            className="relative z-10 dual-kawase-glass glass-specular rounded-2xl p-6 shadow-2xl max-w-sm w-full overflow-hidden border border-white/20 pointer-events-auto"
          >
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-emerald-500 mb-4 tracking-tight flex items-center gap-3">
                <Info className="w-7 h-7" /> {title}
              </h2>
              <p className="text-slate-300 mb-8 font-mono text-sm leading-relaxed">
                {desc}
              </p>
              <div className="flex gap-3 justify-end mt-2">
                <button 
                  onClick={() => { playTapSound(); onClose(); }} 
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium active:scale-[0.98] active:opacity-80 active:duration-75 transition-all outline-none"
                >
                  {btnCancel}
                </button>
                <button 
                  onClick={() => { playTapSound(); onConfirm(); }} 
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold active:scale-[0.98] active:opacity-80 active:duration-75 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] outline-none"
                >
                  {btnConfirm}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webgpuCanvasRef = useRef<HTMLCanvasElement>(null);
  const labelCanvasRef = useRef<HTMLCanvasElement>(null);

  const [sharpenLevel, setSharpenLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sharpenLevel');
      return saved !== null ? parseFloat(saved) : 0.65;
    }
    return 0.65;
  });

  useEffect(() => {
    localStorage.setItem('sharpenLevel', String(sharpenLevel));
  }, [sharpenLevel]);

  // Graphics Quality Preset State ('low' | 'medium' | 'high' | 'ultra' | 'custom')
  const [graphicsPreset, setGraphicsPreset] = useState<'low' | 'medium' | 'high' | 'ultra' | 'custom'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('graphicsPreset');
      return (saved as any) || 'high';
    }
    return 'high';
  });

  useEffect(() => {
    localStorage.setItem('graphicsPreset', graphicsPreset);
  }, [graphicsPreset]);

  // WebGPU Visual Effects Toggles
  const [enableBloom, setEnableBloom] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enableBloom');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [enableChromatic, setEnableChromatic] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enableChromatic');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [enableLensFlare, setEnableLensFlare] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enableLensFlare');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [enableCosmicDust, setEnableCosmicDust] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enableCosmicDust');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [enableVignette, setEnableVignette] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('enableVignette');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [aiAuraEffect, setAiAuraEffect] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiAuraEffect');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const [aiGridWave, setAiGridWave] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiGridWave');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const [aiPlasmaGlow, setAiPlasmaGlow] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiPlasmaGlow');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const [aiNebulaPulse, setAiNebulaPulse] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiNebulaPulse');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const [aiCustomShaderEnabled, setAiCustomShaderEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiCustomShaderEnabled');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  const DEFAULT_WGSL_CODE = `// AI WebGPU Post-Processing Shader Effect (WGSL)
// Verified W3C WebGPU Shading Language Standards
// - Explicit float literals: 1.0, 0.5f
// - Modern WGSL vector types: vec2f, vec4f

@group(0) @binding(0) var srcSampler: sampler;
@group(0) @binding(1) var srcTexture: texture_2d<f32>;

struct Uniforms {
  time: f32,
  resolution: vec2f,
  intensity: f32,
};
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let color = textureSample(srcTexture, srcSampler, uv);
  let wave = sin(uv.y * 24.0 + uniforms.time * 2.5) * 0.04 * uniforms.intensity;
  let warpedUv = vec2f(uv.x + wave, uv.y);
  let warpedColor = textureSample(srcTexture, srcSampler, warpedUv);
  
  return vec4f(warpedColor.rgb, color.a);
}`;

  const [aiCustomWgslCode, setAiCustomWgslCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiCustomWgslCode');
      return saved || DEFAULT_WGSL_CODE;
    }
    return DEFAULT_WGSL_CODE;
  });

  useEffect(() => {
    localStorage.setItem('enableBloom', String(enableBloom));
    localStorage.setItem('enableChromatic', String(enableChromatic));
    localStorage.setItem('enableLensFlare', String(enableLensFlare));
    localStorage.setItem('enableCosmicDust', String(enableCosmicDust));
    localStorage.setItem('enableVignette', String(enableVignette));
    localStorage.setItem('aiAuraEffect', String(aiAuraEffect));
    localStorage.setItem('aiGridWave', String(aiGridWave));
    localStorage.setItem('aiPlasmaGlow', String(aiPlasmaGlow));
    localStorage.setItem('aiNebulaPulse', String(aiNebulaPulse));
    localStorage.setItem('aiCustomShaderEnabled', String(aiCustomShaderEnabled));
    localStorage.setItem('aiCustomWgslCode', aiCustomWgslCode);
  }, [enableBloom, enableChromatic, enableLensFlare, enableCosmicDust, enableVignette, aiAuraEffect, aiGridWave, aiPlasmaGlow, aiNebulaPulse, aiCustomShaderEnabled, aiCustomWgslCode]);

  const [wasdSpeed, setWasdSpeed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wasdSpeed');
      if (saved !== null) {
        const num = parseFloat(saved);
        if (!isNaN(num)) return num;
      }
    }
    return 12;
  });

  useEffect(() => {
    localStorage.setItem('wasdSpeed', String(wasdSpeed));
  }, [wasdSpeed]);

  const keysPressedRef = useRef<Set<string>>(new Set());

  const applyGraphicsPreset = (preset: 'low' | 'medium' | 'high' | 'ultra' | 'custom') => {
    setGraphicsPreset(preset);
    if (preset === 'custom') return;
    if (preset === 'low') {
      setResScale(0.50);
      setSharpenLevel(0.60);
      setEnableBloom(false);
      setEnableChromatic(false);
      setEnableLensFlare(false);
      setEnableCosmicDust(false);
      setEnableVignette(false);
    } else if (preset === 'medium') {
      setResScale(0.75);
      setSharpenLevel(0.65);
      setEnableBloom(true);
      setEnableChromatic(false);
      setEnableLensFlare(true);
      setEnableCosmicDust(true);
      setEnableVignette(true);
    } else if (preset === 'high') {
      setResScale(0.85);
      setSharpenLevel(0.70);
      setEnableBloom(true);
      setEnableChromatic(true);
      setEnableLensFlare(true);
      setEnableCosmicDust(true);
      setEnableVignette(true);
    } else if (preset === 'ultra') {
      setResScale(1.0);
      setSharpenLevel(0.0);
      setEnableBloom(true);
      setEnableChromatic(true);
      setEnableLensFlare(true);
      setEnableCosmicDust(true);
      setEnableVignette(true);
    }
  };

  const [isWebGpuActive, setIsWebGpuActive] = useState(false);
  const [isWebGpuDisabled, setIsWebGpuDisabled] = useState(false);
  const [webGpuDisabledReason, setWebGpuDisabledReason] = useState<string>('');
  const isWebGpuHaltedRef = useRef(false);
  const restartRenderLoopRef = useRef<(() => void) | null>(null);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredSearchItem, setHoveredSearchItem] = useState<SuperSearchItem | null>(null);
  const [hoveredRecentSearch, setHoveredRecentSearch] = useState<any | null>(null);
  const [hoveredTimeEvent, setHoveredTimeEvent] = useState<any | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSearchOpen) {
      setHoveredSearchItem(null);
      setHoveredRecentSearch(null);
      setHoveredTimeEvent(null);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  const [isAIResearcherOpen, setIsAIResearcherOpen] = useState(false);
  const [aiResearcherQuestion, setAiResearcherQuestion] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('useAI');
    return saved !== null ? saved === 'true' : true;
  }
  return true;
});

useEffect(() => {
  localStorage.setItem('useAI', String(useAI));
}, [useAI]);

  const [aiModel, setAiModel] = useState<'Gemini' | 'ChatGPT' | 'Claude' | 'Mistral' | 'Grok'>(() => {
    return (localStorage.getItem("aiModel") as any) || "Gemini";
  });
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("geminiApiKey") || "");

  useEffect(() => {
    localStorage.setItem("aiModel", aiModel);
  }, [aiModel]);

  const [isGeminiSidePanelOpen, setIsGeminiSidePanelOpen] = useState(false);
  const [geminiSidePanelQuestion, setGeminiSidePanelQuestion] = useState<string | null>(null);

  const [recentSearches, setRecentSearches] = useState<Array<{ id: string; title: string; subtitle: string; category: string; badge?: string }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("superSearchRecents");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) { console.error(e); }
      }
    }
    return [
      { id: 'earth', title: 'Earth', subtitle: 'Planet • Solar System', category: 'Celestial' },
      { id: 'mars', title: 'Mars', subtitle: 'Planet • Solar System', category: 'Celestial' },
      { id: 'toggle-perf', title: 'Performance Mode', subtitle: 'Graphics Preset Optimization', category: 'Settings' }
    ];
  });

  useEffect(() => {
    localStorage.setItem("superSearchRecents", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const recordRecentSearch = (item: { id: string; title: string; subtitle: string; category: string; badge?: string }) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(x => x.id !== item.id && x.title.toLowerCase() !== item.title.toLowerCase());
      return [item, ...filtered].slice(0, 8);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("superSearchRecents");
  };

  const removeRecentSearch = (id: string) => {
    setRecentSearches(prev => prev.filter(x => x.id !== id));
  };

  useEffect(() => {
    localStorage.setItem("geminiApiKey", geminiKey);
  }, [geminiKey]);

  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  const getDisplayTemp = (tempStr: string) => {
    if (tempUnit === 'C') return tempStr;
    return tempStr.replace(/-?\d+(?:,\d+)?/g, (match) => {
      const num = parseFloat(match.replace(',', ''));
      if (isNaN(num)) return match;
      const f = Math.round((num * 9) / 5 + 32);
      return f.toLocaleString();
    }).replace(/°C/g, '°F');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSearchColor, setHoveredSearchColor] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isDescLoading, setIsDescLoading] = useState(false);
  const descriptionAbortController = useRef<AbortController | null>(null);
  const descriptionCacheRef = useRef<Record<string, string>>({});

  const [searchScrollTop, setSearchScrollTop] = useState(0);
  const [searchScrollHeight, setSearchScrollHeight] = useState(0);
  const [searchClientHeight, setSearchClientHeight] = useState(0);
  const searchScrollRef = useRef<HTMLDivElement>(null);

  const findBodyIdByQuery = (q: string): string | null => {
    const cleanQ = q.trim().toLowerCase();
    if (!cleanQ) return null;
    if (cleanQ === 'planet' || cleanQ === 'planets') return 'earth';
    
    const allBodies = [
      { id: 'sun', name: 'Sun' },
      ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
      ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id })),
      ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id })),
      ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name }))
    ];

    const exactId = allBodies.find(b => b.id.toLowerCase() === cleanQ);
    if (exactId) return exactId.id;

    const startMatch = allBodies.find(b => b.name.toLowerCase().startsWith(cleanQ));
    if (startMatch) return startMatch.id;

    const anyMatch = allBodies.find(b => b.name.toLowerCase().includes(cleanQ));
    if (anyMatch) return anyMatch.id;

    return null;
  };

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const matchComplete = query.match(/^([a-z0-9\s-]+)\s+vs\s+([a-z0-9\s-]+)$/i);
    if (matchComplete) {
      const leftQ = matchComplete[1].trim();
      const rightQ = matchComplete[2].trim();
      let leftId = leftQ === 'planet' || leftQ === 'planets' ? 'earth' : findBodyIdByQuery(leftQ);
      let rightId = rightQ === 'planet' || rightQ === 'planets' ? 'mars' : findBodyIdByQuery(rightQ);
      
      if (leftId && rightId) {
        setCompareLeftId(leftId);
        setCompareRightId(rightId);
        setSearchCategory('Compare');
      }
    } else {
      const matchPartial = query.match(/^([a-z0-9\s-]+)\s+vs\s*$/i);
      if (matchPartial) {
        const leftQ = matchPartial[1].trim();
        let leftId = leftQ === 'planet' || leftQ === 'planets' ? 'earth' : findBodyIdByQuery(leftQ);
        if (leftId) {
          setCompareLeftId(leftId);
          setSearchCategory('Compare');
        }
      }
    }
  }, [searchQuery]);

  const handleSearchScroll = () => {
    if (searchScrollRef.current) {
      setSearchScrollTop(searchScrollRef.current.scrollTop);
      setSearchScrollHeight(searchScrollRef.current.scrollHeight);
      setSearchClientHeight(searchScrollRef.current.clientHeight);
    }
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.pageY;
    const startScrollTop = searchScrollRef.current?.scrollTop || 0;
    const trackHeight = searchClientHeight - 16;
    const thumbHeight = Math.max(20, (searchClientHeight / (searchScrollHeight || 1)) * trackHeight);
    const thumbScrollableRange = trackHeight - thumbHeight;
    const containerScrollableRange = searchScrollHeight - searchClientHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.pageY - startY;
      const scrollRatioDelta = thumbScrollableRange > 0 ? deltaY / thumbScrollableRange : 0;
      if (searchScrollRef.current) {
        searchScrollRef.current.scrollTop = startScrollTop + scrollRatioDelta * containerScrollableRange;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleThumbTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startY = touch.pageY;
    const startScrollTop = searchScrollRef.current?.scrollTop || 0;
    const trackHeight = searchClientHeight - 16;
    const thumbHeight = Math.max(20, (searchClientHeight / (searchScrollHeight || 1)) * trackHeight);
    const thumbScrollableRange = trackHeight - thumbHeight;
    const containerScrollableRange = searchScrollHeight - searchClientHeight;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touchMove = moveEvent.touches[0];
      const deltaY = touchMove.pageY - startY;
      const scrollRatioDelta = thumbScrollableRange > 0 ? deltaY / thumbScrollableRange : 0;
      if (searchScrollRef.current) {
        searchScrollRef.current.scrollTop = startScrollTop + scrollRatioDelta * containerScrollableRange;
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const deviceType = 'pc';

  const [activeCategory, setActiveCategory] = useState<'All' | 'Planets' | 'Stars' | 'Black Holes' | 'Spacecraft' | 'Constellations'>('All');
  const [searchCategory, setSearchCategory] = useState<'All' | 'Celestial' | 'Settings' | 'Actions' | 'Tools' | 'Compare' | 'Distance' | 'TimeTravel'>('All');
  const [celestialFilter, setCelestialFilter] = useState<'all' | 'planet' | 'moon' | 'spacecraft' | 'blackhole' | 'constellation'>('all');
  const [cliFeedback, setCliFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [compareLeftId, setCompareLeftId] = useState<string>('earth');
  const [compareRightId, setCompareRightId] = useState<string>('mars');
  const [calcSourceId, setCalcSourceId] = useState<string>('earth');
  const [calcTargetId, setCalcTargetId] = useState<string>('mars');
  const [calcSpeedType, setCalcSpeedType] = useState<'f1' | 'jet' | 'apollo' | 'voyager' | 'light' | 'custom'>('light');
  const [calcCustomSpeed, setCalcCustomSpeed] = useState<string>('100');
  const [activeTimeEvent, setActiveTimeEvent] = useState<any | null>(null);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [showHDModal, setShowHDModal] = useState(false);
  const [showPerfModal, setShowPerfModal] = useState(false);
  
  // Settings State
  const [settingsTab, setSettingsTab] = useState<'graphics' | 'ai_effects' | 'simulation' | 'preferences'>('graphics');
  const previousSpeedRef = useRef(1);
  const lang: LanguageCode = 'en';
  const [speedMultiplier, setSpeedMultiplier] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speedMultiplier');
      return saved !== null ? parseFloat(saved) : 1;
    }
    return 1;
  });
  const [fpsCap, setFpsCap] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fpsCap');
      return saved !== null ? parseInt(saved, 10) : 60;
    }
    return 60;
  });
  const [showLabels, setShowLabels] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showLabels');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [showOrbits, setShowOrbits] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showOrbits');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [showAsteroids, setShowAsteroids] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showAsteroids');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [showConstellations, setShowConstellations] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showConstellations');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [showSpacecraft, setShowSpacecraft] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showSpacecraft');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [actualFps, setActualFps] = useState(0);
  const fpsFrameCountRef = useRef(0);
  const fpsLastTimeRef = useRef(0);
  const [hdMode, setHdMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hdMode');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [perfMode, setPerfMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('perfMode');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });
  const [resScale, setResScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resScale');
      return saved !== null ? parseFloat(saved) : 1;
    }
    return 1;
  });
  const [renderMs, setRenderMs] = useState(1.5);
  const renderTimeSumRef = useRef(0);
  const renderFrameCountRef = useRef(0);
  const [uiAnimations, setUiAnimations] = useState(true);
  const [uiAnimSpeed, setUiAnimSpeed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('uiAnimSpeed');
      return saved !== null ? parseFloat(saved) : 1;
    }
    return 1;
  });
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


  useEffect(() => {
    if (perfMode) {
      setUiAnimations(false);
      document.documentElement.classList.add('perf-mode');
    } else {
      setUiAnimations(true);
      document.documentElement.classList.remove('perf-mode');
    }
  }, [perfMode]);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang];
  
  const filteredBodies = useMemo(() => {
    const allBodies = [
      ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
      ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
      ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
      ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
    ];
    return allBodies.filter(b => {
      const isConstellation = CONSTELLATIONS.some(c => c.id === b.id);
      const isBlackHole = BLACK_HOLES.some(bh => bh.id === b.id);
      const isSpacecraft = SPACECRAFTS.some(s => s.id === b.id);
      const isStar = b.id === 'sun';
      const isPlanet = PLANETS.some(p => p.id === b.id);
      const isMoon = !isConstellation && !isBlackHole && !isSpacecraft && !isStar && !isPlanet;

      if (activeCategory === 'Planets' && !isPlanet) return false;
      if (activeCategory === 'Stars' && !isStar) return false;
      if (activeCategory === 'Black Holes' && !isBlackHole) return false;
      if (activeCategory === 'Spacecraft' && !isSpacecraft) return false;
      if (activeCategory === 'Constellations' && !isConstellation) return false;

      const tName = ('nameKey' in b && b.nameKey) ? ((t as any)[b.nameKey] || (TRANSLATIONS['en'] as any)[b.nameKey] || b.name) : (t[`${b.id}_name` as keyof typeof t] || TRANSLATIONS['en'][`${b.id}_name` as keyof typeof TRANSLATIONS['en']] || b.name);
      return tName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, activeCategory, t]);

  const handleSelectBody = async (body: any, shouldLock: boolean = true) => {
    const isConstellation = CONSTELLATIONS.some(c => c.id === body.id);
    const isSpacecraft = SPACECRAFTS.some(s => s.id === body.id);
    playTapSound();
    
    setIsSearchOpen(!shouldLock);
    setSearchQuery('');

    if (shouldLock) {
      if (stateRef.current.lockedPlanetId !== body.id) {
        stateRef.current.isCameraLocked = false;
      }
      stateRef.current.lockedPlanetId = body.id;
    }
    setSelectedPlanet(body.id);
    
    const cacheKey = `${body.id}_${lang}`;
    if (descriptionCacheRef.current[cacheKey]) {
      setAiDescription(descriptionCacheRef.current[cacheKey]);
      setIsDescLoading(false);
      return;
    }

    setAiDescription('');
    
    if (useAI) {
      setIsDescLoading(true);

      if (descriptionAbortController.current) {
        descriptionAbortController.current.abort();
      }
      descriptionAbortController.current = new AbortController();

      // Get translated name for the prompt to give better context to AI
      const tMap = TRANSLATIONS[lang];
      const tEn = TRANSLATIONS['en'];
      const tName = ('nameKey' in body && body.nameKey) 
        ? (tMap[body.nameKey as keyof typeof tMap] || tEn[body.nameKey as keyof typeof tEn] || body.name) 
        : (tMap[`${body.id}_name` as keyof typeof tMap] || tEn[`${body.id}_name` as keyof typeof tEn] || body.name);

      // Generate dynamic AI description
      try {
        const languageName = LANGUAGES.find(l => l.code === lang)?.name || 'English';
        const systemInstruction = `You are a concise stellar guide. You provide extremely short (max 20 words) raw text descriptions in the requested language. Use proper grammar and punctuation. NEVER use formatting of any kind. No asterisks (*), no backticks (\`), NO exceptions.`;
        const prompt = `Write a extremely concise 1-sentence description of the celestial body "${tName}" in ${languageName}. 
        Do not include its name in the sentence if possible. Just describe it. 
        STRICT REQUIREMENT: Use proper grammar, punctuation, and apostrophes (e.g. "Earth's").
        DO NOT use any formatting, no markdown, no asterisks, no backticks. Only raw text. No introduction.`;

        let fullText = "";

        // Server-side AI call
        try {
          const response = await fetch('/api/ai/description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, systemInstruction, apiKey: geminiKey, provider: aiModel, aiModelName: aiModel }),
            signal: descriptionAbortController.current.signal
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.text) {
              fullText = data.text;
              descriptionCacheRef.current[cacheKey] = fullText;
              setAiDescription(fullText);
            }
          }
        } catch (apiError: any) {
          if (apiError.name !== 'AbortError') {
            console.warn("AI Proxy Error:", apiError);
          }
        }

        // If AI failed, use the hardcoded translated description
        if (!fullText) {
          const tMap = TRANSLATIONS[lang];
          const tEn = TRANSLATIONS['en'];
          
          // Unified lookup for spacecrafts, planets, moons, constellations, etc.
          const bodyId = body.id;
          const descKey = body.descKey || `${bodyId}_desc`;
          
          let fallbackDesc = (tMap[descKey as keyof typeof tMap] || tEn[descKey as keyof typeof tEn] || body.desc);
          if (!fallbackDesc || (typeof fallbackDesc === 'string' && fallbackDesc.trim() === '')) {
            fallbackDesc = BODY_DETAILS[bodyId]?.funFacts?.join(' ');
          }
          const resultDesc = fallbackDesc || "Celestial body details currently unavailable.";
          descriptionCacheRef.current[cacheKey] = resultDesc;
          setAiDescription(resultDesc);
        }
      } catch (error) {
        console.error("General AI Description Error:", error);
      } finally {
        setIsDescLoading(false);
      }
    }

    if ('nameKey' in body && body.nameKey && !showConstellations && isConstellation) {
      setShowConstellations(true);
    }
    if (isSpacecraft && !showSpacecraft) {
      setShowSpacecraft(true);
    }
  };

  const handleCommandRun = (cmdText: string) => {
    const clean = cmdText.trim().substring(1).trim();
    const parts = clean.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim().toLowerCase();

    let success = false;
    let msg = '';

    if (cmd === 'help') {
      msg = 'Commands: > orbits [on/off/toggle], > labels [on/off/toggle], > asteroids [on/off/toggle], > spacecraft [on/off/toggle], > constellations [on/off/toggle], > speed [0-10], > pause, > play, > reset, > travel [body]';
      success = true;
    } else if (cmd === 'orbits') {
      if (arg === 'on') { setShowOrbits(true); success = true; msg = 'Orbits enabled'; }
      else if (arg === 'off') { setShowOrbits(false); success = true; msg = 'Orbits disabled'; }
      else if (!arg || arg === 'toggle') { setShowOrbits(prev => !prev); success = true; msg = `Orbits toggled`; }
      else { msg = 'Usage: > orbits [on/off/toggle]'; }
    } else if (cmd === 'labels') {
      if (arg === 'on') { setShowLabels(true); success = true; msg = 'Labels enabled'; }
      else if (arg === 'off') { setShowLabels(false); success = true; msg = 'Labels disabled'; }
      else if (!arg || arg === 'toggle') { setShowLabels(prev => !prev); success = true; msg = `Labels toggled`; }
      else { msg = 'Usage: > labels [on/off/toggle]'; }
    } else if (cmd === 'asteroids') {
      if (arg === 'on') { setShowAsteroids(true); success = true; msg = 'Asteroids enabled'; }
      else if (arg === 'off') { setShowAsteroids(false); success = true; msg = 'Asteroids disabled'; }
      else if (!arg || arg === 'toggle') { setShowAsteroids(prev => !prev); success = true; msg = `Asteroids toggled`; }
      else { msg = 'Usage: > asteroids [on/off/toggle]'; }
    } else if (cmd === 'spacecraft') {
      if (arg === 'on') { setShowSpacecraft(true); success = true; msg = 'Spacecraft enabled'; }
      else if (arg === 'off') { setShowSpacecraft(false); success = true; msg = 'Spacecraft disabled'; }
      else if (!arg || arg === 'toggle') { setShowSpacecraft(prev => !prev); success = true; msg = `Spacecraft toggled`; }
      else { msg = 'Usage: > spacecraft [on/off/toggle]'; }
    } else if (cmd === 'constellations') {
      if (arg === 'on') { setShowConstellations(true); success = true; msg = 'Constellations enabled'; }
      else if (arg === 'off') { setShowConstellations(false); success = true; msg = 'Constellations disabled'; }
      else if (!arg || arg === 'toggle') { setShowConstellations(prev => !prev); success = true; msg = `Constellations toggled`; }
      else { msg = 'Usage: > constellations [on/off/toggle]'; }
    } else if (cmd === 'speed') {
      const val = parseFloat(arg);
      if (!isNaN(val) && val >= 0 && val <= 10) {
        setSpeedMultiplier(val);
        success = true;
        msg = `Simulation speed set to ${val}x`;
      } else {
        msg = 'Usage: > speed [0-10] (e.g., > speed 2.5)';
      }
    } else if (cmd === 'pause') {
      setSpeedMultiplier(0);
      success = true;
      msg = 'Simulation paused';
    } else if (cmd === 'play' || cmd === 'resume') {
      setSpeedMultiplier(1);
      success = true;
      msg = 'Simulation playing';
    } else if (cmd === 'reset') {
      resetCamera();
      setSpeedMultiplier(1);
      success = true;
      msg = 'Simulation reset to default';
    } else if (cmd === 'travel' || cmd === 'go') {
      const allBodies = [
        { id: 'sun', name: 'Sun' },
        ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
        ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
        ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
        ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
      ];
      const found = allBodies.find(b => b.id === arg || b.name.toLowerCase() === arg);
      if (found) {
        handleSelectBody(found, true);
        success = true;
        msg = `Warping to ${found.name}...`;
      } else {
        msg = `Body "${arg}" not found. Try: sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, moon, iss, jwst.`;
      }
    } else {
      msg = `Unknown command "${cmd}". Type "> help" for info.`;
    }

    playTapSound();
    return { success, msg };
  };

  const handleAIAction = (rawAction: { type: string; [key: string]: any }) => {
    if (!rawAction) return;

    // Normalize action type
    let type = (rawAction.type || '').toLowerCase().replace(/_/g, '');
    if (type === 'opensettings') type = 'open_settings';
    else if (type === 'closesettings') type = 'close_settings';
    else if (type === 'selectplanet' || type === 'selectbody' || type === 'focusplanet' || type === 'focusbody' || type === 'focus' || type === 'travel') type = 'select_planet';
    else if (type === 'setsetting' || type === 'modifysetting' || type === 'changesetting' || type === 'togglesetting') type = 'set_setting';
    else if (type === 'applypreset' || type === 'setpreset' || type === 'graphicspreset' || type === 'setgraphics') type = 'apply_preset';
    else if (type === 'setaieffect' || type === 'aieffect' || type === 'aigraphicseffect' || type === 'customshader' || type === 'wgslshader' || type === 'createshader' || type === 'generateshader' || type === 'applyshader' || type === 'webgpushader') type = 'set_ai_effect';

    switch (type) {
      case 'open_settings': {
        const tab = String(rawAction.tab || rawAction.value || '').toLowerCase();
        if (tab === 'graphics' || tab === 'ai_effects' || tab === 'aieffects' || tab === 'effects' || tab === 'simulation' || tab === 'preferences') {
          setSettingsTab(tab.includes('effect') || tab === 'ai_effects' ? 'ai_effects' : (tab as any));
        }
        setIsSettingsOpen(true);
        break;
      }
      case 'close_settings':
        setIsSettingsOpen(false);
        break;
      case 'set_ai_effect': {
        const effect = String(rawAction.effect || rawAction.name || '').toLowerCase();
        const enabled = rawAction.enabled !== undefined ? !!rawAction.enabled : true;
        if (effect.includes('aura') || effect.includes('lensing')) setAiAuraEffect(enabled);
        if (effect.includes('grid') || effect.includes('quantum')) setAiGridWave(enabled);
        if (effect.includes('plasma') || effect.includes('thermal')) setAiPlasmaGlow(enabled);
        if (effect.includes('nebula') || effect.includes('aurora')) setAiNebulaPulse(enabled);

        const wgsl = rawAction.wgslCode || rawAction.wgsl || rawAction.code || rawAction.shader;
        if (effect.includes('custom') || effect.includes('shader') || effect.includes('wgsl') || wgsl || !effect) {
          setAiCustomShaderEnabled(enabled);
          if (wgsl && typeof wgsl === 'string') {
            setAiCustomWgslCode(wgsl);
          }
        }
        break;
      }
      case 'apply_preset': {
        const presetVal = String(rawAction.preset || rawAction.value || '').toLowerCase();
        if (['low', 'medium', 'high', 'ultra', 'custom'].includes(presetVal)) {
          applyGraphicsPreset(presetVal as any);
        }
        break;
      }
      case 'select_planet': {
        const id = rawAction.id || rawAction.bodyId || rawAction.value || rawAction.planet || rawAction.name || rawAction.target;
        if (!id || id === 'null' || id === 'none' || id === 'deselect' || id === 'reset') {
          stateRef.current.lockedPlanetId = null;
          setSelectedPlanet(null);
        } else {
          const allBodies = [
            ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
            ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
            ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
            ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
          ];
          const query = String(id).toLowerCase().trim().replace(/_/g, '').replace(/\s+/g, '');
          const foundFlexible = allBodies.find(b => {
            const bid = b.id.toLowerCase().replace(/_/g, '');
            const bname = b.name.toLowerCase().replace(/_/g, '').replace(/\s+/g, '');
            return bid === query || bname === query || bid.includes(query) || query.includes(bid);
          });
          if (foundFlexible) {
            handleSelectBody(foundFlexible, true);
          }
        }
        break;
      }
      case 'set_setting': {
        let name = (rawAction.name || '').toLowerCase().replace(/_/g, '');
        const value = rawAction.value;

        // Normalize setting name
        if (name === 'showorbits' || name === 'orbits' || name === 'orbitlines') name = 'showOrbits';
        else if (name === 'showlabels' || name === 'labels' || name === 'names') name = 'showLabels';
        else if (name === 'showasteroids' || name === 'asteroids' || name === 'asteroidbelt') name = 'showAsteroids';
        else if (name === 'showconstellations' || name === 'constellations' || name === 'constellationlines') name = 'showConstellations';
        else if (name === 'showspacecraft' || name === 'spacecraft' || name === 'probes') name = 'showSpacecraft';
        else if (name === 'perfmode' || name === 'performance' || name === 'performancemode') name = 'perfMode';
        else if (name === 'hdmode' || name === 'hd' || name === 'highdefinition') name = 'hdMode';
        else if (name === 'tempunit' || name === 'temperature' || name === 'temp') name = 'tempUnit';
        else if (name === 'speedmultiplier' || name === 'speed' || name === 'orbitspeed' || name === 'simulationspeed') name = 'speedMultiplier';
        else if (name === 'lang' || name === 'language') name = 'lang';
        else if (name === 'resscale' || name === 'fsr' || name === 'fsrmode' || name === 'resolutionscale' || name === 'resolution' || name === 'scale') name = 'resScale';
        else if (name === 'sharpenlevel' || name === 'sharpening' || name === 'sharpen' || name === 'cas') name = 'sharpenLevel';
        else if (name === 'graphicspreset' || name === 'preset' || name === 'quality' || name === 'graphics') name = 'graphicsPreset';
        else if (name === 'enablebloom' || name === 'bloom') name = 'enableBloom';
        else if (name === 'enablechromatic' || name === 'chromatic' || name === 'chromaticaberration') name = 'enableChromatic';
        else if (name === 'enablelensflare' || name === 'lensflare' || name === 'flare') name = 'enableLensFlare';
        else if (name === 'enablecosmicdust' || name === 'cosmicdust' || name === 'dust' || name === 'particles') name = 'enableCosmicDust';
        else if (name === 'enablevignette' || name === 'vignette') name = 'enableVignette';
        else if (name === 'fpscap' || name === 'fps' || name === 'framerate') name = 'fpsCap';
        else if (name === 'aiauraeffect' || name === 'auraeffect' || name === 'lensingeffect' || name === 'cosmiclensing') name = 'aiAuraEffect';
        else if (name === 'aigridwave' || name === 'gridwave' || name === 'quantumgrid') name = 'aiGridWave';
        else if (name === 'aiplasmaglow' || name === 'plasmaglow' || name === 'thermalheatmap') name = 'aiPlasmaGlow';
        else if (name === 'ainebulapulse' || name === 'nebulapulse' || name === 'aurorashield') name = 'aiNebulaPulse';
        else if (name === 'aicustomshaderenabled' || name === 'customshader' || name === 'customaishader') name = 'aiCustomShaderEnabled';
        else if (name === 'aicustomwgslcode' || name === 'wgslcode' || name === 'customwgsl') name = 'aiCustomWgslCode';

        if (name === 'showOrbits') setShowOrbits(!!value);
        else if (name === 'showLabels') setShowLabels(!!value);
        else if (name === 'showAsteroids') setShowAsteroids(!!value);
        else if (name === 'showConstellations') setShowConstellations(!!value);
        else if (name === 'showSpacecraft') setShowSpacecraft(!!value);
        else if (name === 'perfMode') {
          setPerfMode(!!value);
        }
        else if (name === 'hdMode') {
          setHdMode(!!value);
        }
        else if (name === 'tempUnit') {
          const u = String(value).toUpperCase();
          if (u === 'C' || u === 'F') setTempUnit(u as 'C' | 'F');
        }
        else if (name === 'speedMultiplier') {
          const numVal = parseFloat(value);
          if (!isNaN(numVal)) setSpeedMultiplier(numVal);
        }
        else if (name === 'graphicsPreset') {
          const p = String(value).toLowerCase();
          if (['low', 'medium', 'high', 'ultra', 'custom'].includes(p)) {
            applyGraphicsPreset(p as any);
          }
        }
        else if (name === 'resScale') {
          let scaleNum = parseFloat(value);
          if (isNaN(scaleNum)) {
            const strVal = String(value).toLowerCase().trim();
            if (strVal.includes('perf') || strVal === 'performance') scaleNum = 0.50;
            else if (strVal.includes('balan') || strVal === 'balanced') scaleNum = 0.67;
            else if (strVal.includes('qual') || strVal === 'quality') scaleNum = 0.75;
            else if (strVal.includes('ultra')) scaleNum = 0.85;
            else if (strVal.includes('native') || strVal.includes('off') || strVal === '1') scaleNum = 1.0;
          } else if (scaleNum > 1.0 && scaleNum <= 100) {
            scaleNum = scaleNum / 100.0;
          }
          if (!isNaN(scaleNum)) {
            let clamped = Math.max(0.2, Math.min(1.0, scaleNum));
            setResScale(clamped);
            if (clamped >= 0.999) {
              setSharpenLevel(0);
            } else if (sharpenLevel === 0) {
              setSharpenLevel(0.65);
            }
            setGraphicsPreset('custom');
          }
        }
        else if (name === 'sharpenLevel') {
          let sNum = parseFloat(value);
          if (sNum > 1.0 && sNum <= 100) sNum = sNum / 100.0;
          if (!isNaN(sNum)) {
            setSharpenLevel(Math.max(0.0, Math.min(1.0, sNum)));
            setGraphicsPreset('custom');
          }
        }
        else if (name === 'enableBloom') {
          setEnableBloom(!!value);
          setGraphicsPreset('custom');
        }
        else if (name === 'enableChromatic') {
          setEnableChromatic(!!value);
          setGraphicsPreset('custom');
        }
        else if (name === 'enableLensFlare') {
          setEnableLensFlare(!!value);
          setGraphicsPreset('custom');
        }
        else if (name === 'enableCosmicDust') {
          setEnableCosmicDust(!!value);
          setGraphicsPreset('custom');
        }
        else if (name === 'enableVignette') {
          setEnableVignette(!!value);
          setGraphicsPreset('custom');
        }
        else if (name === 'fpsCap') {
          const fpsNum = parseInt(value, 10);
          if (!isNaN(fpsNum)) setFpsCap(fpsNum);
        }
        else if (name === 'aiAuraEffect') {
          setAiAuraEffect(!!value);
        }
        else if (name === 'aiGridWave') {
          setAiGridWave(!!value);
        }
        else if (name === 'aiPlasmaGlow') {
          setAiPlasmaGlow(!!value);
        }
        else if (name === 'aiNebulaPulse') {
          setAiNebulaPulse(!!value);
        }
        else if (name === 'aiCustomShaderEnabled') {
          setAiCustomShaderEnabled(!!value);
        }
        else if (name === 'aiCustomWgslCode' && typeof value === 'string') {
          setAiCustomWgslCode(value);
          setAiCustomShaderEnabled(true);
        }
        break;
      }
      default:
        break;
    }
  };
  
  const stateRef = useRef({
    cameraX: 0,
    cameraY: 0,
    zoom: 1,
    targetZoom: 1,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    time: 0,
    glows: {} as Record<string, number>,
    lockedPlanetId: null as string | null,
    lastLockedPlanetId: null as string | null,
    isCameraLocked: false,
    focusFactor: 0,
    mouseX: 0,
    mouseY: 0
  });

  const audioContext = useRef<AudioContext | null>(null);
  const configRef = useRef({ speedMultiplier, fpsCap, showLabels, showOrbits, showAsteroids, showConstellations, showSpacecraft, hdMode, perfMode, selectedPlanet, hoveredPlanet, lang, deviceType, resScale, sharpenLevel, graphicsPreset, enableBloom, enableChromatic, enableLensFlare, enableCosmicDust, enableVignette, wasdSpeed, aiAuraEffect, aiGridWave, aiPlasmaGlow, aiNebulaPulse, aiCustomShaderEnabled, aiCustomWgslCode, isModalOpen: isSettingsOpen || isSearchOpen || isAIResearcherOpen, isSearchOpen, isAIResearcherOpen });
  
  useEffect(() => {
    configRef.current = { speedMultiplier, fpsCap, showLabels, showOrbits, showAsteroids, showConstellations, showSpacecraft, hdMode, perfMode, selectedPlanet, hoveredPlanet, lang, deviceType, resScale, sharpenLevel, graphicsPreset, enableBloom, enableChromatic, enableLensFlare, enableCosmicDust, enableVignette, wasdSpeed, aiAuraEffect, aiGridWave, aiPlasmaGlow, aiNebulaPulse, aiCustomShaderEnabled, aiCustomWgslCode, isModalOpen: isSettingsOpen || isSearchOpen || isAIResearcherOpen, isSearchOpen, isAIResearcherOpen };
  }, [speedMultiplier, fpsCap, showLabels, showOrbits, showAsteroids, showConstellations, showSpacecraft, hdMode, perfMode, selectedPlanet, hoveredPlanet, lang, deviceType, resScale, sharpenLevel, graphicsPreset, enableBloom, enableChromatic, enableLensFlare, enableCosmicDust, enableVignette, wasdSpeed, aiAuraEffect, aiGridWave, aiPlasmaGlow, aiNebulaPulse, aiCustomShaderEnabled, aiCustomWgslCode, isSettingsOpen, isSearchOpen, isAIResearcherOpen]);

  // WebGPU Visual FX & FSR Renderer Setup
  interface WebGPURenderer {
    device: GPUDevice;
    context: GPUCanvasContext;
    pipeline: GPURenderPipeline;
    sampler: GPUSampler;
    uniformBuffer: GPUBuffer;
    uniformsArray: Float32Array;
    bindGroup: GPUBindGroup | null;
    inputTexture: GPUTexture | null;
    textureWidth: number;
    textureHeight: number;
  }

  const webgpuRef = useRef<WebGPURenderer | null>(null);
  const webgpuInitAttempted = useRef(false);

  const initWebGPU = async () => {
    if (typeof window === 'undefined') return;

    if (!('gpu' in (navigator as any))) {
      setIsWebGpuActive(false);
      setIsWebGpuDisabled(true);
      isWebGpuHaltedRef.current = true;
      setWebGpuDisabledReason('The WebGPU standard API (navigator.gpu) is not present or enabled in your browser.');
      return;
    }

    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        setIsWebGpuActive(false);
        setIsWebGpuDisabled(true);
        isWebGpuHaltedRef.current = true;
        setWebGpuDisabledReason('navigator.gpu.requestAdapter() returned null. Hardware acceleration or WebGPU browser flags may be turned off.');
        return;
      }

      const device = await adapter.requestDevice();
      if (!device) {
        setIsWebGpuActive(false);
        setIsWebGpuDisabled(true);
        isWebGpuHaltedRef.current = true;
        setWebGpuDisabledReason('adapter.requestDevice() failed to return a valid GPUDevice instance.');
        return;
      }

      const webgpuCanvas = webgpuCanvasRef.current;
      if (!webgpuCanvas) {
        setIsWebGpuActive(false);
        setIsWebGpuDisabled(true);
        isWebGpuHaltedRef.current = true;
        setWebGpuDisabledReason('WebGPU canvas DOM element reference is not mounted.');
        return;
      }

      const context = webgpuCanvas.getContext('webgpu') as GPUCanvasContext | null;
      if (!context) {
        setIsWebGpuActive(false);
        setIsWebGpuDisabled(true);
        isWebGpuHaltedRef.current = true;
        setWebGpuDisabledReason('webgpuCanvas.getContext("webgpu") returned null.');
        return;
      }

        const format = (navigator as any).gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: 'opaque'
        });

        const wgslCode = `
          struct Uniforms {
            sharpness: f32,
            inputWidth: f32,
            inputHeight: f32,
            time: f32,
            bloomStrength: f32,
            chromaticAberration: f32,
            lensFlare: f32,
            dustShimmer: f32,
            sunCenterX: f32,
            sunCenterY: f32,
            vignette: f32,
            resScaleRatio: f32,
            cameraZoom: f32,
            focusFactor: f32,
          };

          @group(0) @binding(0) var uSampler: sampler;
          @group(0) @binding(1) var uTexture: texture_2d<f32>;
          @group(0) @binding(2) var<uniform> uniforms: Uniforms;

          struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) uv: vec2f,
          };

          @vertex
          fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
            var pos = array<vec2f, 6>(
              vec2f(-1.0, -1.0),
              vec2f( 1.0, -1.0),
              vec2f(-1.0,  1.0),
              vec2f(-1.0,  1.0),
              vec2f( 1.0, -1.0),
              vec2f( 1.0,  1.0)
            );
            var uv = array<vec2f, 6>(
              vec2f(0.0, 1.0),
              vec2f(1.0, 1.0),
              vec2f(0.0, 0.0),
              vec2f(0.0, 0.0),
              vec2f(1.0, 1.0),
              vec2f(1.0, 0.0)
            );

            var output: VertexOutput;
            output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
            output.uv = uv[vertexIndex];
            return output;
          }

          fn hash22(p: vec2f) -> f32 {
            var p3 = fract(vec3f(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
          }

          // ACES Filmic Tone Mapping for Wide Dynamic Range HDR
          fn acesFilmic(x: vec3f) -> vec3f {
            let a = 2.51;
            let b = 0.03;
            let c = 2.43;
            let d = 0.59;
            let e = 0.14;
            return clamp((x * (a * x + b)) / (x * (c * x + d) + e), vec3f(0.0), vec3f(1.0));
          }

          // AMD FSR 1.0 EASU (Edge Adaptive Spatial Upsampling)
          fn fsrEasu(uv: vec2f, inputSize: vec2f) -> vec3f {
            let dx = 1.0 / max(1.0, inputSize.x);
            let dy = 1.0 / max(1.0, inputSize.y);

            let c  = textureSampleLevel(uTexture, uSampler, uv, 0.0).rgb;
            let n  = textureSampleLevel(uTexture, uSampler, uv + vec2f(0.0, -dy), 0.0).rgb;
            let s  = textureSampleLevel(uTexture, uSampler, uv + vec2f(0.0, dy), 0.0).rgb;
            let w  = textureSampleLevel(uTexture, uSampler, uv + vec2f(-dx, 0.0), 0.0).rgb;
            let e  = textureSampleLevel(uTexture, uSampler, uv + vec2f(dx, 0.0), 0.0).rgb;

            let nw = textureSampleLevel(uTexture, uSampler, uv + vec2f(-dx, -dy), 0.0).rgb;
            let ne = textureSampleLevel(uTexture, uSampler, uv + vec2f(dx, -dy), 0.0).rgb;
            let sw = textureSampleLevel(uTexture, uSampler, uv + vec2f(-dx, dy), 0.0).rgb;
            let se = textureSampleLevel(uTexture, uSampler, uv + vec2f(dx, dy), 0.0).rgb;

            let lumaC = dot(c, vec3f(0.2126, 0.7152, 0.0722));
            let lumaN = dot(n, vec3f(0.2126, 0.7152, 0.0722));
            let lumaS = dot(s, vec3f(0.2126, 0.7152, 0.0722));
            let lumaW = dot(w, vec3f(0.2126, 0.7152, 0.0722));
            let lumaE = dot(e, vec3f(0.2126, 0.7152, 0.0722));

            let dirX = abs(lumaE - lumaW);
            let dirY = abs(lumaS - lumaN);
            let diag1 = abs(dot(ne - sw, vec3f(0.333)));
            let diag2 = abs(dot(nw - se, vec3f(0.333)));

            let edgeStrength = clamp((dirX + dirY + diag1 + diag2) * 3.0, 0.0, 1.0);

            let horizVert = (n + s + w + e) * 0.25;
            let diagonal = (nw + ne + sw + se) * 0.25;
            let edgeColor = mix(horizVert, diagonal, step(dirY + diag2, dirX + diag1));

            return mix(c, edgeColor, edgeStrength * 0.7);
          }

          // AMD FSR 1.0 RCAS (Robust Contrast Adaptive Sharpening)
          fn fsrRcas(baseCol: vec3f, uv: vec2f, inputSize: vec2f, sharpness: f32) -> vec3f {
            if (sharpness <= 0.001) {
              return baseCol;
            }
            let dx = 1.0 / max(1.0, inputSize.x);
            let dy = 1.0 / max(1.0, inputSize.y);

            let e = textureSampleLevel(uTexture, uSampler, uv + vec2f(dx, 0.0), 0.0).rgb;
            let w = textureSampleLevel(uTexture, uSampler, uv - vec2f(dx, 0.0), 0.0).rgb;
            let n = textureSampleLevel(uTexture, uSampler, uv - vec2f(0.0, dy), 0.0).rgb;
            let s = textureSampleLevel(uTexture, uSampler, uv + vec2f(0.0, dy), 0.0).rgb;

            let lumaM = dot(baseCol, vec3f(0.2126, 0.7152, 0.0722));
            let lumaE = dot(e, vec3f(0.2126, 0.7152, 0.0722));
            let lumaW = dot(w, vec3f(0.2126, 0.7152, 0.0722));
            let lumaN = dot(n, vec3f(0.2126, 0.7152, 0.0722));
            let lumaS = dot(s, vec3f(0.2126, 0.7152, 0.0722));

            let mn = min(lumaM, min(min(lumaE, lumaW), min(lumaN, lumaS)));
            let mx = max(lumaM, max(max(lumaE, lumaW), max(lumaN, lumaS)));

            let contrastRange = mx - mn;
            let peak = 1.0 - saturate(contrastRange * 1.5);
            let weight = clamp(sharpness * peak * 0.5, 0.0, 0.4);

            return clamp(baseCol + (4.0 * baseCol - (e + w + n + s)) * weight, vec3f(0.0), vec3f(1.0));
          }

          // Anamorphic Lens Flare & Solar Diffraction
          fn anamorphicLensFlare(uv: vec2f, texSize: vec2f, sunUV: vec2f, intensity: f32) -> vec3f {
            if (sunUV.x < -0.4 || sunUV.x > 1.4 || sunUV.y < -0.4 || sunUV.y > 1.4) {
              return vec3f(0.0);
            }
            let aspect = texSize.x / max(1.0, texSize.y);
            let delta = uv - sunUV;
            let sunDist = length(delta * vec2f(aspect, 1.0));
            
            let streakY = abs(delta.y);
            let streakX = abs(delta.x * aspect);
            let horizStreak = exp(-streakY * 260.0) * exp(-streakX * 3.0) * 0.28;
            
            let angle = atan2(delta.y, delta.x * aspect);
            let spike = (pow(abs(sin(angle * 2.0)), 32.0) + pow(abs(cos(angle * 2.0)), 32.0)) * exp(-sunDist * 7.5) * 0.22;
            
            var ghostCol = vec3f(0.0);
            let centerVector = vec2f(0.5) - sunUV;
            for (var i = 1; i <= 4; i = i + 1) {
              let ghostPos = sunUV + centerVector * (f32(i) * 0.38 - 0.15);
              let ghostDist = length((uv - ghostPos) * vec2f(aspect, 1.0));
              let ring = exp(-abs(ghostDist - 0.035 * f32(i)) * 110.0) * 0.045;
              ghostCol += mix(vec3f(0.15, 0.45, 1.0), vec3f(1.0, 0.35, 0.65), f32(i) / 4.0) * ring;
            }
            
            let coreRadial = exp(-sunDist * 3.8) * 0.45;
            return (vec3f(1.0, 0.9, 0.72) * (horizStreak + spike + coreRadial) + ghostCol) * intensity;
          }

          @fragment
          fn fs_main(@location(0) inUV: vec2f) -> @location(0) vec4f {
            let texSize = vec2f(uniforms.inputWidth, uniforms.inputHeight);
            let aspect = texSize.x / max(1.0, texSize.y);
            let dx = 1.0 / max(1.0, texSize.x);
            let dy = 1.0 / max(1.0, texSize.y);
            let sunUV = vec2f(uniforms.sunCenterX, uniforms.sunCenterY);

            // Realistic, smooth optical fisheye barrel distortion on celestial focus
            var uv = inUV;
            let focus = clamp(uniforms.focusFactor, 0.0, 1.0);
            let k = 0.065 * focus * uniforms.vignette;
            if (k > 0.0001) {
              let centered = (inUV - vec2f(0.5)) * vec2f(aspect, 1.0);
              let r2 = dot(centered, centered);
              // Scale-compensated barrel curvature: keeps center anchored while bending outer edges smoothly with no edge clamping
              let scaleCompensate = 1.0 / (1.0 + k * 0.45);
              let warpedCentered = centered * scaleCompensate * (1.0 + k * r2);
              uv = vec2f(0.5) + warpedCentered * vec2f(1.0 / aspect, 1.0);
              uv = clamp(uv, vec2f(0.0001), vec2f(0.9999));
            }

            // 1. Chromatic Aberration Pass
            var sampledColor: vec3f;
            if (uniforms.chromaticAberration > 0.001) {
              let centerDist = length(uv - vec2f(0.5));
              let offset = (uv - vec2f(0.5)) * centerDist * (0.012 + 0.006 * focus) * uniforms.chromaticAberration;
              let r = textureSampleLevel(uTexture, uSampler, uv - offset, 0.0).r;
              let g = textureSampleLevel(uTexture, uSampler, uv, 0.0).g;
              let b = textureSampleLevel(uTexture, uSampler, uv + offset, 0.0).b;
              sampledColor = vec3f(r, g, b);
            } else {
              sampledColor = textureSampleLevel(uTexture, uSampler, uv, 0.0).rgb;
            }

            // 2. AMD FSR 1.0 EASU Pass
            var upscaledColor = sampledColor;
            if (uniforms.resScaleRatio < 0.99) {
              upscaledColor = fsrEasu(uv, texSize);
            }

            // 3. AMD FSR 1.0 RCAS Pass
            let baseColor = fsrRcas(upscaledColor, uv, texSize, uniforms.sharpness);

            // 4. Wide HDR Dynamic Range Reconstruction & Black Hole Pitch-Black Depth
            let baseLuma = dot(baseColor, vec3f(0.2126, 0.7152, 0.0722));
            
            // Expand bright areas (Sun, accretion disk, target glows, bright stars) into high HDR range
            var hdrColor = baseColor;
            if (baseLuma > 0.55) {
              let boost = pow((baseLuma - 0.55) / 0.45, 2.2) * 5.0;
              hdrColor += baseColor * boost;
            }
            
            // Enforce true pitch-black event horizon and deep space void (crush near-zero shadow noise)
            if (baseLuma < 0.035) {
              let blackRatio = smoothstep(0.0, 0.035, baseLuma);
              hdrColor *= blackRatio;
            }

            // 5. High-Precision Volumetric Celestial Bloom (WebGPU)
            if (uniforms.bloomStrength > 0.01) {
              var bloomAccum = vec3f(0.0);
              var weightSum = 0.0;

              // High-pass filter function: extract bloom ONLY from ultra-bright emissive sources (Sun, flares, core glows)
              let gaussianKernel = array<vec4f, 16>(
                vec4f( 0.0,   0.0,   1.00, 0.68),
                vec4f(-1.5,  -1.5,   0.85, 0.70),
                vec4f( 1.5,  -1.5,   0.85, 0.70),
                vec4f(-1.5,   1.5,   0.85, 0.70),
                vec4f( 1.5,   1.5,   0.85, 0.70),
                vec4f(-3.2,   0.0,   0.60, 0.72),
                vec4f( 3.2,   0.0,   0.60, 0.72),
                vec4f( 0.0,  -3.2,   0.60, 0.72),
                vec4f( 0.0,   3.2,   0.60, 0.72),
                vec4f(-4.5,  -4.5,   0.35, 0.75),
                vec4f( 4.5,  -4.5,   0.35, 0.75),
                vec4f(-4.5,   4.5,   0.35, 0.75),
                vec4f( 4.5,   4.5,   0.35, 0.75),
                vec4f(-6.0,   0.0,   0.18, 0.78),
                vec4f( 6.0,   0.0,   0.18, 0.78),
                vec4f( 0.0,  -6.0,   0.18, 0.78)
              );

              for (var i = 0; i < 16; i = i + 1) {
                let k = gaussianKernel[i];
                let offset = vec2f(k.x, k.y) * vec2f(dx, dy) * 1.2;
                let sCol = textureSampleLevel(uTexture, uSampler, uv + offset, 0.0).rgb;
                let sLuma = dot(sCol, vec3f(0.2126, 0.7152, 0.0722));
                
                let threshold = k.w;
                let emissiveFactor = smoothstep(threshold, threshold + 0.18, sLuma);
                
                if (emissiveFactor > 0.001) {
                  let emissiveCol = (sCol - vec3f(threshold * 0.75)) * emissiveFactor;
                  bloomAccum += emissiveCol * k.z;
                }
                weightSum += k.z;
              }

              if (weightSum > 0.0) {
                let bloomGlow = (bloomAccum / weightSum) * uniforms.bloomStrength * 2.2;
                hdrColor += bloomGlow;
              }
            }

            // 6. Direct Sun Screen-Space Radial Corona Radiance
            if (sunUV.x > -0.5 && sunUV.x < 1.5 && sunUV.y > -0.5 && sunUV.y < 1.5) {
              let sunDelta = (uv - sunUV) * vec2f(aspect, 1.0);
              let sunDist = length(sunDelta);
              let sunCoronaGlow = exp(-sunDist * 2.8) * vec3f(1.0, 0.82, 0.55) * 0.35 * uniforms.bloomStrength;
              hdrColor += sunCoronaGlow;
            }

            // 7. Anamorphic Lens Flare Pass
            if (uniforms.lensFlare > 0.01) {
              let flareCol = anamorphicLensFlare(uv, texSize, sunUV, uniforms.lensFlare);
              hdrColor += flareCol;
            }

            // 8. Interstellar Dust Shimmer Particles
            if (uniforms.dustShimmer > 0.01) {
              let gridUV = uv * vec2f(aspect * 16.0, 16.0);
              let cell = floor(gridUV);
              let cellUV = fract(gridUV);
              let n = hash22(cell);
              if (n > 0.94) {
                let particlePos = vec2f(hash22(cell + vec2f(1.0)), hash22(cell + vec2f(2.0)));
                let dist = length(cellUV - particlePos);
                let twinkle = sin(uniforms.time * 2.5 + n * 62.8) * 0.5 + 0.5;
                let particleGlow = exp(-dist * 18.0) * twinkle * 0.35 * uniforms.dustShimmer;
                hdrColor += vec3f(0.6, 0.8, 1.0) * particleGlow;
              }
            }

            // 9. ACES Filmic Tone Mapping
            var outputColor = acesFilmic(hdrColor * 0.95);

            // 10. Realistic, Dynamic, Subtle Focus Vignette (Smooth cinematic edge falloff)
            if (uniforms.vignette > 0.01) {
              let centerVector = (uv - vec2f(0.5)) * vec2f(aspect, 1.0);
              let centerDist = length(centerVector);
              
              let baseVignette = 0.10 * uniforms.vignette;
              let focusVignette = 0.25 * focus * uniforms.vignette;
              let totalVignette = baseVignette + focusVignette;
              
              // Ultra-smooth radial falloff to extreme viewport edges
              let vigFalloff = smoothstep(0.42, 1.08, centerDist);
              let vig = 1.0 - vigFalloff * totalVignette;
              outputColor *= clamp(vig, 0.65, 1.0);
            }

            return vec4f(clamp(outputColor, vec3f(0.0), vec3f(1.0)), 1.0);
          }
        `;

        const module = device.createShaderModule({ code: wgslCode });

        const pipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: {
            module,
            entryPoint: 'vs_main',
          },
          fragment: {
            module,
            entryPoint: 'fs_main',
            targets: [{ format }],
          },
          primitive: {
            topology: 'triangle-list',
          },
        });

        const sampler = device.createSampler({
          magFilter: 'linear',
          minFilter: 'linear',
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
        });

        const uniformBuffer = device.createBuffer({
          size: 96,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        webgpuRef.current = {
          device,
          context,
          pipeline,
          sampler,
          uniformBuffer,
          uniformsArray: new Float32Array(16),
          bindGroup: null,
          inputTexture: null,
          textureWidth: 0,
          textureHeight: 0,
        };
        setIsWebGpuActive(true);
        setIsWebGpuDisabled(false);
        isWebGpuHaltedRef.current = false;
        setWebGpuDisabledReason('');
      } catch (err: any) {
        console.warn('WebGPU FSR init skipped or unsupported:', err);
        setIsWebGpuActive(false);
        setIsWebGpuDisabled(true);
        isWebGpuHaltedRef.current = true;
        setWebGpuDisabledReason(err?.message || 'WebGPU pipeline creation or shader compilation error.');
      }
    };

  useEffect(() => {
    if (webgpuInitAttempted.current) return;
    webgpuInitAttempted.current = true;
    initWebGPU();
  }, []);

  const handleRetryWebGpu = () => {
    webgpuInitAttempted.current = false;
    isWebGpuHaltedRef.current = false;
    setIsWebGpuDisabled(false);
    initWebGPU();
    if (restartRenderLoopRef.current) {
      restartRenderLoopRef.current();
    }
  };

  const handleBypassHalting = () => {
    isWebGpuHaltedRef.current = false;
    setIsWebGpuDisabled(false);
    setIsWebGpuActive(false);
    if (restartRenderLoopRef.current) {
      restartRenderLoopRef.current();
    }
  };

  const playTapSound = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const labelCanvas = labelCanvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr * resScale;
      canvas.height = window.innerHeight * dpr * resScale;
      const webgpuCanvas = webgpuCanvasRef.current;
      if (webgpuCanvas) {
        webgpuCanvas.width = window.innerWidth * dpr;
        webgpuCanvas.height = window.innerHeight * dpr;
      }
      if (labelCanvas) {
        labelCanvas.width = window.innerWidth * dpr;
        labelCanvas.height = window.innerHeight * dpr;
      }
    };
    handleResize();
  }, [resScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const labelCanvas = labelCanvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr * configRef.current.resScale;
      canvas.height = window.innerHeight * dpr * configRef.current.resScale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const webgpuCanvas = webgpuCanvasRef.current;
      if (webgpuCanvas) {
        webgpuCanvas.width = window.innerWidth * dpr;
        webgpuCanvas.height = window.innerHeight * dpr;
        webgpuCanvas.style.width = `${window.innerWidth}px`;
        webgpuCanvas.style.height = `${window.innerHeight}px`;
      }
      if (labelCanvas) {
        labelCanvas.width = window.innerWidth * dpr;
        labelCanvas.height = window.innerHeight * dpr;
        labelCanvas.style.width = `${window.innerWidth}px`;
        labelCanvas.style.height = `${window.innerHeight}px`;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInput) {
        keysPressedRef.current.clear();
      } else {
        const code = e.code;
        const key = e.key.toLowerCase();

        if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') keysPressedRef.current.add('KeyW');
        if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') keysPressedRef.current.add('KeyA');
        if (code === 'KeyS' || key === 's' || code === 'ArrowDown') keysPressedRef.current.add('KeyS');
        if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') keysPressedRef.current.add('KeyD');
        if (e.shiftKey || code === 'ShiftLeft' || code === 'ShiftRight') keysPressedRef.current.add('Shift');
      }

      if (e.code === 'Space') {
        // Prevent default space behavior (scrolling)
        if (!isInput) {
          e.preventDefault();
          playTapSound();
          togglePause();
        }
      } else if (e.key === '/' || e.code === 'Slash' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        if (!isInput) {
          e.preventDefault();
          if (!configRef.current.isSearchOpen && !configRef.current.isAIResearcherOpen) {
            playTapSound();
            setIsSearchOpen(true);
          }
        }
      } else if (e.key === '*') {
        if (!isInput) {
          e.preventDefault();
          if (!configRef.current.isSearchOpen && !configRef.current.isAIResearcherOpen) {
            playTapSound();
            setIsAIResearcherOpen(true);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') keysPressedRef.current.delete('KeyW');
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') keysPressedRef.current.delete('KeyA');
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown') keysPressedRef.current.delete('KeyS');
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') keysPressedRef.current.delete('KeyD');
      if (code === 'ShiftLeft' || code === 'ShiftRight' || !e.shiftKey) keysPressedRef.current.delete('Shift');
    };

    const handleBlur = () => {
      keysPressedRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    const onWheel = (e: WheelEvent) => {
      // Don't intercept scroll over UI elements
      if ((e.target as HTMLElement).closest('.ui-layer')) return;
      e.preventDefault();
      const zoomIntensity = 0.001;
      const delta = -e.deltaY * zoomIntensity;
      let nextZoom = stateRef.current.targetZoom * Math.exp(delta);
      nextZoom = Math.max(0.1, Math.min(nextZoom, 5));
      stateRef.current.targetZoom = nextZoom;
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });

    let animationFrameId: number;
    let lastFrameTime = performance.now();
    let lastTickTime = performance.now();

    const render = (currentTime: number) => {
      if (isWebGpuHaltedRef.current) {
        // Instantly halt rendering loop to prevent browser crash / freeze
        return;
      }
      const frameStartTime = performance.now();
      const state = stateRef.current;
      const config = configRef.current;
      
      const elapsed = currentTime - lastFrameTime;
      
      if (config.fpsCap > 0 && config.fpsCap < 999) {
        const frameThreshold = 1000 / config.fpsCap;
        if (elapsed < frameThreshold) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }
        lastFrameTime = currentTime - (elapsed % frameThreshold);
      } else {
        lastFrameTime = currentTime;
      }

      fpsFrameCountRef.current += 1;
      if (currentTime - fpsLastTimeRef.current >= 1000) {
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = currentTime;
      }

      // Delta time normalized to 60fps (1 unit = 16.66ms)
      // Clamp max dt to avoid huge skips when tab becomes active after long pause
      const tickElapsed = currentTime - lastTickTime;
      lastTickTime = currentTime;
      const dt = Math.min(tickElapsed, 100) / 16.666666666666668;

      // Lerp zoom
      const zoomLerpFactor = 1 - Math.pow(1 - 0.1, dt);
      state.zoom += (state.targetZoom - state.zoom) * zoomLerpFactor;

      // WASD & Arrow Keys camera panning
      if (!config.isModalOpen) {
        const keys = keysPressedRef.current;
        let moveX = 0;
        let moveY = 0;

        if (keys.has('KeyW')) moveY += 1;
        if (keys.has('KeyS')) moveY -= 1;
        if (keys.has('KeyA')) moveX += 1;
        if (keys.has('KeyD')) moveX -= 1;

        if (moveX !== 0 || moveY !== 0) {
          if (state.lockedPlanetId) {
            state.lockedPlanetId = null;
            state.lastLockedPlanetId = null;
            state.isCameraLocked = false;
            setSelectedPlanet(null);
          }
          const len = Math.sqrt(moveX * moveX + moveY * moveY);
          const normX = moveX / len;
          const normY = moveY / len;

          const isShift = keys.has('Shift');
          const speedMult = isShift ? 0.3 : 1.0;
          const step = config.wasdSpeed * speedMult * dt;

          state.cameraX += normX * step;
          state.cameraY += normY * step;
        }
      }

      // Limit camera pan to +/- 5000
      state.cameraX = Math.max(-5000, Math.min(state.cameraX, 5000));
      state.cameraY = Math.max(-5000, Math.min(state.cameraY, 5000));

      const ctx = canvas.getContext('2d');
      const labelCanvas = labelCanvasRef.current;
      const labelCtx = labelCanvas ? labelCanvas.getContext('2d') : null;
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;

      // Update spacecrafts dynamically
      const earth = PLANETS.find(p => p.id === 'earth');
      const saturn = PLANETS.find(p => p.id === 'saturn');
      const earthAngle = state.time * (earth?.speed || 0.01);
      const earthDist = getDistance(earth?.distance || 180);
      const ex = Math.cos(earthAngle) * earthDist;
      const ey = Math.sin(earthAngle) * earthDist;

      // Moon position
      const moon = earth?.moons?.find(m => m.id === 'moon');
      const moonAngle = state.time * (moon?.speed || 0.05);
      const moonDist = getDistance(moon?.distance || 22);
      const mx = ex + Math.cos(moonAngle) * moonDist;
      const my = ey + Math.sin(moonAngle) * moonDist;

      // Saturn position
      const satAngle = state.time * (saturn?.speed || 0.0009);
      const satDist = getDistance(saturn?.distance || 480);
      const sx = Math.cos(satAngle) * satDist;
      const sy = Math.sin(satAngle) * satDist;

      SPACECRAFTS.forEach(sc => {
         if (sc.id === 'iss') {
           // Low Earth Orbit (LEO) - 38 units from Earth
           const orbitAngle = state.time * 0.008;
           sc.cx = ex + Math.cos(orbitAngle) * 38;
           sc.cy = ey + Math.sin(orbitAngle) * 38;
           (sc as any).heading = orbitAngle + Math.PI / 2;
         }
         else if (sc.id === 'hubble') {
           // Medium Earth Orbit - 68 units from Earth (opposite side from ISS)
           const orbitAngle = state.time * 0.005 + Math.PI * 0.75;
           sc.cx = ex + Math.cos(orbitAngle) * 68;
           sc.cy = ey + Math.sin(orbitAngle) * 68;
           (sc as any).heading = orbitAngle + Math.PI / 2;
         }
         else if (sc.id === 'apollo11') {
           // Lunar Orbit - 25 units from Moon (Moon is at 135 units from Earth)
           const orbitAngle = state.time * 0.012;
           sc.cx = mx + Math.cos(orbitAngle) * 25;
           sc.cy = my + Math.sin(orbitAngle) * 25;
           (sc as any).heading = orbitAngle + Math.PI / 2;
         }
         else if (sc.id === 'jwst') {
           // Sun-Earth L2 Lagrange Point - 210 units beyond Earth on anti-sun vector
           const l2Dist = earthDist + 210;
           const l2x = Math.cos(earthAngle) * l2Dist;
           const l2y = Math.sin(earthAngle) * l2Dist;
           const haloAngle = state.time * 0.003;
           sc.cx = l2x + Math.cos(haloAngle) * 28;
           sc.cy = l2y + Math.sin(haloAngle) * 18;
           // Sunshield always points directly towards the Sun
           (sc as any).heading = Math.atan2(-sc.cy, -sc.cx) - Math.PI / 2;
         }
         else if (sc.id === 'cassini') {
           // Saturn Orbit - 88 units from Saturn
           const orbitAngle = state.time * 0.004 + 2.0;
           sc.cx = sx + Math.cos(orbitAngle) * 88;
           sc.cy = sy + Math.sin(orbitAngle) * 58;
           (sc as any).heading = orbitAngle + Math.PI / 2;
         }
         else if (sc.id === 'voyager1') {
           // Interstellar trajectory - far out beyond Pluto
           const voyagerAngle = Math.PI * 0.22;
           const dist = 2200;
           sc.cx = Math.cos(voyagerAngle) * dist;
           sc.cy = Math.sin(voyagerAngle) * dist;
           // Antenna dish always faces back towards inner solar system
           (sc as any).heading = Math.atan2(-sc.cy, -sc.cx) - Math.PI / 2;
         }
      });


      // Reset and Clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0f172a'; // tailwind slate-900 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (labelCtx && labelCanvas) {
        labelCtx.setTransform(1, 0, 0, 1, 0, 0);
        labelCtx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
        labelCtx.scale(dpr, dpr);
        labelCtx.translate(window.innerWidth / 2 + state.cameraX, window.innerHeight / 2 + state.cameraY);
        labelCtx.scale(state.zoom, state.zoom);
      }

      const resScale = config.resScale;
      ctx.scale(dpr * resScale, dpr * resScale);
      
      // Setup World Camera Map View
      ctx.translate(window.innerWidth / 2 + state.cameraX, window.innerHeight / 2 + state.cameraY);
      ctx.scale(state.zoom, state.zoom);

      // Calculate frustum bounds in world coordinates for high performance culling
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      const zoom = state.zoom;
      const minX = (-viewW / 2 - state.cameraX) / zoom;
      const maxX = (viewW / 2 - state.cameraX) / zoom;
      const minY = (-viewH / 2 - state.cameraY) / zoom;
      const maxY = (viewH / 2 - state.cameraY) / zoom;

      // Frustum culling helper for point/circle
      const inFrustum = (x: number, y: number, r: number = 20) =>
        x + r >= minX && x - r <= maxX && y + r >= minY && y - r <= maxY;

      // Frustum culling helper for orbit rings (circle vs viewport AABB)
      const isOrbitInFrustum = (cx: number, cy: number, orbitRadius: number) => {
        const nearestX = Math.max(minX, Math.min(cx, maxX));
        const nearestY = Math.max(minY, Math.min(cy, maxY));
        const dx = cx - nearestX;
        const dy = cy - nearestY;
        if (dx * dx + dy * dy > orbitRadius * orbitRadius) return false;
        const farX = Math.abs(minX - cx) > Math.abs(maxX - cx) ? minX : maxX;
        const farY = Math.abs(minY - cy) > Math.abs(maxY - cy) ? minY : maxY;
        const fdx = cx - farX;
        const fdy = cy - farY;
        if (fdx * fdx + fdy * fdy < orbitRadius * orbitRadius) return false;
        return true;
      };

      // Draw Stars with Frustum Culling
      const starLimit = config.perfMode ? 2000 : STARS.length;
      for (let i = 0; i < starLimit; i++) {
        const star = STARS[i];
        if (star.x < minX || star.x > maxX || star.y < minY || star.y > maxY) continue;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        const size = star.radius / zoom; 
        ctx.fillRect(star.x - size/2, star.y - size/2, Math.max(size, 1/zoom), Math.max(size, 1/zoom));
      }

      // Draw Constellations
      if (config.showConstellations) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);

        CONSTELLATIONS.forEach(c => {
          if (!inFrustum(c.cx, c.cy, c.hitRadius * 2 + 500)) return;
          const isSelected = config.selectedPlanet === c.id || config.hoveredPlanet === c.id || state.lockedPlanetId === c.id;
          const targetCGlow = isSelected ? 0.35 : 0;
          const cLerp = 1 - Math.pow(1 - 0.28, dt);
          state.glows[c.id] = (state.glows[c.id] || 0) + (targetCGlow - (state.glows[c.id] || 0)) * cLerp;

          if (state.glows[c.id] > 0.005) {
            const cr = parseInt(c.color.slice(1,3),16) || 168;
            const cg = parseInt(c.color.slice(3,5),16) || 85;
            const cb = parseInt(c.color.slice(5,7),16) || 247;
            const breathPhase = Math.sin((currentTime * 0.001) * 2.0);
            const breathRadius = c.hitRadius * (1 + 0.03 * breathPhase);
            const breathAlpha = 0.92 + 0.08 * breathPhase;

            ctx.beginPath();
            ctx.arc(c.cx, c.cy, breathRadius * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${state.glows[c.id] * breathAlpha})`;
            ctx.fill();

            // Target lock soft breathing ring
            ctx.beginPath();
            ctx.arc(c.cx, c.cy, breathRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, state.glows[c.id] * 2.5 * breathAlpha)})`;
            ctx.lineWidth = 1.4 / zoom;
            ctx.setLineDash([6 / zoom, 4 / zoom]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.setLineDash([5 / zoom, 5 / zoom]);

          // Draw edges
          ctx.beginPath();
          c.edges.forEach(([p1_idx, p2_idx]) => {
            const p1 = c.points[p1_idx];
            const p2 = c.points[p2_idx];
            ctx.moveTo(c.cx + p1.x * c.scale, c.cy + p1.y * c.scale);
            ctx.lineTo(c.cx + p2.x * c.scale, c.cy + p2.y * c.scale);
          });
          ctx.stroke();

          // Draw main stars
          ctx.setLineDash([]);
          c.points.forEach(p => {
            const starX = c.cx + p.x * c.scale;
            const starY = c.cy + p.y * c.scale;
            const starSize = ((p.mag || 2) * 0.8) / zoom;
            
            // Star Glow
            if (!config.perfMode) {
              ctx.beginPath();
              ctx.arc(starX, starY, starSize * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * (p.mag || 2)})`;
              ctx.fill();
            }

            // Star Body
            ctx.beginPath();
            ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();

            // Star Names (Only for Crux or if zoomed in enough)
            if (p.name && (c.id === 'crux' || zoom > 1.2)) {
              const targetCtx = labelCtx || ctx;
              targetCtx.font = `${Math.max(8, 10 / zoom)}px "JetBrains Mono"`;
              targetCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
              targetCtx.textAlign = 'left';
              targetCtx.fillText(p.name, starX + starSize + 5/zoom, starY + 3/zoom);
            }
          });
          
          if (config.showLabels) {
            const tMap = TRANSLATIONS[config.lang];
            const tName = tMap ? tMap[c.nameKey as keyof typeof tMap] || c.id : c.id;
            const targetCtx = labelCtx || ctx;
            targetCtx.font = `${Math.max(10, 14 / zoom)}px "JetBrains Mono", ui-monospace, SFMono-Regular, monospace`;
            targetCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            targetCtx.textAlign = 'center';
            targetCtx.fillText(tName, c.cx, c.cy + 30 * c.scale + (15 / zoom));
          }
          
          ctx.setLineDash([5 / zoom, 5 / zoom]);
        });
        ctx.setLineDash([]);
      }

      // Draw Black Holes
      BLACK_HOLES.forEach(bh => {
        if (!inFrustum(bh.cx, bh.cy, bh.radius * 8 + 300)) return;
        const isHovered = config.hoveredPlanet === bh.id;
        const isSelected = state.lockedPlanetId === bh.id || config.selectedPlanet === bh.id;
        const animTime = state.time;

        const hex = bh.color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16) || 249;
        const g = parseInt(hex.slice(2, 4), 16) || 115;
        const b = parseInt(hex.slice(4, 6), 16) || 22;

        const tilt = bh.tiltAngle ?? (bh.id === 'cygnus_x1' ? -Math.PI / 6 : Math.PI / 7);
        const hasJets = bh.hasJets ?? (bh.id === 'cygnus_x1' || bh.id === 'm87_star');

        ctx.save();
        ctx.translate(bh.cx, bh.cy);

        // 1. Gravitational Lensing Field / Space Distortion Aura
        const lensRadius = bh.radius * 3.8;
        const lensGrad = ctx.createRadialGradient(0, 0, bh.radius * 0.7, 0, 0, lensRadius);
        lensGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.22)`);
        lensGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.08)`);
        lensGrad.addColorStop(0.7, `rgba(${Math.round(r * 0.4)}, ${Math.round(g * 0.4)}, ${Math.round(b * 0.7)}, 0.03)`);
        lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, lensRadius, 0, Math.PI * 2);
        ctx.fillStyle = lensGrad;
        ctx.fill();

        // 2. Relativistic Polar Plasma Jets (Aligned along true polar axis perpendicular to disk)
        if (hasJets) {
          ctx.save();
          ctx.rotate(tilt); // Align with disk coordinate frame where Y is the polar normal axis
          const jetLength = bh.radius * (bh.id === 'm87_star' ? 7.5 : 5.5);
          const jetBaseWidth = bh.radius * 0.22;
          const jetTipWidth = bh.radius * 0.65;

          [-1, 1].forEach(dir => {
            const startY = dir * bh.radius * 0.7;
            const endY = dir * jetLength;

            // Outer plasma plume gradient
            const jetGrad = ctx.createLinearGradient(0, startY, 0, endY);
            jetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            jetGrad.addColorStop(0.15, `rgba(${r}, ${g}, ${b}, 0.75)`);
            jetGrad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.25)`);
            jetGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            const pulse = 1 + 0.1 * Math.sin(animTime * 3 + dir);
            ctx.beginPath();
            ctx.moveTo(-jetBaseWidth * 0.5, startY);
            ctx.lineTo(-jetTipWidth * 0.5 * pulse, endY);
            ctx.lineTo(jetTipWidth * 0.5 * pulse, endY);
            ctx.lineTo(jetBaseWidth * 0.5, startY);
            ctx.closePath();
            ctx.fillStyle = jetGrad;
            ctx.fill();

            // Inner ultra-hot relativistic core (Soft gradient cone, no hard stroke line)
            const coreGrad = ctx.createLinearGradient(0, startY, 0, endY * 0.6);
            coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            coreGrad.addColorStop(0.4, `rgba(255, 255, 255, 0.6)`);
            coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(-jetBaseWidth * 0.25, startY);
            ctx.lineTo(-jetTipWidth * 0.2 * pulse, endY * 0.6);
            ctx.lineTo(jetTipWidth * 0.2 * pulse, endY * 0.6);
            ctx.lineTo(jetBaseWidth * 0.25, startY);
            ctx.closePath();
            ctx.fillStyle = coreGrad;
            ctx.fill();

            // Animated plasma knot / shockwave along the jet
            const knotPos = ((animTime * 1.2) % 1);
            const knotY = startY + (endY - startY) * knotPos;
            const knotRadius = bh.radius * (0.1 + knotPos * 0.25);
            const knotGrad = ctx.createRadialGradient(0, knotY, 0, 0, knotY, knotRadius);
            knotGrad.addColorStop(0, `rgba(255, 255, 255, ${(1 - knotPos) * 0.8})`);
            knotGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${(1 - knotPos) * 0.4})`);
            knotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.ellipse(0, knotY, knotRadius * 1.5, knotRadius * 0.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = knotGrad;
            ctx.fill();
          });
          ctx.restore();
        }

        // 3. Back Gravitational Lensing Arc (Light bent around back of horizon)
        ctx.save();
        ctx.rotate(tilt);
        const warpedGrad = ctx.createRadialGradient(0, 0, bh.radius * 0.8, 0, 0, bh.radius * 1.9);
        warpedGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        warpedGrad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, 0.8)`);
        warpedGrad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, 0.35)`);
        warpedGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        // Upper Warped Arc
        ctx.beginPath();
        ctx.ellipse(0, -bh.radius * 0.35, bh.radius * 1.75, bh.radius * 0.95, 0, Math.PI * 0.9, Math.PI * 2.1);
        ctx.strokeStyle = warpedGrad;
        ctx.lineWidth = 6 / zoom;
        ctx.stroke();

        // Lower Warped Arc
        ctx.beginPath();
        ctx.ellipse(0, bh.radius * 0.35, bh.radius * 1.75, bh.radius * 0.95, 0, 0, Math.PI);
        ctx.strokeStyle = warpedGrad;
        ctx.lineWidth = 4 / zoom;
        ctx.stroke();
        ctx.restore();

        // 4. Main Accretion Disk (Tilted disk with Doppler beaming)
        ctx.save();
        ctx.rotate(tilt);

        const outerRx = bh.radius * 2.8;
        const outerRy = bh.radius * 0.85;

        // Doppler Beaming Gradient: Approaching side (left) is brighter and shifted towards white
        const diskGrad = ctx.createLinearGradient(-outerRx, 0, outerRx, 0);
        diskGrad.addColorStop(0, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.95)`);
        diskGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.85)`);
        diskGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        diskGrad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, 0.65)`);
        diskGrad.addColorStop(1, `rgba(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 20)}, 0.25)`);

        ctx.beginPath();
        ctx.ellipse(0, 0, outerRx, outerRy, 0, 0, Math.PI * 2);
        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 7 / zoom;
        ctx.stroke();

        // Inner glowing temperature bands in the accretion disk
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const rx = outerRx * (0.5 + i * 0.22);
          const ry = outerRy * (0.5 + i * 0.22);
          const spinPulse = Math.sin(animTime * 2.5 + i * 1.8) * 0.15 + 0.85;

          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = i === 0
            ? 'rgba(255, 255, 255, 0.92)'
            : `rgba(${r}, ${g}, ${b}, ${0.5 * spinPulse})`;
          ctx.lineWidth = (3.5 - i * 0.8) / zoom;
          ctx.stroke();
        }
        ctx.restore();

        // 5. Event Horizon & Photon Ring
        ctx.beginPath();
        ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, bh.radius * 1.02, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, bh.radius * 1.06, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, bh.radius * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
        ctx.lineWidth = 2.5 / zoom;
        ctx.stroke();

        // 6. Front Accretion Disk Overlap
        ctx.save();
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, outerRx, outerRy, 0, 0, Math.PI);
        ctx.strokeStyle = diskGrad;
        ctx.lineWidth = 8 / zoom;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, outerRx * 0.5, outerRy * 0.5, 0, 0, Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();
        ctx.restore();

        // 7. Hover / Selection Glow & Pulse Wave
        const targetBhGlow = isSelected ? 0.35 : (isHovered ? 0.18 : 0);
        const bhLerp = 1 - Math.pow(1 - 0.28, dt);
        state.glows[bh.id] = (state.glows[bh.id] || 0) + (targetBhGlow - (state.glows[bh.id] || 0)) * bhLerp;

        if (state.glows[bh.id] > 0.005) {
          const breathPhase = Math.sin((currentTime * 0.001) * 2.0);
          const breathRadius = bh.radius * 2.2 * (1 + 0.03 * breathPhase);
          const breathAlpha = 0.92 + 0.08 * breathPhase;

          ctx.beginPath();
          ctx.arc(0, 0, breathRadius * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${state.glows[bh.id] * breathAlpha})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, breathRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, state.glows[bh.id] * 2.5 * breathAlpha)})`;
          ctx.lineWidth = 1.4 / zoom;
          ctx.setLineDash([5 / zoom, 5 / zoom]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

        // 8. Labels
        if (config.showLabels) {
          const tMap = TRANSLATIONS[config.lang as keyof typeof TRANSLATIONS];
          const tEn = TRANSLATIONS['en'];
          const tName = tMap ? ((tMap as any)[bh.nameKey as any] || (tEn as any)[bh.nameKey as any] || bh.id) : bh.id;
          const targetCtx = labelCtx || ctx;
          targetCtx.font = `${Math.max(10, 14 / zoom)}px "JetBrains Mono", ui-monospace, SFMono-Regular, monospace`;
          targetCtx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.65)';
          targetCtx.textAlign = 'center';
          targetCtx.fillText(tName, bh.cx, bh.cy + bh.radius * 1.8 + (25 / zoom));
        }
      });

      // Draw Spacecrafts
      if (config.showSpacecraft) {
        SPACECRAFTS.forEach(sc => {
          if (!inFrustum(sc.cx, sc.cy, 150 / zoom + 50)) return;
          const isHovered = config.hoveredPlanet === sc.id;
          const isSelected = state.lockedPlanetId === sc.id || config.selectedPlanet === sc.id;
          const heading = (sc as any).heading ?? 0;
          const animTime = state.time;

          ctx.save();
          ctx.translate(sc.cx, sc.cy);

          // Selection / Hover Target Reticle & Glow
          const targetScGlow = isSelected ? 0.35 : (isHovered ? 0.18 : 0);
          const scLerp = 1 - Math.pow(1 - 0.28, dt);
          state.glows[sc.id] = (state.glows[sc.id] || 0) + (targetScGlow - (state.glows[sc.id] || 0)) * scLerp;

          if (state.glows[sc.id] > 0.005) {
            const breathPhase = Math.sin((currentTime * 0.001) * 2.0);
            const breathRadius = sc.hitRadius * (1 + 0.03 * breathPhase);
            const breathAlpha = 0.92 + 0.08 * breathPhase;

            ctx.beginPath();
            ctx.arc(0, 0, breathRadius * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${parseInt(sc.color.slice(1,3), 16) || 203}, ${parseInt(sc.color.slice(3,5), 16) || 213}, ${parseInt(sc.color.slice(5,7), 16) || 225}, ${state.glows[sc.id] * breathAlpha})`;
            ctx.fill();

            // Target lock soft breathing rings
            ctx.beginPath();
            ctx.arc(0, 0, breathRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, state.glows[sc.id] * 2.5 * breathAlpha)})`;
            ctx.lineWidth = 1.2 / zoom;
            ctx.setLineDash([4 / zoom, 4 / zoom]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Scale factor: ensures readable, crisp size regardless of extreme zoom out
          const s = Math.max(0.6, 1 / zoom);

          // Orient spacecraft along movement heading (rotated 90deg so nose points forward along Y)
          ctx.rotate(heading + Math.PI / 2);

          if (sc.id === 'iss') {
            // International Space Station
            // 1. Central Metallic Truss
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-20 * s, -1.5 * s, 40 * s, 3 * s);

            // 2. Solar Arrays (8 bronze/gold photovoltaic wings with cell grid)
            const arrayWidth = 7 * s;
            const arrayHeight = 14 * s;

            [-16 * s, -9 * s, 9 * s, 16 * s].forEach(x => {
              [-15 * s, 1 * s].forEach(y => {
                const solGrad = ctx.createLinearGradient(x, y, x + arrayWidth, y + arrayHeight);
                solGrad.addColorStop(0, '#b45309');
                solGrad.addColorStop(0.5, '#f59e0b');
                solGrad.addColorStop(1, '#78350f');

                ctx.fillStyle = solGrad;
                ctx.fillRect(x - arrayWidth * 0.5, y, arrayWidth, arrayHeight);

                ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
                ctx.lineWidth = 0.5 / zoom;
                ctx.strokeRect(x - arrayWidth * 0.5, y, arrayWidth, arrayHeight);

                // Grid lines inside solar panel
                ctx.beginPath();
                ctx.moveTo(x - arrayWidth * 0.5, y + arrayHeight * 0.5);
                ctx.lineTo(x + arrayWidth * 0.5, y + arrayHeight * 0.5);
                ctx.stroke();
              });
            });

            // 3. Radiator Panels
            ctx.fillStyle = '#f8fafc';
            [-4 * s, 4 * s].forEach(x => {
              ctx.fillRect(x - 1.2 * s, -12 * s, 2.4 * s, 8 * s);
            });

            // 4. Pressurized Modules (Habitation & Labs in T-shape)
            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath();
            ctx.roundRect(-2.5 * s, -7 * s, 5 * s, 14 * s, 1.5 * s);
            ctx.fill();

            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-6 * s, -2 * s, 12 * s, 4 * s);

            // Cupola / Window dots
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, 0, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();

            // 5. Navigation Beacon LEDs
            const flash = Math.sin(animTime * 8) > 0;
            ctx.fillStyle = '#ef4444'; // Red port light
            ctx.beginPath();
            ctx.arc(-20 * s, 0, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#22c55e'; // Green starboard light
            ctx.beginPath();
            ctx.arc(20 * s, 0, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();

            if (flash) {
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(0, -7 * s, 1.5 * s, 0, Math.PI * 2);
              ctx.fill();
            }

          } else if (sc.id === 'jwst') {
            // James Webb Space Telescope
            // 1. 5-Layer Diamond Sunshield
            const sunGrad = ctx.createLinearGradient(0, -18 * s, 0, 16 * s);
            sunGrad.addColorStop(0, '#f43f5e'); // hot pink/gold side
            sunGrad.addColorStop(0.3, '#fbbf24');
            sunGrad.addColorStop(0.7, '#cbd5e1'); // silver/purple layered side
            sunGrad.addColorStop(1, '#a855f7');

            [0, 1.2 * s, 2.4 * s].forEach((offset, idx) => {
              ctx.beginPath();
              ctx.moveTo(0, -20 * s + offset);
              ctx.lineTo(13 * s - offset * 0.5, 0);
              ctx.lineTo(0, 16 * s - offset);
              ctx.lineTo(-13 * s + offset * 0.5, 0);
              ctx.closePath();
              if (idx === 0) {
                ctx.fillStyle = sunGrad;
                ctx.fill();
              }
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 0.6 / zoom;
              ctx.stroke();
            });

            // 2. Primary Mirror Assembly (18 Beryllium-Gold Hexagons)
            const rHex = 2.2 * s;
            const drawHexTile = (hx: number, hy: number) => {
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                const px = hx + rHex * Math.cos(angle);
                const py = hy + rHex * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fillStyle = '#f59e0b';
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 0.5 / zoom;
              ctx.stroke();
            };

            // Hexagon layout around mirror center
            const mCenterY = -4 * s;
            const dx = rHex * 1.732;
            const dy = rHex * 1.5;

            // Inner ring
            [[-dx, -dy], [0, -dy * 2], [dx, -dy], [-dx, dy], [0, dy * 2], [dx, dy]].forEach(([hx, hy]) => {
              drawHexTile(hx, mCenterY + hy);
            });
            // Outer ring
            [[-dx * 2, 0], [dx * 2, 0], [-dx, -dy * 3], [dx, -dy * 3], [-dx, dy * 3], [dx, dy * 3], [-dx * 2, -dy * 2], [dx * 2, -dy * 2], [-dx * 2, dy * 2], [dx * 2, dy * 2]].forEach(([hx, hy]) => {
              drawHexTile(hx, mCenterY + hy);
            });

            // Dark central aperture
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(0, mCenterY, rHex * 0.9, 0, Math.PI * 2);
            ctx.fill();

            // 3. Secondary Mirror Tripod
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.2 / zoom;
            ctx.beginPath();
            ctx.moveTo(-8 * s, mCenterY + 4 * s);
            ctx.lineTo(0, mCenterY - 12 * s);
            ctx.moveTo(8 * s, mCenterY + 4 * s);
            ctx.lineTo(0, mCenterY - 12 * s);
            ctx.moveTo(0, mCenterY + 8 * s);
            ctx.lineTo(0, mCenterY - 12 * s);
            ctx.stroke();

            // Secondary mirror tip
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, mCenterY - 12 * s, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();

          } else if (sc.id === 'hubble') {
            // Hubble Space Telescope
            // 1. Solar Panels (Deep Blue Photovoltaic Wings)
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-18 * s, -2.5 * s, 12 * s, 5 * s);
            ctx.fillRect(6 * s, -2.5 * s, 12 * s, 5 * s);

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 0.6 / zoom;
            ctx.strokeRect(-18 * s, -2.5 * s, 12 * s, 5 * s);
            ctx.strokeRect(6 * s, -2.5 * s, 12 * s, 5 * s);

            // 2. Optical Tube Assembly (Chrome Silver Cylinder)
            const hubGrad = ctx.createLinearGradient(-4 * s, 0, 4 * s, 0);
            hubGrad.addColorStop(0, '#f8fafc');
            hubGrad.addColorStop(0.5, '#cbd5e1');
            hubGrad.addColorStop(1, '#475569');

            ctx.fillStyle = hubGrad;
            ctx.fillRect(-4 * s, -12 * s, 8 * s, 24 * s);

            // Aft shroud rings & foil wraps
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1 / zoom;
            [-8 * s, -4 * s, 0, 4 * s, 8 * s].forEach(y => {
              ctx.beginPath();
              ctx.moveTo(-4 * s, y);
              ctx.lineTo(4 * s, y);
              ctx.stroke();
            });

            // 3. Open Aperture Door Flap
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(-4 * s, -12 * s);
            ctx.lineTo(-8 * s, -18 * s);
            ctx.lineTo(-2 * s, -18 * s);
            ctx.lineTo(-4 * s, -12 * s);
            ctx.closePath();
            ctx.fill();

            // Dark interior aperture lens
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(0, -12 * s, 3.8 * s, 1.5 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, -12 * s, 1.8 * s, 0, Math.PI * 2);
            ctx.fill();

            // 4. High-Gain Antenna Dishes
            ctx.fillStyle = '#f8fafc';
            [-5 * s, 5 * s].forEach(x => {
              ctx.beginPath();
              ctx.arc(x, 8 * s, 2.2 * s, 0, Math.PI * 2);
              ctx.fill();
            });

          } else if (sc.id === 'voyager1') {
            // Voyager 1
            // 1. Prominent White Parabolic High-Gain Antenna Dish
            const dishGrad = ctx.createRadialGradient(0, -4 * s, 0, 0, -4 * s, 11 * s);
            dishGrad.addColorStop(0, '#ffffff');
            dishGrad.addColorStop(0.7, '#cbd5e1');
            dishGrad.addColorStop(1, '#64748b');

            ctx.fillStyle = dishGrad;
            ctx.beginPath();
            ctx.ellipse(0, -4 * s, 11 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 0.8 / zoom;
            ctx.stroke();

            // Antenna Feed Horn & Tripod
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.moveTo(-6 * s, -4 * s); ctx.lineTo(0, -11 * s);
            ctx.moveTo(6 * s, -4 * s); ctx.lineTo(0, -11 * s);
            ctx.stroke();

            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-1 * s, -12 * s, 2 * s, 2 * s);

            // 2. 10-Sided Main Electronics Bus
            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath();
            ctx.arc(0, 2 * s, 4.5 * s, 0, Math.PI * 2);
            ctx.fill();

            // 3. Golden Record Disk
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(-4 * s, 2 * s, 2.2 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 0.5 / zoom;
            ctx.stroke();

            // 4. Magnetometer Boom (Extremely long boom)
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.moveTo(0, 2 * s);
            ctx.lineTo(22 * s, -14 * s);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(21 * s, -15 * s, 2 * s, 2 * s);

            // 5. RTG Power Unit Boom (3 Cylinders)
            ctx.beginPath();
            ctx.moveTo(0, 2 * s);
            ctx.lineTo(-14 * s, 10 * s);
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-16 * s, 9 * s, 4 * s, 5 * s);

          } else if (sc.id === 'apollo11') {
            // Apollo 11 (Command/Service Module + Lunar Module)
            // 1. Service Module (Silver/white Cylinder)
            const smGrad = ctx.createLinearGradient(-3.5 * s, 0, 3.5 * s, 0);
            smGrad.addColorStop(0, '#f8fafc');
            smGrad.addColorStop(0.5, '#cbd5e1');
            smGrad.addColorStop(1, '#475569');

            ctx.fillStyle = smGrad;
            ctx.fillRect(-3.5 * s, -2 * s, 7 * s, 12 * s);

            // RCS Thruster Quad Pods
            ctx.fillStyle = '#334155';
            [-4 * s, 4 * s].forEach(x => {
              ctx.fillRect(x < 0 ? x - 1 * s : x, 2 * s, 1 * s, 2 * s);
            });

            // Main Engine Nozzle (SPS Engine Bell)
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.moveTo(-2.5 * s, 10 * s);
            ctx.lineTo(-4 * s, 16 * s);
            ctx.lineTo(4 * s, 16 * s);
            ctx.lineTo(2.5 * s, 10 * s);
            ctx.closePath();
            ctx.fill();

            // Engine Plume Glow
            const plume = ctx.createLinearGradient(0, 16 * s, 0, 22 * s);
            plume.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
            plume.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = plume;
            ctx.beginPath();
            ctx.moveTo(-3 * s, 16 * s);
            ctx.lineTo(0, 22 * s);
            ctx.lineTo(3 * s, 16 * s);
            ctx.closePath();
            ctx.fill();

            // 2. Command Module (Conical Capsule)
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(0, -8 * s);
            ctx.lineTo(3.5 * s, -2 * s);
            ctx.lineTo(-3.5 * s, -2 * s);
            ctx.closePath();
            ctx.fill();

            // 3. Lunar Module Eagle (Gold Foil wrapped)
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(-4 * s, -14 * s, 8 * s, 6 * s);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 0.5 / zoom;
            ctx.strokeRect(-4 * s, -14 * s, 8 * s, 6 * s);

            // Landing Legs
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.moveTo(-4 * s, -11 * s); ctx.lineTo(-8 * s, -17 * s);
            ctx.moveTo(4 * s, -11 * s); ctx.lineTo(8 * s, -17 * s);
            ctx.stroke();

          } else if (sc.id === 'cassini') {
            // Cassini-Huygens
            // 1. High Gain Antenna Dish
            const casDish = ctx.createRadialGradient(0, -6 * s, 0, 0, -6 * s, 9 * s);
            casDish.addColorStop(0, '#ffffff');
            casDish.addColorStop(1, '#cbd5e1');

            ctx.fillStyle = casDish;
            ctx.beginPath();
            ctx.ellipse(0, -6 * s, 9 * s, 5 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 0.8 / zoom;
            ctx.stroke();

            // 2. Gold Kapton Main Body
            ctx.fillStyle = '#d97706';
            ctx.fillRect(-3.5 * s, -1 * s, 7 * s, 10 * s);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 0.5 / zoom;
            ctx.strokeRect(-3.5 * s, -1 * s, 7 * s, 10 * s);

            // 3. Huygens Probe (Disk attached on side)
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.ellipse(6 * s, 3 * s, 3.5 * s, 2 * s, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();

            // 4. Magnetometer Boom
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 0.8 / zoom;
            ctx.beginPath();
            ctx.moveTo(-3.5 * s, 2 * s);
            ctx.lineTo(-18 * s, -8 * s);
            ctx.stroke();

          } else {
            // Generic High-Detail Spacecraft Fallback
            ctx.fillStyle = sc.color || '#cbd5e1';
            ctx.beginPath();
            ctx.moveTo(0, -10 * s);
            ctx.lineTo(6 * s, 6 * s);
            ctx.lineTo(-6 * s, 6 * s);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-14 * s, 0, 8 * s, 3 * s);
            ctx.fillRect(6 * s, 0, 8 * s, 3 * s);
          }

          ctx.restore();

          // Labels
          if (config.showLabels) {
            const targetCtx = labelCtx || ctx;
            targetCtx.fillStyle = isSelected ? sc.color : 'rgba(255, 255, 255, 0.75)';
            targetCtx.font = `${isSelected ? 'bold ' : ''}${Math.max(8, 10 / zoom)}px "JetBrains Mono", ui-monospace, SFMono-Regular, monospace`;
            targetCtx.textAlign = 'center';
            const tMap = TRANSLATIONS[config.lang as keyof typeof TRANSLATIONS];
            const tEn = TRANSLATIONS['en'];
            const tName = ('nameKey' in sc && sc.nameKey) ? ((tMap as any)[sc.nameKey] || (tEn as any)[sc.nameKey] || sc.name) : sc.name;
            targetCtx.fillText(tName, sc.cx, sc.cy - 18 / zoom);
          }
        });
      }

      // Step time based on config speed multiplier
      state.time += dt * config.speedMultiplier;

      // Update Camera if locked to a planet / body
      if (state.lockedPlanetId) {
        // If locked target changed, reset camera lock so we glide smoothly to the new body
        if (state.lockedPlanetId !== state.lastLockedPlanetId) {
          state.lastLockedPlanetId = state.lockedPlanetId;
          state.isCameraLocked = false;
        }

        let lockedPos = null;
        for (const p of PLANETS) {
          const pAngle = state.time * p.speed;
          const pDistance = getDistance(p.distance);
          const px = Math.cos(pAngle) * pDistance;
          const py = Math.sin(pAngle) * pDistance;
          if (p.id === state.lockedPlanetId) {
            lockedPos = { x: px, y: py };
            break;
          }
          if (p.moons) {
            for (const m of p.moons) {
              if (m.id === state.lockedPlanetId) {
                const mAngle = state.time * m.speed;
                const mDistance = getDistance(m.distance);
                const mx = px + Math.cos(mAngle) * mDistance;
                const my = py + Math.sin(mAngle) * mDistance;
                lockedPos = { x: mx, y: my };
                break;
              }
            }
          }
          if (lockedPos) break;
        }
        if (!lockedPos && config.showConstellations) {
          const c = CONSTELLATIONS.find((c) => c.id === state.lockedPlanetId);
          if (c) {
            lockedPos = { x: c.cx, y: c.cy };
          }
        }
        if (!lockedPos) {
          const bh = BLACK_HOLES.find((b) => b.id === state.lockedPlanetId);
          if (bh) {
            lockedPos = { x: bh.cx, y: bh.cy };
          }
        }
        if (!lockedPos && config.showSpacecraft) {
          const sc = SPACECRAFTS.find((s) => s.id === state.lockedPlanetId);
          if (sc) {
            lockedPos = { x: sc.cx, y: sc.cy };
          }
        }
        
        if (lockedPos) {
          const targetCamX = -lockedPos.x * state.zoom;
          const targetCamY = -lockedPos.y * state.zoom;
          
          if (state.isCameraLocked) {
            // Synchronous 1:1 camera lock to eliminate lag, velocity phase shift & jitter completely
            state.cameraX = targetCamX;
            state.cameraY = targetCamY;
          } else {
            const dx = targetCamX - state.cameraX;
            const dy = targetCamY - state.cameraY;
            const dist = Math.hypot(dx, dy);

            // Smooth, continuous framerate-independent exponential travel curve
            const lerpFactor = 1 - Math.pow(1 - 0.16, dt);
            state.cameraX += dx * lerpFactor;
            state.cameraY += dy * lerpFactor;

            // When camera arrives close to target (< 0.75 pixels on screen), engage synchronous lock
            if (dist < 0.75) {
              state.cameraX = targetCamX;
              state.cameraY = targetCamY;
              state.isCameraLocked = true;
            }
          }
        }
      } else {
        state.lastLockedPlanetId = null;
        state.isCameraLocked = false;
      }

      // Draw Orbit Paths
      if (config.showOrbits) {
        PLANETS.forEach(p => {
          if (p.distance > 0) {
            const pDistance = getDistance(p.distance);
            if (!isOrbitInFrustum(0, 0, pDistance)) return;
            ctx.beginPath();
            const orbitSides = config.perfMode ? 32 : (config.hdMode ? 128 : 64);
            drawPolyPath(ctx, 0, 0, pDistance, orbitSides);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();
          }
        });
      }

      // Draw Asteroids with Frustum Culling
      if (config.showAsteroids) {
        const asteroidLimit = config.perfMode ? 40 : ASTEROIDS.length;
        for (let i = 0; i < asteroidLimit; i++) {
          const a = ASTEROIDS[i];
          const offsetAngle = a.angle + (state.time * a.speed);
          const aDistance = getDistance(a.distance);
          const aRadius = getRadius(a.radius);
          const px = Math.cos(offsetAngle) * aDistance;
          const py = Math.sin(offsetAngle) * aDistance;
          if (!inFrustum(px, py, aRadius + 10)) continue;
          
          ctx.beginPath();
          drawPolyPath(ctx, px, py, aRadius, a.sides);
          ctx.fillStyle = a.color;
          ctx.fill();
        }
      }

      // Draw Planets
      PLANETS.forEach(p => {
        const pAngle = state.time * p.speed;
        const pDistance = getDistance(p.distance);
        const pRadius = getRadius(p.radius, p.id === 'sun');
        const px = Math.cos(pAngle) * pDistance;
        const py = Math.sin(pAngle) * pDistance;

        const isPlanetVisible = inFrustum(px, py, pRadius * 3 + 100 / zoom);

        if (isPlanetVisible) {
          // Draw Rings (e.g. for Saturn)
          if (p.rings) {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(Math.PI / 8); 
            ctx.scale(1, 0.25);
            ctx.beginPath();
            drawPolyPath(ctx, 0, 0, pRadius + 20, 16);
            drawPolyPath(ctx, 0, 0, pRadius + 6, 16, true); 
            ctx.fillStyle = 'rgba(253, 230, 138, 0.6)'; // amber-200 with alpha
            ctx.fill();
            ctx.restore();
          }

          // Planet Main Body
          ctx.beginPath();
          const sides = config.perfMode ? Math.max(3, p.sides - 2) : (config.hdMode ? p.sides * 3 : p.sides);
          drawPolyPath(ctx, px, py, pRadius, sides);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Consistent Selection & Hover Reticle Glow
          const isPSelected = config.selectedPlanet === p.id || state.lockedPlanetId === p.id;
          const isPHovered = config.hoveredPlanet === p.id;
          const targetGlow = isPSelected ? 0.35 : (isPHovered ? 0.18 : 0);
          const pLerp = 1 - Math.pow(1 - 0.28, dt);
          state.glows[p.id] = (state.glows[p.id] || 0) + (targetGlow - (state.glows[p.id] || 0)) * pLerp;

          if (state.glows[p.id] > 0.005) {
            const pCol = (p.color && p.color.startsWith('#')) ? p.color : '#cbd5e1';
            const pr = parseInt(pCol.slice(1,3), 16) || 203;
            const pg = parseInt(pCol.slice(3,5), 16) || 213;
            const pb = parseInt(pCol.slice(5,7), 16) || 225;
            const baseRingRadius = Math.max(pRadius * 1.3, 10 / zoom);
            const breathPhase = Math.sin((currentTime * 0.001) * 2.0);
            const breathRadius = baseRingRadius * (1 + 0.03 * breathPhase);
            const breathAlpha = 0.92 + 0.08 * breathPhase;

            ctx.beginPath();
            ctx.arc(px, py, breathRadius * 1.1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${state.glows[p.id] * breathAlpha})`;
            ctx.fill();

            // Target lock soft breathing ring
            ctx.beginPath();
            ctx.arc(px, py, breathRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, state.glows[p.id] * 2.5 * breathAlpha)})`;
            ctx.lineWidth = 1.2 / zoom;
            ctx.setLineDash([4 / zoom, 4 / zoom]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          
          // Planet Label
          if (config.showLabels && (zoom > 0.4 || pRadius > 15)) {
            const targetCtx = labelCtx || ctx;
            targetCtx.fillStyle = config.selectedPlanet === p.id ? p.color : 'rgba(255, 255, 255, 0.7)';
            targetCtx.font = `${config.selectedPlanet === p.id ? 'bold ' : ''}${Math.max(10, 12 / zoom)}px "JetBrains Mono", ui-monospace, SFMono-Regular, monospace`;
            targetCtx.textAlign = 'center';
            const tMap = TRANSLATIONS[config.lang as keyof typeof TRANSLATIONS];
            const tEn = TRANSLATIONS['en'];
            const tName = tMap[`${p.id}_name` as keyof typeof tMap] || tEn[`${p.id}_name` as keyof typeof tEn] || p.name;
            targetCtx.fillText(tName, px, py - pRadius - (8 / zoom));
          }
        }

        // Draw Moons
        if (p.moons) {
          p.moons.forEach((m) => {
            const mAngle = state.time * m.speed;
            const mDistance = getDistance(m.distance);
            const mRadius = getRadius(m.radius);
            const mx = px + Math.cos(mAngle) * mDistance;
            const my = py + Math.sin(mAngle) * mDistance;

            // Sub-pixel Culling
            if (mRadius * zoom < 0.2) return;

            // Occlusion Culling: Moon behind its planet when zoomed out/overlapping
            const distToPlanet = Math.hypot(mx - px, my - py);
            if (distToPlanet < pRadius * 0.85 && Math.sin(mAngle) < 0) return;

            // Frustum Culling for Moons
            if (!inFrustum(mx, my, mRadius + 20 / zoom)) return;

            if (config.showOrbits && isOrbitInFrustum(px, py, mDistance)) {
              ctx.beginPath();
              const orbitSides = config.perfMode ? 24 : (config.hdMode ? 64 : 32);
              drawPolyPath(ctx, px, py, mDistance, orbitSides);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
              ctx.lineWidth = 1 / zoom;
              ctx.stroke();
            }

            ctx.beginPath();
            const mSides = config.perfMode ? Math.max(3, m.sides - 1) : (config.hdMode ? m.sides * 3 : m.sides);
            drawPolyPath(ctx, mx, my, mRadius, mSides);
            ctx.fillStyle = m.color;
            ctx.fill();

            // Consistent Moon Selection & Hover Glow
            const isMSelected = config.selectedPlanet === m.id || state.lockedPlanetId === m.id;
            const isMHovered = config.hoveredPlanet === m.id;
            const targetMoonGlow = isMSelected ? 0.35 : (isMHovered ? 0.18 : 0);
            const mLerp = 1 - Math.pow(1 - 0.28, dt);
            state.glows[m.id] = (state.glows[m.id] || 0) + (targetMoonGlow - (state.glows[m.id] || 0)) * mLerp;

            if (state.glows[m.id] > 0.005) {
              const mCol = (m.color && m.color.startsWith('#')) ? m.color : '#cbd5e1';
              const mr = parseInt(mCol.slice(1,3), 16) || 203;
              const mg = parseInt(mCol.slice(3,5), 16) || 213;
              const mb = parseInt(mCol.slice(5,7), 16) || 225;
              const baseMRingRadius = Math.max(mRadius * 1.35, 6 / zoom);
              const breathPhase = Math.sin((currentTime * 0.001) * 2.0);
              const breathRadius = baseMRingRadius * (1 + 0.03 * breathPhase);
              const breathAlpha = 0.92 + 0.08 * breathPhase;

              ctx.beginPath();
              ctx.arc(mx, my, breathRadius * 1.1, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${mr}, ${mg}, ${mb}, ${state.glows[m.id] * breathAlpha})`;
              ctx.fill();

              // Target lock soft breathing ring
              ctx.beginPath();
              ctx.arc(mx, my, breathRadius, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, state.glows[m.id] * 2.5 * breathAlpha)})`;
              ctx.lineWidth = 1.2 / zoom;
              ctx.setLineDash([3 / zoom, 3 / zoom]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
        }
      });

      // Smoothly update focus factor for realistic fisheye lens distortion and edge vignette
      const isFocused = Boolean(config.selectedPlanet || state.lockedPlanetId);
      const targetFocus = isFocused ? 1.0 : 0.0;
      const focusLerp = 1 - Math.pow(1 - 0.04, dt);
      state.focusFactor = (state.focusFactor ?? 0) + (targetFocus - (state.focusFactor ?? 0)) * focusLerp;

      // 2D Canvas Fallback Vignette Pass (smooth, continuous edge darkening on focus)
      if (config.enableVignette && !isWebGpuActive) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.sqrt(cx * cx + cy * cy);
        const grad = ctx.createRadialGradient(cx, cy, maxR * 0.35, cx, cy, maxR);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        const baseAlpha = 0.08;
        const focusAlpha = 0.22 * state.focusFactor;
        grad.addColorStop(0.60, `rgba(2, 4, 12, ${(baseAlpha + focusAlpha) * 0.25})`);
        grad.addColorStop(1, `rgba(2, 4, 10, ${baseAlpha + focusAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Execute WebGPU FSR RCAS Upscaling Pass if available
      if (webgpuRef.current && canvasRef.current) {
        const gpu = webgpuRef.current;
        const srcCanvas = canvasRef.current;
        const srcW = srcCanvas.width;
        const srcH = srcCanvas.height;

        if (srcW > 0 && srcH > 0) {
          try {
            if (!gpu.inputTexture || gpu.textureWidth !== srcW || gpu.textureHeight !== srcH) {
              if (gpu.inputTexture) gpu.inputTexture.destroy();
              gpu.inputTexture = gpu.device.createTexture({
                size: [srcW, srcH, 1],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
              });
              gpu.textureWidth = srcW;
              gpu.textureHeight = srcH;

              gpu.bindGroup = gpu.device.createBindGroup({
                layout: gpu.pipeline.getBindGroupLayout(0),
                entries: [
                  { binding: 0, resource: gpu.sampler },
                  { binding: 1, resource: gpu.inputTexture.createView() },
                  { binding: 2, resource: { buffer: gpu.uniformBuffer } }
                ]
              });
            }

            gpu.device.queue.copyExternalImageToTexture(
              { source: srcCanvas },
              { texture: gpu.inputTexture },
              [srcW, srcH]
            );

            const sunNormX = 0.5 + (state.cameraX / window.innerWidth);
            const sunNormY = 0.5 + (state.cameraY / window.innerHeight);

            const bloomFactor = config.enableBloom ? (config.graphicsPreset === 'ultra' ? 0.85 : config.graphicsPreset === 'high' ? 0.65 : 0.45) : 0.0;
            const chromaticFactor = config.enableChromatic ? (config.graphicsPreset === 'ultra' ? 0.4 : 0.2) : 0.0;
            const flareFactor = config.enableLensFlare ? (config.graphicsPreset === 'ultra' ? 0.35 : config.graphicsPreset === 'high' ? 0.25 : 0.18) : 0.0;
            const dustFactor = config.enableCosmicDust ? (config.graphicsPreset === 'ultra' ? 0.8 : 0.5) : 0.0;
            const vignetteFactor = config.enableVignette ? (config.graphicsPreset === 'ultra' ? 0.60 : 0.45) : 0.0;

            const effectiveSharpen = config.resScale >= 0.999 ? 0.0 : config.sharpenLevel;

            const uArr = gpu.uniformsArray || new Float32Array(16);
            uArr[0] = effectiveSharpen;
            uArr[1] = srcW;
            uArr[2] = srcH;
            uArr[3] = performance.now() * 0.001;
            uArr[4] = bloomFactor;
            uArr[5] = chromaticFactor;
            uArr[6] = flareFactor;
            uArr[7] = dustFactor;
            uArr[8] = sunNormX;
            uArr[9] = sunNormY;
            uArr[10] = vignetteFactor;
            uArr[11] = config.resScale;
            uArr[12] = state.zoom;
            uArr[13] = state.focusFactor;
            gpu.device.queue.writeBuffer(gpu.uniformBuffer, 0, uArr);

            const commandEncoder = gpu.device.createCommandEncoder();
            const textureView = gpu.context.getCurrentTexture().createView();
            const passEncoder = commandEncoder.beginRenderPass({
              colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.06, g: 0.09, b: 0.16, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
              }]
            });

            passEncoder.setPipeline(gpu.pipeline);
            if (gpu.bindGroup) {
              passEncoder.setBindGroup(0, gpu.bindGroup);
            }
            passEncoder.draw(6, 1, 0, 0);
            passEncoder.end();

            gpu.device.queue.submit([commandEncoder.finish()]);
          } catch (err: any) {
            console.warn('WebGPU frame render error:', err);
            setIsWebGpuActive(false);
            setIsWebGpuDisabled(true);
            isWebGpuHaltedRef.current = true;
            setWebGpuDisabledReason(`WebGPU frame render runtime error: ${err?.message || 'Device context lost'}`);
          }
        }
      }

      const frameTimeMs = performance.now() - frameStartTime;
      renderTimeSumRef.current += frameTimeMs;
      renderFrameCountRef.current += 1;

      if (currentTime - fpsLastTimeRef.current >= 1000) {
        fpsFrameCountRef.current = 0;
        renderTimeSumRef.current = 0;
        renderFrameCountRef.current = 0;
        fpsLastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    restartRenderLoopRef.current = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      lastFrameTime = performance.now();
      lastTickTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      canvas.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Require holding down right click (e.button === 2) or touch drag to move/pan camera
    if (e.button === 2 || e.pointerType === 'touch') {
      stateRef.current.isDragging = true;
      stateRef.current.lockedPlanetId = null;
      stateRef.current.lastLockedPlanetId = null;
      stateRef.current.isCameraLocked = false;
      setSelectedPlanet(null);
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastY = e.clientY;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only primary left-click focuses celestial objects or deselects
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldX = (x - window.innerWidth / 2 - stateRef.current.cameraX) / stateRef.current.zoom;
    const worldY = (y - window.innerHeight / 2 - stateRef.current.cameraY) / stateRef.current.zoom;

    const hits = [];
    
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
    }

    let clickedPlanetId = bestHitId;
    if (clickedPlanetId) {
      const allBodies = [
        ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
        ...CONSTELLATIONS.map(c => ({ ...c, name: c.id })),
        ...BLACK_HOLES.map(b => ({ ...b, name: b.id })),
        ...SPACECRAFTS
      ];
      const body = allBodies.find(b => b.id === clickedPlanetId);
      if (body) {
        handleSelectBody(body, stateRef.current.lockedPlanetId !== clickedPlanetId);
      }
    } else if (selectedPlanet) {
      // Unselect if clicked on empty space
      setSelectedPlanet(null);
      stateRef.current.lockedPlanetId = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update mouse position for hit testing
    stateRef.current.mouseX = x;
    stateRef.current.mouseY = y;

    // Convert to world to check hover
    const worldX = (x - window.innerWidth / 2 - stateRef.current.cameraX) / stateRef.current.zoom;
    const worldY = (y - window.innerHeight / 2 - stateRef.current.cameraY) / stateRef.current.zoom;
    
    const hits = [];
    
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
    }

    let hoveredId = bestHitId;
    if (hoveredId !== hoveredPlanet) {
        setHoveredPlanet(hoveredId);
        if(hoveredId) e.currentTarget.style.cursor = 'pointer';
        else e.currentTarget.style.cursor = 'grab';
    }

    if (!stateRef.current.isDragging) return;
    
    e.currentTarget.style.cursor = 'grabbing';
    
    const dx = e.clientX - stateRef.current.lastX;
    const dy = e.clientY - stateRef.current.lastY;
    stateRef.current.cameraX += dx;
    stateRef.current.cameraY += dy;
    stateRef.current.lastX = e.clientX;
    stateRef.current.lastY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.isDragging = false;
    e.currentTarget.style.cursor = hoveredPlanet ? 'pointer' : 'grab';
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setHoveredPlanet(null);
    stateRef.current.isDragging = false;
  };

  const togglePause = () => {
    setSpeedMultiplier(prev => {
      if (prev > 0) {
        previousSpeedRef.current = prev;
        return 0;
      }
      return previousSpeedRef.current || 1;
    });
  };

  const resetCamera = () => {
    stateRef.current.lockedPlanetId = null;
    stateRef.current.lastLockedPlanetId = null;
    stateRef.current.isCameraLocked = false;
    setSelectedPlanet(null);
    stateRef.current.cameraX = 0;
    stateRef.current.cameraY = 0;
    stateRef.current.zoom = 1;
    stateRef.current.targetZoom = 1;
    setIsSettingsOpen(false);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    playTapSound();
    const factor = direction === 'in' ? 1.5 : 0.66;
    let nextZoom = stateRef.current.targetZoom * factor;
    nextZoom = Math.max(0.1, Math.min(nextZoom, 5));
    stateRef.current.targetZoom = nextZoom;
  };

  const selectedBodyName = useMemo(() => {
    if (!selectedPlanet) return null;
    const allBodies = [
      ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
      ...CONSTELLATIONS.map(c => ({ id: c.id, name: '', nameKey: c.nameKey })),
      ...BLACK_HOLES.map(b => ({ id: b.id, name: '', nameKey: b.nameKey })),
      ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey }))
    ];
    const planet = allBodies.find(p => p.id === selectedPlanet);
    if (!planet) return selectedPlanet;
    return ('nameKey' in planet && planet.nameKey) 
      ? (t[planet.nameKey as keyof typeof t] || TRANSLATIONS['en'][planet.nameKey as keyof typeof TRANSLATIONS['en']] || planet.id) 
      : (t[`${planet.id}_name` as keyof typeof t] || TRANSLATIONS['en'][`${planet.id}_name` as keyof typeof TRANSLATIONS['en']] || planet.id);
  }, [selectedPlanet, t]);

  interface SuperSearchItem {
    id: string;
    category: 'Celestial' | 'Settings' | 'Actions' | 'Tools';
    title: string;
    subtitle: string;
    keywords: string[];
    icon: React.ReactNode;
    color?: string;
    badge?: string;
    badgeType?: 'active' | 'inactive' | 'info';
    disabled?: boolean;
    shortcut?: string;
    bodyData?: any;
    action: () => void;
  }

  const allSearchItems = useMemo<SuperSearchItem[]>(() => {
    const items: SuperSearchItem[] = [];

    // 1. Celestial Bodies
    const celestialBodies = [
      ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
      ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
      ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
      ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
    ];

    celestialBodies.forEach(b => {
      const isConstellation = CONSTELLATIONS.some(c => c.id === b.id);
      const isBlackHole = BLACK_HOLES.some(bh => bh.id === b.id);
      const isSpacecraft = SPACECRAFTS.some(s => s.id === b.id);
      const isStar = b.id === 'sun';
      const isPlanet = PLANETS.some(p => p.id === b.id);
      const isMoon = !isConstellation && !isBlackHole && !isSpacecraft && !isStar && !isPlanet;

      const tName = ('nameKey' in b && b.nameKey) 
        ? ((t as any)[b.nameKey] || (TRANSLATIONS['en'] as any)[b.nameKey] || b.name) 
        : (t[`${b.id}_name` as keyof typeof t] || TRANSLATIONS['en'][`${b.id}_name` as keyof typeof TRANSLATIONS['en']] || b.name);

      let typeLabel = 'Moon';
      let icon = <Globe className="w-4 h-4 text-slate-400" />;
      if (isStar) {
        typeLabel = 'Star • Solar Center';
        icon = <Sun className="w-4 h-4 text-slate-400" />;
      } else if (isPlanet) {
        typeLabel = 'Planet • Solar System';
        icon = <Globe className="w-4 h-4" style={{ color: b.color || '#38bdf8' }} />;
      } else if (isMoon) {
        typeLabel = 'Moon • Natural Satellite';
        icon = <Globe className="w-4 h-4 text-slate-400" />;
      } else if (isBlackHole) {
        typeLabel = 'Black Hole • Deep Space';
        icon = <Aperture className="w-4 h-4 text-slate-400" />;
      } else if (isSpacecraft) {
        typeLabel = 'Spacecraft • Mission Probe';
        icon = <Rocket className="w-4 h-4 text-slate-400" />;
      } else if (isConstellation) {
        typeLabel = 'Constellation • Star Pattern';
        icon = <Share2 className="w-4 h-4 text-slate-400" />;
      }

      const moonsCount = ('moons' in b && Array.isArray((b as any).moons)) ? (b as any).moons.length : 0;
      const hasRings = Boolean((b as any).rings);
      const info = BODY_DETAILS[b.id];
      const tempStr = info?.temp || '';
      const radiusVal = (b as any).radius || 0;
      const distVal = (b as any).distance || 0;

      const keywords = [
        b.id,
        b.name || '',
        typeLabel,
        'space', 'orbit', 'body',
        `moons:${moonsCount}`,
        `radius:${radiusVal}`,
        `distance:${distVal}`,
        hasRings ? 'rings:true' : 'rings:false',
        hasRings ? 'rings' : '',
        moonsCount > 0 ? 'has:moons' : '',
        b.id === 'earth' ? 'habitable' : '',
        ['jupiter', 'saturn'].includes(b.id) ? 'gas giant' : '',
        ['uranus', 'neptune'].includes(b.id) ? 'ice giant' : '',
        ['mercury', 'venus', 'earth', 'mars'].includes(b.id) ? 'terrestrial' : '',
        b.id === 'sun' || b.id === 'jupiter' ? 'largest' : '',
        b.id === 'mercury' || b.id === 'pluto' ? 'smallest' : '',
        b.id === 'sun' || b.id === 'venus' ? 'hottest' : '',
        b.id === 'uranus' || b.id === 'pluto' ? 'coldest' : '',
        b.id === 'mercury' || b.id === 'iss' ? 'fastest' : '',
        b.id === 'pluto' || b.id === 'voyager1' ? 'farthest' : '',
        tempStr
      ].filter(Boolean);

      items.push({
        id: `body-${b.id}`,
        category: 'Celestial',
        title: tName,
        subtitle: typeLabel,
        keywords,
        color: b.color || '#38bdf8',
        icon,
        badge: 'Focus',
        badgeType: 'info',
        bodyData: b,
        action: () => handleSelectBody(b, !isStar)
      });
    });

    // 2. Settings & Controls
    items.push(
      {
        id: 'set-orbits',
        category: 'Settings',
        title: 'Orbit Lines',
        subtitle: 'Show or hide planetary orbital paths',
        keywords: ['orbit', 'lines', 'path', 'trajectories', 'show', 'hide', 'toggle'],
        icon: <Layers className="w-4 h-4 text-slate-400" />,
        badge: showOrbits ? 'ON' : 'OFF',
        badgeType: showOrbits ? 'active' : 'inactive',
        action: () => { setShowOrbits(!showOrbits); playTapSound(); }
      },
      {
        id: 'set-labels',
        category: 'Settings',
        title: 'Planet & Body Labels',
        subtitle: 'Display name tags over celestial objects',
        keywords: ['label', 'names', 'text', 'tag', 'show', 'hide', 'toggle'],
        icon: <Info className="w-4 h-4 text-slate-400" />,
        badge: showLabels ? 'ON' : 'OFF',
        badgeType: showLabels ? 'active' : 'inactive',
        action: () => { setShowLabels(!showLabels); playTapSound(); }
      },
      {
        id: 'set-asteroids',
        category: 'Settings',
        title: 'Asteroid Belt & Comets',
        subtitle: 'Render belt asteroids and passing comets',
        keywords: ['asteroid', 'comet', 'belt', 'rocks', 'space', 'show', 'hide'],
        icon: <Grid className="w-4 h-4 text-slate-400" />,
        badge: showAsteroids ? 'ON' : 'OFF',
        badgeType: showAsteroids ? 'active' : 'inactive',
        action: () => { setShowAsteroids(!showAsteroids); playTapSound(); }
      },
      {
        id: 'set-constellations',
        category: 'Settings',
        title: 'Constellation Grid',
        subtitle: 'Show or hide constellation line patterns',
        keywords: ['constellation', 'stars', 'grid', 'lines', 'patterns', 'show', 'hide'],
        icon: <Share2 className="w-4 h-4 text-slate-400" />,
        badge: showConstellations ? 'ON' : 'OFF',
        badgeType: showConstellations ? 'active' : 'inactive',
        action: () => { setShowConstellations(!showConstellations); playTapSound(); }
      },
      {
        id: 'set-spacecraft',
        category: 'Settings',
        title: 'Spacecraft Trajectories',
        subtitle: 'Show satellite probes and space missions',
        keywords: ['spacecraft', 'probe', 'voyager', 'iss', 'jwst', 'satellite', 'missions'],
        icon: <Rocket className="w-4 h-4 text-slate-400" />,
        badge: showSpacecraft ? 'ON' : 'OFF',
        badgeType: showSpacecraft ? 'active' : 'inactive',
        action: () => { setShowSpacecraft(!showSpacecraft); playTapSound(); }
      },
      {
        id: 'set-perf',
        category: 'Settings',
        title: 'Performance Mode',
        subtitle: 'Optimize framerate by lowering overall graphical fidelity',
        keywords: ['performance', 'fps', 'speed', 'fast', 'lag', 'optimize', 'low'],
        icon: <Gauge className="w-4 h-4 text-slate-400" />,
        badge: perfMode ? 'ON' : 'OFF',
        badgeType: perfMode ? 'active' : 'inactive',
        action: () => { if (!perfMode) setShowPerfModal(true); else setPerfMode(false); playTapSound(); }
      },
      {
        id: 'set-preset',
        category: 'Settings',
        title: 'Graphics Quality Preset',
        subtitle: `Current preset: ${graphicsPreset.toUpperCase()} (Low / Medium / High / Ultra)`,
        keywords: ['graphics', 'quality', 'preset', 'ultra', 'high', 'medium', 'low', 'bloom', 'fx'],
        icon: <SlidersHorizontal className="w-4 h-4 text-slate-400" />,
        badge: graphicsPreset.toUpperCase(),
        badgeType: 'info',
        action: () => { setSettingsTab('graphics'); setIsSearchOpen(false); setIsSettingsOpen(true); playTapSound(); }
      },
      {
        id: 'set-fps-cap',
        category: 'Settings',
        title: 'Framerate Cap',
        subtitle: `Current cap: ${fpsCap} FPS`,
        keywords: ['fps', 'cap', 'limit', '30', '60', '75', '90', '120', '144', '240', '360', 'hz', 'refresh'],
        icon: <Gauge className="w-4 h-4 text-slate-400" />,
        badge: `${fpsCap} FPS`,
        badgeType: 'info',
        action: () => { setSettingsTab('simulation'); setIsSearchOpen(false); setIsSettingsOpen(true); playTapSound(); }
      },
      {
        id: 'set-temp-unit',
        category: 'Settings',
        title: 'Temperature Unit',
        subtitle: `Display surface temperatures in °${tempUnit}`,
        keywords: ['temperature', 'celsius', 'fahrenheit', 'degree', 'c', 'f', 'unit'],
        icon: <Thermometer className="w-4 h-4 text-slate-400" />,
        badge: `°${tempUnit}`,
        badgeType: 'info',
        action: () => { setTempUnit(tempUnit === 'C' ? 'F' : 'C'); playTapSound(); }
      },
      {
        id: 'set-wasd-speed',
        category: 'Settings',
        title: 'WASD Camera Movement Speed',
        subtitle: `Adjust panning speed for WASD & Arrow keys (Current: ${Math.round(wasdSpeed)} px/frame)`,
        keywords: ['wasd', 'camera', 'speed', 'movement', 'pan', 'move', 'shift', 'slow', 'keyboard', 'controls', 'navigation', 'arrow'],
        icon: <Compass className="w-4 h-4 text-slate-400" />,
        badge: `${Math.round(wasdSpeed)} PX`,
        badgeType: 'info',
        action: () => { setSettingsTab('simulation'); setIsSearchOpen(false); setIsSettingsOpen(true); playTapSound(); }
      },
      {
        id: 'set-bloom',
        category: 'Settings',
        title: 'Glow & Bloom Post-Processing',
        subtitle: 'Atmospheric light bloom and stellar radiance',
        keywords: ['bloom', 'glow', 'post-processing', 'light', 'effects'],
        icon: <Sparkles className="w-4 h-4 text-slate-400" />,
        badge: enableBloom ? 'ON' : 'OFF',
        badgeType: enableBloom ? 'active' : 'inactive',
        action: () => { setEnableBloom(!enableBloom); setGraphicsPreset('custom'); playTapSound(); }
      },
      {
        id: 'set-flare',
        category: 'Settings',
        title: 'Anamorphic Lens Flare',
        subtitle: 'Solar flare streaks and ray shafts',
        keywords: ['flare', 'lens', 'sun', 'rays', 'streaks', 'anamorphic'],
        icon: <Sun className="w-4 h-4 text-slate-400" />,
        badge: enableLensFlare ? 'ON' : 'OFF',
        badgeType: enableLensFlare ? 'active' : 'inactive',
        action: () => { setEnableLensFlare(!enableLensFlare); setGraphicsPreset('custom'); playTapSound(); }
      },
      {
        id: 'set-dust',
        category: 'Settings',
        title: 'Interstellar Cosmic Dust',
        subtitle: 'Space dust particles and ambient shimmer',
        keywords: ['dust', 'cosmic', 'particles', 'shimmer', 'space'],
        icon: <Sparkles className="w-4 h-4 text-slate-400" />,
        badge: enableCosmicDust ? 'ON' : 'OFF',
        badgeType: enableCosmicDust ? 'active' : 'inactive',
        action: () => { setEnableCosmicDust(!enableCosmicDust); setGraphicsPreset('custom'); playTapSound(); }
      },
      {
        id: 'set-vignette',
        category: 'Settings',
        title: 'Cinematic Vignette Effect',
        subtitle: 'Edge darkening vignette shader',
        keywords: ['vignette', 'cinematic', 'dark', 'edge', 'effects'],
        icon: <Eye className="w-4 h-4 text-slate-400" />,
        badge: enableVignette ? 'ON' : 'OFF',
        badgeType: enableVignette ? 'active' : 'inactive',
        action: () => { setEnableVignette(!enableVignette); setGraphicsPreset('custom'); playTapSound(); }
      },
      {
        id: 'set-ai-guide',
        category: 'Settings',
        title: 'AI Stellar Guide Descriptions',
        subtitle: `Use ${aiModel} for real-time body explanations`,
        keywords: ['ai', 'gemini', 'chatgpt', 'claude', 'mistral', 'grok', 'guide', 'descriptions', 'stellar', 'assistant'],
        icon: <Bot className="w-4 h-4 text-slate-400" />,
        badge: useAI ? 'ON' : 'OFF',
        badgeType: useAI ? 'active' : 'inactive',
        action: () => { setUseAI(!useAI); playTapSound(); }
      }
    );

    // 3. Quick Actions
    items.push(
      {
        id: 'act-pause',
        category: 'Actions',
        title: speedMultiplier === 0 ? 'Resume Simulation' : 'Pause Simulation',
        subtitle: speedMultiplier === 0 ? 'Unfreeze planetary orbital motion' : 'Freeze planetary orbital motion',
        keywords: ['pause', 'play', 'resume', 'freeze', 'time', 'stop', 'start', 'space'],
        icon: speedMultiplier === 0 ? <Play className="w-4 h-4 text-slate-400" /> : <Pause className="w-4 h-4 text-slate-400" />,
        shortcut: 'Space',
        action: () => { togglePause(); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-reset',
        category: 'Actions',
        title: 'Reset View & Recenter Camera',
        subtitle: 'Return zoom and camera coordinates to origin',
        keywords: ['reset', 'recenter', 'camera', 'origin', 'view', 'center', 'home'],
        icon: <RotateCcw className="w-4 h-4 text-slate-400" />,
        shortcut: 'R',
        action: () => { resetCamera(); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-zoom-in',
        category: 'Actions',
        title: 'Zoom In Camera',
        subtitle: 'Increase camera magnification level',
        keywords: ['zoom', 'in', 'magnify', 'closer', 'camera'],
        icon: <ZoomIn className="w-4 h-4 text-slate-400" />,
        action: () => { handleZoom('in'); playTapSound(); }
      },
      {
        id: 'act-zoom-out',
        category: 'Actions',
        title: 'Zoom Out Camera',
        subtitle: 'Decrease camera magnification level',
        keywords: ['zoom', 'out', 'wide', 'far', 'camera'],
        icon: <ZoomOut className="w-4 h-4 text-slate-400" />,
        action: () => { handleZoom('out'); playTapSound(); }
      },
      {
        id: 'act-speed-1x',
        category: 'Actions',
        title: 'Set Time Speed to 1x (Baseline)',
        subtitle: 'Standard real-time orbital progression',
        keywords: ['speed', '1x', 'normal', 'realtime', 'baseline', 'time', 'velocity'],
        icon: <Zap className="w-4 h-4 text-slate-400" />,
        badge: '1x',
        badgeType: 'info',
        action: () => { setSpeedMultiplier(1); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-speed-10x',
        category: 'Actions',
        title: 'Set Time Speed to 10x (Fast Forward)',
        subtitle: 'Accelerated planetary motion',
        keywords: ['speed', '10x', 'fast', 'forward', 'time', 'accelerate'],
        icon: <Zap className="w-4 h-4 text-slate-400" />,
        badge: '10x',
        badgeType: 'info',
        action: () => { setSpeedMultiplier(10); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-speed-100x',
        category: 'Actions',
        title: 'Set Time Speed to 100x (Hyper Speed)',
        subtitle: 'Ultra fast orbital cycles',
        keywords: ['speed', '100x', 'hyper', 'fast', 'time', 'super'],
        icon: <Zap className="w-4 h-4 text-slate-400" />,
        badge: '100x',
        badgeType: 'info',
        action: () => { setSpeedMultiplier(100); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-unlock',
        category: 'Actions',
        title: 'Unlock Camera Focus',
        subtitle: 'Clear planet tracking and unlock free movement',
        keywords: ['unlock', 'clear', 'focus', 'free', 'camera', 'deselect', 'target'],
        icon: <Focus className="w-4 h-4 text-slate-400" />,
        action: () => { stateRef.current.lockedPlanetId = null; setSelectedPlanet(null); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-focus-sun',
        category: 'Actions',
        title: 'Focus Camera on the Sun',
        subtitle: 'Center view on central star',
        keywords: ['focus', 'sun', 'star', 'center', 'sol'],
        icon: <Sun className="w-4 h-4 text-slate-400" />,
        action: () => { stateRef.current.lockedPlanetId = 'sun'; setSelectedPlanet('sun'); setIsSearchOpen(false); playTapSound(); }
      },
      {
        id: 'act-focus-earth',
        category: 'Actions',
        title: 'Focus Camera on Earth',
        subtitle: 'Center view on home planet',
        keywords: ['focus', 'earth', 'world', 'home', 'terran'],
        icon: <Globe className="w-4 h-4 text-slate-400" />,
        action: () => { stateRef.current.lockedPlanetId = 'earth'; setSelectedPlanet('earth'); setIsSearchOpen(false); playTapSound(); }
      }
    );

    // 4. Tools & AI
    items.push(
      {
        id: 'tool-ai-researcher',
        category: 'Tools',
        title: 'AI Space Researcher & Assistant',
        subtitle: useAI ? `Inquire about space science powered by ${aiModel}` : 'AI Assistance is disabled in settings',
        keywords: ['ai', 'researcher', 'gemini', 'chatgpt', 'claude', 'mistral', 'grok', 'assistant', 'ask', 'question', 'physics', 'astronomy'],
        icon: <Bot className="w-4 h-4 text-slate-400" />,
        badge: useAI ? aiModel.toUpperCase() : 'DISABLED',
        badgeType: useAI ? 'info' : 'inactive',
        disabled: !useAI,
        action: () => {
          if (!useAI) return;
          setIsSearchOpen(false);
          setAiResearcherQuestion(null);
          setIsAIResearcherOpen(true);
          playTapSound();
        }
      },
      {
        id: 'tool-ask-blackhole',
        category: 'Tools',
        title: 'Ask AI: "Explain Black Hole Event Horizons"',
        subtitle: useAI ? 'Launch AI researcher with this astrophysics topic' : 'AI Assistance is disabled in settings',
        keywords: ['ask', 'ai', 'black hole', 'event horizon', 'singularity', 'gravity'],
        icon: <Aperture className="w-4 h-4 text-slate-400" />,
        badge: useAI ? undefined : 'DISABLED',
        badgeType: useAI ? undefined : 'inactive',
        disabled: !useAI,
        action: () => {
          if (!useAI) return;
          setIsSearchOpen(false);
          setAiResearcherQuestion('Explain Black Hole Event Horizons');
          setIsAIResearcherOpen(true);
          playTapSound();
        }
      },
      {
        id: 'tool-ask-solarflare',
        category: 'Tools',
        title: 'Ask AI: "How do Solar Flares affect Earth?"',
        subtitle: useAI ? 'Inquire about space weather and geomagnetic storms' : 'AI Assistance is disabled in settings',
        keywords: ['ask', 'ai', 'solar flare', 'sun', 'magnetic', 'storm', 'earth'],
        icon: <Sun className="w-4 h-4 text-slate-400" />,
        badge: useAI ? undefined : 'DISABLED',
        badgeType: useAI ? undefined : 'inactive',
        disabled: !useAI,
        action: () => {
          if (!useAI) return;
          setIsSearchOpen(false);
          setAiResearcherQuestion('How do Solar Flares affect Earth?');
          setIsAIResearcherOpen(true);
          playTapSound();
        }
      },
      {
        id: 'tool-webgpu-info',
        category: 'Tools',
        title: 'WebGPU Hardware & Shader Diagnostic',
        subtitle: 'View active GPU compute pipeline details',
        keywords: ['webgpu', 'gpu', 'hardware', 'shader', 'diagnostic', 'compute', 'pipeline'],
        icon: <Cpu className="w-4 h-4 text-slate-400" />,
        badge: 'GPU',
        badgeType: 'info',
        action: () => { setIsSearchOpen(false); setSettingsTab('graphics'); setIsSettingsOpen(true); playTapSound(); }
      }
    );

    return items;
  }, [t, showOrbits, showLabels, showAsteroids, showConstellations, showSpacecraft, hdMode, perfMode, graphicsPreset, fpsCap, tempUnit, lang, enableBloom, enableLensFlare, enableCosmicDust, enableVignette, useAI, speedMultiplier, wasdSpeed, aiModel]);

  const fpsPresetOptions: DropdownOption[] = useMemo(() => [
    { value: 60, label: '60 FPS' },
    { value: 75, label: '75 FPS' },
    { value: 90, label: '90 FPS' },
    { value: 120, label: '120 FPS' },
    { value: 144, label: '144 FPS' },
    { value: 240, label: '240 FPS' },
    { value: 360, label: '360 FPS' },
    { value: 540, label: '540 FPS' },
  ], []);

  const aiModelOptions: DropdownOption[] = useMemo(() => [
    { value: 'Gemini', label: 'Gemini (Default)' },
    { value: 'ChatGPT', label: 'ChatGPT (OpenAI)' },
    { value: 'Claude', label: 'Claude (Anthropic)' },
    { value: 'Mistral', label: 'Mistral AI' },
    { value: 'Grok', label: 'Grok (xAI)' },
  ], []);

  const compareBodyOptions: DropdownOption[] = useMemo(() => {
    const opts: DropdownOption[] = [{ value: 'sun', label: 'Sun (Star)' }];
    PLANETS.forEach(p => {
      opts.push({ value: p.id, label: `${p.name} (Planet)` });
      p.moons?.forEach(m => {
        opts.push({ value: m.id, label: `— ${m.name} (Moon)`, indent: true });
      });
    });
    return opts;
  }, []);

  const distanceBodyOptions: DropdownOption[] = useMemo(() => {
    const opts: DropdownOption[] = [{ value: 'sun', label: 'Sun' }];
    PLANETS.forEach(p => {
      opts.push({ value: p.id, label: p.name });
      p.moons?.forEach(m => {
        opts.push({ value: m.id, label: `— ${m.name}`, indent: true });
      });
    });
    return opts;
  }, []);

  const parseAttributeFilters = (q: string) => {
    const filters: { attr: string; op: string; numValue?: number; strValue?: string }[] = [];
    const attrRegex = /\b(moons|radius|size|distance|temp|speed|rings|type)\s*(>=|<=|>|<|=|:|\!=)\s*([a-zA-Z0-9_\-\.]+)/gi;
    let match;
    while ((match = attrRegex.exec(q)) !== null) {
      const attr = match[1].toLowerCase();
      const op = match[2];
      const rawVal = match[3].toLowerCase();
      const numVal = parseFloat(rawVal);
      filters.push({
        attr: attr === 'size' ? 'radius' : attr,
        op,
        numValue: isNaN(numVal) ? undefined : numVal,
        strValue: rawVal
      });
    }
    return filters;
  };

  const passesAttributeFilters = (b: any, bodyInfo: any, filters: ReturnType<typeof parseAttributeFilters>) => {
    if (!filters || filters.length === 0) return true;

    const moonsCount = ('moons' in b && Array.isArray(b.moons)) ? b.moons.length : 0;
    const radiusVal = b.radius || 0;
    const distVal = b.distance || 0;
    const ringsVal = Boolean(b.rings);

    let tempVal = 0;
    if (bodyInfo?.temp) {
      const m = bodyInfo.temp.match(/(-?\d+)/);
      if (m) tempVal = parseInt(m[1], 10);
    }

    const isPlanet = PLANETS.some(p => p.id === b.id);
    const isStar = b.id === 'sun';
    const isBlackHole = BLACK_HOLES.some(bh => bh.id === b.id);
    const isSpacecraft = SPACECRAFTS.some(s => s.id === b.id);
    const isConstellation = CONSTELLATIONS.some(c => c.id === b.id);

    let typeStr = 'moon';
    if (isStar) typeStr = 'star';
    else if (isPlanet) typeStr = 'planet';
    else if (isBlackHole) typeStr = 'blackhole';
    else if (isSpacecraft) typeStr = 'spacecraft';
    else if (isConstellation) typeStr = 'constellation';

    for (const f of filters) {
      if (f.attr === 'moons') {
        const target = f.numValue ?? 0;
        if (f.op === '>' && !(moonsCount > target)) return false;
        if (f.op === '>=' && !(moonsCount >= target)) return false;
        if (f.op === '<' && !(moonsCount < target)) return false;
        if (f.op === '<=' && !(moonsCount <= target)) return false;
        if ((f.op === '=' || f.op === ':') && !(moonsCount === target)) return false;
      } else if (f.attr === 'radius') {
        const target = f.numValue ?? 0;
        if (f.op === '>' && !(radiusVal > target)) return false;
        if (f.op === '>=' && !(radiusVal >= target)) return false;
        if (f.op === '<' && !(radiusVal < target)) return false;
        if (f.op === '<=' && !(radiusVal <= target)) return false;
        if ((f.op === '=' || f.op === ':') && !(radiusVal === target)) return false;
      } else if (f.attr === 'distance') {
        const target = f.numValue ?? 0;
        if (f.op === '>' && !(distVal > target)) return false;
        if (f.op === '>=' && !(distVal >= target)) return false;
        if (f.op === '<' && !(distVal < target)) return false;
        if (f.op === '<=' && !(distVal <= target)) return false;
        if ((f.op === '=' || f.op === ':') && !(distVal === target)) return false;
      } else if (f.attr === 'temp') {
        const target = f.numValue ?? 0;
        if (f.op === '>' && !(tempVal > target)) return false;
        if (f.op === '>=' && !(tempVal >= target)) return false;
        if (f.op === '<' && !(tempVal < target)) return false;
        if (f.op === '<=' && !(tempVal <= target)) return false;
        if ((f.op === '=' || f.op === ':') && !(tempVal === target)) return false;
      } else if (f.attr === 'rings') {
        const wantRings = f.strValue === 'true' || f.strValue === 'yes' || f.strValue === '1';
        if (wantRings !== ringsVal) return false;
      } else if (f.attr === 'type') {
        if (f.strValue && !typeStr.includes(f.strValue) && !(bodyInfo?.type || '').toLowerCase().includes(f.strValue)) return false;
      }
    }

    return true;
  };

  const superSearchResults = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const query = rawQuery.toLowerCase();
    
    const isAiTrigger = query.startsWith('@');
    let askAiItem: SuperSearchItem | null = null;

    if (isAiTrigger) {
      const questionText = rawQuery.replace(/^@(gemini|ai|chatgpt|claude|mistral|grok)?\s*/i, '').trim();
      askAiItem = {
        id: 'ask-ai-trigger-' + (questionText || 'default'),
        title: questionText ? `Ask ${aiModel}: "${questionText}"` : `Ask ${aiModel}...`,
        subtitle: `Open ${aiModel} side panel & ask question`,
        category: 'Actions',
        keywords: ['ai', 'ask', 'question', 'chat', 'assistant', aiModel.toLowerCase()],
        icon: <Sparkles className="w-4 h-4 text-slate-400 animate-pulse" />,
        badge: aiModel.toUpperCase(),
        badgeType: 'active',
        action: () => {
          recordRecentSearch({
            id: `ai-q-${questionText || 'chat'}`,
            title: questionText ? `Ask ${aiModel}: "${questionText}"` : `${aiModel} Chat`,
            subtitle: 'AI Conversation',
            category: 'Actions',
            badge: aiModel.toUpperCase()
          });
          setIsSearchOpen(false);
          setGeminiSidePanelQuestion(questionText || null);
          setIsGeminiSidePanelOpen(true);
        }
      };
    }

    let filtered = allSearchItems;

    if (searchCategory !== 'All' && searchCategory !== 'Compare' && searchCategory !== 'Distance' && searchCategory !== 'TimeTravel') {
      filtered = filtered.filter(item => item.category === searchCategory);
    }

    if (searchCategory === 'Celestial' && celestialFilter !== 'all') {
      filtered = filtered.filter(item => {
        const sub = item.subtitle.toLowerCase();
        if (celestialFilter === 'planet') return sub.includes('planet') || sub.includes('star');
        if (celestialFilter === 'moon') return sub === 'moon';
        if (celestialFilter === 'spacecraft') return sub.includes('spacecraft') || sub.includes('space station') || sub.includes('space probe') || sub.includes('space telescope');
        if (celestialFilter === 'blackhole') return sub.includes('black hole') || sub.includes('microquasar');
        if (celestialFilter === 'constellation') return sub.includes('constellation');
        return true;
      });
    }

    if (query.length > 0 && !isAiTrigger) {
      const attrFilters = parseAttributeFilters(query);
      const cleanedQuery = query.replace(/\b(moons|radius|size|distance|temp|speed|rings|type)\s*(>=|<=|>|<|=|:|\!=)\s*([a-zA-Z0-9_\-\.]+)/gi, '').trim();

      filtered = filtered.filter(item => {
        if (attrFilters.length > 0 && item.bodyData) {
          const bInfo = BODY_DETAILS[item.bodyData.id];
          const passesAttrs = passesAttributeFilters(item.bodyData, bInfo, attrFilters);
          if (!passesAttrs) return false;
          if (!cleanedQuery) return true;
        }

        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSub = item.subtitle.toLowerCase().includes(query);
        const matchCat = item.category.toLowerCase().includes(query);
        const matchKW = item.keywords.some(kw => kw.toLowerCase().includes(query));
        return matchTitle || matchSub || matchCat || matchKW;
      });
    }

    // Group by category
    const groups: Record<'Celestial' | 'Settings' | 'Actions' | 'Tools', SuperSearchItem[]> = {
      Celestial: [],
      Settings: [],
      Actions: [],
      Tools: []
    };

    filtered.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });

    // Flat list for keyboard index selection
    const flatList: SuperSearchItem[] = [];

    if (askAiItem) {
      flatList.push(askAiItem);
    }

    const orderedCategories: ('Celestial' | 'Settings' | 'Actions' | 'Tools')[] = ['Celestial', 'Settings', 'Actions', 'Tools'];
    
    orderedCategories.forEach(cat => {
      if (groups[cat].length > 0) {
        flatList.push(...groups[cat]);
      }
    });

    const matchQuery = (i: SuperSearchItem) => !query || i.title.toLowerCase().includes(query) || i.subtitle.toLowerCase().includes(query) || i.keywords.some(kw => kw.toLowerCase().includes(query));

    return {
      groups,
      flatList,
      totalCount: filtered.length,
      counts: {
        All: allSearchItems.filter(matchQuery).length,
        Celestial: allSearchItems.filter(i => i.category === 'Celestial' && matchQuery(i)).length,
        Settings: allSearchItems.filter(i => i.category === 'Settings' && matchQuery(i)).length,
        Actions: allSearchItems.filter(i => i.category === 'Actions' && matchQuery(i)).length,
        Tools: allSearchItems.filter(i => i.category === 'Tools' && matchQuery(i)).length
      }
    };
  }, [allSearchItems, searchQuery, searchCategory, celestialFilter]);

  const activeCelestialBody = useMemo(() => {
    const item = hoveredSearchItem || (superSearchResults.flatList[searchSelectedIndex] ?? null);
    if (item) {
      if (item.bodyData) {
        return item.bodyData;
      }
      if (item.id.startsWith('body-')) {
        const rawId = item.id.replace('body-', '');
        const allBodies = [
          ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
          ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
          ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
          ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
        ];
        return allBodies.find(b => b.id === rawId) || null;
      }
      // If a setting, tool, calculator, or non-celestial item is highlighted in search, return null
      return null;
    }

    if (selectedPlanet) {
      const allBodies = [
        ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
        ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
        ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
        ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
      ];
      return allBodies.find(b => b.id === selectedPlanet) || null;
    }

    return null;
  }, [hoveredSearchItem, superSearchResults.flatList, searchSelectedIndex, selectedPlanet]);

  useEffect(() => {
    setSearchSelectedIndex(0);
  }, [searchQuery, searchCategory]);

  useEffect(() => {
    if (isSearchOpen) {
      const el = document.getElementById(`super-search-item-${searchSelectedIndex}`);
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [searchSelectedIndex, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        if (searchScrollRef.current) {
          setSearchScrollTop(searchScrollRef.current.scrollTop);
          setSearchScrollHeight(searchScrollRef.current.scrollHeight);
          setSearchClientHeight(searchScrollRef.current.clientHeight);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen, searchQuery, searchCategory, celestialFilter, cliFeedback, compareLeftId, compareRightId, calcSourceId, calcTargetId, calcSpeedType, calcCustomSpeed]);

  useEffect(() => {
    const handleResize = () => {
      if (isSearchOpen && searchScrollRef.current) {
        setSearchScrollTop(searchScrollRef.current.scrollTop);
        setSearchScrollHeight(searchScrollRef.current.scrollHeight);
        setSearchClientHeight(searchScrollRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSearchOpen]);

  return (
    <MotionConfig transition={uiAnimations ? { duration: 0.3 / uiAnimSpeed } : { duration: 0 }}>
      <div className={`relative w-full h-full bg-slate-900 overflow-hidden font-sans ${perfMode ? 'perf-mode' : ''}`}>
        <style dangerouslySetInnerHTML={{ __html: `
          .perf-mode .backdrop-blur-sm, 
          .perf-mode .backdrop-blur-md, 
          .perf-mode .backdrop-blur-lg, 
          .perf-mode .backdrop-blur-xl, 
          .perf-mode .backdrop-blur-2xl, 
          .perf-mode .backdrop-blur-3xl {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          .perf-mode * {
            text-shadow: none !important;
          }
        ` }} />
        {/* SVG filter for sharpening lower resolution canvas */}
        {(() => {
          const effectiveSharpen = resScale >= 0.999 ? 0 : sharpenLevel;
          return (
            <svg className="hidden absolute w-0 h-0" aria-hidden="true">
              <defs>
                <filter id="res-scale-sharpen">
                  <feConvolveMatrix
                    order="3 3"
                    preserveAlpha="true"
                    kernelMatrix={`
                      0 -${(effectiveSharpen * 0.35).toFixed(2)} 0
                      -${(effectiveSharpen * 0.35).toFixed(2)} ${(1 + 4 * effectiveSharpen * 0.35).toFixed(2)} -${(effectiveSharpen * 0.35).toFixed(2)}
                      0 -${(effectiveSharpen * 0.35).toFixed(2)} 0
                    `}
                  />
                </filter>
              </defs>
            </svg>
          );
        })()}

        {/* WebGPU Output Canvas (Displays WebGPU FSR spatial upscaling pass) */}
        <canvas
          ref={webgpuCanvasRef}
          style={{ touchAction: 'none', pointerEvents: 'none' }}
          className={`absolute inset-0 block w-full h-full pointer-events-none z-[0] transition-opacity duration-300 ${isWebGpuActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Interactive 2D Simulation Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          onContextMenu={(e) => e.preventDefault()}
          onPointerCancel={handlePointerUp}
          style={{
            touchAction: 'none',
            filter: (!isWebGpuActive && resScale < 1) ? 'url(#res-scale-sharpen) contrast(1.03) saturate(1.02)' : 'none'
          }}
          className={`block cursor-grab active:cursor-grabbing w-full h-full relative z-[0] ${isWebGpuActive ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Sharp text layer for celestial body names at native resolution */}
        <canvas
          ref={labelCanvasRef}
          style={{ touchAction: 'none', pointerEvents: 'none' }}
          className="absolute inset-0 block w-full h-full pointer-events-none z-[2]"
        />


      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-40 ui-layer flex items-center gap-3">
        <button 
          onPointerDown={() => { if (!isAIResearcherOpen) playTapSound(); }}
          onClick={() => { if (!isAIResearcherOpen) setIsSearchOpen(true); }} 
          className={`p-3 dual-kawase-glass-subtle glass-specular shadow-2xl rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 hover:border-slate-700/50 transition-all duration-300 outline-none active:scale-[0.98] active:opacity-80 active:duration-75 flex items-center gap-2 ${isAIResearcherOpen ? 'opacity-40 cursor-not-allowed' : ''}`}
          title={`${t.ui_search} (/)`}
          disabled={isAIResearcherOpen}
        >
          <Search className="w-5 h-5 pointer-events-none" />
          <span className="hidden md:inline text-[11px] font-mono font-semibold text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800/60">/</span>
        </button>
        <AnimatePresence>
          {useAI && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={uiAnimations ? { duration: 0.3 / uiAnimSpeed } : { duration: 0 }}
              onPointerDown={() => { if (!isSearchOpen && !isAIResearcherOpen) playTapSound(); }}
              onClick={() => { if (!isSearchOpen) setIsAIResearcherOpen(true); }} 
              className={`p-3 dual-kawase-glass-subtle glass-specular shadow-2xl rounded-xl text-slate-400 hover:text-slate-400 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all duration-300 outline-none active:scale-[0.98] active:opacity-80 active:duration-75 flex items-center gap-2 ${isSearchOpen ? 'opacity-40 cursor-not-allowed' : ''}`}
              title="Stellar AI Researcher (*)"
              disabled={isSearchOpen}
            >
              <Sparkles className="w-5 h-5 pointer-events-none" />
              <span className="hidden md:inline text-[11px] font-mono font-semibold text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800/60">*</span>
            </motion.button>
          )}
        </AnimatePresence>
        <button 
          onClick={() => { playTapSound(); togglePause(); }} 
          className="p-3 dual-kawase-glass-subtle glass-specular shadow-2xl rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 hover:border-slate-700/50 transition-all duration-300 outline-none active:scale-[0.98] active:opacity-80 active:duration-75"
          title={speedMultiplier === 0 ? t.ui_resume_orbit : t.ui_pause_orbit}
        >
          {speedMultiplier === 0 ? <Play className="w-5 h-5 text-slate-400" /> : <Pause className="w-5 h-5 text-slate-400" />}
        </button>
        <button 
          onClick={() => { playTapSound(); setIsSettingsOpen(true); }} 
          className="p-3 dual-kawase-glass-subtle glass-specular shadow-2xl rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 hover:border-slate-700/50 transition-all duration-300 group outline-none active:scale-[0.98] active:opacity-80 active:duration-75"
          title={t.ui_settings}
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            key="settings-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 ui-layer"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={
                uiAnimations 
                  ? { 
                      duration: 0.22 / uiAnimSpeed, 
                      ease: [0.16, 1, 0.3, 1]
                    } 
                  : { duration: 0 }
              }
              className="panel relative z-10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] h-[85vh] overflow-hidden flex flex-col dual-kawase-glass glass-specular border border-white/20 pointer-events-auto"
            >
              <div className="w-full h-full flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-950/20 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg dual-kawase-glass-subtle border border-white/10 text-slate-300">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-100">Settings</h2>
                  </div>
                  <button 
                    onClick={() => { playTapSound(); setIsSettingsOpen(false); }} 
                    className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-all outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-Tabs Navigation */}
                <div className="flex border-b border-white/10 bg-slate-950/40 p-1.5 px-4 gap-1.5 shrink-0 relative overflow-x-auto custom-scrollbar">
                  {[
                    { id: 'graphics', label: 'Graphics & FX', icon: <Sparkles className="w-3.5 h-3.5 shrink-0" /> },
                    { id: 'ai_effects', label: 'AI Graphics Effects', icon: <Wand2 className="w-3.5 h-3.5 shrink-0" /> },
                    { id: 'simulation', label: 'Simulation Controls', icon: <Gauge className="w-3.5 h-3.5 shrink-0" /> },
                    { id: 'preferences', label: 'General & AI', icon: <Globe className="w-3.5 h-3.5 shrink-0" /> }
                  ].map(tab => {
                    const isActive = settingsTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          playTapSound();
                          setSettingsTab(tab.id as any);
                        }}
                        className={`relative flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all outline-none z-10 whitespace-nowrap ${
                          isActive
                            ? 'text-slate-100 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="settingsTabActivePill"
                            className="absolute inset-0 bg-slate-800/60 border border-white/15 rounded-xl shadow-xs z-[-1]"
                            transition={uiAnimations ? { type: "spring", stiffness: 450, damping: 32 } : { duration: 0 }}
                          />
                        )}
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Scrollable Settings Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={settingsTab}
                      initial={{ opacity: 0, y: 6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={uiAnimations ? { duration: 0.18 / uiAnimSpeed, ease: "easeOut" } : { duration: 0 }}
                      layout
                      className="space-y-6"
                    >
                      {/* TAB 1: GRAPHICS & VISUALS */}
                      {settingsTab === 'graphics' && (
                        <div className="space-y-6">
                          
                          {/* Quality Presets */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <label className="text-xs font-semibold uppercase tracking-wider">Quality Preset</label>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950/40 rounded-xl border border-white/10">
                              {(['low', 'medium', 'high', 'ultra', 'custom'] as const).map(preset => (
                                <button
                                  key={preset}
                                  onClick={() => {
                                    playTapSound();
                                    applyGraphicsPreset(preset);
                                  }}
                                  className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all outline-none ${
                                    graphicsPreset === preset
                                      ? 'bg-slate-800/60 border border-white/15 text-slate-100 font-semibold shadow-xs'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* AMD FSR 1.0 Upscaling Section */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">FSR 1.0 Upscaling</label>
                              </div>
                              <span className="text-[11px] font-mono font-medium text-slate-400">
                                {resScale < 1.0 ? `${Math.round(1920 * resScale)}x${Math.round(1080 * resScale)} (${Math.round(resScale * 100)}%)` : 'Native (100%)'}
                              </span>
                            </div>

                            <div className="space-y-3 bg-slate-900/30 p-3.5 rounded-xl border border-white/10">
                              {/* Quick Scale Presets segmented control */}
                              <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-950/40 rounded-lg border border-white/10">
                                {[
                                  { name: 'Ultra', scale: 0.85 },
                                  { name: 'Quality', scale: 0.75 },
                                  { name: 'Balanced', scale: 0.67 },
                                  { name: 'Perf', scale: 0.50 },
                                  { name: 'Off', scale: 1.0 }
                                ].map(p => (
                                  <button
                                    key={p.name}
                                    onClick={() => {
                                      playTapSound();
                                      setResScale(p.scale);
                                      if (p.scale >= 0.999) {
                                        setSharpenLevel(0);
                                      } else if (sharpenLevel === 0) {
                                        setSharpenLevel(0.65);
                                      }
                                      setGraphicsPreset('custom');
                                    }}
                                    className={`py-1.5 rounded-md text-[11px] font-medium transition-all outline-none ${
                                      Math.abs(resScale - p.scale) < 0.02
                                        ? 'bg-slate-800/60 text-slate-100 font-semibold shadow-xs border border-white/15'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </div>

                              {/* Custom Sliders */}
                              {(() => {
                                const isFsrOff = resScale >= 0.999;
                                const currentSharpen = isFsrOff ? 0 : sharpenLevel;
                                return (
                                  <div className={`pt-0.5 transition-all duration-200 ${isFsrOff ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className={`font-medium ${isFsrOff ? 'text-slate-500' : 'text-slate-300'}`}>Sharpening (RCAS)</span>
                                        <span className={`font-mono text-[11px] ${isFsrOff ? 'text-slate-500 font-normal' : 'text-slate-300 font-semibold'}`}>
                                          {isFsrOff ? 'Off (0%)' : `${Math.round(currentSharpen * 100)}%`}
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        disabled={isFsrOff}
                                        value={currentSharpen}
                                        onChange={(e) => {
                                          setSharpenLevel(parseFloat(e.target.value));
                                          setGraphicsPreset('custom');
                                        }}
                                        className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-slate-400 focus:outline-none ${
                                          isFsrOff ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                      {/* Visual Effects Toggles */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Post-Processing FX</label>
                        </div>
                        <div className="space-y-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          <Toggle 
                            label="Celestial Bloom & Radiance" 
                            checked={enableBloom} 
                            onChange={(v) => { playTapSound(); setEnableBloom(v); setGraphicsPreset('custom'); }} 
                          />
                          <Toggle 
                            label="Anamorphic Sun Flare" 
                            checked={enableLensFlare} 
                            onChange={(v) => { playTapSound(); setEnableLensFlare(v); setGraphicsPreset('custom'); }} 
                          />
                          <Toggle 
                            label="Interstellar Dust Particles" 
                            checked={enableCosmicDust} 
                            onChange={(v) => { playTapSound(); setEnableCosmicDust(v); setGraphicsPreset('custom'); }} 
                          />
                          <Toggle 
                            label="Cinematic Vignette Effect" 
                            checked={enableVignette} 
                            onChange={(v) => { playTapSound(); setEnableVignette(v); setGraphicsPreset('custom'); }} 
                          />
                          <Toggle 
                            label="Chromatic Aberration" 
                            checked={enableChromatic} 
                            onChange={(v) => { playTapSound(); setEnableChromatic(v); setGraphicsPreset('custom'); }} 
                          />
                        </div>
                      </div>

                      {/* Scene Overlays */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Scene Overlays</label>
                        </div>
                        <div className="space-y-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          <Toggle 
                            label="Orbit Trajectories" 
                            checked={showOrbits} 
                            onChange={(v) => { playTapSound(); setShowOrbits(v); }} 
                          />
                          <Toggle 
                            label="Celestial Name Labels" 
                            checked={showLabels} 
                            onChange={(v) => { playTapSound(); setShowLabels(v); }} 
                          />
                          <Toggle 
                            label="Asteroid Belt & Comets" 
                            checked={showAsteroids} 
                            onChange={(v) => { playTapSound(); setShowAsteroids(v); }} 
                          />
                          <Toggle 
                            label="Constellation Star Grid" 
                            checked={showConstellations} 
                            onChange={(v) => { playTapSound(); setShowConstellations(v); }} 
                          />
                          <Toggle 
                            label="Spacecraft & Mission Probes" 
                            checked={showSpacecraft} 
                            onChange={(v) => { playTapSound(); setShowSpacecraft(v); }} 
                          />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: AI GRAPHICS EFFECTS & WEBGPU SHADERS */}
                  {settingsTab === 'ai_effects' && (
                    <div className="space-y-6">
                      {/* Section Header */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Wand2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">AI Graphics Effects & WebGPU Shaders</label>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          Real-time WebGPU shader post-processing pipeline and GPU visual effects generated and configured dynamically on the fly by the Stellar AI Researcher.
                        </p>
                      </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${isWebGpuActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                            <div>
                              <div className="text-xs font-semibold text-slate-200">
                                {isWebGpuActive ? 'WebGPU Hardware Acceleration: ACTIVE' : 'WebGPU Hardware Acceleration: DISABLED / FALLBACK'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {isWebGpuActive ? 'W3C WebGPU Pipeline Operational' : '3D Engine Halted / Using 2D Safe Fallback Canvas'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              playTapSound();
                              setIsWebGpuDisabled(true);
                              if (!webGpuDisabledReason) {
                                setWebGpuDisabledReason('Manual WebGPU troubleshooting & OS/browser enablement guide open.');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700/80 text-xs font-medium transition-colors"
                          >
                            Enable WebGPU Guide
                          </button>
                        </div>

                      {/* AI Effect Toggles */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Active WebGPU Post-FX Modules</label>
                        </div>

                        <div className="space-y-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          <Toggle 
                            label="Cosmic Gravitational Lensing Singularity" 
                            checked={aiAuraEffect} 
                            onChange={(v) => { playTapSound(); setAiAuraEffect(v); }} 
                          />
                          <Toggle 
                            label="Quantum Space-Time Grid Wave" 
                            checked={aiGridWave} 
                            onChange={(v) => { playTapSound(); setAiGridWave(v); }} 
                          />
                          <Toggle 
                            label="Solar Thermal Heatmap Plasma Glow" 
                            checked={aiPlasmaGlow} 
                            onChange={(v) => { playTapSound(); setAiPlasmaGlow(v); }} 
                          />
                          <Toggle 
                            label="Nebula Aurora Ionization Shield" 
                            checked={aiNebulaPulse} 
                            onChange={(v) => { playTapSound(); setAiNebulaPulse(v); }} 
                          />
                          <Toggle 
                            label="Custom AI-Generated WGSL Shader Pipeline" 
                            checked={aiCustomShaderEnabled} 
                            onChange={(v) => { playTapSound(); setAiCustomShaderEnabled(v); }} 
                          />
                        </div>
                      </div>

                      {/* WGSL Code Live Inspector */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <label className="text-xs font-semibold uppercase tracking-wider">Active WGSL Shader Source (W3C WebGPU Standard)</label>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Modern WGSL (vec2f / vec4f)</span>
                        </div>

                        <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950/80 p-3 font-mono text-[11px] text-slate-300">
                          <textarea
                            value={aiCustomWgslCode}
                            onChange={(e) => setAiCustomWgslCode(e.target.value)}
                            rows={7}
                            className="w-full bg-transparent resize-none outline-none font-mono text-[11px] text-slate-300 leading-relaxed custom-scrollbar"
                            spellCheck={false}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              playTapSound();
                              setIsSettingsOpen(false);
                              setAiResearcherQuestion("Generate a brand new custom WebGPU WGSL post-processing shader effect for the simulator that creates an oscillating cosmic warp distortion!");
                              setIsAIResearcherOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-semibold transition-all shadow-md active:scale-[0.98]"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                            <span>Ask AI Researcher to Generate New WebGPU Shader Effect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SIMULATION & FPS */}
                  {settingsTab === 'simulation' && (
                    <div className="space-y-6">
                      
                      {/* Section Header */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Simulation Controls & Engine Dynamics</label>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          Precision controls for orbital simulation clock, WASD camera mechanics, target frame rate caps, and hardware performance modes.
                        </p>
                      </div>

                      {/* Performance Modes */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Performance & Display</label>
                        </div>
                        <div className="space-y-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          <Toggle 
                            label="Performance Mode" 
                            checked={perfMode} 
                            onChange={(v) => {
                              playTapSound();
                              if (v) setShowPerfModal(true);
                              else setPerfMode(false);
                            }} 
                          />
                        </div>
                      </div>

                      {/* Framerate Cap */}
                      <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <label className="text-xs font-semibold uppercase tracking-wider">Framerate Cap</label>
                          </div>
                          <span className="text-xs font-mono text-slate-400 font-semibold bg-slate-500/10 border border-slate-700/50 px-2 py-0.5 rounded-md">
                            {fpsCap} FPS
                          </span>
                        </div>

                        <div className="space-y-1">
                          <CustomDropdown
                            value={[60, 75, 90, 120, 144, 240, 360, 540].includes(fpsCap) ? fpsCap : 60}
                            options={fpsPresetOptions}
                            onChange={(val) => {
                              playTapSound();
                              const num = typeof val === 'number' ? val : parseInt(val, 10);
                              setFpsCap(num);
                            }}
                            fontMono
                            uiAnimations={uiAnimations}
                            uiAnimSpeed={uiAnimSpeed}
                          />
                        </div>
                      </div>

                      {/* Speed Controls */}
                      <div className="space-y-4 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Simulation Speed & Camera Dynamics</label>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-slate-300">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span>Orbital Simulation Speed</span>
                            </div>
                            <span className="font-mono text-slate-400 bg-slate-500/10 border border-slate-700/50 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {speedMultiplier.toFixed(1)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={speedMultiplier}
                            onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-slate-300">
                              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                              <span>UI Animation Speed</span>
                            </div>
                            <span className="font-mono text-slate-400 bg-slate-500/10 border border-slate-700/50 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {uiAnimSpeed.toFixed(1)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="3"
                            step="0.1"
                            value={uiAnimSpeed}
                            onChange={(e) => setUiAnimSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/60">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-slate-300">
                              <Compass className="w-3.5 h-3.5 text-slate-400" />
                              <span>WASD Camera Movement Speed</span>
                            </div>
                            <span className="font-mono text-slate-400 bg-slate-500/10 border border-slate-700/50 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {Math.round(wasdSpeed)} px/frame
                            </span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="40"
                            step="1"
                            value={wasdSpeed}
                            onChange={(e) => setWasdSpeed(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap pt-0.5">
                            <span>Use</span>
                            <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono">W</kbd>
                            <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono">A</kbd>
                            <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono">S</kbd>
                            <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono">D</kbd>
                            <span>or arrow keys. Hold</span>
                            <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono">Shift</kbd>
                            <span>for precision slow motion.</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: PREFERENCES & AI */}
                  {settingsTab === 'preferences' && (
                    <div className="space-y-6">
                      
                      {/* Units & Audio */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">Units & Audio</label>
                        </div>
                        <div className="space-y-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Thermometer className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-300">Temperature Unit</span>
                            </div>
                            <div className="flex gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700/50">
                              <button
                                onClick={() => { playTapSound(); setTempUnit('C'); }}
                                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                                  tempUnit === 'C' ? 'bg-slate-700/60 text-slate-100 shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                °C
                              </button>
                              <button
                                onClick={() => { playTapSound(); setTempUnit('F'); }}
                                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                                  tempUnit === 'F' ? 'bg-slate-700/60 text-slate-100 shadow-sm border border-slate-600/50' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                °F
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* AI Assistant */}
                      <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Bot className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <label className="text-xs font-semibold uppercase tracking-wider">AI Stellar Assistant</label>
                        </div>
                        <div className="space-y-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                          <Toggle 
                            label="Enable AI Stellar Guide" 
                            checked={useAI} 
                            onChange={(v) => { playTapSound(); setUseAI(v); }} 
                          />
                          {useAI && (
                            <div className="pt-2.5 border-t border-slate-800/60 space-y-3">
                              {/* AI Model Dropdown */}
                              <div className="space-y-1.5">
                                <label className="text-xs text-slate-400 font-medium flex justify-between items-center">
                                  <span>Preferred AI Model</span>
                                  <span className="text-[10px] font-mono font-semibold text-slate-300 bg-slate-700/40 px-2 py-0.5 rounded-md border border-slate-600/50">
                                    {aiModel === 'Gemini' ? 'Default' : 'Active'}
                                  </span>
                                </label>
                                <CustomDropdown
                                  value={aiModel}
                                  options={aiModelOptions}
                                  onChange={(val) => {
                                    playTapSound();
                                    setAiModel(val);
                                  }}
                                  uiAnimations={uiAnimations}
                                  uiAnimSpeed={uiAnimSpeed}
                                />
                              </div>

                              {/* Custom API Key Input */}
                              <div className="space-y-1.5">
                                <label className="text-xs text-slate-400 font-medium flex justify-between items-center">
                                  <span>Custom {aiModel} API Key</span>
                                  <span className="text-slate-400 text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                                    {geminiKey ? 'Custom Key Set' : 'Optional (Default Fallback)'}
                                  </span>
                                </label>
                                <input
                                  type="password"
                                  placeholder={`Enter custom ${aiModel} API key...`}
                                  value={geminiKey}
                                  onChange={(e) => setGeminiKey(e.target.value)}
                                  className="w-full bg-slate-800/60 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-slate-500/50 placeholder:text-slate-500 font-mono transition-all hover:bg-slate-800/80"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                    </motion.div>
                  </AnimatePresence>

                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-4 px-6 bg-slate-900/80 border-t border-slate-800 shrink-0">
                  <button 
                    onClick={() => { playTapSound(); resetCamera(); }} 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition-all active:scale-[0.98] active:opacity-80 active:duration-75 outline-none"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Recenter View
                  </button>
                  <button 
                    onClick={() => { playTapSound(); setIsSettingsOpen(false); }} 
                    className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold shadow-lg shadow-slate-900/50 transition-all active:scale-[0.98] active:opacity-80 active:duration-75 outline-none"
                  >
                    Done
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Minimalist Search Box Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            key="super-search-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center p-4 ui-layer"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={
                uiAnimations 
                  ? { 
                      duration: 0.22 / uiAnimSpeed, 
                      ease: [0.16, 1, 0.3, 1]
                    } 
                  : { duration: 0 }
              }
              className="panel relative z-10 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-5xl lg:max-w-6xl h-[88vh] max-h-[760px] overflow-hidden flex flex-col md:flex-row dual-kawase-glass glass-specular border border-white/20 pointer-events-auto"
            >
              {/* Left Column: Search Bar, Filters & Results */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
              {/* Search Header Bar with Dual Kawase Glass */}
            <div className="flex items-center gap-3 px-4 py-3 mx-3.5 mt-3.5 mb-2 rounded-xl dual-kawase-glass-subtle glass-specular border border-white/10 bg-slate-900/20 shadow-inner">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search celestial objects, settings, tools..."
                className="w-full bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-sm md:text-base font-light tracking-wide"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSearchSelectedIndex(prev => (superSearchResults.flatList.length > 0 ? (prev + 1) % superSearchResults.flatList.length : 0));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSearchSelectedIndex(prev => (superSearchResults.flatList.length > 0 ? (prev - 1 + superSearchResults.flatList.length) % superSearchResults.flatList.length : 0));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (searchQuery.trim().startsWith('>')) {
                          const result = handleCommandRun(searchQuery);
                          setCliFeedback(result);
                          if (result.success) {
                            recordRecentSearch({
                              id: `cli-${searchQuery.trim()}`,
                              title: `CLI: ${searchQuery.trim()}`,
                              subtitle: result.msg,
                              category: 'Actions'
                            });
                            setSearchQuery('');
                          }
                          setTimeout(() => setCliFeedback(null), 4500);
                        } else if (searchQuery.trim().startsWith('@')) {
                          const questionText = searchQuery.trim().replace(/^@(gemini|ai|chatgpt|claude|mistral|grok)?\s*/i, '').trim();
                          recordRecentSearch({
                            id: `ai-q-${questionText || 'chat'}`,
                            title: questionText ? `Ask ${aiModel}: "${questionText}"` : `${aiModel} Chat`,
                            subtitle: 'AI Conversation',
                            category: 'Actions',
                            badge: aiModel.toUpperCase()
                          });
                          setIsSearchOpen(false);
                          setGeminiSidePanelQuestion(questionText || null);
                          setIsGeminiSidePanelOpen(true);
                        } else if (superSearchResults.flatList.length > 0 && searchSelectedIndex < superSearchResults.flatList.length) {
                          const item = superSearchResults.flatList[searchSelectedIndex];
                          recordRecentSearch({
                            id: item.id,
                            title: item.title,
                            subtitle: item.subtitle,
                            category: item.category,
                            badge: item.badge
                          });
                          item.action();
                        }
                      } else if (e.key === 'Escape') {
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[11px] text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded font-mono shrink-0 border border-slate-700/80"
                    >
                      Clear
                    </button>
                  )}
                  <div className="hidden sm:flex items-center gap-0.5 text-[9px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60 shrink-0 select-none shadow-sm">
                    ⌘K
                  </div>
                  <button 
                    onClick={() => { playTapSound(); setIsSearchOpen(false); }} 
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all outline-none shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Category Pills Row */}
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/10 bg-slate-950/30 overflow-x-auto relative">
                  {[
                    { id: 'All', label: 'All' },
                    { id: 'Celestial', label: 'Celestial' },
                    { id: 'Settings', label: 'Settings' },
                    { id: 'Actions', label: 'Actions' },
                    { id: 'Tools', label: 'Tools' },
                    { id: 'Compare', label: 'Compare' },
                    { id: 'Distance', label: 'Distance Calc' },
                    { id: 'TimeTravel', label: 'Time Travel' }
                  ].map(tab => {
                    const isActive = searchCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          playTapSound();
                          setSearchCategory(tab.id as any);
                        }}
                        className={`relative px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap outline-none z-10 ${
                          isActive
                            ? 'text-slate-100 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="searchCategoryActivePill"
                            className="absolute inset-0 dual-kawase-glass-card border border-slate-500/50 rounded-lg shadow-md z-[-1]"
                            transition={uiAnimations ? { type: "spring", stiffness: 450, damping: 32 } : { duration: 0 }}
                          />
                        )}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Trait & Attribute Query Quick Chips */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950/40 border-b border-white/5 overflow-x-auto text-[10px] font-mono shrink-0 select-none">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] shrink-0 mr-0.5">Traits:</span>
                  {[
                    { label: 'Rings', query: 'rings:true', Icon: CircleDot },
                    { label: 'Moons > 0', query: 'moons > 0', Icon: Moon },
                    { label: 'Radius > 15', query: 'radius > 15', Icon: Maximize2 },
                    { label: 'Temp > 0°C', query: 'temp > 0', Icon: Thermometer },
                    { label: 'Sub-Zero', query: 'temp < -100', Icon: Snowflake },
                    { label: 'Gas Giants', query: 'type:giant', Icon: Orbit },
                    { label: 'Probes', query: 'type:spacecraft', Icon: Rocket },
                    { label: 'Habitable', query: 'habitable', Icon: ShieldCheck }
                  ].map((chip) => {
                    const isSelected = searchQuery.toLowerCase().includes(chip.query.toLowerCase());
                    const IconComp = chip.Icon;
                    return (
                      <button
                        key={chip.query}
                        onClick={() => {
                          playTapSound();
                          if (isSelected) {
                            setSearchQuery(prev => prev.replace(new RegExp(chip.query, 'gi'), '').trim());
                          } else {
                            setSearchQuery(prev => (prev ? `${prev} ${chip.query}` : chip.query));
                          }
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all whitespace-nowrap outline-none cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-slate-100 border-slate-500 shadow-sm font-semibold'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <IconComp className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Clean Results List */}
                <div className="relative flex-1 min-h-0">
                  <div 
                    ref={searchScrollRef}
                    onScroll={handleSearchScroll}
                    className="h-full overflow-y-auto p-2 pr-3.5 space-y-1"
                  >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={`${searchCategory}-${searchCategory === 'Celestial' ? celestialFilter : ''}`}
                      initial={{ opacity: 0, y: 6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={uiAnimations ? { duration: 0.18 / uiAnimSpeed, ease: "easeOut" } : { duration: 0 }}
                      layout
                    >
                  {cliFeedback && (
                    <div className={`p-3 mx-2 my-1.5 rounded-xl border flex items-center gap-2.5 ${
                      cliFeedback.success 
                        ? 'bg-slate-800 border-emerald-500/30 text-slate-300' 
                        : 'bg-slate-800 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        cliFeedback.success ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                      }`}>
                        {cliFeedback.success ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 text-xs font-mono font-medium leading-relaxed">
                        <span className="opacity-60 block text-[10px] uppercase tracking-wider mb-0.5">CLI Execution Status</span>
                        {cliFeedback.msg}
                      </div>
                    </div>
                  )}

                  {searchQuery.trim().startsWith('>') ? (
                    <div className="p-2 space-y-2 text-left">
                      <div className="px-2 py-1 bg-slate-950/40 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                        <Command className="w-3.5 h-3.5 animate-pulse" /> 
                        <span>Simulator CLI Mode — Type command & press <strong>Enter</strong> to execute</span>
                      </div>
                      
                      {(() => {
                        const cmdText = searchQuery.trim().substring(1);
                        const parts = cmdText.split(/\s+/);
                        const cmd = parts[0].toLowerCase();

                        const commandsInfo = [
                          { name: 'orbits [on/off/toggle]', desc: 'Toggle planetary orbits' },
                          { name: 'labels [on/off/toggle]', desc: 'Toggle names over celestial bodies' },
                          { name: 'asteroids [on/off/toggle]', desc: 'Toggle asteroid belt & comets' },
                          { name: 'spacecraft [on/off/toggle]', desc: 'Toggle active spacecraft probes' },
                          { name: 'constellations [on/off/toggle]', desc: 'Toggle constellation grid patterns' },
                          { name: 'speed [0-10]', desc: 'Set orbit simulation speed multiplier' },
                          { name: 'pause', desc: 'Pause planetary orbital motion' },
                          { name: 'play', desc: 'Resume planetary orbital motion' },
                          { name: 'travel [name]', desc: 'Fly camera directly to body (e.g. mars, sun, jwst)' },
                          { name: 'reset', desc: 'Recenter camera zoom and position' },
                          { name: 'help', desc: 'Display all available simulator commands' }
                        ];

                        const matching = commandsInfo.filter(c => c.name.startsWith(cmd) || cmd === '');

                        return (
                          <div className="space-y-1.5">
                            {matching.map((c, i) => (
                              <div 
                                key={i}
                                onClick={() => {
                                  setSearchQuery(`>${c.name.split(' ')[0]} `);
                                  playTapSound();
                                }}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/40 hover:border-slate-600/50 hover:bg-slate-800/40 cursor-pointer transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="text-[11px] font-mono text-slate-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/30">
                                    &gt; {c.name}
                                  </div>
                                  <span className="text-slate-400 text-xs">{c.desc}</span>
                                </div>
                                <CornerDownLeft className="w-3 h-3 text-slate-500" />
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : searchCategory === 'Compare' ? (
                    <div className="p-3 space-y-4 text-left">
                      <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-800/80 mb-2">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> Planet Comparison Engine</span>
                        <span className="text-[10px] text-slate-400 font-mono">Side-by-Side Specs</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Body A</label>
                          <CustomDropdown
                            value={compareLeftId}
                            options={compareBodyOptions}
                            onChange={(val) => {
                              setCompareLeftId(val);
                              playTapSound();
                            }}
                            uiAnimations={uiAnimations}
                            uiAnimSpeed={uiAnimSpeed}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Body B</label>
                          <CustomDropdown
                            value={compareRightId}
                            options={compareBodyOptions}
                            onChange={(val) => {
                              setCompareRightId(val);
                              playTapSound();
                            }}
                            uiAnimations={uiAnimations}
                            uiAnimSpeed={uiAnimSpeed}
                          />
                        </div>
                      </div>

                      {(() => {
                        const leftDetails = BODY_DETAILS[compareLeftId];
                        const rightDetails = BODY_DETAILS[compareRightId];
                        
                        const getBodyColor = (id: string) => {
                          if (id === 'sun') return '#fbbf24';
                          const all = PLANETS.flatMap(p => [p, ...(p.moons || [])]);
                          return all.find(x => x.id === id)?.color || '#38bdf8';
                        };

                        const getBodyRadius = (id: string) => {
                          if (id === 'sun') return 45;
                          const all = PLANETS.flatMap(p => [p, ...(p.moons || [])]);
                          return all.find(x => x.id === id)?.radius || 10;
                        };

                        const leftColor = getBodyColor(compareLeftId);
                        const rightColor = getBodyColor(compareRightId);
                        const leftRad = getBodyRadius(compareLeftId);
                        const rightRad = getBodyRadius(compareRightId);

                        const maxRad = Math.max(leftRad, rightRad);
                        const leftVisualScale = Math.max(0.15, leftRad / maxRad);
                        const rightVisualScale = Math.max(0.15, rightRad / maxRad);

                        return (
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-2 gap-4 bg-slate-950/20 border border-slate-800/40 rounded-2xl p-4 h-32 items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-x-0 top-0 text-[10px] text-slate-500 font-bold uppercase text-center mt-2 tracking-wider">Physical Scale Ratio</div>
                              
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <div 
                                  className="rounded-full shadow-lg transition-all duration-300"
                                  style={{ 
                                    width: `${60 * leftVisualScale}px`, 
                                    height: `${60 * leftVisualScale}px`, 
                                    backgroundColor: leftColor,
                                    boxShadow: `0 0 16px ${leftColor}40` 
                                  }}
                                />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{compareLeftId}</span>
                              </div>

                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <div 
                                  className="rounded-full shadow-lg transition-all duration-300"
                                  style={{ 
                                    width: `${60 * rightVisualScale}px`, 
                                    height: `${60 * rightVisualScale}px`, 
                                    backgroundColor: rightColor,
                                    boxShadow: `0 0 16px ${rightColor}40` 
                                  }}
                                />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{compareRightId}</span>
                              </div>
                            </div>

                            <div className="bg-slate-950/35 border border-slate-800/60 rounded-xl overflow-hidden text-xs">
                              <div className="grid grid-cols-3 border-b border-slate-800/80 bg-slate-950/50 p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                                <div>{compareLeftId}</div>
                                <div className="text-slate-400">Parameter</div>
                                <div>{compareRightId}</div>
                              </div>

                              {[
                                { label: 'Classification', lVal: leftDetails?.type || 'N/A', rVal: rightDetails?.type || 'N/A' },
                                { label: 'Mass', lVal: leftDetails?.mass || 'N/A', rVal: rightDetails?.mass || 'N/A' },
                                { label: 'Avg Temp', lVal: leftDetails?.temp || 'N/A', rVal: rightDetails?.temp || 'N/A' },
                                { label: 'Surface Gravity', lVal: leftDetails?.gravity || 'N/A', rVal: rightDetails?.gravity || 'N/A' }
                              ].map((row, idx) => (
                                <div key={idx} className="grid grid-cols-3 border-b border-slate-800/40 p-2.5 text-center items-center font-medium">
                                  <div className="text-slate-200 truncate px-1">{row.lVal}</div>
                                  <div className="text-slate-400 font-semibold text-[10px]">{row.label}</div>
                                  <div className="text-slate-200 truncate px-1">{row.rVal}</div>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed pt-1.5">
                              <div className="p-2.5 bg-slate-800/20 border border-slate-800 rounded-xl text-slate-300">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fun Fact</span>
                                {leftDetails?.funFacts?.[0] || 'Fascinating details are being indexed...'}
                              </div>
                              <div className="p-2.5 bg-slate-800/20 border border-slate-800 rounded-xl text-slate-300">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fun Fact</span>
                                {rightDetails?.funFacts?.[0] || 'Fascinating details are being indexed...'}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : searchCategory === 'Distance' ? (
                    <div className="p-3 space-y-4 text-left">
                      <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-800/80 mb-2">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> Cosmic Distance & Space Travel</span>
                        <span className="text-[10px] text-slate-400 font-mono">Real-time + Astro Values</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Departure Point</label>
                          <CustomDropdown
                            value={calcSourceId}
                            options={distanceBodyOptions}
                            onChange={(val) => {
                              setCalcSourceId(val);
                              playTapSound();
                            }}
                            uiAnimations={uiAnimations}
                            uiAnimSpeed={uiAnimSpeed}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Arrival Destination</label>
                          <CustomDropdown
                            value={calcTargetId}
                            options={distanceBodyOptions}
                            onChange={(val) => {
                              setCalcTargetId(val);
                              playTapSound();
                            }}
                            uiAnimations={uiAnimations}
                            uiAnimSpeed={uiAnimSpeed}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vessel Cruise Speed</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'f1', label: 'Formula 1 (300 km/h)' },
                            { id: 'jet', label: 'Airliner (900 km/h)' },
                            { id: 'apollo', label: 'Apollo 11 (40,000 km/h)' },
                            { id: 'voyager', label: 'Voyager 1 (61,500 km/h)' },
                            { id: 'light', label: 'Speed of Light (c)' },
                            { id: 'custom', label: 'Custom km/s' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => { setCalcSpeedType(opt.id as any); playTapSound(); }}
                              className={`px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all outline-none ${
                                calcSpeedType === opt.id
                                  ? 'bg-slate-700 border-slate-600 text-white shadow shadow-slate-900/50'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        
                        {calcSpeedType === 'custom' && (
                          <div className="flex items-center gap-2 mt-1.5 bg-slate-950 border border-slate-800 rounded-xl p-2">
                            <span className="text-[10px] text-slate-400 font-bold font-mono">SPEED:</span>
                            <input
                              type="text"
                              value={calcCustomSpeed}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setCalcCustomSpeed(val);
                              }}
                              placeholder="Speed in km/s..."
                              className="bg-transparent border-none outline-none text-slate-200 text-xs flex-1 font-mono font-semibold"
                            />
                            <span className="text-[10px] text-slate-500 font-bold font-mono">KM/S</span>
                          </div>
                        )}
                      </div>

                      {(() => {
                        const astroDistances: Record<string, number> = {
                          sun: 0,
                          mercury: 57.9,
                          venus: 108.2,
                          earth: 149.6,
                          moon: 149.984,
                          mars: 227.9,
                          jupiter: 778.5,
                          saturn: 1434,
                          titan: 1434.13,
                          rhea: 1434.1,
                          enceladus: 1434.05,
                          dione: 1434.08,
                          tethys: 1434.07,
                          uranus: 2871,
                          neptune: 4495
                        };

                        const d1 = astroDistances[calcSourceId] || 0;
                        const d2 = astroDistances[calcTargetId] || 0;
                        const averageDistanceKm = Math.abs(d1 - d2) * 1000000;

                        const getSimulationCoords = (id: string) => {
                          if (id === 'sun') return { x: 0, y: 0 };
                          const p = PLANETS.find(x => x.id === id);
                          if (p) {
                            const angle = stateRef.current.time * p.speed;
                            return {
                              x: Math.cos(angle) * p.distance,
                              y: Math.sin(angle) * p.distance
                            };
                          }
                          let foundMoon: any = null;
                          let parentPlanet: any = null;
                          for (const pl of PLANETS) {
                            const m = pl.moons?.find(x => x.id === id);
                            if (m) {
                              foundMoon = m;
                              parentPlanet = pl;
                              break;
                            }
                          }
                          if (foundMoon && parentPlanet) {
                            const pAngle = stateRef.current.time * parentPlanet.speed;
                            const px = Math.cos(pAngle) * parentPlanet.distance;
                            const py = Math.sin(pAngle) * parentPlanet.distance;
                            const mAngle = stateRef.current.time * foundMoon.speed;
                            return {
                              x: px + Math.cos(mAngle) * foundMoon.distance,
                              y: py + Math.sin(mAngle) * foundMoon.distance
                            };
                          }
                          return { x: 0, y: 0 };
                        };

                        const coords1 = getSimulationCoords(calcSourceId);
                        const coords2 = getSimulationCoords(calcTargetId);
                        const dx = coords1.x - coords2.x;
                        const dy = coords1.y - coords2.y;
                        const simDistUnits = Math.sqrt(dx * dx + dy * dy);
                        const liveDistanceKm = simDistUnits * 0.83 * 1000000;

                        let cruiseSpeedKmh = 300;
                        if (calcSpeedType === 'f1') cruiseSpeedKmh = 300;
                        else if (calcSpeedType === 'jet') cruiseSpeedKmh = 900;
                        else if (calcSpeedType === 'apollo') cruiseSpeedKmh = 40000;
                        else if (calcSpeedType === 'voyager') cruiseSpeedKmh = 61500;
                        else if (calcSpeedType === 'light') cruiseSpeedKmh = 299792 * 3600;
                        else if (calcSpeedType === 'custom') {
                          const userKms = parseFloat(calcCustomSpeed) || 100;
                          cruiseSpeedKmh = userKms * 3600;
                        }

                        const travelHoursAvg = averageDistanceKm / cruiseSpeedKmh;
                        const travelHoursLive = liveDistanceKm / cruiseSpeedKmh;

                        const formatTravelTime = (hours: number) => {
                          if (hours === 0) return 'Instant';
                          if (hours < 1) {
                            const mins = hours * 60;
                            if (mins < 1) return `${Math.round(mins * 60)} Seconds`;
                            return `${mins.toFixed(1)} Minutes`;
                          }
                          const days = hours / 24;
                          if (days < 1) return `${hours.toFixed(1)} Hours`;
                          const years = days / 365;
                          if (years < 1) return `${days.toFixed(1)} Days`;
                          return `${years.toFixed(2)} Years`;
                        };

                        return (
                          <div className="space-y-3.5 pt-1.5 text-left">
                            <div className="grid grid-cols-2 gap-3.5 text-center">
                              <div className="p-3 bg-slate-950/20 border border-slate-800/40 rounded-2xl relative overflow-hidden">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Avg Astronomical Distance</span>
                                <div className="text-sm font-extrabold text-slate-200">
                                  {(averageDistanceKm / 1000000).toFixed(2)}M <span className="text-[10px] text-slate-400 font-medium">km</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold font-mono mt-1">
                                  {(averageDistanceKm / 149597870.7).toFixed(4)} AU
                                </div>
                              </div>

                              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl relative overflow-hidden animate-pulse">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Live Orbit Distance</span>
                                <div className="text-sm font-extrabold text-slate-300">
                                  {(liveDistanceKm / 1000000).toFixed(2)}M <span className="text-[10px] text-slate-400/80 font-medium">km</span>
                                </div>
                                <div className="text-[10px] text-slate-400/70 font-semibold font-mono mt-1">
                                  {(liveDistanceKm / 149597870.7).toFixed(4)} AU
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-950/35 border border-slate-800/60 rounded-xl text-xs space-y-2 font-medium">
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 text-left">Estimated Travel Duration</div>
                              
                              <div className="flex items-center justify-between border-b border-slate-800/30 pb-2">
                                <span className="text-slate-400">At Average Alignment Distance:</span>
                                <span className="text-slate-200 font-bold font-mono">{formatTravelTime(travelHoursAvg)}</span>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-slate-400/90 font-semibold">At Current Live Orbit Distance:</span>
                                <span className="text-slate-300 font-bold font-mono">{formatTravelTime(travelHoursLive)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : searchCategory === 'TimeTravel' ? (
                    <div className="p-3 space-y-3 text-left">
                      <div className="flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-800/80 mb-2">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5" /> Space Mission & Alignment Chronology</span>
                        <span className="text-[10px] text-slate-400 font-mono">Historic & Future Alignment Warps</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          {
                            id: 'apollo11',
                            title: 'Apollo 11 Moon Landing',
                            date: 'July 20, 1969',
                            badge: 'HISTORIC',
                            badgeColor: 'bg-amber-500/10 text-slate-400 border-amber-500/20',
                            desc: 'Neil Armstrong and Buzz Aldrin perform the first crewed landing on the Lunar surface.',
                            focusId: 'moon',
                            timeValue: 120,
                            speed: 0,
                            facts: ['Neil Armstrong and Buzz Aldrin spent 21.6 hours on the Moon.', 'The Apollo guidance computer had less compute power than a modern pocket calculator.']
                          },
                          {
                            id: 'voyager1',
                            title: 'Voyager 1 Deep Space Mission',
                            date: 'September 5, 1977',
                            badge: 'MISSION',
                            badgeColor: 'bg-cyan-500/10 text-slate-400 border-cyan-500/20',
                            desc: 'Voyager 1 launches to study the outer solar system and enters interstellar space.',
                            focusId: 'voyager1',
                            timeValue: 1800,
                            speed: 1.5,
                            facts: ['Voyager 1 carries the Golden Record to communicate with future civilizations.', 'It is the farthest human-made object, traveling at over 61,000 km/h.']
                          },
                          {
                            id: 'halley1986',
                            title: 'Halley\'s Comet Perihelion',
                            date: 'February 9, 1986',
                            badge: 'COMET',
                            badgeColor: 'bg-slate-800 text-slate-400 border-emerald-500/20',
                            desc: 'The legendary periodic comet sweeps close to the Sun, igniting brilliant tail activity.',
                            focusId: 'sun',
                            timeValue: 450,
                            speed: 2.0,
                            asteroidsEnabled: true,
                            facts: ['Halley returns to Earth\'s skies every 75-76 years.', 'The next visible return of the comet will be in July 2061.']
                          },
                          {
                            id: 'alignment2000',
                            title: 'Grand Planetary Alignment',
                            date: 'May 5, 2000',
                            badge: 'ALIGNMENT',
                            badgeColor: 'bg-purple-500/10 text-slate-400 border-purple-500/20',
                            desc: 'A rare celestial alignment of Mercury, Venus, Earth, Mars, Jupiter, and Saturn in a single horizontal arc.',
                            focusId: 'sun',
                            timeValue: 0,
                            speed: 0,
                            facts: ['The planetary gravitational influence on Earth during the alignment was completely negligible.', 'Alignments are beautiful optical gatherings but do not affect orbital stability.']
                          },
                          {
                            id: 'jwst2021',
                            title: 'James Webb Space Observatory',
                            date: 'December 25, 2021',
                            badge: 'TELESCOPE',
                            badgeColor: 'bg-slate-800 text-slate-400 border-rose-500/20',
                            desc: 'Launch and deployment of the massive gold-mirrored infrared space telescope to the L2 Lagrange Point.',
                            focusId: 'jwst',
                            timeValue: 950,
                            speed: 0.5,
                            facts: ['Its mirrors are coated in a microscopic layer of pure gold for high-efficiency infrared reflection.', 'Can Peer back 13.5 billion years to witness the formation of the first galaxies.']
                          },
                          {
                            id: 'alignment2040',
                            title: 'Future Planetary Conjunction',
                            date: 'September 8, 2040',
                            badge: 'FUTURE',
                            badgeColor: 'bg-blue-500/10 text-slate-400 border-blue-500/20',
                            desc: 'A spectacular prospective alignment of Mars, Mercury, Venus, Jupiter, and Saturn clustered tightly.',
                            focusId: 'sun',
                            timeValue: 0,
                            speed: 0,
                            facts: ['Will be visible to the naked eye globally in the evening twilight.', 'Occurs within a 9-degree visual circle in the sky.']
                          }
                        ].map((evt) => {
                          const isActive = activeTimeEvent?.id === evt.id;
                          return (
                            <div 
                              key={evt.id}
                              onClick={() => {
                                playTapSound();
                                setIsSearchOpen(false);
                                if (evt.focusId === 'sun') {
                                  stateRef.current.lockedPlanetId = 'sun';
                                  setSelectedPlanet('sun');
                                } else {
                                  const all = [
                                    { id: 'sun', name: 'Sun' },
                                    ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
                                    ...CONSTELLATIONS.map(c => ({ id: c.id, name: c.id, nameKey: c.nameKey, color: c.color })),
                                    ...BLACK_HOLES.map(b => ({ id: b.id, name: b.id, nameKey: b.nameKey, color: b.color })),
                                    ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, nameKey: s.nameKey, color: s.color }))
                                  ];
                                  const match = all.find(x => x.id === evt.focusId);
                                  if (match) {
                                    stateRef.current.lockedPlanetId = match.id;
                                    setSelectedPlanet(match.id);
                                  }
                                }
                                stateRef.current.time = evt.timeValue;
                                setSpeedMultiplier(evt.speed);
                                if (evt.asteroidsEnabled) {
                                  setShowAsteroids(true);
                                }
                                setActiveTimeEvent(evt);
                              }}
                              onMouseEnter={() => setHoveredTimeEvent(evt)}
                              onMouseLeave={() => setHoveredTimeEvent(null)}
                              className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                                isActive 
                                  ? 'bg-slate-700/40 border-slate-600/50 shadow shadow-slate-900/50' 
                                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-800/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${evt.badgeColor}`}>
                                    {evt.badge} • {evt.date}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-100 pt-1">{evt.title}</h4>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold font-mono">WARP &gt;</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-normal mt-2">
                                {evt.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <>
                      {!searchQuery.trim() && recentSearches.length > 0 && searchCategory === 'All' && (
                        <div className="mb-3.5 p-3 dual-kawase-glass-card rounded-xl space-y-2 text-left border border-white/10">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              <History className="w-3.5 h-3.5 text-slate-400" />
                              <span>Recent Searches & Actions</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playTapSound();
                                clearRecentSearches();
                              }}
                              className="text-[10px] text-slate-500 hover:text-slate-400 font-mono transition-colors flex items-center gap-1 outline-none"
                            >
                              <Trash2 className="w-3 h-3" /> Clear
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {recentSearches.map((recent) => (
                              <div
                                key={recent.id}
                                onMouseEnter={() => setHoveredRecentSearch(recent)}
                                onMouseLeave={() => setHoveredRecentSearch(null)}
                                onClick={() => {
                                  playTapSound();
                                  if (recent.badge && ['GEMINI', 'CHATGPT', 'CLAUDE', 'MISTRAL', 'GROK', 'GEMINI AI'].includes(recent.badge) || recent.id.startsWith('gemini') || recent.id.startsWith('ai-q-')) {
                                    setIsSearchOpen(false);
                                    const q = recent.title.replace(/^Ask (Gemini|ChatGPT|Claude|Mistral|Grok):\s*"/i, '').replace(/"$/i, '');
                                    setGeminiSidePanelQuestion(q || null);
                                    setIsGeminiSidePanelOpen(true);
                                  } else {
                                    const matched = allSearchItems.find(i => i.id === recent.id || i.title.toLowerCase() === recent.title.toLowerCase());
                                    if (matched) {
                                      recordRecentSearch(recent);
                                      matched.action();
                                    } else {
                                      setIsSearchOpen(false);
                                      if (recent.category === 'Celestial') {
                                        stateRef.current.lockedPlanetId = recent.id;
                                        setSelectedPlanet(recent.id);
                                      }
                                    }
                                  }
                                }}
                                className="group relative flex items-center gap-2 px-2.5 py-1.5 dual-kawase-glass-subtle hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-500/60 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition-all cursor-pointer shadow-sm"
                              >
                                {recent.badge && ['GEMINI', 'CHATGPT', 'CLAUDE', 'MISTRAL', 'GROK', 'GEMINI AI'].includes(recent.badge) || recent.id.startsWith('gemini') || recent.id.startsWith('ai-q-') ? (
                                  <Sparkles className="w-3 h-3 text-slate-400 animate-pulse shrink-0" />
                                ) : (
                                  <History className="w-3 h-3 text-slate-500 group-hover:text-slate-400 shrink-0" />
                                )}
                                <span className="font-medium truncate max-w-[160px]">{recent.title}</span>
                                {recent.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-700/40 text-slate-300 rounded border border-slate-600/50 uppercase shrink-0">
                                    {recent.badge}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playTapSound();
                                    removeRecentSearch(recent.id);
                                  }}
                                  className="p-0.5 text-slate-600 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors outline-none"
                                  title="Remove"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchCategory === 'Celestial' && (
                        <motion.div
                          layout
                          initial={{ y: -4 }}
                          animate={{ y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={uiAnimations ? { duration: 0.18 / uiAnimSpeed } : { duration: 0 }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 mb-2 dual-kawase-glass-subtle rounded-xl overflow-x-auto relative shrink-0 border border-slate-800/60"
                        >
                          {[
                            { id: 'all', label: 'All Bodies' },
                            { id: 'planet', label: 'Planets' },
                            { id: 'moon', label: 'Moons' },
                            { id: 'spacecraft', label: 'Spacecraft' },
                            { id: 'blackhole', label: 'Black Holes' },
                            { id: 'constellation', label: 'Constellations' }
                          ].map(tag => {
                            const isActive = celestialFilter === tag.id;
                            return (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  playTapSound();
                                  setCelestialFilter(tag.id as any);
                                }}
                                className={`relative px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors whitespace-nowrap outline-none z-10 ${
                                  isActive
                                    ? 'text-slate-100 font-semibold'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="celestialTagActivePill"
                                    className="absolute inset-0 dual-kawase-glass-card border border-slate-500/50 rounded-lg shadow-sm z-[-1]"
                                    transition={uiAnimations ? { type: "spring", stiffness: 450, damping: 30 } : { duration: 0 }}
                                  />
                                )}
                                {tag.label}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}

                      {superSearchResults.flatList.length === 0 ? (
                        <div className="text-center py-10 px-4 space-y-2">
                          <p className="text-slate-400 text-xs font-medium">No matches found for "{searchQuery}"</p>
                          {useAI ? (
                            <button
                              onClick={() => {
                                setIsSearchOpen(false);
                                setAiResearcherQuestion(null);
                                setIsAIResearcherOpen(true);
                              }}
                              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 dual-kawase-glass-subtle hover:border-slate-500/60 rounded-lg text-slate-300 text-xs font-medium transition-all"
                            >
                              <Bot className="w-3.5 h-3.5" /> Ask AI Space Assistant
                            </button>
                          ) : (
                            <p className="text-[11px] text-slate-500 font-mono">AI Assistance is disabled in settings</p>
                          )}
                        </div>
                      ) : (
                    superSearchResults.flatList.map((item, index) => {
                      const isSelected = index === searchSelectedIndex;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={uiAnimations ? { duration: 0.15 / uiAnimSpeed } : { duration: 0 }}
                          key={item.id}
                          id={`super-search-item-${index}`}
                          onClick={() => {
                            if (item.disabled) return;
                            playTapSound();
                            recordRecentSearch({
                              id: item.id,
                              title: item.title,
                              subtitle: item.subtitle,
                              category: item.category,
                              badge: item.badge
                            });
                            item.action();
                          }}
                          onMouseEnter={() => {
                            if (!item.disabled) {
                              setSearchSelectedIndex(index);
                              setHoveredSearchItem(item);
                            }
                          }}
                          onMouseLeave={() => setHoveredSearchItem(null)}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all border ${
                            item.disabled
                              ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-slate-900/30'
                              : isSelected
                              ? 'dual-kawase-glass-card border-slate-500/60 text-white cursor-pointer shadow-lg'
                              : 'border-transparent text-slate-300 hover:dual-kawase-glass-subtle hover:border-slate-700/50 cursor-pointer'
                          }`}
                        >
                          {/* Icon / Orb */}
                          <div className={`w-6 h-6 rounded-md bg-slate-900/80 border border-slate-700/60 flex items-center justify-center shrink-0 ${item.disabled ? 'opacity-50' : ''}`}>
                            {item.icon}
                          </div>

                          {/* Title & Category */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`font-medium text-xs md:text-sm truncate ${item.disabled ? 'text-slate-500' : isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {item.title}
                            </p>
                            <p className={`text-[11px] truncate ${item.disabled ? 'text-slate-600' : 'text-slate-400'}`}>{item.subtitle}</p>
                          </div>

                          {/* Badge */}
                          {item.badge && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0 ${
                              item.badgeType === 'active' ? 'bg-emerald-500/20 text-slate-300 border border-emerald-500/30' :
                              item.badgeType === 'inactive' ? 'bg-slate-800 text-slate-500 border border-slate-700/50' :
                              'bg-slate-700/40 text-slate-300 border border-slate-600/50'
                            }`}>
                              {item.badge}
                            </span>
                          )}

                          {/* Action indicator when selected */}
                          {isSelected && !item.disabled && (
                            <span className="text-slate-400 text-xs font-mono shrink-0">
                              ↵
                            </span>
                          )}
                        </motion.div>
                      );
                    })
                  )}</>
                  )}
                    </motion.div>
                  </AnimatePresence>
                  </div>
                </div>

                {/* Minimalist Footer Hints */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-t border-white/10 text-[10px] font-mono text-slate-400">
                  <span>↑↓ navigate • ↵ select • esc close</span>
                  <span>{superSearchResults.totalCount} items</span>
                </div>
              </div>

              {/* Right Column: Celestial Mini-Preview Card */}
              <AnimatePresence initial={false}>
                {activeCelestialBody && (
                  <motion.div
                    key="celestial-mini-preview-panel"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 360, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={
                      uiAnimations 
                        ? { duration: 0.28 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } 
                        : { duration: 0 }
                    }
                    className="hidden md:flex shrink-0 flex-col bg-slate-950/40 border-t md:border-t-0 md:border-l border-white/10 dual-kawase-glass-subtle overflow-hidden"
                  >
                    <div className="w-[360px] h-full p-4 overflow-y-auto flex flex-col">
                      <CelestialMiniPreview
                        body={activeCelestialBody}
                        info={BODY_DETAILS[activeCelestialBody.id] || null}
                        tempUnit={tempUnit}
                        onFocusBody={(id) => {
                          stateRef.current.lockedPlanetId = id;
                          setSelectedPlanet(id);
                          setIsSearchOpen(false);
                        }}
                        onCompareBody={(id) => {
                          setCompareLeftId(id);
                          setSearchCategory('Compare');
                        }}
                        onAskAIBody={(name) => {
                          setIsSearchOpen(false);
                          setAiResearcherQuestion(`Tell me about ${name}`);
                          setIsAIResearcherOpen(true);
                        }}
                        playTapSound={playTapSound}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HD Mode Warning Modal */}
      <HDModeModal 
        isOpen={showHDModal} 
        onClose={() => setShowHDModal(false)} 
        onConfirm={() => { setHdMode(true); setShowHDModal(false); }} 
        playTapSound={playTapSound} 
        title={t.ui_caution}
        desc={t.ui_hd_mode_desc}
        btnCancel={t.ui_cancel}
        btnConfirm={t.ui_enable_hd}
        uiAnimations={uiAnimations}
        uiAnimSpeed={uiAnimSpeed}
      />

      <PerfModeModal 
        isOpen={showPerfModal} 
        onClose={() => setShowPerfModal(false)} 
        onConfirm={() => { 
          setPerfMode(true); 
          setUiAnimations(false);
          setShowPerfModal(false); 
        }} 
        playTapSound={playTapSound} 
        title={t.ui_perf_mode_info}
        desc={t.ui_perf_mode_desc}
        btnCancel={t.ui_cancel}
        btnConfirm={t.ui_enable_perf_mode}
        uiAnimations={uiAnimations}
        uiAnimSpeed={uiAnimSpeed}
      />

      {/* Time Travel Event Info Overlay (Top Left) */}
      <AnimatePresence>
        {activeTimeEvent && (
          <motion.div
            initial={{ x: -20, y: 20 }}
            animate={{ x: 0, y: 0 }}
            exit={{ opacity: 0, x: -20, y: 20 }}
            className="absolute z-40 ui-layer pointer-events-auto top-6 left-6 w-80"
          >
            <GlassPanel lightColor="#6366f1" className="p-4 rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 to-slate-600"></div>
              
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono bg-slate-900/80 border border-slate-700/60 px-2 py-0.5 rounded-full">
                    Active Timeline: {activeTimeEvent.date}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" /> {activeTimeEvent.title}
                  </h3>
                </div>
                <button 
                  onClick={() => { playTapSound(); setActiveTimeEvent(null); }}
                  className="p-1 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-700 rounded-md transition-all mt-1"
                  title="Close Time Travel Overlay"
                >
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed mt-2.5 bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/50">
                {activeTimeEvent.desc}
              </p>

              {/* Facts slider */}
              <div className="mt-3 space-y-1.5 pt-2.5 border-t border-slate-800/60">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Historical Fact</span>
                <p className="text-[10px] text-slate-400 leading-normal italic">
                  "{activeTimeEvent.facts[0]}"
                </p>
                {activeTimeEvent.facts[1] && (
                  <p className="text-[10px] text-slate-400 leading-normal italic mt-1.5">
                    "{activeTimeEvent.facts[1]}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <span className="text-[9px] text-slate-500 font-mono">Status: Warp Lock</span>
                <button
                  onClick={() => {
                    playTapSound();
                    stateRef.current.lockedPlanetId = null;
                    setSelectedPlanet(null);
                    setSpeedMultiplier(1);
                    setActiveTimeEvent(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold transition-all active:scale-[0.98] active:opacity-80 active:duration-75 flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Return to Present
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Planet Panel (Bottom Left) */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            layout={uiAnimations}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            exit={{ opacity: 0, x: -20, transition:{ duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 } }}
            transition={uiAnimations ? { duration: 0.4 / uiAnimSpeed, ease: 'easeOut' } : { duration: 0 }}
            className="absolute z-40 ui-layer pointer-events-auto bottom-6 left-6 w-72"
          >
            {(() => {
              const allBodies = [
                ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
                ...CONSTELLATIONS.map(c => ({ id: c.id, name: '', desc: '', color: c.color, nameKey: c.nameKey, descKey: c.descKey })),
                ...BLACK_HOLES.map(b => ({ id: b.id, name: '', desc: '', color: b.color, nameKey: b.nameKey, descKey: b.descKey })),
                ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, desc: '', color: s.color, nameKey: s.nameKey, descKey: s.descKey }))
              ];
              const planet = allBodies.find(p => p.id === selectedPlanet);
              if (!planet) return null;
              const tName = ('nameKey' in planet && planet.nameKey) ? (t[planet.nameKey as keyof typeof t] || TRANSLATIONS['en'][planet.nameKey as keyof typeof TRANSLATIONS['en']] || planet.name) : (t[`${planet.id}_name` as keyof typeof t] || TRANSLATIONS['en'][`${planet.id}_name` as keyof typeof TRANSLATIONS['en']] || planet.name);
              let tDesc = ('descKey' in planet && planet.descKey) ? (t[planet.descKey as keyof typeof t] || TRANSLATIONS['en'][planet.descKey as keyof typeof TRANSLATIONS['en']] || planet.desc) : (t[`${planet.id}_desc` as keyof typeof t] || TRANSLATIONS['en'][`${planet.id}_desc` as keyof typeof TRANSLATIONS['en']] || planet.desc);
              if (!tDesc || (typeof tDesc === 'string' && tDesc.trim() === '')) {
                tDesc = BODY_DETAILS[planet.id]?.funFacts?.join(' ') || 'No description available.';
              }
              return (
                <GlassPanel lightColor={planet.color} className="p-5 rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden relative max-h-[70vh] flex flex-col">
                   <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: planet.color }}></div>
                   <div className="flex items-start justify-between mb-2 mt-1 shrink-0">
                     <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5" style={{ color: planet.color }}>
                        {tName}
                     </h3>
                     <button 
                         onClick={() => { playTapSound(); setSelectedPlanet(null); }}
                         className="p-1 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-700 rounded-md transition-all active:scale-[0.96] active:opacity-80 active:duration-75 mt-1"
                     >
                        <X className="w-4 h-4"/>
                     </button>
                   </div>
                   <div className="text-sm text-slate-300 font-mono leading-relaxed mt-3 border-t border-slate-800/80 pt-3 min-h-[3rem] relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-1">
                     {isDescLoading && !aiDescription && (
                       <div className="flex items-center gap-2 text-slate-400/60 animate-pulse py-1">
                         <Loader2 className="w-3 h-3 animate-spin" />
                         <span className="text-[10px] uppercase tracking-widest font-bold">Scanning...</span>
                       </div>
                     )}
                     <p>
                        {useAI ? (aiDescription || (isDescLoading ? "" : tDesc)) : tDesc}
                      </p>
                     {isDescLoading && aiDescription && <span className="inline-block w-1.5 h-3 bg-slate-700 ml-1 animate-pulse align-middle" />}
                   </div>
                </GlassPanel>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Info Panel (Right) */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            layout={uiAnimations}
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            exit={{ opacity: 0, x: 20, transition: { duration: uiAnimations ? 0.2 / uiAnimSpeed : 0 } }}
            transition={uiAnimations ? { duration: 0.4 / uiAnimSpeed, ease: 'easeOut' } : { duration: 0 }}
            className="absolute z-40 ui-layer pointer-events-auto flex flex-col pt-2 top-28 right-6 bottom-6 w-80"
          >
            {(() => {
              const allBodies = [
                ...PLANETS.flatMap(p => [p, ...(p.moons || [])]),
                ...CONSTELLATIONS.map(c => ({ id: c.id, name: '', color: c.color, desc: '', nameKey: c.nameKey, descKey: c.descKey })),
                ...BLACK_HOLES.map(b => ({ id: b.id, name: '', color: b.color, desc: '', nameKey: b.nameKey, descKey: b.descKey })),
                ...SPACECRAFTS.map(s => ({ id: s.id, name: s.name, color: s.color, desc: '', nameKey: s.nameKey, descKey: s.descKey }))
              ];
              const body = allBodies.find(p => p.id === selectedPlanet);
              if (!body) return null;
              
              const tName = ('nameKey' in body && body.nameKey) 
                ? (t[body.nameKey as keyof typeof t] || TRANSLATIONS['en'][body.nameKey as keyof typeof TRANSLATIONS['en']] || body.name) 
                : (t[`${body.id}_name` as keyof typeof t] || TRANSLATIONS['en'][`${body.id}_name` as keyof typeof TRANSLATIONS['en']] || body.name);

              const details = BODY_DETAILS[body.id] || { 
                type: 'Celestial Body', 
                funFacts: ['No detailed information available for this specific body.'] 
              };

              return (
                <GlassPanel lightColor={body.color} className="flex-1 rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden relative flex flex-col">
                  {/* Header */}
                  <div className="p-5 pb-4 border-b border-slate-900/60 bg-slate-950/20 relative z-10 shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: body.color }}></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mt-0.5" style={{ color: body.color }}>
                          {tName}
                        </h3>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/60 border border-slate-800/80 mt-2">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-300">{details.type}</span>
                        </div>
                      </div>
                      <button 
                         onClick={() => { playTapSound(); setSelectedPlanet(null); }}
                         className="p-1.5 text-slate-500 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 rounded-md transition-all active:scale-[0.96] active:opacity-80 active:duration-75"
                      >
                         <X className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-5 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {/* Key Stats */}
                    {(details.mass || details.temp || details.gravity) && (
                      <div className="grid grid-cols-1 gap-3">
                        {details.mass && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                            <div className="p-2 bg-slate-700/40 rounded-lg text-slate-400"><Weight className="w-4 h-4" /></div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Mass</div>
                              <div className="text-sm font-mono text-slate-200">{details.mass}</div>
                            </div>
                          </div>
                        )}
                        {details.temp && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 w-full group">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400 shrink-0"><Thermometer className="w-4 h-4" /></div>
                            <div className="flex-1 w-full min-w-0">
                              <div className="flex justify-between items-center w-full">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Temperature</div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); playTapSound(); setTempUnit(prev => prev === 'C' ? 'F' : 'C'); }}
                                  className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-0.5 rounded transition-colors opacity-80 hover:opacity-100"
                                  title={`Switch to ${tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                                >
                                  {tempUnit === 'C' ? '°C' : '°F'}
                                </button>
                              </div>
                              <div className="relative h-[20px] w-full overflow-hidden mt-0.5">
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.div
                                    key={tempUnit}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed } : { duration: 0 }}
                                    className="text-sm font-mono text-slate-200 absolute inset-0 flex items-center whitespace-nowrap overflow-hidden text-ellipsis"
                                  >
                                    {getDisplayTemp(details.temp)}
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        )}
                        {details.gravity && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Activity className="w-4 h-4" /></div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gravity</div>
                              <div className="text-sm font-mono text-slate-200">{details.gravity}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fun Facts */}
                    {details.funFacts && details.funFacts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" /> Interesting Facts
                        </h4>
                        <div className="space-y-2.5">
                          {details.funFacts.map((fact, idx) => (
                            <div key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed bg-slate-800/20 p-3 rounded-xl border border-slate-700/30">
                              <span className="text-slate-400 font-bold opacity-70 mt-0.5">•</span>
                              <p>{fact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassPanel>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stellar AI Researcher Full Panel */}
      <AIResearcher
        isOpen={isAIResearcherOpen}
        onClose={() => setIsAIResearcherOpen(false)}
        playTapSound={playTapSound}
        currentPlanet={selectedPlanet}
        uiAnimations={uiAnimations}
        uiAnimSpeed={uiAnimSpeed}
        apiKey={geminiKey}
        aiModelName={aiModel}
        initialQuestion={aiResearcherQuestion}
        onExecuteAction={handleAIAction}
        currentSettings={{
          speedMultiplier,
          showOrbits,
          showLabels,
          showAsteroids,
          showConstellations,
          showSpacecraft,
          perfMode,
          hdMode,
          tempUnit,
          lang,
          selectedPlanetId: selectedPlanet,
          resScale,
          sharpenLevel,
          graphicsPreset,
          enableBloom,
          enableChromatic,
          enableLensFlare,
          enableCosmicDust,
          enableVignette,
          fpsCap,
          wasdSpeed,
          aiAuraEffect,
          aiGridWave,
          aiPlasmaGlow,
          aiNebulaPulse,
          aiCustomShaderEnabled,
          aiCustomWgslCode
        } as any}
      />

      {/* Gemini AI Side Panel */}
      <GeminiSidePanel
        isOpen={isGeminiSidePanelOpen}
        aiModelName={aiModel}
        onClose={() => {
          setIsGeminiSidePanelOpen(false);
          setGeminiSidePanelQuestion(null);
        }}
        onExpandToFullResearcher={() => {
          setIsGeminiSidePanelOpen(false);
          setAiResearcherQuestion(geminiSidePanelQuestion);
          setIsAIResearcherOpen(true);
        }}
        playTapSound={playTapSound}
        currentPlanet={selectedPlanet}
        uiAnimations={uiAnimations}
        uiAnimSpeed={uiAnimSpeed}
        apiKey={geminiKey}
        initialQuestion={geminiSidePanelQuestion}
        onExecuteAction={handleAIAction}
        currentSettings={{
          speedMultiplier,
          showOrbits,
          showLabels,
          showAsteroids,
          showConstellations,
          showSpacecraft,
          perfMode,
          hdMode,
          tempUnit,
          lang,
          selectedPlanetId: selectedPlanet,
          resScale,
          sharpenLevel,
          graphicsPreset,
          enableBloom,
          enableChromatic,
          enableLensFlare,
          enableCosmicDust,
          enableVignette,
          fpsCap,
          wasdSpeed
        }}
      />
      </div>

      {/* WebGPU Disabled & Halting Guide Modal */}
      <WebGpuDisabledModal
        isOpen={isWebGpuDisabled}
        reason={webGpuDisabledReason}
        onRetry={handleRetryWebGpu}
        onBypassHalting={handleBypassHalting}
      />
    </MotionConfig>
  );
}

