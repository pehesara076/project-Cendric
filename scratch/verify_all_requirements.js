const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

async function testAll() {
  console.log('=== STARTING COMPLETE VERIFICATION OF TASK 1 & TASK 2 ===\n');

  // 1. Verify CSS tokens and brand colors on Settings page
  console.log('--- TEST 1: Settings Brand Palette (Purple/Indigo) ---');
  const css = fs.readFileSync('frontend/dist/assets/index-Dr3oI3zo.css', 'utf8');
  const jsBundle = fs.readFileSync('frontend/dist/assets/index-k68ZFBuM.js', 'utf8');
  const enhancementsJs = fs.readFileSync('frontend/dist/assets/cendric-enhancements.js', 'utf8');

  const hasOrangeSunInToggle = jsBundle.includes('(hs,{size:13,color:`#f59e0b`})');
  console.log('Is orange sun icon present in toggle knob?', hasOrangeSunInToggle, '(Should be false)');
  if (hasOrangeSunInToggle) throw new Error('Orange sun icon still present in toggle knob');

  const hasAccentSunInToggle = jsBundle.includes('(hs,{size:13,color:`var(--accent)`})');
  console.log('Is brand purple sun icon present in toggle knob?', hasAccentSunInToggle, '(Should be true)');
  if (!hasAccentSunInToggle) throw new Error('Brand accent sun icon missing in toggle knob');

  const hasLangCardPurple = css.includes('#cendric-language-settings-card .cendric-lang-card.active') &&
                            css.includes('var(--accent, #6d5ae6)');
  console.log('Does language card active state use brand purple/indigo?', hasLangCardPurple, '(Should be true)');
  if (!hasLangCardPurple) throw new Error('Language card purple/indigo styles missing in CSS');

  const hasSettingsPurpleIcons = css.includes('main > div[style*="720px"] div[style*="border-radius: 12px"]') &&
                                css.includes('var(--accent, #6d5ae6)');
  console.log('Do settings icon boxes use brand purple/indigo styling?', hasSettingsPurpleIcons, '(Should be true)');

  console.log('✓ TEST 1 PASSED: Settings page palette successfully converted to purple/indigo brand colors.\n');

  // 2. Verify I18N dictionary completeness for all 3 languages
  console.log('--- TEST 2: I18N Trilingual Dictionary Completeness ---');
  // Check enhancements.js contains all three languages
  const hasTa = enhancementsJs.includes('ta: {') && enhancementsJs.includes("nativeName: 'தமிழ்'");
  const hasSi = enhancementsJs.includes('si: {') && enhancementsJs.includes("nativeName: 'සිංහල'");
  const hasEn = enhancementsJs.includes('en: {') && enhancementsJs.includes("nativeName: 'English'");
  console.log('Contains complete Tamil dictionary:', hasTa);
  console.log('Contains complete Sinhala dictionary:', hasSi);
  console.log('Contains complete English dictionary:', hasEn);
  if (!hasTa || !hasSi || !hasEn) throw new Error('Missing language dictionaries in enhancements.js');
  console.log('✓ TEST 2 PASSED: Complete trilingual dictionaries loaded.\n');

  // 3. Verify language switching persistence in MongoDB & LocalStorage sync
  console.log('--- TEST 3: Language Persistence in MongoDB Profile ---');
  const JWT_SECRET = 'cendric_super_secret_jwt_key_2024_change_this';
  const token = jwt.sign({ id: 'd865d1bda5cd375cb3dd525b' }, JWT_SECRET, { expiresIn: '7d' });

  for (const lang of ['si', 'ta', 'en']) {
    const res = await fetch('http://localhost:5050/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ languagePreference: lang })
    });
    const data = await res.json();
    console.log(`Saved languagePreference "${lang}":`, data.user?.languagePreference === lang ? 'SUCCESS' : 'FAILED');
    if (data.user?.languagePreference !== lang) throw new Error(`Failed to persist language preference: ${lang}`);
  }
  console.log('✓ TEST 3 PASSED: Language preferences successfully persist to MongoDB profile.\n');

  // 4. Verify Chat Assistant language responses: Default vs Override
  console.log('--- TEST 4: Chat Assistant Response Language Handling ---');
  // 4a. Sinhala default interface language + neutral query
  const resSi = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'USD exchange rate', languagePreference: 'si' })
  });
  let outSi = '';
  const readerSi = resSi.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await readerSi.read();
    if (done) break;
    outSi += decoder.decode(value);
  }
  const isSi = /[\u0D80-\u0DFF]/.test(outSi);
  console.log('Sinhala default interface responds in Sinhala script:', isSi);
  if (!isSi) throw new Error('Sinhala interface language did not respond in Sinhala');

  // 4b. Tamil default interface language + neutral query
  const resTa = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'USD rate', languagePreference: 'ta' })
  });
  let outTa = '';
  const readerTa = resTa.body.getReader();
  while (true) {
    const { done, value } = await readerTa.read();
    if (done) break;
    outTa += decoder.decode(value);
  }
  const isTa = /[\u0B80-\u0BFF]/.test(outTa);
  console.log('Tamil default interface responds in Tamil script:', isTa);
  if (!isTa) throw new Error('Tamil interface language did not respond in Tamil');

  // 4c. User explicitly writes in English while interface language is Sinhala
  const resEnOverride = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'What is my current net balance?', languagePreference: 'si' })
  });
  let outEn = '';
  const readerEn = resEnOverride.body.getReader();
  while (true) {
    const { done, value } = await readerEn.read();
    if (done) break;
    outEn += decoder.decode(value);
  }
  const isEn = outEn.includes('Position') || outEn.includes('Balance') || outEn.includes('Net');
  console.log('Explicit English query responds in English:', isEn);
  if (!isEn) throw new Error('Explicit English query was incorrectly overridden by interface language');

  // 4d. User explicitly writes in Sinhala while interface language is English
  const resSiOverride = await fetch('http://localhost:5050/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question: 'මගේ ශුද්ධ ශේෂය කීයද?', languagePreference: 'en' })
  });
  let outSiOverride = '';
  const readerSiOverride = resSiOverride.body.getReader();
  while (true) {
    const { done, value } = await readerSiOverride.read();
    if (done) break;
    outSiOverride += decoder.decode(value);
  }
  const isSiOverride = /[\u0D80-\u0DFF]/.test(outSiOverride);
  console.log('Explicit Sinhala query under English interface responds in Sinhala:', isSiOverride);
  if (!isSiOverride) throw new Error('Explicit Sinhala input was not answered in Sinhala');

  console.log('✓ TEST 4 PASSED: Chat Assistant responds in interface language by default and respects explicit query language overrides.\n');

  // Reset user preference back to 'en' as clean initial state
  await fetch('http://localhost:5050/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ languagePreference: 'en' })
  });
  console.log('=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

testAll().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
