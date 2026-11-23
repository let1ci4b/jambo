// Lê os arquivos do editor (content/) no Node: build, validação e testes.
import fs from 'node:fs';
import path from 'node:path';

export const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const SECOES = ['acai', 'montador', 'gelato', 'milkshakes', 'combos', 'bebidas'];

// lê um JSON; se estiver quebrado, devolve o erro em vez de travar (a validação explica o problema)
export function lerJson(rel) {
  const texto = fs.readFileSync(path.join(raiz, rel), 'utf8');
  try { return { dados: JSON.parse(texto) }; } catch (e) { return { erro: e.message }; }
}

export function lerConteudo() {
  const erros = [];
  const ler = rel => { const r = lerJson(rel); if (r.erro) erros.push({ arquivo: rel, msg: `o arquivo está corrompido (${r.erro})` }); return r.dados ?? {}; };
  const partes = Object.fromEntries(SECOES.map(s => [s, ler(`content/cardapio/${s}.json`)]));
  const pasta = path.join(raiz, 'content/ingredientes');
  partes.ingredientes = Object.fromEntries(fs.readdirSync(pasta).filter(f => f.endsWith('.json')).sort()
    .map(f => [f.replace(/\.json$/, ''), ler(`content/ingredientes/${f}`)]));
  return { partes, loja: ler('content/loja.json'), textos: ler('content/textos.json'), errosDeLeitura: erros };
}
