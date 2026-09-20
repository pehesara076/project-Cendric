const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'startedAt', updatedAt: false } }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
