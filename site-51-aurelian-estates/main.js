(()=>{const mob=Math.min(innerWidth,screen.width||innerWidth)<=820,SET=mob?'m':'d',N=mob?25:40,SC=9;
const cv=document.getElementById('scene'),cx=cv.getContext('2d',{alpha:false}),bar=document.querySelector('#loadbar i');
const stages=[...document.querySelectorAll('.stage')],bm=Array.from({length:SC},()=>new Array(N)),req=Array.from({length:SC},()=>new Array(N));
const src=(s,f)=>`frames/${SET}/s${s+1}/${String(f+1).padStart(3,'0')}.webp`;
let done=0;const tot=N*SC;
async function dec(s,f){try{if(window.createImageBitmap){const r=await fetch(src(s,f));const b=await createImageBitmap(await r.blob());return b}}catch(e){}
 const i=new Image();i.src=src(s,f);await i.decode();return i}
// priority loader: current + next scene first, coarse to fine, max 6 in flight
let inflight=0,want=0;
function next(){const c=want,ord=[c,c+1,c+2,c-1,...Array.from({length:SC},(_,i)=>i)].filter(s=>s>=0&&s<SC);
 for(const step of[8,4,2,1])for(const s of ord)for(let f=0;f<N;f+=step)if(!req[s][f])return[s,f];
 if(!req[ord[0]][N-1])return[ord[0],N-1];for(const s of ord)for(let f=0;f<N;f++)if(!req[s][f])return[s,f];return null}
function pump(){while(inflight<6){const j=next();if(!j)return;const[s,f]=j;req[s][f]=1;inflight++;
 dec(s,f).then(b=>{bm[s][f]=b;dirty=true}).catch(()=>{req[s][f]=0}).finally(()=>{inflight--;done++;bar.style.width=(done/tot*100)+'%';if(done>=tot)bar.parentNode.classList.add('done');pump()})}}
// layout cache (no layout reads in draw loop)
let tops=[],hs=[],vh=innerHeight,target=0,cur=0,dirty=true,last='';
function measure(){vh=innerHeight;const y=scrollY;tops=stages.map(e=>e.getBoundingClientRect().top+y);hs=stages.map(e=>e.offsetHeight);onScroll()}
function onScroll(){const y=scrollY+vh*.5;let s=0;for(let i=0;i<SC;i++)if(tops[i]<=y)s=i;
 const p=Math.min(1,Math.max(0,(y-tops[s])/hs[s]));target=s+p;const w=Math.min(SC-1,s);if(w!==want){want=w;pump()}}
function fit(){const r=Math.min(devicePixelRatio||1,mob?1.5:2);cv.width=innerWidth*r;cv.height=innerHeight*r;dirty=true;measure()}
function near(s,f){for(let d=0;d<N;d++){const a=bm[s][f-d];if(a)return a;const b=bm[s][f+d];if(b)return b}return null}
function draw(i,a){if(!i)return;const W=cv.width,H=cv.height,iw=i.naturalWidth||i.width,ih=i.naturalHeight||i.height,k=Math.max(W/iw,H/ih),w=iw*k,h=ih*k;cx.globalAlpha=a;cx.drawImage(i,(W-w)/2,(H-h)/2,w,h)}
function scene(s,ff,a){const f0=Math.floor(ff),fr=ff-f0,A=bm[s][f0],B=bm[s][Math.min(N-1,f0+1)];
 if(A){draw(A,a);if(B&&fr>.02)draw(B,a*fr)}else draw(near(s,Math.round(ff)),a)}
function tick(){requestAnimationFrame(tick);const d=target-cur;cur=Math.abs(d)<.0004?target:cur+d*.12;
 const s=Math.min(SC-1,Math.floor(cur)),p=Math.min(1,cur-s),ff=p*(N-1),fade=s<SC-1&&p>.82?(p-.82)/.18:0;
 const key=s+'|'+ff.toFixed(2)+'|'+fade.toFixed(2);if(key===last&&!dirty)return;last=key;dirty=false;
 cx.globalAlpha=1;cx.fillStyle='#14110e';cx.fillRect(0,0,cv.width,cv.height);scene(s,ff,1);if(fade>0)scene(s+1,0,fade);cx.globalAlpha=1}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',fit,{passive:true});addEventListener('load',measure);
if(window.ResizeObserver)new ResizeObserver(measure).observe(document.body);
fit();cur=target;pump();tick();})();
