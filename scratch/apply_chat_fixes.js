const fs = require('fs');
const path = require('path');

// 1. Update backend/controllers/chatController.js
const chatControllerPath = path.join(__dirname, '../backend/controllers/chatController.js');
let chatCode = fs.readFileSync(chatControllerPath, 'utf8');

// The new shared buildRuleBasedResponse function
const buildRuleBasedResponseCode = `
// Unified Rule-Based Response Generator for Financial Queries & Suggested Questions
function buildRuleBasedResponse({ q, effectiveLang, userName, currency, totalIncome, totalExpense, netBalance, categoryTotals, userTx, topCats, r }) {
  const qLow = q.toLowerCase().trim();

  // 1. Tamil Localization
  if (effectiveLang === 'ta') {
    if (qLow.match(/மாற்று விகிதம்|rate|usd|exchange|டாலர்/)) {
      return \`💱 **நேரடி நாணய மாற்று விகிதங்கள் (API நேரலை):**\\n\\n• **1 USD** = **\${r.LKR?.toFixed(2)} LKR**\\n• **1 EUR** = **\${(r.LKR/r.EUR)?.toFixed(2)} LKR**\\n• **1 GBP** = **\${(r.LKR/r.GBP)?.toFixed(2)} LKR**\\n• **1 INR** = **\${(r.LKR/r.INR)?.toFixed(2)} LKR**\\n• **1 AUD** = **\${(r.LKR/r.AUD)?.toFixed(2)} LKR**\\n\\n*ஆதாரம்: Open Exchange Rates API · நேரலை*\`;
    }
    if (qLow.match(/வரி|tax|apit|ird|வருமான வரி|கழிவு/)) {
      const calc = ragService.calculateSriLankanTax(totalIncome, Math.min(totalIncome * 0.4, totalExpense));
      return \`🇱🇰 **உங்கள் வருமானத்திற்கான இலங்கை வரி மதிப்பீடு:**\\n\\n• **மொத்த வருமானம்:** \${currency} \${totalIncome.toLocaleString()}\\n• **அனுமதிக்கப்பட்ட கழிவுகள்:** -\${currency} \${calc.allowableDeductions.toLocaleString()}\\n• **வரி இல்லாத தனிநபர் சலுகை:** -\${currency} 1,200,000\\n• **வரிக்குட்பட்ட வருமானம்:** \${currency} \${calc.taxableIncome.toLocaleString()}\\n\\n\${calc.taxableIncome <= 0 ? '🎉 **வரி செலுத்த தேவையில்லை!** உங்கள் வருமானம் LKR 1,200,000 வரம்பிற்குள் உள்ளது.' : \`**மதிப்பிடப்பட்ட வரி:** **\${currency} \${calc.totalTax.toLocaleString()}** (செயல்திறன் விகிதம்: \${calc.effectiveRate})\\n• **காலாண்டு APIT தவணை:** ~\${currency} \${Math.round(calc.totalTax / 4).toLocaleString()} / காலாண்டு\`}\\n\\n> 💡 *IT/மென்பொருள் ஏற்றுமதி மூலம் பெறப்படும் வெளிநாட்டு நாணய வருமானம் Inland Revenue Act Schedule 3 இன் கீழ் முழு வரி விலக்கு பெறலாம்.*\`;
    }
    if (qLow.match(/செலவு|செலவுகள்|spend|expense|வகைகள்|பகுப்பாய்வு/)) {
      return \`📊 **உங்கள் செலவு பகுப்பாய்வு:**\\n\\n• **மொத்த செலவுகள்:** \${currency} \${totalExpense.toLocaleString()} (\${userTx.filter(t=>t.type==='expense').length} பரிவர்த்தனைகள்)\\n• **மொத்த வருமானம்:** \${currency} \${totalIncome.toLocaleString()}\\n• **நிகர இருப்பு:** \${currency} \${netBalance.toLocaleString()}\\n\\n**முக்கிய செலவு வகைகள்:**\\n\${topCats.length ? topCats.map(([c,v])=>\`• \${c}: \${currency} \${v.toLocaleString()} (\${totalExpense > 0 ? ((v/totalExpense)*100).toFixed(1) : 0}%)\`).join('\\n') : '• செலவு வகைகள் எதுவும் பதிவு செய்யப்படவில்லை.'}\`;
    }
    if (qLow.match(/இருப்பு|மீதி|balance|சேமிப்பு/)) {
      return \`💼 **உங்கள் நிதி நிலைமை:**\\n\\n• **நிகர இருப்பு:** \${currency} \${netBalance.toLocaleString()}\\n• **மொத்த வருமானம்:** \${currency} \${totalIncome.toLocaleString()} (\${userTx.filter(t=>t.type==='income').length} பரிவர்த்தனைகள்)\\n• **மொத்த செலவுகள்:** \${currency} \${totalExpense.toLocaleString()} (\${userTx.filter(t=>t.type==='expense').length} பரிவர்த்தனைகள்)\\n\\n\${netBalance >= 0 ? '🎉 நீங்கள் **நேர்மறை பணப்புழக்கத்தில் (Positive Cash Flow)** உள்ளீர்கள்!' : '⚠️ உங்கள் செலவுகள் வருமானத்தை விட அதிகமாக உள்ளன. கவனமாக திட்டமிடுங்கள்.'}\`;
    }
    if (qLow.match(/ஆலோசனை|tips|நிதி ஆலோசனை|உதவி/)) {
      return \`💡 **சுயாதீனர்களுக்கான Cendric நிதி ஆலோசனைகள்:**\\n\\n1. **50/30/20 விதி** — 50% அத்தியாவசிய தேவைகள், 30% விருப்பங்கள், 20% சேமிப்பு/முதலீடு\\n2. **அவசர நிதி** — 3–6 மாத செலவுகளுக்கான சேமிப்பை தயாராக வைத்திருங்கள்\\n3. **வரி ஒதுக்கீடு** — ஒவ்வொரு வருமானத்திலிருந்தும் 20–25% வரிக்காக ஒதுக்குங்கள்\\n4. **ரசீதுகளைப் பதிவு செய்யுங்கள்** — வரி கழிவுகளைப் பெற ரசீதுகளை உடனுக்குடன் பதிவு செய்யுங்கள்\\n5. **USD இல் விலைப்பட்டியல் அனுப்புங்கள்** — IT ஏற்றுமதி வருமானத்திற்கு இலங்கையில் முழு வரி விலக்கு உண்டு\`;
    }
    if (qLow.match(/வருமானம்|income|earn/)) {
      const incTx = userTx.filter(t => t.type === 'income');
      return \`💰 **வருமான சுருக்கம்:**\\n\\n• **மொத்த வருமானம்:** \${currency} \${totalIncome.toLocaleString()}\\n• **பரிவர்த்தனைகள்:** \${incTx.length}\\n• **சராசரி:** \${currency} \${incTx.length ? (totalIncome/incTx.length).toFixed(0) : 0}\\n\\nசெலவுகளுக்குப் பிந்தைய நிகர இருப்பு **\${currency} \${netBalance.toLocaleString()}** ஆகும்.\`;
    }
    if (qLow.match(/வணக்கம்|ஹலோ|hello|hi/)) {
      return \`👋 வணக்கம் **\${userName}**! நான் **Cendric**, உங்கள் AI நிதி ஆலோசகர்.\\n\\nஉங்களிடம் தற்போது **\${userTx.length}** பரிவர்த்தனைகளும், **\${currency} \${netBalance.toLocaleString()}** நிகர இருப்பும் உள்ளது.\\n\\n💬 உங்கள் செலவுகள், இலங்கை வரிச் சட்டங்கள் அல்லது நேரடி மாற்று விகிதங்கள் பற்றி என்னிடம் கேளுங்கள்!\`;
    }
    return \`💡 **\${userName}**, உங்களுக்கு உதவ நான் தயாராக உள்ளேன். நீங்கள் கேட்கலாம்:\\n• *"எனது நிகர இருப்பு என்ன?"* (இருப்பு: **\${currency} \${netBalance.toLocaleString()}**)\\n• *"செலவு வகைகள்"* (மொத்த செலவு: **\${currency} \${totalExpense.toLocaleString()}**)\\n• *"USD மாற்று விகிதம்"*\\n• *"வருமான வரி கணக்கிடுங்கள்"*\`;
  }

  // 2. Sinhala Localization
  if (effectiveLang === 'si') {
    if (qLow.match(/විනිමය|rate|usd|exchange|ඩොලර්/)) {
      return \`💱 **සජීවී විනිමය අනුපාත (API සජීවී):**\\n\\n• **1 USD** = **\${r.LKR?.toFixed(2)} LKR**\\n• **1 EUR** = **\${(r.LKR/r.EUR)?.toFixed(2)} LKR**\\n• **1 GBP** = **\${(r.LKR/r.GBP)?.toFixed(2)} LKR**\\n• **1 INR** = **\${(r.LKR/r.INR)?.toFixed(2)} LKR**\\n• **1 AUD** = **\${(r.LKR/r.AUD)?.toFixed(2)} LKR**\\n\\n*මූලාශ්‍රය: Open Exchange Rates API · සජීවී*\`;
    }
    if (qLow.match(/බදු|tax|apit|ird|ආදායම් බදු|අඩුකිරීම්/)) {
      const calc = ragService.calculateSriLankanTax(totalIncome, Math.min(totalIncome * 0.4, totalExpense));
      return \`🇱🇰 **ඔබගේ ආදායම සඳහා ශ්‍රී ලංකා බදු තක්සේරුව:**\\n\\n• **මුළු ආදායම:** \${currency} \${totalIncome.toLocaleString()}\\n• **අනුමත අඩුකිරීම්:** -\${currency} \${calc.allowableDeductions.toLocaleString()}\\n• **බදු රහිත සහනය:** -\${currency} 1,200,000\\n• **බදු අයවිය හැකි ආදායම:** \${currency} \${calc.taxableIncome.toLocaleString()}\\n\\n\${calc.taxableIncome <= 0 ? '🎉 **බදු ගෙවීමට අවශ්‍ය නැත!** ඔබගේ ආදායම LKR 1,200,000 සීමාවට වඩා අඩුය.' : \`**ඇස්තමේන්තුගත බද්ද:** **\${currency} \${calc.totalTax.toLocaleString()}** (ඵලදායී අනුපාතය: \${calc.effectiveRate})\\n• **කාර්තුමය APIT වාරිකය:** ~\${currency} \${Math.round(calc.totalTax / 4).toLocaleString()} / කාර්තුව\`}\\n\\n> 💡 *තොරතුරු තාක්ෂණ හෝ මෘදුකාංග අපනයන සේවා ආදායම දේශීය ආදායම් පනත යටතේ සම්පූර්ණ බදු නිදහස් වේ.*\`;
    }
    if (qLow.match(/වියදම|වියදම්|spend|expense|කොපමණ.*වියදම්|ප්‍රවර්ග|බිඳවැටීම/)) {
      return \`📊 **ඔබගේ වියදම් විස්තරය:**\\n\\n• **මුළු වියදම:** \${currency} \${totalExpense.toLocaleString()} (ගනුදෙනු \${userTx.filter(t=>t.type==='expense').length})\\n• **මුළු ආදායම:** \${currency} \${totalIncome.toLocaleString()}\\n• **ශුද්ධ ශේෂය:** \${currency} \${netBalance.toLocaleString()}\\n\\n**ප්‍රධාන වියදම් ප්‍රවර්ග:**\\n\${topCats.length ? topCats.map(([c,v])=>\`• \${c}: \${currency} \${v.toLocaleString()} (\${totalExpense > 0 ? ((v/totalExpense)*100).toFixed(1) : 0}%)\`).join('\\n') : '• තවමත් වියදම් ප්‍රවර්ග සටහන් කර නොමැත.'}\`;
    }
    if (qLow.match(/ශේෂය|balance|මුදල්|ඉතිරි|මුදල් තත්ත්වය/)) {
      return \`💼 **ඔබගේ මූල්‍ය තත්ත්වය:**\\n\\n• **ශුද්ධ ශේෂය:** \${currency} \${netBalance.toLocaleString()}\\n• **මුළු ආදායම:** \${currency} \${totalIncome.toLocaleString()} (ගනුදෙනු \${userTx.filter(t=>t.type==='income').length})\\n• **මුළු වියදම:** \${currency} \${totalExpense.toLocaleString()} (ගනුදෙනු \${userTx.filter(t=>t.type==='expense').length})\\n\\n\${netBalance >= 0 ? '🎉 ඔබ **ධනාත්මක මුදල් ප්‍රවාහයක (Positive Cash Flow)** සිටී!' : '⚠️ ඔබගේ වියදම් ආදායමට වඩා වැඩිය. කරුණාකර සැලකිලිමත් වන්න.'}\`;
    }
    if (qLow.match(/උපදෙස්|tips|මූල්‍ය උපදෙස්|උපදෙස් ලබා/)) {
      return \`💡 **නිදහස් වෘත්තිකයන් සඳහා Cendric මූල්‍ය උපදෙස්:**\\n\\n1. **50/30/20 රීතිය** — 50% අත්‍යවශ්‍ය වියදම්, 30% ජීවන රටාව, 20% ඉතිරිකිරීම්/ආයෝජන\\n2. **හදිසි අරමුදල** — මාස 3–6 ක වියදම් සඳහා ඉතිරි කිරීමේ ගිණුමක් පවත්වා ගන්න\\n3. **බදු වෙන්කිරීම** — ලැබෙන සෑම ගෙවීමකින්ම 20–25% ක් APIT බදු සඳහා වෙන් කරන්න\\n4. **සෑම රිසිට්පතක්ම සටහන් කරන්න** — බදු අඩු කිරීම් ලබා ගැනීමට රිසිට්පත් ස්කෑන් කර තබා ගන්න\\n5. **USD වලින් ඉන්වොයිස් කරන්න** — තොරතුරු තාක්ෂණ අපනයන ආදායම ශ්‍රී ලංකාවේ බදුවලින් නිදහස් වේ\`;
    }
    if (qLow.match(/ආදායම|income|earn|ලැබුණු/)) {
      const incTx = userTx.filter(t => t.type === 'income');
      return \`💰 **ආදායම් සාරාංශය:**\\n\\n• **මුළු ආදායම:** \${currency} \${totalIncome.toLocaleString()}\\n• **ගනුදෙනු ගණන:** \${incTx.length}\\n• **සාමාන්‍යය:** \${currency} \${incTx.length ? (totalIncome/incTx.length).toFixed(0) : 0}\\n\\nවියදම් වලින් පසු ඔබගේ ශුද්ධ ශේෂය **\${currency} \${netBalance.toLocaleString()}** වේ.\`;
    }
    if (qLow.match(/අයවැය|budget|දෛනික/)) {
      const dailyBurn = totalExpense > 0 ? Math.round(totalExpense / 30) : 0;
      return \`🎯 **අයවැය විශ්ලේෂණය:**\\n\\n• **සාමාන්‍ය දෛනික වියදම:** \${currency} \${dailyBurn.toLocaleString()} / දිනකට\\n• **මුළු වියදම:** \${currency} \${totalExpense.toLocaleString()}\\n• **මුළු ආදායම:** \${currency} \${totalIncome.toLocaleString()}\`;
    }
    if (qLow.match(/ආයුබෝවන්|hello|hi/)) {
      return \`👋 ආයුබෝවන් **\${userName}**! මම **Cendric**, ඔබගේ AI මූල්‍ය උපදේශක.\\n\\nඔබ සතුව මේ වන විට ගනුදෙනු **\${userTx.length}** ක් සහ **\${currency} \${netBalance.toLocaleString()}** ක ශුද්ධ ශේෂයක් පවතී.\\n\\n💬 ඔබගේ වියදම්, ශ්‍රී ලංකා බදු නීති හෝ සජීවී විනිමය අනුපාත පිළිබඳව මගෙන් විමසන්න!\`;
    }
    return \`💡 **\${userName}**, ඔබට සහය වීමට මම සූදානම්. ඔබට විමසිය හැක:\\n• *"මගේ ශුද්ධ ශේෂය කොපමණද?"* (වත්මන් ශේෂය: **\${currency} \${netBalance.toLocaleString()}**)\\n• *"වියදම් ප්‍රවර්ග පෙන්වන්න"* (මුළු වියදම: **\${currency} \${totalExpense.toLocaleString()}**)\\n• *"USD විනිමය අනුපාතය"*\\n• *"ආදායම් බදු ගණනය කරන්න"*\`;
  }

  // 3. English & Default (Grounded in Real User Financials)
  if (qLow.match(/exchange rate|usd|currency rate|rates today|dollar|eur|gbp|inr|aud|cad/)) {
    return \`💱 **Live Exchange Rates (API Synchronized):**\\n\\n• **1 USD** = **\${r.LKR?.toFixed(2)} LKR**\\n• **1 EUR** = **\${(r.LKR/r.EUR)?.toFixed(2)} LKR**\\n• **1 GBP** = **\${(r.LKR/r.GBP)?.toFixed(2)} LKR**\\n• **1 INR** = **\${(r.LKR/r.INR)?.toFixed(2)} LKR**\\n• **1 AUD** = **\${(r.LKR/r.AUD)?.toFixed(2)} LKR**\\n\\n*Source: Open Exchange Rates API · Live*\`;
  }

  if (qLow.match(/tax|apit|ird|taxable|deduct|tin\\b|deadline|upwork.*tax/)) {
    const calc = ragService.calculateSriLankanTax(totalIncome, Math.min(totalIncome * 0.4, totalExpense));
    return \`🇱🇰 **Sri Lankan Tax Assessment for Your Income**\\n\\n\` +
      \`• **Gross Income:** \${currency} \${totalIncome.toLocaleString()}\\n\` +
      \`• **Allowable Deductions:** -\${currency} \${calc.allowableDeductions.toLocaleString()}\\n\` +
      \`• **Tax-Free Personal Relief:** -\${currency} 1,200,000\\n\` +
      \`• **Taxable Income:** \${currency} \${calc.taxableIncome.toLocaleString()}\\n\\n\` +
      (calc.taxableIncome <= 0
        ? \`🎉 **Zero Tax Payable!** Your net earnings are below the LKR 1,200,000 relief threshold.\`
        : \`**Total Estimated Tax Payable:** **\${currency} \${calc.totalTax.toLocaleString()}** (Effective rate: \${calc.effectiveRate})\\n\` +
          \`• **Quarterly APIT Installment:** ~\${currency} \${Math.round(calc.totalTax / 4).toLocaleString()} / quarter\\n\\n\` +
          \`> 💡 *If this is foreign currency income from IT/software export, it may qualify for full exemption under the Third Schedule of the Inland Revenue Act.*\`);
  }

  if (qLow.match(/expense|spend|spent|spending|cost|breakdown|category|categories|biggest expense/)) {
    let matchedCat = null;
    for (const cat of Object.keys(categoryTotals)) {
      if (qLow.includes(cat.toLowerCase())) { matchedCat = cat; break; }
    }
    if (matchedCat) {
      return \`📊 You spent **\${currency} \${categoryTotals[matchedCat].toLocaleString()}** on **\${matchedCat}**.\\n\\nThat's **\${totalExpense > 0 ? ((categoryTotals[matchedCat]/totalExpense)*100).toFixed(1) : 0}%** of your total expenses.\`;
    }
    const expenseTxCount = userTx.filter(t => t.type === 'expense').length;
    return \`📊 **Your Expense Breakdown:**\\n\\n\` +
      \`• **Total Expenses:** \${currency} \${totalExpense.toLocaleString()} (\${expenseTxCount} transactions)\\n\` +
      \`• **Total Income:** \${currency} \${totalIncome.toLocaleString()}\\n\` +
      \`• **Net Balance:** \${currency} \${netBalance.toLocaleString()}\\n\\n\` +
      \`**Top Spending Categories:**\\n\` +
      (topCats.length > 0
        ? topCats.map(([c, v]) => \`• **\${c}:** \${currency} \${v.toLocaleString()} (\${totalExpense > 0 ? ((v / totalExpense) * 100).toFixed(1) : 0}%)\`).join('\\n')
        : '• No category data recorded yet.');
  }

  if (qLow.match(/balance|net worth|savings|financial position|how much.*have|what.*have/)) {
    return \`💼 **Your Financial Position:**\\n\\n• **Net Balance:** \${currency} \${netBalance.toLocaleString()}\\n• **Total Income:** \${currency} \${totalIncome.toLocaleString()} (\${userTx.filter(t=>t.type==='income').length} transactions)\\n• **Total Expenses:** \${currency} \${totalExpense.toLocaleString()} (\${userTx.filter(t=>t.type==='expense').length} transactions)\\n\\n\${netBalance >= 0 ? '🎉 You are operating at a **positive cash flow!**' : '⚠️ Your expenses currently exceed your income. Review discretionary spending.'}\`;
  }

  if (qLow.match(/budget|burn rate|daily spend|monthly budget|over.*budget/)) {
    const dailyBurn = totalExpense > 0 ? Math.round(totalExpense / 30) : 0;
    return \`🎯 **Budget & Burn Rate Analysis:**\\n\\n\` +
      \`• **Average Daily Spend:** \${currency} \${dailyBurn.toLocaleString()} / day\\n\` +
      \`• **Total Monthly Expenses:** \${currency} \${totalExpense.toLocaleString()}\\n\` +
      \`• **Monthly Inflow:** \${currency} \${totalIncome.toLocaleString()}\\n\\n\` +
      (totalExpense > totalIncome
        ? \`⚠️ **Over Budget Alert:** Your expenses exceed your monthly income by **\${currency} \${(totalExpense - totalIncome).toLocaleString()}**.\`
        : \`✅ **Within Budget:** You have a safe surplus buffer of **\${currency} \${(totalIncome - totalExpense).toLocaleString()}** this cycle.\`);
  }

  if (qLow.match(/tip|tips|advice|save more|improve.*saving|financial tip|recommendation/)) {
    return \`💡 **Cendric Pro Tips for Freelancers:**\\n\\n1. **50/30/20 Rule** — 50% essentials, 30% lifestyle, 20% savings/investments\\n2. **Emergency Fund** — Keep 3–6 months of expenses in a liquid savings account\\n3. **Tax Provision** — Automatically set aside **20–25%** of every client payment for APIT\\n4. **Track Every Receipt** — Use our CSV importer or receipt scanner to log expenses in real-time\\n5. **Invoice in USD** — Sri Lanka's Third Schedule exempts IT export income from income tax\`;
  }

  if (qLow.match(/income|earn|earned|revenue|invoice|payment|client/)) {
    const incTx = userTx.filter(t => t.type === 'income');
    return \`💰 **Income Summary:**\\n\\n• **Total Income:** \${currency} \${totalIncome.toLocaleString()}\\n• **Transactions:** \${incTx.length} income entries\\n• **Average per transaction:** \${currency} \${incTx.length ? (totalIncome/incTx.length).toFixed(0) : 0}\\n\\nYour net balance after expenses is **\${currency} \${netBalance.toLocaleString()}**.\`;
  }

  if (qLow.match(/recent transaction|transaction.*history|last.*transaction|transactions/)) {
    if (userTx.length === 0) {
      return \`📝 You don't have any recorded transactions yet. Add one manually or upload a receipt to get started!\`;
    }
    const recent = userTx.slice(-5).reverse();
    return \`📋 **Your Recent Transactions (Last \${recent.length}):**\\n\\n\` +
      recent.map(t => \`• **\${t.date ? new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}** — \${t.description || 'Transaction'} (\${t.category}): **\${t.type === 'income' ? '+' : '-'}\${currency} \${Number(t.amount).toLocaleString()}**\`).join('\\n') +
      \`\\n\\nYou can view all \${userTx.length} transactions in the Transactions tab.\`;
  }

  if (qLow.match(/^(hello|hi|hey|good morning|good afternoon|good evening)\\b/)) {
    return \`👋 Hello **\${userName}**! I am **Cendric**, your AI finance assistant. You can ask me about your expenses, tax laws, exchange rates, or calculate savings plans. How can I help you today?\`;
  }

  return \`💡 I'm here to help with your finances, **\${userName}**. You can ask:\\n• *"What's my net balance?"* (Current: **\${currency} \${netBalance.toLocaleString()}**)\\n• *"Show my expense breakdown"* (Total: **\${currency} \${totalExpense.toLocaleString()}**)\\n• *"What's the USD exchange rate?"*\\n• *"Calculate my APIT income tax"*\`;
}
`;

