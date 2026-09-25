const jwt = require('jsonwebtoken');
const fetch = globalThis.fetch;

const JWT_SECRET = 'cendric_super_secret_jwt_key_2024_change_this';
const token = jwt.sign({ id: 'd865d1bda5cd375cb3dd525b' }, JWT_SECRET, { expiresIn: '7d' });

async function run() {
  console.log('Using valid token for user Malith Sahan');

  // 1. Test updating language preference to 'si'
  const updateRes = await fetch('http://localhost:5050/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ languagePreference: 'si' })
  });
  const updateData = await updateRes.json();
  console.log('Profile lang preference updated to:', updateData.user?.languagePreference);

  // 2. Test chat streaming with default 'si' interface language and neutral query "USD exchange rate"
  const chatRes = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'USD exchange rate', languagePreference: 'si' })
  });

  const reader = chatRes.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullResponse += decoder.decode(value);
  }
  console.log('Sinhala Chat response:');
  console.log(fullResponse.slice(0, 300));
  console.log('Contains Sinhala script:', /[\u0D80-\u0DFF]/.test(fullResponse));

  // 3. Test chat streaming when user explicitly types in English while languagePreference is 'si'
  const chatResEn = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'What is my current net balance?', languagePreference: 'si' })
  });

  const readerEn = chatResEn.body.getReader();
  let fullResponseEn = '';
  while (true) {
    const { done, value } = await readerEn.read();
    if (done) break;
    fullResponseEn += decoder.decode(value);
  }
  console.log('Explicit English query response (should be English):');
  console.log(fullResponseEn.slice(0, 300));
  console.log('Contains English text:', fullResponseEn.includes('Balance') || fullResponseEn.includes('Income') || fullResponseEn.includes('Financial'));

  // 4. Test updating language preference to 'ta'
  const updateResTa = await fetch('http://localhost:5050/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ languagePreference: 'ta' })
  });
  const updateDataTa = await updateResTa.json();
  console.log('Profile lang preference updated to:', updateDataTa.user?.languagePreference);

  // 5. Test chat streaming with default 'ta' interface language and neutral query "USD exchange rate"
  const chatResTa = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'USD exchange rate', languagePreference: 'ta' })
  });

  const readerTa = chatResTa.body.getReader();
  let fullResponseTa = '';
  while (true) {
    const { done, value } = await readerTa.read();
    if (done) break;
    fullResponseTa += decoder.decode(value);
  }
  console.log('Tamil Chat response:');
  console.log(fullResponseTa.slice(0, 300));
  console.log('Contains Tamil script:', /[\u0B80-\u0BFF]/.test(fullResponseTa));
}

run().catch(console.error);
