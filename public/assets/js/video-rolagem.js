// JAMBO · "O bowl se monta": vídeo conduzido pela rolagem, em quadros WebP.
// iniciarVideoRolagem(canvas, trilha, { base, total, aoProgresso })
// Carrega o quadro 1, depois 1 a cada 8 e depois o resto. Desenha só quando o quadro muda.
// O canvas é decorativo (aria-hidden); o texto da seção está em HTML.

export function iniciarVideoRolagem(canvas, trilha, { base = 'assets/video/montar/d/', total = 120, aoProgresso } = {}) {
  const ctx = canvas.getContext('2d');
  const quadros = new Array(total).fill(null);
  const nome = i => base + String(i + 1).padStart(3, '0') + '.webp';
  let atual = -1, pedido = 0, W = 0, H = 0, quadro = false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function carregar(i) {
    return new Promise(res => {
      if (quadros[i]) return res();
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { quadros[i] = img; if (i === pedido || atual < 0) desenhar(true); res(); };
      img.onerror = res;
      img.src = nome(i);
    });
  }
  // ordem: 1, depois 1 a cada 8, depois o resto
  (async () => {
    await carregar(0);
    const passo = [];
    for (let i = 8; i < total; i += 8) passo.push(i);
    passo.push(total - 1);
    await Promise.all(passo.map(carregar));
    for (let i = 1; i < total; i++) if (!quadros[i]) await carregar(i);
  })();

  // quadro carregado mais próximo do pedido (enquanto o resto chega)
  function maisProximo(i) {
    for (let d = 0; d < total; d++) {
      if (quadros[i - d]) return i - d;
      if (quadros[i + d]) return i + d;
    }
    return -1;
  }

  function medir() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w; H = h; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    atual = -1; desenhar(true);
  }

  function desenhar(forcar) {
    const i = maisProximo(pedido);
    if (i < 0 || (!forcar && i === atual)) return;
    atual = i;
    const img = quadros[i];
    // object-fit: cover
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }

  function progresso() {
    const r = trilha.getBoundingClientRect();
    const percurso = r.height - innerHeight;
    return percurso > 0 ? Math.min(1, Math.max(0, -r.top / percurso)) : 0;
  }

  function aoRolar() {
    if (quadro) return;
    quadro = true;
    requestAnimationFrame(() => {
      quadro = false;
      const p = progresso();
      pedido = Math.min(total - 1, Math.round(p * (total - 1)));
      desenhar(false);
      if (aoProgresso) aoProgresso(p);
    });
  }

  new ResizeObserver(medir).observe(canvas);
  medir();
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  return { atualizar: aoRolar };
}
