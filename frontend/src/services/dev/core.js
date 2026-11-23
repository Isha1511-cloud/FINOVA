// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPMENT ADAPTER (Phase 3) — used only when VITE_USE_MOCK !== 'false'.
// Everything here is demonstration data. It never represents real banking
// activity. Real integration points are documented in src/services/phase3.js
// and docs/BACKEND_CONTRACTS.md.
// ─────────────────────────────────────────────────────────────────────────────
import {store} from '../mock.js';
import {CATEGORIES} from '../../data/seed.js';

export const wait=(ms=350)=>new Promise(r=>setTimeout(r,ms));
export const fail=(message,code,status=400)=>Object.assign(new Error(message),{code,status});
export const TODAY=new Date(2026,9,13,12);               // fixed demo clock (13 Oct 2026)
export const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
export const TODAY_ISO=iso(TODAY);
export const monthKey=d=>(typeof d==='string'?d:iso(d)).slice(0,7);
export const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const monthLabel=k=>`${MONTHS[+k.slice(5,7)-1]} ${k.slice(0,4)}`;
export const addMonths=(k,n)=>{const d=new Date(+k.slice(0,4),+k.slice(5,7)-1+n,1);return iso(d).slice(0,7)};
export const monthsBetween=(a,b)=>{const out=[];for(let k=a.slice(0,7);k<=b.slice(0,7);k=addMonths(k,1))out.push(k);return out};
export const DEFAULT_RANGE={from:'2026-05-01',to:TODAY_ISO};
export const sum=(l,f=x=>x.amount)=>l.reduce((s,x)=>s+f(x),0);
export const uid=p=>p+Math.random().toString(36).slice(2,8).toUpperCase();

// ── enrich the baseline seed with history so trends/forecasts have data ─────
const MERCH={Food:['Swiggy','Zomato','Cafe Coffee Day'],Shopping:['Amazon','Myntra','Flipkart'],Travel:['Uber','Ola','IRCTC'],Bills:['Airtel','Electricity Board','Jio Fiber'],Entertainment:['Netflix','BookMyShow','Spotify'],Education:['Udemy','Coursera'],Healthcare:['Apollo Pharmacy'],Other:['ATM Cash']};
const WEIGHT=['Food','Food','Food','Shopping','Shopping','Travel','Travel','Bills','Entertainment','Education','Healthcare','Other'];
let seed=11;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
(function enrich(){
 const out=[];let n=0;
 const mk=(d,o)=>({id:'TXN'+(300000+ ++n),ref:'REF'+(8000000+n*13),date:d.toISOString(),accountId:'a1',status:'completed',...o});
 for(let d=new Date(2026,4,1,9);d<=new Date(2026,9,12,9);d.setDate(d.getDate()+1)){
  const day=new Date(d),m=day.getMonth();
  if(day.getDate()===1&&[4,5,6,7,9].includes(m))out.push(mk(day,{desc:'Salary - Acme Corp',category:'Income',type:'credit',amount:85000}));
  const inSeed=iso(day)>='2026-09-04'&&iso(day)<='2026-10-02';
  if(inSeed||rnd()<0.2)continue;
  for(let k=0;k<(rnd()<0.35?2:1);k++){const c=WEIGHT[Math.floor(rnd()*WEIGHT.length)],mm=MERCH[c];
   const t=new Date(day);t.setHours(8+Math.floor(rnd()*12),Math.floor(rnd()*60));
   out.push(mk(t,{desc:mm[Math.floor(rnd()*mm.length)],category:c,type:'debit',amount:Math.round((150+rnd()*2800)/10)*10}))}
 }
 // Demo transfers with every status so the UI states can be exercised.
 const T=(id,daysAgo,benId,name,amount,status,extra={})=>{const d=new Date(2026,9,13-daysAgo,11,20);
  return{id,ref:'REF'+(7000000+ +id.slice(-3)),date:d.toISOString(),accountId:'a1',desc:`Transfer to ${name}`,category:'Other',type:'debit',amount,status,kind:'beneficiary',beneficiaryId:benId,beneficiaryName:name,remarks:extra.remarks||'',
   events:[{at:d.toISOString(),status:'pending',note:'Transfer initiated'},...(status==='pending'?[]:[{at:new Date(d.getTime()+9e4).toISOString(),status,note:extra.note||(status==='completed'?'Confirmed by bank':'')}])],failureReason:extra.failureReason,bankRef:extra.bankRef}};
 out.push(T('TXN900101',5,'b1','Rohan Mehta',15000,'completed',{bankRef:'UTR2610080001',remarks:'Rent share'}),
  T('TXN900102',8,'b2','Priya Shah',5000,'completed',{bankRef:'UTR2610050002'}),
  T('TXN900103',15,'b3','Urban Rentals LLP',32000,'completed',{bankRef:'UTR2609280003',remarks:'October rent'}),
  T('TXN900104',1,'b1','Rohan Mehta',8000,'pending'),
  T('TXN900105',3,'b2','Priya Shah',2500,'failed',{failureReason:'The beneficiary bank rejected the transaction.',note:'Rejected by beneficiary bank'}),
  T('TXN900106',10,'b3','Urban Rentals LLP',12000,'reversed',{note:'Reversed by beneficiary bank; amount returned to your account',bankRef:'UTR2610030006'}));
 const own=(id,daysAgo,from,to,amount)=>{const d=new Date(2026,9,13-daysAgo,9,5),base={ref:'REF'+(7100000+ +id.slice(-3)),date:d.toISOString(),category:'Other',amount,status:'completed',kind:'own',transferId:id,remarks:'Monthly buffer',events:[{at:d.toISOString(),status:'completed',note:'Completed instantly between your accounts'}]};
  return[{...base,id,accountId:from,desc:'Transfer to Current Account',type:'debit',toAccountId:to},{...base,id:id+'C',accountId:to,desc:'Transfer from Savings Account',type:'credit',fromAccountId:from}]};
 out.push(...own('TXN900107',4,'a1','a2',20000));
 store.tx=[...store.tx,...out].sort((a,b)=>new Date(b.date)-new Date(a.date));
 // Beneficiary workflow states (backend-owned in production).
 store.ben=store.ben.map(b=>({...b,status:'active',createdAt:'2026-06-01'}));
})();

// Shared selectors
export const liveTx=({accountId,from,to}={})=>store.tx.filter(t=>t.status==='completed'&&t.kind!=='own'&&t.kind!=='loan_disbursal'&&(!accountId||t.accountId===accountId)&&(!from||t.date.slice(0,10)>=from)&&(!to||t.date.slice(0,10)<=to));
export const debits=p=>liveTx(p).filter(t=>t.type==='debit');
export const credits=p=>liveTx(p).filter(t=>t.type==='credit');
export const byCategory=l=>{const m={};l.forEach(t=>{(m[t.category]??={name:t.category,value:0,count:0});m[t.category].value+=t.amount;m[t.category].count++});return Object.values(m).sort((a,b)=>b.value-a.value)};
export const pctChange=(cur,prev)=>prev===0?null:Math.round((cur-prev)/prev*1000)/10;
export {store,CATEGORIES};
