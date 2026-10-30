// Reusable multi-step problem authoring helpers.
export const task=(id,prompt,plan,options,hints,steps,checks,reflection)=>({
  id,prompt,plan,options:options.map(([label,feedback],i)=>({id:'s'+(i+1),label,feedback})),
  hints,steps,checks,reflection
});
export const page=(id,focus,...tasks)=>({id,type:'problem-solving',focus,tasks});
export const level=(n,label,description,pages)=>({
  id:'level-'+n,label:'Level '+n+': '+label,description,pages
});
