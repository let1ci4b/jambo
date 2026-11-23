// Movimento: cabeçalho, açaí (bowls revelados + frutas entrando), o bowl se monta
// (vídeo pela rolagem), gelato (palavras), shakes (fade), combos montados (3D) e o quadro final.
// Com movimento reduzido nada disso roda: o CSS mostra tudo parado.
import cardapio from './dados.js';

const $ = (s, el = document) => el.querySelector(s);
const pastaAssets = new URL('/assets/', location.href).href;
const importar = caminho => import(/* @vite-ignore */ pastaAssets + caminho);
const celular = () => innerWidth < 768;

// ---------- 3.0 abertura: o vídeo dentro de "JAMBO" e o mergulho ----------
// 0 a 1,3 s: tela creme, JAMBO gigante com o vídeo real passando por dentro das letras (aproximação lenta).
// 1,3 a 2,5 s: a câmera mergulha numa letra até o vídeo tomar a tela (as frutas estão caindo).
// 2,3 s em diante: o véu escurece a esquerda e o título, o texto e os botões sobem.
// "Pular" vai direto para o fim. Com movimento reduzido: só a foto parada do bowl pronto.
const NS = 'http://www.w3.org/2000/svg';
export async function abertura({ reduzido }) {
  const sec = $('#abertura'), video = $('.hero-video'), midia = $('.hero-midia'), pular = $('#pular');
  const raiz = document.documentElement;
  if (reduzido) { sec.classList.add('pronto'); return; }
  const cel = matchMedia('(max-width: 767px)').matches;
  video.poster = pastaAssets + `video/hero/poster-${cel ? 'm' : 'd'}.webp`;
  video.src = pastaAssets + `video/hero/hero-${cel ? 'm' : 'd'}.mp4`;
  video.preload = 'auto';
  raiz.classList.add('intro');

  // máscara: creme por toda a tela, com JAMBO vazado
  const W = innerWidth, H = sec.clientHeight;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'hero-mascara'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = `<defs><mask id="mascara-jambo" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><g class="m-g"><text class="m-t" fill="#000" text-anchor="middle">JAMBO</text></g></mask></defs>
    <rect width="${W}" height="${H}" style="fill:var(--creme)" mask="url(#mascara-jambo)"/>
    <text class="m-legenda" style="fill:var(--roxo)" text-anchor="middle">Açaí &amp; Gelato · Florianópolis</text>`;
  midia.appendChild(svg);
  const g = svg.querySelector('.m-g'), t = svg.querySelector('.m-t'), leg = svg.querySelector('.m-legenda');

  try { await Promise.race([document.fonts.load('800 100px "Bricolage Grotesque"'), new Promise(r => setTimeout(r, 1200))]); } catch { /* usa a reserva */ }
  // em tela deitada: uma linha (JAMBO); em pé (celular): duas linhas grandes (JAM / BO)
  const linhas = W / H < .8 ? ['JAM', 'BO'] : ['JAMBO'];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const fonte = px => `800 ${px}px "Bricolage Grotesque", "Arial Black", sans-serif`;
  ctx.font = fonte(100);
  const maisLarga = Math.max(...linhas.map(l => ctx.measureText(l).width));
  const F = Math.min(100 * (W * .88) / maisLarga, H * (linhas.length > 1 ? .3 : .56));
  ctx.font = fonte(F); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(linhas[0]);
  const alto = m.actualBoundingBoxAscent, entre = F * .82;
  const bloco = alto + entre * (linhas.length - 1);
  const y0 = H / 2 - bloco / 2 + alto - (linhas.length > 1 ? F * .06 : 0);
  t.remove();
  linhas.forEach((l, i) => {
    const el = document.createElementNS(NS, 'text');
    el.textContent = l;
    for (const [k, v] of Object.entries({ x: W / 2, y: y0 + i * entre, 'font-size': F, 'font-family': '"Bricolage Grotesque", "Arial Black", sans-serif', 'font-weight': 800, 'letter-spacing': -F * .02, 'text-anchor': 'middle', fill: '#000' })) el.setAttribute(k, v);
    g.appendChild(el);
    ctx.fillText(l, W / 2, y0 + i * entre);
  });
  const yUltima = y0 + (linhas.length - 1) * entre;
  leg.setAttribute('x', W / 2); leg.setAttribute('y', yUltima + m.actualBoundingBoxDescent + Math.max(28, F * .22));
  leg.setAttribute('font-size', Math.max(14, Math.min(22, F * .11))); leg.setAttribute('font-family', 'DM Sans, sans-serif'); leg.setAttribute('font-weight', 600);
  leg.setAttribute('letter-spacing', '.12em');
  // ponto de mergulho: um ponto bem dentro da haste de uma letra, perto do centro da primeira linha
  const dados = ctx.getImageData(0, 0, W, H).data;
  const cheio = (x, yy) => x > 0 && yy > 0 && x < W && yy < H && dados[(Math.round(yy) * W + Math.round(x)) * 4 + 3] > 200;
  const folga = Math.max(4, F * .05);
  let ox = W / 2, oy = y0 - alto / 2;
  busca: for (let r = 0; r < W / 2; r += 2) for (const dx of [r, -r]) {
    const x = W / 2 + dx, yy = y0 - alto * .45;
    if (cheio(x, yy) && cheio(x - folga, yy) && cheio(x + folga, yy) && cheio(x, yy - folga) && cheio(x, yy + folga)) { ox = x; oy = yy; break busca; }
  }

  const ease = {
    out: k => 1 - Math.pow(1 - k, 3),
    expoIn: k => (k === 0 ? 0 : Math.pow(2, 10 * k - 10)),
  };
  const ZOOM = Math.max(W, H) / folga * 2.2;
  const T_PUSH = 1.3, T_ZOOM = 1.2, T_TEXTO = 2.45;
  let inicio = null, fim = false;
  function aplicar(s) { g.setAttribute('transform', `translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`); }
  aplicar(.9);
  function terminar() {
    if (fim) return; fim = true;
    svg.remove(); sec.classList.add('pronto'); raiz.classList.remove('intro'); pular.hidden = true;
  }
  function quadro(agora) {
    if (fim) return;
    if (inicio === null) inicio = agora;
    const tt = (agora - inicio) / 1000;
    if (tt < T_PUSH) aplicar(.9 + .1 * ease.out(tt / T_PUSH));
    else {
      const k = Math.min(1, (tt - T_PUSH) / T_ZOOM);
      aplicar(Math.pow(ZOOM, ease.expoIn(k)));
      leg.style.opacity = String(Math.max(0, 1 - k * 4));
    }
    if (tt >= T_TEXTO && !sec.classList.contains('pronto')) { sec.classList.add('pronto'); raiz.classList.remove('intro'); }
    if (tt >= T_PUSH + T_ZOOM) { terminar(); return; }
    requestAnimationFrame(quadro);
  }
  // começa quando o vídeo puder tocar (ou em 1,2 s, com o pôster, se a internet estiver lenta)
  await new Promise(res => { let ok = false; const vai = () => { if (!ok) { ok = true; res(); } }; video.addEventListener('canplay', vai, { once: true }); setTimeout(vai, 1200); });
  video.play().catch(() => { /* sem autoplay: fica o pôster */ });
  pular.hidden = false;
  pular.addEventListener('click', () => { terminar(); $('#acai').scrollIntoView({ behavior: 'smooth' }); $('#acai-t').focus({ preventScroll: true }); });
  addEventListener('scroll', () => { if (scrollY > 40) terminar(); }, { passive: true, once: true });
  requestAnimationFrame(quadro);
}

