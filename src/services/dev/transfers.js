import {store,wait,fail,sum,uid,debits} from './core.js';
const LIMITS={perTransfer:200000,daily:500000};
const used=new Set();                                   // idempotency keys
const isTransfer=t=>!!t.kind&&(t.kind==='beneficiary'||t.type==='debit');
const acct=id=>store.acc.find(a=>a.id===id);
// Demo fee rule: beneficiary transfers above ₹50,000 carry a flat ₹25 fee; everything else returns no fee info.
const feeFor=(mode,amt)=>mode==='beneficiary'&&amt>50000?25:undefined;

export const transfers={
 async limits(){await wait(150);const today=new Date(2026,9,13).toISOString().slice(0,10);
  const usedToday=sum(store.tx.filter(t=>isTransfer(t)&&t.date.slice(0,10)===today&&!['failed','reversed'].includes(t.status)));
  return{...LIMITS,usedToday}},
 async list({q='',status='',beneficiaryId='',from='',to='',min='',max='',sort='date-desc',page=1,pageSize=10}={}){await wait(300);
  let l=store.tx.filter(t=>isTransfer(t)&&t.kind&&(t.kind==='own'?t.type==='debit':true)&&store.acc.some(a=>a.id===t.accountId));
  l=l.filter(t=>(!q||(t.desc+t.id+(t.remarks||'')).toLowerCase().includes(q.toLowerCase()))&&(!status||t.status===status)&&(!beneficiaryId||t.beneficiaryId===beneficiaryId||(beneficiaryId==='own'&&t.kind==='own'))&&(!from||t.date.slice(0,10)>=from)&&(!to||t.date.slice(0,10)<=to)&&(!min||t.amount>=+min)&&(!max||t.amount<=+max));
  const [k,d]=sort.split('-');l=[...l].sort((a,b)=>(k==='date'?new Date(a.date)-new Date(b.date):a.amount-b.amount)*(d==='asc'?1:-1));
  return{items:l.slice((page-1)*pageSize,page*pageSize),total:l.length}},
 async get(id){await wait(250);const t=store.tx.find(x=>x.id===id&&x.kind);if(!t)throw fail('Transfer not found','not_found',404);
  if(t.status==='pending'&&t.pendingUntil&&Date.now()>t.pendingUntil){t.status='completed';t.bankRef='UTR'+Date.now().toString().slice(-10);t.events=[...t.events,{at:new Date().toISOString(),status:'completed',note:'Confirmed by bank'}]}
  return t},
 // POST /transfers/preview — returns fee/total ONLY when the bank can quote them.
 async preview({mode,amount}){await wait(250);amount=Number(amount);if(!(amount>0))throw fail('Enter a valid amount.','validation');const fee=feeFor(mode,amount);return fee==null?{}:{fee,total:amount+fee}},
 // POST /transfers  — server validates ownership, balance, limits, beneficiary state.
 async create({mode,sourceId,destId,beneficiaryId,amount,description='',idempotencyKey}){await wait(1100);
  if(idempotencyKey&&used.has(idempotencyKey))throw fail('This transfer was already submitted.','duplicate',409);
  const src=acct(sourceId);if(!src)throw fail('Source account not found for this user.','forbidden',403);
  amount=Number(amount);if(!(amount>0))throw fail('Enter a valid amount.','validation');
  if(amount>src.available)throw fail('Insufficient available balance.','insufficient');
  if(amount>LIMITS.perTransfer)throw fail(`Amount exceeds the per-transfer limit of ₹${LIMITS.perTransfer.toLocaleString('en-IN')}.`,'limit');
  const lim=await transfers.limits();if(lim.usedToday+amount>LIMITS.daily)throw fail('This would exceed your daily transfer limit.','limit');
  const now=new Date(),id='TXN'+Date.now().toString().slice(-6),ref='REF'+Date.now();
  if(mode==='own'){const dst=acct(destId);if(!dst)throw fail('Destination account not found for this user.','forbidden',403);if(dst.id===src.id)throw fail('Source and destination accounts must be different.','validation');
   src.balance-=amount;src.available-=amount;dst.balance+=amount;dst.available+=amount;if(idempotencyKey)used.add(idempotencyKey);
   const base={ref,date:now.toISOString(),category:'Other',amount,status:'completed',kind:'own',transferId:id,remarks:description,events:[{at:now.toISOString(),status:'completed',note:'Completed instantly between your accounts'}]};
   const d={...base,id,accountId:src.id,toAccountId:dst.id,desc:`Transfer to ${dst.type}`,type:'debit'},c={...base,id:id+'C',accountId:dst.id,fromAccountId:src.id,desc:`Transfer from ${src.type}`,type:'credit'};
   store.tx=[d,c,...store.tx];return{status:'completed',transfer:d}}
  const b=store.ben.find(x=>x.id===beneficiaryId);if(!b)throw fail('Beneficiary not found.','not_found',404);
  if(b.status!=='active')throw fail('This beneficiary is not active yet, so transfers are not allowed.','beneficiary_inactive');
  if(amount===666)throw fail('The bank declined this transfer (demo failure case).','declined');
  const fee=feeFor('beneficiary',amount);if(amount+(fee||0)>src.available)throw fail('Insufficient available balance to cover the amount and fee.','insufficient');
  src.balance-=amount+(fee||0);src.available-=amount+(fee||0);if(idempotencyKey)used.add(idempotencyKey);
  const pending=amount>=100000;                         // large transfers settle asynchronously in the demo
  const t={id,ref,date:now.toISOString(),accountId:src.id,desc:`Transfer to ${b.name}`,category:'Other',type:'debit',amount,status:pending?'pending':'completed',kind:'beneficiary',fee,beneficiaryId:b.id,beneficiaryName:b.name,remarks:description,
   pendingUntil:pending?Date.now()+12000:undefined,bankRef:pending?undefined:'UTR'+Date.now().toString().slice(-10),
   events:[{at:now.toISOString(),status:'pending',note:'Transfer initiated'},...(pending?[]:[{at:now.toISOString(),status:'completed',note:'Confirmed by bank'}])]};
  store.tx=[t,...store.tx];return{status:t.status,transfer:t}}
};

