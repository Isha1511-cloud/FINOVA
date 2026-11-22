import {useRef,useState} from 'react';import {Link,useSearchParams} from 'react-router-dom';import {CheckCircle2,XCircle,Clock} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {accountService} from '../../services/index.js';import {transferApi,beneficiaryApi} from '../../services/phase3.js';
import {Card,Field,Input,Select,Spinner,Skeleton,PageHeader,ErrorState} from '../../components/common/ui.jsx';
import {DevNotice,Seg,Rows,newKey,errMsg,rupee} from '../../components/p3/parts.jsx';import {mask} from '../../utils/format.js';

export default function TransferNew(){
 const[sp]=useSearchParams();const acc=useAsync(accountService.list),ben=useAsync(beneficiaryApi.list),lim=useAsync(transferApi.limits);
 const[mode,setMode]=useState(sp.get('mode')==='own'?'own':'beneficiary');
 const[f,setF]=useState({sourceId:'',destId:'',beneficiaryId:sp.get('beneficiaryId')||'',amount:sp.get('amount')||'',description:''}),[err,setErr]=useState({}),[step,setStep]=useState('form'),[busy,setBusy]=useState(false),[res,setRes]=useState(null),[pv,setPv]=useState({}),[pvBusy,setPvBusy]=useState(false);
 const key=useRef(newKey());
 if(acc.loading||ben.loading)return<Skeleton className="h-72"/>;
 if(acc.error)return<ErrorState message={acc.error} onRetry={acc.reload}/>;
 const accounts=acc.data,source=accounts.find(a=>a.id===(f.sourceId||accounts[0]?.id)),sid=source?.id,dest=accounts.find(a=>a.id===f.destId),b=(ben.data||[]).find(x=>x.id===f.beneficiaryId),amt=Number(f.amount);
 const usable=(ben.data||[]).filter(x=>x.status==='active');
 const validate=()=>{const e={};
  if(mode==='own'){if(!f.destId)e.destId='Choose a destination account';else if(f.destId===sid)e.destId='Source and destination accounts must be different'}
  else if(!b)e.beneficiaryId='Choose a beneficiary';else if(b.status!=='active')e.beneficiaryId='This beneficiary is not active yet';
  if(!(amt>0))e.amount='Enter an amount greater than zero';else if(amt>source.available)e.amount=`Amount exceeds available balance (${rupee(source.available)})`;
  else if(lim.data&&amt>lim.data.perTransfer)e.amount=`Amount exceeds the per-transfer limit (${rupee(lim.data.perTransfer)})`;
  else if(lim.data&&amt+lim.data.usedToday>lim.data.daily)e.amount='This would exceed your daily transfer limit';
  if(f.description.length>60)e.description='Keep the description under 60 characters';setErr(e);return!Object.keys(e).length};
 const review=async()=>{if(!validate())return;setPvBusy(true);
  try{setPv(mode==='beneficiary'?await transferApi.preview({mode,sourceId:sid,beneficiaryId:f.beneficiaryId,amount:amt}):{})}catch(x){setPv({})}   // no quote = no fee shown
  finally{setPvBusy(false);setStep('review')}};
 const submit=async()=>{if(busy)return;setBusy(true);
  try{const r=await transferApi.create({mode,sourceId:sid,destId:f.destId,beneficiaryId:f.beneficiaryId,amount:amt,description:f.description,idempotencyKey:key.current});setRes({ok:true,r})}
  catch(x){setRes({ok:false,msg:errMsg(x)});key.current=newKey()}finally{setBusy(false)}};
 const reset=()=>{setRes(null);setStep('form');setF({...f,amount:'',description:''});key.current=newKey()};

 if(res){const st=res.ok?res.r.status:'failed',t=res.r?.transfer;
  const[I,c,title,msg]=!res.ok?[XCircle,'text-rose-500','Transfer failed',res.msg]:st==='completed'?[CheckCircle2,'text-emerald-500','Transfer completed',`${rupee(amt)} was confirmed by the bank.`]:[Clock,'text-amber-500','Transfer submitted — awaiting confirmation','The bank has not confirmed this transfer yet. Track its status for updates; do not assume it has been sent.'];
  return<Card className="mx-auto max-w-md text-center" role="status"><I className={`mx-auto h-14 w-14 ${c}`}/><h2 className="mt-3 text-xl font-bold">{title}</h2><p className="muted mt-1 text-sm">{msg}</p>{t&&<p className="mt-2 text-sm">Reference: <b>{t.ref}</b></p>}
   <div className="mt-5 flex flex-wrap justify-center gap-2">{t&&<Link className="btn-p" to={`/transfers/${t.id}`}>View status & receipt</Link>}<button className="btn-s" onClick={reset}>{res.ok?'New transfer':'Edit and try again'}</button><Link className="btn-s" to="/transfers">Transfers</Link></div></Card>}

 const s=k=>e=>setF({...f,[k]:e.target.value});
 return<><PageHeader title={step==='form'?'New transfer':'Review transfer'} sub="Your bank validates every transfer. Nothing is sent until you confirm."/><DevNotice what="Accounts, limits and transfer outcomes"/>
 <Card className="mx-auto max-w-xl space-y-4">
  {step==='form'?<>
   <Seg name="Transfer type" value={mode} onChange={m=>{setMode(m);setErr({})}} options={[['beneficiary','To a beneficiary'],['own','Between my accounts']]}/>
   <Field label="From account"><Select aria-label="From account" value={sid} onChange={s('sourceId')}>{accounts.map(a=><option key={a.id} value={a.id}>{a.type} · {mask(a.number)}</option>)}</Select></Field>
   {source&&<p className="muted -mt-2 text-sm">Available balance: <b className="text-ink dark:text-white">{rupee(source.available)}</b></p>}
   {mode==='own'?<Field label="To account" error={err.destId}><Select aria-label="To account" value={f.destId} onChange={s('destId')}><option value="">Select account…</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.type} · {mask(a.number)}</option>)}</Select></Field>
   :<Field label="Beneficiary" error={err.beneficiaryId}>{(ben.data||[]).length?<Select aria-label="Beneficiary" value={f.beneficiaryId} onChange={s('beneficiaryId')}><option value="">Select beneficiary…</option>{usable.map(x=><option key={x.id} value={x.id}>{x.name} · {x.bank}</option>)}</Select>:<span className="text-sm">No beneficiaries yet. <Link className="text-indigo-600" to="/beneficiaries/new">Add one</Link></span>}</Field>}
   {mode==='beneficiary'&&(ben.data||[]).length>usable.length&&<p className="muted text-xs">Only active beneficiaries are listed. <Link className="text-indigo-600" to="/beneficiaries">Check pending ones</Link>.</p>}
   <Field label="Amount (₹)" error={err.amount}><Input type="number" inputMode="decimal" min="1" aria-label="Amount" value={f.amount} onChange={s('amount')} error={err.amount}/></Field>
   {lim.data&&<p className="muted -mt-2 text-xs">Per-transfer limit {rupee(lim.data.perTransfer)} · Daily remaining {rupee(Math.max(0,lim.data.daily-lim.data.usedToday))}</p>}
   <Field label="Description (optional)" error={err.description}><Input maxLength={60} value={f.description} onChange={s('description')} placeholder="e.g. Rent share"/></Field>
   <button className="btn-p w-full" disabled={pvBusy} onClick={review}>{pvBusy&&<Spinner/>}Review transfer</button></>
  :<>
   <Rows rows={[['From',`${source.type} ${mask(source.number)}`],mode==='own'?['To (your account)',`${dest.type} ${mask(dest.number)}`]:['Beneficiary',`${b.name} (${b.bank})`],mode==='beneficiary'&&['Beneficiary account',mask(b.account)],['Amount',rupee(amt)],pv.fee!=null?['Fee',rupee(pv.fee)]:['Fees','No fee information was returned by the bank'],['Total debit',rupee(pv.fee!=null?(pv.total??amt+pv.fee):amt)],['Description',f.description||'—']]}/>
   {pv.fee==null&&<p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">The total debit excludes any fee the bank may apply, because no fee was returned. Check the receipt after the transfer for the final amount.</p>}
   <div className="flex justify-between gap-2"><button className="btn-s" disabled={busy} onClick={()=>setStep('form')}>Back</button><button className="btn-p" disabled={busy} onClick={submit}>{busy&&<Spinner/>}{busy?'Submitting…':'Confirm and send'}</button></div></>}
 </Card></>}
