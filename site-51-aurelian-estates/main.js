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
const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(82), THREE.MathUtils.degToRad(-60));
su.sunPosition.value.copy(sun);
scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const [hdr, villa, qt1, qt2, sh1, sh4] = await Promise.all([
  new RGBELoader().loadAsync('assets/dusk.hdr'),
  ...['casa_lumen', 'quiver_tree_01', 'quiver_tree_02', 'shrub_01', 'shrub_04'].map(n => loader.loadAsync(`assets/${n}.glb`)),
]);
hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = pmrem.fromEquirectangular(hdr).texture; hdr.dispose();
scene.environmentIntensity = 0.55;

const hemi = new THREE.HemisphereLight(0xc9b6ff, 0x3a2a1c, 0.35); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xffb27a, 1.4);
sunL.position.copy(sun).multiplyScalar(60).setY(14);
sunL.castShadow = true; sunL.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
Object.assign(sunL.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 });
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
const waterN = noiseTex(256, (x, y) => { const a = Math.sin(x * 0.18 + y * 0.07) * 0.7 + Math.sin(y * 0.23 - x * 0.05) * 0.5 + (rnd(x, y) - .5) * 0.4; const b = Math.cos(y * 0.16 + x * 0.09) * 0.7 + Math.cos(x * 0.21) * 0.4; return [128 + a * 40, 128 + b * 40, 255]; }, 1);
const groundTex = noiseTex(512, (x, y) => { const n = rnd(x, y) * 30 + rnd((x >> 3) + 7, (y >> 3) + 3) * 16; return [92 + n, 78 + n * .9, 60 + n * .7]; }, 90);
groundTex.colorSpace = THREE.SRGBColorSpace;

// ---- Casa Lumen, modelled and light-baked in Blender (Cycles GI lightmaps + AO on UV1)
const tl = new THREE.TextureLoader();
const lmTex = (n) => { const t = tl.load(`assets/${n}.webp`); t.channel = 1; t.flipY = false; return t; };
const LM = { Arch: [lmTex('lm_arch'), lmTex('ao_arch')], Ground: [lmTex('lm_ground'), lmTex('ao_ground')] };
LM.Arch[0].colorSpace = LM.Ground[0].colorSpace = THREE.SRGBColorSpace;
const LMI = 18.8; // pi * bake encode scale
const house = villa.scene; scene.add(house);
const emissive = [];
house.traverse(o => {
  if (!o.isMesh) return;
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  const lm = LM[o.name] || (o.parent && LM[o.parent.name]);
  const out = mats.map(m => {
    if (/glass/i.test(m.name)) { o.castShadow = false; o.renderOrder = 2;
      return new THREE.MeshPhysicalMaterial({ color: 0x9fb4b8, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.22, envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide, specularIntensity: 1 }); }
    if (m.emissiveMap || (m.emissive && m.emissive.getHex() > 0)) { emissive.push(m); m.toneMapped = true; m.emissiveIntensity = /fire/i.test(m.name) ? 2.5 : 1.6; return m; }
    if (lm) { m = m.clone(); m.side = THREE.DoubleSide; m.lightMap = lm[0]; m.lightMapIntensity = LMI; m.aoMap = lm[1]; m.aoMapIntensity = 0.6; m.envMapIntensity = 0.35; }
    else m.envMapIntensity = 0.8;
    return m;
  });
  o.material = Array.isArray(o.material) ? out : out[0];
  o.castShadow = !lm && !/glass/i.test(mats[0].name); o.receiveShadow = !lm;
});
const F = 0.7, IX = -6, IZ = -1.6, HX = -11.9;
const tz0 = 4, poolW = 26, poolD = 6.5, poolZ = 11;
window.__F = F;

