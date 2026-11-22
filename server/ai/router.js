"use strict";
// Assistant router: user text -> validated intent + allow-listed navigation.
// 1) Redact PII. 2) Deterministic rules (no LLM, no cost). 3) Model fallback
// for anything the rules do not recognise. The router returns an INTENT, never
// data: balances/transactions come later from the authorised services, and the
// assistant can never execute a transfer.
const { redact } = require("./pii");
const { resolvePage, PAGES } = require("./pages");
const { AssistantError } = require("./errors");
const { matchExplain, toView } = require("./glossary");

const MAX_LEN = 500;

// [intent, page key, regex] - first match wins; order = specificity.
const RULES = [
  ["transfer_prepare", "transfer", /\b(transfer|send|pay)\b(?!.*\b(find|show|search|list|history|last)\b)/i],
  ["goal_start", "new_goal", /savings? goal|save for|financial goal/i],
  ["navigate", "statements", /\bstatements?\b/i],
  ["navigate", "fraud_alerts", /\bfraud\b|suspicious/i],
  ["navigate", "beneficiaries", /\bbeneficiar/i],
  ["navigate", "budgets", /\bbudgets?\b/i],
  ["navigate", "forecast", /\bforecast|projection\b/i],
  ["navigate", "notifications", /\bnotifications?\b/i],
  ["navigate", "support", /\b(support|help desk|contact us)\b/i],
  ["navigate", "settings", /\bsettings?\b/i],
  ["account_summary", "accounts", /\bbalances?\b|\baccounts?\b/i],
  ["compare_months", "insights", /compare|month.over.month|monthly expenses/i],
  ["transaction_search", "transactions", /\b(find|search|list)\b|\btransactions?\b|\b(last|latest|recent)\b/i],
  ["spending_summary", "insights", /\bspen[dt]|spending|summar|income|cash.?flow/i],
];

// Pull a sanitised amount (digits only) for the transfer prefill; never trust other params.
function extractAmount(text) {
  const m = text.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d{2,9})(?:\.\d{1,2})?\b/i);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isSafeInteger(n) && n > 0 && n <= 10000000 ? n : null;
}

function buildAction(pageKey, params = {}) {
  const page = resolvePage(pageKey);
  if (!page) return null; // not allow-listed -> no navigation
  let link = page.path;
  if (pageKey === "transfer" && params.amount) link += `?amount=${encodeURIComponent(String(params.amount))}`;
  return { type: "action", kind: pageKey, title: page.label, link };
}

function createRouter({ modelClient } = {}) {
  return {
    async route(input) {
      if (typeof input !== "string" || !input.trim() || input.length > MAX_LEN) throw new AssistantError("validation");
      // Redact BEFORE any matching or model call; later steps only see `safe`.
      const { text: safe, redactions } = redact(input.trim());

      // "What is NEFT?" / "explain fraud alerts": answered from the curated glossary, no model call.
      const ex = matchExplain(safe);
      if (ex) {
        const terms = ex.terms.map(toView);
        const first = terms.find((t) => t.page);
        return { intent: "explain_term", source: "glossary", page: first ? first.page : null, params: {}, terms, action: first ? buildAction(first.page) : null, redactions };
      }

      for (const [intent, page, re] of RULES) {
        if (re.test(safe)) {
          const params = intent === "transfer_prepare" ? { amount: extractAmount(safe) } : {};
          return { intent, source: "rules", page, params, action: buildAction(page, params), redactions };
        }
      }

      if (!modelClient) return { intent: "unsupported", source: "rules", page: null, params: {}, action: null, redactions };
      const out = await modelClient.classify(safe); // throws documented AssistantError
      const action = out.page && out.intent !== "unsupported" ? buildAction(out.page) : null; // re-checked against PAGES
      return { intent: out.intent, source: "model", page: action ? out.page : null, params: {}, action, redactions };
    },
  };
}

module.exports = { createRouter, buildAction, extractAmount, RULES, PAGES };
