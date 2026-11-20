# PROMPT · Site da JAMBO — Açaí & Gelato (demonstrativo do portfólio)

## 0. Antes de começar
1. Leia `CLAUDE.md` (regras, design system, conferência e checklist) e `imagens.md` (vagas e arquivos).
2. Os assets já prontos estão em `site/assets/` (logo, 19 ingredientes, 4 modelos 3D, abertura em JS, vídeos, fontes, three.js local). **Não redesenhe nada que já existe ali**; só use.
3. Monte o site completo, rode a conferência do `CLAUDE.md` e termine com a lista do que ainda é provisório (`[preencher]` e imagens `prov-*`).
4. Nada de login, banco de dados ou pagamento. O pedido termina no WhatsApp.

## 1. TOKENS (o único bloco que muda de um cliente para outro)

### 1.1 Cores (variáveis CSS; nunca hex solto nas seções)
| Variável | Hex | Papel | Contraste |
|---|---|---|---|
| `--creme` | `#F5EBDD` | Fundo principal; texto sobre roxo | 11,6:1 com `--roxo` |
| `--roxo` | `#40204F` | Texto, títulos, botão principal, fundo de seção de produto | — |
| `--noite` | `#2A1233` | Fundo do carrinho e do rodapé | 14,5:1 com `--creme` |
| `--lilas-claro` | `#D9C3EA` | Texto secundário e preços sobre roxo/noite | 8,4:1 com `--roxo` |
| `--lilas` | `#A67CC4` | Título ≥ 24 px sobre roxo (4,1:1), adesivos, fios, foco sobre roxo | Nunca texto < 24 px |
| `--folha` | `#78966A` | Decoração (folhas, selo) | Nunca texto |
| `--roxo-08` | `rgba(64,32,79,.08)` | Fundo de linha em hover, divisórias | — |
Foco: contorno 3 px `--roxo` com afastamento 3 px sobre creme; 3 px `--creme` sobre roxo/noite.

### 1.2 Fontes (arquivos em `assets/fonts/`, `font-display: swap`, pré-carregar só Bricolage 800)
- `--f-titulo`: "Bricolage Grotesque", 700 e 800; reserva `"Arial Black", system-ui, sans-serif`.
- `--f-texto`: "DM Sans", 400 e 600; reserva `system-ui, -apple-system, "Segoe UI", sans-serif`.

### 1.3 Escala tipográfica
| Nível | Fonte e peso | Tamanho | Entrelinha | Tracking |
|---|---|---|---|---|
| Gigante (frase final, "JAMBO" do rodapé) | Bricolage 800 | `clamp(64px, 14vw, 220px)` | 0,86 | −0,03em |
| h1 | Bricolage 800 | `clamp(48px, 8.5vw, 132px)` | 0,9 | −0,025em |
| h2 | Bricolage 800 | `clamp(40px, 6vw, 96px)` | 0,92 | −0,02em |
| h3 (nome do item) | Bricolage 700 | `clamp(22px, 2.2vw, 32px)` | 1,05 | −0,01em |
| Sobretítulo / adesivo | DM Sans 600, maiúsculas | `clamp(12px, 1vw, 14px)` | 1,2 | 0,12em |
| Corpo | DM Sans 400 | `clamp(16px, 1.15vw, 18px)` | 1,5 | 0 |
| Preço | DM Sans 600, `font-variant-numeric: tabular-nums` | `clamp(18px, 1.4vw, 22px)` | 1,2 | 0 |
| Legenda / "Imagem ilustrativa" | DM Sans 400 | 13 px (mínimo 12) | 1,4 | 0,01em |
| Botão | DM Sans 600 | 16 px | 1 | 0,01em |

### 1.4 Espaço, raios, larguras e quebras
- Escala de 8: `--e1` 8 · `--e2` 16 · `--e3` 24 · `--e4` 32 · `--e5` 48 · `--e6` 64 · `--e7` 96 · `--e8` 128 px.
- Respiro lateral: `--lado: clamp(20px, 5vw, 80px)`. Respiro vertical de seção: `clamp(72px, 12vh, 160px)`.
- Largura máxima do conteúdo: 1320 px; texto corrido: 60ch.
- Raios: `--r-botao` 999 px (pílula) · `--r-cartao` 28 px · `--r-adesivo` 18 px.
- Quebras: 390 (base), 768, 1024, 1440 px. **Abaixo de 768 px vale o layout de celular descrito em cada seção.**

