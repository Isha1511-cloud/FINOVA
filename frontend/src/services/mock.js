import {accounts as A,transactions as T,beneficiaries as B,monthly,fraud as F,CATEGORIES} from '../data/seed.js';
const wait=(ms=500)=>new Promise(r=>setTimeout(r,ms));
const acc=JSON.parse(JSON.stringify(A));let tx=[...T],ben=[...B],fr=JSON.parse(JSON.stringify(F));
const user={name:'Aarav Patel',email:'demo@finova.com',mobile:'+91 98765 43210'};
const cats=()=>CATEGORIES.map(name=>({name,value:tx.filter(t=>t.type==='debit'&&t.status==='completed'&&t.category===name).reduce((s,t)=>s+t.amount,0)})).filter(c=>c.value).sort((a,b)=>b.value-a.value);
const sum=(l,ty)=>l.filter(t=>t.type===ty&&t.status==='completed').reduce((s,t)=>s+t.amount,0);
export const mock={
 async login({email,password}){await wait();if(email==='demo@finova.com'&&password==='Demo@1234')return{token:'mock-token',user};throw new Error('Invalid email or password.')},
 async register(){await wait();return{ok:true}},
 async sendOtp(){await wait(300);return{ok:true}},
 async verifyOtp({code}){await wait();if(code==='000000')throw new Error('expired');if(code!=='123456')throw new Error('invalid');return{ok:true}},
 async resetPassword(){await wait();return{ok:true}},
 async accounts(){await wait(300);return acc},
 async txList({q='',category='',type='',status='',sort='date-desc',page=1,pageSize=10,from='',to='',accountId='',min='',max=''}={}){await wait(300);
  let l=tx.filter(t=>(!q||(t.desc+t.id).toLowerCase().includes(q.toLowerCase()))&&(!category||t.category===category)&&(!type||(type==='transfer'?t.desc.startsWith('Transfer'):t.type===type))&&(!min||t.amount>=+min)&&(!max||t.amount<=+max)&&(!status||t.status===status)&&(!accountId||t.accountId===accountId)&&(!from||t.date.slice(0,10)>=from)&&(!to||t.date.slice(0,10)<=to));
  const [k,d]=sort.split('-');l=[...l].sort((a,b)=>(k==='date'?new Date(a.date)-new Date(b.date):a.amount-b.amount)*(d==='asc'?1:-1));
  return{items:l.slice((page-1)*pageSize,page*pageSize),total:l.length,all:l}},
 async txGet(id){await wait(300);const t=tx.find(x=>x.id===id);if(!t)throw new Error('Transaction not found');return t},
 async transfer({accountId,beneficiaryId,amount,remarks}){await wait(1200);const a=acc.find(x=>x.id===accountId);
  if(amount===666)throw new Error('Transfer declined by the bank (demo failure).');if(amount>a.available)throw new Error('Insufficient balance.');if(amount>200000)throw new Error('Exceeds daily transfer limit.');
  a.balance-=amount;a.available-=amount;const b=ben.find(x=>x.id===beneficiaryId);const t={id:'TXN'+Date.now().toString().slice(-6),ref:'REF'+Date.now(),date:new Date().toISOString(),accountId,desc:`Transfer to ${b.name}`,category:'Other',type:'debit',amount,status:'completed',remarks};tx=[t,...tx];return{status:'completed',transaction:t}},
 async money(kind,{accountId,amount,remarks}){await wait(1000);const a=acc.find(x=>x.id===accountId);if(kind==='withdraw'&&amount>a.available)throw new Error('Insufficient balance.');
  const s=kind==='deposit'?1:-1;a.balance+=s*amount;a.available+=s*amount;const t={id:'TXN'+Date.now().toString().slice(-6),ref:'REF'+Date.now(),date:new Date().toISOString(),accountId,desc:kind==='deposit'?'Cash Deposit':'Cash Withdrawal',category:'Other',type:kind==='deposit'?'credit':'debit',amount,status:'completed',remarks};tx=[t,...tx];return{status:'completed',transaction:t}},
 async benList(){await wait(300);return ben},
 async benSave(b){await wait(400);if(b.id)ben=ben.map(x=>x.id===b.id?b:x);else ben=[{...b,id:'b'+Date.now(),status:'Active'},...ben];return b},
 async benDelete(id){await wait(400);ben=ben.filter(b=>b.id!==id);return{ok:true}},
 async statement({accountId,from,to}){await wait(400);const l=tx.filter(t=>t.accountId===accountId&&t.status==='completed'&&(!from||t.date.slice(0,10)>=from)&&(!to||t.date.slice(0,10)<=to));
  const a=acc.find(x=>x.id===accountId),cr=sum(l,'credit'),db=sum(l,'debit');return{rows:l,credits:cr,debits:db,opening:a.balance-cr+db+0,closing:a.balance}},
 async insights(){await wait(500);const c=cats(),spend=c.reduce((s,x)=>s+x.value,0);const food=c.find(x=>x.name==='Food')?.value||0;
  return{categories:c,monthly,spend,income:85000,loans:0,goal:64,alerts:[],savings:85000-21800,top:c[0],insights:[
  {title:'Food spending up 18%',body:`You spent ${'₹'+food.toLocaleString('en-IN')} on food this month, 18% more than last month.`,tone:'warn'},
  {title:'Savings on track',body:'You have saved 74% of your income so far in October.',tone:'good'},
  {title:'Bills due soon',body:'Electricity and internet bills usually post around the 5th.',tone:'info'}]}},
 async ai(q){await wait(800);const t=q.toLowerCase(),done=tx.filter(x=>x.status==='completed'),c=cats();
  if(/transfer|send money|pay /.test(t))return{type:'alert',text:'For your security I cannot move money from chat. Please use Transfer Money, where every transfer is reviewed, confirmed and validated by the bank.',link:'/transfer'};
  if(/deposit|credit/.test(t))return{type:'transactions',text:'Here are your recent deposits:',items:done.filter(x=>x.type==='credit').slice(0,5)};
  if(/balance/.test(t))return{type:'summary',text:'Here is your current balance:',stats:acc.map(a=>({label:a.type,value:'₹'+a.balance.toLocaleString('en-IN')}))};
  if(/compare|last month/.test(t))return{type:'table',text:'Spending comparison:',head:['Month','Spent','Income'],rows:monthly.slice(-3).map(m=>[m.m,'₹'+m.spend.toLocaleString('en-IN'),'₹'+m.income.toLocaleString('en-IN')])};
  if(/food|dining/.test(t))return{type:'text',text:`You spent ₹${(c.find(x=>x.name==='Food')?.value||0).toLocaleString('en-IN')} on Food & Dining recently.`};
  if(/most|highest|category/.test(t))return{type:'chart',text:`Your highest spending category is ${c[0].name} (₹${c[0].value.toLocaleString('en-IN')}).`,data:c.slice(0,5)};
  if(/spend|analy|summary/.test(t))return{type:'chart',text:`Total spending: ₹${c.reduce((s,x)=>s+x.value,0).toLocaleString('en-IN')}. Breakdown by category:`,data:c};
  if(/last|recent|latest|transaction/.test(t))return{type:'transactions',text:'Here are your five most recent transactions:',items:tx.slice(0,5)};
  return{type:'text',text:'I can show transactions, balances, spending by category and monthly comparisons. Try one of the suggestions below.'}},
 async fraudList(){await wait(400);return fr},
 async fraudResolve(id,status){await wait(400);fr=fr.map(f=>f.id===id?{...f,status}:f);return{ok:true}}
};

// Exposes in-memory state to the Phase 3 development adapter (mock3.js). Dev only.
export const store={acc,get tx(){return tx},set tx(v){tx=v},get ben(){return ben},set ben(v){ben=v},get fr(){return fr},set fr(v){fr=v}};