// quadro final (3.7): o último quadro da abertura, parado
export async function quadroFinal() {
  const canvas = $('#onda-final');
  // só carrega o desenho quando a seção final está chegando
  await new Promise(res => { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); res(); } }, { rootMargin: '100% 0px' }); io.observe(canvas); });
  const { desenhar, FRUTAS } = await importar('js/abertura.js');
  const imgs = {};
  await Promise.all(FRUTAS.map(n => new Promise(r => { const i = new Image(); i.onload = () => { imgs[n] = i; r(); }; i.onerror = r; i.src = pastaAssets + `ingredientes/${n}.svg`; })));
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let ultimo = '';
  function pintar() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H || ultimo === W + 'x' + H) return; ultimo = W + 'x' + H;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // desenha num retângulo ~1,8× mais alto e mostra só a parte de baixo (onda + frutas)
    const Hc = H / .55;
    ctx.save(); ctx.translate(0, -(Hc - H)); desenhar(ctx, 8, W, Hc, imgs, { semBrilho: true }); ctx.restore();
  }
  new ResizeObserver(pintar).observe(canvas);
}

// ---------- cabeçalho ----------
export function cabecalho() {
  const topo = $('#topo');
  let y0 = scrollY, pedido = false;
  addEventListener('scroll', () => {
    if (pedido) return; pedido = true;
    requestAnimationFrame(() => {
      pedido = false;
      const y = scrollY;
      topo.classList.toggle('solido', y > innerHeight * .8);
      const presa = topo.contains(document.activeElement) || document.documentElement.classList.contains('carrinho-aberto');
      if (y > y0 + 4 && y > innerHeight && !presa) topo.classList.add('some');
      else if (y < y0 - 4 || y < innerHeight) topo.classList.remove('some');
      y0 = y;
    });
  }, { passive: true });
  topo.addEventListener('focusin', () => topo.classList.remove('some'));
}

