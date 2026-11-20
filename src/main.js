// JAMBO · entrada da página
import './estilo.css';
import loja from '../content/loja.json';
import { adicionar, situacao } from './carrinho.js';
import { iniciarMontador, iniciarLista, ligarAtalhos, confirmar } from './montador.js';
import * as mov from './movimento.js';
import { iniciarCombos } from './combo.js';
import { iniciarAcessibilidade } from './acessibilidade.js';

const $ = (s, el = document) => el.querySelector(s);
const raiz = document.documentElement;
const reduzido = raiz.classList.contains('reduzido');

// menu de acessibilidade primeiro: é o padrão de todo site
iniciarAcessibilidade();
mov.abertura({ reduzido });

mov.cabecalho();

// ---------- "Adicionar" em qualquer item ----------
document.addEventListener('click', e => {
  const b = e.target.closest('.adicionar');
  if (!b) return;
  adicionar({ id: b.dataset.id, nome: b.dataset.nome, detalhes: b.dataset.detalhes, preco: b.dataset.preco }, b);
  confirmar(b);
});
document.addEventListener('click', e => { if (e.target.closest('[aria-disabled="true"]')) e.preventDefault(); });

// ---------- montador ----------
iniciarMontador({ reduzido });
iniciarLista();
ligarAtalhos();
iniciarCombos();

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
mov.quadroFinal();
if (!reduzido) {
  mov.videoRolagem();
  mov.shakes();
  Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    mov.acai(gsap, ScrollTrigger);
    mov.gelato(gsap);
    mov.combos(gsap, ScrollTrigger);
  });
}
