// Safe, reusable mathematical models; never evaluate student-authored expressions.
const finite=Number.isFinite;
export function quadraticProperties({magnitude,h,k,sign}){
  if(!finite(magnitude)||magnitude<=0||![1,-1].includes(sign)||!finite(h)||!finite(k))
    throw new Error('Invalid quadratic parameters');
  const a=magnitude*sign;
  return {
    a,h,k,vertex:[h,k],axis:h,turningType:a>0?'minimum':'maximum',
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
export function linearProperties({m,b}){
  if(!finite(m)||!finite(b))throw new Error('Invalid linear parameters');
  return {m,b,gradient:m,intercept:[0,b]};
}
export function linearValue(x,model){
  const {m,b}=linearProperties(model);
  return m*x+b;
}
export function linearEquation(model){
  const {m,b}=linearProperties(model);
  const gradient=m===0?'':m===1?'x':m===-1?'−x':m<0?'−'+Math.abs(m)+'x':m+'x';
  const offset=b===0?'':gradient?(b>0?' + ':' − ')+Math.abs(b):String(b);
  return 'y = '+(gradient+offset||'0');
}
export function isMathematicalModel(model){
  if(!model||typeof model!=='object'||Array.isArray(model))return false;
  try{
    if(model.kind==='quadratic'){quadraticProperties(model);return true;}
    if(model.kind==='linear'){linearProperties(model);return true;}
  }catch{return false;}
  return false;
}
export function valueAt(x,model){
  if(model?.kind==='quadratic')return quadraticValue(x,model);
  if(model?.kind==='linear')return linearValue(x,model);
  throw Error('Unsupported graph model');
}
export function equationFor(model){
  if(model?.kind==='quadratic')return quadraticEquation(model);
  if(model?.kind==='linear')return linearEquation(model);
  throw Error('Unsupported graph model');
}
export function observationFor(model){
  if(model?.kind==='quadratic'){
    const props=quadraticProperties(model);
    return 'Opens '+props.opening+'; '+props.steepness+
      '. Turning point ('+props.h+', '+props.k+'); symmetry line x = '+props.h+'.';
  }
  const props=linearProperties(model);
  const trend=props.m>0?'increasing':props.m<0?'decreasing':'horizontal';
  return 'Gradient '+props.m+'; y-intercept (0, '+props.b+'); '+trend+' straight line.';
}
