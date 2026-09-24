const fs = require('fs');
const js = fs.readFileSync('frontend/dist/assets/index-k68ZFBuM.js', 'utf8');
const ssStart = js.indexOf('function Ss()');
const ssEnd = js.indexOf('var Cs=', ssStart);
const ssCode = js.substring(ssStart, ssEnd);

// Show submit button area more
console.log('=== Submit button full area (5500-6500) ===');
console.log(ssCode.substring(5500, 6600));
