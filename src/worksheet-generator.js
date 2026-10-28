// Pass 1A worksheet prototype: original, deterministic question families.
// This module has no DOM, network, AI or LaTeX compiler dependencies.
import {TOPICS} from './topics.js';

export const WORKSHEET_VERSION = 1;
const SKILLS = Object.freeze({
  sampling: [
    {id:'terms',label:'Terminology'},
    {id:'methods',label:'Identify methods'},
    {id:'allocation',label:'Stratified calculations'},
    {id:'evaluation',label:'Evaluate sampling'}
  ],
  quadratics: [
    {id:'vertex',label:'Turning points'},
    {id:'roots',label:'Factorised equations'},
    {id:'expanded',label:'Expanded equations'},
    {id:'discriminant',label:'Discriminant'}
  ]
});
export function worksheetSkills(topicId){return SKILLS[topicId]||[];}
export function supportsWorksheets(topicId){return worksheetSkills(topicId).length>0;}

const latexChars={
  '\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','#':'\\#',
  '%':'\\%','&':'\\&','_':'\\_','^':'\\textasciicircum{}','~':'\\textasciitilde{}'
};
const punctuation={'–':'--','—':'---','“':'"','”':'"','‘':"'",'’':"'",'…':'...',' ':' '};
export function escapeLatexText(value){
  return [...String(value)].map(ch=>{
    if(latexChars[ch])return latexChars[ch];
    if(punctuation[ch])return punctuation[ch];
    return ch.codePointAt(0)<128?ch:'?';
  }).join('');
}
export function makeRng(seed){
  let value=seed>>>0;
  return ()=>{
    value=(value+0x6D2B79F5)>>>0;
    let x=value;
    x=Math.imul(x^(x>>>15),x|1);
    x^=x+Math.imul(x^(x>>>7),x|61);
    return ((x^(x>>>14))>>>0)/4294967296;
  };
}
function between(rng,min,max){return min+Math.floor(rng()*(max-min+1));}
function pick(rng,choices){return choices[between(rng,0,choices.length-1)];}
function shuffle(rng,array){
  const result=[...array];
  for(let i=result.length-1;i>0;i--){const j=between(rng,0,i);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
function math(value){return '\\('+value+'\\)';}
function binomial(root){return '(x'+(root>0?' - '+root:root<0?' + '+Math.abs(root):'')+')';}
function polynomial(a,b,c){
  function term(n,power,first){
    if(n===0)return '';
    const v=power?(Math.abs(n)===1?'':Math.abs(n))+power:String(Math.abs(n));
    return (first?(n<0?'-':''):(n<0?' - ':' + '))+v;
  }
  return term(a,'x^{2}',true)+term(b,'x',false)+term(c,'',false);
}
function squareForm(a,h,k){
  const core=h===0?'x^{2}':'(x'+(h>0?' - '+h:' + '+Math.abs(h))+')^{2}';
  return (a===1?'':a===-1?'-':a)+core+(k===0?'':(k<0?' - ':' + ')+Math.abs(k));
}
const SCENARIOS=[
  rng=>{
    const step=pick(rng,[4,5,6,8,10]),start=between(rng,1,step),total=step*12;
    return {
      key:'systematic-'+step+'-'+start,answer:'Systematic sampling',
      question:'A researcher randomly chooses position '+start+' from the first '+step+
        ' names in a list of '+total+' people, then selects every '+step+'th name. Name the method.',
      reason:'This is systematic sampling: a random starting position is followed by a fixed interval.',
      hint:'Look for the fixed interval.'
    };
  },
  rng=>{
    const n=pick(rng,[6,8,10,12,15]),N=n*10;
    return {
      key:'simple-random-'+n,answer:'Simple random sampling',
      question:'From '+N+' numbered students, '+n+
        ' distinct numbers are chosen at random so that every possible group of '+n+
        ' students is equally likely. Name the method.',
      reason:'This is simple random sampling: every possible set of the specified size is equally likely.',
      hint:'Consider the chance for every possible group.'
    };
  },
  rng=>{
    const percent=pick(rng,[10,20,25]),group=pick(rng,[2,3,4]);
    return {
      key:'stratified-'+percent+'-'+group,answer:'Stratified sampling',
      question:'A college divides students into '+group+' year groups and randomly selects '+percent+
        '% of each year group. Name the sampling method.',
      reason:'This is stratified sampling: the population is divided into strata and a proportional random sample is taken from each.',
      hint:'The same proportion is taken from each group.'
    };
  },
  rng=>{
    const place=pick(rng,['library','canteen','sports hall','school gate']);
    return {
      key:'opportunity-'+place,answer:'Opportunity sampling',
      question:'A researcher surveys the first 20 available students near the '+place+
        '. Name the sampling method.',
      reason:'This is opportunity sampling: available members are chosen for convenience instead of a random selection from the full population.',
      hint:'The researcher chooses whoever is convenient.'
    };
  }
];
const BIASES=[
  {key:'library',question:'A survey of school meal preferences is conducted only among students in the library at lunchtime. Give one possible source of bias.',
    answer:'Students who do not use the library at lunchtime are excluded, so the sample may not represent the school.'},
  {key:'sports',question:'A survey of exercise habits is conducted only among members of a sports club. Give one possible source of bias.',
    answer:'Sports club members may exercise more than other students, so the sample may overestimate activity levels.'},
  {key:'online',question:'A survey about internet access is completed only by people who see an online advertisement. Explain one limitation.',
    answer:'People without regular internet access are less likely to respond, so the survey may underrepresent them.'},
  {key:'first',question:'To estimate how long students take to travel to school, a researcher interviews the first 20 students to arrive. Give one source of bias.',
    answer:'Early arrivals may have different journey times from students who arrive later, making the sample unrepresentative.'}
];
const SAMPLING_FAMILIES=[
  {id:'sampling-definition',skill:'terms',create(rng){
    const card=pick(rng,TOPICS.sampling.cards);
    const term=escapeLatexText(card.term),definition=escapeLatexText(card.definition);
    return {signature:'term:'+card.id,marks:2,spaceMm:19,
      prompt:'Define "'+card.term+'".',
      questionTex:'State what is meant by \\emph{'+term+'}.',
      answerTex:definition,solutionTex:definition,
      hintTex:'Explain the term using the population or selection process as appropriate.'};
  }},
  {id:'sampling-identify',skill:'methods',create(rng){
    const scenario=pick(rng,SCENARIOS)(rng);
    return {signature:'method:'+scenario.key,marks:2,spaceMm:21,
      prompt:scenario.question,
      questionTex:escapeLatexText(scenario.question),
      answerTex:escapeLatexText(scenario.answer),
      solutionTex:escapeLatexText(scenario.reason),
      hintTex:escapeLatexText(scenario.hint)};
  }},
  {id:'sampling-allocation',skill:'allocation',create(rng){
    const a=between(rng,5,15)*10,b=between(rng,6,17)*10,c=between(rng,7,18)*10;
    const divisor=pick(rng,[5,10]);
    const N=a+b+c,n=N/divisor, na=a/divisor,nb=b/divisor,nc=c/divisor;
    const formula='n_i=n\\times\\frac{N_i}{N}';
    const working='\\begin{align*}n_A &= '+n+'\\times\\frac{'+a+'}{'+N+'}='+na+
      '\\\\ n_B &= '+n+'\\times\\frac{'+b+'}{'+N+'}='+nb+
      '\\\\ n_C &= '+n+'\\times\\frac{'+c+'}{'+N+'}='+nc+'\\end{align*}';
    return {signature:'alloc:'+a+':'+b+':'+c+':'+divisor,marks:4,spaceMm:33,
      prompt:'Groups A, B and C contain '+a+', '+b+' and '+c+' people respectively. '+
        'A proportional stratified sample of '+n+' people is needed. How many should be selected from each group?',
      questionTex:'Groups A, B and C contain '+a+', '+b+' and '+c+
        ' people, respectively. A proportional stratified sample of '+n+
        ' people is needed. Calculate the number selected from each group.',
      answerTex:'A: '+math(String(na))+', B: '+math(String(nb))+', C: '+math(String(nc))+'.',
      solutionTex:'The population total is '+math(String(N))+'. Use proportional allocation, '+math(formula)+'.\\par '+working+
        '\\par Check: '+math(na+'+'+nb+'+'+nc+'='+n)+'.',
      hintTex:'Use '+math(formula)+' and calculate the total population first.'};
  }},
  {id:'sampling-evaluate',skill:'evaluation',create(rng){
    const scenario=pick(rng,BIASES);
    const answer=escapeLatexText(scenario.answer);
    return {signature:'bias:'+scenario.key,marks:2,spaceMm:24,
      prompt:scenario.question,questionTex:escapeLatexText(scenario.question),
      answerTex:answer,solutionTex:answer,
      hintTex:'Who is included, and who has been left out?'};
  }}
];
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
const FAMILIES={sampling:SAMPLING_FAMILIES,quadratics:QUADRATIC_FAMILIES};
function settings(options){
  const topicId=options.topicId;
  if(!supportsWorksheets(topicId))throw Error('No worksheet question families exist for this topic.');
  const seed=Number(options.seed),count=Number(options.count);
  if(!Number.isSafeInteger(seed)||seed<1||seed>999999999)throw Error('The seed must be a whole number between 1 and 999999999.');
  if(!Number.isSafeInteger(count)||count<4||count>16)throw Error('Choose between 4 and 16 questions.');
  const style=options.style||'independent';
  if(!['independent','scaffolded','mixed'].includes(style))throw Error('Select a supported worksheet style.');
  const difficulty=options.difficulty||'secure';
  if(!['developing','secure','stretch'].includes(difficulty))throw Error('Select a supported difficulty.');
  const solutions=options.solutions||'worked';
  if(!['worked','answers'].includes(solutions))throw Error('Select a supported solution format.');
  const allowed=worksheetSkills(topicId).map(x=>x.id);
  const skills=options.skills===undefined?[...allowed]:options.skills;
  if(!Array.isArray(skills)||!skills.length||skills.some(x=>!allowed.includes(x)))throw Error('Select at least one available skill.');
  const title=String(options.title||TOPICS[topicId].title+' Worksheet').trim();
  if(!title||title.length>80)throw Error('Enter a worksheet title of 1–80 characters.');
  return {topicId,seed,count,style,difficulty,solutions,skills:[...new Set(skills)],title};
}
function renderDocument(topic,opts,questions,answers){
  const student=!answers;
  const title=escapeLatexText(opts.title)+(student?'':opts.solutions==='worked'?' - Worked Solutions':' - Answers');
  const lines=[
    '% Maths Notebook worksheet generator, version '+WORKSHEET_VERSION,
    '% Topic: '+topic.id+' | Seed: '+opts.seed+' | Style: '+opts.style,
    '\\documentclass[11pt,a4paper]{article}',
    '\\usepackage[T1]{fontenc}',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[a4paper,margin=20mm]{geometry}',
    '\\usepackage{amsmath,amssymb,enumitem}',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\parskip}{4pt}',
    '\\begin{document}',
    '\\begin{center}',
    '{\\Large\\bfseries '+title+'}',
    '\\end{center}'
  ];
  if(student){
    lines.push('\\noindent Name: \\rule{67mm}{0.4pt}\\hfill Date: \\rule{32mm}{0.4pt}',
      '\\par\\medskip',
      opts.style==='scaffolded'?'Use the model and early hints, then complete the remaining questions.':
      'Show your working where appropriate.');
  }else{
    lines.push('\\noindent Seed: '+opts.seed+'\\hfill '+questions.length+' questions.');
  }
  lines.push('\\begin{enumerate}[label=\\textbf{\\arabic*.},leftmargin=*,itemsep=1.5em]');
  for(let i=0;i<questions.length;i++){
    const q=questions[i];
    lines.push('% Question '+(i+1)+' | '+q.familyId+' | '+q.signature);
    if(student){
      lines.push('\\item \\begin{minipage}[t]{0.79\\linewidth}'+q.questionTex+'\\end{minipage}'+
        '\\hfill\\begin{minipage}[t]{0.19\\linewidth}\\raggedleft\\textit{['+q.marks+' marks]}\\end{minipage}');
      if(opts.style==='scaffolded'&&i===0){
        lines.push('\\par\\smallskip\\textit{Worked model:}\\par '+q.solutionTex+'\\par\\vspace{5mm}');
      }else{
        if(opts.style==='scaffolded'&&i<Math.min(3,questions.length)){
          lines.push('\\par\\textit{Hint:} '+q.hintTex);
        }
        lines.push('\\par\\vspace{'+q.spaceMm+'mm}');
      }
    }else{
      lines.push('\\item '+(opts.solutions==='worked'?q.solutionTex:'\\textbf{Answer:} '+q.answerTex));
    }
  }
  lines.push('\\end{enumerate}','\\end{document}','');
  return lines.join('\n');
}
export function generateWorksheet(options){
  const opts=settings(options);
  const families=FAMILIES[opts.topicId].filter(f=>opts.skills.includes(f.skill));
  if(!families.length)throw Error('No printable questions match those skills.');
  const topic=TOPICS[opts.topicId],rng=makeRng(opts.seed);
  const order=shuffle(rng,families);
  const seen=new Set(),questions=[];
  for(let attempt=0;attempt<opts.count*150&&questions.length<opts.count;attempt++){
    const family=order[attempt%order.length],q=family.create(rng,opts.difficulty);
    const signature=family.id+':'+q.signature;
    if(seen.has(signature))continue;
    seen.add(signature);
    questions.push({...q,familyId:family.id,skill:family.skill,key:signature});
  }
  if(questions.length<opts.count){
    throw Error('Only '+questions.length+' distinct questions were available. Choose fewer questions or more skills.');
  }
  if(opts.style==='mixed'){
    const mixed=shuffle(rng,questions);
    questions.splice(0,questions.length,...mixed);
  }
  const studentTex=renderDocument(topic,opts,questions,false);
  const solutionsTex=renderDocument(topic,opts,questions,true);
  return {options:opts,questions,studentTex,solutionsTex,
    solutionsFilename:opts.solutions==='worked'?'worked-solutions.tex':'answers.tex'};
}
