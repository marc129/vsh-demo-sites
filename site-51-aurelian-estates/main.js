import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const mobile = matchMedia('(max-width:820px)').matches || navigator.hardwareConcurrency <= 4 && /Mobi/.test(navigator.userAgent);
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const fogCol = new THREE.Color(0x8a7466);
scene.fog = new THREE.FogExp2(fogCol, mobile ? 0.006 : 0.0045);
const camera = new THREE.PerspectiveCamera(mobile ? 50 : 38, innerWidth / innerHeight, 0.1, 2000);

// ---- Sky (dusk) background + Poly Haven HDRI environment (CC0)
const sky = new Sky(); sky.scale.setScalar(4000);
const su = sky.material.uniforms;
su.turbidity.value = 6; su.rayleigh.value = 2.4; su.mieCoefficient.value = 0.006; su.mieDirectionalG.value = 0.86;
const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(87.5), THREE.MathUtils.degToRad(-128));
su.sunPosition.value.copy(sun);
scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const [hdr, villa, qt1, qt2, sh1, sh4] = await Promise.all([
  new RGBELoader().loadAsync('assets/dusk.hdr'),
  ...['villa', 'quiver_tree_01', 'quiver_tree_02', 'shrub_01', 'shrub_04'].map(n => loader.loadAsync(`assets/${n}.glb`)),
]);
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = pmrem.fromEquirectangular(hdr).texture; hdr.dispose();
scene.environmentIntensity = 0.55;

const hemi = new THREE.HemisphereLight(0xc9b6ff, 0x3a2a1c, 0.25); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xffb27a, 2.6);
sunL.position.copy(sun).multiplyScalar(60).setY(14);
sunL.castShadow = true; sunL.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 });
sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.03; sunL.shadow.radius = 5;
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
const stoneTex = noiseTex(256, (x, y) => { const n = rnd(x, y) * 14 + Math.sin(y * 0.09 + rnd(1, y) * 2) * 5; const b = 200 + n; return [b, b - 8, b - 20]; }, 1);
stoneTex.colorSpace = THREE.SRGBColorSpace;
const woodTex = noiseTex(256, (x, y) => { const n = Math.sin(x * 0.35 + Math.sin(y * 0.05) * 3) * 14 + rnd(x, y) * 10; return [120 + n, 78 + n * .7, 48 + n * .5]; }, 2);
woodTex.colorSpace = THREE.SRGBColorSpace;
const waterN = noiseTex(256, (x, y) => { const a = Math.sin(x * 0.18 + y * 0.07) * 0.7 + Math.sin(y * 0.23 - x * 0.05) * 0.5 + (rnd(x, y) - .5) * 0.4; const b = Math.cos(y * 0.16 + x * 0.09) * 0.7 + Math.cos(x * 0.21) * 0.4; return [128 + a * 40, 128 + b * 40, 255]; }, 1);
const groundTex = noiseTex(512, (x, y) => { const n = rnd(x, y) * 30 + rnd((x >> 3) + 7, (y >> 3) + 3) * 16; return [92 + n, 78 + n * .9, 60 + n * .7]; }, 90);
groundTex.colorSpace = THREE.SRGBColorSpace;

// ---- materials
const M = {
  stone: new THREE.MeshStandardMaterial({ color: 0xe8dcc6, map: stoneTex, roughness: 0.78 }),
  slab: new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.45, metalness: 0.6 }),
  bronze: new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.3, metalness: 1 }),
  wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0xd9cdb8, roughness: 0.95 }),
  rug: new THREE.MeshStandardMaterial({ color: 0x6e5a48, roughness: 1 }),
  glow: new THREE.MeshBasicMaterial({ color: 0xffd6a0 }),
  fire: new THREE.MeshBasicMaterial({ color: 0xff8a3a }),
  art: new THREE.MeshStandardMaterial({ color: 0x9a4f2e, roughness: 0.9 }),
  ground: new THREE.MeshStandardMaterial({ color: 0xffffff, map: groundTex, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x5a6644, roughness: 0.9 }),
  poolTile: new THREE.MeshStandardMaterial({ color: 0x2f6f78, roughness: 0.4 }),
};
const box = (w, h, d, mat, x, y, z, cast = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z);
  m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m;
};

