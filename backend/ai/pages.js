"use strict";
// Single source of truth for where the assistant may send the user.
// The model never returns a URL: it returns a page KEY, and the server resolves
// it here. Anything not in this object is rejected (navigation allowlist).
const PAGES = Object.freeze({
  dashboard: { path: "/dashboard", label: "Dashboard" },
  accounts: { path: "/accounts", label: "Accounts" },
  transactions: { path: "/transactions", label: "Transactions" },
  transfer: { path: "/transfers/new", label: "Transfer money" },
  transfer_history: { path: "/transfers/history", label: "Transfer history" },
  beneficiaries: { path: "/beneficiaries", label: "Beneficiaries" },
  statements: { path: "/statements", label: "Statements" },
  goals: { path: "/financial-goals", label: "Savings goals" },
  new_goal: { path: "/financial-goals/new", label: "New savings goal" },
  budgets: { path: "/analytics/budgets", label: "Budgets" },
  categories: { path: "/analytics/categories", label: "Spending categories" },
  forecast: { path: "/analytics/forecast", label: "Forecast" },
  insights: { path: "/analytics/insights", label: "Insights" },
  fraud_alerts: { path: "/fraud-alerts", label: "Fraud alerts" },
  notifications: { path: "/notifications", label: "Notifications" },
  support: { path: "/support", label: "Support" },
  settings: { path: "/settings", label: "Settings" },
});

const PAGE_KEYS = Object.freeze(Object.keys(PAGES));

// Returns the allow-listed descriptor or null. Own-property check blocks "__proto__" etc.
function resolvePage(key) {
  return typeof key === "string" && Object.prototype.hasOwnProperty.call(PAGES, key) ? PAGES[key] : null;
}

module.exports = { PAGES, PAGE_KEYS, resolvePage };
