document.documentElement.classList.remove("no-js");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const phone = () => matchMedia("(max-width: 700px)").matches;

const hero = document.querySelector(".hero");
const heroImg = document.querySelector(".hero-img");
const reelSticky = document.querySelector(".reel-sticky");
const slides = [...document.querySelectorAll(".reel .slide")];
const titles = [...document.querySelectorAll(".reel-titles h2")];
const ticks = [...document.querySelectorAll(".ticks li")];
const rail = document.querySelector(".rail i");
const editorial = document.querySelector(".editorial");
const pills = [...document.querySelectorAll(".pill")];
const drifts = [...document.querySelectorAll(".drift")];
const dayPin = document.querySelector(".day-pin");
const beats = [...document.querySelectorAll(".beat")];
const dayTime = document.querySelector(".day-time");
const dayLabel = document.querySelector(".day-label");
const giant = document.querySelector(".giant");
const sea = document.querySelector(".giant-sea");
const liquidMap = document.getElementById("liquid-map");

function screens(desktop, mobile) {
  const n = phone() ? mobile : desktop;
  return () => "+=" + Math.round(window.innerHeight * n);
}

function fitGiant() {
  const parent = giant.parentElement;
  const max = parent.clientWidth * 0.975;
  giant.style.display = "inline-block";
  let lo = 32;
  let hi = Math.max(120, parent.clientWidth);
  for (let n = 0; n < 20; n += 1) {
    const mid = (lo + hi) / 2;
    giant.style.fontSize = `${mid}px`;
    if (giant.getBoundingClientRect().width > max) hi = mid;
    else lo = mid;
  }
  giant.style.fontSize = `${Math.floor(lo)}px`;
  paintSea();
}

