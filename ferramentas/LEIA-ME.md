# Ferramentas (geram os assets; não vão para o site publicado)
Rodar a partir de uma pasta com `npm i three @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions @napi-rs/canvas opentype.js @fontsource/bricolage-grotesque @fontsource/dm-sans`.
- `logo.mjs`: desenha a logo tipográfica e o favicon (SVG) a partir das fontes.
- `modelos3d.mjs`: gera os 4 copos em GLB (tigela, milkshake, suco, gelato). Mude cores e coberturas no próprio arquivo.
- `render.mjs`: transforma `assets/js/abertura.js` em quadros PNG (`node render.mjs 1920 1080 quadros 30`); depois `ffmpeg -framerate 30 -i quadros/f%04d.png -c:v libx264 -crf 20 -pix_fmt yuv420p abertura.mp4`.
Os caminhos dentro dos scripts apontam para a pasta de trabalho do Claude; ajuste para a sua.
