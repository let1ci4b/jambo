# Menu de acessibilidade (componente padrão)

Versão de 20/11/2026, criada no site da JAMBO. Vai em **todo site** (ver `claude/padrao-de-todo-site.md`, seção 1). O comportamento é o mesmo do menu do Café Vagar, mais o aviso na primeira visita.

## Como usar num site novo
1. Cole o script do passo A no `<head>`, **antes** do CSS e do JS da página (aplica as escolhas antes de pintar e evita "piscar").
2. Copie o `acessibilidade.js` (passo B) e chame `iniciarAcessibilidade()` em **todas** as páginas (inclusive privacidade, acessibilidade e 404).
3. Copie o CSS (passo C) e troque as variáveis pelas cores do cliente: `--roxo` (fundo do botão), `--noite` (fundo do painel), `--creme` (texto), `--lilas` e `--lilas-claro` (detalhes). Ajuste o bloco `html.contraste` com a versão de alto contraste da paleta do cliente.
4. **Tamanho do texto:** todo `font-size` do site precisa ser multiplicado por `var(--fs,1)`. Ex.: `font-size: calc(clamp(16px,1.15vw,18px) * var(--fs,1))`. Num site em `rem`, basta `html { font-size: calc(100% * var(--fs,1)) }`.
5. **Parar animações:** o site precisa respeitar a classe `reduzido` no `<html>` (ela também liga sozinha com "reduzir movimento" do aparelho). O menu recarrega a página ao mudar essa opção.
6. Canto do botão: escolha o que não brigar com outros elementos fixos (no JAMBO: embaixo à direita; sobe para 80 px quando a barra de total do celular aparece, com `body:has(.barra-total.on) .acess { bottom: 80px }`). No celular, o aviso fica no alto da tela.
7. Descreva o menu na Declaração de acessibilidade.
8. Conferir: axe sem violações com o menu aberto e com alto contraste; Tab chega no botão de qualquer ponto; Esc fecha e devolve o foco; as escolhas continuam depois de recarregar; com 160% nada transborda no celular.

## A. Script do `<head>`
```html
<script>
  (function(){var d=document.documentElement,a={};d.classList.add('js');try{a=JSON.parse(localStorage.getItem('acess')||'{}')}catch(e){}
  if(a.fs)d.style.setProperty('--fs',a.fs);['contraste','legivel','espaco','links'].forEach(function(k){if(a[k])d.classList.add(k)});
  if(a.parado)d.classList.add('pausado');if(a.parado||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reduzido');})();
</script>
```

## B. `acessibilidade.js`
```js
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
      <p class="acess-nota">As escolhas ficam salvas neste navegador. A tradução para Libras (VLibras) entra quando o site for publicado no endereço definitivo.</p>
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
```

