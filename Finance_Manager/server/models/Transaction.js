const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Salary', 'Others'],
      default: 'Others',
    },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
    source: { type: String, enum: ['manual', 'receipt-ai'], default: 'manual' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