### 1.5 Textos da marca
- Nome: **JAMBO — Açaí & Gelato** · Assinatura: **"Seu verão, do seu jeito."** · Conceito: "o verão não precisa ter estação".
- Frases da marca (usar exatamente): "Seu bowl, suas regras." · "O clima pede JAMBO." · "A felicidade vem com topping extra." · "POV: você disse que só ia tomar um sorvete." · "Seu verão começa aqui."
- Botões: "Pedir agora" · "Pular" · "Adicionar" · "Pedir pelo WhatsApp" · "Recomeçar" · "Colocar no pedido" · "Como chegar" · "Quero um site assim".
- Endereço: Rua Bocaiúva, 1842 — Centro, Florianópolis/SC. Horário: seg–qui 12h–22h · sex 12h–23h · sáb 13h–23h · dom 13h–22h. Entrega: Centro, Beira-Mar Norte e bairros próximos (taxa "a confirmar no WhatsApp").
- WhatsApp do pedido (fictício): `5548999990000`. Instagram: `@jambo.gelato` (fictício, link para `#`).
- WhatsApp da Letícia ("Quero um site assim"): `[preencher]`.

### 1.6 Caminhos
`assets/logo/` (jambo-logo.svg, jambo-logo-creme.svg, jambo-logo-current.svg, jambo-wordmark.svg, favicon.svg) · `assets/ingredientes/*.svg` + `lista.json` · `assets/3d/*.glb` · `assets/js/abertura.js`, `cena3d.js`, `three.module.js` (r187) + `three-addons/` · `assets/video/` · `assets/img/` (vagas em `imagens.md`) · `assets/fonts/`.

## 2. Marca e navegação
- **Tom:** jovem, descontraído, sensorial, frases curtas, "você". Sem gíria forçada, sem caixa-alta em frase inteira (só sobretítulos).
- **Cabeçalho fixo** (altura 72 px no computador, 60 px no celular; z-index 50): logo `jambo-wordmark.svg` com 28 px de altura à esquerda; no centro (≥ 1024 px) os links Açaí · Monte o seu · Gelato · Shakes · Combos (DM Sans 600, 15 px, sublinhado que cresce 0 → 100% em 0,25 s `power2.out` no hover e no foco); à direita o botão **"Pedir agora"** (pílula, 44 px de altura, fundo `--roxo`, texto `--creme`, com o contador de itens num círculo `--lilas` de 22 px). Durante a abertura o fundo do cabeçalho é transparente; depois, `--creme` a 92% com `backdrop-filter: blur(10px)`.
- **Comportamento:** some ao descer (translateY 0 → −100%, 0,3 s `power2.out`) e volta ao subir. Nunca some enquanto o carrinho está aberto ou quando o foco está nele.
- **Celular:** logo + "Pedir agora" (só o ícone de sacola com o contador e o texto "Pedir", 44 × 44 px no mínimo) + botão "Menu" que abre a lista de seções em tela cheia `--roxo` com links de h2.
- **Primeiro elemento do `<body>`:** link "Pular para o cardápio" (aparece no foco, fixo em top 12 px, left 12 px, z-index 100), que leva a `#acai`.

## 3. Seções

### 3.0 Abertura (`#abertura`) · nível 3
- **Ideia:** a onda de açaí da marca, desenhada em código. Já pronta em `assets/js/abertura.js` (função `iniciarAbertura(canvas, { base, aoTerminar })`; o roteiro de cada segundo está no comentário do arquivo).
- **Medidas:** `<section>` com `height: 100svh`, `min-height: 560px`. Canvas absoluto em 100% × 100% (z-index 0, `aria-hidden="true"`). Por cima (z-index 2), em HTML:
  - logo `jambo-logo.svg`, largura `clamp(220px, 38vw, 560px)`, centrada, com o centro a 27% da altura; entra em 4,9 s (opacity 0 → 1, translateY 6vh → 0, 0,9 s `power3.out`);
  - h1 "Seu verão, do seu jeito." (tamanho h2), centrado, 32 px abaixo da logo; entra em 6,0 s (opacity 0 → 1, translateY 20 px → 0, 0,7 s `power3.out`).
  - A logo e o h1 estão no HTML desde o início (com opacity 0 só se o JS rodar), para o leitor de tela e para quem não tem JS.