// Insert buildRuleBasedResponse above streamChat
const streamChatRegex = /async function streamChat\(req, res\) \{/;
if (!streamChatRegex.test(chatCode)) {
  console.error('ERROR: Could not find async function streamChat in chatController.js');
  process.exit(1);
}
chatCode = chatCode.replace(streamChatRegex, `${buildRuleBasedResponseCode}\nasync function streamChat(req, res) {`);

// Replace the fallback in streamChat
const oldStreamFallbackRegex = /\/\/ Rule-based fallback for general queries\r?\n\s*let answer = '';[\s\S]*?await streamWords\(answer\);/;
const newStreamFallbackCode = `// Rule-based fallback for general queries & suggested questions
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

    await streamWords(answer);`;

if (!oldStreamFallbackRegex.test(chatCode)) {
  console.error('ERROR: Could not find oldStreamFallbackRegex in chatController.js');
  process.exit(1);
}
chatCode = chatCode.replace(oldStreamFallbackRegex, newStreamFallbackCode);

// Replace the fallback in postChatMessage
const oldPostFallbackRegex = /if \(!answer\) \{\r?\n\s*const qLower = q\.toLowerCase\(\);[\s\S]*?answer = `👋 Hello \$\{req\.user\.fullName\.split\(' '\)\[0\]\}! I'm \*\*Cendric\*\*, your personal finance assistant\. Ask me anything about your expenses, tax laws, or savings plans\.`;\r?\n\s*\}\r?\n\s*\}\r?\n\s*\}/;

