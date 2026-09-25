const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/dist/assets/cendric-enhancements.js');
let code = fs.readFileSync(filePath, 'utf8');

console.log('Original length:', code.length);

// 1. Fix enhanceSettingsPage: curInfo definition
// Find "const curLang = getCurrentLang();" inside enhanceSettingsPage
const oldSettingsCardSearch = 'const curLang = getCurrentLang();\n      const langCard = document.createElement(\'div\');';
const newSettingsCardReplace = 'const curLang = getCurrentLang();\n      const curInfo = I18N[curLang] || I18N.en;\n      const langCard = document.createElement(\'div\');';

if (code.includes(oldSettingsCardSearch)) {
  code = code.replace(oldSettingsCardSearch, newSettingsCardReplace);
  console.log('Fixed curInfo in enhanceSettingsPage');
} else {
  console.log('curInfo search string not found or already fixed');
}

// 2. Also ensure language card styles in enhanceSettingsPage use the purple/indigo brand palette
const oldIconBg = 'background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 22px;';
const newIconBg = 'background: rgba(109, 90, 230, 0.12); border: 1px solid rgba(109, 90, 230, 0.22); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 22px;';
if (code.includes(oldIconBg)) {
  code = code.replace(oldIconBg, newIconBg);
  console.log('Updated language card header icon background');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Written enhanceSettingsPage fix to cendric-enhancements.js');