- **Controles fixos desde o segundo 0** (z-index 60): "Pular" (canto inferior direito, 24 px das bordas, pílula contornada 2 px `--roxo`, fundo `--creme`, 44 px de altura) e o "Pedir agora" do cabeçalho. "Pular" chama `.pular()`: tudo vai para o quadro final em 0,4 s e o foco vai para `#acai`.
- **Fim:** aos 8 s a abertura vira o hero parado (as frutas seguem boiando por mais 30 s e param). A seta "Ver o cardápio" (DM Sans 600, 15 px, com ícone que desce 6 px em loop de 1,6 s `sine.inOut`, parado com movimento reduzido) aparece a 32 px da base.
- **Celular (390 px):** a mesma animação (o arquivo se adapta ao formato vertical); logo com 72% da largura; h1 a `clamp(32px, 9vw, 40px)`; "Pular" a 16 px das bordas.
- **Movimento reduzido:** sem animação. O canvas recebe `desenharParado()` (o quadro final) e logo e h1 já aparecem. "Pular" não aparece.
- **Peso:** o JS da abertura tem ~7 KB; usa 8 SVGs de ingredientes (~2 KB cada). Não usa vídeo no site.
- **Imagens:** nenhuma foto (é ilustração em código, coerente com os adesivos do montador).

### 3.1 Açaí da casa (`#acai`) · movimentos de seção 1 e 2
- **Ideia:** índice tipográfico dos 6 bowls com uma foto macro que troca, e as frutas daquele bowl entram voando em volta da foto.
- **Medidas (≥ 1024 px):** fundo `--creme`. Sobretítulo "01 · AÇAÍ" e h2 "Seu bowl, suas regras." no topo, alinhados à esquerda, largura máx. 12ch. Abaixo, grade de 12 colunas, espaço 24 px: **foto à esquerda** nas colunas 1–6, `position: sticky; top: 96px`, proporção 4:5, largura `min(42vw, 560px)`, raio `--r-cartao`, `object-fit: cover; object-position: 50% 40%`; **lista à direita** nas colunas 8–12, 6 linhas, cada uma com altura mínima 34vh para dar a rolagem da troca.
- **Linha do bowl:** h3 com o nome (Bricolage 700) e o preço na mesma linha, alinhado à direita (DM Sans 600, tabular); embaixo, a descrição (corpo, máx. 36ch) e as calorias "≈ [preencher] kcal" (legenda); botão "Adicionar" (pílula contornada, 44 px) com seletor de tamanho se houver. Divisória 1 px `--roxo-08` entre linhas.
- **Itens (preços do cliente) e descrições (as coberturas que aparecem nas fotos de 19/11; confirmar com o material da marca, e se mudar, refazer a foto):**
  | Bowl | Preço | Descrição | kcal aprox. (premissa: 500 ml, base tradicional) | Adesivos que voam |
  |---|---|---|---|---|
  | Jambo Classic | R$ 24,90 | Banana, morango, granola e leite em pó. | ≈ 680 | banana, morango, granola, leite-em-po |
  | Paçoca Club | R$ 27,90 | Paçoca, banana, pasta de amendoim e granola. | ≈ 775 | pacoca, banana, pasta-amendoim, granola |
  | Tropical Vibe | R$ 29,90 | Manga, kiwi, banana, coco e granola. | ≈ 690 | manga, kiwi, banana, coco |
  | Choco Crush | R$ 29,90 | Creme de avelã, banana, morango e granola. | ≈ 710 | creme-avela, banana, morango, granola |
  | Berry Mood | R$ 28,90 | Morango, mirtilo, banana e granola. | ≈ 620 (mirtilo 30 g ≈ 17 kcal, estimado) | morango, banana, granola |
  | Pistachio Dream | R$ 32,90 | Creme de pistache, pistache, morango e granola. | ≈ 755 (creme de pistache estimado como o de avelã) | pistache, morango, granola |
  O tamanho dos bowls da casa não está no cardápio do cliente: as calorias assumem 500 ml e ficam marcadas "aproximado".
