# FINOVA backend – DB connection fix package

Stack: Node.js (>= 20.19) · Express 5 · Mongoose 9 · [DATABASE_TYPE] = MongoDB (Atlas or local).
Layout: `[PROJECT_ROOT]/server` (drop this `server/` folder over the existing one; keep the frontend as is).

## What was wrong
| # | Symptom / cause | Fix |
|---|---|---|
| 1 | `npm run dev` → **Missing script: "dev"**. `start`/`dev` were added to the *frontend* `package.json` (project root), not `server/package.json`. | Scripts added to `server/package.json` (`start`, `dev`, `db:check`, `test`); `main` now `app.js`. See "Restore the frontend scripts" below. |
| 2 | `FRONTEND_URL` was an unfilled placeholder / undefined → broken CORS. | Validated origin allow-list (comma-separated); falls back to `http://localhost:5173`. |
| 3 | Connection string unvalidated, no timeouts/retry, vague errors, no DB name set. | `config/env.js` validates; `config/db.js` has timeouts, retry/backoff, event logging, credential redaction, and error hints (bad auth, DNS, Atlas IP not allow-listed, malformed URI). |
| 4 | Real credentials were committed in `.env` files inside the zip. | Removed from this package. **Rotate that Atlas DB user's password** and never commit `.env`. |

## Setup
1. `cd server`
2. `npm install`
3. `cp .env.example .env` (Windows PowerShell: `Copy-Item .env.example .env`) and fill in:
   - `MONGODB_URI=[CONNECTION_STRING]` – Atlas → Database → Connect → Drivers. Format
     `mongodb+srv://<user>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority`
     (URL-encode special password characters: `@`→`%40`, `:`→`%3A`, `/`→`%2F`, `#`→`%23`; no `<>` brackets).
   - `MONGODB_DB_NAME=[DATABASE_NAME]` – only needed if the URI has no `/<database>`.
   - `FRONTEND_URL` – e.g. `http://localhost:5173` (comma-separate several).
4. Atlas → **Network Access** → add your current IP (or `0.0.0.0/0` for testing only).
5. Verify: `npm run db:check` → "DB check passed."
6. Run: `npm run dev` (nodemon) or `npm start`. Check `http://localhost:5000/api/health` → `{"status":"ok","db":"connected"}` (503 `degraded` if the DB is down).
7. Tests (no DB needed): `npm test`.

## Troubleshooting (messages include a `Hint:` line)
- `Authentication failed` → wrong DB user/password (Atlas *Database Access*, not your Atlas login); URL-encode the password.
- `Server selection timed out` / `ReplicaSetNoPrimary` → IP not allow-listed, VPN/firewall, or cluster paused.
- `querySrv ENOTFOUND` → wrong cluster host or DNS blocked; try the non-SRV `mongodb://` string from Atlas.
- `Port 5000 is already in use` → change `PORT`.
- Variables not loading → `.env` must sit in `server/` next to `app.js`; no quotes or spaces around `=` needed.

## Restore the frontend scripts (project root `package.json`)
The root file's `"scripts"` block was overwritten with the backend's. Replace it with:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "build:single": "vite build --config vite.single.config.js",
  "test:smoke": "bash tests/run-smoke.sh",
  "verify:contract": "node scripts/verify-contract.mjs"
}
```
(Reconstructed from the frontend README/`tests/run-smoke.sh`; adjust if your original differed.)

## Notes
- `routes/`, `controllers/`, `models/` were empty in the supplied project and are kept as empty folders; mount routers in `app.js` where marked.
- Changed lines are marked `// CHANGED` in `app.js`; `config/db.js` and `config/env.js` are rewritten/new.

---

## Real data layer: Users, Accounts, Transactions (MongoDB)

**Collections:** `users`, `accounts`, `transactions` (Mongoose creates them on first write / `npm run seed`).

**One-time setup after pulling these changes**
1. Rotate the Atlas DB password (the old one was in the zip) and put the new URI in `.env` (never commit it).
2. Add `JWT_SECRET` to `.env` (>= 32 random chars) and to the Render environment variables.
3. `npm install && npm run seed` (creates fictional demo data; safe to re-run). If the database was previously
   auto-seeded by the old code, run `npm run seed -- --clean-legacy` once to remove those old unowned records.
4. `npm run verify:api` runs the end-to-end checks against your database (auth, ownership, dashboard math).

**Demo login (fictional, development only):** `demo@finova.com` / `Demo@1234` (override with `SEED_DEMO_PASSWORD`).

**APIs** (all except register/login require `Authorization: Bearer <token>`; identity comes from the token only)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | return `{ token, user }` |
| GET | `/api/auth/me` | current user |
| GET | `/api/accounts`, `/api/accounts/:id` | own accounts; number masked (`XXXXXXXX0001`) |
| GET | `/api/transactions` | filters: `q,type,category,status,accountId,from,to,min,max,sort,page,pageSize` |
| GET | `/api/transactions/:id` | by document id or `referenceId` |
| GET | `/api/dashboard/summary` | `?days=30&recent=5` -> balance, income, expenses, accounts, recent txns |

Other users' records return 404 (existence is not revealed). `/api/deposits`, `/api/withdrawals`, `/api/statements`
share these collections and are now authenticated and owner-scoped too (their features are otherwise unchanged).

**Render:** set `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, `FRONTEND_URL` (your Vercel origin; comma-separate several), `NODE_ENV=production`.
Health check path: `/api/health`. Do not run the seed in production unless you intend to (`ALLOW_SEED=true`).
