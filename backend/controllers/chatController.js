const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chat, Transaction } = require('../models');
const { isMongoDBConnected } = require('../config/db');
const { db, saveDB } = require('../utils/localDB');
const ragService = require('../services/ragService');
const currencyService = require('../services/currencyService');
const calculationService = require('../services/calculationService');
const { detectResponseLanguage } = calculationService;
const { toUserQuery } = require('../utils/dbHelper');

// Helper: generate contextual follow-up question suggestions
function generateFollowUps(question, answer, lang = 'en') {
  if (lang === 'ta') {
    return [
      'எனது நிகர இருப்பு என்ன?',
      'வரி விலக்குகளை எவ்வாறு பெறுவது?',
      'எனது முக்கிய செலவு வகைகளைக் காட்டு'
    ];
  }
  if (lang === 'si') {
    return [
      'මගේ ශුද්ධ ශේෂය කුමක්ද?',
      'බදු සහන ලබා ගන්නේ කෙසේද?',
      'මගේ ප්‍රධාන වියදම් කාණ්ඩ පෙන්වන්න'
    ];
  }
  const q = (question || '').toLowerCase();
  if (q.includes('balance') || q.includes('net') || q.includes('savings')) {
    return ['What are my biggest expenses?', 'How can I improve my savings?', 'Show spending by category'];
  }
  if (q.includes('tax') || q.includes('apit') || q.includes('ird') || q.includes('income tax')) {
    return ['When is the APIT filing deadline?', 'Are Upwork earnings taxable in Sri Lanka?', 'How do I get a TIN number?'];
  }
  if (q.includes('expense') || q.includes('spend') || q.includes('spent') || q.includes('cost')) {
    return ["What's my current net balance?", 'How much income did I earn?', 'Am I over my monthly budget?'];
  }
  if (q.includes('budget')) {
    return ["What's my daily burn rate?", 'Top 3 spending categories?', 'How much is remaining in budget?'];
  }
  if (q.includes('currency') || q.includes('exchange') || q.includes('usd') || q.includes('dollar')) {
    return ['What is my total USD income?', 'Calculate LKR equivalent of EUR 1000', 'Are foreign earnings fully exempt?'];
  }
  if (q.includes('invoice') || q.includes('client') || q.includes('payment')) {
    return ['How do I record this as income?', 'What tax applies to client invoices?', 'Show my recent transactions'];
  }
  return ["What's my net balance?", 'Give me financial tips', 'Show my expense breakdown'];
}

// 1. Calculation Intent Check
function isCalculationQuery(text, history = []) {
  return calculationService.isCalculationIntent(text, history);
}

// 2. Document / RAG Query Check
function isDocumentQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const q = text.toLowerCase().trim();

  const docKeywords = [
    'document', 'doc', 'pdf', 'upload කරපු', 'upload කල', 'upload කරපු document',
    'document එකේ', 'ඩොකියුමන්ට්', 'ලියකියවිලි', 'ගොනු', 'ගොනුව', 'file', 'uploaded',
    'ஆவணம்', 'பதிவேற்றிய', 'படிவம்',
    'inland revenue act', 'act no', 'schedule', 'inland revenue', 'ramis',
    'වගන්තිය', 'පනත', 'දේශීය ආදායම්'
  ];

  return docKeywords.some(kw => q.includes(kw));
}

// 3. Finance Snapshot Query Check (Explicit request for summary only)
function isFinanceSnapshotQuery(text) {
  if (!text || typeof text !== 'string') return false;
  const q = text.toLowerCase().trim();

  return (
    q.includes('finance summary') ||
    q.includes('financial summary') ||
    q.includes('finance snapshot') ||
    q.includes('financial snapshot') ||
    q.includes('financial overview') ||
    q.includes('summary of my finances') ||
    q.includes('overview of my finances') ||
    q.includes('give me my finance summary') ||
    q.includes('give me my financial summary') ||
    q.includes('මගේ මූල්‍ය සාරාංශය') ||
    q.includes('මූල්‍ය සාරාංශය') ||
    q.includes('මගේ සාරාංශය') ||
    q.includes('நிதி சுருக்கம்') ||
    q.includes('நிதி கண்ணோட்டம்')
  );
}

// Build Finance Snapshot response
function buildFinanceSnapshot({ currency, netBalance, totalIncome, totalExpense, userTx, topCats, userLang, userName }) {
  if (userLang === 'si') {
    return `🤖 **ඔබගේ මූල්‍ය සාරාංශය:**\n\n• **ශුද්ධ ශේෂය:** ${currency} ${netBalance.toLocaleString()}\n• **මුළු ආදායම:** ${currency} ${totalIncome.toLocaleString()} · **මුළු වියදම:** ${currency} ${totalExpense.toLocaleString()}\n${topCats.length ? `\n**ප්‍රධාන වියදම් ප්‍රවර්ග:**\n${topCats.map(([c,v])=>`• ${c}: ${currency} ${v.toLocaleString()}`).join('\n')}` : ''}\n\n💬 උත්සාහ කරන්න: *"මගේ ශුද්ධ ශේෂය කොපමණද?"*, *"අද USD විනිමය අනුපාතය කුමක්ද?"*, හෝ *"ආදායම් බදු ගණනය කරන්න"*`;
  }
  if (userLang === 'ta') {
    return `🤖 **உங்கள் நிதி கண்ணோட்டம்:**\n\n• **நிகர இருப்பு:** ${currency} ${netBalance.toLocaleString()}\n• **மொத்த வருமானம்:** ${currency} ${totalIncome.toLocaleString()} · **மொத்த செலவுகள்:** ${currency} ${totalExpense.toLocaleString()}\n${topCats.length ? `\n**முக்கிய செலவு வகைகள்:**\n${topCats.map(([c,v])=>`• ${c}: ${currency} ${v.toLocaleString()}`).join('\n')}` : ''}\n\n💬 முயற்சிக்கவும்: *"எனது நிகர இருப்பு என்ன?"*, *"இன்றைய USD மாற்று விகிதம் என்ன?"*, அல்லது *"வரி மதிப்பீடு செய்க"*`;
  }
  return `🤖 **Your Financial Snapshot:**\n\n• **Net Balance:** ${currency} ${netBalance.toLocaleString()}\n• **Income:** ${currency} ${totalIncome.toLocaleString()} · **Expenses:** ${currency} ${totalExpense.toLocaleString()}\n${topCats.length ? `\n**Top expense categories:**\n${topCats.map(([c,v])=>`• ${c}: ${currency} ${v.toLocaleString()}`).join('\n')}` : ''}\n\n💬 Try: *"How much did I spend on Food?"*, *"What's the USD exchange rate?"*, or *"Calculate my income tax"*`;
}

