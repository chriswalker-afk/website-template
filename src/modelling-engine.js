// Pure modelling validation, session-independent progress and transparent self-review.
// NEVER persist free-text answers, written working, assumptions or drafts.
import {MODELLING_CHAPTERS,MODELLING_PHASES} from './modelling-content.js';
export const MODELLING_VERSION=1;
export const MODELLING_RATINGS=Object.freeze(['retry','supported','independent']);
export const MODEL_DRAFT_LIMIT=2500;
export const MODEL_PHASE_IDS=Object.freeze(MODELLING_PHASES.map(p=>p[0]));
const validID=x=>typeof x==='string'&&/^[a-z][a-z0-9-]*$/.test(x);
const int=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
export const modellingLevels=topicId=>MODELLING_CHAPTERS[topicId]||[];
export const modellingPages=(topicId,levelId)=>modellingLevels(topicId).find(l=>l.id===levelId)?.pages||[];
export const modellingTasks=(topicId,levelId,pageId)=>
  modellingPages(topicId,levelId).find(p=>p.id===pageId)?.tasks||[];
export const modellingTask=(topicId,levelId,pageId,taskId)=>
  modellingTasks(topicId,levelId,pageId).find(t=>t.id===taskId)||null;
export const modelKey=(level,page,task)=>[level,page,task].join(':');
export const emptyModellingProgress=()=>({version:MODELLING_VERSION,records:{}});
export function modellingRecord(progress,level,page,task){
  const key=modelKey(level,page,task),records=progress?.records;
  return records&&Object.prototype.hasOwnProperty.call(records,key)?records[key]:null;
}
export function hydrateModellingProgress(raw,topicId){
  let data;
  try{data=typeof raw==='string'?JSON.parse(raw):raw;}catch{return emptyModellingProgress();}
  const progress=emptyModellingProgress();
  if(!data||data.version!==MODELLING_VERSION||!data.records||
     typeof data.records!=='object'||Array.isArray(data.records))return progress;
  for(const level of modellingLevels(topicId))for(const page of level.pages)for(const t of page.tasks){
    const key=modelKey(level.id,page.id,t.id);
    if(!Object.prototype.hasOwnProperty.call(data.records,key))continue;
    const r=data.records[key];
    if(!r||!MODELLING_RATINGS.includes(r.rating)||
       typeof r.attempted!=='boolean'||typeof r.assisted!=='boolean'||
       typeof r.modelFirst!=='boolean'||!int(r.checked,3)||
       !int(r.reviews,100000)||!int(r.reviewedAt,9999999999999))continue;
    if(r.rating!=='retry'&&(!r.attempted||r.checked!==3))continue;
    if(r.rating==='independent'&&(r.assisted||r.modelFirst))continue;
    progress.records[key]={rating:r.rating,attempted:r.attempted,
      assisted:r.assisted,modelFirst:r.modelFirst,checked:r.checked,
      reviews:r.reviews,reviewedAt:r.reviewedAt};
  }
  return progress;
}
export function blankModellingEntry(){
  return {drafts:Object.fromEntries(MODEL_PHASE_IDS.map(p=>[p,''])),
    hints:Object.fromEntries(MODEL_PHASE_IDS.map(p=>[p,false])),
    examples:Object.fromEntries(MODEL_PHASE_IDS.map(p=>[p,false])),
    assisted:false,modelFirst:false,checked:[false,false,false],rating:null,
    compared:false};
}
export function attemptedModelling(entry){
  // Students may confirm mathematical working in the shared investigation
  // notebook at each stage instead of duplicating it in plain text.
  // This is evidence of an attempt for SELF-review, never a mark.
  return Boolean(entry?.drafts&&MODEL_PHASE_IDS.every(id=>
    (typeof entry.drafts[id]==='string'&&entry.drafts[id].trim().length>=20)||
      entry?.notebookStages?.[id]===true));
}
export function canSelfRateModel(entry,rating){
  if(!entry?.compared||!MODELLING_RATINGS.includes(rating)||entry.rating)return false;
  if(rating==='retry')return true;
  if(!attemptedModelling(entry)||!Array.isArray(entry.checked)||
     entry.checked.length!==3||!entry.checked.every(Boolean))return false;
  if(rating==='supported')return true;
  return !entry.assisted&&!entry.modelFirst;
}
export function saveModelReview(progress,topic,level,page,id,entry,rating,now=Date.now()){
  if(!modellingTask(topic,level,page,id))throw Error('Unknown modelling task');
  if(!canSelfRateModel(entry,rating))throw Error('Modelling self-review requirements not met');
  if(!int(now,9999999999999))throw Error('Invalid modelling review time');
  const key=modelKey(level,page,id),prior=modellingRecord(progress,level,page,id);
  return {version:MODELLING_VERSION,records:{...progress.records,
    [key]:{rating,attempted:attemptedModelling(entry),
      assisted:Boolean(entry.assisted),modelFirst:Boolean(entry.modelFirst),
      checked:entry.checked.filter(Boolean).length,
      reviews:Math.min(100000,(prior?.reviews||0)+1),reviewedAt:now}}};
}
const rank=r=>r?.rating==='retry'?0:r?.rating==='supported'?1:!r?2:3;
export function queueModelling(topic,level,page,progress,selection='all'){
  const tasks=modellingTasks(topic,level,page);
  if(selection==='all')return tasks.map(x=>x.id);
  if(selection!=='focus')throw Error('Unknown modelling practice selection');
  return [...tasks].filter(t=>rank(modellingRecord(progress,level,page,t.id))<3)
    .sort((a,b)=>rank(modellingRecord(progress,level,page,a.id))-
      rank(modellingRecord(progress,level,page,b.id))).map(t=>t.id);
}
export function modellingLevelSummary(topic,level,progress){
  const s={total:0,new:0,retry:0,supported:0,independent:0};
  for(const page of modellingPages(topic,level))for(const task of page.tasks){
    s.total++;s[modellingRecord(progress,level,page.id,task.id)?.rating||'new']++;
  }
  return s;
}
export function validateModellingChapters(chapters=MODELLING_CHAPTERS){
  const issues=[];
  for(const [topic,levels] of Object.entries(chapters)){
    if(!Array.isArray(levels)||levels.length!==4){issues.push(topic+': expected four levels');continue;}
    if(levels.map(x=>x.id).join(',')!=='level-1,level-2,level-3,level-4')
      issues.push(topic+': wrong level order');
    const promptSet=new Set();
    for(const level of levels){
      if(!level.label||!level.description||level.description.length<35||
         !Array.isArray(level.pages)||level.pages.length!==2)
        issues.push(topic+'/'+level.id+': invalid level pages');
      const ids=new Set();
      for(const page of level.pages||[]){
        if(!validID(page.id)||ids.has(page.id)||page.type!=='modelling'||
           !Array.isArray(page.tasks)||page.tasks.length!==2)
          issues.push(topic+'/'+level.id+': invalid page '+page.id);
        ids.add(page.id);
        const tasks=new Set();
        for(const t of page.tasks||[]){
          const label=topic+'/'+level.id+'/'+page.id+'/'+t.id;
          if(!validID(t.id)||tasks.has(t.id)||!t.scenario||t.scenario.length<85||
             promptSet.has(t.scenario))issues.push(label+': invalid or repeated scenario');
          promptSet.add(t.scenario);tasks.add(t.id);
          if(!Array.isArray(t.phases)||t.phases.length!==4||
             t.phases.map(p=>p.id).join(',')!==MODEL_PHASE_IDS.join(',')){
            issues.push(label+': missing modelling phases');continue;
          }
          for(const p of t.phases){
            if(!p.label||!p.prompt||p.prompt.length<35||
               !p.nudge||p.nudge.length<30||!p.model||p.model.length<65)
              issues.push(label+': incomplete '+p.id+' guidance/model');
          }
          if(!Array.isArray(t.checks)||t.checks.length!==3||
             t.checks.some(c=>typeof c!=='string'||c.length<30))
            issues.push(label+': missing specific review checks');
        }
      }
    }
  }
  return issues;
}
