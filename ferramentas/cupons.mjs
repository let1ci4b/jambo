// Cupons que o site consegue conferir sozinho.
// O código escrito NÃO vai para o site: vai só um hash (SHA-256) dele, e o desconto.
// O navegador calcula o hash do que o cliente digitou e compara.
import crypto from 'node:crypto';
import { lerConteudo } from './conteudo.mjs';

export const SAL = 'jambo-cupom:';
export const hashCupom = codigo => crypto.createHash('sha256').update(SAL + codigo).digest('hex');
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const num = v => (typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.')));

function ativos() {
  const { cupons } = lerConteudo();
  const lista = Array.isArray(cupons?.cupons) ? cupons.cupons : [];
  const h = hoje();
  return lista.filter(c => c && c.ativo !== false
    && /^[A-Z0-9-]{3,20}$/.test(String(c.codigo ?? ''))
    && (c.tipo === 'porcentagem' || c.tipo === 'valor') && num(c.valor) > 0
    && (!c.validoAte || c.validoAte >= h));
}

export function cuponsDoSite() {
  return ativos().map(c => ({
    h: hashCupom(c.codigo),
    tipo: c.tipo,
    valor: Math.round(num(c.valor) * 100) / 100,
    minimo: num(c.minimo) > 0 ? Math.round(num(c.minimo) * 100) / 100 : 0,
    ate: c.validoAte || ''
  }));
}
cuponsDoSite.codigosAtivos = () => ativos().map(c => c.codigo);
