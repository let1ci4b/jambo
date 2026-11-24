import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { renderizar, tarefasDeImagem } from './ferramentas/paginas.mjs';

// O cardápio (content/*.json) entra no HTML no build: funciona sem JS e o Google lê.
// Fotos novas enviadas pelo editor viram webp (com corte na proporção do lugar) depois do build.
let comando = 'build';
const cardapioNoHtml = {
  name: 'jambo-cardapio-no-html',
  configResolved(c) { comando = c.command; },
  transformIndexHtml: { order: 'pre', handler: html => renderizar(html, { comando }) },
  // trava: o arquivo de cupons nunca pode entrar no site publicado (é só para a loja conferir)
  generateBundle() {
    const usados = [...this.getModuleIds()].filter(id => /content[\\/]cupons\.json/.test(id));
    if (usados.length) this.error('O arquivo de cupons (content/cupons.json) foi importado pelo site. Os cupons não podem ir para o site publicado.');
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
        404: resolve(import.meta.dirname, '404.html')
      }
    }
  }
});
