# FINOVA frontend
`npm install` then `npm run dev`. Demo login: demo@finova.com / Demo@1234. OTP code in demo: 123456 (000000 = expired).
Env: VITE_API_BASE_URL, VITE_USE_MOCK (true = demo mode, false = real API).
Integration points: src/services/index.js (each method lists its REST endpoint). Mock data: src/services/mock.js, src/data/seed.js.
Backend must enforce auth, limits and ownership; the UI only validates for UX. AI chat calls POST /ai/chat (backend -> LLM -> authorized banking APIs).
TODO: real PDF generation (backend), refresh tokens, a11y audit, tests, i18n, card management.

Features 51-80: error mapping in src/utils/errors.js; balance privacy via useApp().hide + <Amt/>; session idle timeout via VITE_SESSION_IDLE_MIN (default 15). Pages for cards/loans/analytics/goals/notifications are Coming Soon placeholders. AI and Admin features are intentionally not built yet.


## Phase 3 — features 81–130

New routes: `/transfers` (+`/new`, `/history`, `/:id`), `/beneficiaries` (+`/new`, `/:id`), `/ai-agent`, `/fraud-alerts` (+`/:alertId`),
`/analytics/{insights,categories,budgets,history,forecast}`, `/financial-goals` (+`/new`, `/plan`, `/monthly`, `/:id`), `/notifications`.
Old paths (`/transfer`, `/fraud-detection`, `/financial-insights`, `/goals`, `/analytics`) redirect to the new pages.

* **Services:** `src/services/phase3.js` (REST endpoint documented on every method). Demo data lives only in `src/services/dev/` and is used when `VITE_USE_MOCK !== 'false'`; a "Demo mode" notice is shown on every new page.
* **Missing backend endpoints:** see `docs/BACKEND_CONTRACTS.md`. None are assumed to exist.
* **Safety rules honoured:** transfers are never shown as successful unless the API says `completed`; the AI can only *preview* actions; beneficiary verification/activation states come from the API; fees/scores/intervals appear only when supplied; goal contributions are planning records.
* **Smoke test:** `npm run test:smoke` builds, serves and runs 45 Playwright checks (needs `pip install playwright` + Chromium). Field lookups are scoped to `<main>` and use labels, so the header search box is never matched. Note: the demo adapter is in-memory, so tests navigate in-app (a full `page.goto` resets it).

## Connect the real API
1. Create `.env` with `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=https://your-host/api`, then `npm run dev` or `npm run build`.
2. Implement the endpoints in `docs/BACKEND_CONTRACTS.md` (every service method is also annotated in `src/services/phase3.js`).
3. Check your server: `npm run verify:contract -- --api https://your-host/api --token <JWT>` (shapes are defined in `src/services/contract.js`).
4. The "Demo mode" banners disappear automatically when `VITE_USE_MOCK=false`. Never ship the demo adapter's data as real.

## Run without installing anything
`finova.html` (built with `npm run build:single`) is one self-contained file: open it in a browser. Login `demo@finova.com` / `Demo@1234`, OTP `123456`.
Set `VITE_DEMO_INSIGHT_SAVE=true` at build time to switch on the "Save insight" demo capability.

## Backend (server/)
See `server/README.md`. Quick start: `cd server && npm install && cp .env.example .env` (fill in `[CONNECTION_STRING]`), then `npm run db:check` and `npm run dev`.
Real credentials were removed from this package; rotate any Atlas password that was shared previously.

## Responsive design

The UI is built mobile-first and tested against these breakpoints: `xs` 420px, `sm` 640px, `md` 768px, `lg` 1024px (sidebar appears), `xl` 1280px, `2xl` 1536px, `3xl` 1920px.

- Phones: slide-out drawer + bottom tab bar, header search collapses to an icon, icon-only logo below 420px, 16px form fields (no iOS zoom), 40px+ tap targets, safe-area padding for notches / home indicator (`viewport-fit=cover`).
- Tables switch to card lists on small screens; wide tables scroll inside their own container, never the page.
- Charts use narrower axes on phones; segmented controls and modals go full-width / bottom-sheet.
- After changing styles, rebuild the standalone bundle with `npm run build:single` (the committed `standalone/finova.html` is a prebuilt file).

## Loans

Routes: `/loans` (overview), `/loans/apply`, `/loans/calculator`, `/loans/applications/:id`, `/loans/:id`. In demo mode (`VITE_USE_MOCK !== 'false'`) data comes from `src/services/dev/loans.js`; endpoints are in `docs/BACKEND_CONTRACTS.md` and `src/services/phase3.js` (`loanApi`). EMI maths lives in `src/utils/loan.js`.

## Virtual cards

Routes: `/cards`, `/cards/new`, `/cards/:id`. Demo data lives in `src/services/dev/cards.js` (`cardApi` in `src/services/phase3.js`); the card artwork is `src/components/cards/CardFace.jsx`. Full card numbers are only returned by `POST /cards/:id/reveal` after an OTP check. See `docs/BACKEND_CONTRACTS.md`.
