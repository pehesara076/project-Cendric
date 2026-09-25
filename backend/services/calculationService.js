/**
 * CALCULATION SERVICE FOR CENDRIC AI
 * Deterministic Financial Calculations & Savings Goal Planning
 * 
 * Adheres strictly to the requirement that LLMs do NOT perform arithmetic.
 * Math is executed in plain, deterministic Node.js code with validation guards.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Format a number as Sri Lankan currency (e.g. Rs. 100,000.00 or Rs. 100,000)
 */
function formatRs(num, includeDecimals = false) {
  if (num === null || num === undefined || isNaN(num)) return 'Rs. 0';
  const val = Number(num);
  const formatted = includeDecimals 
    ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(val).toLocaleString('en-US');
  return `Rs. ${formatted}`;
}

/**
 * 1. Intent Detection: Check if user message is a financial calculation/savings-goal/budget request
 */
function isCalculationIntent(text, history = []) {
  if (!text || typeof text !== 'string') return false;
  const q = text.toLowerCase().trim();

  // Keyword indicators
  const calcKeywords = [
    'save', 'savings', 'ඉතුරු', 'ඉතිරි', 'සේමි', 'சேமிக்க',
    'budget', 'target', 'goal', 'ඉලක්කය', 'අයවැය', 'பட்ஜெட்',
    'per day', 'per month', 'daily', 'monthly', 'දවසකට', 'මාසෙකට', 'මාසික', 'දිනකට',
    'cut spending', 'වියදම අඩු', 'ගණනය', 'calculate', 'calculator', 'ekathu', 'එකතු'
  ];

  const hasKeywords = calcKeywords.some(kw => q.includes(kw));
  const hasNumbers = /\d+/.test(q);

  // Check for follow-up patterns if previous message was calculation-related
  const lastAssistantMsg = [...history].reverse().find(m => m.role === 'assistant' || m.role === 'model');
  const wasPrevCalculation = lastAssistantMsg && (
    lastAssistantMsg.content.includes('save') ||
    lastAssistantMsg.content.includes('ඉතිරි') ||
    lastAssistantMsg.content.includes('දවසකට') ||
    lastAssistantMsg.content.includes('Daily Spend') ||
    lastAssistantMsg.content.includes('Savings Plan')
  );

  const isFollowUpTimePeriod = wasPrevCalculation && (
    /මාස\s*\d+|අවුරුදු\s*\d+|දින\s*\d+|months?|years?|days?|weeks?/i.test(q) ||
    /ඒක\s*මාස|what if|how about|if.*months?/i.test(q)
  );

  return (hasKeywords && hasNumbers) || isFollowUpTimePeriod || (/ගණනය\s*කරලා|calculate/i.test(q) && hasNumbers);
}

/**
 * Deterministic helper to parse natural language time periods into days
 */
function parseTimeToDays(text) {
  if (!text) return null;
  const t = text.toLowerCase();

  // Years
  const yrMatch = t.match(/(\d+)\s*(?:years?|yrs?|අවුරුදු|வருட)/i) || t.match(/(?:years?|yrs?|අවුරුදු|வருட)\s*(\d+)/i);
  if (yrMatch) return Number(yrMatch[1] || yrMatch[2]) * 365;
  if (t.includes('ඊළඟ අවුරුද්දේ') || t.includes('next year') || t.includes('one year') || t.includes('1 year') || t.includes('අවුරුද්දකින්')) return 365;

  // Months
  const moMatch = t.match(/(\d+)\s*(?:months?|mos?|මාස|மாத)/i) || t.match(/(?:months?|mos?|මාස|மாத)\s*(\d+)/i);
  if (moMatch) return Number(moMatch[1] || moMatch[2]) * 30;
  if (t.includes('මාසයකින්') || t.includes('one month') || t.includes('1 month') || t.includes('next month')) return 30;

  // Weeks
  const wkMatch = t.match(/(\d+)\s*(?:weeks?|wks?|සති|வார)/i) || t.match(/(?:weeks?|wks?|සති|வார)\s*(\d+)/i);
  if (wkMatch) return Number(wkMatch[1] || wkMatch[2]) * 7;

  // Days
  const dMatch = t.match(/(\d+)\s*(?:days?|දින|දවස්|நாட்கள்)/i) || t.match(/(?:days?|දින|දවස්|நாட்கள்)\s*(\d+)/i);
  if (dMatch) return Number(dMatch[1] || dMatch[2]);

  return null;
}

