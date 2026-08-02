const fs = require('fs');

const path = 'src/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  en: "ui_search_placeholder: 'Search for a planet, moon, or constellation...',",
  hu: "ui_search_placeholder: 'Keress egy bolygót, holdat vagy csillagképet...',",
  pl: "ui_search_placeholder: 'Szukaj planety, księżyca lub konstelacji...',",
  es: "ui_search_placeholder: 'Busca un planeta, luna o constelación...',",
  el: "ui_search_placeholder: 'Αναζητήστε έναν πλανήτη, φεγγάρι ή αστερισμό...',",
  sk: "ui_search_placeholder: 'Hľadaj planétu, mesiac alebo súhvezdie...',",
  ja: "ui_search_placeholder: '惑星、衛星、または星座を検索...',",
  'zh-CN': "ui_search_placeholder: '搜索星球、卫星或星座...',",
  'zh-TW': "ui_search_placeholder: '搜尋星球、衛星或星座...',",
  ar: "ui_search_placeholder: 'ابحث عن كوكب، قمر، أو كوكبة...',",
  it: "ui_search_placeholder: 'Cerca un pianeta, una luna o una costellazione...',",
  de: "ui_search_placeholder: 'Nach einem Planeten, Mond oder Sternbild suchen...',",
  fr: "ui_search_placeholder: 'Rechercher une planète, une lune ou une constellation...',",
  ko: "ui_search_placeholder: '행성, 위성 또는 별자리 검색...',",
  ru: "ui_search_placeholder: 'Поиск планеты, луны или созвездия...',"
};

for (const lang in replacements) {
  content = content.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?)ui_search_placeholder:\\s*'.*?',`),
    `$1${replacements[lang]}`
  );
}

fs.writeFileSync(path, content);
