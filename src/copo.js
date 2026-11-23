// Desenho dos ingredientes sobre o açaí do copo (SVG, viewBox 400 × 340).
// Tudo em escala com a superfície do açaí: o copo inteiro cresce ou encolhe com o tamanho (300/500/700 ml),
// e os pedaços crescem junto. Posições sorteadas com semente fixa: o mesmo bowl sempre sai igual.
//
// Como cada ingrediente se arruma no copo (como num bowl de verdade):
// - frutas e granola: faixas lado a lado (fatias de banana espalhadas na faixa dela, cubos de manga na dela…)
// - farofinhas (paçoca, coco, gotas, pistache): salpicadas por cima de tudo
// - leite em pó: uma camada fina polvilhada sobre a superfície
// - caldas (avelã, amendoim, mel, doce de leite): fios em zigue-zague por cima
// - creme de ninho e brigadeiro: no centro, por cima

// superfície do açaí (centro, raios) e achatamento da perspectiva
export const SUP = { cx: 200, cy: 114, rx: 166, ry: 50 };
const ACHATA = .62; // quanto um pedaço "deitado" aparece achatado visto a 35°

const FAIXA = ['banana', 'morango', 'manga', 'kiwi', 'granola'];
const SALPICO = ['pacoca', 'coco', 'gotas-chocolate', 'pistache'];
const CALDA = ['creme-avela', 'pasta-amendoim', 'mel', 'doce-de-leite'];
const CENTRO = ['creme-ninho', 'brigadeiro'];
const PO = ['leite-em-po'];

// cores dos alimentos (desenho), não da marca
const C = {
  banana: '#F6E3A1', bananaMeio: '#EED384', bananaBorda: '#D9BC6A',
  morango: '#D7313F', morangoMeio: '#F47C86', morangoClaro: '#FFD3D6', folha: '#5E8C3A',
  manga: '#F5A623', mangaLado: '#D9860F', mangaLuz: '#FFC75A',
  kiwi: '#7FAF3A', kiwiAnel: '#B9DA6E', kiwiMeio: '#EAF3C8', kiwiCasca: '#7A5A35', semente: '#2A1B12',
  granola: ['#C98A3B', '#B37530', '#DDA75A', '#A2672A'], aveia: '#E9CF96',
  pacoca: ['#CF9A5F', '#E0B47E', '#B98149'],
  coco: '#FBF6EC', cocoSombra: '#DCCFB7',
  gota: '#4A2A1E', gotaLuz: '#7A4B37',
  pistache: ['#9DB35A', '#7F9A44', '#BFD07C', '#6E8B3D'],
  po: '#FFFDF7',
  avela: '#5A3426', amendoim: '#C68A4C', mel: '#F2B23A', doce: '#C27A3A',
  ninho: '#FFFDF6', ninhoSombra: '#E6DED2',
  brigadeiro: '#4B2617', granulado: '#2A140B', brigLuz: '#7B4A33',
  sombra: 'rgba(20,6,26,.28)'
};

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
const semente = id => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const f = n => Math.round(n * 10) / 10;

// ponto do disco (u, v em -1..1) → tela
const P = (u, v) => [SUP.cx + u * SUP.rx, SUP.cy + v * SUP.ry];

// sorteia pontos dentro de uma faixa do disco, sem encostar demais
function pontos(r, n, { u0 = -1, u1 = 1, raio = .88, dist = .16 } = {}) {
  const out = [];
  for (let t = 0; out.length < n && t < n * 60; t++) {
    const u = u0 + (u1 - u0) * r(), v = (r() * 2 - 1);
    if (u * u + v * v > raio * raio || v > .74) continue; // nada pendurado na borda da frente
    if (out.some(([a, b]) => (a - u) ** 2 + ((b - v) * .55) ** 2 < dist * dist)) continue;
    out.push([u, v]);
  }
  return out.sort((a, b) => a[1] - b[1]); // de trás para a frente
}