// ---------- 3.1 açaí: bowls revelados + frutas entrando ----------
const POS = [[-.06, .1, -14], [1.04, .2, 12], [-.05, .74, 10], [1.03, .86, -10]]; // x, y (fração da foto), rotação
export function acai(gsap, ScrollTrigger) {
  const fotos = $('#fotos'), adesivos = $('#adesivos');
  const linhas = [...document.querySelectorAll('.bowl')];
  let atual = null;
  function ativar(li) {
    if (li === atual) return; atual = li;
    linhas.forEach(l => l.classList.toggle('ativo', l === li));
    const img = new Image(); img.src = li.dataset.foto; img.alt = ''; img.decoding = 'async';
    fotos.appendChild(img);
    gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0% round 28px)', scale: 1.12 }, {
      clipPath: 'inset(0% 0% 0% 0% round 28px)', scale: 1, duration: .9, ease: 'expo.out',
      onComplete: () => { while (fotos.children.length > 1 && fotos.firstChild !== img) fotos.firstChild.remove(); }
    });
    for (const a of [...adesivos.children]) gsap.to(a, { opacity: 0, scale: .6, duration: .3, onComplete: () => a.remove() });
    const frutas = (li.dataset.frutas || '').split('|').filter(Boolean).slice(0, 4);
    frutas.forEach((n, i) => {
      const s = new Image(); s.src = n; s.alt = '';
      const [x, y, r] = POS[i];
      s.style.left = x * 100 + '%'; s.style.top = y * 100 + '%';
      adesivos.appendChild(s);
      gsap.fromTo(s, { x: (x < .5 ? -1 : 1) * innerWidth * .4, y: innerHeight * .3, rotation: r + (x < .5 ? -90 : 90), opacity: 0 },
        { x: 0, y: 0, rotation: r, opacity: 1, duration: .8, delay: i * .08, ease: 'back.out(1.4)' });
    });
  }
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    linhas.forEach(li => ScrollTrigger.create({ trigger: li, start: 'top 55%', end: 'bottom 45%', onToggle: s => s.isActive && ativar(li) }));
    ativar(linhas[0]);
    return () => { atual = null; fotos.innerHTML = ''; adesivos.innerHTML = ''; linhas.forEach(l => l.classList.remove('ativo')); };
  });
  mm.add('(max-width: 767px)', () => {
    document.querySelectorAll('.moldura-c img').forEach(img => {
      gsap.fromTo(img, { clipPath: 'inset(100% 0% 0% 0% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: .7, ease: 'expo.out', scrollTrigger: { trigger: img, start: 'top 85%', once: true } });
    });
  });
}

// ---------- 3.2a o bowl se monta ----------
export function videoRolagem() {
  const trilha = $('#video-trilha'), canvas = $('#video-canvas');
  const etapas = [...document.querySelectorAll('.etapas li')];
  const limites = [.17, .42, .78];
  let iniciado = false;
  new IntersectionObserver(async ([e], obs) => {
    if (!e.isIntersecting || iniciado) return;
    iniciado = true; obs.disconnect();
    const { iniciarVideoRolagem } = await importar('js/video-rolagem.js');
    iniciarVideoRolagem(canvas, trilha, {
      base: pastaAssets + `video/montar/${celular() ? 'm' : 'd'}/`,
      aoProgresso(p) {
        const k = p < limites[0] ? 0 : p < limites[1] ? 1 : p < limites[2] ? 2 : 3;
        etapas.forEach((li, i) => li.classList.toggle('ativa', i === k));
      }
    });
  }, { rootMargin: '100% 0px' }).observe(trilha);
}

// ---------- 3.3 gelato: palavras do título ----------
export function gelato(gsap) {
  gsap.from('#gelato-t .palavra > span', { yPercent: 100, duration: .7, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '#gelato-t', start: 'top 85%', once: true } });
}

