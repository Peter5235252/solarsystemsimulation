const fs = require('fs');

const path = 'src/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const t = {
  en: "ui_show_constellations: 'Show Constellations',\n    const_ursa_major: 'Ursa Major',\n    const_orion: 'Orion',\n    const_cassiopeia: 'Cassiopeia',\n    const_crux: 'Crux',\n    const_scorpius: 'Scorpius',\n    const_cygnus: 'Cygnus',",
  hu: "ui_show_constellations: 'Csillagképek Mutatása',\n    const_ursa_major: 'Nagy Medve',\n    const_orion: 'Orion',\n    const_cassiopeia: 'Kassziopeia',\n    const_crux: 'Dél Keresztje',\n    const_scorpius: 'Skorpió',\n    const_cygnus: 'Hattyú',",
  pl: "ui_show_constellations: 'Pokaż Konstelacje',\n    const_ursa_major: 'Wielka Niedźwiedzica',\n    const_orion: 'Orion',\n    const_cassiopeia: 'Kasjopeja',\n    const_crux: 'Krzyż Południa',\n    const_scorpius: 'Skorpion',\n    const_cygnus: 'Łabędź',",
  es: "ui_show_constellations: 'Mostrar Constelaciones',\n    const_ursa_major: 'Osa Mayor',\n    const_orion: 'Orión',\n    const_cassiopeia: 'Casiopea',\n    const_crux: 'Cruz del Sur',\n    const_scorpius: 'Escorpio',\n    const_cygnus: 'Cisne',",
  el: "ui_show_constellations: 'Εμφάνιση Αστερισμών',\n    const_ursa_major: 'Μεγάλη Άρκτος',\n    const_orion: 'Ωρίωντας',\n    const_cassiopeia: 'Κασσιόπη',\n    const_crux: 'Σταυρός του Νότου',\n    const_scorpius: 'Σκορπιός',\n    const_cygnus: 'Κύκνος',",
  sk: "ui_show_constellations: 'Zobraziť Súhvezdia',\n    const_ursa_major: 'Veľká medvedica',\n    const_orion: 'Orión',\n    const_cassiopeia: 'Kasiopeja',\n    const_crux: 'Južný kríž',\n    const_scorpius: 'Škorpión',\n    const_cygnus: 'Labuť',",
  ja: "ui_show_constellations: '星座を表示',\n    const_ursa_major: 'おおぐま座',\n    const_orion: 'オリオン座',\n    const_cassiopeia: 'カシオペヤ座',\n    const_crux: 'みなみじゅうじ座',\n    const_scorpius: 'さそり座',\n    const_cygnus: 'はくちょう座',",
  'zh-CN': "ui_show_constellations: '显示星座',\n    const_ursa_major: '大熊座',\n    const_orion: '猎户座',\n    const_cassiopeia: '仙后座',\n    const_crux: '南十字座',\n    const_scorpius: '天蝎座',\n    const_cygnus: '天鹅座',",
  'zh-TW': "ui_show_constellations: '顯示星座',\n    const_ursa_major: '大熊座',\n    const_orion: '獵戶座',\n    const_cassiopeia: '仙后座',\n    const_crux: '南十字座',\n    const_scorpius: '天蠍座',\n    const_cygnus: '天鵝座',",
  ar: "ui_show_constellations: 'إظهار الكوكبات',\n    const_ursa_major: 'الدب الأكبر',\n    const_orion: 'الجبار',\n    const_cassiopeia: 'ذات الكرسي',\n    const_crux: 'صليب الجنوب',\n    const_scorpius: 'العقرب',\n    const_cygnus: 'الدجاجة',",
  it: "ui_show_constellations: 'Mostra Costellazioni',\n    const_ursa_major: 'Orsa Maggiore',\n    const_orion: 'Orione',\n    const_cassiopeia: 'Cassiopea',\n    const_crux: 'Croce del Sud',\n    const_scorpius: 'Scorpione',\n    const_cygnus: 'Cigno',",
  de: "ui_show_constellations: 'Sternbilder anzeigen',\n    const_ursa_major: 'Großer Bär',\n    const_orion: 'Orion',\n    const_cassiopeia: 'Kassiopeia',\n    const_crux: 'Kreuz des Südens',\n    const_scorpius: 'Skorpion',\n    const_cygnus: 'Schwan',",
  fr: "ui_show_constellations: 'Afficher les Constellations',\n    const_ursa_major: 'Grande Ourse',\n    const_orion: 'Orion',\n    const_cassiopeia: 'Cassiopée',\n    const_crux: 'Croix du Sud',\n    const_scorpius: 'Scorpion',\n    const_cygnus: 'Cygne',",
  ko: "ui_show_constellations: '별자리 표시',\n    const_ursa_major: '큰곰자리',\n    const_orion: '오리온자리',\n    const_cassiopeia: '카시오페이아자리',\n    const_crux: '남십자자리',\n    const_scorpius: '전갈자리',\n    const_cygnus: '백조자리',",
  ru: "ui_show_constellations: 'Показывать созвездия',\n    const_ursa_major: 'Большая Медведица',\n    const_orion: 'Орион',\n    const_cassiopeia: 'Кассиопея',\n    const_crux: 'Южный Крест',\n    const_scorpius: 'Скорпион',\n    const_cygnus: 'Лебедь',"
};

content = content.replace(/\| 'ui_caution'/g, "| 'ui_caution' | 'ui_show_constellations' | 'const_ursa_major' | 'const_orion' | 'const_cassiopeia' | 'const_crux' | 'const_scorpius' | 'const_cygnus'");

for (const lang in t) {
  content = content.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?ui_caution:\\s*'.*?',)`),
    `$1\n    ${t[lang]}`
  );
}

fs.writeFileSync(path, content);
