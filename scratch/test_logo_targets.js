const fs = require('fs');

const jsPath = 'frontend/dist/assets/index-k68ZFBuM.js';
let js = fs.readFileSync(jsPath, 'utf8');

// Target 1: Login desktop hero (w-20 h-20)
const heroOld = "(0,M.jsx)(`div`,{style:{background:`var(--accent)`,borderRadius:`20px`},className:`w-20 h-20 flex items-center justify-center mx-auto mb-6`,children:(0,M.jsx)(bs,{size:40,color:`#fff`})})";
const heroNew = "(0,M.jsx)(`div`,{style:{background:`linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #db2777 100%)`,borderRadius:`20px`},className:`w-20 h-20 flex items-center justify-center mx-auto mb-6 flex-shrink-0`,children:(0,M.jsx)(`span`,{style:{color:`#fff`,fontSize:`42px`,fontWeight:800,lineHeight:1,fontFamily:`system-ui, -apple-system, sans-serif`,userSelect:`none`},children:`C`})})";

// Target 2: Login mobile header (w-10 h-10)
const mobileOld = "[(0,M.jsx)(`div`,{style:{background:`var(--accent)`,borderRadius:`10px`},className:`w-10 h-10 flex items-center justify-center`,children:(0,M.jsx)(bs,{size:20,color:`#fff`})}),(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`p`,{className:`font-bold text-sm tracking-widest`";
const mobileNew = "[(0,M.jsx)(`div`,{style:{background:`linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #db2777 100%)`,borderRadius:`10px`},className:`w-10 h-10 flex items-center justify-center flex-shrink-0`,children:(0,M.jsx)(`span`,{style:{color:`#fff`,fontSize:`20px`,fontWeight:800,lineHeight:1,fontFamily:`system-ui, -apple-system, sans-serif`,userSelect:`none`},children:`C`})}),(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`p`,{className:`font-bold text-sm tracking-widest`";

// Target 3: Sidebar logo badge (w-10 h-10)
const sidebarOld = "children:[(0,M.jsx)(`div`,{style:{background:`var(--accent)`,borderRadius:`10px`},className:`w-10 h-10 flex items-center justify-center`,children:(0,M.jsx)(bs,{size:20,color:`#fff`})}),(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`p`,{className:`text-white font-bold text-sm tracking-widest`";
const sidebarNew = "children:[(0,M.jsx)(`div`,{style:{background:`linear-gradient(135deg, #4338ca 0%, #7c3aed 45%, #db2777 100%)`,borderRadius:`10px`},className:`w-10 h-10 flex items-center justify-center flex-shrink-0`,children:(0,M.jsx)(`span`,{style:{color:`#fff`,fontSize:`20px`,fontWeight:800,lineHeight:1,fontFamily:`system-ui, -apple-system, sans-serif`,userSelect:`none`},children:`C`})}),(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`p`,{className:`text-white font-bold text-sm tracking-widest`";

console.log('Hero old found:', js.includes(heroOld));
console.log('Mobile old found:', js.includes(mobileOld));
console.log('Sidebar old found:', js.includes(sidebarOld));
