const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Transaction } = require('../models');
const { isMongoDBConnected } = require('../config/db');
const { db, saveDB } = require('../utils/localDB');
const currencyService = require('../services/currencyService');
const { toUserQuery, toIdQuery } = require('../utils/dbHelper');

function normalizeCurrency(c) {
  return currencyService.normalizeCurrency(c);
}

async function getTransactions(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10);
    let results = [];
    let total = 0;

    if (isMongoDBConnected()) {
      const userQ = toUserQuery(req.user._id);
      let query = Transaction.find({ userId: userQ }).sort({ date: -1, createdAt: -1 });
      if (!isNaN(limit) && limit > 0) {
        query = query.limit(limit);
      }
      results = await query.lean();
      total = await Transaction.countDocuments({ userId: userQ });
    } else {
      const userTransactions = db.transactions
        .filter(t => String(t.userId) === String(req.user._id))
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      results = !isNaN(limit) && limit > 0 ? userTransactions.slice(0, limit) : userTransactions;
      total = userTransactions.length;
    }

    res.json({
      transactions: results,
      total
    });
  } catch (err) {
    console.error('[Get Transactions Error]', err);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
}

async function createTransaction(req, res) {
  try {
    const { type, amount, category, date, description, source } = req.body;

    if (!type || amount === undefined || !category) {
      return res.status(400).json({ message: 'Type, amount, and category are required.' });
    }

    const userCurr = normalizeCurrency(req.user.currencyPreference || 'LKR');
    const rate = currencyService.getRateFor(userCurr);
    const numAmt = Number(amount) || 0;

    const newTx = {
      _id: crypto.randomBytes(12).toString('hex'),
      userId: req.user._id,
      type: type.toLowerCase() === 'income' ? 'income' : 'expense',
      amount: numAmt,
      baseAmountUSD: numAmt / rate,
      category: category.trim(),
      date: date || new Date().toISOString().slice(0, 10),
      description: (description || '').trim(),
      source: source || 'manual',
      createdAt: new Date().toISOString()
    };

    if (isMongoDBConnected()) {
      await Transaction.create(newTx);
    }
    db.transactions.push(newTx);
    saveDB();

    console.log('[Create Transaction Saved Document]:', JSON.stringify({
      _id: newTx._id,
      userId: newTx.userId,
      type: newTx.type,
      amount: newTx.amount,
      baseAmountUSD: newTx.baseAmountUSD,
      category: newTx.category,
      date: newTx.date,
      description: newTx.description,
      source: newTx.source,
      currency: userCurr,
      mongoSaved: isMongoDBConnected()
    }, null, 2));

    res.status(201).json({
      transaction: newTx,
      message: 'Transaction recorded successfully.'
    });
  } catch (err) {
    console.error('[Create Transaction Error]', err);
    res.status(500).json({ message: 'Failed to save transaction.' });
  }
}

