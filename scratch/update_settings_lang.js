const fs = require('fs');
const path = require('path');

// 1. Update cendric-enhancements.js
const jsPath = path.join(__dirname, '../frontend/dist/assets/cendric-enhancements.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Target block in enhanceSettingsPage
const oldLangCardRegex = /const curInfo = I18N\[curLang\] \|\| I18N\.en;\r?\n\s*const langCard = document\.createElement\('div'\);[\s\S]*?langCard\.querySelectorAll\('\.cendric-lang-card'\)\.forEach\(tile => \{[\s\S]*?setLanguage\(code\);\r?\n\s*\}\);\r?\n\s*\}\);/;

const newLangCardCode = `const curInfo = I18N[curLang] || I18N.en;
      const activeCheckSvg = '<div style="width: 22px; height: 22px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>';
      const langCard = document.createElement('div');
      langCard.id = 'cendric-language-settings-card';
      langCard.style.cssText = 'background: var(--card-bg); border-radius: 20px; padding: 24px; box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid var(--border); margin-bottom: 20px;';
      langCard.innerHTML = \`
        <div class="flex items-center gap-4 mb-5">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--accent-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m5 8 6 6"></path>
              <path d="m4 14 6-6 2-3"></path>
              <path d="M2 5h12"></path>
              <path d="M7 2h1"></path>
              <path d="m22 22-5-10-5 10"></path>
              <path d="M14 18h6"></path>
            </svg>
          </div>
          <div>
            <h2 id="cendric-lang-card-title" style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0;">\${curInfo.langSettingsTitle}</h2>
            <p id="cendric-lang-card-sub" style="color: var(--text-muted); font-size: 13px; margin-top: 2px; margin-bottom: 0;">\${curInfo.langSettingsSubtitle}</p>
          </div>
        </div>
        <div class="cendric-lang-grid">
          <div class="cendric-lang-card \${curLang === 'ta' ? 'active' : ''}" data-lang="ta">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
              <div class="cendric-lang-badge">🇱🇰</div>
              <div style="display: flex; flex-direction: column; justify-content: center; gap: 3px; min-width: 0;">
                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1.3;">தமிழ் (Tamil)</div>
                <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">இலங்கை தமிழ் இடைமுகம்</div>
              </div>
            </div>
            <div class="cendric-lang-check" style="width: 22px; height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-left: 8px;">\${curLang === 'ta' ? activeCheckSvg : ''}</div>
          </div>
          <div class="cendric-lang-card \${curLang === 'si' ? 'active' : ''}" data-lang="si">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
              <div class="cendric-lang-badge">🇱🇰</div>
              <div style="display: flex; flex-direction: column; justify-content: center; gap: 3px; min-width: 0;">
                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1.3;">සිංහල (Sinhala)</div>
                <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">ශ්‍රී ලංකා සිංහල අතුරුමුහුණත</div>
              </div>
            </div>
            <div class="cendric-lang-check" style="width: 22px; height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-left: 8px;">\${curLang === 'si' ? activeCheckSvg : ''}</div>
          </div>
          <div class="cendric-lang-card \${curLang === 'en' ? 'active' : ''}" data-lang="en">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1;">
              <div class="cendric-lang-badge">🇬🇧</div>
              <div style="display: flex; flex-direction: column; justify-content: center; gap: 3px; min-width: 0;">
                <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1.3;">English</div>
                <div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Standard Business English</div>
              </div>
            </div>
            <div class="cendric-lang-check" style="width: 22px; height: 22px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-left: 8px;">\${curLang === 'en' ? activeCheckSvg : ''}</div>
          </div>
        </div>
      \`;

      langCard.querySelectorAll('.cendric-lang-card').forEach(tile => {
        tile.addEventListener('click', () => {
          const code = tile.getAttribute('data-lang');
          langCard.querySelectorAll('.cendric-lang-card').forEach(t => {
            t.classList.remove('active');
            const chk = t.querySelector('.cendric-lang-check');
            if (chk) chk.innerHTML = '';
          });
          tile.classList.add('active');
          const chk = tile.querySelector('.cendric-lang-check');
          if (chk) chk.innerHTML = activeCheckSvg;
          setLanguage(code);
        });
      });`;

if (!oldLangCardRegex.test(js)) {
  console.error('ERROR: oldLangCardRegex did not match in cendric-enhancements.js!');
  process.exit(1);
}

js = js.replace(oldLangCardRegex, newLangCardCode);
fs.writeFileSync(jsPath, js, 'utf8');
console.log('Successfully updated cendric-enhancements.js');

// 2. Update index-Dr3oI3zo.css
const cssPath = path.join(__dirname, '../frontend/dist/assets/index-Dr3oI3zo.css');
let css = fs.readFileSync(cssPath, 'utf8');

const oldCssRegex = /\/\* Settings Language Cards \*\/[\s\S]*?\[data-theme="dark"\] \.cendric-lang-card\.active \{[\s\S]*?\}/;

const newCssCode = `/* Settings Language Cards */
.cendric-lang-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 14px !important;
}

@media (max-width: 860px) {
  .cendric-lang-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}

.cendric-lang-card {
  padding: 14px 18px !important;
  border-radius: 16px !important;
  min-height: 72px !important;
  box-sizing: border-box !important;
  border: 1.5px solid var(--border, #e2e8f0) !important;
  background: var(--card-bg, #ffffff) !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
}

[data-theme="dark"] .cendric-lang-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.cendric-lang-card:hover {
  border-color: var(--accent, #6d5ae6) !important;
  transform: translateY(-1.5px) !important;
  box-shadow: 0 4px 16px rgba(109, 90, 230, 0.14) !important;
}

.cendric-lang-card.active {
  border-color: var(--accent, #6d5ae6) !important;
  background: rgba(109, 90, 230, 0.12) !important;
  box-shadow: 0 0 0 1.5px var(--accent, #6d5ae6), 0 4px 16px rgba(109, 90, 230, 0.16) !important;
}

[data-theme="dark"] .cendric-lang-card.active {
  background: rgba(109, 90, 230, 0.22) !important;
  border-color: #818cf8 !important;
  box-shadow: 0 0 0 1.5px #818cf8, 0 4px 16px rgba(129, 140, 248, 0.25) !important;
}

/* Language Pill Badge matching Currency Symbol Badge */
.cendric-lang-badge {
  min-width: 48px !important;
  width: 48px !important;
  height: 42px !important;
  border-radius: 12px !important;
  background: rgba(109, 90, 230, 0.09) !important;
  border: 1px solid rgba(109, 90, 230, 0.2) !important;
  color: var(--accent, #6d5ae6) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  flex-shrink: 0 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s ease !important;
}

.cendric-lang-card.active .cendric-lang-badge {
  background: rgba(109, 90, 230, 0.3) !important;
  border-color: var(--accent, #6d5ae6) !important;
  color: #ffffff !important;
}

[data-theme="dark"] .cendric-lang-badge {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #e2e8f0 !important;
}

[data-theme="dark"] .cendric-lang-card.active .cendric-lang-badge {
  background: rgba(109, 90, 230, 0.4) !important;
  border-color: #818cf8 !important;
  color: #ffffff !important;
}`;

if (!oldCssRegex.test(css)) {
  console.error('ERROR: oldCssRegex did not match in index-Dr3oI3zo.css!');
  process.exit(1);
}

css = css.replace(oldCssRegex, newCssCode);
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated index-Dr3oI3zo.css');
