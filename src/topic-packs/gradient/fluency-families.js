// Deterministic gradient practice. Foundation questions are based on rise/run,
// straight-line equations and tables. Two-coordinate questions are stretch only.
import {int,pick,fmt,question} from '../builders/fluency-question.js';
import {linearEquation} from '../../visuals/models.js';
const slope=rng=>pick(rng,[-3,-2,-1,1,2,3]);
const clean=n=>String(Math.round(n*10000)/10000);
const signed=n=>n<0?'−'+clean(-n):clean(n);
const q=options=>question(options);
function grid(rng,down=false){
  const run=int(rng,2,6),m=int(rng,1,3)*(down?-1:1),start=int(rng,-5,5);
  const rise=run*Math.abs(m),change=down?-rise:rise;
  return {run,m,start,rise,change};
}
function xy(rng,m,dx){
  const x1=int(rng,-5,1),y1=int(rng,-6,6),x2=x1+dx,y2=y1+m*dx;
  return {x1,y1,x2,y2,dx,dy:m*dx,m};
}
export const fluencyFamilies=Object.freeze({
  'rising-grid':rng=>{
    const {run,m,rise,start}=grid(rng);
    return q({family:'rising-grid',signature:[run,m,start].join(':'),skill:'Rise and run',
      prompt:'On a squared grid, a line goes '+run+' squares right and '+rise+' squares up. Find its gradient.',
      values:[m],steps:['The signed rise is +'+rise+' and the horizontal run is '+run+'.',
        'Gradient = rise ÷ run = '+rise+' ÷ '+run+' = '+m+'.'],
      hint:'Count the vertical rise, then divide by the horizontal run.',
      mistake:'Divide the rise by the run; do not reverse the fraction.',marks:2});
  },
  'falling-grid':rng=>{
    const {run,m,rise,start}=grid(rng,true);
    return q({family:'falling-grid',signature:[run,m,start].join(':'),skill:'Negative gradients',
      prompt:'On a squared grid, a line goes '+run+' squares right and '+rise+' squares down. Find its signed gradient.',
      values:[m],steps:['The signed rise is −'+rise+' because the line falls; run = '+run+'.',
        'Gradient = −'+rise+' ÷ '+run+' = '+signed(m)+'.'],
      hint:'Downhill from left to right means the rise is negative.',
      mistake:'Remember the negative sign: a line falling to the right has negative gradient.',marks:2});
  },
  'flat-grid':rng=>{
    const y=int(rng,-6,6),run=int(rng,2,9);
    return q({family:'flat-grid',signature:y+':'+run,skill:'Zero gradients',
      prompt:'A horizontal line remains at height y = '+signed(y)+' as you move '+run+' squares right. Find its gradient.',
      values:[0],steps:['The height stays constant, so the vertical rise is 0.',
        'Gradient = rise ÷ run = 0 ÷ '+run+' = 0.'],
      hint:'A horizontal line has no change in the vertical direction.',
      mistake:'The constant height is not the gradient: horizontal lines have gradient zero.',marks:2});
  },
  'rise-run':rng=>{
    const m=pick(rng,[-3,-2,-1,-0.5,0.5,1,1.5,2,3]),run=pick(rng,[2,4,6,8]);
    const change=m*run,direction=change<0?'down':'up';
    return q({family:'rise-run',signature:m+':'+run,skill:'Counting gradient',
      prompt:'A straight line moves '+run+' units right and '+clean(Math.abs(change))+
        ' units '+direction+'. Calculate its gradient.',
      values:[m],steps:['Write the signed vertical change as '+signed(change)+' and the horizontal run as '+run+'.',
        'Gradient = '+signed(change)+' ÷ '+run+' = '+signed(m)+'.'],
      hint:'Use rise ÷ run and give downward movement a minus sign.',
      mistake:'Check that you used signed rise divided by run.',marks:2});
  },
  'read-equation':rng=>{
    const m=slope(rng),b=int(rng,-9,9),equation=linearEquation({m,b});
    return q({family:'read-equation',signature:m+':'+b,skill:'Gradient from y = mx + c',
      prompt:'A straight line has equation '+equation+'. State its gradient.',
      values:[m],steps:['Compare '+equation+' with the standard form y = mx + c.',
        'The coefficient of x is '+signed(m)+', so the gradient is '+signed(m)+'.'],
      hint:'Read the number multiplying x; do not use the constant term.',
      mistake:'The gradient is the coefficient of x, including its sign, not the y-intercept.',marks:2});
  },
  'read-equation-zero':rng=>{
    const b=int(rng,-9,9);
    return q({family:'read-equation-zero',signature:'horizontal:'+b,skill:'Gradient from an equation',
      prompt:'The line has equation y = '+signed(b)+'. State its gradient.',
      values:[0],steps:['The equation contains no x term, so y never changes when x changes.',
        'This is a horizontal line with gradient 0.'],
      hint:'Look for the coefficient multiplying x; here there is no x term.',
      mistake:'The number '+signed(b)+' is the height of the line, not its gradient.',marks:2});
  },
  'gradient-table':rng=>{
    const m=int(rng,-3,3),x1=int(rng,-4,2),dx=pick(rng,[2,3,4]),y1=int(rng,-6,6);
    const x2=x1+dx,y2=y1+m*dx,dy=m*dx;
    return q({family:'gradient-table',signature:[m,x1,dx,y1].join(':'),skill:'Gradient from a table',
      prompt:'A straight-line table contains (x, y) = ('+signed(x1)+', '+signed(y1)+
        ') and ('+signed(x2)+', '+signed(y2)+'). Find the gradient.',
      values:[m],steps:['Across the table, x changes by '+signed(x2)+' − ('+signed(x1)+') = '+dx+
        '; y changes by '+signed(y2)+' − ('+signed(y1)+') = '+signed(dy)+'.',
        'Gradient = '+signed(dy)+' ÷ '+dx+' = '+signed(m)+'.'],
      hint:'Subtract the two y-values and divide by the change in x.',
      mistake:'Use the same two columns for both changes and keep the sign of the y-change.',marks:3});
  },
  'gradient-context':rng=>{
    const run=pick(rng,[2,4,5,8,10]),m=pick(rng,[0.2,0.25,0.5,1,1.5,2]);
    const rise=Math.round(run*m*100)/100;
    return q({family:'gradient-context',signature:run+':'+m,skill:'Gradient in context',
      prompt:'A scaled drawing of a path shows a rise of '+clean(rise)+
        ' m for a horizontal run of '+run+' m. Calculate the rise per horizontal metre.',
      values:[m],steps:['The change in height is '+clean(rise)+' m and the horizontal distance is '+run+' m.',
        'Rise per horizontal metre = '+clean(rise)+' ÷ '+run+' = '+clean(m)+' m per m.'],
      hint:'Divide vertical height gained by horizontal distance travelled.',
      mistake:'Use horizontal distance, not the sloping path length; divide rise by run.',marks:2});
  },
  'unknown-rise':rng=>{
    const m=slope(rng),run=int(rng,2,7),rise=m*run;
    return q({family:'unknown-rise',signature:m+':'+run,skill:'Find a change from gradient',
      prompt:'A line has gradient '+signed(m)+'. As x increases by '+run+
        ', find the signed change in y.',
      values:[rise],steps:['For a straight line, signed rise = gradient × horizontal run.',
        'Signed change in y = ('+signed(m)+') × '+run+' = '+signed(rise)+'.'],
      hint:'Multiply gradient by the horizontal run, keeping its sign.',
      mistake:'The signed change in y is gradient multiplied by the run, not divided by it.',marks:2});
  },
  'unknown-run':rng=>{
    const m=slope(rng),run=int(rng,2,7),rise=m*run;
    return q({family:'unknown-run',signature:m+':'+run,skill:'Find a run from gradient',
      prompt:'A straight line has gradient '+signed(m)+' and a signed rise of '+
        signed(rise)+'. Find the positive horizontal run.',
      values:[run],steps:['Gradient = signed rise ÷ run, so run = signed rise ÷ gradient.',
        'Run = ('+signed(rise)+') ÷ ('+signed(m)+') = '+run+'.'],
      hint:'Rearrange rise ÷ run = gradient to make run the subject.',
      mistake:'Divide signed rise by gradient. Both negative values give a positive run.',marks:3});
  },
  'compare-steepness':rng=>{
    const a=int(rng,2,4),b=int(rng,0,1),run=int(rng,2,5);
    return q({family:'compare-steepness',signature:[a,b,run].join(':'),skill:'Compare gradient',
      prompt:'Line A rises '+(a*run)+' squares over a run of '+run+
        '. Line B rises '+(b*run)+' squares over the same run. How much greater is the gradient of A?',
      values:[a-b],steps:['Gradient A = '+(a*run)+' ÷ '+run+' = '+a+
        '; gradient B = '+(b*run)+' ÷ '+run+' = '+b+'.',
        'Difference in gradient = '+a+' − '+b+' = '+(a-b)+'.'],
      hint:'Calculate both gradients first, then subtract B from A.',
      mistake:'Compare gradients, not just the total vertical rises.',marks:3});
  },
  'parallel-gradient':rng=>{
    const m=slope(rng),b=int(rng,-8,8),equation=linearEquation({m,b});
    return q({family:'parallel-gradient',signature:m+':'+b,skill:'Same gradient',
      prompt:'A straight line is parallel to '+equation+'. What is its gradient?',
      values:[m],steps:['The reference line '+equation+' has coefficient of x equal to '+signed(m)+'.',
        'Parallel straight lines have the same gradient, so the required gradient is '+signed(m)+'.'],
      hint:'Two parallel non-vertical lines rise or fall at the same rate.',
      mistake:'Parallel lines share a gradient; they need not share a y-intercept.',marks:2});
  },
  'coordinate-steps':rng=>{
    const m=slope(rng),p=xy(rng,m,int(rng,2,5));
    return q({family:'coordinate-steps',signature:[p.x1,p.y1,p.dx,m].join(':'),
      skill:'Stretch: gradient from two points',
      prompt:'Stretch: A('+signed(p.x1)+', '+signed(p.y1)+') and B('+signed(p.x2)+
        ', '+signed(p.y2)+') lie on a straight line. Find its gradient.',
      values:[m],steps:['Signed rise = '+signed(p.y2)+' − ('+signed(p.y1)+') = '+signed(p.dy)+
        '; run = '+signed(p.x2)+' − ('+signed(p.x1)+') = '+p.dx+'.',
        'Gradient = '+signed(p.dy)+' ÷ '+p.dx+' = '+signed(m)+'.'],
      hint:'Subtract y-coordinates and x-coordinates in the same order.',
      mistake:'Keep the two coordinate subtractions in the same order.',marks:3});
  },
  'coordinate-fraction':rng=>{
    const m=pick(rng,[-1.5,-0.5,0.5,1.5]),p=xy(rng,m,pick(rng,[2,4,6]));
    return q({family:'coordinate-fraction',signature:[p.x1,p.y1,p.dx,m].join(':'),
      skill:'Stretch: fractional gradient',
      prompt:'Stretch: Find the gradient of the line through ('+signed(p.x1)+', '+
        signed(p.y1)+') and ('+signed(p.x2)+', '+signed(p.y2)+').',
      values:[m],steps:['The signed rise is '+signed(p.y2)+' − ('+signed(p.y1)+') = '+
        signed(p.dy)+'; the run is '+signed(p.x2)+' − ('+signed(p.x1)+') = '+p.dx+'.',
        'Gradient = '+signed(p.dy)+' ÷ '+p.dx+' = '+signed(m)+
        ' (a decimal or equivalent fraction is acceptable).'],
      hint:'Keep the subtraction order the same, then divide vertical change by horizontal change.',
      mistake:'Check signs and divide y-change by x-change, not the other way round.',marks:3});
  },
  'error-correction':rng=>{
    const run=int(rng,2,6),m=pick(rng,[-3,-2,2,3]),rise=run*m;
    return q({family:'error-correction',signature:run+':'+m,skill:'Correct gradient errors',
      prompt:'A pupil counts a signed rise of '+signed(rise)+' and a run of '+run+
        ', but divides run by rise. Give the correct gradient.',
      values:[m],steps:['The correct order is signed rise ÷ horizontal run.',
        'Gradient = '+signed(rise)+' ÷ '+run+' = '+signed(m)+'.'],
      hint:'Check which number should be the numerator of the fraction.',
      mistake:'Rise goes above run; reversing the division gives a reciprocal gradient.',marks:2});
  },
  'coordinate-reversed':rng=>{
    const m=slope(rng),p=xy(rng,m,int(rng,2,5));
    return q({family:'coordinate-reversed',signature:[p.x1,p.y1,p.dx,m].join(':'),
      skill:'Stretch: reverse coordinate order',
      prompt:'Stretch: Calculate the gradient from B('+signed(p.x2)+', '+signed(p.y2)+
        ') to A('+signed(p.x1)+', '+signed(p.y1)+').',
      values:[m],steps:['Subtract in this order: y(A) − y(B) = '+signed(p.y1)+' − ('+
        signed(p.y2)+') = '+signed(-p.dy)+'; x(A) − x(B) = '+
        signed(p.x1)+' − ('+signed(p.x2)+') = '+signed(-p.dx)+'.',
        'Gradient = '+signed(-p.dy)+' ÷ ('+signed(-p.dx)+') = '+signed(m)+
        '. Reversing both differences leaves gradient unchanged.'],
      hint:'Subtract the second y-value from the first y-value, then do the same for x.',
      mistake:'Changing the order of only one subtraction incorrectly flips the sign.',marks:3});
  }
});
