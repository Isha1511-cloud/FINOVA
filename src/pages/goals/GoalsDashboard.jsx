import {Link} from 'react-router-dom';import {Plus,Target,Flag,PiggyBank,CalendarDays} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {goalApi} from '../../services/phase3.js';
import {Card,PageHeader,Skeleton,ErrorState,EmptyState,StatCard} from '../../components/common/ui.jsx';import {DevNotice,GoalTabs,GoalStatus,ProgressBar,Tip,rupee} from '../../components/p3/parts.jsx';import {dt} from '../../utils/format.js';
export default function GoalsDashboard(){
 const{data,loading,error,reload}=useAsync(goalApi.list);
 return<><PageHeader title="Financial goals" sub="Track what you are saving for."><Link className="btn-p" to="/financial-goals/new"><Plus className="h-4 w-4"/>Create goal</Link></PageHeader><GoalTabs/><DevNotice what="Goals and saved amounts"/>
 {loading&&!data?<Skeleton className="h-64"/>:error?<ErrorState message={error} onRetry={reload}/>:<>
  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><StatCard label="Total goals" value={data.totals.count} icon={Flag}/><StatCard label="Total target" value={rupee(data.totals.target)} icon={Target}/><StatCard label="Recorded progress" value={`${rupee(data.totals.saved)} (${data.totals.target?Math.round(data.totals.saved/data.totals.target*100):0}%)`} icon={PiggyBank}/></div>
  {!data.items.length?<Card><EmptyState title="No goals yet" hint="Create a goal such as a laptop, education or an emergency fund."/><div className="text-center"><Link className="btn-p" to="/financial-goals/new">Create your first goal</Link></div></Card>:
   <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{data.items.map(g=><Link key={g.id} to={`/financial-goals/${g.id}`} className="card hov block"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-semibold">{g.name}</p><p className="muted text-xs">{g.category}</p></div><GoalStatus s={g.status}/></div>
    <p className="mt-3 text-sm"><b>{rupee(g.saved)}</b> <span className="muted">of {rupee(g.target)}</span></p><div className="my-2"><ProgressBar pct={g.pct} label={`${g.name} progress`} tone={g.status==='completed'?'bg-emerald-500':g.status==='behind'||g.status==='overdue'?'bg-amber-500':'bg-indigo-600'}/></div>
    <div className="flex justify-between text-xs"><span>{g.pct}%</span><span className="muted flex items-center gap-1"><CalendarDays className="h-3 w-3"/>{dt(g.targetDate)}</span></div></Link>)}</div>}
  <Tip>{data.note}</Tip></>}</>}
