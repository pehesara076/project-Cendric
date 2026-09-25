const fs = require('fs');
const css = fs.readFileSync('frontend/dist/assets/index-Dr3oI3zo.css', 'utf8');
const lines = css.split('\n');
const authLines = [];
lines.forEach((l, i) => {
  const lt = l.trim();
  if (lt.includes('cendric-auth') || lt.includes('cendric-pay') || lt.includes('cendric-nav-cta') || lt.includes('cendric-nav-login') || lt.includes('cendric-pay-tab') || lt.includes('cendric-pay-form')) {
    authLines.push((i+1) + ': ' + lt.substring(0, 200));
  }
});
authLines.slice(0, 100).forEach(l => console.log(l));
