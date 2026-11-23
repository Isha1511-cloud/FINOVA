# FINOVA — Modern Intelligent Banking System

FINOVA is an intelligent full-stack banking web platform with smart financial insights, loans, virtual card management, fraud alerts, and an integrated AI assistant.

---

## 📁 Project Architecture

The project is cleanly split into two dedicated parts:

```text
FINOVA/
├── frontend/             # React 18 + Vite SPA client
│   ├── src/              # Application components, pages, context, and state
│   ├── public/           # Static assets and icons
│   ├── package.json      # Frontend dependencies & scripts
│   ├── vite.config.js    # Vite bundler configuration
│   ├── tailwind.config.js# Tailwind theme & rich animation keyframes
│   ├── vercel.json       # SPA client-side routing rewrites
│   └── .env.example      # Frontend environment template
│
├── backend/              # Node.js + Express 5 REST API
│   ├── ai/               # AI agent routing, guardrails, and Gemini model client
│   ├── config/           # Database connection & env validation
│   ├── controllers/      # Route controllers (auth, accounts, transactions, etc.)
│   ├── models/           # Mongoose schemas & data models
│   ├── routes/           # REST API endpoints
│   ├── scripts/          # DB connection verification scripts
│   ├── test/             # Built-in node:test suite (23 tests)
│   ├── package.json      # Backend dependencies & scripts
│   └── .env.example      # Backend environment template
│
├── package.json          # Monorepo root convenience scripts
└── vercel.json           # Root Vercel build & SPA routing configuration
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
npm install
npm run db:check    # Verifies MongoDB Atlas connectivity
npm run dev         # Starts backend API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Starts frontend on http://localhost:5173
```

### 3. Or Run from Root
```bash
npm run dev:frontend   # Run frontend dev server
npm run dev:backend    # Run backend API dev server
npm run build          # Build frontend for production
```

---

## 🌐 Deployments

* **Frontend (Vercel):** [https://finova-zeta-inky.vercel.app](https://finova-zeta-inky.vercel.app/)
* **Backend (Render):** [https://finova-cxy9.onrender.com](https://finova-cxy9.onrender.com)
* **Backend Health Check:** [https://finova-cxy9.onrender.com/api/health](https://finova-cxy9.onrender.com/api/health)

---

## 🔑 Demo Login Credentials
* **Email:** `demo@finova.com`
* **Password:** `Demo@1234`
* **OTP:** `123456`
