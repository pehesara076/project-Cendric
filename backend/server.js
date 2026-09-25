const path = require('path');
const fs = require('fs');

// Load environment variables from both root .env and backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Helper: ensure a non-empty key in either .env file takes precedence over an empty one
const syncEnvKey = (keyName) => {
  const currentVal = (process.env[keyName] || '').trim();
  if (!currentVal || currentVal === 'your_key_here') {
    const envPaths = [
      path.join(__dirname, '..', '.env'),
      path.join(__dirname, '.env')
    ];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(new RegExp(`^\\s*${keyName}\\s*=\\s*(.*)$`, 'm'));
        if (match && match[1]) {
          const val = match[1].trim().replace(/^['"](.*)['"]$/, '$1');
          if (val && val !== 'your_key_here') {
            process.env[keyName] = val;
            break;
          }
        }
      }
    }
  }
};

syncEnvKey('GEMINI_API_KEY');
syncEnvKey('GEMINI_MODEL');
if (!process.env.GEMINI_MODEL || process.env.GEMINI_MODEL.startsWith('gemini-1.') || process.env.GEMINI_MODEL.startsWith('gemini-3.')) {
  process.env.GEMINI_MODEL = 'gemini-flash-latest';
}

const express = require('express');
const cors = require('cors');

// MERN Database & Services Initialization
const { connectDB } = require('./config/db');
const currencyService = require('./services/currencyService');
const apiRoutes = require('./routes');
const { DB_FILE } = require('./utils/localDB');

// Start background currency exchange rates synchronization
currencyService.startAutoRefresh();

// Connect to MongoDB (with auto-migration & local fallback)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount Modular API Routes
app.use('/api', apiRoutes);

// Static Client Frontend Serving (React Single Page Application)
const clientDistPath = fs.existsSync(path.resolve(__dirname, '../frontend/dist'))
  ? path.resolve(__dirname, '../frontend/dist')
  : path.resolve(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
  }));

  // SPA fallback: any non-API route serves React's index.html
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send('<h1>Cendric Server Running</h1><p>Client dist directory not found.</p>');
  });
}

// Start HTTP Server
const server = app.listen(PORT, '0.0.0.0', () => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_key_here' && process.env.GEMINI_API_KEY.trim().length > 15);
  console.log(`=================================================`);
  console.log(`🚀 CENDRIC MERN SERVER IS RUNNING`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`⚡ Stack: MERN (MongoDB, Express.js, React, Node.js)`);
  console.log(`🤖 Gemini AI: ${hasGeminiKey ? 'ENABLED (Model: ' + (process.env.GEMINI_MODEL || 'gemini-flash-latest') + ')' : 'KEY MISSING (Set GEMINI_API_KEY in .env)'}`);
  console.log(`📁 Client Dist: ${clientDistPath}`);
  console.log(`💾 Local Backup: ${DB_FILE}`);
  console.log(`=================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another running process.`);
    console.error(`👉 Close the previous terminal or double-click start.bat (which auto-frees the port).\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;
