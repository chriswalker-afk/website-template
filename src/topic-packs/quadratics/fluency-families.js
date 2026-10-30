// Quadratics Fluency question families. IDs and question generation preserved for saved sets.
import {int,pick,fmt,poly,bracket,factored,vertexForm,rnd2,question} from '../builders/fluency-question.js';
export const fluencyFamilies=Object.freeze({
  evaluate:rng=>{
    const a=pick(rng,[1,2,3,-1,-2]),b=int(rng,-6,6),c=int(rng,-8,8),x=int(rng,-4,4),v=a*x*x+b*x+c;
    return question({family:'evaluate',signature:[a,b,c,x].join(':'),skill:'Substitution',
      prompt:'For f(x) = '+poly(a,b,c)+', calculate f('+x+').',
      values:[v],steps:['Substitute x = '+x+': f('+x+') = ('+a+')('+x+')² + ('+b+')('+x+') + ('+c+').',
        'Evaluate the terms: '+(a*x*x)+' + ('+(b*x)+') + ('+c+') = '+v+'.'],
      hint:'Replace every x with '+x+'; remember to square a negative value before multiplying by a.',
      mistake:'Check the order of operations: x² is calculated before multiplying by a.',marks:2});
  },
  vertex:rng=>{
    const a=pick(rng,[-2,-1,1,2]),h=int(rng,-5,5),k=int(rng,-6,6);
    return question({family:'vertex',signature:[a,h,k].join(':'),skill:'Turning points',
      prompt:'State the turning point (h, k) of y = '+vertexForm(a,h,k)+'.',
      values:[h,k],kind:'ordered',
      steps:['Compare with y = a(x − h)² + k.',
        'Here h = '+h+' and k = '+k+', so the turning point is ('+h+', '+k+').'],
      hint:'The sign of h inside the bracket is reversed; k is the number outside.',
      mistake:'Check the sign of h inside the bracket; the turning point is written (h, k).',marks:2});
  },
  'factor-roots':rng=>{
    let r=int(rng,-6,6),s=int(rng,-6,6);if(s===r)s=r===6?-5:r+1;
    return question({family:'factor-roots',signature:[r,s].sort((a,b)=>a-b).join(':'),skill:'Factorised equations',
      prompt:'Solve '+factored(1,r,s)+' = 0. Give both roots.',
      values:[r,s],kind:'unordered',
      steps:['Use the zero-product rule: '+bracket(r)+' = 0 or '+bracket(s)+' = 0.',
        'Therefore x = '+r+' or x = '+s+'.'],
      hint:'Set each bracket equal to zero separately.',
      mistake:'Each root has the opposite sign to its number inside the bracket.',marks:2});
  },
  intercept:rng=>{
    const a=pick(rng,[-3,-2,1,2,3]),b=int(rng,-7,7),c=int(rng,-9,9);
    return question({family:'intercept',signature:[a,b,c].join(':'),skill:'Graph features',
      prompt:'For y = '+poly(a,b,c)+', find the y-coordinate of the y-intercept.',
      values:[c],steps:['At the y-intercept x = 0.',
        'Substituting x = 0 gives y = '+c+'.'],
      hint:'The y-intercept occurs where x = 0.',
      mistake:'For y = ax² + bx + c the y-intercept has y-coordinate c, not b.',marks:2});
  },
  'monic-roots':rng=>{
    let r=int(rng,-7,7),s=int(rng,-7,7);if(s===r)s=r===7?-6:r+1;
    const b=-(r+s),c=r*s;
    return question({family:'monic-roots',signature:[r,s].sort((x,y)=>x-y).join(':'),skill:'Factorising quadratics',
      prompt:'Solve '+poly(1,b,c)+' = 0 by factorising.',
      values:[r,s],kind:'unordered',
      steps:['Find two numbers with sum '+b+' and product '+c+': '+(-r)+' and '+(-s)+'.',
        poly(1,b,c)+' = '+factored(1,r,s)+'.',
        'Set each bracket equal to zero: x = '+r+' or x = '+s+'.'],
      hint:'Find two integers with sum '+b+' and product '+c+'.',
      mistake:'Check both roots by substituting them into the original equation.',marks:3});
  },
  discriminant:rng=>{
    const a=pick(rng,[-3,-2,-1,1,2,3]),b=int(rng,-9,9),c=int(rng,-9,9),D=b*b-4*a*c;
    return question({family:'discriminant',signature:[a,b,c].join(':'),skill:'The discriminant',
      prompt:'For '+poly(a,b,c)+' = 0, calculate the discriminant b² − 4ac.',
      values:[D],steps:['Identify a = '+a+', b = '+b+', c = '+c+'.',
        'b² − 4ac = ('+b+')² − 4('+a+')('+c+') = '+D+'.'],
      hint:'Use b² − 4ac and include brackets around negative coefficients.',
      mistake:'Be careful with the signs in −4ac, especially if a or c is negative.',marks:3});
  },
  'monic-vertex':rng=>{
    const h=int(rng,-5,5),k=int(rng,-7,7),b=-2*h,c=h*h+k;
    return question({family:'monic-vertex',signature:h+':'+k,skill:'Completing the square',
      prompt:'Find the turning point (h, k) of y = '+poly(1,b,c)+'.',
      values:[h,k],kind:'ordered',
      steps:['Half the coefficient of x: '+b+' ÷ 2 = '+(-h)+'.',
        'Complete the square: y = '+vertexForm(1,h,k)+'.',
        'The turning point is ('+h+', '+k+').'],
      hint:'Complete the square first. The turning point is (h, k) in y = (x − h)² + k.',
      mistake:'Check the sign inside the completed-square bracket.',marks:4});
  },
  'scaled-roots':rng=>{
    const a=pick(rng,[2,3,4,-2]),r=int(rng,-6,6);let s=int(rng,-6,6);
    if(s===r)s=r===6?-5:r+1;
    const b=-a*(r+s),c=a*r*s;
    return question({family:'scaled-roots',signature:[a,...[r,s].sort((x,y)=>x-y)].join(':'),skill:'Non-monic factorising',
      prompt:'Solve '+poly(a,b,c)+' = 0.',
      values:[r,s],kind:'unordered',
      steps:['Extract the common coefficient '+a+' where appropriate, or identify the factorised form.',
        poly(a,b,c)+' = '+factored(a,r,s)+'.',
        'The constant factor is non-zero, so x = '+r+' or x = '+s+'.'],
      hint:'Look for a factorisation in the form a(x − p)(x − q).',
      mistake:'The coefficient a changes the graph’s scale but not the roots of a(x − p)(x − q).',marks:4});
  },
  'expanded-vertex':rng=>{
    const a=pick(rng,[-3,-2,2,3]),h=int(rng,-4,4),k=int(rng,-6,6);
    const b=-2*a*h,c=a*h*h+k;
    return question({family:'expanded-vertex',signature:[a,h,k].join(':'),skill:'Non-monic completing the square',
      prompt:'Find the turning point (h, k) of y = '+poly(a,b,c)+'.',
      values:[h,k],kind:'ordered',
      steps:['Factor out a = '+a+' from the x² and x terms.',
        'Complete the square to write y = '+vertexForm(a,h,k)+'.',
        'The turning point is ('+h+', '+k+').'],
      hint:'Factor the coefficient of x² from the x² and x terms before completing the square.',
      mistake:'When a ≠ 1, divide the x coefficient by a before halving it.',marks:4});
  },
  'formula-roots':rng=>{
    let a,b,c,D;
    for(let i=0;i<100;i++){
      a=pick(rng,[1,2,3]),b=int(rng,-9,9),c=int(rng,-9,9);
      D=b*b-4*a*c;
      if(D>0&&Number.isInteger(Math.sqrt(D))===false)break;
    }
    if(!(D>0)||Number.isInteger(Math.sqrt(D)))throw Error('Could not generate irrational roots');
    const r=(-b-Math.sqrt(D))/(2*a),s=(-b+Math.sqrt(D))/(2*a);
    return question({family:'formula-roots',signature:[a,b,c].join(':'),skill:'Quadratic formula',
      prompt:'Solve '+poly(a,b,c)+' = 0. Give both roots to 2 decimal places.',
      values:[rnd2(r),rnd2(s)],kind:'unordered',precision:0.0051,
      steps:['Identify a = '+a+', b = '+b+', c = '+c+'.',
        'Discriminant = '+b+'² − 4('+a+')('+c+') = '+D+'.',
        'Use x = (−b ± √D)/(2a) = ('+(-b)+' ± √'+D+')/'+(2*a)+'.',
        'To 2 d.p., x ≈ '+rnd2(r).toFixed(2)+' or '+rnd2(s).toFixed(2)+'.'],
      hint:'Calculate the discriminant and substitute into x = (−b ± √(b² − 4ac))/(2a).',
      mistake:'Keep brackets around the whole numerator and denominator; round only at the end.',marks:5});
  },
  'unknown-coefficient':rng=>{
    const a=pick(rng,[1,2,3]),r=pick(rng,[-5,-4,-3,-2,-1,1,2,3,4,5]),
      b=int(rng,-9,9),c=-a*r*r-b*r;
    const equation=(a===1?'x²':a+'x²')+' + bx'+(c===0?'':(c<0?' − ':' + ')+Math.abs(c));
    return question({family:'unknown-coefficient',signature:[a,r,b].join(':'),skill:'Unknown coefficients',
      prompt:'The equation '+equation+' = 0 has a root x = '+r+'. Find b.',
      values:[b],steps:['Substitute x = '+r+' into the equation: '+a+'('+r+')² + b('+r+') + ('+c+') = 0.',
        'Simplify: '+(b*r)+' = −('+a*r*r+' + ('+c+')).',
        'Divide by '+r+' to obtain b = '+b+'.'],
      hint:'Set x equal to the given root, then rearrange the equation to find b.',
      mistake:'At a root, the quadratic expression equals zero. Do not differentiate.',marks:4});
  },
  'extreme-value':rng=>{
    const a=pick(rng,[-3,-2,2,3]),h=int(rng,-4,4),k=int(rng,-7,7);
    const b=-2*a*h,c=a*h*h+k,kind=a>0?'minimum':'maximum';
    return question({family:'extreme-value',signature:[a,h,k].join(':'),skill:'Extreme values',
      prompt:'Find the '+kind+' value of y = '+poly(a,b,c)+'.',
      values:[k],steps:['Complete the square: y = '+vertexForm(a,h,k)+'.',
        'Since a = '+a+(a>0?' > 0, the turning point is a minimum.':' < 0, the turning point is a maximum.'),
        'The '+kind+' value of y is '+k+'.'],
      hint:'Complete the square and read off the y-coordinate of the turning point.',
      mistake:'The extreme value is the y-coordinate k, not the x-coordinate h.',marks:4});
  }
});
