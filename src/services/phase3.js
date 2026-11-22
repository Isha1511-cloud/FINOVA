// Phase 3 services (features 81–130). Each method names the REST endpoint the
// backend must provide. In demo mode (VITE_USE_MOCK !== 'false') the calls are
// answered by the clearly separated development adapter in ./dev/.
// Full request/response contracts: docs/BACKEND_CONTRACTS.md
import {http} from './http.js';
import * as d from './dev/index.js';
export const IS_MOCK=import.meta.env.VITE_USE_MOCK!=='false';
const pick=(m,r)=>IS_MOCK?m():r();
const changed=r=>r.then(x=>{window.dispatchEvent(new Event('finova:notifications'));return x});

export const transferApi={
 limits:()=>pick(()=>d.transfers.limits(),()=>http('/transfers/limits')),                       // GET  /transfers/limits
 list:p=>pick(()=>d.transfers.list(p),()=>http('/transfers',{params:p})),                         // GET  /transfers?q&status&beneficiaryId&from&to&min&max&sort&page&pageSize
 get:id=>pick(()=>d.transfers.get(id),()=>http(`/transfers/${id}`)),                              // GET  /transfers/:id
 preview:b=>pick(()=>d.transfers.preview(b),()=>http('/transfers/preview',{method:'POST',body:b})),    // POST /transfers/preview → {fee?,total?}
 create:b=>pick(()=>d.transfers.create(b),()=>http('/transfers',{method:'POST',body:b}))};        // POST /transfers  (mode own|beneficiary, idempotencyKey)
export const beneficiaryApi={
 list:()=>pick(()=>d.beneficiaries.list(),()=>http('/beneficiaries')),                            // GET    /beneficiaries
 get:id=>pick(()=>d.beneficiaries.get(id),()=>http(`/beneficiaries/${id}`)),                      // GET    /beneficiaries/:id
 create:b=>pick(()=>d.beneficiaries.create(b),()=>http('/beneficiaries',{method:'POST',body:b})), // POST   /beneficiaries  (409 on duplicate)
 update:(id,b)=>pick(()=>d.beneficiaries.update(id,b),()=>http(`/beneficiaries/${id}`,{method:'PATCH',body:b})), // PATCH /beneficiaries/:id (nickname only)
 remove:id=>pick(()=>d.beneficiaries.remove(id),()=>http(`/beneficiaries/${id}`,{method:'DELETE'})),// DELETE /beneficiaries/:id
 check:id=>pick(()=>d.beneficiaries.check(id),()=>http(`/beneficiaries/${id}/status`)),           // GET    /beneficiaries/:id/status
 activate:id=>pick(()=>d.beneficiaries.activate(id),()=>http(`/beneficiaries/${id}/activate`,{method:'POST'})), // POST /beneficiaries/:id/activate
 retry:id=>pick(()=>d.beneficiaries.retry(id),()=>http(`/beneficiaries/${id}/verify`,{method:'POST'}))};      // POST /beneficiaries/:id/verify
export const aiApi={
 list:()=>pick(()=>d.ai.list(),()=>http('/ai/conversations')),                                    // GET    /ai/conversations
 get:id=>pick(()=>d.ai.get(id),()=>http(`/ai/conversations/${id}`)),                              // GET    /ai/conversations/:id
 create:()=>pick(()=>d.ai.create(),()=>http('/ai/conversations',{method:'POST'})),                // POST   /ai/conversations
 rename:(id,title)=>pick(()=>d.ai.rename(id,title),()=>http(`/ai/conversations/${id}`,{method:'PATCH',body:{title}})), // PATCH
 remove:id=>pick(()=>d.ai.remove(id),()=>http(`/ai/conversations/${id}`,{method:'DELETE'})),
 clear:id=>pick(()=>d.ai.clear(id),()=>http(`/ai/conversations/${id}/messages`,{method:'DELETE'})),    // DELETE /ai/conversations/:id/messages      // DELETE /ai/conversations/:id
 send:(id,message)=>pick(()=>d.ai.send(id,message),()=>http(`/ai/conversations/${id}/messages`,{method:'POST',body:{message}}))}; // POST (backend → LLM → authorised banking APIs)
export const fraudApi={
 list:p=>pick(()=>d.fraud.list(p),()=>http('/fraud/alerts',{params:p})),                           // GET  /fraud/alerts?q&from&to&risk&status&page&pageSize
 get:id=>pick(()=>d.fraud.get(id),()=>http(`/fraud/alerts/${id}`)),                                // GET  /fraud/alerts/:id  (404 unless owned)
 report:(id,b)=>pick(()=>d.fraud.report(id,b),()=>http(`/fraud/alerts/${id}/report`,{method:'POST',body:b})), // POST /fraud/alerts/:id/report
 acknowledge:id=>pick(()=>d.fraud.acknowledge(id),()=>http(`/fraud/alerts/${id}/acknowledge`,{method:'POST'}))}; // POST /fraud/alerts/:id/acknowledge
