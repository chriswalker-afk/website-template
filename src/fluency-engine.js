import {FLUENCY_LEVELS} from './fluency-levels.js';
import {int} from './topic-packs/builders/fluency-question.js';
import {fluencyFamiliesFor} from './question-bank.js';
import {TOPIC_PACKS} from './topic-packs/registry.js';
// Reusable, deterministic Fluency question generator and strict response verifier.
// No DOM, network, eval, AI grading or external dependencies. Questions carry their
// own numerical answer contract and fully authored, parameter-derived working.
export const FLUENCY_VERSION=1;
export const PRACTICE_LENGTHS=Object.freeze([6,10]);
export const FLUENCY_CHAPTERS=Object.freeze(Object.fromEntries(TOPIC_PACKS.filter(topic=>topic.chapters?.fluency?.length).map(topic=>[topic.id,topic.chapters.fluency])));

const FAMILIES=Object.freeze(Object.fromEntries(TOPIC_PACKS.map(topic=>[topic.id,fluencyFamiliesFor(topic.id)])));
export function fluencyFamilyIds(topicId,levelId,pageId){
  const section=FLUENCY_CHAPTERS[topicId]?.find(s=>s.id===levelId);
  return section?.pages.find(p=>p.id===pageId)?.families||[];
}
export function rngFromSeed(seed){
  if(!Number.isSafeInteger(seed)||seed<1||seed>999999999)throw Error('Seed must be an integer between 1 and 999999999');
  let state=seed>>>0;
  return ()=>{
    state=(state+0x6D2B79F5)>>>0;
    let v=state;
    v=Math.imul(v^(v>>>15),v|1);
    v^=v+Math.imul(v^(v>>>7),v|61);
    return ((v^(v>>>14))>>>0)/4294967296;
  };
}
function shuffle(rng,input){
  const a=[...input];
  for(let i=a.length-1;i>0;i--){const j=int(rng,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;
}
export function makeFluencyQuestion(topicId,familyId,rng){
  const make=FAMILIES[topicId]?.[familyId];
  if(!make)throw Error('Unknown Fluency question family');
  const q=make(rng);
  const error=validateFluencyQuestion(q);
  if(error)throw Error('Invalid generated Fluency question: '+error);
  return q;
}
export function buildFluencySet({topicId,levelId,pageId,seed,count=6}){
  const families=fluencyFamilyIds(topicId,levelId,pageId);
  if(!families.length)throw Error('Unknown Fluency page');
  if(!PRACTICE_LENGTHS.includes(count))throw Error('Choose 6 or 10 questions');
  const rng=rngFromSeed(seed),order=shuffle(rng,families),seen=new Set(),questions=[];
  for(let attempt=0;attempt<count*100&&questions.length<count;attempt++){
    const family=order[attempt%order.length],q=makeFluencyQuestion(topicId,family,rng);
    if(seen.has(q.signature))continue;
    seen.add(q.signature);
    questions.push({...q,id:'q'+(questions.length+1)});
  }
  if(questions.length!==count)throw Error('Not enough distinct questions for this practice set.');
  return {topicId,levelId,pageId,seed,count,questions};
}
function parseNumber(raw){
  const token=String(raw??'').trim().replace(/[−–—]/g,'-').replace(/^\+/, '');
  if(/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)){
    const n=Number(token);return Number.isFinite(n)?n:null;
  }
  const match=token.match(/^(-?\d+)\/([1-9]\d*)$/);
  if(match){const n=Number(match[1])/Number(match[2]);return Number.isFinite(n)?n:null;}
  return null;
}
function parseValues(raw,answer){
  const trimmed=String(raw??'').trim();
  if(!trimmed||trimmed.length>200)return null;
  const {kind,unit}=answer;
  if(kind==='number'){
    const cleaned=trimmed.replace(/[−–—]/g,'-').replace(unit==='%'?/\s*%\s*$/:/\u0000/, '');
    const value=parseNumber(cleaned);return value===null?null:[value];
  }
  let text=trimmed.replace(/[−–—]/g,'-').trim();
  text=text.replace(/^\(\s*([^()]*)\s*\)$/,'$1');
  const tokens=text.split(/\s*(?:,|;|\bor\b|\band\b)\s*/i);
  if(tokens.length!==answer.values.length)return null;
  const values=tokens.map(part=>parseNumber(part.replace(/^(?:x|[abc]|group\s*[abc])\s*=\s*/i,'')));
  return values.some(v=>v===null)?null:values;
}
export function answerText(answer){
  const display=x=>answer.precision?Number(x).toFixed(2):fmt(x);
  if(answer.kind==='number')return display(answer.values[0])+(answer.unit||'');
  return answer.values.map(display).join(', ');
}
export function checkFluencyAnswer(raw,q){
  const values=parseValues(raw,q.answer),expected=q.answer.values;
  if(!values)return {correct:false,kind:'format',message:'Use the requested numerical answer format. '+q.answer.label};
  const tolerance=q.answer.precision||1e-9;
  const a=q.answer.kind==='unordered'?[...values].sort((x,y)=>x-y):values;
  const b=q.answer.kind==='unordered'?[...expected].sort((x,y)=>x-y):expected;
  const correct=a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<=tolerance);
  return {correct,kind:correct?'correct':'value',
    message:correct?'Correct — your answer matches the generated solution.':
      'Not quite. '+q.mistake};
}
export function validateFluencyQuestion(q){
  if(!q||typeof q.prompt!=='string'||!q.prompt||!q.signature||!q.family||!q.hint||!q.mistake)return 'Missing prompt/feedback';
  if(!Number.isInteger(q.marks)||q.marks<1||q.marks>8)return 'Invalid mark total';
  if(!Array.isArray(q.steps)||q.steps.length<2||q.steps.some(s=>typeof s!=='string'||!s.trim()))return 'Incomplete working';
  if(!['number','ordered','unordered'].includes(q.answer?.kind)||
    !Array.isArray(q.answer.values)||!q.answer.values.length||
    q.answer.values.some(x=>!Number.isFinite(x)))return 'Invalid numerical answer';
  return '';
}
export function validateFluencyChapters(chapters=FLUENCY_CHAPTERS,families=FAMILIES){
  const errors=[];
  for(const [topic,sections] of Object.entries(chapters)){
    if(!families[topic]||!Array.isArray(sections)||sections.length!==4)
      errors.push(topic+': four Fluency levels required');
    for(const [index,section] of (sections||[]).entries()){
      if(section.id!==FLUENCY_LEVELS[index]?.id||
        section.label!=='Level '+(index+1)+': '+FLUENCY_LEVELS[index]?.name||
        !section.description||
        !Array.isArray(section.pages)||!section.pages.length)errors.push(topic+': invalid Fluency level');
      const pageIds=new Set();
      for(const page of section.pages||[]){
        if(pageIds.has(page.id)||page.type!=='fluency'||!page.focus||!page.families?.length||
          page.families.some(f=>!families[topic]?.[f]))errors.push(topic+': invalid Fluency practice page');
        pageIds.add(page.id);
      }
    }
  }
  return errors;
}
export function fluencySkillIds(topicId){
  return [...new Set((FLUENCY_CHAPTERS[topicId]||[]).flatMap(s=>s.pages.flatMap(p=>p.families)))];
}
