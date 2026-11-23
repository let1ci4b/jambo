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
    return out;
  });
}

/**
 * @param c         conteúdo de content/cardapio.json
 * @param prontos   { id: nome } dos desenhos que já existem em public/assets/ingredientes (lista.json)
 * @param sabores   ids dos sabores de gelato que já têm cor desenhada (copo.js → SABOR)
 */
export function normalizar(c, prontos = {}, sabores = []) {
  const m = c.montador ?? {};
  const ingrediente = it => {
    const hex = hexDe(it.cor) ?? '#C68A4C';
    const estilo = ESTILOS.find(e => e === slug(it.estilo)) ?? 'pedacos';
    const desenho = texto(it.desenho) || (it.id in prontos ? `/assets/ingredientes/${it.id}.svg` : adesivoGerado(estilo, hex));
    return { ...it, kcal: num(it.kcal, 0), estilo, hex, desenho, pronto: it.id in prontos };
  };
  const toppings = lista(m.toppings).map(ingrediente);
  const adicionais = lista(m.adicionais).map(ingrediente);
  const todos = [...toppings, ...adicionais];
  const acharIngrediente = s => {
    const k = slug(s);
    return todos.find(t => t.id === k || slug(t.nome) === k) ?? (k in prontos ? { id: k, desenho: `/assets/ingredientes/${k}.svg` } : null);
  };

  const bases = lista(m.bases).map(b => ({ ...b, kcal: { 300: num(b.kcal?.['300'], 0), 500: num(b.kcal?.['500'], 0), 700: num(b.kcal?.['700'], 0) } }));
  const tamanhos = (Array.isArray(m.tamanhos) ? m.tamanhos : []).filter(t => num(t?.ml) && num(t?.preco) !== null).map(t => ({ ml: num(t.ml), preco: num(t.preco) }));

  const acai = lista(c.acai, { precisaPreco: true }).map((b, i, arr) => ({
    ...b,
    descricao: texto(b.descricao),
    kcal: num(b.kcal, null),
    imagem: texto(b.imagem) || texto(arr.find(x => texto(x.imagem))?.imagem) || '',
    adesivos: (Array.isArray(b.adesivos) ? b.adesivos : []).map(acharIngrediente).filter(Boolean)
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

// bolinha de cor do sabor: classe pronta (sabores originais) ou a cor escolhida no editor
export const corSabor = s => (s.cor ? ` sabor-${s.cor}"` : `" style="background:${s.hex};box-shadow:inset 0 0 0 1px rgba(42,18,51,.35)"`);
