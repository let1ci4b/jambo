// Carrinho: vive na memória e no sessionStorage (com try/catch). Nada vai para servidor.
// O pedido termina no WhatsApp, com a mensagem no modelo da análise interna (seção 6).
import loja from '../content/loja.json';
import { reais } from './calculo.js';

const $ = (s, el = document) => el.querySelector(s);
const CHAVE = 'jambo-pedido';
let itens = [];
try { itens = JSON.parse(sessionStorage.getItem(CHAVE) || '[]'); } catch { itens = []; }
const salvar = () => { try { sessionStorage.setItem(CHAVE, JSON.stringify(itens)); } catch { /* modo privado */ } };

const dialogo = $('#carrinho');
const lista = $('#itens');
const form = $('#pedido-form');
let jaAbriu = false;
let quemAbriu = null;

// ---------- aviso no topo ("Adicionado ao pedido") ----------
let tAviso;
export function avisar(texto) {
  const a = $('#aviso');
  a.textContent = texto; a.classList.add('on');
  clearTimeout(tAviso); tAviso = setTimeout(() => { a.classList.remove('on'); a.textContent = ''; }, 2000);
}

// ---------- horário (Florianópolis) ----------
function agoraLoja() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
    .formatToParts(new Date()).map(x => [x.type, x.value]));
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { dia, min: Number(p.hour) * 60 + Number(p.minute) };
}
const emMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const hora = h => h.replace(':00', 'h').replace(':', 'h');
const fechaMin = h => (h === '00:00' ? 1440 : emMin(h)); // fecha à meia-noite
export function situacao() {
  const { dia, min } = agoraLoja();
  const hoje = loja.horario[dia];
  if (!hoje.fechado && min >= emMin(hoje.abre) && min < fechaMin(hoje.fecha)) return { aberto: true, dia };
  if (!hoje.fechado && min < emMin(hoje.abre)) return { aberto: false, dia, texto: `Abrimos hoje às ${hora(hoje.abre)}.` };
  // próximo dia aberto (pula dias marcados como fechados)
  const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  for (let k = 1; k <= 7; k++) {
    const d = (dia + k) % 7, h = loja.horario[d];
    if (h && !h.fechado) return { aberto: false, dia, texto: k === 1 ? `Abrimos amanhã às ${hora(h.abre)}.` : `Abrimos ${nomes[d] === 'sábado' || nomes[d] === 'domingo' ? 'no' : 'na'} ${nomes[d]} às ${hora(h.abre)}.` };
  }
  return { aberto: false, dia, texto: '' };
}

// ---------- itens ----------
export function adicionar({ id, nome, detalhes = '', linhas = null, preco }, origem) {
  const chave = id + '|' + detalhes;
  const ja = itens.find(i => i.chave === chave);
  if (ja) ja.qtd += 1; else itens.push({ chave, nome, detalhes, linhas: linhas ?? (detalhes ? [detalhes] : []), preco: Number(preco), qtd: 1 });
  salvar(); desenhar(true);
  if (!jaAbriu) abrir(origem);
  else avisar('Adicionado ao pedido');
}

function total() { return itens.reduce((s, i) => s + i.preco * i.qtd, 0); }
function contagem() { return itens.reduce((s, i) => s + i.qtd, 0); }

function desenhar(pular) {
  const n = contagem();
  document.querySelectorAll('.conta').forEach(c => {
    c.textContent = n;
    if (pular) { c.classList.remove('pulo'); void c.offsetWidth; c.classList.add('pulo'); }
  });
  document.querySelectorAll('.conta-leitor').forEach(c => { c.textContent = `, ${n} ${n === 1 ? 'item' : 'itens'} no pedido`; });
  $('#vazio').hidden = itens.length > 0;
  $('#carrinho-total').textContent = reais(total());
  lista.innerHTML = '';
  itens.forEach((it, k) => {
    const li = document.createElement('li');
    li.innerHTML = `<div><p class="i-nome"></p>${(it.linhas ?? []).length ? '<ul class="i-det"></ul>' : ''}</div><p class="i-preco"></p>
      <div class="qtd"><button class="btn-icone menos" type="button"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span class="so-leitor">Tirar um</span></button>
      <output aria-live="polite"></output>
      <button class="btn-icone mais" type="button"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span class="so-leitor">Mais um</span></button>
      <button class="link-btn remover" type="button">Remover</button></div>`;
    li.querySelector('.i-nome').textContent = it.nome;
    const det = li.querySelector('.i-det');
    if (det) (it.linhas ?? []).forEach(l => { const x = document.createElement('li'); x.textContent = l; det.appendChild(x); });
    li.querySelector('.i-preco').textContent = reais(it.preco * it.qtd);
    li.querySelector('output').textContent = it.qtd;
    li.querySelector('.menos .so-leitor').textContent = `Tirar um ${it.nome}`;
    li.querySelector('.mais .so-leitor').textContent = `Mais um ${it.nome}`;
    li.querySelector('.remover').setAttribute('aria-label', `Remover ${it.nome}`);
    li.querySelector('.menos').addEventListener('click', () => mudar(k, -1));
    li.querySelector('.mais').addEventListener('click', () => mudar(k, +1));
    li.querySelector('.remover').addEventListener('click', () => mudar(k, -it.qtd));
    lista.appendChild(li);
  });
}

