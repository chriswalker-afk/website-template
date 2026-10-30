// Pure problem-solving schema, prioritisation and honest self-report progress.
// Student plan/working strings are ephemeral session state, never persisted.
import {PROBLEM_SOLVING_CHAPTERS,PROBLEM_SOLVING_LEVELS} from './problem-solving-content.js';
export const PROBLEM_SOLVING_VERSION=1;
export const PROBLEM_SOLVING_RATINGS=Object.freeze(['retry','supported','independent']);
export const PROBLEM_SOLVING_PLAN_LIMIT=900;
export const PROBLEM_SOLVING_WORK_LIMIT=3500;
export function levelsFor(topicId){return PROBLEM_SOLVING_CHAPTERS[topicId]||[];}
export function pagesForLevel(topicId,levelId){
  return levelsFor(topicId).find(level=>level.id===levelId)?.pages||[];
}
export function problemsFor(topicId,levelId,pageId){
  return pagesForLevel(topicId,levelId).find(p=>p.id===pageId)?.tasks||[];
}
export function problemFor(topicId,levelId,pageId,id){
  return problemsFor(topicId,levelId,pageId).find(p=>p.id===id)||null;
}
export function taskKey(levelId,pageId,taskId){return [levelId,pageId,taskId].join(':');}
export function emptyProblemSolvingProgress(){return {version:PROBLEM_SOLVING_VERSION,records:{}};}
export function recordFor(progress,levelId,pageId,taskId){
  const key=taskKey(levelId,pageId,taskId);
  return Object.prototype.hasOwnProperty.call(progress?.records||{},key)?progress.records[key]:null;
}
const safeInt=(value,max)=>Number.isSafeInteger(value)&&value>=0&&value<=max?value:null;
export function hydrateProblemSolvingProgress(raw,topicId){
  let value;
  try{value=typeof raw==='string'?JSON.parse(raw):raw;}catch{return emptyProblemSolvingProgress();}
  const progress=emptyProblemSolvingProgress();
  if(!value||value.version!==PROBLEM_SOLVING_VERSION||!value.records||
     typeof value.records!=='object'||Array.isArray(value.records))return progress;
  for(const level of levelsFor(topicId))for(const page of level.pages)for(const task of page.tasks){
    const key=taskKey(level.id,page.id,task.id);
    if(!Object.prototype.hasOwnProperty.call(value.records,key))continue;
    const r=value.records[key];
    if(!r||!PROBLEM_SOLVING_RATINGS.includes(r.rating)||
       typeof r.attempted!=='boolean'||typeof r.assisted!=='boolean'||
       typeof r.modelFirst!=='boolean'||safeInt(r.checks,3)===null||
       safeInt(r.reviews,100000)===null||safeInt(r.reviewedAt,9999999999999)===null)continue;
    if(r.rating!=='retry'&&(!r.attempted||r.checks!==3))continue;
    if(r.rating==='independent'&&(r.assisted||r.modelFirst))continue;
    progress.records[key]={rating:r.rating,attempted:r.attempted,assisted:r.assisted,
      modelFirst:r.modelFirst,checks:r.checks,reviews:r.reviews,reviewedAt:r.reviewedAt};
  }
  return progress;
}
export function attemptedProblem(entry){
  // Notebook evidence must be explicitly confirmed by the student.
  // The caller must reject stale confirmations if the notebook was cleared.
  return Boolean((entry?.plan?.trim().length>=10||entry?.notebookPlan===true)&&
    (entry?.working?.trim().length>=20||entry?.notebookWorking===true));
}
export function canRateProblem(entry,kind){
  if(!PROBLEM_SOLVING_RATINGS.includes(kind)||!entry?.modelComplete||entry.rating)return false;
  if(kind==='retry')return true;
  if(!attemptedProblem(entry)||!Array.isArray(entry.checks)||
     entry.checks.length!==3||!entry.checks.every(Boolean))return false;
  if(kind==='supported')return true;
  return !entry.assisted&&!entry.modelFirst;
}
export function reviewProblem(progress,topicId,levelId,pageId,taskId,entry,rating,now=Date.now()){
  if(!problemFor(topicId,levelId,pageId,taskId))throw Error('Unknown Problem Solving task');
  if(!canRateProblem(entry,rating))throw Error('Self-review conditions not met');
  if(safeInt(now,9999999999999)===null)throw Error('Invalid review time');
  const checked=entry.checks.filter(Boolean).length;
  const key=taskKey(levelId,pageId,taskId),prior=recordFor(progress,levelId,pageId,taskId);
  return {version:PROBLEM_SOLVING_VERSION,records:{...progress.records,
    [key]:{
      rating,attempted:attemptedProblem(entry),checks:checked,
      assisted:Boolean(entry.assisted),modelFirst:Boolean(entry.modelFirst),
      reviews:Math.min(100000,(prior?.reviews||0)+1),reviewedAt:now
    }}};
}
const priority=record=>record?.rating==='retry'?0:
  record?.rating==='supported'?1:!record?2:3;
