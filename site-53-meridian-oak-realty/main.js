(() => {
  const nav = document.getElementById('nav');
  const menuTg = document.getElementById('menuTg');
  const menu = document.getElementById('menu');
  const chip = document.getElementById('agentChip');
  const panel = document.getElementById('agentPanel');
  const closeBtn = document.getElementById('agentClose');
  const v0 = document.getElementById('v0');

  const onScroll = () => {
    nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.55);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuTg?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuTg.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    menuTg.setAttribute('aria-expanded', 'false');
  }));

  const setPanel = (open) => {
    panel.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
  };
  chip?.addEventListener('click', () => setPanel(panel.hidden));
  closeBtn?.addEventListener('click', () => setPanel(false));

  const tryPlay = (v) => { v?.play?.().catch(() => {}); };
  tryPlay(v0);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay(v0);
  });

  const els = document.querySelectorAll('.panel .wrap, .panel .cards, .panel .quotes, .panel .stats, .panel .section-head, .panel h2, .panel .body, .panel .cform');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();
