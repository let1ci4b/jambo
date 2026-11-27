// JAMBO · entrada da página
import { conferirPromocoes } from './promocoes.js';
import './estilo.css';
import loja from '../content/loja.json';
import { adicionar, situacao } from './carrinho.js';
import { iniciarMontador, iniciarLista, ligarAtalhos, confirmar } from './montador.js';
import * as mov from './movimento.js';
import { iniciarCombos } from './combo.js';
import { iniciarAcessibilidade } from './acessibilidade.js';

const $ = (s, el = document) => el.querySelector(s);
// Cada parte da página liga sozinha: se uma der erro, as outras continuam funcionando
// (o cardápio, os preços e o pedido já estão no HTML, mesmo sem JS).
function seguro(nome, fn) {
  try { const r = fn(); if (r?.catch) r.catch(e => console.error(`[JAMBO] ${nome}:`, e)); }
  catch (e) { console.error(`[JAMBO] ${nome}:`, e); }
}
const raiz = document.documentElement;
const reduzido = raiz.classList.contains('reduzido');

// menu de acessibilidade primeiro: é o padrão de todo site
seguro('promoções', conferirPromocoes); // antes de tudo: preços certos para o dia
seguro('acessibilidade', iniciarAcessibilidade);
// rodapé: o ano se atualiza sozinho (o HTML já traz o ano do build como reserva)
document.querySelectorAll('.js-ano').forEach(e => { e.textContent = new Date().getFullYear(); });
seguro('abertura', () => mov.abertura({ reduzido }));
seguro('cabeçalho', () => mov.cabecalho());

// ---------- "Adicionar" em qualquer item ----------
document.addEventListener('click', e => {
  const b = e.target.closest('.adicionar');
  if (!b) return;
  adicionar({ id: b.dataset.id, nome: b.dataset.nome, detalhes: b.dataset.detalhes, preco: b.dataset.preco, estado: { tipo: 'simples', nome: b.dataset.nomeBase || b.dataset.nome } }, b);
  confirmar(b);
});
document.addEventListener('click', e => { if (e.target.closest('[aria-disabled="true"]')) e.preventDefault(); });

// ---------- montador ----------
seguro('montador', () => iniciarMontador({ reduzido }));
seguro('lista do montador', iniciarLista);
seguro('atalhos', ligarAtalhos);
seguro('combos', iniciarCombos);

// ---------- menu do celular ----------
const menu = $('#menu-celular'), abrirMenu = $('#abrir-menu');
abrirMenu.addEventListener('click', () => { menu.showModal(); abrirMenu.setAttribute('aria-expanded', 'true'); });
menu.addEventListener('close', () => { abrirMenu.setAttribute('aria-expanded', 'false'); });
menu.querySelector('[data-fechar]').addEventListener('click', () => { menu.close(); abrirMenu.focus(); });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));

// ---------- rodapé: dia de hoje, mapa sob demanda ----------
const hoje = situacao().dia;
document.querySelector(`#horario li[data-dia="${hoje}"]`)?.classList.add('hoje');
$('#ver-mapa').addEventListener('click', e => {
  const f = document.createElement('iframe');
  f.src = e.currentTarget.dataset.src; f.title = `Mapa: ${loja.endereco}`; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
  $('#mapa').replaceChildren(f);
  e.currentTarget.remove();
});

// ---------- imagens: fade ao carregar (a proporção já está reservada) ----------
if (!reduzido) {
  document.querySelectorAll('main img[loading="lazy"], footer img[loading="lazy"]').forEach(img => {
    if (img.complete) return;
    img.classList.add('carregando');
    img.addEventListener('load', () => { img.classList.replace('carregando', 'carregada'); }, { once: true });
    img.addEventListener('error', () => img.classList.remove('carregando'), { once: true });
  });
}

// ---------- movimentos de seção (GSAP só onde precisa, sem atrasar a abertura) ----------
seguro('quadro final', () => mov.quadroFinal());
if (!reduzido) {
  seguro('vídeo', () => mov.videoRolagem());
  seguro('shakes', () => mov.shakes());
  Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    seguro('açaí', () => mov.acai(gsap, ScrollTrigger));
    seguro('gelato', () => mov.gelato(gsap));
    seguro('combos 3D', () => mov.combos(gsap, ScrollTrigger));
  }).catch(e => console.error('[JAMBO] animações:', e));
}
