const fs = require('fs');
const js = fs.readFileSync('frontend/dist/assets/index-k68ZFBuM.js', 'utf8');

// Find the Ss function
const ssStart = js.indexOf('function Ss()');
const ssEnd = js.indexOf('var Cs=', ssStart);
const ssCode = js.substring(ssStart, ssEnd);

// Show the area around the form card background (#fff at offset 1869)
console.log('=== Form container (around offset 1700-2100) ===');
console.log(ssCode.substring(1700, 2200));

console.log('\n=== Submit button (around offset 5400-5800) ===');
console.log(ssCode.substring(5400, 5900));

console.log('\n=== Right-side form panel (around offset 1700-2000) ===');
console.log(ssCode.substring(1800, 2100));

console.log('\n=== Left panel (sidebar-bg area) ===');
console.log(ssCode.substring(200, 750));