- **Movimento "bowls revelados":** quando o centro de uma linha cruza 50% da tela (ScrollTrigger, `start: "top 55%"`, `end: "bottom 45%"`), a foto troca: a nova entra por cima com `clip-path: inset(100% 0 0 0 round 28px)` → `inset(0 0 0 0 round 28px)` e `scale 1.12 → 1`, 0,9 s `expo.out`; a antiga fica embaixo e some ao fim. A linha ativa ganha um ponto `--lilas` de 10 px antes do nome (scale 0 → 1, 0,3 s `back.out(2)`).
- **Movimento "frutas entrando":** junto com cada troca, 3 a 4 adesivos dos ingredientes daquele bowl (`assets/ingredientes/*.svg`, 72–104 px) voam de fora da foto (de x ±40vw, y +30vh, rotação ±90°) até posições fixas na borda da foto (cantos e laterais, metade para fora), com stagger 0,08 s, 0,8 s `back.out(1.4)`. Os adesivos da foto anterior saem ao mesmo tempo (opacity → 0, scale → .6, 0,3 s). Os adesivos são `aria-hidden`.
- **Aviso:** "Imagem ilustrativa" sob a foto (legenda, `--roxo` a 80% de opacidade sobre creme: 7:1).
- **Celular (390 px):** sem sticky. Cada bowl vira um bloco: foto 4:5 em 100% da largura (menos `--lado`), com 2 adesivos fixos nos cantos (64 px), e o texto logo abaixo; 48 px entre bowls. A foto se revela uma vez ao entrar (o mesmo clip-path, 0,7 s), sem frutas voando.
- **Movimento reduzido:** layout do celular em qualquer tela, sem clip-path nem voo; adesivos parados nos cantos.
- **Imagens:** `bowl-<nome>.webp` (896 × 1120, 4:5) e `bowl-<nome>-640.webp` no celular, para os 6 bowls. Prontas.

### 3.2 Monte seu Jambo (`#monte`) · função principal
- **Ideia:** o copo desenhado no centro e os ingredientes em adesivos dos lados, como uma bancada.
- **Antes do montador (obrigatório):** parágrafo com link: "Prefere escolher da lista? **Monte pelo cardápio**" → âncora `#monte-lista`. O montador por arrastar não prende o Tab: quem usa teclado passa por ele e chega à lista.
- **Medidas (≥ 1024 px):** seção em `--roxo`, texto `--creme`. Sobretítulo "02 · MONTE SEU JAMBO", h2 "A felicidade vem com topping extra." (cor `--lilas`, tamanho h2). Grade de 3 colunas `1fr minmax(360px, 520px) 1fr`, espaço 32 px:
  - **Coluna do meio:** passo 1 base (3 pílulas: Tradicional · Zero açúcar · Açaí + cupuaçu) e passo 2 tamanho (300 ml R$ 18,90 · 500 ml R$ 24,90 · 700 ml R$ 31,90) como grupos de botões de rádio estilizados (44 px de altura, selecionado = fundo `--creme`, texto `--roxo`). Abaixo, o **copo em SVG** (viewBox 400 × 340; tigela creme com a borda roxa e a logo `jambo-logo-current` em `--roxo`; a superfície do açaí é uma elipse em 400 × 90 com a cor da base escolhida: tradicional `#4A1E4C`, zero `#6A2C66`, cupuaçu metade `#4A1E4C` e metade `#EBD7A6`). O tamanho escolhido muda a escala do copo (300 ml 0,82 · 500 ml 0,92 · 700 ml 1,0, transição 0,4 s `power2.out`).
  - **Colunas laterais:** os 9 toppings à esquerda e os 7 adicionais à direita, em grade de 3 colunas de adesivos de 88 px com o nome embaixo (DM Sans 600, 13 px, `--lilas-claro`) e "+R$ 3,00" nos adicionais.
  - **Painel do total** (embaixo do copo, fundo `--noite`, raio 20 px, padding 20 px): "Total R$ 24,90" (preço, 28 px), "≈ 440 kcal · valores aproximados" (legenda), a lista do que está no copo, "Recomeçar" (botão contornado) e "Colocar no pedido" (botão `--creme`/`--roxo`). O total e as calorias ficam num `aria-live="polite"`.
