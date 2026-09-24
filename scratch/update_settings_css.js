const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/dist/assets/index-Dr3oI3zo.css');
let css = fs.readFileSync(cssPath, 'utf8');

const marker = '/* === SETTINGS PAGE BRAND PALETTE ALIGNMENT (PURPLE/INDIGO) === */';
if (!css.includes(marker)) {
  const extraCss = `
\n${marker}
/* Settings container & frosted cards */
main > div[style*="720px"] div[style*="border-radius: 20px"] {
  background: var(--glass-card-bg, #ffffff) !important;
  border: 1px solid var(--border, rgba(109, 90, 230, 0.15)) !important;
  box-shadow: 0 4px 20px rgba(109, 90, 230, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8) !important;
}

[data-theme="dark"] main > div[style*="720px"] div[style*="border-radius: 20px"] {
  background: rgba(18, 24, 39, 0.72) !important;
  border: 1px solid rgba(109, 90, 230, 0.2) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

/* Appearance section: Icon background and icon colors */
main > div[style*="720px"] div[style*="width: 44px"][style*="border-radius: 12px"],
#cendric-language-settings-card div[style*="width: 44px"][style*="border-radius: 12px"] {
  background: rgba(109, 90, 230, 0.12) !important;
  border: 1px solid rgba(109, 90, 230, 0.22) !important;
  color: var(--accent, #6d5ae6) !important;
}

main > div[style*="720px"] div[style*="width: 44px"][style*="border-radius: 12px"] svg,
#cendric-language-settings-card div[style*="width: 44px"][style*="border-radius: 12px"] svg {
  color: var(--accent, #6d5ae6) !important;
}

/* Appearance Toggle switch */
main > div[style*="720px"] button[style*="border-radius: 99px"] {
  border: 1px solid rgba(109, 90, 230, 0.25) !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06) !important;
}

main > div[style*="720px"] button[style*="border-radius: 99px"] svg {
  color: var(--accent, #6d5ae6) !important;
  stroke: var(--accent, #6d5ae6) !important;
}

/* Interface Language Card & Tiles */
#cendric-language-settings-card {
  background: var(--glass-card-bg, #ffffff) !important;
  border: 1px solid var(--border, rgba(109, 90, 230, 0.15)) !important;
  box-shadow: 0 4px 20px rgba(109, 90, 230, 0.05) !important;
}

#cendric-language-settings-card .cendric-lang-card {
  border: 1.5px solid var(--border, rgba(109, 90, 230, 0.15)) !important;
  background: var(--glass-inner-bg, rgba(255, 255, 255, 0.6)) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

#cendric-language-settings-card .cendric-lang-card:hover {
  border-color: #818cf8 !important;
  background: rgba(109, 90, 230, 0.06) !important;
  transform: translateY(-1.5px) !important;
  box-shadow: 0 4px 16px rgba(109, 90, 230, 0.14) !important;
}

#cendric-language-settings-card .cendric-lang-card.active {
  border-color: var(--accent, #6d5ae6) !important;
  background: rgba(109, 90, 230, 0.12) !important;
  box-shadow: 0 0 0 1.5px var(--accent, #6d5ae6), 0 6px 20px rgba(109, 90, 230, 0.2) !important;
}

[data-theme="dark"] #cendric-language-settings-card .cendric-lang-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

[data-theme="dark"] #cendric-language-settings-card .cendric-lang-card.active {
  background: rgba(109, 90, 230, 0.22) !important;
  border-color: #818cf8 !important;
  box-shadow: 0 0 0 1.5px #818cf8, 0 6px 20px rgba(129, 140, 248, 0.28) !important;
}

#cendric-language-settings-card .cendric-lang-check {
  color: var(--accent, #6d5ae6) !important;
  font-weight: 800 !important;
}

/* Currency Preference Tiles on Settings Page */
main > div[style*="720px"] .hover\\:border-indigo-400:hover,
main > div[style*="720px"] [class*="hover:border-indigo-400"]:hover {
  border-color: var(--accent, #6d5ae6) !important;
  background: rgba(109, 90, 230, 0.06) !important;
  box-shadow: 0 6px 20px rgba(109, 90, 230, 0.12) !important;
}

main > div[style*="720px"] .hover\\:border-indigo-400[style*="2px solid"],
main > div[style*="720px"] .hover\\:border-indigo-400[style*="var(--accent-light)"] {
  border-color: var(--accent, #6d5ae6) !important;
  background: rgba(109, 90, 230, 0.12) !important;
  box-shadow: 0 4px 20px rgba(109, 90, 230, 0.18) !important;
}

/* Ambient glow on Settings page: purple/indigo */
body:has(main > div[style*="720px"]) main::after {
  background: radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, rgba(147, 51, 234, 0) 70%) !important;
}
`;
  css += extraCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Successfully updated index-Dr3oI3zo.css');
} else {
  console.log('Marker already exists in CSS');
}
