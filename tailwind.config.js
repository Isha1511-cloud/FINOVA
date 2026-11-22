export default {darkMode:'class',content:['./index.html','./src/**/*.{js,jsx}'],theme:{screens:{xs:'420px',sm:'640px',md:'768px',lg:'1024px',xl:'1280px','2xl':'1536px','3xl':'1920px'},extend:{
fontFamily:{sans:['Inter','system-ui','sans-serif']},
colors:{primary:'#1565C0',secondary:'#42A5F5',accent:'#00A6A6',success:'#2E7D32',error:'#D32F2F',ink:'#172B4D',
indigo:{50:'#EAF3FC',100:'#D3E6F9',200:'#A8CDF3',300:'#42A5F5',400:'#2A85DD',500:'#1976D2',600:'#1565C0',700:'#0F52A0',800:'#0B3D7A',900:'#082B57'},
emerald:{50:'#EAF4EA',100:'#DCEDDD',400:'#66BB6A',500:'#2E7D32',600:'#2E7D32',700:'#256628'},
rose:{50:'#FDECEC',100:'#FBDADA',400:'#E57373',500:'#D32F2F',600:'#D32F2F',700:'#B71C1C'},
slate:{50:'#F5F7FA',800:'#172B4D'}},
keyframes:{fadeUp:{'0%':{opacity:0,transform:'translateY(12px)'},'100%':{opacity:1,transform:'none'}},float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-12px)'}}},
animation:{fade:'fadeUp .5s ease-out both',float:'float 6s ease-in-out infinite','float-slow':'float 8s ease-in-out infinite 1s'}}},plugins:[]}
