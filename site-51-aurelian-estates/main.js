import * as THREE from 'three';
import { Sky } from 'three/addons/Sky.js';

const mobile = matchMedia('(max-width:820px)').matches || navigator.hardwareConcurrency <= 4 && /Mobi/.test(navigator.userAgent);
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.62;
renderer.shadowMap.enabled = !mobile;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const fogCol = new THREE.Color(0x8a7466);
scene.fog = new THREE.FogExp2(fogCol, mobile ? 0.006 : 0.0045);
const camera = new THREE.PerspectiveCamera(mobile ? 50 : 38, innerWidth / innerHeight, 0.1, 2000);

// ---- Sky (dusk) + environment
const sky = new Sky(); sky.scale.setScalar(4000);
const su = sky.material.uniforms;
su.turbidity.value = 6; su.rayleigh.value = 2.4; su.mieCoefficient.value = 0.006; su.mieDirectionalG.value = 0.86;
const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(89.3), THREE.MathUtils.degToRad(-128));
su.sunPosition.value.copy(sun);
scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene(); const sky2 = sky.clone(); envScene.add(sky2);
const env = pmrem.fromScene(envScene, 0.02).texture;
scene.environment = env;

const hemi = new THREE.HemisphereLight(0xc9b6ff, 0x3a2a1c, 0.35); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xffb27a, 2.2);
sunL.position.copy(sun).multiplyScalar(80).setY(18);
sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
Object.assign(sunL.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 });
sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03; sunL.shadow.radius = 4;
scene.add(sunL);

// ---- procedural textures
function noiseTex(size, fn, repeat = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const img = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const v = fn(i % size, (i / size) | 0); img.data.set([v[0], v[1], v[2], 255], i * 4); }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 8; return t;
}
const rnd = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
const stoneTex = noiseTex(256, (x, y) => { const n = rnd(x, y) * 18 + Math.sin(y * 0.09 + rnd(1, y) * 2) * 6; const b = 196 + n; return [b, b - 8, b - 20]; }, 1);
stoneTex.colorSpace = THREE.SRGBColorSpace;
const woodTex = noiseTex(256, (x, y) => { const n = Math.sin(x * 0.35 + Math.sin(y * 0.05) * 3) * 14 + rnd(x, y) * 10; return [120 + n, 78 + n * .7, 48 + n * .5]; }, 2);
woodTex.colorSpace = THREE.SRGBColorSpace;
const waterN = noiseTex(256, (x, y) => { const a = Math.sin(x * 0.18 + y * 0.07) + Math.sin(y * 0.23 - x * 0.05) * 0.8 + rnd(x, y) * 0.3; const b = Math.cos(y * 0.16 + x * 0.09) + Math.cos(x * 0.21) * 0.6; return [128 + a * 30, 128 + b * 30, 255]; }, 1);

// ---- materials
const M = {
  stone: new THREE.MeshStandardMaterial({ color: 0xe8dcc6, map: stoneTex, roughness: 0.82 }),
  slab: new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.7 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.5, metalness: 0.4 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x6b5236, roughness: 0.35, metalness: 0.9 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x1d2a30, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.32, envMapIntensity: 1.6, depthWrite: false }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.6 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xcfbfa6, map: stoneTex, roughness: 0.35 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0xd9cdb8, roughness: 0.95 }),
  rug: new THREE.MeshStandardMaterial({ color: 0x6e5a48, roughness: 1 }),
  glow: new THREE.MeshBasicMaterial({ color: 0xffc98a }),
  fire: new THREE.MeshBasicMaterial({ color: 0xff8a3a }),
  art: new THREE.MeshStandardMaterial({ color: 0x9a4f2e, roughness: 0.9 }),
  ground: new THREE.MeshStandardMaterial({ color: 0x6b5a45, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x5f6b45, roughness: 0.9 }),
  leaf2: new THREE.MeshStandardMaterial({ color: 0x7a7a52, roughness: 0.9 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x3c2e22, roughness: 1 }),
  water: new THREE.MeshStandardMaterial({ color: 0x06262d, roughness: 0.08, metalness: 0.7, normalMap: waterN, normalScale: new THREE.Vector2(0.1, 0.1), envMapIntensity: 0.75 }),
};
const box = (w, h, d, mat, x, y, z, cast = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z);
  m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m;
};

