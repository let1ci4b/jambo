// Gera os objetos 3D da JAMBO (GLB) de forma procedural: tigela de açaí, copo de milkshake,
// copo de suco e copinho de gelato. Geometria com three.js; arquivo GLB com glTF-Transform.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { weld, quantize, dedup, prune } from '@gltf-transform/functions';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';

const OUT = '/home/claude/jambo/site/assets/3d/';
const LOGO = await loadImage(fs.readFileSync('/home/claude/jambo/site/assets/logo/jambo-logo-creme.svg'));
const LOGO_ROXO = await loadImage(fs.readFileSync('/home/claude/jambo/site/assets/logo/jambo-logo.svg'));

// ---------- texturas ----------
function texRotulo({ fundo, logo, w = 1024, h = 256, logoAlt = .62, alpha = false }) {
  const c = createCanvas(w, h), x = c.getContext('2d');
  if (!alpha) { x.fillStyle = fundo; x.fillRect(0, 0, w, h); }
  const lh = h * logoAlt, lw = lh * logo.width / logo.height;
  x.translate(0, h); x.scale(1, -1); // UV do glTF começa no alto: espelha na vertical para o logo ficar em pé
  for (const cx of [w * .25, w * .75]) x.drawImage(logo, cx - lw / 2, h / 2 - lh / 2, lw, lh);
  return c.toBuffer('image/png');
}
function texCanudo() {
  const c = createCanvas(64, 256), x = c.getContext('2d');
  x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 64, 256); x.fillStyle = '#7A4A9A';
  for (let i = -4; i < 12; i++) { x.beginPath(); x.moveTo(0, i * 32); x.lineTo(64, i * 32 + 24); x.lineTo(64, i * 32 + 40); x.lineTo(0, i * 32 + 16); x.fill(); }
  return c.toBuffer('image/png');
}

// ---------- utilidades de geometria ----------
const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
function lathe(perfil, seg = 64) { return new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(r, y)), seg); }
function posicionar(g, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 }) {
  g = g.index ? g.toNonIndexed() : g.clone();
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(...(Array.isArray(s) ? s : [s, s, s])));
  g.applyMatrix4(m); return g;
}
function soPosNormUv(g) { // padroniza atributos para fundir
  g = g.index ? g.toNonIndexed() : g;
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  g.computeVertexNormals(); return g;
}
function fundir(lista) { return mergeGeometries(lista.map(soPosNormUv)); }
function deformar(g, amp, freq = 7) { // relevo orgânico (açaí cremoso, gelato)
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = Math.sin(x * freq + 1.3) * Math.sin(z * freq * 1.1 + .7) * Math.cos(y * freq * .8);
    p.setY(i, y + n * amp);
  }
  g.computeVertexNormals(); return g;
}

// ---------- montagem do GLB ----------
async function salvar(nome, partes) {
  const doc = new Document(); const buf = doc.createBuffer();
  const cena = doc.createScene(nome); const raiz = doc.createNode(nome).setRotation([0, Math.SQRT1_2, 0, Math.SQRT1_2]); cena.addChild(raiz); // logo de frente para a câmera
  for (const p of partes) {
    const g = p.geo.index ? p.geo.toNonIndexed() : p.geo;
    const mat = doc.createMaterial(p.nome).setBaseColorFactor(p.cor ?? [1, 1, 1, 1]).setRoughnessFactor(p.rugosidade ?? .6).setMetallicFactor(0);
    if (p.alpha) mat.setAlphaMode('BLEND');
    if (p.duplo) mat.setDoubleSided(true);
    if (p.tex) mat.setBaseColorTexture(doc.createTexture(p.nome).setMimeType('image/png').setImage(p.tex));
    const prim = doc.createPrimitive().setMaterial(mat)
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.position.array)).setBuffer(buf))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.normal.array)).setBuffer(buf));
    if (g.attributes.uv) prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(g.attributes.uv.array)).setBuffer(buf));
    const mesh = doc.createMesh(p.nome).addPrimitive(prim);
    raiz.addChild(doc.createNode(p.nome).setMesh(mesh));
  }
  await doc.transform(weld(), dedup(), prune(), quantize());
  await new NodeIO().registerExtensions(ALL_EXTENSIONS).write(OUT + nome + '.glb', doc);
  console.log(nome, (fs.statSync(OUT + nome + '.glb').size / 1024).toFixed(0) + ' KB');
}
const hex = h => { const c = new THREE.Color(h); c.convertSRGBToLinear(); return [c.r, c.g, c.b, 1]; };

