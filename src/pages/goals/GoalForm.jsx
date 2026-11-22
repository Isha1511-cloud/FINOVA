import {useState} from 'react';import {useNavigate,Link} from 'react-router-dom';
import {goalApi,GOAL_CATEGORIES} from '../../services/phase3.js';import {useApp} from '../../context/AppContext.jsx';
import {Card,Field,Input,Select,Spinner,PageHeader} from '../../components/common/ui.jsx';import {DevNotice,GoalTabs,errMsg,todayIso} from '../../components/p3/parts.jsx';
export default function GoalForm(){
 const nav=useNavigate(),{toast}=useApp();const[f,setF]=useState({name:'',category:'Purchase',target:'',baseSaved:'',targetDate:'',description:''}),[e,setE]=useState({}),[busy,setBusy]=useState(false);const s=k=>x=>setF({...f,[k]:x.target.value});
 const submit=async ev=>{ev.preventDefault();if(busy)return;const v={},today=todayIso();
  if(f.name.trim().length<2)v.name='Enter a goal name';if(!(Number(f.target)>0))v.target='Target must be greater than zero';else if(Number(f.target)>1e9)v.target='Target is too large';
  if(f.baseSaved!==''&&Number(f.baseSaved)<0)v.baseSaved='Cannot be negative';
  if(!f.targetDate)v.targetDate='Choose a target date';else if(f.targetDate<=today)v.targetDate='Target date must be in the future';else if(f.targetDate>String(+today.slice(0,4)+30)+today.slice(4))v.targetDate='Target date is more than 30 years away';
  setE(v);if(Object.keys(v).length)return;setBusy(true);
  try{const g=await goalApi.create({...f,target:Number(f.target),baseSaved:Number(f.baseSaved||0)});toast('Goal created');nav(`/financial-goals/${g.id}`)}catch(x){setE({form:errMsg(x)})}finally{setBusy(false)}};
 return<><PageHeader title="Create goal" sub="A goal is a tracking record; it does not move money."/><GoalTabs/><DevNotice what="Saved goals"/>
 <Card className="mx-auto max-w-xl"><form noValidate onSubmit={submit} className="space-y-3">{e.form&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{e.form}</p>}
  <Field label="Goal name" error={e.name}><Input value={f.name} onChange={s('name')} error={e.name} placeholder="e.g. Laptop"/></Field>
  <div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><Select value={f.category} onChange={s('category')}>{GOAL_CATEGORIES.map(c=><option key={c}>{c}</option>)}</Select></Field><Field label="Target date" error={e.targetDate}><Input type="date" value={f.targetDate} onChange={s('targetDate')} error={e.targetDate}/></Field></div>
  <div className="grid gap-3 sm:grid-cols-2"><Field label="Target amount (₹)" error={e.target}><Input type="number" min="1" value={f.target} onChange={s('target')} error={e.target}/></Field><Field label="Already saved (₹, optional)" error={e.baseSaved}><Input type="number" min="0" value={f.baseSaved} onChange={s('baseSaved')} error={e.baseSaved}/></Field></div>
  <Field label="Description (optional)"><Input maxLength={200} value={f.description} onChange={s('description')}/></Field>
  <div className="flex justify-end gap-2"><Link className="btn-s" to="/financial-goals">Cancel</Link><button className="btn-p" disabled={busy}>{busy&&<Spinner/>}Create goal</button></div></form></Card></>}
