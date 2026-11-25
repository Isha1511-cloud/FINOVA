#!/usr/bin/env node
// Verifies Phase 3 endpoint response shapes against src/services/contract.js.
//   node scripts/verify-contract.mjs                       → checks the built-in demo adapter (self-test)
//   node scripts/verify-contract.mjs --api https://host/api --token <JWT>   → checks a real backend (read-only calls + 2 side-effect-free POSTs)
import {CHECKS,validate} from '../src/services/contract.js';
const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:null};
const api=arg('--api'),token=arg('--token');let failed=0;
let d;if(!api)d=await import('../src/services/dev/index.js');
const mock={'transfers.limits':()=>d.transfers.limits(),'transfers.list':()=>d.transfers.list(),'transfers.preview':()=>d.transfers.preview({mode:'beneficiary',amount:60000}),'beneficiaries.list':()=>d.beneficiaries.list(),'ai.conversations':()=>d.ai.list(),'fraud.alerts':()=>d.fraud.list(),'notifications.list':()=>d.notifications.list(),'capabilities':()=>d.insights.capabilities(),'insights.summary':()=>d.insights.summary(),'insights.compare':()=>d.insights.compare(),'insights.recommendations':()=>d.insights.recommendations(),'insights.history':()=>d.insights.history(),'budgets.list':()=>d.budgets.list(),'goals.list':()=>d.goals.list(),'cards.list':()=>d.cards.list(),'loans.products':()=>d.loans.products(),'loans.list':()=>d.loans.list(),'loans.applications':()=>d.loans.applications(),'goals.plan':()=>d.goals.plan({target:60000,saved:0,targetDate:'2027-06-30'}),'forecast':()=>d.forecast.get(),'forecast.upcoming':()=>d.forecast.upcoming()};
for(const[name,method,path,body,shape]of CHECKS){
 let res,err;
 try{if(api){const r=await fetch(api.replace(/\/$/,'')+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});if(!r.ok)throw new Error(`HTTP ${r.status}`);res=await r.json()}else res=await mock[name]()}catch(e){err=e.message}
 const problems=err?[`request failed: ${err}`]:validate(res,shape);
 if(problems.length){failed++;console.log(`FAIL ${method} ${path} (${name})\n     ${problems.slice(0,4).join('\n     ')}`)}else console.log(`ok   ${method} ${path}`);
}
console.log(`\n${CHECKS.length-failed}/${CHECKS.length} endpoints match the contract${api?'':' (demo adapter)'}`);process.exit(failed?1:0);
