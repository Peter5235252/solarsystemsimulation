const fs = require('fs');

const path = 'src/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const t = {
  en: "ui_app_title: 'Low Poly Orrery',\n    ui_drag_pan: 'Drag to pan',\n    ui_scroll_zoom: 'Scroll to zoom',\n    ui_caution: 'CAUTION',",
  hu: "ui_app_title: 'Low Poly Naprendszer',\n    ui_drag_pan: 'Húzd a mozgatáshoz',\n    ui_scroll_zoom: 'Görgess a nagyításhoz',\n    ui_caution: 'VIGYÁZAT',",
  pl: "ui_app_title: 'Układ Słoneczny w Low Poly',\n    ui_drag_pan: 'Przeciągnij, aby przesunąć',\n    ui_scroll_zoom: 'Przewiń, aby przybliżyć',\n    ui_caution: 'UWAGA',",
  es: "ui_app_title: 'Planetario Low Poly',\n    ui_drag_pan: 'Arrastra para mover',\n    ui_scroll_zoom: 'Desplázate para enfocar',\n    ui_caution: 'PRECAUCIÓN',",
  el: "ui_app_title: 'Πλανητάριο Low Poly',\n    ui_drag_pan: 'Σύρετε για μετακίνηση',\n    ui_scroll_zoom: 'Κύλιση για ζουμ',\n    ui_caution: 'ΠΡΟΣΟΧΗ',",
  sk: "ui_app_title: 'Low Poly Slnečná sústava',\n    ui_drag_pan: 'Potiahni pre posun',\n    ui_scroll_zoom: 'Roluj pre priblíženie',\n    ui_caution: 'POZOR',",
  ja: "ui_app_title: 'ローポリ太陽系儀',\n    ui_drag_pan: 'ドラッグで移動',\n    ui_scroll_zoom: 'スクロールで拡大',\n    ui_caution: '注意',",
  'zh-CN': "ui_app_title: '低多边形太阳系太阳系仪',\n    ui_drag_pan: '拖拽来平移',\n    ui_scroll_zoom: '滚动来缩放',\n    ui_caution: '警告',",
  'zh-TW': "ui_app_title: '低多邊形太陽系儀',\n    ui_drag_pan: '拖曳來平移',\n    ui_scroll_zoom: '滾動來縮放',\n    ui_caution: '警告',",
  ar: "ui_app_title: 'نظام شمسي مبسط',\n    ui_drag_pan: 'اسحب للتحريك',\n    ui_scroll_zoom: 'مرر للتكبير',\n    ui_caution: 'تحذير',",
  it: "ui_app_title: 'Planetario Low Poly',\n    ui_drag_pan: 'Trascina per spostare',\n    ui_scroll_zoom: 'Scorri per ingrandire',\n    ui_caution: 'ATTENZIONE',",
  de: "ui_app_title: 'Low-Poly-Tischplanetarium',\n    ui_drag_pan: 'Ziehen zum Verschieben',\n    ui_scroll_zoom: 'Scrollen zum Zoomen',\n    ui_caution: 'ACHTUNG',",
  fr: "ui_app_title: 'Planétaire Low Poly',\n    ui_drag_pan: 'Faites glisser pour déplacer',\n    ui_scroll_zoom: 'Faites défiler pour zoomer',\n    ui_caution: 'ATTENTION',",
  ko: "ui_app_title: '로우 폴리 태양계의',\n    ui_drag_pan: '드래그하여 이동',\n    ui_scroll_zoom: '스크롤하여 확대',\n    ui_caution: '경고',",
  ru: "ui_app_title: 'Низкополигональный планетарий',\n    ui_drag_pan: 'Тащите для перемещения',\n    ui_scroll_zoom: 'Крутите для масштабирования',\n    ui_caution: 'ВНИМАНИЕ',"
};

content = content.replace(/\| 'ui_cancel'/g, "| 'ui_cancel' | 'ui_app_title' | 'ui_drag_pan' | 'ui_scroll_zoom' | 'ui_caution'");

for (const lang in t) {
  content = content.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?ui_reset_view:\\s*'.*?',)`),
    `$1\n    ${t[lang]}`
  );
}

fs.writeFileSync(path, content);
