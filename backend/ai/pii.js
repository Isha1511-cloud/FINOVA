"use strict";
// PII redaction applied to EVERY string before it can reach the LLM.
// Replaces sensitive values with stable placeholders ([CARD_1], [EMAIL_1] ...)
// so the model keeps sentence structure but never sees the real value.
// This is defence in depth: the router also sends no customer data to the model.

const RULES = [
  // order matters: most specific first
  ["EMAIL", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  ["PAN", /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g],                       // Indian PAN
  ["AADHAAR", /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g],         // 12 digits
  ["IFSC", /\b[A-Z]{4}0[A-Z0-9]{6}\b/g],
  ["UPI", /\b[a-z0-9._-]{2,}@[a-z]{2,}\b(?!\.)/gi],            // handle@bank
  ["CARD", /\b(?:\d[ -]?){13,19}\b/g],                          // PAN-length digit runs
  ["PHONE", /(?:\+?91[\s-]?)?\b[6-9]\d{9}\b/g],
  ["ACCOUNT", /\b\d{9,18}\b/g],
  ["OTP", /\b(?:otp|code|pin|cvv)\s*(?:is|:|=)?\s*\d{3,8}\b/gi],
  ["PASSWORD", /\b(?:password|passcode|pwd)\s*(?:is|:|=)\s*\S+/gi],
  ["TOKEN", /\b(?:bearer\s+)?[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g], // JWT-like
];

function luhn(digits) {
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (alt && (n *= 2) > 9) n -= 9;
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

function redact(input) {
  const counts = {};
  const seen = new Map(); // same value -> same placeholder
  let text = String(input == null ? "" : input);
  for (const [label, re] of RULES) {
    text = text.replace(re, (m) => {
      if (label === "CARD") {
        const d = m.replace(/\D/g, "");
        if (d.length < 13 || d.length > 19 || !luhn(d)) return m; // leave non-card numbers to later rules
      }
      const key = `${label}:${m.toLowerCase()}`;
      if (!seen.has(key)) { counts[label] = (counts[label] || 0) + 1; seen.set(key, `[${label}_${counts[label]}]`); }
      return seen.get(key);
    });
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { text, redactions: total, kinds: Object.keys(counts) };
}

// True if the string still looks like it holds PII (used as a hard gate before sending).
function containsPII(s) {
  const r = redact(s);
  return r.redactions > 0;
}

module.exports = { redact, containsPII };
