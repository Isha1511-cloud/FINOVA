"use strict";
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    ref: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString() },
    accountId: { type: String, required: true },
    desc: { type: String, required: true },
    category: { type: String, default: "Other" },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "reversed", "review"],
      default: "completed",
    },
    kind: { type: String, enum: ["own", "beneficiary", "standard"], default: "standard" },
    beneficiaryId: { type: String },
    beneficiaryName: { type: String },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
