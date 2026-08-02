const fs = require('fs');
let content = fs.readFileSync('src/components/SolarSystem.tsx', 'utf8');

const updatedDetails = `{
  'sun': { type: 'Yellow Dwarf Star', mass: '333,000 × Earth', temp: '5,500°C', gravity: '274 m/s²', funFacts: ['Accounts for 99.86% of the mass in the solar system.', 'Its core temperature is about 15 million degrees Celsius.'] },
  'mercury': { type: 'Terrestrial Planet', mass: '0.055 × Earth', temp: '-173°C to 427°C', gravity: '3.7 m/s²', funFacts: ['It has a completely molten core.', 'A year on Mercury is just 88 Earth days.'] },
  'venus': { type: 'Terrestrial Planet', mass: '0.815 × Earth', temp: '462°C', gravity: '8.87 m/s²', funFacts: ['Venus spins in the opposite direction to most planets.', 'Its atmospheric pressure is 92 times that of Earth.'] },
  'earth': { type: 'Terrestrial Planet', mass: '1 × Earth', temp: '-89°C to 58°C', gravity: '9.807 m/s²', funFacts: ['The only planet not named after a god.', 'Earth is actually a squashed sphere, not a perfect round ball.'] },
  'moon': { type: 'Natural Satellite', mass: '0.0123 × Earth', temp: '-173°C to 127°C', gravity: '1.62 m/s²', funFacts: ['Always shows the same face to Earth.', 'Its surface is actually dark, despite appearing bright in the sky.'] },
  'mars': { type: 'Terrestrial Planet', mass: '0.107 × Earth', temp: '-153°C to 20°C', gravity: '3.721 m/s²', funFacts: ['Home to the highest mountain in the solar system, Olympus Mons.', 'Sunsets on Mars appear blue.'] },
  'jupiter': { type: 'Gas Giant', mass: '318 × Earth', temp: '-145°C', gravity: '24.79 m/s²', funFacts: ['The Great Red Spot is a storm that has lasted for hundreds of years.', 'Jupiter has 95 officially recognized moons.'] },
  'saturn': { type: 'Gas Giant', mass: '95 × Earth', temp: '-178°C', gravity: '10.44 m/s²', funFacts: ['Saturn could float in water because it is mostly made of gas.', 'Its rings are made of chunks of ice and rock.'] },
  'titan': { type: 'Natural Satellite', mass: '0.0225 × Earth', temp: '-179°C', gravity: '1.35 m/s²', funFacts: ['The only moon in our solar system with a dense atmosphere.', 'Has lakes and rivers of liquid methane.'] },
  'rhea': { type: 'Natural Satellite', mass: '0.00039 × Earth', temp: '-174°C', gravity: '0.264 m/s²', funFacts: ['Saturn\\'s second-largest moon.', 'May have a tenuous ring system of its own.'] },
  'enceladus': { type: 'Natural Satellite', mass: '0.000018 × Earth', temp: '-201°C', gravity: '0.113 m/s²', funFacts: ['Has water-rich plumes erupting from its south pole.', 'One of the most reflective bodies in the solar system.'] },
  'dione': { type: 'Natural Satellite', mass: '0.00018 × Earth', temp: '-186°C', gravity: '0.232 m/s²', funFacts: ['Features bright ice cliffs created by tectonic fractures.', 'Orbits Saturn in resonance with Enceladus.'] },
  'tethys': { type: 'Natural Satellite', mass: '0.00010 × Earth', temp: '-187°C', gravity: '0.146 m/s²', funFacts: ['Contains a massive impact crater named Odysseus.', 'Composed almost entirely of water ice.'] },
  'uranus': { type: 'Ice Giant', mass: '14.5 × Earth', temp: '-195°C', gravity: '8.69 m/s²', funFacts: ['Uranus rotates on its side.', 'It is the coldest planetary atmosphere in the solar system.'] },
  'neptune': { type: 'Ice Giant', mass: '17.1 × Earth', temp: '-201°C', gravity: '11.15 m/s²', funFacts: ['Wind speeds can reach 2,100 km/h here.', 'It has a very faint ring system.'] },
  
  'iss': { type: 'Space Station', mass: '419,725 kg', temp: '20°C (Internal)', gravity: 'Microgravity', funFacts: ['Orbits Earth 16 times a day.', 'Has been continuously occupied since 2000.'] },
  'voyager1': { type: 'Space Probe', mass: '722 kg', temp: '-238°C (External)', gravity: 'N/A', funFacts: ['Farthest human-made object from Earth.', 'Carries the Golden Record.'] },
  'voyager2': { type: 'Space Probe', mass: '722 kg', temp: '-238°C (External)', gravity: 'N/A', funFacts: ['The only spacecraft to have visited Uranus and Neptune.', 'Currently in interstellar space.'] },
  'newhorizons': { type: 'Space Probe', mass: '478 kg', temp: '-230°C (External)', gravity: 'N/A', funFacts: ['First spacecraft to explore Pluto up close.', 'Flew by Arrokoth in the Kuiper Belt.'] },
  'cassini': { type: 'Space Probe', mass: '5,712 kg', temp: '-150°C (External)', gravity: 'N/A', funFacts: ['Orbited Saturn for 13 years.', 'Purposefully plunged into Saturn\\'s atmosphere at the end of its mission.'] },
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
}`;

content = content.replace(/const BODY_DETAILS: Record<string, \{[\s\S]*?\} = \{[\s\S]*?\n\};\n\nconst PLANETS =/m, 
"const BODY_DETAILS: Record<string, {\n  type: string;\n  mass?: string;\n  gravity?: string;\n  temp?: string;\n  funFacts: string[];\n}> = " + updatedDetails + ";\n\nconst PLANETS =");

fs.writeFileSync('src/components/SolarSystem.tsx', content);
