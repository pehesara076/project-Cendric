const fs = require('fs');
const js = fs.readFileSync('frontend/dist/assets/index-k68ZFBuM.js', 'utf8');

// Focus on the Ss function (login page) only — extract it
const ssStart = js.indexOf('function Ss()');
const ssEnd = js.indexOf('var Cs=', ssStart);
const ssCode = js.substring(ssStart, ssEnd);

// Find all inline style colors in the Ss function
const colorMatches = [];
const regex = /(?:background|color|border|fill):`([^`]+)`/g;
let m;
while ((m = regex.exec(ssCode)) !== null) {
  colorMatches.push({ index: m.index, match: m[0], value: m[1] });
}

colorMatches.forEach(c => console.log(c.value, ' at ', c.index));