/**
 * Regex-based parameter extractor for fast, robust fallback & verification
 */
function extractParamsViaRegex(text, history = []) {
  const t = text.toLowerCase().replace(/,/g, '');
  let savingsGoal = null;
  let currentDailySpend = null;
  let monthlyIncome = null;
  let timePeriodDays = parseTimeToDays(text);

  // Match savings goal
  const goalMatch = t.match(/(?:save|ඉතුරු|ඉතිරි|extra save|target|goal|சேமிக்க)\s*(?:කරගන්න|කරන්න)?\s*(?:rs\.?|lkr)?\s*(\d+(?:\.\d+)?)/i) ||
                    t.match(/(?:rs\.?|lkr)?\s*(\d+(?:\.\d+)?)\s*(?:ක්|k)?\s*(?:extra\s*)?(?:save|ඉතුරු|ඉතිරි)/i);
  if (goalMatch) {
    let val = Number(goalMatch[1]);
    if (goalMatch[0].includes('k') && val < 1000) val *= 1000;
    savingsGoal = val;
  }

  // Match daily spend
  const dailySpendMatch = t.match(/(?:දවසකට|දිනකට|per day|daily|daily spend)\s*(?:වියදම්|spend)?\s*(?:rs\.?|lkr)?\s*(\d+(?:\.\d+)?)/i) ||
                          t.match(/(?:rs\.?|lkr)?\s*(\d+(?:\.\d+)?)\s*(?:ක්)?\s*(?:වියදම් කරනවා|spend daily|daily spend)/i);
  if (dailySpendMatch) {
    currentDailySpend = Number(dailySpendMatch[1]);
  }

  // Match monthly income
  const incomeMatch = t.match(/(?:මාසික|මාසෙකට|monthly|per month|income)\s*(?:income|ආදායම|earnings?)?\s*(?:එක)?\s*(?:rs\.?|lkr)?\s*(\d+(?:\.\d+)?)/i) ||
                      t.match(/(?:rs\.?|lkr)?\s*(\d+(?:\.\d+)?)\s*(?:ක්)?\s*(?:මාසික income|monthly income)/i);
  if (incomeMatch) {
    monthlyIncome = Number(incomeMatch[1]);
  }

  // Search history for previous parameters if any are missing
  if (history && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const prev = (history[i].content || '').replace(/,/g, '');
      if (!savingsGoal) {
        const prevGoal = prev.match(/Savings Goal:\s*Rs\.?\s*(\d+)/i) || 
                         prev.match(/(?:ඉලක්කගත\s*අමතර\s*ඉතිරිය|ඉලක්කය|savings goal|target).*?(?:rs\.?|lkr)?\s*(\d+)/i) ||
                         prev.match(/(\d+)(?:[^\d\s]*)\s*(?:extra\s*)?(?:save|ඉතුරු|ඉතිරි|සේමි)/i) ||
                         prev.match(/savingsGoal.*?(\d+)/i);
        if (prevGoal) savingsGoal = Number(prevGoal[1]);
      }
      if (!currentDailySpend) {
        const prevDaily = prev.match(/(?:දැනට\s*දිනක\s*වියදම|daily spend target|current daily spend).*?(?:rs\.?|lkr)?\s*(\d+)/i) ||
                          prev.match(/(?:දවසකට|දිනකට|per day|daily).*?(?:rs\.?|lkr)?\s*(\d+)/i);
        if (prevDaily) currentDailySpend = Number(prevDaily[1]);
      }
      if (!monthlyIncome) {
        const prevInc = prev.match(/(?:මාසික\s*ආදායම|monthly income).*?(?:rs\.?|lkr)?\s*(\d+)/i) ||
                        prev.match(/(?:මාසික|monthly|income).*?(?:rs\.?|lkr)?\s*(\d+)/i);
        if (prevInc) monthlyIncome = Number(prevInc[1]);
      }
      if (!timePeriodDays) {
        timePeriodDays = parseTimeToDays(prev);
      }
    }
  }

  return { savingsGoal, currentDailySpend, monthlyIncome, timePeriodDays };
}

