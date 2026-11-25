// Premium dashboard building blocks. Presentation only: every figure comes from the
// same services the dashboard already called (accounts, transactions, insights, loans).
import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence,useReducedMotion} from 'framer-motion';
import {AreaChart,Area,XAxis,YAxis,Tooltip,CartesianGrid,ResponsiveContainer,PieChart,Pie,Cell} from 'recharts';
import {Eye,EyeOff,TrendingUp,TrendingDown,ArrowUpRight,Search,Sparkles,Send,UserPlus,Zap,CreditCard,Landmark,Target,Lightbulb,ShieldCheck,ArrowDownLeft,Minus} from 'lucide-react';
import {useApp} from '../../context/AppContext.jsx';
import {useAsync} from '../../hooks/useAsync.js';
import {insightApi} from '../../services/phase3.js';
import {money,dt} from '../../utils/format.js';
import {Card,Amt,Skeleton,EmptyState,ErrorState} from '../common/ui.jsx';
import {CountUp,EASE,Stagger,Rise} from '../common/motion.jsx';
import {TxItem} from '../transactions/TxItem.jsx';
import {COLORS} from '../ai/AIChatMessage.jsx';

const K=v=>v>=100000?`₹${(v/100000).toFixed(1)}L`:v>=1000?`₹${Math.round(v/1000)}k`:`₹${v}`;
const greet=()=>{const h=new Date().getHours();return h<5?'Good evening':h<12?'Good morning':h<17?'Good afternoon':'Good evening'};

/* ---------- Money display with count-up + privacy toggle ---------- */
export const Money=({value,className=''})=>{const{hide}=useApp();
 return hide?<span className={className} aria-label="Amount hidden">••••••••</span>:<CountUp className={className} value={value} format={v=>money(Math.round(v))}/>};

