import {Sparkles,ShieldAlert} from 'lucide-react';import {Link} from 'react-router-dom';
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer} from 'recharts';
import {TxItem} from '../transactions/TxItem.jsx';
export const COLORS=['#8B5CF6','#22D3EE','#F472B6','#FBBF24','#6EE7B7','#A78BFA','#60A5FA','#FB923C'];
export default function AIChatMessage({m}){
 if(m.role==='user')return<div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-violet-500 to-violet-700 px-4 py-2.5 text-sm text-white shadow-lg shadow-violet-900/40 sm:max-w-[70%]">{m.text}</div></div>;
 return<div className="flex gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20"><Sparkles className="h-4 w-4"/></span>
 <div className="min-w-0 max-w-[90%] space-y-2 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[.05] px-4 py-3 text-sm sm:max-w-[75%]">
  {m.type==='alert'?<div className="flex gap-2 text-amber-700 dark:text-amber-400"><ShieldAlert className="h-5 w-5 shrink-0"/><div><p>{m.text}</p><Link className="btn-p mt-2 !py-1.5" to={m.link}>Open Transfer Money</Link></div></div>:<p>{m.text}</p>}
  {m.type==='transactions'&&<div className="rounded-xl bg-black/25 p-1">{m.items.map(t=><TxItem key={t.id} t={t}/>)}</div>}
  {m.type==='summary'&&<div className="grid gap-2 sm:grid-cols-2">{m.stats.map(s=><div key={s.label} className="rounded-xl bg-black/25 p-3"><p className="muted text-xs">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>)}</div>}
  {m.type==='table'&&<div className="overflow-x-auto rounded-xl bg-black/25"><table className="w-full text-left text-xs"><thead><tr>{m.head.map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{m.rows.map((r,i)=><tr key={i} className="border-t border-white/10">{r.map((c,j)=><td key={j} className="p-2">{c}</td>)}</tr>)}</tbody></table></div>}
  {m.type==='chart'&&<div className="h-52 rounded-xl bg-black/25"><ResponsiveContainer><PieChart><Pie data={m.data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75}>{m.data.map((_,i)=><Cell key={i} fill={COLORS[i%8]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>}
 </div></div>}
