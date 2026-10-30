// Reviewed quadratics worksheet-only question families.
import {between,pick,math,binomial,polynomial,squareForm} from '../builders/worksheet-authoring.js';
const QUADRATIC_FAMILIES=[
  {id:'quadratic-vertex',skill:'vertex',create(rng,level){
    const a=pick(rng,level==='developing'?[1,2,3]:[-3,-2,-1,1,2,3]);
    const h=between(rng,-4,4),k=between(rng,-6,6);
    const type=a>0?'minimum':'maximum',form=squareForm(a,h,k);
    return {signature:'vertex:'+a+':'+h+':'+k,marks:3,spaceMm:22,
      prompt:'For y = '+form.replaceAll('^{2}','²')+', state the turning point and whether it is a maximum or minimum.',
      questionTex:'For '+math('y='+form)+', state the turning point and whether it is a maximum or a minimum.',
      answerTex:'Turning point '+math('('+h+','+k+')')+'; '+type+'.',
      solutionTex:'This is completed-square form '+math('y=a(x-h)^2+k')+
        ', so the turning point is '+math('('+h+','+k+')')+'. Since '+math('a='+a)+
        (a>0?', the parabola opens upwards and the point is a minimum.':
             ', the parabola opens downwards and the point is a maximum.'),
      hintTex:'In '+math('y=a(x-h)^2+k')+', the turning point is '+math('(h,k)')+'.'};
  }},
  {id:'quadratic-factorised',skill:'roots',create(rng,level){
    let r1=between(rng,level==='developing'?-4:-6,level==='developing'?4:6),
        r2=between(rng,level==='developing'?-4:-6,level==='developing'?4:6);
    if(r1===r2)r2=r1===6?-5:r1+1;
    const roots=[r1,r2].sort((x,y)=>x-y);
    const factor=binomial(roots[0])+binomial(roots[1]);
    return {signature:'roots:'+roots.join(':'),marks:3,spaceMm:26,
      prompt:'Solve '+factor.replaceAll(' - ',' − ')+' = 0.',
      questionTex:'Solve '+math(factor+'=0')+'.',
      answerTex:math('x='+roots[0])+' or '+math('x='+roots[1])+'.',
      solutionTex:'Using the zero-product rule, '+math(factor+'=0')+
        ' means '+math(binomial(roots[0])+'=0')+' or '+math(binomial(roots[1])+'=0')+
        '. Hence '+math('x='+roots[0])+' or '+math('x='+roots[1])+'.',
      hintTex:'Set each factor equal to zero.'};
  }},
  {id:'quadratic-expanded',skill:'expanded',create(rng,level){
    let p=between(rng,level==='developing'?-4:-6,level==='developing'?4:6),
        q=between(rng,level==='developing'?-4:-6,level==='developing'?4:6);
    if(p===q)q=p===6?-5:p+1;
    const roots=[p,q].sort((x,y)=>x-y),b=-(p+q),c=p*q;
    const expanded=polynomial(1,b,c),factors=binomial(roots[0])+binomial(roots[1]);
    return {signature:'expanded:'+roots.join(':'),marks:4,spaceMm:32,
      prompt:'Solve '+expanded.replaceAll('^{2}','²')+' = 0 by factorising.',
      questionTex:'Solve '+math(expanded+'=0')+' by factorising.',
      answerTex:math('x='+roots[0])+' or '+math('x='+roots[1])+'.',
      solutionTex:'Find two numbers with sum '+math(String(b))+' and product '+
        math(String(c))+'. Then \\['+expanded+'='+factors+'=0.\\]'+
        'By the zero-product rule, '+math('x='+roots[0])+' or '+math('x='+roots[1])+'.',
      hintTex:'Find two integers whose sum is '+math(String(b))+' and product is '+math(String(c))+'.'};
  }},
  {id:'quadratic-discriminant',skill:'discriminant',create(rng){
    const a=pick(rng,[-2,-1,1,2]),b=between(rng,-7,7),c=between(rng,-6,6);
    const D=b*b-4*a*c,number=D>0?2:D===0?1:0;
    const classification=number===2?'two distinct real roots':number===1?'one repeated real root':'no real roots';
    const pol=polynomial(a,b,c);
    return {signature:'disc:'+a+':'+b+':'+c,marks:4,spaceMm:32,
      prompt:'For '+pol.replaceAll('^{2}','²')+' = 0, calculate the discriminant and state how many distinct real roots exist.',
      questionTex:'For '+math(pol+'=0')+', calculate the discriminant and state how many distinct real roots exist.',
      answerTex:math('\\Delta='+D)+'; '+number+' distinct real '+(number===1?'root':'roots')+'.',
      solutionTex:'Here '+math('a='+a)+', '+math('b='+b)+', '+math('c='+c)+'. Hence '+
        '\\[\\Delta=b^2-4ac=('+b+')^2-4('+a+')('+c+')='+D+'.\\]'+
        'Since '+math('\\Delta')+(D>0?' is positive, there are '+classification+'.':
          D===0?' is zero, there is '+classification+'.':' is negative, there are '+classification+'.'),
      hintTex:'Calculate '+math('\\Delta=b^2-4ac')+' before deciding the number of distinct real roots.'};
  }}
];
// Share generated Fluency practice and the LaTeX Worksheet Generator.
export const worksheetFamilies=Object.freeze(QUADRATIC_FAMILIES);
