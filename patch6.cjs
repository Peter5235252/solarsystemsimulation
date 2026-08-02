const fs = require('fs');

const path = 'src/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const placeholders = {
  en: "ui_search_placeholder: 'Search for any celestial body...',",
  hu: "ui_search_placeholder: 'Keress bármilyen égitestet...',",
  pl: "ui_search_placeholder: 'Szukaj dowolnego ciała niebieskiego...',",
  es: "ui_search_placeholder: 'Busca cualquier cuerpo celeste...',",
  el: "ui_search_placeholder: 'Αναζητήστε οποιοδήποτε ουράνιο σώμα...',",
  sk: "ui_search_placeholder: 'Hľadaj akékoľvek nebeské teleso...',",
  ja: "ui_search_placeholder: '任意の天体を検索...',",
  'zh-CN': "ui_search_placeholder: '搜索任何天体...',",
  'zh-TW': "ui_search_placeholder: '搜尋任何天體...',",
  ar: "ui_search_placeholder: 'ابحث عن أي جرم سماوي...',",
  it: "ui_search_placeholder: 'Cerca un corpo celeste qualsiasi...',",
  de: "ui_search_placeholder: 'Nach einem beliebigen Himmelskörper suchen...',",
  fr: "ui_search_placeholder: 'Recherchez n\\'importe quel corps céleste...',",
  ko: "ui_search_placeholder: '모든 천체 검색...',",
  ru: "ui_search_placeholder: 'Поиск любого небесного тела...',"
};

for (const lang in placeholders) {
  content = content.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?)ui_search_placeholder:\\s*'.*?',`),
    `$1${placeholders[lang]}`
  );
}

const bhTexts = {
  en: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'The supermassive black hole at the galactic center of the Milky Way.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'A galactic X-ray source, widely accepted to be a stellar-mass black hole.',",
  hu: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'A Tejútrendszer galaktikus központjában található szupermasszív fekete lyuk.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Egy galaktikus röntgenforrás, általánosan elfogadott csillagtömegű fekete lyuk.',",
  pl: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'Supermasywna czarna dziura w centrum galaktycznym Drogi Mlecznej.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Galaktyczne źródło promieniowania rentgenowskiego, powszechnie uznawane za czarną dziurę o masie gwiazdowej.',",
  es: "bh_sagittarius_a: 'Sagitario A*',\n    bh_sagittarius_a_desc: 'El agujero negro supermasivo en el centro galáctico de la Vía Láctea.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Una fuente de rayos X galáctica, ampliamente aceptada como un agujero negro de masa estelar.',",
  el: "bh_sagittarius_a: 'Τοξότης Α*',\n    bh_sagittarius_a_desc: 'Η υπερμεγέθης μαύρη τρύπα στο γαλαξιακό κέντρο του Γαλαξία μας.',\n    bh_cygnus_x1: 'Κύκνος X-1',\n    bh_cygnus_x1_desc: 'Μια γαλαξιακή πηγή ακτίνων Χ, ευρέως αποδεκτή ως μαύρη τρύπα αστρικής μάζας.',",
  sk: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'Supermasívna čierna diera v galaktickom centre Mliečnej dráhy.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Galaktický röntgenový zdroj, všeobecne prijímaný ako čierna diera hviezdnej hmotnosti.',",
  ja: "bh_sagittarius_a: 'いて座A*',\n    bh_sagittarius_a_desc: '天の川銀河の銀河系中心にある超大質量ブラックホール。',\n    bh_cygnus_x1: 'はくちょう座X-1',\n    bh_cygnus_x1_desc: '広く恒星質量ブラックホールであると受け入れられている銀河系X線源。',",
  'zh-CN': "bh_sagittarius_a: '人马座 A*',\n    bh_sagittarius_a_desc: '位于银河系中心的超大质量黑洞。',\n    bh_cygnus_x1: '天鹅座 X-1',\n    bh_cygnus_x1_desc: '一个银河系X射线源，被广泛认为是一个恒星级黑洞。',",
  'zh-TW': "bh_sagittarius_a: '人馬座 A*',\n    bh_sagittarius_a_desc: '位於銀河系中心的超大質量黑洞。',\n    bh_cygnus_x1: '天鵝座 X-1',\n    bh_cygnus_x1_desc: '一個銀河系X射線源，被廣泛認為是一個恆星級黑洞。',",
  ar: "bh_sagittarius_a: 'الرامي A*',\n    bh_sagittarius_a_desc: 'الثقب الأسود الهائل في المركز المجري لدرب التبانة.',\n    bh_cygnus_x1: 'الدجاجة X-1',\n    bh_cygnus_x1_desc: 'مصدر أشعة سينية مجري، يُعتقد على نطاق واسع أنه ثقب أسود نجمي الكتلة.',",
  it: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'Il buco nero supermassiccio al centro galattico della Via Lattea.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Una sorgente di raggi X galattica, ampiamente accettata come buco nero di massa stellare.',",
  de: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'Das supermassereiche Schwarze Loch im galaktischen Zentrum der Milchstraße.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Eine galaktische Röntgenquelle, die weithin als stellares Schwarzes Loch akzeptiert wird.',",
  fr: "bh_sagittarius_a: 'Sagittarius A*',\n    bh_sagittarius_a_desc: 'Le trou noir supermassif au centre galactique de la Voie lactée.',\n    bh_cygnus_x1: 'Cygnus X-1',\n    bh_cygnus_x1_desc: 'Une source de rayons X galactique, largement acceptée comme étant un trou noir stellaire.',",
  ko: "bh_sagittarius_a: '궁수자리 A*',\n    bh_sagittarius_a_desc: '우리 은하의 은하 중심에 있는 초대질량 블랙홀입니다.',\n    bh_cygnus_x1: '백조자리 X-1',\n    bh_cygnus_x1_desc: '항성 질량 블랙홀로 널리 받아들여지는 은하계 X선 방출원입니다.',",
  ru: "bh_sagittarius_a: 'Стрелец А*',\n    bh_sagittarius_a_desc: 'Сверхмассивная черная дыра в галактическом центре Млечного Пути.',\n    bh_cygnus_x1: 'Лебедь X-1',\n    bh_cygnus_x1_desc: 'Галактический рентгеновский источник, общепризнанный как черная дыра звездной массы.',"
};

content = content.replace(/\| 'const_cygnus_desc'/g, "| 'const_cygnus_desc' | 'bh_sagittarius_a' | 'bh_sagittarius_a_desc' | 'bh_cygnus_x1' | 'bh_cygnus_x1_desc'");

for (const lang in bhTexts) {
  content = content.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?const_cygnus_desc:\\s*'.*?',)`),
    `$1\n    ${bhTexts[lang]}`
  );
}

fs.writeFileSync(path, content);