// ---------- peças ----------
const sombra = (x, y, rx) => `<ellipse cx="${f(x + 2)}" cy="${f(y + rx * ACHATA * .55)}" rx="${f(rx * 1.02)}" ry="${f(rx * ACHATA * .55)}" fill="${C.sombra}"/>`;

const PECA = {
  banana(x, y, r, rot) {
    const s = 17 + r() * 2.5;
    return sombra(x, y, s) + `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(1 ${ACHATA})">
      <circle r="${f(s)}" fill="${C.banana}" stroke="${C.bananaBorda}" stroke-width="1.6"/>
      <circle r="${f(s * .45)}" fill="${C.bananaMeio}"/>
      ${[0, 1, 2].map(k => `<circle cx="${f(Math.cos(k * 2.1) * s * .22)}" cy="${f(Math.sin(k * 2.1) * s * .22)}" r="1.3" fill="${C.bananaBorda}"/>`).join('')}</g>`;
  },
  morango(x, y, r, rot) {
    const s = 15 + r() * 3;
    return sombra(x, y, s) + `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(1 ${ACHATA + .1})">
      <path d="M0 ${-s} C ${s * .95} ${-s} ${s * 1.05} ${s * .25} 0 ${s * 1.1} C ${-s * 1.05} ${s * .25} ${-s * .95} ${-s} 0 ${-s}Z" fill="${C.morango}"/>
      <path d="M0 ${-s * .7} C ${s * .6} ${-s * .7} ${s * .7} ${s * .2} 0 ${s * .8} C ${-s * .7} ${s * .2} ${-s * .6} ${-s * .7} 0 ${-s * .7}Z" fill="${C.morangoMeio}"/>
      <path d="M0 ${-s * .45} L0 ${s * .5}" stroke="${C.morangoClaro}" stroke-width="2" stroke-linecap="round"/>
      <path d="M${-s * .5} ${-s * .95} q ${s * .5} ${-s * .45} ${s} 0" fill="none" stroke="${C.folha}" stroke-width="3" stroke-linecap="round"/></g>`;
  },
  manga(x, y, r, rot) {
    const s = 12 + r() * 3, h = s * .7, a = (rot / 180) * .5;
    // cubo visto de cima-frente: topo + lado
    return sombra(x, y, s * 1.1) + `<g transform="translate(${f(x)} ${f(y)})">
      <path d="M${f(-s)} ${f(-s * .35 + a * s)} L${f(s * .2)} ${f(-s * .75)} L${f(s)} ${f(-s * .25 - a * s)} L${f(-s * .2)} ${f(s * .15)}Z" fill="${C.mangaLuz}"/>
      <path d="M${f(-s)} ${f(-s * .35 + a * s)} L${f(-s * .2)} ${f(s * .15)} L${f(-s * .2)} ${f(s * .15 + h)} L${f(-s)} ${f(-s * .35 + a * s + h)}Z" fill="${C.manga}"/>
      <path d="M${f(-s * .2)} ${f(s * .15)} L${f(s)} ${f(-s * .25 - a * s)} L${f(s)} ${f(-s * .25 - a * s + h)} L${f(-s * .2)} ${f(s * .15 + h)}Z" fill="${C.mangaLado}"/></g>`;
  },
  kiwi(x, y, r, rot) {
    const s = 18 + r() * 2.5;
    return sombra(x, y, s) + `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(1 ${ACHATA})">
      <circle r="${f(s)}" fill="${C.kiwi}" stroke="${C.kiwiCasca}" stroke-width="1.6"/>
      <circle r="${f(s * .62)}" fill="${C.kiwiAnel}" opacity=".55"/>
      <circle r="${f(s * .3)}" fill="${C.kiwiMeio}"/>
      ${Array.from({ length: 10 }, (_, k) => `<ellipse cx="${f(Math.cos(k * .628) * s * .48)}" cy="${f(Math.sin(k * .628) * s * .48)}" rx="1.1" ry="1.8" transform="rotate(${k * 36} ${f(Math.cos(k * .628) * s * .48)} ${f(Math.sin(k * .628) * s * .48)})" fill="${C.semente}"/>`).join('')}</g>`;
  },
  granola(x, y, r) {
    // um "torrão": 3 a 5 bolinhas + flocos de aveia
    let g = '';
    const n = 3 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const dx = (r() - .5) * 16, dy = (r() - .5) * 7, s = 4 + r() * 3.4;
      g += `<ellipse cx="${f(x + dx)}" cy="${f(y + dy)}" rx="${f(s)}" ry="${f(s * .8)}" fill="${C.granola[Math.floor(r() * 4)]}"/>`;
    }
    g += `<ellipse cx="${f(x + (r() - .5) * 10)}" cy="${f(y - 2)}" rx="3.4" ry="1.8" transform="rotate(${Math.round(r() * 180)} ${f(x)} ${f(y)})" fill="${C.aveia}"/>`;
    return g;
  },
  pacoca(x, y, r) {
    const s = 2.5 + r() * 3.5, c = C.pacoca[Math.floor(r() * 3)];
    const pts = Array.from({ length: 5 }, (_, k) => { const a = k * 1.256 + r() * .6, rr = s * (.7 + r() * .5); return `${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr * .7)}`; }).join(' ');
    return `<polygon points="${pts}" fill="${c}"/>`;
  },
  coco(x, y, r) {
    const a = Math.round(r() * 180), s = 6 + r() * 4;
    return `<path d="M${f(x - s)} ${f(y)} q ${f(s)} ${f(-4 - r() * 3)} ${f(s * 2)} 0" fill="none" stroke="${C.cocoSombra}" stroke-width="3.6" stroke-linecap="round" transform="rotate(${a} ${f(x)} ${f(y)})"/>
      <path d="M${f(x - s)} ${f(y - 1)} q ${f(s)} ${f(-4 - r() * 3)} ${f(s * 2)} 0" fill="none" stroke="${C.coco}" stroke-width="2.6" stroke-linecap="round" transform="rotate(${a} ${f(x)} ${f(y)})"/>`;
  },
  'gotas-chocolate'(x, y, r) {
    const s = 3 + r() * 1.2;
    return `<path d="M${f(x)} ${f(y - s * 1.5)} C ${f(x + s * 1.2)} ${f(y - s * .2)} ${f(x + s)} ${f(y + s * .8)} ${f(x)} ${f(y + s * .8)} C ${f(x - s)} ${f(y + s * .8)} ${f(x - s * 1.2)} ${f(y - s * .2)} ${f(x)} ${f(y - s * 1.5)}Z" fill="${C.gota}"/>
      <circle cx="${f(x - s * .3)}" cy="${f(y - s * .1)}" r="${f(s * .25)}" fill="${C.gotaLuz}"/>`;
  },
  pistache(x, y, r) {
    const s = 2 + r() * 2.6, c = C.pistache[Math.floor(r() * 4)];
    const pts = Array.from({ length: 4 }, (_, k) => { const a = k * 1.57 + r() * .8, rr = s * (.7 + r() * .6); return `${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr * .75)}`; }).join(' ');
    return `<polygon points="${pts}" fill="${c}"/>`;
  }
};