- **Arrastar (eventos de ponteiro, mouse e dedo):** `pointerdown` no adesivo cria um clone que segue o ponteiro (scale 1,1, sombra 0 12px 24px rgba(0,0,0,.25)); a área do copo acende (contorno tracejado 2 px `--lilas`) quando o clone está sobre ela; ao soltar dentro, o ingrediente vai para a próxima vaga livre da superfície (12 vagas em elipse, cada uma com rotação fixa sorteada por semente) em 0,35 s `back.out(1.6)`, com 56 px; ao soltar fora, volta à bancada em 0,3 s. Toque simples num adesivo da bancada também coloca o ingrediente no copo (atalho de toque). Tocar num ingrediente dentro do copo o remove (sai com scale → 0, 0,2 s).
- **Regras (RF-09, RN-01, RN-02):** os 3 primeiros toppings são grátis; do 4º em diante, R$ 3,00 cada; cada adicional, R$ 3,00, sem limite. Cada ingrediente pode entrar uma vez (repetir é "adicional extra": fora do escopo). O total é sempre recalculado a partir da tabela (`cardapio.json`), nunca somado na mão.
- **Calorias:** tabela da análise interna, seção 7 (base por tamanho + porção de cada ingrediente). Aviso fixo: "Valores aproximados, para referência. Não substituem orientação nutricional."
- **Exemplo de conferência (US-01):** 500 ml tradicional + banana, morango, granola, paçoca + creme de avelã = R$ 24,90 + R$ 3,00 (4º topping) + R$ 3,00 (adicional) = **R$ 30,90**; calorias 440 + 40 + 12 + 110 + 95 + 110 = **≈ 807 kcal**.
- **Montar pela lista (`#monte-lista`, RF-13):** logo abaixo do montador, um `<details open>` "Montar pela lista" com `<fieldset>` de base (rádios), tamanho (rádios), toppings (9 caixas) e adicionais (7 caixas), o mesmo painel de total (mesma função de cálculo) e "Colocar no pedido". O leitor de tela anuncia "Total R$ 30,90, cerca de 807 calorias" a cada mudança.
- **Celular (390 px):** uma coluna. Base e tamanho em faixas roláveis na horizontal; copo com 88% da largura; abaixo, as abas "Toppings | Adicionais" com a grade de adesivos em 4 colunas de 72 px; o painel do total fica fixo na base da tela (64 px, só total, kcal e "Colocar no pedido") enquanto a seção está visível. Arrastar funciona com o dedo; o toque simples é o caminho principal no celular (diga isso na dica: "Toque ou arraste para o copo").
- **Movimento reduzido:** o ingrediente aparece direto na vaga, sem voo nem quique.
- **Imagens:** só os SVGs de `assets/ingredientes/` (bases para as pílulas da base, os outros na bancada).

### 3.3 Gelato (`#gelato`)
- **Ideia:** a faixa dos copinhos em foto larga e os 8 sabores como lista de "balcão".
- **Medidas:** fundo `--creme`. Foto `gelatos-montagem` em 21:9 de borda a borda (`object-position: 50% 45%`), altura `clamp(220px, 34vw, 520px)`. Abaixo, sobretítulo "03 · GELATO", h2 "O clima pede JAMBO." e a lista em 2 colunas (≥ 768 px): cada linha com bolinha de 14 px da cor do sabor (pistache `#A3B46A`, ninho & morango `#F2A7B6`, chocolate belga `#5A3426`, doce de leite `#D99A52`, maracujá `#F2C14E`, cookies & cream `#E8E1D6` com contorno, fior di latte `#FFF8EE` com contorno, limão siciliano `#E9E39A`), nome (h3 menor, 22 px) e preço de 1 sabor. Embaixo: "1 sabor R$ 10,90 a R$ 12,90 · 2 sabores R$ 16,90 · 3 sabores R$ 21,90" e o botão "Montar copinho", que abre um diálogo (`<dialog>`) para escolher 1, 2 ou 3 sabores (caixas, com limite) e adicionar.
- **Movimento:** só a entrada das palavras do h2 (translateY 100% → 0 por palavra, stagger 0,06 s, 0,7 s `power3.out`).
- **Celular:** foto em 4:3; lista em 1 coluna.
- **Movimento reduzido:** h2 parado.
- **Imagem:** `gelatos-montagem-21x9` (computador) e `gelatos-montagem` 16:9 recortada em 4:3 no celular. Prontas. "Imagem ilustrativa" no canto inferior direito da foto, sobre pílula `--creme`.

