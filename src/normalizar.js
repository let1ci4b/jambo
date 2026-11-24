// Arruma o cardápio que vem do editor (Pages CMS) antes de qualquer uso, no build e no navegador.
// O editor deixa a dona da loja criar, apagar e mudar itens. Este arquivo garante que nada disso
// quebre o site:
// - item novo ganha um código (id) feito a partir do nome ("Pasta de Amendoim" → "pasta-de-amendoim");
// - item sem nome ou sem preço é ignorado (não aparece, mas também não trava a página);
// - ingrediente sem desenho pronto ganha um desenho gerado pela cor e pelo jeito que vai no copo;
// - sabor de gelato novo ganha a cor escolhida;
// - "Ingredientes que voam" aceita o nome ou o código do ingrediente; o que não existir é ignorado;
// - combo sem partes vira um produto simples (vai direto para o pedido).
// Função pura: recebe os dados, devolve uma cópia arrumada. Não lê arquivos.

export const slug = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' e ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// cores que aparecem no editor (nome → cor do desenho). Mudar aqui muda as opções do .pages.yml também.
export const CORES = {
  'Vermelho': '#D7313F', 'Rosa': '#F28CA0', 'Laranja': '#F5A623', 'Amarelo': '#F6D55C', 'Creme': '#F3E3BF',
  'Branco': '#FFFDF6', 'Verde-claro': '#A9C96A', 'Verde': '#5E8C3A', 'Roxo': '#7B3F8C', 'Azul': '#5B8FD9',
  'Bege': '#E0B47E', 'Marrom-claro': '#C68A4C', 'Marrom': '#7A4B30', 'Chocolate': '#4A2A1E', 'Preto': '#241A17'
};
export const ESTILOS = ['pedacos', 'salpicado', 'calda', 'creme']; // como o ingrediente vai no copo

