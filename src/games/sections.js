// Shared game tabs. Each topic can add any subset without copying the mechanics.
import {section,game} from '../topic-packs/builders/sections.js';
export const STANDARD_GAME_DETAILS=Object.freeze({
  'loop-cards':Object.freeze({
    label:'Loop Cards',
    description:'Arrange question-and-answer domino cards into one complete loop.',
    objective:'Match each question to the answer on the next card, including the last back to the first.',
    mechanic:'Tap a card to place it, tap it again to return it, then check the closed loop.'
  }),
  concentration:Object.freeze({
    label:'Concentration',
    description:'Flip cards and match mathematical questions with their answers.',
    objective:'Remember which cards show questions and which show the matching answers.',
    mechanic:'One-player practice or two-player turns; matching pairs score a point.'
  }),
  'hex-crossing':Object.freeze({
    label:'Hex Crossing',
    description:'A Blockbusters-style two-player mathematics race across a hexagon board.',
    objective:'Player 1 connects left to right; Player 2 connects top to bottom.',
    mechanic:'Choose a hexagon and answer its question correctly to claim it for your path.'
  })
});
export function standardGameSections(ids=Object.keys(STANDARD_GAME_DETAILS)){
  return ids.map(id=>{
    const info=STANDARD_GAME_DETAILS[id];
    if(!info)throw new TypeError('Unknown standard mathematics game '+id);
    return section(id,info.label,info.description,game(id,info.objective,info.mechanic));
  });
}