// quantos pedaços por faixa (pela largura da faixa) e o espaçamento
const DENS = { banana: [30, .14], morango: [28, .14], manga: [40, .11], kiwi: [22, .16], granola: [110, .05] };

function desenharFaixa(id, u0, u1) {
  const r = rng(semente(id) + Math.round(u0 * 100));
  const [n, dist] = DENS[id];
  const largura = (u1 - u0) / 2;
  const ps = pontos(r, Math.max(4, Math.round(n * largura)), { u0, u1, dist, raio: id === 'granola' ? .92 : .86 });
  return ps.map(([u, v]) => { const [x, y] = P(u, v); return PECA[id](x, y, r, Math.round((r() - .5) * 70)); }).join('');
}

function desenharSalpico(id) {
  const r = rng(semente(id));
  const n = { pacoca: 34, coco: 20, 'gotas-chocolate': 30, pistache: 40 }[id];
  return pontos(r, n, { dist: .07, raio: .86 }).map(([u, v]) => { const [x, y] = P(u, v); return PECA[id](x, y, r); }).join('');
}

// leite em pó: camada branca polvilhada sobre o açaí (por baixo das frutas), com bordas de pó
function desenharPo() {
  const r = rng(99);
  let g = `<ellipse cx="${SUP.cx}" cy="${SUP.cy}" rx="${f(SUP.rx * .9)}" ry="${f(SUP.ry * .86)}" fill="${C.po}" opacity=".5"/>`;
  // manchas mais grossas de pó
  for (let k = 0; k < 26; k++) {
    const a = r() * 6.283, d = Math.sqrt(r()) * .78;
    const [x, y] = P(Math.cos(a) * d, Math.sin(a) * d);
    g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(14 + r() * 18)}" ry="${f(5 + r() * 6)}" fill="${C.po}" opacity="${f(.45 + r() * .3)}"/>`;
  }
  // grãos soltos na borda
  for (let k = 0; k < 320; k++) {
    const a = r() * 6.283, d = .55 + r() * .4;
    const [x, y] = P(Math.cos(a) * d, Math.sin(a) * d);
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.8 + r() * 1.4)}" fill="${C.po}" opacity="${f(.6 + r() * .4)}"/>`;
  }
  return g;
}

