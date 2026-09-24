const fs = require('fs');
const filePath = 'frontend/dist/assets/index-k68ZFBuM.js';
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace('(hs,{size:13,color:`#f59e0b`})', '(hs,{size:13,color:`var(--accent)`})');
fs.writeFileSync(filePath, code, 'utf8');
console.log('Replaced sun icon color');