// ---- ground & terrace
const ground = new THREE.Mesh(new THREE.CircleGeometry(600, 64), M.ground); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
box(44, 0.6, 32, M.stone, 0, 0.3, 2, false);
// pool (recessed): coping + water
const poolW = 26, poolD = 6.5, poolZ = 11;
box(poolW + 1.2, 0.08, 0.6, M.slab, 0, 0.64, poolZ - poolD / 2 - 0.3);
box(0.6, 0.08, poolD, M.slab, -poolW / 2 - 0.3, 0.64, poolZ);
const water = new THREE.Mesh(new THREE.PlaneGeometry(poolW, poolD), M.water);
water.rotation.x = -Math.PI / 2; water.position.set(0, 0.615, poolZ); water.receiveShadow = true; scene.add(water);
box(poolW, 0.1, 0.4, M.dark, 0, 0.57, poolZ + poolD / 2 + 0.2, false); // vanishing edge
// pool underwater glow
const pl = new THREE.PointLight(0x4fd0d8, 6, 14, 2); pl.position.set(0, 0.2, poolZ); scene.add(pl);

// ---- ground floor living pavilion x[-14,6] z[-6,4], y .6-4.8
const G = { x0: -14, x1: 6, z0: -6, z1: 4, y0: 0.6, y1: 4.8 };
box(G.x1 - G.x0, 0.1, G.z1 - G.z0, M.floor, (G.x0 + G.x1) / 2, G.y0 + 0.05, -1, false);
box(G.x1 - G.x0, 0.3, 0.6, M.stone, (G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2 + 0.0, G.z0, true).scale.y = (G.y1 - G.y0) / 0.3; // back wall
box(1.2, 9.4, 14, M.stone, -15, 4.7, -1); // stone fin wall
const glassFront = new THREE.Mesh(new THREE.PlaneGeometry(G.x1 - G.x0, G.y1 - G.y0), M.glass);
glassFront.position.set((G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2, G.z1); scene.add(glassFront);
const glassSide = new THREE.Mesh(new THREE.PlaneGeometry(G.z1 - G.z0, G.y1 - G.y0), M.glass);
glassSide.rotation.y = Math.PI / 2; glassSide.position.set(G.x1, (G.y0 + G.y1) / 2, -1); scene.add(glassSide);
for (let x = G.x0 + 2.5; x < G.x1; x += 2.5) box(0.06, G.y1 - G.y0, 0.08, M.dark, x, (G.y0 + G.y1) / 2, G.z1, false);
for (let z = G.z0 + 2.5; z < G.z1; z += 2.5) box(0.08, G.y1 - G.y0, 0.06, M.dark, G.x1, (G.y0 + G.y1) / 2, z, false);

// slab 1 (cantilever) — extends past glass
box(30, 0.55, 15, M.slab, -1, G.y1 + 0.27, -0.5);
// ceiling light strip (visible through glass)
box(18, 0.04, 0.25, M.glow, -4, G.y1 - 0.03, 2.6, false);
box(18, 0.04, 0.25, M.glow, -4, G.y1 - 0.03, -4.4, false);

// upper floor glass volume x[-6,14] z[-5,3] y 5.35-8.9
const U = { x0: -6, x1: 15, z0: -5.5, z1: 3, y0: 5.35, y1: 8.9 };
const ug = new THREE.Mesh(new THREE.BoxGeometry(U.x1 - U.x0, U.y1 - U.y0, U.z1 - U.z0), M.glass);
ug.position.set((U.x0 + U.x1) / 2, (U.y0 + U.y1) / 2, (U.z0 + U.z1) / 2); scene.add(ug);
// upper warm interior glow (back wall)
const uw = new THREE.Mesh(new THREE.PlaneGeometry(U.x1 - U.x0 - 1, 3.2), new THREE.MeshStandardMaterial({ color: 0x2a1e14, emissive: 0xffa860, emissiveIntensity: 0.55 }));
uw.position.set((U.x0 + U.x1) / 2, 7.1, U.z0 + 0.3); scene.add(uw);
for (let x = U.x0 + 3; x < U.x1; x += 3) box(0.06, U.y1 - U.y0, 0.08, M.dark, x, (U.y0 + U.y1) / 2, U.z1, false);
box(9, 3.55, 0.5, M.wood, 10.5, (U.y0 + U.y1) / 2, U.z0 + 0.25); // timber screen
// roof slab, big overhang
box(26, 0.45, 13, M.slab, 4.5, U.y1 + 0.22, -1.2);
box(26.2, 0.08, 13.2, M.stone, 4.5, U.y1 + 0.48, -1.2, false);
// pilotis under cantilever
[[13, 2], [13, -5]].forEach(([x, z]) => box(0.35, G.y1 - 0.6, 0.35, M.dark, x, (G.y1 + 0.6) / 2, z));
// outdoor deck & loungers
box(10, 0.06, 4.5, M.wood, -6, 0.63, 6, false);
for (let i = 0; i < 4; i++) { box(0.8, 0.25, 2.1, M.fabric, -9 + i * 2, 0.8, 6.2); box(0.8, 0.5, 0.5, M.fabric, -9 + i * 2, 1.05, 5.3).rotation.x = -0.5; }

// ---- interior living room (camera visits this)
const warm = 0xffb070;
const il1 = new THREE.PointLight(warm, 14, 12, 2); il1.position.set(-8, 4, -1); scene.add(il1);
const il2 = new THREE.PointLight(warm, 10, 10, 2); il2.position.set(-1, 4, -1.5); scene.add(il2);
box(10, 0.02, 5, M.rug, -6, 0.66, -1.5, false);
// sofa (L)
box(6, 0.45, 1.1, M.fabric, -6, 0.9, -3.6); box(6, 0.8, 0.3, M.fabric, -6, 1.3, -4.1);
box(1.1, 0.45, 3, M.fabric, -9.5, 0.9, -2.5); box(0.3, 0.8, 3, M.fabric, -10, 1.3, -2.5);
// coffee table
const ct = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.35, 48), M.stone); ct.position.set(-5.8, 0.85, -1.6); ct.castShadow = true; scene.add(ct);
box(0.6, 0.06, 0.4, M.bronze, -5.6, 1.06, -1.5);
// hearth
box(4.2, 1.1, 0.9, M.stone, -12.8 + 0.4, 1.15, -1.5).rotation.y = Math.PI / 2;
const fire = box(2.2, 0.35, 0.1, M.fire, -12.2, 1.3, -1.5, false); fire.rotation.y = Math.PI / 2;
const fl = new THREE.PointLight(0xff7a2a, 6, 6, 2); fl.position.set(-11.5, 1.4, -1.5); scene.add(fl);
// art on back wall
box(3.4, 2.2, 0.06, M.art, -2.5, 2.9, G.z0 + 0.34);
box(3.6, 2.4, 0.03, M.dark, -2.5, 2.9, G.z0 + 0.32);
// pendant
const pend = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.03, 12, 64), M.glow); pend.rotation.x = Math.PI / 2; pend.position.set(-5.8, 3.4, -1.6); scene.add(pend);
box(0.01, 1.3, 0.01, M.dark, -5.8, 4.1, -1.6, false);
// dining table + chairs
box(3.6, 0.08, 1.2, M.wood, 2, 1.45, -2.5); box(0.1, 0.8, 0.9, M.dark, 0.6, 1.0, -2.5); box(0.1, 0.8, 0.9, M.dark, 3.4, 1.0, -2.5);
for (let i = 0; i < 3; i++) { box(0.5, 0.9, 0.5, M.fabric, 0.8 + i * 1.2, 1.05, -3.5); box(0.5, 0.9, 0.5, M.fabric, 0.8 + i * 1.2, 1.05, -1.5); }
// sculpture
const sc = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.08, 100, 12, 2, 3), M.bronze); sc.position.set(-5.4, 1.4, -1.8); scene.add(sc);

