import {store,wait,fail,sum,uid,TODAY,TODAY_ISO,monthKey,monthLabel,addMonths,monthsBetween,DEFAULT_RANGE,liveTx,debits,credits,byCategory,pctChange,CATEGORIES,iso} from './core.js';

const rangeOf=p=>({from:p?.from||DEFAULT_RANGE.from,to:p?.to||DEFAULT_RANGE.to,accountId:p?.accountId||''});
const monthRow=(k,acc)=>{const r={from:k+'-01',to:k+'-31',accountId:acc},inc=sum(credits(r)),exp=sum(debits(r));return{key:k,m:monthLabel(k).slice(0,3),income:inc,expenses:exp,net:inc-exp}};
const DEFS='Income = completed credits; expenses = completed debits. Transfers between your own accounts are excluded. Pending, failed and reversed items are excluded.';

export const insights={
 async capabilities(){await wait(100);return{categoryEdit:true,budgets:true,insightDismiss:true,insightSave:import.meta.env?.VITE_DEMO_INSIGHT_SAVE==='true',cardLock:true,goalsPersist:true,planPersist:true}},
 async summary(p){await wait(400);const r=rangeOf(p),d=debits(r),c=credits(r),inc=sum(c),exp=sum(d),cats=byCategory(d);
  const months=monthsBetween(r.from,r.to).map(k=>monthRow(k,r.accountId));
  const cur=monthKey(r.to),prev=addMonths(cur,-1),cm=months.find(m=>m.key===cur),pm=months.find(m=>m.key===prev);
  const obs=[];if(cats[0])obs.push(`${cats[0].name} is your largest expense category at ${Math.round(cats[0].value/Math.max(exp,1)*100)}% of spending in this range.`);
  if(cm&&pm&&pm.expenses>0&&monthKey(r.to)===monthKey(TODAY_ISO))obs.push(`Month-to-date spending is ${Math.round(cm.expenses/pm.expenses*100)}% of ${monthLabel(prev)}'s full-month total (the month is not over yet).`);
  if(inc>0)obs.push(`Net cash flow in this range is ${exp>inc?'negative':'positive'} (${Math.round((inc-exp)/inc*100)}% of income).`);
  return{range:r,income:inc,expenses:exp,net:inc-exp,savingsRate:inc>0?Math.round((inc-exp)/inc*1000)/10:null,count:d.length,categories:cats,monthly:months,observations:obs,definitions:DEFS,generatedBy:'rule-based development adapter'}},
 async compare({accountId='',month}={}){await wait(350);const cur=month||monthKey(TODAY_ISO),prev=addMonths(cur,-1);
  const A=k=>{const r={from:k+'-01',to:k+'-31',accountId},l=debits(r);return{total:sum(l),count:l.length,cats:byCategory(l)}},a=A(cur),b=A(prev),hasPrev=b.count>0;
  const names=[...new Set([...a.cats,...b.cats].map(c=>c.name))];
  const rows=names.map(n=>{const x=a.cats.find(c=>c.name===n)?.value||0,y=b.cats.find(c=>c.name===n)?.value||0;return{name:n,current:x,previous:y,diff:x-y,pct:pctChange(x,y)}}).sort((p,q)=>q.current-p.current);
  const partial=cur===monthKey(TODAY_ISO);
  return{current:{key:cur,label:monthLabel(cur),total:a.total,count:a.count,partial,daysElapsed:partial?TODAY.getDate():null},previous:{key:prev,label:monthLabel(prev),total:b.total,count:b.count,available:hasPrev},diff:a.total-b.total,pct:pctChange(a.total,b.total),rows}},
 async category({name,from,to,accountId}={}){await wait(350);if(!CATEGORIES.includes(name))throw fail('Unknown category','not_found',404);const r=rangeOf({from,to,accountId}),l=debits(r).filter(t=>t.category===name);
  const months=monthsBetween(r.from,r.to).map(k=>({key:k,m:monthLabel(k).slice(0,3),total:sum(l.filter(t=>monthKey(t.date)===k)),count:l.filter(t=>monthKey(t.date)===k).length}));
  return{name,range:r,total:sum(l),count:l.length,largest:[...l].sort((a,b)=>b.amount-a.amount).slice(0,5),monthly:months,transactions:l.slice(0,25)}},
 async trend({from,to,accountId,granularity='month'}={}){await wait(300);const r=rangeOf({from,to,accountId});
  if(granularity==='week'){const out=[];const start=new Date(r.from);start.setDate(start.getDate()-((start.getDay()+6)%7));
   for(let d=new Date(start);iso(d)<=r.to;d.setDate(d.getDate()+7)){const e=new Date(d);e.setDate(e.getDate()+6);const w={from:iso(d),to:iso(e),accountId};out.push({key:iso(d),label:`${d.getDate()} ${monthLabel(iso(d).slice(0,7)).slice(0,3)}`,expenses:sum(debits(w)),income:sum(credits(w))})}
   return{granularity,range:r,series:out}}
  return{granularity,range:r,series:monthsBetween(r.from,r.to).map(k=>{const x=monthRow(k,r.accountId);return{key:k,label:x.m,expenses:x.expenses,income:x.income}})}},
 // PATCH /transactions/:id/category
 async setCategory(id,category){await wait(300);if(!CATEGORIES.includes(category))throw fail('Unsupported category','validation');const t=store.tx.find(x=>x.id===id);if(!t)throw fail('Transaction not found','not_found',404);t.category=category;return t},
 async recommendations(){await wait(400);const cmp=await insights.compare({}),out=[];const prevKey=addMonths(monthKey(TODAY_ISO),-1);
  const full=addMonths(prevKey,-1);const up=(await insights.compare({month:prevKey})).rows.filter(r=>r.pct!=null&&r.pct>25&&r.diff>1000).sort((a,b)=>b.diff-a.diff)[0];
  if(up)out.push({id:'r-high',title:`Review higher ${up.name} spending`,body:`${up.name} spending was ${up.pct}% higher in ${monthLabel(prevKey)} than ${monthLabel(full)}. It may be worth looking at the individual transactions.`,period:monthLabel(prevKey),context:`${up.name}: ₹${up.current.toLocaleString('en-IN')} vs ₹${up.previous.toLocaleString('en-IN')}`,link:`/analytics/categories?c=${up.name}`});
  const seen={};debits({from:'2026-05-01'}).forEach(t=>{(seen[t.desc]??=new Set()).add(monthKey(t.date))});
  const rec=Object.entries(seen).filter(([,s])=>s.size>=4).map(([n])=>n).slice(0,4);
  if(rec.length)out.push({id:'r-rec',title:'Compare recurring expenses',body:`${rec.join(', ')} appeared in at least four of the last six months. You may want to check that each one is still worthwhile.`,period:'May–Oct 2026',context:'Based on repeated merchant names in your completed transactions',link:'/transactions'});
  const s=await insights.summary({from:'2026-05-01',to:addMonths(monthKey(TODAY_ISO),-1)+'-31'});const avg=Math.round(s.net/Math.max(s.monthly.length,1));
  if(avg>0)out.push({id:'r-save',title:'Consider a monthly savings target',body:`Your net cash flow averaged about ₹${avg.toLocaleString('en-IN')} per month over the last ${s.monthly.length} full months. A target is optional and no money is moved automatically.`,period:`${s.monthly[0].m}–${s.monthly.at(-1).m}`,context:'Estimate from income minus expenses; not a prediction',link:'/financial-goals/monthly'});
  const b=(await budgets.list()).items.find(x=>x.lastMonthPct!=null&&x.lastMonthPct<60);
  if(b)out.push({id:'r-budget',title:`Review your unused ${b.category} budget`,body:`Only ${b.lastMonthPct}% of the ${b.name} budget was used last month. You could lower it or reuse the allocation.`,period:monthLabel(prevKey),context:`Budget ₹${b.amount.toLocaleString('en-IN')}`,link:'/analytics/budgets'});
  return{items:out,disclaimer:'Suggestions are generated from your transaction history. They are not financial advice and do not promise savings or returns.'}},
 async history(){await wait(300);const dismissed=insights._dismissed;const out=[];
  for(let k=addMonths(monthKey(TODAY_ISO),-1);k>='2026-05';k=addMonths(k,-1)){const r={from:k+'-01',to:k+'-31'},d=debits(r),top=byCategory(d)[0],inc=sum(credits(r)),exp=sum(d);
   out.push({id:'h-'+k,title:`${monthLabel(k)} spending summary`,createdAt:addMonths(k,1)+'-01',period:monthLabel(k),category:top?.name||'—',summary:`You spent ₹${exp.toLocaleString('en-IN')} against ₹${inc.toLocaleString('en-IN')} income. ${top?`${top.name} was the largest category.`:''}`,chart:byCategory(d).slice(0,4),link:`/transactions?from=${k}-01&to=${k}-31`,saved:insights._saved.has('h-'+k)})}
  return{items:out.filter(i=>!dismissed.has(i.id))}},
 _dismissed:new Set(),_saved:new Set(),
 // POST /insights/:id/save (toggle) — only offered when /capabilities.insightSave is true
 async save(id){await wait(200);if(!insights._saved.delete(id))insights._saved.add(id);return{saved:insights._saved.has(id)}},
 async dismiss(id){await wait(200);insights._dismissed.add(id);return{ok:true}}
};

