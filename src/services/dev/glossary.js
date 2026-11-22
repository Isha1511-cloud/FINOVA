// Curated banking glossary (src/data/glossary.json, also used by the server router).
// Definitions are fixed text - never generated - so the assistant cannot invent financial facts.
import G from '../../data/glossary.js';

const ROUTE={fraud_alerts:'/fraud-alerts',accounts:'/accounts',transactions:'/transactions',transfer:'/transfers/new',beneficiaries:'/beneficiaries',statements:'/statements',goals:'/financial-goals',budgets:'/analytics/budgets',categories:'/analytics/categories',forecast:'/analytics/forecast',insights:'/analytics/insights',notifications:'/notifications',settings:'/settings'};
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const ALIASES=G.flatMap(e=>[e.term,...e.aliases].map(a=>[a.toLowerCase(),e])).sort((a,b)=>b[0].length-a[0].length);
const EXPLAIN=/\b(explain|what is|what's|what are|what does|define|meaning of|mean by|means|tell me about|describe|how does|difference between|differences between|vs|versus)\b/;

// Finds up to 3 distinct glossary entries, longest match first, without overlapping spans.
export function findTerms(t){const used=[],seen=new Set(),hits=[];
 for(const[a,e]of ALIASES){const re=new RegExp(`(?<![a-z0-9])${esc(a)}(?:s|es)?(?![a-z0-9])`,'g');let m;
  while((m=re.exec(t))){const s=m.index,en=s+m[0].length;if(used.some(([x,y])=>s<y&&en>x))continue;used.push([s,en]);if(!seen.has(e.key)){seen.add(e.key);hits.push([s,e])}}}
 return hits.sort((a,b)=>a[0]-b[0]).slice(0,3).map(h=>h[1])}

const fmt=e=>`${e.term}: ${e.def}${e.example?` Example: ${e.example}`:''}`;
const SAMPLE=['NEFT','RTGS','UPI','IFSC','KYC','EMI','overdraft','available balance','fraud alert'];

// Returns {text,blocks} or null when the message is not a "what does X mean" question.
export function explain(q){const t=q.toLowerCase().trim(),words=t.split(/\s+/).length,mine=/\b(my|me|i)\b/.test(t);
 const asks=EXPLAIN.test(t)&&!mine,terms=findTerms(t);
 const cmd=/^(show|open|go|find|search|list|view|send|pay|get|take|compare)\b/.test(t);
 if(terms.length&&(asks||(words<=4&&!mine&&!cmd))){
  const blocks=[];const pg=terms.find(e=>e.page&&ROUTE[e.page]);
  if(pg)blocks.push({type:'action',kind:'navigate',title:`Open ${pg.term}`,description:'Go to the related page in FINOVA.',link:ROUTE[pg.page]});
  return{text:terms.map(fmt).join('  '),blocks}}
 if(asks)return{text:`I do not have a definition for that yet. I can explain banking terms such as ${SAMPLE.join(', ')}. Try asking "What is NEFT?" or "Difference between NEFT and RTGS".`,blocks:[]};
 return null}
