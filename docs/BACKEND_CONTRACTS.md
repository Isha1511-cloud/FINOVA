# FINOVA Phase 3 — backend contracts the frontend expects

The existing Express/PostgreSQL backend was **not** available in this repository, so none of the endpoints below are
assumed to exist. In demo mode (`VITE_USE_MOCK=true`) the UI talks to `src/services/dev/*`, a development adapter that
returns demonstration data. Set `VITE_USE_MOCK=false` to call the real API. Every method and its endpoint is listed in
`src/services/phase3.js`. All endpoints require `Authorization: Bearer <token>` and **must enforce ownership server-side**
(return 404 for resources not owned by the caller, 403 for forbidden actions).

Error shape: `{ "message": string, "code"?: string }` with HTTP status. Codes the UI understands:
`validation`, `duplicate`(409), `insufficient`, `limit`, `beneficiary_inactive`, `declined`, `not_found`, `forbidden`,
`rate_limited`(429), `timeout`(504), `permission_denied`(403).

## Transfers & beneficiaries (81–90)
| Endpoint | Notes |
|---|---|
| `GET /transfers/limits` | `{perTransfer, daily, usedToday}` — UI hides limit info if missing |
| `GET /transfers` | filters `q,status,beneficiaryId,from,to,min,max,sort,page,pageSize` → `{items,total}` |
| `GET /transfers/:id` | `{id,ref,date,amount,status,desc,accountId,kind:'own'|'beneficiary',beneficiaryName?,toAccountId?,remarks,bankRef?,failureReason?,fee?,events:[{at,status,note}]}` |
| `POST /transfers` | body `{mode,sourceId,destId?,beneficiaryId?,amount,description,idempotencyKey}` → `{status,transfer}`. **Server must dedupe by idempotencyKey.** Status may be `pending`; UI never shows success unless `completed`. |
| `GET/POST /beneficiaries`, `GET/PATCH/DELETE /beneficiaries/:id` | PATCH accepts `nickname` only. 409 on duplicate account+IFSC. |
| `GET /beneficiaries/:id/status`, `POST .../activate`, `POST .../verify` | Status values: `pending_verification, verified, verification_failed, activation_pending, active`. Real OTP/bank verification is entirely backend-owned. |
Fees are shown only if `fee` is present on the transfer/preview response.

## AI banking agent (91–100)
`GET/POST /ai/conversations`, `GET/PATCH/DELETE /ai/conversations/:id`, `POST /ai/conversations/:id/messages`.
Assistant message: `{id,role,createdAt,text,source:'banking_data'|'ai',unsupported?,blocks:[...]}`. Block `type`s:
`metrics, transactions, categories, spending, comparison, action`. The UI renders them with React text nodes only (no HTML).
`action` blocks are **previews with a link** — the AI must never execute a transfer. The model's data access must go through
the same authorised services as the app. Do not persist full financial payloads outside the authorised database.

## Fraud (101–110)
`GET /fraud/alerts`, `GET /fraud/alerts/:id`, `POST /fraud/alerts/:id/report` (`{description,confirm:true}` → `{status,caseRef}`),
`POST /fraud/alerts/:id/acknowledge`. Alert: `{id,ref,txnId,accountId,amount,date,counterparty,risk,riskScore?,status,createdAt,reasons:[{code,text,kind:'observed'|'model'}],timeline,customerActions:['report','acknowledge'],caseRef?}`.
Status: `new, under_review, resolved, closed`. `customerActions` is authoritative; the UI renders no admin controls.
`GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`.

## Insights, budgets, goals, forecast (111–130)
`GET /capabilities` → flags `categoryEdit, budgets, insightDismiss, insightSave, cardLock, goalsPersist, planPersist`.
`GET /insights/{summary,compare,category,trend,recommendations,history}`, `POST /insights/:id/dismiss`,
`PATCH /transactions/:id/category`, `GET/POST /budgets`, `DELETE /budgets/:id`, `GET /budgets/alerts`,
`GET/POST /goals`, `GET/DELETE /goals/:id`, `POST /goals/:id/contributions`, `POST /goals/plan`, `GET /goals/averages`,
`GET/PUT /savings-plans/:yyyy-mm`, `GET /forecast`, `GET /forecast/upcoming`.
Definitions to keep consistent: income = completed credits, expenses = completed debits, own-account transfers excluded.
Budget status thresholds are returned by the API (`approaching 75%`, `exceeded 100%`). Forecast intervals must be omitted
unless the model provides them. Goal contributions are planning records unless linked to confirmed transactions.

