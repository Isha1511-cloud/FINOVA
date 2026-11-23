"use strict";
// Documented assistant error codes (match src/services/dev/ai.js + BACKEND_CONTRACTS.md).
const CODES = Object.freeze({
  validation: { status: 400, message: "Please enter a message (up to 500 characters)." },
  permission_denied: { status: 403, message: "You do not have permission to access that account." },
  not_found: { status: 404, message: "Conversation not found." },
  rate_limited: { status: 429, message: "You are sending messages too quickly. Please wait a minute and try again." },
  timeout: { status: 504, message: "The assistant took too long to respond." },
  assistant_unavailable: { status: 503, message: "The assistant is temporarily unavailable. Please try again shortly." },
});

class AssistantError extends Error {
  constructor(code, detail) {
    const def = CODES[code] || CODES.assistant_unavailable;
    super(def.message);
    this.name = "AssistantError";
    this.code = CODES[code] ? code : "assistant_unavailable";
    this.status = def.status;
    this.detail = detail; // internal only; never sent to the client
  }
}

// Map any failure from the @google/genai SDK (ApiError.status) or the network to a documented code.
function mapModelError(err) {
  if (err instanceof AssistantError) return err;
  const status = err && err.status;
  const msg = String((err && err.message) || "");
  if (err && (err.name === "AbortError" || /abort|timed? ?out|ETIMEDOUT/i.test(msg))) return new AssistantError("timeout", msg);
  if (status === 429) return new AssistantError("rate_limited", msg);
  if (status === 408 || status === 504) return new AssistantError("timeout", msg);
  if (status === 401 || status === 403) return new AssistantError("assistant_unavailable", "model auth/config: " + status); // our key problem, not the user's
  return new AssistantError("assistant_unavailable", msg);
}

module.exports = { AssistantError, mapModelError, CODES };
