const jwt = require('jsonwebtoken');
const http = require('http');
const { db } = require('../backend/utils/localDB');

const user = db.users[0];
const JWT_SECRET = process.env.JWT_SECRET || 'cendric_super_secret_jwt_key_2024_change_this';
const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

function postChat(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request('http://localhost:5050/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function streamChat(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request('http://localhost:5050/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let buffer = '';
      let tokens = [];
      res.on('data', chunk => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const evt = JSON.parse(line.slice(6));
              if (evt.type === 'token') tokens.push(evt.token);
            } catch (e) {}
          }
        }
      });
      res.on('end', () => {
        resolve(tokens.join(''));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Japan trip question (NOT in uploaded document) ===');
  const res1 = await postChat({
    question: 'මගේ upload කරපු document එකේ, මම ලාස්ට් අවුරුද්දේ Japan trip එකකට වියදම් කරපු මුදල කීයද?',
    languagePreference: 'si'
  });
  console.log('Test 1 (POST):', res1.answer);
  const stream1 = await streamChat({
    question: 'මගේ upload කරපු document එකේ, මම ලාස්ට් අවුරුද්දේ Japan trip එකකට වියදම් කරපු මුදල කීයද?',
    languagePreference: 'si'
  });
  console.log('Test 1 (STREAM):', stream1);

  console.log('\n=== TEST 2: Factual question that IS in uploaded document ===');
  const res2 = await postChat({
    question: 'What is the personal tax relief under Inland Revenue Act according to the document?',
    languagePreference: 'en'
  });
  console.log('Test 2 (POST):', res2.answer);

  console.log('\n=== TEST 3: Financial Calculation Question ===');
  const calcQ = 'මට ඊළඟ අවුරුද්දේ Rs. 100,000ක් extra save කරගන්න ඕන, දැන් මම දවසකට Rs. 1,500ක් වියදම් කරනවා, මගේ මාසික income එක Rs. 70,000ක්, මම දවසකට කීයක් save කරන්න ඕනද කියලා ගණනය කරලා දෙන්න.';
  const res3 = await postChat({
    question: calcQ,
    languagePreference: 'si'
  });
  console.log('Test 3 (POST):', res3.answer);

  console.log('\n=== TEST 4: Follow-up Calculation Question (6 months) ===');
  const followUpQ = 'ඒක මාස 6කින් කරගන්න ඕන නම්?';
  const res4 = await postChat({
    question: followUpQ,
    languagePreference: 'si',
    history: [
      { role: 'user', content: calcQ },
      { role: 'assistant', content: res3.answer }
    ]
  });
  console.log('Test 4 (POST):', res4.answer);

  console.log('\n=== TEST 5: Legitimate Finance Snapshot Shortcut ===');
  const res5 = await postChat({
    question: 'give me my finance summary',
    languagePreference: 'en'
  });
  console.log('Test 5 (POST):', res5.answer);

  console.log('\n=== TEST 6: General Chat Greeting ===');
  const res6 = await postChat({
    question: 'hello',
    languagePreference: 'en'
  });
  console.log('Test 6 (POST):', res6.answer);
}

runTests().catch(console.error);