// ---- the villa (Innerscene "Modern flat-roof villa", CC0)
const house = villa.scene; house.rotation.y = -Math.PI / 2; scene.add(house);
house.traverse(o => {
  if (!o.isMesh) return;
  const m = o.material;
  if (m.transmission > 0 || /glaz/i.test(m.name)) {
    o.material = new THREE.MeshPhysicalMaterial({ color: 0x223038, roughness: 0.03, metalness: 0.2, transparent: true, opacity: 0.28, envMapIntensity: 2, depthWrite: false, side: THREE.DoubleSide });
    o.castShadow = false; o.renderOrder = 2;
  } else { o.castShadow = o.receiveShadow = true; m.envMapIntensity = 1; }
});
house.updateMatrixWorld(true);
const hb = new THREE.Box3().setFromObject(house);
// floor level from a downward ray inside the ground floor
const ray = new THREE.Raycaster(new THREE.Vector3(0, 2.4, 3), new THREE.Vector3(0, -1, 0));
const hit = ray.intersectObject(house, true)[0];
const F = hit ? hit.point.y : 0.3;
window.__F = F; window.__hb = hb;

// ---- ground & terrace
const ground = new THREE.Mesh(new THREE.CircleGeometry(600, 64), M.ground); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; ground.receiveShadow = true; scene.add(ground);
const tz0 = hb.max.z, poolW = 13, poolD = 4.2, poolZ = tz0 + 5.2;
{ const tw = 30, tz1 = tz0 + 12.6; // terrace with a cut-out for the pool
  const pz0 = poolZ - poolD / 2, pz1 = poolZ + poolD / 2;
  box(tw, 0.2, pz0 - (tz0 - 1), M.stone, 0, 0.1, (pz0 + tz0 - 1) / 2, false);
  box(tw, 0.2, tz1 - pz1, M.stone, 0, 0.1, (tz1 + pz1) / 2, false);
  const sw = (tw - poolW) / 2; box(sw, 0.2, poolD, M.stone, -(poolW + sw) / 2, 0.1, poolZ, false); box(sw, 0.2, poolD, M.stone, (poolW + sw) / 2, 0.1, poolZ, false); }
// pool: tiled basin + reflective water surface
box(poolW, 0.05, poolD, M.poolTile, 0, 0.02, poolZ, false);
const water = new Water(new THREE.PlaneGeometry(poolW, poolD), {
  textureWidth: mobile ? 256 : 1024, textureHeight: mobile ? 256 : 1024, waterNormals: waterN,
  sunDirection: sun.clone().normalize(), sunColor: 0xffc890, waterColor: 0x0b3a42, distortionScale: 0.25, fog: true, alpha: 0.95,
});
water.material.uniforms.size.value = 2.5;
water.rotation.x = -Math.PI / 2; water.position.set(0, 0.17, poolZ); scene.add(water);
box(poolW + 0.8, 0.06, 0.4, M.slab, 0, 0.22, poolZ - poolD / 2 - 0.2, false);
box(poolW + 0.8, 0.06, 0.4, M.slab, 0, 0.22, poolZ + poolD / 2 + 0.2, false);
box(0.4, 0.06, poolD, M.slab, -poolW / 2 - 0.2, 0.22, poolZ, false);
box(0.4, 0.06, poolD, M.slab, poolW / 2 + 0.2, 0.22, poolZ, false);
const pl = new THREE.PointLight(0x4fd0d8, 4, 9, 2); pl.position.set(0, -0.2, poolZ); scene.add(pl);
// loungers
for (let i = 0; i < 3; i++) { const x = -4 + i * 2.2; box(0.75, 0.22, 1.9, M.fabric, x, 0.35, tz0 + 1.6); box(0.75, 0.45, 0.4, M.fabric, x, 0.6, tz0 + 0.85).rotation.x = -0.5; }

