/*! VSH Media — full brokerage listing detail (Zillow/Havenlytics-style; one unlocked sample) */
(function () {
  if (window.__vshListingGate) return;
  window.__vshListingGate = true;

  var AMENITY_POOL = [
    'Chef\'s kitchen','Wine cellar','Primary suite spa bath','Walk-in dressing room',
    'Home theatre','Library / study','Guest pavilion','Staff suite',
    'Heated pool','Outdoor kitchen','Fire terrace','Garden courtyard',
    'Smart home system','Central air','Radiant floors','Generator',
    'Garage parking','EV charging','Security system','Elevator'
  ];

  function css() {
    if (document.getElementById('vsh-lg-css')) return;
    var s = document.createElement('style');
    s.id = 'vsh-lg-css';
    s.textContent = [
      '.vsh-lg-hint{margin:0 0 1.25rem;font-size:14px;line-height:1.6;opacity:.72;max-width:56ch}',
      '.vsh-lg-hint a{color:inherit;text-decoration:none;border-bottom:1px solid color-mix(in srgb,currentColor 55%,transparent)}',
      '.vsh-lg-cue{display:block;font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.75;margin:.35rem 0 .2rem;font-weight:400}',
      'article[data-lst].vsh-lg-sample,article.lst.vsh-lg-sample{cursor:pointer}',
      '.vsh-lg-root{position:fixed;inset:0;z-index:10050;display:block;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;height:100%;height:100dvh;background:var(--panel,var(--bg,#0f0e0c));color:inherit}',
      '.vsh-lg-root[hidden]{display:none!important}',
      '.vsh-lg-page{min-height:100%;width:100%;max-width:1180px;margin:0 auto;display:flex;flex-direction:column}',
      '.vsh-lg-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;background:color-mix(in srgb,var(--panel,var(--bg,#0f0e0c)) 94%,transparent);border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent);backdrop-filter:blur(10px)}',
      '.vsh-lg-back,.vsh-lg-close{background:transparent;border:0;color:inherit;font:inherit;font-size:12px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;padding:10px 0;opacity:.88;min-height:44px}',
      '.vsh-lg-back:hover,.vsh-lg-close:hover{opacity:1}',
      '.vsh-lg-gallery{display:grid;grid-template-columns:1.55fr 1fr;gap:8px;padding:8px 8px 0;width:100%}',
      '.vsh-lg-gal-main{position:relative;aspect-ratio:16/10;background:color-mix(in srgb,currentColor 8%,transparent);overflow:hidden;min-height:0}',
      '.vsh-lg-gal-main img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}',
      '.vsh-lg-gal-side{display:grid;grid-template-rows:1fr 1fr;gap:8px;min-height:0}',
      '.vsh-lg-gal-side button{position:relative;border:0;padding:0;margin:0;background:color-mix(in srgb,currentColor 8%,transparent);overflow:hidden;cursor:pointer;aspect-ratio:16/10}',
      '.vsh-lg-gal-side img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}',
      '.vsh-lg-gal-more{position:absolute;left:12px;bottom:12px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;padding:8px 12px;background:color-mix(in srgb,var(--panel,var(--bg,#0f0e0c)) 78%,transparent);color:inherit;border:0;cursor:pointer}',
      '.vsh-lg-thumbs{display:flex;gap:8px;overflow-x:auto;padding:10px 8px 0;-webkit-overflow-scrolling:touch;scrollbar-width:thin}',
      '.vsh-lg-thumbs button{flex:0 0 auto;width:88px;height:62px;padding:0;border:1px solid transparent;background:color-mix(in srgb,currentColor 8%,transparent);overflow:hidden;cursor:pointer}',
      '.vsh-lg-thumbs button.is-on{border-color:color-mix(in srgb,currentColor 55%,transparent)}',
      '.vsh-lg-thumbs img{width:100%;height:100%;object-fit:cover;display:block}',
      '.vsh-lg-main{padding:36px 28px 40px;display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,0.85fr);gap:40px 48px;align-items:start}',
      '.vsh-lg-kicker{font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.65;margin:0 0 14px}',
      '.vsh-lg-title{font-size:clamp(32px,4.5vw,50px);line-height:1.06;font-weight:400;margin:0 0 10px;overflow-wrap:anywhere}',
      '.vsh-lg-loc{font-size:15px;opacity:.72;margin:0 0 18px;overflow-wrap:anywhere}',
      '.vsh-lg-price{font-size:clamp(28px,3.2vw,38px);line-height:1.15;margin:0 0 10px;font-weight:400}',
      '.vsh-lg-keyfacts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 18px;margin:0 0 28px;padding:20px 0;border-top:1px solid color-mix(in srgb,currentColor 16%,transparent);border-bottom:1px solid color-mix(in srgb,currentColor 16%,transparent)}',
      '.vsh-lg-keyfacts div{min-width:0}',
      '.vsh-lg-keyfacts span{display:block;font-size:10px;letter-spacing:.18em;text-transform:uppercase;opacity:.62;margin:0 0 6px}',
      '.vsh-lg-keyfacts b{display:block;font-size:18px;font-weight:400;overflow-wrap:anywhere}',
      '.vsh-lg-sec{margin:0 0 32px}',
      '.vsh-lg-sec h2{font-size:13px;letter-spacing:.22em;text-transform:uppercase;font-weight:400;opacity:.7;margin:0 0 14px}',
      '.vsh-lg-desc{font-size:17px;line-height:1.75;max-width:68ch;margin:0 0 14px;opacity:.92}',
      '.vsh-lg-desc:last-child{margin-bottom:0}',
      '.vsh-lg-amenities{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px}',
      '.vsh-lg-amenities li{font-size:15px;line-height:1.45;padding-left:14px;position:relative;overflow-wrap:anywhere}',
      '.vsh-lg-amenities li:before{content:"";position:absolute;left:0;top:.62em;width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.45}',
      '.vsh-lg-table{width:100%;border-collapse:collapse;font-size:15px}',
      '.vsh-lg-table th,.vsh-lg-table td{padding:12px 0;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent);text-align:left;vertical-align:top;overflow-wrap:anywhere}',
      '.vsh-lg-table th{width:42%;font-weight:400;opacity:.62;font-size:12px;letter-spacing:.12em;text-transform:uppercase;padding-right:16px}',
      '.vsh-lg-map{border:1px solid color-mix(in srgb,currentColor 16%,transparent);padding:22px 20px;min-height:140px}',
      '.vsh-lg-map p{margin:0 0 8px;font-size:15px;line-height:1.55;opacity:.88}',
      '.vsh-lg-map .vsh-lg-map-k{font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.6;margin:0 0 12px}',
      '.vsh-lg-aside{position:sticky;top:72px;display:flex;flex-direction:column;gap:18px}',
      '.vsh-lg-agent{border:1px solid color-mix(in srgb,currentColor 16%,transparent);padding:22px 20px}',
      '.vsh-lg-agent .vsh-lg-agent-k{font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.6;margin:0 0 12px}',
      '.vsh-lg-agent h3{font-size:22px;font-weight:400;margin:0 0 6px;line-height:1.2}',
      '.vsh-lg-agent .vsh-lg-agent-role{font-size:13px;opacity:.68;margin:0 0 14px}',
      '.vsh-lg-agent p{font-size:14px;line-height:1.55;opacity:.82;margin:0 0 16px}',
      '.vsh-lg-agent .vsh-lg-agent-meta{font-size:13px;opacity:.7;margin:0;line-height:1.5}',
      '.vsh-lg-enquire{display:inline-flex;align-items:center;justify-content:center;padding:16px 22px;min-height:52px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;background:currentColor;color:var(--panel,var(--bg,#0f0e0c));border:0;width:100%;text-align:center;box-sizing:border-box}',
      '.vsh-lg-home{background:transparent;color:inherit;border:1px solid color-mix(in srgb,currentColor 45%,transparent);padding:15px 22px;min-height:50px;font:inherit;font-size:11px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;width:100%}',
      '.vsh-lg-gate-wrap{position:relative}',
      '.vsh-lg-private{transition:filter .3s}',
      '.vsh-lg-root.is-locked .vsh-lg-private{filter:blur(5px);opacity:.5;user-select:none;pointer-events:none}',
      '.vsh-lg-gate{position:absolute;inset:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:20px 12px;background:color-mix(in srgb,var(--panel,var(--bg,#0f0e0c)) 84%,transparent);z-index:2}',
      '.vsh-lg-gate[hidden]{display:none}',
      '.vsh-lg-gate-k{font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.8;margin:0 0 12px}',
      '.vsh-lg-gate-line{font-size:clamp(20px,2.6vw,26px);line-height:1.35;font-style:italic;max-width:30ch;margin:0 0 12px;opacity:.95}',
      '.vsh-lg-gate-hint{font-size:13px;line-height:1.55;opacity:.7;max-width:42ch;margin:0}',
      '.vsh-lg-foot{padding:0 28px 72px}',
      'body.vsh-lg-open{overflow:hidden}',
      '@media(max-width:900px){',
      '.vsh-lg-gallery{grid-template-columns:1fr;gap:6px}',
      '.vsh-lg-gal-side{grid-template-columns:1fr 1fr;grid-template-rows:none}',
      '.vsh-lg-gal-side button{aspect-ratio:4/3}',
      '.vsh-lg-gal-main{aspect-ratio:4/3}',
      '.vsh-lg-main{grid-template-columns:1fr;padding:28px 18px 24px;gap:28px}',
      '.vsh-lg-aside{position:static}',
      '.vsh-lg-keyfacts{grid-template-columns:repeat(2,minmax(0,1fr))}',
      '.vsh-lg-amenities{grid-template-columns:1fr}',
      '.vsh-lg-foot{padding:0 18px 64px}',
      '.vsh-lg-root.is-locked .vsh-lg-private{filter:blur(4px)}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}

  function siteBrand(){
    var logo=document.querySelector('a.logo, .logo, .lg-script, header .brand, #nav .mark, nav .logo');
    var t=text(logo)||document.title||'Advisory';
    return t.split(/[·|—–-]/)[0].trim().slice(0,48)||'Advisory';
  }

  function siteAgent(){
    var sec=document.querySelector('#agent, #team, section.agent, .agent-copy, [id*="agent"]');
    var name='', role='', blurb='', phone='', email='';
    if(sec){
      name=text(sec.querySelector('h2, h3, .name, .agent-name'));
      role=text(sec.querySelector('.role, .title, .kicker, .eyebrow, p.meta'));
      var ps=[].slice.call(sec.querySelectorAll('p')).map(text).filter(function(p){return p.length>40});
      blurb=ps[0]||'';
      var tel=sec.querySelector('a[href^="tel"]'); if(tel) phone=text(tel)||tel.getAttribute('href').replace('tel:','');
      var em=sec.querySelector('a[href^="mailto"]'); if(em) email=text(em)||em.getAttribute('href').replace('mailto:','');
    }
    if(!name){
      var person=document.querySelector('[itemtype*="Person"] [itemprop="name"], .founder, .principal');
      name=text(person);
    }
    if(!name) name=siteBrand();
    if(!role) role='Private client advisor';
    if(!blurb) blurb='Representing a small number of residences with discretion. Viewings by appointment.';
    return {name:name, role:role, blurb:blurb.slice(0,220), phone:phone, email:email, brand:siteBrand()};
  }

  function parseCard(card, i, allImgs){
    var imgs=[].slice.call(card.querySelectorAll('img.orig, img.staged, img')).map(function(img){
      return img.currentSrc||img.src;
    }).filter(Boolean);
    // unique preserve order
    var seen={}; imgs=imgs.filter(function(u){if(seen[u])return false; seen[u]=1; return true});
    var title = text(card.querySelector('h3, .addr, .lbl b, [class*="title"]')) || (card.querySelector('img')&&card.querySelector('img').alt) || ('Residence '+(i+1));
    var price = '';
    card.querySelectorAll('.price, .ov .price, .lbl span, b, span').forEach(function(n){
      var t=text(n); if(/\$[\d,.]+/.test(t) && !price) price=t.match(/\$[\d,.]+[MKmk]?/)[0];
    });
    if(!price){var m=(card.textContent||'').match(/\$[\d,.]+(?:\s*[Mm])?/); price=m?m[0]:'Price on request'}
    var loc='';
    card.querySelectorAll('.addr, .lbl span, p, .ov .addr').forEach(function(n){
      var t=text(n); if(t && t!==title && !/^\$/.test(t) && t.length<90 && !loc && !/bd|ba|sq\s*ft|open sample|view /i.test(t)) loc=t.replace(/\s*·\s*/g,' · ');
    });
    if(!loc) loc=title;
    var beds='', baths='', sqft='';
    var bm=(card.textContent||'').match(/(\d+)\s*bd/i); if(bm) beds=bm[1];
    var ba=(card.textContent||'').match(/(\d+)\s*ba/i); if(ba) baths=ba[1];
    var sm=(card.textContent||'').match(/([\d,]+)\s*sq\s*ft/i); if(sm) sqft=sm[1];
    return {
      card:card, title:title, price:price, loc:loc, city:loc.split('·').pop().trim(),
      imgs: imgs.length?imgs:[],
      beds: beds||String(4+((i*2)%3)), baths: baths||String(5+((i*3)%4)),
      sqft: sqft||String((6200+i*850)).replace(/\B(?=(\d{3})+(?!\d))/g,','),
      unlocked: i===0,
      i:i
    };
  }

  function pickAmenities(n, count){
    var out=[], start=n%AMENITY_POOL.length;
    for(var k=0;k<count;k++) out.push(AMENITY_POOL[(start+k*3)%AMENITY_POOL.length]);
    return out;
  }

  function invent(d, poolImgs, agent){
    var n = d.title.length*17+d.price.length+d.i*41;
    var fullAddr = d.loc;
    if(d.unlocked && !/\d/.test(d.loc)){
      fullAddr = (200+(n%700))+' '+d.loc.replace(/^[^·]*·\s*/,'');
    }
    var lot = (0.35+(n%40)/20).toFixed(2)+' acres';
    var year = String(2008+(n%16));
    var type = ['Single-family estate','Waterfront residence','Architectural villa','Private compound'][n%4];
    var hoa = ['None','$420 / mo','$1,850 / qtr','$2,400 / yr'][n%4];
    var tax = '$'+(28000+ (n%50)*1700).toLocaleString('en-US')+' / yr';
    var mls = 'VSH-'+(48000+(n*97)%50000);
    var parking = (2+(n%4))+'-car garage';
    var gallery = d.imgs.slice();
    poolImgs.forEach(function(u){ if(gallery.indexOf(u)<0) gallery.push(u); });
    if(!gallery.length) gallery=[''];
    gallery = gallery.slice(0,6);
    var labels = ['Exterior','Living','Kitchen','Terrace','Grounds','Approach'];
    var amen = pickAmenities(n, 10);
    var p1 = d.title+' is presented for discerning buyers seeking a residence of real presence. '+d.beds+' bedrooms and '+d.baths+' baths unfold across roughly '+d.sqft+' square feet, finished with the restraint this market expects.';
    var p2 = 'Light moves through the principal rooms from morning to evening. Entertaining spaces open to sheltered outdoor rooms; the primary suite is held apart for quiet. Materials are lasting — stone, timber, metal — chosen to age with the house rather than announce themselves.';
    var p3 = 'The grounds are private without being remote, with established planting and a considered approach. Representation is exclusive; viewings are accompanied and by appointment only.';
    var hood = (d.city||'This neighbourhood')+' is valued for its privacy, measured scale, and proximity to the places residents actually use — dining, schools, and open land — without the noise of a public listing cycle.';
    return {
      unlocked:d.unlocked,
      title:d.title,
      status: d.unlocked ? 'For sale · Offered privately' : 'Private listing',
      loc: d.unlocked ? fullAddr : d.city,
      city: d.city,
      price:d.price,
      beds:d.beds, baths:d.baths, sqft:d.sqft, lot:lot, year:year, type:type,
      gallery:gallery, labels:labels,
      teaser: 'A quietly offered residence in '+d.city+'. Full address, floor notes and advisory remarks are held for qualified enquiries.',
      paras: d.unlocked ? [p1,p2,p3] : [d.teaser||('A quietly offered residence in '+d.city+'.')],
      amenities: amen,
      details: d.unlocked ? [
        ['Property type', type],
        ['Year built', year],
        ['Lot size', lot],
        ['Parking', parking],
        ['Heating', 'Forced air / radiant zones'],
        ['Cooling', 'Central air'],
        ['HOA', hoa],
        ['Est. taxes', tax],
        ['MLS® / Ref.', mls],
        ['Tenure', 'Fee simple'],
        ['Showing', 'By appointment'],
        ['Representation', 'Exclusive']
      ] : [
        ['Property type', '——'],
        ['Year built', '——'],
        ['Lot size', '——'],
        ['Parking', '——'],
        ['HOA', '——'],
        ['Est. taxes', '——'],
        ['MLS® / Ref.', '——'],
        ['Showing', '——']
      ],
      hood: hood,
      agent: agent
    };
  }

  function ensureRoot(){
    var root=document.getElementById('vshListingGate');
    if(root) return root;
    root=document.createElement('div');
    root.id='vshListingGate';
    root.className='vsh-lg-root';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-labelledby','vshLgTitle');
    root.setAttribute('data-lenis-prevent','');
    root.setAttribute('data-lenis-prevent-wheel','');
    root.setAttribute('data-lenis-prevent-touch','');
    root.hidden=true;
    root.innerHTML=[
      '<div class="vsh-lg-page" id="vshLgPanel">',
      '<div class="vsh-lg-top">',
      '<button type="button" class="vsh-lg-back" id="vshLgBack">← Back to residences</button>',
      '<button type="button" class="vsh-lg-close" id="vshLgClose">Close</button>',
      '</div>',
      '<div class="vsh-lg-gallery" id="vshLgGallery"></div>',
      '<div class="vsh-lg-thumbs" id="vshLgThumbs" hidden></div>',
      '<div class="vsh-lg-main">',
      '<div class="vsh-lg-col">',
      '<p class="vsh-lg-kicker" id="vshLgStatus"></p>',
      '<h1 class="vsh-lg-title" id="vshLgTitle"></h1>',
      '<p class="vsh-lg-loc" id="vshLgLoc"></p>',
      '<p class="vsh-lg-price" id="vshLgPrice"></p>',
      '<div class="vsh-lg-keyfacts" id="vshLgKeys"></div>',
      '<div class="vsh-lg-gate-wrap">',
      '<div class="vsh-lg-private" id="vshLgPrivate">',
      '<section class="vsh-lg-sec"><h2>About this home</h2><div id="vshLgDesc"></div></section>',
      '<section class="vsh-lg-sec"><h2>Features &amp; amenities</h2><ul class="vsh-lg-amenities" id="vshLgAmen"></ul></section>',
      '<section class="vsh-lg-sec"><h2>Property details</h2><table class="vsh-lg-table"><tbody id="vshLgTable"></tbody></table></section>',
      '<section class="vsh-lg-sec"><h2>Neighborhood</h2><div class="vsh-lg-map" id="vshLgMap"></div></section>',
      '</div>',
      '<div class="vsh-lg-gate" id="vshLgGate" hidden>',
      '<p class="vsh-lg-gate-k">Private details</p>',
      '<p class="vsh-lg-gate-line">Full address, gallery notes and advisory remarks are held for qualified enquiries.</p>',
      '<p class="vsh-lg-gate-hint" id="vshLgGateHint">Open the residence marked Open sample to preview a complete listing page.</p>',
      '</div></div>',
      '</div>',
      '<aside class="vsh-lg-aside">',
      '<div class="vsh-lg-agent" id="vshLgAgent"></div>',
      '<a class="vsh-lg-enquire" id="vshLgEnquire" href="#contact">Request a private tour</a>',
      '<button type="button" class="vsh-lg-home" id="vshLgHome">Back to residences</button>',
      '</aside>',
      '</div>',
      '<div class="vsh-lg-foot"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(root);
    return root;
  }

  function init(){
    css();
    var cards=[].slice.call(document.querySelectorAll('#listings article[data-lst], #properties article[data-lst], section[id="listings"] article.lst, section[id="listings"] article[data-lst]'));
    if(!cards.length) cards=[].slice.call(document.querySelectorAll('article[data-lst]'));
    cards=cards.filter(function(c,i,a){return a.indexOf(c)===i});
    if(!cards.length) return;

    var data=cards.map(function(c,i){return parseCard(c,i)});
    var poolImgs=[];
    data.forEach(function(d){ d.imgs.forEach(function(u){ if(poolImgs.indexOf(u)<0) poolImgs.push(u); }); });
    var agent=siteAgent();
    var sampleName=data[0].title;
    var section=cards[0].closest('#listings, #properties, section')||cards[0].parentElement;
    if(section && !section.querySelector('.vsh-lg-hint')){
      var hint=document.createElement('p');
      hint.className='vsh-lg-hint';
      hint.innerHTML='Open <a href="#vsh-lg-sample">'+sampleName.replace(/</g,'')+'</a> to preview a full listing. Other residences show a private teaser.';
      var grid=section.querySelector('.g, .cards, .grid, .listings')||cards[0].parentElement;
      if(grid && grid.parentElement) grid.parentElement.insertBefore(hint, grid);
    }

    cards[0].classList.add('vsh-lg-sample');
    cards[0].id=cards[0].id||'vsh-lg-sample';
    if(!cards[0].querySelector('.vsh-lg-cue')){
      var cue=document.createElement('span');
      cue.className='vsh-lg-cue';
      cue.textContent='Open sample';
      var meta=cards[0].querySelector('h3, .addr, .lbl b, .d h3, .ov .addr');
      if(meta && meta.parentElement) meta.parentElement.insertBefore(cue, meta.nextSibling);
      else cards[0].appendChild(cue);
    }

    var root=ensureRoot();
    var panel=document.getElementById('vshLgPanel');
    var lastFocus=null;
    var pushLock=false;
    var currentGallery=[];

    function setHero(src, alt){
      var main=document.querySelector('#vshLgGallery .vsh-lg-gal-main img');
      if(main){ main.src=src||''; main.alt=alt||''; }
      [].slice.call(document.querySelectorAll('#vshLgThumbs button')).forEach(function(b){
        b.classList.toggle('is-on', b.getAttribute('data-src')===src);
      });
    }

    function renderGallery(d){
      var gal=document.getElementById('vshLgGallery');
      var thumbs=document.getElementById('vshLgThumbs');
      currentGallery=d.gallery.filter(Boolean);
      if(!currentGallery.length){
        gal.innerHTML='<div class="vsh-lg-gal-main"></div>';
        thumbs.hidden=true; thumbs.innerHTML='';
        return;
      }
      var main=currentGallery[0];
      var side=currentGallery.slice(1,3);
      while(side.length<2) side.push(main);
      gal.innerHTML=
        '<div class="vsh-lg-gal-main"><img src="'+main.replace(/"/g,'&quot;')+'" alt="'+(d.title||'').replace(/"/g,'&quot;')+'" decoding="async">'+(currentGallery.length>1?'<button type="button" class="vsh-lg-gal-more" id="vshLgMore">'+currentGallery.length+' photos</button>':'')+'</div>'+
        '<div class="vsh-lg-gal-side">'+
        side.map(function(u,i){return '<button type="button" data-src="'+u.replace(/"/g,'&quot;')+'" aria-label="'+(d.labels[i+1]||'Photo')+'"><img src="'+u.replace(/"/g,'&quot;')+'" alt="" decoding="async"></button>';}).join('')+
        '</div>';
      thumbs.innerHTML=currentGallery.map(function(u,i){
        return '<button type="button" data-src="'+u.replace(/"/g,'&quot;')+'" class="'+(i===0?'is-on':'')+'" aria-label="'+(d.labels[i]||('Photo '+(i+1)))+'"><img src="'+u.replace(/"/g,'&quot;')+'" alt=""></button>';
      }).join('');
      thumbs.hidden=currentGallery.length<2;
      function pick(e){
        var b=e.target.closest('button[data-src]');
        if(!b) return;
        setHero(b.getAttribute('data-src'), d.title);
      }
      gal.onclick=pick;
      thumbs.onclick=pick;
      var more=document.getElementById('vshLgMore');
      if(more) more.onclick=function(e){ e.stopPropagation(); thumbs.hidden=false; thumbs.scrollIntoView({block:'nearest',behavior:'smooth'}); };
    }

    function fill(d){
      var open=!!d.unlocked;
      root.classList.toggle('is-locked', !open);
      root.classList.toggle('is-unlocked', open);
      document.getElementById('vshLgTitle').textContent=d.title;
      document.getElementById('vshLgLoc').textContent=d.loc;
      document.getElementById('vshLgPrice').textContent=d.price;
      document.getElementById('vshLgStatus').textContent=d.status;
      var keys=document.getElementById('vshLgKeys');
      var keyRows=[
        ['Bedrooms', d.beds],
        ['Bathrooms', d.baths],
        ['Interior', d.sqft+' sq ft'],
        ['Lot', open?d.lot:'——'],
        ['Year', open?d.year:'——'],
        ['Type', open?d.type:'——']
      ];
      keys.innerHTML=keyRows.map(function(r){return '<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('');
      renderGallery(d);
      var desc=document.getElementById('vshLgDesc');
      desc.innerHTML=(open?d.paras:[d.teaser]).map(function(p){return '<p class="vsh-lg-desc"></p>';}).join('');
      [].slice.call(desc.querySelectorAll('p')).forEach(function(p,i){ p.textContent=(open?d.paras: [d.teaser])[i]; });
      var amen=document.getElementById('vshLgAmen'); amen.innerHTML='';
      (open?d.amenities:d.amenities.slice(0,4).map(function(){return '——';})).forEach(function(a){
        var li=document.createElement('li'); li.textContent=a; amen.appendChild(li);
      });
      var tb=document.getElementById('vshLgTable'); tb.innerHTML='';
      d.details.forEach(function(pair){
        var tr=document.createElement('tr');
        var th=document.createElement('th'); th.scope='row'; th.textContent=pair[0];
        var td=document.createElement('td'); td.textContent=pair[1];
        tr.appendChild(th); tr.appendChild(td); tb.appendChild(tr);
      });
      var map=document.getElementById('vshLgMap');
      map.innerHTML='<p class="vsh-lg-map-k">Location</p><p></p><p></p>';
      var mps=map.querySelectorAll('p');
      mps[1].textContent=open?d.loc:d.city;
      mps[2].textContent=open?d.hood:'Neighborhood notes are available with the private file.';
      var ag=document.getElementById('vshLgAgent');
      ag.innerHTML='<p class="vsh-lg-agent-k">Listed by</p><h3></h3><p class="vsh-lg-agent-role"></p><p class="vsh-lg-agent-blurb"></p><p class="vsh-lg-agent-meta"></p>';
      ag.querySelector('h3').textContent=d.agent.name;
      ag.querySelector('.vsh-lg-agent-role').textContent=d.agent.role+(d.agent.brand?' · '+d.agent.brand:'');
      ag.querySelector('.vsh-lg-agent-blurb').textContent=d.agent.blurb;
      var meta=[]; if(d.agent.phone) meta.push(d.agent.phone); if(d.agent.email) meta.push(d.agent.email);
      ag.querySelector('.vsh-lg-agent-meta').textContent=meta.join(' · ')||'Enquire below for a private introduction.';
      var gate=document.getElementById('vshLgGate');
      gate.hidden=open;
      document.getElementById('vshLgGateHint').textContent='Enquire for private details, or open '+sampleName+' (marked Open sample) to preview a complete listing.';
      var enq=document.getElementById('vshLgEnquire');
      enq.textContent=open?'Request a private tour':'Request private details';
      enq.href='#contact';
    }

    function openAt(i){
      var d=invent(data[i], poolImgs, agent);
      lastFocus=document.activeElement;
      fill(d);
      root.hidden=false;
      root.scrollTop=0;
      root.setAttribute('data-lenis-prevent','');
      root.setAttribute('data-lenis-prevent-wheel','');
      root.setAttribute('data-lenis-prevent-touch','');
      document.body.classList.add('vsh-lg-open');
      if(window.lenis)try{window.lenis.stop()}catch(e){}
      document.getElementById('vshLgBack').focus();
      pushLock=true;
      try{
        var slug=encodeURIComponent((data[i].title||'listing').toLowerCase().replace(/\s+/g,'-').slice(0,48));
        history.pushState({vshLg:1,i:i},'', (location.pathname+location.search)+'#listing/'+slug);
      }catch(e){}
      pushLock=false;
    }
    function close(fromPop){
      if(root.hidden) return;
      root.hidden=true;
      document.body.classList.remove('vsh-lg-open');
      if(window.lenis)try{window.lenis.start()}catch(e){}
      if(lastFocus && lastFocus.focus) lastFocus.focus();
      if(!fromPop){
        pushLock=true;
        try{
          if(location.hash.indexOf('#listing/')===0) history.pushState(null,'',location.pathname+location.search);
        }catch(e){}
        pushLock=false;
      }
    }

    cards.forEach(function(card,i){
      card.setAttribute('tabindex','0');
      card.setAttribute('role','link');
      card.setAttribute('aria-haspopup','dialog');
      function go(e){
        if(e.target.closest && (e.target.closest('.badge.tour') || e.target.closest('a.badge') || e.target.closest('.badge.stage'))) return;
        e.preventDefault();
        e.stopPropagation();
        if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
        openAt(i);
      }
      card.addEventListener('click', go, true);
      card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openAt(i);} });
    });

    var hintA=document.querySelector('.vsh-lg-hint a');
    if(hintA) hintA.addEventListener('click', function(e){
      e.preventDefault();
      cards[0].scrollIntoView({block:'center', behavior:'smooth'});
      setTimeout(function(){ openAt(0); }, 350);
    });

    document.getElementById('vshLgClose').onclick=function(){ close(false); };
    document.getElementById('vshLgBack').onclick=function(){ close(false); };
    document.getElementById('vshLgHome').onclick=function(){ close(false); };
    document.getElementById('vshLgEnquire').addEventListener('click', function(){ close(false); });

    addEventListener('popstate', function(){
      if(pushLock) return;
      if(!root.hidden) close(true);
    });

    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && !root.hidden){ close(false); e.stopPropagation(); }
      if(e.key==='Tab' && !root.hidden){
        var list=[].slice.call(panel.querySelectorAll('a[href],button:not([disabled])')).filter(function(el){return el.offsetParent!==null});
        if(!list.length) return;
        var first=list[0], last=list[list.length-1];
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
