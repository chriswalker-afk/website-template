// Per-topic aggregate Fluency progress only; no student notes or typed responses.
export const FLUENCY_PROGRESS_VERSION=1;
const bounded=value=>Number.isSafeInteger(value)&&value>=0&&value<=1000000?value:0;
const basic=()=>({rounds:0,completed:0,firstTry:0,withSupport:0,revealed:0});
export function emptyFluencyProgress(){return {version:FLUENCY_PROGRESS_VERSION,levels:{}};}
export function hydrateFluencyProgress(value){
  let data;
  try{data=typeof value==='string'?JSON.parse(value):value;}catch{return emptyFluencyProgress();}
  if(!data||data.version!==FLUENCY_PROGRESS_VERSION||!data.levels||
     typeof data.levels!=='object'||Array.isArray(data.levels))return emptyFluencyProgress();
  const result=emptyFluencyProgress();
  for(const level of ['level-1','level-2','level-3','level-4']){
    const entry=Object.prototype.hasOwnProperty.call(data.levels,level)?data.levels[level]:null;
    if(!entry||typeof entry!=='object'||Array.isArray(entry))continue;
    const total=bounded(entry.completed),f=bounded(entry.firstTry),w=bounded(entry.withSupport),
      r=bounded(entry.revealed);
    if(f+w+r>total)continue;
    result.levels[level]={
      rounds:bounded(entry.rounds),completed:total,firstTry:f,withSupport:w,revealed:r
    };
  }
  return result;
}
export function saveFluencyRound(progress,level,summary){
  if(!['level-1','level-2','level-3','level-4'].includes(level))throw Error('Invalid Fluency level');
  const n=summary.firstTry+summary.supported+summary.revealed;
  if(!Number.isSafeInteger(n)||n<1||n>10||!['firstTry','supported','revealed'].every(
    key=>Number.isSafeInteger(summary[key])&&summary[key]>=0))throw Error('Invalid Fluency round summary');
  const before=progress.levels[level]||basic();
  const add=(a,b)=>Math.min(1000000,a+b);
  return {version:FLUENCY_PROGRESS_VERSION,levels:{...progress.levels,
    [level]:{
      rounds:add(before.rounds,1),completed:add(before.completed,n),
      firstTry:add(before.firstTry,summary.firstTry),
      withSupport:add(before.withSupport,summary.supported),
      revealed:add(before.revealed,summary.revealed)
    }}};
}
