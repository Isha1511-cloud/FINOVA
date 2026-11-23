export const CATEGORIES=['Food','Shopping','Travel','Bills','Entertainment','Education','Healthcare','Other'];
const M={Food:['Swiggy','Zomato','Cafe Coffee Day'],Shopping:['Amazon','Myntra','Flipkart'],Travel:['Uber','Ola','IRCTC'],Bills:['Airtel','Electricity Board','Jio Fiber'],Entertainment:['Netflix','BookMyShow','Spotify'],Education:['Udemy','Coursera'],Healthcare:['Apollo Pharmacy'],Other:['ATM Cash']};
let s=7;const r=()=>(s=(s*9301+49297)%233280)/233280;
export const accounts=[
{id:'a1',type:'Savings Account',number:'50100234561234',balance:248650,available:246150,status:'Active',ifsc:'FNVA0001024',branch:'Andheri West, Mumbai',opened:'2021-03-14'},
{id:'a2',type:'Current Account',number:'50100987654321',balance:112300,available:112300,status:'Active',ifsc:'FNVA0001024',branch:'Andheri West, Mumbai',opened:'2023-08-02'}];
export const transactions=(()=>{const t=[];for(let i=0;i<48;i++){const d=new Date(2026,9,2,10);d.setHours(d.getHours()-i*14);const base={id:`TXN${100200+i}`,ref:`REF${9000000+i*37}`,date:d.toISOString(),accountId:i%5===0?'a2':'a1'};
if(i===5){t.push({...base,desc:'Salary - Acme Corp',category:'Income',type:'credit',amount:85000,status:'completed'});continue}
if(i%9===4){t.push({...base,desc:'Interest Credit',category:'Income',type:'credit',amount:Math.round(200+r()*900),status:'completed'});continue}
const c=CATEGORIES[Math.floor(r()*CATEGORIES.length)],m=M[c][Math.floor(r()*M[c].length)];
t.push({...base,desc:m,category:c,type:'debit',amount:Math.round((150+r()*3000)/10)*10,status:i%13===7?'pending':i%17===3?'failed':i%19===6?'reversed':i%23===8?'review':'completed'})}return t})();
export const beneficiaries=[
{id:'b1',name:'Rohan Mehta',account:'60200112233',ifsc:'HDFC0001234',nickname:'Rohan',bank:'HDFC Bank',status:'Active'},
{id:'b2',name:'Priya Shah',account:'30400556677',ifsc:'SBIN0004321',nickname:'Sister',bank:'State Bank of India',status:'Active'},
{id:'b3',name:'Urban Rentals LLP',account:'90100998877',ifsc:'ICIC0007777',nickname:'Landlord',bank:'ICICI Bank',status:'Active'}];
export const monthly=[{m:'May',income:85000,spend:41200},{m:'Jun',income:85000,spend:46800},{m:'Jul',income:90000,spend:39500},{m:'Aug',income:85000,spend:44100},{m:'Sep',income:85000,spend:47300},{m:'Oct',income:85000,spend:21800}];
export const fraud=[
{id:'f1',txnId:'TXN100207',amount:96500,date:'2026-10-01T02:14:00',beneficiary:'QuickCash Ventures',risk:'high',status:'open',reasons:['Amount is significantly higher than your normal spending.','Beneficiary was added less than 24 hours ago.','Occurred shortly after another large transaction.','Transaction time differs from your usual activity.']},
{id:'f2',txnId:'TXN100219',amount:18400,date:'2026-09-29T21:40:00',beneficiary:'GlobalMart Online',risk:'medium',status:'open',reasons:['First payment to this merchant.','Amount is about 4x your average shopping spend.']},
{id:'f3',txnId:'TXN100231',amount:3200,date:'2026-09-27T13:05:00',beneficiary:'Unknown Merchant',risk:'low',status:'open',reasons:['Merchant category is new for your account.']}];
