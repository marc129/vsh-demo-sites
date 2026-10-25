(() => {
  const nav = document.getElementById('nav');
  const menuTg = document.getElementById('menuTg');
  const menu = document.getElementById('menu');
  const chip = document.getElementById('agentChip');
  const panel = document.getElementById('agentPanel');
  const closeBtn = document.getElementById('agentClose');
  const v0 = document.getElementById('v0');
  const v1 = document.getElementById('v1');

  // Nav solid on scroll past first screen
  const onScroll = () => {
    nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.55);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  menuTg?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuTg.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuTg.setAttribute('aria-expanded', 'false');
  }));

  // Agent chip
  const setPanel = (open) => {
    panel.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
  };
  chip?.addEventListener('click', () => setPanel(panel.hidden));
  closeBtn?.addEventListener('click', () => setPanel(false));

  // Hero video: ensure play + quiet crossfade montage every ~8s
  const tryPlay = (v) => { v?.play?.().catch(() => {}); };
  tryPlay(v0);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay(document.querySelector('.hero-vid.is-on'));
  });

  if (v0 && v1) {
    let on0 = true;
    // Preload second clip once first is playing
    v0.addEventListener('playing', () => { tryPlay(v1); v1.pause(); }, { once: true });
    setInterval(() => {
      on0 = !on0;
      if (on0) {
        v0.classList.add('is-on');
        v1.classList.remove('is-on');
        tryPlay(v0);
      } else {
        v1.classList.add('is-on');
        v0.classList.remove('is-on');
        tryPlay(v1);
      }
    }, 8000);
  }

  // Fade/slide-up reveals
  const els = document.querySelectorAll('.panel .wrap, .panel .cards, .panel .quotes, .panel .stats, .panel .section-head, .panel h2, .panel .body, .panel .cform');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();