export function queueProblems(topicId,levelId,pageId,progress,selection='all'){
  const tasks=problemsFor(topicId,levelId,pageId);
  if(selection==='all')return tasks.map(t=>t.id);
  if(selection!=='focus')throw Error('Invalid problem selection');
  return [...tasks].filter(t=>priority(recordFor(progress,levelId,pageId,t.id))<3)
    .sort((a,b)=>priority(recordFor(progress,levelId,pageId,a.id))-
      priority(recordFor(progress,levelId,pageId,b.id))).map(t=>t.id);
}
export function summaryForLevel(topicId,levelId,progress){
  const counts={total:0,new:0,retry:0,supported:0,independent:0};
  for(const page of pagesForLevel(topicId,levelId))for(const problem of page.tasks){
    counts.total++;
    const r=recordFor(progress,levelId,page.id,problem.id);
    counts[r?.rating||'new']++;
  }
  return counts;
}
export function validateProblemSolvingChapters(chapters=PROBLEM_SOLVING_CHAPTERS){
  const issues=[];
  for(const [topicId,levels] of Object.entries(chapters)){
    if(!Array.isArray(levels)||levels.length!==4){
      issues.push(topicId+': exactly four problem-solving levels are required');continue;
    }
    if(levels.map(l=>l.id).join(',')!==PROBLEM_SOLVING_LEVELS.join(','))
      issues.push(topicId+': level order is not progressive');
    const allIds=new Set(),allPrompts=new Set();
    for(const level of levels){
      if(!level.label||!level.description||level.description.length<30||
         !Array.isArray(level.pages)||level.pages.length<2)
        issues.push(topicId+'/'+level.id+': missing level description or internal pages');
      const pages=new Set();
      for(const page of level.pages||[]){
        if(!/^[a-z][a-z0-9-]*$/.test(page.id)||pages.has(page.id)||
           page.type!=='problem-solving'||!page.focus||page.focus.length<25||
           !Array.isArray(page.tasks)||page.tasks.length<2)
          issues.push(topicId+'/'+level.id+': invalid practice page '+page.id);
        pages.add(page.id);
        for(const t of page.tasks||[]){
          const key=taskKey(level.id,page.id,t.id);
          if(!/^[a-z][a-z0-9-]*$/.test(t.id)||allIds.has(key)||
             typeof t.prompt!=='string'||t.prompt.length<60||
             allPrompts.has(t.prompt))issues.push(topicId+': invalid or repeated task '+key);
          allIds.add(key);allPrompts.add(t.prompt);
          if(!t.plan||t.plan.length<22||!t.reflection||t.reflection.length<25)
            issues.push(topicId+': missing strategic prompt or reflection '+key);
          if(!Array.isArray(t.options)||t.options.length!==2||
             new Set(t.options.map(o=>o.id)).size!==2||
             t.options.some(o=>!o.label||o.label.length<20||!o.feedback||o.feedback.length<40))
            issues.push(topicId+': invalid strategy comparison '+key);
          if(!Array.isArray(t.hints)||t.hints.length!==2||
             t.hints.some(h=>typeof h!=='string'||h.length<22)||
             !Array.isArray(t.steps)||t.steps.length<3||
             t.steps.some(step=>typeof step!=='string'||step.length<25))
            issues.push(topicId+': incomplete graduated support or worked solution '+key);
          if(!Array.isArray(t.checks)||t.checks.length!==3||
             t.checks.some(c=>typeof c!=='string'||c.length<20))
            issues.push(topicId+': incomplete self-check criteria '+key);
        }
      }
    }
  }
  return issues;
}
