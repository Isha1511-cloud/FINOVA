"use strict";
const mongoose = require("mongoose");
const { CURRENCIES } = require("./Account");

const TX_TYPES = ["credit", "debit"];
const TX_STATUSES = ["completed", "pending", "failed", "reversed", "review"];

const transactionSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    // Denormalised owner so every query can be scoped by user without a join.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: TX_TYPES, required: true },
    category: { type: String, trim: true, maxlength: 40, default: "Other" },
    description: { type: String, required: true, trim: true, maxlength: 140 },
    // Always positive; `type` carries the direction.
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than zero"] },
    currency: { type: String, enum: CURRENCIES, default: "INR", uppercase: true },
    status: { type: String, enum: TX_STATUSES, default: "completed" },
    transactionDate: { type: Date, required: true, default: Date.now },
    referenceId: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["own", "beneficiary", "standard"], default: "standard" },
    beneficiaryId: { type: String },
    beneficiaryName: { type: String },
    remarks: { type: String, default: "", maxlength: 200 },
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.userId;
        return ret;
      },
    },
  }
);

transactionSchema.index({ referenceId: 1 }, { unique: true, partialFilterExpression: { referenceId: { $type: "string" } } });
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ accountId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, category: 1, transactionDate: -1 });

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
module.exports.TX_TYPES = TX_TYPES;
module.exports.TX_STATUSES = TX_STATUSES;
