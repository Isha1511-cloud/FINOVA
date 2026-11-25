// Per-module switch between demo (mock) data and the real backend.
//  - VITE_USE_MOCK=false            -> every module uses the real backend (original behaviour, unchanged)
//  - VITE_REAL_MODULES=a,b,c        -> ONLY the listed modules use the real backend; all others stay in demo mode
// Module names: auth (login/register), accounts, transactions, dashboard.
export const ALL_REAL=import.meta.env.VITE_USE_MOCK==='false';
const LIST=(import.meta.env.VITE_REAL_MODULES||'').split(',').map(s=>s.trim()).filter(Boolean);
export const isReal=m=>ALL_REAL||LIST.includes(m);
export const ANY_REAL=ALL_REAL||LIST.length>0;