### 3.4 Milkshakes (`#shakes`)
- **Ideia:** a foto alta dos 4 copos e a lista ao lado, em fundo roxo.
- **Medidas (≥ 1024 px):** fundo `--roxo`, texto `--creme`. 2 colunas 5/7: foto `milkshakes-montagem` 4:5, raio `--r-cartao`; ao lado, sobretítulo "04 · MILKSHAKES", h2 "POV: você disse que só ia tomar um sorvete." (`--lilas`, `clamp(36px, 4.4vw, 72px)`) e as 4 linhas: Freak Choc R$ 21,90 · Morango Pop R$ 19,90 · Cookie Monster R$ 22,90 · Pistache Shake R$ 24,90, descrições `[preencher]`, preço em `--lilas-claro`, "Adicionar".
- **Celular:** foto em cima (4:5, 100%), lista embaixo.
- **Movimento:** nenhum além do fade simples da foto (opacity 0 → 1, 0,6 s).
- **Imagem:** `milkshakes-montagem` (4:5). Pronta.

### 3.5 Combos (`#combos`) · movimento de seção 3 "combos montados"
- **Ideia:** palco fixo onde os copos 3D entram e se juntam formando cada combo, enquanto o texto do combo troca ao lado.
- **Medidas (≥ 1024 px):** trilha de 300vh, palco `position: sticky; top: 0; height: 100svh`, fundo `--noite`. Canvas 3D à direita (colunas 6–12, altura 80svh, `aria-hidden="true"`), criado com `criarCena(canvas, { itens, camera: { y: .16, z: .62, alvoY: .06, fov: 24 } })` de `assets/js/cena3d.js`. Texto à esquerda (colunas 1–5), centralizado na vertical: sobretítulo "05 · COMBOS", h2 com o nome do combo, o que vem (corpo), o preço (h3, `--lilas-claro`) e "Adicionar combo".
- **Os 3 combos e a rolagem (scrub 0,5):**
  - 0–33%: **Solo Sun** — 300 ml + bebida — R$ 25,90. Itens: `jambo-tigela-acai.glb` (escala 0,82, de x −0,5 até −0,06) + `jambo-suco.glb` (de x +0,5 até +0,06, atraso 0,2).
  - 33–66%: **Double Trouble** — 2 açaís de 300 ml — R$ 35,90. Duas tigelas (escala 0,82) em x −0,07 e +0,07.
  - 66–100%: **Sweet Escape** — 500 ml + milkshake pequeno — R$ 39,90. `jambo-tigela-acai.glb` (escala 0,92) + `jambo-milkshake.glb` (escala 0,8).
  - Em cada faixa: 0–20% os copos do combo anterior saem para os lados (x ±0,5, 0,5 s `power2.in`); 20–60% os novos entram (`definirProgresso` 0 → 1, `power3.out`, com o giro de 1,6 rad até a frente); 60–100% parados, girando devagar (0,35 rad/s). O texto troca com fade de 0,25 s quando a faixa muda. Uma régua de 3 marcas (2 px, `--lilas`) na base do palco mostra o combo ativo.
- **Celular (390 px):** sem trilha nem 3D. A imagem `combos` (896 × 720, inteira, raio `--r-cartao`) em cima e os 3 combos em lista embaixo, com "Imagem ilustrativa".
- **Movimento reduzido:** o layout do celular em qualquer tela; sem 3D.
- **Leitor de tela:** os combos estão numa `<ol>` em HTML, sempre visível (no computador o texto do palco é essa lista, com os itens inativos escondidos só visualmente por `opacity`, nunca por `display:none` enquanto o palco não está ativo).
- **Peso:** three.js r187 (~700 KB sem gzip, ~170 KB com gzip) + 3 GLB (~730 KB). Carregar só quando a seção estiver a 1 tela de distância (`IntersectionObserver` com `rootMargin: "100% 0px"`), nunca na primeira carga.

### 3.6 Bebidas (`#bebidas`)
- Lista em 2 colunas (1 no celular), fundo `--creme`: Água R$ 4,00 · Água com gás R$ 5,00 · Coca-Cola / Coca Zero R$ 6,00 · Guaraná R$ 6,00 · Suco de laranja R$ 9,90 · Limonada R$ 8,90. Cada linha com "Adicionar" (ícone + texto oculto "Adicionar Água"). Sem imagem, sem movimento.

