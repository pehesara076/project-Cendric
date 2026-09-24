const fs = require('fs');
const cssPath = 'frontend/dist/assets/index-Dr3oI3zo.css';
let css = fs.readFileSync(cssPath, 'utf8');

// =============================================================================
// Login Page Color Palette Update
// Reference image palette:
//   - Page background: soft lavender-white #ededf5
//   - "Get Started" nav CTA: brand purple-to-magenta gradient
//   - Submit button: dark indigo-to-purple gradient
//   - Inputs/form: white stays, focus ring → purple brand
//   - Heading: dark navy/near-black (already #111827 — keep)
//   - Body text: medium gray (already #6b7280 — keep)
//   - Mint right shape → soft lavender-purple
//   - Debit card → brand gradient
//   - bal-link color: brand accent
// =============================================================================

const replacements = [
  // ── 1. Page/container background: grey → soft lavender
  {
    from: 'background-color: #f1f3f5 !important;\r\n  color: #111827 !important;',
    to:   'background-color: #ededf5 !important;\r\n  color: #111827 !important;'
  },
  {
    // container wrapper background
    from: 'background-color: #f1f3f5 !important;\r\n  display: flex',
    to:   'background-color: #ededf5 !important;\r\n  display: flex'
  },
  // Avatar border should match new bg
  {
    from: 'border: 2px solid #f1f3f5 !important;',
    to:   'border: 2px solid #ededf5 !important;'
  },

  // ── 2. Nav "Get Started" CTA button: teal → brand gradient
  {
    from: '.cendric-nav-cta {\r\n  background: #115e59 !important;',
    to:   '.cendric-nav-cta {\r\n  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #db2777 100%) !important;'
  },
  {
    from: '.cendric-nav-cta:hover {\r\n  background: #0d5c58 !important;\r\n}',
    to:   '.cendric-nav-cta:hover {\r\n  background: linear-gradient(135deg, #3730a3 0%, #6d28d9 45%, #be185d 100%) !important;\r\n}'
  },

  // ── 3. Submit / primary action button: teal → dark indigo-to-purple gradient (like reference)
  {
    from: '#auth-submit-btn,\r\n.cendric-pay-submit-btn {\r\n  flex: 1 !important;\r\n  background: #115e59 !important;',
    to:   '#auth-submit-btn,\r\n.cendric-pay-submit-btn {\r\n  flex: 1 !important;\r\n  background: linear-gradient(135deg, #312e81 0%, #7c3aed 60%, #db2777 100%) !important;'
  },
  {
    from: '#auth-submit-btn:hover:not(:disabled),\r\n.cendric-pay-submit-btn:hover:not(:disabled) {\r\n  background: #0d5c58 !important;',
    to:   '#auth-submit-btn:hover:not(:disabled),\r\n.cendric-pay-submit-btn:hover:not(:disabled) {\r\n  background: linear-gradient(135deg, #1e1b6b 0%, #5b21b6 60%, #be185d 100%) !important;'
  },
  // Submit button shadow: teal → purple
  {
    from: 'box-shadow: 0 4px 12px rgba(17, 94, 89, 0.25) !important;',
    to:   'box-shadow: 0 4px 12px rgba(109, 90, 230, 0.35) !important;'
  },

  // ── 4. Input focus ring: teal → brand purple
  {
    from: '.cendric-pay-form-wrap input:focus {\r\n  border-color: #115e59 !important;\r\n  box-shadow: 0 0 0 3px rgba(17, 94, 89, 0.15) !important;\r\n}',
    to:   '.cendric-pay-form-wrap input:focus {\r\n  border-color: #7c3aed !important;\r\n  box-shadow: 0 0 0 3px rgba(109, 90, 230, 0.18) !important;\r\n}'
  },

  // ── 5. bal-link color: teal → brand purple
  {
    from: '.cendric-bal-link {\r\n  font-size: 9.5px !important;\r\n  color: #115e59 !important;',
    to:   '.cendric-bal-link {\r\n  font-size: 9.5px !important;\r\n  color: #7c3aed !important;'
  },

  // ── 6. Debit card in right panel: teal gradient → brand gradient
  {
    from: '.cendric-card-debit {\r\n  bottom: 4% !important;\r\n  right: 15px !important;\r\n  width: 175px !important;\r\n  height: 105px !important;\r\n  background: linear-gradient(135deg, #115e59 0%, #0d5c58 100%) !important;',
    to:   '.cendric-card-debit {\r\n  bottom: 4% !important;\r\n  right: 15px !important;\r\n  width: 175px !important;\r\n  height: 105px !important;\r\n  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 55%, #db2777 100%) !important;'
  },
  // Debit card box-shadow: teal → purple
  {
    from: 'box-shadow: 0 16px 32px -8px rgba(17, 94, 89, 0.45) !important;',
    to:   'box-shadow: 0 16px 32px -8px rgba(109, 90, 230, 0.45) !important;'
  },

  // ── 7. Right panel mint shape: green tint → soft lavender
  {
    from: '.cendric-pay-mint-shape {\r\n  position: absolute !important;\r\n  width: 380px !important;\r\n  height: 480px !important;\r\n  background: #d1fae5 !important;',
    to:   '.cendric-pay-mint-shape {\r\n  position: absolute !important;\r\n  width: 380px !important;\r\n  height: 480px !important;\r\n  background: #e0def8 !important;'
  },
];

let changeCount = 0;
for (const r of replacements) {
  if (css.includes(r.from)) {
    css = css.replace(r.from, r.to);
    changeCount++;
    console.log(`✅ Replaced: ${r.from.substring(0, 60).trim()}...`);
  } else {
    console.log(`⚠️  NOT FOUND: ${r.from.substring(0, 60).trim()}...`);
  }
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log(`\nDone — ${changeCount}/${replacements.length} replacements applied.`);
