"use strict";
// API response shapes. Keeps the legacy field names the existing frontend already
// reads (type, number, desc, ref, date) alongside the new schema field names.
const { maskAccountNumber } = require("../models/Account");

const TYPE_LABELS = {
  savings: "Savings Account",
  current: "Current Account",
  salary: "Salary Account",
  fixed_deposit: "Fixed Deposit",
};
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function serializeAccount(a) {
  const masked = maskAccountNumber(a.accountNumber);
  return {
    id: String(a._id),
    accountType: a.accountType,
    type: TYPE_LABELS[a.accountType] || a.accountType, // legacy label
    accountNumber: masked,
    number: masked, // legacy alias (never the full number)
    balance: a.balance,
    available: a.available ?? a.balance,
    currency: a.currency,
    status: cap(a.status), // legacy UI shows "Active"
    ifsc: a.ifsc,
    branch: a.branch,
    opened: a.opened,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function serializeTransaction(t) {
  const date = t.transactionDate instanceof Date ? t.transactionDate.toISOString() : t.transactionDate;
  return {
    id: String(t._id),
    accountId: String(t.accountId),
    referenceId: t.referenceId,
    ref: t.referenceId, // legacy alias
    type: t.type,
    category: t.category,
    description: t.description,
    desc: t.description, // legacy alias
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    transactionDate: date,
    date, // legacy alias
    kind: t.kind,
    beneficiaryId: t.beneficiaryId,
    beneficiaryName: t.beneficiaryName,
    remarks: t.remarks,
  };
}

module.exports = { serializeAccount, serializeTransaction, TYPE_LABELS };
