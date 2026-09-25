const http = require('http');

http.get('http://localhost:5050/assets/cendric-enhancements.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('cendric-enhancements.js Status:', res.statusCode);
    console.log('Has Lucide Languages SVG:', data.includes('stroke="var(--accent)"'));
    console.log('Has cendric-lang-badge:', data.includes('cendric-lang-badge'));
    console.log('Has circular active checkmark SVG:', data.includes('activeCheckSvg'));
  });
}).on('error', err => console.error(err));

http.get('http://localhost:5050/assets/index-Dr3oI3zo.css', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('index-Dr3oI3zo.css Status:', res.statusCode);
    console.log('Has cendric-lang-badge CSS:', data.includes('.cendric-lang-badge'));
    console.log('Has balanced 3-col grid:', data.includes('grid-template-columns: repeat(3, 1fr)'));
    console.log('Has 72px min-height card:', data.includes('min-height: 72px'));
  });
}).on('error', err => console.error(err));
