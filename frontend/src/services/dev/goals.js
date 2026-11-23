import {store,wait,fail,sum,uid,TODAY,TODAY_ISO,monthKey,monthLabel,addMonths,monthsBetween,debits,credits,iso} from './core.js';

const G=[
 {id:'g1',name:'New laptop',category:'Purchase',target:80000,baseSaved:32000,targetDate:'2027-03-31',description:'Replacement for my work laptop.',createdAt:'2026-06-01'},
 {id:'g2',name:'Emergency fund',category:'Emergency',target:300000,baseSaved:90000,targetDate:'2027-12-31',description:'Six months of essential expenses.',createdAt:'2026-03-15'},
 {id:'g3',name:'Goa trip',category:'Travel',target:60000,baseSaved:60000,targetDate:'2026-12-20',description:'',createdAt:'2026-05-10'}];
const C={g1:[{id:'c1',amount:12000,date:'2026-08-10',note:'August set-aside'},{id:'c2',amount:10000,date:'2026-09-10',note:'September set-aside'}],g2:[{id:'c3',amount:20000,date:'2026-09-30',note:''}],g3:[]};
export const GOAL_CATEGORIES=['Purchase','Education','Emergency','Travel','Personal savings','Other'];
const monthsLeft=d=>{const t=new Date(d);return Math.max(0,(t.getFullYear()-TODAY.getFullYear())*12+t.getMonth()-TODAY.getMonth()+(t.getDate()>=TODAY.getDate()?0:-1))};
const view=g=>{const saved=g.baseSaved+sum(C[g.id]||[],c=>c.amount),pct=g.target>0?Math.min(100,Math.round(saved/g.target*1000)/10):0;
 const start=new Date(g.createdAt),end=new Date(g.targetDate),span=Math.max(1,end-start),expected=Math.min(100,Math.max(0,(TODAY-start)/span*100));
 const status=saved>=g.target?'completed':iso(TODAY)>g.targetDate?'overdue':pct>=expected*0.9?'on_track':'behind';
 return{...g,saved,remaining:Math.max(0,g.target-saved),pct,overfunded:saved>g.target,status,expectedPct:Math.round(expected),statusRule:'On track = progress is at least 90% of a straight-line path to the target date.',monthsLeft:monthsLeft(g.targetDate),contributionCount:(C[g.id]||[]).length}};
const validate=({name,target,baseSaved=0,targetDate,category})=>{
 if(!name?.trim()||name.trim().length<2)throw fail('Enter a goal name.','validation');
 if(!(Number(target)>0))throw fail('Target amount must be greater than zero.','validation');
 if(Number(target)>1e9)throw fail('Target amount is too large.','validation');
 if(Number(baseSaved)<0)throw fail('Saved amount cannot be negative.','validation');
 if(!targetDate||targetDate<=TODAY_ISO)throw fail('Choose a target date in the future.','validation');
 if(targetDate>iso(new Date(TODAY.getFullYear()+30,0,1)))throw fail('Target date is more than 30 years away.','validation');
 if(!GOAL_CATEGORIES.includes(category))throw fail('Choose a category.','validation')};

