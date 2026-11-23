// DEVELOPMENT ADAPTER — demo loans. Mirrors the REST contract documented in docs/BACKEND_CONTRACTS.md.
// Nothing here is real lending: rules are simplified so every UI state can be exercised.
import {store} from '../mock.js';
import {wait,fail,TODAY,TODAY_ISO,sum,uid} from './core.js';
import {emi,buildSchedule,dueOn,sumOf} from '../../utils/loan.js';

export const PRODUCTS=[
 {type:'personal',name:'Personal Loan',blurb:'Flexible funds for medical, wedding, travel or renovation costs. No collateral.',min:25000,max:1000000,minTenure:6,maxTenure:60,rate:12.5,feePct:1,foreclosurePct:2,incomeMultiple:24,purposes:['Medical','Wedding','Travel','Home renovation','Debt consolidation','Other']},
 {type:'home',name:'Home Loan',blurb:'Buy, build or renovate a home with long tenures and the lowest rates.',min:500000,max:10000000,minTenure:60,maxTenure:360,rate:8.75,feePct:0.5,foreclosurePct:0,incomeMultiple:120,purposes:['Purchase','Construction','Renovation','Plot']},
 {type:'vehicle',name:'Vehicle Loan',blurb:'Finance a new or used car or two-wheeler.',min:100000,max:2500000,minTenure:12,maxTenure:84,rate:9.5,feePct:1,foreclosurePct:2,incomeMultiple:60,purposes:['New car','Used car','Two-wheeler']},
 {type:'education',name:'Education Loan',blurb:'Cover tuition and living costs for study in India or abroad.',min:50000,max:2000000,minTenure:12,maxTenure:120,rate:9,feePct:0.5,foreclosurePct:0,incomeMultiple:60,purposes:['Tuition','Living expenses','Study abroad']}];
export const EMPLOYMENT=['Salaried','Self-employed','Business owner','Student','Other'];
const prod=t=>PRODUCTS.find(p=>p.type===t);
const acct=id=>store.acc.find(a=>a.id===id);
const feeFor=(p,amount)=>Math.max(500,Math.round(amount*p.feePct/100));
const daysTo=d=>Math.round((new Date(d+'T12:00:00')-TODAY)/864e5);

// ── seeded data (demo clock: 13 Oct 2026) ──
const mk=(o,paid)=>{const rows=buildSchedule({principal:o.principal,rate:o.rate,emi:emi(o.principal,o.rate,o.tenure),count:o.tenure,firstDue:dueOn(o.disbursedOn,1)});
 rows.forEach((r,i)=>{if(i<paid)r.paidOn=r.due});return{...o,emi:emi(o.principal,o.rate,o.tenure),rows,status:o.closedOn?'closed':'active'}};
let LOANS=[
 mk({id:'LN1001',type:'personal',principal:300000,rate:12.5,tenure:24,disbursedOn:'2026-04-05',accountId:'a1',fees:{processing:3000},applicationId:'LA2001'},6),
 mk({id:'LN0902',type:'education',principal:100000,rate:9,tenure:12,disbursedOn:'2025-06-10',accountId:'a1',fees:{processing:500},closedOn:'2026-06-10'},12)];
let APPS=[
 {id:'LA2001',type:'personal',amount:300000,tenure:24,purpose:'Home renovation',employment:'Salaried',income:85000,accountId:'a1',status:'disbursed',createdAt:'2026-04-01',loanId:'LN1001',
  events:[{at:'2026-04-01T10:00:00',status:'under_review',note:'Application received'},{at:'2026-04-03T14:20:00',status:'approved',note:'Approved at 12.5% p.a.'},{at:'2026-04-05T09:10:00',status:'disbursed',note:'Funds credited to your account'}]},
 {id:'LA2002',type:'vehicle',amount:2500000,tenure:60,purpose:'New car',employment:'Salaried',income:85000,accountId:'a1',status:'rejected',createdAt:'2026-02-10',reason:'The requested amount is high compared with your stated monthly income.',
  events:[{at:'2026-02-10T11:00:00',status:'under_review',note:'Application received'},{at:'2026-02-12T16:45:00',status:'rejected',note:'Not approved'}]}];