// ---- landscaping: instanced trees and agaves
const treeCount = mobile ? 60 : 170;
const trunkG = new THREE.CylinderGeometry(0.12, 0.22, 3, 6); trunkG.translate(0, 1.5, 0);
const canG = new THREE.IcosahedronGeometry(1.6, 2);
const trunks = new THREE.InstancedMesh(trunkG, M.trunk, treeCount);
const cans = new THREE.InstancedMesh(canG, M.leaf, treeCount * 2);
const dummy = new THREE.Object3D(); let ci = 0;
for (let i = 0; i < treeCount; i++) {
  let x, z; do { const a = Math.random() * Math.PI * 2, r = 26 + Math.pow(Math.random(), 0.7) * 110; x = Math.cos(a) * r; z = Math.sin(a) * r; } while (z > 14 && Math.abs(x) < 40);
  const s = 0.7 + Math.random() * 0.9;
  dummy.position.set(x, 0, z); dummy.rotation.set(0, Math.random() * 6, 0); dummy.scale.set(s, s * (0.8 + Math.random() * 0.5), s); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
  for (let k = 0; k < 2; k++) { dummy.position.set(x + (Math.random() - .5) * 1.4 * s, (3 + k * 0.6) * s, z + (Math.random() - .5) * 1.4 * s); const cs = s * (0.8 + Math.random() * 0.5); dummy.scale.set(cs * 1.3, cs * 0.75, cs * 1.3); dummy.updateMatrix(); cans.setMatrixAt(ci++, dummy.matrix); }
}
trunks.castShadow = cans.castShadow = !mobile; cans.receiveShadow = true; scene.add(trunks, cans);
const agG = new THREE.ConeGeometry(0.12, 1.2, 4); agG.translate(0, 0.6, 0);
const agaves = new THREE.InstancedMesh(agG, M.leaf2, mobile ? 300 : 900); let ai = 0;
for (let p = 0; p < agaves.count / 12; p++) {
  const x = (Math.random() - .5) * 70, z = -18 - Math.random() * 20 + (Math.random() < .4 ? 50 : 0); const bx = Math.random() < .5 ? x : (Math.random() < .5 ? -26 : 26) + Math.random() * 8;
  for (let k = 0; k < 12 && ai < agaves.count; k++) { dummy.position.set(bx, 0, z); dummy.rotation.set(0.5 + Math.random() * 0.5, k / 12 * Math.PI * 2, 0, 'YXZ'); dummy.scale.setScalar(0.8 + Math.random() * 0.6); dummy.updateMatrix(); agaves.setMatrixAt(ai++, dummy.matrix); }
}
scene.add(agaves);
// hedges lining terrace
box(0.9, 1, 30, M.leaf, -22.5, 1.1, 2); box(0.9, 1, 30, M.leaf, 22.5, 1.1, 2);
// garden uplights
for (let i = -1; i <= 1; i += 2) { const l = new THREE.SpotLight(0xffc48a, 30, 18, 0.6, 0.6, 2); l.position.set(i * 19, 0.7, 14); l.target.position.set(i * 15, 6, -1); scene.add(l, l.target); }
// distant mountains
const mtG = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI*2, 0, Math.PI/2);
const mtM = new THREE.MeshStandardMaterial({ color: 0x4a3a44, roughness: 1 });
for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(mtG, mtM); const a = -3.1 + i * 0.36; m.position.set(Math.cos(a) * 420, 0, Math.sin(a) * 420); m.scale.set(140 + Math.random() * 120, 18 + Math.random() * 30, 90); m.rotation.y = Math.random(); scene.add(m); }

