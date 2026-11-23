// Monte seu Jambo: arrastar e soltar (eventos de ponteiro: mouse e dedo), toque simples e teclado.
// O mesmo cálculo serve para o montador por lista (RF-13).
import cardapio from './dados.js';
import { corSabor } from './normalizar.js';
import { calcularMontador, calcularGelato, reais } from './calculo.js';
import { adicionar, avisar } from './carrinho.js';
import { camadas, camadasGelato } from './copo.js';

const M = cardapio.montador;
const G = cardapio.gelato;
const $ = (s, el = document) => el.querySelector(s);
const ehSabor = id => id.startsWith('g-');
const achar = id => ehSabor(id) ? G.sabores.find(s => 'g-' + s.id === id) : (M.toppings.find(t => t.id === id) ?? M.adicionais.find(a => a.id === id));
const nomeDe = id => achar(id)?.nome ?? id;
// o desenho já otimizado no build está no próprio botão da bancada
const desenhoDe = id => document.querySelector(`#montador .adesivo-btn[data-ing="${CSS.escape(id)}"] img`)?.getAttribute('src') ?? achar(id)?.desenho ?? '';
const tipoDe = id => ehSabor(id) ? 'sabores' : (M.toppings.some(t => t.id === id) ? 'toppings' : 'adicionais');

// ---------- painel do total (usado nos dois montadores) ----------
function mostrarPainel(painel, r, anunciar, vazio = 'só o açaí') {
  painel.querySelector('.total-v').textContent = reais(r.total);
  painel.querySelector('.kcal-v').textContent = r.kcal;
  painel.querySelector('.no-copo-v').textContent = r.detalhes || vazio;
  if (anunciar) painel.querySelector('.anuncio').textContent = `Total ${reais(r.total)}, cerca de ${r.kcal} calorias`;
  return r;
}
const atualizarPainel = (painel, estado, anunciar) => mostrarPainel(painel, calcularMontador(M, estado), anunciar);

