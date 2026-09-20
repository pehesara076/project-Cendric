const express = require('express');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const verifyToken = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const router = express.Router();

// POST /api/chat/message
router.post('/message', verifyToken, async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select('fullName currencyPreference');

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId });
    }
    if (!session) {
      session = await ChatSession.create({ userId });
    }

    // Persist user message
    await ChatMessage.create({ sessionId: session._id, userId, role: 'user', content: question });

    // ── Build financial context from MongoDB ─────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get this month's transactions
    const monthlyTransactions = await Transaction.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 });

    // Aggregate totals
    const allTime = await Transaction.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const monthlyAgg = await Transaction.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build readable context
    const currency = user?.currencyPreference || 'INR';
    const allTimeIncome = allTime.find((a) => a._id === 'income')?.total || 0;
    const allTimeExpense = allTime.find((a) => a._id === 'expense')?.total || 0;
    const balance = allTimeIncome - allTimeExpense;

    const monthlyExpenseByCategory = monthlyAgg
      .filter((a) => a._id.type === 'expense')
      .map((a) => `${a._id.category}: ${currency} ${a.total.toFixed(2)} (${a.count} txns)`)
      .join('\n');

    const monthlyIncomeTotal = monthlyAgg
      .filter((a) => a._id.type === 'income')
      .reduce((sum, a) => sum + a.total, 0);

    const recentTxnsSummary = monthlyTransactions
      .slice(0, 20)
      .map(
        (t) =>
          `[${t.date.toISOString().slice(0, 10)}] ${t.type.toUpperCase()} ${currency} ${t.amount} — ${t.category} — ${t.description}`
      )
      .join('\n');

    const contextBlock = `
USER: ${user?.fullName || 'User'}
CURRENCY: ${currency}
CURRENT DATE: ${now.toISOString().slice(0, 10)}

=== ALL-TIME SUMMARY ===
Total Income: ${currency} ${allTimeIncome.toFixed(2)}
Total Expenses: ${currency} ${allTimeExpense.toFixed(2)}
Net Balance: ${currency} ${balance.toFixed(2)}

=== THIS MONTH (${now.toLocaleString('default', { month: 'long', year: 'numeric' })}) ===
Income: ${currency} ${monthlyIncomeTotal.toFixed(2)}
Expenses by Category:
${monthlyExpenseByCategory || 'No expenses this month'}

=== RECENT TRANSACTIONS (up to 20) ===
${recentTxnsSummary || 'No transactions found'}
`.trim();

    // ── LangChain + Gemini call ──────────────────────────────────────────
    const llm = new ChatGoogleGenerativeAI({
      model: 'gemini-3.6-flash',
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.4,
    });

    const systemPrompt = `You are Cendric, a friendly personal finance assistant for freelancers.
You have access to the user's real financial data provided below. Answer questions concisely and helpfully.
Format currency amounts as "${currency} X,XXX.XX". Use bullet points for lists. Be conversational but accurate.
If asked about something not in the data, say so honestly.
Never make up numbers — only use the data provided.

FINANCIAL DATA:
${contextBlock}`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(question),
    ];

    const response = await llm.invoke(messages);
    const answer = response.content;

    // Persist assistant message
    await ChatMessage.create({ sessionId: session._id, userId, role: 'assistant', content: answer });

    res.json({ answer, sessionId: session._id });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ message: 'Chat failed: ' + err.message });
  }
});

// GET /api/chat/history — fetch past messages for a session
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find latest session for this user
    const session = await ChatSession.findOne({ userId }).sort({ startedAt: -1 });
    if (!session) return res.json({ messages: [], sessionId: null });

    const messages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages, sessionId: session._id });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

module.exports = router;
