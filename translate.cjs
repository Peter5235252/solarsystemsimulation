const fs = require('fs');

const path = 'src/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  en: "    cat_all: 'All', cat_planets: 'Planets', cat_stars: 'Stars', cat_black_holes: 'Black Holes', cat_spacecraft: 'Spacecraft', cat_constellations: 'Constellations',\n",
  hu: "    cat_all: 'Minden', cat_planets: 'Bolygók', cat_stars: 'Csillagok', cat_black_holes: 'Fekete Lyukak', cat_spacecraft: 'Űrhajók', cat_constellations: 'Csillagképek',\n",
  pl: "    cat_all: 'Wszystkie', cat_planets: 'Planety', cat_stars: 'Gwiazdy', cat_black_holes: 'Czarne Dziury', cat_spacecraft: 'Statki Kosmiczne', cat_constellations: 'Konstelacje',\n",
  es: "    cat_all: 'Todos', cat_planets: 'Planetas', cat_stars: 'Estrellas', cat_black_holes: 'Agujeros Negros', cat_spacecraft: 'Naves', cat_constellations: 'Constelaciones',\n",
  el: "    cat_all: 'Όλα', cat_planets: 'Πλανήτες', cat_stars: 'Αστέρια', cat_black_holes: 'Μαύρες Τρύπες', cat_spacecraft: 'Διαστημόπλοια', cat_constellations: 'Αστερισμοί',\n",
  sk: "    cat_all: 'Všetky', cat_planets: 'Planéty', cat_stars: 'Hviezdy', cat_black_holes: 'Čierne Diery', cat_spacecraft: 'Vesmírne Lode', cat_constellations: 'Súhvezdia',\n",
  ja: "    cat_all: 'すべて', cat_planets: '惑星', cat_stars: '恒星', cat_black_holes: 'ブラックホール', cat_spacecraft: '宇宙船', cat_constellations: '星座',\n",
  ar: "    cat_all: 'الكل', cat_planets: 'الكواكب', cat_stars: 'النجوم', cat_black_holes: 'الثقوب السوداء', cat_spacecraft: 'المركبات الفضائية', cat_constellations: 'الأبراج',\n",
  it: "    cat_all: 'Tutti', cat_planets: 'Pianeti', cat_stars: 'Stelle', cat_black_holes: 'Buchi Neri', cat_spacecraft: 'Navette', cat_constellations: 'Costellazioni',\n",
  de: "    cat_all: 'Alle', cat_planets: 'Planeten', cat_stars: 'Sterne', cat_black_holes: 'Schwarze Löcher', cat_spacecraft: 'Raumfahrzeuge', cat_constellations: 'Sternbilder',\n",
  fr: "    cat_all: 'Tous', cat_planets: 'Planètes', cat_stars: 'Étoiles', cat_black_holes: 'Trous Noirs', cat_spacecraft: 'Vaisseaux', cat_constellations: 'Constellations',\n",
  ko: "    cat_all: '모두', cat_planets: '행성', cat_stars: '별', cat_black_holes: '블랙홀', cat_spacecraft: '우주선', cat_constellations: '별자리',\n",
  ru: "    cat_all: 'Все', cat_planets: 'Планеты', cat_stars: 'Звезды', cat_black_holes: 'Черные дыры', cat_spacecraft: 'Космические аппараты', cat_constellations: 'Созвездия',\n"
};

for (const [lang, appendText] of Object.entries(translations)) {
  const regex = new RegExp(`(${lang}: {\\s+ui_search_planets:[^\\n]+\\n)`);
  content = content.replace(regex, `$1${appendText}`);
}

fs.writeFileSync(path, content, 'utf8');
