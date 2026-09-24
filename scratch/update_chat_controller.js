const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../backend/controllers/chatController.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add detectResponseLanguage import
code = code.replace(
  "const calculationService = require('../services/calculationService');",
  "const calculationService = require('../services/calculationService');\nconst { detectResponseLanguage } = calculationService;"
);

// 2. Update handleCalculationQuery
const oldHandleCalc = `async function handleCalculationQuery({ q, history, userLang, apiKey, targetModel, userDbFinancials }) {
  const params = await calculationService.extractCalculationParameters(q, history, userDbFinancials, apiKey, targetModel);

  if (!params.savingsGoal) {
    if (userLang === 'si' || /[\\u0D80-\\u0DFF]/.test(q)) {
      return 'ඔබට අමතරව ඉතිරි කර ගැනීමට අවශ්‍ය ඉලක්කගත මුදල (Savings Goal) කීයද? (උදා: Rs. 100,000)';
    }
    if (userLang === 'ta' || /[\\u0B80-\\u0BFF]/.test(q)) {
      return 'நீங்கள் சேமிக்க விரும்பும் இலக்குத் தொகை எவ்வளவு? (எ.கா: Rs. 100,000)';
    }
    return 'What is your target savings goal amount? (e.g. Rs. 100,000)';
  }

  if (!params.timePeriodDays) {
    if (userLang === 'si' || /[\\u0D80-\\u0DFF]/.test(q)) {
      return 'ඔබ මෙම මුදල ඉතිරි කර ගැනීමට බලාපොරොත්තු වන්නේ කොපමණ කාලයකින්ද? (උදා: මාස 6කින්, අවුරුද්දකින්)';
    }
    if (userLang === 'ta' || /[\\u0B80-\\u0BFF]/.test(q)) {
      return 'இதை எத்தனை நாட்களில் அல்லது மாதங்களில் சேமிக்க விரும்புகிறீர்கள்? (எ.கா: 6 மாதங்கள், 1 வருடம்)';
    }
    return 'Over what time period would you like to save this? (e.g., 6 months, 1 year)';
  }

  const plan = calculationService.calculateSavingsPlan(params);
  return await calculationService.generateSavingsExplanation(plan, userLang, q, apiKey, targetModel);
}`;

const newHandleCalc = `async function handleCalculationQuery({ q, history, userLang, apiKey, targetModel, userDbFinancials }) {
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
}`;

code = code.replace(oldHandleCalc, newHandleCalc);

// 3. Update handleRagQuery & streamRagQuery
const oldHandleRag = `async function handleRagQuery({ q, retrievedLaws, userLang, apiKey, targetModel, userFinancials }) {
  const isContextRelevant = retrievedLaws && retrievedLaws.length > 0 && (retrievedLaws[0].relevanceScore >= 0.15);
  const contextChunks = isContextRelevant
    ? retrievedLaws.map(doc => \`[\${doc.title} - \${doc.act} (\${doc.section})]:\\n\${doc.content}\`).join('\\n\\n')
    : '[No relevant context was found for this question]';

  const defaultNotFound = "I don't have that information in the provided documents.";

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

      const ragPrompt = \`Context:
\${contextChunks}

Question:
\${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
If the answer cannot be found in the Context, respond exactly with:
"I don't have that information in the provided documents."\`;

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
}`;

const newHandleRag = `async function handleRagQuery({ q, retrievedLaws, userLang, apiKey, targetModel, userFinancials }) {
  const effectiveLang = detectResponseLanguage(q, userLang);
  const isContextRelevant = retrievedLaws && retrievedLaws.length > 0 && (retrievedLaws[0].relevanceScore >= 0.15);
  const contextChunks = isContextRelevant
    ? retrievedLaws.map(doc => \`[\${doc.title} - \${doc.act} (\${doc.section})]:\\n\${doc.content}\`).join('\\n\\n')
    : '[No relevant context was found for this question]';

  let defaultNotFound = "I don't have that information in the provided documents.";
  let langInstruction = '';
  if (effectiveLang === 'si') {
    defaultNotFound = "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත.";
    langInstruction = '\\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Sinhala script (සිංහල). If the answer cannot be found in the Context, respond in Sinhala: "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත."';
  } else if (effectiveLang === 'ta') {
    defaultNotFound = "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை.";
    langInstruction = '\\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Tamil script (தமிழ்). If the answer cannot be found in the Context, respond in Tamil: "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை."';
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

      const ragPrompt = \`Context:
\${contextChunks}

Question:
\${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
\${langInstruction}
If the answer cannot be found in the Context, respond exactly with:
"\${defaultNotFound}"\`;

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
}`;

