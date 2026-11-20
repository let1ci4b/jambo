// JAMBO · Abertura "onda de açaí" (8 s)
// Desenho puro em canvas 2D, sem dependências. O mesmo arquivo roda no navegador
// (requestAnimationFrame) e no Node (@napi-rs/canvas) para gerar o vídeo de reserva.
// Texto do site fica em HTML; aqui só se desenha texto quando opts.comTexto = true (versão em vídeo).

export const DURACAO = 8;
export const FRUTAS = ['banana', 'morango', 'kiwi', 'manga', 'granola', 'coco', 'pistache', 'gotas-chocolate'];

const COR = {
  creme: '#F5EBDD', roxo: '#40204F', lilas: '#A67CC4',
  ondaFundo: '#7B4386', ondaMeio: '#4A1E4C', ondaFrente: '#2C1033', brilho: 'rgba(245,235,221,.55)'
};

// ---------- utilidades ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // power2.inOut aprox.
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeOut = t => 1 - Math.pow(1 - t, 3);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Nível da onda (fração da altura, 0 = topo) por quadros-chave
const NIVEL = [[0, 1.12], [1.1, .62], [2.3, -.15], [3.3, -.15], [4.7, .66], [8, .68]];
function nivel(t) {
  for (let i = 0; i < NIVEL.length - 1; i++) {
    const [t0, v0] = NIVEL[i], [t1, v1] = NIVEL[i + 1];
    if (t <= t1) return lerp(v0, v1, easeInOut(clamp((t - t0) / (t1 - t0))));
  }
  return NIVEL[NIVEL.length - 1][1];
}
// agitação: forte quando a onda se move, calma no fim
const agitacao = t => 0.35 + 0.9 * Math.exp(-Math.pow((t - 2.0) / 1.1, 2)) + 0.8 * Math.exp(-Math.pow((t - 4.1) / .7, 2));

export function superficie(x, t, W, H, camada = 0) {
  const k = 2 * Math.PI / W;
  const a = agitacao(t) * H * (camada === 0 ? .05 : camada === 1 ? .04 : .03);
  const desloc = camada * .06 * H;
  return nivel(t) * H - desloc
    + a * Math.sin(k * 1.3 * x + t * 2.1 + camada * 1.7)
    + a * .55 * Math.sin(k * 2.7 * x - t * 3.3 + camada)
    + a * .25 * Math.sin(k * 5.1 * x + t * 4.4 + camada * 2.3);
}

// ---------- partículas (determinísticas) ----------
function montarCena(W, H) {
  const r = rng(7);
  const voando = [];
  // frutas que saltam da onda entre 1,0 s e 3,6 s
  for (let i = 0; i < 14; i++) {
    voando.push({
      nome: FRUTAS[i % FRUTAS.length], t0: 1.0 + r() * 2.4,
      x0: r() * W, vx: (r() - .5) * W * .35, vy: -(0.75 + r() * .5) * H, g: 1.25 * H,
      rot0: r() * 6.28, vr: (r() - .5) * 6, tam: (0.07 + r() * .05) * Math.min(W, H) * 1.4
    });
  }
  const gotas = [];
  for (const [tc, n] of [[1.15, 26], [4.0, 30]]) {
    for (let i = 0; i < n; i++) gotas.push({ t0: tc + r() * .35, x0: r() * W, vx: (r() - .5) * W * .25, vy: -(0.35 + r() * .55) * H, g: 1.6 * H, raio: (0.004 + r() * .01) * Math.min(W, H) * 1.6 });
  }
  // frutas que ficam boiando no fim
  const boiando = [
    { nome: 'banana', fx: .14, tam: .11 }, { nome: 'morango', fx: .33, tam: .12 }, { nome: 'kiwi', fx: .56, tam: .115 },
    { nome: 'manga', fx: .76, tam: .11 }, { nome: 'pistache', fx: .92, tam: .09 }
  ].map((f, i) => ({ ...f, t0: 4.4 + i * .18 }));
  return { voando, gotas, boiando };
}

let cache = null;

