"use strict";
const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    number: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    available: { type: Number, required: true, default: 0 },
    status: { type: String, default: "Active" },
    ifsc: { type: String, default: "FNVA0001024" },
    branch: { type: String, default: "Andheri West, Mumbai" },
    opened: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Account || mongoose.model("Account", accountSchema);
