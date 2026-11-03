// Exact, bounded rational and polynomial arithmetic for opt-in student checking.
// No eval, Function, numerical sampling, implicit domain cancellation, or remote CAS.
const MAX_INPUT=360,MAX_TOKENS=180,MAX_DEPTH=25,MAX_TERMS=80,MAX_DEGREE=10,MAX_POWER=8,MAX_DIGITS=100;
const ZERO=Object.freeze({n:0n,d:1n}),ONE=Object.freeze({n:1n,d:1n});
function fail(message){throw new SyntaxError(message);}
function abs(n){return n<0n?-n:n;}
function gcd(a,b){a=abs(a);b=abs(b);while(b){const r=a%b;a=b;b=r;}return a;}
export function exactFraction(n,d=1n){
  if(typeof n!=='bigint'||typeof d!=='bigint'||d===0n)fail('Invalid rational number');
  if(n===0n)return ZERO;
  if(d<0n){n=-n;d=-d;}
  const g=gcd(n,d);n/=g;d/=g;
  if(abs(n).toString().length>MAX_DIGITS||d.toString().length>MAX_DIGITS)
    fail('Arithmetic complexity limit reached');
  return {n,d};
}
const add=(a,b)=>exactFraction(a.n*b.d+b.n*a.d,a.d*b.d);
const neg=a=>exactFraction(-a.n,a.d);
const sub=(a,b)=>add(a,neg(b));
const mul=(a,b)=>exactFraction(a.n*b.n,a.d*b.d);
const div=(a,b)=>exactFraction(a.n*b.d,a.d*b.n);
export function fractionText(f){return f.d===1n?String(f.n):String(f.n)+'/'+String(f.d);}
export function equalFractions(a,b){return a.n===b.n&&a.d===b.d;}
function fromDecimal(s){
  if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)||s.length>MAX_DIGITS)
    fail('Unsupported number literal');
  const split=s.split('.'),digits=split.join('')||'0';
  return exactFraction(BigInt(digits),10n**BigInt(split[1]?.length||0));
}
function normalise(source){
  if(typeof source!=='string'||!source.trim()||source.length>MAX_INPUT)
    fail('Expression is empty or too long');
  return source.replace(/[−–—]/g,'-').replace(/≤/g,'<=').replace(/≥/g,'>=')
    .replace(/×/g,'*').replace(/÷/g,'/')
    .replace(/\\(?:left|right)\b/g,'')
    .replace(/\\(?:quad|qquad|,|;|!)/g,'')
    .replace(/\\\{/g,'{').replace(/\\\}/g,'}')
    .replace(/²/g,'^2').replace(/³/g,'^3').trim();
}
export function tokenizeAlgebra(source){
  const text=normalise(source),tokens=[];
  for(let i=0;i<text.length;){
    const rest=text.slice(i),char=rest[0];
    if(/\s/.test(char)){i++;continue;}
    const cmd=rest.match(/^\\([a-zA-Z]+)/);
    if(cmd){
      const name=cmd[1];i+=cmd[0].length;
      if(['frac','dfrac','tfrac'].includes(name))tokens.push({type:'frac'});
      else if(['cdot','times'].includes(name))tokens.push({type:'*'});
      else if(['le','leq','leqslant'].includes(name))tokens.push({type:'<='});
      else if(['ge','geq','geqslant'].includes(name))tokens.push({type:'>='});
      else if(name==='lt'||name==='gt')tokens.push({type:name==='lt'?'<':'>'});
      else fail('Unsupported mathematical command');
    }else{
      const number=rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
      if(number){tokens.push({type:'num',text:number[0]});i+=number[0].length;}
      else if(/[a-zA-Z]/.test(char)){
        // Keep identifiers single-letter; functions such as sin() must not become s*i*n.
        if(!'xyabctmnk'.includes(char.toLowerCase())||char!==char.toLowerCase())
          fail('Unsupported variable or function');
        tokens.push({type:'var',text:char});i++;
      }else if('+-*/^(){}[]=<>'.includes(char)){
        if((char==='<'||char==='>')&&rest[1]==='='){
          tokens.push({type:char+'='});i+=2;
        }else{tokens.push({type:char});i++;}
      }else fail('Unexpected symbol in expression');
    }
    if(tokens.length>MAX_TOKENS)fail('Too many mathematical tokens');
  }
  return tokens;
}
function constant(a){return a.n===0n?new Map():new Map([['',a]]);}
function monomial(v){return new Map([[v+':1',ONE]]);}
function decode(key){
  if(!key)return {};
  return Object.fromEntries(key.split('|').map(p=>{const [v,n]=p.split(':');return [v,Number(n)];}));
}
function combineKey(a,b){
  const exponents=decode(a);
  for(const [name,n] of Object.entries(decode(b)))exponents[name]=(exponents[name]||0)+n;
  if(Object.values(exponents).reduce((sum,n)=>sum+n,0)>MAX_DEGREE||
     Object.keys(exponents).length>4)fail('Polynomial degree or variable limit exceeded');
  return Object.entries(exponents).filter(([,n])=>n!==0).sort(([a],[b])=>a.localeCompare(b))
    .map(([name,n])=>name+':'+n).join('|');
}
function clean(map){
  for(const [key,value] of map)if(value.n===0n)map.delete(key);
  if(map.size>MAX_TERMS)fail('Too many polynomial terms');
  return map;
}
function addPoly(a,b,negative=false){
  const output=new Map(a);
  for(const [key,value] of b)output.set(key,add(output.get(key)||ZERO,negative?neg(value):value));
  return clean(output);
}
function multiplyPoly(a,b){
  const output=new Map();
  for(const [ak,av] of a)for(const [bk,bv] of b){
    const key=combineKey(ak,bk);
    output.set(key,add(output.get(key)||ZERO,mul(av,bv)));
    if(output.size>MAX_TERMS)fail('Too many polynomial terms');
  }
  return clean(output);
}
function scalePoly(a,n){return multiplyPoly(a,constant(n));}
function polyPow(a,power){
  if(!Number.isInteger(power)||power<0||power>MAX_POWER)fail('Unsupported exponent');
  if(power===0&&a.size===0)fail('Zero to the zero power is undefined');
  let value=constant(ONE),base=a,exponent=power;
  while(exponent){if(exponent%2)value=multiplyPoly(value,base);exponent=Math.floor(exponent/2);
    if(exponent)base=multiplyPoly(base,base);}
  return value;
}
function scalarPoly(a){
  if(a.size===0)return ZERO;
  if(a.size===1&&a.has(''))return a.get('');
  fail('Only constant polynomial denominators are supported');
}
class PolynomialParser{
  constructor(tokens){this.tokens=tokens;this.pos=0;this.depth=0;}
  peek(){return this.tokens[this.pos]?.type;}
  take(type){if(this.peek()===type){this.pos++;return true;}return false;}
  guard(fn){if(++this.depth>MAX_DEPTH)fail('Expression nesting too deep');try{return fn();}finally{this.depth--;}}
  group(){
    const open=this.peek();
    if(open!=='('&&open!=='{')fail('Expected a mathematical group');
    this.pos++;
    const result=this.sum();
    if(!this.take(open==='('?')':'}'))fail('Unclosed mathematical group');
    return result;
  }
  atom(){
    if(this.peek()==='num'){const value=fromDecimal(this.tokens[this.pos++].text);return constant(value);}
    if(this.peek()==='var'){return monomial(this.tokens[this.pos++].text);}
    if(this.peek()==='('||this.peek()==='{')return this.guard(()=>this.group());
    if(this.take('frac')){
      const numerator=this.guard(()=>this.group()),denominator=this.guard(()=>this.group());
      return scalePoly(numerator,div(ONE,scalarPoly(denominator)));
    }
    fail('Expected a number, variable or group');
  }
  exponent(){
    let end=null;
    if(this.take('{'))end='}';
    else if(this.take('('))end=')';
    const sign=this.take('-')?-1:(this.take('+'),1);
    if(this.peek()!=='num'||!/^\d+$/.test(this.tokens[this.pos].text))
      fail('Exponent must be a bounded integer');
    const value=Number(this.tokens[this.pos++].text)*sign;
    if(end&&!this.take(end))fail('Unclosed exponent group');
    if(!Number.isSafeInteger(value)||value<0||value>MAX_POWER)fail('Unsupported exponent');
    return value;
  }
  power(){let value=this.atom();if(this.take('^'))value=polyPow(value,this.exponent());return value;}
  unary(){
    return this.guard(()=>{
      if(this.take('+'))return this.unary();
      if(this.take('-'))return scalePoly(this.unary(),neg(ONE));
      return this.power();
    });
  }
  product(){
    let value=this.unary();
    while(this.pos<this.tokens.length){
      const op=this.peek();
      if(op==='*'||op==='/'){
        this.pos++;const other=this.unary();
        // "1/2x" is ambiguous: insist on an explicit multiplication sign,
        // a LaTeX fraction, or parentheses rather than guessing precedence.
        if(op==='/'&&['num','var','(','{','frac'].includes(this.peek()))
          fail('Ambiguous division followed by implicit multiplication');
        value=op==='*'?multiplyPoly(value,other):scalePoly(value,div(ONE,scalarPoly(other)));
      }else if(['num','var','(','{','frac'].includes(op)){
        if(op==='num'&&this.tokens[this.pos-1]?.type==='num')
          fail('Use an explicit multiplication sign between numbers');
        value=multiplyPoly(value,this.unary());
      }else break;
    }
    return value;
  }
  sum(){
    let value=this.product();
    while(this.peek()==='+'||this.peek()==='-'){
      const minus=this.peek()==='-';this.pos++;
      value=addPoly(value,this.product(),minus);
    }
    return value;
  }
  parse(){
    if(!this.tokens.length)fail('Missing mathematical expression');
    const value=this.sum();
    if(this.pos!==this.tokens.length)fail('Unsupported or incomplete mathematical expression');
    return value;
  }
}
function parseTokens(tokens){return new PolynomialParser(tokens).parse();}
export function parsePolynomial(source){return parseTokens(tokenizeAlgebra(source));}
export function parseExactScalar(source){return scalarPoly(parsePolynomial(source));}
export function equalPolynomials(a,b){
  if(a.size!==b.size)return false;
  for(const [key,value] of a)if(!b.has(key)||!equalFractions(value,b.get(key)))return false;
  return true;
}
function proportionalSign(a,b){
  if(a.size===0&&b.size===0)return 1;
  if(a.size!==b.size||a.size===0)return 0;
  const [key,value]=a.entries().next().value;
  if(!b.has(key))return 0;
  const scale=div(value,b.get(key));
  if(scale.n===0n||!equalPolynomials(a,scalePoly(b,scale)))return 0;
  return scale.n>0n?1:-1;
}
export function parseRelation(source,kind){
  const tokens=tokenizeAlgebra(source),ops=kind==='equation'?['=']:['<','<=','>','>='];
  let depth=0,position=-1;
  for(let i=0;i<tokens.length;i++){
    const type=tokens[i].type;
    if(type==='('||type==='{')depth++;
    else if(type===')'||type==='}')depth--;
    if(depth<0)fail('Unbalanced mathematical groups');
    if(depth===0&&['=','<','<=','>','>='].includes(type)){
      if(position!==-1||!ops.includes(type))fail('Expected one supported relation');
      position=i;
    }
  }
  if(depth!==0||position<=0||position===tokens.length-1)fail('Expected two sides of a relation');
  const left=parseTokens(tokens.slice(0,position)),right=parseTokens(tokens.slice(position+1));
  return {op:tokens[position].type,poly:addPoly(left,right,true)};
}
const opposite=op=>({'<':'>','>':'<','<=':'>=','>=':'<='})[op];
export function equivalentAlgebra(kind,submitted,expected){
  if(kind==='expression')return equalPolynomials(parsePolynomial(submitted),parsePolynomial(expected));
  if(kind!=='equation'&&kind!=='inequality')fail('Unsupported algebraic equivalence kind');
  const a=parseRelation(submitted,kind),b=parseRelation(expected,kind),sign=proportionalSign(a.poly,b.poly);
  if(sign===0)return false;
  return kind==='equation'||(sign===1?a.op===b.op:a.op===opposite(b.op));
}
export function splitTopLevel(source,separator=','){
  const text=normalise(source),parts=[];let depth=0,start=0;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='{'||ch==='('||ch==='[')depth++;
    else if(ch==='}'||ch===')'||ch===']')depth--;
    if(depth<0)fail('Unbalanced grouping');
    if(ch===separator&&depth===0){parts.push(text.slice(start,i).trim());start=i+1;}
  }
  if(depth!==0)fail('Unbalanced grouping');
  parts.push(text.slice(start).trim());
  if(parts.some(s=>!s))fail('Missing list item');
  return parts;
}
function splitPair(source,opening,closing){
  const s=normalise(source);
  if(!opening.includes(s[0])||!closing.includes(s.at(-1)))fail('Expected bracketed pair');
  const values=splitTopLevel(s.slice(1,-1));
  if(values.length!==2)fail('Expected exactly two entries');
  return {values,start:s[0],end:s.at(-1)};
}
export function parseCoordinates(source){
  return splitPair(source,'(',')').values.map(parseExactScalar);
}
export function parseFiniteSet(source){
  const s=normalise(source);
  if(!s.startsWith('{')||!s.endsWith('}'))fail('Expected a finite set in braces');
  if(s==='{}')return [];
  const values=splitTopLevel(s.slice(1,-1)).map(s=>fractionText(parseExactScalar(s)));
  if(new Set(values).size!==values.length)fail('Repeated set element');
  return values.sort();
}
function endpoint(text){
  const s=text.replace(/\s/g,'');
  if(['-\\infty','-∞'].includes(s))return {infinity:-1};
  if(['+\\infty','\\infty','+∞','∞'].includes(s))return {infinity:1};
  return {value:parseExactScalar(text)};
}
export function parseInterval(source){
  const pair=splitPair(source,'([',')]'),start=pair.start,end=pair.end;
  const lower=endpoint(pair.values[0]),upper=endpoint(pair.values[1]);
  if(lower.infinity===1||upper.infinity===-1)fail('Reversed infinite endpoints');
  if((lower.infinity&&start==='[')||(upper.infinity&&end===']'))
    fail('Infinity endpoints must be open');
  if(!lower.infinity&&!upper.infinity){
    const a=lower.value,b=upper.value,difference=sub(a,b);
    if(difference.n>0n||difference.n===0n&&(start==='('||end===')'))
      fail('Invalid or empty interval');
  }
  return {start,end,lower,upper};
}
function equalEndpoints(a,b){
  return a.infinity===b.infinity&&(
    a.infinity!==undefined||equalFractions(a.value,b.value));
}
export function equivalentIntervals(a,b){
  const x=parseInterval(a),y=parseInterval(b);
  return x.start===y.start&&x.end===y.end&&
    equalEndpoints(x.lower,y.lower)&&equalEndpoints(x.upper,y.upper);
}
