(()=>{const mob=Math.min(innerWidth,screen.width||innerWidth)<=820,SET=mob?'m':'d',N=mob?315:540,DUR=41.79,SEG=4.6;
const tour=document.getElementById('hero'),cv=document.getElementById('scene'),cx=cv.getContext('2d',{alpha:false}),bar=document.querySelector('#loadbar i'),cue=document.querySelector('.scroll-cue'),rooms=[...document.querySelectorAll('.room')];
const bm=new Array(N),req=new Uint8Array(N),src=f=>`frames/${SET}/${String(f+1).padStart(3,'0')}.webp`;
let done=0,inflight=0,cf=0,dirty=true;
async function dec(f){try{if(window.createImageBitmap){const r=await fetch(src(f));return await createImageBitmap(await r.blob())}}catch(e){}const i=new Image();i.src=src(f);await i.decode();return i}
function next(){for(let f=0;f<N;f+=16)if(!req[f])return f;const a=Math.max(0,cf-10),b=Math.min(N,cf+(mob?60:110));for(let f=a;f<b;f++)if(!req[f])return f;
 for(const st of[4,2,1])for(let f=0;f<N;f+=st)if(!req[f])return f;return -1}
function pump(){while(inflight<6){const f=next();if(f<0)return;req[f]=1;inflight++;
 dec(f).then(b=>{bm[f]=b;dirty=true}).catch(()=>{req[f]=0}).finally(()=>{inflight--;done++;bar.style.width=(done/N*100)+'%';if(done>=N)bar.parentNode.classList.add('done');pump()})}}
let top=0,span=1,target=0,cur=0,last='',room=-1;
function measure(){top=tour.getBoundingClientRect().top+scrollY;span=Math.max(1,tour.offsetHeight-innerHeight);onScroll()}
function onScroll(){const p=Math.min(1,Math.max(0,(scrollY-top)/span));target=p*(N-1);const c=Math.round(target);if(Math.abs(c-cf)>8){cf=c;pump()}
 cue.classList.toggle('gone',p>.015);const r=Math.min(8,Math.floor((p*DUR+.25)/SEG));if(r!==room){room=r;rooms.forEach((e,i)=>e.classList.toggle('on',i===r))}}
function fit(){const k=Math.min(devicePixelRatio||1,mob?1.5:2);cv.width=cv.clientWidth*k;cv.height=cv.clientHeight*k;dirty=true;measure()}
function near(f){for(let d=1;d<N;d++){if(bm[f-d])return bm[f-d];if(bm[f+d])return bm[f+d]}return null}
function draw(i,a){if(!i)return;const W=cv.width,H=cv.height,iw=i.width||i.naturalWidth,ih=i.height||i.naturalHeight,k=Math.max(W/iw,H/ih),w=iw*k,h=ih*k;cx.globalAlpha=a;cx.drawImage(i,(W-w)/2,(H-h)/2,w,h)}
function tick(){const d=target-cur;cur=Math.abs(d)<.01?target:cur+d*.22;
 const f0=Math.floor(cur),fr=cur-f0,key=f0+'|'+fr.toFixed(2);if(key===last&&!dirty)return;last=key;dirty=false;
 const A=bm[f0],B=bm[Math.min(N-1,f0+1)];if(A){draw(A,1);if(B&&fr>.03)draw(B,fr)}else{const n=near(f0);if(n)draw(n,1)}cx.globalAlpha=1}
let lenis=null;if(window.Lenis&&!matchMedia('(prefers-reduced-motion: reduce)').matches){lenis=new Lenis({lerp:.1,smoothWheel:true,anchors:true});window.lenis=lenis}
function raf(t){if(lenis)lenis.raf(t);tick();requestAnimationFrame(raf)}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',fit,{passive:true});addEventListener('load',measure);
if(window.ResizeObserver)new ResizeObserver(measure).observe(document.body);
fit();cur=target;pump();requestAnimationFrame(raf);})();
