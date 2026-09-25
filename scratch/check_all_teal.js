const fs = require('fs');
const js = fs.readFileSync('frontend/dist/assets/cendric-enhancements.js', 'utf8');
const lines = js.split('\n');

// Check ALL teal references in the entire file
lines.forEach((l, i) => {
  const lt = l.trim();
  if ((lt.includes('#115e59') || lt.includes('#0d5c58') || lt.includes('d1fae5')) ) {
    console.log('Line', (i+1), ':', lt.substring(0, 200));
  }
});
