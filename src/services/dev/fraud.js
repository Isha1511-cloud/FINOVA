import {store,wait,fail,uid,TODAY_ISO} from './core.js';
import {budgets} from './insights.js';

const R=(code,text,kind)=>({code,text,kind});
// kind: 'observed' = a fact from your data; 'model' = interpretation produced by the fraud model
const A=[
 {id:'f1',ref:'FA-2026-0041',txnId:'TXN100207',accountId:'a1',amount:96500,date:'2026-10-01T02:14:00',counterparty:'QuickCash Ventures',risk:'high',riskScore:87,status:'new',createdAt:'2026-10-01T02:16:00',
  reasons:[R('LARGE_AMOUNT','The amount is about 20 times your typical single payment.','observed'),R('NEW_BENEFICIARY','The beneficiary was added less than 24 hours before this payment.','observed'),R('RAPID_ACTIVITY','It followed another large transaction within a short time.','observed'),R('UNUSUAL_TIME','The transaction happened at 2:14 AM, outside your usual activity hours.','observed'),R('MODEL_SUMMARY','The combination of these signals resembles patterns the model associates with unauthorised payments.','model')],
  timeline:[{at:'2026-10-01T02:16:00',status:'new',note:'Alert created by the fraud service'}]},
 {id:'f2',ref:'FA-2026-0037',txnId:'TXN100219',accountId:'a1',amount:18400,date:'2026-09-29T21:40:00',counterparty:'GlobalMart Online',risk:'medium',riskScore:58,status:'new',createdAt:'2026-09-29T21:42:00',
  reasons:[R('NEW_MERCHANT','This is the first payment to this merchant.','observed'),R('LARGE_AMOUNT','The amount is roughly 4 times your average shopping payment.','observed'),R('MODEL_SUMMARY','The model considers this a moderately unusual spending pattern.','model')],
  timeline:[{at:'2026-09-29T21:42:00',status:'new',note:'Alert created by the fraud service'}]},
 {id:'f3',ref:'FA-2026-0029',txnId:'TXN100231',accountId:'a1',amount:3200,date:'2026-09-27T13:05:00',counterparty:'Unknown Merchant',risk:'low',riskScore:22,status:'resolved',createdAt:'2026-09-27T13:07:00',
  reasons:[R('NEW_MERCHANT','The merchant category is new for your account.','observed'),R('MODEL_SUMMARY','Low-risk flag; included for completeness.','model')],
  timeline:[{at:'2026-09-27T13:07:00',status:'new',note:'Alert created by the fraud service'},{at:'2026-09-28T10:00:00',status:'under_review',note:'Picked up by the review team'},{at:'2026-09-30T15:30:00',status:'resolved',note:'Review completed: no action required'}]},
 {id:'f4',ref:'FA-2026-0018',txnId:'TXN300041',accountId:'a1',amount:7450,date:'2026-09-12T23:10:00',counterparty:'Flipkart',risk:'medium',riskScore:49,status:'closed',createdAt:'2026-09-12T23:12:00',
  reasons:[R('UNUSUAL_TIME','The transaction happened late at night.','observed'),R('MODEL_SUMMARY','Moderately unusual timing.','model')],
  timeline:[{at:'2026-09-12T23:12:00',status:'new',note:'Alert created by the fraud service'},{at:'2026-09-13T09:00:00',status:'closed',note:'Confirmed as genuine by the customer'}]}];
const view=a=>({...a,customerActions:['new','under_review'].includes(a.status)?(a.status==='new'?['report','acknowledge']:['report']):[],caseRef:a.caseRef});
const MONITOR='Alerts are generated when the FINOVA fraud service flags a transaction. This list shows only flagged items; it does not mean every transaction is checked in real time.';

export const fraud={
 async list({q='',from='',to='',risk='',status='',page=1,pageSize=8}={}){await wait(350);
  const mine=A.filter(a=>store.acc.some(x=>x.id===a.accountId));
  const counts={total:mine.length,high:mine.filter(a=>a.risk==='high').length,medium:mine.filter(a=>a.risk==='medium').length,low:mine.filter(a=>a.risk==='low').length,open:mine.filter(a=>['new','under_review'].includes(a.status)).length};
  const l=mine.filter(a=>(!q||(a.counterparty+a.ref+a.txnId).toLowerCase().includes(q.toLowerCase()))&&(!risk||a.risk===risk)&&(!status||a.status===status)&&(!from||a.date.slice(0,10)>=from)&&(!to||a.date.slice(0,10)<=to)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return{items:l.slice((page-1)*pageSize,page*pageSize).map(view),total:l.length,counts,monitoring:MONITOR}},
 async get(id){await wait(300);const a=A.find(x=>x.id===id);if(!a||!store.acc.some(x=>x.id===a.accountId))throw fail('Alert not found','not_found',404);
  const t=store.tx.find(x=>x.id===a.txnId);return{...view(a),transaction:t||null,monitoring:MONITOR}},
 async report(id,{description='',confirm}){await wait(700);const a=A.find(x=>x.id===id);if(!a)throw fail('Alert not found','not_found',404);
  if(confirm!==true)throw fail('Please confirm that you do not recognise this transaction.','validation');
  if(!['new','under_review'].includes(a.status))throw fail('This alert can no longer be reported.','conflict',409);
  a.caseRef=a.caseRef||'CASE-'+Math.floor(100000+Math.random()*899999);a.status='under_review';a.customerNote=description.slice(0,500);
  a.timeline=[...a.timeline,{at:new Date().toISOString(),status:'under_review',note:'You reported this transaction as unrecognised'}];return{status:a.status,caseRef:a.caseRef}},
 async acknowledge(id){await wait(500);const a=A.find(x=>x.id===id);if(!a)throw fail('Alert not found','not_found',404);if(a.status!=='new')throw fail('Only new alerts can be acknowledged.','conflict',409);
  a.status='resolved';a.timeline=[...a.timeline,{at:new Date().toISOString(),status:'resolved',note:'You confirmed this transaction as recognised'}];return{status:a.status}}
};

// ── notifications: fraud, budget and transfer events visible to the signed-in customer ──
const read=new Set(['n-tr-f3']);
export const notifications={
 async list({type=''}={}){await wait(250);const items=[
   ...A.filter(a=>['new','under_review'].includes(a.status)||a.id==='f3').map(a=>({id:'n-fr-'+a.id,type:'fraud',title:a.status==='new'?'Transaction flagged for review':'Fraud alert update',body:`${a.risk[0].toUpperCase()+a.risk.slice(1)}-risk alert on a payment to ${a.counterparty}. Open it to review the details.`,createdAt:a.createdAt,link:`/fraud-alerts/${a.id}`})),
   ...(await budgets.alerts()).map(b=>({id:'n-bg-'+b.id,type:'budget',title:b.title,body:b.body,createdAt:TODAY_ISO+'T08:00:00',link:`/analytics/budgets`})),
   ...store.tx.filter(t=>t.kind==='beneficiary'&&['failed','reversed'].includes(t.status)).map(t=>({id:'n-tr-'+t.id,type:'transfer',title:`Transfer ${t.status}`,body:`Your transfer to ${t.beneficiaryName} was ${t.status}.`,createdAt:t.events.at(-1).at,link:`/transfers/${t.id}`}))]
   .filter(n=>!type||n.type===type).map(n=>({...n,read:read.has(n.id)})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  return{items,unread:items.filter(n=>!n.read).length}},
 async markRead(id){await wait(100);read.add(id);return{ok:true}},
 async markAllRead(){await wait(150);(await notifications.list()).items.forEach(n=>read.add(n.id));return{ok:true}}
};
export {uid};
