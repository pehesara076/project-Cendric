const fs = require('fs');
let code = fs.readFileSync('backend/controllers/chatController.js', 'utf8');
code = code.replace(
  /\$setOnInsert:\s*\{\s*sessionId:/g,
  '$setOnInsert: { userId: req.user._id, sessionId:'
);
fs.writeFileSync('backend/controllers/chatController.js', code, 'utf8');
console.log('Fixed Chat upsert setOnInsert');
