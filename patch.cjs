const fs = require('fs');

const path = 'src/i18n.ts';
let content = fs.readFileSync(path, 'utf8');

const t = {
  en: "ui_reset_view: 'Reset View',",
  hu: "ui_reset_view: 'Nézet Visszaállítása',",
  pl: "ui_reset_view: 'Zresetuj Widok',",
  es: "ui_reset_view: 'Restablecer Vista',",
  el: "ui_reset_view: 'Επαναφορά Προβολής',",
  sk: "ui_reset_view: 'Obnoviť Zobrazenie',",
  ja: "ui_reset_view: 'ビューをリセット',",
  'zh-CN': "ui_reset_view: '重置视图',",
  'zh-TW': "ui_reset_view: '重置視圖',",
  ar: "ui_reset_view: 'إعادة تعيين العرض',",
  it: "ui_reset_view: 'Ripristina Vista',",
  de: "ui_reset_view: 'Ansicht zurücksetzen',",
  fr: "ui_reset_view: 'Réinitialiser la vue',",
  ko: "ui_reset_view: '보기 초기화',",
  ru: "ui_reset_view: 'Сбросить вид',"
};

content = content.replace(/\| 'ui_cancel'/g, "| 'ui_cancel' | 'ui_reset_view'");

for (const lang in t) {
  content = content.replace(
    new RegExp(`(${lang}:\\s*{[\\s\\S]*?ui_cancel:\\s*'.*?',)`),
    `$1\n    ${t[lang]}`
  );
}

fs.writeFileSync(path, content);
