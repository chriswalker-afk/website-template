// Topic-owned content contracts; intentionally independent of the app and
// Fluency engine to avoid an import cycle through the topic registry.
import {isExactAnswerKind,validateExactAnswer,checkExactAnswer,exactAnswerSample}
  from '../question-foundation/verification.js';
const SLUG=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const gameTextKey=value=>String(value??'').trim().toLocaleLowerCase('en-GB')
  .replace(/[−–—]/g,'-').replace(/\s+/g,' ');
const isNumeric=kind=>['number','ordered','unordered'].includes(kind);
export function numericalGamePair(id,question,value,{level='core',cue}={}){
  if(!Number.isFinite(value))throw new TypeError('A finite mathematical answer is required');
  const display=Object.is(value,-0)?'0':String(value);
  return {id,question,answerDisplay:display,
    answer:{kind:'number',values:[value],label:'Enter the numerical answer.'},
    level,...(cue?{cue}:{})};
}
export function vocabularyGamePairs(cards){
  if(!Array.isArray(cards))throw new TypeError('Expected an authored vocabulary deck');
  return cards.map(card=>({
    id:card.id,
    question:'Which mathematical term matches this definition? '+card.definition,
    answerDisplay:card.term,
    answer:{kind:'text',value:card.term,accepted:[card.term,...(card.aliases||[])]},
    level:'core'
  }));
}
function displayNumeric(answer){
  if(answer.kind==='number')return String(answer.values[0]);
  return (answer.values||[]).join(', ');
}
export function validateGamePairs(pairs){
  const errors=[];
  if(!Array.isArray(pairs)||pairs.length<8)
    return ['Provide at least eight reviewed game question–answer pairs.'];
  const ids=new Set(),answers=new Set();
  for(const [index,pair] of pairs.entries()){
    const place='Pair '+(index+1)+': ';
    if(!pair||typeof pair!=='object'){
      errors.push(place+'missing pair');continue;
    }
    if(!SLUG.test(pair.id||'')||ids.has(pair.id))errors.push(place+'invalid or duplicate ID');
    ids.add(pair.id);
    if(typeof pair.question!=='string'||!pair.question.trim()||pair.question.length>500)
      errors.push(place+'question must be 1–500 characters');
    if(typeof pair.answerDisplay!=='string'||!pair.answerDisplay.trim()||pair.answerDisplay.length>200)
      errors.push(place+'answerDisplay must be 1–200 characters');
    if(pair.level!==undefined&&!['core','challenge'].includes(pair.level))
      errors.push(place+'level must be core or challenge');
    const kind=pair.answer?.kind;
    if(kind==='text'){
      const accepted=pair.answer?.accepted||[pair.answer?.value];
      if(typeof pair.answer.value!=='string'||!pair.answer.value.trim()||
         !Array.isArray(accepted)||!accepted.length||
         accepted.some(v=>typeof v!=='string'||!v.trim())||
         !accepted.some(v=>gameTextKey(v)===gameTextKey(pair.answerDisplay)))
        errors.push(place+'text answer must include its displayed answer in accepted forms');
    }else if(isNumeric(kind)){
      const values=pair.answer.values;
      if(!Array.isArray(values)||!values.length||values.some(v=>!Number.isFinite(v))||
        (kind==='number'&&values.length!==1)||
        gameTextKey(pair.answerDisplay)!==gameTextKey(displayNumeric(pair.answer)))
        errors.push(place+'numerical reference answer is invalid');
    }else if(isExactAnswerKind(kind)){
      if(validateExactAnswer(pair.answer)||!checkExactAnswer(
        exactAnswerSample(pair.answer),pair.answer).correct)
        errors.push(place+'exact mathematical reference answer is invalid');
    }else errors.push(place+'unsupported answer type');
    const key=gameTextKey(pair.answerDisplay);
    if(answers.has(key))errors.push(place+'duplicate visible answer (loop cards need unique matches)');
    answers.add(key);
    if(pair.cue!==undefined&&(typeof pair.cue!=='string'||pair.cue.length>5))
      errors.push(place+'cue must have at most five characters');
  }
  // Different printed forms or synonyms can be the same mathematical answer.
  // Detect those collisions as well as the literal duplicate displays above.
  for(let i=0;i<pairs.length;i++)for(let j=i+1;j<pairs.length;j++){
    const a=pairs[i]?.answer,b=pairs[j]?.answer;
    if(!a||!b||a.kind!==b.kind)continue;
    let collision=false;
    if(a.kind==='text'){
      const termsA=(a.accepted||[a.value]).map(gameTextKey);
      const termsB=new Set((b.accepted||[b.value]).map(gameTextKey));
      collision=termsA.some(v=>termsB.has(v));
    }else if(isNumeric(a.kind)){
      const one=a.kind==='unordered'?[...a.values].sort((x,y)=>x-y):a.values;
      const two=b.kind==='unordered'?[...b.values].sort((x,y)=>x-y):b.values;
      collision=one.length===two.length&&one.every((v,k)=>v===two[k]);
    }else if(isExactAnswerKind(a.kind)&&!validateExactAnswer(a)&&!validateExactAnswer(b)){
      collision=checkExactAnswer(exactAnswerSample(a),b).correct;
    }
    if(collision)errors.push('Pairs '+(i+1)+' and '+(j+1)+
      ' have equivalent answers or overlapping aliases; the loop would be ambiguous.');
  }
  if(pairs.filter(p=>p?.level!=='challenge').length<8)
    errors.push('At least eight core-level pairs are needed to play without challenge items.');
  return errors;
}
