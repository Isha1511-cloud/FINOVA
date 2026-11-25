import {useEffect,useMemo,useState} from 'react';import {Link,useSearchParams} from 'react-router-dom';
import {PieChart,Pie,Cell,Tooltip,ResponsiveContainer} from 'recharts';
import {useAsync} from '../../hooks/useAsync.js';import {loanApi} from '../../services/phase3.js';
import {Card,PageHeader,Skeleton,ErrorState,Field,Input,Select,StatCard} from '../../components/common/ui.jsx';
import {DevNotice,LoanTabs,Seg,ChartBox,Rows,Tip,rupee} from '../../components/p3/parts.jsx';import {emi,buildSchedule,yearly,sumOf,fmtTenure} from '../../utils/loan.js';

// Client-side estimate: reducing-balance EMI. The bank's offer on an actual application is authoritative.
export default function LoanCalculator(){
 const[sp]=useSearchParams(),P=useAsync(loanApi.products);const[type,setType]=useState(sp.get('type')||'personal'),[amount,setAmount]=useState(sp.get('amount')||''),[rate,setRate]=useState(''),[tenure,setTenure]=useState(sp.get('tenure')||''),[unit,setUnit]=useState('months'),[full,setFull]=useState(false);
 const p=P.data?.find(x=>x.type===type)||P.data?.[0];
 useEffect(()=>{if(!p)return;setAmount(a=>a||String(Math.min(p.max,Math.max(p.min,500000))));setRate(String(p.rate));setTenure(t=>t||String(Math.min(p.maxTenure,Math.max(p.minTenure,36))))},[p?.type]);
 const months=Math.round(Number(tenure)*(unit==='years'?12:1)),A=Number(amount),R=Number(rate);
 const problems=[];if(p){if(!(A>0))problems.push('Enter a loan amount.');else if(A<p.min||A>p.max)problems.push(`${p.name} amounts range from ${rupee(p.min)} to ${rupee(p.max)}.`);
  if(!(R>=0&&R<=36)||rate==='')problems.push('Interest rate must be between 0% and 36%.');if(!(months>=1)||months>600)problems.push('Enter a valid tenure.');else if(months<p.minTenure||months>p.maxTenure)problems.push(`Tenure must be ${fmtTenure(p.minTenure)} to ${fmtTenure(p.maxTenure)}.`)}
 const res=useMemo(()=>{if(!p||problems.length)return null;const e=emi(A,R,months),rows=buildSchedule({principal:A,rate:R,emi:e,count:months});return{e,rows,interest:sumOf(rows,'interest'),total:sumOf(rows,'emi'),years:yearly(rows)}},[A,R,months,p?.type,problems.length]);
 if(P.loading&&!P.data)return<Skeleton className="h-96"/>;if(P.error)return<ErrorState message={P.error.message||P.error} onRetry={P.reload}/>;
 const pie=res?[{name:'Principal',value:A},{name:'Interest',value:res.interest}]:[];
 return<><PageHeader title="EMI calculator" sub="Estimate your monthly instalment before you apply."/><LoanTabs/><DevNotice what="Loan products and rates"/>
  <div className="grid gap-4 lg:grid-cols-5"><Card className="space-y-4 lg:col-span-2">
   <Field label="Loan type"><Select value={type} onChange={e=>{setType(e.target.value);setAmount('');setTenure('')}}>{P.data.map(x=><option key={x.type} value={x.type}>{x.name}</option>)}</Select></Field>
   <Field label="Loan amount (₹)"><Input type="number" inputMode="numeric" min={p.min} value={amount} onChange={e=>setAmount(e.target.value)}/></Field><input type="range" className="-mt-2 w-full" aria-label="Loan amount" min={p.min} max={p.max} step={p.min>=100000?10000:5000} value={A>0?Math.min(p.max,Math.max(p.min,A)):p.min} onChange={e=>setAmount(e.target.value)}/>
   <Field label="Interest rate (% per year)"><Input type="number" inputMode="decimal" step="0.05" min="0" max="36" value={rate} onChange={e=>setRate(e.target.value)}/></Field>
   <div><div className="mb-1 flex items-center justify-between gap-2"><span className="text-sm font-medium">Tenure</span><Seg name="Tenure unit" value={unit} onChange={u=>{setTenure(String(u==='years'?Math.round(months/12*10)/10:months));setUnit(u)}} options={[['months','Months'],['years','Years']]}/></div><Input type="number" inputMode="numeric" aria-label="Tenure" min="1" value={tenure} onChange={e=>setTenure(e.target.value)}/></div>
   {problems.length>0&&<ul role="alert" className="space-y-1 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">{problems.map(x=><li key={x}>{x}</li>)}</ul>}
   <p className="muted text-xs">Rates shown are starting rates for {p.name}. Your offer depends on the bank's review.</p></Card>
  <div className="space-y-4 lg:col-span-3">{!res?<Card><p className="muted py-10 text-center text-sm">Enter valid details to see your EMI.</p></Card>:<>
   <Card><p className="muted text-sm">Monthly EMI</p><p className="text-3xl font-extrabold text-primary sm:text-4xl">{rupee(res.e)}</p>
    <div className="mt-4 grid items-center gap-4 sm:grid-cols-2"><ChartBox h="h-44" label={`Principal ${rupee(A)} and interest ${rupee(res.interest)}`}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}><Cell fill="#7c5cfc"/><Cell fill="#22d3ee"/></Pie><Tooltip formatter={rupee}/></PieChart></ResponsiveContainer></ChartBox>
     <Rows rows={[['Principal',rupee(A)],['Total interest',rupee(res.interest)],['Total payable',rupee(res.total)],['Tenure',fmtTenure(months)]]}/></div>
    <div className="mt-4 flex flex-wrap gap-2"><Link className="btn-p" to={`/loans/apply?type=${p.type}&amount=${A}&tenure=${months}`}>Apply for this loan</Link></div></Card>
   <Card><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Repayment schedule</h2><Seg name="Schedule view" value={full?'m':'y'} onChange={v=>setFull(v==='m')} options={[['y','Yearly'],['m','Monthly']]}/></div>
    <div className="max-h-96 overflow-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="muted sticky top-0 bg-white text-xs dark:bg-slate-900"><tr><th className="p-2">{full?'Month':'Year'}</th><th className="p-2 text-right">Principal</th><th className="p-2 text-right">Interest</th><th className="p-2 text-right">Balance</th></tr></thead>
     <tbody>{(full?res.rows.map(r=>({k:r.n,...r})):res.years.map(y=>({k:y.year,...y}))).map(r=><tr key={r.k} className="border-t border-slate-100 dark:border-slate-800"><td className="p-2">{r.k}</td><td className="p-2 text-right">{rupee(r.principal)}</td><td className="p-2 text-right">{rupee(r.interest)}</td><td className="p-2 text-right">{rupee(r.balance)}</td></tr>)}</tbody></table></div>
    <Tip>Estimate only. Interest is calculated monthly on the reducing balance; the last instalment absorbs rounding.</Tip></Card></>}</div></div></>}
