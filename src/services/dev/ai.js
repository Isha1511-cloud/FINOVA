import {store,wait,fail,sum,uid,TODAY,TODAY_ISO,monthKey,monthLabel,addMonths,debits,credits,liveTx,byCategory,pctChange,CATEGORIES,iso} from './core.js';
import {insights} from './insights.js';
import {explain} from './glossary.js';

// Conversations live in memory only (never browser storage). Production: persist via authorised /ai/conversations APIs.
const convs=[{id:'cv1',title:'Spending this month',createdAt:'2026-10-10T09:00:00',updatedAt:'2026-10-10T09:01:00',messages:[]}];
const ok=(text,blocks=[],source='banking_data')=>({text,blocks,source});
const NUM={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
const MON=['january','february','march','april','may','june','july','august','september','october','november','december'];
const CAT={food:'Food',dining:'Food',shopping:'Shopping',travel:'Travel',bill:'Bills',entertainment:'Entertainment',education:'Education',health:'Healthcare',medical:'Healthcare'};
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const tx=(items,title)=>({type:'transactions',title,items});
const act=(kind,title,description,link,params)=>({type:'action',kind,title,description,link,params});
const monthRange=k=>({from:k+'-01',to:k+'-31'});
const thisMonth=()=>monthKey(TODAY_ISO);

export function answer(q){
 const t=q.toLowerCase(),words=t.split(/\s+/);
 const amt=t.match(/(?:above|over|more than|greater than|exceeding|>)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/),n=(t.match(/\b(?:last|latest|recent)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/)||[])[1];
 const mon=MON.findIndex(m=>t.includes(m)),cat=Object.keys(CAT).find(k=>t.includes(k));
 const search=/\b(find|search|show|list)\b/.test(t)&&(amt||cat||/\bto\s+\w+/.test(t)||mon>=0)&&!/\bsummar|spent|spend\b/.test(t);

 {const g=explain(q);if(g)return ok(g.text,g.blocks,'ai')}
 if(/\b(transfer|send|pay)\b/.test(t)&&!/\b(find|show|search|list|last|history)\b/.test(t)){
  const a=t.match(/([\d,]{3,})/);return ok('I can help you prepare a transfer, but I cannot send money from chat. Review the details below and continue in Transfer Money, where the bank validates and you explicitly confirm it.',[act('transfer','Prepare a transfer','Opens the transfer form with the amount filled in. Nothing is submitted until you review and confirm.',`/transfers/new${a?`?amount=${a[1].replace(/,/g,'')}`:''}`,a?{amount:a[1]}:{})],'ai')}
 if(/savings? goal|save for|financial goal/.test(t))return ok('A goal is a tracking record in FINOVA; it does not move money. I can open the goal form for you.',[act('goal','Start a savings goal','Opens the new-goal form so you can set a target and date.','/financial-goals/new')],'ai');
 if(/statement/.test(t))return ok('You can view and download statements for any of your accounts.',[act('statement','Open statements','Go to the Statements page.','/statements')],'ai');
 if(/balance/.test(t))return ok('Here are your current balances from your accounts:',[{type:'metrics',items:store.acc.map(a=>({label:a.type,value:inr(a.balance),sub:`Available ${inr(a.available)}`}))}]);
 if(/compare|month.over.month|monthly expenses/.test(t)){const c=thisMonth(),p=addMonths(c,-1),a=sum(debits(monthRange(c))),b=sum(debits(monthRange(p)));
  return ok(`Spending so far in ${monthLabel(c)} is ${inr(a)} versus ${inr(b)} for all of ${monthLabel(p)}. ${monthLabel(c)} is not finished, so the comparison is partial.`,[{type:'comparison',rows:[[monthLabel(p),inr(b),'Full month'],[monthLabel(c),inr(a),`Day 1–${TODAY.getDate()}`]],head:['Month','Spent','Covers'],diff:pctChange(a,b)}])}
 if(/summar/.test(t)&&/transaction/.test(t)){const l=liveTx().slice(0,10);return ok(`Across your last ${l.length} completed transactions you received ${inr(sum(l.filter(x=>x.type==='credit')))} and spent ${inr(sum(l.filter(x=>x.type==='debit')))}.`,[{type:'metrics',items:[{label:'Money in',value:inr(sum(l.filter(x=>x.type==='credit')))},{label:'Money out',value:inr(sum(l.filter(x=>x.type==='debit')))},{label:'Transactions',value:String(l.length)}]},tx(l.slice(0,5),'Most recent')])}
 if(/largest|biggest|highest|explain.*expense/.test(t)){const r={from:iso(new Date(TODAY.getTime()-30*864e5)),to:TODAY_ISO},l=[...debits(r)].sort((a,b)=>b.amount-a.amount).slice(0,5);
  return ok(l.length?`Your largest expenses between ${r.from} and ${r.to}. The biggest was ${inr(l[0].amount)} at ${l[0].desc}.`:'No expenses found in the last 30 days.',[{...tx(l,'Largest expenses, last 30 days'),range:r}])}
 if(search){let l=liveTx();const parts=[];
  if(amt){const v=+amt[1].replace(/,/g,'');l=l.filter(x=>x.type==='debit'&&x.amount>v);parts.push(`above ${inr(v)}`)}
  if(cat){l=l.filter(x=>x.category===CAT[cat]);parts.push(CAT[cat])}
  if(mon>=0){const k=`2026-${String(mon+1).padStart(2,'0')}`;l=l.filter(x=>monthKey(x.date)===k);parts.push(monthLabel(k))}
  const m=t.match(/\bto\s+([a-z][\w ]*?)(?:\s+(?:in|from|above|over)\b|$)/);if(m){const name=m[1].trim();l=l.filter(x=>x.desc.toLowerCase().includes(name));parts.push(`matching “${name}”`)}
  if(/\blast\b/.test(t)&&m)l=l.slice(0,1);
  return ok(l.length?`Found ${l.length} transaction${l.length>1?'s':''} ${parts.join(', ')}:`:`I found no transactions ${parts.join(', ')}.`,l.length?[tx(l.slice(0,8),'Matching transactions'),act('search','Open full search','Open these filters on the Transactions page.',`/transactions?q=${encodeURIComponent(m?m[1].trim():'')}${cat?`&category=${CAT[cat]}`:''}`)]:[])}
 if(/how much.*(spend|spent)|spending|spent|summar|income|cash.?flow/.test(t)){const k=thisMonth(),r=monthRange(k);
  if(/summar|income|cash.?flow/.test(t)){const s=sum(credits(r)),e=sum(debits(r));return ok(`Financial summary for ${monthLabel(k)} (1–${TODAY.getDate()} ${monthLabel(k).slice(0,3)}).`,[{type:'metrics',items:[{label:'Income',value:inr(s)},{label:'Expenses',value:inr(e)},{label:'Net cash flow',value:inr(s-e)},{label:'Savings rate',value:s>0?Math.round((s-e)/s*100)+'%':'—',sub:'Net ÷ income'}]},{type:'categories',data:byCategory(debits(r)).slice(0,6)},act('insights','Open insights','See trends and comparisons.','/analytics/insights')])}
  const d=debits(r),cats=byCategory(d);return ok(`You spent ${inr(sum(d))} across ${d.length} transactions in ${monthLabel(k)} so far.`,[{type:'spending',total:sum(d),range:{from:r.from,to:TODAY_ISO},count:d.length,categories:cats.slice(0,5)},tx([...d].sort((a,b)=>b.amount-a.amount).slice(0,3),'Largest supporting transactions')])}
 if(/\b(last|latest|recent)\b|transaction/.test(t)){const c=Math.min(20,NUM[n]||+n||5),l=liveTx().slice(0,c);return ok(`Here ${c===1?'is':'are'} your ${c===1?'latest completed transaction':`${c} latest completed transactions`}:`,[tx(l,'Recent transactions')])}
 return{unsupported:true,text:'I cannot help with that yet. I can explain banking terms, show transactions and balances, search by category, amount or merchant, answer spending questions, compare months, summarise your finances and open banking pages for you.',blocks:[],source:'ai'}}

const C=[ ['#rate',()=>fail('You are sending messages too quickly. Please wait a minute and try again.','rate_limited',429)],['#timeout',()=>fail('The assistant took too long to respond.','timeout',504)],['#denied',()=>fail('You do not have permission to access that account.','permission_denied',403)] ];
export const ai={
 async list(){await wait(200);return[...convs].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(({messages,...c})=>({...c,count:messages.length}))},
 async get(id){await wait(150);const c=convs.find(x=>x.id===id);if(!c)throw fail('Conversation not found','not_found',404);return c},
 async create(){await wait(100);const c={id:uid('cv'),title:'New conversation',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),messages:[]};convs.unshift(c);return c},
 async rename(id,title){await wait(150);const c=convs.find(x=>x.id===id);if(!c)throw fail('Conversation not found','not_found',404);if(!title.trim())throw fail('Title cannot be empty','validation');c.title=title.trim().slice(0,60);return c},
 async clear(id){await wait(200);const c=convs.find(x=>x.id===id);if(!c)throw fail('Conversation not found','not_found',404);c.messages=[];c.updatedAt=new Date().toISOString();return{ok:true}},
 async remove(id){await wait(200);const i=convs.findIndex(x=>x.id===id);if(i<0)throw fail('Conversation not found','not_found',404);convs.splice(i,1);return{ok:true}},
 // POST /ai/conversations/:id/messages — the backend must authorise every data access the model makes.
 async send(id,text){await wait(900);const c=convs.find(x=>x.id===id);if(!c)throw fail('Conversation not found','not_found',404);
  for(const[k,f]of C)if(text.toLowerCase().includes(k))throw f();
  const now=new Date().toISOString(),u={id:uid('m'),role:'user',text,createdAt:now},r=answer(text),a={id:uid('m'),role:'assistant',createdAt:new Date().toISOString(),...r};
  c.messages.push(u,a);c.updatedAt=a.createdAt;if(c.title==='New conversation')c.title=text.slice(0,40);return{user:u,assistant:a,title:c.title}}
};
