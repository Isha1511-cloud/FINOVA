import {Eye,EyeOff} from 'lucide-react';import {useState} from 'react';
import {mask,dt} from '../../utils/format.js';import {Amt} from '../common/ui.jsx';
export default function AccountCard({a,active,onSelect,detailed}){const[show,setShow]=useState(false);
 return<div onClick={onSelect} className={`rounded-2xl relative overflow-hidden bg-gradient-to-br from-[#0B3D7A] via-primary to-accent p-5 text-white shadow-xl shadow-blue-700/25 transition hover:-translate-y-1 ${onSelect?'cursor-pointer':''} ${active?'ring-4 ring-indigo-400/50':''}`}>
  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"/><div className="relative flex items-start justify-between"><p className="text-sm text-indigo-100">FINOVA {a.type}</p><span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{a.status}</span></div>
  <p className="mt-4 text-2xl font-bold"><Amt v={a.balance}/></p><p className="text-xs text-indigo-200">Available balance <Amt v={a.available}/></p>
  <div className="mt-4 flex items-center justify-between font-mono text-sm"><span>{show?a.number:mask(a.number)}</span><button aria-label="Toggle number" onClick={e=>{e.stopPropagation();setShow(!show)}}>{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div>
  {detailed&&<div className="mt-3 grid grid-cols-2 gap-2 text-xs text-indigo-100"><span>IFSC: {a.ifsc}</span><span>Opened: {dt(a.opened)}</span></div>}</div>}
