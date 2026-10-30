// Reusable four-level page authoring helper; question generation remains in the shared engine until Pass 2.
export const level=(n,label,description,pages)=>({
  id:'level-'+n,label:'Level '+n+': '+label,description,
  pages:pages.map(([id,focus,families])=>({id,type:'fluency',focus,families}))
});