function paintSea() {
  const wrap = giant.parentElement;
  const width = wrap.clientWidth;
  const height = Math.max(1, Math.round(wrap.getBoundingClientRect().height));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = parseFloat(getComputedStyle(giant).fontSize);
  ctx.font = `500 ${fontSize}px "Bodoni Moda", Didot, "Times New Roman", serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "-0.05em";
  ctx.fillText("SOLENNE", width / 2, height * 0.47);
  const url = canvas.toDataURL();
  wrap.style.webkitMaskImage = `url("${url}")`;
  wrap.style.maskImage = `url("${url}")`;
  wrap.style.webkitMaskSize = "100% 100%";
  wrap.style.maskSize = "100% 100%";
  wrap.style.webkitMaskRepeat = "no-repeat";
  wrap.style.maskRepeat = "no-repeat";
  wrap.style.webkitMaskPosition = "center";
  wrap.style.maskPosition = "center";
  wrap.style.webkitMaskMode = "alpha";
  wrap.style.maskMode = "alpha";
  sea.style.webkitMaskImage = "none";
  sea.style.maskImage = "none";
  wrap.classList.add("masked");
}

sea.addEventListener("error", () => giant.parentElement.classList.remove("masked"));

function wave(tl, at, duration, from) {
  const state = { scale: 0 };
  tl.fromTo(state, { scale: from }, {
    scale: 0,
    duration,
    ease: "power2.out",
    immediateRender: false,
    onUpdate: () => liquidMap.setAttribute("scale", state.scale.toFixed(2)),
  }, at);
}

function showBeat(index) {
  const beat = beats[index];
  if (!beat || dayTime.textContent === beat.dataset.time) return;
  dayTime.textContent = beat.dataset.time;
  dayLabel.textContent = beat.dataset.label;
}

function markTicks(index) {
  ticks.forEach((tick, n) => tick.classList.toggle("on", n === index));
}

function build() {
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) {
    document.documentElement.classList.add("reduced");
    return null;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
  });
  window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.documentElement.classList.add("has-scrub");

  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: screens(1.7, 1.05),
      pin: true,
      scrub: true,
      anticipatePin: 1,
    },
  });
  heroTl.fromTo(heroImg, { scale: 1.62, yPercent: 8 }, { scale: 1, yPercent: -10, ease: "none", duration: 1 }, 0);
  heroTl.fromTo(".hero-shade", { opacity: 0.35 }, { opacity: 0.88, ease: "none", duration: 1 }, 0);
  heroTl.fromTo(".wordmark", { letterSpacing: "0.04em" }, { letterSpacing: "0.2em", ease: "none", duration: 1 }, 0);
  heroTl.to([".kicker", ".hero-sub", ".hero-note", ".scroll-cue"], { opacity: 0, y: -24, ease: "none", duration: 0.38 }, 0);
  heroTl.to(".hero-copy", { yPercent: -36, opacity: 0, ease: "power1.in", duration: 0.5 }, 0.42);

  const reelTl = gsap.timeline({
    scrollTrigger: {
      trigger: reelSticky,
      start: "top top",
      end: screens(6.2, 3.6),
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const index = Math.min(slides.length - 1, Math.floor(self.progress * slides.length * 0.999));
        markTicks(index);
        if (rail) rail.style.transform = `scaleY(${self.progress})`;
      },
    },
  });
  const step = 0.64;
  slides.forEach((slide, index) => {
    const img = slide.querySelector("img");
    const title = titles[index];
    const at = index * step;
    const last = index === slides.length - 1;
    gsap.set(img, { transformOrigin: "50% 46%" });
    if (index === 0) {
      reelTl.set(slide, { autoAlpha: 1, zIndex: 1, clipPath: "inset(0% 0% 0% 0%)" }, 0);
      reelTl.set(title, { autoAlpha: 1, y: 0 }, 0);
    } else {
      reelTl.set(slide, { autoAlpha: 0, zIndex: index + 1, clipPath: "inset(0% 100% 0% 0%)" }, 0);
      reelTl.set(slide, { autoAlpha: 1 }, at);
      reelTl.fromTo(slide,
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.46, ease: "power1.inOut", immediateRender: false },
        at);
      reelTl.fromTo(title,
        { autoAlpha: 0, y: 64 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out", immediateRender: false },
        at);
      reelTl.call(() => slide.classList.add("liquid"), null, at);
      wave(reelTl, at, 0.46, 78);
      reelTl.call(() => slide.classList.remove("liquid"), null, at + 0.46);
    }
    reelTl.fromTo(img,
      { scale: 1.42, xPercent: 8, yPercent: 6 },
      { scale: 1.02, xPercent: -8, yPercent: -8, ease: "none", duration: 1 },
      at);
    if (!last) {
      reelTl.to(title, { autoAlpha: 0, y: -52, duration: 0.26, ease: "power1.in", immediateRender: false }, at + step - 0.04);
    }
  });

  const editTl = gsap.timeline({
    scrollTrigger: {
      trigger: editorial,
      start: "top top",
      end: screens(1.45, 1.05),
      pin: true,
      scrub: true,
      anticipatePin: 1,
    },
  });
  pills.forEach((pill) => {
    const y = Number(pill.dataset.d) || 80;
    const x = Number(pill.dataset.x) || 0;
    editTl.fromTo(pill,
      { x: x * -1.3, y: y * 0.85, scale: 0.78 },
      { x: x * 1.5, y: y * -0.95, scale: 1.16, ease: "none" },
      0);
  });

  drifts.forEach((frame) => {
    const img = frame.querySelector(":scope > img");
    if (!img) return;
    const amp = 7 + ((Number(frame.dataset.drift) || 40) % 9);
    gsap.fromTo(img,
      { yPercent: amp, scale: 1.34 },
      {
        yPercent: -amp,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
      });
  });

  gsap.fromTo(".stat",
    { y: 90, opacity: 0, scale: 0.9 },
    { y: 0, opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: ".matter", start: "top 88%", end: "top 42%", scrub: true } });
  gsap.fromTo(".airport p",
    { y: 80, opacity: 0.1 },
    { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".airport", start: "top 92%", end: "top 48%", scrub: true } });
  gsap.fromTo(".tenure-copy",
    { y: 64, opacity: 0.15 },
    { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".tenure", start: "top 88%", end: "top 42%", scrub: true } });

  const dayTl = gsap.timeline({
    scrollTrigger: {
      trigger: dayPin,
      start: "top top",
      end: screens(5.2, 3.2),
      pin: true,
      scrub: true,
      anticipatePin: 1,
    },
  });
  beats.forEach((beat, index) => {
    const img = beat.querySelector("img");
    const at = index * step;
    gsap.set(img, { transformOrigin: "50% 46%" });
    if (index === 0) {
      dayTl.set(beat, { autoAlpha: 1, zIndex: 1, clipPath: "circle(140% at 68% 46%)" }, 0);
    } else {
      dayTl.set(beat, { autoAlpha: 0, zIndex: index + 1, clipPath: "circle(0% at 68% 46%)" }, 0);
      dayTl.set(beat, { autoAlpha: 1 }, at);
      dayTl.fromTo(beat,
        { clipPath: "circle(0% at 68% 46%)" },
        { clipPath: "circle(140% at 68% 46%)", duration: 0.48, ease: "power2.out", immediateRender: false },
        at);
      dayTl.call(() => beat.classList.add("liquid"), null, at);
      wave(dayTl, at, 0.48, 86);
      dayTl.call(() => {
        beat.classList.remove("liquid");
        showBeat(index);
      }, null, at + 0.16);
    }
    dayTl.fromTo(img,
      { scale: 1.4, xPercent: 5, yPercent: 8 },
      { scale: 1.02, xPercent: -6, yPercent: -9, ease: "none", duration: 1 },
      at);
    if (index === 0) dayTl.set(".day-copy", { y: 0, opacity: 1 }, 0);
    else {
      dayTl.fromTo(".day-copy",
        { y: 36, opacity: 0.35 },
        { y: 0, opacity: 1, duration: 0.32, ease: "power2.out", immediateRender: false },
        at);
    }
  });

  const glass = document.querySelector(".scrub-glass");
  const glassImg = glass.querySelector("img");
  gsap.fromTo(glass,
    { left: "8%", top: "14%" },
    { left: "64%", top: "52%", ease: "none", scrollTrigger: { trigger: ".calendar", start: "top 75%", end: "bottom 25%", scrub: true } });
  gsap.fromTo(glassImg,
    { xPercent: -6, yPercent: -4 },
    { xPercent: -34, yPercent: -28, ease: "none", scrollTrigger: { trigger: ".calendar", start: "top 75%", end: "bottom 25%", scrub: true } });

  const seaTravel = gsap.timeline({
    scrollTrigger: {
      trigger: ".giant-wrap",
      start: "center center",
      end: screens(0.85, 0.55),
      pin: true,
      scrub: true,
    },
  });
  seaTravel.fromTo(sea, { x: -40, y: -20 }, { x: 90, y: 46, ease: "none" }, 0);

  return lenis;
}

const lenis = reduced ? (document.documentElement.classList.add("reduced"), null) : build();

const toggle = document.querySelector(".nav-toggle");
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  if (lenis) {
    if (open) lenis.stop();
    else lenis.start();
  }
}
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href^='#']");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href || href.length < 2) return;
  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();
  setMenu(false);
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else target.scrollIntoView();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    document.getElementById("brochure").close();
  }
});

const brochure = document.getElementById("brochure");
document.getElementById("open-brochure").addEventListener("click", () => brochure.showModal());
document.getElementById("close-brochure").addEventListener("click", () => brochure.close());

if (fine && !reduced) {
  document.documentElement.classList.add("has-cursor");
  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  const mag = cursor.querySelector(".mag");
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let cx = x;
  let cy = y;
  const track = (event) => {
    x = event.clientX;
    y = event.clientY;
  };
  window.addEventListener("pointermove", track, { passive: true });
  window.addEventListener("mousemove", track, { passive: true });
  const loop = () => {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    const hit = document.elementFromPoint(x, y);
    const zone = hit && hit.closest(".lens-zone");
    const photo = zone && zone.classList.contains("cal-photo") ? zone.querySelector(":scope > img") : null;
    cursor.classList.toggle("lens", Boolean(zone));
    cursor.classList.toggle("photo", Boolean(photo));
    if (photo && photo.complete && photo.naturalWidth) {
      const rect = photo.getBoundingClientRect();
      const zoom = 2.15;
      const localX = x - rect.left;
      const localY = y - rect.top;
      mag.hidden = false;
      if (mag.src !== photo.currentSrc && mag.src !== photo.src) mag.src = photo.currentSrc || photo.src;
      mag.style.width = `${rect.width * zoom}px`;
      mag.style.height = `${rect.height * zoom}px`;
      mag.style.transform = `translate3d(${84 - localX * zoom}px, ${84 - localY * zoom}px, 0)`;
    } else {
      mag.hidden = true;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

function refresh() {
  fitGiant();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}
fitGiant();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
window.addEventListener("load", refresh);
window.addEventListener("resize", refresh);