/**
 * 2. Parameter Extraction using Gemini structured output with fallback
 */
async function extractCalculationParameters(text, history = [], userDbFinancials = {}, apiKey = null, modelName = 'gemini-flash-latest') {
  const regexParams = extractParamsViaRegex(text, history);

  // If regex found all 4 explicitly, we can use them directly
  if (regexParams.savingsGoal && regexParams.timePeriodDays && regexParams.currentDailySpend && regexParams.monthlyIncome) {
    return regexParams;
  }

  // Try Gemini for natural language semantic parameter extraction
  if (apiKey && apiKey !== 'your_key_here' && apiKey.length > 15) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName || 'gemini-flash-latest',
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const historyContext = history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `You are a financial parameter extractor for personal savings calculations.
Extract the following parameters from the user's message and conversation history:
- savingsGoal: The target savings amount in numeric currency (e.g. 100000)
- timePeriodDays: The time duration converted to number of days (1 year = 365, 6 months = 180, 1 month = 30, etc.)
- currentDailySpend: The user's current daily spending amount (e.g. 1500)
- monthlyIncome: The user's monthly income amount (e.g. 70000)

Conversation History:
${historyContext}

Current User Message:
"${text}"

Return a valid JSON object matching this schema:
{
  "savingsGoal": number or null,
  "timePeriodDays": number or null,
  "currentDailySpend": number or null,
  "monthlyIncome": number or null,
  "missingFields": ["savingsGoal", "timePeriodDays", etc.]
}`;

      const res = await model.generateContent(prompt);
      const jsonText = res.response.text().trim();
      const parsed = JSON.parse(jsonText);

      return {
        savingsGoal: parsed.savingsGoal || regexParams.savingsGoal,
        timePeriodDays: parsed.timePeriodDays || regexParams.timePeriodDays,
        currentDailySpend: parsed.currentDailySpend !== null && parsed.currentDailySpend !== undefined ? parsed.currentDailySpend : regexParams.currentDailySpend,
        monthlyIncome: parsed.monthlyIncome !== null && parsed.monthlyIncome !== undefined ? parsed.monthlyIncome : regexParams.monthlyIncome,
      };
    } catch (err) {
      console.warn('[Calculation Param Extraction Fallback]', err.message);
    }
  }

  // Fallback to regex params
  return regexParams;
}

/**
 * 3. Pure Deterministic Math Function
 */
function calculateSavingsPlan({ currentDailySpend, monthlyIncome, savingsGoal, timePeriodDays }) {
  const days = Math.max(1, Math.round(Number(timePeriodDays) || 365));
  const goal = Math.max(0, Number(savingsGoal) || 0);
  const dailySpend = Math.max(0, Number(currentDailySpend) || 0);
  const income = Math.max(0, Number(monthlyIncome) || 0);

  const currentMonthlySpend = Math.round(dailySpend * 30);
  const currentMonthlySavings = Math.round(income - currentMonthlySpend);
  const additionalDailySavingsNeeded = goal / days;
  const newDailySpendTarget = dailySpend - additionalDailySavingsNeeded;

  return {
    currentDailySpend: dailySpend,
    monthlyIncome: income,
    savingsGoal: goal,
    timePeriodDays: days,
    currentMonthlySpend,
    currentMonthlySavings,
    additionalDailySavingsNeeded: Math.round(additionalDailySavingsNeeded * 100) / 100,
    newDailySpendTarget: Math.round(newDailySpendTarget * 100) / 100,
    isAchievable: newDailySpendTarget >= 0,
  };
}

