const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/dist/assets/cendric-enhancements.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. New Trilingual I18N Dictionary
const newI18N = `  const I18N = {
    ta: {
      langName: 'Tamil',
      nativeName: 'தமிழ்',
      flag: '🇱🇰',
      // Nav & Brand
      brandTitle: 'CENDRIC',
      brandSubtitle: 'செலவு கண்காணிப்பாளர்',
      navChat: 'AI அரட்டை',
      navTransactions: 'பரிவர்த்தனைகள்',
      navProfile: 'சுயவிவரம்',
      navSettings: 'அமைப்புகள்',
      navTaxEstimator: 'வரி மதிப்பீட்டாளர்',
      navInvoices: 'விலைப்பட்டியல்கள்',
      navReceiptOcr: 'ரசீது OCR',
      navSnapScanBill: 'பில் ஸ்கேனர்',
      financialTools: 'நிதி கருவிகள்',
      preferences: 'விருப்பத்தேர்வுகள்',
      activeWallet: 'சுயாதீன பணப்பை',
      monthlyBudget: 'மாதாந்திர பட்ஜெட்',
      taxSaved: 'சேமிக்கப்பட்ட வரி',
      used: 'பயன்படுத்தப்பட்டது',
      signOut: 'வெளியேறு',
      logoutTooltip: 'வெளியேறு',

      // Settings Page
      settingsTitle: 'அமைப்புகள்',
      settingsSubtitle: 'உங்கள் பயன்பாட்டு விருப்பத்தேர்வுகள், தீம் மற்றும் இயல்புநிலை நாணயத்தை தனிப்பயனாக்குங்கள்',
      appearanceTitle: 'தோற்றம்',
      appearanceSubtitle: 'ஒளி மற்றும் இருண்ட பயன்முறைக்கு இடையில் மாறவும்',
      langSettingsTitle: 'இடைமுக மொழி',
      langSettingsSubtitle: 'முழு பயன்பாட்டிற்கும் உங்கள் விருப்பமான இடைமுக மொழியைத் தேர்ந்தெடுக்கவும் (தமிழ், සිංහල, அல்லது English)',
      currencyPreferenceTitle: 'நாணய விருப்பத்தேர்வு',
      currencyPreferenceSubtitle: 'பரிவர்த்தனைக் காட்சிகள் மற்றும் AI உதவியாளர் அறிக்கைகளுக்கான உங்கள் முதன்மை நாணயத்தைத் தேர்ந்தெடுக்கவும்',
      saveLangToast: 'மொழி மாற்றப்பட்டது:',

      // Profile Page
      profileTitle: 'சுயவிவரம்',
      profileFullName: 'முழுப் பெயர்',
      profileEmail: 'மின்னஞ்சல்',
      profileCurrency: 'நாணயம்',
      profileMemberSince: 'உறுப்பினர் சேர்ந்த திகதி',
      profileAuth: 'அங்கீகாரம்',
      profileTransactionsCount: 'பரிவர்த்தனைகள்',
      profileFooter: 'Cendric · AI-இயங்கும் நிதி உதவியாளர் · பல்கலைக்கழக முன்மாதிரி',

      // Transactions Page
      txTitle: 'பரிவர்த்தனைகள்',
      txSubtitle: 'உங்கள் வருமானம், செலவுகள் மற்றும் விலைப்பட்டியல்களை நிர்வகிக்கவும் கண்காணிக்கவும்',
      addTransaction: 'பரிவர்த்தனை சேர்',
      snapScanBill: 'பில் ஸ்கேன் செய்',
      importCsv: 'வங்கி CSV இறக்குமதி',
      exportCsv: 'CSV ஏற்றுமதி',
      totalIncome: 'மொத்த வருமானம்',
      totalExpenses: 'மொத்த செலவுகள்',
      netBalance: 'நிகர இருப்பு',
      filterAll: 'அனைத்தும்',
      filterIncome: 'வருமானம்',
      filterExpense: 'செலவு',
      searchPlaceholder: 'பரிவர்த்தனைகளைத் தேடுங்கள்…',
      thDate: 'திகதி',
      thDescription: 'விபரம்',
      thCategory: 'வகை',
      thAmount: 'தொகை',
      thType: 'வகை',
      thActions: 'செயல்கள்',
      noTransactionsYet: 'இன்னும் பரிவர்த்தனைகள் இல்லை',
      noTransactionsSub: 'கைமுறையாக ஒன்றைச் சேர்க்கவும் அல்லது அரட்டை உதவியாளரில் ரசீதைப் பதிவேற்றவும்.',
      loadingTransactions: 'பரிவர்த்தனைகள் ஏற்றப்படுகின்றன…',
      addTxnModalTitle: 'பரிவர்த்தனை சேர்',
      editTxnModalTitle: 'பரிவர்த்தனையைத் திருத்து',
      descLabel: 'விபரம்',
      amountLabel: 'தொகை',
      dateLabel: 'திகதி',
      categoryLabel: 'வகை',
      typeLabel: 'வகை',
      saveTxnBtn: 'பரிவர்த்தனையைச் சேமிக்கவும்',
      saving: 'சேமிக்கப்படுகிறது…',

      // Chat Assistant Page
      chatTitle: 'Cendric AI நிதி உதவியாளர்',
      chatAssistantHeader: 'அரட்டை உதவியாளர்',
      chatStatus: 'ஆன்லைன் · Gemini AI மூலம் இயக்கப்படுகிறது',
      newChat: 'புதிய அரட்டை',
      clearChat: 'அழி',
      chatPlaceholder: 'உங்கள் நிதி பற்றி எதையும் கேளுங்கள் அல்லது ரசீதை இணைக்கவும்…',
      chatHint: 'அனுப்ப Enter · புதிய வரிக்கு Shift+Enter · 📎 ரசீதை இணைக்க',
      voiceTooltip: 'குரல் உள்ளீடு (பேச அழுத்தவும்)',
      attachTooltip: 'கோப்பை இணைக்கவும் அல்லது புகைப்படம் எடுக்கவும்',
      thinking: 'சிந்திக்கிறது…',
      welcomeTitle: '👋 வணக்கம்! நான் <strong>Cendric</strong>, உங்கள் நேரடி AI நிதி ஆலோசகர்.',
      welcomeSub: 'உங்கள் பரிவர்த்தனைகள், பட்ஜெட் மற்றும் நேரடி மாற்று விகிதங்கள் எனக்குத் தெரியும். எதையும் கேளுங்கள்!',
      chipNetBalance: '💼 நிகர இருப்பு',
      chipSpending: '📊 செலவு பகுப்பாய்வு',
      chipRates: '💱 மாற்று விகிதங்கள்',
      chipTaxDeadlines: '📅 வரி காலக்கெடு',
      chipTips: '💡 நிதி குறிப்புகள்',
      pillUpwork: '🇱🇰 Upwork வரி',
      pillApit: '🧮 APIT கணக்கீடு',
      pillDeductions: '📋 வரி விலக்குகள்',
      pillTin: '🆔 TIN பதிவு',
      pillBurnRate: '🔥 செலவு வேகம்',
      newChatToast: '✨ புதிய அரட்டை அமர்வு தொடங்கியது',
      clearedChatToast: '🗑️ அரட்டை வரலாறு அழிக்கப்பட்டது',

      // Receipt Extracted Card
      receiptExtracted: '📄 ரசீது பிரித்தெடுக்கப்பட்டது',
      reviewDetails: 'சேமிப்பதற்கு முன் கீழே உள்ள விவரங்களை மதிப்பாய்வு செய்யவும்',
      confirmAndSave: 'உறுதி செய்து சேமிக்கவும்',
      edit: 'திருத்து',
      preview: 'முன்னோட்டம்',
      receiptDismissed: '❌ ரசீது நிராகரிக்கப்பட்டது — எதுவும் சேமிக்கப்படவில்லை.',
      receiptSavedPrefix: '✅ சேமிக்கப்பட்டது',
      viewInTransactions: 'பரிவர்த்தனைகள் தாவலில் இதைப் பார்க்கலாம்.',

      // Scanner Modal
      billScannerTitle: 'பில் & ரசீது ஸ்கேனர்',
      billScannerSubtitle: 'இலங்கை சுயாதீனர்களுக்கான உடனடி AI பில் & ரசீது ஸ்கேனர்',
      centerBill: 'பில் அல்லது ரசீதை சட்டகத்திற்குள் மையப்படுத்தவும்',
      captureBill: 'படம் எடு',
      uploadBill: 'படம் பதிவேற்று',
      analyzingBill: 'AI மூலம் பில் விபரங்கள் பகுப்பாய்வு செய்யப்படுகின்றன...',
      billDetails: 'பகுப்பாய்வு செய்யப்பட்ட பில் விபரங்கள்',
      amount: 'தொகை',
      vendor: 'விற்பனையாளர் / விபரம்',
      category: 'வகை',
      date: 'திகதி',
      type: 'பரிவர்த்தனை வகை',
      expense: 'செலவு',
      income: 'வருமானம்',
      saveTransaction: 'உறுதி செய்து சேமிக்கவும்',
      retakePhoto: 'மீண்டும் படம் எடு',
      scanSuccess: 'பில் வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
      takePhoto: 'புகைப்படம் எடுங்கள்',
      takePhotoDesc: 'கேமராவைப் பயன்படுத்தவும்',
      uploadFile: 'கோப்பு / படம் பதிவேற்றவும்',
      uploadFileDesc: 'ரசீதுகள், பில்கள் அல்லது PDFs'
    },
    si: {
      langName: 'Sinhala',
      nativeName: 'සිංහල',
      flag: '🇱🇰',
      // Nav & Brand
      brandTitle: 'CENDRIC',
      brandSubtitle: 'වියදම් ලුහුබැඳීම',
      navChat: 'AI සංවාදය',
      navTransactions: 'ගනුදෙනු',
      navProfile: 'පැතිකඩ',
      navSettings: 'සැකසුම්',
      navTaxEstimator: 'බදු ඇස්තමේන්තුව',
      navInvoices: 'ඉන්වොයිසි',
      navReceiptOcr: 'රිසිට්පත් OCR',
      navSnapScanBill: 'බිල්පත් ස්කෑනරය',
      financialTools: 'මූල්‍ය මෙවලම්',
      preferences: 'මනාපයන්',
      activeWallet: 'නිදහස් මුදල් පසුම්බිය',
      monthlyBudget: 'මාසික අයවැය',
      taxSaved: 'ඉතිරි කළ බදු',
      used: 'භාවිතා විය',
      signOut: 'ඉවත් වන්න',
      logoutTooltip: 'ඉවත් වන්න',

      // Settings Page
      settingsTitle: 'සැකසුම්',
      settingsSubtitle: 'ඔබගේ යෙදුම් මනාපයන්, තේමාව සහ පෙරනිමි මුදල් ඒකකය සකසන්න',
      appearanceTitle: 'පෙනුම',
      appearanceSubtitle: 'ලා මාදිලිය සහ අඳුරු මාදිලිය අතර මාරු වන්න',
      langSettingsTitle: 'අතුරුමුහුණත් භාෂාව',
      langSettingsSubtitle: 'සම්පූර්ණ යෙදුම සඳහා ඔබ කැමති අතුරුමුහුණත් භාෂාව තෝරන්න (தமிழ், සිංහල, හෝ English)',
      currencyPreferenceTitle: 'මුදල් ඒකක මනාපය',
      currencyPreferenceSubtitle: 'ගනුදෙනු සංදර්ශන සහ AI සහායක වාර්තා සඳහා ඔබේ මූලික මුදල් ඒකකය තෝරන්න',
      saveLangToast: 'භාෂාව යාවත්කාලීන විය:',

      // Profile Page
      profileTitle: 'පැතිකඩ',
      profileFullName: 'සම්පූර්ණ නම',
      profileEmail: 'විද්‍යුත් තැපෑල',
      profileCurrency: 'මුදල් ඒකකය',
      profileMemberSince: 'ලියාපදිංචි දිනය',
      profileAuth: 'සත්‍යාපනය',
      profileTransactionsCount: 'ගනුදෙනු',
      profileFooter: 'Cendric · AI මූල්‍ය සහායක · විශ්වවිද්‍යාල මූලාකෘතිය',

      // Transactions Page
      txTitle: 'ගනුදෙනු',
      txSubtitle: 'ඔබගේ ආදායම, වියදම් සහ ඉන්වොයිසි කළමනාකරණය සහ නිරීක්ෂණය කරන්න',
      addTransaction: 'ගනුදෙනුවක් එක් කරන්න',
      snapScanBill: 'බිල්පත ස්කෑන් කරන්න',
      importCsv: 'බැංකු CSV ආයාත කරන්න',
      exportCsv: 'CSV අපනයනය',
      totalIncome: 'මුළු ආදායම',
      totalExpenses: 'මුළු වියදම',
      netBalance: 'ශුද්ධ ශේෂය',
      filterAll: 'සියල්ල',
      filterIncome: 'ආදායම',
      filterExpense: 'වියදම',
      searchPlaceholder: 'ගනුදෙනු සොයන්න…',
      thDate: 'දිනය',
      thDescription: 'විස්තරය',
      thCategory: 'ප්‍රවර්ගය',
      thAmount: 'මුදල',
      thType: 'වර්ගය',
      thActions: 'ක්‍රියා',
      noTransactionsYet: 'තවමත් ගනුදෙනු නොමැත',
      noTransactionsSub: 'අතින් ගනුදෙනුවක් එක් කරන්න හෝ Chat Assistant වෙත රිසිට්පතක් උඩුගත කරන්න.',
      loadingTransactions: 'ගනුදෙනු පූරණය වෙමින් පවතී…',
      addTxnModalTitle: 'ගනුදෙනුවක් එක් කරන්න',
      editTxnModalTitle: 'ගනුදෙනුව සංස්කරණය කරන්න',
      descLabel: 'විස්තරය',
      amountLabel: 'මුදල',
      dateLabel: 'දිනය',
      categoryLabel: 'ප්‍රවර්ගය',
      typeLabel: 'වර්ගය',
      saveTxnBtn: 'ගනුදෙනුව සුරකින්න',
      saving: 'සුරකිමින්…',

      // Chat Assistant Page
      chatTitle: 'Cendric AI මූල්‍ය සහායක',
      chatAssistantHeader: 'සංවාද සහායක',
      chatStatus: 'සක්‍රියයි · Gemini AI මඟින් බලගැන්වේ',
      newChat: 'නව සංවාදය',
      clearChat: 'මකන්න',
      chatPlaceholder: 'ඔබගේ මූල්‍ය පිළිබඳ ඕනෑම දෙයක් අසන්න හෝ රිසිට්පතක් අමුණන්න…',
      chatHint: 'යැවීමට Enter · නව පේළියකට Shift+Enter · 📎 රිසිට්පතක් එක් කිරීමට',
      voiceTooltip: 'හඬ ආදානය (කතා කිරීමට ඔබන්න)',
      attachTooltip: 'ගොනුවක් අමුණන්න හෝ ඡායාරූපයක් ගන්න',
      thinking: 'සිතමින් පවතී…',
      welcomeTitle: '👋 ආයුබෝවන්! මම <strong>Cendric</strong>, ඔබගේ ක්ෂණික AI මූල්‍ය උපදේශක.',
      welcomeSub: 'ඔබගේ ගනුදෙනු, අයවැය සහ සජීවී විනිමය අනුපාත මා සතුව ඇත. ඕනෑම දෙයක් අසන්න!',
      chipNetBalance: '💼 ශුද්ධ ශේෂය',
      chipSpending: '📊 වියදම් විස්තරය',
      chipRates: '💱 විනිමය අනුපාත',
      chipTaxDeadlines: '📅 බදු දිනයන්',
      chipTips: '💡 මූල්‍ය උපදෙස්',
      pillUpwork: '🇱🇰 Upwork බදු',
      pillApit: '🧮 APIT ගණනය',
      pillDeductions: '📋 බදු සහන',
      pillTin: '🆔 TIN ලියාපදිංචිය',
      pillBurnRate: '🔥 වියදම් වේගය',
      newChatToast: '✨ නව සංවාදයක් ආරම්භ විය',
      clearedChatToast: '🗑️ සංවාද ඉතිහාසය මකා දමන ලදී',

      // Receipt Extracted Card
      receiptExtracted: '📄 රිසිට්පත් තොරතුරු ලබා ගන්නා ලදී',
      reviewDetails: 'සුරැකීමට පෙර පහත විස්තර පරීක්ෂා කරන්න',
      confirmAndSave: 'තහවුරු කර සුරකින්න',
      edit: 'සංස්කරණය',
      preview: 'පෙරදසුන',
      receiptDismissed: '❌ රිසිට්පත ඉවත් කරන ලදී — කිසිවක් සුරකිනු ලැබුවේ නැත.',
      receiptSavedPrefix: '✅ සාර්ථකව සුරකින ලදී',
      viewInTransactions: 'ඔබට එය Transactions ටැබ් එකෙන් නැරඹිය හැකිය.',

      // Scanner Modal
      billScannerTitle: 'බිල්පත් සහ රිසිට්පත් ස්කෑනරය',
      billScannerSubtitle: 'ශ්‍රී ලාංකික නිදහස් වෘත්තිකයන් සඳහා ක්ෂණික AI බිල්පත් ස්කෑනරය',
      centerBill: 'බිල්පත හෝ රිසිට්පත කැමරා රාමුව මැද තබන්න',
      captureBill: 'ඡායාරූපය ගන්න',
      uploadBill: 'ඡායාරූපයක් උඩුගත කරන්න',
      analyzingBill: 'AI මඟින් බිල්පත් තොරතුරු විශ්ලේෂණය කරයි...',
      billDetails: 'විශ්ලේෂණය කළ බිල්පත් විස්තර',
      amount: 'මුදල',
      vendor: 'විකුණුම්කරු / විස්තරය',
      category: 'ප්‍රවර්ගය',
      date: 'දිනය',
      type: 'ගනුදෙනු වර්ගය',
      expense: 'වියදම',
      income: 'ආදායම',
      saveTransaction: 'තහවුරු කර සුරකින්න',
      retakePhoto: 'නැවත ඡායාරූපය ගන්න',
      scanSuccess: 'බිල්පත සාර්ථකව සටහන් විය!',
      takePhoto: 'ඡායාරූපයක් ගන්න',
      takePhotoDesc: 'කැමරාව භාවිතයෙන්',
      uploadFile: 'ගොනුව / පින්තූරය උඩුගත කරන්න',
      uploadFileDesc: 'රිසිට්පත්, බිල්පත් හෝ PDFs'
    },
    en: {
      langName: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      // Nav & Brand
      brandTitle: 'CENDRIC',
      brandSubtitle: 'Expense Tracker',
      navChat: 'Chat Assistant',
      navTransactions: 'Transactions',
      navProfile: 'Profile',
      navSettings: 'Settings',
      navTaxEstimator: 'Tax Estimator',
      navInvoices: 'Invoices',
      navReceiptOcr: 'Receipt OCR',
      navSnapScanBill: 'Snap & Scan Bill',
      financialTools: 'Financial Tools',
      preferences: 'Preferences',
      activeWallet: 'Freelance Wallet',
      monthlyBudget: 'Monthly Budget',
      taxSaved: 'Tax Saved',
      used: 'used',
      signOut: 'Sign Out',
      logoutTooltip: 'Logout',

      // Settings Page
      settingsTitle: 'Settings',
      settingsSubtitle: 'Customize your app preferences, theme, and default currency',
      appearanceTitle: 'Appearance',
      appearanceSubtitle: 'Switch between Light mode and Dark mode',
      langSettingsTitle: 'Interface Language',
      langSettingsSubtitle: 'Select your preferred interface language for the entire app (Tamil, Sinhala, or English)',
      currencyPreferenceTitle: 'Currency Preference',
      currencyPreferenceSubtitle: 'Select your primary currency for transaction displays & AI assistant reports',
      saveLangToast: 'Language updated to:',

      // Profile Page
      profileTitle: 'Profile',
      profileFullName: 'Full Name',
      profileEmail: 'Email',
      profileCurrency: 'Currency',
      profileMemberSince: 'Member Since',
      profileAuth: 'Auth',
      profileTransactionsCount: 'Transactions',
      profileFooter: 'Cendric · AI-Powered Finance Assistant · University Prototype',

      // Transactions Page
      txTitle: 'Transactions',
      txSubtitle: 'Manage and track your income, expenses, and invoices',
      addTransaction: 'Add Transaction',
      snapScanBill: 'Snap & Scan Bill',
      importCsv: 'Import Bank CSV',
      exportCsv: 'Export CSV',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netBalance: 'Net Balance',
      filterAll: 'All',
      filterIncome: 'Income',
      filterExpense: 'Expense',
      searchPlaceholder: 'Search transactions…',
      thDate: 'Date',
      thDescription: 'Description',
      thCategory: 'Category',
      thAmount: 'Amount',
      thType: 'Type',
      thActions: 'Actions',
      noTransactionsYet: 'No transactions yet',
      noTransactionsSub: 'Add one manually or upload a receipt in Chat Assistant.',
      loadingTransactions: 'Loading transactions…',
      addTxnModalTitle: 'Add Transaction',
      editTxnModalTitle: 'Edit Transaction',
      descLabel: 'Description',
      amountLabel: 'Amount',
      dateLabel: 'Date',
      categoryLabel: 'Category',
      typeLabel: 'Type',
      saveTxnBtn: 'Save Transaction',
      saving: 'Saving…',

      // Chat Assistant Page
      chatTitle: 'Cendric AI Finance Assistant',
      chatAssistantHeader: 'Chat Assistant',
      chatStatus: 'Online · Powered by Gemini AI',
      newChat: 'New Chat',
      clearChat: 'Clear',
      chatPlaceholder: 'Ask anything about your finances or attach a receipt…',
      chatHint: 'Press Enter to send · Shift+Enter for new line · 📎 to attach a receipt',
      voiceTooltip: 'Voice input (hold to speak)',
      attachTooltip: 'Attach file or take photo',
      thinking: 'Thinking…',
      welcomeTitle: '👋 Hi! I\\'m <strong>Cendric</strong>, your real-time finance AI.',
      welcomeSub: 'I have full context of your transactions, budgets, and live exchange rates. Ask me anything!',
      chipNetBalance: '💼 Net balance',
      chipSpending: '📊 Spending breakdown',
      chipRates: '💱 Exchange rates',
      chipTaxDeadlines: '📅 Tax deadlines',
      chipTips: '💡 Finance tips',
      pillUpwork: '🇱🇰 Upwork tax',
      pillApit: '🧮 APIT calculator',
      pillDeductions: '📋 Deductions',
      pillTin: '🆔 TIN registration',
      pillBurnRate: '🔥 Burn rate',
      newChatToast: '✨ Started a new chat session',
      clearedChatToast: '🗑️ Chat history cleared',

      // Receipt Extracted Card
      receiptExtracted: '📄 Receipt Extracted',
      reviewDetails: 'Review the details below before saving',
      confirmAndSave: 'Confirm & Save',
      edit: 'Edit',
      preview: 'Preview',
      receiptDismissed: '❌ Receipt dismissed — nothing was saved.',
      receiptSavedPrefix: '✅ Saved',
      viewInTransactions: 'You can view it in the Transactions tab.',

      // Scanner Modal
      billScannerTitle: 'Snap & Scan Bill / Receipt',
      billScannerSubtitle: 'Instant AI bill & receipt scanner for Sri Lankan freelancers',
      centerBill: 'Center bill or receipt within viewfinder frame',
      captureBill: 'Capture Bill',
      uploadBill: 'Upload Photo',
      analyzingBill: 'Analyzing bill details with Cendric AI...',
      billDetails: 'Extracted Bill Details',
      amount: 'Amount',
      vendor: 'Vendor / Description',
      category: 'Category',
      date: 'Date',
      type: 'Transaction Type',
      expense: 'Expense',
      income: 'Income',
      saveTransaction: 'Confirm & Save Transaction',
      retakePhoto: 'Retake Photo',
      scanSuccess: 'Bill successfully recorded!',
      takePhoto: 'Take Photo',
      takePhotoDesc: 'Use device camera',
      uploadFile: 'Upload File / Image',
      uploadFileDesc: 'Receipts, bills, photos or PDFs'
    }
  };`;