// ---- camera journey
const K = [
  { p: [24, 8.5, 47], t: [-23, 4.5, 5] },     // hero exterior
  { p: [17, 1.6, 21], t: [-3, 2.2, 6] }, // pool
  { p: [3, 2.9, 2.2], t: [-9, 1.7, -2.2] }, // living room
  { p: [58, 70, 62], t: [0, 0, 2] },     // aerial
];
if (mobile) { K[0].p = [36, 16, 58]; K[0].t = [-2, -3, 2]; K[1].p = [20, 2.2, 28]; K[3].p = [70, 90, 80]; }
const v = (a) => new THREE.Vector3(...a);
const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
let target = 0, prog = 0;
const stages = ['hero', 'pool', 'explore', 'aerial'].map(id => document.getElementById(id));
function readScroll() {
  const y = scrollY; let p = 0;
  for (let i = 0; i < stages.length - 1; i++) {
    const a = stages[i].offsetTop, b = stages[i + 1].offsetTop;
    if (y >= a) p = i + Math.min(1, (y - a) / (b - a));
  }
  target = Math.min(3, p);
}
addEventListener('scroll', readScroll, { passive: true }); readScroll();
const veil = document.getElementById('veil'), content = document.querySelector('.content');

// ---- hotspots
const spots = [
  { p: [-11.6, 1.6, -1.5], h: 'Travertine hearth', d: 'A single block of Tivoli travertine, hand-dressed on site by a mason from Bagni di Tivoli.' },
  { p: [-2.6, 1.5, -3.8], h: 'Bouclé sofa', d: 'Six metres of hand-tufted wool bouclé on a white-oak frame, made to the room by a Milanese atelier.' },
  { p: [-5.8, 3.4, -1.6], h: 'Halo pendant', d: 'Spun brass and hand-blown opal, made in a workshop of four in Copenhagen.' },
  { p: [-5.4, 1.95, -1.8], h: 'Bronze study', d: 'Lost-wax cast bronze, one of three. Offered with the house by separate arrangement.' },
];
const hsWrap = document.getElementById('hotspots'), det = document.getElementById('spotDetail');
spots.forEach((s, i) => {
  const el = document.createElement('button'); el.className = 'spot' + (i ? '' : ' on'); el.textContent = ['I', 'II', 'III', 'IV'][i]; el.setAttribute('aria-label', s.h);
  el.onclick = () => { hsWrap.querySelectorAll('.spot').forEach(e => e.classList.remove('on')); el.classList.add('on'); det.innerHTML = `<h3>${s.h}</h3><p>${s.d}</p>`; };
  s.el = el; s.v = v(s.p); hsWrap.appendChild(el);
});
const tmp = new THREE.Vector3();

