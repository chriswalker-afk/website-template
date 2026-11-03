// Seeded generator diagnostics. Mathematical oracles are supplied separately
// by topic authors; reference round-trips alone do not prove a prompt is true.
import {rngFromSeed,validateFluencyQuestion,checkFluencyAnswer,answerText} from '../fluency-engine.js';
import {validateQuestionModel} from './model.js';
import {isExactAnswerKind,validateExactAnswer,exactAnswerSample} from './verification.js';

function seedsFrom(options){
  if(options.seeds!==undefined){
    if(!Array.isArray(options.seeds)||!options.seeds.length||
      options.seeds.some(n=>!Number.isSafeInteger(n)||n<1||n>999999999))
      throw new RangeError('Seeds must be valid positive integers');
    return [...new Set(options.seeds)];
  }
  const count=options.count??48,start=options.startSeed??1;
  if(!Number.isSafeInteger(count)||count<1||count>512||
     !Number.isSafeInteger(start)||start<1||start+count-1>999999999)
    throw new RangeError('Choose 1–512 valid test seeds');
  return Array.from({length:count},(_,i)=>start+i);
}
function diagnostics({create,options,validate,answerSample,check,signature}){
  if(typeof create!=='function')throw new TypeError('Expected a generator function');
  const seeds=seedsFrom(options),errors=[],warnings=[],seen=new Set();
  const familyId=options.familyId||'unnamed-family';
  for(const seed of seeds){
    if(errors.length>=15)break;
    try{
      const generate=()=>create(rngFromSeed(seed)),q=generate();
      if(JSON.stringify(q)!==JSON.stringify(generate()))
        throw new Error('Not reproducible from the same random seed');
      const problem=validate(q);
      if(problem)throw new Error(problem);
      const sig=signature(q);
      if(typeof sig!=='string'||!sig.trim())throw new Error('Missing stable signature');
      seen.add(sig);
      const sample=answerSample(q);
      if(sample!==null){
        const verdict=check(sample,q);
        if(!verdict?.correct)throw new Error('Authored reference answer fails checking ('+verdict?.kind+')');
      }
      if(typeof options.oracle==='function'){
        const verdict=options.oracle(q,seed);
        if(verdict!==true)throw new Error('Independent oracle failed: '+String(verdict));
      }
    }catch(error){errors.push('seed '+seed+': '+error.message);}
  }
  if(seen.size<Math.min(6,Math.floor(seeds.length/4)))
    warnings.push('Low variation across tested seeds; inspect for repeated or trivial questions');
  if(!options.oracle)warnings.push('No independent mathematical oracle supplied; teacher review is still required');
  return {familyId,tested:seeds.length,distinct:seen.size,errors,warnings,
    passed:errors.length===0};
}
export function auditFluencyGenerator(create,options={}){
  return diagnostics({create,options,
    validate:q=>{
      const error=validateFluencyQuestion(q);
      if(error)return error;
      return options.familyId&&q.family!==options.familyId?'Family ID mismatch':'';
    },
    signature:q=>q.signature,
    answerSample:q=>isExactAnswerKind(q.answer.kind)?
      exactAnswerSample(q.answer):answerText(q.answer),
    check:(raw,q)=>checkFluencyAnswer(raw,q)
  });
}
export function auditQuestionModelGenerator(create,options={}){
  return diagnostics({create,options,
    validate:model=>{
      const errors=validateQuestionModel(model);
      if(errors.length)return errors.join('; ');
      if(options.familyId&&model.familyId!==options.familyId)return 'Family ID mismatch';
      if(isExactAnswerKind(model.answer.kind))return validateExactAnswer(model.answer);
      return '';
    },
    signature:model=>model.topicId+':'+model.familyId+':'+model.signature,
    answerSample:model=>isExactAnswerKind(model.answer.kind)?
      exactAnswerSample(model.answer):null,
    check:(raw,model)=>{
      // The model is independent of UI; do not use an untrusted arithmetic
      // evaluation in a generator audit.
      if(!isExactAnswerKind(model.answer.kind))return {correct:true};
      return null;
    }
  });
}
