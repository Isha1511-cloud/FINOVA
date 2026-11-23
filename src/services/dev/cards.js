// DEVELOPMENT ADAPTER — demo virtual cards. Mirrors the REST contract in docs/BACKEND_CONTRACTS.md.
// Numbers are well-known test numbers or random Luhn-valid values. Nothing here is a real card.
import {store} from '../mock.js';
import {wait,fail,TODAY_ISO,sum,uid} from './core.js';

export const NETWORKS=['Visa','Mastercard','RuPay'];
export const PURPOSES=['Online shopping','Subscriptions','Travel','Bills','General'];
export const CAPS={perTxn:100000,daily:200000,monthly:500000};
export const MAX_CARDS=5;
const HOLDER='AARAV PATEL',inr=n=>'₹'+Number(n).toLocaleString('en-IN');
const luhn=b=>{let s=0;[...b].reverse().forEach((c,i)=>{let n=+c;if(i%2===0){n*=2;if(n>9)n-=9}s+=n});return(10-s%10)%10};
const genNumber=net=>{let b={Visa:'4',Mastercard:'5',RuPay:'6521'}[net];while(b.length<15)b+=Math.floor(Math.random()*10);return b+luhn(b)};
const at=()=>TODAY_ISO+'T'+new Date().toTimeString().slice(0,8);          // demo clock date + real time of day
const acct=id=>store.acc.find(a=>a.id===id);

let CARDS=[
 {id:'c1',label:'Online shopping',network:'Visa',purpose:'Online shopping',number:'4242424242424242',cvv:'318',expiry:'10/29',accountId:'a1',status:'active',createdAt:'2026-08-12',theme:0,singleUse:false,
  limits:{perTxn:25000,daily:50000,monthly:100000},controls:{online:true,international:false},events:[{at:'2026-08-12T10:05:00',note:'Card created'}],
  activity:[{id:'CT1001',date:'2026-10-13T09:40:00',merchant:'Amazon',category:'Shopping',amount:1299,status:'approved'},{id:'CT1004',date:'2026-10-12T22:10:00',merchant:'Steam (International)',category:'Entertainment',amount:1800,status:'declined',reason:'International payments are turned off for this card.'},
   {id:'CT1002',date:'2026-10-09T20:15:00',merchant:'Myntra',category:'Shopping',amount:2499,status:'approved'},{id:'CT1003',date:'2026-10-05T11:30:00',merchant:'Flipkart',category:'Shopping',amount:3150,status:'approved'},{id:'CT1005',date:'2026-09-28T13:05:00',merchant:'Swiggy',category:'Food',amount:640,status:'approved'}]},
 {id:'c2',label:'Subscriptions',network:'Mastercard',purpose:'Subscriptions',number:'5555555555554444',cvv:'902',expiry:'10/29',accountId:'a1',status:'frozen',createdAt:'2026-09-03',theme:1,singleUse:false,
  limits:{perTxn:2000,daily:5000,monthly:10000},controls:{online:true,international:false},events:[{at:'2026-09-03T18:20:00',note:'Card created'},{at:'2026-10-11T08:00:00',note:'Card frozen by you'}],
  activity:[{id:'CT2001',date:'2026-10-10T07:00:00',merchant:'Netflix',category:'Entertainment',amount:649,status:'approved'},{id:'CT2002',date:'2026-10-08T07:00:00',merchant:'Spotify',category:'Entertainment',amount:119,status:'approved'}]}];

const usage=c=>({today:sum(c.activity.filter(a=>a.status==='approved'&&a.date.slice(0,10)===TODAY_ISO),a=>a.amount),month:sum(c.activity.filter(a=>a.status==='approved'&&a.date.slice(0,7)===TODAY_ISO.slice(0,7)),a=>a.amount)});
const view=c=>({id:c.id,label:c.label,network:c.network,purpose:c.purpose,last4:c.number.slice(-4),expiry:c.expiry,holder:HOLDER,accountId:c.accountId,status:c.status,createdAt:c.createdAt,theme:c.theme,singleUse:c.singleUse,limits:c.limits,controls:c.controls,usage:usage(c)});
const find=id=>{const c=CARDS.find(x=>x.id===id);if(!c)throw fail('Card not found','not_found',404);return c};
const checkLimits=({perTxn,daily,monthly})=>{perTxn=Number(perTxn);daily=Number(daily);monthly=Number(monthly);
 if(![perTxn,daily,monthly].every(n=>n>0))throw fail('Limits must be greater than zero.','validation');
 if(perTxn>CAPS.perTxn||daily>CAPS.daily||monthly>CAPS.monthly)throw fail(`Maximum limits are ${inr(CAPS.perTxn)} per transaction, ${inr(CAPS.daily)} per day and ${inr(CAPS.monthly)} per month.`,'validation');
 if(perTxn>daily||daily>monthly)throw fail('Limits must satisfy: per-transaction ≤ daily ≤ monthly.','validation');return{perTxn,daily,monthly}};
const log=(c,note)=>c.events.push({at:at(),note});

