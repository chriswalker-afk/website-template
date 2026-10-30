import {FLUENCY_LEVELS} from './fluency-levels.js';
// Reusable, deterministic Fluency question generator and strict response verifier.
// No DOM, network, eval, AI grading or external dependencies. Questions carry their
// own numerical answer contract and fully authored, parameter-derived working.
export const FLUENCY_VERSION=1;
export const PRACTICE_LENGTHS=Object.freeze([6,10]);
const level=(n,label,description,pages)=>({
  id:'level-'+n,label:'Level '+n+': '+label,description,
  pages:pages.map(([id,focus,families])=>({id,type:'fluency',focus,families}))
});
export const FLUENCY_CHAPTERS=Object.freeze({
  sampling:[
    level(1,'Guided','Use a visible starting cue to practise sample percentages, sample sizes and systematic intervals accurately.',[
      ['counts','Practise calculating sample sizes and percentages.',['sample-percent','sample-count']],
      ['intervals','Practise systematic sampling intervals and sample sizes.',['interval','sample-size']]]),
    level(2,'Structured','Follow a short method checklist for proportional allocations and systematic selections.',[
      ['allocation','Practise two-stratum allocations and listing systematic selections.',['stratified-two','positions','interval']]]),
    level(3,'Independent','Choose independently between familiar sampling calculations in a mixed set.',[
      ['mixed','Combine three-stratum allocations, positions and percentages.',['stratified-three','last-position','sample-percent','stratified-two']]]),
    level(4,'Challenge','Challenge your fluency with reverse and combined sampling calculations.',[
      ['advanced','Find missing group sizes and combine proportional and systematic calculations.',['reverse-population','reverse-sample','within-stratum-interval','stratified-three']]])
  ],
  quadratics:[
    level(1,'Guided','Use a visible starting cue to practise substitution, turning points and factorised roots.',[
      ['values','Calculate function values and read completed-square turning points.',['evaluate','vertex']],
      ['roots','Solve factorised equations and find y-intercepts.',['factor-roots','intercept']]]),
    level(2,'Structured','Follow a short method checklist while practising factorising, discriminants and completing the square.',[
      ['factorise','Solve monic quadratic equations, calculate discriminants and find turning points.',['monic-roots','discriminant','monic-vertex']]]),
    level(3,'Independent','Select the method independently for non-monic factorising, discriminants and turning points.',[
      ['mixed','Use more than one familiar quadratic technique in a mixed sequence.',['scaled-roots','expanded-vertex','discriminant','monic-roots']]]),
    level(4,'Challenge','Challenge your accuracy with more demanding quadratic calculations and reverse problems.',[
      ['advanced','Apply the quadratic formula, recover a coefficient and find extreme values.',['formula-roots','unknown-coefficient','extreme-value','scaled-roots']]])
  ]
});