export function iniciarMontador({ reduzido }) {
  const sec = $('#montador');
  const copo = $('#copo');
  const cobAcai = $('#coberturas'), cobGelato = $('#coberturas-gelato');
  const chips = $('#no-copo-lista');
  const painel = $('#painel-arrastar');
  const barra = $('#barra-total');
  let produto = 'acai';
  const estado = { base: 'tradicional', ml: 500, toppings: [], adicionais: [] };
  const gelato = { sabores: [], adicionais: [] };
  const listas = { acai: [], gelato: [] }; // ids na ordem em que entraram, um copo para cada produto
  const noCopo = () => listas[produto];
  const cob = () => (produto === 'acai' ? cobAcai : cobGelato);

  function calcular() {
    if (produto === 'acai') return calcularMontador(M, estado);
    return calcularGelato(cardapio, gelato.sabores.map(id => id.slice(2)), gelato.adicionais);
  }

  function render(anunciar = true) {
    const r = mostrarPainel(painel, calcular(), anunciar, produto === 'acai' ? 'só o açaí' : 'nenhum sabor ainda');
    barra.querySelector('.total-v').textContent = reais(r.total);
    barra.querySelector('.kcal-v').textContent = r.kcal;
    copo.dataset.base = estado.base;
    copo.dataset.ml = estado.ml;
    copo.dataset.bolas = gelato.sabores.length;
    sec.dataset.produto = produto;
    const lista = noCopo();
    document.querySelectorAll('#montador .adesivo-btn').forEach(b => {
      const dentro = lista.includes(b.dataset.ing);
      b.classList.toggle('no-copo', dentro);
      if (b.disabled) return;
      const nome = nomeDe(b.dataset.ing).toLowerCase();
      const alvo = produto === 'acai' ? 'no copo' : 'no copinho';
      b.setAttribute('aria-label', dentro ? `${nomeDe(b.dataset.ing)} já está ${alvo}` : ehSabor(b.dataset.ing) ? `Colocar uma bola de ${nome} no copinho` : `Colocar ${nome} ${alvo}`);
    });
  }

  // redesenha as coberturas; só o ingrediente novo "cai" no copo
  function desenharCopo(novo, de) {
    const lista = noCopo();
    const c = produto === 'acai' ? camadas(lista) : camadasGelato(gelato.sabores.map(id => id.slice(2)), gelato.adicionais);
    cob().innerHTML = c.map(x => `<g data-ing="${x.id}">${x.svg}</g>`).join('');
    chips.innerHTML = lista.map(id => `<li><button type="button" data-ing="${id}" aria-label="Tirar ${nomeDe(id).toLowerCase()} do ${produto === 'acai' ? 'copo' : 'copinho'}">${ehSabor(id) ? `<span class="chip-bola${corSabor(achar(id))} aria-hidden="true"></span>` : `<img src="${desenhoDe(id)}" alt="" width="28" height="28">`}${nomeDe(id)}<span class="x" aria-hidden="true">×</span></button></li>`).join('');
    chips.dataset.vazio = produto === 'acai' ? 'Seu copo está só com o açaí. Toque nos ingredientes para colocar.' : 'Escolha de 1 a 3 sabores para o seu copinho.';
    if (!novo || reduzido) return;
    const g = cob().querySelector(`g[data-ing="${novo}"]`);
    if (!g) return;
    let dy = -90;
    if (de) { const svg = copo.querySelector(produto === 'acai' ? '.so-acai .copo-svg' : '.so-gelato .copo-svg'); const r = svg.getBoundingClientRect(); dy = Math.max(-200, (de.y - (r.top + r.height * .33)) / (r.width / 400)); }
    g.animate([{ transform: `translateY(${dy}px)`, opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: .7 }, { transform: 'translateY(-6px)', offset: .85 }, { transform: 'none', opacity: 1 }],
      { duration: 520, easing: 'cubic-bezier(.33,1,.68,1)' });
  }

  sec.addEventListener('change', e => {
    if (e.target.name === 'base') estado.base = e.target.value;
    if (e.target.name === 'tamanho') estado.ml = Number(e.target.value);
    if (e.target.name === 'produto') {
      produto = e.target.value;
      render(false);
      desenharCopo(null);
      painel.querySelector('.anuncio').textContent = produto === 'acai' ? 'Montando açaí.' : 'Montando gelato: escolha de 1 a 3 sabores.';
      return;
    }
    render();
  });

  // ---------- colocar e tirar ----------
  function colocar(id, de) {
    const lista = noCopo();
    const anuncio = painel.querySelector('.anuncio');
    if (lista.includes(id)) { anuncio.textContent = `${nomeDe(id)} já está no ${produto === 'acai' ? 'copo' : 'copinho'}.`; return false; }
    if (ehSabor(id) && gelato.sabores.length >= 3) { anuncio.textContent = 'O copinho já tem 3 sabores. Tire um para trocar.'; avisar('O copinho vai até 3 sabores'); return false; }
    const alvo = produto === 'acai' ? estado : gelato;
    if (!alvo[tipoDe(id)] || !achar(id)) return false; // ex.: topping no copinho de gelato
    lista.push(id);
    alvo[tipoDe(id)].push(id);
    desenharCopo(id, de);
    render();
    return true;
  }
  function tirar(id, focarChip) {
    const lista = noCopo();
    const k = lista.indexOf(id); if (k < 0) return;
    lista.splice(k, 1);
    const alvo = (produto === 'acai' ? estado : gelato)[tipoDe(id)]; alvo.splice(alvo.indexOf(id), 1);
    const g = cob().querySelector(`g[data-ing="${id}"]`);
    const fim = () => { desenharCopo(null); render(); if (focarChip) (chips.querySelectorAll('button')[Math.min(k, lista.length - 1)] ?? document.querySelector(`#montador .adesivo-btn[data-ing="${id}"]`))?.focus({ preventScroll: true }); };
    if (g && !reduzido) g.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 200, easing: 'ease-in' }).finished.then(fim); else fim();
  }
  [cobAcai, cobGelato].forEach(c => c.addEventListener('click', e => { const g = e.target.closest('g[data-ing]'); if (g) tirar(g.dataset.ing, false); }));
  chips.addEventListener('click', e => { const b = e.target.closest('button[data-ing]'); if (b) tirar(b.dataset.ing, true); });
  function recomecar() {
    listas[produto].length = 0;
    if (produto === 'acai') { estado.toppings = []; estado.adicionais = []; } else { gelato.sabores = []; gelato.adicionais = []; }
    desenharCopo(null); render();
  }
  $('.recomecar', painel).addEventListener('click', recomecar);

  function paraPedido(botao) {
    const r = calcular();
    if (produto === 'gelato' && !r.n) { painel.querySelector('.anuncio').textContent = 'Escolha pelo menos 1 sabor.'; avisar('Escolha pelo menos 1 sabor'); return; }
    adicionar({ id: produto === 'acai' ? 'montador' : 'gelato-montado', nome: r.nome, detalhes: r.detalhes, linhas: r.linhas, preco: r.total }, botao);
    confirmar(botao);
  }
  $('.colocar', painel).addEventListener('click', e => paraPedido(e.currentTarget));
  $('.colocar-barra', barra).addEventListener('click', e => paraPedido(e.currentTarget));

  // ---------- arrastar + toque simples + Enter ----------
  // Mouse e caneta: eventos de ponteiro. Dedo: segurar ~0,2 s e arrastar (assim a página continua rolando
  // quando a pessoa só passa o dedo pelos adesivos). O toque simples coloca no copo (caminho principal no celular).
  let arrasto = null;
  const sobreCopo = (x, y) => { const r = copo.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
  function comecar(x, y) {
    if (noCopo().includes(arrasto.id)) { arrasto = null; return; }
    let c;
    if (ehSabor(arrasto.id)) { c = document.createElement('div'); c.innerHTML = arrasto.btn.querySelector('.bola-ico').innerHTML; }
    else { c = document.createElement('img'); c.src = desenhoDe(arrasto.id); c.alt = ''; }
    c.className = 'clone';
    document.body.appendChild(c);
    arrasto.clone = c; arrasto.btn.classList.remove('segurando');
    mover(x, y);
  }
  function mover(x, y) {
    arrasto.clone.style.transform = `translate(${x - 44}px, ${y - 44}px) scale(1.1)`;
    copo.classList.toggle('alvo', sobreCopo(x, y));
  }
  function terminar(x, y, valeu) {
    const { clone, btn, id } = arrasto; arrasto = null;
    btn.classList.remove('segurando');
    if (!clone) return; // foi só um toque: o "click" cuida
    btn.dataset.arrastou = '1';
    setTimeout(() => delete btn.dataset.arrastou, 80);
    copo.classList.remove('alvo');
    if (valeu && sobreCopo(x, y) && colocar(id, { x, y })) { clone.remove(); return; }
    const r = (btn.querySelector('img') ?? btn.querySelector('.bola-ico')).getBoundingClientRect(); // volta para a bancada
    clone.animate([{ transform: clone.style.transform }, { transform: `translate(${r.left + r.width / 2 - 44}px, ${r.top + r.height / 2 - 44}px) scale(${r.width / 88})` }], { duration: reduzido ? 1 : 300, easing: 'cubic-bezier(.33,1,.68,1)' })
      .finished.then(() => clone.remove());
  }
  document.querySelectorAll('#montador .adesivo-btn').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      if (btn.disabled || e.button > 0 || e.pointerType === 'touch') return;
      arrasto = { btn, id: btn.dataset.ing, x0: e.clientX, y0: e.clientY, clone: null, pid: e.pointerId };
    });
    btn.addEventListener('touchstart', e => {
      if (btn.disabled || e.touches.length > 1) return;
      const t = e.touches[0];
      arrasto = { btn, id: btn.dataset.ing, x0: t.clientX, y0: t.clientY, clone: null, toque: true, pronto: false };
      arrasto.timer = setTimeout(() => { if (arrasto && arrasto.btn === btn) { arrasto.pronto = true; btn.classList.add('segurando'); } }, 180);
    }, { passive: true });
    btn.addEventListener('contextmenu', e => { if (arrasto?.toque) e.preventDefault(); });
    btn.addEventListener('click', () => {
      if (btn.dataset.arrastou) { delete btn.dataset.arrastou; return; }
      colocar(btn.dataset.ing, null);
    });
  });
  addEventListener('pointermove', e => {
    if (!arrasto || arrasto.toque || e.pointerId !== arrasto.pid) return;
    if (!arrasto.clone) {
      if (Math.hypot(e.clientX - arrasto.x0, e.clientY - arrasto.y0) < 8) return;
      comecar(e.clientX, e.clientY);
      if (!arrasto) return;
    }
    mover(e.clientX, e.clientY);
  });
  addEventListener('pointerup', e => { if (arrasto && !arrasto.toque && e.pointerId === arrasto.pid) terminar(e.clientX, e.clientY, true); });
  addEventListener('pointercancel', e => { if (arrasto && !arrasto.toque && e.pointerId === arrasto.pid) terminar(0, 0, false); });
  addEventListener('touchmove', e => {
    if (!arrasto?.toque) return;
    const t = e.touches[0];
    if (!arrasto.pronto) { // mexeu antes de segurar: é rolagem
      if (Math.hypot(t.clientX - arrasto.x0, t.clientY - arrasto.y0) > 8) { clearTimeout(arrasto.timer); arrasto.btn.classList.remove('segurando'); arrasto = null; }
      return;
    }
    if (e.cancelable) e.preventDefault();
    if (!arrasto.clone) { comecar(t.clientX, t.clientY); if (!arrasto) return; }
    mover(t.clientX, t.clientY);
  }, { passive: false });
  const fimToque = e => {
    if (!arrasto?.toque) return;
    clearTimeout(arrasto.timer);
    const t = e.changedTouches[0];
    terminar(t.clientX, t.clientY, e.type === 'touchend');
  };
  addEventListener('touchend', fimToque);
  addEventListener('touchcancel', fimToque);

  // ---------- abas (só abaixo de 1024 px) ----------
  const abas = [...document.querySelectorAll('.abas [role="tab"]')];
  const paineis = abas.map(a => document.getElementById(a.getAttribute('aria-controls')));
  const mq = matchMedia('(max-width: 1023px)');
  function escolherAba(i, focar) {
    abas.forEach((a, k) => { a.setAttribute('aria-selected', k === i); a.tabIndex = k === i ? 0 : -1; });
    paineis.forEach((p, k) => { p.hidden = mq.matches && k !== i; });
    if (focar) abas[i].focus();
  }
  abas.forEach((a, i) => {
    a.addEventListener('click', () => escolherAba(i));
    a.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); escolherAba((i + 1) % 2, true); } });
  });
  function modoAbas() {
    paineis.forEach(p => {
      if (mq.matches) { p.setAttribute('role', 'tabpanel'); } else { p.removeAttribute('role'); p.hidden = false; }
    });
    if (mq.matches) escolherAba(abas.findIndex(a => a.getAttribute('aria-selected') === 'true'));
  }
  mq.addEventListener('change', modoAbas); modoAbas();

  // ---------- barra fixa do total no celular ----------
  new IntersectionObserver(([e]) => barra.classList.toggle('on', e.isIntersecting), { rootMargin: '-30% 0px -10% 0px' }).observe($('.bancada'));
  // o botão da barra só entra no Tab quando ela aparece
  new MutationObserver(() => { const on = barra.classList.contains('on') && getComputedStyle(barra).display !== 'none'; barra.setAttribute('aria-hidden', String(!on)); barra.querySelector('button').tabIndex = on ? 0 : -1; })
    .observe(barra, { attributes: true, attributeFilter: ['class'] });

  render(false);
}