### 3.7 Final (`#final`)
- **Ideia:** a frase enorme e o botão, sobre a onda parada.
- **Medidas:** altura `min(100svh, 900px)`, fundo `--creme`. h2 gigante "Seu verão começa aqui." centrado, máx. 10ch; 32 px abaixo, botão "Pedir pelo WhatsApp" (56 px de altura, padding 0 32 px, fundo `--roxo`, texto `--creme`, ícone do WhatsApp à esquerda). Embaixo, um canvas com o quadro final da abertura (`desenhar(ctx, 8, ...)`), 40% da altura, `aria-hidden`.
- **Celular:** frase em `clamp(48px, 15vw, 64px)`; botão com 100% da largura.
- **Movimento:** nenhum (quadro parado).

### 3.8 Rodapé (`#visite`)
- Fundo `--noite`, texto `--creme`. 4 colunas (≥ 1024 px; 1 no celular): **Horário** (cada dia numa linha, o dia de hoje em 600), **Endereço** + "Como chegar" (link para o Google Maps em nova aba, com aviso "abre em nova aba"; mapa embutido só depois de clicar em "Ver mapa", para não carregar o Google na primeira visita), **Pedidos** (WhatsApp, Instagram, bairros de entrega), **QR do cardápio** (SVG gerado no build, 160 px, com legenda "Aponte a câmera para abrir o cardápio").
- Acima das 4 colunas, as fotos `ambiente-balcao` e `ambiente-sol` lado a lado (3:2, raio `--r-cartao`; uma embaixo da outra no celular), com "Imagem ilustrativa · lugar fictício".
- Fim do rodapé: "JAMBO" gigante em `--lilas` (decorativo, `aria-hidden`), e a linha: "**Site demonstrativo.** A JAMBO é uma marca fictícia criada para o portfólio de Letícia Beatriz. Imagens ilustrativas geradas com IA; calorias aproximadas." + "Quero um site assim" (WhatsApp da Letícia) + links Privacidade · Acessibilidade.

### 3.9 Carrinho (painel lateral)
- Abre pelo "Pedir agora" e por qualquer "Adicionar" (abre só na primeira vez; depois mostra um aviso "Adicionado ao pedido" de 2 s no topo, anunciado no `aria-live`).
- `<dialog>` modal à direita, largura `min(440px, 100vw)`, fundo `--noite`, entra com translateX 100% → 0 (0,35 s `power3.out`). Foco vai para o título "Seu pedido"; Esc fecha; o foco volta ao botão que abriu.
- Lista de itens (nome, variações, adicionais, quantidade com − e + de 44 px, remover), total, e o formulário: Nome (obrigatório), Entrega ou Retirada (rádios), Endereço (só na entrega, obrigatório), Pagamento (Pix · Cartão na entrega · Dinheiro), Observações. Rótulos visíveis, erros em texto ao lado do campo ("Escreva seu nome para a loja saber de quem é o pedido").
- Aviso curto acima do botão: "Seus dados vão só na mensagem do WhatsApp para a JAMBO. O site não guarda nada."
- **"Pedir pelo WhatsApp"** monta a mensagem exatamente no modelo da análise interna (seção 6) e abre `https://wa.me/5548999990000?text=...` (`encodeURIComponent`). O total diz "(a confirmar pela loja)".
- **Fora do horário (RF-06):** faixa no topo do carrinho "Estamos fechados agora. Abrimos às 12h" (o horário certo do próximo dia) e a mensagem ganha a linha "Pedido agendado para quando abrir".
- O carrinho vive só na memória e em `sessionStorage` (com `try/catch`); nada é enviado a servidor.

## 4. Movimento e acessibilidade
- Link "Pular para o cardápio" antes da abertura; "Pular" dentro dela.
- `prefers-reduced-motion: reduce` em **todos** os módulos (valores de cada seção acima). Além disso, um botão "Pausar animações" no rodapé, que liga o mesmo modo e fica salvo em `localStorage` (com `try/catch`).
- Canvas da abertura, do final e do 3D com `aria-hidden="true"`; todo o conteúdo deles também está em HTML.
- Texto nunca dentro de imagem (os rótulos "JAMBO" nos copos das fotos e do 3D são parte do produto, não texto do site).
- "Imagem ilustrativa" perto de cada foto de produto, legível (13 px, contraste ≥ 4,5:1).
- Ordem do teclado: pular → cabeçalho → abertura (Pular) → Açaí (cada "Adicionar") → link "Monte pelo cardápio" → montador (os adesivos são botões: Enter coloca no copo, o que também dá um caminho por teclado) → lista → Gelato → … → rodapé.
- Montador por arrastar: cada adesivo é `<button aria-label="Colocar banana no copo">`; cada ingrediente no copo é `<button aria-label="Tirar banana do copo">`.