export function desenhar(ctx, t, W, H, imgs, opts = {}) {
  if (!cache || cache.W !== W || cache.H !== H) cache = { W, H, ...montarCena(W, H) };
  const m = Math.min(W, H);
  ctx.save();
  // fundo creme
  ctx.fillStyle = COR.creme; ctx.fillRect(0, 0, W, H);

  // logo e frase (só na versão em vídeo)
  if (opts.comTexto && imgs.logo) {
    const p = clamp((t - 4.9) / .9);
    if (p > 0) {
      const lw = Math.min(W * .46, H * .9) * (W < H ? 1 : .82), lh = lw * imgs.logo.height / imgs.logo.width;
      const y = H * .27 - lh / 2 + (1 - easeOut(p)) * H * .06;
      ctx.globalAlpha = p; ctx.drawImage(imgs.logo, W / 2 - lw / 2, y, lw, lh); ctx.globalAlpha = 1;
    }
    const q = clamp((t - 6.0) / .7);
    if (q > 0) {
      ctx.globalAlpha = q; ctx.fillStyle = COR.roxo; ctx.textAlign = 'center';
      ctx.font = `700 ${Math.round(m * .052)}px "Bricolage Grotesque", sans-serif`;
      const lw2 = Math.min(W * .46, H * .9) * (W < H ? 1 : .82), lh2 = lw2 * imgs.logo.height / imgs.logo.width;
      ctx.fillText('Seu verão, do seu jeito.', W / 2, H * .27 + lh2 / 2 + m * .085 + (1 - easeOut(q)) * 20);
      ctx.globalAlpha = 1;
    }
  }

  // três camadas da onda
  for (let c = 2; c >= 0; c--) {
    const camada = c; // 2 = fundo (mais alto), 0 = frente
    ctx.beginPath(); ctx.moveTo(0, H + 2);
    for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, superficie(x, t, W, H, camada));
    ctx.lineTo(W, H + 2); ctx.closePath();
    const yTop = nivel(t) * H - camada * .06 * H;
    const g = ctx.createLinearGradient(0, yTop - H * .05, 0, yTop + H * .55);
    g.addColorStop(0, COR.ondaMeio); g.addColorStop(.35, COR.ondaFrente); g.addColorStop(1, '#1A0820');
    ctx.fillStyle = camada === 0 ? g : camada === 1 ? COR.ondaMeio : COR.ondaFundo;
    ctx.fill();
  }
  // brilho na crista da frente (o "molhado" do açaí); o quadro final do rodapé desliga (opts.semBrilho)
  if (!opts.semBrilho) {
  ctx.strokeStyle = COR.brilho; ctx.lineWidth = Math.max(2, m * .006); ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const y = superficie(x, t, W, H, 0) + m * .018;
    const visivel = Math.sin(x / W * 9 + t * 1.3) > .35;
    if (visivel) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.stroke();
  }

  // gotas
  for (const d of cache.gotas) {
    const dt = t - d.t0; if (dt < 0 || dt > 1.4) continue;
    const x = d.x0 + d.vx * dt, y = superficie(d.x0, d.t0, W, H, 0) + d.vy * dt + .5 * d.g * dt * dt;
    if (y > superficie(x, t, W, H, 0) + 4 && dt > .15) continue;
    ctx.fillStyle = COR.ondaMeio; ctx.beginPath(); ctx.arc(x, y, d.raio, 0, 6.283); ctx.fill();
    ctx.fillStyle = COR.brilho; ctx.beginPath(); ctx.arc(x - d.raio * .35, y - d.raio * .35, d.raio * .3, 0, 6.283); ctx.fill();
  }

  // frutas voando
  for (const f of cache.voando) {
    const dt = t - f.t0; if (dt < 0 || dt > 1.6) continue;
    const img = imgs[f.nome]; if (!img) continue;
    const x = f.x0 + f.vx * dt, y = superficie(f.x0, f.t0, W, H, 0) + f.vy * dt + .5 * f.g * dt * dt;
    if (y > superficie(x, t, W, H, 0) + f.tam && dt > .3) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(f.rot0 + f.vr * dt);
    ctx.drawImage(img, -f.tam / 2, -f.tam / 2, f.tam, f.tam); ctx.restore();
  }

  // frutas boiando no fim
  for (const f of cache.boiando) {
    const p = clamp((t - f.t0) / .8); if (p <= 0) continue;
    const img = imgs[f.nome]; if (!img) continue;
    const x = f.fx * W, tam = f.tam * m * 1.3;
    const ySup = superficie(x, t, W, H, 0);
    const y = ySup - tam * .18 + (1 - easeOutBack(p)) * tam * 1.2;
    const inclina = (superficie(x + 10, t, W, H, 0) - superficie(x - 10, t, W, H, 0)) / 20;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan(inclina) + Math.sin(t * 1.6 + f.fx * 9) * .08);
    ctx.drawImage(img, -tam / 2, -tam / 2, tam, tam); ctx.restore();
  }
  ctx.restore();
}

// ---------- uso no navegador ----------
// iniciarAbertura(canvas, { base: 'assets/ingredientes/', aoTerminar })
export async function iniciarAbertura(canvas, { base = 'assets/ingredientes/', aoTerminar } = {}) {
  const imgs = {};
  await Promise.all(FRUTAS.map(n => new Promise(res => { const i = new Image(); i.onload = () => { imgs[n] = i; res(); }; i.onerror = res; i.src = base + n + '.svg'; })));
  const ctx = canvas.getContext('2d');
  let W, H, inicio = null, parar = false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function medir() { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  medir(); addEventListener('resize', medir);
  function quadro(agora) {
    if (parar) return;
    if (inicio === null) inicio = agora;
    const t = (agora - inicio) / 1000;
    desenhar(ctx, Math.min(t, DURACAO + 30), W, H, imgs);
    if (t < DURACAO + 30) requestAnimationFrame(quadro); // depois dos 8 s, as frutas seguem boiando por 30 s e param
    if (t >= DURACAO && aoTerminar) { aoTerminar(); aoTerminar = null; }
  }
  requestAnimationFrame(quadro);
  return {
    pular() { inicio = performance.now() - DURACAO * 1000; },
    parar() { parar = true; },
    desenharParado() { desenhar(ctx, DURACAO, W, H, imgs); }
  };
}
