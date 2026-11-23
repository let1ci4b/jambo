// Gera, no build, o HTML do cardápio a partir de content/cardapio.json e content/loja.json.
// Assim o cardápio funciona sem JS e o Google lê tudo. Usado pelo vite.config.js.
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { reais, centavos } from '../src/calculo.js';
import { adesivoSabor, SABORES_PRONTOS, registrarIngredientes, registrarSabores } from '../src/copo.js';
import { normalizar, corSabor } from '../src/normalizar.js';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ler = f => fs.readFileSync(path.join(raiz, f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r = v => reais(centavos(v));
// ---------- fotos ----------
// As fotos originais já estão otimizadas (webp + versões menores "-640", "-960"). Uma foto nova, enviada
// pelo editor, pode ser grande (foto de celular): no build ela vira webp nas larguras pedidas.
// As conversões são feitas pelo vite.config.js (sharp), depois do build, direto na pasta dist.
let modo = 'build';
export const tarefasDeImagem = new Map(); // caminho de saída → { origem, largura }
const existe = url => fs.existsSync(path.join(raiz, 'public', decodeURI(url)));
function foto(src, larguras, proporcao = null) { // proporcao = largura / altura (a foto é cortada no centro)
  const out = {};
  const nome = path.basename(src).replace(/\.[a-z0-9]+$/i, '');
  const variante = w => src.replace(/\.webp$/i, `-${w}.webp`);
  const original = /\.webp$/i.test(src) && existe(variante(larguras[0])); // fotos que vieram com o site
  if (original) { for (const w of larguras) out[w] = existe(variante(w)) ? variante(w) : src; out.original = true; return out; }
  for (const w of larguras) {
    if (modo === 'serve' || !existe(src)) out[w] = src;
    else { const o = `/assets/img/otimizadas/${nome}-${w}${proporcao ? `x${Math.round(w / proporcao)}` : ""}.webp`; tarefasDeImagem.set(o, { origem: path.join(raiz, 'public', decodeURI(src)), largura: w, altura: proporcao ? Math.round(w / proporcao) : null }); out[w] = o; }
  }
  out.original = original;
  return out;
}
// desenho de ingrediente enviado pelo editor: svg fica como está; foto vira webp pequeno
function desenho(src) {
  if (!src || src.startsWith('data:') || /\.svg$/i.test(src) || src.startsWith('/assets/ingredientes/')) return src;
  return foto(src, [176], 1)[176];
}

const preencher = s => esc(s).replace(/\[preencher[^\]]*\]/g, m => `<mark class="preencher">${m}</mark>`);

export const ICONE = {
  sacola: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7L6 8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  mais: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  menos: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  fechar: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  seta: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4v15M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  whatsapp: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/></svg>',
  menu: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
};

function svgInline(arquivo, classe, extra = '') {
  return ler('public/assets/logo/' + arquivo)
    .replace(/<svg /, `<svg class="${classe}" focusable="false" ${extra} `);
}

// ---------- seções ----------
function acai(c) {
  const linhas = c.acai.map((b, i) => {
    const esg = b.esgotado;
    const ft = foto(b.imagem, [640, 1100], 640 / 800);
    const m = ft[640], grande = ft.original ? b.imagem : ft[1100];
    const ades = b.adesivos.slice(0, 2).map((a, k) => `<img class="adesivo-fixo a${k}" src="${esc(desenho(a.desenho))}" alt="" width="64" height="64" loading="lazy">`).join('');
    return `<li class="bowl${esg ? ' esgotado' : ''}" data-foto="${esc(grande)}" data-frutas="${esc(b.adesivos.map(a => desenho(a.desenho)).join('|'))}" data-i="${i}">
  <div class="foto-celular" aria-hidden="true"><div class="moldura-c"><img src="${esc(m)}" alt="" width="640" height="800" loading="lazy" decoding="async"></div>${ades}</div>
  <div class="linha"><h3><span class="ponto" aria-hidden="true"></span>${esc(b.nome)}</h3><span class="preco">${r(b.preco)}</span></div>
  ${b.descricao ? `<p class="desc">${preencher(b.descricao)}</p>` : ''}
  <p class="legenda">${b.kcal ? `≈ ${b.kcal} kcal (aproximado, 500 ml)` : '≈ <mark class="preencher">[preencher]</mark> kcal'} · Imagem ilustrativa</p>
  ${botaoAdicionar({ id: 'acai-' + b.id, nome: 'Açaí ' + b.nome, preco: b.preco, esgotado: esg, oculto: b.nome })}
</li>`;
  }).join('\n');
  return linhas;
}

function botaoAdicionar({ id, nome, preco, esgotado, detalhes = '', classe = 'btn btn--contorno', texto = 'Adicionar', oculto = '' }) {
  if (esgotado) return `<button class="${classe} esgotado-btn" type="button" aria-disabled="true">Esgotado hoje</button>`;
  return `<button class="${classe} adicionar" type="button" data-id="${esc(id)}" data-nome="${esc(nome)}" data-preco="${centavos(preco)}" data-detalhes="${esc(detalhes)}">${texto}${oculto ? `<span class="so-leitor"> ${esc(oculto)}</span>` : ''}</button>`;
}

function montador(c) {
  const m = c.montador;
  const radio = (nome, valor, rot, marcado, prefixo) => `<label class="pilula-radio"><input type="radio" name="${nome}" value="${valor}"${marcado ? ' checked' : ''}><span>${rot}</span></label>`;
  const bases = m.bases.map((b, i) => radio('base', b.id, `<img src="/assets/ingredientes/base-${existe(`/assets/ingredientes/base-${b.id}.svg`) ? b.id : 'tradicional'}.svg" alt="" width="28" height="28">${esc(b.nome)}`, i === 0)).join('');
  const tams = m.tamanhos.map(t => radio('tamanho', t.ml, `${t.ml} ml <b>${r(t.preco)}</b>`, t.ml === 500)).join('');
  const adesivo = (it, tipo) => `<li><button type="button" class="adesivo-btn" data-ing="${it.id}" data-tipo="${tipo}" aria-label="Colocar ${esc(it.nome.toLowerCase())} no copo"${it.esgotado ? ' aria-disabled="true" disabled' : ''}><img src="${esc(desenho(it.desenho))}" alt="" width="88" height="88" draggable="false"><span class="nome" aria-hidden="true">${esc(it.nome)}</span></button>${tipo === 'adicional' ? `<span class="extra">+${r(m.precoExtra)}</span>` : ''}</li>`;
  const tops = m.toppings.map(t => adesivo(t, 'topping')).join('');
  const adis = m.adicionais.map(a => adesivo(a, 'adicional')).join('');
  const logo = svgInline('jambo-logo-current.svg', 'copo-logo', 'aria-hidden="true" x="122" y="206" width="156" height="74"').replace(/ role="img"/, '').replace(/ aria-label="[^"]*"/, '');
  const copo = `<svg class="copo-svg" viewBox="0 0 400 340" aria-hidden="true" focusable="false">
  <defs>
    <clipPath id="metade"><rect x="0" y="0" width="200" height="220"/></clipPath>
    <radialGradient id="brilho-acai" cx="38%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
  </defs>
  <path class="copo-corpo" d="M14 108 L60 318 Q62 330 76 330 L324 330 Q338 330 340 318 L386 108 Z"/>
  <ellipse class="copo-borda" cx="200" cy="108" rx="186" ry="64"/>
  <ellipse class="copo-dentro" cx="200" cy="111" rx="176" ry="57"/>
  <ellipse class="acai-sup" cx="200" cy="114" rx="166" ry="50"/>
  <ellipse class="acai-sup acai-metade" cx="200" cy="114" rx="166" ry="50" clip-path="url(#metade)"/>
  <ellipse cx="200" cy="114" rx="166" ry="50" fill="url(#brilho-acai)"/>
  <g class="coberturas" id="coberturas"></g>
  ${logo}
</svg>`;
  const lista = (titulo, itens, tipo) => itens.map(it => `<label class="caixa"><input type="checkbox" name="${tipo}" value="${it.id}"${it.esgotado ? ' disabled' : ''}><span>${esc(it.nome)}${it.esgotado ? ' (esgotado)' : ''}</span></label>`).join('');
  const radioLista = (nome, itens, rot, padrao) => itens.map(it => `<label class="caixa"><input type="radio" name="${nome}" value="${it.id ?? it.ml}"${(it.id ?? it.ml) === padrao ? ' checked' : ''}><span>${rot(it)}</span></label>`).join('');
  const painel = (id, extra = '') => `<div class="painel-total" id="${id}">
  <div class="painel-numeros" aria-live="polite" aria-atomic="true"><p class="total">Total <b class="total-v">R$ 24,90</b></p><p class="legenda kcal">≈ <span class="kcal-v">440</span> kcal · valores aproximados</p><p class="so-leitor anuncio"></p></div>
  <p class="no-copo legenda">No copo: <span class="no-copo-v">só o açaí</span></p>
  <div class="painel-botoes">${extra}<button class="btn btn--claro colocar" type="button">Colocar no pedido</button></div>
</div>`;
  const sabores = c.gelato.sabores.map(sb => `<li><button type="button" class="adesivo-btn adesivo-sabor" data-ing="g-${sb.id}" aria-label="Colocar uma bola de ${esc(sb.nome.toLowerCase())} no copinho"${sb.esgotado ? ' aria-disabled="true" disabled' : ''}><span class="bola-ico">${adesivoSabor(sb.id)}</span><span class="nome" aria-hidden="true">${esc(sb.nome)}</span></button><span class="extra">${r(sb.preco)}</span></li>`).join('');
  const logoC = svgInline('jambo-logo-current.svg', 'copinho-logo', 'aria-hidden="true" x="140" y="236" width="120" height="57"').replace(/ role="img"/, '').replace(/ aria-label="[^"]*"/, '');
  const copinho = `<svg class="copo-svg" viewBox="0 0 400 340" aria-hidden="true" focusable="false">
  <path class="copinho-corpo" d="M90 200 L122 318 Q124 330 138 330 L262 330 Q276 330 278 318 L310 200 Z"/>
  <g class="coberturas" id="coberturas-gelato"></g>
  <path class="copinho-borda" d="M84 196 Q200 214 316 196 L312 210 Q200 228 88 210 Z"/>
  ${logoC}
</svg>`;
  return { bases, tams, tops, adis, copo, painel, sabores, copinho,
    listaHtml: `<fieldset class="lista-produto"><legend>O que você vai montar?</legend><div class="caixas">
<label class="caixa"><input type="radio" name="l-produto" value="acai" checked><span>Açaí</span></label>
<label class="caixa"><input type="radio" name="l-produto" value="gelato"><span>Gelato</span></label></div></fieldset>
<fieldset class="so-acai"><legend>Base</legend>${radioLista('l-base', m.bases, b => esc(b.nome), 'tradicional')}</fieldset>
<fieldset class="so-acai"><legend>Tamanho</legend>${radioLista('l-tamanho', m.tamanhos, t => `${t.ml} ml · ${r(t.preco)}`, 500)}</fieldset>
<fieldset class="so-acai"><legend>Toppings (${m.toppingsGratis} inclusos, depois ${r(m.precoExtra)} cada)</legend><div class="caixas">${lista('Toppings', m.toppings, 'l-topping')}</div></fieldset>
<fieldset class="so-gelato"><legend>Sabores (de 1 a 3)</legend><div class="caixas">${c.gelato.sabores.map(sb => `<label class="caixa"><input type="checkbox" name="l-sabor" value="${sb.id}"${sb.esgotado ? ' disabled' : ''}><span><span class="bolinha${corSabor(sb)} aria-hidden="true"></span>${esc(sb.nome)} · ${r(sb.preco)}</span></label>`).join('')}</div></fieldset>
<fieldset><legend>Adicionais (${r(m.precoExtra)} cada)</legend><div class="caixas">${lista('Adicionais', m.adicionais, 'l-adicional')}</div></fieldset>`
  };
}

function gelato(c) {
  const g = c.gelato;
  const lista = g.sabores.map(s => `<li class="${s.esgotado ? 'esgotado' : ''}"><span class="bolinha${corSabor(s)} aria-hidden="true"></span><h3>${esc(s.nome)}</h3><span class="preco">${r(s.preco)}</span>${s.esgotado ? '<span class="pilula-esgotado">Esgotado</span>' : ''}</li>`).join('');
  const caixas = g.sabores.map(s => `<label class="caixa"><input type="checkbox" name="sabor" value="${s.id}"${s.esgotado ? ' disabled' : ''}><span><span class="bolinha${corSabor(s)} aria-hidden="true"></span>${esc(s.nome)}${s.esgotado ? ' (esgotado)' : ''}</span></label>`).join('');
  const min = Math.min(...g.sabores.map(s => s.preco)), max = Math.max(...g.sabores.map(s => s.preco));
  return { lista, caixas, faixa: `1 sabor ${r(min)} a ${r(max)} · 2 sabores ${r(g.doisSabores)} · 3 sabores ${r(g.tresSabores)}` };
}

function shakes(c) {
  return c.milkshakes.itens.map(s => `<li class="${s.esgotado ? 'esgotado' : ''}"><div class="linha"><h3>${esc(s.nome)}</h3><span class="preco">${r(s.preco)}</span></div><p class="desc">${preencher(s.descricao)}</p>${botaoAdicionar({ id: 'shake-' + s.id, nome: 'Milkshake ' + s.nome, preco: s.preco, esgotado: s.esgotado, classe: 'btn btn--contorno-claro', oculto: s.nome })}</li>`).join('');
}

function combos(c) {
  return c.combos.itens.map((k, i) => `<li class="combo${i === 0 ? ' ativo' : ''}${k.esgotado ? ' esgotado' : ''}" data-i="${i}"><h3 class="combo-nome">${esc(k.nome)}</h3><p class="desc">${esc(k.descricao)}</p><p class="combo-preco">${r(k.preco)}</p>${k.esgotado ? botaoAdicionar({ esgotado: true, classe: 'btn btn--contorno-claro' }) : !k.partes.length ? botaoAdicionar({ id: 'combo-' + k.id, nome: 'Combo ' + k.nome, preco: k.preco, classe: 'btn btn--contorno-claro', oculto: k.nome }) : `<button class="btn btn--contorno-claro montar-combo" type="button" data-combo="${k.id}">Montar combo<span class="so-leitor"> ${esc(k.nome)}</span></button>`}</li>`).join('');
}

function bebidas(c) {
  return c.bebidas.map(b => `<li class="${b.esgotado ? 'esgotado' : ''}"><span class="nome">${esc(b.nome)}</span><span class="preco">${r(b.preco)}</span>${b.esgotado ? '<span class="pilula-esgotado">Esgotado</span>' + botaoAdicionar({ esgotado: true, classe: 'btn-icone' }) : botaoAdicionar({ id: 'bebida-' + b.id, nome: b.nome, preco: b.preco, classe: 'btn-icone', texto: ICONE.mais, oculto: 'Adicionar ' + b.nome })}</li>`).join('');
}

function horario(l) {
  // segunda primeiro na lista
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  return ordem.map(i => { const h = l.horario[i]; return `<li data-dia="${i}"><span>${h.dia}</span><span>${h.abre.replace(':00', 'h')}–${h.fecha.replace(':00', 'h')}</span></li>`; }).join('');
}

function jsonld(l) {
  const dias = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dados = {
    '@context': 'https://schema.org', '@type': 'IceCreamShop',
    name: l.nome, description: 'Site demonstrativo: marca fictícia criada como exemplo de portfólio.',
    address: { '@type': 'PostalAddress', streetAddress: l.rua, addressLocality: l.cidade, addressRegion: l.uf, addressCountry: 'BR' },
    telephone: '+' + l.whatsapp, url: l.site, menu: l.site + '#acai', servesCuisine: ['Açaí', 'Gelato'],
    openingHoursSpecification: l.horario.map((h, i) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: dias[i], opens: h.abre, closes: h.fecha }))
  };
  return `<script type="application/ld+json">${JSON.stringify(dados)}</script>`;
}

