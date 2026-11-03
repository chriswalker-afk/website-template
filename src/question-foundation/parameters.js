// Deterministic, side-effect-free building blocks for topic-owned generators.
// Always pass a seeded RNG; never use Math.random() in question families.
export function integer(rng,min,max){
  if(typeof rng!=='function'||!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min>max)
    throw new TypeError('Expected a seeded RNG and an ascending integer range');
  const value=rng();
  if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('RNG must return [0, 1)');
  return min+Math.floor(value*(max-min+1));
}
export function choice(rng,items){
  if(!Array.isArray(items)||items.length===0)throw new TypeError('Choose from a nonempty array');
  return items[integer(rng,0,items.length-1)];
}
export function nonZeroInteger(rng,min,max){
  if(min>0||max<0)return integer(rng,min,max);
  if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min>max||(min===0&&max===0))
    throw new RangeError('Range must contain a non-zero integer');
  const negatives=Math.max(0,-min),positives=Math.max(0,max);
  const index=integer(rng,0,negatives+positives-1);
  return index<negatives?min+index:index-negatives+1;
}
export function gcd(a,b){
  if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b))throw new TypeError('Integer arguments required');
  a=Math.abs(a);b=Math.abs(b);
  while(b!==0){const r=a%b;a=b;b=r;}
  return a;
}
export function rational(numerator,denominator=1){
  if(!Number.isSafeInteger(numerator)||!Number.isSafeInteger(denominator)||denominator===0)
    throw new TypeError('Expected an integer numerator and nonzero integer denominator');
  const sign=denominator<0?-1:1, divisor=gcd(numerator,denominator);
  return Object.freeze({numerator:sign*numerator/divisor,denominator:Math.abs(denominator)/divisor});
}
export function rationalChoice(rng,numerators,denominators){
  return rational(choice(rng,numerators),choice(rng,denominators));
}
export function shuffled(rng,items){
  if(!Array.isArray(items))throw new TypeError('Expected an array');
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=integer(rng,0,i);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function distinct(rng,items,count){
  if(!Number.isSafeInteger(count)||count<0||count>items.length||new Set(items).size!==items.length)
    throw new RangeError('Distinct choices require unique input and feasible count');
  return shuffled(rng,items).slice(0,count);
}
