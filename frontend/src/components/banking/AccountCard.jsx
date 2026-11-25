import {Eye,EyeOff,Wallet,Briefcase,PiggyBank,Wifi} from 'lucide-react';
import {useState} from 'react';
import {motion} from 'framer-motion';
import {mask,dt} from '../../utils/format.js';
import {Amt} from '../common/ui.jsx';

// Account-category styling. Savings = midnight/blue, Current = charcoal/teal; anything else falls back to navy.
const THEME=[
  [/current|business/i,{Icon:Briefcase,bg:'linear-gradient(140deg,#161B26 0%,#1F2A3A 55%,#0F5F66 130%)',glow:'rgba(20,184,166,.28)'}],
  [/saving/i,{Icon:PiggyBank,bg:'linear-gradient(140deg,#0A1226 0%,#14275A 55%,#2B5FE8 135%)',glow:'rgba(95,138,247,.35)'}],
];
const themeFor=type=>(THEME.find(([re])=>re.test(type))||[0,{Icon:Wallet,bg:'linear-gradient(140deg,#0A1226 0%,#14275A 60%,#2049BC 130%)',glow:'rgba(95,138,247,.3)'}])[1];
const statusDot=s=>/active/i.test(s)?'bg-emerald-400':/frozen|blocked|suspend/i.test(s)?'bg-rose-400':'bg-amber-400';

export default function AccountCard({a,active,onSelect,detailed}){
 const[show,setShow]=useState(false);const T=themeFor(a.type);const I=T.Icon;
 const Wrap=onSelect?motion.button:motion.div;
 return<Wrap type={onSelect?'button':undefined} onClick={onSelect} whileHover={onSelect?{y:-4}:undefined} whileTap={onSelect?{scale:.985}:undefined} transition={{type:'spring',stiffness:300,damping:24}}
  aria-label={onSelect?`Open ${a.type}`:undefined}
  className={`relative block w-full overflow-hidden rounded-3xl p-5 text-left text-white shadow-lift ${onSelect?'cursor-pointer':''} ${active?'ring-2 ring-secondary ring-offset-2 ring-offset-ivory dark:ring-offset-navy-950':''}`} style={{background:T.bg}}>
  <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full blur-2xl" style={{background:T.glow}}/>
  <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.9)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(135deg,#000,transparent_60%)]"/>
  <div className="relative flex items-center justify-between gap-2">
   <span className="flex items-center gap-2 text-[13px] font-medium text-white/80"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15"><I className="h-4 w-4" aria-hidden="true"/></span>{a.type}</span>
   <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-white/10"><span className={`h-1.5 w-1.5 rounded-full ${statusDot(a.status)}`}/>{a.status}</span>
  </div>
  <p className="eyebrow relative mt-6 !text-white/55">Balance</p>
  <p className="num relative mt-1 text-[28px] font-bold leading-none"><Amt v={a.balance}/></p>
  <p className="relative mt-1.5 text-xs text-white/60">Available <Amt v={a.available}/></p>
  <div className="relative mt-5 flex items-center justify-between font-mono text-[13px] tracking-wider text-white/85">
   <span className="flex items-center gap-2"><Wifi className="h-4 w-4 rotate-90 text-white/50" aria-hidden="true"/>{show?a.number:mask(a.number)}</span>
   <span role="button" tabIndex={0} aria-label="Toggle number" className="grid h-8 w-8 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white" onClick={e=>{e.stopPropagation();setShow(!show)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();setShow(s=>!s)}}}>{show?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</span>
  </div>
  {detailed&&<div className="relative mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs text-white/70"><span>IFSC: {a.ifsc}</span><span>Opened: {dt(a.opened)}</span></div>}
 </Wrap>}
