import {Link} from 'react-router-dom';
import {ShieldCheck,Sparkles,Lock,ArrowRight,Fingerprint,CheckCircle2,TrendingUp,Send} from 'lucide-react';
import {Logo} from '../components/common/ui.jsx';
import {useApp} from '../context/AppContext.jsx';

const STEPS=[
  ['Open your account','Register in minutes. Your accounts, cards and activity come together on one dashboard.'],
  ['Ask in plain language','Questions such as “How much did I spend on food?” get a clear answer, with the numbers behind it.'],
  ['Review and confirm','FINOVA can suggest an action, but nothing moves until you review and approve it.'],
];
const TRUST=[
  [ShieldCheck,'Backend-verified','Every sensitive action is validated and confirmed on the server.'],
  [Lock,'Masked by default','Account and card numbers stay hidden until you choose to reveal them.'],
  [Fingerprint,'AI with guardrails','The assistant works within read and preview boundaries and needs your approval to act.'],
];
const BARS=[38,58,46,72,54,86,68,100];

export default function Landing(){
  const {user}=useApp();
  return(
  <div className="lp min-h-dvh overflow-x-clip font-sans antialiased">
    {/* Hero */}
    <section className="relative overflow-hidden pb-20 sm:pb-28">
      <div className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(1100px 620px at 72% -12%, rgba(59,130,246,.34), transparent 66%), radial-gradient(760px 520px at -6% 38%, rgba(37,99,235,.2), transparent 70%), radial-gradient(600px 400px at 100% 90%, rgba(34,211,238,.08), transparent 70%)'}}/>
      <div className="lp-grid pointer-events-none absolute inset-0"/>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5 2xl:max-w-7xl">
        <Link to="/" aria-label="FINOVA home"><Logo blue compact/></Link>
        <nav className="hidden gap-9 text-sm font-medium text-[#b6c9ee] sm:flex" aria-label="Sections">
          <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="#security" className="transition hover:text-white">Security</a>
        </nav>
        <div className="flex gap-2">
          {user?<Link to="/dashboard" className="lp-btn !px-5 !py-2.5">Dashboard</Link>:<>
            <Link to="/login" className="lp-ghost !px-5 !py-2.5">Login</Link>
            <Link to="/register" className="lp-btn !px-5 !py-2.5">Register</Link></>}
        </div>
      </header>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 md:grid-cols-[1.05fr_1fr] md:pt-20 2xl:max-w-7xl">
        <div className="animate-fade">
          <span className="lp-chip inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#7dd3fc]"/>Banking + AI, reimagined
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-6xl">
            Banking that <span className="lp-grad">understands</span> your money.
          </h1>
          <p className="lp-text mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
            Everyday banking with an intelligent assistant that explains your spending, flags unusual activity and answers your questions instantly.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="lp-btn !px-7 !py-3.5">Open an account<ArrowRight className="h-4 w-4"/></Link>
            <Link to="/login" className="lp-ghost !px-7 !py-3.5">Login</Link>
          </div>
          <ul className="lp-text mt-9 flex flex-wrap gap-x-7 gap-y-2 text-sm">
            {['No hidden fees','Instant insights','Bank-grade security'].map(t=><li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5eead4]"/>{t}</li>)}
          </ul>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto w-full max-w-md pb-14 md:max-w-none">
          <div className="lp-panel rounded-[1.75rem] p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#9fb4de]">Total balance</p>
              <span className="lp-chip rounded-full px-2.5 py-0.5 text-[11px] font-semibold">Across 2 accounts</span>
            </div>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-white sm:text-[2.6rem]">₹3,60,950</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5eead4]"><TrendingUp className="h-4 w-4"/>Up 8.4% this month</p>
            <svg viewBox="0 0 300 96" className="mt-6 h-28 w-full" role="img" aria-label="Balance trend, illustrative">
              <defs><linearGradient id="lpa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b82f6" stopOpacity=".38"/><stop offset="1" stopColor="#3b82f6" stopOpacity="0"/></linearGradient><linearGradient id="lpl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#60a5fa"/><stop offset="1" stopColor="#22d3ee"/></linearGradient></defs>
              {[24,48,72].map(y=><line key={y} x1="0" x2="300" y1={y} y2={y} stroke="rgba(148,180,255,.1)" strokeDasharray="2 6"/>)}
              <path d="M0 74 C30 70 48 80 80 58 S130 50 160 40 S220 44 250 22 S285 14 300 10 V96 H0Z" fill="url(#lpa)"/>
              <path d="M0 74 C30 70 48 80 80 58 S130 50 160 40 S220 44 250 22 S285 14 300 10" fill="none" stroke="url(#lpl)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="250" cy="22" r="4.5" fill="#fff" stroke="#3b82f6" strokeWidth="2.5"/>
            </svg>
            <div className="mt-2 flex justify-between text-[11px] text-[#6f86b8]">{['Jun','Jul','Aug','Sep','Oct','Nov'].map(m=><span key={m}>{m}</span>)}</div>
          </div>

          <div className="lp-panel absolute -bottom-0 right-0 w-[78%] rounded-2xl p-4 text-sm animate-float-slow motion-reduce:animate-none">
            <p className="flex items-center gap-2 font-semibold text-white"><span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#22d3ee]"><Sparkles className="h-3.5 w-3.5 text-white"/></span>FINOVA AI</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#b6c9ee]">You spent ₹4,850 on food this month, 12% less than last month.</p>
          </div>
          <div className="lp-panel absolute -left-2 bottom-6 hidden items-center gap-3 rounded-2xl py-3 pl-3 pr-5 sm:flex animate-float motion-reduce:animate-none">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Send className="h-4 w-4 -rotate-45"/></span>
            <div><p className="text-xs text-[#9fb4de]">Salary credited</p><p className="font-semibold text-[#5eead4]">+₹85,000</p></div>
          </div>
          <p className="absolute -bottom-1 left-1 text-[10px] text-[#6f86b8] sm:hidden">Illustrative preview</p>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section id="how-it-works" className="relative mx-auto max-w-6xl scroll-mt-6 px-5 py-16 sm:py-24 2xl:max-w-7xl">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="lp-chip inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest">How it works</span>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-[2.6rem]">Your money, explained in a conversation</h2>
          <p className="lp-text mt-4 max-w-md text-base leading-relaxed">No menus to hunt through. Ask a question, read the answer, and stay in control of every decision.</p>
          <ol className="mt-9 space-y-6">
            {STEPS.map(([t,d],i)=><li key={t} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#60a5fa]/40 bg-[#3b82f6]/10 font-display text-sm font-semibold text-[#93c5fd]">{i+1}</span>
              <div><h3 className="font-display text-lg font-semibold text-white">{t}</h3><p className="lp-text mt-1 text-sm leading-relaxed">{d}</p></div></li>)}
          </ol>
        </div>

        <div className="lp-panel rounded-[1.75rem] p-5 sm:p-7" role="img" aria-label="Example conversation with FINOVA AI, illustrative">
          <div className="flex justify-end"><p className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#3b82f6] to-[#2563eb] px-4 py-2.5 text-sm text-white shadow-lg shadow-blue-950/50">How much did I spend on food this month?</p></div>
          <div className="mt-4 flex gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#22d3ee]"><Sparkles className="h-4 w-4 text-white"/></span>
            <div className="min-w-0 flex-1 space-y-3 rounded-2xl rounded-tl-md border border-[#7aa7ff]/15 bg-white/[.04] px-4 py-3.5 text-sm text-[#d6e4ff]">
              <p>You spent <b className="text-white">₹4,850</b> on food this month. That is 12% lower than last month.</p>
              <div className="space-y-2.5">
                {[['Groceries',62,'#60a5fa'],['Dining out',28,'#22d3ee'],['Delivery',10,'#a5b4fc']].map(([l,v,c])=><div key={l}><div className="flex justify-between text-xs text-[#9fb4de]"><span>{l}</span><span>{v}%</span></div><div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full" style={{width:v+'%',background:c}}/></div></div>)}
              </div>
              <p className="rounded-xl border border-[#7aa7ff]/15 bg-[#3b82f6]/10 px-3 py-2 text-xs text-[#bcd4ff]">Suggested: set a monthly food budget. Nothing changes until you confirm.</p>
            </div>
          </div>
          <div className="mt-5 flex items-end gap-1.5" aria-hidden="true">{BARS.map((h,i)=><span key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#2563eb]/10 to-[#60a5fa]/60" style={{height:h*.34+'px'}}/>)}</div>
        </div>
      </div>
    </section>

    {/* Security */}
    <section id="security" className="mx-auto max-w-6xl scroll-mt-6 px-5 pb-16 sm:pb-24 2xl:max-w-7xl">
      <div className="lp-panel relative overflow-hidden rounded-[2rem] p-7 sm:rounded-[2.5rem] sm:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#3b82f6]/25 blur-3xl"/>
        <div className="relative">
          <span className="lp-chip inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest">Bank-grade security</span>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Security you can completely trust</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TRUST.map(([I,t,d])=><div key={t} className="rounded-2xl border border-[#7aa7ff]/15 bg-white/[.035] p-6 transition duration-300 hover:border-[#7aa7ff]/40 hover:bg-[#3b82f6]/[.07]">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-[#60a5fa]/30 bg-[#3b82f6]/10"><I className="h-5 w-5 text-[#7dd3fc]"/></span>
              <h3 className="font-display text-lg font-semibold text-white">{t}</h3><p className="lp-text mt-2 text-sm leading-relaxed">{d}</p></div>)}
          </div>
        </div>
      </div>
    </section>

    {/* Call to action */}
    <section className="mx-auto max-w-4xl px-5 pb-20 text-center sm:pb-28">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">Ready to bank smarter?</h2>
      <p className="lp-text mx-auto mt-4 max-w-md text-base">Open an account and see your money explained, not just listed.</p>
      <Link to="/register" className="lp-btn mt-8 !px-8 !py-3.5">Create free account<ArrowRight className="h-4 w-4"/></Link>
    </section>

    <footer className="border-t border-[#7aa7ff]/10 py-7 text-center text-sm text-[#6f86b8]">© 2026 FINOVA. Intelligent Banking Prototype.</footer>
  </div>);
}
