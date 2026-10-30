// Reusable mathematical response foundation. No server-side storage or eval.
import {escapeHTML} from './logic.js';

export const MATH_INPUT_VERSION=1;
export const MATHLIVE_VERSION='0.111.1';
const MATHLIVE_URL='https://cdn.jsdelivr.net/npm/mathlive@'+MATHLIVE_VERSION+'/mathlive.min.mjs';
const MATHLIVE_FONTS='https://cdn.jsdelivr.net/npm/mathlive@'+MATHLIVE_VERSION+'/fonts';
export const MATH_SYMBOLS=Object.freeze([
  {id:'fraction',label:'Fraction',display:'½',latex:'\\frac{#0}{#?}',fallback:'\\frac{1}{2}'},
  {id:'root',label:'Square root',display:'√',latex:'\\sqrt{#0}',fallback:'\\sqrt{4}'},
  {id:'square',label:'Square',display:'x²',latex:'#@^{2}',fallback:'^{2}'},
  {id:'power',label:'Power',display:'xⁿ',latex:'#@^{#?}',fallback:'^{}'},
  {id:'pi',label:'Pi',display:'π',latex:'\\pi',fallback:'\\pi'},
  {id:'less-equal',label:'Less than or equal to',display:'≤',latex:'\\le',fallback:'\\le'},
  {id:'greater-equal',label:'Greater than or equal to',display:'≥',latex:'\\ge',fallback:'\\ge'},
  {id:'multiply',label:'Multiply',display:'×',latex:'\\times',fallback:'\\times'},
  {id:'separator',label:'Next answer',display:',',latex:',',fallback:','},
  {id:'percent',label:'Percent',display:'%',latex:'\\%',fallback:'\\%'}
]);

// Versioned data contract for future notebook blocks; session-only in Pass 1.
export function makeMathResponse(latex=''){
  if(typeof latex!=='string'||latex.length>1000)throw new TypeError('Invalid mathematical response');
  return {version:MATH_INPUT_VERSION,format:'latex',latex};
}
export function readMathResponse(record){
  if(!record||record.version!==MATH_INPUT_VERSION||record.format!=='latex'||
    typeof record.latex!=='string'||record.latex.length>1000)return null;
  return record.latex;
}

// A deliberately limited arithmetic parser. This never executes student code
// and does not claim to check symbolic equivalence.
export function parseMathNumber(latex){
  if(typeof latex!=='string'||!latex.trim()||latex.length>500)return null;
  const text=latex.replace(/\\left|\\right/g,'').replace(/\\,/g,'').trim();
  const tokens=[];
  for(let i=0;i<text.length;){
    const rest=text.slice(i);
    if(/^\s/.test(rest)){i++;continue;}
    const number=rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if(number){tokens.push({type:'number',value:Number(number[0])});i+=number[0].length;continue;}
    const command=rest.match(/^\\[a-zA-Z]+/);
    if(command){
      const name=command[0].slice(1);
      if(!['frac','dfrac','tfrac','sqrt','cdot','times','div','pi'].includes(name))return null;
      tokens.push({type:name});i+=command[0].length;continue;
    }
    if('+-*/^(){}'.includes(rest[0])){tokens.push({type:rest[0]});i++;continue;}
    return null;
  }
  if(tokens.length>100)return null;
  let pos=0,depth=0;
  const take=type=>tokens[pos]?.type===type?(pos++,true):false;
  function group(){
    const open=tokens[pos]?.type;
    if(open!=='{'&&open!=='(')throw Error('Missing group');
    pos++;
    const result=sum();
    if(!take(open==='{'?'}':')'))throw Error('Unclosed group');
    return result;
  }
  function atom(){
    if(++depth>30)throw Error('Deep expression');
    try{
      const next=tokens[pos];
      if(!next)throw Error('Incomplete expression');
      if(next.type==='number'){pos++;return next.value;}
      if(next.type==='pi'){pos++;return Math.PI;}
      if(next.type==='{'||next.type==='(')return group();
      if(['frac','dfrac','tfrac'].includes(next.type)){
        pos++;const numerator=group(),denominator=group();
        if(denominator===0)throw Error('Divide by zero');
        return numerator/denominator;
      }
      if(next.type==='sqrt'){
        pos++;const n=group();
        if(n<0)throw Error('Non-real square root');
        return Math.sqrt(n);
      }
      throw Error('Unsupported expression');
    }finally{depth--;}
  }
  function power(){
    let result=atom();
    if(take('^'))result=Math.pow(result,unary());
    return result;
  }
  function unary(){
    if(take('+'))return unary();
    if(take('-'))return -unary();
    return power();
  }
  function product(){
    let result=unary();
    while(['*','/','cdot','times','div'].includes(tokens[pos]?.type)){
      const op=tokens[pos++].type,n=unary();
      if(op==='/'||op==='div'){if(n===0)throw Error('Divide by zero');result/=n;}
      else result*=n;
    }
    return result;
  }
  function sum(){
    let result=product();
    while(tokens[pos]?.type==='+'||tokens[pos]?.type==='-'){
      const op=tokens[pos++].type,n=product();
      result=op==='+'?result+n:result-n;
    }
    return result;
  }
  try{
    const value=sum();
    return pos===tokens.length&&Number.isFinite(value)?value:null;
  }catch{return null;}
}