### 4b. Microinterações
- **Botões:** normal; hover (fundo 8% mais claro ou `--roxo-08`, 0,15 s); foco (contorno de 3 px); pressionado (scale .97, 0,1 s). Área de toque mínima 44 × 44 px.
- **"Adicionar":** o botão vira "✓ Adicionado" por 1,5 s; o contador do "Pedir agora" pula (scale 1 → 1,25 → 1, 0,3 s).
- **Imagens:** fundo `--roxo-08` com a proporção reservada (sem pulo de layout) e fade de 0,4 s ao carregar.
- **"Pedir pelo WhatsApp":** valida o formulário; se faltar algo, o foco vai para o primeiro erro e o resumo "Falta preencher: Nome" aparece em `role="alert"`.
- **Item esgotado (RN-03):** nome riscado, "Esgotado" em pílula, botão desativado com `aria-disabled` e texto "Esgotado hoje".

## 5. Stack (nível 3)
- **Vite** (sem framework) gerando `dist/` estático. Justificativa: o cardápio vem de `content/cardapio.json` (editado pelo Pages CMS) e entra no HTML no build, para funcionar sem JS e para o Google ler.
- **GSAP + ScrollTrigger** como dependência fixa no `package.json` (versão exata, empacotada pelo Vite; nunca CDN): só nas seções 3.1, 3.3 e 3.5.
- **three.js r187** (já em `assets/js/`): só na seção 3.5, carregado sob demanda (`import()` dinâmico).
- **Sem Lenis** (rolagem nativa; o pedido precisa de rolagem previsível).
- `content/cardapio.json` com categorias, itens (id, nome, descrição, preço, kcal, imagem, alt, esgotado), regras do montador e a tabela de calorias; `content/loja.json` com horário, endereço, WhatsApp e frase de destaque.
- **Pages CMS:** `.pages.yml` com as duas coleções, campos: nome, descrição, preço (número), kcal (número), imagem (com `alt` obrigatório), esgotado (booleano); loja: horário por dia, endereço, WhatsApp, frase. Sem campos de cor, fonte ou layout (RF-16).
- Imagens: WebP com `width` e `height`, `loading="lazy"` fora da primeira tela, `srcset` 640/1024/1600 w. Pré-carregar só a fonte Bricolage 800 (a abertura não tem foto).
- Pixel ratio no máximo 2 em todos os canvas; desenhar só quando algo muda (o `cena3d.js` já faz isso).
- QR code do cardápio gerado no build (pacote `qrcode`, MIT) como SVG.

## 6. Padrão de todo site (de `claude/padrao-de-todo-site.md`)
- `<title>` "JAMBO — Açaí & Gelato · Cardápio (site demonstrativo)"; descrição; `<html lang="pt-BR">`; cabeçalhos em ordem.
- Dados estruturados `IceCreamShop` (nome, endereço, horário, telefone fictício, `menu`), marcados como exemplo no texto do site.
- `favicon.svg` + PNG 180 px (gerar a partir do SVG); imagem de compartilhamento `assets/img/compartilhar.jpg` (1200 × 630).
- `robots.txt` com `Disallow: /` e `<meta name="robots" content="noindex">` até a Letícia decidir (aceite).
- Páginas: `privacidade.html` (o site não coleta dados; o pedido vai pelo WhatsApp; o Cloudflare Web Analytics não usa cookies), `acessibilidade.html` (o que cumpre, como foi testado, a data, a limitação do arrastar e o caminho alternativo, contato), `404.html` com a frase "Esse sabor acabou." e link para o cardápio.
- Cloudflare Web Analytics (sem cookies). Sem Google Analytics, sem Pixel.
- Crédito no rodapé: "Quero um site assim" (é o portfólio da própria Letícia).

## 7. Publicação
Cloudflare Pages ligado ao repositório do GitHub (no exemplo, contas da Letícia, como o Café Vagar), build `npm run build`, saída `dist/`. `noindex` até a decisão da Letícia. O Pages CMS edita o repositório; cada salvamento gera um build novo em 1 a 3 minutos (US-04).
