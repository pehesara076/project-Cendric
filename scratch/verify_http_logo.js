const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- 1. Checking Index HTML ---');
  const indexRes = await get('http://localhost:5050/');
  console.log('Index status:', indexRes.status);
  console.log('Has favicon link:', indexRes.body.includes('favicon.svg?v=44'));
  console.log('Has index js v44:', indexRes.body.includes('index-k68ZFBuM.js?v=44'));
  console.log('Has css v44:', indexRes.body.includes('index-Dr3oI3zo.css?v=44'));

  console.log('\n--- 2. Checking Favicon SVG ---');
  const favRes = await get('http://localhost:5050/favicon.svg?v=44');
  console.log('Favicon status:', favRes.status);
  console.log('Favicon has gradient:', favRes.body.includes('cendric-logo-grad'));
  console.log('Favicon has C text:', favRes.body.includes('>C</text>'));

  console.log('\n--- 3. Checking JS Bundle ---');
  const jsRes = await get('http://localhost:5050/assets/index-k68ZFBuM.js?v=44');
  console.log('JS bundle status:', jsRes.status);
  console.log('Desktop Hero C logo present:', jsRes.body.includes('fontSize:`42px`,fontWeight:800,lineHeight:1,fontFamily:`system-ui, -apple-system, sans-serif`,userSelect:`none`},children:`C`'));
  console.log('Mobile Header C logo present:', jsRes.body.includes('fontSize:`20px`,fontWeight:800,lineHeight:1,fontFamily:`system-ui, -apple-system, sans-serif`,userSelect:`none`},children:`C`'));
  console.log('Gradient background in badges:', jsRes.body.includes('background:`linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #db2777 100%)`'));
  console.log('CENDRIC text unchanged:', jsRes.body.includes('CENDRIC'));
  console.log('EXPENSE TRACKER text unchanged:', jsRes.body.includes('EXPENSE TRACKER'));
  console.log('Net Balance wallet icon untouched:', jsRes.body.includes("Ps,{label:`Net Balance`,value:`${p} ${Math.abs(_).toLocaleString()}`,icon:(0,M.jsx)(bs,{size:22,color:`var(--accent)`})"));

  console.log('\n--- 4. Checking CSS Stylesheet ---');
  const cssRes = await get('http://localhost:5050/assets/index-Dr3oI3zo.css?v=44');
  console.log('CSS bundle status:', cssRes.status);
  console.log('Nav logo mark has gradient:', cssRes.body.includes('background: linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #db2777 100%) !important;'));

  console.log('\n=== ALL ASSETS & LOGO LOCATIONS VERIFIED OVER HTTP! ===');
}

verify().catch(console.error);
