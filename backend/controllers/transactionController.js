"use strict";
const crypto = require("crypto");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { TX_TYPES, TX_STATUSES } = Transaction;
const { serializeTransaction } = require("../utils/serializers");
const { isObjectIdString, toObjectId, qstr, escapeRegex, sendError } = require("../utils/http");

const MAX_ALL = 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(s, endOfDay) {
  if (!DATE_RE.test(s)) return null;
  const d = new Date(`${s}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Builds a Mongo filter. ALWAYS starts from the authenticated user's id.
function buildFilter(userId, query) {
  const f = { userId: toObjectId(userId) };
  const q = qstr(query.q);
  const category = qstr(query.category);
  const type = qstr(query.type);
  const status = qstr(query.status);
  const accountId = qstr(query.accountId);
  const min = qstr(query.min);
  const max = qstr(query.max);
  const from = qstr(query.from);
  const to = qstr(query.to);

  if (q) {
    const rx = new RegExp(escapeRegex(q.slice(0, 60)), "i");
    f.$or = [{ description: rx }, { referenceId: rx }];
  }
  if (category) f.category = category;
  if (type === "transfer") f.description = /^Transfer/i;
  else if (TX_TYPES.includes(type)) f.type = type;
  if (TX_STATUSES.includes(status)) f.status = status;
  if (accountId) f.accountId = isObjectIdString(accountId) ? toObjectId(accountId) : null; // null => matches nothing
  const amount = {};
  if (min !== "" && Number.isFinite(Number(min))) amount.$gte = Number(min);
  if (max !== "" && Number.isFinite(Number(max))) amount.$lte = Number(max);
  if (Object.keys(amount).length) f.amount = amount;
  const date = {};
  const d1 = from && parseDay(from, false);
  const d2 = to && parseDay(to, true);
  if (d1) date.$gte = d1;
  if (d2) date.$lte = d2;
  if (Object.keys(date).length) f.transactionDate = date;
  return f;
}

// GET /api/transactions  (response keeps the legacy { items, total, all } shape)
async function list(req, res) {
  const filter = buildFilter(req.user.id, req.query || {});
  const sortParam = qstr(req.query.sort) || "date-desc";
  const [field, dir] = sortParam.split("-");
  const sortField = field === "amount" ? "amount" : "transactionDate";
  const sortDir = dir === "asc" ? 1 : -1;
  const sort = { [sortField]: sortDir, _id: sortDir };

  const page = Math.max(1, parseInt(qstr(req.query.page), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(qstr(req.query.pageSize), 10) || 10));

  const [total, items, all] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
    Transaction.find(filter).sort(sort).limit(MAX_ALL).lean(),
  ]);

  res.json({
    items: items.map(serializeTransaction),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    all: all.map(serializeTransaction),
  });
}

// GET /api/transactions/:id - accepts the document id or the human-readable referenceId
async function getById(req, res) {
  const { id } = req.params;
  const owner = { userId: req.user.id };
  const t = isObjectIdString(id)
    ? await Transaction.findOne({ _id: id, ...owner }).lean()
    : await Transaction.findOne({ referenceId: String(id).slice(0, 64), ...owner }).lean();
  if (!t) return sendError(res, 404, "Transaction not found", "not_found");
  res.json(serializeTransaction(t));
}

const newReference = (prefix) => `${prefix}${Date.now()}${crypto.randomInt(1000, 9999)}`;

// POST /api/deposits and /api/withdrawals (pre-existing endpoints, now authenticated + owner-scoped)
async function handleCashFlow(req, res, kind) {
  const { accountId, amount, remarks } = req.body || {};
  const amt = Number(amount);
  if (!isObjectIdString(accountId) || !Number.isFinite(amt) || amt <= 0 || amt > 10000000) {
    return sendError(res, 400, "Valid accountId and amount are required.", "validation");
  }
  const delta = kind === "deposit" ? amt : -amt;
  const guard = { _id: accountId, userId: req.user.id, status: "active" };
  if (kind === "withdraw") guard.available = { $gte: amt }; // atomic overdraft protection

  const account = await Account.findOneAndUpdate(guard, { $inc: { balance: delta, available: delta } }, { new: true });
  if (!account) {
    const exists = await Account.exists({ _id: accountId, userId: req.user.id });
    if (!exists) return sendError(res, 404, "Account not found", "not_found");
    return sendError(res, 400, kind === "withdraw" ? "Insufficient balance or inactive account." : "Account is not active.", kind === "withdraw" ? "insufficient" : "inactive");
  }

  try {
    const txn = await Transaction.create({
      accountId: account._id,
      userId: req.user.id,
      type: kind === "deposit" ? "credit" : "debit",
      category: "Other",
      description: kind === "deposit" ? "Cash Deposit" : "Cash Withdrawal",
      amount: amt,
      currency: account.currency,
      status: "completed",
      referenceId: newReference("REF"),
      remarks: typeof remarks === "string" ? remarks.slice(0, 200) : "",
    });
    res.json({ status: "completed", transaction: serializeTransaction(txn.toObject()) });
  } catch (err) {
    // Compensate so the balance never changes without a matching ledger entry.
    await Account.updateOne({ _id: account._id }, { $inc: { balance: -delta, available: -delta } });
    throw err;
  }
}

const deposit = (req, res) => handleCashFlow(req, res, "deposit");
const withdraw = (req, res) => handleCashFlow(req, res, "withdraw");

module.exports = { list, getById, deposit, withdraw, buildFilter };
