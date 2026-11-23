import {useState} from 'react';import {useNavigate,Link} from 'react-router-dom';
import {beneficiaryApi} from '../../services/phase3.js';import {useApp} from '../../context/AppContext.jsx';
import {Card,Field,Input,Spinner,PageHeader} from '../../components/common/ui.jsx';import {DevNotice,errMsg} from '../../components/p3/parts.jsx';
const blank={name:'',account:'',confirm:'',ifsc:'',bank:'',nickname:''};
export default function BeneficiaryForm(){
 const nav=useNavigate(),{toast}=useApp();const[f,setF]=useState(blank),[e,setE]=useState({}),[busy,setBusy]=useState(false),[top,setTop]=useState('');
 const s=k=>x=>setF({...f,[k]:x.target.value});
 const submit=async ev=>{ev.preventDefault();if(busy)return;const v={};
  if(f.name.trim().length<2)v.name='Enter the account holder’s name';
  if(!/^\d{9,18}$/.test(f.account))v.account='Account number must be 9–18 digits';
  if(f.confirm!==f.account)v.confirm='Account numbers do not match';
  if(!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(f.ifsc.toUpperCase()))v.ifsc='Enter a valid IFSC (e.g. HDFC0001234)';
  if(!f.bank.trim())v.bank='Enter the bank name';setE(v);setTop('');if(Object.keys(v).length)return;
  setBusy(true);try{const b=await beneficiaryApi.create({name:f.name,account:f.account,ifsc:f.ifsc,bank:f.bank,nickname:f.nickname});toast('Beneficiary added. Verification is pending.');nav(`/beneficiaries/${b.id}`)}
  catch(x){if(x.code==='duplicate'||x.status===409)setE({account:errMsg(x)});else setTop(errMsg(x))}finally{setBusy(false)}};
 return<><PageHeader title="Add beneficiary" sub="The bank verifies new beneficiaries before you can send money."/><DevNotice what="Verification results"/>
 <Card className="mx-auto max-w-xl"><form noValidate onSubmit={submit} className="space-y-3">{top&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">{top}</p>}
  <Field label="Beneficiary name" error={e.name}><Input value={f.name} onChange={s('name')} error={e.name} autoComplete="off"/></Field>
  <Field label="Bank account number" error={e.account}><Input inputMode="numeric" value={f.account} onChange={s('account')} error={e.account} autoComplete="off"/></Field>
  <Field label="Confirm account number" error={e.confirm}><Input inputMode="numeric" value={f.confirm} onChange={s('confirm')} onPaste={x=>x.preventDefault()} error={e.confirm} autoComplete="off"/></Field>
  <div className="grid gap-3 sm:grid-cols-2"><Field label="IFSC code" error={e.ifsc}><Input value={f.ifsc} onChange={s('ifsc')} error={e.ifsc} style={{textTransform:'uppercase'}} maxLength={11}/></Field><Field label="Bank name" error={e.bank}><Input value={f.bank} onChange={s('bank')} error={e.bank}/></Field></div>
  <Field label="Nickname (optional)"><Input maxLength={30} value={f.nickname} onChange={s('nickname')}/></Field>
  <p className="muted text-xs">Adding a beneficiary does not mean they are verified. You will see the verification result on the next screen.</p>
  <div className="flex justify-end gap-2"><Link className="btn-s" to="/beneficiaries">Cancel</Link><button className="btn-p" disabled={busy}>{busy&&<Spinner/>}Add beneficiary</button></div></form></Card></>}
