document.documentElement.classList.remove("no-js");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const smooth = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const sectionProgress = (el) => {
  if (!el) return 0;
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return clamp(-el.getBoundingClientRect().top / total, 0, 1);
};

const heroStage = document.querySelector(".hero-stage");
const heroImg = document.querySelector(".hero-img");
const heroCopy = document.querySelector(".hero-copy");
const heroShade = document.querySelector(".hero-shade");
const reel = document.querySelector(".reel");
const slides = [...document.querySelectorAll(".reel .slide")];
const titles = [...document.querySelectorAll(".reel-titles h2")];
const ticks = [...document.querySelectorAll(".ticks li")];
const rail = document.querySelector(".rail i");
const editStage = document.querySelector(".edit-stage");
const pills = [...document.querySelectorAll(".pill")];
const drifts = [...document.querySelectorAll(".drift")];
const day = document.querySelector(".day");
const beats = [...document.querySelectorAll(".beat")];
const dayCopy = document.querySelector(".day-copy");
const dayTime = document.querySelector(".day-time");
const dayLabel = document.querySelector(".day-label");
const airportLine = document.querySelector(".airport p");
const tenure = document.querySelector(".tenure-copy");
const giant = document.querySelector(".giant");
const sea = document.querySelector(".giant-sea");

/* Hold, then a long wipe. Motion never sits still: scale and shift run the whole beat. */
function sceneAt(progress, count) {
  const scaled = clamp(progress, 0, 0.9999) * count;
  const index = Math.min(count - 1, Math.floor(scaled));
  const local = scaled - index;
  const wipe = reduced ? (local > 0.5 ? 1 : 0) : smooth(local < 0.42 ? 0 : (local - 0.42) / 0.58);
  return { index, local, wipe };
}

function placeImage(img, local, extra) {
  if (!img || reduced) {
    if (img) img.style.transform = "";
    return;
  }
  const depth = 1.16 - local * 0.1 + (extra || 0);
  const shift = (0.42 - local) * 10;
  img.style.transform = `translate3d(0, ${shift}%, 0) scale(${depth})`;
}

function updateHero() {
  const progress = sectionProgress(heroStage);
  if (reduced) return;
  heroImg.style.transform = `translate3d(0, ${progress * -10}%, 0) scale(${1.04 + progress * 0.14})`;
  const fade = progress < 0.5 ? 1 : 1 - (progress - 0.5) / 0.5;
  heroCopy.style.opacity = String(clamp(fade, 0, 1));
  heroCopy.style.transform = `translate3d(0, ${progress * -18}vh, 0)`;
  heroShade.style.opacity = String(0.75 + progress * 0.7);
}

function updateReel() {
  const { index, local, wipe } = sceneAt(sectionProgress(reel), slides.length);
  const last = slides.length - 1;
  slides.forEach((slide, idx) => {
    const incoming = idx === index + 1 && index < last;
    const current = idx === index;
    slide.style.opacity = current || incoming ? "1" : "0";
    slide.style.zIndex = incoming ? "2" : "1";
    slide.style.clipPath = incoming ? `inset(${(1 - wipe) * 100}% 0 0 0)` : "none";
    const img = slide.querySelector("img");
    if (current) placeImage(img, local, 0);
    else if (incoming) placeImage(img, wipe, 0.04);
    else if (img) img.style.transform = "scale(1.12)";
  });
  titles.forEach((title, idx) => {
    let opacity = 0;
    if (idx === index) opacity = index === last ? 1 : 1 - wipe;
    else if (idx === index + 1) opacity = wipe;
    title.style.opacity = String(opacity);
    title.style.transform = reduced ? "" : `translate3d(0, ${(1 - opacity) * 36}px, 0)`;
  });
  ticks.forEach((tick, idx) => tick.classList.toggle("on", idx === index));
  if (rail) rail.style.transform = `scaleY(${sectionProgress(reel)})`;
}

function updatePills() {
  const progress = sectionProgress(editStage);
  const shift = (progress - 0.5) * 2;
  pills.forEach((pill) => {
    const y = Number(pill.dataset.d) || 40;
    const x = Number(pill.dataset.x) || 0;
    pill.style.transform = reduced ? "" : `translate3d(${shift * x}px, ${shift * y}px, 0)`;
  });
}

