import {Link} from 'react-router-dom';
import {ShieldCheck,Sparkles,Lock,BarChart3,Send,Bell,ArrowRight,Fingerprint,Zap,CheckCircle2,TrendingUp} from 'lucide-react';
import {Logo} from '../components/common/ui.jsx';
import {useApp} from '../context/AppContext.jsx';

const F = [
  [Sparkles,'FINOVA AI','Ask about your money in plain language and get instant answers.','from-primary to-secondary','ai'],
  [BarChart3,'Smart insights','Spending trends, savings and month-over-month comparisons.','from-accent to-secondary','insights'],
  [Bell,'Explainable fraud alerts','See exactly why a transaction was flagged. You stay in control.','from-error to-orange-400','fraud'],
  [Send,'Secure transfers','Review and confirm every transfer, validated by the bank.','from-success to-accent','transfers']
];

const S = [
  ['2M+','Happy customers'],
  ['₹50Cr+','Moved securely'],
  ['99.9%','Uptime'],
  ['24/7','AI assistance']
];

export default function Landing() {
  const {user} = useApp();

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="grid-bg relative overflow-hidden bg-gradient-to-br from-[#082B57] via-primary to-[#0B8A9A] pb-24 text-white sm:pb-32">
        {/* Animated dynamic gradient orbs */}
        <div className="absolute -left-20 top-10 h-[28rem] w-[28rem] rounded-full bg-secondary/35 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute -right-20 top-32 h-[30rem] w-[30rem] rounded-full bg-accent/40 blur-3xl animate-blob-slow pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl animate-pulse-glow pointer-events-none" />

        <header className="relative mx-auto flex max-w-6xl 2xl:max-w-7xl items-center justify-between px-4 py-5 animate-fade-down">
          <Logo light compact className="transition hover:scale-105" />
          <nav className="hidden gap-8 text-sm font-medium text-blue-100 sm:flex">
            <a href="#features" className="transition hover:text-white hover:-translate-y-0.5">Features</a>
            <a href="#security" className="transition hover:text-white hover:-translate-y-0.5">Security</a>
          </nav>
          <div className="flex gap-2">
            {user ? (
              <Link to="/dashboard" className="btn bg-white text-primary shadow-lg hover:-translate-y-1 hover:shadow-xl transition">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn border border-white/30 text-white hover:bg-white/10 hover:-translate-y-0.5 transition">Login</Link>
                <Link to="/register" className="btn bg-white text-primary shadow-lg hover:-translate-y-1 hover:shadow-xl transition">Register</Link>
              </>
            )}
          </div>
        </header>

        <div className="relative mx-auto grid max-w-6xl 2xl:max-w-7xl items-center gap-10 px-4 pt-8 md:grid-cols-2 md:gap-12 md:pt-16">
          {/* Left Column Copy */}
          <div className="animate-fade">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-lg transition hover:scale-105">
              <Sparkles className="h-4 w-4 text-[#5EEAD4] animate-spin" style={{animationDuration: '8s'}} />
              Banking + AI, reimagined
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Banking that{' '}
              <span className="bg-gradient-to-r from-secondary via-[#5EEAD4] to-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                understands
              </span>{' '}
              your money.
            </h1>
            <p className="mt-5 max-w-lg text-base text-blue-100 sm:text-lg leading-relaxed">
              Everyday banking with an intelligent assistant that explains your spending, spots unusual activity and answers your questions instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-p !bg-white !text-primary shadow-2xl shadow-blue-900/40 hover:-translate-y-1 hover:shadow-blue-900/60 !px-7 !py-3.5 text-base font-bold transition">
                Open an account
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/login" className="btn glass !px-6 !py-3.5 text-white hover:bg-white/20 hover:-translate-y-0.5 transition text-base font-medium">
                Login
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100">
              {['No hidden fees', 'Instant insights', 'Bank-grade security'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 transition hover:text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#5EEAD4]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column Floating 3D Cards */}
          <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[420px]">
            {/* Main Balance Card */}
            <div className="absolute left-0 right-6 top-4 -rotate-2 rounded-3xl bg-gradient-to-br from-white/30 via-white/20 to-white/5 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-2xl border border-white/30 animate-float transition-all hover:scale-105">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-100">Total balance</p>
                <span className="h-2.5 w-2.5 rounded-full bg-[#5EEAD4] animate-ping" />
              </div>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">₹3,60,950</p>
              <div className="mt-6 flex h-20 items-end gap-2">
                {[35, 65, 45, 80, 55, 95, 70, 100].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: h + '%' }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-secondary via-[#5EEAD4] to-white/90 shadow-sm transition-all duration-500 hover:brightness-125"
                  />
                ))}
              </div>
            </div>

            {/* AI Assistant Insight Bubble */}
            <div className="glass absolute bottom-16 right-0 w-68 rotate-3 rounded-2xl p-4 text-sm shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-float-reverse transition-all hover:rotate-0 hover:scale-105 border border-white/40">
              <p className="flex items-center gap-1.5 font-bold text-white">
                <Sparkles className="h-4 w-4 text-[#5EEAD4]" />
                FINOVA AI
              </p>
              <p className="mt-1 text-xs text-blue-50 leading-relaxed">
                You spent ₹4,850 on food this month. That is 12% lower than last month!
              </p>
            </div>

            {/* Salary Credited Micro Badge */}
            <div className="absolute -bottom-2 left-2 flex items-center gap-3 rounded-2xl bg-white p-3.5 pr-6 text-ink shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-float-slow transition-all hover:scale-105">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-success shadow-inner">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-slate-500 font-medium">Salary credited</p>
                <p className="font-extrabold text-success text-base">+₹85,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 animate-scale-up">
        <div className="card grid grid-cols-2 gap-4 !p-6 shadow-[0_20px_50px_rgba(21,101,192,0.12)] md:grid-cols-4 border border-white/90">
          {S.map(([a, b], idx) => (
            <div key={b} className={`text-center transition-all hover:-translate-y-1 duration-300 stagger-${idx + 1}`}>
              <p className="bg-gradient-to-r from-primary via-indigo-600 to-accent bg-clip-text text-3xl sm:text-4xl font-extrabold text-transparent">
                {a}
              </p>
              <p className="muted mt-1 text-sm font-medium">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-6xl 2xl:max-w-7xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
            Core Features
          </span>
          <h2 className="mt-3 text-center text-3xl font-extrabold sm:text-4xl tracking-tight">
            Everything you need in one place
          </h2>
          <p className="muted mx-auto mt-3 max-w-xl text-base">
            Engineered for high performance, maximum security, and delightful daily financial management.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {F.map(([I, t, d, g, k], idx) => (
            <Link
              key={t}
              to={`/features/${k}`}
              className={`card hov group block p-6 transition-all duration-300 stagger-${idx + 1}`}
            >
              <span className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${g} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <I className="h-7 w-7" />
              </span>
              <p className="text-lg font-bold group-hover:text-primary transition">{t}</p>
              <p className="muted mt-2 text-sm leading-relaxed">{d}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:translate-x-1.5">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Security Showcase */}
      <section id="security" className="mx-auto max-w-6xl 2xl:max-w-7xl px-4 pb-16 sm:pb-24">
        <div className="grid-bg relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#082B57] via-[#0B3D7A] to-primary p-7 text-white sm:rounded-[2.5rem] sm:p-14 shadow-2xl">
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-blob pointer-events-none" />
          <div className="relative">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#5EEAD4]">
              Bank-Grade Security
            </span>
            <h2 className="mt-3 text-2xl font-extrabold sm:text-4xl tracking-tight">
              Security you can completely trust
            </h2>
            <div className="mt-8 grid gap-5 sm:gap-6 md:grid-cols-3">
              {[
                [ShieldCheck, 'Backend-verified', 'Every sensitive action is strictly validated and confirmed server-side.'],
                [Lock, 'Masked by default', 'Account and card numbers stay protected and concealed until explicitly revealed.'],
                [Fingerprint, 'AI with guardrails', 'The assistant operates with strict read/preview boundaries and requires human authorization.']
              ].map(([I, t, d]) => (
                <div key={t} className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:border-white/50">
                  <I className="mb-4 h-8 w-8 text-[#5EEAD4]" />
                  <p className="text-lg font-bold">{t}</p>
                  <p className="mt-2 text-sm text-blue-100 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:pb-24">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-accent dark:bg-slate-800 shadow-md animate-bounce" style={{animationDuration: '3s'}}>
          <Zap className="h-7 w-7 text-accent" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to bank smarter?</h2>
        <p className="muted mx-auto mt-2 max-w-md text-base">
          Join thousands of members enjoying AI-powered personal financial intelligence today.
        </p>
        <Link to="/register" className="btn-p mt-6 !px-8 !py-3.5 text-base font-bold shadow-xl hover:scale-105 transition">
          Create free account <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <footer className="muted border-t border-slate-200 py-6 text-center text-sm dark:border-slate-800">
        © 2026 FINOVA. Intelligent Banking Prototype.
      </footer>
    </div>
  );
}