// ---- interior living room (furnished; the model ships unfurnished)
const IZ = 3, IX = 0.5;
const warm = 0xffb070;
const il1 = new THREE.PointLight(warm, 3.5, 8, 2); il1.position.set(IX - 2, F + 2.3, IZ); scene.add(il1);
const il2 = new THREE.PointLight(warm, 2.5, 7, 2); il2.position.set(IX + 2.5, F + 2.3, IZ - 1); scene.add(il2);
const il3 = new THREE.PointLight(warm, 5, 9, 2); il3.position.set(-3, 5.2, 0); scene.add(il3);
box(4.6, 0.02, 3, M.rug, IX, F + 0.01, IZ, false);
box(3.4, 0.4, 0.9, M.fabric, IX, F + 0.22, IZ - 1.6); box(3.4, 0.75, 0.25, M.fabric, IX, F + 0.45, IZ - 2.05);
box(0.9, 0.4, 2, M.fabric, IX - 2.1, F + 0.22, IZ - 0.7); box(0.25, 0.75, 2, M.fabric, IX - 2.45, F + 0.45, IZ - 0.7);
const ct = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.3, 48), M.stone); ct.position.set(IX, F + 0.17, IZ - 0.3); ct.castShadow = true; scene.add(ct);
box(0.4, 0.04, 0.28, M.bronze, IX + 0.15, F + 0.34, IZ - 0.25);
// hearth on the side wall
const HX = hb.min.x + 0.55;
box(0.7, 0.8, 2.4, M.stone, HX, F + 0.4, IZ - 0.6);
const fire = box(0.06, 0.25, 1.4, M.fire, HX + 0.36, F + 0.5, IZ - 0.6, false);
const fl = new THREE.PointLight(0xff7a2a, 3, 5, 2); fl.position.set(HX + 0.9, F + 0.6, IZ - 0.6); scene.add(fl);
const pend = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 12, 64), M.glow); pend.rotation.x = Math.PI / 2; pend.position.set(IX, F + 2.05, IZ - 0.3); scene.add(pend);
box(0.01, 0.6, 0.01, M.dark, IX, F + 2.4, IZ - 0.3, false);
box(2.2, 0.06, 0.9, M.wood, IX + 4, F + 0.76, IZ - 1.2); box(0.08, 0.72, 0.7, M.dark, IX + 3.1, F + 0.37, IZ - 1.2); box(0.08, 0.72, 0.7, M.dark, IX + 4.9, F + 0.37, IZ - 1.2);
for (let i = 0; i < 3; i++) { box(0.42, 0.8, 0.42, M.fabric, IX + 3.3 + i * 0.7, F + 0.4, IZ - 1.9); box(0.42, 0.8, 0.42, M.fabric, IX + 3.3 + i * 0.7, F + 0.4, IZ - 0.5); }
const sc = new THREE.Mesh(new THREE.TorusKnotGeometry(0.13, 0.04, 100, 12, 2, 3), M.bronze); sc.position.set(IX + 0.25, F + 0.55, IZ - 0.35); sc.castShadow = true; scene.add(sc);

// ---- landscaping: Poly Haven quiver trees and shrubs (CC0)
const prep = (g) => { g.scene.traverse(o => { if (o.isMesh) { o.castShadow = !mobile; o.receiveShadow = true; } }); return g.scene; };
const norm = (o, h) => { const b = new THREE.Box3().setFromObject(o); const k = h / (b.max.y - b.min.y); const w = new THREE.Group(); o.scale.setScalar(k); o.position.y = -b.min.y * k; w.add(o); return w; };
const trees = [norm(prep(qt1), 5), norm(prep(qt2), 4)], shrubs = [norm(prep(sh1), 1.1), norm(prep(sh4), 0.8)];
const away = (x, z) => !(Math.abs(x) < hb.max.x + 3 && z > hb.min.z - 3 && z < poolZ + 6) && !(x > -4 && z > tz0 - 4 && x < 45 && z < tz0 + 45);
function scatter(list, n, r0, r1, s0, s1) {
  for (let i = 0; i < n; i++) {
    let x, z; do { const a = Math.random() * Math.PI * 2, r = r0 + Math.pow(Math.random(), 0.8) * (r1 - r0); x = Math.cos(a) * r; z = Math.sin(a) * r; } while (!away(x, z) || (z > poolZ + 4 && Math.abs(x) < 14 && r0 > 10));
    const o = list[i % list.length].clone(); o.position.set(x, 0, z); o.rotation.y = Math.random() * 6; o.scale.setScalar(s0 + Math.random() * (s1 - s0)); scene.add(o);
  }
}
scatter(trees, mobile ? 14 : 34, 12, 70, 0.9, 1.5);
scatter(shrubs, mobile ? 30 : 90, 9, 45, 0.8, 1.6);
// terrace planting rows
for (let i = 0; i < 8; i++) { [-1, 1].forEach(sd => { const o = shrubs[i % 2].clone(); o.position.set(sd * (poolW / 2 + 2.5), 0.2, tz0 + 1 + i * 1.3); o.scale.setScalar(0.7 + Math.random() * .3); o.rotation.y = Math.random() * 6; scene.add(o); }); }
// garden uplights on the facade
for (let i = -1; i <= 1; i += 2) { const l = new THREE.SpotLight(0xffc48a, 14, 14, 0.55, 0.6, 2); l.position.set(i * 9, 0.4, tz0 + 3); l.target.position.set(i * 5, 5, tz0 - 1); scene.add(l, l.target); }
// distant mountains
const mtG = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI*2, 0, Math.PI/2);
const mtM = new THREE.MeshStandardMaterial({ color: 0x4a3a44, roughness: 1 });
for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(mtG, mtM); const a = -3.1 + i * 0.36; m.position.set(Math.cos(a) * 420, 0, Math.sin(a) * 420); m.scale.set(140 + Math.random() * 120, 18 + Math.random() * 30, 90); m.rotation.y = Math.random(); scene.add(m); }

