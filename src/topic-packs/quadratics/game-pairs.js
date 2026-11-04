// Reuse reviewed quadratic vocabulary; no copies of the game logic.
import {cards} from './memorise.js';
import {vocabularyGamePairs} from '../../games/engine.js';
export const gamePairs=Object.freeze(vocabularyGamePairs(cards));