// 2. Comprehensive applyLanguage function
const newApplyLanguage = `  function applyLanguage(lang) {
    const l = I18N[lang] || I18N.en;

    // 0. Top Dock Header Language Switcher
    const headerLangText = document.getElementById('cendric-header-lang-text');
    if (headerLangText) {
      headerLangText.textContent = \`\${l.flag} \${l.nativeName}\`;
    }
    document.querySelectorAll('.cendric-header-lang-opt').forEach(opt => {
      if (opt.getAttribute('data-code') === lang) opt.classList.add('active');
      else opt.classList.remove('active');
    });

    // 1. Sidebar Nav & Branding
    const aside = document.querySelector('aside');
    if (aside) {
      const brandP = aside.querySelectorAll('p');
      if (brandP && brandP.length >= 2) {
        brandP[0].textContent = l.brandTitle;
        brandP[1].textContent = l.brandSubtitle;
      }

      const navLinks = aside.querySelectorAll('nav a');
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        const labelSpan = a.querySelector('span:not(.cendric-nav-badge)');
        if (!labelSpan) return;
        if (href === '/chat' || href === '/') labelSpan.textContent = l.navChat;
        else if (href === '/transactions') labelSpan.textContent = l.navTransactions;
        else if (href === '/profile') labelSpan.textContent = l.navProfile;
        else if (href === '/settings') labelSpan.textContent = l.navSettings;
      });

      const taxLink = document.querySelector('#cendric-nav-tax span');
      if (taxLink) taxLink.textContent = l.navTaxEstimator;
      const invLink = document.querySelector('#cendric-nav-invoice span');
      if (invLink) invLink.textContent = l.navInvoices;
      const ocrLink = document.querySelector('#cendric-nav-ocr span');
      if (ocrLink) ocrLink.textContent = l.navReceiptOcr;
      const scanLink = document.querySelector('#cendric-nav-camera-bill span');
      if (scanLink) scanLink.textContent = l.navSnapScanBill;

      const dividers = aside.querySelectorAll('.cendric-sidebar-section-divider span');
      if (dividers[0]) dividers[0].textContent = l.financialTools;
      if (dividers[1]) dividers[1].textContent = l.preferences;

      const walletName = document.querySelector('.cendric-wallet-name');
      if (walletName) walletName.textContent = l.activeWallet;

      const budgetTitle = document.querySelector('.cendric-widget-title');
      if (budgetTitle) budgetTitle.textContent = l.monthlyBudget;
      const taxSavedLabel = document.querySelector('.cendric-widget-stat-label');
      if (taxSavedLabel) taxSavedLabel.textContent = l.taxSaved;

      const logoutBtn = aside.querySelector('button[title="Logout"]');
      if (logoutBtn) logoutBtn.title = l.logoutTooltip;
    }

    // 2. Settings Page
    if (location.pathname.includes('/settings')) {
      const settingsH1 = document.querySelector('main div[style*=\"720px\"] h1');
      if (settingsH1) settingsH1.textContent = l.settingsTitle;
      const settingsSub = document.querySelector('main div[style*=\"720px\"] h1 + p');
      if (settingsSub) settingsSub.textContent = l.settingsSubtitle;

      const settingsCards = document.querySelectorAll('main div[style*=\"720px\"] div[style*=\"border-radius: 20px\"]');
      settingsCards.forEach(card => {
        const h2 = card.querySelector('h2');
        const p = card.querySelector('p');
        if (!h2) return;
        const h2Text = h2.textContent.trim();
        if (card.id === 'cendric-language-settings-card' || h2.id === 'cendric-lang-card-title') {
          h2.textContent = l.langSettingsTitle;
          const sub = card.querySelector('#cendric-lang-card-sub');
          if (sub) sub.textContent = l.langSettingsSubtitle;
        } else if (['Appearance', 'පෙනුම', 'தோற்றம்'].includes(h2Text)) {
          h2.textContent = l.appearanceTitle;
          if (p) p.textContent = l.appearanceSubtitle;
        } else if (['Currency Preference', 'මුදල් ඒකක මනාපය', 'நாணய விருப்பத்தேர்வு'].includes(h2Text)) {
          h2.textContent = l.currencyPreferenceTitle;
          if (p) p.textContent = l.currencyPreferenceSubtitle;
        }
      });

      document.querySelectorAll('.cendric-lang-card').forEach(tile => {
        const code = tile.getAttribute('data-lang');
        const chk = tile.querySelector('.cendric-lang-check');
        if (code === lang) {
          tile.classList.add('active');
          if (chk) chk.textContent = '✓';
        } else {
          tile.classList.remove('active');
          if (chk) chk.textContent = '';
        }
      });
    }

    // 3. Profile Page
    if (location.pathname.includes('/profile')) {
      const profH1 = document.querySelector('main div[style*=\"640px\"] h1');
      if (profH1) profH1.textContent = l.profileTitle;

      const txStatLabel = document.querySelector('main div[style*=\"640px\"] p[style*=\"letter-spacing\"]');
      if (txStatLabel) txStatLabel.textContent = l.profileTransactionsCount;

      const profileRows = document.querySelectorAll('main div[style*=\"640px\"] div[style*=\"border-bottom\"], main div[style*=\"640px\"] div[style*=\"gap: 16px\"]');
      profileRows.forEach(row => {
        const pLabel = row.querySelector('div > p:first-child');
        if (!pLabel) return;
        const txt = pLabel.textContent.trim().toUpperCase();
        if (txt.includes('FULL NAME') || txt.includes('සම්පූර්ණ නම') || txt.includes('முழுப் பெயர்')) pLabel.textContent = l.profileFullName.toUpperCase();
        else if (txt.includes('EMAIL') || txt.includes('විද්‍යුත් තැපෑල') || txt.includes('மின்னஞ்சல்')) pLabel.textContent = l.profileEmail.toUpperCase();
        else if (txt.includes('CURRENCY') || txt.includes('මුදල් ඒකකය') || txt.includes('நாணயம்')) pLabel.textContent = l.profileCurrency.toUpperCase();
        else if (txt.includes('MEMBER') || txt.includes('ලියාපදිංචි') || txt.includes('உறுப்பினர்')) pLabel.textContent = l.profileMemberSince.toUpperCase();
        else if (txt.includes('AUTH') || txt.includes('සත්‍යාපනය') || txt.includes('அங்கீகாரம்')) pLabel.textContent = l.profileAuth.toUpperCase();
      });

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        const svg = logoutBtn.querySelector('svg');
        logoutBtn.innerHTML = '';
        if (svg) logoutBtn.appendChild(svg);
        logoutBtn.appendChild(document.createTextNode(' ' + l.signOut));
      }

      const footerP = document.querySelector('main div[style*=\"640px\"] > p:last-child');
      if (footerP) footerP.textContent = l.profileFooter;
    }

    // 4. Transactions Page
    if (location.pathname.includes('/transactions')) {
      const txH1 = document.querySelector('main h1');
      if (txH1) txH1.textContent = l.txTitle;

      const txSub = document.querySelector('main h1 + p');
      if (txSub) {
        const match = txSub.textContent.match(/\\d+/);
        const count = match ? match[0] : '';
        txSub.textContent = count ? \`\${count} \${l.txTitle.toLowerCase()} total\` : l.txSubtitle;
      }

      const addBtn = document.querySelector('#add-transaction-btn') || document.querySelector('.cendric-primary-action-btn');
      if (addBtn) addBtn.innerHTML = \`<span>+</span> \${l.addTransaction}\`;
      const scanBtn = document.getElementById('cendric-scan-bill-btn');
      if (scanBtn) scanBtn.innerHTML = \`<span>📸</span> \${l.snapScanBill}\`;
      const taxBtn = document.getElementById('cendric-tax-calc-btn');
      if (taxBtn) taxBtn.innerHTML = \`<span>🧮</span> \${l.navTaxEstimator}\`;
      const invBtn = document.getElementById('cendric-create-invoice-btn');
      if (invBtn) invBtn.innerHTML = \`<span>🧾</span> \${l.navInvoices}\`;
      const csvBtn = document.getElementById('cendric-import-csv-btn');
      if (csvBtn) csvBtn.innerHTML = \`<span>📥</span> \${l.importCsv}\`;
      const exportBtn = document.getElementById('cendric-export-btn');
      if (exportBtn) {
        exportBtn.innerHTML = \`<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"7 10 12 15 17 10\"></polyline><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"></line></svg> \${l.exportCsv}\`;
      }

      document.querySelectorAll('main p').forEach(p => {
        const text = p.textContent.trim();
        if (['Total Income', 'මුළු ආදායම', 'மொத்த வருமானம்'].includes(text)) {
          p.textContent = l.totalIncome;
        } else if (['Total Expenses', 'මුළු වියදම', 'மொத்த செலவுகள்'].includes(text)) {
          p.textContent = l.totalExpenses;
        } else if (['Net Balance', 'ශුද්ධ ශේෂය', 'நிகர இருப்பு'].includes(text)) {
          p.textContent = l.netBalance;
        } else if (['No transactions yet', 'තවමත් ගනුදෙනු නොමැත', 'இன்னும் பரிவர்த்தனைகள் இல்லை'].includes(text)) {
          p.textContent = l.noTransactionsYet;
        } else if (text.includes('Add one manually') || text.includes('අතින් ගනුදෙනුවක්') || text.includes('கைமுறையாக ஒன்றை')) {
          p.textContent = l.noTransactionsSub;
        }
      });

      // Filter tabs
      document.querySelectorAll('main button').forEach(btn => {
        const txt = btn.textContent.trim();
        if (['All', 'அனைத்தும்', 'සියල්ල'].includes(txt)) btn.textContent = l.filterAll;
        else if (['Income', 'வருமானம்', 'ආදායම'].includes(txt) && !btn.id?.includes('transaction')) btn.textContent = l.filterIncome;
        else if (['Expense', 'செலவு', 'වියදම', 'Expenses'].includes(txt) && !btn.id?.includes('transaction') && !btn.closest('.cendric-stat-card')) btn.textContent = l.filterExpense;
      });

      const searchInput = document.querySelector('main input[placeholder*=\"Search\"], main input[placeholder*=\"தேடு\"], main input[placeholder*=\"සොය\"]');
      if (searchInput) searchInput.placeholder = l.searchPlaceholder;

      // Table headers
      document.querySelectorAll('table th').forEach(th => {
        const txt = th.textContent.trim();
        if (['Date', 'திகதி', 'දිනය'].includes(txt)) th.textContent = l.thDate;
        else if (['Description', 'விபரம்', 'විස්තරය'].includes(txt)) th.textContent = l.thDescription;
        else if (['Category', 'வகை', 'ප්‍රවර්ගය'].includes(txt)) th.textContent = l.thCategory;
        else if (['Amount', 'தொகை', 'මුදල'].includes(txt)) th.textContent = l.thAmount;
        else if (['Type', 'வகை', 'වර්ගය'].includes(txt)) th.textContent = l.thType;
        else if (['Actions', 'செயல்கள்', 'ක්‍රියා'].includes(txt)) th.textContent = l.thActions;
      });

      // Modal labels if open
      const modal = document.querySelector('div[style*=\"z-index: 999\"], div[style*=\"z-index: 9999\"]');
      if (modal) {
        const modalH2 = modal.querySelector('h2');
        if (modalH2) {
          const txt = modalH2.textContent.trim();
          if (txt.includes('Add') || txt.includes('එක්') || txt.includes('சேர்')) modalH2.textContent = l.addTxnModalTitle;
          else if (txt.includes('Edit') || txt.includes('සංස්කරණය') || txt.includes('திருத்து')) modalH2.textContent = l.editTxnModalTitle;
        }
        modal.querySelectorAll('label').forEach(lbl => {
          const t = lbl.textContent.trim();
          if (['Description', 'විස්තරය', 'விபரம்'].includes(t)) lbl.textContent = l.descLabel;
          else if (['Amount', 'මුදල', 'தொகை'].includes(t)) lbl.textContent = l.amountLabel;
          else if (['Date', 'දිනය', 'திகதி'].includes(t)) lbl.textContent = l.dateLabel;
          else if (['Category', 'ප්‍රවර්ගය', 'வகை'].includes(t)) lbl.textContent = l.categoryLabel;
          else if (['Type', 'වර්ගය', 'வகை'].includes(t)) lbl.textContent = l.typeLabel;
        });
        const saveBtn = modal.querySelector('#save-transaction-btn, button[type=\"submit\"]');
        if (saveBtn) {
          const svg = saveBtn.querySelector('svg');
          saveBtn.innerHTML = '';
          if (svg) saveBtn.appendChild(svg);
          saveBtn.appendChild(document.createTextNode(' ' + l.saveTxnBtn));
        }
      }
    }

    // 5. Chat Assistant Page
    if (location.pathname.includes('/chat') || location.pathname === '/') {
      const chatTitle = document.querySelector('.cc-title');
      if (chatTitle) chatTitle.textContent = l.chatTitle;

      const chatHeaderTitle = document.querySelector('main h1.font-bold');
      if (chatHeaderTitle) chatHeaderTitle.textContent = l.chatAssistantHeader;

      const chatStatus = document.getElementById('cc-status');
      if (chatStatus && typeof _chatStreaming !== 'undefined' && !_chatStreaming) {
        chatStatus.innerHTML = \`<span class=\"cc-status-dot\"></span> \${l.chatStatus}\`;
      }

      const newChatSpan = document.querySelector('#cc-new-chat-btn span');
      if (newChatSpan) newChatSpan.textContent = l.newChat;
      const clearSpan = document.querySelector('#cc-clear-btn span');
      if (clearSpan) clearSpan.textContent = l.clearChat;

      const chatInput = document.getElementById('cc-input') || document.getElementById('chat-input');
      if (chatInput) chatInput.placeholder = l.chatPlaceholder;

      const chatHint = document.querySelector('.cc-input-hint');
      if (chatHint) chatHint.textContent = l.chatHint;

      const voiceBtn = document.getElementById('cc-voice-btn');
      if (voiceBtn) voiceBtn.title = l.voiceTooltip;

      const attachBtn = document.getElementById('attach-receipt-btn');
      if (attachBtn) attachBtn.title = l.attachTooltip;

      // Localize welcome bubble if still shown
      const welcomeBubble = document.querySelector('#cc-welcome .cc-bubble');
      if (welcomeBubble) {
        welcomeBubble.innerHTML = \`
          <p>\${l.welcomeTitle}</p>
          <p style=\"margin-top:8px; font-size:12.5px; opacity:0.8;\">\${l.welcomeSub}</p>
        \`;
      }

      // Localize Extracted Receipt Card elements if present
      document.querySelectorAll('#confirm-receipt-btn').forEach(btn => {
        const svg = btn.querySelector('svg');
        btn.innerHTML = '';
        if (svg) btn.appendChild(svg);
        btn.appendChild(document.createTextNode(' ' + l.confirmAndSave));
      });
      document.querySelectorAll('#edit-receipt-btn').forEach(btn => {
        const svg = btn.querySelector('svg');
        btn.innerHTML = '';
        if (svg) btn.appendChild(svg);
        btn.appendChild(document.createTextNode(' ' + l.edit));
      });
    }

    // Dispatch global event so any active views/controllers update
    window.dispatchEvent(new CustomEvent('cendric:language-applied', { detail: { lang } }));
  }`;

