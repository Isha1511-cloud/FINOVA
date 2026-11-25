import {useState} from 'react';import {Link} from 'react-router-dom';import {ShieldAlert,Search,X} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {fraudApi} from '../../services/phase3.js';import {accountService} from '../../services/index.js';
import {Card,Input,Select,Skeleton,EmptyState,ErrorState,PageHeader,Pagination,StatCard,Amt} from '../../components/common/ui.jsx';
import {DevNotice,RiskBadge,AlertStatus,useDebounced} from '../../components/p3/parts.jsx';import {dt,tm,mask} from '../../utils/format.js';
const blank={q:'',risk:'',status:'',from:'',to:''},SIZE=6;

export const AlertCard=({a,acct})=><Card className="space-y-2"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="truncate font-semibold">{a.counterparty}</p><p className="muted text-xs">{a.ref} · {dt(a.date)}, {tm(a.date)}</p></div><div className="flex flex-wrap gap-1"><RiskBadge r={a.risk}/><AlertStatus s={a.status}/></div></div>
 <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="text-lg font-bold"><Amt v={a.amount}/></span><span className="muted">{acct?`${acct.type} ${mask(acct.number)}`:'Account'}</span></div>
 <Link to={`/fraud-alerts/${a.id}`} className="btn-s w-full">View details</Link></Card>;

export default function FraudDashboard(){
 const[f,setF]=useState(blank),[page,setPage]=useState(1);const q=useDebounced(f.q),acc=useAsync(accountService.list);
 const{data,loading,error,reload}=useAsync(()=>fraudApi.list({...f,q,page,pageSize:SIZE}),[q,f.risk,f.status,f.from,f.to,page]);
 const set=k=>e=>{setF({...f,[k]:e.target.value});setPage(1)};const dirty=JSON.stringify(f)!==JSON.stringify(blank),c=data?.counts;
 return<><PageHeader title="Fraud alerts" sub="Transactions on your accounts that the FINOVA fraud service flagged for review."/><DevNotice what="Alerts, risk levels and reasons"/>
 {data?.monitoring&&<p className="muted mb-4 flex gap-2 text-xs"><ShieldAlert className="h-4 w-4 shrink-0"/>{data.monitoring}</p>}
 {c&&<div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Total alerts" value={c.total} icon={ShieldAlert}/><StatCard label="Needs attention" value={c.open} icon={ShieldAlert} tone="text-amber-500"/><StatCard label="High risk" value={c.high} tone="text-rose-500"/><StatCard label="Medium / low" value={`${c.medium} / ${c.low}`}/></div>}
 <Card className="mb-4"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="relative lg:col-span-2"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 sm:top-3"/><Input className="!pl-9" aria-label="Search alerts" placeholder="Search merchant or reference" value={f.q} onChange={set('q')}/></div>
  <Select aria-label="Risk level" value={f.risk} onChange={set('risk')}><option value="">All risk levels</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Select>
  <Select aria-label="Status" value={f.status} onChange={set('status')}><option value="">All statuses</option><option value="new">New</option><option value="under_review">Under review</option><option value="resolved">Resolved</option><option value="closed">Closed</option></Select>
  <div className="flex gap-2"><Input type="date" aria-label="From date" value={f.from} onChange={set('from')}/><Input type="date" aria-label="To date" value={f.to} onChange={set('to')}/></div>
  {dirty&&<button className="btn-s" onClick={()=>{setF(blank);setPage(1)}}><X className="h-4 w-4"/>Clear</button>}</div></Card>
 {loading&&!data?<Skeleton className="h-56"/>:error?<ErrorState message={error} onRetry={reload}/>:!data.items.length?<Card><EmptyState title={dirty?'No alerts match your filters':'No fraud alerts'} hint={dirty?'Try clearing a filter.':'Nothing has been flagged on your accounts.'}/></Card>:<><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{data.items.map(a=><AlertCard key={a.id} a={a} acct={acc.data?.find(x=>x.id===a.accountId)}/>)}</div><Pagination page={page} total={data.total} size={SIZE} onChange={setPage}/></>}</>}
