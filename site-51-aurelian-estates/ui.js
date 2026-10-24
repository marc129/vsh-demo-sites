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

/* Listing detail — full brokerage page; Casa Lumen unlocked */
const LISTINGS={
  'casa-lumen':{
    unlocked:true,
    title:'Casa Lumen',
    city:'Paradise Valley, AZ',
    loc:'6200 N Mockingbird Lane, Paradise Valley, Arizona',
    price:'$18,750,000',
    status:'For sale · Offered privately',
    beds:'6',baths:'8',sqft:'11,400',
    lot:'4.1 acres',year:'2019',type:'Single-family estate',
    pool:'26 m horizon pool',
    imgs:['img/l1.jpg','img/l2.jpg','img/l3.jpg','img/p.jpg'],
    labels:['Exterior','Living approach','Terrace','Grounds'],
    teaser:'Six bedrooms and a horizon pool on four acres of desert garden beneath Camelback.',
    paras:[
      'Drawn in light and desert stone, Casa Lumen opens across four acres beneath Camelback. Six bedrooms, a twenty-six metre horizon pool and a kitchen of warm brass and veined marble — offered privately for the first time.',
      'The principal rooms face the mountain and the evening city lights. Entertaining spaces open to sheltered outdoor rooms; the primary suite is held apart for quiet. Materials are lasting — stone, timber, metal — chosen to age with the house.',
      'Representation is exclusive. Viewings are accompanied and by appointment only, with floor notes and advisory remarks shared after a qualified introduction.'
    ],
    amenities:['Chef\'s kitchen','Wine cellar','Primary suite spa bath','Walk-in dressing room','26 m horizon pool','Outdoor kitchen','Fire terrace','Desert garden courtyard','Smart home system','4-car garage','EV charging','Security system'],
    details:[
      ['Property type','Single-family estate'],['Year built','2019'],['Lot size','4.1 acres'],
      ['Parking','4-car garage'],['Pool','26 m horizon'],['Heating','Forced air / radiant zones'],
      ['Cooling','Central air'],['HOA','None'],['Est. taxes','$86,400 / yr'],
      ['MLS® / Ref.','VSH-51840'],['Architect','Studio Solano'],['Views','Camelback & city lights'],
      ['Tenure','Fee simple'],['Showing','By appointment'],['Representation','Exclusive']
    ],
    hood:'Paradise Valley is valued for one-acre minimums, Camelback views and the quietest streets in the valley — close to dining and schools without the noise of a public listing cycle.'
  },
  'ridge-house':{
    unlocked:false,
    title:'The Ridge House',
    city:'Montecito, CA',
    loc:'1180 East Mountain Drive, Montecito, California',
    price:'$24,200,000',
    status:'By appointment',
    beds:'5',baths:'7',sqft:'9,850',
    lot:'2.4 acres',year:'2016',type:'Architectural villa',
    pool:'Infinity edge, ocean aspect',
    imgs:['img/l2.jpg','img/l1.jpg','img/l3.jpg'],
    labels:['Exterior','Approach','Terrace'],
    teaser:'A private ridge above the Pacific — five bedrooms of pale plaster and oak, with an infinity edge that meets the horizon.',
    paras:[],
    amenities:['Infinity pool','Guest pavilion','Chef\'s kitchen','Library / study','Garage parking','Security system','Outdoor kitchen','Radiant floors','Wine cellar','EV charging'],
    details:[],
    hood:'Montecito\'s private ridges remain among California\'s most quietly held addresses.'
  },
  'villa-ostra':{
    unlocked:false,
    title:'Villa Ostra',
    city:'Key Biscayne, FL',
    loc:'480 Crandon Boulevard, Key Biscayne, Florida',
    price:'$31,000,000',
    status:'Offered privately',
    beds:'7',baths:'9',sqft:'13,200',
    lot:'0.9 acres waterfront',year:'2021',type:'Waterfront residence',
    pool:'Lap pool & bay deck',
    imgs:['img/l3.jpg','img/l1.jpg','img/l2.jpg'],
    labels:['Exterior','Bay aspect','Approach'],
    teaser:'A waterfront villa of seven bedrooms facing Biscayne Bay, finished in coral stone and pale limestone.',
    paras:[],
    amenities:['Private deep-water dock','Lap pool','Chef\'s kitchen','Staff suite','Garage parking','Security system','Outdoor kitchen','Elevator','Wine cellar','Smart home system'],
    details:[],
    hood:'Key Biscayne offers waterfront privacy minutes from the city, with bay light and salt air as the daily measure.'
  }
};

const AGENT={
  name:'Eleanor Vance',
  role:'Principal Advisor, Southwest Estates',
  brand:'Aurelian Estates',
  blurb:'Eleanor has represented architect-designed homes across Arizona and California for sixteen years. She takes on no more than eight residences at a time.',
  phone:'',
  email:''
};

