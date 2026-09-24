const { Budget } = require('../models');
const { isMongoDBConnected } = require('../config/db');
const { db, saveDB } = require('../utils/localDB');
const currencyService = require('../services/currencyService');
const { toUserQuery } = require('../utils/dbHelper');

function normalizeCurrency(c) {
  return currencyService.normalizeCurrency(c);
}

async function getBudget(req, res) {
  try {
    let budget = null;
    if (isMongoDBConnected()) {
      budget = await Budget.findOne({ userId: toUserQuery(req.user._id) }).lean();
    }
    if (!budget) {
      if (!db.budgets) db.budgets = {};
      budget = db.budgets[req.user._id] || db.budgets[String(req.user._id)] || { monthlyLimit: 50000, alertsEnabled: true };
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch budget.' });
  }
}

async function updateBudget(req, res) {
  try {
    const { monthlyLimit, alertsEnabled } = req.body;
    const userCurr = normalizeCurrency(req.user.currencyPreference || 'LKR');
    const rate = currencyService.getRateFor(userCurr);
    const numLimit = Number(monthlyLimit) || 50000;
    const alerts = alertsEnabled !== undefined ? Boolean(alertsEnabled) : true;
    const baseLimitUSD = numLimit / rate;

    let updatedBudget = null;
    if (isMongoDBConnected()) {
      let bDoc = await Budget.findOne({ userId: toUserQuery(req.user._id) });
      if (bDoc) {
        bDoc.monthlyLimit = numLimit;
        bDoc.baseLimitUSD = baseLimitUSD;
        bDoc.alertsEnabled = alerts;
        bDoc.updatedAt = new Date();
        await bDoc.save();
        updatedBudget = bDoc.toObject();
      } else {
        const created = await Budget.create({
          userId: req.user._id,
          monthlyLimit: numLimit,
          baseLimitUSD,
          alertsEnabled: alerts,
          updatedAt: new Date()
        });
        updatedBudget = created.toObject();
      }
    }

    if (!db.budgets) db.budgets = {};
    db.budgets[req.user._id] = {
      monthlyLimit: numLimit,
      baseLimitUSD,
      alertsEnabled: alerts,
      updatedAt: new Date().toISOString()
    };
    saveDB();

    res.json(updatedBudget || db.budgets[req.user._id]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update budget.' });
  }
}

module.exports = {
  getBudget,
  updateBudget
};
