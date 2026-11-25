"use strict";
const Account = require("../models/Account");
const { serializeAccount } = require("../utils/serializers");
const { isObjectIdString, sendError } = require("../utils/http");

// GET /api/accounts  - only the authenticated user's accounts
async function list(req, res) {
  const accounts = await Account.find({ userId: req.user.id }).sort({ createdAt: 1 }).lean();
  res.json(accounts.map(serializeAccount));
}

// GET /api/accounts/:id - 404 (not 403) for other users' accounts so existence is not revealed
async function getById(req, res) {
  const { id } = req.params;
  if (!isObjectIdString(id)) return sendError(res, 404, "Account not found", "not_found");
  const account = await Account.findOne({ _id: id, userId: req.user.id }).lean();
  if (!account) return sendError(res, 404, "Account not found", "not_found");
  res.json(serializeAccount(account));
}

module.exports = { list, getById };