const newPostFallbackCode = `if (!answer) {
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
      }`;

if (!oldPostFallbackRegex.test(chatCode)) {
  console.error('ERROR: Could not find oldPostFallbackRegex in chatController.js');
  process.exit(1);
}
chatCode = chatCode.replace(oldPostFallbackRegex, newPostFallbackCode);

fs.writeFileSync(chatControllerPath, chatCode, 'utf8');
console.log('Successfully updated backend/controllers/chatController.js');

// 2. Update frontend/dist/assets/cendric-enhancements.js
const enhancementsPath = path.join(__dirname, '../frontend/dist/assets/cendric-enhancements.js');
let enhCode = fs.readFileSync(enhancementsPath, 'utf8');

// Update _wireChips to add console.log and robust text fallback
const oldWireChipsRegex = /function _wireChips\(container\) \{\r?\n\s*container\.querySelectorAll\('\[data-q\]'\)\.forEach\(chip => \{\r?\n\s*chip\.addEventListener\('click', \(\) => \{\r?\n\s*const input = document\.getElementById\('cc-input'\);\r?\n\s*if \(input && !_chatStreaming\) \{\r?\n\s*input\.value = chip\.getAttribute\('data-q'\);\r?\n\s*input\.dispatchEvent\(new Event\('input', \{ bubbles: true \}\)\);\r?\n\s*_sendMessage\(\);\r?\n\s*\}\r?\n\s*\}\);\r?\n\s*\}\);\r?\n\s*\}/;