// Calculation Handler
async function handleCalculationQuery({ q, history, userLang, apiKey, targetModel, userDbFinancials }) {
  const effectiveLang = detectResponseLanguage(q, userLang);
  const params = await calculationService.extractCalculationParameters(q, history, userDbFinancials, apiKey, targetModel);

  if (!params.savingsGoal) {
    if (effectiveLang === 'si') {
      return 'ඔබට අමතරව ඉතිරි කර ගැනීමට අවශ්‍ය ඉලක්කගත මුදල (Savings Goal) කීයද? (උදා: Rs. 100,000)';
    }
    if (effectiveLang === 'ta') {
      return 'நீங்கள் சேமிக்க விரும்பும் இலக்குத் தொகை எவ்வளவு? (எ.கா: Rs. 100,000)';
    }
    return 'What is your target savings goal amount? (e.g. Rs. 100,000)';
  }

  if (!params.timePeriodDays) {
    if (effectiveLang === 'si') {
      return 'ඔබ මෙම මුදල ඉතිරි කර ගැනීමට බලාපොරොත්තු වන්නේ කොපමණ කාලයකින්ද? (උදා: මාස 6කින්, අවුරුද්දකින්)';
    }
    if (effectiveLang === 'ta') {
      return 'இதை எத்தனை நாட்களில் அல்லது மாதங்களில் சேமிக்க விரும்புகிறீர்கள்? (எ.கா: 6 மாதங்கள், 1 வருடம்)';
    }
    return 'Over what time period would you like to save this? (e.g., 6 months, 1 year)';
  }

  const plan = calculationService.calculateSavingsPlan(params);
  return await calculationService.generateSavingsExplanation(plan, effectiveLang, q, apiKey, targetModel);
}

// Non-streaming RAG Handler
async function handleRagQuery({ q, retrievedLaws, userLang, apiKey, targetModel, userFinancials }) {
  const effectiveLang = detectResponseLanguage(q, userLang);
  const isContextRelevant = retrievedLaws && retrievedLaws.length > 0 && (retrievedLaws[0].relevanceScore >= 0.15);
  const contextChunks = isContextRelevant
    ? retrievedLaws.map(doc => `[${doc.title} - ${doc.act} (${doc.section})]:\n${doc.content}`).join('\n\n')
    : '[No relevant context was found for this question]';

  let defaultNotFound = "I don't have that information in the provided documents.";
  let langInstruction = '';
  if (effectiveLang === 'si') {
    defaultNotFound = "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත.";
    langInstruction = '\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Sinhala script (සිංහල). If the answer cannot be found in the Context, respond in Sinhala: "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත."';
  } else if (effectiveLang === 'ta') {
    defaultNotFound = "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை.";
    langInstruction = '\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Tamil script (தமிழ்). If the answer cannot be found in the Context, respond in Tamil: "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை."';
  }

  if (apiKey && apiKey !== 'your_key_here' && apiKey.length > 15) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: targetModel,
        generationConfig: {
          temperature: 0.2, // Lowered strictly to 0.1 - 0.3 for grounded RAG answers
          maxOutputTokens: 600
        }
      });

      const ragPrompt = `Context:
${contextChunks}

Question:
${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
${langInstruction}
If the answer cannot be found in the Context, respond exactly with:
"${defaultNotFound}"`;

      const result = await model.generateContent(ragPrompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.warn('[Gemini RAG Query Warning]', err.message);
    }
  }

  if (!isContextRelevant) {
    return defaultNotFound;
  }

  return ragService.generateAuthoritativeAnswer(q, retrievedLaws, userFinancials) || retrievedLaws[0].content;
}

// Streaming RAG Handler
async function streamRagQuery({ q, retrievedLaws, userLang, apiKey, targetModel, userFinancials, sendEvent, streamWords }) {
  const effectiveLang = detectResponseLanguage(q, userLang);
  const isContextRelevant = retrievedLaws && retrievedLaws.length > 0 && (retrievedLaws[0].relevanceScore >= 0.15);
  const contextChunks = isContextRelevant
    ? retrievedLaws.map(doc => `[${doc.title} - ${doc.act} (${doc.section})]:\n${doc.content}`).join('\n\n')
    : '[No relevant context was found for this question]';

  let defaultNotFound = "I don't have that information in the provided documents.";
  let langInstruction = '';
  if (effectiveLang === 'si') {
    defaultNotFound = "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත.";
    langInstruction = '\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Sinhala script (සිංහල). If the answer cannot be found in the Context, respond in Sinhala: "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත."';
  } else if (effectiveLang === 'ta') {
    defaultNotFound = "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை.";
    langInstruction = '\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Tamil script (தமிழ்). If the answer cannot be found in the Context, respond in Tamil: "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை."';
  }

  if (apiKey && apiKey !== 'your_key_here' && apiKey.length > 15) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: targetModel,
        generationConfig: {
          temperature: 0.2, // Lowered strictly to 0.1 - 0.3 for grounded RAG answers
          maxOutputTokens: 600
        }
      });

      const ragPrompt = `Context:
${contextChunks}

Question:
${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
${langInstruction}
If the answer cannot be found in the Context, respond exactly with:
"${defaultNotFound}"`;

      const result = await model.generateContentStream(ragPrompt);
      let fullText = '';
      for await (const chunk of result.stream) {
        const token = chunk.text();
        fullText += token;
        sendEvent({ type: 'token', token });
      }
      if (fullText.trim()) return fullText.trim();
    } catch (err) {
      console.warn('[Gemini RAG Stream Warning]', err.message);
    }
  }

  const fallbackAns = !isContextRelevant 
    ? defaultNotFound 
    : (ragService.generateAuthoritativeAnswer(q, retrievedLaws, userFinancials) || retrievedLaws[0].content);

  await streamWords(fallbackAns);
  return fallbackAns;
}


