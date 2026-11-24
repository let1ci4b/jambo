// Cardápio já arrumado (ver normalizar.js). Todo o código do navegador importa daqui, nunca dos JSON direto.
import acai from '../content/cardapio/acai.json';
import montador from '../content/cardapio/montador.json';
import gelato from '../content/cardapio/gelato.json';
import milkshakes from '../content/cardapio/milkshakes.json';
import combos from '../content/cardapio/combos.json';
import bebidas from '../content/cardapio/bebidas.json';
import { normalizar, montarCardapio, aplicarPromocoes, hojeLoja } from './normalizar.js';
import { SABORES_PRONTOS, registrarIngredientes, registrarSabores } from './copo.js';
// Atenção: content/cupons.json NÃO é importado aqui de propósito. Os cupons ficam só no editor,
// para a loja conferir o que o cliente escrever; não vão para o site (o vite.config.js trava o build se forem).

const arquivos = import.meta.glob('../content/ingredientes/*.json', { eager: true, import: 'default' });
const ingredientes = Object.fromEntries(Object.entries(arquivos).map(([p, d]) => [p.split('/').pop().replace(/\.json$/, ''), d]));

// promoções conferidas com a data de HOJE no navegador (o site pode ter sido publicado dias antes)
export const cardapio = aplicarPromocoes(normalizar(montarCardapio({ acai, montador, gelato, milkshakes, combos, bebidas, ingredientes }), SABORES_PRONTOS), hojeLoja());
registrarIngredientes([...cardapio.montador.toppings, ...cardapio.montador.adicionais]);
registrarSabores(cardapio.gelato.sabores);
export default cardapio;
