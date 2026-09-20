const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currencyPreference: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