const int=(rng,min,max)=>min+Math.floor(rng()*(max-min+1));
const pick=(rng,items)=>items[int(rng,0,items.length-1)];
const fmt=n=>Object.is(n,-0)?'0':String(n);
const signs=(n,first=false)=>first?(n<0?'−':''):(n<0?' − ':' + ');
function poly(a,b,c){
  return [[a,'x²'],[b,'x'],[c,'']].filter(([n])=>n!==0)
    .map(([n,unit],i)=>signs(n,i===0)+(unit&&Math.abs(n)===1?'':Math.abs(n))+unit)
    .join('')||'0';
}
const bracket=r=>'('+(r===0?'x':'x '+(r>0?'− '+r:'+ '+Math.abs(r)))+')';
const factored=(a,r,s)=>(a===1?'':a===-1?'−':fmt(a))+bracket(r)+bracket(s);
function vertexForm(a,h,k){
  const core=h===0?'x²':bracket(h)+'²';
  return (a===1?'':a===-1?'−':fmt(a))+core+
    (k===0?'':(k<0?' − ':' + ')+Math.abs(k));
}
const rnd2=n=>Math.round((n+Number.EPSILON)*100)/100;
function question({family,signature,prompt,values,kind='number',steps,hint,marks=2,skill,
  mistake='',precision=0,unit='',answerLabel}){
  return {family,signature:family+':'+signature,prompt,answer:{
    kind,values:[...values],precision,unit,
    label:answerLabel||(
      kind==='number'?'Enter one number'+(unit?' ('+unit+')':'')+'.':
      kind==='unordered'?'Enter both roots separated by a comma (either order).':
      kind==='ordered'?'Enter the values in order, separated by commas.':'Enter the values separated by commas.')
  },steps,hint,marks,skill,mistake};
}
const SAMPLING={
  'sample-percent':rng=>{
    const N=20*int(rng,8,35),p=pick(rng,[5,10,15,20,25,30,40,50]),n=N*p/100;
    return question({family:'sample-percent',signature:N+':'+p,skill:'Sample percentages',
      prompt:'A population contains '+N+' people. A sample of '+n+' is chosen. What percentage of the population is sampled?',
      values:[p],unit:'%',steps:['Sample fraction = '+n+' ÷ '+N+'.',
        'Multiply by 100: ('+n+' ÷ '+N+') × 100 = '+p+'%.'],
      hint:'Divide the sample size by the population size, then multiply by 100.',
      mistake:'Check that you divided the number sampled by the entire population.',
      marks:2});
  },
  'sample-count':rng=>{
    const N=20*int(rng,6,40),p=pick(rng,[5,10,15,20,25,30,40,50]),n=N*p/100;
    return question({family:'sample-count',signature:N+':'+p,skill:'Sample sizes',
      prompt:'A '+p+'% sample is required from a population of '+N+'. How many people should be selected?',
      values:[n],steps:['Convert the percentage: '+p+'% = '+p+'/100.',
        'Sample size = '+N+' × '+p+'/100 = '+n+'.'],hint:'Multiply the population size by the percentage as a fraction.',
      mistake:'Remember that '+p+'% means '+p+' out of 100, not '+p+' times the population.',marks:2});
  },
  interval:rng=>{
    const step=int(rng,3,15),n=int(rng,12,48),N=step*n;
    return question({family:'interval',signature:N+':'+n,skill:'Systematic intervals',
      prompt:'A systematic sample of '+n+' is needed from an ordered list of '+N+'. Find the sampling interval.',
      values:[step],steps:['Interval = list size ÷ required sample size.',
        'Interval = '+N+' ÷ '+n+' = '+step+'.'],
      hint:'Divide the length of the list by the number to be sampled.',
      mistake:'The sampling interval is not the sample size. Check '+n+' × interval = '+N+'.',marks:2});
  },
  'sample-size':rng=>{
    const step=int(rng,3,15),n=int(rng,10,45),N=step*n;
    return question({family:'sample-size',signature:N+':'+step,skill:'Systematic sample size',
      prompt:'An ordered list has '+N+' entries. A systematic sample uses interval '+step+'. How many people are selected?',
      values:[n],steps:['Number selected = list size ÷ interval.',
        'Number selected = '+N+' ÷ '+step+' = '+n+'.'],
      hint:'Reverse the interval calculation.',mistake:'Use total entries ÷ interval, not total entries × interval.',marks:2});
  },
  'stratified-two':rng=>{
    const a=20*int(rng,4,16),b=20*int(rng,4,18),d=pick(rng,[4,5,10]),n=(a+b)/d,na=a/d,nb=b/d;
    return question({family:'stratified-two',signature:a+':'+b+':'+d,skill:'Proportional allocation',
      prompt:'Group A has '+a+' people and Group B has '+b+'. Allocate a proportional stratified sample of '+n+
        '. Give the numbers from A and B, in that order.',
      values:[na,nb],kind:'ordered',
      steps:['Population total = '+a+' + '+b+' = '+(a+b)+'.',
        'A: '+n+' × '+a+'/'+(a+b)+' = '+na+'.',
        'B: '+n+' × '+b+'/'+(a+b)+' = '+nb+'. Check '+na+' + '+nb+' = '+n+'.'],
      hint:'Multiply the sample size by each stratum’s share of the total population.',
      mistake:'Allocate proportionally to the group sizes; do not split the sample equally.',marks:3});
  },
  positions:rng=>{
    const step=int(rng,3,12),size=int(rng,9,20),start=int(rng,1,step),N=step*size;
    const values=Array.from({length:5},(_,i)=>start+i*step);
    return question({family:'positions',signature:step+':'+size+':'+start,skill:'Systematic positions',
      prompt:'From an ordered list of '+N+' entries, a systematic sample uses interval '+step+
        ' and a random start at position '+start+'. List the first five selected positions in order.',
      values,kind:'ordered',steps:['Start at the selected position '+start+'.',
        'Add '+step+' repeatedly: '+values.join(', ')+'.'],
      hint:'Add the interval to the starting position each time.',
      mistake:'Your first position should be '+start+', followed by steps of '+step+'.',marks:3});
  },
  'stratified-three':rng=>{
    const sizes=[20*int(rng,3,12),20*int(rng,4,14),20*int(rng,3,13)],d=pick(rng,[4,5,10]);
    const N=sizes.reduce((a,b)=>a+b,0),n=N/d,values=sizes.map(x=>x/d);
    return question({family:'stratified-three',signature:sizes.join(':')+':'+d,skill:'Three-stratum allocation',
      prompt:'Strata A, B and C contain '+sizes.join(', ')+' people. A proportional stratified sample of '+
        n+' is taken. Give the allocations A, B and C in order.',
      values,kind:'ordered',steps:['Total population = '+sizes.join(' + ')+' = '+N+'.',
        'Sampling fraction = '+n+'/'+N+' = 1/'+d+'.',
        'Allocations: '+sizes.map((x,i)=>' '+('ABC'[i])+': '+x+'/'+d+' = '+values[i]).join(';')+'.',
        'Check: '+values.join(' + ')+' = '+n+'.'],
      hint:'Calculate the sampling fraction and apply it to all three strata.',
      mistake:'Each stratum uses the same sampling fraction. Check that allocations add up to '+n+'.',marks:4});
  },
  'last-position':rng=>{
    const step=int(rng,4,13),size=int(rng,10,35),start=int(rng,1,step),N=size*step;
    const last=start+(size-1)*step;
    return question({family:'last-position',signature:step+':'+size+':'+start,skill:'Systematic sequence',
      prompt:'A systematic sample of '+size+' is taken from an ordered list of '+N+' people, starting at position '+
        start+'. What is the position of the final selected person?',
      values:[last],steps:['Interval = '+N+'/'+size+' = '+step+'.',
        'The first selected position is '+start+'; there are '+(size-1)+' further steps.',
        'Final position = '+start+' + '+(size-1)+' × '+step+' = '+last+'.'],
      hint:'Find the interval first. The final position comes after one fewer interval than the sample size.',
      mistake:'There are '+(size-1)+' jumps between '+size+' selected people, not '+size+'.',marks:3});
  },
  'reverse-population':rng=>{
    const a=20*int(rng,4,15),b=20*int(rng,4,14),c=20*int(rng,4,13),d=pick(rng,[4,5,10]);
    const n=(a+b+c)/d,na=a/d,nb=b/d,nc=c/d;
    return question({family:'reverse-population',signature:a+':'+b+':'+c+':'+d,skill:'Reverse stratification',
      prompt:'A proportional stratified sample of '+n+' is selected from three groups. Group A has '+
        a+' people and contributes '+na+' to the sample. Group B has '+b+
        ' people. How many people are in Group C if the same sampling fraction is used throughout?',
      values:[c],steps:['Sampling fraction = '+na+'/'+a+' = 1/'+d+'.',
        'Total population = sample size ÷ sampling fraction = '+n+' × '+d+' = '+(a+b+c)+'.',
        'C = '+(a+b+c)+' − '+a+' − '+b+' = '+c+'.'],
      hint:'Use Group A to find the sampling fraction; then reverse it to find the total population.',
      mistake:'Do not confuse the population size of Group C with its sample allocation of '+nc+'.',marks:5});
  },
  'reverse-sample':rng=>{
    const a=20*int(rng,5,14),b=20*int(rng,5,17),c=20*int(rng,4,16),d=pick(rng,[4,5,10]);
    const n=(a+b+c)/d,na=a/d;
    return question({family:'reverse-sample',signature:a+':'+b+':'+c+':'+d,skill:'Reverse sample size',
      prompt:'Three strata contain '+a+', '+b+' and '+c+' people. In a proportional sample, Group A contributes '+
        na+' people. Find the total sample size.',
      values:[n],steps:['Sampling fraction = '+na+'/'+a+' = 1/'+d+'.',
        'Population total = '+a+' + '+b+' + '+c+' = '+(a+b+c)+'.',
        'Sample size = '+(a+b+c)+' ÷ '+d+' = '+n+'.'],
      hint:'Work out the sample fraction from Group A, then apply it to the population total.',
      mistake:'The whole sample is larger than Group A’s allocation of '+na+'.',marks:4});
  },
  'within-stratum-interval':rng=>{
    const a=20*int(rng,4,14),b=20*int(rng,4,18),c=20*int(rng,4,15),d=pick(rng,[4,5,10]);
    const n=(a+b+c)/d,nb=b/d;
    return question({family:'within-stratum-interval',signature:a+':'+b+':'+c+':'+d,skill:'Combined sampling calculations',
      prompt:'Strata A, B and C have sizes '+a+', '+b+' and '+c+'. A proportional sample of '+n+
        ' is taken. If the '+nb+' people allocated to Group B are selected systematically from its '+
        b+' listed members, find the sampling interval within Group B.',
      values:[d],steps:['Population total = '+(a+b+c)+' and sample size = '+n+'.',
        'B allocation = '+n+' × '+b+'/'+(a+b+c)+' = '+nb+'.',
        'Interval within B = '+b+' ÷ '+nb+' = '+d+'.'],
      hint:'First find the proportional allocation for Group B, then divide its size by that allocation.',
      mistake:'Use Group B’s size and sample allocation for the interval, not the entire population.',marks:5});
  }
};
const QUADRATICS={
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
      prompt:'Solve '+poly(a,b,c)+' = 0 by factorising.',
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
};
const FAMILIES={sampling:SAMPLING,quadratics:QUADRATICS};
export function fluencyFamilyIds(topicId,levelId,pageId){
  const section=FLUENCY_CHAPTERS[topicId]?.find(s=>s.id===levelId);
  return section?.pages.find(p=>p.id===pageId)?.families||[];
}
export function rngFromSeed(seed){
  if(!Number.isSafeInteger(seed)||seed<1||seed>999999999)throw Error('Seed must be an integer between 1 and 999999999');
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6D2B79F5)>>>0;
    let v=state;
    v=Math.imul(v^(v>>>15),v|1);
    v^=v+Math.imul(v^(v>>>7),v|61);
    return ((v^(v>>>14))>>>0)/4294967296;
  };
}
function shuffle(rng,input){
  const a=[...input];
  for(let i=a.length-1;i>0;i--){const j=int(rng,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function makeFluencyQuestion(topicId,familyId,rng){
  const make=FAMILIES[topicId]?.[familyId];
  if(!make)throw Error('Unknown Fluency question family');
  const q=make(rng);
  const error=validateFluencyQuestion(q);
  if(error)throw Error('Invalid generated Fluency question: '+error);
  return q;
}
export function buildFluencySet({topicId,levelId,pageId,seed,count=6}){
  const families=fluencyFamilyIds(topicId,levelId,pageId);
  if(!families.length)throw Error('Unknown Fluency page');
  if(!PRACTICE_LENGTHS.includes(count))throw Error('Choose 6 or 10 questions');
  const rng=rngFromSeed(seed),order=shuffle(rng,families),seen=new Set(),questions=[];
  for(let attempt=0;attempt<count*100&&questions.length<count;attempt++){
    const family=order[attempt%order.length],q=makeFluencyQuestion(topicId,family,rng);
    if(seen.has(q.signature))continue;
    seen.add(q.signature);
    questions.push({...q,id:'q'+(questions.length+1)});
  }
  if(questions.length!==count)throw Error('Not enough distinct questions for this practice set.');
  return {topicId,levelId,pageId,seed,count,questions};
}
function parseNumber(raw){
  const token=String(raw??'').trim().replace(/[−–—]/g,'-').replace(/^\+/, '');
  if(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)){
    const n=Number(token);return Number.isFinite(n)?n:null;
  }
  const match=token.match(/^(-?\d+)\/([1-9]\d*)$/);
  if(match){const n=Number(match[1])/Number(match[2]);return Number.isFinite(n)?n:null;}
  return null;
}
function parseValues(raw,answer){
  const trimmed=String(raw??'').trim();
  if(!trimmed||trimmed.length>200)return null;
  const {kind,unit}=answer;
  if(kind==='number'){
    const cleaned=trimmed.replace(/[−–—]/g,'-').replace(unit==='%'?/\s*%\s*$/:/\u0000/, '');
    const value=parseNumber(cleaned);return value===null?null:[value];
  }
  let text=trimmed.replace(/[−–—]/g,'-').trim();
  text=text.replace(/^\(\s*([^()]*)\s*\)$/,'$1');
  const tokens=text.split(/\s*(?:,|;|\bor\b|\band\b)\s*/i);
  if(tokens.length!==answer.values.length)return null;
  const values=tokens.map(part=>parseNumber(part.replace(/^(?:x|[abc]|group\s*[abc])\s*=\s*/i,'')));
  return values.some(v=>v===null)?null:values;
}
export function answerText(answer){
  const display=x=>answer.precision?Number(x).toFixed(2):fmt(x);
  if(answer.kind==='number')return display(answer.values[0])+(answer.unit||'');
  return answer.values.map(display).join(', ');
}
export function checkFluencyAnswer(raw,q){
  const values=parseValues(raw,q.answer),expected=q.answer.values;
  if(!values)return {correct:false,kind:'format',message:'Use the requested numerical answer format. '+q.answer.label};
  const tolerance=q.answer.precision||1e-9;
  const a=q.answer.kind==='unordered'?[...values].sort((x,y)=>x-y):values;
  const b=q.answer.kind==='unordered'?[...expected].sort((x,y)=>x-y):expected;
  const correct=a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<=tolerance);
  return {correct,kind:correct?'correct':'value',
    message:correct?'Correct — your answer matches the generated solution.':
      'Not quite. '+q.mistake};
}
export function validateFluencyQuestion(q){
  if(!q||typeof q.prompt!=='string'||!q.prompt||!q.signature||!q.family||!q.hint||!q.mistake)return 'Missing prompt/feedback';
  if(!Number.isInteger(q.marks)||q.marks<1||q.marks>8)return 'Invalid mark total';
  if(!Array.isArray(q.steps)||q.steps.length<2||q.steps.some(s=>typeof s!=='string'||!s.trim()))return 'Incomplete working';
  if(!['number','ordered','unordered'].includes(q.answer?.kind)||
    !Array.isArray(q.answer.values)||!q.answer.values.length||
    q.answer.values.some(x=>!Number.isFinite(x)))return 'Invalid numerical answer';
  return '';
}
export function validateFluencyChapters(chapters=FLUENCY_CHAPTERS){
  const errors=[];
  for(const [topic,sections] of Object.entries(chapters)){
    if(!FAMILIES[topic]||!Array.isArray(sections)||sections.length!==4)
      errors.push(topic+': four Fluency levels required');
    for(const [index,section] of (sections||[]).entries()){
      if(section.id!==FLUENCY_LEVELS[index]?.id||
        section.label!=='Level '+(index+1)+': '+FLUENCY_LEVELS[index]?.name||
        !section.description||
        !Array.isArray(section.pages)||!section.pages.length)errors.push(topic+': invalid Fluency level');
      const pageIds=new Set();
      for(const page of section.pages||[]){
        if(pageIds.has(page.id)||page.type!=='fluency'||!page.focus||!page.families?.length||
          page.families.some(f=>!FAMILIES[topic]?.[f]))errors.push(topic+': invalid Fluency practice page');
        pageIds.add(page.id);
      }
    }
  }
  return errors;
}
export function fluencySkillIds(topicId){
  return [...new Set((FLUENCY_CHAPTERS[topicId]||[]).flatMap(s=>s.pages.flatMap(p=>p.families)))];
}
