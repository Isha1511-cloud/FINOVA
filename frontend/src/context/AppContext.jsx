import {createContext,useContext,useEffect,useState} from 'react';
const Ctx=createContext();export const useApp=()=>useContext(Ctx);
export function AppProvider({children}){
 const[user,setUser]=useState(()=>JSON.parse(sessionStorage.getItem('fv_user')||'null'));
 // The interface is always dark; `theme` and `toggleTheme` stay in the context so existing callers keep working.
 const theme='dark';
 const[toasts,setT]=useState([]);const[hide,setHide]=useState(()=>localStorage.getItem('fv_hide')==='1');
 useEffect(()=>{document.documentElement.classList.add('dark')},[]);
 const toast=(msg,kind='ok')=>{const id=Math.random();setT(t=>[...t,{id,msg,kind}]);setTimeout(()=>setT(t=>t.filter(x=>x.id!==id)),3500)};
 const signIn=({token,user})=>{sessionStorage.setItem('fv_token',token);sessionStorage.setItem('fv_user',JSON.stringify(user));setUser(user)};
 const signOut=()=>{sessionStorage.clear();setUser(null)};
 useEffect(()=>{const h=()=>{signOut();toast('Session expired. Please log in again.','err')};window.addEventListener('finova:expired',h);return()=>window.removeEventListener('finova:expired',h)},[]);
 return<Ctx.Provider value={{hide,toggleHide:()=>setHide(h=>{localStorage.setItem('fv_hide',h?'0':'1');return!h}),user,signIn,signOut,theme,toggleTheme:()=>{},toast}}>{children}
  <div role="status" aria-live="polite" style={{top:'max(.75rem,env(safe-area-inset-top))'}} className="pointer-events-none fixed inset-x-3 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">{toasts.map(t=><div key={t.id} className={`pointer-events-auto flex w-fit max-w-full items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl animate-scale-up sm:max-w-sm ${t.kind==='err'?'border-rose-400/40 bg-[#2a0f24]/90':'border-violet-400/35 bg-[#1b1445]/90'}`}><i aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${t.kind==='err'?'bg-rose-400 shadow-[0_0_10px_2px_rgba(251,113,133,.8)]':'bg-mint shadow-[0_0_10px_2px_rgba(110,231,183,.7)]'}`} style={t.kind==='err'?undefined:{background:'#6ee7b7'}}/>{t.msg}</div>)}</div></Ctx.Provider>}
