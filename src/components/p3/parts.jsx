import {useEffect,useState} from 'react';import {NavLink} from 'react-router-dom';import {FlaskConical} from 'lucide-react';
import {Badge} from '../common/ui.jsx';import {IS_MOCK} from '../../services/phase3.js';

// Shown whenever the UI is running on the development adapter.
export const DevNotice=({what='These figures'})=>IS_MOCK?<div role="note" className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"><FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/><span>Demo mode: {what} come from a development adapter, not from real banking records.</span></div>:null;

export const ProgressBar=({pct=0,tone='bg-indigo-600',label})=><div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,Math.round(pct))} aria-label={label} className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{width:`${Math.min(100,Math.max(0,pct))}%`}}/></div>;

export const Rows=({rows})=><dl className="divide-y divide-dashed divide-slate-200 text-sm dark:divide-slate-700">{rows.filter(Boolean).map(([k,v])=><div key={k} className="flex justify-between gap-4 py-2"><dt className="muted shrink-0">{k}</dt><dd className="min-w-0 break-words text-right font-semibold">{v??<span className="muted font-normal">Not provided</span>}</dd></div>)}</dl>;

const label=s=>String(s).replace(/_/g,' ');
export const RiskBadge=({r})=><Badge tone={{high:'red',medium:'amber',low:'blue'}[r]||'slate'}>{r} risk</Badge>;
export const AlertStatus=({s})=><Badge tone={{new:'red',under_review:'amber',resolved:'green',closed:'slate'}[s]||'slate'}>{label(s)}</Badge>;
export const BenStatus=({s})=><Badge tone={{active:'green',verified:'blue',pending_verification:'amber',activation_pending:'amber',verification_failed:'red'}[s]||'slate'}>{label(s)}</Badge>;
export const GoalStatus=({s})=><Badge tone={{completed:'green',on_track:'blue',behind:'amber',overdue:'red'}[s]||'slate'}>{label(s)}</Badge>;
export const BudgetStatus=({s})=><Badge tone={{on_track:'green',approaching:'amber',exceeded:'red'}[s]||'slate'}>{label(s)}</Badge>;

export const LoanStatus=({s})=><Badge tone={{active:'blue',overdue:'red',closed:'slate'}[s]||'slate'}>{label(s)}</Badge>;
export const AppStatus=({s})=><Badge tone={{under_review:'amber',approved:'green',rejected:'red',declined:'slate',disbursed:'blue'}[s]||'slate'}>{label(s)}</Badge>;
export const InstStatus=({s})=><Badge tone={{paid:'green',due:'amber',overdue:'red',upcoming:'slate'}[s]||'slate'}>{label(s)}</Badge>;

export const Seg=({value,onChange,options,name})=><div role="group" aria-label={name} className="flex w-full max-w-full rounded-xl border border-slate-200 bg-white p-0.5 text-sm dark:border-slate-700 dark:bg-slate-900 sm:inline-flex sm:w-auto">{options.map(([v,l])=><button key={v} type="button" aria-pressed={value===v} onClick={()=>onChange(v)} className={`min-w-0 flex-1 rounded-[10px] px-2 py-2 font-medium transition sm:flex-none sm:px-3 sm:py-1.5 ${value===v?'bg-indigo-600 text-white':'muted hover:text-primary'}`}>{l}</button>)}</div>;

export const Tabs=({items})=><div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800" role="navigation" aria-label="Section">{items.map(([to,l])=><NavLink key={to} to={to} end className={({isActive})=>`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${isActive?'border-indigo-600 text-indigo-600':'border-transparent muted hover:text-primary'}`}>{l}</NavLink>)}</div>;
export const AnalyticsTabs=()=><Tabs items={[['/analytics/insights','Insights'],['/analytics/categories','Categories'],['/analytics/budgets','Budgets'],['/analytics/history','Insight history'],['/analytics/forecast','Forecast']]}/>;
export const LoanTabs=()=><Tabs items={[['/loans','Overview'],['/loans/apply','Apply'],['/loans/calculator','EMI calculator']]}/>;
export const GoalTabs=()=><Tabs items={[['/financial-goals','Goals'],['/financial-goals/plan','Savings plan'],['/financial-goals/monthly','Monthly planner']]}/>;

export function useDebounced(v,ms=300){const[x,setX]=useState(v);useEffect(()=>{const t=setTimeout(()=>setX(v),ms);return()=>clearTimeout(t)},[v,ms]);return x}
export const newKey=()=>(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random());
export const errMsg=e=>e?.message||'Something went wrong. Please try again.';
export const pctText=p=>p==null?'n/a (no previous data)':`${p>0?'+':''}${p}%`;
export const Tip=({children})=><p className="muted text-xs">{children}</p>;
export const ChartBox=({label,h='h-64',children})=><div role="img" aria-label={label} className={`${h} w-full`}>{children}</div>;
export const rupee=n=>{const v=Math.round(Number(n)||0);return(v<0?'-':'')+'₹'+Math.abs(v).toLocaleString('en-IN')};
export const todayIso=()=>IS_MOCK?'2026-10-13':new Date().toISOString().slice(0,10);
