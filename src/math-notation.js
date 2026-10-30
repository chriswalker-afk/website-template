// Native MathML typesetting for questions, explanations and worked solutions.
// The existing authored content contains inline Unicode mathematical notation;
// future content may use explicit \(LaTeX\) for unambiguous complex formulas.
// This renderer has no network dependency and never evaluates expressions.
import {escapeHTML as escape} from './logic.js';

export const NOTATION_VERSION=1;
const mathAlphabet=new Set('abcdefghijklnpqrstuvwxyzABCDEFGHJKLNPQRSTUVXYZ');
const stopWords=new Set(['and','or','an','at','as','by','be','in','is','it','if','of',
  'has','had','are','can','was','but','all','get','did','its','yet','set','let',
  'use','due','few','new','try','yes','ask','key','day','tax','cut','run','raw',
  'on','to','we','the','for','was','from','with','than','not','per','max','min']);
const supDigits=Object.freeze({'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4',
  '⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'−','⁺':'+'});
const asText=value=>String(value??'');
const tag=(name,children,attrs='')=>'<'+name+attrs+'>'+children+'</'+name+'>';
const token=(kind,value)=>tag(kind,escape(value));
const op=value=>token('mo',value);
// Fenced parentheses must be a single atom before applying an exponent.
// Otherwise MathML attaches ² to the closing bracket alone, separating it
// visually from its base and leaving awkward space in quadratic expressions.
const fence=value=>tag('mo',escape(value),' fence="true" stretchy="false"');
const mi=value=>token('mi',value);
const mn=value=>token('mn',value);
const MATH_START=/^(?:[A-Za-z]\(|[a-zA-Z]\s*[²³⁴⁵⁶⁷⁸⁹⁰^_=<>≤≥≈]|[a-zA-Z]{1,3}[²³⁴⁵⁶⁷⁸⁹⁰]|[+\-−]?\d+(?:\.\d+)?[a-zA-Z](?:[²³⁴⁵^]|\b)|\d+(?:\.\d+)?\s*(?:[²³⁴⁵⁶⁷⁸⁹⁰]|\/\s*\d|\(|%|[×÷=+−≤≥≈-]\s*[\da-zA-Z])|\(\s*[A-Za-z]\s*,\s*[A-Za-z]\s*\)|\(\s*[A-Za-z0-9][^)]{0,40}\)\s*(?:[²³⁴⁵⁶⁷⁸⁹⁰]|\^\s*(?:\d|\{))|\(\s*[-−]?\d+(?:\.\d+)?\s*,\s*[-−]?\d+(?:\.\d+)?\s*\)|√\s*[\d(]|[a-zA-Z]\s*\/\s*[a-zA-Z\d])/u;
const wordPattern=/^[A-Za-z]+/;
const numberPattern=/^(?:\d+(?:\.\d*)?|\.\d+)/;
const operatorChars=new Set('+-−×÷=≤≥<>≈≠±*/^_%,:|πΔ∞√²³⁰¹⁴⁵⁶⁷⁸⁹⁻⁺');
const skipSelector=[
  'math','svg','script','style','pre','code','textarea','input','select','option',
  '[contenteditable]','[data-math-input]','[data-working-notebook]',
  '.working-book','.math-tool','.working-tool'
].join(',');

function startsMath(text,index){
  if(index>0&&/[A-Za-z\\]/.test(text[index-1]))return false;
  return MATH_START.test(text.slice(index));
}
function readMathRun(text,index){
  if(!startsMath(text,index))return null;
  let pos=index,depth=0,meaningful=false,previousType='';
  while(pos<text.length&&pos-index<260){
    const rest=text.slice(pos);
    if(/^\s/.test(rest)){
      // Spaces are allowed inside equations, but not across prose words.
      const spaces=rest.match(/^\s+/)[0],next=rest.slice(spaces.length);
      if(!next||/^[.;!?]/.test(next))break;
      const word=next.match(wordPattern);
      if(word&&(previousType!=='operator'&&previousType!=='open'||
        stopWords.has(word[0].toLowerCase())||
        (word[0].length>3||![...word[0]].every(c=>mathAlphabet.has(c)))))break;
      pos+=spaces.length;continue;
    }
    const number=rest.match(numberPattern);
    if(number){
      pos+=number[0].length;previousType='number';continue;
    }
    const word=rest.match(wordPattern);
    if(word){
      const value=word[0];
      if(stopWords.has(value.toLowerCase())||value.length>4||
        ![...value].every(c=>mathAlphabet.has(c)))break;
      pos+=value.length;previousType='word';continue;
    }
    const char=rest[0];
    if(char==='('||char==='['||char==='{'){
      depth++;pos++;meaningful=true;previousType='open';continue;
    }
    if(char===')'||char===']'||char==='}'){
      if(depth===0)break;
      depth--;pos++;meaningful=true;previousType='close';continue;
    }
    if(char===','){
      if(depth===0)break;
      pos++;meaningful=true;previousType='comma';continue;
    }
    if(char==='.'||char===';'||char===':'||char==='?'||char==='!')break;
    if(operatorChars.has(char)){
      pos++;meaningful=true;
      previousType=Object.prototype.hasOwnProperty.call(supDigits,char)?'superscript':'operator';continue;
    }
    break;
  }
  let run=text.slice(index,pos).trimEnd();
  // Do not swallow trailing connectors or unmatched delimiters.
  while(run&&/[+\-−×÷=≤≥<>≈≠±*/^_,:|([{]$/.test(run))
    run=run.slice(0,-1).trimEnd();
  if(!run||!meaningful||run.length>240||/^\d+%?$/.test(run)&&!run.includes('%'))
    return null;
  if(!/[a-zA-Z\dπΔ²³⁴⁵√]/u.test(run))return null;
  // Single letters or isolated signs are not mathematical expressions.
  if(/^[a-zA-Z]$/.test(run))return null;
  return {raw:run,end:index+run.length};
}

function asciiToMathML(expression,depth=0){
  if(depth>15||expression.length>1200)throw new Error('Mathematical expression is too complex');
  let i=0;
  const atoms=[];
  const frames=[];
  const input=expression;
  const skip=()=>{while(/\s/.test(input[i]||'')&&i<input.length)i++;};
  const grouped=(open='{',close='}')=>{
    skip();
    if(input[i]!==open)throw new Error('Expected opening delimiter');
    i++;let start=i,level=1;
    while(i<input.length&&level>0){
      if(input[i]===open)level++;
      else if(input[i]===close)level--;
      if(level>0)i++;
    }
    if(level!==0)throw new Error('Unclosed mathematical group');
    const body=input.slice(start,i);i++;
    return asciiToMathML(body,depth+1);
  };
  const operand=()=>{
    skip();
    const rest=input.slice(i);
    if(rest.startsWith('{'))return grouped();
    if(rest.startsWith('('))return grouped('(',')');
    const n=rest.match(numberPattern);
    if(n){i+=n[0].length;return mn(n[0]);}
    const ch=rest[0];
    if(ch&&mathAlphabet.has(ch)){i++;return mi(ch);}
    if(ch&&ch in supDigits){i++;return mn(supDigits[ch]);}
    if(ch==='−'||ch==='-'){i++;return op('−')+operand();}
    throw new Error('Unsupported superscript or denominator');
  };
  const command=()=>{
    const match=input.slice(i).match(/^\\([A-Za-z]+)/);
    if(!match)throw new Error('Invalid LaTeX command');
    i+=match[0].length;const name=match[1];
    const simple={pi:'π',Delta:'Δ',alpha:'α',beta:'β',theta:'θ',lambda:'λ',
      sigma:'σ',mu:'μ',infty:'∞',times:'×',cdot:'·',div:'÷',pm:'±',
      le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',approx:'≈',in:'∈'};
    if(name==='frac'||name==='dfrac'||name==='tfrac'){
      const numerator=grouped(),denominator=grouped();
      return tag('mfrac',numerator+denominator);
    }
    if(name==='sqrt')return tag('msqrt',grouped());
    if(name==='vec'||name==='hat'||name==='bar'){
      return tag('mover',grouped()+(name==='vec'?op('→'):name==='hat'?op('ˆ'):op('¯')));
    }
    if(name==='sum'||name==='int')return op(name==='sum'?'∑':'∫');
    if(name==='left'||name==='right')return '';
    if(Object.prototype.hasOwnProperty.call(simple,name))
      return ['times','cdot','div','pm','le','leq','ge','geq','ne','neq','approx','in'].includes(name)?
        op(simple[name]):mi(simple[name]);
    throw new Error('Unsupported LaTeX command: '+name);
  };
  while(i<input.length){
    skip();
    if(i>=input.length)break;
    let next,kind='other';
    const rest=input.slice(i);
    if(input[i]==='\\'){
      next=command();
    }else if(input[i]==='^'||input[i]==='_'){
      const superscript=input[i++]==='^';
      if(!atoms.length)throw new Error('Missing superscript base');
      const base=atoms.pop(),exponent=operand();
      atoms.push(tag(superscript?'msup':'msub',base+exponent));
      continue;
    }else if(Object.prototype.hasOwnProperty.call(supDigits,input[i])){
      if(!atoms.length)throw new Error('Missing exponent base');
      const base=atoms.pop(),power=[];
      while(Object.prototype.hasOwnProperty.call(supDigits,input[i])){
        power.push(supDigits[input[i]]);i++;
      }
      atoms.push(tag('msup',base+mn(power.join(''))));
      continue;
    }else if(input[i]==='√'){
      i++;const body=operand();next=tag('msqrt',body);
    }else if(input[i]==='/'){
      i++;skip();
      // Display ordinary arithmetic fractions vertically when both sides
      // are single atoms. Grouped or compound divisions remain an operator.
      if(atoms.length&&/^((?:\d+(?:\.\d*)?)|[A-Za-z])(?:$|[^A-Za-z])/.test(input.slice(i))){
        const numerator=atoms.pop(),denominator=operand();
        next=tag('mfrac',numerator+denominator);
      }else next=op('/');
    }else if(input[i]==='{'||input[i]==='}'){
      next=op(input[i++]);
    }else if(input[i]==='('||input[i]==='['){
      // Opening a bracket starts a new atomic base. Close it as an mrow
      // so a following superscript applies to the full bracketed expression.
      if(frames.length>=20)throw new Error('Mathematical groups are too deeply nested');
      frames.push({start:atoms.length,open:input[i++]});
      continue;
    }else if(input[i]===')'||input[i]===']'){
      const closing=input[i++],frame=frames.pop();
      if(!frame||frame.open!==(closing===')'?'(':'['))
        throw new Error('Unmatched mathematical bracket');
      const inside=atoms.splice(frame.start).join('');
      atoms.push(tag('mrow',fence(frame.open)+inside+fence(closing)));
      continue;
    }else if(input[i]===','||input[i]==='|'){
      next=op(input[i++]);
    }else if(operatorChars.has(input[i])&&!Object.prototype.hasOwnProperty.call(supDigits,input[i])){
      const symbol=input[i++];
      next=op(symbol==='-'?'−':symbol);
    }else{
      const n=rest.match(numberPattern);
      if(n){i+=n[0].length;next=mn(n[0]);kind='number';}
      else{
        const word=rest.match(wordPattern);
        if(word){
          const w=word[0];i+=w.length;
          if(w.length>20)throw new Error('Too long for mathematical variable');
          next=[...w].map(c=>mi(c)).join('');
          kind='word';
        }else throw new Error('Unsupported character in mathematical expression');
      }
    }
    atoms.push(next);
  }
  if(frames.length)throw new Error('Unclosed mathematical bracket');
  return tag('mrow',atoms.join(''));
}

export function renderMathML(expression,{display=false}={}){
  const source=asText(expression);
  if(!source.trim()||source.length>1200)return escape(source);
  try{
    const body=asciiToMathML(source);
    return '<math xmlns="http://www.w3.org/1998/Math/MathML" '+
      'display="'+(display?'block':'inline')+'" aria-label="'+escape(source)+'">'+
      body+'</math>';
  }catch{
    return escape(source);
  }
}

function explicitTokens(text){
  const result=[],re=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;
  let start=0,match;
  while((match=re.exec(text))){
    if(match.index>start)result.push({value:text.slice(start,match.index),math:false});
    result.push({value:match[1]??match[2],math:true,display:match[2]!==undefined});
    start=re.lastIndex;
  }
  if(start<text.length)result.push({value:text.slice(start),math:false});
  return result;
}
function automaticNotation(text){
  let out='',i=0,plain=0;
  while(i<text.length){
    const candidate=readMathRun(text,i);
    if(candidate){
      const formatted=renderMathML(candidate.raw);
      if(formatted.startsWith('<math ')){
        out+=escape(text.slice(plain,i))+formatted;
        i=candidate.end;plain=i;continue;
      }
    }
    i++;
  }
  out+=escape(text.slice(plain));
  return out;
}

// Authoring contract: \( ... \) for explicit TeX; otherwise convert the
// conservative subset of existing algebraic/probability notation on sight.
export function renderMathematicalText(value){
  const text=asText(value);
  if(!text||text.length>6000)return escape(text);
  const segments=explicitTokens(text);
  if(!segments.length)return automaticNotation(text);
  return segments.map(part=>part.math?renderMathML(part.value,{display:part.display}):
    automaticNotation(part.value)).join('');
}

// Enhance all ordinary mathematical reading content, irrespective of mode.
// Never touch inputs, static SVG figures, mathematical notebook editors,
// buttons, hidden options, script or user-supplied text.
export function typesetSiteMath(root){
  if(!root||typeof document==='undefined'||!document.createTreeWalker)return 0;
  const content=root.matches?.('.page-body')?root:root.querySelector?.('.page-body');
  if(!content)return 0;
  const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT);
  const pending=[];let node;
  while((node=walker.nextNode())){
    const parent=node.parentElement;
    if(!parent||parent.closest(skipSelector)||!node.nodeValue?.trim())continue;
    if(parent.closest('[data-math-typeset]'))continue;
    const changed=renderMathematicalText(node.nodeValue);
    if(changed.includes('<math '))pending.push({node,changed});
  }
  for(const {node,changed} of pending){
    if(!node.isConnected)continue;
    const template=document.createElement('template');
    template.innerHTML=changed;
    node.replaceWith(template.content);
  }
  return pending.length;
}