// ---- render loop
const clock = new THREE.Clock(); let mouseX = 0, mouseY = 0;
addEventListener('pointermove', e => { mouseX = e.clientX / innerWidth - .5; mouseY = e.clientY / innerHeight - .5; });
const camP = new THREE.Vector3(), camT = new THREE.Vector3();
function place(t, time) {
  const i = Math.min(2, Math.floor(t)), f = ease(t - i);
  camP.lerpVectors(v(K[i].p), v(K[i + 1].p), f); camT.lerpVectors(v(K[i].t), v(K[i + 1].t), f);
  // hero slow orbit, fades out as you leave
  const orbitW = Math.max(0, 1 - t * 1.5), aW = Math.max(0, t - 2);
  const ang = time * 0.035 * orbitW + time * 0.02 * aW;
  const off = camP.clone().sub(camT); off.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(ang) * 0.5 * (orbitW + aW));
  camera.position.copy(camT).add(off);
  camera.position.x += mouseX * 1.2; camera.position.y -= mouseY * 0.6;
  camera.lookAt(camT);
}
let paused = false;
function frame() {
  requestAnimationFrame(frame);
  const time = clock.elapsedTime;
  const dt = Math.min(0.1, clock.getDelta()); prog += (target - prog) * (1 - Math.exp(-dt * 3.2)); if (window.__lock) prog = target;
  // fade scene beneath content
  const r = content.getBoundingClientRect().top / innerHeight;
  veil.style.opacity = Math.min(1, Math.max(0, 1.1 - r * 1.4)).toFixed(3);
  paused = r < -0.05;
  if (paused) return;
  place(prog, time);
  waterN.offset.set(time * 0.012, time * 0.008);
  fl.intensity = 5 + Math.sin(time * 7) * 0.6 + Math.sin(time * 13) * 0.4;
  sc.rotation.y = time * 0.1;
  // hotspots visibility
  const vis = Math.max(0, 1 - Math.abs(prog - 2) * 2.5);
  spots.forEach(s => {
    tmp.copy(s.v).project(camera);
    s.el.style.transform = `translate(${(tmp.x * .5 + .5) * innerWidth}px,${(-tmp.y * .5 + .5) * innerHeight}px)`;
    s.el.style.left = s.el.style.top = '0';
    s.el.style.opacity = vis; s.el.style.pointerEvents = vis > .5 ? 'auto' : 'none';
  });
  renderer.render(scene, camera);
}

// ---- listing thumbnails rendered from the scene itself
function shoot(p, t, w, h, fov = 40) {
  const c = new THREE.PerspectiveCamera(fov, w / h, 0.1, 2000); c.position.set(...p); c.lookAt(...t);
  const old = renderer.getPixelRatio(); renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  renderer.render(scene, c); const url = canvas.toDataURL('image/jpeg', 0.88);
  renderer.setPixelRatio(old); renderer.setSize(innerWidth, innerHeight); return url;
}
const S = mobile ? 1 : 1.4;
document.getElementById('th0').src = shoot([24, 3, 30], [0, 4, 0], 640 * S, 800 * S);
document.getElementById('th1').src = shoot([-30, 6, 26], [0, 5, 0], 640 * S, 800 * S);
document.getElementById('th2').src = shoot([10, 1.2, 16], [-4, 1.5, 6], 640 * S, 800 * S);
document.getElementById('th3').src = shoot([1, 2.4, 2.8], [-10, 1.6, -3.2], 800 * S, 1000 * S, 50);

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// 3D tilt cards
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});
window.__ready = true;
frame();
