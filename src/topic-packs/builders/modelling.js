// Shared four-stage modelling authoring contract.
export const MODELLING_PHASES=Object.freeze([
  ['formulate','Formulate'],['calculate','Calculate'],
  ['interpret','Interpret'],['evaluate','Evaluate']
]);
export const task=(id,scenario,formulate,calculate,interpret,evaluate,checks)=>({
  id,scenario,
  phases:[formulate,calculate,interpret,evaluate].map((a,i)=>({
    id:MODELLING_PHASES[i][0],label:MODELLING_PHASES[i][1],
    prompt:a[0],nudge:a[1],model:a[2]
  })),checks
});
export const page=(id,...cases)=>({id,type:'modelling',tasks:cases});
export const level=(number,name,description,...pages)=>({
  id:'level-'+number,label:'Level '+number+': '+name,description,pages
});
