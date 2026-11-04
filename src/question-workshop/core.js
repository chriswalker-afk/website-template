// Browser-and-Node reusable read-only authoring helpers.
// All generated questions come from the same registered topic families as students.
import {rngFromSeed,validateFluencyQuestion,checkFluencyAnswer,answerText} from '../fluency-engine.js';
import {auditFluencyGenerator} from '../question-foundation/audit.js';
import {isExactAnswerKind,exactAnswerSample} from '../question-foundation/verification.js';

export const WORKSHOP_DIFFICULTIES=Object.freeze(['developing','secure','stretch']);
export const WORKSHOP_AUDIT_COUNTS=Object.freeze([8,24,48,96]);
const MAX_SEED=999999999,REQUIRED_TEX=['questionTex','answerTex','solutionTex','hintTex'];
const pretty=id=>String(id).split('-').map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ');
export function validSeed(value){
  const n=Number(value);
  return Number.isSafeInteger(n)&&n>=1&&n<=MAX_SEED?n:null;
}
export function catalogueFor(registration){
  if(!registration?.topic||!registration.questionBank)throw new TypeError('Expected a registered topic pack');
  const {topic,questionBank:bank}=registration,output=[];
  const pages=new Map();
  for(const level of topic.chapters?.fluency||[])
    for(const page of level.pages||[])
      for(const id of page.families||[]){
        const uses=pages.get(id)||[];
        uses.push(level.label+' · '+(page.title||page.focus||page.id));
        pages.set(id,uses);
      }
  for(const [id,create] of Object.entries(bank.fluency||{})){
    if(typeof create!=='function')continue;
    output.push({key:'fluency:'+id,id,type:'fluency',label:pretty(id),
      skill:pretty(id),uses:pages.get(id)||[],source:'fluency-families.js'});
  }
  for(const family of bank.worksheet||[]){
    if(typeof family.create!=='function')continue;
    output.push({key:'worksheet:'+family.id,id:family.id,type:'worksheet',
      label:pretty(family.id),skill:topic.worksheetSkills?.find(x=>x.id===family.skill)?.label||pretty(family.skill),
      uses:['Printable worksheet · '+pretty(family.skill)],source:'worksheet-families.js'});
  }
  return output;
}
function familyFrom(registration,key){
  if(typeof key!=='string')throw new TypeError('Select a question family');
  const [type,id,...extra]=key.split(':');
  if(extra.length||!id)throw new TypeError('Unknown question family');
  if(type==='fluency'&&Object.hasOwn(registration.questionBank.fluency||{},id)){
    return {type,id,create:registration.questionBank.fluency[id]};
  }
  if(type==='worksheet'){
    const family=(registration.questionBank.worksheet||[]).find(f=>f.id===id);
    if(family)return {type,id,create:family.create};
  }
  throw new TypeError('Unknown question family: '+key);
}
export function validateWorksheetPreview(q){
  if(!q||typeof q!=='object')return 'Question was not generated';
  if(typeof q.signature!=='string'||!q.signature.trim())return 'Missing question signature';
  if(!Number.isInteger(q.marks)||q.marks<1||q.marks>30)return 'Invalid mark total';
  for(const name of REQUIRED_TEX)
    if(typeof q[name]!=='string'||!q[name].trim())return 'Missing '+name;
  if(REQUIRED_TEX.some(name=>/\b(?:TODO|TBD|FIXME|PLACEHOLDER)\b/i.test(q[name])))
    return 'A printable field still contains a placeholder';
  return '';
}
export function previewFamily(registration,key,{seed=2026,difficulty='secure'}={}){
  if(!validSeed(seed))throw new RangeError('Choose an integer seed between 1 and 999999999');
  if(!WORKSHOP_DIFFICULTIES.includes(difficulty))throw new RangeError('Unknown difficulty');
  const {topic}=registration,family=familyFrom(registration,key),rng=rngFromSeed(Number(seed));
  const q=family.type==='fluency'?family.create(rng):family.create(rng,difficulty,topic);
  const error=family.type==='fluency'?validateFluencyQuestion(q):validateWorksheetPreview(q);
  if(error)throw new Error(error);
  if(family.type==='fluency'&&q.family!==family.id)throw new Error('Generator family ID mismatch');
  return {
    key,type:family.type,id:family.id,topicId:topic.id,seed:Number(seed),difficulty,
    signature:q.signature,marks:q.marks,prompt:q.prompt||q.questionTex,
    hint:family.type==='fluency'?q.hint:q.hintTex,
    answerDisplay:family.type==='fluency'?answerText(q.answer):q.answerTex,
    steps:family.type==='fluency'?[...q.steps]:[q.solutionTex],
    misconception:family.type==='fluency'?q.mistake:'',
    answerKind:family.type==='fluency'?q.answer.kind:'print-only',
    answerLabel:family.type==='fluency'?q.answer.label:'Worksheet answer (teacher-reviewed)',
    question:q
  };
}
export function testPreviewAnswer(preview,value){
  if(preview?.type!=='fluency')return {correct:false,kind:'unsupported',
    message:'Printable worksheet answers are not automatically marked. Review the authored LaTeX solution.'};
  return checkFluencyAnswer(String(value??''),preview.question);
}
export function acceptedAnswerExamples(preview){
  if(preview?.type!=='fluency')return [];
  const answer=preview.question.answer,kind=answer.kind;
  const reference=isExactAnswerKind(kind)?exactAnswerSample(answer):answerText(answer);
  const candidates=[{value:reference,label:'Authored reference answer'}];
  if(kind==='rational'){
    const {numerator:n,denominator:d}=answer.value;
    candidates.push({value:String(n*2)+'/'+String(d*2),label:'Equivalent fraction'});
  }else if(kind==='number'){
    const value=answer.values[0];
    if(Number.isSafeInteger(value)&&Math.abs(value)<=100000)
      candidates.push({value:String(value*2)+'/2'+(answer.unit==='%'?'%':''),label:'Equivalent numerical form'});
  }else if(kind==='unordered'&&answer.values.length>1){
    candidates.push({value:[...answer.values].reverse().join(', '),label:'Reversed answer order'});
  }else if(kind==='expression'){
    candidates.push({value:'('+answer.value.latex+')+0',label:'Equivalent polynomial form'});
  }else if(kind==='equation'){
    const parts=answer.value.latex.split('=');
    if(parts.length===2)candidates.push({
      value:'2*('+parts[0]+')=2*('+parts[1]+')',label:'Equivalent equation'
    });
  }
  const seen=new Set(),results=[];
  for(const candidate of candidates){
    if(candidate.value==null||seen.has(candidate.value))continue;
    seen.add(candidate.value);
    if(testPreviewAnswer(preview,candidate.value).correct)results.push(candidate);
  }
  return results;
}
function stable(a,b){return JSON.stringify(a)===JSON.stringify(b);}
export function auditWorksheetFamily(registration,key,{startSeed=1,count=48}={}){
  if(!validSeed(startSeed)||!Number.isSafeInteger(count)||count<1||count>128||
    startSeed+count-1>MAX_SEED)throw new RangeError('Invalid worksheet audit seed range');
  const {id,type,create}=familyFrom(registration,key);
  if(type!=='worksheet')throw new TypeError('Expected a worksheet family');
  const errors=[],warnings=[],seen=new Set();
  let tested=0;
  for(const difficulty of WORKSHOP_DIFFICULTIES){
    for(let offset=0;offset<count;offset++){
      const seed=startSeed+offset;
      if(errors.length>=16)break;
      try{
        const make=()=>create(rngFromSeed(seed),difficulty,registration.topic),q=make();
        tested++;
        if(!stable(q,make()))throw new Error('Question is not reproducible');
        const issue=validateWorksheetPreview(q);
        if(issue)throw new Error(issue);
        seen.add(difficulty+':'+q.signature);
      }catch(error){errors.push(difficulty+' / seed '+seed+': '+error.message);}
    }
  }
  if(seen.size<Math.min(6,Math.floor(tested/4)))
    warnings.push('Low variation; review repetitive question parameters');
  warnings.push('Printable answers and solution mathematics require teacher review');
  return {familyId:id,type,tested,distinct:seen.size,errors,warnings,passed:errors.length===0};
}
export function auditFamily(registration,key,{startSeed=1,count=48}={}){
  if(!validSeed(startSeed)||!Number.isSafeInteger(count)||count<1||count>128||
     startSeed+count-1>MAX_SEED)throw new RangeError('Invalid audit seed range');
  const family=familyFrom(registration,key);
  if(family.type==='worksheet')return auditWorksheetFamily(registration,key,{startSeed,count});
  const report=auditFluencyGenerator(family.create,{familyId:family.id,startSeed,count});
  return {...report,type:'fluency'};
}
export function auditTopicFamilies(registration,{startSeed=1,count=48}={}){
  const families=catalogueFor(registration),results=families.map(f=>({
    key:f.key,label:f.label,skill:f.skill,...auditFamily(registration,f.key,{startSeed,count})
  }));
  return {
    schemaVersion:1,topicId:registration.topic.id,title:registration.topic.title,
    authoringStatus:registration.topic.authoring?.status||'legacy',
    startSeed,count,results,
    summary:{families:results.length,passed:results.filter(r=>r.passed).length,
      failed:results.filter(r=>!r.passed).length,
      warnings:results.reduce((sum,r)=>sum+r.warnings.length,0)},
    limitation:'Sampled, deterministic and reference-answer tests do not prove mathematical correctness. Teacher review and independent oracles remain necessary.'
  };
}