// ── budgets (weekly | monthly | yearly) ──
const B=[{id:'bg1',name:'Food & dining',category:'Food',amount:6000,period:'monthly'},{id:'bg2',name:'Shopping',category:'Shopping',amount:5000,period:'monthly'},{id:'bg3',name:'Entertainment',category:'Entertainment',amount:1500,period:'monthly'}];
const TH={approaching:75,exceeded:100},PERIODS=['weekly','monthly','yearly'];
const window=period=>{if(period==='weekly'){const s=new Date(TODAY);s.setDate(s.getDate()-((s.getDay()+6)%7));const e=new Date(s);e.setDate(e.getDate()+6);return{from:iso(s),to:iso(e),label:`Week of ${s.getDate()} ${monthLabel(iso(s).slice(0,7)).slice(0,3)}`}}
 if(period==='yearly')return{from:TODAY.getFullYear()+'-01-01',to:TODAY.getFullYear()+'-12-31',label:String(TODAY.getFullYear())};
 const cur=monthKey(TODAY_ISO);return{from:cur+'-01',to:cur+'-31',label:monthLabel(cur)}};
const progress=b=>{const w=window(b.period),spent=sum(debits({from:w.from,to:w.to}).filter(t=>t.category===b.category)),pct=Math.round(spent/b.amount*1000)/10;
 let lastMonthPct=null;if(b.period==='monthly'){const prev=addMonths(monthKey(TODAY_ISO),-1);lastMonthPct=Math.round(sum(debits({from:prev+'-01',to:prev+'-31'}).filter(t=>t.category===b.category))/b.amount*100)}
 return{...b,spent,remaining:b.amount-spent,pct,status:pct>=TH.exceeded?'exceeded':pct>=TH.approaching?'approaching':'on_track',period_label:w.label,lastMonthPct}};
