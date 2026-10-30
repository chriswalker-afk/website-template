// Reusable reasoning authoring helpers.
export const item=(id,prompt,hint,starter,model,criteria,reflection)=>({
  id,prompt,hint,starter,model,criteria:criteria.map(([label,next],index)=>({
    id:'c'+(index+1),label,next
  })),reflection
});
export const section=(id,label,description,...tasks)=>({
  id,label,description,pages:[{id:'main',type:'reasoning',tasks}]
});