// fio de calda: laçadas soltas e irregulares de um lado ao outro (cada calda num ângulo diferente)
function desenharCalda(id, i, corNova) {
  const cor = corNova ?? { 'creme-avela': C.avela, 'pasta-amendoim': C.amendoim, mel: C.mel, 'doce-de-leite': C.doce }[id];
  const r = rng(semente(id) + i * 17);
  const voltas = 7, inclina = [-.18, .16, -.05, .1][i % 4];
  const pts = [];
  for (let k = 0; k <= voltas; k++) {
    const u = -.8 + (1.6 * k) / voltas + (r() - .5) * .06;
    const lim = Math.sqrt(Math.max(0, .78 - u * u));
    const v = (k % 2 ? 1 : -1) * lim * (.55 + r() * .35) + inclina * u;
    pts.push(P(u, v));
  }
  // Catmull-Rom → curvas Bézier (fio contínuo e macio)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let k = 0; k < pts.length - 1; k++) {
    const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  const larg = id === 'mel' ? 3.6 : 4.4;
  return `<path d="${d}" fill="none" stroke="${C.sombra}" stroke-width="${larg + 1}" stroke-linecap="round" transform="translate(1.5 2.5)"/>
    <path d="${d}" fill="none" stroke="${cor}" stroke-width="${larg}" stroke-linecap="round" opacity="${id === 'mel' ? .9 : 1}"/>
    <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round" transform="translate(-.8 -1)"/>`;
}

// colherada de creme: monte branco e liso, com brilho (nada de "cone")
export function colherada(x, y, w, cor = C.ninho, sombraCor = C.ninhoSombra) {
  const h = w * .55;
  return `<ellipse cx="${f(x + 2)}" cy="${f(y + h * .35)}" rx="${f(w * .55)}" ry="${f(h * .3)}" fill="${C.sombra}"/>
    <path d="M${f(x - w * .55)} ${f(y + h * .25)} C ${f(x - w * .6)} ${f(y - h * .45)} ${f(x - w * .2)} ${f(y - h * .85)} ${f(x + w * .05)} ${f(y - h * .7)}
      C ${f(x + w * .35)} ${f(y - h * .95)} ${f(x + w * .62)} ${f(y - h * .4)} ${f(x + w * .55)} ${f(y + h * .25)}
      C ${f(x + w * .3)} ${f(y + h * .45)} ${f(x - w * .3)} ${f(y + h * .45)} ${f(x - w * .55)} ${f(y + h * .25)}Z" fill="${cor}" stroke="${sombraCor}" stroke-width="1.2"/>
    <path d="M${f(x - w * .35)} ${f(y + h * .05)} C ${f(x - w * .15)} ${f(y + h * .2)} ${f(x + w * .2)} ${f(y + h * .2)} ${f(x + w * .38)} ${f(y)}" fill="none" stroke="${sombraCor}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="${f(x - w * .12)}" cy="${f(y - h * .42)}" rx="${f(w * .16)}" ry="${f(h * .12)}" fill="#fff" opacity=".9"/>`;
}

