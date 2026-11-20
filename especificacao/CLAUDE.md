# CLAUDE.md · Projeto JAMBO — Açaí & Gelato (site demonstrativo)

Guia permanente do projeto. Leia antes de qualquer mudança. A especificação seção por seção está no `PROMPT.md`; as imagens, no `imagens.md`.

## 1. O que é
Site-cardápio de página única para uma loja de açaí, gelato e milkshakes (marca fictícia, exemplo do portfólio da Letícia Beatriz). Ação principal: montar o pedido e mandar pelo WhatsApp. Nível 3: abertura cinematográfica em código, 3 movimentos de seção e copos em 3D.

## 2. Design system
```css
:root{
  --creme:#F5EBDD; --roxo:#40204F; --noite:#2A1233;
  --lilas-claro:#D9C3EA; --lilas:#A67CC4; --folha:#78966A; --roxo-08:rgba(64,32,79,.08);
  --f-titulo:"Bricolage Grotesque","Arial Black",system-ui,sans-serif;
  --f-texto:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --e1:8px;--e2:16px;--e3:24px;--e4:32px;--e5:48px;--e6:64px;--e7:96px;--e8:128px;
  --lado:clamp(20px,5vw,80px); --secao:clamp(72px,12vh,160px);
  --r-botao:999px; --r-cartao:28px; --r-adesivo:18px;
}
```
- **Cores nunca em hex dentro das seções**: sempre a variável.
- Escala de fontes: tabela 1.3 do `PROMPT.md` (gigante, h1, h2, h3, sobretítulo, corpo, preço, legenda, botão).
- **Componentes:**
  - Botão principal: pílula, 48 px (56 px no final), fundo `--roxo`, texto `--creme`; sobre roxo/noite, invertido.
  - Botão contornado: 2 px `currentColor`, fundo transparente.
  - Adesivo de ingrediente: o SVG já tem a borda creme; nunca adicionar sombra pesada (só no arrasto).
  - Fio: 1 px `--roxo-08` (sobre creme) ou `rgba(245,235,221,.16)` (sobre roxo).
  - Pílula "Imagem ilustrativa": DM Sans 13 px, `--roxo` sobre `--creme`, padding 4 × 10 px.

## 3. Regras de qualidade
- **Uma ideia por seção.** Nada de grade de cards iguais repetida (o cardápio é lista tipográfica).
- **Textos curtos e concretos**, com as frases da própria marca.
- **Nada inventado:** descrições, calorias dos bowls da casa e o WhatsApp da Letícia ficam `[preencher]` até chegarem. Nenhuma avaliação, número de clientes, prêmio ou "o melhor de Floripa".
- **Palavras proibidas:** "o melhor", "imperdível", "últimas unidades", "só hoje", "saudável" (o açaí com xarope não é alimento de dieta), "fit", "sem culpa", "natural" sem prova.
- **Preço:** sempre o da tabela, calculado pelo site; a mensagem diz "a confirmar pela loja".
- **Imagens de produto:** fiéis à porção real e com "Imagem ilustrativa".
- **Orçamento de peso (nível 3):** primeira carga (sem o 3D) até **1,5 MB**: HTML + CSS + JS da página + fontes (~120 KB) + abertura (~25 KB) + as imagens da primeira tela de rolagem. O 3D (three.js ~170 KB gzip + GLB ~730 KB) só carrega perto da seção Combos. Medir e informar o peso total no relatório.
- Animar só `transform`, `opacity` e `clip-path`; 60 fps; CLS 0; LCP < 2,5 s no celular (o LCP é o h1 da abertura, em texto).

## 4. Como conferir
```bash
npm run build && npx serve dist -l 4173
npx playwright screenshot --viewport-size=1440,840 http://localhost:4173 prints/1440.png --full-page
npx playwright screenshot --viewport-size=390,844 http://localhost:4173 prints/390.png --full-page
# movimento reduzido: rodar o mesmo com --color-scheme light e emulação de prefers-reduced-motion (script prints.mjs)
npx lighthouse http://localhost:4173 --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo
npx @axe-core/cli http://localhost:4173
npx html-validate "dist/**/*.html"
```
- Prints em 1440 × 840 e 390 × 844, nas posições: abertura 0 s, 3 s e 8 s; cada bowl ativo; montador vazio e com US-01; combos em 15%, 50% e 85%; carrinho aberto; rodapé. Repetir com movimento reduzido.
- Testar o montador com o dedo (DevTools, modo toque) e com o teclado.
- Conferir a mensagem do WhatsApp copiando o link gerado.