function mudar(k, d) {
  const nome = itens[k].nome;
  itens[k].qtd += d;
  const saiu = itens[k].qtd <= 0;
  if (saiu) itens.splice(k, 1);
  salvar(); desenhar(false);
  // foco não se perde: volta para o mesmo lugar da lista (ou para o título)
  const botoes = lista.querySelectorAll('li');
  if (saiu) { avisarDentro(`${nome} removido`); (botoes[Math.min(k, botoes.length - 1)]?.querySelector('.mais') ?? $('#carrinho-t')).focus(); }
  else botoes[k]?.querySelector(d > 0 ? '.mais' : '.menos').focus();
}
const statusCarrinho = Object.assign(document.createElement('p'), { className: 'so-leitor' });
statusCarrinho.setAttribute('role', 'status');
dialogo.appendChild(statusCarrinho);
function avisarDentro(t) { statusCarrinho.textContent = t; setTimeout(() => { statusCarrinho.textContent = ''; }, 2000); }

// ---------- abrir e fechar ----------
export function abrir(origem) {
  quemAbriu = origem ?? document.activeElement;
  jaAbriu = true;
  const s = situacao();
  const f = $('#fechado');
  f.hidden = s.aberto;
  if (!s.aberto) f.textContent = `Estamos fechados agora. ${s.texto} Seu pedido fica agendado para quando abrir.`;
  document.documentElement.classList.add('carrinho-aberto');
  dialogo.showModal();
  $('#carrinho-t').focus();
}
function fechar() { dialogo.close(); }
dialogo.addEventListener('close', () => {
  document.documentElement.classList.remove('carrinho-aberto');
  if (quemAbriu && document.contains(quemAbriu)) quemAbriu.focus();
});
dialogo.querySelector('[data-fechar]').addEventListener('click', fechar);
dialogo.addEventListener('click', e => { if (e.target === dialogo) fechar(); }); // clique fora
document.querySelectorAll('.abre-carrinho').forEach(b => b.addEventListener('click', () => abrir(b)));

// ---------- formulário ----------
const campoEnd = $('#campo-endereco');
form.addEventListener('change', e => { if (e.target.name === 'modo') campoEnd.hidden = form.modo.value !== 'entrega'; });

function erro(campo, msgEl, mostrar) {
  campo.setAttribute('aria-invalid', mostrar ? 'true' : 'false');
  msgEl.hidden = !mostrar;
}

// Mensagem do WhatsApp em blocos, fácil de ler no celular do atendente e do cliente.
// *texto* sai em negrito no WhatsApp; cada item numerado com os detalhes em tópicos.
const LINHA = '━━━━━━━━━━━━';
export function montarMensagem(dados) {
  const s = situacao();
  const L = ['*NOVO PEDIDO · JAMBO*'];
  if (!s.aberto) L.push('_Pedido agendado para quando a loja abrir_');
  L.push(LINHA, '*ITENS*', '');
  itens.forEach((it, k) => {
    L.push(`*${k + 1}. ${it.qtd}x ${it.nome}*`);
    for (const l of it.linhas ?? []) L.push(`   • ${l}`);
    L.push(`   ${it.qtd > 1 ? `${it.qtd} × ${reais(it.preco)} = ` : ''}*${reais(it.preco * it.qtd)}*`, '');
  });
  L.push(LINHA, `*TOTAL: ${reais(total())}*`, '_(a confirmar pela loja)_', LINHA);
  L.push('*CLIENTE*', `Nome: ${dados.nome}`);
  L.push(dados.modo === 'entrega' ? `Entrega: ${dados.endereco}` : 'Retirada na loja');
  L.push(`Pagamento: ${dados.pagamento}`);
  if (dados.obs) L.push(`Observações: ${dados.obs}`);
  return L.join('\n');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const resumo = $('#resumo-erro');
  resumo.setAttribute('role', 'alert');
  const faltam = [];
  const nome = form.nome.value.trim();
  const entrega = form.modo.value === 'entrega';
  const end = form.endereco.value.trim();
  erro(form.nome, $('#e-nome'), !nome); if (!nome) faltam.push(['Nome', form.nome]);
  erro(form.endereco, $('#e-endereco'), entrega && !end); if (entrega && !end) faltam.push(['Endereço', form.endereco]);
  if (!itens.length) faltam.push(['um item no pedido', null]);
  if (faltam.length) {
    resumo.textContent = 'Falta preencher: ' + faltam.map(f => f[0]).join(', ');
    (faltam.find(f => f[1])?.[1] ?? $('#carrinho-t')).focus();
    return;
  }
  resumo.textContent = '';
  const msg = montarMensagem({ nome, modo: form.modo.value, endereco: end, pagamento: form.pagamento.value, obs: form.obs.value.trim() });
  const url = `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(msg)}`;
  // link de verdade (passa por bloqueador de pop-up e funciona dentro de molduras)
  const a = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener' });
  document.body.appendChild(a); a.click(); a.remove();
});

desenhar(false);
