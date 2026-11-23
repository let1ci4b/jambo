// Cálculos do cardápio. Tudo em centavos (inteiros) para não errar arredondamento.
// Sempre a partir da tabela (content/cardapio/), nunca somado na mão.

export const centavos = reais => Math.round(reais * 100);

export function reais(c) {
  return 'R$ ' + (c / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// estado: { base: 'tradicional', ml: 500, toppings: ['banana', ...], adicionais: ['creme-avela', ...] }
export function calcularMontador(m, estado) {
  const base = m.bases.find(b => b.id === estado.base) ?? m.bases[0];
  const tam = m.tamanhos.find(t => t.ml === Number(estado.ml)) ?? m.tamanhos[1];
  const tops = estado.toppings.map(id => m.toppings.find(t => t.id === id)).filter(Boolean);
  const adis = estado.adicionais.map(id => m.adicionais.find(a => a.id === id)).filter(Boolean);
  const extra = centavos(m.precoExtra);
  const pagos = Math.max(0, tops.length - m.toppingsGratis);
  const total = centavos(tam.preco) + pagos * extra + adis.length * extra;
  const kcal = (base.kcal[String(tam.ml)] ?? 0)
    + tops.reduce((s, t) => s + t.kcal, 0)
    + adis.reduce((s, a) => s + a.kcal, 0);
  const nome = `Monte seu Jambo · açaí ${tam.ml} ml`;
  const tTxt = tops.map(t => t.nome.toLowerCase()).join(', ');
  const aTxt = adis.map(a => a.nome.toLowerCase()).join(', ');
  let detalhes = `${base.nome.toLowerCase()}${tTxt ? ': ' + tTxt : ''}`;
  if (aTxt) detalhes += ' + ' + aTxt;
  const linhas = [`Base: ${base.nome.toLowerCase()}`, `Toppings: ${tTxt || 'nenhum'}${pagos ? ` (${pagos} extra${pagos > 1 ? 's' : ''})` : ''}`];
  if (aTxt) linhas.push(`Adicionais: ${aTxt}`);
  return { total, kcal, nome, detalhes, linhas, toppingsPagos: pagos };
}

// Gelato montado: preço do copinho (1, 2 ou 3 sabores) + adicionais a R$ 3,00
export function calcularGelato(c, sabores, adicionais = []) {
  const g = c.gelato, m = c.montador;
  const sab = sabores.map(id => g.sabores.find(s => s.id === id)).filter(Boolean);
  const adis = adicionais.map(id => m.adicionais.find(a => a.id === id)).filter(Boolean);
  const total = (sab.length ? precoCopinho(g, sabores) : 0) + adis.length * centavos(m.precoExtra);
  const kcal = sab.reduce((t, s) => t + (s.kcal ?? 0), 0) + adis.reduce((t, a) => t + a.kcal, 0);
  const sTxt = sab.map(s => s.nome.toLowerCase()).join(', ');
  const aTxt = adis.map(a => a.nome.toLowerCase()).join(', ');
  const nome = `Gelato ${sab.length} ${sab.length === 1 ? 'sabor' : 'sabores'}`;
  const linhas = [`Sabores: ${sTxt || 'nenhum'}`];
  if (aTxt) linhas.push(`Adicionais: ${aTxt}`);
  return { total, kcal, nome, detalhes: sTxt + (aTxt ? ' + ' + aTxt : ''), linhas, n: sab.length };
}

export function precoCopinho(g, ids) {
  const sabores = ids.map(id => g.sabores.find(s => s.id === id)).filter(Boolean);
  if (sabores.length === 1) return centavos(sabores[0].preco);
  if (sabores.length === 2) return centavos(g.doisSabores);
  if (sabores.length === 3) return centavos(g.tresSabores);
  return 0;
}

// Combo: preço do combo + extras de cada açaí (mesma regra do montador).
// escolha: [{ tipo:'acai', base, toppings:[], adicionais:[] } | { tipo:'bebida', id } | { tipo:'milkshake', id }]
export function calcularCombo(c, combo, escolha) {
  const m = c.montador, extra = centavos(m.precoExtra);
  let total = centavos(combo.preco);
  const partes = [];
  let nAcai = 0;
  combo.partes.forEach((p, i) => {
    const e = escolha[i] ?? {};
    if (p.tipo === 'acai') {
      nAcai++;
      const base = m.bases.find(b => b.id === e.base) ?? m.bases[0];
      const tops = (e.toppings ?? []).map(id => m.toppings.find(t => t.id === id)).filter(Boolean);
      const adis = (e.adicionais ?? []).map(id => m.adicionais.find(a => a.id === id)).filter(Boolean);
      total += Math.max(0, tops.length - m.toppingsGratis) * extra + adis.length * extra;
      let txt = tops.map(t => t.nome.toLowerCase()).join(', ') || 'sem toppings';
      if (adis.length) txt += ' + ' + adis.map(a => a.nome.toLowerCase()).join(', ');
      const rot = combo.partes.filter(q => q.tipo === 'acai').length > 1 ? `açaí ${nAcai}` : 'açaí';
      partes.push(`${rot[0].toUpperCase() + rot.slice(1)} ${p.ml} ml (${base.nome.toLowerCase()}): ${txt}`);
    } else if (p.tipo === 'bebida') {
      const b = c.bebidas.find(x => x.id === e.id);
      partes.push(`Bebida: ${b ? b.nome.toLowerCase() : 'a escolher'}`);
    } else if (p.tipo === 'milkshake') {
      const s = c.milkshakes.itens.find(x => x.id === e.id);
      partes.push(`Milkshake ${p.tamanho}: ${s ? s.nome : 'a escolher'}`);
    }
  });
  return { total, detalhes: partes.join(' · '), linhas: partes };
}