// 3. Replace I18N
const i18nRegex = /const I18N = \{[\s\S]*?\n  \};\r?\n/;
if (i18nRegex.test(code)) {
  code = code.replace(i18nRegex, newI18N + '\n');
  console.log('Replaced I18N dictionary');
} else {
  console.error('Could not match I18N regex');
}

// 4. Replace applyLanguage
const applyLangRegex = /function applyLanguage\(lang\) \{[\s\S]*?\n  \}\r?\n/;
if (applyLangRegex.test(code)) {
  code = code.replace(applyLangRegex, newApplyLanguage + '\n');
  console.log('Replaced applyLanguage function');
} else {
  console.error('Could not match applyLanguage regex');
}

// 5. Fix enhanceSettingsPage curInfo
const curInfoTarget = /const curLang = getCurrentLang\(\);\r?\n\s+const langCard = document\.createElement\('div'\);/;
const curInfoReplace = `const curLang = getCurrentLang();\n      const curInfo = I18N[curLang] || I18N.en;\n      const langCard = document.createElement('div');`;
if (curInfoTarget.test(code)) {
  code = code.replace(curInfoTarget, curInfoReplace);
  console.log('Fixed curInfo in enhanceSettingsPage');
} else {
  console.log('curInfo target in enhanceSettingsPage not matched (may already be set)');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully written updated cendric-enhancements.js. New length:', code.length);
