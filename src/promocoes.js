// Confere as promoções com a data de HOJE (em Florianópolis) assim que a página abre.
// O site é publicado num dia e pode ficar dias sem mudar: sem esta conferência, uma promoção
// que acabou ontem continuaria aparecendo (e o pedido sairia com o preço errado).
import { hojeLoja, dentroDoPeriodo } from './normalizar.js';
import { reais } from './calculo.js';

const dataBR = d => (d ? d.slice(8, 10) + '/' + d.slice(5, 7) : '');

export function conferirPromocoes(hoje = hojeLoja()) {
  // preços nas listas
  document.querySelectorAll('[data-promo]:not(button)').forEach(el => {
    const ativa = dentroDoPeriodo(el.dataset.de, el.dataset.ate, hoje);
    const normal = Number(el.dataset.normal), promo = Number(el.dataset.promo);
    el.innerHTML = ativa
      ? `<span class="pilula-promo">Promoção${el.dataset.ate ? ` até ${dataBR(el.dataset.ate)}` : ''}</span><span class="so-leitor">: de </span><s class="preco-de">${reais(normal)}</s><span class="so-leitor"> por </span> <span class="preco-por">${reais(promo)}</span>`
      : reais(normal);
  });
  // botões "Adicionar": o preço e o nome que vão para o pedido
  document.querySelectorAll('button[data-promo]').forEach(b => {
    const ativa = dentroDoPeriodo(b.dataset.de, b.dataset.ate, hoje);
    b.dataset.preco = ativa ? b.dataset.promo : b.dataset.normal;
    b.dataset.nome = ativa ? `${b.dataset.nomeBase} (promoção)` : b.dataset.nomeBase;
  });
  // avisos
  const secao = document.getElementById('promocoes');
  if (secao) {
    let algum = false;
    secao.querySelectorAll('.aviso-promo').forEach(li => {
      const ok = dentroDoPeriodo(li.dataset.de, li.dataset.ate, hoje);
      li.hidden = !ok; algum ||= ok;
    });
    secao.hidden = !algum;
  }
}