async function updateTransaction(req, res) {
  try {
    const txId = req.params.id;
    const { type, amount, category, date, description, source } = req.body;

    const updateFields = {};
    if (type !== undefined) updateFields.type = type.toLowerCase() === 'income' ? 'income' : 'expense';
    if (amount !== undefined) {
      updateFields.amount = Number(amount) || 0;
      const userCurr = normalizeCurrency(req.user.currencyPreference || 'LKR');
      const rate = currencyService.getRateFor(userCurr);
      updateFields.baseAmountUSD = updateFields.amount / rate;
    }
    if (category !== undefined) updateFields.category = category.trim();
    if (date !== undefined) updateFields.date = date;
    if (description !== undefined) updateFields.description = description.trim();
    if (source !== undefined) updateFields.source = source;

    let updatedTx = null;
    if (isMongoDBConnected()) {
      updatedTx = await Transaction.findOneAndUpdate(
        { _id: toIdQuery(txId), userId: toUserQuery(req.user._id) },
        { $set: updateFields },
        { new: true }
      ).lean();
    }

    const tx = db.transactions.find(t => String(t._id) === String(txId) && String(t.userId) === String(req.user._id));
    if (!tx && !updatedTx) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (tx) {
      Object.assign(tx, updateFields);
      saveDB();
    }

    res.json(updatedTx || tx);
  } catch (err) {
    console.error('[Update Transaction Error]', err);
    res.status(500).json({ message: 'Failed to update transaction.' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const txId = req.params.id;
    let deleted = false;

    if (isMongoDBConnected()) {
      const resMongo = await Transaction.findOneAndDelete({ _id: toIdQuery(txId), userId: toUserQuery(req.user._id) });
      if (resMongo) deleted = true;
    }

    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter(t => !(String(t._id) === String(txId) && String(t.userId) === String(req.user._id)));
    if (db.transactions.length < initialLen) deleted = true;

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    saveDB();
    res.json({ success: true, message: 'Transaction removed successfully.' });
  } catch (err) {
    console.error('[Delete Transaction Error]', err);
    res.status(500).json({ message: 'Failed to delete transaction.' });
  }
}

async function bulkImportTransactions(req, res) {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of transactions to import.' });
    }

    const userCurr = normalizeCurrency(req.user.currencyPreference || 'LKR');
    const rate = currencyService.getRateFor(userCurr);
    const addedTransactions = [];

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (amount <= 0 && !t.description) return;

      const type = (t.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
      const category = t.category || (type === 'income' ? 'Salary' : 'General');
      const date = t.date || new Date().toISOString().slice(0, 10);
      const description = (t.description || 'Imported Transaction').trim();
      const source = t.source || 'bank_csv_import';

      const newTx = {
        _id: crypto.randomBytes(12).toString('hex'),
        userId: req.user._id,
        type,
        amount,
        category,
        date,
        description,
        source,
        createdAt: new Date().toISOString(),
        baseAmountUSD: amount / rate
      };

      addedTransactions.push(newTx);
      db.transactions.push(newTx);
    });

    if (isMongoDBConnected() && addedTransactions.length > 0) {
      await Transaction.insertMany(addedTransactions, { ordered: false });
    }

    saveDB();
    res.status(201).json({
      success: true,
      message: `Successfully imported ${addedTransactions.length} transactions.`,
      count: addedTransactions.length,
      transactions: addedTransactions
    });
  } catch (err) {
    console.error('[Bulk Import Error]', err);
    res.status(500).json({ message: 'Failed to import transactions.' });
  }
}

