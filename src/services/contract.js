// Response shapes the Phase 3 frontend expects. Used by scripts/verify-contract.mjs so a backend
// developer can check their endpoints. Notation: 'string' | 'number' | 'boolean' | 'array' | 'object'.
// A trailing '?' makes a field optional. [shape] means "array whose items match shape". Extra fields are allowed.
const tx={id:'string',ref:'string',date:'string',amount:'number',status:'string',desc:'string',kind:'string'};
const alert={id:'string',ref:'string',txnId:'string',accountId:'string',amount:'number',date:'string',counterparty:'string',risk:'string',status:'string',createdAt:'string',reasons:[{code:'string',text:'string',kind:'string'}],customerActions:['string']};
const month={key:'string',m:'string',income:'number',expenses:'number',net:'number'};
const proj={key:'string',m:'string',income:'number',expenses:'number',net:'number',endBalance:'number'};
// [name, method, path, body|null, shape]
export const CHECKS=[
 ['transfers.limits','GET','/transfers/limits',null,{perTransfer:'number',daily:'number',usedToday:'number'}],
 ['transfers.list','GET','/transfers',null,{items:[tx],total:'number'}],
 ['transfers.preview','POST','/transfers/preview',{mode:'beneficiary',amount:60000},{fee:'number?',total:'number?'}],
 ['beneficiaries.list','GET','/beneficiaries',null,[{id:'string',name:'string',account:'string',ifsc:'string',bank:'string',status:'string'}]],
 ['ai.conversations','GET','/ai/conversations',null,[{id:'string',title:'string',createdAt:'string',updatedAt:'string'}]],
 ['fraud.alerts','GET','/fraud/alerts',null,{items:[alert],total:'number',counts:{total:'number',high:'number',medium:'number',low:'number',open:'number'},monitoring:'string?'}],
 ['notifications.list','GET','/notifications',null,{items:[{id:'string',type:'string',title:'string',body:'string',createdAt:'string',link:'string',read:'boolean'}],unread:'number'}],
 ['capabilities','GET','/capabilities',null,{categoryEdit:'boolean',budgets:'boolean',insightDismiss:'boolean',insightSave:'boolean',cardLock:'boolean',goalsPersist:'boolean',planPersist:'boolean'}],
 ['insights.summary','GET','/insights/summary',null,{income:'number',expenses:'number',net:'number',count:'number',categories:[{name:'string',value:'number',count:'number'}],monthly:[month],observations:['string'],definitions:'string'}],
 ['insights.compare','GET','/insights/compare',null,{current:{key:'string',label:'string',total:'number',count:'number'},previous:{key:'string',label:'string',total:'number',available:'boolean'},diff:'number',rows:[{name:'string',current:'number',previous:'number',diff:'number'}]}],
 ['insights.recommendations','GET','/insights/recommendations',null,{items:[{id:'string',title:'string',body:'string',period:'string',context:'string',link:'string'}],disclaimer:'string'}],
 ['insights.history','GET','/insights/history',null,{items:[{id:'string',title:'string',createdAt:'string',period:'string',category:'string',summary:'string',link:'string'}]}],
 ['budgets.list','GET','/budgets',null,{items:[{id:'string',name:'string',category:'string',amount:'number',period:'string',spent:'number',remaining:'number',pct:'number',status:'string',period_label:'string'}],thresholds:{approaching:'number',exceeded:'number'}}],
 ['goals.list','GET','/goals',null,{items:[{id:'string',name:'string',category:'string',target:'number',saved:'number',remaining:'number',pct:'number',status:'string',targetDate:'string'}],totals:{count:'number',target:'number',saved:'number'},note:'string?'}],
 ['goals.plan','POST','/goals/plan',{target:60000,saved:0,targetDate:'2027-06-30'},{remaining:'number',months:'number',suggestedMonthly:'number',estimatedCompletion:'string?',assumptions:['string']}],
 ['forecast','GET','/forecast',null,{history:[month],projection:[proj],baseline:[proj],startBalance:'number',generatedAt:'string',method:'string',assumptions:['string']}],
 ['loans.products','GET','/loans/products',null,[{type:'string',name:'string',min:'number',max:'number',minTenure:'number',maxTenure:'number',rate:'number',feePct:'number',foreclosurePct:'number',purposes:['string']}]],
 ['loans.list','GET','/loans',null,{items:[{id:'string',type:'string',name:'string',principal:'number',rate:'number',tenure:'number',emi:'number',status:'string',outstanding:'number',pct:'number',disbursedOn:'string',accountId:'string'}],totals:{active:'number',outstanding:'number',monthlyEmi:'number',overdue:'number'}}],
 ['loans.applications','GET','/loan-applications',null,{items:[{id:'string',type:'string',amount:'number',tenure:'number',status:'string',createdAt:'string',events:[{at:'string',status:'string',note:'string'}]}]}],
 ['forecast.upcoming','GET','/forecast/upcoming',null,{scheduled:'array',scheduledNote:'string?',predicted:[{label:'string',kind:'string',amount:'number',typicalDay:'number',basis:'string'}],predictedNote:'string?'}]];

export function validate(v,shape,path='$'){
 const bad=[];const type=x=>Array.isArray(x)?'array':x===null?'null':typeof x;
 if(Array.isArray(shape)){if(!Array.isArray(v))return[`${path}: expected array, got ${type(v)}`];if(v.length)return validate(v[0],shape[0],path+'[0]');return bad}
 if(typeof shape==='string'){const opt=shape.endsWith('?'),t=shape.replace('?','');if(v==null)return opt?bad:[`${path}: missing`];if(type(v)!==t)bad.push(`${path}: expected ${t}, got ${type(v)}`);return bad}
 if(type(v)!=='object')return[`${path}: expected object, got ${type(v)}`];
 for(const[k,s]of Object.entries(shape))bad.push(...validate(v[k],s,`${path}.${k}`));return bad}
