const fs = require('fs');
const css = fs.readFileSync('frontend/dist/assets/index-Dr3oI3zo.css', 'utf8');
const idx = css.indexOf('[data-theme="light"]');
console.log(css.substring(idx, idx + 2000));