/**
 * Helper to detect response language: defaults to interface language,
 * but adapts if the user explicitly typed in Sinhala, Tamil, or English.
 */
function detectResponseLanguage(query, defaultLang = 'en') {
  if (!query || typeof query !== 'string') return defaultLang || 'en';
  if (/[\u0D80-\u0DFF]/.test(query)) return 'si';
  if (/[\u0B80-\u0BFF]/.test(query)) return 'ta';
  const lower = query.toLowerCase().trim();
  const englishSentenceWords = /\b(what|how|why|when|where|who|which|can|could|would|should|please|show|tell|explain|give|calculate|estimate|breakdown|analyze|analysis|is|are|am|do|does|did|have|has|had|my|the|this|that|in|for|with|about|between)\b/i;
  if (englishSentenceWords.test(lower) && !/[\u0D80-\u0DFF\u0B80-\u0BFF]/.test(query)) {
    const wordCount = lower.split(/\s+/).length;
    if (wordCount >= 2 || englishSentenceWords.test(lower)) return 'en';
  }
  return defaultLang || 'en';
}

/**
 * 4. Generate Friendly Explanation from Deterministic Calculated Results
 */
async function generateSavingsExplanation(plan, userLang = 'en', userQuery = '', apiKey = null, modelName = 'gemini-flash-latest') {
  const goalStr = formatRs(plan.savingsGoal);
  const addDailyStr = formatRs(plan.additionalDailySavingsNeeded);
  const newTargetStr = formatRs(plan.newDailySpendTarget);
  const currDailyStr = formatRs(plan.currentDailySpend);
  const incomeStr = formatRs(plan.monthlyIncome);
  const currMonthlySpendStr = formatRs(plan.currentMonthlySpend);
  const currMonthlySavingsStr = formatRs(plan.currentMonthlySavings);
  const daysStr = `${plan.timePeriodDays} days (${plan.timePeriodDays >= 360 ? '1 year' : Math.round(plan.timePeriodDays / 30) + ' months'})`;

  const effectiveLang = detectResponseLanguage(userQuery, userLang);

  // Fallback template if Gemini is unavailable
  const fallbackSi = `💡 **ඉතිරිකිරීමේ සැලැස්ම (Savings Plan):**

• **ඉලක්කගත අමතර ඉතිරිය:** **${goalStr}** (${plan.timePeriodDays >= 360 ? 'වසර 1ක්' : Math.round(plan.timePeriodDays / 30) + ' මාස'} තුළ)
• **දැනට දිනක වියදම:** ${currDailyStr} (මාසික වියදම: ${currMonthlySpendStr})
• **මාසික ආදායම:** ${incomeStr} (දැනට මාසික ඉතිරිය: ${currMonthlySavingsStr})

📊 **ගණනය කළ ප්‍රතිඵලය:**
• **දිනකට අමතරව ඉතිරි කළ යුතු මුදල:** **${addDailyStr}**
• **නව දෛනික වියදම් ඉලක්කය:** **${newTargetStr}** (දිනකට වියදම් කළ හැකි උපරිම මුදල)

${plan.isAchievable ? `✅ මෙම ඉලක්කය සාක්ෂාත් කරගත හැකියි! ඔබගේ දෛනික වියදම ${currDailyStr} සිට ${newTargetStr} දක්වා දිනකට ${addDailyStr} කින් අඩු කිරීමෙන් ${goalStr} ඉතිරි කරගත හැක.` : `⚠️ අවවාදයයි: ඔබගේ දෛනික වියදමට වඩා දිනක ඉතිරි කළ යුතු මුදල වැඩිය. ආදායම වැඩි කර ගැනීමට හෝ කාල සීමාව දීර්ඝ කිරීමට සලකා බලන්න.`}`;

  const fallbackEn = `💡 **Financial Savings Plan:**

• **Savings Goal:** **${goalStr}** over **${daysStr}**
• **Current Daily Spend:** ${currDailyStr} (Monthly Spend: ${currMonthlySpendStr})
• **Current Monthly Income:** ${incomeStr} (Current Savings: ${currMonthlySavingsStr})

📊 **Exact Calculation Results:**
• **Additional Daily Savings Needed:** **${addDailyStr} / day**
• **New Daily Spend Target:** **${newTargetStr} / day**

${plan.isAchievable ? `✅ **This goal is achievable!** By cutting your daily spend by **${addDailyStr}** (from ${currDailyStr} down to ${newTargetStr}), you will successfully save **${goalStr}** in ${daysStr}.` : `⚠️ **Challenging Goal:** The required additional savings exceeds your current daily spend. Consider extending the time period or increasing income.`}`;

  const fallbackTa = `💡 **சேமிப்பு திட்டம் (Savings Plan):**

• **சேமிப்பு இலக்கு:** **${goalStr}** (${daysStr})
• **தற்போதைய தினசரி செலவு:** ${currDailyStr} (மாதாந்திர செலவு: ${currMonthlySpendStr})
• **மாதாந்திர வருமானம்:** ${incomeStr} (தற்போதைய சேமிப்பு: ${currMonthlySavingsStr})

📊 **கணக்கீட்டு முடிவுகள்:**
• **கூடுதலாக தினசரி சேமிக்க வேண்டிய தொகை:** **${addDailyStr} / நாள்**
• **புதிய தினசரி செலவு இலக்கு:** **${newTargetStr} / நாள்**

${plan.isAchievable ? `✅ இந்த இலக்கை அடைய முடியும்! உங்கள் தினசரி செலவை ${currDailyStr} இலிருந்து ${newTargetStr} ஆகக் குறைப்பதன் மூலம் ${goalStr} சேமிக்கலாம்.` : `⚠️ எச்சரிக்கை: கூடுதல் சேமிப்பு தேவை உங்கள் தினசரி செலவை விட அதிகமாக உள்ளது.`}`;

  if (!apiKey || apiKey === 'your_key_here' || apiKey.length <= 15) {
    if (effectiveLang === 'si') return fallbackSi;
    if (effectiveLang === 'ta') return fallbackTa;
    return fallbackEn;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName || 'gemini-flash-latest',
      generationConfig: { temperature: 0.2 }
    });

    const isSinhala = effectiveLang === 'si';
    const isTamil = effectiveLang === 'ta';
    const targetLangName = isSinhala ? 'Sinhala (සිංහල script)' : isTamil ? 'Tamil (தமிழ் script)' : 'English';

    const prompt = `You are Cendric, an elite personal finance AI assistant for Sri Lanka.
Using these exact calculated figures, write a clear, friendly, encouraging financial-advice explanation for the user in the language specified (${targetLangName}).
Do not recalculate or alter any of these numbers — only explain them and give one or two practical, actionable tips relevant to reaching this goal. Format currency as Rs. with comma separators.

EXACT PRE-CALCULATED FIGURES (DO NOT RECALCULATE):
- Target Extra Savings Goal: ${goalStr}
- Time Period: ${daysStr}
- Current Monthly Income: ${incomeStr}
- Current Daily Spend: ${currDailyStr} (Current Monthly Spend: ${currMonthlySpendStr})
- Current Monthly Savings: ${currMonthlySavingsStr}
- Additional Daily Savings Needed: ${addDailyStr} per day
- New Daily Spend Target: ${newTargetStr} per day
- Achievable: ${plan.isAchievable ? 'Yes' : 'Requires adjustment'}

User Question: "${userQuery}"

Provide a structured, beautifully formatted markdown response. Make sure the numbers ${addDailyStr} and ${newTargetStr} are prominently highlighted in bold.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('[Gemini Calculation Explanation Error]', err.message);
    if (effectiveLang === 'si') return fallbackSi;
    if (effectiveLang === 'ta') return fallbackTa;
    return fallbackEn;
  }
}

module.exports = {
  isCalculationIntent,
  extractCalculationParameters,
  calculateSavingsPlan,
  generateSavingsExplanation,
  detectResponseLanguage,
  formatRs
};
