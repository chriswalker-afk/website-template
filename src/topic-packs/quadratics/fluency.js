// Level/page/family definitions; family implementations migrate in Pass 2.
import {level} from '../builders/fluency.js';
export const fluency=[
    level(1,'Guided','Use a visible starting cue to practise substitution, turning points and factorised roots.',[
      ['values','Calculate function values and read completed-square turning points.',['evaluate','vertex']],
      ['roots','Solve factorised equations and find y-intercepts.',['factor-roots','intercept']]]),
    level(2,'Structured','Follow a short method checklist while practising factorising, discriminants and completing the square.',[
      ['factorise','Solve monic quadratic equations, calculate discriminants and find turning points.',['monic-roots','discriminant','monic-vertex']]]),
    level(3,'Independent','Select the method independently for non-monic factorising, discriminants and turning points.',[
      ['mixed','Use more than one familiar quadratic technique in a mixed sequence.',['scaled-roots','expanded-vertex','discriminant','monic-roots']]]),
    level(4,'Challenge','Challenge your accuracy with more demanding quadratic calculations and reverse problems.',[
      ['advanced','Apply the quadratic formula, recover a coefficient and find extreme values.',['formula-roots','unknown-coefficient','extreme-value','scaled-roots']]])
  ];