// ---------- 1. Tigela de açaí (Tropical Vibe) ----------
{
  // unidades em metros: tigela de 500 ml ≈ 12 cm de boca, 7 cm de altura
  const H = .07, rB = .045, rT = .062, esp = .0012;
  const fora = lathe([[rB, .003], [rT, H + .001]]);
  const fundo = lathe([[0, 0], [rB - .004, 0], [rB, .003]]);
  const dentro = lathe([[rT - esp, H], [rB - esp, .004], [0, .004]]);
  const borda = new THREE.TorusGeometry(rT + .0008, .0016, 8, 64); borda.rotateX(Math.PI / 2); borda.translate(0, H + .001, 0);
  // açaí: disco levemente abaulado com relevo
  const acai = deformar(posicionar(new THREE.SphereGeometry(rT - esp, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2), { y: H - .012, s: [1, .22, 1] }), .002, 60);
  // coberturas (fiel a uma porção de 500 ml, sem exagero)
  const banana = [], morango = [], granola = [], kiwi = [], manga = [], coco = [];
  for (let i = 0; i < 6; i++) { const a = -0.6 + i * .32; banana.push(posicionar(new THREE.CylinderGeometry(.0105, .0105, .004, 24), { x: Math.cos(a) * .03, z: Math.sin(a) * .03 + .006, y: H + .003 + i * .0005, rx: .18, rz: Math.sin(a) * .12 })); }
  for (let i = 0; i < 26; i++) { const a = Math.PI * .7 + rnd() * 1.1, r = .015 + rnd() * .03; granola.push(posicionar(new THREE.IcosahedronGeometry(.0028 + rnd() * .002, 0), { x: Math.cos(a) * r, z: Math.sin(a) * r, y: H + .002, rx: rnd() * 3, ry: rnd() * 3 })); }
  for (let i = 0; i < 4; i++) { const a = Math.PI * 1.95 + i * .32; kiwi.push(posicionar(new THREE.CylinderGeometry(.011, .011, .004, 24), { x: Math.cos(a) * .041, z: Math.sin(a) * .041, y: H + .001, rx: .5, rz: Math.cos(a) * .4 })); }
  for (let i = 0; i < 7; i++) { const a = Math.PI * 1.45 + rnd() * .5, r = .012 + rnd() * .025; manga.push(posicionar(new THREE.BoxGeometry(.009, .009, .009), { x: Math.cos(a) * r, z: Math.sin(a) * r, y: H + .004, rx: rnd(), ry: rnd() * 3 })); }
  for (let i = 0; i < 3; i++) { const a = Math.PI * 1.15 + i * .25; morango.push(posicionar(new THREE.SphereGeometry(.009, 20, 14), { x: Math.cos(a) * .03, z: Math.sin(a) * .03, y: H + .004, ry: a, rx: -1.2, s: [1, 1.3, .55] })); }
  for (let i = 0; i < 12; i++) { const a = Math.PI * .4 + rnd() * .7, r = .02 + rnd() * .03; coco.push(posicionar(new THREE.TorusGeometry(.004, .0007, 4, 8, 2), { x: Math.cos(a) * r, z: Math.sin(a) * r, y: H + .003, rx: Math.PI / 2 + rnd() * .4, rz: rnd() * 3 })); }
  await salvar('jambo-tigela-acai', [
    { nome: 'papel-fora', geo: fora, tex: texRotulo({ fundo: '#40204F', logo: LOGO, logoAlt: .62 }), rugosidade: .8, duplo: true },
    { nome: 'papel-dentro', geo: fundir([dentro, borda, fundo]), cor: hex('#EFE3D0'), rugosidade: .85, duplo: true },
    { nome: 'acai', geo: acai, cor: hex('#5E1764'), rugosidade: .55 },
    { nome: 'banana', geo: fundir(banana), cor: hex('#F3E2A8'), rugosidade: .5 },
    { nome: 'granola', geo: fundir(granola), cor: hex('#CF9A55'), rugosidade: .9 },
    { nome: 'kiwi', geo: fundir(kiwi), cor: hex('#8DB255'), rugosidade: .35 },
    { nome: 'manga', geo: fundir(manga), cor: hex('#F6A93B'), rugosidade: .4 },
    { nome: 'morango', geo: fundir(morango), cor: hex('#D93A4E'), rugosidade: .35 },
    { nome: 'coco', geo: fundir(coco), cor: hex('#FFFBF2'), rugosidade: .8 }
  ]);
}

