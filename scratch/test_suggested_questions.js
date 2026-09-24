const http = require('http');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'cendric_super_secret_jwt_key_2024_change_this';
const token = jwt.sign(
  { id: 'd865d1bda5cd375cb3dd525b', _id: 'd865d1bda5cd375cb3dd525b', email: 'malithsahan01@gmail.com', fullName: 'Malith Sahan Jayaweera', currencyPreference: 'LKR', languagePreference: 'en' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

async function testStreamQuestion(question) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      question,
      languagePreference: 'en',
      history: []
    });

    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/api/chat/stream',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`SSE status ${res.statusCode}:`, data);
        }
        // Parse SSE tokens
        const lines = data.split('\n');
        let fullText = '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.token) fullText += parsed.token;
            } catch {}
          }
        }
        if (!fullText && data) {
          console.error('SSE raw data was:', data);
        }
        resolve(fullText.trim());
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function testPostMessageQuestion(question) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      question,
      sessionId: 'test-session-123'
    });

    const req = http.request({
      hostname: 'localhost',
      port: 5050,
      path: '/api/chat/message',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk.toString();
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`POST status ${res.statusCode}:`, data);
        }
        try {
          const json = JSON.parse(data);
          resolve(json.answer || json.reply || json.message || JSON.stringify(json));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('=== VERIFYING SUGGESTED QUESTIONS VIA STREAMING ENDPOINT ===\n');

  const q1 = "What's my net balance?";
  const a1 = await testStreamQuestion(q1);
  console.log(`Q1: "${q1}"`);
  console.log(`A1: ${a1.slice(0, 180)}...\n`);
  const q1Pass = a1.includes('Net Balance') && !a1.includes('I am Cendric, your AI finance assistant. You can ask me');
  console.log(`Q1 Result: ${q1Pass ? 'PASSED (Real Net Balance data returned)' : 'FAILED'}\n`);

  const q2 = "Give me financial tips";
  const a2 = await testStreamQuestion(q2);
  console.log(`Q2: "${q2}"`);
  console.log(`A2: ${a2.slice(0, 180)}...\n`);
  const q2Pass = (a2.includes('Tips') || a2.includes('50/30/20')) && !a2.includes('I am Cendric, your AI finance assistant. You can ask me');
  console.log(`Q2 Result: ${q2Pass ? 'PASSED (Real financial tips returned)' : 'FAILED'}\n`);

  const q3 = "Show my expense breakdown";
  const a3 = await testStreamQuestion(q3);
  console.log(`Q3: "${q3}"`);
  console.log(`A3: ${a3.slice(0, 180)}...\n`);
  const q3Pass = a3.includes('Expense Breakdown') && a3.includes('Total Expenses') && !a3.includes('I am Cendric, your AI finance assistant. You can ask me');
  console.log(`Q3 Result: ${q3Pass ? 'PASSED (Real expense breakdown data returned)' : 'FAILED'}\n`);

  console.log('=== VERIFYING MANUALLY TYPED QUESTION (SAME ENDPOINT) ===\n');
  const typedQ = "Show my expense breakdown";
  const typedAns = await testStreamQuestion(typedQ);
  console.log(`Typed Q: "${typedQ}"`);
  console.log(`Consistency Check: ${typedAns === a3 ? 'IDENTICAL TO SUGGESTED BUTTON ANSWER (100% Consistent)' : 'MISMATCH'}\n`);

  console.log('=== VERIFYING VIA /chat/message POST ENDPOINT ===\n');
  const postA3 = await testPostMessageQuestion(q3);
  console.log(`POST /chat/message Q3: ${postA3.slice(0, 180)}...\n`);
  const postPass = postA3.includes('Expense Breakdown') && !postA3.includes('I am Cendric, your AI finance assistant. You can ask me');
  console.log(`POST Endpoint Result: ${postPass ? 'PASSED' : 'FAILED'}\n`);

  const q4 = "How much income did I earn?";
  const a4 = await testStreamQuestion(q4);
  console.log(`Q4: "${q4}"`);
  console.log(`A4: ${a4.slice(0, 180)}...\n`);
  const q4Pass = a4.includes('Income') && !a4.includes('I am Cendric, your AI finance assistant. You can ask me');
  console.log(`Q4 Result: ${q4Pass ? 'PASSED (Real income data returned)' : 'FAILED'}\n`);

  const q5 = "Am I over my monthly budget?";
  const a5 = await testStreamQuestion(q5);
  console.log(`Q5: "${q5}"`);
  console.log(`A5: ${a5.slice(0, 180)}...\n`);
  const q5Pass = a5.includes('Budget') && !a5.includes('I am Cendric, your AI finance assistant. You can ask me');
  console.log(`Q5 Result: ${q5Pass ? 'PASSED (Real budget analysis returned)' : 'FAILED'}\n`);

  const allPassed = q1Pass && q2Pass && q3Pass && q4Pass && q5Pass && (typedAns === a3) && postPass;
  console.log(`\n=== FINAL RESULT: ${allPassed ? 'ALL VERIFICATIONS PASSED SUCCESSFULLY!' : 'SOME CHECKS FAILED'} ===`);
}

run().catch(console.error);