code = code.replace(oldHandleRag, newHandleRag);

const oldStreamRag = `async function streamRagQuery({ q, retrievedLaws, userLang, apiKey, targetModel, userFinancials, sendEvent, streamWords }) {
  const isContextRelevant = retrievedLaws && retrievedLaws.length > 0 && (retrievedLaws[0].relevanceScore >= 0.15);
  const contextChunks = isContextRelevant
    ? retrievedLaws.map(doc => \`[\${doc.title} - \${doc.act} (\${doc.section})]:\\n\${doc.content}\`).join('\\n\\n')
    : '[No relevant context was found for this question]';

  const defaultNotFound = "I don't have that information in the provided documents.";

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

      const ragPrompt = \`Context:
\${contextChunks}

Question:
\${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
If the answer cannot be found in the Context, respond exactly with:
"I don't have that information in the provided documents."\`;

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
}`;

const newStreamRag = `async function streamRagQuery({ q, retrievedLaws, userLang, apiKey, targetModel, userFinancials, sendEvent, streamWords }) {
  const effectiveLang = detectResponseLanguage(q, userLang);
  const isContextRelevant = retrievedLaws && retrievedLaws.length > 0 && (retrievedLaws[0].relevanceScore >= 0.15);
  const contextChunks = isContextRelevant
    ? retrievedLaws.map(doc => \`[\${doc.title} - \${doc.act} (\${doc.section})]:\\n\${doc.content}\`).join('\\n\\n')
    : '[No relevant context was found for this question]';

  let defaultNotFound = "I don't have that information in the provided documents.";
  let langInstruction = '';
  if (effectiveLang === 'si') {
    defaultNotFound = "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත.";
    langInstruction = '\\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Sinhala script (සිංහල). If the answer cannot be found in the Context, respond in Sinhala: "ලබා දී ඇති ලියකියවිලි තුළ එම තොරතුරු මා සතුව නොමැත."';
  } else if (effectiveLang === 'ta') {
    defaultNotFound = "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை.";
    langInstruction = '\\nCRITICAL REQUIREMENT: Answer fluently in Sri Lankan Tamil script (தமிழ்). If the answer cannot be found in the Context, respond in Tamil: "வழங்கப்பட்ட ஆவணங்களில் அந்த தகவல் என்னிடம் இல்லை."';
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

      const ragPrompt = \`Context:
\${contextChunks}

Question:
\${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
\${langInstruction}
If the answer cannot be found in the Context, respond exactly with:
"\${defaultNotFound}"\`;

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
}`;

code = code.replace(oldStreamRag, newStreamRag);

// 4. In streamChat: add effectiveLang
code = code.replace(
  "    const userLang = languagePreference || req.user.languagePreference || 'en';",
  "    const userLang = languagePreference || req.user.languagePreference || 'en';\n    const effectiveLang = detectResponseLanguage(q, userLang);"
);

// 5. In streamChat Branch 1, 2, 3, 4: pass effectiveLang
code = code.replace(
  "      const calcAns = await handleCalculationQuery({\n        q,\n        history,\n        userLang,",
  "      const calcAns = await handleCalculationQuery({\n        q,\n        history,\n        userLang: effectiveLang,"
);
code = code.replace(
  "      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, calcAns, userLang) });",
  "      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, calcAns, effectiveLang) });"
);

code = code.replace(
  "      const ragAns = await streamRagQuery({\n        q,\n        retrievedLaws,\n        userLang,",
  "      const ragAns = await streamRagQuery({\n        q,\n        retrievedLaws,\n        userLang: effectiveLang,"
);
code = code.replace(
  "      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, ragAns, userLang) });",
  "      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, ragAns, effectiveLang) });"
);

code = code.replace(
  "        topCats,\n        userLang,\n        userName\n      });",
  "        topCats,\n        userLang: effectiveLang,\n        userName\n      });"
);
code = code.replace(
  "      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, snapshotText, userLang) });",
  "      sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, snapshotText, effectiveLang) });"
);

