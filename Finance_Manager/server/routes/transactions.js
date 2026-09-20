const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const verifyToken = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Multer: store in memory for Gemini upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  },
});

// ── All routes require JWT ──────────────────────────────────────────────────

// GET /api/transactions
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, type } = req.query;
    const filter = { userId: req.user.id };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(filter);
    res.json({ transactions, total, page: Number(page) });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions/extract  — MUST be before /:id routes
router.post('/extract', verifyToken, upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Convert buffer to base64
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = `You are a receipt parser. Analyze this receipt image/document and extract the key financial information.
Return ONLY a valid JSON object with no extra text, markdown, or explanation. The JSON must have exactly these fields:
{
  "amount": <number, total amount paid>,
  "category": <one of: "Food & Dining", "Transport", "Shopping", "Bills & Utilities", "Salary", "Others">,
  "date": <"YYYY-MM-DD" format, today if not visible>,
  "description": <short description of what was purchased, max 60 chars>,
  "type": <"income" or "expense">
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const rawText = result.response.text();

    // Strip markdown code fences if Gemini wraps in ```json ... ```
    let jsonText = rawText.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    // Fallback: find first { ... } block
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonText = jsonMatch[0];

    const extracted = JSON.parse(jsonText);

    // Validate required fields
    if (
      typeof extracted.amount !== 'number' ||
      !extracted.category ||
      !extracted.date ||
      !extracted.description ||
      !['income', 'expense'].includes(extracted.type)
    ) {
      throw new Error('Gemini returned incomplete data');
    }

    res.json(extracted);
  } catch (err) {
    console.error('Extract error:', err.message);
    res.status(500).json({ message: 'Failed to extract receipt data: ' + err.message });
  }
});

// POST /api/transactions — save confirmed transaction
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, amount, category, date, description, source } = req.body;
    if (!type || !amount || !date) {
      return res.status(400).json({ message: 'type, amount, and date are required' });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount: Number(amount),
      category: category || 'Others',
      date: new Date(date),
      description: description || '',
      source: source || 'manual',
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error('Save transaction error:', err);
    res.status(500).json({ message: 'Failed to save transaction' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const { type, amount, category, date, description } = req.body;
    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description;

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ message: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

module.exports = router;
