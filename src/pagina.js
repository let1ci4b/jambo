// páginas de texto (privacidade, acessibilidade, 404): estilo + menu de acessibilidade
import './estilo.css';
import { iniciarAcessibilidade } from './acessibilidade.js';
iniciarAcessibilidade();
// rodapé: o ano se atualiza sozinho (o HTML já traz o ano do build como reserva)
document.querySelectorAll('.js-ano').forEach(e => { e.textContent = new Date().getFullYear(); });
