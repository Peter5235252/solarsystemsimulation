const fs = require('fs');

const dataPath = 'src/data/constellations.ts';
let dataContent = fs.readFileSync(dataPath, 'utf8');

dataContent = dataContent.replace(/nameKey: string;/g, "nameKey: string;\n  descKey: string;\n  color: string;\n  hitRadius: number;");

dataContent = dataContent.replace(
  /nameKey: 'const_ursa_major',/g,
  "nameKey: 'const_ursa_major',\n    descKey: 'const_ursa_major_desc',\n    color: '#38bdf8',\n    hitRadius: 400,"
);

dataContent = dataContent.replace(
  /nameKey: 'const_orion',/g,
  "nameKey: 'const_orion',\n    descKey: 'const_orion_desc',\n    color: '#facc15',\n    hitRadius: 400,"
);

dataContent = dataContent.replace(
  /nameKey: 'const_cassiopeia',/g,
  "nameKey: 'const_cassiopeia',\n    descKey: 'const_cassiopeia_desc',\n    color: '#c084fc',\n    hitRadius: 250,"
);

dataContent = dataContent.replace(
  /nameKey: 'const_cygnus',/g,
  "nameKey: 'const_cygnus',\n    descKey: 'const_cygnus_desc',\n    color: '#fb7185',\n    hitRadius: 400,"
);

dataContent = dataContent.replace(
  /nameKey: 'const_scorpius',/g,
  "nameKey: 'const_scorpius',\n    descKey: 'const_scorpius_desc',\n    color: '#f87171',\n    hitRadius: 350,"
);

dataContent = dataContent.replace(
  /nameKey: 'const_crux',/g,
  "nameKey: 'const_crux',\n    descKey: 'const_crux_desc',\n    color: '#818cf8',\n    hitRadius: 200,"
);

fs.writeFileSync(dataPath, dataContent);

const i18nPath = 'src/i18n.ts';
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

