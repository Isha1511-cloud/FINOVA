import {useState} from 'react';import {Link} from 'react-router-dom';import {X,Bookmark} from 'lucide-react';
import {useAsync} from '../../hooks/useAsync.js';import {insightApi} from '../../services/phase3.js';import {useApp} from '../../context/AppContext.jsx';
import {Card,PageHeader,Skeleton,ErrorState,EmptyState,Badge} from '../../components/common/ui.jsx';import {DevNotice,AnalyticsTabs,Seg,rupee,errMsg} from '../../components/p3/parts.jsx';import {dt} from '../../utils/format.js';
export default function InsightHistory(){
 const{toast}=useApp();const{data,loading,error,reload}=useAsync(insightApi.history),cap=useAsync(insightApi.capabilities);
 const[view,setView]=useState('all');const canSave=cap.data?.insightSave;
 const save=async id=>{try{await insightApi.save(id);reload()}catch(x){toast(errMsg(x),'err')}};
 const dismiss=async id=>{try{await insightApi.dismiss(id);toast('Insight dismissed');reload()}catch(x){toast(errMsg(x),'err')}};
 return<><PageHeader title="Insight history" sub="Summaries generated for previous months.">{canSave&&<Seg name="Filter" value={view} onChange={setView} options={[['all','All'],['saved','Saved']]}/>}</PageHeader><AnalyticsTabs/><DevNotice what="Past insights"/>
 {loading&&!data?<Skeleton className="h-56"/>:error?<ErrorState message={error} onRetry={reload}/>:!data.items.filter(i=>view==='all'||i.saved).length?<Card><EmptyState title={view==='saved'?'No saved insights':'No insights yet'} hint={view==='saved'?'Use Save on an insight to keep it here.':'Monthly summaries will appear here.'}/></Card>:
  <div className="grid gap-3 md:grid-cols-2">{data.items.filter(i=>view==='all'||i.saved).map(i=><Card key={i.id}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{i.title}</p><p className="muted text-xs">Created {dt(i.createdAt)} · Period {i.period}</p></div><Badge tone="blue">{i.category}</Badge></div><p className="mt-2 text-sm">{i.summary}</p>
   {i.chart?.length>0&&<ul className="mt-2 space-y-1 text-xs">{i.chart.map(c=><li key={c.name} className="flex justify-between"><span>{c.name}</span><b>{rupee(c.value)}</b></li>)}</ul>}
   <div className="mt-3 flex items-center gap-2"><Link className="btn-s !py-1.5" to={i.link}>Related transactions</Link>{canSave&&<button className="btn-s !py-1.5" aria-pressed={!!i.saved} onClick={()=>save(i.id)}><Bookmark className="h-4 w-4"/>{i.saved?'Saved':'Save'}</button>}{cap.data?.insightDismiss&&<button className="btn-s ml-auto !py-1.5" onClick={()=>dismiss(i.id)}><X className="h-4 w-4"/>Dismiss</button>}</div></Card>)}</div>}
 {cap.data&&!canSave&&<p className="muted mt-3 text-xs">Saving insights is not available yet.</p>}</>}
