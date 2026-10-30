// Foundation curriculum first; coordinate-pair gradients are clearly labelled as stretch.
import {level} from '../builders/fluency.js';
export const fluency=[
  level(1,'Guided','Count the rise and run on a grid, including gentle and horizontal straight lines.',[
    ['grid-up','Find gradients of rising straight lines from labelled rises and runs.',['rising-grid','rise-run']],
    ['grid-sign','Identify gradients of falling and horizontal lines with an opening cue.',['falling-grid','flat-grid']]]),
  level(2,'Structured','Apply a method checklist to gradients from equations and regular number tables.',[
    ['equations','Find gradient as the coefficient of x in a straight-line equation.',['read-equation','read-equation-zero']],
    ['tables','Compare changes in x and y; distinguish rise from run.',['gradient-table','gradient-context','rise-run']]]),
  level(3,'Independent','Choose a reliable gradient method and connect it to graphs, tables and situations.',[
    ['mixed-graph','Find gradients and missing vertical changes without a first-step cue.',['rise-run','falling-grid','unknown-rise','unknown-run']],
    ['compare','Distinguish steepness, parallel gradients and change in context.',['compare-steepness','parallel-gradient','gradient-context','gradient-table']]]),
  level(4,'Challenge','Stretch: calculate gradients using coordinates and explain less familiar changes.',[
    ['two-points','Extension beyond the Foundation core: calculate gradients from two coordinates.',['coordinate-steps','coordinate-fraction','error-correction']],
    ['reverse','Challenge your reasoning with missing changes and reversed coordinate order.',['coordinate-reversed','unknown-rise','unknown-run','error-correction']]])
];
