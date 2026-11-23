import {useEffect} from 'react';import {Link,useParams} from 'react-router-dom';import {ArrowLeft} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {transferApi} from '../../services/phase3.js';import {accountService} from '../../services/index.js';
import {Card,Skeleton,ErrorState,PageHeader,Spinner} from '../../components/common/ui.jsx';import {StatusBadge} from '../../components/transactions/TxItem.jsx';
import TransferReceipt from '../../components/p3/TransferReceipt.jsx';import {DevNotice,Rows,rupee} from '../../components/p3/parts.jsx';import {dt,tm} from '../../utils/format.js';

export default function TransferDetail(){
 const{id}=useParams();const{data:t,loading,error,reload}=useAsync(()=>transferApi.get(id),[id]),acc=useAsync(accountService.list);
 // Pending transfers are re-checked with the backend; success is shown only once the API says so.
 useEffect(()=>{if(t?.status!=='pending')return;const i=setInterval(reload,5000);return()=>clearInterval(i)},[t?.status]);
 if(loading&&!t)return<Skeleton className="h-72"/>;if(error)return<ErrorState message={error} onRetry={reload}/>;
 const src=acc.data?.find(a=>a.id===t.accountId),dst=acc.data?.find(a=>a.id===t.toAccountId);
 return<><Link to="/transfers/history" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"><ArrowLeft className="h-4 w-4"/>Transfer history</Link>
 <PageHeader title="Transfer status" sub={`Reference ${t.ref}`}><StatusBadge s={t.status}/></PageHeader><DevNotice what="Transfer status"/>
 <div className="grid gap-4 lg:grid-cols-2">
  <div className="space-y-4"><Card>
   <Rows rows={[['Transaction reference',t.ref],['Amount',rupee(t.amount)],['Recipient',t.kind==='own'?'Your own account':t.beneficiaryName],['Initiated',`${dt(t.date)}, ${tm(t.date)}`],['Current status',<StatusBadge key="s" s={t.status}/>]]}/>
   {t.status==='pending'&&<p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" role="status"><Spinner/>Awaiting bank confirmation. This page refreshes automatically.</p>}
   {t.status==='failed'&&<p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10" role="alert"><b>Failure reason:</b> {t.failureReason||'The bank did not provide a reason.'}</p>}
   {t.status==='reversed'&&<p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm dark:bg-indigo-500/10">This transfer was reversed. Check the status updates below for details.</p>}</Card>
   <Card><h2 className="mb-3 font-semibold">Status updates</h2><ol className="space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">{(t.events||[]).map((e,i)=><li key={i} className="relative"><span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-indigo-600"/><div className="flex flex-wrap items-center gap-2"><StatusBadge s={e.status}/><span className="muted text-xs">{dt(e.at)}, {tm(e.at)}</span></div><p className="mt-1 text-sm">{e.note||'—'}</p></li>)}</ol></Card></div>
  <TransferReceipt t={t} source={src} dest={dst}/></div></>}