// Unified Rule-Based Response Generator for Financial Queries & Suggested Questions
function buildRuleBasedResponse({ q, effectiveLang, userName, currency, totalIncome, totalExpense, netBalance, categoryTotals, userTx, topCats, r }) {
  const qLow = q.toLowerCase().trim();

  // 1. Tamil Localization
  if (effectiveLang === 'ta') {
    if (qLow.match(/மாற்று விகிதம்|rate|usd|exchange|டாலர்/)) {
      return `💱 **நேரடி நாணய மாற்று விகிதங்கள் (API நேரலை):**\n\n• **1 USD** = **${r.LKR?.toFixed(2)} LKR**\n• **1 EUR** = **${(r.LKR/r.EUR)?.toFixed(2)} LKR**\n• **1 GBP** = **${(r.LKR/r.GBP)?.toFixed(2)} LKR**\n• **1 INR** = **${(r.LKR/r.INR)?.toFixed(2)} LKR**\n• **1 AUD** = **${(r.LKR/r.AUD)?.toFixed(2)} LKR**\n\n*ஆதாரம்: Open Exchange Rates API · நேரலை*`;
    }
    if (qLow.match(/வரி|tax|apit|ird|வருமான வரி|கழிவு/)) {
      const calc = ragService.calculateSriLankanTax(totalIncome, Math.min(totalIncome * 0.4, totalExpense));
      return `🇱🇰 **உங்கள் வருமானத்திற்கான இலங்கை வரி மதிப்பீடு:**\n\n• **மொத்த வருமானம்:** ${currency} ${totalIncome.toLocaleString()}\n• **அனுமதிக்கப்பட்ட கழிவுகள்:** -${currency} ${calc.allowableDeductions.toLocaleString()}\n• **வரி இல்லாத தனிநபர் சலுகை:** -${currency} 1,200,000\n• **வரிக்குட்பட்ட வருமானம்:** ${currency} ${calc.taxableIncome.toLocaleString()}\n\n${calc.taxableIncome <= 0 ? '🎉 **வரி செலுத்த தேவையில்லை!** உங்கள் வருமானம் LKR 1,200,000 வரம்பிற்குள் உள்ளது.' : `**மதிப்பிடப்பட்ட வரி:** **${currency} ${calc.totalTax.toLocaleString()}** (செயல்திறன் விகிதம்: ${calc.effectiveRate})\n• **காலாண்டு APIT தவணை:** ~${currency} ${Math.round(calc.totalTax / 4).toLocaleString()} / காலாண்டு`}\n\n> 💡 *IT/மென்பொருள் ஏற்றுமதி மூலம் பெறப்படும் வெளிநாட்டு நாணய வருமானம் Inland Revenue Act Schedule 3 இன் கீழ் முழு வரி விலக்கு பெறலாம்.*`;
    }
    if (qLow.match(/செலவு|செலவுகள்|spend|expense|வகைகள்|பகுப்பாய்வு/)) {
      return `📊 **உங்கள் செலவு பகுப்பாய்வு:**\n\n• **மொத்த செலவுகள்:** ${currency} ${totalExpense.toLocaleString()} (${userTx.filter(t=>t.type==='expense').length} பரிவர்த்தனைகள்)\n• **மொத்த வருமானம்:** ${currency} ${totalIncome.toLocaleString()}\n• **நிகர இருப்பு:** ${currency} ${netBalance.toLocaleString()}\n\n**முக்கிய செலவு வகைகள்:**\n${topCats.length ? topCats.map(([c,v])=>`• ${c}: ${currency} ${v.toLocaleString()} (${totalExpense > 0 ? ((v/totalExpense)*100).toFixed(1) : 0}%)`).join('\n') : '• செலவு வகைகள் எதுவும் பதிவு செய்யப்படவில்லை.'}`;
    }
    if (qLow.match(/இருப்பு|மீதி|balance|சேமிப்பு/)) {
      return `💼 **உங்கள் நிதி நிலைமை:**\n\n• **நிகர இருப்பு:** ${currency} ${netBalance.toLocaleString()}\n• **மொத்த வருமானம்:** ${currency} ${totalIncome.toLocaleString()} (${userTx.filter(t=>t.type==='income').length} பரிவர்த்தனைகள்)\n• **மொத்த செலவுகள்:** ${currency} ${totalExpense.toLocaleString()} (${userTx.filter(t=>t.type==='expense').length} பரிவர்த்தனைகள்)\n\n${netBalance >= 0 ? '🎉 நீங்கள் **நேர்மறை பணப்புழக்கத்தில் (Positive Cash Flow)** உள்ளீர்கள்!' : '⚠️ உங்கள் செலவுகள் வருமானத்தை விட அதிகமாக உள்ளன. கவனமாக திட்டமிடுங்கள்.'}`;
    }
    if (qLow.match(/ஆலோசனை|tips|நிதி ஆலோசனை|உதவி/)) {
      return `💡 **சுயாதீனர்களுக்கான Cendric நிதி ஆலோசனைகள்:**\n\n1. **50/30/20 விதி** — 50% அத்தியாவசிய தேவைகள், 30% விருப்பங்கள், 20% சேமிப்பு/முதலீடு\n2. **அவசர நிதி** — 3–6 மாத செலவுகளுக்கான சேமிப்பை தயாராக வைத்திருங்கள்\n3. **வரி ஒதுக்கீடு** — ஒவ்வொரு வருமானத்திலிருந்தும் 20–25% வரிக்காக ஒதுக்குங்கள்\n4. **ரசீதுகளைப் பதிவு செய்யுங்கள்** — வரி கழிவுகளைப் பெற ரசீதுகளை உடனுக்குடன் பதிவு செய்யுங்கள்\n5. **USD இல் விலைப்பட்டியல் அனுப்புங்கள்** — IT ஏற்றுமதி வருமானத்திற்கு இலங்கையில் முழு வரி விலக்கு உண்டு`;
    }
    if (qLow.match(/வருமானம்|income|earn/)) {
      const incTx = userTx.filter(t => t.type === 'income');
      return `💰 **வருமான சுருக்கம்:**\n\n• **மொத்த வருமானம்:** ${currency} ${totalIncome.toLocaleString()}\n• **பரிவர்த்தனைகள்:** ${incTx.length}\n• **சராசரி:** ${currency} ${incTx.length ? (totalIncome/incTx.length).toFixed(0) : 0}\n\nசெலவுகளுக்குப் பிந்தைய நிகர இருப்பு **${currency} ${netBalance.toLocaleString()}** ஆகும்.`;
    }
    if (qLow.match(/வணக்கம்|ஹலோ|hello|hi/)) {
      return `👋 வணக்கம் **${userName}**! நான் **Cendric**, உங்கள் AI நிதி ஆலோசகர்.\n\nஉங்களிடம் தற்போது **${userTx.length}** பரிவர்த்தனைகளும், **${currency} ${netBalance.toLocaleString()}** நிகர இருப்பும் உள்ளது.\n\n💬 உங்கள் செலவுகள், இலங்கை வரிச் சட்டங்கள் அல்லது நேரடி மாற்று விகிதங்கள் பற்றி என்னிடம் கேளுங்கள்!`;
    }
    return `💡 **${userName}**, உங்களுக்கு உதவ நான் தயாராக உள்ளேன். நீங்கள் கேட்கலாம்:\n• *"எனது நிகர இருப்பு என்ன?"* (இருப்பு: **${currency} ${netBalance.toLocaleString()}**)\n• *"செலவு வகைகள்"* (மொத்த செலவு: **${currency} ${totalExpense.toLocaleString()}**)\n• *"USD மாற்று விகிதம்"*\n• *"வருமான வரி கணக்கிடுங்கள்"*`;
  }

  // 2. Sinhala Localization
  if (effectiveLang === 'si') {
    if (qLow.match(/විනිමය|rate|usd|exchange|ඩොලර්/)) {
      return `💱 **සජීවී විනිමය අනුපාත (API සජීවී):**\n\n• **1 USD** = **${r.LKR?.toFixed(2)} LKR**\n• **1 EUR** = **${(r.LKR/r.EUR)?.toFixed(2)} LKR**\n• **1 GBP** = **${(r.LKR/r.GBP)?.toFixed(2)} LKR**\n• **1 INR** = **${(r.LKR/r.INR)?.toFixed(2)} LKR**\n• **1 AUD** = **${(r.LKR/r.AUD)?.toFixed(2)} LKR**\n\n*මූලාශ්‍රය: Open Exchange Rates API · සජීවී*`;
    }
    if (qLow.match(/බදු|tax|apit|ird|ආදායම් බදු|අඩුකිරීම්/)) {
      const calc = ragService.calculateSriLankanTax(totalIncome, Math.min(totalIncome * 0.4, totalExpense));
      return `🇱🇰 **ඔබගේ ආදායම සඳහා ශ්‍රී ලංකා බදු තක්සේරුව:**\n\n• **මුළු ආදායම:** ${currency} ${totalIncome.toLocaleString()}\n• **අනුමත අඩුකිරීම්:** -${currency} ${calc.allowableDeductions.toLocaleString()}\n• **බදු රහිත සහනය:** -${currency} 1,200,000\n• **බදු අයවිය හැකි ආදායම:** ${currency} ${calc.taxableIncome.toLocaleString()}\n\n${calc.taxableIncome <= 0 ? '🎉 **බදු ගෙවීමට අවශ්‍ය නැත!** ඔබගේ ආදායම LKR 1,200,000 සීමාවට වඩා අඩුය.' : `**ඇස්තමේන්තුගත බද්ද:** **${currency} ${calc.totalTax.toLocaleString()}** (ඵලදායී අනුපාතය: ${calc.effectiveRate})\n• **කාර්තුමය APIT වාරිකය:** ~${currency} ${Math.round(calc.totalTax / 4).toLocaleString()} / කාර්තුව`}\n\n> 💡 *තොරතුරු තාක්ෂණ හෝ මෘදුකාංග අපනයන සේවා ආදායම දේශීය ආදායම් පනත යටතේ සම්පූර්ණ බදු නිදහස් වේ.*`;
    }
    if (qLow.match(/වියදම|වියදම්|spend|expense|කොපමණ.*වියදම්|ප්‍රවර්ග|බිඳවැටීම/)) {
      return `📊 **ඔබගේ වියදම් විස්තරය:**\n\n• **මුළු වියදම:** ${currency} ${totalExpense.toLocaleString()} (ගනුදෙනු ${userTx.filter(t=>t.type==='expense').length})\n• **මුළු ආදායම:** ${currency} ${totalIncome.toLocaleString()}\n• **ශුද්ධ ශේෂය:** ${currency} ${netBalance.toLocaleString()}\n\n**ප්‍රධාන වියදම් ප්‍රවර්ග:**\n${topCats.length ? topCats.map(([c,v])=>`• ${c}: ${currency} ${v.toLocaleString()} (${totalExpense > 0 ? ((v/totalExpense)*100).toFixed(1) : 0}%)`).join('\n') : '• තවමත් වියදම් ප්‍රවර්ග සටහන් කර නොමැත.'}`;
    }
    if (qLow.match(/ශේෂය|balance|මුදල්|ඉතිරි|මුදල් තත්ත්වය/)) {
      return `💼 **ඔබගේ මූල්‍ය තත්ත්වය:**\n\n• **ශුද්ධ ශේෂය:** ${currency} ${netBalance.toLocaleString()}\n• **මුළු ආදායම:** ${currency} ${totalIncome.toLocaleString()} (ගනුදෙනු ${userTx.filter(t=>t.type==='income').length})\n• **මුළු වියදම:** ${currency} ${totalExpense.toLocaleString()} (ගනුදෙනු ${userTx.filter(t=>t.type==='expense').length})\n\n${netBalance >= 0 ? '🎉 ඔබ **ධනාත්මක මුදල් ප්‍රවාහයක (Positive Cash Flow)** සිටී!' : '⚠️ ඔබගේ වියදම් ආදායමට වඩා වැඩිය. කරුණාකර සැලකිලිමත් වන්න.'}`;
    }
    if (qLow.match(/උපදෙස්|tips|මූල්‍ය උපදෙස්|උපදෙස් ලබා/)) {
      return `💡 **නිදහස් වෘත්තිකයන් සඳහා Cendric මූල්‍ය උපදෙස්:**\n\n1. **50/30/20 රීතිය** — 50% අත්‍යවශ්‍ය වියදම්, 30% ජීවන රටාව, 20% ඉතිරිකිරීම්/ආයෝජන\n2. **හදිසි අරමුදල** — මාස 3–6 ක වියදම් සඳහා ඉතිරි කිරීමේ ගිණුමක් පවත්වා ගන්න\n3. **බදු වෙන්කිරීම** — ලැබෙන සෑම ගෙවීමකින්ම 20–25% ක් APIT බදු සඳහා වෙන් කරන්න\n4. **සෑම රිසිට්පතක්ම සටහන් කරන්න** — බදු අඩු කිරීම් ලබා ගැනීමට රිසිට්පත් ස්කෑන් කර තබා ගන්න\n5. **USD වලින් ඉන්වොයිස් කරන්න** — තොරතුරු තාක්ෂණ අපනයන ආදායම ශ්‍රී ලංකාවේ බදුවලින් නිදහස් වේ`;
    }
    if (qLow.match(/ආදායම|income|earn|ලැබුණු/)) {
      const incTx = userTx.filter(t => t.type === 'income');
      return `💰 **ආදායම් සාරාංශය:**\n\n• **මුළු ආදායම:** ${currency} ${totalIncome.toLocaleString()}\n• **ගනුදෙනු ගණන:** ${incTx.length}\n• **සාමාන්‍යය:** ${currency} ${incTx.length ? (totalIncome/incTx.length).toFixed(0) : 0}\n\nවියදම් වලින් පසු ඔබගේ ශුද්ධ ශේෂය **${currency} ${netBalance.toLocaleString()}** වේ.`;
    }
    if (qLow.match(/අයවැය|budget|දෛනික/)) {
      const dailyBurn = totalExpense > 0 ? Math.round(totalExpense / 30) : 0;
      return `🎯 **අයවැය විශ්ලේෂණය:**\n\n• **සාමාන්‍ය දෛනික වියදම:** ${currency} ${dailyBurn.toLocaleString()} / දිනකට\n• **මුළු වියදම:** ${currency} ${totalExpense.toLocaleString()}\n• **මුළු ආදායම:** ${currency} ${totalIncome.toLocaleString()}`;
    }
    if (qLow.match(/ආයුබෝවන්|hello|hi/)) {
      return `👋 ආයුබෝවන් **${userName}**! මම **Cendric**, ඔබගේ AI මූල්‍ය උපදේශක.\n\nඔබ සතුව මේ වන විට ගනුදෙනු **${userTx.length}** ක් සහ **${currency} ${netBalance.toLocaleString()}** ක ශුද්ධ ශේෂයක් පවතී.\n\n💬 ඔබගේ වියදම්, ශ්‍රී ලංකා බදු නීති හෝ සජීවී විනිමය අනුපාත පිළිබඳව මගෙන් විමසන්න!`;
    }
    return `💡 **${userName}**, ඔබට සහය වීමට මම සූදානම්. ඔබට විමසිය හැක:\n• *"මගේ ශුද්ධ ශේෂය කොපමණද?"* (වත්මන් ශේෂය: **${currency} ${netBalance.toLocaleString()}**)\n• *"වියදම් ප්‍රවර්ග පෙන්වන්න"* (මුළු වියදම: **${currency} ${totalExpense.toLocaleString()}**)\n• *"USD විනිමය අනුපාතය"*\n• *"ආදායම් බදු ගණනය කරන්න"*`;
  }

  // 3. English & Default (Grounded in Real User Financials)
  if (qLow.match(/exchange rate|usd|currency rate|rates today|dollar|eur|gbp|inr|aud|cad/)) {
    return `💱 **Live Exchange Rates (API Synchronized):**\n\n• **1 USD** = **${r.LKR?.toFixed(2)} LKR**\n• **1 EUR** = **${(r.LKR/r.EUR)?.toFixed(2)} LKR**\n• **1 GBP** = **${(r.LKR/r.GBP)?.toFixed(2)} LKR**\n• **1 INR** = **${(r.LKR/r.INR)?.toFixed(2)} LKR**\n• **1 AUD** = **${(r.LKR/r.AUD)?.toFixed(2)} LKR**\n\n*Source: Open Exchange Rates API · Live*`;
  }

  if (qLow.match(/tax|apit|ird|taxable|deduct|tin\b|deadline|upwork.*tax/)) {
    const calc = ragService.calculateSriLankanTax(totalIncome, Math.min(totalIncome * 0.4, totalExpense));
    return `🇱🇰 **Sri Lankan Tax Assessment for Your Income**\n\n` +
      `• **Gross Income:** ${currency} ${totalIncome.toLocaleString()}\n` +
      `• **Allowable Deductions:** -${currency} ${calc.allowableDeductions.toLocaleString()}\n` +
      `• **Tax-Free Personal Relief:** -${currency} 1,200,000\n` +
      `• **Taxable Income:** ${currency} ${calc.taxableIncome.toLocaleString()}\n\n` +
      (calc.taxableIncome <= 0
        ? `🎉 **Zero Tax Payable!** Your net earnings are below the LKR 1,200,000 relief threshold.`
        : `**Total Estimated Tax Payable:** **${currency} ${calc.totalTax.toLocaleString()}** (Effective rate: ${calc.effectiveRate})\n` +
          `• **Quarterly APIT Installment:** ~${currency} ${Math.round(calc.totalTax / 4).toLocaleString()} / quarter\n\n` +
          `> 💡 *If this is foreign currency income from IT/software export, it may qualify for full exemption under the Third Schedule of the Inland Revenue Act.*`);
  }

  if (qLow.match(/expense|spend|spent|spending|cost|breakdown|category|categories|biggest expense/)) {
    let matchedCat = null;
    for (const cat of Object.keys(categoryTotals)) {
      if (qLow.includes(cat.toLowerCase())) { matchedCat = cat; break; }
    }
    if (matchedCat) {
      return `📊 You spent **${currency} ${categoryTotals[matchedCat].toLocaleString()}** on **${matchedCat}**.\n\nThat's **${totalExpense > 0 ? ((categoryTotals[matchedCat]/totalExpense)*100).toFixed(1) : 0}%** of your total expenses.`;
    }
    const expenseTxCount = userTx.filter(t => t.type === 'expense').length;
    return `📊 **Your Expense Breakdown:**\n\n` +
      `• **Total Expenses:** ${currency} ${totalExpense.toLocaleString()} (${expenseTxCount} transactions)\n` +
      `• **Total Income:** ${currency} ${totalIncome.toLocaleString()}\n` +
      `• **Net Balance:** ${currency} ${netBalance.toLocaleString()}\n\n` +
      `**Top Spending Categories:**\n` +
      (topCats.length > 0
        ? topCats.map(([c, v]) => `• **${c}:** ${currency} ${v.toLocaleString()} (${totalExpense > 0 ? ((v / totalExpense) * 100).toFixed(1) : 0}%)`).join('\n')
        : '• No category data recorded yet.');
  }

  if (qLow.match(/balance|net worth|savings|financial position|how much.*have|what.*have/)) {
    return `💼 **Your Financial Position:**\n\n• **Net Balance:** ${currency} ${netBalance.toLocaleString()}\n• **Total Income:** ${currency} ${totalIncome.toLocaleString()} (${userTx.filter(t=>t.type==='income').length} transactions)\n• **Total Expenses:** ${currency} ${totalExpense.toLocaleString()} (${userTx.filter(t=>t.type==='expense').length} transactions)\n\n${netBalance >= 0 ? '🎉 You are operating at a **positive cash flow!**' : '⚠️ Your expenses currently exceed your income. Review discretionary spending.'}`;
  }

  if (qLow.match(/budget|burn rate|daily spend|monthly budget|over.*budget/)) {
    const dailyBurn = totalExpense > 0 ? Math.round(totalExpense / 30) : 0;
    return `🎯 **Budget & Burn Rate Analysis:**\n\n` +
      `• **Average Daily Spend:** ${currency} ${dailyBurn.toLocaleString()} / day\n` +
      `• **Total Monthly Expenses:** ${currency} ${totalExpense.toLocaleString()}\n` +
      `• **Monthly Inflow:** ${currency} ${totalIncome.toLocaleString()}\n\n` +
      (totalExpense > totalIncome
        ? `⚠️ **Over Budget Alert:** Your expenses exceed your monthly income by **${currency} ${(totalExpense - totalIncome).toLocaleString()}**.`
        : `✅ **Within Budget:** You have a safe surplus buffer of **${currency} ${(totalIncome - totalExpense).toLocaleString()}** this cycle.`);
  }

  if (qLow.match(/tip|tips|advice|save more|improve.*saving|financial tip|recommendation/)) {
    return `💡 **Cendric Pro Tips for Freelancers:**\n\n1. **50/30/20 Rule** — 50% essentials, 30% lifestyle, 20% savings/investments\n2. **Emergency Fund** — Keep 3–6 months of expenses in a liquid savings account\n3. **Tax Provision** — Automatically set aside **20–25%** of every client payment for APIT\n4. **Track Every Receipt** — Use our CSV importer or receipt scanner to log expenses in real-time\n5. **Invoice in USD** — Sri Lanka's Third Schedule exempts IT export income from income tax`;
  }

  if (qLow.match(/income|earn|earned|revenue|invoice|payment|client/)) {
    const incTx = userTx.filter(t => t.type === 'income');
    return `💰 **Income Summary:**\n\n• **Total Income:** ${currency} ${totalIncome.toLocaleString()}\n• **Transactions:** ${incTx.length} income entries\n• **Average per transaction:** ${currency} ${incTx.length ? (totalIncome/incTx.length).toFixed(0) : 0}\n\nYour net balance after expenses is **${currency} ${netBalance.toLocaleString()}**.`;
  }

  if (qLow.match(/recent transaction|transaction.*history|last.*transaction|transactions/)) {
    if (userTx.length === 0) {
      return `📝 You don't have any recorded transactions yet. Add one manually or upload a receipt to get started!`;
    }
    const recent = userTx.slice(-5).reverse();
    return `📋 **Your Recent Transactions (Last ${recent.length}):**\n\n` +
      recent.map(t => `• **${t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}** — ${t.description || 'Transaction'} (${t.category}): **${t.type === 'income' ? '+' : '-'}${currency} ${Number(t.amount).toLocaleString()}**`).join('\n') +
      `\n\nYou can view all ${userTx.length} transactions in the Transactions tab.`;
  }

  if (qLow.match(/^(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
    return `👋 Hello **${userName}**! I am **Cendric**, your AI finance assistant. You can ask me about your expenses, tax laws, exchange rates, or calculate savings plans. How can I help you today?`;
  }

  return `💡 I'm here to help with your finances, **${userName}**. You can ask:\n• *"What's my net balance?"* (Current: **${currency} ${netBalance.toLocaleString()}**)\n• *"Show my expense breakdown"* (Total: **${currency} ${totalExpense.toLocaleString()}**)\n• *"What's the USD exchange rate?"*\n• *"Calculate my APIT income tax"*`;
}

async function streamChat(req, res) {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data) => {
    if (!res.destroyed) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { question, history = [], languagePreference } = req.body;
    if (!question?.trim()) {
      sendEvent({ type: 'error', message: 'Please enter a question.' });
      return res.end();
    }

    const q = question.trim();
    const userLang = languagePreference || req.user.languagePreference || 'en';
    const effectiveLang = detectResponseLanguage(q, userLang);

    // Build financial context
    let userTx = [];
    if (isMongoDBConnected()) {
      userTx = await Transaction.find({ userId: toUserQuery(req.user._id) }).lean();
    } else {
      userTx = db.transactions.filter(t => String(t.userId) === String(req.user._id));
    }

    const totalIncome  = userTx.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const totalExpense = userTx.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const netBalance   = totalIncome - totalExpense;
    const currency     = req.user.currencyPreference || 'LKR';
    const categoryTotals = {};
    userTx.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (Number(t.amount) || 0);
    });

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    let targetModel = (process.env.GEMINI_MODEL || 'gemini-flash-latest').trim();
    if (targetModel.startsWith('gemini-1.') || targetModel.startsWith('gemini-3.') || !targetModel) {
      targetModel = 'gemini-flash-latest';
    }

    // Helper: stream text word-by-word
    async function streamWords(text) {
      const parts = text.split(/(\s+)/);
      for (const part of parts) {
        if (res.destroyed) break;
        sendEvent({ type: 'token', token: part });
        await new Promise(r => setTimeout(r, 25));
      }
    }

    // Helper: save to DB
    async function saveToChatHistory(userQ, assistantAns) {
      if (!req.user || !req.user._id) return;
      const newMessages = [
        { role: 'user', content: userQ, timestamp: new Date() },
        { role: 'assistant', content: assistantAns, timestamp: new Date() }
      ];

      if (isMongoDBConnected()) {
        try {
          await Chat.findOneAndUpdate(
            { userId: toUserQuery(req.user._id) },
            {
              $setOnInsert: { userId: req.user._id, sessionId: crypto.randomBytes(8).toString('hex') },
              $push: { messages: { $each: newMessages, $slice: -120 } }
            },
            { upsert: true }
          );
        } catch (chatDbErr) {
          console.warn('[Chat History DB Warning]', chatDbErr.message);
        }
      }

      let userChat = db.chats.find(c => String(c.userId) === String(req.user._id));
      if (!userChat) {
        userChat = { userId: req.user._id, sessionId: crypto.randomBytes(8).toString('hex'), messages: [] };
        db.chats.push(userChat);
      }
      userChat.messages.push(...newMessages);
      if (userChat.messages.length > 120) userChat.messages = userChat.messages.slice(-120);
      saveDB();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 1: Financial Calculation Questions (Evaluated FIRST)
    // ─────────────────────────────────────────────────────────────────────────
    if (isCalculationQuery(q, history)) {
      const calcAns = await handleCalculationQuery({
        q,
        history,
        userLang: effectiveLang,
        apiKey,
        targetModel,
        userDbFinancials: {
          monthlyIncome: totalIncome,
          averageDailySpend: totalExpense > 0 ? Math.round(totalExpense / 30) : 0
        }
      });

      await streamWords(calcAns);
      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, calcAns, effectiveLang) });
      sendEvent({ type: 'done' });
      await saveToChatHistory(q, calcAns);
      return res.end();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 2: Document / RAG Q&A (Evaluated SECOND)
    // ─────────────────────────────────────────────────────────────────────────
    if (isDocumentQuery(q)) {
      const retrievedLaws = ragService.retrieveRelevantLaws(q, 3);
      const ragAns = await streamRagQuery({
        q,
        retrievedLaws,
        userLang: effectiveLang,
        apiKey,
        targetModel,
        userFinancials: { currency, totalIncome, totalExpense },
        sendEvent,
        streamWords
      });

      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, ragAns, effectiveLang) });
      sendEvent({ type: 'done' });
      await saveToChatHistory(q, ragAns);
      return res.end();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 3: Finance Snapshot Shortcut (ONLY when genuinely requested)
    // ─────────────────────────────────────────────────────────────────────────
    const userName = (req.user.fullName || 'User').split(' ')[0];
    const topCats = Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).slice(0,3);

    if (isFinanceSnapshotQuery(q)) {
      const snapshotText = buildFinanceSnapshot({
        currency,
        netBalance,
        totalIncome,
        totalExpense,
        userTx,
        topCats,
        userLang: effectiveLang,
        userName
      });

      await streamWords(snapshotText);
      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, snapshotText, effectiveLang) });
      sendEvent({ type: 'done' });
      await saveToChatHistory(q, snapshotText);
      return res.end();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 4: General Chat / General Gemini Stream / Fallback
    // ─────────────────────────────────────────────────────────────────────────
    const retrievedLaws = ragService.retrieveRelevantLaws(q, 2);

    if (apiKey && apiKey !== 'your_key_here' && apiKey.length > 15) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: targetModel });

        let ragContext = '';
        if (retrievedLaws.length > 0) {
          ragContext = '\nSRI LANKAN TAX & LEGAL CONTEXT:\n' +
            retrievedLaws.map(d => `[${d.title} – ${d.act} (${d.section})]:\n${d.content}`).join('\n\n') + '\n';
        }

        let langInstruction = '';
        if (effectiveLang === 'ta') {
          langInstruction = '\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Tamil script (தமிழ்) with natural Tamil financial phrasing (வருமானம், செலவுகள், வரி, விலைப்பட்டியல், பட்ஜெட்).';
        } else if (effectiveLang === 'si') {
          langInstruction = '\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Sinhala script (සිංහල) with natural Sinhala financial phrasing (ආදායම, වියදම්, බදු, ඉන්වොයිසි, අයවැය).';
        } else {
          langInstruction = '\nCRITICAL REQUIREMENT: Respond completely and fluently in English.';
        }

        const lr = currencyService.getRates().rates;
        const systemCtx = `You are Cendric, an elite personal finance AI for freelancers and professionals in Sri Lanka.
User: ${req.user.fullName} | Currency: ${currency}
Income: ${currency} ${totalIncome.toLocaleString()} | Expenses: ${currency} ${totalExpense.toLocaleString()} | Net Balance: ${currency} ${netBalance.toLocaleString()}
Expense categories: ${JSON.stringify(categoryTotals)}
Recent transactions (last 5): ${JSON.stringify(userTx.slice(-5))}
${ragContext}
Live exchange rates: 1 USD = ${lr.LKR?.toFixed(2)} LKR | 1 EUR = ${(lr.LKR/lr.EUR)?.toFixed(2)} LKR | 1 GBP = ${(lr.LKR/lr.GBP)?.toFixed(2)} LKR
${langInstruction}
Respond concisely with markdown formatting. Keep responses under 300 words.`;

        const geminiHistory = history.slice(-8).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: systemCtx }] },
            { role: 'model', parts: [{ text: 'Understood. I am Cendric, ready to assist with your finances.' }] },
            ...geminiHistory
          ],
          generationConfig: { maxOutputTokens: 600 }
        });

        const result = await chat.sendMessageStream(q);
        let fullText = '';

        for await (const chunk of result.stream) {
          if (res.destroyed) break;
          const token = chunk.text();
          fullText += token;
          sendEvent({ type: 'token', token });
        }

        sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, fullText, effectiveLang) });
        sendEvent({ type: 'done' });
        await saveToChatHistory(q, fullText);
        return res.end();
      } catch (gemErr) {
        console.warn('[Gemini Stream Warning]', gemErr.message);
      }
    }

    // Rule-based fallback for general queries & suggested questions
    const r = currencyService.getRates().rates;
    const answer = buildRuleBasedResponse({
      q,
      effectiveLang,
      userName,
      currency,
      totalIncome,
      totalExpense,
      netBalance,
      categoryTotals,
      userTx,
      topCats,
      r
    });

    await streamWords(answer);
    sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, answer, effectiveLang) });
    sendEvent({ type: 'done' });
    await saveToChatHistory(q, answer);
    res.end();

  } catch (err) {
    console.error('[Chat Stream Error]', err);
    sendEvent({ type: 'error', message: 'Something went wrong. Please try again.' });
    res.end();
  }
}