const hexDe = nome => Object.entries(CORES).find(([k]) => slug(k) === slug(nome))?.[1] ?? (/^#[0-9a-f]{6}$/i.test(nome ?? '') ? nome : null);
export function escurecer(hex, q = .22) {
  const n = parseInt(hex.slice(1), 16), c = k => Math.round(((n >> k) & 255) * (1 - q));
  return '#' + [16, 8, 0].map(k => c(k).toString(16).padStart(2, '0')).join('');
}
const num = (v, padrao = null) => (typeof v === 'number' && Number.isFinite(v) ? v : (v !== '' && v != null && Number.isFinite(Number(v)) ? Number(v) : padrao));
const texto = v => (typeof v === 'string' ? v.trim() : '');

// adesivo desenhado na hora para ingrediente sem desenho (SVG em data URI: funciona em qualquer <img>)
export function adesivoGerado(estilo, hex) {
  const esc = escurecer(hex, .28), luz = '#FFFFFF';
  let miolo = '';
  if (estilo === 'calda') {
    miolo = `<path d="M18 40 C 28 18, 40 62, 50 40 S 72 18, 82 40" fill="none" stroke="${esc}" stroke-width="11" stroke-linecap="round" transform="translate(1.5 3)"/>
      <path d="M18 40 C 28 18, 40 62, 50 40 S 72 18, 82 40" fill="none" stroke="${hex}" stroke-width="10" stroke-linecap="round"/>
      <path d="M22 36 C 30 22, 38 50, 46 36" fill="none" stroke="${luz}" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
      <path d="M50 58 q 0 14 6 18 q 6 -4 6 -18" fill="${hex}"/>`;
  } else if (estilo === 'creme') {
    miolo = `<path d="M22 70 C 18 44, 34 26, 50 30 C 66 24, 84 44, 78 70 C 66 78, 34 78, 22 70Z" fill="${hex}" stroke="${esc}" stroke-width="3"/>
      <path d="M32 58 C 42 64, 58 64, 68 56" fill="none" stroke="${esc}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <ellipse cx="42" cy="40" rx="9" ry="5" fill="${luz}" opacity=".8"/>`;
  } else if (estilo === 'salpicado') {
    const pts = [[30, 34], [52, 26], [70, 38], [40, 52], [62, 56], [28, 66], [50, 72], [74, 66], [46, 40]];
    miolo = pts.map(([x, y], k) => `<polygon points="${x},${y - 7} ${x + 7},${y - 1} ${x + 3},${y + 6} ${x - 5},${y + 5} ${x - 7},${y - 2}" fill="${k % 3 ? hex : esc}"/>`).join('');
  } else { // pedaços (fruta ou cubos)
    miolo = [[36, 38, 16], [64, 44, 15], [46, 66, 15]].map(([x, y, s]) => `<rect x="${x - s}" y="${y - s}" width="${2 * s}" height="${2 * s}" rx="${s * .45}" fill="${esc}" transform="translate(2 3)"/>
      <rect x="${x - s}" y="${y - s}" width="${2 * s}" height="${2 * s}" rx="${s * .45}" fill="${hex}"/>
      <ellipse cx="${x - s * .3}" cy="${y - s * .4}" rx="${s * .35}" ry="${s * .2}" fill="${luz}" opacity=".5"/>`).join('');
  }
  // contorno branco em volta do desenho, como os adesivos prontos
  const contorno = '<filter id="c" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="3.5" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${contorno}</defs><g filter="url(#c)">${miolo}</g></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' '));
}

// caminho de uma referência do editor ("content/ingredientes/kiwi.json") → código ("kiwi")
export const idDoArquivo = p => String(p ?? '').split('/').pop().replace(/\.json$/i, '');

/**
 * Junta os arquivos do editor no formato que o site usa.
 * @param partes { acai, montador, gelato, milkshakes, combos, bebidas, ingredientes: { 'kiwi': {...}, ... } }
 */
export function montarCardapio(partes) {
  const ing = Object.entries(partes.ingredientes ?? {}).map(([id, d]) => ({ ...d, id }))
    .sort((a, b) => (num(a.ordem, 999) - num(b.ordem, 999)) || String(a.nome).localeCompare(String(b.nome), 'pt'));
  const tipo = t => slug(t) === 'adicional' ? 'adicional' : 'topping';
  return {
    acai: (partes.acai?.itens ?? []).map(b => ({ ...b, ingredientes: (b.ingredientes ?? []).map(idDoArquivo) })),
    montador: { ...partes.montador, toppings: ing.filter(i => tipo(i.tipo) === 'topping'), adicionais: ing.filter(i => tipo(i.tipo) === 'adicional') },
    gelato: partes.gelato ?? {},
    milkshakes: partes.milkshakes ?? {},
    combos: partes.combos ?? {},
    bebidas: partes.bebidas?.itens ?? []
  };
}

// lista de itens com nome: dá id a quem não tem e tira repetidos
function lista(itens, { precisaPreco = false } = {}) {
  const vistos = new Set();
  return (Array.isArray(itens) ? itens : []).filter(it => it && texto(it.nome)).filter(it => !precisaPreco || num(it.preco) !== null).map(it => {
    const base = texto(it.id) || slug(it.nome) || 'item';
    let id = base, k = 2;
    while (vistos.has(id)) id = `${base}-${k++}`;
    vistos.add(id);
    const out = { ...it, id, nome: texto(it.nome), esgotado: it.esgotado === true };
    if (precisaPreco) out.preco = num(it.preco);
    if ('precoPromo' in it) out.precoPromo = num(it.precoPromo, null);
    return out;
  });
}

/**
 * @param c         cardápio montado por montarCardapio()
 * @param sabores   ids dos sabores de gelato que já têm cor desenhada (copo.js → SABOR)
 */
export function normalizar(c, sabores = []) {
  const m = c.montador ?? {};
  const ingrediente = it => {
    const hex = hexDe(it.cor) ?? '#C68A4C';
    const estilo = ESTILOS.find(e => e === slug(it.estilo)) ?? 'pedacos';
    const desenho = texto(it.desenho) || adesivoGerado(estilo, hex);
    return { ...it, kcal: num(it.kcal, 0), estilo, hex, desenho };
  };
  const toppings = lista(m.toppings).map(ingrediente);
  const adicionais = lista(m.adicionais).map(ingrediente);
  const todos = [...toppings, ...adicionais];
  const acharIngrediente = s => {
    const k = slug(s);
    return todos.find(t => t.id === k || slug(t.nome) === k) ?? null;
  };

  const bases = lista(m.bases).map(b => ({ ...b, kcal: { 300: num(b.kcal?.['300'], 0), 500: num(b.kcal?.['500'], 0), 700: num(b.kcal?.['700'], 0) } }));
  const tamanhos = (Array.isArray(m.tamanhos) ? m.tamanhos : []).filter(t => num(t?.ml) && num(t?.preco) !== null).map(t => ({ ml: num(t.ml), preco: num(t.preco) }));

  const acai = lista(c.acai, { precisaPreco: true }).map((b, i, arr) => ({
    ...b,
    descricao: texto(b.descricao),
    kcal: num(b.kcal, null),
    imagem: texto(b.imagem) || texto(arr.find(x => texto(x.imagem))?.imagem) || '',
    adesivos: (Array.isArray(b.ingredientes) ? b.ingredientes : []).map(acharIngrediente).filter(Boolean)
      .filter((x, k, a) => a.findIndex(y => y.id === x.id) === k)
  }));

  const g = c.gelato ?? {};
  const saborList = lista(g.sabores, { precisaPreco: true }).map(s => {
    const temDesenho = sabores.includes(texto(s.cor) || s.id);
    const hex = hexDe(s.corMassa) ?? '#F3E3BF';
    return { ...s, kcal: num(s.kcal, 0), cor: temDesenho ? (texto(s.cor) || s.id) : null, hex, escuro: escurecer(hex) };
  });

  const produtos = itens => lista(itens, { precisaPreco: true }).map(p => ({ ...p, descricao: texto(p.descricao) }));
  const combos = c.combos ?? {};
  const comboItens = produtos(combos.itens).map(k => ({
    ...k,
    partes: (Array.isArray(k.partes) ? k.partes : []).filter(p => ['acai', 'bebida', 'milkshake'].includes(p?.tipo))
      .map(p => ({ tipo: p.tipo, ...(p.tipo === 'acai' ? { ml: num(p.ml, 300) } : {}), ...(p.tipo === 'milkshake' ? { tamanho: texto(p.tamanho) || '300 ml' } : {}) }))
  }));

  return {
    ...c,
    acai,
    montador: {
      ...m,
      toppingsGratis: num(m.toppingsGratis, 0),
      precoExtra: num(m.precoExtra, 0),
      bases: bases.length ? bases : [{ id: 'tradicional', nome: 'Tradicional', kcal: { 300: 0, 500: 0, 700: 0 } }],
      tamanhos: tamanhos.length ? tamanhos : [{ ml: 500, preco: 0 }],
      toppings, adicionais
    },
    gelato: { ...g, doisSabores: num(g.doisSabores, 0), tresSabores: num(g.tresSabores, 0), alt: texto(g.alt), sabores: saborList },
    milkshakes: { ...c.milkshakes, alt: texto(c.milkshakes?.alt), itens: produtos(c.milkshakes?.itens) },
    combos: { ...combos, alt: texto(combos.alt), regra: texto(combos.regra), itens: comboItens },
    bebidas: lista(c.bebidas, { precisaPreco: true })
  };
}

// bolinha de cor do sabor: classe do desenho pronto ou do sabor novo (a cor do novo vem num <style> gerado no build)
export const corSabor = s => ` sabor-${s.cor ?? s.id}"`;

// ---------- promoções ----------
// Datas no formato do editor (AAAA-MM-DD). Sem início = já vale; sem fim = vale até tirar.
// "Hoje" é sempre o dia em Florianópolis, para o site e o pedido concordarem.
export const hojeLoja = (agora = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);
const dataOk = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d);
export const dentroDoPeriodo = (inicio, fim, hoje) =>
  (!dataOk(inicio) || inicio.slice(0, 10) <= hoje) && (!dataOk(fim) || fim.slice(0, 10) >= hoje);
