// Reuse each reviewed vocabulary definition as a question, with exact
// teacher-approved term aliases. All three games work with text answers.
import {cards} from './memorise.js';
import {vocabularyGamePairs} from '../../games/engine.js';
export const gamePairs=Object.freeze(vocabularyGamePairs(cards));
