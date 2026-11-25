"use strict";
const mongoose = require("mongoose");

const ACCOUNT_TYPES = ["savings", "current", "salary", "fixed_deposit"];
const ACCOUNT_STATUSES = ["active", "frozen", "closed"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const accountSchema = new mongoose.Schema(
  {
    // Owner. Always set from the authenticated user, never from request input.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accountType: { type: String, enum: ACCOUNT_TYPES, required: true, default: "savings" },
    // Full number is stored here but is masked by serializers / toJSON before leaving the API.
    accountNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{9,18}$/, "Account number must be 9-18 digits"],
    },
    balance: { type: Number, required: true, default: 0, min: [0, "Balance cannot be negative"] },
    available: { type: Number, default: undefined, min: 0 }, // defaults to balance on create
    currency: { type: String, enum: CURRENCIES, default: "INR", uppercase: true },
    status: { type: String, enum: ACCOUNT_STATUSES, default: "active" },
    ifsc: { type: String, default: "FNVA0001024" },
    branch: { type: String, default: "Andheri West, Mumbai" },
    opened: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    // True only for fictional records created by scripts/seed.js.
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = String(ret._id);
        ret.accountNumber = maskAccountNumber(ret.accountNumber);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

accountSchema.pre("validate", function setAvailable() {
  if (this.available === undefined || this.available === null) this.available = this.balance;
});

accountSchema.index({ userId: 1, status: 1 });
// Partial unique index: ignores documents from the old schema that have no accountNumber.
accountSchema.index({ accountNumber: 1 }, { unique: true, partialFilterExpression: { accountNumber: { $type: "string" } } });

function maskAccountNumber(n) {
  const s = String(n || "");
  if (s.length <= 4) return "X".repeat(s.length);
  return "X".repeat(s.length - 4) + s.slice(-4);
}

const Account = mongoose.models.Account || mongoose.model("Account", accountSchema);
module.exports = Account;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
module.exports.ACCOUNT_STATUSES = ACCOUNT_STATUSES;
module.exports.CURRENCIES = CURRENCIES;
module.exports.maskAccountNumber = maskAccountNumber;