const IFSC=/^[A-Z]{4}0[A-Z0-9]{6}$/;
export const beneficiaries={
 async list(){await wait(250);return store.ben},
 async get(id){await wait(200);const b=store.ben.find(x=>x.id===id);if(!b)throw fail('Beneficiary not found','not_found',404);return b},
 async create(b){await wait(500);const acc=String(b.account||'').trim(),ifsc=String(b.ifsc||'').toUpperCase().trim();
  if(!b.name||b.name.trim().length<2)throw fail('Enter the beneficiary name.','validation');
  if(!/^\d{9,18}$/.test(acc))throw fail('Account number must be 9–18 digits.','validation');
  if(!IFSC.test(ifsc))throw fail('Enter a valid IFSC code.','validation');
  if(store.ben.some(x=>x.account===acc&&x.ifsc===ifsc))throw fail('A beneficiary with this account number and IFSC already exists.','duplicate',409);
  const n={id:'b'+Date.now(),name:b.name.trim(),account:acc,ifsc,bank:b.bank,nickname:b.nickname||'',status:'pending_verification',createdAt:new Date().toISOString().slice(0,10)};
  store.ben=[n,...store.ben];return n},
 // Only nickname is editable after creation (name/account/IFSC are bank-verified fields).
 async update(id,{nickname}){await wait(300);const b=store.ben.find(x=>x.id===id);if(!b)throw fail('Beneficiary not found','not_found',404);b.nickname=(nickname||'').slice(0,30);return b},
 async remove(id){await wait(350);if(store.tx.some(t=>t.beneficiaryId===id&&t.status==='pending'))throw fail('This beneficiary has a pending transfer and cannot be removed right now.','conflict',409);store.ben=store.ben.filter(b=>b.id!==id);return{ok:true}},
 // Workflow: pending_verification → verified | verification_failed → activation_pending → active
 async check(id){await wait(500);const b=store.ben.find(x=>x.id===id);if(!b)throw fail('Beneficiary not found','not_found',404);
  if(b.status==='pending_verification')b.status=b.account.endsWith('0000')?'verification_failed':'verified';
  else if(b.status==='activation_pending')b.status='active';
  return b},
 async activate(id){await wait(400);const b=store.ben.find(x=>x.id===id);if(!b)throw fail('Beneficiary not found','not_found',404);if(b.status!=='verified')throw fail('Only verified beneficiaries can be activated.','conflict',409);b.status='activation_pending';return b},
 async retry(id){await wait(300);const b=store.ben.find(x=>x.id===id);if(!b)throw fail('Beneficiary not found','not_found',404);if(b.status==='verification_failed')b.status='pending_verification';return b}
};
export {uid,debits};
