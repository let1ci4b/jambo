// Montar combo: escolher base e toppings de cada açaí, a bebida (Solo Sun) ou o sabor do shake (Sweet Escape).
import cardapio from '../content/cardapio.json';
import { calcularCombo, reais } from './calculo.js';
import { adicionar } from './carrinho.js';
import { confirmar } from './montador.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const M = cardapio.montador;

export function iniciarCombos() {
  const dlg = $('#combo-dialogo'), form = $('#combo-form'), partesEl = $('#combo-partes');
  let combo = null, quemAbriu = null;

  function montar(c) {
    combo = c;
    $('#combo-t').textContent = `Montar ${c.nome}`;
    $('#combo-desc').textContent = `${c.descricao} ${cardapio.combos.regra}`;
    let nAcai = 0; const totalAcai = c.partes.filter(p => p.tipo === 'acai').length;
    partesEl.innerHTML = c.partes.map((p, i) => {
      if (p.tipo === 'acai') {
        nAcai++;
        const titulo = `${totalAcai > 1 ? `Açaí ${nAcai}` : 'Açaí'} · ${p.ml} ml`;
        return `<fieldset class="parte" data-i="${i}"><legend>${titulo}</legend>
          <p class="parte-t">Base</p><div class="faixa">${M.bases.map((b, k) => `<label class="pilula-radio"><input type="radio" name="p${i}-base" value="${b.id}"${k === 0 ? ' checked' : ''}><span>${esc(b.nome)}</span></label>`).join('')}</div>
          <p class="parte-t">Toppings <span class="conta-tops" id="conta-${i}">0 de ${M.toppingsGratis} inclusos</span></p>
          <div class="caixas">${M.toppings.map(t => `<label class="caixa"><input type="checkbox" name="p${i}-top" value="${t.id}"${t.esgotado ? ' disabled' : ''}><span>${esc(t.nome)}</span></label>`).join('')}</div>
          <details class="parte-adis"><summary>Adicionais (+${reais(Math.round(M.precoExtra * 100))} cada)</summary>
          <div class="caixas">${M.adicionais.map(a => `<label class="caixa"><input type="checkbox" name="p${i}-adi" value="${a.id}"${a.esgotado ? ' disabled' : ''}><span>${esc(a.nome)}</span></label>`).join('')}</div></details>
        </fieldset>`;
      }
      if (p.tipo === 'bebida') {
        return `<fieldset class="parte" data-i="${i}"><legend>Bebida</legend><div class="caixas">${cardapio.bebidas.filter(b => !b.esgotado).map(b => `<label class="caixa"><input type="radio" name="p${i}-esc" value="${b.id}"><span>${esc(b.nome)}</span></label>`).join('')}</div></fieldset>`;
      }
      return `<fieldset class="parte" data-i="${i}"><legend>Milkshake pequeno · ${p.tamanho}</legend><div class="caixas">${cardapio.milkshakes.itens.filter(s => !s.esgotado).map(s => `<label class="caixa"><input type="radio" name="p${i}-esc" value="${s.id}"><span>${esc(s.nome)}</span></label>`).join('')}</div></fieldset>`;
    }).join('');
    $('#combo-erro').hidden = true;
    atualizar();
  }

  function ler() {
    return combo.partes.map((p, i) => p.tipo === 'acai'
      ? { base: form.querySelector(`[name="p${i}-base"]:checked`)?.value, toppings: [...form.querySelectorAll(`[name="p${i}-top"]:checked`)].map(x => x.value), adicionais: [...form.querySelectorAll(`[name="p${i}-adi"]:checked`)].map(x => x.value) }
      : { id: form.querySelector(`[name="p${i}-esc"]:checked`)?.value });
  }

  function atualizar() {
    const esc2 = ler();
    combo.partes.forEach((p, i) => {
      if (p.tipo !== 'acai') return;
      const n = esc2[i].toppings.length, g = M.toppingsGratis;
      $(`#conta-${i}`).textContent = n <= g ? `${n} de ${g} inclusos` : `${g} inclusos + ${n - g} extra${n - g > 1 ? 's' : ''}`;
    });
    $('#combo-total').textContent = reais(calcularCombo(cardapio, combo, esc2).total);
  }
  form.addEventListener('change', atualizar);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const esc2 = ler();
    const falta = combo.partes.findIndex((p, i) => p.tipo !== 'acai' && !esc2[i].id);
    if (falta >= 0) {
      const er = $('#combo-erro'); er.hidden = false;
      er.textContent = `Escolha ${combo.partes[falta].tipo === 'bebida' ? 'a bebida' : 'o sabor do milkshake'}.`;
      form.querySelector(`[name="p${falta}-esc"]`).focus();
      return;
    }
    const r = calcularCombo(cardapio, combo, esc2);
    dlg.close();
    adicionar({ id: 'combo-' + combo.id, nome: 'Combo ' + combo.nome, detalhes: r.detalhes, linhas: r.linhas, preco: r.total }, quemAbriu);
    if (quemAbriu) confirmar(quemAbriu);
  });

  document.addEventListener('click', e => {
    const b = e.target.closest('.montar-combo');
    if (!b) return;
    quemAbriu = b;
    montar(cardapio.combos.itens.find(c => c.id === b.dataset.combo));
    dlg.showModal();
    $('#combo-t').focus();
  });
  dlg.querySelector('[data-fechar]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { if (!document.getElementById('carrinho').open) quemAbriu?.focus(); });
}
