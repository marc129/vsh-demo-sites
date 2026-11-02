(()=>{const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
// nav
const nav=$('#nav');let last=0;
const burger=$('.burger'),drawer=$('#drawer');
burger.addEventListener('click',()=>{const o=burger.getAttribute('aria-expanded')!=='true';burger.setAttribute('aria-expanded',o);drawer.classList.toggle('open',o);drawer.setAttribute('aria-hidden',!o);document.body.style.overflow=o?'hidden':''});
$$('#drawer a').forEach(a=>a.addEventListener('click',()=>burger.click()));
// split words
$$('.reveal-words').forEach(el=>{el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(' ')});
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.reveal').forEach((el,i)=>{el.style.transitionDelay=(el.parentElement.children.length>1?([...el.parentElement.children].indexOf(el)%4)*90:0)+'ms';io.observe(el)});
// videos: lazy + play when visible
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){const s=v.querySelector('source[data-src]');if(s){s.src=s.dataset.src;s.removeAttribute('data-src');v.load()}if(!reduce)v.play().catch(()=>{})}else v.pause()}),{threshold:.15});
$$('video.reel').forEach(v=>vio.observe(v));
// scrub
const scrub=$('[data-scrub]'),sv=$('.scrub-video'),frames=$$('.frame'),stage=$('.scrub-stage');
let dur=0;sv.addEventListener('loadedmetadata',()=>dur=sv.duration);sv.load();
let target=0,cur=0;
function scrubP(){const r=scrub.getBoundingClientRect();const tot=r.height-innerHeight;return Math.min(1,Math.max(0,-r.top/tot))}
// band
const band=$('[data-band]');
const words=$$('.statement .w'),bwords=$$('.band-title .w');
const bar=$('.progress span'),heroMedia=$('[data-parallax]');
function wordsFill(list,el,start=.85,end=.35){if(!list.length)return;const r=el.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight*start-r.top)/(innerHeight*(start-end))));const n=Math.round(p*list.length);list.forEach((w,i)=>w.classList.toggle('on',i<n))}
function frame(){const y=scrollY;
 nav.classList.toggle('solid',y>innerHeight*.8);nav.classList.toggle('hide',y>last&&y>innerHeight*1.2&&!drawer.classList.contains('open'));last=y;
 bar.style.transform=`scaleX(${y/(document.documentElement.scrollHeight-innerHeight)})`;
 if(!reduce&&y<innerHeight)heroMedia.style.transform=`translate3d(0,${y*.25}px,0)`;
 const p=scrubP();stage.style.setProperty('--p',p);target=p;
 const idx=Math.min(frames.length-1,Math.floor(p*frames.length*.999));frames.forEach((f,i)=>f.classList.toggle('on',i===idx));
 wordsFill(words,$('.statement'));wordsFill(bwords,$('.band-title'),.9,.5);
 const br=band.getBoundingClientRect();const bp=Math.min(1,Math.max(0,1-br.top/innerHeight));band.style.setProperty('--inset',(8*(1-bp))+'%');band.style.setProperty('--b',bp);
}
addEventListener('scroll',()=>requestAnimationFrame(frame),{passive:true});addEventListener('resize',frame);frame();
// smooth video seek loop
(function loop(){cur+=(target-cur)*.12;if(dur&&Math.abs(sv.currentTime-cur*dur)>.03&&!sv.seeking){try{sv.currentTime=cur*(dur-.05)}catch(e){}}requestAnimationFrame(loop)})();
// gallery
const main=$('.g-main img');$$('.g-thumbs button').forEach(b=>b.addEventListener('click',()=>{$$('.g-thumbs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');main.style.opacity=0;setTimeout(()=>{main.src=b.querySelector('img').src;main.style.opacity=1},250)}));
// tabs
const tabs=$$('.tabs button'),ink=$('.tab-ink');
function setInk(b){ink.style.left=b.offsetLeft+'px';ink.style.width=b.offsetWidth+'px'}
tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(t=>t.setAttribute('aria-selected',t===b));$$('form.lead').forEach(f=>f.hidden=f.dataset.form!==b.dataset.tab);$('.thanks').hidden=true;setInk(b)}));
document.fonts.ready.then(()=>setInk(tabs[0]));addEventListener('resize',()=>setInk($('.tabs [aria-selected=true]')));
$$('.fld select').forEach(s=>s.addEventListener('change',()=>s.classList.add('has')));
$$('form.lead').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();let ok=true;$$('[required]',f).forEach(i=>{const bad=!i.value||(i.type==='email'&&!/^\S+@\S+\.\S+$/.test(i.value));i.closest('.fld').classList.toggle('err',bad);if(bad)ok=false});if(!ok)return;f.hidden=true;$('.thanks').hidden=false}));
$$('[data-topic]').forEach(a=>a.addEventListener('click',()=>{$('.tabs [data-tab=buy]').click()}));
// magnet + tilt
if(fine&&!reduce){$$('.magnet').forEach(m=>{m.addEventListener('mousemove',e=>{const r=m.getBoundingClientRect();m.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.3}px)`});m.addEventListener('mouseleave',()=>m.style.transform='')});
$$('.tilt').forEach(t=>{t.addEventListener('mousemove',e=>{const r=t.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform=`perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg) translateY(-4px)`});t.addEventListener('mouseleave',()=>t.style.transform='')})}
})();
