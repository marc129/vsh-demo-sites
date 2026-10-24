(()=>{const mob=Math.min(innerWidth,screen.width||innerWidth)<=820,HI=mob?'m':'d',LO=mob?'ml':'dl',N=457,WIN=mob?120:48,V='20261024fs8';
const tour=document.getElementById('hero'),cv=document.getElementById('scene'),cx=cv.getContext('2d',{alpha:false}),bar=document.querySelector('#loadbar i'),pin=tour.querySelector('.pin');
const fade=document.createElement('div');fade.className='endfade';pin.appendChild(fade);
const src=(s,f)=>`frames/${s}/${String(f+1).padStart(3,'0')}.webp?v=${V}`;
const lo=new Array(N),hi=new Array(N),rl=new Uint8Array(N),rh=new Uint8Array(N);
let doneLo=0,doneHi=0,inflight=0,ih=0,cf=0,dirty=true;
function img(u){const i=new Image();i.decoding='async';i.src=u;return i.decode().then(()=>i)}
async function bmp(u){if(window.createImageBitmap){try{const r=await fetch(u,{cache:'force-cache'});return createImageBitmap(await r.blob())}catch(e){}}return img(u)}
function nextLo(){if(!rl[0])return 0;if(!rl[N-1])return N-1;for(const st of[16,8,4,2,1])for(let f=0;f<N;f+=st)if(!rl[f])return f;return -1}
function nextHi(){for(let d=0;d<=WIN;d++){for(const f of[cf+d,cf-d])if(f>=0&&f<N&&!rh[f])return f}return -1}
function evict(){for(let f=0;f<N;f++)if(hi[f]&&Math.abs(f-cf)>WIN+16){hi[f].close&&hi[f].close();hi[f]=null;rh[f]=0}}
function pump(){
  const maxIn=mob?8:10;
  while(inflight<maxIn){
    let t='l',f=nextLo();
    const h=nextHi();
    const near=h>=0&&Math.abs(h-cf)<=(mob?12:4);
    const ready=doneLo>N*.08||doneHi>8;
    if(h>=0&&(f<0||near||(ih<(mob?7:5)&&ready)||(mob&&ih<5))){t='h';f=h}
    if(f<0)return;
    inflight++;
    if(t==='l'){
      rl[f]=1;
      img(src(LO,f)).then(b=>{lo[f]=b;dirty=true;doneLo++;bar.style.width=(doneLo/N*100)+'%';if(doneLo>=N)bar.parentNode.classList.add('done')}).catch(()=>{rl[f]=0}).finally(()=>{inflight--;pump()});
    }else{
      rh[f]=1;ih++;
      bmp(src(HI,f)).then(b=>{if(Math.abs(f-cf)>WIN+16){b.close&&b.close();rh[f]=0;return}hi[f]=b;dirty=true;doneHi++}).catch(()=>{rh[f]=0}).finally(()=>{inflight--;ih--;pump()});
    }
  }
}
let top=0,span=1,target=0,cur=0,last='';
function measure(){top=tour.getBoundingClientRect().top+scrollY;span=Math.max(1,tour.offsetHeight-innerHeight-innerHeight*.4);onScroll()}
function onScroll(){const p=Math.min(1,Math.max(0,(scrollY-top)/span)),hp=Math.min(1,Math.max(0,(scrollY-top-span)/(innerHeight*.4)));fade.style.opacity=(hp*hp*(3-2*hp)).toFixed(3);target=p*(N-1);const c=Math.round(target);if(Math.abs(c-cf)>2){cf=c;evict();pump()}}
function fit(){
  // Size from viewport — not a letterboxed box. Matches mockup-video full-bleed.
  const cssW=innerWidth, cssH=innerHeight;
  cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;max-width:none;max-height:none';
  const k=Math.min(devicePixelRatio||1,3);
  cv.width=Math.round(cssW*k);cv.height=Math.round(cssH*k);
  cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
  window.__cv=[cv.width,cv.height,cssW,cssH,k,V];dirty=true;measure()
}
const get=f=>hi[f]||lo[f];
function near(f){for(let d=1;d<N;d++){if(get(f-d))return get(f-d);if(get(f+d))return get(f+d)}return null}
/* Cover ONLY — scale=max (never min). Portrait m/ frames already pan-centered on her. */
function draw(i,a){
  const W=cv.width,H=cv.height,iw=i.width||i.naturalWidth,ih=i.height||i.naturalHeight;
  if(!iw||!ih)return;
  const k=Math.max(W/iw,H/ih);
  const w=iw*k,h=ih*k;
  cx.globalAlpha=a;
  cx.drawImage(i,(W-w)/2,(H-h)/2,w,h);
}
function tick(){const d=target-cur;cur=Math.abs(d)<.008?target:cur+d*.28;
 const f0=Math.floor(cur),fr=cur-f0,A=get(f0),B=get(Math.min(N-1,f0+1)),key=f0+'|'+fr.toFixed(2)+'|'+(A===hi[f0]);if(key===last&&!dirty)return;last=key;dirty=false;
 window.__lastFrame=A?f0:-1;window.__hq=!!hi[f0];window.__fs=V;
 if(A){draw(A,1);if(!mob&&B&&fr>.02)draw(B,fr)}
 else{const n=near(f0);if(n)draw(n,1)}
 cx.globalAlpha=1}

let lenis=null;if(window.Lenis&&!matchMedia('(prefers-reduced-motion: reduce)').matches){lenis=new Lenis({lerp:.12,smoothWheel:true,anchors:true,wheelMultiplier:0.9});window.lenis=lenis}
function raf(t){if(lenis)lenis.raf(t);tick();requestAnimationFrame(raf)}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',fit,{passive:true});addEventListener('load',measure);
if(window.ResizeObserver){new ResizeObserver(measure).observe(document.body);new ResizeObserver(fit).observe(pin||cv)}
const io=window.IntersectionObserver&&new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});const it=document.getElementById('intro');if(io&&it){it.classList.add('rise');io.observe(it)}
fit();cur=target;pump();
if(window.requestIdleCallback){const idleFill=d=>{pump();if(doneHi<N*.5)requestIdleCallback(idleFill,{timeout:800})};requestIdleCallback(idleFill,{timeout:400})}
requestAnimationFrame(raf);})();