export const budgets={
 thresholds:TH,periods:PERIODS,
 async list(){await wait(300);return{items:B.map(progress),thresholds:TH,periods:PERIODS}},
 async create({name,category,amount,period='monthly'}){await wait(350);amount=Number(amount);if(!name?.trim())throw fail('Enter a budget name.','validation');if(!CATEGORIES.includes(category))throw fail('Choose a category.','validation');if(!PERIODS.includes(period))throw fail('Choose weekly, monthly or yearly.','validation');if(!(amount>0))throw fail('Budget amount must be greater than zero.','validation');
  if(B.some(b=>b.category===category&&b.period===period))throw fail(`A ${period} budget for ${category} already exists.`,'duplicate',409);const n={id:uid('bg'),name:name.trim(),category,amount,period};B.push(n);return progress(n)},
 // PATCH /budgets/:id — name and amount only; category and period are fixed after creation.
 async update(id,{name,amount}){await wait(300);const b=B.find(x=>x.id===id);if(!b)throw fail('Budget not found','not_found',404);amount=Number(amount);if(!name?.trim())throw fail('Enter a budget name.','validation');if(!(amount>0))throw fail('Budget amount must be greater than zero.','validation');b.name=name.trim();b.amount=amount;return progress(b)},
 async remove(id){await wait(250);const i=B.findIndex(b=>b.id===id);if(i<0)throw fail('Budget not found','not_found',404);B.splice(i,1);return{ok:true}},
 async alerts(){await wait(150);return B.map(progress).filter(b=>b.status!=='on_track').map(b=>({id:'ba-'+b.id+'-'+b.status,budgetId:b.id,category:b.category,status:b.status,pct:b.pct,title:b.status==='exceeded'?(b.pct>100?`${b.name} budget exceeded`:`${b.name} budget limit reached`):`${b.name}: 75% of budget used`,body:`₹${b.spent.toLocaleString('en-IN')} of ₹${b.amount.toLocaleString('en-IN')} spent (${b.period}, ${b.period_label}).`}))}
};

