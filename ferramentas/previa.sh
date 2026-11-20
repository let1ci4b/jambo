#!/bin/sh
# Gera a versão de prévia (caminhos relativos, GLB embrulhado em .js) em ../previa — só para a prévia no Claude.
set -e
rm -rf ../previa && npx vite build --base ./ --outDir ../previa --emptyOutDir >/dev/null
cd ../previa && python3 - <<'PY'
import glob, base64, os
for f in glob.glob('*.html'):
    s=open(f).read()
    for a,b in [('href="/#acai"','href="index.html#acai"'),('href="/"','href="index.html"'),('href="/privacidade.html"','href="privacidade.html"'),('href="/acessibilidade.html"','href="acessibilidade.html"'),('data-foto="/assets/','data-foto="assets/'),('src="/assets/','src="assets/')]: s=s.replace(a,b)
    open(f,'w').write(s)
for f in glob.glob('build/*.css'):
    s=open(f).read().replace('url(/assets/','url(../assets/'); open(f,'w').write(s)
for f in glob.glob('build/*.js'):
    s=open(f).read().replace('new URL(`/assets/`,location.href)','new URL(`assets/`,document.baseURI)').replace('"/assets/','"assets/').replace('`/assets/','`assets/').replace('.glb"','.js"').replace('.glb`','.js`')
    open(f,'w').write(s)
for f in glob.glob('assets/3d/*.glb'):
    open(f[:-4]+'.js','w').write('export default "'+base64.b64encode(open(f,'rb').read()).decode()+'";\n'); os.remove(f)
p='assets/js/cena3d.js'; s=open(p).read()
s=s.replace("""function carregar(url) {
  if (!cacheModelos.has(url)) cacheModelos.set(url, loader.loadAsync(url).then(g => g.scene));""","""async function lerGlb(url) {
  if (!url.endsWith('.js')) return loader.loadAsync(url);
  const b64 = (await import(url)).default;
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return loader.parseAsync(bin.buffer, '');
}
function carregar(url) {
  if (!cacheModelos.has(url)) cacheModelos.set(url, lerGlb(url).then(g => g.scene));""")
open(p,'w').write(s)
PY