// ── views ──
const rowStatus=r=>r.paidOn?'paid':r.due<TODAY_ISO?'overdue':daysTo(r.due)<=7?'due':'upcoming';
const summary=l=>{const p=prod(l.type),rows=l.rows.map(r=>({...r,status:rowStatus(r)})),unpaid=rows.filter(r=>!r.paidOn),paid=rows.filter(r=>r.paidOn),next=unpaid[0]||null,
 outstanding=l.status==='closed'||!next?0:next.balance+next.principal,overdue=unpaid.filter(r=>r.status==='overdue'),
 status=l.status==='closed'?'closed':overdue.length?'overdue':'active',fee=Math.round(outstanding*p.foreclosurePct/100);
 return{id:l.id,type:l.type,name:p.name,principal:l.principal,rate:l.rate,tenure:l.tenure,emi:l.emi,disbursedOn:l.disbursedOn,closedOn:l.closedOn||null,accountId:l.accountId,fees:l.fees,applicationId:l.applicationId||null,
  status,outstanding,paidCount:paid.length,remainingCount:unpaid.length,pct:Math.min(100,Math.round((l.principal-outstanding)/l.principal*1000)/10),
  next:next&&status!=='closed'?{n:next.n,due:next.due,amount:next.emi,status:next.status}:null,overdueCount:overdue.length,overdueAmount:sumOf(overdue,'emi'),
  interestPaid:sumOf(paid,'interest'),totalInterest:sumOf(rows,'interest'),
  foreclosure:status==='closed'?null:{outstanding,feePct:p.foreclosurePct,fee,total:outstanding+fee},_rows:rows}};
const strip=({_rows,...s})=>s;
const post=(accountId,type,amount,desc,kind,remarks='')=>{const a=acct(accountId),t={id:'TXN'+Date.now().toString().slice(-6)+Math.floor(10+Math.random()*90),ref:'REF'+Date.now(),date:new Date().toISOString(),accountId,desc,category:kind==='loan_disbursal'?'Other':'Bills',type,amount,status:'completed',kind,remarks};
 const s=type==='credit'?1:-1;a.balance+=s*amount;a.available+=s*amount;store.tx=[t,...store.tx];return t};
const debitCheck=(accountId,amount)=>{const a=acct(accountId);if(!a)throw fail('Account not found for this user.','forbidden',403);if(amount>a.available)throw fail('Insufficient available balance.','insufficient');return a};
const find=id=>{const l=LOANS.find(x=>x.id===id);if(!l)throw fail('Loan not found','not_found',404);return l};
const totals=items=>{const act=items.filter(l=>l.status!=='closed'),due=act.filter(l=>l.next).sort((a,b)=>a.next.due.localeCompare(b.next.due))[0];
 return{active:act.length,outstanding:sum(act,l=>l.outstanding),monthlyEmi:sum(act,l=>l.emi),overdue:sum(act,l=>l.overdueCount),nextDue:due?{loanId:due.id,name:due.name,due:due.next.due,amount:due.next.amount}:null}};
const offerFor=(p,amount,tenure)=>{const e=emi(amount,p.rate,tenure),rows=buildSchedule({principal:amount,rate:p.rate,emi:e,count:tenure}),fee=feeFor(p,amount);
 return{amount,rate:p.rate,tenure,emi:e,processingFee:fee,netDisbursal:amount-fee,totalInterest:sumOf(rows,'interest'),totalPayable:sumOf(rows,'emi'),validTill:new Date(TODAY.getTime()+7*864e5).toISOString().slice(0,10)}};

