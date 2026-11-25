import {useState,useEffect,useRef} from 'react';
import {NavLink,useNavigate,useLocation,useOutlet,Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import {useAsync} from '../../hooks/useAsync.js';
import {notificationApi} from '../../services/phase3.js';
import {LayoutDashboard,Wallet,ArrowLeftRight,Send,Users,FileText,Sparkles,ShieldAlert,Settings,LifeBuoy,CreditCard,Landmark,BarChart3,Target,Eye,EyeOff,Menu,Bell,Search,Sun,Moon,LogOut,X,MoreHorizontal,ChevronRight,CheckCheck} from 'lucide-react';
import {useApp} from '../../context/AppContext.jsx';
import {Logo,Modal,ConfirmDialog,useScrollLock} from '../common/ui.jsx';
import {EASE} from '../common/motion.jsx';

export const NAV=[['/dashboard','Dashboard',LayoutDashboard],['/accounts','Accounts',Wallet],['/transactions','Transactions',ArrowLeftRight],['/transfers','Transfer Money',Send],['/beneficiaries','Beneficiaries',Users],['/statements','Statements',FileText],['/cards','Virtual Cards',CreditCard],['/loans','Loans',Landmark],['/analytics','Analytics',BarChart3],['/ai-agent','AI Banking Agent',Sparkles],['/fraud-alerts','Fraud Alerts',ShieldAlert],['/financial-goals','Financial Goals',Target],['/notifications','Notifications',Bell],['/support','Support',LifeBuoy],['/settings','Settings',Settings]];
const BOTTOM=['/dashboard','/transactions','/transfers','/ai-agent'];
const GROUPS=[
  ['Banking',['/dashboard','/accounts','/transactions','/transfers','/beneficiaries']],
  ['Products',['/statements','/cards','/loans']],
  ['Intelligence',['/analytics','/ai-agent','/fraud-alerts','/financial-goals']],
  ['Account',['/notifications','/support','/settings']],
];
const byPath=Object.fromEntries(NAV.map(n=>[n[0],n]));

const SideLink=({to,label,Icon,onClick,uid})=>(
  <NavLink to={to} onClick={onClick} className={({isActive})=>`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${isActive?'text-white':'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}>
    {({isActive})=><>
      {isActive&&<motion.span layoutId={`nav-pill-${uid}`} className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.12] to-white/[0.04] ring-1 ring-inset ring-white/10" transition={{type:'spring',stiffness:420,damping:36}}/>}
      {isActive&&<motion.span layoutId={`nav-bar-${uid}`} className="absolute -left-4 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-secondary to-accent" transition={{type:'spring',stiffness:420,damping:36}}/>}
      <Icon className={`relative h-[18px] w-[18px] shrink-0 transition-colors ${isActive?'text-secondary':'text-slate-500 group-hover:text-slate-300'}`} aria-hidden="true"/>
      <span className="relative">{label}</span>
    </>}
  </NavLink>
);
const Links=({onClick,uid})=>(
  <nav aria-label="Main" className="space-y-6">
    {GROUPS.map(([g,paths])=><div key={g}><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{g}</p>
      <div className="space-y-0.5">{paths.map(p=>{const[to,l,I]=byPath[p];return<SideLink key={to} to={to} label={l} Icon={I} onClick={onClick} uid={uid}/>})}</div></div>)}
  </nav>
);
const AICta=({onClick})=>(
  <Link to="/ai-agent" onClick={onClick} className="group relative mt-6 block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/30 via-navy-700 to-navy-800 p-4 transition-colors hover:border-white/20">
    <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl" aria-hidden="true"/>
    <span className="relative flex items-center gap-2 text-xs font-semibold text-white"><Sparkles className="h-4 w-4 text-accent" aria-hidden="true"/>FINOVA AI<span className="status-dot ml-auto h-2 w-2 rounded-full bg-accent"/></span>
    <p className="relative mt-2 text-xs leading-relaxed text-slate-400">Ask about spending, balances and transactions.</p>
    <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-secondary">Start a conversation<ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"/></span>
  </Link>
);

const pop={initial:{opacity:0,y:-8,scale:.97},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:-6,scale:.98},transition:{duration:.16,ease:EASE}};

export default function Layout(){
  const{user,signOut,theme,toggleTheme,hide,toggleHide}=useApp();
  const nav=useNavigate();
  const[drawer,setDrawer]=useState(false),[menu,setMenu]=useState(false),[notif,setNotif]=useState(false),[q,setQ]=useState(''),[ms,setMs]=useState(false);
  const init=user?.name?.split(' ').map(x=>x[0]).join('')||'U';
  const{pathname}=useLocation();const outlet=useOutlet();
  useScrollLock(drawer||notif);
  useEffect(()=>{setDrawer(false);setNotif(false);setMenu(false);setMs(false)},[pathname]);
  const nt=useAsync(()=>notificationApi.list({}),[pathname]);
  const unread=nt.data?.unread||0;
  useEffect(()=>{const f=()=>nt.reload();window.addEventListener('finova:notifications',f);return()=>window.removeEventListener('finova:notifications',f)},[]);

  // "/" focuses search, Escape closes popovers.
  const searchRef=useRef(null);
  useEffect(()=>{const k=e=>{
    if(e.key==='Escape'){setMenu(false);setNotif(false);setDrawer(false)}
    if(e.key==='/'&&!e.metaKey&&!e.ctrlKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){e.preventDefault();searchRef.current?.focus()}};
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[]);

  // Idle-session timeout (unchanged behaviour).
  const IDLE=(+import.meta.env.VITE_SESSION_IDLE_MIN||15)*6e4,WARN=6e4;
  const[left,setLeft]=useState(null),[out,setOut]=useState(false);
  const last=useRef(Date.now()),warn=useRef(false);
  const stay=()=>{last.current=Date.now();warn.current=false;setLeft(null)};
  useEffect(()=>{
    const bump=()=>{if(!warn.current)last.current=Date.now()};
    const ev=['click','keydown','touchstart','scroll'];ev.forEach(e=>window.addEventListener(e,bump,true));
    const t=setInterval(()=>{const r=IDLE-(Date.now()-last.current);
      if(r<=0){signOut();nav('/login',{replace:true,state:{expired:true}})}
      else if(r<=WARN){warn.current=true;setLeft(Math.ceil(r/1000))}},1000);
    return()=>{clearInterval(t);ev.forEach(e=>window.removeEventListener(e,bump,true))}},[]);

  const markAll=()=>notificationApi.markAllRead().then(()=>{nt.reload();window.dispatchEvent(new Event('finova:notifications'))}).catch(()=>{});

  return<div className="min-h-dvh">
    {menu&&<div className="fixed inset-0 z-10" aria-hidden="true" onClick={()=>setMenu(false)}/>}

    {/* Desktop sidebar — midnight navy */}
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-white/5 bg-navy-900 px-4 py-5 lg:flex" aria-label="Sidebar">
      <Link to="/dashboard" className="mb-8 block px-3" aria-label="FINOVA home"><Logo light/></Link>
      <Links uid="d"/>
      <div className="mt-auto"><AICta/></div>
    </aside>

    {/* Mobile drawer */}
    <AnimatePresence>{drawer&&<motion.div className="fixed inset-0 z-50 lg:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}}>
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={()=>setDrawer(false)}/>
      <motion.div role="dialog" aria-modal="true" aria-label="Menu" initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{duration:.28,ease:EASE}} className="absolute inset-y-0 left-0 flex w-72 max-w-[86%] flex-col overflow-y-auto overscroll-contain bg-navy-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mb-6 flex items-center justify-between px-2"><Logo light/><button className="grid h-10 w-10 place-items-center rounded-xl text-slate-300 hover:bg-white/10" onClick={()=>setDrawer(false)} aria-label="Close menu"><X className="h-5 w-5"/></button></div>
        <Links uid="m" onClick={()=>setDrawer(false)}/>
        <AICta onClick={()=>setDrawer(false)}/>
      </motion.div></motion.div>}</AnimatePresence>

    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-ivory/80 px-safe pb-3 pt-safe backdrop-blur-xl dark:border-white/5 dark:bg-navy-950/80">
        <div className="mx-auto flex max-w-7xl items-center gap-2 2xl:max-w-[1600px]">
          <button className="btn-i -ml-1 grid shrink-0 place-items-center rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10 lg:hidden" onClick={()=>setDrawer(true)} aria-label="Open menu"><Menu/></button>
          <Link to="/dashboard" className="shrink-0 lg:hidden" aria-label="FINOVA home"><Logo compact/></Link>
          <form className="relative ml-auto hidden max-w-sm flex-1 sm:block lg:ml-0" onSubmit={e=>{e.preventDefault();nav(`/transactions?q=${encodeURIComponent(q)}`)}}>
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true"/>
            <input ref={searchRef} className="inp !rounded-full !pl-10 !pr-10" aria-label="Search transactions" placeholder="Search transactions…" value={q} onChange={e=>setQ(e.target.value)}/>
            <kbd className="pointer-events-none absolute right-3 top-2.5 hidden rounded-md border border-slate-200 px-1.5 text-[11px] font-medium text-slate-400 dark:border-white/10 lg:block">/</kbd>
          </form>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button className="btn-s btn-i !p-2 sm:hidden" onClick={()=>setMs(!ms)} aria-expanded={ms} aria-label="Search transactions"><Search className="h-4 w-4"/></button>
            <button className="btn-s btn-i !p-2" onClick={toggleHide} aria-pressed={hide} aria-label={hide?'Show balances':'Hide balances'}>{hide?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
            <button className="btn-s btn-i hidden !p-2 sm:inline-flex" onClick={toggleTheme} aria-label="Toggle theme">{theme==='dark'?<Sun className="h-4 w-4"/>:<Moon className="h-4 w-4"/>}</button>
            <button className="btn-s btn-i relative !p-2" onClick={()=>{setNotif(true);setMenu(false)}} aria-label="Notifications" aria-haspopup="dialog">
              <Bell className="h-4 w-4"/>
              {unread>0&&<span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-ivory dark:ring-navy-950" aria-label={`${unread} unread notifications`}>{unread}</span>}
            </button>
            <div className="sm:relative">
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-sm font-bold text-white ring-2 ring-white shadow-soft transition hover:scale-105 active:scale-95 dark:ring-white/10" onClick={()=>{setMenu(!menu);setNotif(false)}} aria-label="Profile menu" aria-expanded={menu}>{init}</button>
              <AnimatePresence>{menu&&<motion.div {...pop} className="card absolute inset-x-3 top-full z-30 mt-2 space-y-1 !p-2 text-sm shadow-lift sm:inset-x-auto sm:right-0 sm:w-60 sm:!p-2">
                <div className="px-3 py-2"><p className="font-semibold">{user?.name}</p><p className="muted truncate text-xs">{user?.email}</p></div>
                <div className="my-1 h-px bg-slate-100 dark:bg-white/10"/>
                <Link to="/settings" onClick={()=>setMenu(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition hover:bg-slate-100 dark:hover:bg-white/10 sm:py-2"><Settings className="h-4 w-4 text-slate-400"/>Settings</Link>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 transition hover:bg-slate-100 dark:hover:bg-white/10 sm:hidden" onClick={()=>{toggleTheme();setMenu(false)}}>{theme==='dark'?<Sun className="h-4 w-4 text-slate-400"/>:<Moon className="h-4 w-4 text-slate-400"/>}{theme==='dark'?'Light mode':'Dark mode'}</button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 sm:py-2" onClick={()=>{setMenu(false);setOut(true)}}><LogOut className="h-4 w-4"/>Logout</button>
              </motion.div>}</AnimatePresence>
            </div>
          </div>
        </div>
        <AnimatePresence>{ms&&<motion.form initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden sm:hidden" onSubmit={e=>{e.preventDefault();setMs(false);nav(`/transactions?q=${encodeURIComponent(q)}`)}}>
          <div className="relative mt-2"><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"/><input autoFocus enterKeyHint="search" className="inp !rounded-full !pl-10" aria-label="Search transactions" placeholder="Search transactions…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        </motion.form>}</AnimatePresence>
      </header>

      <main className="main-pb mx-auto w-full max-w-7xl px-safe pt-5 sm:pt-8 2xl:max-w-[1600px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0,transition:{duration:.32,ease:EASE}}} exit={{opacity:0,y:-4,transition:{duration:.1}}}>{outlet}</motion.div>
        </AnimatePresence>
      </main>
    </div>

    {/* Notification panel — slides in from the right */}
    <AnimatePresence>{notif&&<motion.div className="fixed inset-0 z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}}>
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={()=>setNotif(false)}/>
      <motion.aside role="dialog" aria-modal="true" aria-label="Notifications" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{duration:.3,ease:EASE}} className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-navy-800">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] dark:border-white/10">
          <h2 className="font-display text-lg font-bold">Notifications</h2>{unread>0&&<span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600">{unread} new</span>}
          <div className="ml-auto flex items-center gap-1">{unread>0&&<button className="btn-s !px-3 !py-1.5 text-xs" onClick={markAll}><CheckCheck className="h-3.5 w-3.5"/>Mark all read</button>}<button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10" onClick={()=>setNotif(false)} aria-label="Close notifications"><X className="h-5 w-5"/></button></div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-3">
          {!(nt.data?.items||[]).length?<div className="grid h-full place-items-center text-center"><div><span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><Bell className="h-6 w-6"/></span><p className="font-display font-semibold">You are all caught up</p><p className="muted text-sm">New alerts will appear here.</p></div></div>
            :<ul className="space-y-1">{nt.data.items.slice(0,8).map((n,i)=><motion.li key={n.id} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:.05+i*.03,duration:.3,ease:EASE}}>
              <Link onClick={()=>{setNotif(false);if(!n.read)notificationApi.markRead(n.id).then(nt.reload)}} to={n.link} className="flex gap-3 rounded-2xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read?'bg-transparent':'bg-rose-500'}`} aria-hidden="true"/>
                <span className={`min-w-0 ${n.read?'muted':''}`}><b className="block text-sm font-semibold text-ink dark:text-white">{n.title}</b><span className="mt-0.5 block text-xs leading-relaxed">{n.body}</span></span>
              </Link></motion.li>)}</ul>}
        </div>
        <div className="border-t border-slate-100 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] dark:border-white/10"><Link to="/notifications" onClick={()=>setNotif(false)} className="btn-s w-full">View all notifications</Link></div>
      </motion.aside></motion.div>}</AnimatePresence>

    {/* Mobile bottom nav */}
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200/70 bg-white/90 px-inset pb-safe pt-1.5 backdrop-blur-xl dark:border-white/5 dark:bg-navy-900/90 lg:hidden" aria-label="Primary">
      {NAV.filter(n=>BOTTOM.includes(n[0])).map(([to,l,I])=><NavLink key={to} to={to} className={({isActive})=>`relative flex min-w-0 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium transition-colors ${isActive?'text-primary dark:text-secondary':'muted'}`}>{({isActive})=><>
        {isActive&&<motion.span layoutId="bottom-dot" className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-primary dark:bg-secondary" transition={{type:'spring',stiffness:400,damping:34}}/>}
        <I className="h-5 w-5" aria-hidden="true"/><span className="max-w-full truncate">{l.split(' ')[0]}</span></>}</NavLink>)}
      <button onClick={()=>setDrawer(true)} className="muted flex min-w-0 flex-col items-center gap-0.5 py-1.5 text-[10px] font-medium"><MoreHorizontal className="h-5 w-5"/>More</button>
    </nav>

    <ConfirmDialog open={out} title="Log out" message="Are you sure you want to log out?" label="Logout" danger onConfirm={()=>{signOut();nav('/login',{replace:true})}} onClose={()=>setOut(false)}/>
    <Modal open={left!=null} onClose={stay} title="Your session is about to expire"><p className="muted mb-5 text-sm">For your security you will be logged out in {left} seconds due to inactivity.</p><div className="flex justify-end gap-2"><button className="btn-s" onClick={()=>{signOut();nav('/login')}}>Logout</button><button className="btn-p" onClick={stay}>Stay signed in</button></div></Modal>
  </div>}