export const cards={
 async list(){await wait(300);const items=CARDS.map(view);return{items,totals:{active:items.filter(c=>c.status==='active').length,frozen:items.filter(c=>c.status==='frozen').length,spentMonth:sum(items,c=>c.usage.month),max:MAX_CARDS,open:items.filter(c=>c.status!=='blocked').length}}},
 async get(id){await wait(250);const c=find(id);return{...view(c),activity:[...c.activity].sort((a,b)=>b.date.localeCompare(a.date)),events:[...c.events].reverse()}},
 async create(d){await wait(900);const label=String(d.label||'').trim();
  if(label.length<2||label.length>30)throw fail('Card name must be 2–30 characters.','validation');if(!NETWORKS.includes(d.network))throw fail('Choose a card network.','validation');
  if(!PURPOSES.includes(d.purpose))throw fail('Choose what the card is for.','validation');if(!acct(d.accountId))throw fail('Choose a linked account.','validation');
  if(CARDS.filter(c=>c.status!=='blocked').length>=MAX_CARDS)throw fail(`You can have up to ${MAX_CARDS} active virtual cards. Block one to create another.`,'limit',409);
  const limits=checkLimits(d.limits||{}),n=new Date(),exp=`${String(n.getMonth()+1).padStart(2,'0')}/${String(n.getFullYear()+3).slice(2)}`;
  const c={id:uid('c'),label,network:d.network,purpose:d.purpose,number:genNumber(d.network),cvv:String(Math.floor(100+Math.random()*900)),expiry:exp,accountId:d.accountId,status:'active',createdAt:TODAY_ISO,theme:CARDS.length%4,singleUse:!!d.singleUse,
   limits,controls:{online:d.controls?.online!==false,international:!!d.controls?.international},events:[{at:at(),note:d.singleUse?'Single-use card created':'Card created'}],activity:[]};
  CARDS=[c,...CARDS];return view(c)},
 async update(id,d){await wait(450);const c=find(id);if(c.status==='blocked')throw fail('A blocked card cannot be changed.','conflict',409);
  if(d.label!=null){const l=String(d.label).trim();if(l.length<2||l.length>30)throw fail('Card name must be 2–30 characters.','validation');if(l!==c.label){log(c,`Renamed to “${l}”`);c.label=l}}
  if(d.limits){const l=checkLimits(d.limits);c.limits=l;log(c,'Spending limits updated')}
  if(d.controls){const o=d.controls;if(o.online!=null&&o.online!==c.controls.online){c.controls.online=!!o.online;log(c,`Online payments turned ${o.online?'on':'off'}`)}
   if(o.international!=null&&o.international!==c.controls.international){c.controls.international=!!o.international;log(c,`International payments turned ${o.international?'on':'off'}`)}}
  return view(c)},
 async freeze(id){await wait(350);const c=find(id);if(c.status!=='active')throw fail(c.status==='blocked'?'A blocked card cannot be frozen.':'This card is already frozen.','conflict',409);c.status='frozen';log(c,'Card frozen by you');return view(c)},
 async unfreeze(id){await wait(350);const c=find(id);if(c.status!=='frozen')throw fail('Only a frozen card can be unfrozen.','conflict',409);c.status='active';log(c,'Card unfrozen by you');return view(c)},
 async block(id){await wait(500);const c=find(id);if(c.status==='blocked')throw fail('This card is already blocked.','conflict',409);c.status='blocked';log(c,'Card permanently blocked by you');return view(c)},
 // Real backend: require a step-up verification (OTP) completed in the last few minutes; never log or cache the response.
 async reveal(id){await wait(400);const c=find(id);if(c.status==='blocked')throw fail('Details are not available for a blocked card.','conflict',409);return{number:c.number,cvv:c.cvv,expiry:c.expiry,holder:HOLDER}},
 // DEMO ONLY: pretend a merchant charges this card, to exercise limits / freeze / controls.
 async simulate(id,{merchant,amount,category='Shopping',international=false}){await wait(800);const c=find(id);amount=Number(amount);
  if(!String(merchant||'').trim())throw fail('Enter a merchant name.','validation');if(!(amount>0))throw fail('Enter an amount greater than zero.','validation');
  const u=usage(c),a=acct(c.accountId);let why='';
  if(c.status==='blocked')why='This card is blocked.';else if(c.status==='frozen')why='This card is frozen.';
  else if(!c.controls.online)why='Online payments are turned off for this card.';
  else if(international&&!c.controls.international)why='International payments are turned off for this card.';
  else if(amount>c.limits.perTxn)why=`Exceeds the per-transaction limit of ${inr(c.limits.perTxn)}.`;
  else if(u.today+amount>c.limits.daily)why=`Would exceed the daily limit of ${inr(c.limits.daily)}.`;
  else if(u.month+amount>c.limits.monthly)why=`Would exceed the monthly limit of ${inr(c.limits.monthly)}.`;
  else if(amount>a.available)why='Insufficient balance in the linked account.';
  const name=String(merchant).trim()+(international?' (International)':''),act={id:uid('CT'),date:at(),merchant:name,category,amount,status:why?'declined':'approved'};
  if(why)act.reason=why;else{a.balance-=amount;a.available-=amount;const t={id:'TXN'+Date.now().toString().slice(-6)+Math.floor(10+Math.random()*90),ref:'REF'+Date.now(),date:act.date,accountId:a.id,desc:`${name} · Card ${c.number.slice(-4)}`,category,type:'debit',amount,status:'completed',kind:'card',cardId:c.id,remarks:c.label};
   store.tx=[t,...store.tx];act.txnId=t.id;if(c.singleUse){c.status='blocked';log(c,'Single-use card closed after its first payment')}}
  c.activity.unshift(act);return{result:act,card:view(c)}}
};

// Notification items for ./fraud.js: payments declined in the last 7 days.
export const cardNotes=()=>CARDS.flatMap(c=>c.activity.filter(a=>a.status==='declined'&&(new Date(TODAY_ISO)-new Date(a.date.slice(0,10)))/864e5<=7).map(a=>({id:'n-cd-'+a.id,type:'card',title:'Card payment declined',body:`${a.merchant} (${inr(a.amount)}) on “${c.label}”: ${a.reason}`,createdAt:a.date,link:`/cards/${c.id}`})));
