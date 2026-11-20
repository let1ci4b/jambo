import opentype from 'opentype.js';
import fs from 'fs';
const F = p => { const b=fs.readFileSync(p); return opentype.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)); };
const brico = F('node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff');
const dm = F('node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff');
// wordmark
function gp(font, text, size){
  const p = new opentype.Path(); let x=0; const sc=size/font.unitsPerEm; let prev=null;
  for (const ch of text.normalize('NFC')){ const g=font.charToGlyph(ch); if(prev) x+=font.getKerningValue(prev,g)*sc;
    const gpth=g.getPath(x,0,size); p.extend(gpth); x+=g.advanceWidth*sc; prev=g; }
  return p;
}
const word = gp(brico,'JAMBO',200);
const wb = word.getBoundingBox();
const sub = gp(dm,'Açaí & Gelato',64);
const sb = sub.getBoundingBox();
const W = wb.x2 - wb.x1, pad = 10;
// splash mark: 3 petals (drop shapes) fanning upward, centered above word
const cx = W/2, base = -10; // relative to word top
function drop(angle, len, wid){
  // teardrop pointing outward from (0,0)
  const a = angle*Math.PI/180, ca=Math.cos(a), sa=Math.sin(a);
  const pt=(x,y)=>[cx + x*ca - y*sa, base + x*sa + y*ca];
  const p0=pt(0,0), c1=pt(len*0.35, -wid), c2=pt(len*1.05,-wid*0.9), tip=pt(len,0), c3=pt(len*1.05,wid*0.9), c4=pt(len*0.35,wid);
  return `M${p0} C${c1} ${c2} ${tip} C${c3} ${c4} ${p0}Z`.replace(/,/g,' ');
}
const markH = 70;
const mark = [drop(-90, markH, 17), drop(-152, markH*0.78, 14), drop(-28, markH*0.78, 14)].join(' ');
const wordD = word.toPathData(2), subD = sub.toPathData(2);
const wordTop = wb.y1; // negative
// layout: mark from y=0..markH, word below, sub below
const tyWord = markH + 18 - wordTop;
const wordBottom = tyWord + wb.y2;
const subW = sb.x2 - sb.x1;
const tySub = wordBottom + 22 - sb.y1;
const H = tySub + sb.y2 + pad;
const svg = (fill, acc) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${W+2*pad} ${H+pad}" role="img" aria-label="JAMBO Açaí &amp; Gelato">
<g fill="${acc}" transform="translate(0 ${markH+6})">${'<path d="'+mark+'"/>'}</g>
<path fill="${fill}" transform="translate(${-wb.x1} ${tyWord})" d="${wordD}"/>
<path fill="${acc}" transform="translate(${(W-subW)/2 - sb.x1} ${tySub})" d="${subD}"/>
</svg>`;
fs.writeFileSync('/home/claude/jambo/site/assets/logo/jambo-logo.svg', svg('#40204F','#40204F'));
fs.writeFileSync('/home/claude/jambo/site/assets/logo/jambo-logo-creme.svg', svg('#F5EBDD','#A67CC4'));
fs.writeFileSync('/home/claude/jambo/site/assets/logo/jambo-logo-current.svg', svg('currentColor','currentColor'));
// wordmark only
fs.writeFileSync('/home/claude/jambo/site/assets/logo/jambo-wordmark.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${wb.y1} ${W} ${wb.y2-wb.y1}" role="img" aria-label="JAMBO"><path fill="currentColor" transform="translate(${-wb.x1} 0)" d="${wordD}"/></svg>`);
// favicon: mark + J on roxo
fs.writeFileSync('/home/claude/jambo/site/assets/logo/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#40204F"/><g transform="translate(32 40) scale(.36) translate(${-cx} 0)" fill="#F5EBDD">${'<path d="'+[drop(-90,70,17),drop(-152,55,14),drop(-28,55,14)].join(' ').replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g,(m,x,y)=>`${x} ${+y+10}`)+'"/>'}</g></svg>`);
console.log(W,H);
