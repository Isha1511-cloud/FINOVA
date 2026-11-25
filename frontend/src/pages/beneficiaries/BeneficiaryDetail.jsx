import {useState} from 'react';import {Link,useNavigate,useParams} from 'react-router-dom';import {ArrowLeft,Check,X,Clock,RefreshCw,Send,Pencil} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {beneficiaryApi} from '../../services/phase3.js';import {useApp} from '../../context/AppContext.jsx';
import {Card,Skeleton,ErrorState,PageHeader,ConfirmDialog,Spinner,Input} from '../../components/common/ui.jsx';import {DevNotice,BenStatus,Rows,errMsg} from '../../components/p3/parts.jsx';import {mask} from '../../utils/format.js';

const STEPS=[['pending_verification','Verification pending'],['verified','Verification successful'],['activation_pending','Activation pending'],['active','Active']];
const IDX={pending_verification:0,verification_failed:0,verified:1,activation_pending:2,active:3};
const COPY={pending_verification:'The bank is verifying this beneficiary. Check back shortly.',verified:'The bank confirmed the account details. Request activation to enable transfers.',verification_failed:'The bank could not verify these account details. Remove this beneficiary and add it again with corrected details, or retry verification.',activation_pending:'Activation has been requested and is waiting for the bank to confirm.',active:'This beneficiary is active. You can send money.'};

export default function BeneficiaryDetail(){
 const{id}=useParams(),nav=useNavigate(),{toast}=useApp();const{data:b,loading,error,reload}=useAsync(()=>beneficiaryApi.get(id),[id]);
 const[busy,setBusy]=useState(''),[del,setDel]=useState(false),[edit,setEdit]=useState(null);
 const run=async(name,fn,msg)=>{setBusy(name);try{await fn();if(msg)toast(msg);reload()}catch(x){toast(errMsg(x),'err')}finally{setBusy('')}};
 if(loading&&!b)return<Skeleton className="h-72"/>;if(error)return<ErrorState message={error} onRetry={reload}/>;
 const failed=b.status==='verification_failed',cur=IDX[b.status];
 return<><Link to="/beneficiaries" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"><ArrowLeft className="h-4 w-4"/>Beneficiaries</Link>
 <PageHeader title={b.name} sub={b.nickname||b.bank}><BenStatus s={b.status}/></PageHeader><DevNotice what="Verification and activation outcomes (including the bank's response)"/>
 <div className="grid gap-4 lg:grid-cols-2">
  <Card><h2 className="mb-2 font-semibold">Details</h2><Rows rows={[['Name',b.name],['Account number',mask(b.account)],['IFSC',b.ifsc],['Bank',b.bank],['Nickname',edit==null?(b.nickname||'—'):<span className="flex gap-1"><Input aria-label="Nickname" className="!py-1" maxLength={30} value={edit} onChange={e=>setEdit(e.target.value)}/><button className="btn-p !px-2 !py-1" disabled={busy==='nick'} onClick={()=>run('nick',async()=>{await beneficiaryApi.update(b.id,{nickname:edit});setEdit(null)},'Nickname updated')}>Save</button></span>],['Added',b.createdAt]]}/>
   <p className="muted mt-2 text-xs">Only the nickname can be edited. To change bank details, remove this beneficiary and add a new one.</p>
   <div className="mt-4 flex flex-wrap gap-2">{edit==null&&<button className="btn-s" onClick={()=>setEdit(b.nickname||'')}><Pencil className="h-4 w-4"/>Edit nickname</button>}{b.status==='active'&&<Link className="btn-p" to={`/transfers/new?beneficiaryId=${b.id}`}><Send className="h-4 w-4"/>Send money</Link>}<button className="btn-s ml-auto text-rose-600" onClick={()=>setDel(true)}>Remove</button></div></Card>
  <Card><h2 className="mb-3 font-semibold">Verification & activation</h2>
   <ol className="space-y-3">{STEPS.map(([k,l],i)=>{const isFail=failed&&i===0,done=!failed&&i<cur||(b.status==='active'&&i===3),now=!failed&&i===cur&&!done;
    return<li key={k} className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full text-white ${isFail?'bg-rose-500':done?'bg-emerald-500':now?'bg-amber-500':'bg-slate-300 dark:bg-slate-700'}`}>{isFail?<X className="h-4 w-4"/>:done?<Check className="h-4 w-4"/>:<Clock className="h-4 w-4"/>}</span><span className={`text-sm ${now||isFail?'font-semibold':done?'':'muted'}`}>{isFail?'Verification failed':l}</span></li>})}</ol>
   <p role="status" className="mt-4 rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{COPY[b.status]}</p>
   <div className="mt-4 flex flex-wrap gap-2">{['pending_verification','activation_pending'].includes(b.status)&&<button className="btn-s" disabled={!!busy} onClick={()=>run('check',()=>beneficiaryApi.check(b.id))}>{busy==='check'?<Spinner/>:<RefreshCw className="h-4 w-4"/>}Check status</button>}
    {b.status==='verified'&&<button className="btn-p" disabled={!!busy} onClick={()=>run('act',()=>beneficiaryApi.activate(b.id),'Activation requested')}>{busy==='act'&&<Spinner/>}Request activation</button>}
    {failed&&<button className="btn-s" disabled={!!busy} onClick={()=>run('retry',()=>beneficiaryApi.retry(b.id),'Verification restarted')}>{busy==='retry'&&<Spinner/>}Retry verification</button>}</div></Card></div>
 <ConfirmDialog open={del} danger busy={busy==='del'} onClose={()=>setDel(false)} label="Remove" title="Remove beneficiary" message={`Remove ${b.name}? This cannot be undone.`} onConfirm={()=>run('del',async()=>{await beneficiaryApi.remove(b.id);nav('/beneficiaries')},'Beneficiary removed')}/></>}