// ---------- 2. Copo de milkshake (Morango Pop) e 3. copo de suco ----------
async function copo(nome, { corBebida, chantili, corCobertura }) {
  const H = .13, rB = .03, rT = .042;
  const pet = lathe([[rB, 0], [rT, H]], 48);
  const rotulo = lathe([[rB + (rT - rB) * .25 + .0004, H * .25], [rB + (rT - rB) * .62 + .0004, H * .62]], 48);
  const bebida = lathe([[0, .002], [rB - .002, .002], [rT - .003, H - .004], [0, H - .004]], 48);
  const partes = [
    { nome: 'bebida', geo: bebida, cor: hex(corBebida), rugosidade: .45 },
    { nome: 'copo-pet', geo: pet, cor: [1, 1, 1, .22], rugosidade: .08, alpha: true, duplo: true },
    { nome: 'rotulo', geo: rotulo, tex: texRotulo({ fundo: '#00000000', logo: LOGO_ROXO, logoAlt: .7, alpha: true, w: 1024, h: 384 }), alpha: true, rugosidade: .5 }
  ];
  let topo = H;
  if (chantili) {
    const cr = []; // chantili em espiral
    for (let i = 0; i < 5; i++) cr.push(posicionar(new THREE.TorusGeometry(.03 - i * .006, .009 - i * .001, 10, 40), { y: H + .004 + i * .009, rx: Math.PI / 2 }));
    cr.push(posicionar(new THREE.ConeGeometry(.008, .016, 16), { y: H + .05 }));
    partes.push({ nome: 'chantili', geo: fundir(cr), cor: hex('#FFF8EE'), rugosidade: .7 });
    const gr = []; for (let i = 0; i < 30; i++) { const a = rnd() * 6.28, r = rnd() * .028; gr.push(posicionar(new THREE.IcosahedronGeometry(.0018, 0), { x: Math.cos(a) * r, z: Math.sin(a) * r, y: H + .03 + (.028 - r) * 1.3, rx: rnd() * 3 })); }
    partes.push({ nome: 'cobertura', geo: fundir(gr), cor: hex(corCobertura), rugosidade: .6 });
    topo = H + .04;
  } else {
    const tampa = lathe([[0, H + .006], [rT + .002, H + .002], [rT + .002, H - .004]], 48);
    partes.push({ nome: 'tampa', geo: tampa, cor: [1, 1, 1, .3], rugosidade: .1, alpha: true, duplo: true });
  }
  const canudo = posicionar(new THREE.CylinderGeometry(.0035, .0035, .17, 16, 1, true), { x: .012, y: .115, z: -.004, rz: -.18 });
  partes.push({ nome: 'canudo', geo: canudo, tex: texCanudo(), rugosidade: .4, duplo: true });
  await salvar(nome, partes);
}
await copo('jambo-milkshake', { corBebida: '#F2A7B6', chantili: true, corCobertura: '#E04A5F' });
await copo('jambo-suco', { corBebida: '#F7A23B', chantili: false });

// ---------- 4. Copinho de gelato (pistache) ----------
{
  const H = .05, rB = .028, rT = .038;
  const fora = lathe([[rB, 0], [rT, H + .001]]);
  const dentro = lathe([[rT - .001, H], [rB - .001, .003], [0, .003]]);
  const fundoG = lathe([[0, 0], [rB, 0]]);
  const bola = deformar(posicionar(new THREE.SphereGeometry(.031, 64, 32), { y: H + .01, s: [1, .78, 1] }), .004, 95);
  const pist = []; for (let i = 0; i < 22; i++) { const a = rnd() * 6.28, r = rnd() * .02; pist.push(posicionar(new THREE.IcosahedronGeometry(.0032, 0), { x: Math.cos(a) * r, z: Math.sin(a) * r, y: H + .033 - r * .55, rx: rnd() * 3 })); }
  await salvar('jambo-gelato', [
    { nome: 'papel-fora', geo: fora, tex: texRotulo({ fundo: '#40204F', logo: LOGO, logoAlt: .6 }), rugosidade: .8, duplo: true },
    { nome: 'papel-dentro', geo: fundir([dentro, fundoG]), cor: hex('#EFE3D0'), rugosidade: .85, duplo: true },
    { nome: 'gelato', geo: bola, cor: hex('#A3B46A'), rugosidade: .85 },
    { nome: 'pistache', geo: fundir(pist), cor: hex('#5E7F2E'), rugosidade: .8 }
  ]);
}
