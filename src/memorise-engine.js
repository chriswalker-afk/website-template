// Reusable, dependency-free revision progress and answer verification.
// All progress is per-topic and local to the current browser unless exported by a future feature.
// Intervals are simple configurable review prompts, NOT claims of measured long-term mastery.
export const MEMORY_VERSION=1;
export const DAY_MS=86400000;
const MAX_ATTEMPTS=100000;
const GRADES=new Set(['again','nearly','know']);
const SOURCES=new Set(['flashcards','match-up','missing-words','speed-recall']);
const validCount=value=>Number.isSafeInteger(value)&&value>=0&&value<=MAX_ATTEMPTS?value:0;
const validTime=value=>Number.isSafeInteger(value)&&value>=0&&value<=8640000000000000?value:0;
const cardRecord=()=>({
  attempts:0,correct:0,streak:0,lapses:0,dueAt:0,lastReviewed:0,
  lastGrade:null,lastSource:null,flagged:false
});
export function emptyMemory(){return {version:MEMORY_VERSION,cards:{}};}
export function hydrateMemory(raw,topic){
  const clean=emptyMemory();
  let data;
  try{data=typeof raw==='string'?JSON.parse(raw):raw;}catch{return clean;}
  if(!data||typeof data!=='object'||Array.isArray(data)||data.version!==MEMORY_VERSION||
     !data.cards||typeof data.cards!=='object'||Array.isArray(data.cards))return clean;
  for(const card of topic.cards){
    const item=Object.prototype.hasOwnProperty.call(data.cards,card.id)?data.cards[card.id]:null;
    if(!item||typeof item!=='object'||Array.isArray(item))continue;
    const entry=cardRecord();
    entry.attempts=validCount(item.attempts);
    entry.correct=Math.min(entry.attempts,validCount(item.correct));
    entry.streak=Math.min(100,validCount(item.streak));
    entry.lapses=validCount(item.lapses);
    entry.dueAt=validTime(item.dueAt);
    entry.lastReviewed=validTime(item.lastReviewed);
    entry.lastGrade=GRADES.has(item.lastGrade)?item.lastGrade:null;
    entry.lastSource=SOURCES.has(item.lastSource)?item.lastSource:null;
    entry.flagged=item.flagged===true;
    // Never treat incompatible/half-corrupt records as evidence of review.
    if(entry.attempts===0){
      entry.correct=0;entry.streak=0;entry.lapses=0;entry.dueAt=0;
      entry.lastReviewed=0;entry.lastGrade=null;entry.lastSource=null;
    }
    clean.cards[card.id]=entry;
  }
  return clean;
}
export function recordFor(memory,id){return memory.cards[id]||cardRecord();}
export function gradeCard(memory,topic,cardId,grade,source,now=Date.now(),objective=false){
  if(!topic.cards.some(c=>c.id===cardId))throw new Error('Unknown card ID');
  if(!GRADES.has(grade)||!SOURCES.has(source))throw new Error('Invalid review grade/source');
  if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid review time');
  const previous=recordFor(memory,cardId);
  const streak=grade==='know'?Math.min(previous.streak+1,100):0;
  const days=grade==='again'?0:grade==='nearly'?1:
    [3,7,14,30][Math.min(streak-1,3)];
  const next={
    ...previous,
    attempts:Math.min(previous.attempts+1,MAX_ATTEMPTS),
    correct:Math.min(previous.correct+(objective&&grade!=='again'?1:0),MAX_ATTEMPTS),
    streak,
    lapses:Math.min(previous.lapses+(grade==='again'?1:0),MAX_ATTEMPTS),
    dueAt:now+days*DAY_MS,
    lastReviewed:now,lastGrade:grade,lastSource:source
  };
  return {version:MEMORY_VERSION,cards:{...memory.cards,[cardId]:next}};
}
export function toggleCardFlag(memory,topic,cardId){
  if(!topic.cards.some(c=>c.id===cardId))throw new Error('Unknown card ID');
  const previous=recordFor(memory,cardId);
  return {version:MEMORY_VERSION,cards:{
    ...memory.cards,[cardId]:{...previous,flagged:!previous.flagged}
  }};
}
export function cardStatus(memory,id,now=Date.now()){
  const c=recordFor(memory,id);
  if(c.flagged)return 'Flagged';
  if(c.attempts===0)return 'New';
  if(c.dueAt<=now)return 'Due now';
  if(c.lastGrade==='nearly')return 'Practising';
  if(c.streak>=2)return 'Building confidence';
  return 'Scheduled';
}
export function progressSummary(topic,memory,now=Date.now()){
  const records=topic.cards.map(c=>recordFor(memory,c.id));
  return {
    total:topic.cards.length,
    new:records.filter(c=>c.attempts===0).length,
    due:records.filter(c=>c.attempts>0&&c.dueAt<=now).length,
    flagged:records.filter(c=>c.flagged).length,
    confident:records.filter(c=>c.streak>=2&&c.dueAt>now).length,
    attempts:records.reduce((a,c)=>a+c.attempts,0),
    objectiveCorrect:records.reduce((a,c)=>a+c.correct,0)
  };
}
export function deckQueue(topic,memory,mode='all',now=Date.now()){
  if(!['all','focus','due'].includes(mode))throw new Error('Unknown deck filter');
  if(mode==='all')return topic.cards.map(c=>c.id);
  const priority=card=>{
    const c=recordFor(memory,card.id);
    if(c.flagged)return 0;
    if(c.attempts>0&&c.dueAt<=now)return 1;
    if(c.lastGrade==='again')return 2;
    if(c.lastGrade==='nearly')return 3;
    if(c.attempts===0)return 4;
    return 5;
  };
  return topic.cards.filter(card=>{
    const c=recordFor(memory,card.id);
    return mode==='due'?
      c.attempts>0&&c.dueAt<=now:
      c.flagged||c.attempts===0||c.dueAt<=now||['again','nearly'].includes(c.lastGrade);
  }).sort((a,b)=>priority(a)-priority(b)).map(c=>c.id);
}
export function matchRoundCards(topic,round=0,count=4){
  if(!Number.isSafeInteger(round)||round<0)throw new Error('Invalid match round');
  const size=Math.max(2,Math.min(count,topic.cards.length));
  const total=Math.ceil(topic.cards.length/size);
  const offset=(round%total)*size;
  return topic.cards.slice(offset,offset+size);
}
export function normaliseTerm(value){
  return String(value??'').normalize('NFKC').toLowerCase().trim()
    .replace(/[’‘]/g,"'").replace(/[−–—]/g,'-')
    .replace(/\s*-\s*/g,'-')
    .replace(/\s+/g,' ');
}
function editDistanceAtMostOne(a,b){
  if(Math.abs(a.length-b.length)>1)return false;
  if(a===b)return true;
  let i=0,j=0,changes=0;
  while(i<a.length&&j<b.length){
    if(a[i]===b[j]){i++;j++;continue;}
    if(++changes>1)return false;
    if(a.length>=b.length)i++;
    if(b.length>=a.length)j++;
  }
  return changes+Math.max(a.length-i,b.length-j)<=1;
}
export function assessTerm(input,answer,aliases=[],otherAccepted=[]){
  const value=normaliseTerm(input);
  if(!value)return {correct:false,kind:'blank',grade:'again'};
  const valid=[answer,...aliases].map(normaliseTerm).filter(Boolean);
  if(valid.includes(value))return {correct:true,kind:value===valid[0]?'exact':'alias',grade:'know'};
  // One-character spelling errors on long terms may be accepted as *nearly*,
  // only when they cannot be another vocabulary term in the deck.
  const nearby=valid.some(word=>word.length>=8&&value.length>=7&&editDistanceAtMostOne(value,word));
  const ambiguous=otherAccepted.map(normaliseTerm).some(word=>
    word&&editDistanceAtMostOne(value,word));
  if(nearby&&!ambiguous)return {correct:true,kind:'typo',grade:'nearly'};
  return {correct:false,kind:'incorrect',grade:'again'};
}
export function validateMemoriseContent(topic){
  const errors=[];
  const cards=new Map(topic.cards.map(c=>[c.id,c]));
  const ids=new Set();
  for(const item of topic.clozes||[]){
    if(!item.id||ids.has(item.id)||!cards.has(item.cardId))errors.push('Invalid cloze ID or card link');
    ids.add(item.id);
    if(typeof item.before!=='string'||typeof item.after!=='string'||
       !item.answer||!item.hint)errors.push('Incomplete cloze prompt '+item.id);
    if(normaliseTerm(item.answer)===normaliseTerm(item.hint))
      errors.push('Hint reveals answer directly '+item.id);
    if(item.aliases&&(!Array.isArray(item.aliases)||item.aliases.some(a=>typeof a!=='string'||!a.trim())))
      errors.push('Invalid cloze aliases '+item.id);
  }
  if(!Array.isArray(topic.clozes)||topic.clozes.length<Math.min(6,topic.cards.length))
    errors.push('Missing multi-question cloze bank');
  if(new Set(topic.cards.map(c=>c.id)).size!==topic.cards.length)
    errors.push('Duplicate flashcard IDs');
  return errors;
}