async function exportTransactionsCSV(req, res) {
  try {
    let userTransactions = [];
    if (isMongoDBConnected()) {
      userTransactions = await Transaction.find({ userId: toUserQuery(req.user._id) }).sort({ date: -1, createdAt: -1 }).lean();
    } else {
      userTransactions = db.transactions
        .filter(t => String(t.userId) === String(req.user._id))
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    }

    const currency = req.user.currencyPreference || 'LKR';
    const headers = ['Transaction ID', 'Date', 'Description', 'Category', 'Type', `Amount (${currency})`, 'Source', 'Recorded At'];

    const rows = userTransactions.map(t => [
      t._id,
      t.date || (t.createdAt ? String(t.createdAt).slice(0, 10) : ''),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      String(t.type || '').toUpperCase(),
      Number(t.amount || 0).toFixed(2),
      t.source || 'manual',
      t.createdAt || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cendric_tax_report_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error('[CSV Export Error]', err);
    res.status(500).json({ message: 'Failed to export CSV.' });
  }
}

async function extractReceipt(req, res) {
  try {
    const file = req.file;
    let fileBuffer = file ? file.buffer : null;
    let mimeType = file ? (file.mimetype || 'image/jpeg') : 'image/jpeg';
    let originalName = file ? (file.originalname || 'receipt.jpg') : 'camera_bill.jpg';

    // Support direct base64 image capture from WebRTC camera or chat upload
    if (!fileBuffer && req.body && req.body.imageBase64) {
      const rawB64 = req.body.imageBase64;
      const mimeMatch = rawB64.match(/^data:([^;]+);base64,/);
      if (mimeMatch && mimeMatch[1]) {
        mimeType = mimeMatch[1];
      }
      const cleanB64 = rawB64.replace(/^data:[^;]+;base64,/, '');
      fileBuffer = Buffer.from(cleanB64, 'base64');
      if (req.body.mimeType) mimeType = req.body.mimeType;
      if (req.body.fileName) originalName = req.body.fileName;
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload or capture a valid receipt or bill photo.'
      });
    }

    // Standardize common mime types
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'your_key_here' || apiKey.length < 15) {
      console.warn('[Gemini Receipt OCR] GEMINI_API_KEY is not configured in .env');
      return res.status(400).json({
        success: false,
        message: 'Google Gemini API key is missing or invalid in server .env. Please configure GEMINI_API_KEY with a valid key from Google AI Studio to enable AI receipt scanning, or log the transaction manually.'
      });
    }

    // Select stable Flash model alias that always points to current recommended model
    let targetModel = (process.env.GEMINI_MODEL || 'gemini-flash-latest').trim();
    if (targetModel.startsWith('gemini-1.') || targetModel.startsWith('gemini-3.') || !targetModel) {
      targetModel = 'gemini-flash-latest';
    }

    const base64Data = fileBuffer.toString('base64');

    // Step 2 Console Log: Pre-call verification
    console.log(`[Gemini Receipt OCR] Pre-call check -> Model: "${targetModel}", MIME Type: "${mimeType}", Base64 Length: ${base64Data.length}`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: targetModel,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    // Step 7: Structured JSON prompt instructing exact fields, printed receipt date, and null on undetermined
    const prompt = `You are a financial receipt and bill analysis assistant.
Extract the following from this receipt image and return ONLY valid JSON with no markdown formatting:
{
  "amount": number,
  "merchantName": string,
  "description": string,
  "date": string,
  "category": string,
  "type": string,
  "items": [
    { "name": string, "price": number }
  ]
}

SPECIFIC EXTRACTION RULES:
1. "amount": The final total / balance paid or due (numeric value only, e.g. 1250.50). Do NOT include currency symbols. Extract the actual final payable total from the bill.
2. "merchantName": The name of the store, merchant, supermarket, restaurant, or utility company printed on the bill.
3. "description": A concise description, such as the merchant name or primary items purchased (e.g. "Keells Super", "Ceylon Electricity Board").
4. "date": The transaction date in YYYY-MM-DD format, parsed strictly from the printed receipt date. Look for DD/MM/YYYY, MM/DD/YYYY, or text dates and convert to YYYY-MM-DD. If NO date is printed on the receipt, return null — DO NOT use today's date.
5. "category": Best match among: "Food & Dining", "Transport", "Shopping", "Bills & Utilities", "Entertainment", "Health", "Salary", "Others".
6. "type": "expense" for bills/purchases/receipts, or "income" for client payment receipts/salary/remittance slips.
7. "items": Array of line items with individual names and numeric prices if visible on the bill, otherwise an empty array.
8. If any field cannot be determined from the image, use null for that field — do NOT guess, hallucinate, or invent a value.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    let rawText = '';
    const candidateModels = [targetModel];
    if (targetModel !== 'gemini-flash-lite-latest') {
      candidateModels.push('gemini-flash-lite-latest');
    }

    let lastError = null;
    for (const m of candidateModels) {
      try {
        console.log(`[Gemini Receipt OCR] Attempting OCR with model: "${m}"`);
        const model = genAI.getGenerativeModel({
          model: m,
          generationConfig: {
            responseMimeType: 'application/json'
          }
        });
        const result = await model.generateContent([prompt, imagePart]);
        rawText = result.response.text();
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini Receipt OCR] Model "${m}" failed: ${err.message}. Trying next available model...`);
      }
    }

    if (!rawText && lastError) {
      console.error('[Gemini Receipt OCR Final Error]:', lastError);
      return res.status(502).json({
        success: false,
        message: `Gemini AI analysis failed: ${lastError.message || 'API connection error'}. Please enter details manually.`
      });
    }

    // Step 5 Console Log: Raw unparsed response
    console.log('[Gemini Receipt OCR Raw Response]:', rawText);

    // Step 6: Parse JSON without silent fake fallback
    let cleanedText = (rawText || '').trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    let parsed = null;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('[Gemini Receipt OCR JSON Parse Error]:', parseErr.message, 'Raw text was:', rawText);
      return res.status(422).json({
        success: false,
        message: 'Could not extract valid financial data from receipt: AI response was not valid JSON.',
        rawText: rawText
      });
    }

    // Step 9: Map fields cleanly to actual extracted values
    const finalAmount = (parsed.amount !== null && parsed.amount !== undefined && !isNaN(Number(parsed.amount)))
      ? Number(parsed.amount)
      : null;

    const vendor = (parsed.merchantName || parsed.description || '').trim();
    const description = (parsed.description || parsed.merchantName || (vendor ? vendor : 'Scanned Receipt')).trim();
    const category = (parsed.category || 'Others').trim();
    const receiptDate = parsed.date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null;
    const type = (parsed.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';

    const extractedData = {
      amount: finalAmount,
      merchantName: vendor || null,
      vendor: vendor || description,
      description: description || 'Scanned Receipt',
      category: category,
      date: receiptDate,
      type: type,
      items: Array.isArray(parsed.items) ? parsed.items : []
    };

    console.log('[Gemini Receipt OCR Result]:', extractedData);

    return res.json({
      success: true,
      data: extractedData
    });
  } catch (err) {
    console.error('[Receipt Extraction System Error]', err);
    return res.status(500).json({
      success: false,
      message: `Failed to process receipt: ${err.message || 'Internal server error'}. Please enter details manually.`
    });
  }
}

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkImportTransactions,
  exportTransactionsCSV,
  extractReceipt
};
