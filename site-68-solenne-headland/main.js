document.documentElement.classList.remove("no-js");

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const sectionProgress = (el) => {
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return clamp(-el.getBoundingClientRect().top / total, 0, 1);
};

const reel = document.querySelector(".reel");
const slides = [...document.querySelectorAll(".reel .slide")];
const titles = [...document.querySelectorAll(".reel-titles h2")];
const ticks = [...document.querySelectorAll(".ticks li")];
const rail = document.querySelector(".rail i");

const day = document.querySelector(".day");
const beats = [...document.querySelectorAll(".beat")];
const dayTime = document.querySelector(".day-time");
const dayLabel = document.querySelector(".day-label");

const pills = [...document.querySelectorAll(".pill")];
const editorial = document.querySelector(".editorial");
const giant = document.querySelector(".giant");

function scrubPair(items, progress, apply) {
  const last = items.length - 1;
  const scaled = progress * items.length;
  let i = Math.min(last, Math.floor(scaled));
  let f = scaled - i;
  if (i === last) f = 0;
  const wipe = reduced ? (f > 0.5 ? 1 : 0) : f > 0.8 ? (f - 0.8) / 0.2 : 0;
  const shown = wipe > 0.45 && i < last ? i + 1 : i;
  apply(i, wipe, shown, last);
}

function updateReel() {
  scrubPair(slides, sectionProgress(reel), (i, wipe, shown, last) => {
    slides.forEach((slide, idx) => {
      const incoming = idx === i + 1 && i < last;
      slide.style.opacity = idx === i || incoming ? "1" : "0";
      slide.style.zIndex = incoming ? "2" : "1";
      if (incoming) {
        slide.style.clipPath = `inset(${(1 - wipe) * 100}% 0 0 0)`;
      } else {
        slide.style.clipPath = "none";
      }
      const img = slide.querySelector("img");
      const drift = idx === shown ? 1.04 - (reduced ? 0 : (wipe || (sectionProgress(reel) % 0.25)) * 0.03) : 1.08;
      img.style.transform = `scale(${drift})`;
    });
    titles.forEach((title, idx) => {
      let opacity = 0;
      if (idx === i) opacity = i === last ? 1 : 1 - wipe;
      else if (idx === i + 1) opacity = wipe;
      title.style.opacity = String(opacity);
    });
    ticks.forEach((tick, idx) => tick.classList.toggle("on", idx === shown));
    if (rail) rail.style.transform = `scaleY(${sectionProgress(reel)})`;
  });
}

function updateDay() {
  scrubPair(beats, sectionProgress(day), (i, wipe, shown, last) => {
    beats.forEach((beat, idx) => {
      const incoming = idx === i + 1 && i < last;
      beat.style.opacity = idx === i || incoming ? "1" : "0";
      beat.style.zIndex = incoming ? "2" : "1";
      beat.classList.toggle("liquid", incoming && wipe > 0.02 && wipe < 0.98 && !reduced);
      beat.style.clipPath = incoming ? `circle(${wipe * 140}% at 70% 48%)` : "none";
    });
    const beat = beats[shown];
    if (dayTime.textContent !== beat.dataset.time) {
      dayTime.textContent = beat.dataset.time;
      dayLabel.textContent = beat.dataset.label;
    }
  });
}

function updatePills() {
  const rect = editorial.getBoundingClientRect();
  const shift = clamp(1 - (rect.top + rect.height / 2) / window.innerHeight, -1, 1);
  pills.forEach((pill) => {
    const distance = Number(pill.dataset.d) || 24;
    pill.style.transform = `translate3d(0, ${shift * distance}px, 0)`;
  });
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
  const sea = document.querySelector(".giant-sea");
  sea.addEventListener("error", () => giant.parentElement.classList.remove("masked"));
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

let frame = 0;
function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    updateReel();
    updateDay();
    updatePills();
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

updateReel();
updateDay();
updatePills();
fitGiant();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitGiant);
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  fitGiant();
  onScroll();
});
