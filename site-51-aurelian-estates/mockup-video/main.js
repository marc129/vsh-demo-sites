(()=>{const mob=Math.min(innerWidth,screen.width||innerWidth)<=820,HI=mob?'m':'d',LO=mob?'ml':'dl',N=381,WIN=mob?40:24;
const tour=document.getElementById('hero'),cv=document.getElementById('scene'),cx=cv.getContext('2d',{alpha:false}),bar=document.querySelector('#loadbar i'),pin=tour.querySelector('.pin');
const fade=document.createElement('div');fade.className='endfade';pin.appendChild(fade);
const src=(s,f)=>`frames/${s}/${String(f+1).padStart(3,'0')}.webp`;
const lo=new Array(N),hi=new Array(N),rl=new Uint8Array(N),rh=new Uint8Array(N);
let doneLo=0,inflight=0,cf=0,dirty=true;
function img(u){const i=new Image();i.decoding='async';i.src=u;return i.decode().then(()=>i)}
async function bmp(u){if(window.createImageBitmap){const r=await fetch(u);return createImageBitmap(await r.blob())}return img(u)}
function nextLo(){if(!rl[0])return 0;if(!rl[N-1])return N-1;for(const st of[16,8,4,2,1])for(let f=0;f<N;f+=st)if(!rl[f])return f;return -1}
function nextHi(){for(let d=0;d<=WIN;d++){for(const f of[cf+d,cf-d])if(f>=0&&f<N&&!rh[f])return f}return -1}
function evict(){for(let f=0;f<N;f++)if(hi[f]&&Math.abs(f-cf)>WIN+8){hi[f].close&&hi[f].close();hi[f]=null;rh[f]=0}}
function pump(){while(inflight<6){let f=nextLo(),t='l';if(f<0||(doneLo>N*.25&&inflight<4&&(t='h',f=nextHi())>=0)){if(t==='l'){t='h';f=nextHi()}}else t='l';
  if(t==='h'&&f<0){f=nextLo();t='l'}if(f<0)return;inflight++;
  if(t==='l'){rl[f]=1;img(src(LO,f)).then(b=>{lo[f]=b;dirty=true;doneLo++;bar.style.width=(doneLo/N*100)+'%';if(doneLo>=N)bar.parentNode.classList.add('done')}).catch(()=>{rl[f]=0}).finally(()=>{inflight--;pump()})}
  else{rh[f]=1;bmp(src(HI,f)).then(b=>{if(Math.abs(f-cf)>WIN+8){b.close&&b.close();rh[f]=0;return}hi[f]=b;dirty=true}).catch(()=>{rh[f]=0}).finally(()=>{inflight--;pump()})}}}
let top=0,span=1,target=0,cur=0,last='';
function measure(){top=tour.getBoundingClientRect().top+scrollY;span=Math.max(1,tour.offsetHeight-innerHeight-innerHeight*.4);onScroll()}
function onScroll(){const p=Math.min(1,Math.max(0,(scrollY-top)/span)),hp=Math.min(1,Math.max(0,(scrollY-top-span)/(innerHeight*.4)));fade.style.opacity=(hp*hp*(3-2*hp)).toFixed(3);target=p*(N-1);const c=Math.round(target);if(Math.abs(c-cf)>3){cf=c;evict();pump()}}
function fit(){const k=Math.min(devicePixelRatio||1,2),r=cv.getBoundingClientRect();cv.width=Math.round(r.width*k);cv.height=Math.round(r.height*k);cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';window.__cv=[cv.width,cv.height,r.width,r.height,k];dirty=true;measure()}
const get=f=>hi[f]||lo[f];
function near(f){for(let d=1;d<N;d++){if(get(f-d))return get(f-d);if(get(f+d))return get(f+d)}return null}
function draw(i,a){const W=cv.width,H=cv.height,iw=i.width||i.naturalWidth,ih=i.height||i.naturalHeight,k=Math.max(W/iw,H/ih),w=iw*k,h=ih*k;cx.globalAlpha=a;cx.drawImage(i,(W-w)/2,(H-h)/2,w,h)}
function tick(){const d=target-cur;cur=Math.abs(d)<.01?target:cur+d*.22;
 const f0=Math.floor(cur),fr=cur-f0,A=get(f0),B=get(Math.min(N-1,f0+1)),key=f0+'|'+fr.toFixed(2)+'|'+(A===hi[f0]);if(key===last&&!dirty)return;last=key;dirty=false;
 window.__lastFrame=A?f0:-1;window.__hq=!!hi[f0];if(A){draw(A,1);if(B&&fr>.03)draw(B,fr)}else{const n=near(f0);if(n)draw(n,1)}cx.globalAlpha=1}
let lenis=null;if(window.Lenis&&!matchMedia('(prefers-reduced-motion: reduce)').matches){lenis=new Lenis({lerp:.1,smoothWheel:true,anchors:true});window.lenis=lenis}
function raf(t){if(lenis)lenis.raf(t);tick();requestAnimationFrame(raf)}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',fit,{passive:true});addEventListener('load',measure);
if(window.ResizeObserver){new ResizeObserver(measure).observe(document.body);new ResizeObserver(fit).observe(cv)}
const io=window.IntersectionObserver&&new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});const it=document.getElementById('intro');if(io&&it){it.classList.add('rise');io.observe(it)}
fit();cur=target;pump();requestAnimationFrame(raf);})();
