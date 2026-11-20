import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { renderizar } from './ferramentas/paginas.mjs';

// O cardápio (content/*.json) entra no HTML no build: funciona sem JS e o Google lê.
const cardapioNoHtml = {
  name: 'jambo-cardapio-no-html',
  transformIndexHtml: { order: 'pre', handler: html => renderizar(html) },
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