// ---------- 3.4 shakes: fade da foto ----------
export function shakes() {
  const f = $('.shakes-foto');
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { f.classList.add('on'); o.disconnect(); } }, { rootMargin: '0px 0px -15% 0px' }).observe(f);
}

// ---------- 3.5 combos montados ----------
// Os copos de cada combo saem das partes dele (açaí → tigela, bebida → suco, milkshake → copo de shake).
// Assim um combo novo, criado pelo editor, também ganha a sua cena.
const MODELO = { acai: 'jambo-tigela-acai.glb', bebida: 'jambo-suco.glb', milkshake: 'jambo-milkshake.glb' };
function itens3d(combo) {
  const partes = combo.partes.length ? combo.partes.slice(0, 3) : [{ tipo: 'acai', ml: 500 }];
  const escala = p => (p.tipo === 'acai' ? ({ 300: .82, 500: .92, 700: 1 }[p.ml] ?? .9) : p.tipo === 'milkshake' ? .8 : 1);
  const n = partes.length, doisAcai = n === 2 && partes.every(p => p.tipo === 'acai');
  const xs = n === 1 ? [0] : n === 2 ? (doisAcai ? [-.07, .07] : [-.065, .06]) : [-.1, 0, .1];
  return partes.map((p, k) => ({
    arquivo: MODELO[p.tipo], pos: [xs[k], 0, -.01 * k], de: [k < n / 2 ? -.5 : .5, 0, 0], atraso: k * .2,
    escala: escala(p) * (n === 3 ? .75 : 1), ...(doisAcai && k === 1 ? { rotY: .5 } : {})
  }));
}
export function combos(gsap, ScrollTrigger) {
  const trilha = $('#combos-trilha');
  const canvases = [...document.querySelectorAll('.combos-3d canvas')];
  const textos = [...document.querySelectorAll('.combo')];
  const marcas = [...document.querySelectorAll('.regua i')];
  const cenas = [];
  let combo = -1, carregado = false;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || carregado) return;
      carregado = true; io.disconnect();
      const { criarCena } = await importar('js/cena3d.js');
      cardapio.combos.itens.forEach((combo, i) => { if (canvases[i]) cenas[i] = criarCena(canvases[i], { itens: itens3d(combo), base: pastaAssets + '3d/', camera: { y: .16, z: .62, alvoY: .06, fov: 24 } }); });
      atualizar(st.progress);
    }, { rootMargin: '100% 0px' });
    io.observe(trilha);
    const N = Math.max(1, textos.length);
    trilha.style.setProperty('--n', N); // altura da trilha e régua: um trecho por combo
    async function atualizar(p) {
      const i = Math.min(N - 1, Math.floor(p * N));
      const local = p * N - i;
      if (i !== combo) {
        combo = i;
        textos.forEach((t, k) => t.classList.toggle('ativo', k === i));
        marcas.forEach((m, k) => m.classList.toggle('on', k === i));
      }
      if (!cenas.length) return;
      const saindo = i > 0 && local < .2;
      canvases.forEach((c, k) => c.classList.toggle('ativo', saindo ? k === i - 1 : k === i));
      if (saindo) (await cenas[i - 1]).definirProgresso(1 - local / .2); // os copos do combo anterior saem para os lados
      (await cenas[i]).definirProgresso(Math.min(1, Math.max(0, (local - .2) / .4)));
      for (let k = i + 1; k < cenas.length; k++) (await cenas[k]).definirProgresso(0);
    }
    // Tab num combo que não está na tela: rola até ele (assim o texto visível é sempre o do foco)
    textos.forEach((t, k) => t.addEventListener('focusin', () => {
      if (k === combo) return;
      const topo = scrollY + trilha.getBoundingClientRect().top;
      window.scrollTo({ top: topo + (trilha.offsetHeight - innerHeight) * ((k + .8) / N), behavior: 'instant' });
    }));
    const proxy = { p: 0 };
    const tw = gsap.to(proxy, { p: 1, ease: 'none', onUpdate: () => atualizar(proxy.p), scrollTrigger: { trigger: trilha, start: 'top top', end: 'bottom bottom', scrub: .5 } });
    const st = { get progress() { return proxy.p; } };
    atualizar(0);
    return () => { io.disconnect(); tw.scrollTrigger?.kill(); tw.kill(); combo = -1; textos.forEach((t, k) => t.classList.toggle('ativo', k === 0)); };
  });
}
