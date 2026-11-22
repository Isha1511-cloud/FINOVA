import {createContext,useContext,useEffect,useState} from 'react';
const Ctx=createContext();export const useApp=()=>useContext(Ctx);
export function AppProvider({children}){
 const[user,setUser]=useState(()=>JSON.parse(sessionStorage.getItem('fv_user')||'null'));
 const[theme,setTheme]=useState(()=>localStorage.getItem('fv_theme')||'light');
 const[toasts,setT]=useState([]);const[hide,setHide]=useState(()=>localStorage.getItem('fv_hide')==='1');
 useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');localStorage.setItem('fv_theme',theme)},[theme]);
 const toast=(msg,kind='ok')=>{const id=Math.random();setT(t=>[...t,{id,msg,kind}]);setTimeout(()=>setT(t=>t.filter(x=>x.id!==id)),3500)};
 const signIn=({token,user})=>{sessionStorage.setItem('fv_token',token);sessionStorage.setItem('fv_user',JSON.stringify(user));setUser(user)};
 const signOut=()=>{sessionStorage.clear();setUser(null)};
 useEffect(()=>{const h=()=>{signOut();toast('Session expired. Please log in again.','err')};window.addEventListener('finova:expired',h);return()=>window.removeEventListener('finova:expired',h)},[]);
 return<Ctx.Provider value={{hide,toggleHide:()=>setHide(h=>{localStorage.setItem('fv_hide',h?'0':'1');return!h}),user,signIn,signOut,theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark'),toast}}>{children}
  <div role="status" aria-live="polite" style={{top:'max(.75rem,env(safe-area-inset-top))'}} className="pointer-events-none fixed inset-x-3 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-3 sm:items-end">{toasts.map(t=><div key={t.id} className={`pointer-events-auto w-fit max-w-full rounded-xl sm:max-w-xs px-4 py-3 text-sm font-medium text-white shadow-lg ${t.kind==='err'?'bg-rose-600':'bg-emerald-600'}`}>{t.msg}</div>)}</div></Ctx.Provider>}
