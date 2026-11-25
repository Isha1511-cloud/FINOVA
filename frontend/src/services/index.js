// Single switch between mock (demo) and real REST API. Each method documents its endpoint.
import {mock} from './mock.js';import {http} from './http.js';import {isReal} from './config.js';
const M=import.meta.env.VITE_USE_MOCK!=='false';
const pick=(m,real)=>M?m():real();
// Per-module variant: real backend only when that module is enabled (see config.js), otherwise demo data.
const pickM=(mod,m,real)=>isReal(mod)?real():m();
export const authService={
 login:d=>pickM('auth',()=>mock.login(d),()=>http('/auth/login',{method:'POST',body:d})),            // POST /auth/login
 register:d=>pickM('auth',()=>mock.register(d),()=>http('/auth/register',{method:'POST',body:d})),   // POST /auth/register
 sendOtp:d=>pick(()=>mock.sendOtp(d),()=>http('/auth/otp/send',{method:'POST',body:d})),     // POST /auth/otp/send
 verifyOtp:d=>pick(()=>mock.verifyOtp(d),()=>http('/auth/otp/verify',{method:'POST',body:d})),// POST /auth/otp/verify
 resetPassword:d=>pick(()=>mock.resetPassword(d),()=>http('/auth/reset-password',{method:'POST',body:d}))};
export const accountService={list:()=>pick(()=>mock.accounts(),()=>http('/accounts')),
 get:id=>pick(()=>mock.accounts().then(l=>l.find(a=>a.id===id)||Promise.reject(new Error('Account not found'))),()=>http(`/accounts/${id}`))}; // GET /accounts, GET /accounts/:id      // GET /accounts
// Accounts used by the CONNECTED pages (Accounts, Transactions, Dashboard). Other modules that still run on demo data
// (transfers, cards, loans, fraud...) keep using accountService above, so their demo flows keep working.
export const liveAccountService={list:()=>pickM('accounts',()=>mock.accounts(),()=>http('/accounts')),
 get:id=>pickM('accounts',()=>mock.accounts().then(l=>l.find(a=>a.id===id)||Promise.reject(new Error('Account not found'))),()=>http(`/accounts/${id}`))};
export const transactionService={
 list:p=>pickM('transactions',()=>mock.txList(p),()=>http('/transactions',{params:p})),                      // GET /transactions
 get:id=>pickM('transactions',()=>mock.txGet(id),()=>http(`/transactions/${id}`))};                          // GET /transactions/:id
// Real-only: returns null when the dashboard module is not connected (the page then falls back to demo insights).
export const dashboardService={summary:p=>isReal('dashboard')?http('/dashboard/summary',{params:p}):Promise.resolve(null)}; // GET /dashboard/summary                          // GET /transactions/:id
export const transferService={
 transfer:d=>pick(()=>mock.transfer(d),()=>http('/transfers',{method:'POST',body:d})),       // POST /transfers
 deposit:d=>pick(()=>mock.money('deposit',d),()=>http('/deposits',{method:'POST',body:d})),  // POST /deposits
 withdraw:d=>pick(()=>mock.money('withdraw',d),()=>http('/withdrawals',{method:'POST',body:d}))};// POST /withdrawals
export const beneficiaryService={
 list:()=>pick(()=>mock.benList(),()=>http('/beneficiaries')),
 save:b=>pick(()=>mock.benSave(b),()=>http(b.id?`/beneficiaries/${b.id}`:'/beneficiaries',{method:b.id?'PUT':'POST',body:b})),
 remove:id=>pick(()=>mock.benDelete(id),()=>http(`/beneficiaries/${id}`,{method:'DELETE'}))};
export const statementService={get:p=>pick(()=>mock.statement(p),()=>http('/statements',{params:p}))}; // GET /statements (+ /statements/download?format=pdf|csv)
export const aiService={
 ask:q=>pick(()=>mock.ai(q),()=>http('/ai/chat',{method:'POST',body:{message:q}})),         // POST /ai/chat (backend -> LLM -> authorized APIs)
 insights:()=>pick(()=>mock.insights(),()=>http('/insights'))};
export const fraudService={
 list:()=>pick(()=>mock.fraudList(),()=>http('/fraud/alerts')),
 resolve:(id,status)=>pick(()=>mock.fraudResolve(id,status),()=>http(`/fraud/alerts/${id}`,{method:'PATCH',body:{status}}))};
