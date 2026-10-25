(() => {
  const V = '20261025video3';
  const N = 360;
  const mob = Math.min(innerWidth, screen.width || innerWidth) <= 820;
  const HI = mob ? 'm' : 'd';
  const LO = mob ? 'ml' : 'dl';
  const WIN = mob ? 120 : 48;

  const tour = document.getElementById('hero');
  const cv = document.getElementById('scene');
  const cx = cv.getContext('2d', { alpha: false });
  const bar = document.querySelector('#loadbar i');
  const pin = tour.querySelector('.pin');
  const heroCopy = pin.querySelector('.hero-copy');
  const scrollHint = pin.querySelector('.scroll-hint');

  const fade = document.createElement('div');
  fade.className = 'endfade';
  pin.appendChild(fade);

  const src = (s, f) => `frames/${s}/${String(f + 1).padStart(3, '0')}.webp?v=${V}`;
  const lo = new Array(N), hi = new Array(N);
  const rl = new Uint8Array(N), rh = new Uint8Array(N);
  let doneLo = 0, doneHi = 0, inflight = 0, ih = 0, cf = 0, dirty = true;

  function img(u) {
    const i = new Image();
    i.decoding = 'async';
    i.src = u;
    return i.decode().then(() => i);
  }
  async function bmp(u) {
    if (window.createImageBitmap) {
      try {
        const r = await fetch(u, { cache: 'force-cache' });
        return createImageBitmap(await r.blob());
      } catch (e) {}
    }
    return img(u);
  }
  function nextLo() {
    if (!rl[0]) return 0;
    if (!rl[N - 1]) return N - 1;
    for (const st of [16, 8, 4, 2, 1])
      for (let f = 0; f < N; f += st) if (!rl[f]) return f;
    return -1;
  }
  function nextHi() {
    for (let d = 0; d <= WIN; d++) {
      for (const f of [cf + d, cf - d])
        if (f >= 0 && f < N && !rh[f]) return f;
    }
    return -1;
  }
  function evict() {
    for (let f = 0; f < N; f++)
      if (hi[f] && Math.abs(f - cf) > WIN + 16) {
        hi[f].close && hi[f].close();
        hi[f] = null;
        rh[f] = 0;
      }
  }
  function pump() {
    const maxIn = mob ? 8 : 10;
    while (inflight < maxIn) {
      let t = 'l', f = nextLo();
      const h = nextHi();
      const near = h >= 0 && Math.abs(h - cf) <= (mob ? 12 : 4);
      const ready = doneLo > N * 0.08 || doneHi > 8;
      if (h >= 0 && (f < 0 || near || (ih < (mob ? 7 : 5) && ready) || (mob && ih < 5))) {
        t = 'h'; f = h;
      }
      if (f < 0) return;
      inflight++;
      if (t === 'l') {
        rl[f] = 1;
        img(src(LO, f))
          .then((b) => {
            lo[f] = b; dirty = true; doneLo++;
            if (bar) bar.style.width = (doneLo / N * 100) + '%';
            if (doneLo >= N) bar && bar.parentNode.classList.add('done');
          })
          .catch(() => { rl[f] = 0; })
          .finally(() => { inflight--; pump(); });
      } else {
        rh[f] = 1; ih++;
        bmp(src(HI, f))
          .then((b) => {
            if (Math.abs(f - cf) > WIN + 16) { b.close && b.close(); rh[f] = 0; return; }
            hi[f] = b; dirty = true; doneHi++;
          })
          .catch(() => { rh[f] = 0; })
          .finally(() => { inflight--; ih--; pump(); });
      }
    }
  }

  let top = 0, span = 1, target = 0, cur = 0, last = '';
  function measure() {
    top = tour.getBoundingClientRect().top + scrollY;
    span = Math.max(1, tour.offsetHeight - innerHeight - innerHeight * 0.35);
    onScroll();
  }
  function onScroll() {
    const p = Math.min(1, Math.max(0, (scrollY - top) / span));
    const hp = Math.min(1, Math.max(0, (scrollY - top - span) / (innerHeight * 0.35)));
    fade.style.opacity = (hp * hp * (3 - 2 * hp)).toFixed(3);
    target = p * (N - 1);
    const c = Math.round(target);
    if (Math.abs(c - cf) > 2) { cf = c; evict(); pump(); }
    if (heroCopy) {
      const o = Math.max(0, 1 - p * 2.2);
      heroCopy.style.opacity = o.toFixed(3);
      heroCopy.style.pointerEvents = o < 0.08 ? 'none' : '';
    }
    if (scrollHint) scrollHint.style.opacity = Math.max(0, 1 - p * 6).toFixed(3);
    pin.style.setProperty('--x', p.toFixed(4));
    document.body.classList.toggle('intour', p < 0.92 && p > 0.02);
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('is-solid', scrollY > innerHeight * 0.55 || p > 0.85);
  }

  function fit() {
    const cssW = innerWidth, cssH = innerHeight;
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;max-width:none;max-height:none';
    const k = Math.min(devicePixelRatio || 1, 3);
    cv.width = Math.round(cssW * k);
    cv.height = Math.round(cssH * k);
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    dirty = true;
    measure();
  }
  const get = (f) => hi[f] || lo[f];
  function near(f) {
    for (let d = 1; d < N; d++) {
      if (get(f - d)) return get(f - d);
      if (get(f + d)) return get(f + d);
    }
    return null;
  }
  function draw(i, a) {
    const W = cv.width, H = cv.height;
    const iw = i.width || i.naturalWidth, ih = i.height || i.naturalHeight;
    if (!iw || !ih) return;
    const k = Math.max(W / iw, H / ih);
    const w = iw * k, h = ih * k;
    cx.globalAlpha = a;
    cx.drawImage(i, (W - w) / 2, (H - h) / 2, w, h);
  }
  function tick() {
    const d = target - cur;
    cur = Math.abs(d) < 0.008 ? target : cur + d * 0.28;
    const f0 = Math.floor(cur), fr = cur - f0;
    const A = get(f0), B = get(Math.min(N - 1, f0 + 1));
    const key = f0 + '|' + fr.toFixed(2) + '|' + (A === hi[f0]);
    if (key === last && !dirty) return;
    last = key; dirty = false;
    window.__lastFrame = A ? f0 : -1;
    window.__hq = !!hi[f0];
    window.__fs = V;
    if (A) {
      draw(A, 1);
      if (!mob && B && fr > 0.02) draw(B, fr);
    } else {
      const n = near(f0);
      if (n) draw(n, 1);
    }
    cx.globalAlpha = 1;
  }

  let lenis = null;
  if (window.Lenis && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: true, wheelMultiplier: 0.9 });
    window.lenis = lenis;
  }
  function raf(t) {
    if (lenis) lenis.raf(t);
    tick();
    requestAnimationFrame(raf);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', fit, { passive: true });
  addEventListener('load', measure);
  if (window.ResizeObserver) {
    new ResizeObserver(measure).observe(document.body);
    new ResizeObserver(fit).observe(pin || cv);
  }

  const menuTg = document.getElementById('menuTg');
  const menu = document.getElementById('menu');
  const chip = document.getElementById('agentChip');
  const panel = document.getElementById('agentPanel');
  const closeBtn = document.getElementById('agentClose');
  menuTg?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuTg.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      menuTg.setAttribute('aria-expanded', 'false');
    })
  );
  const setPanel = (open) => {
    if (!panel || !chip) return;
    panel.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
  };
  chip?.addEventListener('click', () => setPanel(panel.hidden));
  closeBtn?.addEventListener('click', () => setPanel(false));

  const els = document.querySelectorAll(
    '.panel .wrap, .panel .cards, .panel .quotes, .panel .stats, .panel .section-head, .panel h2, .panel .body, .panel .cform, .panel .process, .panel .tools, .panel .team, .panel .feature, .panel .split, .panel .map-panel, .panel .stack'
  );
  els.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));

  fit();
  cur = target;
  pump();
  if (window.requestIdleCallback) {
    const idleFill = () => {
      pump();
      if (doneHi < N * 0.5) requestIdleCallback(idleFill, { timeout: 800 });
    };
    requestIdleCallback(idleFill, { timeout: 400 });
  }
  requestAnimationFrame(raf);
})();

