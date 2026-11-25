import {useNavigate} from 'react-router-dom';
import {Landmark} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAsync} from '../../hooks/useAsync.js';
import {accountService,transactionService,aiService} from '../../services/index.js';
import {loanApi} from '../../services/phase3.js';
import {useApp} from '../../context/AppContext.jsx';
import {Card,Skeleton,ErrorState} from '../../components/common/ui.jsx';
import {Stagger,Rise} from '../../components/common/motion.jsx';
import AccountCard from '../../components/banking/AccountCard.jsx';
import {BalanceHero,QuickActions,TrendCard,SpendingBreakdown,SavingsHealth,AIInsights,RecentActivity} from '../../components/dashboard/Premium.jsx';

// Kept for any consumer that imports the old constant.
export {QUICK} from '../../components/dashboard/quick.js';

export default function Dashboard(){
  const{user}=useApp();const nav=useNavigate();
  const a=useAsync(accountService.list),t=useAsync(()=>transactionService.list({pageSize:30})),i=useAsync(aiService.insights),ln=useAsync(loanApi.list);
  if(a.error)return<ErrorState message="Unable to load your dashboard. Please try again." onRetry={a.reload}/>;
  const D=i.data,m=D?.monthly||[],prev=m[m.length-2]||{};
  const total=a.data?a.data.reduce((s,x)=>s+x.balance,0):0,avail=a.data?a.data.reduce((s,x)=>s+x.available,0):0;
  return<Stagger className="space-y-5 sm:space-y-6" gap={.07}>
    <Rise><BalanceHero name={user?.name?.split(' ')[0]} total={total} available={avail} income={D?.income||0} spend={D?.spend||0} prevIncome={prev.income} prevSpend={prev.spend} loading={a.loading} insightsLoading={i.loading}/></Rise>
    <Rise><QuickActions/></Rise>

    <Rise><section aria-label="Accounts"><div className="mb-3 flex items-end justify-between"><h2 className="font-display text-base font-semibold">Your accounts</h2><Link to="/accounts" className="text-sm font-semibold text-primary hover:underline dark:text-secondary">Manage</Link></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {a.loading?<><Skeleton className="h-44 !rounded-3xl"/><Skeleton className="h-44 !rounded-3xl"/></>:a.data.map(x=><AccountCard key={x.id} a={x} onSelect={()=>nav(`/accounts/${x.id}`)}/>)}
        {!a.loading&&ln.data&&<Link to="/loans" className="card hov group flex min-h-[11rem] flex-col justify-between !p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300"><Landmark className="h-5 w-5" aria-hidden="true"/></span><div><p className="eyebrow">Active loans</p><p className="num mt-1 text-3xl font-bold">{ln.data.totals.active}</p><p className="muted mt-1 text-xs">View repayment schedule →</p></div></Link>}
      </div></section></Rise>

    <Rise><div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-5 sm:space-y-6 lg:col-span-2">
        <TrendCard/>
        <RecentActivity loading={t.loading} error={t.error} reload={t.reload} items={t.data?.items||[]}/>
      </div>
      <div className="min-w-0 space-y-5 sm:space-y-6">
        {i.loading?<><Skeleton className="h-72 !rounded-2xl"/><Skeleton className="h-60 !rounded-2xl"/></>:i.error?<Card><ErrorState message="Unable to load your insights. Please try again." onRetry={i.reload}/></Card>:<>
          <SpendingBreakdown data={D.categories}/>
          <SavingsHealth income={D.income} spend={D.spend} goal={D.goal}/>
          {!!D.alerts?.length&&<Card className="!p-5"><h2 className="font-display text-base font-semibold">Alerts</h2>{D.alerts.map(x=><p key={x} className="mt-2 text-sm text-amber-600">{x}</p>)}</Card>}
        </>}
      </div></div></Rise>

    {!i.loading&&!i.error&&D&&<Rise><AIInsights items={D.insights}/></Rise>}
  </Stagger>}
