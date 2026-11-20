# JAMBO — Açaí & Gelato

Site-cardápio de página única para uma loja de açaí e gelato. **Marca fictícia:** é um projeto demonstrativo do portfólio de [Letícia Beatriz](https://github.com/let1ci4b), que cria sites simples e acessíveis para pequenos negócios.

**Ver o site:** https://let1ci4b.github.io/jambo/

## O que o site faz

- **Abertura animada:** um vídeo do açaí toca dentro das letras "JAMBO". Tem botão "Pular", e a abertura fica parada para quem prefere menos movimento.
- **Cardápio:** açaí da casa, gelato, milkshakes, combos e bebidas, com preço e calorias aproximadas.
- **Monte seu Jambo:** a pessoa arrasta os ingredientes para o copo (ou toca neles, no celular) e vê o preço e as calorias mudarem na hora. Também dá para montar por uma lista, sem arrastar.
- **Pedido pelo WhatsApp:** o carrinho monta uma mensagem organizada com os itens, o total e os dados do cliente.
- **Menu de acessibilidade:** tamanho do texto, alto contraste, parar animações, fonte mais legível, mais espaço entre linhas e destaque de links.
- **Funciona sem JavaScript:** o cardápio já vem escrito no HTML.

## Qualidade

| Teste | Resultado |
|---|---|
| Acessibilidade (axe-core, WCAG 2.2 AA), computador e celular | 0 violações |
| Validador de HTML (html-validate) | 0 erros |
| Lighthouse no celular | Desempenho 96 · Acessibilidade 100 · Boas práticas 100 |
| Peso da primeira carga | ~669 KB |
| Texto aumentado para 160% no celular | sem rolagem para o lado |

## Tecnologias

HTML, CSS e JavaScript, com [Vite](https://vite.dev) e sem framework. GSAP cuida das animações e three.js dos copos 3D. O cardápio fica em arquivos JSON, que podem ser editados pelo [Pages CMS](https://pagescms.org).

## Rodar no computador

1. Instale o [Node.js 22](https://nodejs.org).
2. Na pasta do projeto, rode:
   ```sh
   npm install
   npm run dev
   ```
3. Abra http://localhost:5173.

Para ver a versão final: `npm run build` e depois `npm run preview` (http://localhost:4173).

## O que muda e onde

| O quê | Arquivo |
|---|---|
| Preços, nomes, descrições, calorias, "esgotado" | `content/cardapio.json` |
| Horário, endereço, WhatsApp, frase | `content/loja.json` |
| Cores e fontes | `src/estilo.css` (bloco `:root`) |
| Fotos | `public/assets/img/` |
| Ingredientes (desenhos) | `public/assets/ingredientes/` |
| Abertura | `public/assets/js/abertura.js` e `public/assets/video/hero/` |
| Copos 3D | `public/assets/3d/` |
| Textos legais | `privacidade.html`, `acessibilidade.html` |

## Pastas

- `index.html`, `privacidade.html`, `acessibilidade.html`, `404.html`: as páginas. Os marcadores `<!--@...-->` são preenchidos na hora do build.
- `src/`: estilo e código (carrinho, montador, combos, cálculo de preço e calorias, menu de acessibilidade).
- `content/`: dados do cardápio e da loja.
- `public/`: imagens, vídeos, fontes, modelos 3D e scripts prontos.
- `ferramentas/`: gera o HTML do cardápio no build, a versão de prévia e os arquivos de apoio (logo, modelos 3D, vídeo da abertura).
- `especificacao/`: briefing, conceito, plano de imagens e regras do projeto.

## Publicar

- **GitHub Pages (automático):** cada envio para a branch `main` publica o site pelo arquivo `.github/workflows/pages.yml`.
- **Cloudflare Pages:** comando de build `npm run build`, pasta de saída `dist`, Node 22.

---

Fotos e vídeos gerados por IA para a demonstração. Preços, calorias e textos são fictícios.