## Additions in the final pass
| Endpoint | Notes |
|---|---|
| `POST /transfers/preview` | body `{mode,sourceId,beneficiaryId,amount}` → `{fee?,total?}`. Return `{}` if the bank cannot quote a fee; the UI then shows "no fee information" and never invents one. `GET /transfers/:id` should include `fee` when charged. |
| `DELETE /ai/conversations/:id/messages` | Deletes messages, keeps the conversation. |
| `PATCH /budgets/:id` | `{name,amount}` only. Budgets accept `period: weekly|monthly|yearly`; `period_label` describes the current window. One budget per category + period (409 otherwise). |
| `POST /insights/:id/save` | Toggle. The UI shows Save / Saved only when `GET /capabilities` returns `insightSave: true`. |
| `GET /forecast?horizon&spendingDelta&incomeDelta&accountId` | Deltas are percentages (spending −30..30, income −20..20; 400 otherwise). Response needs `projection` (scenario), `baseline`, `startBalance`, `generatedAt`, `dataThrough`, `method`, `assumptions`, `isBaseline`, `scenarioDeltas`. Per-month `expensesLow/High` are optional; omit them if the model has no intervals. |

## Loans
| Endpoint | Notes |
|---|---|
| `GET /loans/products` | `[{type,name,blurb,min,max,minTenure,maxTenure,rate,feePct,foreclosurePct,purposes[]}]`. `rate` is the *starting* annual rate; the UI never promises it. |
| `GET /loans` | `{items:[Loan],totals:{active,outstanding,monthlyEmi,overdue,nextDue?:{loanId,name,due,amount}}}` |
| `GET /loans/:id` | Loan plus `schedule:[{n,due,emi,principal,interest,balance,status:'paid'|'due'|'overdue'|'upcoming',paidOn?}]` and `foreclosure:{outstanding,feePct,fee,total}` (null when closed). 404 unless owned. |
| `POST /loans/:id/payments` | `{accountId}` → `{loan,transaction}`. Pays the oldest unpaid instalment. 400 `insufficient`, 409 if closed. |
| `POST /loans/:id/prepayments` | `{accountId,amount}` → `{loan,transaction}`. Part-payment reduces principal; EMI unchanged, tenure shortens. 409 while EMIs are overdue. |
| `POST /loans/:id/foreclosure` | `{accountId}` → `{loan,transaction}`. Debits `foreclosure.total`, closes the loan. |
| `GET/POST /loan-applications` | POST body `{type,amount,tenure,purpose,employment,income,accountId}` → application `status:'under_review'`. 400 `validation` with a customer-readable message. |
| `GET /loan-applications/:id` | `{id,type,name,amount,tenure,purpose,employment,income,accountId,status,createdAt,events[],offer?,reason?,loanId?}`. Status: `under_review, approved, rejected, declined, disbursed`. |
| `GET /loan-applications/:id/status` | Re-checks the decision with the bank (the UI's "Check status" button). |
| `POST /loan-applications/:id/accept` | `{accountId}` → `{application,loan,transaction}`. Only for `approved`. Credits `offer.netDisbursal` (amount less processing fee). |
| `POST /loan-applications/:id/withdraw` | Allowed while `under_review` or `approved`. |

Loan: `{id,type,name,principal,rate,tenure,emi,disbursedOn,closedOn?,accountId,status:'active'|'overdue'|'closed',outstanding,paidCount,remainingCount,pct,next?:{n,due,amount,status},overdueCount,overdueAmount,interestPaid,totalInterest,fees:{processing},applicationId?}`.
Offer: `{amount,rate,tenure,emi,processingFee,netDisbursal,totalInterest,totalPayable,validTill}`.
Rules to keep consistent: EMI uses reducing-balance interest (`src/utils/loan.js`); the bank's offer and schedule are authoritative over the calculator. Disbursals must not count as income in insights (the demo tags them `kind:'loan_disbursal'`); EMIs count as expenses. Loan events appear in `/notifications` with `type:'loan'`.

## Verifying your backend
`node scripts/verify-contract.mjs --api https://your-host/api --token <JWT>` calls the read-only endpoints (plus the
side-effect-free `POST /transfers/preview` and `POST /goals/plan`) and checks every response shape against
`src/services/contract.js`. Run it without arguments to self-test the demo adapter.
