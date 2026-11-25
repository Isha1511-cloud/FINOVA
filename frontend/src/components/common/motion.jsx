// Shared motion primitives. Everything here honours prefers-reduced-motion
// (MotionConfig reducedMotion="user" in main.jsx + explicit checks below).
import {useEffect,useRef,useState} from 'react';
import {motion,animate,useInView,useReducedMotion} from 'framer-motion';

export const EASE=[0.16,1,0.3,1];

// Container + item variants for staggered entrances.
export const stagger=(gap=0.06,delay=0)=>({hidden:{},show:{transition:{staggerChildren:gap,delayChildren:delay}}});
export const rise={hidden:{opacity:0,y:16},show:{opacity:1,y:0,transition:{duration:.55,ease:EASE}}};
export const fade={hidden:{opacity:0},show:{opacity:1,transition:{duration:.4}}};

export const Stagger=({children,className='',gap,delay,as:T='div',...p})=>{const M=motion[T];return<M className={className} variants={stagger(gap,delay)} initial="hidden" animate="show" {...p}>{children}</M>};
export const Rise=({children,className='',as:T='div',...p})=>{const M=motion[T];return<M className={className} variants={rise} {...p}>{children}</M>};

// Scroll-triggered reveal (landing page, long pages).
export const Reveal=({children,className='',delay=0,y=24})=>{const ref=useRef(null),inView=useInView(ref,{once:true,margin:'-60px'});
 return<motion.div ref={ref} className={className} initial={{opacity:0,y}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:.6,delay,ease:EASE}}>{children}</motion.div>};

// Animated number. `format` receives the in-flight number.
export function CountUp({value=0,format=v=>Math.round(v).toLocaleString('en-IN'),duration=1.1,className=''}){
 const reduce=useReducedMotion();const[v,setV]=useState(reduce?value:0);const prev=useRef(reduce?value:0);
 useEffect(()=>{if(reduce){setV(value);prev.current=value;return}const c=animate(prev.current,value,{duration,ease:EASE,onUpdate:x=>setV(x)});prev.current=value;return()=>c.stop()},[value,reduce,duration]);
 return<span className={className}>{format(v)}</span>}
