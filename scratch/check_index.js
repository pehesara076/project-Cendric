const fs = require('fs');
const content = fs.readFileSync('frontend/dist/assets/index-k68ZFBuM.js', 'utf8');
console.log('Includes Got it:', content.includes("Got it! I've saved"));