// Branch 4 in streamChat
const oldStreamBranch4 = `        let langInstruction = '';
        if (userLang === 'ta') {
          langInstruction = '\\nCRITICAL REQUIREMENT: The user has selected Sri Lankan Tamil (தமிழ்) as interface language. You MUST respond completely and fluently in Sri Lankan Tamil script (தமிழ்) with natural Tamil financial phrasing (வருமானம், செலவுகள், வரி, விலைப்பட்டியல், பட்ஜெட்), unless the user explicitly wrote the question in English.';
        } else if (userLang === 'si') {
          langInstruction = '\\nCRITICAL REQUIREMENT: The user has selected Sri Lankan Sinhala (සිංහල) as interface language. You MUST respond completely and fluently in Sri Lankan Sinhala script (සිංහල) with natural Sinhala financial phrasing (ආදායම, වියදම්, බදු, ඉන්වොයිසි, අයවැය), unless the user explicitly wrote the question in English.';
        }`;

const newStreamBranch4 = `        let langInstruction = '';
        if (effectiveLang === 'ta') {
          langInstruction = '\\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Tamil script (தமிழ்) with natural Tamil financial phrasing (வருமானம், செலவுகள், வரி, விலைப்பட்டியல், பட்ஜெட்).';
        } else if (effectiveLang === 'si') {
          langInstruction = '\\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Sinhala script (සිංහල) with natural Sinhala financial phrasing (ආදායම, වියදම්, බදු, ඉන්වොයිසි, අයවැය).';
        } else {
          langInstruction = '\\nCRITICAL REQUIREMENT: Respond completely and fluently in English.';
        }`;

code = code.replace(oldStreamBranch4, newStreamBranch4);

code = code.replace(
  "        sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, fullText, userLang) });",
  "        sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, fullText, effectiveLang) });"
);

code = code.replace(
  "    if (userLang === 'ta') {",
  "    if (effectiveLang === 'ta') {"
);

code = code.replace(
  "    } else if (userLang === 'si') {",
  "    } else if (effectiveLang === 'si') {"
);

code = code.replace(
  "    sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, answer, userLang) });",
  "    sendEvent({ type: 'suggestions', suggestions: generateFollowUps(q, answer, effectiveLang) });"
);

// 6. In postChatMessage (sendMessage):
code = code.replace(
  "    const userLang = languagePreference || req.user.languagePreference || 'en';",
  "    const userLang = languagePreference || req.user.languagePreference || 'en';\n    const effectiveLang = detectResponseLanguage(q, userLang);"
);

code = code.replace(
  "        history,\n        userLang,\n        apiKey,",
  "        history,\n        userLang: effectiveLang,\n        apiKey,"
);

code = code.replace(
  "        retrievedLaws,\n        userLang,\n        apiKey,",
  "        retrievedLaws,\n        userLang: effectiveLang,\n        apiKey,"
);

const oldSendBranch4 = `          let langInstruction = '';
          if (userLang === 'ta') {
            langInstruction = '\\nCRITICAL REQUIREMENT: The user has selected Sri Lankan Tamil (தமிழ்) as interface language. You MUST respond completely and fluently in Sri Lankan Tamil script (தமிழ்) with natural Tamil financial phrasing (வருமானம், செலவுகள், வரி, விலைப்பட்டியல், பட்ஜெட்), unless the user explicitly wrote the question in English.';
          } else if (userLang === 'si') {
            langInstruction = '\\nCRITICAL REQUIREMENT: The user has selected Sri Lankan Sinhala (සිංහල) as interface language. You MUST respond completely and fluently in Sri Lankan Sinhala script (සිංහල) with natural Sinhala financial phrasing (ආදායම, වියදම්, බදු, ඉන්වොයිසි, අයවැය), unless the user explicitly wrote the question in English.';
          }`;

const newSendBranch4 = `          let langInstruction = '';
          if (effectiveLang === 'ta') {
            langInstruction = '\\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Tamil script (தமிழ்) with natural Tamil financial phrasing (வருமானம், செலவுகள், வரி, விலைப்பட்டியல், பட்ஜெட்).';
          } else if (effectiveLang === 'si') {
            langInstruction = '\\nCRITICAL REQUIREMENT: Respond completely and fluently in Sri Lankan Sinhala script (සිංහල) with natural Sinhala financial phrasing (ආදායම, වියදම්, බදු, ඉන්වොයිසි, අයවැය).';
          } else {
            langInstruction = '\\nCRITICAL REQUIREMENT: Respond completely and fluently in English.';
          }`;

code = code.replace(oldSendBranch4, newSendBranch4);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated chatController.js');