## 5. Checklist de aceitação (o que se vê)
1. No primeiro segundo, a tela é creme, a onda roxa começa a subir e "Pular" e "Pedir agora" já estão visíveis.
2. Entre 2 e 3 s, o açaí cobre a tela e frutas em adesivo saltam dele; aos 8 s a onda está parada no terço de baixo, com 5 frutas boiando, e a logo JAMBO e "Seu verão, do seu jeito." legíveis no creme, sem nada atrás.
3. "Pular" leva direto ao quadro final e o foco vai para "Açaí da casa".
4. Em Açaí da casa (computador), a foto fica parada à esquerda enquanto a lista anda; ao chegar em cada bowl, a foto troca subindo de baixo e 3 ou 4 frutas daquele bowl pousam na borda da foto.
5. Em toda foto de produto aparece "Imagem ilustrativa", legível.
6. Antes do montador, o link "Monte pelo cardápio" é o próximo item do Tab depois do último "Adicionar" do açaí.
7. No montador, ao arrastar banana, morango, granola e paçoca e o creme de avelã para o copo de 500 ml, o total mostra **R$ 30,90** e **≈ 807 kcal**; no celular, o mesmo resultado tocando nos adesivos.
8. Na lista "Montar pela lista", as mesmas escolhas dão R$ 30,90 e o leitor de tela anuncia o novo total.
9. Em Combos (computador), a tigela e o copo entram dos lados e param juntos; ao rolar, viram 2 tigelas e depois tigela + milkshake, e o nome e o preço mudam junto; a régua marca o combo.
10. No celular, Combos são 3 blocos com foto e texto, sem 3D.
11. O carrinho abre pela direita, o foco vai para "Seu pedido", Esc fecha; sem nome, aparece "Falta preencher: Nome".
12. **"Pedir pelo WhatsApp" abre o WhatsApp com a mensagem pronta**, um item por linha, total "(a confirmar pela loja)", nome, entrega e pagamento.
13. Com "reduzir movimento" ligado, nada se mexe sozinho: a abertura já está no quadro final, as fotos aparecem paradas e Combos vira lista.
14. Do início ao fim só com o teclado: dá para montar um bowl, adicionar um gelato e chegar ao WhatsApp, com o foco sempre visível.
15. Uma pessoa que nunca viu o site faz um pedido de açaí pelo celular sem ajuda.

## 6. O que muda e onde
| O quê | Arquivo | Precisa de material novo? |
|---|---|---|
| Preços, nomes, descrições, kcal, "esgotado" | `content/cardapio.json` (Pages CMS) | Não |
| Regras do montador (toppings grátis, valor do adicional) | `content/cardapio.json` → `montador` | Não |
| Horário, endereço, WhatsApp, frase de destaque | `content/loja.json` (Pages CMS) | Não |
| Fotos dos bowls, gelato, shakes, combos | `assets/img/` + campo imagem no CMS (com `alt`) | Sim: foto nova pelo `imagens.md` |
| Ingredientes do montador (desenho) | `assets/ingredientes/<id>.svg` + `lista.json` | Novo ingrediente: desenho novo |
| Cores e fontes | `src/estilo.css` (`:root`) | Não (só a Letícia) |
| Abertura (tempo, frutas, cores da onda) | `assets/js/abertura.js` (constantes no topo) | Não |
| Copos 3D | `assets/3d/*.glb` (gerados por `ferramentas/modelos3d.mjs`) | Não |
| Logo | `assets/logo/*.svg` | Logo real do cliente substitui a tipográfica |
| Textos legais | `privacidade.html`, `acessibilidade.html` | Atualizar a data do teste |
| Aviso de site demonstrativo | rodapé, `index.html` | Não |
