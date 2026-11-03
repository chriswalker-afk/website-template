// A versioned, topic-neutral mathematical source of truth.
// This layer describes mathematics; it does NOT execute algebra or mark symbolic input.
export const QUESTION_MODEL_VERSION=1;
export const ANSWER_KINDS=Object.freeze([
  'number','ordered','unordered','rational','expression','equation',
  'inequality','interval','coordinates','set','choice','self-review'
]);
const ID=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const plain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;
function finiteNumbers(values){return Array.isArray(values)&&values.length>0&&values.every(Number.isFinite);}
export function validateQuestionModel(model){
  const errors=[];
  if(!plain(model))return ['Question model must be a plain object'];
  if(model.schemaVersion!==QUESTION_MODEL_VERSION)errors.push('Unsupported schemaVersion');
  if(typeof model.topicId!=='string'||!ID.test(model.topicId))errors.push('Invalid topicId');
  if(typeof model.familyId!=='string'||!ID.test(model.familyId))errors.push('Invalid familyId');
  if(typeof model.signature!=='string'||!model.signature.trim())errors.push('Missing deterministic signature');
  if(!plain(model.parameters))errors.push('Parameters must be a plain object');
  if(typeof model.prompt!=='string'||!model.prompt.trim())errors.push('Missing prompt');
  if(!Number.isInteger(model.marks)||model.marks<1||model.marks>30)errors.push('Marks must be 1–30');
  if(!plain(model.answer)||!ANSWER_KINDS.includes(model.answer?.kind))errors.push('Unsupported answer kind');
  else{
    const {kind,values,value,options}=model.answer;
    if(['number','ordered','unordered'].includes(kind)&&
       (!finiteNumbers(values)||(kind==='number'&&values.length!==1)))
      errors.push('Numerical answers require finite values (one for number)');
    if(kind==='rational'&&(!plain(value)||!Number.isSafeInteger(value.numerator)||
       !Number.isSafeInteger(value.denominator)||value.denominator<=0))
      errors.push('Rational answer requires reduced numerator/positive denominator');
    if(['expression','equation','inequality','interval','coordinates','set'].includes(kind)&&
       (!plain(value)||typeof value.latex!=='string'||!value.latex.trim()))
      errors.push('Structured answer requires an authored LaTeX value');
    if(kind==='choice'&&(!Array.isArray(options)||options.length<2||
       !Number.isInteger(value)||value<0||value>=options.length))
      errors.push('Choice answer requires options and an answer index');
    if(kind==='self-review'&&(!Array.isArray(model.reviewCriteria)||model.reviewCriteria.length===0))
      errors.push('Self-review requires explicit reviewCriteria');
  }
  if(!Array.isArray(model.solutionSteps)||model.solutionSteps.length===0||
     model.solutionSteps.some(step=>typeof step!=='string'||!step.trim()))
    errors.push('Provide complete authored solutionSteps');
  if(typeof model.hint!=='string'||!model.hint.trim())errors.push('Missing hint');
  if(model.difficulty!==undefined&&!['guided','structured','independent','challenge'].includes(model.difficulty))
    errors.push('Invalid difficulty');
  return errors;
}
export function makeQuestionModel(fields){
  const model={...fields,schemaVersion:QUESTION_MODEL_VERSION};
  const errors=validateQuestionModel(model);
  if(errors.length)throw new TypeError(errors.join('; '));
  return Object.freeze({...model,parameters:Object.freeze({...model.parameters}),
    answer:Object.freeze({...model.answer}),
    solutionSteps:Object.freeze([...model.solutionSteps]),
    ...(model.reviewCriteria?{reviewCriteria:Object.freeze([...model.reviewCriteria])}:{})});
}
