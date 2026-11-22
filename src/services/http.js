const BASE=import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api';
export async function http(path,{method='GET',body,params}={}){
  const q=params?'?'+new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v])=>v!==''&&v!=null))):'';
  const res=await fetch(BASE+path+q,{method,headers:{'Content-Type':'application/json',Authorization:`Bearer ${sessionStorage.getItem('fv_token')||''}`},body:body?JSON.stringify(body):undefined});
  if(res.status===401&&!path.startsWith('/auth/')){window.dispatchEvent(new Event('finova:expired'));throw Object.assign(new Error('Session expired'),{status:401})}
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Object.assign(new Error(data.message||'Request failed'),{status:res.status});
  return data;
}
