// Cardápio já arrumado (ver normalizar.js). Todo o código do navegador importa daqui, nunca dos JSON direto.
import acai from '../content/cardapio/acai.json';
import montador from '../content/cardapio/montador.json';
import gelato from '../content/cardapio/gelato.json';
import milkshakes from '../content/cardapio/milkshakes.json';
import combos from '../content/cardapio/combos.json';
import bebidas from '../content/cardapio/bebidas.json';
import { normalizar, montarCardapio } from './normalizar.js';
import { SABORES_PRONTOS, registrarIngredientes, registrarSabores } from './copo.js';

const arquivos = import.meta.glob('../content/ingredientes/*.json', { eager: true, import: 'default' });
const ingredientes = Object.fromEntries(Object.entries(arquivos).map(([p, d]) => [p.split('/').pop().replace(/\.json$/, ''), d]));

export const cardapio = normalizar(montarCardapio({ acai, montador, gelato, milkshakes, combos, bebidas, ingredientes }), SABORES_PRONTOS);
registrarIngredientes([...cardapio.montador.toppings, ...cardapio.montador.adicionais]);
registrarSabores(cardapio.gelato.sabores);
export default cardapio;
