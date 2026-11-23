"use strict";
// Curated banking glossary. Definitions are fixed text, never model-generated.
const G = require("./glossary.json");
const { resolvePage } = require("./pages");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ALIASES = G.flatMap((e) => [e.term, ...e.aliases].map((a) => [a.toLowerCase(), e])).sort((a, b) => b[0].length - a[0].length);
const EXPLAIN = /\b(explain|what is|what's|what are|what does|define|meaning of|mean by|means|tell me about|describe|how does|difference between|differences between|vs|versus)\b/;
const BY_KEY = new Map(G.map((e) => [e.key, e]));
// glossary page names -> PAGES keys
const PAGE_MAP = { transfer: "transfer", fraud_alerts: "fraud_alerts", accounts: "accounts", transactions: "transactions", beneficiaries: "beneficiaries", statements: "statements", goals: "goals", budgets: "budgets", categories: "categories", forecast: "forecast", insights: "insights", notifications: "notifications", settings: "settings" };

function findTerms(t) {
  const used = [], seen = new Set(), hits = [];
  for (const [a, e] of ALIASES) {
    const re = new RegExp(`(?<![a-z0-9])${esc(a)}(?:s|es)?(?![a-z0-9])`, "g");
    let m;
    while ((m = re.exec(t))) {
      const s = m.index, en = s + m[0].length;
      if (used.some(([x, y]) => s < y && en > x)) continue;
      used.push([s, en]);
      if (!seen.has(e.key)) { seen.add(e.key); hits.push([s, e]); }
    }
  }
  return hits.sort((a, b) => a[0] - b[0]).slice(0, 3).map((h) => h[1]);
}

// -> { terms:[entry], asked:boolean } or null when this is not a "what does X mean" question.
function matchExplain(text) {
  const t = String(text).toLowerCase().trim();
  const words = t.split(/\s+/).length, mine = /\b(my|me|i)\b/.test(t);
  const asks = EXPLAIN.test(t) && !mine, terms = findTerms(t);
  const command = /^(show|open|go|find|search|list|view|send|pay|get|take|compare)\b/.test(t);
  if (terms.length && (asks || (words <= 4 && !mine && !command))) return { terms, asked: true };
  if (asks) return { terms: [], asked: true };
  return null;
}

const toView = (e) => ({ key: e.key, term: e.term, definition: e.def, example: e.example || null, page: e.page && resolvePage(PAGE_MAP[e.page]) ? PAGE_MAP[e.page] : null });
module.exports = { matchExplain, findTerms, toView, BY_KEY, GLOSSARY: G };