/* AI assistant */
(function(){
  const $=s=>document.querySelector(s);
  const as=$('#assistant'), ask=$('#ask'), log=$('#asLog');
  if(!as||!ask||!log) return;
  const tog=o=>{as.hidden=!o;ask.setAttribute('aria-expanded',o);if(o){const i=$('#asIn');if(i)i.focus()}};
  ask.onclick=()=>tog(as.hidden);
  const close=$('#asClose'); if(close) close.onclick=()=>tog(false);
  const city = document.querySelector('.hero-type h1')?.textContent?.trim() || 'this market';
  const A=q=>{
    if(/value|worth|estimate/i.test(q)) return 'I can prepare a private estimate. Share your address in the enquiry form and an advisor reviews it within a day.';
    if(/view|tour|visit|book/i.test(q)) return 'Viewings are accompanied and by appointment. Use the enquiry form and we will propose times.';
    if(/off-market|private/i.test(q)) return 'A portion of our '+city+' inventory is held privately. Tell us what you are looking for and we will introduce a match.';
    return 'I can arrange a private viewing in '+city+', discuss an off-market opportunity, or connect you with the advising partner.';
  };
  const say=q=>{log.insertAdjacentHTML('beforeend','<p class="as-me"></p>');log.lastChild.textContent=q;setTimeout(()=>{log.insertAdjacentHTML('beforeend','<p class="as-bot"></p>');log.lastChild.textContent=A(q);log.scrollTop=1e5},450)};
  as.querySelectorAll('.as-quick button').forEach(b=>b.onclick=()=>say(b.textContent));
  const form=$('#asForm'); if(form) form.onsubmit=e=>{e.preventDefault();const v=$('#asIn').value.trim();if(v){say(v);$('#asIn').value=''}};
})();
