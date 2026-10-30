// Shared, deterministic mathematical authoring helpers. No topic names or UI dependencies.
export const int=(rng,min,max)=>min+Math.floor(rng()*(max-min+1));
export const pick=(rng,items)=>items[int(rng,0,items.length-1)];
export const fmt=n=>Object.is(n,-0)?'0':String(n);
export const signs=(n,first=false)=>first?(n<0?'−':''):(n<0?' − ':' + ');
export function poly(a,b,c){
  return [[a,'x²'],[b,'x'],[c,'']].filter(([n])=>n!==0)
    .map(([n,unit],i)=>signs(n,i===0)+(unit&&Math.abs(n)===1?'':Math.abs(n))+unit)
    .join('')||'0';
}
export const bracket=r=>'('+(r===0?'x':'x '+(r>0?'− '+r:'+ '+Math.abs(r)))+')';
export const factored=(a,r,s)=>(a===1?'':a===-1?'−':fmt(a))+bracket(r)+bracket(s);
export function vertexForm(a,h,k){
  const core=h===0?'x²':bracket(h)+'²';
  return (a===1?'':a===-1?'−':fmt(a))+core+
    (k===0?'':(k<0?' − ':' + ')+Math.abs(k));
}
export const rnd2=n=>Math.round((n+Number.EPSILON)*100)/100;
export function question({family,signature,prompt,values,kind='number',steps,hint,marks=2,skill,
  mistake='',precision=0,unit='',answerLabel}){
  return {family,signature:family+':'+signature,prompt,answer:{
    kind,values:[...values],precision,unit,
    label:answerLabel||(
      kind==='number'?'Enter one number'+(unit?' ('+unit+')':'')+'.':
      kind==='unordered'?'Enter both roots separated by a comma (either order).':
      kind==='ordered'?'Enter the values in order, separated by commas.':'Enter the values separated by commas.')
  },steps,hint,marks,skill,mistake};
}