export function brigadeiro(x, y, s, r) {
  let g = sombra(x, y + s * .45, s) + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${C.brigadeiro}"/>`;
  for (let k = 0; k < 26; k++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * s * .88, gx = x + Math.cos(a) * d, gy = y + Math.sin(a) * d;
    g += `<rect x="${f(gx - 2)}" y="${f(gy - .8)}" width="4" height="1.6" rx=".8" fill="${C.granulado}" transform="rotate(${Math.round(r() * 180)} ${f(gx)} ${f(gy)})"/>`;
  }
  return g + `<ellipse cx="${f(x - s * .35)}" cy="${f(y - s * .4)}" rx="${f(s * .28)}" ry="${f(s * .18)}" fill="${C.brigLuz}" opacity=".75"/>`;
}

function desenharCentro(id) {
  if (id === 'creme-ninho') {
    return [[-.1, -.15, 58], [.28, .2, 44], [-.42, .3, 40]].map(([u, v, w]) => { const [x, y] = P(u, v); return colherada(x, y, w); }).join('');
  }
  const r = rng(77); // brigadeiro: 3 docinhos inteiros, do tamanho de um docinho de verdade
  return [[.22, -.25], [.48, .12], [.12, .3]].map(([u, v]) => { const [x, y] = P(u, v); return brigadeiro(x, y - 8, 17, r); }).join('');
}

// ---------- ingredientes novos (criados pelo editor, sem desenho próprio) ----------
// Cada um tem um jeito (estilo) e uma cor escolhidos no editor; o desenho sai daqui.
const NOVOS = {}; // id → { estilo, hex }
// ingredientes que já têm desenho feito à mão dentro do copo (o resto é desenhado pela cor e pelo estilo)
export const COPO_PRONTO = [...FAIXA, ...SALPICO, ...CALDA, ...CENTRO, ...PO];
export function registrarIngredientes(itens) {
  for (const it of itens) if (!COPO_PRONTO.includes(it.id)) NOVOS[it.id] = { estilo: it.estilo, hex: it.hex };
}
const escuro = (hex, q = .25) => { const n = parseInt(hex.slice(1), 16), c = k => Math.round(((n >> k) & 255) * (1 - q)); return '#' + [16, 8, 0].map(k => c(k).toString(16).padStart(2, '0')).join(''); };

function pedacoNovo(x, y, r, rot, hex) {
  const s = 10 + r() * 3;
  return sombra(x, y, s) + `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(1 ${ACHATA + .1})">
    <rect x="${f(-s)}" y="${f(-s)}" width="${f(2 * s)}" height="${f(2 * s)}" rx="${f(s * .45)}" fill="${hex}" stroke="${escuro(hex)}" stroke-width="1.4"/>
    <ellipse cx="${f(-s * .3)}" cy="${f(-s * .4)}" rx="${f(s * .35)}" ry="${f(s * .2)}" fill="#fff" opacity=".45"/></g>`;
}
function salpicoNovo(x, y, r, hex) {
  const s = 2.5 + r() * 3, c = r() < .35 ? escuro(hex) : hex;
  const pts = Array.from({ length: 5 }, (_, k) => { const a = k * 1.256 + r() * .6, rr = s * (.7 + r() * .5); return `${f(x + Math.cos(a) * rr)},${f(y + Math.sin(a) * rr * .7)}`; }).join(' ');
  return `<polygon points="${pts}" fill="${c}"/>`;
}
function desenharNovo(id, i, faixa) {
  const { estilo, hex } = NOVOS[id];
  const r = rng(semente(id));
  if (estilo === 'calda') return desenharCalda(id, i, hex);
  if (estilo === 'creme') return [[.05, -.1, 50], [-.38, .22, 38]].map(([u, v, w]) => { const [x, y] = P(u, v); return colherada(x, y, w, hex, escuro(hex, .15)); }).join('');
  if (estilo === 'salpicado') return pontos(r, 32, { dist: .07, raio: .86 }).map(([u, v]) => { const [x, y] = P(u, v); return salpicoNovo(x, y, r, hex); }).join('');
  const [u0, u1] = faixa;
  return pontos(r, Math.max(4, Math.round(26 * (u1 - u0) / 2)), { u0, u1, dist: .14, raio: .86 }).map(([u, v]) => { const [x, y] = P(u, v); return pedacoNovo(x, y, r, Math.round((r() - .5) * 70), hex); }).join('');
}
const ehFaixa = id => FAIXA.includes(id) || NOVOS[id]?.estilo === 'pedacos';

