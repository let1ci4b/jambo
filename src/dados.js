// Cardápio já arrumado (ver normalizar.js). Todo o código do navegador importa daqui, nunca do JSON direto.
import bruto from '../content/cardapio.json';
import prontos from '../public/assets/ingredientes/lista.json';
import { normalizar } from './normalizar.js';
import { SABORES_PRONTOS, registrarIngredientes, registrarSabores } from './copo.js';

export const cardapio = normalizar(bruto, prontos, SABORES_PRONTOS);
registrarIngredientes([...cardapio.montador.toppings, ...cardapio.montador.adicionais]);
registrarSabores(cardapio.gelato.sabores);
export default cardapio;