## C. CSS
```css
/* ---------- menu de acessibilidade (padrão de todo site) ---------- */
.acess{position:fixed;right:16px;bottom:16px;z-index:65}
.acess-botao{display:inline-flex;align-items:center;gap:10px;min-height:56px;min-width:56px;padding:0 18px 0 15px;border-radius:var(--r-botao);border:2px solid var(--creme);background:var(--roxo);color:var(--creme);font:600 calc(15px * var(--fs,1))/1 var(--f-texto);cursor:pointer;box-shadow:0 6px 20px rgba(42,18,51,.35)}
.acess-botao:hover{background:var(--roxo-hover)}
.acess-botao:focus-visible{outline:3px solid var(--roxo);outline-offset:3px}
@media (max-width:1023px){.acess-rotulo{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.acess-botao{padding:0;justify-content:center}}
body:has(.barra-total.on) .acess{bottom:80px}
.acess-painel{position:absolute;right:0;bottom:68px;width:min(360px,calc(100vw - 32px));max-height:calc(100svh - 120px);overflow-y:auto;background:var(--noite);color:var(--creme);border-radius:20px;padding:var(--e3);display:grid;gap:var(--e1);box-shadow:0 18px 48px rgba(0,0,0,.35)}
.acess-painel :focus-visible{outline:3px solid var(--creme);outline-offset:2px}
.acess-cabeca{display:flex;justify-content:space-between;align-items:center;gap:var(--e2);margin-bottom:var(--e1)}
.acess-titulo{font:700 calc(20px * var(--fs,1))/1.2 var(--f-titulo)}
.acess-titulo:focus{outline:none}
.acess-fechar{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:0;background:transparent;color:var(--creme);cursor:pointer}
.acess-fechar:hover{background:var(--fio-claro)}
.acess-linha{display:flex;align-items:center;justify-content:space-between;gap:var(--e2);padding:var(--e1) 0;border-bottom:1px solid var(--fio-claro)}
.acess-grupo{display:flex;align-items:center;gap:var(--e1)}
.acess-grupo button{min-width:48px;min-height:44px;border-radius:12px;border:2px solid var(--lilas-claro);background:transparent;color:var(--creme);font:700 calc(16px * var(--fs,1))/1 var(--f-texto);cursor:pointer}
.acess-grupo button:disabled{opacity:.4;cursor:not-allowed}
.acess-valor{min-width:4ch;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
.acess-opcao{display:flex;align-items:center;justify-content:space-between;gap:var(--e2);width:100%;min-height:48px;padding:0 var(--e2);border-radius:12px;border:2px solid var(--fio-claro);background:transparent;color:var(--creme);font:600 calc(15px * var(--fs,1))/1.2 var(--f-texto);text-align:left;cursor:pointer}
.acess-opcao:hover{border-color:var(--lilas-claro)}
.acess-chave{flex:none;width:40px;height:24px;border-radius:999px;background:var(--fio-claro);position:relative;transition:background-color .15s}
.acess-chave::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--creme);transition:transform .15s}
.acess-opcao[aria-pressed="true"]{border-color:var(--creme)}
.acess-opcao[aria-pressed="true"] .acess-chave{background:var(--lilas)}
.acess-opcao[aria-pressed="true"] .acess-chave::after{transform:translateX(16px)}
.acess-zerar{min-height:44px;margin-top:var(--e1);border-radius:var(--r-botao);border:2px solid var(--creme);background:transparent;color:var(--creme);font:600 calc(15px * var(--fs,1))/1 var(--f-texto);cursor:pointer}
.acess-nota{font-size:calc(13px * var(--fs,1));line-height:1.4;color:var(--lilas-claro)}
/* aviso na primeira visita */
.acess-aviso{position:fixed;right:16px;bottom:84px;z-index:66;width:min(360px,calc(100vw - 32px));background:var(--creme);color:var(--roxo);border:2px solid var(--roxo);border-radius:20px;padding:var(--e3);box-shadow:0 18px 48px rgba(42,18,51,.35);display:grid;gap:var(--e1)}
.js:not(.reduzido) .acess-aviso{animation:hero-sobe .6s 3.6s cubic-bezier(.22,1,.36,1) both}
@keyframes hero-sobe{from{opacity:0;transform:translateY(24px)}}
.acess-aviso-t{font-size:calc(18px * var(--fs,1))}
.acess-aviso-acoes{display:flex;flex-wrap:wrap;gap:var(--e1);margin-top:var(--e1)}
.acess-aviso-acoes button{min-height:44px;padding:0 18px;border-radius:var(--r-botao);border:2px solid var(--roxo);font:600 calc(15px * var(--fs,1))/1 var(--f-texto);cursor:pointer}
.acess-aviso-sim{background:var(--roxo);color:var(--creme)}
.acess-aviso-nao{background:transparent;color:var(--roxo)}
.acess-aviso :focus-visible{outline:3px solid var(--roxo);outline-offset:3px}
@media (max-width:767px){.acess-aviso{bottom:auto;top:calc(var(--topo) + 12px)}}
@media print{.acess,.acess-aviso{display:none}}

/* opções do menu */
html.contraste{--creme:#FFFFFF;--roxo:#1B0824;--noite:#000000;--lilas-claro:#FFFFFF;--lilas:#F1E3FF;--roxo-08:rgba(0,0,0,.35);--fio-claro:rgba(255,255,255,.55);--roxo-80:#1B0824;--roxo-hover:#000000;--creme-hover:#FFFFFF}
html.contraste .abertura::after{background:rgba(0,0,0,.72)}
html.contraste img:not(.marca-logo):not([src$=".svg"]){filter:contrast(1.05)}
html.legivel{--f-titulo:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
html.legivel body,html.legivel h1,html.legivel h2,html.legivel h3{letter-spacing:.02em!important}
html.espaco p,html.espaco li,html.espaco label,html.espaco dd{line-height:1.9!important;letter-spacing:.03em;word-spacing:.12em}
html.links a{text-decoration:underline!important;text-decoration-thickness:3px!important;text-underline-offset:4px}
html.links a,html.links button:not(.acess-opcao){outline:3px dashed currentColor;outline-offset:2px}
```
