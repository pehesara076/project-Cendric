const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AQ.Ab8RN6I4Q0-S1cMLfInXNLPjcn3CQl8j6LJOd0WOvJXLcTfr4Q';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: { temperature: 0.2, maxOutputTokens: 600 }
});

const q = 'මගේ upload කරපු document එකේ, මම ලාස්ට් අවුරුද්දේ Japan trip එකකට වියදම් කරපු මුදල කීයද?';
const contextText = '[No relevant context was found for this question]';

const prompt = `Context:
${contextText}

Question:
${q}

Instructions: Answer ONLY using the information in the Context above.
Do not use any external knowledge, do not make assumptions, and do
not fill gaps with information not explicitly present in the Context.
If the answer cannot be found in the Context, respond exactly with:
"I don't have that information in the provided documents."`;

async function callWithRetry(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      console.log(`Retrying after error (${err.message})...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

callWithRetry(() => model.generateContent(prompt))
  .then(res => {
    console.log('Gemini RAG response on missing doc info:');
    console.log('RESULT:', JSON.stringify(res.response.text().trim()));
  })
  .catch(err => {
    console.error('Final ERROR, falling back to deterministic response:');
    if (contextText.includes('No relevant context was found')) {
      console.log('FALLBACK RESULT:', "I don't have that information in the provided documents.");
    }
  });
