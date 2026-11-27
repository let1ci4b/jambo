// Menu de acessibilidade (padrão de todos os sites da Letícia Beatriz)
// - Botão fixo em todas as páginas, alcançável de qualquer ponto (Tab ou toque).
// - Aviso na primeira visita: convida a ajustar a página; não bloqueia nada e não some sozinho.
// - Opções: tamanho do texto (90% a 160%), alto contraste, parar animações, fonte mais legível,
//   mais espaço entre linhas, destacar links e botões, voltar ao padrão.
// - As escolhas ficam salvas neste navegador (localStorage "acess"); o <head> aplica antes de pintar.
// - Esc fecha; o foco volta ao botão.

const CHAVE = 'acess';
const PADRAO = { fs: 1, contraste: false, parado: false, legivel: false, espaco: false, links: false };
const OPCOES = [
  ['contraste', 'Alto contraste'],
  ['parado', 'Parar animações e vídeos'],
  ['legivel', 'Fonte mais legível'],
  ['espaco', 'Mais espaço entre linhas'],
  ['links', 'Destacar links e botões']
];

function ler() { try { return { ...PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') }; } catch { return { ...PADRAO }; } }
function salvar(e) { try { localStorage.setItem(CHAVE, JSON.stringify(e)); } catch { /* sem armazenamento: vale só nesta visita */ } }
function aplicar(e) {
  const d = document.documentElement;
  d.style.setProperty('--fs', e.fs);
  for (const [k] of OPCOES) if (k !== 'parado') d.classList.toggle(k, !!e[k]);
}

const ICONE = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><circle cx="12" cy="4.2" r="2.2" fill="currentColor"/><path d="M4 8.2c2.6.8 5.3 1.2 8 1.2s5.4-.4 8-1.2M12 9.4v5.2m0 0-3.4 6.6m3.4-6.6 3.4 6.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

export function iniciarAcessibilidade() {
  let estado = ler();
  aplicar(estado);

  const caixa = document.createElement('div');
  caixa.className = 'acess';
  caixa.innerHTML = `
    <button class="acess-botao" type="button" aria-expanded="false" aria-controls="acess-painel">${ICONE}<span class="acess-rotulo">Acessibilidade</span></button>
    <div class="acess-painel" id="acess-painel" role="region" aria-labelledby="acess-titulo" hidden>
      <div class="acess-cabeca"><p class="acess-titulo" id="acess-titulo" tabindex="-1">Ajuste a página do seu jeito</p>
        <button class="acess-fechar" type="button" aria-label="Fechar opções de acessibilidade"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div>
      <div class="acess-linha"><span id="acess-rot-texto">Tamanho do texto</span>
        <div class="acess-grupo" role="group" aria-labelledby="acess-rot-texto">
          <button type="button" data-acao="menor" aria-label="Diminuir texto">A−</button>
          <output class="acess-valor" aria-live="polite">100%</output>
          <button type="button" data-acao="maior" aria-label="Aumentar texto">A+</button>
        </div></div>
      ${OPCOES.map(([k, rot]) => `<button type="button" class="acess-opcao" data-opcao="${k}" aria-pressed="false"><span>${rot}</span><span class="acess-chave" aria-hidden="true"></span></button>`).join('')}
      <p class="acess-nota" id="acess-nota-parado">"Parar animações" recarrega a página.</p>
      <button type="button" class="acess-zerar" data-acao="zerar">Voltar ao padrão</button>
      <p class="acess-nota">As escolhas ficam salvas neste navegador.</p>
    </div>`;
  document.body.appendChild(caixa);

  // aviso na primeira visita (logo no começo da página, para o leitor de tela encontrar cedo)
  let aviso = null;
  let viuAviso = false;
  try { viuAviso = localStorage.getItem(CHAVE + '-aviso') === '1'; } catch { viuAviso = true; }
  if (!viuAviso) {
    aviso = document.createElement('section');
    aviso.className = 'acess-aviso';
    aviso.setAttribute('aria-labelledby', 'acess-aviso-t');
    aviso.innerHTML = `<p class="acess-aviso-t" id="acess-aviso-t"><strong>Quer ajustar a página?</strong></p>
      <p>Você pode aumentar as letras, ligar o alto contraste ou parar as animações. O botão de acessibilidade fica sempre no canto de baixo, à direita.</p>
      <div class="acess-aviso-acoes"><button type="button" class="acess-aviso-sim">Ajustar agora</button><button type="button" class="acess-aviso-nao">Agora não</button></div>`;
    const pular = document.querySelector('.pular-link');
    (pular ? pular.after(aviso) : document.body.prepend(aviso));
  }
  const fecharAviso = () => { if (!aviso) return; aviso.remove(); aviso = null; try { localStorage.setItem(CHAVE + '-aviso', '1'); } catch { /* ok */ } };

  const botao = caixa.querySelector('.acess-botao');
  const painel = caixa.querySelector('.acess-painel');
  const valor = caixa.querySelector('.acess-valor');

  function mostrar() {
    valor.textContent = Math.round(estado.fs * 100) + '%';
    caixa.querySelectorAll('.acess-opcao').forEach(b => b.setAttribute('aria-pressed', String(!!estado[b.dataset.opcao])));
    caixa.querySelector('[data-acao="menor"]').disabled = estado.fs <= .9;
    caixa.querySelector('[data-acao="maior"]').disabled = estado.fs >= 1.6;
  }
  function abrir() {
    fecharAviso();
    painel.hidden = false; botao.setAttribute('aria-expanded', 'true');
    mostrar();
    caixa.querySelector('.acess-titulo').focus();
  }
  function fechar(devolver = true) {
    painel.hidden = true; botao.setAttribute('aria-expanded', 'false');
    if (devolver) botao.focus();
  }
  botao.addEventListener('click', () => (painel.hidden ? abrir() : fechar()));
  caixa.querySelector('.acess-fechar').addEventListener('click', () => fechar());
  caixa.addEventListener('keydown', e => { if (e.key === 'Escape' && !painel.hidden) { e.stopPropagation(); fechar(); } });
  document.addEventListener('click', e => { if (!painel.hidden && e.target.isConnected && !caixa.contains(e.target)) fechar(false); });

  painel.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.acao === 'maior') estado.fs = Math.min(1.6, Math.round((estado.fs + .1) * 10) / 10);
    if (b.dataset.acao === 'menor') estado.fs = Math.max(.9, Math.round((estado.fs - .1) * 10) / 10);
    if (b.dataset.acao === 'zerar') {
      const recarregar = estado.parado;
      estado = { ...PADRAO }; salvar(estado); aplicar(estado); mostrar();
      if (recarregar) { lembrarAberto('zerar'); location.reload(); }
      return;
    }
    if (b.dataset.opcao) {
      estado[b.dataset.opcao] = !estado[b.dataset.opcao];
      if (b.dataset.opcao === 'parado') { salvar(estado); lembrarAberto('parado'); location.reload(); return; }
    }
    salvar(estado); aplicar(estado); mostrar();
  });

  aviso?.querySelector('.acess-aviso-sim').addEventListener('click', e => { e.stopPropagation(); abrir(); });
  aviso?.querySelector('.acess-aviso-nao').addEventListener('click', () => { fecharAviso(); botao.focus(); });

  // depois de recarregar por "Parar animações", o menu volta aberto no mesmo lugar
  function lembrarAberto(onde) { try { sessionStorage.setItem(CHAVE + '-reabrir', onde); } catch { /* ok */ } }
  try {
    const onde = sessionStorage.getItem(CHAVE + '-reabrir');
    if (onde) {
      sessionStorage.removeItem(CHAVE + '-reabrir');
      abrir();
      caixa.querySelector(onde === 'zerar' ? '.acess-zerar' : '[data-opcao="parado"]').focus();
    }
  } catch { /* ok */ }
}
