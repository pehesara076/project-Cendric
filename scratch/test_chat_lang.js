const fetch = globalThis.fetch;

async function run() {
  // Test login to get token
  const loginRes = await fetch('http://localhost:5050/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login success:', !!loginData.token);
  const token = loginData.token;

  // Test updating language preference to 'si'
  const updateRes = await fetch('http://localhost:5050/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ languagePreference: 'si' })
  });
  const updateData = await updateRes.json();
  console.log('Profile lang preference updated to:', updateData.user?.languagePreference);

  // Test chat streaming with default 'si' interface language and neutral query
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
  console.log('Chat response length:', fullResponse.length);
  console.log('Contains Sinhala script:', /[\u0D80-\u0DFF]/.test(fullResponse));

  // Test updating language preference to 'ta'
  const updateResTa = await fetch('http://localhost:5050/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ languagePreference: 'ta' })
  });
  const updateDataTa = await updateResTa.json();
  console.log('Profile lang preference updated to:', updateDataTa.user?.languagePreference);

  // Test chat streaming with default 'ta' interface language and neutral query
  const chatResTa = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'USD rate', languagePreference: 'ta' })
  });

  const readerTa = chatResTa.body.getReader();
  let fullResponseTa = '';
  while (true) {
    const { done, value } = await readerTa.read();
    if (done) break;
    fullResponseTa += decoder.decode(value);
  }
  console.log('Tamil Chat response length:', fullResponseTa.length);
  console.log('Contains Tamil script:', /[\u0B80-\u0BFF]/.test(fullResponseTa));
}

run().catch(console.error);
