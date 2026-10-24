/*! VSH Media — listing detail gate (one unlocked sample per demo) */
(function () {
  if (window.__vshListingGate) return;
  window.__vshListingGate = true;

  function css() {
    if (document.getElementById('vsh-lg-css')) return;
    var s = document.createElement('style');
    s.id = 'vsh-lg-css';
    s.textContent = [
      '.vsh-lg-hint{margin:0 0 1.25rem;font-size:14px;line-height:1.6;opacity:.78;max-width:52ch}',
      '.vsh-lg-hint a{color:inherit;text-decoration:none;border-bottom:1px solid currentColor;border-bottom-color:color-mix(in srgb,currentColor 55%,transparent)}',
      '.vsh-lg-hint a:hover{opacity:1}',
      '.vsh-lg-cue{display:block;margin:.35rem 0 .15rem;font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.85}',
      'article[data-lst].vsh-lg-sample{cursor:pointer}',
      'article[data-lst]{cursor:pointer}',
      '.vsh-lg-root{position:fixed;inset:0;z-index:99990;display:flex;align-items:stretch;justify-content:center}',
      '.vsh-lg-root[hidden]{display:none!important}',
      '.vsh-lg-scrim{position:absolute;inset:0;border:0;padding:0;margin:0;width:100%;height:100%;background:rgba(10,8,6,.72);cursor:pointer}',
      '.vsh-lg-panel{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);width:min(1080px,calc(100vw - 48px));max-height:min(860px,calc(100vh - 48px));margin:auto;background:var(--panel,var(--bg,#14110e));color:inherit;border:1px solid color-mix(in srgb,currentColor 22%,transparent);overflow:auto}',
      '.vsh-lg-close{position:absolute;top:16px;right:20px;z-index:2;background:transparent;border:0;color:inherit;opacity:.7;padding:10px 0;font:inherit;font-size:11px;letter-spacing:.28em;text-transform:uppercase;cursor:pointer}',
      '.vsh-lg-close:hover{opacity:1}',
      '.vsh-lg-media{background:color-mix(in srgb,currentColor 8%,transparent);min-height:260px}',
      '.vsh-lg-media img{width:100%;height:100%;object-fit:cover;display:block;min-height:100%}',
      '.vsh-lg-body{padding:44px 44px 36px;display:flex;flex-direction:column}',
      '.vsh-lg-kicker{font-size:11px;letter-spacing:.32em;text-transform:uppercase;opacity:.75;margin:0 0 14px}',
      '.vsh-lg-title{font-size:clamp(28px,3.6vw,48px);line-height:1.08;margin:0 0 10px;font-weight:400}',
      '.vsh-lg-loc,.vsh-lg-spec{opacity:.72;font-size:14px;margin:0 0 10px}',
      '.vsh-lg-price{font-size:26px;margin:0 0 8px;font-weight:400}',
      '.vsh-lg-gate-wrap{position:relative;margin:12px 0 8px}',
      '.vsh-lg-private{transition:filter .3s}',
      '.vsh-lg-root.is-locked .vsh-lg-private{filter:blur(5px);opacity:.55;user-select:none;pointer-events:none}',
      '.vsh-lg-gate{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:8px 0;background:color-mix(in srgb,var(--panel,var(--bg,#14110e)) 78%,transparent)}',
      '.vsh-lg-gate[hidden]{display:none!important}',
      '.vsh-lg-gate-k{font-size:11px;letter-spacing:.32em;text-transform:uppercase;margin:0 0 12px;opacity:.9}',
      '.vsh-lg-gate-line{font-style:italic;font-size:22px;line-height:1.35;margin:0 0 12px;max-width:28ch;opacity:.95}',
      '.vsh-lg-gate-hint{font-size:13px;line-height:1.55;opacity:.7;max-width:36ch;margin:0}',
      '.vsh-lg-desc{font-size:16px;line-height:1.7;max-width:42ch;margin:0 0 22px;opacity:.9}',
      '.vsh-lg-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;border-top:1px solid color-mix(in srgb,currentColor 22%,transparent);padding-top:20px;margin:0 0 28px;font-size:13px}',
      '.vsh-lg-facts dt{opacity:.65;letter-spacing:.16em;text-transform:uppercase;font-size:10px;margin:0 0 4px}',
      '.vsh-lg-facts dd{margin:0 0 8px;font-size:15px}',
      '.vsh-lg-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:auto}',
      '.vsh-lg-enquire{display:inline-flex;align-items:center;justify-content:center;padding:15px 24px;min-height:48px;text-decoration:none;font-size:11px;letter-spacing:.24em;text-transform:uppercase;background:currentColor;color:var(--panel,var(--bg,#14110e));border:0}',
      '.vsh-lg-back{background:transparent;color:inherit;border:1px solid color-mix(in srgb,currentColor 45%,transparent);padding:14px 20px;min-height:48px;font:inherit;font-size:11px;letter-spacing:.24em;text-transform:uppercase;cursor:pointer}',
      'body.vsh-lg-open{overflow:hidden}',
      '@media(max-width:820px){.vsh-lg-panel{grid-template-columns:1fr;width:100%;max-height:100%;height:100%;margin:0;border:0}.vsh-lg-media{aspect-ratio:4/3;min-height:0;max-height:42vh}.vsh-lg-body{padding:24px 20px 36px}.vsh-lg-actions{flex-direction:column;align-items:stretch}.vsh-lg-enquire,.vsh-lg-back{width:100%;text-align:center;justify-content:center}.vsh-lg-close{background:color-mix(in srgb,var(--panel,var(--bg,#14110e)) 70%,transparent);padding:10px 14px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}

  function parseCard(card, i){
    var img = card.querySelector('img.orig, img:not(.staged)') || card.querySelector('img');
    var title = text(card.querySelector('h3, .addr, .lbl b, [class*="title"]')) || (img && img.alt) || ('Residence '+(i+1));
    var priceEl = card.querySelector('.price, .lbl span:last-child, b');
    var price = '';
    card.querySelectorAll('.price, .ov .price, .lbl span, b, span').forEach(function(n){
      var t=text(n); if(/\$[\d,.]+/.test(t) && !price) price=t.match(/\$[\d,.]+[MKmk]?/)[0];
    });
    if(!price){var m=(card.textContent||'').match(/\$[\d,.]+(?:\s*[Mm])?/); price=m?m[0]:'Price on request'}
    var loc='';
    var pEls=card.querySelectorAll('.addr, .lbl span, p, .ov .addr');
    pEls.forEach(function(n){var t=text(n); if(t && t!==title && !/^\$/.test(t) && t.length<80 && !loc) loc=t.replace(/\s*·\s*/g,' · ')});
    if(!loc) loc=title;
    var beds=''; var bm=(card.textContent||'').match(/(\d+)\s*BD/i); if(bm) beds=bm[1];
    return {
      card:card, title:title, price:price, loc:loc, city:loc.split('·').pop().trim(),
      img: img ? (img.currentSrc||img.src) : '',
      beds: beds||String(4+((i*2)%3)), baths: String(5+((i*3)%4)),
      sqft: String(6200+i*850),
      unlocked: i===0
    };
  }

  function invent(d){
    var fullAddr = d.unlocked
      ? (/\d/.test(d.loc) ? d.loc : (120+Math.floor(Math.random()*800))+' '+d.loc)
      : d.city;
    // deterministic-ish from title length to avoid random flicker
    var n = d.title.length*17+d.price.length;
    if(d.unlocked && !/\d/.test(d.loc)){
      fullAddr = (200+(n%700))+' '+d.loc.replace(/^[^·]*·\s*/,'');
    }
    return {
      unlocked:d.unlocked,
      title:d.title,
      status: d.unlocked ? 'Offered privately' : 'Private listing',
      loc: d.unlocked ? fullAddr : d.city,
      price:d.price,
      spec: d.beds+' bd  ·  '+d.baths+' ba  ·  '+d.sqft+' sq ft',
      img:d.img,
      teaser: 'A quietly offered residence — '+d.city+'. Full address and advisory notes are held for qualified enquiries.',
      desc: d.title+' is presented privately for discerning buyers. '+d.beds+' bedrooms and '+d.baths+' baths across roughly '+d.sqft+' square feet, finished with the restraint this market expects.',
      facts: d.unlocked
        ? [['Bedrooms',d.beds],['Bathrooms',d.baths],['Interior',d.sqft+' sq ft'],['Lot',(1.2+(n%20)/10).toFixed(1)+' acres'],['Year',String(2012+(n%12))],['Tenure','Fee simple'],['Showing','By appointment'],['Representation','Exclusive']]
        : [['Bedrooms',d.beds],['Bathrooms',d.baths],['Interior',d.sqft+' sq ft'],['Lot','——'],['Year','——'],['Tenure','——'],['Showing','——'],['Representation','——']]
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
    root.hidden=true;
    root.innerHTML=[
      '<button type="button" class="vsh-lg-scrim" id="vshLgScrim" aria-label="Close"></button>',
      '<div class="vsh-lg-panel" id="vshLgPanel">',
      '<button type="button" class="vsh-lg-close" id="vshLgClose">Close</button>',
      '<div class="vsh-lg-media"><img id="vshLgImg" alt=""></div>',
      '<div class="vsh-lg-body">',
      '<p class="vsh-lg-kicker" id="vshLgStatus"></p>',
      '<h2 class="vsh-lg-title" id="vshLgTitle"></h2>',
      '<p class="vsh-lg-loc" id="vshLgLoc"></p>',
      '<p class="vsh-lg-price" id="vshLgPrice"></p>',
      '<p class="vsh-lg-spec" id="vshLgSpec"></p>',
      '<div class="vsh-lg-gate-wrap">',
      '<div class="vsh-lg-private">',
      '<p class="vsh-lg-desc" id="vshLgDesc"></p>',
      '<dl class="vsh-lg-facts" id="vshLgFacts"></dl>',
      '</div>',
      '<div class="vsh-lg-gate" id="vshLgGate" hidden>',
      '<p class="vsh-lg-gate-k">Private details</p>',
      '<p class="vsh-lg-gate-line">Full address, floor notes and advisory remarks are held for qualified enquiries.</p>',
      '<p class="vsh-lg-gate-hint" id="vshLgGateHint">Open the residence marked Open sample to preview a full listing.</p>',
      '</div></div>',
      '<div class="vsh-lg-actions">',
      '<a class="vsh-lg-enquire" id="vshLgEnquire" href="#contact">Request private details</a>',
      '<button type="button" class="vsh-lg-back" id="vshLgBack">Back to residences</button>',
      '</div></div></div>'
    ].join('');
    document.body.appendChild(root);
    return root;
  }

  function init(){
    css();
    var cards=[].slice.call(document.querySelectorAll('#listings article[data-lst], #properties article[data-lst], section[id="listings"] article.lst'));
    if(!cards.length) cards=[].slice.call(document.querySelectorAll('article[data-lst]'));
    // de-dupe
    cards=cards.filter(function(c,i,a){return a.indexOf(c)===i});
    if(!cards.length) return;

    var data=cards.map(parseCard);
    var sampleName=data[0].title;
    var section=cards[0].closest('#listings, #properties, section')||cards[0].parentElement;
    var head=section && section.querySelector('.head, .block-head, .wrap > .head');
    if(section && !section.querySelector('.vsh-lg-hint')){
      var hint=document.createElement('p');
      hint.className='vsh-lg-hint';
      hint.innerHTML='Open <a href="#vsh-lg-sample">'+sampleName.replace(/</g,'')+'</a> to preview a full listing. Other residences show a private teaser.';
      var grid=section.querySelector('.g, .cards, .grid')||cards[0].parentElement;
      if(grid && grid.parentElement) grid.parentElement.insertBefore(hint, grid);
      else if(head && head.parentElement) head.parentElement.insertBefore(hint, head.nextSibling);
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

    function fill(d){
      var open=!!d.unlocked;
      root.classList.toggle('is-locked', !open);
      root.classList.toggle('is-unlocked', open);
      document.getElementById('vshLgTitle').textContent=d.title;
      document.getElementById('vshLgLoc').textContent=d.loc;
      document.getElementById('vshLgPrice').textContent=d.price;
      document.getElementById('vshLgStatus').textContent=d.status;
      document.getElementById('vshLgSpec').textContent=d.spec;
      var img=document.getElementById('vshLgImg'); img.src=d.img; img.alt=d.title;
      document.getElementById('vshLgDesc').textContent=open?d.desc:d.teaser;
      var facts=document.getElementById('vshLgFacts'); facts.innerHTML='';
      d.facts.forEach(function(pair){
        var dt=document.createElement('dt'); dt.textContent=pair[0];
        var dd=document.createElement('dd'); dd.textContent=pair[1];
        facts.appendChild(dt); facts.appendChild(dd);
      });
      var gate=document.getElementById('vshLgGate');
      gate.hidden=open;
      document.getElementById('vshLgGateHint').textContent='Enquire for private details, or open '+sampleName+' (marked Open sample) to preview a full listing.';
      var enq=document.getElementById('vshLgEnquire');
      enq.textContent=open?'Enquire about this residence':'Request private details';
      enq.href='#contact';
    }

    function openAt(i){
      var d=invent(data[i]);
      lastFocus=document.activeElement;
      fill(d);
      root.hidden=false;
      document.body.classList.add('vsh-lg-open');
      document.getElementById('vshLgClose').focus();
    }
    function close(){
      if(root.hidden) return;
      root.hidden=true;
      document.body.classList.remove('vsh-lg-open');
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }

    cards.forEach(function(card,i){
      card.setAttribute('tabindex','0');
      card.setAttribute('role','button');
      card.setAttribute('aria-haspopup','dialog');
      function go(e){
        if(e.target.closest && (e.target.closest('.badge.tour') || e.target.closest('a.badge'))) return;
        e.preventDefault();
        e.stopPropagation();
        if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
        openAt(i);
      }
      card.addEventListener('click', go);
      card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openAt(i);} });
    });

    var hintA=document.querySelector('.vsh-lg-hint a');
    if(hintA) hintA.addEventListener('click', function(e){
      e.preventDefault();
      cards[0].scrollIntoView({block:'center', behavior:'smooth'});
      setTimeout(function(){ openAt(0); }, 350);
    });

    document.getElementById('vshLgClose').onclick=close;
    document.getElementById('vshLgScrim').onclick=close;
    document.getElementById('vshLgBack').onclick=close;
    document.getElementById('vshLgEnquire').addEventListener('click', function(){ close(); });

    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && !root.hidden){ close(); e.stopPropagation(); }
      if(e.key==='Tab' && !root.hidden){
        var list=[].slice.call(panel.querySelectorAll('a[href],button:not([disabled])')).filter(function(el){return el.offsetParent!==null||el.id==='vshLgClose'});
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
