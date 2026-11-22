import {useEffect,useState} from 'react';
export function useAsync(fn,deps=[]){const[s,set]=useState({data:null,loading:true,error:null});const[n,setN]=useState(0);
 useEffect(()=>{let ok=true;set(p=>({...p,loading:true,error:null}));fn().then(data=>ok&&set({data,loading:false,error:null})).catch(e=>ok&&set({data:null,loading:false,error:e.message}));return()=>{ok=false}},[...deps,n]);
 return{...s,reload:()=>setN(x=>x+1)}}