// preço promocional de um item: só vale se for menor que o preço normal e estiver no período
export function promoDoItem(it, hoje) {
  const p = num(it?.precoPromo, null);
  if (p === null || p <= 0 || p >= num(it.preco, 0)) return null;
  return { preco: p, inicio: dataOk(it.promoInicio) ? it.promoInicio.slice(0, 10) : '', fim: dataOk(it.promoFim) ? it.promoFim.slice(0, 10) : '', ativa: dentroDoPeriodo(it.promoInicio, it.promoFim, hoje) };
}
// aplica a promoção do dia ao cardápio já arrumado: preco vira o promocional e precoNormal guarda o cheio
export function aplicarPromocoes(c, hoje = hojeLoja()) {
  const ap = it => { const pr = promoDoItem(it, hoje); return pr ? { ...it, promo: pr, ...(pr.ativa ? { preco: pr.preco, precoNormal: it.preco } : {}) } : it; };
  return {
    ...c,
    acai: c.acai.map(ap),
    milkshakes: { ...c.milkshakes, itens: c.milkshakes.itens.map(ap) },
    combos: { ...c.combos, itens: c.combos.itens.map(ap) },
    bebidas: c.bebidas.map(ap)
  };
}
// avisos de promoção válidos hoje (no máximo 3, na ordem do editor)
export function avisosAtivos(lista, hoje = hojeLoja()) {
  return (Array.isArray(lista) ? lista : []).filter(a => texto(a?.titulo) && dentroDoPeriodo(a.inicio, a.fim, hoje)).slice(0, 3);
}
