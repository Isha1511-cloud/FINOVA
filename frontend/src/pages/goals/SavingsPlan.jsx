import {useState} from 'react';import {Calculator} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {goalApi} from '../../services/phase3.js';
import {Card,PageHeader,Field,Input,Spinner} from '../../components/common/ui.jsx';import {DevNotice,GoalTabs,Rows,errMsg,rupee} from '../../components/p3/parts.jsx';import {dt} from '../../utils/format.js';
export default function SavingsPlan(){
 const avg=useAsync(goalApi.averages);const[f,setF]=useState({target:'',saved:'',targetDate:'',income:'',expenses:''}),[e,setE]=useState({}),[busy,setBusy]=useState(false),[r,setR]=useState(null);const s=k=>x=>setF({...f,[k]:x.target.value});
 const run=async ev=>{ev.preventDefault();if(busy)return;const v={};if(!(Number(f.target)>0))v.target='Enter an amount greater than zero';if(f.saved!==''&&Number(f.saved)<0)v.saved='Cannot be negative';if(!f.targetDate)v.targetDate='Choose a date';setE(v);setR(null);if(Object.keys(v).length)return;
  setBusy(true);try{setR(await goalApi.plan(f))}catch(x){setE({form:errMsg(x)})}finally{setBusy(false)}};
 return<><PageHeader title="Savings plan estimate" sub="See roughly how much to set aside each month."/><GoalTabs/><DevNotice what="Plan calculations"/>
 <div className="grid gap-4 lg:grid-cols-2"><Card><form noValidate onSubmit={run} className="space-y-3">{e.form&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{e.form}</p>}
  <Field label="Goal amount (₹)" error={e.target}><Input type="number" min="1" value={f.target} onChange={s('target')} error={e.target}/></Field>
  <Field label="Currently saved (₹)" error={e.saved}><Input type="number" min="0" value={f.saved} onChange={s('saved')} error={e.saved}/></Field>
  <Field label="Target date" error={e.targetDate}><Input type="date" value={f.targetDate} onChange={s('targetDate')} error={e.targetDate}/></Field>
  <div className="grid gap-3 sm:grid-cols-2"><Field label="Monthly income (₹, optional)"><Input type="number" min="0" value={f.income} onChange={s('income')}/></Field><Field label="Monthly expenses (₹, optional)"><Input type="number" min="0" value={f.expenses} onChange={s('expenses')}/></Field></div>
  {avg.data&&<button type="button" className="btn-s w-full text-xs" onClick={()=>setF({...f,income:String(avg.data.income),expenses:String(avg.data.expenses)})}>Use my recent averages ({rupee(avg.data.income)} / {rupee(avg.data.expenses)}; {avg.data.basis})</button>}
  <button className="btn-p w-full" disabled={busy}>{busy?<Spinner/>:<Calculator className="h-4 w-4"/>}Estimate plan</button></form></Card>
  <Card><h2 className="mb-2 font-semibold">Estimate</h2>{!r?<p className="muted text-sm">Fill in the form to see an estimate.</p>:<>
   <Rows rows={[['Remaining target',rupee(r.remaining)],['Months until target date',r.months],['Suggested monthly savings',rupee(r.suggestedMonthly)],['Estimated completion',r.estimatedCompletion?dt(r.estimatedCompletion):'Cannot be estimated'],r.capacity!=null&&['Monthly surplus you entered',rupee(r.capacity)]]}/>
   {r.feasible===false&&<p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10">Your entered surplus is lower than the suggested monthly amount, so the target date may not be reachable.</p>}
   <h3 className="mt-3 text-sm font-semibold">Assumptions</h3><ul className="list-disc space-y-1 pl-5 text-xs">{r.assumptions.map(a=><li key={a}>{a}</li>)}</ul></>}</Card></div></>}
