# Live (MongoDB) modules vs demo modules

The app can run each module on the real backend or on demo data. This is controlled by `.env`:

```
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
VITE_USE_MOCK=true
VITE_REAL_MODULES=auth,accounts,transactions,dashboard
```

| Module | Backend | Pages |
|---|---|---|
| auth | live | Login, Register (OTP / forgot-password stay simulated) |
| accounts | live | My Accounts, Account Details |
| transactions | live | Transaction History, Transaction Details (receipt) |
| dashboard | live | Balance, income / expenses this month, charts, recent transactions |
| everything else | demo | Transfers, Deposit/Withdraw, Beneficiaries, Statements, Cards, Loans, Analytics, AI, Fraud, Goals |

* Leave `VITE_REAL_MODULES` empty for the original all-demo behaviour.
* `VITE_USE_MOCK=false` still switches EVERY module to the real backend (only use once all modules exist).
* Connected pages show a green "Live data" pill; demo modules show an amber "Demo mode" note while any module is live.
* Demo modules keep using their own sample accounts, so their flows keep working; they do not change live balances.
* After changing `.env` on Vercel, redeploy (Vite reads env at build time).