// ---------- montagem do copo ----------
// ids na ordem em que entraram; devolve [{ id, svg }] na ordem de desenho (de baixo para cima)
export function camadas(ids) {
  const out = [];
  ids.filter(i => PO.includes(i)).forEach(id => out.push({ id, svg: desenharPo() })); // camada por baixo das frutas
  const faixas = ids.filter(ehFaixa);
  // granola sempre numa ponta (como no balcão), frutas no meio
  faixas.sort((a, b) => (a === 'granola') - (b === 'granola'));
  const n = faixas.length;
  faixas.forEach((id, k) => {
    const u0 = -1 + (2 * k) / n + .02, u1 = -1 + (2 * (k + 1)) / n - .02;
    out.push({ id, svg: FAIXA.includes(id) ? desenharFaixa(id, u0, u1) : desenharNovo(id, 0, [u0, u1]) });
  });
  ids.filter(i => SALPICO.includes(i) || NOVOS[i]?.estilo === 'salpicado').forEach(id => out.push({ id, svg: SALPICO.includes(id) ? desenharSalpico(id) : desenharNovo(id) }));
  ids.filter(i => CALDA.includes(i) || NOVOS[i]?.estilo === 'calda').forEach((id, i) => out.push({ id, svg: CALDA.includes(id) ? desenharCalda(id, i) : desenharNovo(id, i) }));
  ids.filter(i => CENTRO.includes(i) || NOVOS[i]?.estilo === 'creme').forEach(id => out.push({ id, svg: CENTRO.includes(id) ? desenharCentro(id) : desenharNovo(id) }));
  return out;
}

// ---------- gelato: copinho com 1 a 3 bolas ----------
// cada sabor: cor da massa, sombra e o "detalhe" que aparece por cima
export const SABOR = {
  'pistache': { cor: '#A9BC6E', escuro: '#7F9A44', det: 'pistache' },
  'ninho-morango': { cor: '#FFF3E6', escuro: '#E6D3C0', det: 'morango' },
  'chocolate-belga': { cor: '#6A3B28', escuro: '#47251A', det: 'raspas' },
  'doce-de-leite': { cor: '#D9A260', escuro: '#B57B3C', det: 'calda' },
  'maracuja': { cor: '#F5C84F', escuro: '#D9A72A', det: 'sementes' },
  'cookies-cream': { cor: '#EFE8DC', escuro: '#D4C9B6', det: 'biscoito' },
  'fior-di-latte': { cor: '#FFF8EC', escuro: '#E9DDC8', det: null },
  'limao-siciliano': { cor: '#EDE7A1', escuro: '#CFC66A', det: 'raspas-limao' }
};

// sabor novo (criado no editor): usa a cor escolhida, sem detalhe por cima
export function registrarSabores(sabores) {
  for (const s of sabores) if (!s.cor && !SABOR[s.id]) SABOR[s.id] = { cor: s.hex, escuro: s.escuro, det: null };
}

export const SABORES_PRONTOS = Object.keys(SABOR); // os que já têm desenho (antes de registrar os novos)