function splitResponses(latex){
  // Separators inside nested expressions do not split multi-part answers.
  const parts=[];let depth=0,start=0;
  for(let i=0;i<latex.length;i++){
    if(latex[i]==='{')depth++;
    else if(latex[i]==='}')depth--;
    else if(depth===0&&(latex[i]===','||latex[i]===';')){
      parts.push(latex.slice(start,i));start=i+1;
    }
    if(depth<0)return null;
  }
  if(depth!==0)return null;
  parts.push(latex.slice(start));
  return parts;
}
export function latexToFluencyText(latex,answer){
  if(typeof latex!=='string'||latex.length>1000||!answer||
    !['number','ordered','unordered'].includes(answer.kind))return null;
  let cleaned=latex.trim()
    .replace(/\\(?:quad|qquad|,|;|!)/g,' ')
    .replace(/\\(?:text|mathrm)\s*\{\s*(?:or|and)\s*\}/gi,',')
    .replace(/\\(?:lor|vee)\b/g,',');
  if(answer.unit==='%')cleaned=cleaned.replace(/(?:\\%|%)\s*$/,'');
  const parts=splitResponses(cleaned);
  if(!parts||parts.length!==(answer.kind==='number'?1:answer.values.length))return null;
  const results=[];
  for(let part of parts){
    part=part.trim().replace(/^(?:x|[abc]|group\s*[abc])\s*=\s*/i,'').trim();
    const value=parseMathNumber(part);
    if(value===null)return null;
    results.push(String(value));
  }
  return results.join(', ');
}

export function mathInputMarkup({targetId,active=false,disabled=false,latex=''}={}){
  if(typeof targetId!=='string'||!/^[a-z][\w-]*$/i.test(targetId))
    throw new TypeError('Invalid math input target');
  const current=readMathResponse(makeMathResponse(latex))||'';
  return '<div class="math-input" data-math-input data-target="'+escapeHTML(targetId)+
    '" data-active="'+String(active)+'">'+
    '<button type="button" class="math-input__toggle" data-math-toggle aria-expanded="'+String(active)+
    '"'+(disabled?' disabled':'')+'>'+
      (active?'Use simple typing':'Use maths notation')+'</button>'+
    (active?'<div class="math-input__panel">'+
      '<p class="math-input__hint">Type mathematics directly or choose a symbol. Your final answer is checked, not your working.</p>'+
      '<div class="math-input__entry">'+
        '<input class="math-input__source" data-math-source type="text" spellcheck="false" '+
          'autocomplete="off" aria-label="Mathematical answer in LaTeX" '+
          'value="'+escapeHTML(current)+'"'+(disabled?' disabled':'')+'>'+
      '</div>'+
      '<div class="math-input__palette" role="group" aria-label="Insert mathematical notation">'+
        MATH_SYMBOLS.map(symbol=>'<button type="button" class="math-input__symbol" '+
          'data-math-insert="'+symbol.id+'" aria-label="'+escapeHTML(symbol.label)+'" '+
          'title="'+escapeHTML(symbol.label)+'"'+(disabled?' disabled':'')+'>'+
          escapeHTML(symbol.display)+'</button>').join('')+
      '</div>'+
      '<p class="math-input__status" data-math-status role="status">'+
        'Preparing the visual editor. You can type LaTeX in the box above if needed.</p>'+
      '</div>':'')+
    '</div>';
}

let loader;
export function loadMathLive(){
  if(!loader)loader=import(MATHLIVE_URL).then(module=>{
    if(typeof module.MathfieldElement!=='function')throw Error('MathLive unavailable');
    module.MathfieldElement.fontsDirectory=MATHLIVE_FONTS;
    return module.MathfieldElement;
  }).catch(error=>{loader=null;throw error;});
  return loader;
}
export function enhanceMathInputs(root,{onToggle=()=>{},onChange=()=>{}}={}){
  for(const box of root.querySelectorAll('[data-math-input]')){
    const active=box.dataset.active==='true';
    box.querySelector('[data-math-toggle]')?.addEventListener('click',()=>{
      onToggle(box.dataset.target,!active);
    });
    if(!active)continue;
    const source=box.querySelector('[data-math-source]');
    const entry=box.querySelector('.math-input__entry');
    const status=box.querySelector('[data-math-status]');
    const inform=()=>onChange(box.dataset.target,source.value);
    source.addEventListener('input',inform);
    box.querySelectorAll('[data-math-insert]').forEach(button=>{
      button.addEventListener('click',()=>{
        const symbol=MATH_SYMBOLS.find(item=>item.id===button.dataset.mathInsert);
        if(!symbol||button.disabled)return;
        const field=box.querySelector('math-field');
        if(field){
          field.focus();
          field.insert(symbol.latex);
          source.value=field.getValue('latex');
          inform();
        }else{
          source.focus();
          source.setRangeText(symbol.fallback,source.selectionStart,source.selectionEnd,'end');
          inform();
        }
      });
    });
    loadMathLive().then(MathfieldElement=>{
      if(!box.isConnected||box.dataset.active!=='true')return;
      const field=new MathfieldElement();
      field.className='math-input__field';
      field.setAttribute('aria-label','Mathematical answer');
      field.mathVirtualKeyboardPolicy='auto';
      field.readOnly=Boolean(source.disabled);
      field.value=source.value;
      field.addEventListener('input',()=>{
        source.value=field.getValue('latex');
        inform();
      });
      field.addEventListener('keydown',event=>{
        if(event.key==='Enter'&&!event.shiftKey){
          event.preventDefault();
          field.closest('form')?.requestSubmit();
        }
      });
      entry.append(field);
      box.classList.add('math-input--ready');
      status.textContent='Visual maths editor ready. Use the symbol buttons or your keyboard.';
    }).catch(()=>{
      if(box.isConnected)status.textContent='Visual editor unavailable. LaTeX typing and symbol buttons still work.';
    });
  }
}