// ---------- RF-13: montar pela lista (açaí ou gelato) ----------
export function iniciarLista() {
  const form = $('#lista-form');
  const painel = $('#painel-lista');
  const marcados = n => [...form.querySelectorAll(`[name="${n}"]:checked`)].map(i => i.value);
  const produto = () => form.querySelector('[name="l-produto"]:checked').value;
  function calcular() {
    if (produto() === 'gelato') return calcularGelato(cardapio, marcados('l-sabor'), marcados('l-adicional'));
    return calcularMontador(M, {
      base: form.querySelector('[name="l-base"]:checked').value,
      ml: Number(form.querySelector('[name="l-tamanho"]:checked').value),
      toppings: marcados('l-topping'), adicionais: marcados('l-adicional')
    });
  }
  function atualizar(anunciar) {
    form.dataset.produto = produto();
    // gelato: no máximo 3 sabores
    const n = marcados('l-sabor').length;
    form.querySelectorAll('[name="l-sabor"]').forEach(i => { const esg = G.sabores.find(s => s.id === i.value).esgotado; i.disabled = esg || (!i.checked && n >= 3); });
    mostrarPainel(painel, calcular(), anunciar, produto() === 'acai' ? 'só o açaí' : 'nenhum sabor ainda');
  }
  form.addEventListener('change', () => atualizar(true));
  $('.colocar', painel).addEventListener('click', e => {
    const r = calcular();
    if (produto() === 'gelato' && !r.n) { painel.querySelector('.anuncio').textContent = 'Escolha pelo menos 1 sabor.'; avisar('Escolha pelo menos 1 sabor'); form.querySelector('[name="l-sabor"]:not(:disabled)')?.focus(); return; }
    adicionar({ id: produto() === 'acai' ? 'montador' : 'gelato-montado', nome: r.nome, detalhes: r.detalhes, linhas: r.linhas, preco: r.total }, e.currentTarget);
    confirmar(e.currentTarget);
  });
  atualizar(false);
}

// botões "Montar meu açaí" e "Montar meu copinho": já abrem o montador no produto certo
export function ligarAtalhos() {
  document.querySelectorAll('.ir-montar').forEach(a => a.addEventListener('click', () => {
    const p = a.dataset.produto;
    for (const n of ['produto', 'l-produto']) {
      const r = document.querySelector(`input[name="${n}"][value="${p}"]`);
      if (r && !r.checked) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    }
  }));
}

// "✓ Adicionado" por 1,5 s
export function confirmar(botao) {
  if (botao.classList.contains('ok')) return;
  const antes = botao.innerHTML;
  botao.classList.add('ok');
  if (botao.classList.contains('btn-icone')) botao.innerHTML = '<span aria-hidden="true">✓</span><span class="so-leitor">Adicionado</span>';
  else botao.textContent = '✓ Adicionado';
  setTimeout(() => { botao.innerHTML = antes; botao.classList.remove('ok'); }, 1500);
}