const newWireChipsCode = `function _wireChips(container) {
    container.querySelectorAll('[data-q]').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = document.getElementById('cc-input');
        if (input && !_chatStreaming) {
          const qText = chip.getAttribute('data-q') || chip.textContent.trim();
          console.log('[Cendric Chat] Suggested question clicked:', qText);
          input.value = qText;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          _sendMessage();
        }
      });
    });
  }`;

if (!oldWireChipsRegex.test(enhCode)) {
  console.error('ERROR: Could not find oldWireChipsRegex in cendric-enhancements.js');
  process.exit(1);
}
enhCode = enhCode.replace(oldWireChipsRegex, newWireChipsCode);

// Add console.log in _sendMessage
const oldSendMessageRegex = /async function _sendMessage\(\) \{\r?\n\s*const input = document\.getElementById\('cc-input'\);\r?\n\s*const sendBtn = document\.getElementById\('cc-send-btn'\);\r?\n\s*if \(!input \|\| _chatStreaming\) return;\r?\n\r?\n\s*const question = input\.value\.trim\(\);\r?\n\s*if \(!question\) return;/;

const newSendMessageCode = `async function _sendMessage() {
    const input = document.getElementById('cc-input');
    const sendBtn = document.getElementById('cc-send-btn');
    if (!input || _chatStreaming) return;

    const question = input.value.trim();
    if (!question) return;

    console.log('[Cendric Chat] Submitting message:', question);`;

if (!oldSendMessageRegex.test(enhCode)) {
  console.error('ERROR: Could not find oldSendMessageRegex in cendric-enhancements.js');
  process.exit(1);
}
enhCode = enhCode.replace(oldSendMessageRegex, newSendMessageCode);

fs.writeFileSync(enhancementsPath, enhCode, 'utf8');
console.log('Successfully updated frontend/dist/assets/cendric-enhancements.js');
