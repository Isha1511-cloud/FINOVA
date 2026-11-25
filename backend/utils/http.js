"use strict";
const mongoose = require("mongoose");

// Wraps async route handlers so rejections reach the Express error middleware (Express 5 does this
// natively, this keeps behaviour explicit and works with plain functions in tests).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const isObjectIdString = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
const toObjectId = (v) => new mongoose.Types.ObjectId(v);

// Express can hand back arrays/objects for repeated or nested query params; accept strings only.
const qstr = (v) => (typeof v === "string" ? v.trim() : "");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function sendError(res, status, message, code) {
  return res.status(status).json({ message, code });
}

module.exports = { asyncHandler, isObjectIdString, toObjectId, qstr, escapeRegex, sendError };
