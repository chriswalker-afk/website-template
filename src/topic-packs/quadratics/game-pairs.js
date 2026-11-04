// Reuse reviewed quadratic vocabulary; no copies of the game logic.
import {cards} from './memorise.js';
import {vocabularyGamePairs} from '../../games/contracts.js';
export const gamePairs=Object.freeze(vocabularyGamePairs(cards));
