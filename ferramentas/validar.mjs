// Confere tudo o que veio do editor (Pages CMS) ANTES de publicar.
// Se achar um problema, para o build com uma mensagem em português dizendo onde está e como resolver.
// Build parado = o Cloudflare não publica, e o site continua no ar com a última versão boa.
// Avisos (⚠️) não param a publicação; erros (❌) param.
//
// Rodar à mão: npm run validar
import fs from 'node:fs';
import path from 'node:path';
import { lerConteudo, raiz } from './conteudo.mjs';
import { slug, idDoArquivo, CORES, ESTILOS } from '../src/normalizar.js';

const erros = [], avisos = [];
const erro = (onde, problema, solucao) => erros.push({ onde, problema, solucao });
const aviso = (onde, problema, solucao) => avisos.push({ onde, problema, solucao });

const texto = v => (typeof v === 'string' ? v.trim() : '');
const ehNumero = v => typeof v === 'number' && Number.isFinite(v);
const existeArquivo = url => !!url && fs.existsSync(path.join(raiz, 'public', decodeURI(String(url).replace(/^\//, ''))));
const FORMATOS_FOTO = /\.(webp|jpe?g|png|avif)$/i;
const FORMATOS_DESENHO = /\.(svg|webp|png)$/i;
const nomeDe = (it, k) => (texto(it?.nome) ? `"${texto(it.nome)}"` : `item ${k + 1} (sem nome)`);
const MLS = [300, 500, 700];
const BASES = ['tradicional', 'zero', 'cupuacu'];

function textoObrigatorio(onde, campo, valor, max, dica = '') {
  const t = texto(valor);
  if (!t) erro(onde, `O campo "${campo}" está vazio.`, `Preencha o campo "${campo}".${dica ? ' ' + dica : ''}`);
  else if (max && t.length > max) erro(onde, `O campo "${campo}" tem ${t.length} letras; o máximo é ${max}.`, `Encurte o texto para caber no layout (até ${max} letras).`);
  return t;
}
function preco(onde, valor, campo = 'Preço') {
  if (!ehNumero(valor)) erro(onde, `O campo "${campo}" está vazio ou não é um número.`, `Escreva só o número, com os centavos (ex.: 26,90).`);
  else if (valor <= 0) erro(onde, `O "${campo}" está zerado ou negativo (${valor}).`, `Coloque o preço de venda. Para tirar o item do ar por um dia, use "Esgotado hoje".`);
  else if (valor >= 500) erro(onde, `O "${campo}" está muito alto (R$ ${String(valor).replace(".", ",")}).`, `Confira se não faltou a vírgula dos centavos (ex.: 26,90 e não 2690).`);
}
function kcal(onde, valor, max = 3000) {
  if (valor === undefined || valor === null || valor === '') { aviso(onde, 'Sem calorias.', 'Preencha as calorias aproximadas, se souber. Sem elas, o site não mostra a estimativa.'); return; }
  if (!ehNumero(valor) || valor < 0 || valor > max) erro(onde, `Calorias fora do normal (${valor}).`, `Use um número entre 0 e ${max}.`);
}
function foto(onde, campo, url, obrigatoria = true) {
  if (!texto(url)) { if (obrigatoria) erro(onde, `Falta a foto ("${campo}").`, 'Envie uma foto no campo.'); return; }
  if (!FORMATOS_FOTO.test(url)) erro(onde, `A foto "${url}" não está num formato aceito.`, 'Envie em JPG, PNG ou WEBP.');
  else if (!existeArquivo(url)) erro(onde, `A foto "${url}" não foi encontrada.`, 'Ela pode ter sido apagada em "Fotos". Escolha a foto de novo no campo.');
}
function descricaoFoto(onde, valor) {
  const t = texto(valor);
  if (!t) erro(onde, 'Falta a "Descrição da foto".', 'Descreva a foto em uma frase. É o que o leitor de tela lê para quem não enxerga.');
  else if (t.length > 160) erro(onde, `A "Descrição da foto" está longa (${t.length} letras).`, 'Use até 160 letras.');
}
function repetidos(onde, itens) {
  const vistos = new Map();
  itens.forEach((it, k) => {
    const s = slug(it?.nome);
    if (!s) return;
    if (vistos.has(s)) erro(onde, `Há dois itens com o nome ${nomeDe(it, k)}.`, 'Mude um dos nomes ou apague o repetido.');
    vistos.set(s, k);
  });
}
function lista(onde, itens, minimo = 1) {
  if (!Array.isArray(itens) || itens.length < minimo) { erro(onde, `A lista está vazia.`, `Deixe pelo menos ${minimo} item. Para tirar um item do ar por um dia, use "Esgotado hoje".`); return []; }
  return itens;
}

const { partes, loja, textos, errosDeLeitura } = lerConteudo();
for (const e of errosDeLeitura) erro(e.arquivo, e.msg, 'Desfaça a última mudança no histórico do GitHub ou chame a Letícia.');

// ---------- ingredientes ----------
const ingredientes = partes.ingredientes ?? {};
const ids = Object.keys(ingredientes);
const tipos = { topping: 0, adicional: 0 };
for (const [id, d] of Object.entries(ingredientes)) {
  const onde = `Cardápio → Ingredientes → "${texto(d.nome) || id}"`;
  textoObrigatorio(onde, 'Nome', d.nome, 28);
  const tipo = slug(d.tipo);
  if (!['topping', 'adicional'].includes(tipo)) erro(onde, 'Não está marcado se é Topping ou Adicional.', 'Escolha o "Tipo".'); else tipos[tipo]++;
  kcal(onde, d.kcal, 1000);
  if (texto(d.desenho)) {
    if (!FORMATOS_DESENHO.test(d.desenho)) erro(onde, `O desenho "${d.desenho}" não está num formato aceito.`, 'Envie em SVG, PNG ou WEBP, de preferência com fundo transparente.');
    else if (!existeArquivo(d.desenho)) erro(onde, `O desenho "${d.desenho}" não foi encontrado.`, 'Ele pode ter sido apagado em "Desenhos". Escolha o desenho de novo.');
  } else {
    if (!texto(d.estilo) || !ESTILOS.includes(slug(d.estilo))) erro(onde, 'Sem desenho e sem "Como aparece no copo".', 'Envie um desenho ou escolha como ele aparece no copo (Pedaços, Salpicado, Calda ou Creme).');
    if (!texto(d.cor) || !Object.keys(CORES).some(k => slug(k) === slug(d.cor))) erro(onde, 'Sem desenho e sem "Cor do desenho".', 'Envie um desenho ou escolha a cor.');
  }
  if (d.ordem !== undefined && d.ordem !== null && !ehNumero(d.ordem)) erro(onde, 'A "Ordem" não é um número.', 'Use 1, 2, 3...');
}
if (!tipos.topping) erro('Cardápio → Ingredientes', 'Não há nenhum Topping.', 'O "Monte seu Jambo" precisa de pelo menos 1 topping.');
repetidos('Cardápio → Ingredientes', Object.values(ingredientes));

// ---------- açaí da casa ----------
const acai = lista('Cardápio → Açaí da casa', partes.acai?.itens);
repetidos('Cardápio → Açaí da casa', acai);
acai.forEach((b, k) => {
  const onde = `Cardápio → Açaí da casa → ${nomeDe(b, k)}`;
  textoObrigatorio(onde, 'Nome', b.nome, 28);
  textoObrigatorio(onde, 'Descrição', b.descricao, 160);
  preco(onde, b.preco);
  kcal(onde, b.kcal);
  foto(onde, 'Foto', b.imagem);
  if (texto(b.alt).length > 160) erro(onde, `A "Descrição da foto" está longa.`, 'Use até 160 letras.');
  const refs = Array.isArray(b.ingredientes) ? b.ingredientes : [];
  refs.forEach(r => { if (!ids.includes(idDoArquivo(r))) erro(onde, `Um dos "Ingredientes que voam" não existe mais (${idDoArquivo(r)}).`, 'Tire esse ingrediente da lista ou escolha outro.'); });
  if (refs.length > 4) erro(onde, `Há ${refs.length} "Ingredientes que voam".`, 'Escolha até 4.');
  if (!refs.length) aviso(onde, 'Nenhum ingrediente que voa.', 'Escolha até 4 ingredientes para a animação do bowl.');
});

// ---------- monte seu jambo ----------
const m = partes.montador ?? {};
{
  const onde = 'Cardápio → Monte seu Jambo';
  if (!ehNumero(m.toppingsGratis) || m.toppingsGratis < 0 || m.toppingsGratis > 10) erro(onde, '"Toppings inclusos" precisa ser um número de 0 a 10.', 'Corrija o número.');
  if (!ehNumero(m.precoExtra) || m.precoExtra < 0 || m.precoExtra >= 100) erro(onde, '"Preço do topping extra" precisa ser um número (ex.: 3.00).', 'Corrija o preço.');
  const bases = Array.isArray(m.bases) ? m.bases : [];
  const idsBases = bases.map(b => b.id);
  if (bases.length !== 3 || BASES.some(b => !idsBases.includes(b))) erro(onde, 'As 3 bases (tradicional, zero e cupuaçu) foram alteradas, criadas ou apagadas.', 'As bases são fixas no desenho do copo: só dá para mudar o nome e as calorias. Desfaça a mudança.');
  bases.forEach((b, k) => { textoObrigatorio(`${onde} → Bases → ${nomeDe(b, k)}`, 'Nome', b.nome, 28); MLS.forEach(ml => kcal(`${onde} → Bases → ${nomeDe(b, k)} (${ml} ml)`, b.kcal?.[ml])); });
  const tam = Array.isArray(m.tamanhos) ? m.tamanhos : [];
  if (tam.length !== 3 || MLS.some(ml => !tam.some(t => t.ml === ml))) erro(onde, 'Os tamanhos (300, 500 e 700 ml) foram alterados, criados ou apagados.', 'Os tamanhos são fixos no desenho do copo: só dá para mudar o preço. Desfaça a mudança.');
  tam.forEach(t => preco(`${onde} → Tamanhos → ${t.ml} ml`, t.preco));
}

// ---------- gelato ----------
const g = partes.gelato ?? {};
{
  const onde = 'Cardápio → Gelato';
  foto(onde, 'Foto', g.imagem); descricaoFoto(onde, g.alt);
  preco(onde, g.doisSabores, 'Copinho 2 sabores'); preco(onde, g.tresSabores, 'Copinho 3 sabores');
  if (texto(g.nota).length > 120) erro(onde, 'A "Observação" está longa.', 'Use até 120 letras.');
  const sab = lista(`${onde} → Sabores`, g.sabores);
  if (sab.length > 12) erro(`${onde} → Sabores`, `Há ${sab.length} sabores.`, 'O máximo que cabe na vitrine é 12.');
  repetidos(`${onde} → Sabores`, sab);
  sab.forEach((s, k) => {
    const o = `${onde} → Sabores → ${nomeDe(s, k)}`;
    textoObrigatorio(o, 'Nome', s.nome, 24); preco(o, s.preco, 'Preço de 1 sabor'); kcal(o, s.kcal, 1000);
    if (!texto(s.cor) && (!texto(s.corMassa) || !Object.keys(CORES).some(c => slug(c) === slug(s.corMassa)))) erro(o, 'Sabor novo sem "Cor da massa".', 'Escolha a cor da massa.');
  });
}

// ---------- milkshakes, combos, bebidas ----------
const ms = partes.milkshakes ?? {};
{
  const onde = 'Cardápio → Milkshakes';
  foto(onde, 'Foto', ms.imagem); descricaoFoto(onde, ms.alt);
  textoObrigatorio(onde, 'Tamanho do copo', ms.tamanho, 20);
  const itens = lista(onde, ms.itens); repetidos(onde, itens);
  itens.forEach((s, k) => { const o = `${onde} → ${nomeDe(s, k)}`; textoObrigatorio(o, 'Nome', s.nome, 28); textoObrigatorio(o, 'Descrição', s.descricao, 140); preco(o, s.preco); });
}
const cb = partes.combos ?? {};
{
  const onde = 'Cardápio → Combos';
  foto(onde, 'Foto', cb.imagem); descricaoFoto(onde, cb.alt);
  if (texto(cb.regra).length > 200) erro(onde, 'A "Regra" está longa.', 'Use até 200 letras.');
  const itens = lista(onde, cb.itens); repetidos(onde, itens);
  if (itens.length > 6) erro(onde, `Há ${itens.length} combos.`, 'O máximo é 6, para a rolagem não ficar cansativa.');
  itens.forEach((c, k) => {
    const o = `${onde} → ${nomeDe(c, k)}`;
    textoObrigatorio(o, 'Nome', c.nome, 24); textoObrigatorio(o, 'Descrição', c.descricao, 160); preco(o, c.preco);
    if (/^[.\s…-]*$/.test(texto(c.descricao)) && texto(c.descricao)) erro(o, 'A descrição está só com pontinhos.', 'Escreva o que vem no combo.');
    const ps = Array.isArray(c.partes) ? c.partes : [];
    if (ps.length > 3) erro(o, `O combo tem ${ps.length} partes.`, 'Use até 3 partes.');
    ps.forEach((p, j) => {
      const op = `${o} → parte ${j + 1}`;
      if (!['acai', 'bebida', 'milkshake'].includes(p?.tipo)) erro(op, 'Tipo da parte não escolhido.', 'Escolha Açaí, Bebida ou Milkshake.');
      if (p?.tipo === 'acai' && !MLS.includes(p.ml)) erro(op, `Tamanho do açaí inválido (${p.ml ?? 'vazio'}).`, 'Use 300, 500 ou 700.');
      if (p?.tipo === 'milkshake' && !texto(p.tamanho)) erro(op, 'Falta o tamanho do milkshake.', 'Escreva, por exemplo, "300 ml".');
    });
    if (ps.some(p => p?.tipo === 'bebida') && !(partes.bebidas?.itens ?? []).some(b => !b.esgotado)) aviso(o, 'O combo pede uma bebida, mas todas estão esgotadas.', 'Libere uma bebida ou marque o combo como esgotado.');
  });
}
{
  const onde = 'Cardápio → Bebidas';
  const itens = lista(onde, partes.bebidas?.itens); repetidos(onde, itens);
  itens.forEach((b, k) => { const o = `${onde} → ${nomeDe(b, k)}`; textoObrigatorio(o, 'Nome', b.nome, 32); preco(o, b.preco); });
}

// ---------- loja ----------
{
  const onde = 'Loja → Dados da loja';
  textoObrigatorio(onde, 'Nome da loja', loja.nome, 60);
  ['endereco', 'rua', 'bairro', 'cidade'].forEach(c => textoObrigatorio(onde, { endereco: 'Endereço completo', rua: 'Rua e número', bairro: 'Bairro', cidade: 'Cidade' }[c], loja[c], 120));
  if (!/^[A-Z]{2}$/.test(texto(loja.uf))) erro(onde, `UF inválida ("${loja.uf ?? ''}").`, 'Use a sigla com 2 letras maiúsculas (ex.: SC).');
  if (!/^55\d{10,11}$/.test(texto(loja.whatsapp))) erro(onde, `WhatsApp dos pedidos inválido ("${loja.whatsapp ?? ''}").`, 'Só números, com 55 e o DDD (ex.: 5548999990000). Sem espaço, traço ou parênteses.');
  textoObrigatorio(onde, 'WhatsApp como aparece no site', loja.whatsappTexto, 24);
  if (!/^@[A-Za-z0-9._]{1,30}$/.test(texto(loja.instagram))) erro(onde, `Instagram inválido ("${loja.instagram ?? ''}").`, 'Use o @ e o nome do perfil, sem espaço (ex.: @jambo.gelato).');
  textoObrigatorio(onde, 'Entrega', loja.entrega, 200);
  const pg = Array.isArray(loja.pagamentos) ? loja.pagamentos.filter(p => texto(p)) : [];
  if (!pg.length) erro(onde, 'Nenhuma forma de pagamento.', 'Coloque pelo menos uma (ex.: Pix).');
  textoObrigatorio(onde, 'Texto do card de compartilhamento', loja.compartilharTexto, 200);
  textoObrigatorio(onde, 'Descrição da imagem do card', loja.compartilharAlt, 200);
  if (!/^https:\/\/[^\s]+$/.test(texto(loja.site))) erro(onde, 'Endereço do site inválido.', 'Chame a Letícia.');
  const h = Array.isArray(loja.horario) ? loja.horario : [];
  const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  if (h.length !== 7) erro('Loja → Horário', `O horário tem ${h.length} dias.`, 'O horário precisa ter os 7 dias, de domingo a sábado. Desfaça a mudança.');
  h.forEach((d, k) => {
    const o = `Loja → Horário → ${DIAS[k] ?? d.dia}`;
    if (d.fechado) return;
    const ok = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(texto(v));
    if (!ok(d.abre)) erro(o, `Hora de abrir inválida ("${d.abre ?? ''}").`, 'Use o formato 13:00.');
    if (!ok(d.fecha)) erro(o, `Hora de fechar inválida ("${d.fecha ?? ''}").`, 'Use o formato 22:00 (ou 00:00 para meia-noite).');
    if (ok(d.abre) && ok(d.fecha) && d.fecha !== '00:00' && d.fecha <= d.abre) erro(o, `Fecha (${d.fecha}) antes de abrir (${d.abre}).`, 'Confira os horários. Se fecha depois da meia-noite, use 00:00.');
  });
  if (h.length === 7 && h.every(d => d.fechado)) erro('Loja → Horário', 'Todos os dias estão como fechado.', 'Deixe pelo menos um dia aberto.');
}

// ---------- textos ----------
{
  const T = (sec, campo, rotulo, max) => textoObrigatorio(`Textos da página → ${sec}`, rotulo, campo, max);
  const t = textos;
  T('Busca do Google', t.seo?.titulo, 'Título na busca', 70); T('Busca do Google', t.seo?.descricao, 'Descrição na busca', 200);
  T('Abertura', t.inicio?.titulo, 'Título', 40); T('Abertura', t.inicio?.texto, 'Texto', 180);
  T('Abertura', t.inicio?.botaoCardapio, 'Botão do cardápio', 24); T('Abertura', t.inicio?.botaoMontar, 'Botão de montar', 24);
  T('Açaí', t.acai?.titulo, 'Título', 50); T('Açaí', t.acai?.chamada, 'Chamada para montar', 120); T('Açaí', t.acai?.botao, 'Botão', 24);
  T('Gelato', t.gelato?.titulo, 'Título', 40); T('Gelato', t.gelato?.botao, 'Botão', 24);
  T('Monte seu Jambo', t.monte?.titulo, 'Título', 60);
  T('Milkshakes', t.milkshakes?.titulo, 'Título', 70);
  T('Bebidas', t.bebidas?.titulo, 'Título', 40);
  T('Fim da página', t.final?.titulo, 'Título', 40); T('Fim da página', t.final?.botao, 'Botão', 24);
  T('Visite', t.visite?.titulo, 'Título', 50); T('Visite', t.visite?.texto, 'Texto', 240);
  [1, 2].forEach(k => {
    const o = `Textos da página → Visite → Foto ${k}`;
    if (!texto(t.visite?.[`foto${k}`])) { aviso(o, 'Sem foto.', 'A seção fica com uma foto a menos.'); return; }
    foto(o, `Foto ${k}`, t.visite[`foto${k}`]); descricaoFoto(o, t.visite[`foto${k}Descricao`]);
    if (texto(t.visite[`foto${k}Legenda`]).length > 140) erro(o, 'A legenda está longa.', 'Use até 140 letras.');
  });
  T('Pedido', t.pedido?.privacidade, 'Aviso de privacidade', 160);
  // lembrete de coerência: o endereço aparece escrito no texto da seção Visite
  if (texto(loja.rua) && texto(t.visite?.texto) && !slug(t.visite.texto).includes(slug(texto(loja.rua).split(',')[0]))) aviso('Textos da página → Visite → Texto', 'O texto não cita a rua da loja.', 'Se o endereço mudou, confira se o texto da seção Visite ainda está certo.');
}

// ---------- resultado ----------
const linha = x => `• ${x.onde}\n  Problema: ${x.problema}\n  Como resolver: ${x.solucao}`;
let saida = '';
if (avisos.length) saida += `\n⚠️  ${avisos.length} aviso(s) (não impedem a publicação):\n\n${avisos.map(linha).join('\n\n')}\n`;
if (erros.length) saida += `\n❌ PUBLICAÇÃO BLOQUEADA: ${erros.length} problema(s) no conteúdo.\nO site continua no ar com a versão anterior. Corrija no editor e salve de novo.\n\n${erros.map(linha).join('\n\n')}\n`;
else saida += `\n✅ Conteúdo conferido: nenhum problema que impeça a publicação.\n`;
console.log(saida);
if (process.env.GITHUB_STEP_SUMMARY) {
  const md = x => `- **${x.onde}**  \n  ${x.problema}  \n  _Como resolver:_ ${x.solucao}`;
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
    erros.length ? `## ❌ Publicação bloqueada\nO site continua no ar com a versão anterior. Corrija no editor (Pages CMS) e salve de novo.\n\n${erros.map(md).join('\n')}` : '## ✅ Conteúdo conferido',
    avisos.length ? `\n\n### ⚠️ Avisos (não impedem a publicação)\n${avisos.map(md).join('\n')}` : ''
  ].join('') + '\n');
}
process.exit(erros.length ? 1 : 0);
