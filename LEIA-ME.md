# JAMBO — Açaí & Gelato · site demonstrativo

Site-cardápio de página única (marca fictícia, exemplo do portfólio da Letícia Beatriz).
Feito com Vite (sem framework). O cardápio vem de `content/cardapio.json` e a loja de `content/loja.json`; os dois entram no HTML no build.

## Ver no computador
1. Instale o Node.js 22 (nodejs.org) uma vez.
2. Nesta pasta, rode: `npm install` e depois `npm run dev`.
3. Abra o endereço que aparecer (http://localhost:5173).

Para ver a versão final (a mesma que vai para o ar): `npm run build` e `npm run preview` (http://localhost:4173).

## O que muda e onde
| O quê | Arquivo |
|---|---|
| Preços, nomes, descrições, calorias, "esgotado" | `content/cardapio.json` (ou pelo Pages CMS) |
| Horário, endereço, WhatsApp, frase | `content/loja.json` (ou pelo Pages CMS) |
| Cores e fontes | `src/estilo.css` (bloco `:root`) |
| Fotos | `public/assets/img/` |
| Ingredientes (desenhos) | `public/assets/ingredientes/` |
| Abertura (tempo, cores da onda) | `public/assets/js/abertura.js` |
| Copos 3D | `public/assets/3d/` |
| Quadros do vídeo "o bowl se monta" | `public/assets/video/montar/` |
| Textos legais | `privacidade.html`, `acessibilidade.html` |

## Pastas
- `index.html`, `privacidade.html`, `acessibilidade.html`, `404.html`: as páginas (com marcadores `<!--@...-->` que o build preenche).
- `src/`: estilo e código (carrinho, montador, movimento, cálculo de preço e calorias).
- `ferramentas/paginas.mjs`: gera o HTML do cardápio no build. `ferramentas/video/` e `ferramentas/3d/`: arquivos de reserva que não vão para o site (abertura em vídeo para o Instagram, copo de gelato 3D).
- `.pages.yml`: configuração do Pages CMS. `public/robots.txt`: bloqueia o Google (site demonstrativo).
- `especificacao/`: PROMPT, CLAUDE.md, imagens.md, conceito e a prévia do kit.

## Publicar (Cloudflare Pages)
Repositório no GitHub → Cloudflare Pages → comando de build `npm run build`, pasta de saída `dist`, Node 22. Ligar o Web Analytics no painel do projeto.
