import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { cuponsDoSite } from './ferramentas/cupons.mjs';
import { renderizar, tarefasDeImagem } from './ferramentas/paginas.mjs';

// O cardápio (content/*.json) entra no HTML no build: funciona sem JS e o Google lê.
// Fotos novas enviadas pelo editor viram webp (com corte na proporção do lugar) depois do build.
let comando = 'build';
const cardapioNoHtml = {
  name: 'jambo-cardapio-no-html',
  configResolved(c) { comando = c.command; },
  transformIndexHtml: { order: 'pre', handler: html => renderizar(html, { comando }) },
  // Cupons: o site recebe só a "impressão digital" (hash) de cada código ativo, nunca o código escrito.
  resolveId(id) { if (id === 'virtual:cupons') return '\0virtual:cupons'; },
  load(id) {
    if (id !== '\0virtual:cupons') return;
    this.addWatchFile(resolve(import.meta.dirname, 'content/cupons.json'));
    return `export default ${JSON.stringify(cuponsDoSite())};`;
  },
  // trava: o arquivo de cupons, com os códigos escritos, nunca pode entrar no site publicado
  generateBundle(_, bundle) {
    const usados = [...this.getModuleIds()].filter(id => /content[\\/]cupons\.json/.test(id));
    if (usados.length) this.error('O arquivo de cupons (content/cupons.json) foi importado pelo site. Os códigos não podem ir escritos para o site publicado.');
    const codigos = cuponsDoSite.codigosAtivos();
    for (const [nome, arq] of Object.entries(bundle)) {
      const texto = arq.type === 'chunk' ? arq.code : (typeof arq.source === 'string' ? arq.source : '');
      const achado = codigos.find(c => new RegExp(`["'\`]${c}["'\`]`).test(texto));
      if (achado) this.error(`O código do cupom ${achado} apareceu escrito em ${nome}. Os códigos não podem ir escritos para o site publicado.`);
    }
  },
  async closeBundle() {
    if (comando !== 'build') return;
    if (!tarefasDeImagem.size) return;
    const sharp = (await import('sharp')).default;
    for (const [saida, { origem, largura, altura }] of tarefasDeImagem) {
      const destino = resolve(import.meta.dirname, 'dist' + saida);
      fs.mkdirSync(resolve(destino, '..'), { recursive: true });
      await sharp(origem).rotate().resize({ width: largura, height: altura ?? undefined, fit: 'cover', withoutEnlargement: !altura }).webp({ quality: 78 }).toFile(destino);
    }
    console.log(`fotos novas otimizadas: ${tarefasDeImagem.size}`);
  },
  handleHotUpdate({ file, server }) {
    if (file.includes('/content/') || file.includes('/ferramentas/')) server.ws.send({ type: 'full-reload' });
  }
};

export default defineConfig({
  base: '/',
  plugins: [cardapioNoHtml],
  build: {
    outDir: 'dist',
    assetsDir: 'build', // "assets/" fica para os arquivos prontos de public/assets
    target: 'es2020',
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        privacidade: resolve(import.meta.dirname, 'privacidade.html'),
        acessibilidade: resolve(import.meta.dirname, 'acessibilidade.html'),
        termos: resolve(import.meta.dirname, 'termos.html'),
        404: resolve(import.meta.dirname, '404.html')
      }
    }
  }
});
