import {Link} from 'react-router-dom';import {Sparkles,ShieldAlert,Database,ArrowRight,Info} from 'lucide-react';
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer} from 'recharts';
import {TxItem} from '../transactions/TxItem.jsx';import {COLORS} from './AIChatMessage.jsx';import {rupee} from '../p3/parts.jsx';import {dt} from '../../utils/format.js';

// Renders structured assistant output. Everything is rendered as React text nodes — no HTML from the model is ever injected.
const safeLink=l=>typeof l==='string'&&l.startsWith('/')&&!l.startsWith('//');
function Block({b}){
 switch(b.type){
  case'metrics':return<div className="grid gap-2 sm:grid-cols-2">{b.items.map(s=><div key={s.label} className="rounded-xl bg-black/25 p-3"><p className="muted text-xs">{s.label}</p><p className="text-lg font-bold">{s.value}</p>{s.sub&&<p className="muted text-xs">{s.sub}</p>}</div>)}</div>;
  case'transactions':return<div><p className="mb-1 text-xs font-semibold">{b.title}</p><div className="rounded-xl bg-black/25 p-1">{b.items.map(t=><TxItem key={t.id} t={t}/>)}</div></div>;
  case'categories':return<CatChart data={b.data}/>;
  case'spending':return<div className="space-y-2"><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-black/25 p-3"><p className="muted text-xs">Total spending</p><p className="text-lg font-bold">{rupee(b.total)}</p></div><div className="rounded-xl bg-black/25 p-3"><p className="muted text-xs">Transactions</p><p className="text-lg font-bold">{b.count}</p></div><div className="rounded-xl bg-black/25 p-3"><p className="muted text-xs">Date range</p><p className="text-sm font-bold">{dt(b.range.from)} – {dt(b.range.to)}</p></div></div><CatChart data={b.categories}/></div>;
  case'comparison':return<div className="overflow-x-auto rounded-xl bg-black/25"><table className="w-full text-left text-xs"><thead><tr>{b.head.map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{b.rows.map((r,i)=><tr key={i} className="border-t border-white/10">{r.map((c,j)=><td key={j} className="p-2">{c}</td>)}</tr>)}</tbody></table></div>;
  case'action':return<div className="rounded-xl border border-indigo-200 bg-black/25 p-3 dark:border-indigo-500/30"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Proposed action · not executed</p><p className="mt-1 font-semibold">{b.title}</p><p className="muted text-xs">{b.description}</p>{safeLink(b.link)&&<Link to={b.link} className="btn-p mt-2 !py-1.5">Review and continue<ArrowRight className="h-4 w-4"/></Link>}</div>;
  default:return null}}
const CatChart=({data})=>!data?.length?null:<div className="grid items-center gap-2 rounded-xl bg-black/25 p-2 sm:grid-cols-2"><div role="img" aria-label={'Spending by category: '+data.map(d=>`${d.name} ${rupee(d.value)}`).join(', ')} className="h-40"><ResponsiveContainer><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60}>{data.map((_,i)=><Cell key={i} fill={COLORS[i%8]}/>)}</Pie><Tooltip formatter={v=>rupee(v)}/></PieChart></ResponsiveContainer></div><ul className="space-y-1 text-xs">{data.map((d,i)=><li key={d.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{background:COLORS[i%8]}}/>{d.name}<b className="ml-auto">{rupee(d.value)}</b></li>)}</ul></div>;

export default function AIMessage({m}){
 if(m.role==='user')return<div className="flex justify-end"><div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-gradient-to-br from-violet-500 to-violet-700 px-4 py-2.5 text-sm text-white shadow-lg shadow-violet-900/40 sm:max-w-[70%]">{m.text}</div></div>;
 const data=m.source==='banking_data';
 return<div className="flex gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20"><Sparkles className="h-4 w-4"/></span>
  <div className="min-w-0 max-w-[92%] space-y-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[.05] px-4 py-3 text-sm sm:max-w-[80%]">
   {m.unsupported?<div className="flex gap-2 text-amber-700 dark:text-amber-400"><ShieldAlert className="h-5 w-5 shrink-0"/><p>{m.text}</p></div>:<p className="whitespace-pre-wrap break-words">{m.text}</p>}
   {(m.blocks||[]).map((b,i)=><Block key={i} b={b}/>)}
   <p className="muted flex items-center gap-1 pt-1 text-[11px]">{data?<><Database className="h-3 w-3"/>Figures come from your banking data.</>:<><Info className="h-3 w-3"/>AI-generated suggestion — not confirmed banking data.</>}</p></div></div>}
