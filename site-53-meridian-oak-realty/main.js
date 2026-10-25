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
