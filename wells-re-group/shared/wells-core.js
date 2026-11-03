/* Wells shared core: reveals, scroll progress vars, video scrub, forms, nav. No dependencies. */
(function(){
const $$=(s,r=document)=>[...r.querySelectorAll(s)],RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.12});
$$('[data-reveal]').forEach((el,i)=>{el.style.setProperty('--d',(el.dataset.reveal||0)+'ms');io.observe(el)});
// lazy + play on view
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){$$('source[data-src]',v).forEach(s=>{s.src=s.dataset.src;s.removeAttribute('data-src');v.load()});if(!v.hasAttribute('data-scrub'))v.play().catch(()=>{})}else if(!v.hasAttribute('data-scrub'))v.pause()}),{rootMargin:'200px'});
$$('video').forEach(v=>vio.observe(v));
// progress vars
const P=$$('[data-progress]'),S=$$('video[data-scrub]').map(v=>({v,host:v.closest('[data-progress]')||v.parentElement,t:0}));
let ticking=false;
function prog(el){const r=el.getBoundingClientRect(),h=innerHeight,mode=el.dataset.progress;let p;
 if(mode==='pin')p=-r.top/Math.max(1,r.height-h);else p=(h-r.top)/(h+r.height);return Math.min(1,Math.max(0,p))}
function frame(){ticking=false;P.forEach(el=>{const p=prog(el);el.style.setProperty('--p',p.toFixed(4));const steps=+el.dataset.steps;if(steps){const i=Math.min(steps-1,Math.floor(p*steps));if(el.dataset.i!=i){el.dataset.i=i;$$('[data-step]',el).forEach(s=>s.classList.toggle('on',+s.dataset.step===i))}}});
 const st=scrollY;document.documentElement.style.setProperty('--sy',st);const nav=document.querySelector('[data-nav]');if(nav){nav.classList.toggle('solid',st>60);nav.classList.toggle('hide',st>innerHeight&&st>(window.__ly||0)+4&&!document.documentElement.classList.contains('menu-open'));window.__ly=st}
 const bar=document.querySelector('[data-bar]');if(bar)bar.style.transform=`scaleX(${st/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(frame)}},{passive:true});addEventListener('resize',frame);frame();
// smooth scrub loop
(function loop(){S.forEach(o=>{const v=o.v;if(!v.duration)return;const p=+getComputedStyle(o.host).getPropertyValue('--p')||0;const target=p*(v.duration-.05);o.t+=(target-o.t)*(RM?1:.12);if(Math.abs(v.currentTime-o.t)>.015&&!v.seeking){try{v.currentTime=o.t}catch(e){}}});requestAnimationFrame(loop)})();
S.forEach(o=>{o.v.preload='auto';o.v.load();o.v.addEventListener('loadedmetadata',()=>{o.v.pause()})});
// menu
$$('[data-burger]').forEach(b=>b.addEventListener('click',()=>{const o=document.documentElement.classList.toggle('menu-open');b.setAttribute('aria-expanded',o)}));
$$('.menu a').forEach(a=>a.addEventListener('click',()=>document.documentElement.classList.remove('menu-open')));
// tabs
$$('[data-tabs]').forEach(t=>{const bs=$$('[role=tab]',t);bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>{x.setAttribute('aria-selected',x===b);document.getElementById(x.getAttribute('aria-controls')).hidden=x!==b});t.style.setProperty('--ti',bs.indexOf(b))}))});
$$('[data-topic]').forEach(a=>a.addEventListener('click',()=>{const b=document.querySelector(`[role=tab][data-t="${a.dataset.topic}"]`);if(b)b.click()}));
// gallery
$$('[data-gallery]').forEach(g=>{const main=$$('.g-main img',g)[0];$$('[data-full]',g).forEach(b=>b.addEventListener('click',()=>{main.style.opacity=0;setTimeout(()=>{main.src=b.dataset.full;main.onload=()=>main.style.opacity=1},220);$$('[data-full]',g).forEach(x=>x.classList.toggle('on',x===b))}))});
// forms (demo only)
$$('form.lead').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();let ok=true;$$('[required]',f).forEach(i=>{const bad=!i.value.trim()||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value));i.closest('.fld')?.classList.toggle('err',bad);if(bad)ok=false});if(!ok)return;const n=(f.querySelector('[name=name]')?.value||'').split(' ')[0];f.classList.add('sent');const t=f.querySelector('.thanks');if(t)t.querySelector('b').textContent=n?`Thank you, ${n}.`:'Thank you.';}));
// magnetic
if(matchMedia('(pointer:fine)').matches&&!RM)$$('[data-magnet]').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.25}px)`});b.addEventListener('mouseleave',()=>b.style.transform='')});
})();
