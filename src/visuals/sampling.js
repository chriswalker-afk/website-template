// Reusable deterministic sampling model. Population sizes and strata belong to each topic.
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
export const SAMPLING_METHOD_IDS=Object.freeze(['census','random','systematic','stratified','convenience']);
export function sampleSelection(config,method,seed=1){
  if(!SAMPLING_METHOD_IDS.includes(method))throw Error('Unknown sampling method');
  const groups=config?.groups||[];
  const population=groups.reduce((sum,g)=>sum+g.size,0);
  const sampleSize=config.sampleSize;
  if(!groups.length||groups.some(g=>!Number.isSafeInteger(g.size)||g.size<1)||
    !Number.isSafeInteger(sampleSize)||sampleSize<1||sampleSize>population)
    throw Error('Invalid sampling population');
  if(method==='systematic'&&population%sampleSize!==0)
    throw Error('Systematic sampling requires an integer interval');
  const rng=seededRandom(seed);
  let indices,randomStart=null,offset=0;
  if(method==='census')indices=Array.from({length:population},(_,i)=>i);
  else if(method==='random')indices=shuffled(population,0,rng).slice(0,sampleSize);
  else if(method==='stratified'){
    const allocations=groups.map((g,i)=>({i,ideal:g.size*sampleSize/population}));
    const selected=allocations.map(g=>Math.floor(g.ideal));
    let left=sampleSize-selected.reduce((a,b)=>a+b,0);
    for(const a of [...allocations].sort((a,b)=>
      (b.ideal-Math.floor(b.ideal))-(a.ideal-Math.floor(a.ideal))||a.i-b.i)){
      if(left--<=0)break;
      selected[a.i]++;
    }
    indices=[];
    groups.forEach((g,i)=>{
      indices.push(...shuffled(g.size,offset,rng).slice(0,selected[i]));
      offset+=g.size;
    });
  }else if(method==='systematic'){
    const interval=population/sampleSize;
    randomStart=1+Math.floor(rng()*interval);
    indices=Array.from({length:sampleSize},(_,i)=>randomStart-1+i*interval);
  }else indices=Array.from({length:sampleSize},(_,i)=>i);
  const chosen=[...indices].sort((a,b)=>a-b);
  const counts=[],details=[];
  offset=0;
  groups.forEach(g=>{
    const n=chosen.filter(i=>i>=offset&&i<offset+g.size).length;
    counts.push(n);
    details.push({...g,selected:n,populationPercent:100*g.size/population,
      selectionPercent:100*n/chosen.length,offset});
    offset+=g.size;
  });
  return {method,seed,selected:chosen,groups:details,counts,randomStart,
    size:chosen.length,population,sampleSize};
}