// bola de gelato: topo redondo + "babado" embaixo, que é o jeito de bola feita com boleador
let contaBola = 0;
function bola(x, y, R, sabor, r, pre = 'gr') {
  const s = SABOR[sabor];
  // nome único por desenho: se o mesmo nome existir num ícone escondido, a bola perde a cor
  const id = pre + '-' + sabor + '-' + (++contaBola);
  let babado = '';
  const n = 9;
  for (let k = 0; k <= n; k++) {
    const t = k / n, bx = x - R + 2 * R * t, by = y + R * .42 + Math.sin(t * Math.PI) * R * .12;
    babado += (k ? ' Q ' + f(bx - R / n) + ' ' + f(by + R * .14) + ' ' : 'M ') + f(bx) + ' ' + f(by);
  }
  let g = `<defs><radialGradient id="${id}" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".35" stop-color="${s.cor}"/><stop offset="1" stop-color="${s.escuro}"/></radialGradient></defs>
    <ellipse cx="${f(x + 3)}" cy="${f(y + R * .55)}" rx="${f(R * 1.02)}" ry="${f(R * .2)}" fill="${C.sombra}"/>
    <path d="M ${f(x - R)} ${f(y + R * .42)} A ${f(R)} ${f(R * .98)} 0 0 1 ${f(x + R)} ${f(y + R * .42)} Z" fill="url(#${id})"/>
    <path d="${babado}" fill="none" stroke="${s.escuro}" stroke-width="${f(R * .16)}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${babado}" fill="none" stroke="${s.cor}" stroke-width="${f(R * .09)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -2)"/>`;
  // detalhe do sabor
  const dentro = () => { const a = r() * 6.28, d = Math.sqrt(r()) * R * .72; return [x + Math.cos(a) * d, y + Math.sin(a) * d * .8 - R * .05]; };
  if (s.det === 'pistache') for (let k = 0; k < 16; k++) { const [px, py] = dentro(); g += `<polygon points="${f(px)},${f(py - 3)} ${f(px + 3.5)},${f(py)} ${f(px)},${f(py + 2.5)} ${f(px - 3)},${f(py)}" fill="${C.pistache[k % 4]}"/>`; }
  if (s.det === 'morango') for (let k = 0; k < 4; k++) { const [px, py] = dentro(); g += `<path d="M ${f(px - 12)} ${f(py)} q 8 -10 16 -2 t 12 -4" fill="none" stroke="#E86A7E" stroke-width="5" stroke-linecap="round" opacity=".85"/>`; }
  if (s.det === 'raspas') for (let k = 0; k < 16; k++) { const [px, py] = dentro(); g += `<rect x="${f(px)}" y="${f(py)}" width="${f(5 + r() * 5)}" height="2.2" rx="1" fill="#2E160E" transform="rotate(${Math.round(r() * 180)} ${f(px)} ${f(py)})"/>`; }
  if (s.det === 'calda') g += `<path d="M ${f(x - R * .7)} ${f(y - R * .3)} C ${f(x - R * .3)} ${f(y - R * .7)} ${f(x + R * .1)} ${f(y + R * .1)} ${f(x + R * .6)} ${f(y - R * .4)}" fill="none" stroke="#9C5A22" stroke-width="5" stroke-linecap="round"/>`;
  if (s.det === 'sementes') for (let k = 0; k < 14; k++) { const [px, py] = dentro(); g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="1.8" ry="2.4" fill="#2A1B12"/>`; }
  if (s.det === 'biscoito') for (let k = 0; k < 14; k++) { const [px, py] = dentro(); g += `<rect x="${f(px)}" y="${f(py)}" width="${f(3 + r() * 4)}" height="${f(3 + r() * 3)}" rx="1" fill="#2E1D17" transform="rotate(${Math.round(r() * 90)} ${f(px)} ${f(py)})"/>`; }
  if (s.det === 'raspas-limao') for (let k = 0; k < 10; k++) { const [px, py] = dentro(); g += `<path d="M ${f(px - 3)} ${f(py)} l 6 -2" stroke="#9DB43A" stroke-width="2" stroke-linecap="round"/>`; }
  return g + `<ellipse cx="${f(x - R * .35)}" cy="${f(y - R * .45)}" rx="${f(R * .22)}" ry="${f(R * .12)}" fill="#fff" opacity=".35"/>`;
}

// posições das bolas no copinho (viewBox 400 × 340)
const BOLAS = { 1: [[200, 168]], 2: [[160, 176], [240, 176]], 3: [[156, 182], [244, 182], [200, 118]] };
export const RAIO_BOLA = 58;

// devolve [{ id, svg }]: bolas (uma por sabor) e depois os adicionais por cima
export function camadasGelato(sabores, adicionais) {
  const out = [];
  const pos = BOLAS[Math.min(3, Math.max(1, sabores.length))] ?? [];
  sabores.forEach((sb, i) => { const [x, y] = pos[i]; out.push({ id: 'g-' + sb, svg: bola(x, y, RAIO_BOLA, sb, rng(semente(sb))) }); });
  if (!sabores.length) return out;
  const topo = Math.min(...pos.slice(0, sabores.length).map(p => p[1])) - RAIO_BOLA * .95; // alto da bola de cima
  const meio = 200, largura = sabores.length === 1 ? 52 : 92;
  adicionais.forEach((id, i) => {
    const r = rng(semente(id) + 3);
    let svg = '';
    const novo = NOVOS[id];
    const cor = { 'creme-avela': C.avela, 'pasta-amendoim': C.amendoim, mel: C.mel, 'doce-de-leite': C.doce }[id] ?? (novo?.estilo === 'calda' ? novo.hex : null);
    if (cor) { // calda escorrendo pelas bolas
      const y0 = topo + RAIO_BOLA * (sabores.length === 3 ? .95 : .55) + i * 9;
      let d = `M ${f(meio - largura)} ${f(y0 + 10)}`;
      for (let k = 1; k <= 6; k++) d += ` Q ${f(meio - largura + (k - .5) * largura / 3)} ${f(y0 + (k % 2 ? -9 : 15))} ${f(meio - largura + k * largura / 3)} ${f(y0 + 6 + (k % 2) * 8)}`;
      svg = `<path d="${d}" fill="none" stroke="${C.sombra}" stroke-width="7" stroke-linecap="round" transform="translate(1.5 2.5)"/><path d="${d}" fill="none" stroke="${cor}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.6" stroke-linecap="round" transform="translate(-1 -1.4)"/>`;
    } else if (id === 'pistache') {
      for (let k = 0; k < 30; k++) { const x = meio + (r() - .5) * largura * 1.2, y = topo + 16 + r() * 46; svg += `<polygon points="${f(x)},${f(y - 3)} ${f(x + 4)},${f(y)} ${f(x)},${f(y + 3)} ${f(x - 3.5)},${f(y)}" fill="${C.pistache[k % 4]}"/>`; }
    } else if (id === 'creme-ninho') {
      svg = colherada(meio + 6, topo + 14, 58);
    } else if (id === 'brigadeiro') {
      svg = brigadeiro(meio + (sabores.length === 1 ? 40 : 46), topo + RAIO_BOLA * .55, 17, r);
    } else if (novo?.estilo === 'creme') {
      svg = colherada(meio + 6, topo + 14, 50, novo.hex, escuro(novo.hex, .15));
    } else if (novo) { // pedaços ou salpicado: espalhados por cima das bolas
      for (let k = 0; k < (novo.estilo === 'pedacos' ? 7 : 26); k++) {
        const x = meio + (r() - .5) * largura * 1.2, y = topo + 16 + r() * 46;
        svg += novo.estilo === 'pedacos' ? pedacoNovo(x, y, r, Math.round((r() - .5) * 70), novo.hex).replace(/scale\(1 [\d.]+\)/, 'scale(.7)') : salpicoNovo(x, y, r, novo.hex);
      }
    }
    out.push({ id, svg });
  });
  return out;
}

// adesivo do sabor (para a bancada): uma bola pequena
export function adesivoSabor(sb) {
  return `<svg viewBox="132 98 136 118" aria-hidden="true" focusable="false">${bola(200, 168, RAIO_BOLA, sb, rng(semente(sb)), 'gs')}</svg>`;
}
