"use strict";
const express = require("express");
const { createRouter } = require("../ai/router");
const { createModelClient } = require("../ai/modelClient");

const router = express.Router();

let cachedAssistant = null;
function getAssistant() {
  if (!cachedAssistant) {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
    const modelClient = apiKey ? createModelClient({ apiKey, model }) : null;
    cachedAssistant = createRouter({ modelClient });
  }
  return cachedAssistant;
}

// In-memory conversation store for assistant chat
let convs = [
  {
    id: "cv1",
    title: "Spending this month",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  },
];

function uid(p = "m") {
  return `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Format assistant response for the UI blocks
function formatAssistantResponse(routed) {
  const blocks = [];
  if (routed.action) {
    blocks.push(routed.action);
  }
  if (routed.terms && routed.terms.length > 0) {
    const termDescriptions = routed.terms.map(t => `${t.title || t.term}: ${t.definition || t.summary || t.def || ''}`).join('\n\n');
    return {
      text: termDescriptions || "Here is the glossary explanation:",
      blocks,
      source: "ai",
      unsupported: false,
    };
  }

  let text = "Here is what I found for your request:";
  if (routed.intent === "account_summary") {
    text = "You can view your account balances and summaries on the Accounts page.";
  } else if (routed.intent === "transfer_prepare") {
    text = "I prepared a transfer action for you. For your security, please review and confirm the transfer on the Transfer page.";
  } else if (routed.intent === "spending_summary") {
    text = "You can view your spending summary and breakdown under Insights.";
  } else if (routed.intent === "transaction_search") {
    text = "Here is a shortcut to search and filter your transactions.";
  } else if (routed.intent === "unsupported") {
    return {
      text: "I cannot help with that yet. I can explain banking terms, search transactions, summarize spending, and open banking pages.",
      blocks: [],
      source: "ai",
      unsupported: true,
    };
  }

  return {
    text,
    blocks,
    source: routed.source === "glossary" ? "ai" : "banking_data",
    unsupported: false,
  };
}

// POST /ai/chat
router.post("/chat", async (req, res, next) => {
  try {
    const message = req.body && (req.body.message || req.body.q || req.body.text || "");
    const routed = await getAssistant().route(message);
    res.json({
      ...routed,
      reply: formatAssistantResponse(routed),
    });
  } catch (err) {
    next(err);
  }
});

// GET /ai/conversations
router.get("/conversations", (req, res) => {
  const list = convs
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ messages, ...c }) => ({ ...c, count: messages.length }));
  res.json(list);
});

// POST /ai/conversations
router.post("/conversations", (req, res) => {
  const c = {
    id: uid("cv"),
    title: "New conversation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  convs.unshift(c);
  res.status(201).json(c);
});

// GET /ai/conversations/:id
router.get("/conversations/:id", (req, res) => {
  const c = convs.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found", code: "not_found" });
  res.json(c);
});

// PATCH /ai/conversations/:id
router.patch("/conversations/:id", (req, res) => {
  const c = convs.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found", code: "not_found" });
  const title = (req.body && req.body.title) || "";
  if (!title.trim()) return res.status(400).json({ message: "Title cannot be empty", code: "validation" });
  c.title = title.trim().slice(0, 60);
  c.updatedAt = new Date().toISOString();
  res.json(c);
});

// DELETE /ai/conversations/:id
router.delete("/conversations/:id", (req, res) => {
  const idx = convs.findIndex((x) => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: "Conversation not found", code: "not_found" });
  convs.splice(idx, 1);
  res.json({ ok: true });
});

// DELETE /ai/conversations/:id/messages
router.delete("/conversations/:id/messages", (req, res) => {
  const c = convs.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ message: "Conversation not found", code: "not_found" });
  c.messages = [];
  c.updatedAt = new Date().toISOString();
  res.json({ ok: true });
});

// POST /ai/conversations/:id/messages
router.post("/conversations/:id/messages", async (req, res, next) => {
  try {
    const c = convs.find((x) => x.id === req.params.id);
    if (!c) return res.status(404).json({ message: "Conversation not found", code: "not_found" });

    const message = req.body && (req.body.message || req.body.text || "");
    const routed = await getAssistant().route(message);
    const assistantPayload = formatAssistantResponse(routed);

    const now = new Date().toISOString();
    const userMsg = { id: uid("m"), role: "user", text: message, createdAt: now };
    const assistantMsg = {
      id: uid("m"),
      role: "assistant",
      createdAt: new Date().toISOString(),
      ...assistantPayload,
    };

    c.messages.push(userMsg, assistantMsg);
    c.updatedAt = assistantMsg.createdAt;
    if (c.title === "New conversation") {
      c.title = message.slice(0, 40);
    }

    res.json({ user: userMsg, assistant: assistantMsg, title: c.title });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