const Delta=({cur,prev,invert})=>{ // invert: lower is better (expenses)
 if(!prev)return null;const d=(cur-prev)/prev*100,up=d>0,flat=Math.abs(d)<.05,good=flat?null:invert?!up:up;const I=flat?Minus:up?TrendingUp:TrendingDown;
 return<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${flat?'bg-white/10 text-white/70':good?'bg-emerald-400/15 text-emerald-300':'bg-amber-400/15 text-amber-300'}`}><I className="h-3 w-3" aria-hidden="true"/>{Math.abs(d).toFixed(1)}%<span className="sr-only"> vs last month</span></span>};

/* ---------- Hero: welcome + balance ---------- */
export function BalanceHero({name='',total=0,available=0,income=0,spend=0,prevIncome=0,prevSpend=0,loading,insightsLoading}){
 const{hide,toggleHide}=useApp();const today=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
 return<section className="hero-surface p-5 sm:p-8" aria-label="Balance overview">
  <motion.span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" animate={{scale:[1,1.12,1],opacity:[.6,.9,.6]}} transition={{duration:9,repeat:Infinity,ease:'easeInOut'}}/>
  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
   <div className="min-w-0">
    <p className="text-sm text-white/60">{today}</p>
    <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{greet()}, {name}</h1>
    <div className="mt-6 flex items-center gap-2"><p className="eyebrow !text-white/55">Total balance</p>
     <button onClick={toggleHide} aria-pressed={hide} aria-label={hide?'Show balances':'Hide balances'} className="grid h-7 w-7 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white">{hide?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button></div>
    <div className="num mt-1 text-[38px] font-bold leading-[1.05] tracking-tight xs:text-5xl sm:text-6xl">{loading?<span className="skeleton inline-block h-12 w-56 !bg-white/10 align-middle"/>:<Money value={total}/>}</div>
    <p className="mt-2 text-sm text-white/60">{loading?' ':<>Available to spend <b className="font-semibold text-white/90"><Amt v={available}/></b></>}</p>
   </div>
   <dl className="grid grid-cols-2 gap-3 sm:min-w-[22rem]">
    {[['Monthly income',income,prevIncome,false,ArrowDownLeft,'text-emerald-300'],['Monthly expenses',spend,prevSpend,true,ArrowUpRight,'text-rose-300']].map(([l,v,p,inv,I,c])=>
     <div key={l} className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
      <dt className="flex items-center gap-1.5 text-xs text-white/60"><I className={`h-3.5 w-3.5 ${c}`} aria-hidden="true"/>{l}</dt>
      <dd className="num mt-1.5 text-lg font-semibold sm:text-xl">{insightsLoading?<span className="skeleton inline-block h-6 w-24 !bg-white/10"/>:<Amt v={v}/>}</dd>
      <div className="mt-2 min-h-[20px]">{!insightsLoading&&<Delta cur={v} prev={p} invert={inv}/>}</div></div>)}
   </dl>
  </div>
 </section>}

/* ---------- Quick actions ---------- */
export function QuickActions(){const{toast}=useApp();
 const A=[['Transfer money',Send,'/transfers/new'],['Add beneficiary',UserPlus,'/beneficiaries?add=1'],['Pay bills',Zap,null],['View cards',CreditCard,'/cards'],['Apply for loan',Landmark,'/loans/apply']];
 const cls='group flex min-w-0 flex-col items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center text-xs font-medium shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lift active:scale-[.98] dark:border-white/[0.07] dark:bg-white/[0.04] dark:hover:border-indigo-400/30 sm:text-[13px]';
 const ic=I=><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-primary ring-1 ring-inset ring-indigo-100 transition-colors group-hover:bg-primary group-hover:text-white dark:bg-indigo-500/10 dark:text-secondary dark:ring-indigo-400/20 dark:group-hover:bg-primary dark:group-hover:text-white"><I className="h-[18px] w-[18px]" aria-hidden="true"/></span>;
 return<nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 xs:grid-cols-3 md:grid-cols-5">{A.map(([l,I,to],n)=>{const c2=cls+(n===A.length-1?' max-xs:col-span-2':'');return to?<Link key={l} to={to} className={c2}>{ic(I)}{l}</Link>:<button key={l} type="button" className={c2} onClick={()=>toast('Bill payments are coming soon.')}>{ic(I)}{l}</button>})}</nav>}

/* ---------- Income vs expense (interactive, filterable) ---------- */
const RANGES=[['week','Weekly'],['month','Monthly'],['year','Yearly']];
const ChartTip=({active,payload,label})=>{const{hide}=useApp();if(!active||!payload?.length)return null;
 return<div className="rounded-2xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lift backdrop-blur dark:border-white/10 dark:bg-navy-800/95"><p className="mb-1.5 font-semibold">{label}</p>
  {payload.map(p=><p key={p.dataKey} className="flex items-center gap-2 py-0.5"><span className="h-2 w-2 rounded-full" style={{background:p.stroke}}/><span className="muted">{p.name}</span><b className="num ml-auto pl-4">{hide?'••••••':money(p.value)}</b></p>)}</div>};

export function TrendCard(){
 const{hide}=useApp();const reduce=useReducedMotion();const[r,setR]=useState('month');
 const t=useAsync(()=>insightApi.trend(r==='week'?{granularity:'week'}:r==='month'?{granularity:'month'}:{granularity:'month',from:`${new Date().getFullYear()-1}-11-01`}),[r]);
 const data=useMemo(()=>{let s=(t.data?.series||[]).map(x=>({label:x.label,income:x.income,expenses:x.expenses}));
  if(r==='week')s=s.slice(-8);if(r==='year'){const i=s.findIndex(x=>x.income||x.expenses);s=i>0?s.slice(i):s}return s},[t.data,r]);
 const tot=data.reduce((a,x)=>({i:a.i+x.income,e:a.e+x.expenses}),{i:0,e:0});
 return<Card className="!p-5 sm:!p-6">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="font-display text-base font-semibold">Income vs expenses</h2><p className="muted mt-0.5 text-xs">{t.loading&&!t.data?'Loading…':<>Net <b className={tot.i-tot.e<0?'text-rose-600':'text-emerald-600'}>{hide?'••••':(tot.i-tot.e<0?'−':'+')+money(Math.abs(tot.i-tot.e))}</b> over this period</>}</p></div>
   <div role="tablist" aria-label="Chart period" className="relative flex rounded-full bg-slate-100 p-1 dark:bg-white/[0.06]">{RANGES.map(([k,l])=><button key={k} role="tab" aria-selected={r===k} onClick={()=>setR(k)} className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${r===k?'text-ink dark:text-white':'text-slate-500 hover:text-ink dark:hover:text-white'}`}>{r===k&&<motion.span layoutId="trend-pill" className="absolute inset-0 rounded-full bg-white shadow-soft dark:bg-white/10" transition={{type:'spring',stiffness:420,damping:34}}/>}<span className="relative">{l}</span></button>)}</div>
  </div>
  <div className="mt-2 flex gap-4 text-xs"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary"/>Income</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent"/>Expenses</span></div>
  <div className={`mt-3 h-60 w-full min-w-0 transition-opacity duration-200 sm:h-72 ${t.loading&&t.data?'opacity-50':''}`}>
   {t.error?<ErrorState message="Unable to load the chart." onRetry={t.reload}/>:t.loading&&!t.data?<Skeleton className="h-full"/>:!data.length?<EmptyState title="No data yet." hint="Totals will appear as you transact."/>:
   <ResponsiveContainer><AreaChart data={data} margin={{top:8,right:4,left:0,bottom:0}}>
    <defs><linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B5FE8" stopOpacity=".28"/><stop offset="1" stopColor="#2B5FE8" stopOpacity="0"/></linearGradient><linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14B8A6" stopOpacity=".26"/><stop offset="1" stopColor="#14B8A6" stopOpacity="0"/></linearGradient></defs>
    <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={.08}/>
    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} tickMargin={8} stroke="#9AA1B1"/>
    <YAxis tickFormatter={hide?()=>'':K} width={hide?8:46} tickLine={false} axisLine={false} fontSize={12} stroke="#9AA1B1"/>
    <Tooltip content={<ChartTip/>} cursor={{stroke:'#8FB0FF',strokeDasharray:'4 4'}}/>
    <Area type="monotone" dataKey="income" name="Income" stroke="#2B5FE8" strokeWidth={2.5} fill="url(#gInc)" isAnimationActive={!reduce} animationDuration={900} animationEasing="ease-out" activeDot={{r:5,strokeWidth:2,stroke:'#fff'}}/>
    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#14B8A6" strokeWidth={2.5} fill="url(#gExp)" isAnimationActive={!reduce} animationDuration={1100} animationEasing="ease-out" activeDot={{r:5,strokeWidth:2,stroke:'#fff'}}/>
   </AreaChart></ResponsiveContainer>}
  </div></Card>}