function updateDrift() {
  if (reduced) return;
  drifts.forEach((frame) => {
    const img = frame.querySelector("img");
    if (!img) return;
    const rect = frame.getBoundingClientRect();
    const center = (rect.top + rect.height / 2) / window.innerHeight - 0.5;
    const speed = Number(frame.dataset.drift) || 40;
    img.style.transform = `translate3d(0, ${center * speed}px, 0) scale(1.14)`;
  });
}

function updateDay() {
  const { index, local, wipe } = sceneAt(sectionProgress(day), beats.length);
  const last = beats.length - 1;
  beats.forEach((beat, idx) => {
    const incoming = idx === index + 1 && index < last;
    const current = idx === index;
    beat.style.opacity = current || incoming ? "1" : "0";
    beat.style.zIndex = incoming ? "2" : "1";
    beat.classList.toggle("liquid", incoming && wipe > 0.04 && wipe < 0.96 && !reduced);
    beat.style.clipPath = incoming ? `circle(${wipe * 145}% at 68% 46%)` : "none";
    const img = beat.querySelector("img");
    if (current) placeImage(img, local, 0);
    else if (incoming) placeImage(img, wipe, 0.05);
  });
  const shown = wipe > 0.55 && index < last ? index + 1 : index;
  const beat = beats[shown];
  if (dayTime.textContent !== beat.dataset.time) {
    dayTime.textContent = beat.dataset.time;
    dayLabel.textContent = beat.dataset.label;
  }
  if (!reduced) {
    const edge = local < 0.12 ? local / 0.12 : local > 0.9 ? (1 - local) / 0.1 : 1;
    dayCopy.style.opacity = String(clamp(edge, 0.35, 1));
    dayCopy.style.transform = `translate3d(0, ${(1 - local) * 18}px, 0)`;
  }
}

function rise(el, distance) {
  if (!el || reduced) return;
  const rect = el.getBoundingClientRect();
  const progress = clamp(1 - rect.top / (window.innerHeight * 0.9), 0, 1);
  el.style.opacity = String(0.15 + 0.85 * progress);
  el.style.transform = `translate3d(0, ${(1 - progress) * distance}px, 0)`;
}

function updateSea() {
  if (!sea || reduced) return;
  const rect = sea.parentElement.getBoundingClientRect();
  const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
  sea.style.objectPosition = `${12 + progress * 70}% ${28 + progress * 36}%`;
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
  sea.style.webkitMaskImage = `url("${url}")`;
  sea.style.maskImage = `url("${url}")`;
  sea.style.webkitMaskSize = "100% 100%";
  sea.style.maskSize = "100% 100%";
  sea.style.webkitMaskRepeat = "no-repeat";
  sea.style.maskRepeat = "no-repeat";
  sea.style.webkitMaskPosition = "center";
  sea.style.maskPosition = "center";
  sea.style.webkitMaskMode = "alpha";
  sea.style.maskMode = "alpha";
  wrap.classList.add("masked");
}

sea.addEventListener("error", () => giant.parentElement.classList.remove("masked"));

function scrub() {
  updateHero();
  updateReel();
  updatePills();
  updateDrift();
  updateDay();
  rise(airportLine, 56);
  rise(tenure, 36);
  updateSea();
}

let frame = 0;
function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    scrub();
    frame = 0;
  });
}

const toggle = document.querySelector(".nav-toggle");
const menuLinks = document.querySelectorAll(".nav-panel a, .nav-links a");
function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
}
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    document.getElementById("brochure").close();
  }
});

const brochure = document.getElementById("brochure");
document.getElementById("open-brochure").addEventListener("click", () => brochure.showModal());
document.getElementById("close-brochure").addEventListener("click", () => brochure.close());

if (fine) {
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
    cx += (x - cx) * (reduced ? 1 : 0.22);
    cy += (y - cy) * (reduced ? 1 : 0.22);
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    const hit = document.elementFromPoint(x, y);
    const zone = hit && hit.closest(".lens-zone");
    const photo = zone && zone.classList.contains("cal-photo") ? zone.querySelector("img") : null;
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

scrub();
fitGiant();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitGiant(); scrub(); });
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  fitGiant();
  onScroll();
});
