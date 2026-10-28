import {REASONING_CHAPTERS,REASONING_MODES} from './reasoning-content.js';

// Pure functions. No free-text input is graded, uploaded or stored.
export const REASONING_VERSION=1;
export const REASONING_RATINGS=Object.freeze(['revisit','developing','ready']);
export const REASONING_NOTE_LIMIT=2500;

export function tasksFor(topicId,mode){
  return REASONING_CHAPTERS[topicId]?.find(s=>s.id===mode)?.pages?.[0]?.tasks||[];
}
export function taskFor(topicId,mode,id){
  return tasksFor(topicId,mode).find(task=>task.id===id);
}
export function emptyReasoningProgress(){
  return {version:REASONING_VERSION,records:{}};
}
const keyFor=(mode,id)=>mode+':'+id;
function finiteWhole(value,max){
  return Number.isSafeInteger(value)&&value>=0&&value<=max?value:0;
}
export function hydrateReasoningProgress(raw,topicId){
  let parsed;
  try{parsed=typeof raw==='string'?JSON.parse(raw):raw;}catch{return emptyReasoningProgress();}
  if(!parsed||parsed.version!==REASONING_VERSION||!parsed.records||
    typeof parsed.records!=='object'||Array.isArray(parsed.records))return emptyReasoningProgress();
  const safe=emptyReasoningProgress();
  for(const mode of REASONING_MODES){
    for(const task of tasksFor(topicId,mode)){
      const key=keyFor(mode,task.id);
      if(!Object.prototype.hasOwnProperty.call(parsed.records,key))continue;
      const r=parsed.records[key];
      if(!r||!REASONING_RATINGS.includes(r.rating)||typeof r.attempted!=='boolean'||
        typeof r.assisted!=='boolean'||typeof r.modelFirst!=='boolean')continue;
      const checked=finiteWhole(r.checked,task.criteria.length);
      const reviews=finiteWhole(r.reviews,100000);
      const reviewedAt=finiteWhole(r.reviewedAt,9999999999999);
      if((r.rating!=='revisit'&&!r.attempted)||
        (r.rating==='ready'&&checked!==task.criteria.length))continue;
      safe.records[key]={rating:r.rating,checked,attempted:r.attempted,
        assisted:r.assisted,modelFirst:r.modelFirst,reviews,reviewedAt};
    }
  }
  return safe;
}
export function recordFor(progress,mode,id){
  return progress?.records?.[keyFor(mode,id)]||null;
}
export function reviewReasoning(progress,topicId,mode,taskId,review,now=Date.now()){
  const task=taskFor(topicId,mode,taskId);
  if(!task)throw Error('Unknown reasoning task');
  if(!review||!REASONING_RATINGS.includes(review.rating)||
     !Number.isSafeInteger(review.checked)||review.checked<0||
     review.checked>task.criteria.length||
     typeof review.attempted!=='boolean'||typeof review.assisted!=='boolean'||
     typeof review.modelFirst!=='boolean')throw Error('Invalid reasoning self-review');
  if(review.rating!=='revisit'&&!review.attempted)
    throw Error('Write an explanation before rating it as developing or ready');
  if(review.rating==='ready'&&review.checked!==task.criteria.length)
    throw Error('Check every success criterion before marking ready');
  if(!Number.isSafeInteger(now)||now<0||now>9999999999999)throw Error('Invalid review time');
  const key=keyFor(mode,taskId),previous=recordFor(progress,mode,taskId);
  return {version:REASONING_VERSION,records:{...progress.records,
    [key]:{rating:review.rating,checked:review.checked,attempted:review.attempted,
      assisted:review.assisted,modelFirst:review.modelFirst,
      reviews:Math.min(100000,(previous?.reviews||0)+1),reviewedAt:now}}};
}
export function reasoningSummary(topicId,mode,progress){
  const tasks=tasksFor(topicId,mode),summary={total:tasks.length,new:0,
    reviewed:0,revisit:0,developing:0,ready:0};
  for(const task of tasks){
    const r=recordFor(progress,mode,task.id);
    if(!r)summary.new++;
    else{
      summary.reviewed++;
      summary[r.rating]++;
    }
  }
  return summary;
}
export function queueReasoning(topicId,mode,progress,selection='all'){
  const tasks=tasksFor(topicId,mode);
  if(selection==='all')return tasks.map(t=>t.id);
  if(selection!=='focus')throw Error('Unknown reasoning practice selection');
  const rank=task=>{
    const rating=recordFor(progress,mode,task.id)?.rating;
    return rating==='revisit'?0:rating==='developing'?1:!rating?2:3;
  };
  return [...tasks].filter(t=>rank(t)<3).sort((a,b)=>rank(a)-rank(b))
    .map(task=>task.id);
}
export function validateReasoningContent(chapters=REASONING_CHAPTERS){
  const errors=[];
  for(const [topicId,sections] of Object.entries(chapters)){
    if(!Array.isArray(sections)||sections.length!==4){
      errors.push(topicId+': expected four distinct reasoning subsections');
      continue;
    }
    if(sections.map(s=>s.id).join(',')!==REASONING_MODES.join(','))
      errors.push(topicId+': incorrect reasoning subsection order');
    const allIds=new Set(),allPrompts=new Set();
    for(const section of sections){
      if(!section.label||!section.description||section.description.trim().length<25)
        errors.push(topicId+': missing subsection title or explanation');
      if(section.pages?.length!==1||section.pages[0]?.id!=='main'||
         section.pages[0]?.type!=='reasoning'){
        errors.push(topicId+': activity subsection must contain one reasoning page');
        continue;
      }
      if(!Array.isArray(section.pages[0].tasks)||section.pages[0].tasks.length<4)
        errors.push(topicId+'/'+section.id+': insufficient independent reasoning prompts');
      for(const t of section.pages[0].tasks||[]){
        const k=section.id+':'+t.id;
        if(!/^[a-z][a-z0-9-]*$/.test(t.id)||allIds.has(k)||
          typeof t.prompt!=='string'||t.prompt.trim().length<60||
          allPrompts.has(t.prompt))errors.push(topicId+': invalid/duplicate prompt '+k);
        allIds.add(k);allPrompts.add(t.prompt);
        if(!t.hint||t.hint.length<25||!t.starter||t.starter.length<20||
           !t.reflection||t.reflection.length<25)
          errors.push(topicId+': incomplete guided review '+k);
        if(!Array.isArray(t.model)||t.model.length<3||
          t.model.some(line=>typeof line!=='string'||line.length<50))
          errors.push(topicId+': incomplete mathematical model '+k);
        if(!Array.isArray(t.criteria)||t.criteria.length!==3||
          new Set(t.criteria.map(c=>c.id)).size!==3||
          t.criteria.some(c=>!c.label||c.label.length<24||!c.next||c.next.length<24))
          errors.push(topicId+': incomplete review criteria '+k);
      }
    }
  }
  return errors;
}
