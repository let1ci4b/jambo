# JAMBO — Açaí & Gelato · site demonstrativo

Site-cardápio de página única (marca fictícia, exemplo do portfólio da Letícia Beatriz).
Feito com Vite (sem framework). O conteúdo vem de `content/` (cardápio, ingredientes, loja e textos) e entra no HTML no build, depois de conferido por `ferramentas/validar.mjs`.

## Ver no computador
1. Instale o Node.js 22 (nodejs.org) uma vez.
2. Nesta pasta, rode: `npm install` e depois `npm run dev`.
3. Abra o endereço que aparecer (http://localhost:5173).

Para ver a versão final (a mesma que vai para o ar): `npm run build` e `npm run preview` (http://localhost:4173).

## O que muda e onde
| O quê | Arquivo |
|---|---|
| Preços, nomes, descrições, calorias, "esgotado" | `content/cardapio/*.json` e `content/ingredientes/*.json` (ou pelo Pages CMS) |
| Horário, endereço, WhatsApp, pagamento | `content/loja.json`; textos das seções em `content/textos.json` (ou pelo Pages CMS) |
| Cores e fontes | `src/estilo.css` (bloco `:root`) |
| Fotos | `public/assets/img/` |
| Ingredientes (desenhos) | `public/assets/ingredientes/` |
| Abertura (tempo, cores da onda) | `public/assets/js/abertura.js` |
| Copos 3D | `public/assets/3d/` |
| Quadros do vídeo "o bowl se monta" | `public/assets/video/montar/` |
| Textos legais | `privacidade.html`, `termos.html`, `acessibilidade.html` |
| Rodapé (todas as páginas) | `ferramentas/paginas.mjs` (função `rodape`), com os dados de `content/loja.json` |

## Pastas
- `index.html`, `privacidade.html`, `termos.html`, `acessibilidade.html`, `404.html`: as páginas (com marcadores `<!--@...-->` que o build preenche).
- `src/`: estilo e código (carrinho, montador, movimento, cálculo de preço e calorias).
- `ferramentas/paginas.mjs`: gera o HTML do cardápio no build. `ferramentas/video/` e `ferramentas/3d/`: arquivos de reserva que não vão para o site (abertura em vídeo para o Instagram, copo de gelato 3D).
- `.pages.yml`: configuração do Pages CMS. `public/robots.txt`: bloqueia o Google (site demonstrativo).
- `especificacao/`: PROMPT, CLAUDE.md, imagens.md, conceito e a prévia do kit.

## Publicar (Cloudflare Pages)
Repositório no GitHub → Cloudflare Pages → comando de build `npm run build`, pasta de saída `dist`, Node 22. Ligar o Web Analytics no painel do projeto.
