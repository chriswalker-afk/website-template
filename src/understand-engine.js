// Small deterministic mathematical engines behind Understand visualisations.
// No network, no user data, no dependence on the DOM or web framework.
export const POPULATION_SIZE=40;
export const SAMPLE_SIZE=10;
export const STRATUM_A=16;
export const STRATUM_B=POPULATION_SIZE-STRATUM_A;
export const SAMPLING_METHODS={
  census:{label:'Census',description:'Every person is included; this is not a sample.'},
  random:{label:'Simple random',description:'Every possible group of ten has the same chance of selection.'},
  systematic:{label:'Systematic',description:'Choose a random start from the first four positions, then take every fourth person.'},
  stratified:{label:'Stratified',description:'Randomly select four from Group A and six from Group B, preserving the population proportions.'},
  convenience:{label:'Convenience',description:'Take the first ten names from this group-ordered list. Group B is excluded.'}
};
export function seededRandom(seed){
  let value=(Number(seed)||1)>>>0;
  return ()=>{
    value=(value+0x6D2B79F5)>>>0;
    let x=value;
    x=Math.imul(x^(x>>>15),x|1);
    x^=x+Math.imul(x^(x>>>7),x|61);
    return ((x^(x>>>14))>>>0)/4294967296;
  };
}
function shuffled(length,offset,rng){
  const list=Array.from({length},(_,i)=>i+offset);
  for(let i=list.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [list[i],list[j]]=[list[j],list[i]];
  }
  return list;
}
export function samplingExperiment(method,seed=1){
  if(!Object.prototype.hasOwnProperty.call(SAMPLING_METHODS,method))
    throw new Error('Unknown sampling method');
  const rng=seededRandom(seed);
  let indices;
  let randomStart=null;
  if(method==='census')indices=Array.from({length:POPULATION_SIZE},(_,i)=>i);
  else if(method==='random')indices=shuffled(POPULATION_SIZE,0,rng).slice(0,SAMPLE_SIZE);
  else if(method==='stratified')indices=[
    ...shuffled(STRATUM_A,0,rng).slice(0,4),
    ...shuffled(STRATUM_B,STRATUM_A,rng).slice(0,6)
  ];
  else if(method==='systematic'){
    randomStart=1+Math.floor(rng()*4);
    indices=Array.from({length:SAMPLE_SIZE},(_,i)=>randomStart-1+i*4);
  }else indices=Array.from({length:SAMPLE_SIZE},(_,i)=>i);
  const selected=[...indices].sort((a,b)=>a-b);
  const groupA=selected.filter(i=>i<STRATUM_A).length;
  const groupB=selected.length-groupA;
  return {
    method,seed,selected,groupA,groupB,randomStart,
    size:selected.length,
    proportionA:100*groupA/selected.length,
    proportionB:100*groupB/selected.length
  };
}
export const GRAPH_DEFAULTS={
  shape:{magnitude:1,h:0,k:0,sign:1},
  position:{magnitude:1,h:0,k:-2,sign:1}
};
export function quadraticProperties({magnitude,h,k,sign}){
  if(!Number.isFinite(magnitude)||magnitude<=0||![1,-1].includes(sign)||
     !Number.isFinite(h)||!Number.isFinite(k))throw new Error('Invalid quadratic parameters');
  const a=magnitude*sign;
  return {
    a,h,k,vertex:[h,k],axis:h,
    turningType:a>0?'minimum':'maximum',
    opening:a>0?'upwards':'downwards',
    steepness:magnitude===1?'the same steepness as y = x²':
      magnitude>1?'narrower than y = x²':'wider than y = x²'
  };
}
export function quadraticValue(x,model){
  const {a,h,k}=quadraticProperties(model);
  return a*(x-h)*(x-h)+k;
}
export function quadraticEquation(model){
  const {a,h,k}=quadraticProperties(model);
  const square=h===0?'x²':'(x '+(h>0?'− '+h:'+ '+Math.abs(h))+')²';
  return 'y = '+(a===1?'':a===-1?'−':a<0?'−'+Math.abs(a):String(a))+square+
    (k===0?'':(k>0?' + ':' − ')+Math.abs(k));
}
export function validateUnderstandContent(sections){
  const problems=[];
  const ids=['big-idea','how-it-works','visual-explanations','worked-examples'];
  if(!Array.isArray(sections)||sections.map(s=>s.id).join()!==ids.join())
    problems.push('Understand needs its four ordered subsections');
  for(const section of sections||[]){
    if(!Array.isArray(section.pages)||!section.pages.length)continue;
    for(const page of section.pages){
      if(!['lesson','graph','sampling-lab','workshop'].includes(page.type))
        problems.push('Unsupported Understand page type: '+page.type);
      if(page.type==='graph'&&!['shape','position'].includes(page.id))problems.push('Unknown graph experiment');
      if(page.type==='sampling-lab'){
        if(!Array.isArray(page.methods)||page.methods.length<2||page.methods.some(m=>!SAMPLING_METHODS[m]))
          problems.push('Sampling experiment requires supported methods');
      }
      if(page.type==='workshop'){
        if(!page.model?.prompt||!page.model?.steps?.length||
          !page.guided?.prompt||!page.guided?.choices?.length||
          !page.independent?.prompt||!page.independent?.steps?.length)
          problems.push('Incomplete worked example '+page.id);
        const answers=page.guided?.choices?.filter(c=>c[3])||[];
        if(answers.length!==1)problems.push('Guided question requires one correct answer '+page.id);
        if(new Set((page.guided?.choices||[]).map(c=>c[0])).size!==page.guided?.choices?.length)
          problems.push('Duplicate guided options '+page.id);
      }
      if(page.type==='lesson'){
        for(const block of page.blocks||[]){
          if(!['text','note','comparison','diagram','concept-check','stepper'].includes(block.kind))
            problems.push('Unsupported concept block '+block.kind);
          if(block.kind==='concept-check'){
            if(!block.id||!block.prompt||block.choices?.filter(c=>c.correct).length!==1)
              problems.push('Incomplete concept check '+block.id);
            if(new Set((block.choices||[]).map(c=>c.id)).size!==block.choices?.length)
              problems.push('Duplicate concept-check option '+block.id);
          }
          if(block.kind==='stepper'&&(!block.id||!block.prompt||!block.steps?.length))
            problems.push('Incomplete method steps');
        }
      }
    }
  }
  return problems;
}
