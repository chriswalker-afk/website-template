// Opt-in, exact checking for mathematical answers supported by exact-algebra.js.
// Fail closed: unknown notation never receives a "correct" verdict.
import {exactFraction,equalFractions,fractionText,parseExactScalar,
  equivalentAlgebra,parseRelation,parsePolynomial,parseCoordinates,
  parseFiniteSet,parseInterval,equivalentIntervals} from './exact-algebra.js';

export const EXACT_ANSWER_KINDS=Object.freeze([
  'rational','expression','equation','inequality','interval','coordinates','set'
]);
const LABELS=Object.freeze({
  rational:'Enter an exact fraction or equivalent terminating decimal.',
  expression:'Enter an equivalent polynomial expression.',
  equation:'Enter an equivalent equation.',
  inequality:'Enter an equivalent single inequality.',
  interval:'Enter an interval using brackets or parentheses.',
  coordinates:'Enter an ordered coordinate pair (x, y).',
  set:'Enter a finite set of rational values in braces.'
});
export function exactAnswerLabel(kind){return LABELS[kind]||'Enter your answer.';}
export function isExactAnswerKind(kind){return EXACT_ANSWER_KINDS.includes(kind);}
function expectedLatex(answer){
  if(typeof answer?.value?.latex!=='string'||!answer.value.latex.trim())
    throw new TypeError('Expected an authored LaTeX answer');
  return answer.value.latex;
}
function rationalAnswer(answer){
  const value=answer?.value;
  if(!value||!Number.isSafeInteger(value.numerator)||
    !Number.isSafeInteger(value.denominator)||value.denominator<=0)
    throw new TypeError('Expected an integer rational answer');
  return exactFraction(BigInt(value.numerator),BigInt(value.denominator));
}
function parsedExpected(answer){
  switch(answer?.kind){
    case 'rational':return rationalAnswer(answer);
    case 'expression':return parsePolynomial(expectedLatex(answer));
    case 'equation':return parseRelation(expectedLatex(answer),'equation');
    case 'inequality':return parseRelation(expectedLatex(answer),'inequality');
    case 'interval':return parseInterval(expectedLatex(answer));
    case 'coordinates':return parseCoordinates(expectedLatex(answer));
    case 'set':return parseFiniteSet(expectedLatex(answer));
    default:throw new TypeError('No exact checker for this answer type');
  }
}
// Author-facing check: a model containing unsupported or malformed expected
// mathematics cannot be published as automatically marked.
export function validateExactAnswer(answer){
  if(!isExactAnswerKind(answer?.kind))return 'No exact checker for this answer type';
  try{parsedExpected(answer);return '';}
  catch(error){return 'Exact answer cannot be verified: '+error.message;}
}
function equalsAnswer(raw,answer,expected){
  switch(answer.kind){
    case 'rational':return equalFractions(parseExactScalar(raw),expected);
    case 'expression':
    case 'equation':
    case 'inequality':return equivalentAlgebra(answer.kind,raw,answer.value.latex);
    case 'interval':return equivalentIntervals(raw,answer.value.latex);
    case 'coordinates':{
      const actual=parseCoordinates(raw);
      return actual.length===expected.length&&actual.every((f,i)=>equalFractions(f,expected[i]));
    }
    case 'set':{
      const actual=parseFiniteSet(raw);
      return actual.length===expected.length&&actual.every((v,i)=>v===expected[i]);
    }
    default:throw new TypeError('No checker for this answer type');
  }
}
export function checkExactAnswer(raw,answer){
  if(!isExactAnswerKind(answer?.kind))
    return {correct:false,kind:'unsupported',message:'This answer requires self-review or teacher marking.'};
  let expected;
  try{expected=parsedExpected(answer);}
  catch{return {correct:false,kind:'unsupported',
    message:'This generated answer is not supported by the exact checker. Review the worked solution.'};}
  if(typeof raw!=='string'||!raw.trim()||raw.length>360)
    return {correct:false,kind:'format',message:'Enter an answer in a supported mathematical format. '+exactAnswerLabel(answer.kind)};
  let correct;
  try{correct=equalsAnswer(raw,answer,expected);}
  catch{return {correct:false,kind:'format',
    message:'This notation is not supported for automatic checking. '+exactAnswerLabel(answer.kind)};}
  return {correct,kind:correct?'correct':'value',message:correct?
    'Correct — your answer is mathematically equivalent.':
    'Not quite. Check your algebra and compare it with the worked solution.'};
}
export function exactAnswerText(answer){
  if(answer?.kind==='rational'){
    const q=rationalAnswer(answer);
    return q.d===1n?'\\('+String(q.n)+'\\)':
      '\\(\\frac{'+q.n+'}{'+q.d+'}\\)';
  }
  if(isExactAnswerKind(answer?.kind))return '\\('+expectedLatex(answer)+'\\)';
  return '';
}
// A verifiable reference response for deterministic generator audits.
// This is a round-trip of authored answer data, not an independent proof that
// a question statement is mathematically correct.
export function exactAnswerSample(answer){
  if(answer?.kind==='rational')return fractionText(rationalAnswer(answer));
  if(isExactAnswerKind(answer?.kind))return expectedLatex(answer);
  return null;
}
