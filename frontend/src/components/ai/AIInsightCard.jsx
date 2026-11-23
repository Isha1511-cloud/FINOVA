import {Sparkles} from 'lucide-react';import {Card} from '../common/ui.jsx';
const t={warn:'border-l-amber-500',good:'border-l-emerald-500',info:'border-l-indigo-500'};
export default function AIInsightCard({i}){return<Card className={`border-l-4 ${t[i.tone]}`}><p className="mb-1 flex items-center gap-1 text-xs font-semibold text-indigo-600"><Sparkles className="h-3.5 w-3.5"/>FINOVA AI Insight</p><p className="font-semibold">{i.title}</p><p className="muted mt-1 text-sm">{i.body}</p></Card>}
