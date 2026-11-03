import {validateQuestionModel} from './model.js';
import {isExactAnswerKind,validateExactAnswer,exactAnswerLabel} from './verification.js';

// Legacy numerical answers remain unchanged; exact types use an opt-in verified contract.
export function toFluencyQuestion(model){
  const errors=validateQuestionModel(model);
  if(errors.length)throw new TypeError(errors.join('; '));
  const answer=model.answer;
  const numeric=['number','ordered','unordered'].includes(answer.kind);
  if(!numeric&&!isExactAnswerKind(answer.kind))
    throw new TypeError('No automatic checker for this answer type; use teacher or self-review');
  if(!numeric){
    const problem=validateExactAnswer(answer);
    if(problem)throw new TypeError(problem);
  }
  if(model.marks>8)throw new RangeError('Legacy Fluency supports at most 8 marks');
  if(model.solutionSteps.length<2)throw new TypeError('Legacy Fluency requires at least two worked steps');
  if(!model.misconception)throw new TypeError('Legacy Fluency requires specific misconception feedback');
  return {
    family:model.familyId,
    signature:model.familyId+':'+model.signature,
    prompt:model.prompt,
    answer:numeric?{kind:answer.kind,values:[...answer.values],
      precision:answer.precision||0,unit:answer.unit||'',
      label:answer.label||(
        answer.kind==='number'?'Enter one number.':
        answer.kind==='unordered'?'Enter the values separated by commas (either order).':
        'Enter the values in order, separated by commas.')}:
      {kind:answer.kind,value:answer.value,
        label:answer.label||exactAnswerLabel(answer.kind)},
    steps:[...model.solutionSteps],hint:model.hint,marks:model.marks,
    skill:model.skill||model.familyId,mistake:model.misconception||''
  };
}

// The print adapter deliberately requires independently authored LaTeX;
// it never guesses that plain text is safe mathematics in a TeX document.
export function toWorksheetQuestion(model,print){
  const errors=validateQuestionModel(model);
  if(errors.length)throw new TypeError(errors.join('; '));
  const required=['questionTex','answerTex','solutionTex','hintTex'];
  if(!print||required.some(key=>typeof print[key]!=='string'||!print[key].trim()))
    throw new TypeError('Provide all four reviewed LaTeX fields');
  return {signature:model.familyId+':'+model.signature,marks:model.marks,
    prompt:model.prompt,spaceMm:print.spaceMm??30,
    questionTex:print.questionTex,answerTex:print.answerTex,
    solutionTex:print.solutionTex,hintTex:print.hintTex};
}
export function presentQuestion(model,kind,options){
  switch(kind){
    case 'fluency':return toFluencyQuestion(model);
    case 'worksheet':return toWorksheetQuestion(model,options);
    case 'worked-example':{
      const errors=validateQuestionModel(model);
      if(errors.length)throw new TypeError(errors.join('; '));
      return {id:model.familyId+':'+model.signature,prompt:model.prompt,
        steps:[...model.solutionSteps],hint:model.hint,marks:model.marks};
    }
    default:throw new TypeError('Unsupported presentation: '+String(kind));
  }
}