// ── forecast ──
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0,sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
export const forecast={
 // GET /forecast?horizon&spendingDelta&incomeDelta&accountId — deltas are percentages applied to the baseline averages.
 async get({horizon=6,spendingDelta=0,incomeDelta=0,accountId=''}={}){await wait(500);horizon=Math.min(12,Math.max(1,+horizon));spendingDelta=Number(spendingDelta)||0;incomeDelta=Number(incomeDelta)||0;
  if(spendingDelta<-30||spendingDelta>30)throw fail('Spending change must be between -30% and +30%.','validation');if(incomeDelta<-20||incomeDelta>20)throw fail('Income change must be between -20% and +20%.','validation');
  const last=addMonths(monthKey(TODAY_ISO),-1),hist=monthsBetween('2026-05',last).map(k=>monthRow(k,accountId));
  if(hist.length<3)return{insufficient:true,reason:'At least 3 full months of history are needed to estimate a forecast.'};
  const recent=hist.slice(-3),inc=mean(recent.map(x=>x.income)),exp=mean(recent.map(x=>x.expenses)),sdE=sd(recent.map(x=>x.expenses)),sdI=sd(recent.map(x=>x.income));
  const start=sum(store.acc.filter(a=>!accountId||a.id===accountId),a=>a.balance);
  const build=(fi,fe)=>{let bal=start;const out=[];for(let i=1;i<=horizon;i++){const k=addMonths(monthKey(TODAY_ISO),i),I=inc*fi,e=exp*fe,net=I-e;bal+=net;
    out.push({key:k,m:monthLabel(k).slice(0,3),income:Math.round(I),expenses:Math.round(e),net:Math.round(net),endBalance:Math.round(bal),expensesLow:Math.max(0,Math.round(e-sdE*fe)),expensesHigh:Math.round(e+sdE*fe)})}return out};
  const proj=build(1+incomeDelta/100,1+spendingDelta/100),base=build(1,1);
  return{history:hist,projection:proj,baseline:base,startBalance:Math.round(start),scenarioDeltas:{spending:spendingDelta,income:incomeDelta},isBaseline:spendingDelta===0&&incomeDelta===0,generatedAt:TODAY.toISOString(),dataThrough:monthLabel(last),
   method:'3-month moving average (development model)',interval:'Shaded range = average ± 1 standard deviation of the last 3 full months. It is a spread of past values, not a probability of the outcome.',
   assumptions:['Income and expenses follow the average of the last 3 full months, adjusted by the scenario percentages you choose.','Starting balance is the current balance of the selected account(s); the rest of this month is not modelled.','Own-account transfers are excluded; one-off or irregular items are not predicted.','Pending, failed and reversed transactions are ignored.']}},
 async upcoming({accountId=''}={}){await wait(350);const groups={};
  liveTx({accountId,from:'2026-05-01'}).filter(t=>!t.desc.startsWith('Transfer')).forEach(t=>{const g=(groups[t.type+'|'+t.desc]??={desc:t.desc,type:t.type,months:new Set(),amounts:[],days:[]});g.months.add(monthKey(t.date));g.amounts.push(t.amount);g.days.push(new Date(t.date).getDate())});
  const total=monthsBetween('2026-05',monthKey(TODAY_ISO)).length;
  const pred=Object.values(groups).filter(g=>g.months.size>=4).map(g=>({label:g.desc,kind:g.type==='credit'?'income':'expense',amount:Math.round(mean(g.amounts)),typicalDay:Math.round(mean(g.days)),basis:`Appeared in ${g.months.size} of the last ${total} months`})).sort((a,b)=>b.amount-a.amount).slice(0,8);
  return{scheduled:[],scheduledNote:'No scheduled payments or standing instructions are connected to this account, so none are shown.',predicted:pred,predictedNote:'Predicted items are patterns found in your own past transactions. They are not confirmed bills or salary schedules.'}}
};
