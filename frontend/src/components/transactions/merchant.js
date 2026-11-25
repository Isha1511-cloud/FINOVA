import {UtensilsCrossed,ShoppingBag,Car,TrainFront,Zap,Wifi,Clapperboard,Music,GraduationCap,HeartPulse,Banknote,Landmark,Receipt,Coffee,Tv,Wallet,Send,Plane} from 'lucide-react';

// Maps a transaction description / category to an icon + restrained tint.
// Presentation only — it never changes transaction data.
const BY_NAME=[
  [/swiggy|zomato|restaurant|food/i,UtensilsCrossed,'amber'],
  [/cafe|coffee|starbucks/i,Coffee,'amber'],
  [/amazon|flipkart|myntra|shop/i,ShoppingBag,'indigo'],
  [/uber|ola\b|cab|taxi/i,Car,'slate'],
  [/irctc|railway|train/i,TrainFront,'slate'],
  [/flight|airline|indigo air|travel/i,Plane,'slate'],
  [/airtel|jio|broadband|fiber|internet|vodafone/i,Wifi,'teal'],
  [/electric|power|utility|bill/i,Zap,'teal'],
  [/netflix|prime video|hotstar/i,Tv,'violet'],
  [/spotify|music/i,Music,'violet'],
  [/bookmyshow|cinema|movie/i,Clapperboard,'violet'],
  [/udemy|coursera|course|school|college|tuition/i,GraduationCap,'indigo'],
  [/apollo|pharmacy|hospital|clinic|health/i,HeartPulse,'rose'],
  [/salary|payroll/i,Banknote,'emerald'],
  [/interest/i,Landmark,'emerald'],
  [/atm|cash/i,Wallet,'slate'],
  [/transfer to|transfer from|neft|imps|upi/i,Send,'indigo'],
];
const BY_CAT={Food:[UtensilsCrossed,'amber'],Shopping:[ShoppingBag,'indigo'],Travel:[Car,'slate'],Bills:[Zap,'teal'],Entertainment:[Clapperboard,'violet'],Education:[GraduationCap,'indigo'],Healthcare:[HeartPulse,'rose'],Income:[Banknote,'emerald']};

export const merchantMeta=t=>{
  const hit=BY_NAME.find(([re])=>re.test(t.desc||''));
  if(hit)return{Icon:hit[1],tone:hit[2]};
  const c=BY_CAT[t.category];
  return c?{Icon:c[0],tone:c[1]}:{Icon:Receipt,tone:'slate'};
};

export const TONE={
  amber:'bg-amber-50 text-amber-600 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  indigo:'bg-indigo-50 text-indigo-600 ring-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
  teal:'bg-teal-50 text-teal-600 ring-teal-200/60 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/20',
  violet:'bg-violet-50 text-violet-600 ring-violet-200/60 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  rose:'bg-rose-50 text-rose-600 ring-rose-200/60 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  emerald:'bg-emerald-50 text-emerald-600 ring-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  slate:'bg-slate-100 text-slate-600 ring-slate-200/70 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
};