/* ---------- Spending breakdown ---------- */
export function SpendingBreakdown({data=[]}){const{hide}=useApp();const reduce=useReducedMotion();
 const rows=[...data].sort((a,b)=>b.value-a.value),tot=rows.reduce((s,x)=>s+x.value,0);
 return<Card className="!p-5 sm:!p-6"><h2 className="font-display text-base font-semibold">Spending breakdown</h2>
  {!tot?<EmptyState title="No spending yet." hint="Categories will appear as you spend."/>:<div className="mt-3 flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
   <div className="relative h-40 w-40 shrink-0" role="img" aria-label={'Spending by category: '+rows.map(r=>`${r.name} ${hide?'hidden':money(r.value)}`).join(', ')}>
    <ResponsiveContainer><PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={74} paddingAngle={3} cornerRadius={4} stroke="none" isAnimationActive={!reduce} animationDuration={900}>{rows.map((_,k)=><Cell key={k} fill={COLORS[k%COLORS.length]}/>)}</Pie></PieChart></ResponsiveContainer>
    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="eyebrow !text-[10px]">Spent</p><p className="num text-base font-bold">{hide?'••••':K(tot)}</p></div></div></div>
   <ul className="w-full min-w-0 flex-1 space-y-2.5">{rows.slice(0,5).map((r,k)=><li key={r.name} className="text-xs"><div className="mb-1 flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{background:COLORS[k%COLORS.length]}}/><span className="truncate font-medium">{r.name}</span><span className="num ml-auto muted">{hide?'••••':money(r.value)}</span></div>
    <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><motion.div className="h-full rounded-full" style={{background:COLORS[k%COLORS.length]}} initial={{width:0}} animate={{width:`${r.value/tot*100}%`}} transition={{duration:.9,delay:.1+k*.07,ease:EASE}}/></div></li>)}</ul></div>}
 </Card>}