function palavras(texto) {
  return texto.split(' ').map(p => `<span class="palavra"><span>${esc(p)}</span></span>`).join(' ');
}

// Card de compartilhamento (WhatsApp, Instagram, Facebook, LinkedIn, X): URLs sempre absolutas.
function compartilhar(html, l, pagina) {
  const base = l.site.endsWith('/') ? l.site : l.site + '/';
  const titulo = pagina ? (html.match(/<title>([^<]*)<\/title>/) || [])[1] : esc(`${l.nome} · ${l.frase}`);
  const desc = pagina ? (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] : esc(l.compartilharTexto);
  const img = base + 'assets/img/compartilhar.jpg';
  const alt = esc(l.compartilharAlt);
  return [
    pagina === '404.html' ? '' : `<link rel="canonical" href="${base + pagina}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pt_BR">',
    `<meta property="og:site_name" content="${esc(l.nome)}">`,
    `<meta property="og:url" content="${base + pagina}">`,
    `<meta property="og:title" content="${titulo}">`,
    `<meta property="og:description" content="${desc}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:secure_url" content="${img}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${alt}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${titulo}">`,
    `<meta name="twitter:description" content="${desc}">`,
    `<meta name="twitter:image" content="${img}">`,
    `<meta name="twitter:image:alt" content="${alt}">`
  ].filter(Boolean).join('\n');
}

export async function renderizar(html, { comando = 'build' } = {}) {
  modo = comando;
  const c = normalizar(JSON.parse(ler('content/cardapio.json')), JSON.parse(ler('public/assets/ingredientes/lista.json')), SABORES_PRONTOS);
  registrarIngredientes([...c.montador.toppings, ...c.montador.adicionais]);
  registrarSabores(c.gelato.sabores);
  const fg = foto(c.gelato.imagem, [960, 1376], 1376 / 590), fs_ = foto(c.milkshakes.imagem, [640, 896], 896 / 1120), fc = foto(c.combos.imagem, [640, 896], 896 / 720);
  const l = JSON.parse(ler('content/loja.json'));
  const mo = montador(c);
  const ge = gelato(c);
  const qr = await QRCode.toString(l.site + '#acai', { type: 'svg', margin: 1, color: { dark: '#2A1233', light: '#F5EBDD' } });
  const mapsBusca = encodeURIComponent(l.endereco.replace(' — ', ', '));
  const leticia = /^\d+$/.test(l.whatsappLeticia) ? `https://wa.me/${l.whatsappLeticia}?text=${encodeURIComponent('Oi, Letícia! Vi o site da JAMBO e quero um site assim.')}` : '#';
  const trocas = {
    WORDMARK: svgInline('jambo-wordmark.svg', 'wordmark', 'aria-hidden="true"').replace(/ role="img"/, '').replace(/ aria-label="[^"]*"/, ''),
    ACAI: acai(c),
    BASES: mo.bases, TAMANHOS: mo.tams, TOPPINGS: mo.tops, ADICIONAIS: mo.adis, COPO: mo.copo,
    SABORES: mo.sabores, COPINHO: mo.copinho,
    REGRA_GELATO: `Escolha de 1 a 3 sabores: 1 sabor ${r(Math.min(...c.gelato.sabores.map(x => x.preco)))} a ${r(Math.max(...c.gelato.sabores.map(x => x.preco)))}, 2 sabores ${r(c.gelato.doisSabores)}, 3 sabores ${r(c.gelato.tresSabores)}. Adicionais ${r(c.montador.precoExtra)} cada.`,
    ICO_GELATO: '<svg class="ico-gelato" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" focusable="false"><path class="ig-copo" d="M8 15 L11 26 H17 L20 15Z"/><circle class="ig-bola" cx="14" cy="11" r="7"/></svg>',
    PAINEL: mo.painel('painel-arrastar', '<button class="btn btn--contorno-claro recomecar" type="button">Recomeçar</button>'),
    PAINEL_LISTA: mo.painel('painel-lista'),
    LISTA: mo.listaHtml,
    REGRA: `${c.montador.toppingsGratis} toppings inclusos; do ${c.montador.toppingsGratis + 1}º em diante e cada adicional, ${r(c.montador.precoExtra)}.`,
    GELATO_IMG: c.gelato.imagem === '/assets/img/gelatos-montagem-21x9.webp'
      ? `<picture><source media="(max-width: 767px)" srcset="/assets/img/gelatos-montagem-960.webp 960w, /assets/img/gelatos-montagem.webp 1376w" sizes="100vw"><img src="${esc(c.gelato.imagem)}" srcset="/assets/img/gelatos-montagem-21x9-960.webp 960w, ${esc(c.gelato.imagem)} 1376w" sizes="100vw" alt="${esc(c.gelato.alt)}" width="1376" height="590" loading="lazy" decoding="async"></picture>`
      : `<img src="${esc(fg[1376])}" srcset="${esc(fg[960])} 960w, ${esc(fg[1376])} 1376w" sizes="100vw" alt="${esc(c.gelato.alt)}" width="1376" height="590" loading="lazy" decoding="async">`,
    GELATO_ADIS: c.montador.adicionais.map(a => `<label class="caixa"><input type="checkbox" name="g-adicional" value="${a.id}"${a.esgotado ? ' disabled' : ''}><span>${esc(a.nome)}</span></label>`).join(''),
    PRECO_EXTRA: r(c.montador.precoExtra),
    GELATO_LISTA: ge.lista, GELATO_CAIXAS: ge.caixas, GELATO_FAIXA: ge.faixa,
    GELATO_H2: palavras('O clima pede JAMBO.'),
    SHAKES_IMG: `<img src="${esc(fs_.original ? c.milkshakes.imagem : fs_[896])}" srcset="${esc(fs_[640])} 640w, ${esc(fs_.original ? c.milkshakes.imagem : fs_[896])} 896w" sizes="(min-width: 1024px) 40vw, 100vw" alt="${esc(c.milkshakes.alt)}" width="896" height="1120" loading="lazy" decoding="async">`,
    SHAKES: shakes(c),
    COMBOS: combos(c),
    COMBOS_REGUA: '<i></i>'.repeat(Math.max(1, c.combos.itens.length)),
    CORES_NOVAS: (() => { const n = c.gelato.sabores.filter(s => !s.cor); return n.length ? `<style>${n.map(s => `.sabor-${s.id}{background:${s.hex};box-shadow:inset 0 0 0 1px rgba(42,18,51,.35)}`).join('')}</style>` : ''; })(),
    COMBOS_REGRA: esc(c.combos.regra ?? ''),
    COMBOS_IMG: `<img src="${esc(fc[640])}" srcset="${esc(fc[640])} 640w, ${esc(fc.original ? c.combos.imagem : fc[896])} 896w" sizes="(min-width: 768px) 50vw, 100vw" alt="${esc(c.combos.alt)}" width="896" height="720" loading="lazy" decoding="async">`,
    BEBIDAS: bebidas(c),
    HORARIO: horario(l),
    ENDERECO: esc(l.endereco),
    MAPS_DIR: `https://www.google.com/maps/dir/?api=1&amp;destination=${mapsBusca}`,
    MAPS_EMBED: `https://www.google.com/maps?q=${mapsBusca}&amp;output=embed`,
    WHATS: `https://wa.me/${l.whatsapp}`,
    WHATS_TEXTO: esc(l.whatsappTexto),
    INSTAGRAM: esc(l.instagram),
    ENTREGA: esc(l.entrega),
    QR: qr.replace('<svg ', '<svg class="qr" role="img" aria-label="QR code do cardápio" width="160" height="160" '),
    LETICIA: leticia,
    JSONLD: jsonld(l),
    ICO_SACOLA: ICONE.sacola, ICO_SETA: ICONE.seta, ICO_WHATS: ICONE.whatsapp, ICO_FECHAR: ICONE.fechar, ICO_MENU: ICONE.menu
  };
  html = html.replace(/<!--@COMPARTILHAR:([^>]*?)-->/, (m, pag) => compartilhar(html, l, pag));
  return html.replace(/<!--@([A-Z0-9_]+)-->/g, (m, k) => (k in trocas ? trocas[k] : m));
}