// ---- desert floor beyond the baked ground disc
const ground = new THREE.Mesh(new THREE.CircleGeometry(600, 64), (()=>{const tl=new THREE.TextureLoader();const mk=(f,c)=>{const t=tl.load('assets/'+f);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(140,140);t.anisotropy=8;if(c)t.colorSpace=THREE.SRGBColorSpace;return t};return new THREE.MeshStandardMaterial({ color: 0xd8c2a8, map: mk('sand_diff.webp',1), normalMap: mk('sand_nor.webp'), roughness: 1 })})());
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.03; ground.receiveShadow = true; scene.add(ground);
// pool water surface (planar reflections)
const water = new Water(new THREE.PlaneGeometry(poolW, poolD), {
  textureWidth: mobile ? 256 : 1024, textureHeight: mobile ? 256 : 1024, waterNormals: waterN,
  sunDirection: sun.clone().normalize(), sunColor: 0xffc890, waterColor: 0x0e4a52, distortionScale: 0.25, fog: true, alpha: 0.92,
});
water.material.uniforms.size.value = 3;
water.rotation.x = -Math.PI / 2; water.position.set(0, 0.56, poolZ); scene.add(water);
const fl = new THREE.PointLight(0xff7a2a, 3, 5, 2); fl.position.set(HX + 0.6, F + 0.6, -1.5); scene.add(fl);
const il = new THREE.PointLight(0xffb070, 4, 9, 2); il.position.set(IX, 3.6, IZ); scene.add(il);
const sc = { rotation: {} };

// ---- landscaping: Poly Haven quiver trees and shrubs (CC0)
const prep = (g) => { g.scene.traverse(o => { if (o.isMesh) { o.castShadow = !mobile; o.receiveShadow = true; } }); return g.scene; };
const norm = (o, h) => { const b = new THREE.Box3().setFromObject(o); const k = h / (b.max.y - b.min.y); const w = new THREE.Group(); o.scale.setScalar(k); o.position.y = -b.min.y * k; w.add(o); return w; };
const trees = [norm(prep(qt1), 5), norm(prep(qt2), 4)], shrubs = [norm(prep(sh1), 1.1), norm(prep(sh4), 0.8)];
const away = (x, z) => !(Math.abs(x) < 25 && z > -17 && z < 21) && !(x > -6 && z > 8 && x < 70 && z < 75);
function scatter(list, n, r0, r1, s0, s1) {
  for (let i = 0; i < n; i++) {
    let x, z; do { const a = Math.random() * Math.PI * 2, r = r0 + Math.pow(Math.random(), 0.8) * (r1 - r0); x = Math.cos(a) * r; z = Math.sin(a) * r; } while (!away(x, z));
    const o = list[i % list.length].clone(); o.position.set(x, 0, z); o.rotation.y = Math.random() * 6; o.scale.setScalar(s0 + Math.random() * (s1 - s0)); scene.add(o);
  }
}
scatter(trees, mobile ? 14 : 34, 30, 90, 0.9, 1.5);
scatter(shrubs, mobile ? 30 : 90, 26, 60, 0.8, 1.6);
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
  { p: [24, 8.5, 47], t: [-23, 4.5, 5] },   // hero exterior
  { p: [17, 1.6, 21], t: [-3, 2.2, 6] },    // pool
  { p: [3, 2.6, 2.6], t: [-9, 1.7, -2.4] }, // living room
  { p: [58, 70, 62], t: [0, 0, 2] },        // aerial
];
if (mobile) { K[0].p = [30, 14, 62]; K[0].t = [-4, -1, 0]; K[1].p = [19, 2, 27]; K[2].p = [4, 2.7, 4]; K[3].p = [70, 92, 80]; }
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
  { p: [HX, 1.4, -1.5], h: 'Sandstone hearth', d: 'Dressed white sandstone, laid in courses by a mason from Sedona to match the fin wall outside.' },
  { p: [-6, 1.3, -3.7], h: 'Chesterfield sofa', d: 'Deep-buttoned leather, a counterpoint to the marble floor. The sofas stay with the house.' },
  { p: [-5.8, 3.4, -1.6], h: 'Halo pendant', d: 'A single ring of warm light, 1.6 metres across, hung low over the conversation area.' },
  { p: [-5.4, 1.5, -1.8], h: 'Marble study', d: 'A carved marble bust on the coffee table. Offered with the house by separate arrangement.' },
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
document.getElementById('th0').src = shoot([20, 3, 30], [-2, 4, 0], 640 * S, 800 * S);
document.getElementById('th1').src = shoot([-30, 6, 26], [0, 4, 0], 640 * S, 800 * S);
document.getElementById('th2').src = shoot([12, 1.4, 18], [-4, 2, 6], 640 * S, 800 * S);
document.getElementById('th3').src = shoot([2, 2.5, 2], [-9, 1.7, -2.4], 800 * S, 1000 * S, 55);

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); });

// 3D tilt cards
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`; });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});
window.__ready = true;
frame();
