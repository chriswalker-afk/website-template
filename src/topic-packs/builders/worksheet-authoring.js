// Shared printable LaTeX authoring helpers. Topic families are authored in the packs.
const latexChars={
  '\\':'\\textbackslash{}','{':'\\{','}':'\\}','$':'\\$','#':'\\#',
  '%':'\\%','&':'\\&','_':'\\_','^':'\\textasciicircum{}','~':'\\textasciitilde{}'
};
const punctuation={'–':'--','—':'---','“':'"','”':'"','‘':"'",'’':"'",'…':'...',' ':' '};
export function escapeLatexText(value){
  return [...String(value)].map(ch=>{
    if(latexChars[ch])return latexChars[ch];
    if(punctuation[ch])return punctuation[ch];
    return ch.codePointAt(0)<128?ch:'?';
  }).join('');
}
export function makeRng(seed){
  let value=seed>>>0;
  return ()=>{
    value=(value+0x6D2B79F5)>>>0;
    let x=value;
    x=Math.imul(x^(x>>>15),x|1);
    x^=x+Math.imul(x^(x>>>7),x|61);
    return ((x^(x>>>14))>>>0)/4294967296;
  };
}
export function between(rng,min,max){return min+Math.floor(rng()*(max-min+1));}
export function pick(rng,choices){return choices[between(rng,0,choices.length-1)];}
export function shuffle(rng,array){
  const result=[...array];
  for(let i=result.length-1;i>0;i--){const j=between(rng,0,i);[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function math(value){return '\\('+value+'\\)';}
export function binomial(root){return '(x'+(root>0?' - '+root:root<0?' + '+Math.abs(root):'')+')';}
export function polynomial(a,b,c){
  function term(n,power,first){
    if(n===0)return '';
    const v=power?(Math.abs(n)===1?'':Math.abs(n))+power:String(Math.abs(n));
    return (first?(n<0?'-':''):(n<0?' - ':' + '))+v;
  }
  return term(a,'x^{2}',true)+term(b,'x',false)+term(c,'',false);
}
export function squareForm(a,h,k){
  const core=h===0?'x^{2}':'(x'+(h>0?' - '+h:' + '+Math.abs(h))+')^{2}';
  return (a===1?'':a===-1?'-':a)+core+(k===0?'':(k<0?' - ':' + ')+Math.abs(k));
}