export const goals={
 async list(){await wait(300);const items=G.map(view);return{items,totals:{count:items.length,target:sum(items,g=>g.target),saved:sum(items,g=>Math.min(g.saved,g.target))},note:'Goals are tracking records. Creating a goal does not move money into a separate account.'}},
 async get(id){await wait(250);const g=G.find(x=>x.id===id);if(!g)throw fail('Goal not found','not_found',404);return{...view(g),contributions:[...(C[id]||[])].sort((a,b)=>b.date.localeCompare(a.date))}},
 async create(d){await wait(400);validate(d);const n={id:uid('g'),name:d.name.trim(),category:d.category,target:Number(d.target),baseSaved:Number(d.baseSaved||0),targetDate:d.targetDate,description:(d.description||'').slice(0,200),createdAt:TODAY_ISO};G.unshift(n);C[n.id]=[];return view(n)},
 async remove(id){await wait(250);const i=G.findIndex(g=>g.id===id);if(i<0)throw fail('Goal not found','not_found',404);G.splice(i,1);delete C[id];return{ok:true}},
 // Contributions are planning records — NOT bank transfers.
 async contribute(id,{amount,date,note=''}){await wait(300);const g=G.find(x=>x.id===id);if(!g)throw fail('Goal not found','not_found',404);amount=Number(amount);
  if(!(amount>0))throw fail('Contribution must be greater than zero.','validation');if(!date||date>TODAY_ISO)throw fail('Contribution date cannot be in the future.','validation');
  C[id].push({id:uid('c'),amount,date,note:note.slice(0,80)});return goals.get(id)},
 async plan({target,saved=0,targetDate,income,expenses}){await wait(450);target=Number(target);saved=Number(saved||0);
  if(!(target>0))throw fail('Enter a target amount greater than zero.','validation');if(saved<0)throw fail('Saved amount cannot be negative.','validation');if(!targetDate||targetDate<=TODAY_ISO)throw fail('Choose a future target date.','validation');
  const remaining=Math.max(0,target-saved),months=Math.max(1,monthsLeft(targetDate)||1),monthly=Math.ceil(remaining/months);
  const out={remaining,months,suggestedMonthly:monthly,estimatedCompletion:remaining===0?TODAY_ISO:targetDate,assumptions:[`Equal monthly amounts over ${months} month${months>1?'s':''} until the target date.`,'No interest or returns are assumed.','Nothing is transferred automatically; this is a planning estimate, not a guarantee.']};
  const cap=Number(income)-Number(expenses);
  if(income!==''&&income!=null&&expenses!==''&&expenses!=null&&!Number.isNaN(cap)){out.capacity=cap;
   if(cap<=0){out.feasible=false;out.estimatedCompletion=null;out.assumptions.push('Your entered income does not exceed expenses, so no completion date can be estimated.')}
   else{const m=Math.ceil(remaining/cap);out.feasible=cap>=monthly;out.estimatedCompletion=iso(new Date(TODAY.getFullYear(),TODAY.getMonth()+m,TODAY.getDate()));out.assumptions.push(`If you could set aside your full ₹${cap.toLocaleString('en-IN')} monthly surplus, completion would take about ${m} month${m>1?'s':''}.`)}}
  return out},
 async historicalAverages(){await wait(150);const ks=monthsBetween(addMonths(monthKey(TODAY_ISO),-3),addMonths(monthKey(TODAY_ISO),-1)),r=k=>({from:k+'-01',to:k+'-31'});
  return{income:Math.round(sum(ks,k=>sum(credits(r(k))))/ks.length),expenses:Math.round(sum(ks,k=>sum(debits(r(k))))/ks.length),basis:`Average of ${monthLabel(ks[0])}–${monthLabel(ks.at(-1))}`}}
};
const P={};
export const planner={
 async get(month){await wait(250);const avg=await goals.historicalAverages(),act=G.map(view).filter(g=>g.status!=='completed'),need=sum(act,g=>Math.ceil(g.remaining/Math.max(1,g.monthsLeft)));
  return{month,plan:P[month]||null,suggested:{estimatedIncome:avg.income,estimatedExpenses:avg.expenses,savingsTarget:need,basis:avg.basis,targetBasis:`Sum of suggested monthly amounts for ${act.length} active goal${act.length===1?'':'s'}`}}},
 async save(month,d){await wait(300);const n=k=>Number(d[k]);for(const k of['estimatedIncome','estimatedExpenses','plannedSavings','savingsTarget'])if(!(n(k)>=0)||Number.isNaN(n(k)))throw fail('Amounts must be zero or more.','validation');
  P[month]={estimatedIncome:n('estimatedIncome'),estimatedExpenses:n('estimatedExpenses'),plannedSavings:n('plannedSavings'),savingsTarget:n('savingsTarget'),savedAt:new Date().toISOString()};return P[month]}
};
