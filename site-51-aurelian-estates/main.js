(()=>{const N=76,SC=9,cv=document.getElementById('scene'),cx=cv.getContext('2d'),bar=document.querySelector('#loadbar i');
const stages=[...document.querySelectorAll('.stage')],img=[];let done=0,tot=N*SC,need=true;
const src=(s,f)=>`frames/s${s+1}/${String(f+1).padStart(3,'0')}.webp`;
for(let s=0;s<SC;s++)img[s]=new Array(N);
function load(s,f){if(img[s][f])return;const i=new Image();i.decoding='async';i.onload=()=>{i.ok=1;done++;bar.style.width=(done/tot*100)+'%';if(done==tot)bar.parentNode.classList.add('done');need=true};i.src=src(s,f);img[s][f]=i}
// progressive: keyframes of every scene first, then fill in
const order=[];for(const step of [12,4,2,1])for(let s=0;s<SC;s++)for(let f=0;f<N;f+=step)order.push([s,f]);
order.unshift(...Array.from({length:N},(_,f)=>[0,f]));
let q=0;const pump=()=>{let n=0;while(q<order.length&&n<8){load(...order[q++]);n++}if(q<order.length)setTimeout(pump,60)};pump();
function near(s,f){for(let d=0;d<N;d++){for(const g of[f-d,f+d]){const i=img[s][g];if(i&&i.ok)return i}}return null}
function fit(){const r=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*r;cv.height=innerHeight*r;need=true}
function draw(i,a){if(!i)return;const W=cv.width,H=cv.height,k=Math.max(W/i.naturalWidth,H/i.naturalHeight),w=i.naturalWidth*k,h=i.naturalHeight*k;cx.globalAlpha=a;cx.drawImage(i,(W-w)/2,(H-h)/2,w,h);cx.globalAlpha=1}
let last='';function frame(){requestAnimationFrame(frame);const y=scrollY+innerHeight*.5;let s=0;
for(let i=0;i<SC;i++)if(stages[i].offsetTop<=y)s=i;const el=stages[s];
const p=Math.min(1,Math.max(0,(scrollY-el.offsetTop+innerHeight*.5)/el.offsetHeight));
const f=Math.round(p*(N-1)),fade=s<SC-1&&p>.82?(p-.82)/.18:0,key=s+'|'+f+'|'+fade.toFixed(2);
if(key===last&&!need)return;last=key;need=false;
cx.fillStyle='#14110e';cx.fillRect(0,0,cv.width,cv.height);draw(near(s,f),1);if(fade>0)draw(near(s+1,0),fade)}
addEventListener('resize',fit);fit();frame();})();
