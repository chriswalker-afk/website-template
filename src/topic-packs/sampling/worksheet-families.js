// Reviewed sampling worksheet-only question families.
import {escapeLatexText,between,pick,math} from '../builders/worksheet-authoring.js';
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
  {id:'sampling-definition',skill:'terms',create(rng,difficulty,topic){
    const card=pick(rng,topic.cards);
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
export const worksheetFamilies=Object.freeze(SAMPLING_FAMILIES);
