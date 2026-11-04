// Teacher-reviewed numerical question-answer cards for reusable games.
// Every displayed answer is unique, so the domino loop has only one correct
// successor per card. Challenge questions may be included in Mixed mode.
import {numericalGamePair as numberCard} from '../../games/contracts.js';
export const gamePairs=Object.freeze([
  numberCard('rise-three','A line moves 4 squares right and 12 squares up. Find its gradient.',3),
  numberCard('down-two','A line moves 5 squares right and 10 squares down. Find its signed gradient.',-2),
  numberCard('horizontal','A line is horizontal at y = 7. What is its gradient?',0),
  numberCard('rise-one','A line rises 6 squares over a run of 6 squares. Calculate its gradient.',1),
  numberCard('down-four','A line drops 8 units for a run of 2 units. Find its signed gradient.',-4),
  numberCard('equation-five','A straight line has equation y = 5x + 2. State its gradient.',5),
  numberCard('down-three','A line drops 9 squares over a run of 3 squares. Find its signed gradient.',-3),
  numberCard('rise-two','A line rises 10 metres over a horizontal run of 5 metres. Find its gradient.',2),
  numberCard('equation-minus-one','A straight line has equation y = −x + 4. State its gradient.',-1),
  numberCard('rise-four','A line rises 20 units over a horizontal run of 5 units. Find its gradient.',4),
  numberCard('half','A line rises 3 units over a horizontal run of 6 units. Find its gradient.',0.5),
  numberCard('minus-half','A line falls 3 units over a horizontal run of 6 units. Find its signed gradient.',-0.5),
  numberCard('minus-five','A straight line falls 15 units over a run of 3 units. Find its gradient.',-5),
  numberCard('rise-six','A line rises 24 units as x increases by 4. Find its gradient.',6),
  numberCard('coordinate-fraction','Find the gradient through (1, 3) and (5, 9).',1.5,{level:'challenge'}),
  numberCard('coordinate-negative','Find the gradient through (−2, 6) and (2, 0).',-1.5,{level:'challenge'})
]);
