import {useId} from 'react';
/* FinoBot — the FINOVA assistant mascot.
   `size` is the robot's width in px. The light beam is optional and is sized from `size`
   (1.9x wide, 3.6x tall), so it never needs separate tuning. Pass beam={false} for the bare robot. */
export default function FinoBot({size=120,beam=true,className='',busy=false}){
 const id=useId().replace(/:/g,'');const w=size,h=size*1.32;
 return<div className={`relative shrink-0 ${className}`} style={{width:w,height:h}} aria-hidden="true">
  {beam&&<div className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 animate-beam motion-reduce:animate-none" style={{width:w*1.9,height:w*3.6,transformOrigin:'top center',background:'radial-gradient(ellipse 46% 100% at 50% 0%, rgba(196,170,255,.85) 0%, rgba(139,92,246,.45) 38%, rgba(91,61,240,.14) 66%, transparent 82%)',filter:`blur(${Math.max(6,w/10)}px)`,WebkitMaskImage:'linear-gradient(to bottom,#000 0%,#000 45%,transparent 100%)',maskImage:'linear-gradient(to bottom,#000 0%,#000 45%,transparent 100%)'}}/>}
  <svg viewBox="0 0 120 158" width={w} height={h} className="relative animate-bot-hover motion-reduce:animate-none" style={{overflow:'visible'}}>
   <defs>
    <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff"/><stop offset=".55" stopColor="#e4dcff"/><stop offset="1" stopColor="#a99bd8"/></linearGradient>
    <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1245"/><stop offset="1" stopColor="#0a0722"/></linearGradient>
    <radialGradient id={`${id}f`} cx=".5" cy="0" r="1"><stop offset="0" stopColor="#fff"/><stop offset=".35" stopColor="#c4b5fd"/><stop offset="1" stopColor="#7c5cfc" stopOpacity="0"/></radialGradient>
    <filter id={`${id}g`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
   </defs>
   {/* thruster flame */}
   <ellipse cx="60" cy="146" rx="15" ry="18" fill={`url(#${id}f)`} filter={`url(#${id}g)`} opacity=".95"/>
   <ellipse cx="60" cy="140" rx="6" ry="9" fill="#fff" opacity=".9"/>
   {/* legs */}
   <rect x="43" y="112" width="12" height="22" rx="6" fill={`url(#${id}s)`}/><rect x="65" y="112" width="12" height="22" rx="6" fill={`url(#${id}s)`}/>
   {/* arms */}
   <rect x="14" y="70" width="12" height="36" rx="6" fill={`url(#${id}s)`} transform="rotate(8 20 72)"/><rect x="94" y="70" width="12" height="36" rx="6" fill={`url(#${id}s)`} transform="rotate(-8 100 72)"/>
   {/* torso */}
   <rect x="28" y="64" width="64" height="54" rx="22" fill={`url(#${id}s)`}/>
   <rect x="46" y="80" width="28" height="22" rx="8" fill={`url(#${id}v)`}/>
   <circle cx="60" cy="91" r="4.5" fill="#22d3ee"><animate attributeName="opacity" values="1;.45;1" dur="2.4s" repeatCount="indefinite"/></circle>
   {/* head */}
   <line x1="60" y1="8" x2="60" y2="20" stroke="#cfc4ff" strokeWidth="3" strokeLinecap="round"/><circle cx="60" cy="7" r="4" fill="#f472b6"><animate attributeName="r" values="3.4;4.6;3.4" dur={busy?'.7s':'2s'} repeatCount="indefinite"/></circle>
   <rect x="22" y="22" width="76" height="52" rx="24" fill={`url(#${id}s)`}/>
   <rect x="14" y="38" width="9" height="20" rx="4.5" fill="#b9a9f5"/><rect x="97" y="38" width="9" height="20" rx="4.5" fill="#b9a9f5"/>
   <rect x="30" y="31" width="60" height="34" rx="16" fill={`url(#${id}v)`}/>
   <ellipse cx="47" cy="48" rx="6.5" ry="8" fill="#67e8f9"/><ellipse cx="73" cy="48" rx="6.5" ry="8" fill="#67e8f9"/>
   <ellipse cx="47" cy="48" rx="6.5" ry="8" fill="#67e8f9" filter={`url(#${id}g)`} opacity=".8"/><ellipse cx="73" cy="48" rx="6.5" ry="8" fill="#67e8f9" filter={`url(#${id}g)`} opacity=".8"/>
   <circle cx="49" cy="45" r="2" fill="#fff"/><circle cx="75" cy="45" r="2" fill="#fff"/>
  </svg></div>}
