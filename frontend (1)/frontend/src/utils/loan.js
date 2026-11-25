// Pure loan maths shared by the EMI calculator, the apply form and the development adapter.
const pad=n=>String(n).padStart(2,'0');
const dim=(y,m)=>new Date(y,m+1,0).getDate();
// Same calendar day k months after startIso (clamped to month end): '2026-01-31' + 1 → '2026-02-28'.
export const dueOn=(startIso,k)=>{const[y,m,d]=startIso.split('-').map(Number),t=new Date(y,m-1+k,1);return `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(Math.min(d,dim(t.getFullYear(),t.getMonth())))}`};
// Standard reducing-balance EMI, rounded to the nearest rupee.
export const emi=(principal,annualRate,months)=>{const P=Number(principal),n=Number(months),r=Number(annualRate)/1200;if(!(P>0)||!(n>0))return 0;if(!(r>0))return Math.ceil(P/n);const g=Math.pow(1+r,n);return Math.round(P*r*g/(g-1))};
// Amortisation rows. `count` forces the last row to clear the balance (absorbs rounding).
export function buildSchedule({principal,rate,emi:e,count,firstDue,startNo=1}){
 const r=Number(rate)/1200,rows=[];let bal=Math.round(principal);
 for(let i=0;bal>0&&i<720;i++){const interest=Math.round(bal*r);let pay=Math.min(e,bal+interest);if(count&&i===count-1)pay=bal+interest;const prin=pay-interest;if(prin<=0)break;bal-=prin;
  rows.push({n:startNo+i,due:firstDue?dueOn(firstDue,i):null,emi:pay,principal:prin,interest,balance:Math.max(0,bal)})}
 return rows}
export const yearly=rows=>{const out=[];rows.forEach((r,i)=>{const y=Math.floor(i/12);out[y]=out[y]||{year:y+1,principal:0,interest:0,balance:0,emi:0};out[y].principal+=r.principal;out[y].interest+=r.interest;out[y].emi+=r.emi;out[y].balance=r.balance});return out};
export const sumOf=(l,k)=>l.reduce((s,x)=>s+x[k],0);
export const fmtTenure=m=>{const y=Math.floor(m/12),r=m%12;return[y&&`${y} yr${y>1?'s':''}`,r&&`${r} mo`].filter(Boolean).join(' ')||'0 mo'};
