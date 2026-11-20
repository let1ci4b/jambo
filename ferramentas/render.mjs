import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import { desenhar, FRUTAS, DURACAO } from '/home/claude/jambo/site/assets/js/abertura.js';
GlobalFonts.registerFromPath('node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff', 'Bricolage Grotesque');
const [,, W, H, outDir, fps='30', only] = process.argv;
const w=+W,h=+H; fs.mkdirSync(outDir,{recursive:true});
const imgs={};
for (const n of FRUTAS) imgs[n]=await loadImage(fs.readFileSync(`/home/claude/jambo/site/assets/ingredientes/${n}.svg`));
imgs.logo = await loadImage(fs.readFileSync('/home/claude/jambo/site/assets/logo/jambo-logo.svg'));
const c=createCanvas(w,h), ctx=c.getContext('2d');
const N = DURACAO*(+fps);
const frames = only ? only.split(',').map(Number) : [...Array(N).keys()];
for (const i of frames){ desenhar(ctx, only? i : i/(+fps), w,h,imgs,{comTexto:true}); fs.writeFileSync(`${outDir}/f${String(i).padStart(4,'0')}.png`, c.toBuffer('image/png')); }
console.log('ok', frames.length);
