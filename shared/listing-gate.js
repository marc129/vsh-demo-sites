/*! VSH Media — Zillow-style listing detail (full page, correct photo aspect; one unlocked sample) */
(function () {
  if (window.__vshListingGate) return;
  window.__vshListingGate = true;

  function css() {
    if (document.getElementById('vsh-lg-css')) return;
    var s = document.createElement('style');
    s.id = 'vsh-lg-css';
    s.textContent = [
      '.vsh-lg-hint{margin:0 0 1.25rem;font-size:14px;line-height:1.6;opacity:.72;max-width:52ch}',
      '.vsh-lg-hint a{color:inherit;text-decoration:none;border-bottom:1px solid color-mix(in srgb,currentColor 55%,transparent)}',
      '.vsh-lg-hint a:hover{opacity:1}',
      '.vsh-lg-cue{display:block;font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.75;margin:.35rem 0 .2rem;font-weight:400}',
      'article[data-lst].vsh-lg-sample,article.lst.vsh-lg-sample{cursor:pointer}',
      '.vsh-lg-root{position:fixed;inset:0;z-index:10050;display:block;overflow:auto;-webkit-overflow-scrolling:touch;background:var(--panel,var(--bg,#0f0e0c));color:inherit}',
      '.vsh-lg-root[hidden]{display:none!important}',
      '.vsh-lg-page{min-height:100%;width:100%;max-width:1120px;margin:0 auto;display:flex;flex-direction:column}',
      '.vsh-lg-top{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;background:color-mix(in srgb,var(--panel,var(--bg,#0f0e0c)) 92%,transparent);border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent)}',
      '.vsh-lg-back,.vsh-lg-close{background:transparent;border:0;color:inherit;font:inherit;font-size:12px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;padding:10px 0;opacity:.85}',
      '.vsh-lg-back:hover,.vsh-lg-close:hover{opacity:1}',
      '.vsh-lg-back{letter-spacing:.16em}',
      '.vsh-lg-hero{position:relative;width:100%;aspect-ratio:16/10;max-height:min(62vh,640px);background:color-mix(in srgb,currentColor 8%,transparent);overflow:hidden}',
      '.vsh-lg-hero img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}',
      '.vsh-lg-main{padding:36px 28px 72px;display:flex;flex-direction:column;gap:0;flex:1}',
      '.vsh-lg-kicker{font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.65;margin:0 0 14px}',
      '.vsh-lg-title{font-size:clamp(32px,4.5vw,48px);line-height:1.08;font-weight:400;margin:0 0 10px;overflow-wrap:anywhere}',
      '.vsh-lg-loc{font-size:15px;opacity:.7;margin:0 0 18px;overflow-wrap:anywhere}',
      '.vsh-lg-price{font-size:clamp(26px,3vw,34px);line-height:1.2;margin:0 0 8px;font-weight:400}',
      '.vsh-lg-spec{font-size:15px;opacity:.72;margin:0 0 28px;letter-spacing:.02em}',
      '.vsh-lg-gate-wrap{position:relative;margin:0 0 8px}',
      '.vsh-lg-private{transition:filter .3s}',
      '.vsh-lg-root.is-locked .vsh-lg-private{filter:blur(5px);opacity:.55;user-select:none;pointer-events:none}',
      '.vsh-lg-desc{font-size:17px;line-height:1.7;max-width:62ch;margin:0 0 28px;opacity:.92}',
      '.vsh-lg-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 32px;border-top:1px solid color-mix(in srgb,currentColor 18%,transparent);padding-top:24px;margin:0 0 32px;font-size:13px}',
      '.vsh-lg-facts dt{opacity:.62;letter-spacing:.16em;text-transform:uppercase;font-size:10px;margin:0 0 4px}',
      '.vsh-lg-facts dd{margin:0 0 6px;font-size:16px;overflow-wrap:anywhere}',
      '.vsh-lg-gate{position:absolute;inset:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:12px 8px;background:color-mix(in srgb,var(--panel,var(--bg,#0f0e0c)) 82%,transparent)}',
      '.vsh-lg-gate[hidden]{display:none}',
      '.vsh-lg-gate-k{font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.8;margin:0 0 12px}',
      '.vsh-lg-gate-line{font-size:clamp(20px,2.6vw,26px);line-height:1.35;font-style:italic;max-width:28ch;margin:0 0 12px;opacity:.95}',
      '.vsh-lg-gate-hint{font-size:13px;line-height:1.55;opacity:.7;max-width:40ch;margin:0}',
      '.vsh-lg-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}',
      '.vsh-lg-enquire{display:inline-flex;align-items:center;justify-content:center;padding:16px 26px;min-height:50px;text-decoration:none;font-size:11px;letter-spacing:.22em;text-transform:uppercase;background:currentColor;color:var(--panel,var(--bg,#0f0e0c));border:0}',
      '.vsh-lg-home{background:transparent;color:inherit;border:1px solid color-mix(in srgb,currentColor 45%,transparent);padding:15px 22px;min-height:50px;font:inherit;font-size:11px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer}',
      'body.vsh-lg-open{overflow:hidden}',
      '@media(max-width:820px){',
      '.vsh-lg-hero{aspect-ratio:4/3;max-height:none}',
      '.vsh-lg-main{padding:28px 18px 64px}',
      '.vsh-lg-facts{grid-template-columns:1fr 1fr;gap:12px 18px}',
      '.vsh-lg-actions{flex-direction:column;align-items:stretch}',
      '.vsh-lg-enquire,.vsh-lg-home{width:100%;text-align:center;justify-content:center}',
      '.vsh-lg-root.is-locked .vsh-lg-private{filter:blur(4px)}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}

  function parseCard(card, i){
    var img = card.querySelector('img.orig, img:not(.staged)') || card.querySelector('img');
    var title = text(card.querySelector('h3, .addr, .lbl b, [class*="title"]')) || (img && img.alt) || ('Residence '+(i+1));
    var price = '';
    card.querySelectorAll('.price, .ov .price, .lbl span, b, span').forEach(function(n){
      var t=text(n); if(/\$[\d,.]+/.test(t) && !price) price=t.match(/\$[\d,.]+[MKmk]?/)[0];
    });
    if(!price){var m=(card.textContent||'').match(/\$[\d,.]+(?:\s*[Mm])?/); price=m?m[0]:'Price on request'}
    var loc='';
    card.querySelectorAll('.addr, .lbl span, p, .ov .addr').forEach(function(n){
      var t=text(n); if(t && t!==title && !/^\$/.test(t) && t.length<80 && !loc) loc=t.replace(/\s*·\s*/g,' · ');
    });
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
    var n = d.title.length*17+d.price.length;
    var fullAddr = d.loc;
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
      '<div class="vsh-lg-page" id="vshLgPanel">',
      '<div class="vsh-lg-top">',
      '<button type="button" class="vsh-lg-back" id="vshLgBack">← Back to residences</button>',
      '<button type="button" class="vsh-lg-close" id="vshLgClose">Close</button>',
      '</div>',
      '<div class="vsh-lg-hero"><img id="vshLgImg" alt="" decoding="async"></div>',
      '<div class="vsh-lg-main">',
      '<p class="vsh-lg-kicker" id="vshLgStatus"></p>',
      '<h1 class="vsh-lg-title" id="vshLgTitle"></h1>',
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
      '<button type="button" class="vsh-lg-home" id="vshLgHome">Back to residences</button>',
      '</div></div></div>'
    ].join('');
    document.body.appendChild(root);
    return root;
  }

  function init(){
    css();
    var cards=[].slice.call(document.querySelectorAll('#listings article[data-lst], #properties article[data-lst], section[id="listings"] article.lst'));
    if(!cards.length) cards=[].slice.call(document.querySelectorAll('article[data-lst]'));
    cards=cards.filter(function(c,i,a){return a.indexOf(c)===i});
    if(!cards.length) return;

    var data=cards.map(parseCard);
    var sampleName=data[0].title;
    var section=cards[0].closest('#listings, #properties, section')||cards[0].parentElement;
    if(section && !section.querySelector('.vsh-lg-hint')){
      var hint=document.createElement('p');
      hint.className='vsh-lg-hint';
      hint.innerHTML='Open <a href="#vsh-lg-sample">'+sampleName.replace(/</g,'')+'</a> to preview a full listing. Other residences show a private teaser.';
      var grid=section.querySelector('.g, .cards, .grid')||cards[0].parentElement;
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
      root.scrollTop=0;
      document.body.classList.add('vsh-lg-open');
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
        if(e.target.closest && (e.target.closest('.badge.tour') || e.target.closest('a.badge'))) return;
        e.preventDefault();
        e.stopPropagation();
        if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
        openAt(i);
      }
      // capture so vault/other handlers don't open a second distorted UI
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