export const loans={
 async products(){await wait(200);return PRODUCTS},
 async list(){await wait(300);const items=LOANS.map(summary).map(strip);return{items,totals:totals(items)}},
 async get(id){await wait(250);const s=summary(find(id));return{...strip(s),schedule:s._rows}},
 // Pay the next unpaid instalment (oldest first, so overdue EMIs are cleared before upcoming ones).
 async payEmi(id,{accountId}){await wait(900);const l=find(id);if(l.status==='closed')throw fail('This loan is already closed.','conflict',409);
  const row=l.rows.find(r=>!r.paidOn);debitCheck(accountId,row.emi);const tx=post(accountId,'debit',row.emi,`Loan EMI – ${prod(l.type).name} ${l.id}`,'loan_emi',`Instalment ${row.n} of ${l.rows.at(-1).n}`);
  row.paidOn=TODAY_ISO;if(!l.rows.some(r=>!r.paidOn)){l.status='closed';l.closedOn=TODAY_ISO}return{loan:strip(summary(l)),transaction:tx}},
 // Part-prepayment: principal falls, EMI stays, so the loan ends sooner.
 async prepay(id,{accountId,amount}){await wait(900);const l=find(id);amount=Number(amount);const s=summary(l),p=prod(l.type);
  if(l.status==='closed')throw fail('This loan is already closed.','conflict',409);if(s.overdueCount)throw fail('Clear your overdue EMIs before making a part-payment.','conflict',409);
  if(!(amount>=1000))throw fail('Minimum part-payment is ₹1,000.','validation');if(amount>=s.outstanding)throw fail('This covers the full outstanding amount. Use foreclosure to close the loan.','validation');
  const fee=Math.round(amount*p.foreclosurePct/100);debitCheck(accountId,amount+fee);
  const paidRows=l.rows.filter(r=>r.paidOn),next=l.rows.find(r=>!r.paidOn),tail=buildSchedule({principal:s.outstanding-amount,rate:l.rate,emi:l.emi,firstDue:next.due,startNo:paidRows.length+1});
  l.rows=[...paidRows,...tail];const tx=post(accountId,'debit',amount+fee,`Loan part-payment – ${p.name} ${l.id}`,'loan_prepay',fee?`Includes ₹${fee.toLocaleString('en-IN')} prepayment charge`:'');
  return{loan:strip(summary(l)),transaction:tx}},
 async foreclose(id,{accountId}){await wait(1000);const l=find(id),s=summary(l);if(l.status==='closed')throw fail('This loan is already closed.','conflict',409);
  debitCheck(accountId,s.foreclosure.total);const tx=post(accountId,'debit',s.foreclosure.total,`Loan foreclosure – ${s.name} ${l.id}`,'loan_prepay',s.foreclosure.fee?`Includes ₹${s.foreclosure.fee.toLocaleString('en-IN')} foreclosure charge`:'');
  l.rows=l.rows.filter(r=>r.paidOn);l.status='closed';l.closedOn=TODAY_ISO;return{loan:strip(summary(l)),transaction:tx}},

 async applications(){await wait(250);return{items:[...APPS].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}},
 async application(id){await wait(250);const a=APPS.find(x=>x.id===id);if(!a)throw fail('Application not found','not_found',404);return{...a,name:prod(a.type).name}},
 async apply(d){await wait(800);const p=prod(d.type);if(!p)throw fail('Choose a loan type.','validation');const amount=Number(d.amount),tenure=Number(d.tenure),income=Number(d.income);
  if(!(amount>=p.min&&amount<=p.max))throw fail(`${p.name} amounts range from ₹${p.min.toLocaleString('en-IN')} to ₹${p.max.toLocaleString('en-IN')}.`,'validation');
  if(!Number.isInteger(tenure)||tenure<p.minTenure||tenure>p.maxTenure)throw fail(`Tenure must be ${p.minTenure}–${p.maxTenure} months.`,'validation');
  if(!(income>0))throw fail('Enter your monthly income.','validation');if(!EMPLOYMENT.includes(d.employment))throw fail('Choose your employment type.','validation');
  if(!p.purposes.includes(d.purpose))throw fail('Choose a purpose.','validation');if(!acct(d.accountId))throw fail('Choose an account to receive the funds.','validation');
  const now=new Date().toISOString(),a={id:uid('LA'),type:p.type,amount,tenure,purpose:d.purpose,employment:d.employment,income,accountId:d.accountId,status:'under_review',createdAt:now.slice(0,10),
   events:[{at:now,status:'under_review',note:'Application received. The bank is reviewing it.'}]};APPS=[a,...APPS];return{...a,name:p.name}},
 // Demo decision rules: income multiple cap, and total EMIs must stay within 50% of income.
 async check(id){await wait(700);const a=APPS.find(x=>x.id===id);if(!a)throw fail('Application not found','not_found',404);const p=prod(a.type);
  if(a.status==='under_review'){const now=new Date().toISOString(),existing=sum(LOANS.filter(l=>l.status!=='closed'),l=>l.emi),e=emi(a.amount,p.rate,a.tenure);let why='';
   if(a.employment==='Student'&&a.type!=='education')why='Student applicants can currently apply for education loans only.';
   else if(a.amount>a.income*p.incomeMultiple)why='The requested amount is high compared with your stated monthly income.';
   else if(existing+e>a.income*0.5)why='Your total monthly EMIs would exceed 50% of your income.';
   if(why){a.status='rejected';a.reason=why;a.events.push({at:now,status:'rejected',note:'Not approved'})}
   else{a.status='approved';a.offer=offerFor(p,a.amount,a.tenure);a.events.push({at:now,status:'approved',note:`Approved at ${p.rate}% p.a. Accept the offer to receive the funds.`})}}
  return{...a,name:p.name}},
 async accept(id,{accountId}){await wait(1100);const a=APPS.find(x=>x.id===id);if(!a)throw fail('Application not found','not_found',404);
  if(a.status!=='approved')throw fail('Only an approved offer can be accepted.','conflict',409);if(!acct(accountId))throw fail('Choose an account to receive the funds.','validation');
  const p=prod(a.type),o=a.offer,loan=mk({id:'LN'+Math.floor(2000+Math.random()*7999),type:a.type,principal:o.amount,rate:o.rate,tenure:o.tenure,disbursedOn:TODAY_ISO,accountId,fees:{processing:o.processingFee},applicationId:a.id},0);
  LOANS=[loan,...LOANS];const tx=post(accountId,'credit',o.netDisbursal,`Loan disbursal – ${p.name} ${loan.id}`,'loan_disbursal',`₹${o.amount.toLocaleString('en-IN')} sanctioned, less ₹${o.processingFee.toLocaleString('en-IN')} processing fee`);
  a.status='disbursed';a.loanId=loan.id;a.accountId=accountId;a.events.push({at:new Date().toISOString(),status:'disbursed',note:'Funds credited to your account'});return{application:{...a,name:p.name},loan:strip(summary(loan)),transaction:tx}},
 async withdraw(id){await wait(400);const a=APPS.find(x=>x.id===id);if(!a)throw fail('Application not found','not_found',404);
  if(!['under_review','approved'].includes(a.status))throw fail('This application can no longer be withdrawn.','conflict',409);a.status='declined';a.events.push({at:new Date().toISOString(),status:'declined',note:'You withdrew this application'});return{...a,name:prod(a.type).name}}
};

// Notification items for ./fraud.js (EMIs due or overdue, and offers waiting to be accepted).
export const loanNotes=()=>{const out=[];
 LOANS.map(summary).forEach(s=>{if(s.next&&['overdue','due'].includes(s.next.status))out.push({id:`n-ln-${s.id}-${s.next.n}`,type:'loan',title:s.next.status==='overdue'?'EMI overdue':'EMI due soon',
  body:`Your ${s.name} EMI of ₹${s.next.amount.toLocaleString('en-IN')} ${s.next.status==='overdue'?'was due on':'is due on'} ${new Date(s.next.due).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}.`,createdAt:s.next.due+'T08:00:00',link:`/loans/${s.id}`})});
 APPS.filter(a=>a.status==='approved').forEach(a=>out.push({id:'n-la-'+a.id,type:'loan',title:'Loan offer ready',body:`Your ${prod(a.type).name} application was approved. Review and accept the offer.`,createdAt:a.events.at(-1).at,link:`/loans/applications/${a.id}`}));
 return out};
