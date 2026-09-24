const questions = [
  "What's my net balance?",
  "Give me financial tips",
  "Show my expense breakdown",
  "How much income did I earn?",
  "Am I over my monthly budget?",
  "Show my top spending categories",
  "What are my biggest expenses?",
  "Show spending by category",
  "What's the USD to LKR rate today?",
  "What are the IRD tax filing deadlines?",
  "Show my recent transactions",
  "What freelance expenses can I deduct?"
];

function routeIntent(q) {
  const qLow = q.toLowerCase();

  if (qLow.match(/exchange rate|usd|currency rate|rates today|dollar|eur|gbp|inr|aud|cad/)) {
    return 'EXCHANGE_RATES';
  }
  if (qLow.match(/tax|apit|ird|taxable|deduction|tin\b|deadline|upwork.*tax/)) {
    return 'TAX_ASSESSMENT';
  }
  if (qLow.match(/expense|spend|spent|spending|cost|breakdown|category|categories|biggest expense/)) {
    return 'EXPENSE_BREAKDOWN';
  }
  if (qLow.match(/balance|net worth|savings|financial position|how much.*have|what.*have/)) {
    return 'NET_BALANCE';
  }
  if (qLow.match(/budget|burn rate|daily spend|monthly budget|over.*budget/)) {
    return 'BUDGET_ANALYSIS';
  }
  if (qLow.match(/tip|tips|advice|save more|improve.*saving|financial tip|recommendation/)) {
    return 'FINANCIAL_TIPS';
  }
  if (qLow.match(/income|earn|earned|revenue|invoice|payment|client/)) {
    return 'INCOME_SUMMARY';
  }
  if (qLow.match(/recent transaction|transaction.*history|last.*transaction|transactions/)) {
    return 'RECENT_TRANSACTIONS';
  }
  if (qLow.match(/^(hello|hi|hey|good morning|good evening|good afternoon)\b/)) {
    return 'GREETING';
  }
  return 'FALLBACK_HELP';
}

console.log('Testing NEW routing:');
questions.forEach(q => {
  console.log(`"${q}" => ${routeIntent(q)}`);
});
