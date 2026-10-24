(()=>{const $=s=>document.querySelector(s),nav=$('#nav'),tg=$('#menuTg'),menu=$('#menu');
const onS=()=>nav.classList.toggle('solid',scrollY>40);addEventListener('scroll',onS,{passive:true});onS();
tg.onclick=()=>{const o=nav.classList.toggle('open');tg.setAttribute('aria-expanded',o);tg.setAttribute('aria-label',o?'Close menu':'Open menu')};
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>{nav.classList.remove('open');tg.setAttribute('aria-expanded',false)});
const as=$('#assistant'),ask=$('#ask'),log=$('#asLog');const tog=o=>{as.hidden=!o;ask.setAttribute('aria-expanded',o);if(o)$('#asIn').focus()};
ask.onclick=()=>tog(as.hidden);$('#asClose').onclick=()=>tog(false);
const A=q=>/value|worth|estimate/i.test(q)?'I can prepare a private estimate. Share your address in the Value my home form and an advisor reviews it within a day.':/view|tour|visit|book/i.test(q)?'Viewings of Casa Lumen are accompanied and by appointment. Use the enquiry form and Eleanor will propose times.':'Casa Lumen has six bedrooms, a 26 metre horizon pool and four acres of desert garden in Paradise Valley, offered at $18,750,000.';
const say=q=>{log.insertAdjacentHTML('beforeend','<p class="as-me"></p>');log.lastChild.textContent=q;setTimeout(()=>{log.insertAdjacentHTML('beforeend','<p class="as-bot"></p>');log.lastChild.textContent=A(q);log.scrollTop=1e5},450)};
as.querySelectorAll('.as-quick button').forEach(b=>b.onclick=()=>say(b.textContent));
$('#asForm').onsubmit=e=>{e.preventDefault();const v=$('#asIn').value.trim();if(v){say(v);$('#asIn').value=''}};

/* Listing detail — gated private content; Casa Lumen unlocked for demo */
const LISTINGS={
  'casa-lumen':{
    unlocked:true,
    title:'Casa Lumen',
    city:'Paradise Valley, AZ',
    loc:'6200 N Mockingbird Lane, Paradise Valley, Arizona',
    price:'$18,750,000',
    status:'Offered privately',
    beds:'6',baths:'8',sqft:'11,400',
    lot:'4.1 acres',year:'2019',
    pool:'26 m horizon pool',
    img:'img/l1.jpg',
    teaser:'Six bedrooms and a horizon pool on four acres of desert garden beneath Camelback.',
    desc:'Drawn in light and desert stone, Casa Lumen opens across four acres beneath Camelback. Six bedrooms, a horizon pool and a kitchen of warm brass and veined marble — offered privately for the first time.',
    facts:[['Architect','Studio Solano'],['Parking','4-car garage'],['Views','Camelback & city lights'],['Tenure','Fee simple']]
  },
  'ridge-house':{
    unlocked:false,
    title:'The Ridge House',
    city:'Montecito, CA',
    loc:'1180 East Mountain Drive, Montecito, California',
    price:'$24,200,000',
    status:'By appointment',
    beds:'5',baths:'7',sqft:'9,850',
    lot:'2.4 acres',year:'2016',
    pool:'Infinity edge, ocean aspect',
    img:'img/l2.jpg',
    teaser:'A private ridge above the Pacific — five bedrooms of pale plaster and oak, with an infinity edge that meets the horizon.',
    desc:'Set on a private ridge above the Pacific, The Ridge House is five bedrooms of pale plaster and oak, with an infinity edge that meets the horizon. Quiet grounds, mature oaks, and a guest pavilion held apart from the main wing.',
    facts:[['Architect','Hearth & Line'],['Parking','3-car garage'],['Views','Pacific & Channel Islands'],['Tenure','Fee simple']]
  },
  'villa-ostra':{
    unlocked:false,
    title:'Villa Ostra',
    city:'Key Biscayne, FL',
    loc:'480 Crandon Boulevard, Key Biscayne, Florida',
    price:'$31,000,000',
    status:'Offered privately',
    beds:'7',baths:'9',sqft:'13,200',
    lot:'0.9 acres waterfront',year:'2021',
    pool:'Lap pool & bay deck',
    img:'img/l3.jpg',
    teaser:'A waterfront villa of seven bedrooms facing Biscayne Bay, finished in coral stone and pale limestone.',
    desc:'A waterfront villa of seven bedrooms facing Biscayne Bay, finished in coral stone and pale limestone. Direct dock access, a chef’s kitchen, and principal suites that open to the salt air — represented quietly, without public marketing.',
    facts:[['Architect','Maré Atelier'],['Dock','Private deep-water'],['Views','Biscayne Bay'],['Tenure','Fee simple']]
  }
};

const root=$('#listingDetail'),panel=$('#ldPanel'),closeBtn=$('#ldClose'),backBtn=$('#ldBack'),homeBtn=$('#ldHome');
let lastFocus=null;

const fill=d=>{
  const open=!!d.unlocked;
  root.classList.toggle('is-locked',!open);
  root.classList.toggle('is-unlocked',open);
  $('#ldTitle').textContent=d.title;
  $('#ldLoc').textContent=open?d.loc:d.city;
  $('#ldPrice').textContent=d.price;
  $('#ldStatus').textContent=open?d.status:'Private listing';
  $('#ldSpec').textContent=`${d.beds} bd  ·  ${d.baths} ba  ·  ${d.sqft} sq ft`;
  const img=$('#ldImg');img.src=d.img;img.alt=d.title;
  $('#ldDesc').textContent=open?d.desc:d.teaser;
  const facts=$('#ldFacts');facts.innerHTML='';
  const rows=open
    ?[['Bedrooms',d.beds],['Bathrooms',d.baths],['Interior',d.sqft+' sq ft'],['Lot',d.lot],['Year',d.year],['Pool',d.pool],...d.facts]
    :[['Bedrooms',d.beds],['Bathrooms',d.baths],['Interior',d.sqft+' sq ft'],['Lot','——'],['Year','——'],['Pool','——'],['Architect','——'],['Views','——']];
  rows.forEach(([k,v])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;facts.append(dt,dd)});
  const gate=$('#ldGate');
  if(gate){gate.hidden=open;gate.setAttribute('aria-hidden',open?'true':'false')}
  const enq=$('#ldEnquire');
  enq.textContent=open?'Enquire about this residence':'Request private details';
  enq.href='#contact';
  enq.onclick=()=>{close();setTimeout(()=>{const sel=document.querySelector('#contact select');if(sel){for(const o of sel.options){if(o.textContent===d.title){sel.value=o.value;break}}}},50)};
};