const root=$('#listingDetail'),panel=$('#ldPanel'),closeBtn=$('#ldClose'),backBtn=$('#ldBack'),homeBtn=$('#ldHome');
let lastFocus=null;

const setHero=(src,alt)=>{
  const main=document.querySelector('#ldGallery .ld-gal-main img');
  if(main){main.src=src||'';main.alt=alt||''}
  [...document.querySelectorAll('#ldThumbs button')].forEach(b=>b.classList.toggle('is-on',b.dataset.src===src));
};

const renderGallery=d=>{
  const gal=$('#ldGallery'), thumbs=$('#ldThumbs');
  const g=(d.imgs||[]).filter(Boolean);
  if(!g.length){gal.innerHTML='';thumbs.hidden=true;thumbs.innerHTML='';return}
  const main=g[0];
  let side=g.slice(1,3); while(side.length<2) side.push(main);
  gal.innerHTML=`<div class="ld-gal-main"><img src="${main}" alt="${d.title}" decoding="async">${g.length>1?'<button type="button" class="ld-gal-more" id="ldMore">'+g.length+' photos</button>':''}</div><div class="ld-gal-side">${side.map((u,i)=>`<button type="button" data-src="${u}" aria-label="${(d.labels&&d.labels[i+1])||'Photo'}"><img src="${u}" alt="" decoding="async"></button>`).join('')}</div>`;
  thumbs.innerHTML=g.map((u,i)=>`<button type="button" data-src="${u}" class="${i===0?'is-on':''}" aria-label="${(d.labels&&d.labels[i])||('Photo '+(i+1))}"><img src="${u}" alt=""></button>`).join('');
  thumbs.hidden=g.length<2;
  const pick=e=>{const b=e.target.closest('button[data-src]');if(!b)return;setHero(b.dataset.src,d.title)};
  gal.onclick=pick; thumbs.onclick=pick;
  const more=$('#ldMore'); if(more) more.onclick=e=>{e.stopPropagation();thumbs.hidden=false;thumbs.scrollIntoView({block:'nearest',behavior:'smooth'})};
};

const fill=d=>{
  const open=!!d.unlocked;
  root.classList.toggle('is-locked',!open);
  root.classList.toggle('is-unlocked',open);
  $('#ldTitle').textContent=d.title;
  $('#ldLoc').textContent=open?d.loc:d.city;
  $('#ldPrice').textContent=d.price;
  $('#ldStatus').textContent=open?d.status:'Private listing';
  const keys=[
    ['Bedrooms',d.beds],['Bathrooms',d.baths],['Interior',d.sqft+' sq ft'],
    ['Lot',open?d.lot:'——'],['Year',open?d.year:'——'],['Type',open?d.type:'——']
  ];
  $('#ldKeys').innerHTML=keys.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
  renderGallery(d);
  const paras=open?d.paras:[d.teaser];
  $('#ldDesc').innerHTML=paras.map(()=>'<p class="ld-desc"></p>').join('');
  [...$('#ldDesc').querySelectorAll('p')].forEach((p,i)=>{p.textContent=paras[i]});
  const amen=$('#ldAmen'); amen.innerHTML='';
  (open?d.amenities:d.amenities.slice(0,4).map(()=>'——')).forEach(a=>{const li=document.createElement('li');li.textContent=a;amen.append(li)});
  const tb=$('#ldTable'); tb.innerHTML='';
  const rows=open?d.details:[
    ['Property type','——'],['Year built','——'],['Lot size','——'],['Parking','——'],
    ['HOA','——'],['Est. taxes','——'],['MLS® / Ref.','——'],['Showing','——']
  ];
  rows.forEach(([k,v])=>{const tr=document.createElement('tr');const th=document.createElement('th');th.scope='row';th.textContent=k;const td=document.createElement('td');td.textContent=v;tr.append(th,td);tb.append(tr)});
  $('#ldMap').innerHTML=`<p class="ld-map-k">Location</p><p></p><p></p>`;
  const mps=[...$('#ldMap').querySelectorAll('p')];
  mps[1].textContent=open?d.loc:d.city;
  mps[2].textContent=open?d.hood:'Neighborhood notes are available with the private file.';
  const ag=$('#ldAgent');
  ag.innerHTML=`<p class="ld-agent-k">Listed by</p><h3></h3><p class="ld-agent-role"></p><p class="ld-agent-blurb"></p><p class="ld-agent-meta"></p>`;
  ag.querySelector('h3').textContent=AGENT.name;
  ag.querySelector('.ld-agent-role').textContent=AGENT.role+' · '+AGENT.brand;
  ag.querySelector('.ld-agent-blurb').textContent=AGENT.blurb;
  ag.querySelector('.ld-agent-meta').textContent='Enquire below for a private introduction.';
  const gate=$('#ldGate');
  if(gate){gate.hidden=open;gate.setAttribute('aria-hidden',open?'true':'false')}
  const enq=$('#ldEnquire');
  enq.textContent=open?'Request a private tour':'Request private details';
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