export const notificationApi={
 list:p=>pick(()=>d.notifications.list(p),()=>http('/notifications',{params:p})),                  // GET  /notifications?type
 markRead:id=>changed(pick(()=>d.notifications.markRead(id),()=>http(`/notifications/${id}/read`,{method:'POST'}))),   // POST /notifications/:id/read
 markAllRead:()=>changed(pick(()=>d.notifications.markAllRead(),()=>http('/notifications/read-all',{method:'POST'})))}; // POST /notifications/read-all
export const insightApi={
 capabilities:()=>pick(()=>d.insights.capabilities(),()=>http('/capabilities')),                   // GET   /capabilities
 summary:p=>pick(()=>d.insights.summary(p),()=>http('/insights/summary',{params:p})),              // GET   /insights/summary?from&to&accountId
 compare:p=>pick(()=>d.insights.compare(p),()=>http('/insights/compare',{params:p})),              // GET   /insights/compare?month&accountId
 category:p=>pick(()=>d.insights.category(p),()=>http('/insights/category',{params:p})),           // GET   /insights/category?name&from&to&accountId
 trend:p=>pick(()=>d.insights.trend(p),()=>http('/insights/trend',{params:p})),                    // GET   /insights/trend?from&to&granularity&accountId
 setCategory:(id,c)=>pick(()=>d.insights.setCategory(id,c),()=>http(`/transactions/${id}/category`,{method:'PATCH',body:{category:c}})), // PATCH
 recommendations:()=>pick(()=>d.insights.recommendations(),()=>http('/insights/recommendations')), // GET   /insights/recommendations
 history:()=>pick(()=>d.insights.history(),()=>http('/insights/history')),                         // GET   /insights/history
 dismiss:id=>pick(()=>d.insights.dismiss(id),()=>http(`/insights/${id}/dismiss`,{method:'POST'})),
 save:id=>pick(()=>d.insights.save(id),()=>http(`/insights/${id}/save`,{method:'POST'}))};                  // POST  /insights/:id/save (only if capabilities.insightSave) // POST  /insights/:id/dismiss
export const budgetApi={
 list:()=>pick(()=>d.budgets.list(),()=>http('/budgets')),                                         // GET    /budgets (with spent/remaining/status)
 create:b=>pick(()=>d.budgets.create(b),()=>http('/budgets',{method:'POST',body:b})),              // POST   /budgets
 update:(id,b)=>pick(()=>d.budgets.update(id,b),()=>http(`/budgets/${id}`,{method:'PATCH',body:b})),    // PATCH  /budgets/:id (name, amount)
 remove:id=>pick(()=>d.budgets.remove(id),()=>http(`/budgets/${id}`,{method:'DELETE'})),           // DELETE /budgets/:id
 alerts:()=>pick(()=>d.budgets.alerts(),()=>http('/budgets/alerts'))};                             // GET    /budgets/alerts
export const goalApi={
 list:()=>pick(()=>d.goals.list(),()=>http('/goals')),                                             // GET    /goals
 get:id=>pick(()=>d.goals.get(id),()=>http(`/goals/${id}`)),                                       // GET    /goals/:id (includes contributions)
 create:b=>pick(()=>d.goals.create(b),()=>http('/goals',{method:'POST',body:b})),                  // POST   /goals
 remove:id=>pick(()=>d.goals.remove(id),()=>http(`/goals/${id}`,{method:'DELETE'})),               // DELETE /goals/:id
 contribute:(id,b)=>pick(()=>d.goals.contribute(id,b),()=>http(`/goals/${id}/contributions`,{method:'POST',body:b})), // POST (planning record)
 plan:b=>pick(()=>d.goals.plan(b),()=>http('/goals/plan',{method:'POST',body:b})),                 // POST   /goals/plan  (estimate only)
 averages:()=>pick(()=>d.goals.historicalAverages(),()=>http('/goals/averages')),                  // GET    /goals/averages
 planGet:m=>pick(()=>d.planner.get(m),()=>http(`/savings-plans/${m}`)),                            // GET    /savings-plans/:yyyy-mm
 planSave:(m,b)=>pick(()=>d.planner.save(m,b),()=>http(`/savings-plans/${m}`,{method:'PUT',body:b}))}; // PUT
export const forecastApi={
 get:p=>pick(()=>d.forecast.get(p),()=>http('/forecast',{params:p})),                              // GET /forecast?horizon&spendingDelta&incomeDelta&accountId
 upcoming:p=>pick(()=>d.forecast.upcoming(p),()=>http('/forecast/upcoming',{params:p}))};          // GET /forecast/upcoming?accountId
export const GOAL_CATEGORIES=d.GOAL_CATEGORIES;