const focusables=()=>[...panel.querySelectorAll('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])')].filter(el=>el.offsetParent!==null||el===closeBtn);

let pushLock=false;
const open=id=>{
  const d=LISTINGS[id];if(!d)return;
  lastFocus=document.activeElement;
  fill(d);
  root.hidden=false;
  root.scrollTop=0;
  document.body.classList.add('ld-open');
  if(window.lenis)try{window.lenis.stop()}catch(e){}
  backBtn.focus();
  pushLock=true;
  try{history.pushState({ld:id},'',location.pathname+location.search+'#listing/'+id)}catch(e){}
  pushLock=false;
};

const close=(fromPop)=>{
  if(root.hidden)return;
  root.hidden=true;
  document.body.classList.remove('ld-open');
  if(window.lenis)try{window.lenis.start()}catch(e){}
  if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();
  lastFocus=null;
  if(!fromPop){
    pushLock=true;
    try{if(location.hash.indexOf('#listing/')===0)history.pushState(null,'',location.pathname+location.search)}catch(e){}
    pushLock=false;
  }
};
addEventListener('popstate',()=>{if(!pushLock&&!root.hidden)close(true)});

document.querySelectorAll('.card[data-listing]').forEach(card=>{
  const go=()=>open(card.dataset.listing);
  card.addEventListener('click',go);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
});
const hint=document.querySelector('.list-hint a[href="#listing-casa-lumen"]');
if(hint)hint.addEventListener('click',e=>{e.preventDefault();const c=document.getElementById('listing-casa-lumen');if(c){c.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>open('casa-lumen'),350)}});

closeBtn.onclick=()=>close(false);backBtn.onclick=()=>close(false);if(homeBtn)homeBtn.onclick=()=>close(false);

panel.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||root.hidden)return;
  const list=focusables();if(!list.length)return;
  const first=list[0],last=list[list.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});

addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(!root.hidden){close(false);return}
    tog(false);nav.classList.remove('open')
  }
});
})();