async function getChatHistory(req, res) {
  try {
    let userChat = null;
    if (isMongoDBConnected()) {
      userChat = await Chat.findOne({ userId: toUserQuery(req.user._id) }).lean();
    }
    if (!userChat) {
      userChat = db.chats.find(c => String(c.userId) === String(req.user._id));
    }

    const messages = userChat ? userChat.messages : [];
    const sessionId = userChat ? userChat.sessionId : crypto.randomBytes(8).toString('hex');

    res.json({
      messages,
      sessionId
    });
  } catch (err) {
    console.error('[Chat History Error]', err);
    res.status(500).json({ message: 'Failed to fetch chat history.' });
  }
}

async function clearChatHistory(req, res) {
  try {
    const newSessionId = crypto.randomBytes(8).toString('hex');
    if (isMongoDBConnected()) {
      await Chat.findOneAndUpdate(
        { userId: toUserQuery(req.user._id) },
        { messages: [], sessionId: newSessionId }
      );
    }

    const idx = db.chats.findIndex(c => String(c.userId) === String(req.user._id));
    if (idx !== -1) {
      db.chats[idx].messages = [];
      db.chats[idx].sessionId = newSessionId;
      saveDB();
    }
    res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (err) {
    console.error('[Clear Chat Error]', err);
    res.status(500).json({ message: 'Failed to clear chat history.' });
  }
}

async function postChatMessage(req, res) {
  try {
    const { question, sessionId = crypto.randomBytes(8).toString('hex'), languagePreference, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question cannot be empty.' });
    }

    const q = question.trim();
    const userLang = languagePreference || req.user.languagePreference || 'en';
    const effectiveLang = detectResponseLanguage(q, userLang);

    let userTx = [];
    if (isMongoDBConnected()) {
      userTx = await Transaction.find({ userId: toUserQuery(req.user._id) }).lean();
    } else {
      userTx = db.transactions.filter(t => String(t.userId) === String(req.user._id));
    }

    const totalIncome = userTx.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalExpense = userTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const netBalance = totalIncome - totalExpense;
    const currency = req.user.currencyPreference || 'LKR';

    const categoryTotals = {};
    userTx.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + (Number(t.amount) || 0);
    });
    const topCats = Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).slice(0,3);

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    let targetModel = (process.env.GEMINI_MODEL || 'gemini-flash-latest').trim();
    if (targetModel.startsWith('gemini-1.') || targetModel.startsWith('gemini-3.') || !targetModel) {
      targetModel = 'gemini-flash-latest';
    }

    let answer = null;
    let retrievedSources = [];

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 1: Financial Calculation Questions
    // ─────────────────────────────────────────────────────────────────────────
    if (isCalculationQuery(q, history)) {
      answer = await handleCalculationQuery({
        q,
        history,
        userLang: effectiveLang,
        apiKey,
        targetModel,
        userDbFinancials: {
          monthlyIncome: totalIncome,
          averageDailySpend: totalExpense > 0 ? Math.round(totalExpense / 30) : 0
        }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 2: Document / RAG Q&A
    // ─────────────────────────────────────────────────────────────────────────
    else if (isDocumentQuery(q)) {
      const retrievedLaws = ragService.retrieveRelevantLaws(q, 3);
      retrievedSources = retrievedLaws.map(l => ({
        id: l.id,
        title: l.title,
        act: l.act,
        section: l.section,
        category: l.category
      }));

      answer = await handleRagQuery({
        q,
        retrievedLaws,
        userLang: effectiveLang,
        apiKey,
        targetModel,
        userFinancials: { currency, totalIncome, totalExpense }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 3: Finance Snapshot Shortcut (Explicit request only)
    // ─────────────────────────────────────────────────────────────────────────
    else if (isFinanceSnapshotQuery(q)) {
      const userName = (req.user.fullName || 'User').split(' ')[0];
      answer = buildFinanceSnapshot({
        currency,
        netBalance,
        totalIncome,
        totalExpense,
        userTx,
        topCats,
        userLang: effectiveLang,
        userName
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BRANCH 4: General Chat
    // ─────────────────────────────────────────────────────────────────────────
    else {
      const retrievedLaws = ragService.retrieveRelevantLaws(q, 2);
      retrievedSources = retrievedLaws.map(l => ({
        id: l.id,
        title: l.title,
        act: l.act,
        section: l.section,
        category: l.category
      }));

      if (apiKey && apiKey !== 'your_key_here' && apiKey.length > 15) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: targetModel });

          let ragContext = '';
          if (retrievedLaws.length > 0) {
            ragContext = `\nAUTHORITATIVE SRI LANKAN TAX & LEGAL CONTEXT (Inland Revenue Act & Regulations):\n` +
              retrievedLaws.map(doc => `[${doc.title} - ${doc.act} (${doc.section})]:\n${doc.content}`).join('\n\n') +
              `\nIf the user's question relates to tax or laws, ground your answer in this Sri Lankan legal context. Quote the Section/Act and provide step-by-step numbers.\n`;
          }

          const liveRatesData = currencyService.getRates();
          const lr = liveRatesData.rates;
          const liveRatesContext = `
REAL-TIME CURRENCY EXCHANGE RATES (Base: USD):
- 1 USD = ${lr.LKR.toFixed(2)} LKR
- 1 EUR = ${(lr.LKR / lr.EUR).toFixed(2)} LKR (1 USD = ${lr.EUR.toFixed(4)} EUR)
- 1 GBP = ${(lr.LKR / lr.GBP).toFixed(2)} LKR (1 USD = ${lr.GBP.toFixed(4)} GBP)
- 1 INR = ${(lr.LKR / lr.INR).toFixed(2)} LKR (1 USD = ${lr.INR.toFixed(2)} INR)
- 1 AUD = ${(lr.LKR / lr.AUD).toFixed(2)} LKR
- 1 CAD = ${(lr.LKR / lr.CAD).toFixed(2)} LKR
- Provider: ${liveRatesData.source} (Synced: ${liveRatesData.lastUpdated || 'Live'})
If the user asks about exchange rates or converting earnings, use these real-time numbers.
`;

          let langInstruction = '';
          if (effectiveLang === 'ta') {
            langInstruction = '\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Tamil script (தமிழ்) with natural Tamil financial phrasing (வருமானம், செலவுகள், வரி, விலைப்பட்டியல், பட்ஜெட்).';
          } else if (effectiveLang === 'si') {
            langInstruction = '\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Sinhala script (සිංහල) with natural Sinhala financial phrasing (ආදායම, වියදම්, බදු, ඉන්වොයිසි, අයවැය).';
          } else {
            langInstruction = '\nCRITICAL REQUIREMENT: Respond completely and fluently in English.';
          }

          const prompt = `You are Cendric, an elite personal finance AI assistant for freelancers and professionals in Sri Lanka.
Current User Context:
- User Name: ${req.user.fullName}
- Currency: ${currency}
- Total Income: ${currency} ${totalIncome}
- Total Expenses: ${currency} ${totalExpense}
- Net Balance: ${currency} ${netBalance}
- Expenses by Category: ${JSON.stringify(categoryTotals)}
- Recent Transactions: ${JSON.stringify(userTx.slice(0, 5))}
${ragContext}
${liveRatesContext}
${langInstruction}
User Question: "${q}"

Respond helpfully, politely, and concisely with practical numbers, insights, or advice. Format with clean markdown bullet points where appropriate.`;

          const result = await model.generateContent(prompt);
          answer = result.response.text().trim();
        } catch (geminiErr) {
          console.warn('[Gemini Chat Warning]', geminiErr.message);
        }
      }

      if (!answer) {
        const r = currencyService.getRates().rates;
        const userName = (req.user.fullName || 'User').split(' ')[0];
        answer = buildRuleBasedResponse({
          q,
          effectiveLang,
          userName,
          currency,
          totalIncome,
          totalExpense,
          netBalance,
          categoryTotals,
          userTx,
          topCats,
          r
        });
      }
    }

    const newChatMessages = [
      { role: 'user', content: q, timestamp: new Date() },
      { role: 'assistant', content: answer, timestamp: new Date() }
    ];

    if (isMongoDBConnected()) {
      await Chat.findOneAndUpdate(
        { userId: toUserQuery(req.user._id) },
        {
          sessionId,
          $push: { messages: { $each: newChatMessages, $slice: -120 } }
        },
        { upsert: true }
      );
    }

    let userChat = db.chats.find(c => String(c.userId) === String(req.user._id));
    if (!userChat) {
      userChat = {
        userId: req.user._id,
        sessionId,
        messages: []
      };
      db.chats.push(userChat);
    }

    userChat.sessionId = sessionId;
    userChat.messages.push(...newChatMessages);
    if (userChat.messages.length > 120) userChat.messages = userChat.messages.slice(-120);
    saveDB();

    res.json({
      answer,
      sessionId,
      retrievedSources
    });
  } catch (err) {
    console.error('[Chat Message Error]', err);
    res.status(500).json({ message: 'Error generating response.' });
  }
}

module.exports = {
  streamChat,
  postChatMessage,
  getChatHistory,
  clearChatHistory
};
