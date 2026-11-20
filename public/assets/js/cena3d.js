// JAMBO · cena 3D dos copos (vitrine e "combos montados")
// three.js r187 local. Desenha só quando algo muda; pixel ratio no máximo 2.
// O canvas é decorativo (aria-hidden): o conteúdo do combo está em HTML ao lado.
import * as THREE from './three.module.js';
import { GLTFLoader } from './three-addons/GLTFLoader.js';
import { RoomEnvironment } from './three-addons/RoomEnvironment.js';

const cacheModelos = new Map();
const loader = new GLTFLoader();
function carregar(url) {
  if (!cacheModelos.has(url)) cacheModelos.set(url, loader.loadAsync(url).then(g => g.scene));
  return cacheModelos.get(url).then(s => s.clone(true));
}

export async function criarCena(canvas, { itens, base = 'assets/3d/', fundo = null, girar = true, camera: camCfg = {} }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: fundo === null });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1;
  const cena = new THREE.Scene(); if (fundo) cena.background = new THREE.Color(fundo);
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  // luz da direção fotográfica: sol dourado de cima à esquerda + rebatimento magenta
  const sol = new THREE.DirectionalLight('#FFD6A0', 2.4); sol.position.set(-.4, .6, .5); cena.add(sol);
  const rebate = new THREE.DirectionalLight('#C45AA8', .9); rebate.position.set(.5, .1, -.3); cena.add(rebate);
  cena.add(new THREE.HemisphereLight('#F5EBDD', '#40204F', .6));

  const cam = new THREE.PerspectiveCamera(camCfg.fov ?? 28, 1, .01, 10);
  cam.position.set(0, camCfg.y ?? .16, camCfg.z ?? .42); cam.lookAt(0, camCfg.alvoY ?? .055, 0);

  const objetos = await Promise.all(itens.map(async it => {
    const o = await carregar(base + it.arquivo);
    const g = new THREE.Group(); g.add(o); cena.add(g);
    g.userData = it; g.position.set(...(it.pos ?? [0, 0, 0])); g.rotation.y = it.rotY ?? 0; g.scale.setScalar(it.escala ?? 1);
    return g;
  }));

  let largura = 0, altura = 0, pedir = true, progresso = 0, giro = 0, ativo = false, ultimo = 0;
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)');
  function medir() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === largura && h === altura) return;
    largura = w; altura = h; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); pedir = true;
  }
  new ResizeObserver(medir).observe(canvas); medir();

  // progresso 0–1 vindo da rolagem (combos): cada item vai de "de" até "pos"
  function aplicar() {
    for (const o of objetos) {
      const { de, pos = [0, 0, 0], atraso = 0 } = o.userData;
      if (!de) continue;
      const t = Math.min(1, Math.max(0, (progresso - atraso) / (1 - atraso)));
      const e = 1 - Math.pow(1 - t, 3); // power3.out
      o.position.set(...de.map((v, i) => v + (pos[i] - v) * e));
      o.rotation.y = (o.userData.rotY ?? 0) + (1 - e) * 1.6;
    }
  }
  function quadro(agora) {
    if (!ativo) return;
    const dt = Math.min(.05, (agora - ultimo) / 1000 || 0); ultimo = agora;
    if (girar && !reduzido.matches) { giro += dt * .35; pedir = true; }
    if (pedir) {
      aplicar();
      for (const o of objetos) o.children[0].rotation.y = giro;
      renderer.render(cena, cam); pedir = false;
    }
    requestAnimationFrame(quadro);
  }
  // só anima enquanto o canvas está na tela
  new IntersectionObserver(([e]) => { const era = ativo; ativo = e.isIntersecting; if (ativo && !era) { pedir = true; ultimo = performance.now(); requestAnimationFrame(quadro); } }).observe(canvas);
  aplicar(); renderer.render(cena, cam);

  return {
    definirProgresso(p) { progresso = p; pedir = true; },
    renderizar() { aplicar(); renderer.render(cena, cam); }
  };
}
