// Shared lightweight activity subsection helpers.
export const section=(id,label,description,pages)=>({id,label,description,pages});
export const one=(type)=>[{id:'main',type}];
export const game=(id,objective,mechanic)=>[{id:'main',type:'game',gameId:id,objective,mechanic}];
