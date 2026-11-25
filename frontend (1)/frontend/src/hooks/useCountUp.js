import {useEffect,useRef,useState} from 'react';
// Animates a number toward `target`; jumps straight to it when reduced motion is requested.
export function useCountUp(target=0,ms=900){const[v,setV]=useState(0);const from=useRef(0);
 useEffect(()=>{const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;if(reduce||!ms){setV(target);from.current=target;return}
  let raf,t0;const a=from.current,d=target-a;const step=t=>{t0??=t;const p=Math.min(1,(t-t0)/ms);setV(Math.round(a+d*(1-Math.pow(1-p,4))));if(p<1)raf=requestAnimationFrame(step);else from.current=target};raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf)},[target,ms]);
 return v}