// ---- post: subtle bloom + depth of field (DOF off on mobile)
const composer = new EffectComposer(renderer);
composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(innerWidth, innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), mobile ? 0.1 : 0.16, 0.4, 0.97);
composer.addPass(bloom);
let bokeh = null;
if (!mobile) { bokeh = new BokehPass(scene, camera, { focus: 30, aperture: 0.00012, maxblur: 0.004 }); composer.addPass(bokeh); }
composer.addPass(new OutputPass());

// ---- camera journey
const K = [
  { p: [30, 5, tz0 + 33], t: [7, 3, tz0 + 6] },          // hero exterior
  { p: [8, 1.3, poolZ + 6.5], t: [-2, 1.6, tz0] },     // pool
  { p: [IX + 3.2, F + 1.45, IZ + 2.6], t: [IX - 3, F + 0.9, IZ - 1.6] }, // living room
  { p: [32, 40, 38], t: [0, 0, 3] },                   // aerial
];
if (mobile) { K[0].p = [22, 9, tz0 + 32]; K[0].t = [0, -2.5, 0]; K[1].p = [9, 1.6, poolZ + 9]; K[3].p = [40, 52, 48]; }
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
  { p: [HX + 0.4, F + 0.6, IZ - 0.6], h: 'Travertine hearth', d: 'A single block of Tivoli travertine, hand-dressed on site by a mason from Bagni di Tivoli.' },
  { p: [IX + 1.2, F + 0.6, IZ - 1.8], h: 'Bouclé sofa', d: 'Hand-tufted wool bouclé on a white-oak frame, made to the room by a Milanese atelier.' },
  { p: [IX, F + 2.05, IZ - 0.3], h: 'Halo pendant', d: 'Spun brass and hand-blown opal, made in a workshop of four in Copenhagen.' },
  { p: [IX + 0.25, F + 0.8, IZ - 0.35], h: 'Bronze study', d: 'Lost-wax cast bronze, one of three. Offered with the house by separate arrangement.' },
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
  water.material.uniforms.time.value = time * 0.25;
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
  if (bokeh) { bokeh.uniforms.focus.value = camera.position.distanceTo(camT); bokeh.uniforms.aperture.value = prog > 1.6 && prog < 2.4 ? 0.0006 : 0.00012; }
  composer.render();
}

// ---- listing thumbnails rendered from the scene itself
function shoot(p, t, w, h, fov = 40) {
  const c = new THREE.PerspectiveCamera(fov, w / h, 0.1, 2000); c.position.set(...p); c.lookAt(...t);
  const old = renderer.getPixelRatio(); renderer.setPixelRatio(1); renderer.setSize(w, h, false);
  renderer.render(scene, c); const url = canvas.toDataURL('image/jpeg', 0.88);
  renderer.setPixelRatio(old); renderer.setSize(innerWidth, innerHeight); return url;
}
const S = mobile ? 1 : 1.4;
document.getElementById('th0').src = shoot([14, 2.2, tz0 + 14], [0, 3, 0], 640 * S, 800 * S);
document.getElementById('th1').src = shoot([-16, 4, tz0 + 10], [0, 3.2, 0], 640 * S, 800 * S);
document.getElementById('th2').src = shoot([6, 0.9, poolZ + 4], [-3, 1.2, tz0], 640 * S, 800 * S);
document.getElementById('th3').src = shoot([IX + 3.4, F + 1.4, IZ + 2.8], [IX - 3, F + 0.9, IZ - 1.6], 800 * S, 1000 * S, 55);

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });

// 3D tilt cards
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});
window.__ready = true;
frame();