/* ---------- Savings progress ring + health indicators ---------- */
export function SavingsHealth({income=0,spend=0,goal}){const reduce=useReducedMotion();const{hide}=useApp();
 const rate=income?Math.round((income-spend)/income*100):0,flow=income-spend,pct=Math.min(100,Math.max(0,goal??0)),C=2*Math.PI*34;
 const Row=({l,v,tone})=><div className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm last:border-0 dark:border-white/[0.06]"><span className="muted">{l}</span><b className={`num ${tone||''}`}>{v}</b></div>;
 return<Card className="!p-5 sm:!p-6"><h2 className="font-display text-base font-semibold">Savings &amp; health</h2>
  <div className="mt-4 flex items-center gap-5">
   {goal!=null&&<div className="relative h-24 w-24 shrink-0" role="progressbar" aria-label="Savings goal progress" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><svg viewBox="0 0 80 80" className="-rotate-90"><circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" className="stroke-slate-100 dark:stroke-white/10"/><motion.circle cx="40" cy="40" r="34" fill="none" strokeWidth="7" strokeLinecap="round" stroke="url(#ringG)" strokeDasharray={C} initial={{strokeDashoffset:reduce?C*(1-pct/100):C}} animate={{strokeDashoffset:C*(1-pct/100)}} transition={{duration:1.1,ease:EASE}}/><defs><linearGradient id="ringG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2B5FE8"/><stop offset="1" stopColor="#14B8A6"/></linearGradient></defs></svg>
    <div className="absolute inset-0 grid place-items-center"><div className="text-center"><p className="num text-lg font-bold leading-none">{pct}%</p><p className="muted mt-0.5 text-[10px]">of goal</p></div></div></div>}
   <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{rate>=20?'Healthy savings rate':rate>=0?'Room to save more':'Spending exceeds income'}</p><p className="muted mt-0.5 text-xs leading-relaxed">You are keeping {Math.max(rate,0)}% of this month's income.</p></div></div>
  <div className="mt-3"><Row l="Savings rate" v={`${rate}%`} tone={rate<0?'text-rose-600':'text-emerald-600'}/><Row l="Monthly cash flow" v={<>{flow<0?'−':'+'}<Amt v={Math.abs(flow)}/></>} tone={flow<0?'text-rose-600':'text-emerald-600'}/></div></Card>}

/* ---------- AI insight cards (from the demo insights payload) ---------- */
const TONE={warn:['text-amber-600 bg-amber-50 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',Lightbulb],good:['text-emerald-600 bg-emerald-50 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',ShieldCheck],info:['text-indigo-600 bg-indigo-50 ring-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',Target]};
export function AIInsights({items=[]}){
 if(!items.length)return null;
 return<section aria-label="AI insights" className="ai-surface p-5 sm:p-6">
  <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl"/>
  <div className="relative mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-soft"><Sparkles className="h-4 w-4" aria-hidden="true"/></span><h2 className="font-display text-base font-semibold">FINOVA AI insights</h2><span className="status-dot ml-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true"/><Link to="/ai-agent" className="ml-auto text-xs font-semibold text-primary hover:underline dark:text-secondary">Ask FINOVA AI</Link></div>
  <Stagger className="relative grid gap-3 md:grid-cols-3" gap={.08} delay={.15}>{items.slice(0,3).map(i=>{const[c,I]=TONE[i.tone]||TONE.info;return<Rise key={i.title} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.04]"><span className={`mb-3 grid h-8 w-8 place-items-center rounded-lg ring-1 ring-inset ${c}`}><I className="h-4 w-4" aria-hidden="true"/></span><p className="text-sm font-semibold">{i.title}</p><p className="muted mt-1 text-xs leading-relaxed">{i.body}</p></Rise>})}</Stagger></section>}

/* ---------- Recent transactions: timeline, search and filter ---------- */
const FILTERS=[['all','All'],['credit','Income'],['debit','Expenses']];
export function RecentActivity({loading,error,reload,items=[]}){
 const[q,setQ]=useState(''),[f,setF]=useState('all');
 const rows=useMemo(()=>items.filter(t=>(f==='all'||t.type===f)&&(!q.trim()||`${t.desc} ${t.category}`.toLowerCase().includes(q.trim().toLowerCase()))).slice(0,8),[items,q,f]);
 const groups=useMemo(()=>{const g=new Map();rows.forEach(t=>{const k=dt(t.date);g.set(k,[...(g.get(k)||[]),t])});return[...g]},[rows]);
 return<Card className="!p-5 sm:!p-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-base font-semibold">Recent transactions</h2><Link className="text-sm font-semibold text-primary hover:underline dark:text-secondary" to="/transactions">View all</Link></div>
  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
   <div className="relative flex-1"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true"/><input className="inp !rounded-full !pl-10" aria-label="Filter recent transactions" placeholder="Filter by merchant or category" value={q} onChange={e=>setQ(e.target.value)}/></div>
   <div role="group" aria-label="Transaction type" className="flex rounded-full bg-slate-100 p-1 dark:bg-white/[0.06]">{FILTERS.map(([k,l])=><button key={k} aria-pressed={f===k} onClick={()=>setF(k)} className={`relative flex-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${f===k?'text-ink dark:text-white':'text-slate-500 hover:text-ink dark:hover:text-white'}`}>{f===k&&<motion.span layoutId="act-pill" className="absolute inset-0 rounded-full bg-white shadow-soft dark:bg-white/10" transition={{type:'spring',stiffness:420,damping:34}}/>}<span className="relative">{l}</span></button>)}</div></div>
  <div className="mt-3">
   {loading?<div className="space-y-3 py-2">{[0,1,2,3].map(i=><Skeleton key={i} className="h-14"/>)}</div>:error?<ErrorState message="Unable to load your transactions. Please try again." onRetry={reload}/>:!items.length?<EmptyState title="No transactions available yet." hint="New activity will appear here."/>:!rows.length?<EmptyState title="No matching transactions" hint="Try a different search or filter."/>:
   <AnimatePresence mode="popLayout" initial={false}>{groups.map(([day,list])=><motion.div key={day} layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="relative">
    <p className="eyebrow sticky top-0 z-[1] bg-white/90 py-2 backdrop-blur dark:bg-navy-900/80">{day}</p>
    <div className="space-y-0.5">{list.map(t=><TxItem key={t.id} t={t}/>)}</div></motion.div>)}</AnimatePresence>}
  </div></Card>}