const tDesc = {
  en: "const_ursa_major_desc: 'Also known as the Great Bear. Contains the Big Dipper asterisk.',\n    const_orion_desc: 'A prominent constellation located on the celestial equator and visible throughout the world.',\n    const_cassiopeia_desc: 'Easily recognizable due to its distinctive W shape.',\n    const_crux_desc: 'The Southern Cross, the smallest yet one of the most distinctive of the 88 modern constellations.',\n    const_scorpius_desc: 'A large constellation located in the southern hemisphere near the center of the Milky Way.',\n    const_cygnus_desc: 'The Swan, a northern constellation lying on the plane of the Milky Way.',",
  hu: "const_ursa_major_desc: 'Más néven Nagy Medve. Tartalmazza a Göncölszekeret.',\n    const_orion_desc: 'Feltűnő csillagkép az égi egyenlítőn, a világ minden tájáról látható.',\n    const_cassiopeia_desc: 'Könnyen felismerhető jellegzetes W alakjáról.',\n    const_crux_desc: 'A Dél Keresztje, a legkisebb, mégis az egyik legjellegzetesebb a 88 modern csillagkép közül.',\n    const_scorpius_desc: 'Nagy csillagkép a déli féltekén, a Tejút közepe közelében.',\n    const_cygnus_desc: 'A Hattyú, egy északi csillagkép a Tejút síkján.',",
  pl: "const_ursa_major_desc: 'Znana również jako Wielka Niedźwiedzica. Zawiera asteryzm Wielkiego Wozu.',\n    const_orion_desc: 'Wybitna konstelacja na równiku niebieskim, widoczna na całym świecie.',\n    const_cassiopeia_desc: 'Łatwo rozpoznawalna dzięki wyraźnemu kształtowi litery W.',\n    const_crux_desc: 'Krzyż Południa, najmniejsza z 88 współczesnych konstelacji.',\n    const_scorpius_desc: 'Duża konstelacja na półkuli południowej w pobliżu centrum Drogi Mlecznej.',\n    const_cygnus_desc: 'Łabędź, północna konstelacja leżąca na płaszczyźnie Drogi Mlecznej.',",
  es: "const_ursa_major_desc: 'También conocida como la Osa Mayor. Contiene el asterismo del Carro.',\n    const_orion_desc: 'Una prominente constelación en el ecuador celeste, visible en todo el mundo.',\n    const_cassiopeia_desc: 'Fácilmente reconocible por su distintiva forma de W.',\n    const_crux_desc: 'La Cruz del Sur, la más pequeña pero una de las más distintivas.',\n    const_scorpius_desc: 'Gran constelación en el hemisferio sur cerca del centro de la Vía Láctea.',\n    const_cygnus_desc: 'El Cisne, una constelación del norte en el plano de la Vía Láctea.',",
  el: "const_ursa_major_desc: 'Γνωστή και ως Μεγάλη Άρκτος. Περιέχει το άστρο της Μεγάλης Άρκτου.',\n    const_orion_desc: 'Ένας εξέχων αστερισμός στον ουράνιο ισημερινό, ορατός σε όλο τον κόσμο.',\n    const_cassiopeia_desc: 'Εύκολα αναγνωρίσιμος λόγω του χαρακτηριστικού σχήματος W.',\n    const_crux_desc: 'Ο Σταυρός του Νότου, ο μικρότερος αλλά πιο διακριτός.',\n    const_scorpius_desc: 'Ένας μεγάλος αστερισμός στο νότιο ημισφαίριο κοντά στο κέντρο του Γαλαξία.',\n    const_cygnus_desc: 'Ο Κύκνος, ένας βόρειος αστερισμός στο επίπεδο του Γαλαξία.',",
  sk: "const_ursa_major_desc: 'Známa tiež ako Veľká medvedica. Obsahuje asterizmus Veľký voz.',\n    const_orion_desc: 'Významné súhvezdie na nebeskom rovníku, viditeľné po celom svete.',\n    const_cassiopeia_desc: 'Ľahko rozpoznateľná vďaka svojmu tvaru W.',\n    const_crux_desc: 'Južný kríž, najmenšie spomedzi 88 moderných súhvezdí.',\n    const_scorpius_desc: 'Veľké súhvezdie na južnej pologuli blízko centra Mliečnej dráhy.',\n    const_cygnus_desc: 'Labuť, severné súhvezdie ležiace v rovine Mliečnej dráhy.',",
  ja: "const_ursa_major_desc: 'おおぐま座としても知られています。北斗七星を含みます。',\n    const_orion_desc: '天の赤道に位置し、世界中から見える目立つ星座です。',\n    const_cassiopeia_desc: '特徴的なWの形で簡単に見分けられます。',\n    const_crux_desc: 'みなみじゅうじ座。88星座の中で最も小さいですが、非常に目立ちます。',\n    const_scorpius_desc: '天の川の中心近く、南半球にある大きな星座です。',\n    const_cygnus_desc: 'はくちょう座。天の川の面上にある北天の星座です。',",
  'zh-CN': "const_ursa_major_desc: '大熊座，包含北斗七星。',\n    const_orion_desc: '位于天赤道上，在世界各地都能看到的著名星座。',\n    const_cassiopeia_desc: '以其独特的W形状很容易被认出。',\n    const_crux_desc: '南十字座，88个现代星座中最小的，却也是最显眼的星座之一。',\n    const_scorpius_desc: '位于银河系中心附近南半球的一个大星座。',\n    const_cygnus_desc: '天鹅座，位于银河面上的北半球星座。',",
  'zh-TW': "const_ursa_major_desc: '大熊座，包含北斗七星。',\n    const_orion_desc: '位於天赤道上，在世界各地都能看到的著名星座。',\n    const_cassiopeia_desc: '以其獨特的W形狀很容易被認出。',\n    const_crux_desc: '南十字座，88個現代星座中最小的，卻也是最顯眼的星座之一。',\n    const_scorpius_desc: '位於銀河系中心附近南半球的一個大星座。',\n    const_cygnus_desc: '天鵝座，位於銀河面上的北半球星座。',",
  ar: "const_ursa_major_desc: 'المعروفة أيضاً باسم الدب الأكبر. تحتوي على مجموعة بنات نعش الكبرى.',\n    const_orion_desc: 'كوكبة بارزة تقع على خط الاستواء السماوي واضحة في جميع أنحاء العالم.',\n    const_cassiopeia_desc: 'يمكن التعرف عليها بسهولة بسبب شكل حرف W المميز.',\n    const_crux_desc: 'صليب الجنوب، أصغر الكوكبات الحديثة والبالغ عددها 88 وأكثرها تميزاً.',\n    const_scorpius_desc: 'كوكبة كبيرة تقع في نصف الكرة الجنوبي بالقرب من مركز درب التبانة.',\n    const_cygnus_desc: 'الدجاجة، كوكبة شمالية تقع على مستوى درب التبانة.',",
  it: "const_ursa_major_desc: 'Nota anche come Orsa Maggiore. Contiene l\\'asterismo del Grande Carro.',\n    const_orion_desc: 'Una costellazione molto evidente situata all\\'equatore celeste, visibile in tutto il mondo.',\n    const_cassiopeia_desc: 'Facilmente riconoscibile per la sua caratteristica forma a W.',\n    const_crux_desc: 'La Croce del Sud, la più piccola ma tra le più distintive delle 88 costellazioni.',\n    const_scorpius_desc: 'Una grande costellazione situata nell\\'emisfero sud vicino al centro della Via Lattea.',\n    const_cygnus_desc: 'Il Cigno, una costellazione settentrionale sul piano della Via Lattea.',",
  de: "const_ursa_major_desc: 'Auch bekannt als Großer Bär. Enthält den Großen Wagen.',\n    const_orion_desc: 'Ein markantes Sternbild am Himmelsäquator, weltweit sichtbar.',\n    const_cassiopeia_desc: 'Dank der charakteristischen W-Form leicht zu erkennen.',\n    const_crux_desc: 'Das Kreuz des Südens, das kleinste und markanteste der 88 Sternbilder.',\n    const_scorpius_desc: 'Ein großes Sternbild der Südhalbkugel nahe dem Zentrum der Milchstraße.',\n    const_cygnus_desc: 'Der Schwan, ein nördliches Sternbild in der Ebene der Milchstraße.',",
  fr: "const_ursa_major_desc: 'Également connue sous le nom de Grande Ourse. Contient la Grande Casserole.',\n    const_orion_desc: 'Une constellation proéminente située sur l\\'équateur céleste.',\n    const_cassiopeia_desc: 'Facilement reconnaissable grâce à sa forme en W.',\n    const_crux_desc: 'La Croix du Sud, la plus petite masig des plus distinctives des constellations moderns.',\n    const_scorpius_desc: 'Une grande constellation située dans l\\'hémisphère sud.',\n    const_cygnus_desc: 'Le Cygne, constellation du nord située sur le plan de la Voie lactée.',",
  ko: "const_ursa_major_desc: '큰곰자리로 알려져 있습니다. 북두칠성을 포함합니다.',\n    const_orion_desc: '적도 근처에 위치한 눈에 띄는 별자리로, 세계 어디서나 보입니다.',\n    const_cassiopeia_desc: 'W자 형태 덕분에 쉽게 알아볼 수 있습니다.',\n    const_crux_desc: '남십자자리. 88개의 현대 별자리 중 가장 작지만 뚜렷합니다.',\n    const_scorpius_desc: '은하수 중심 근처, 남반구에 위치한 큰 별자리입니다.',\n    const_cygnus_desc: '백조자리. 은하수 평면에 놓인 북반구의 별자리입니다.',",
  ru: "const_ursa_major_desc: 'Также известна как Большая Медведица. В её состав входит Большой Ковш.',\n    const_orion_desc: 'Выдающееся созвездие на небесном экваторе, видимое по всему миру.',\n    const_cassiopeia_desc: 'Легко узнаваема благодаря характерной форме буквы W.',\n    const_crux_desc: 'Южный Крест, самое маленькое из 88 современных созвездий.',\n    const_scorpius_desc: 'Большое созвездие в южном полушарии вблизи центра Млечного Пути.',\n    const_cygnus_desc: 'Лебедь, северное созвездие, лежащее в плоскости Млечного Пути.',"
};

i18nContent = i18nContent.replace(/\| 'const_cygnus'/g, "| 'const_cygnus' | 'const_ursa_major_desc' | 'const_orion_desc' | 'const_cassiopeia_desc' | 'const_crux_desc' | 'const_scorpius_desc' | 'const_cygnus_desc'");

for (const lang in tDesc) {
  i18nContent = i18nContent.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?const_cygnus:\\s*'.*?',)`),
    `$1\n    ${tDesc[lang]}`
  );
}

fs.writeFileSync(i18nPath, i18nContent);
