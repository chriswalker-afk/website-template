import test from 'node:test';
import assert from 'node:assert/strict';
import {workingScope,modeWorkingNotebook,archivedWorkingNotebooks,
  MODE_NOTEBOOK_COPY} from '../src/working-notebook-integration.js';
import {blankWorkingNotebook,editWorkingNotebook,hasWorkingContent}
  from '../src/working-notebook-model.js';
import {reasoningAttempt,effectiveProblemAttempt,effectiveModellingAttempt}
  from '../src/working-notebook-evidence.js';
import {attemptedProblem,canRateProblem} from '../src/problem-solving-engine.js';
import {attemptedModelling,canSelfRateModel,MODEL_PHASE_IDS}
  from '../src/modelling-engine.js';
import {TOPICS} from '../src/topics.js';
import {renderWorkshop} from '../src/understand-ui.js';
import {UNDERSTAND_CONTENT} from '../src/understand-content.js';
import {renderReasoningPage} from '../src/reasoning-ui.js';
import {tasksFor,emptyReasoningProgress} from '../src/reasoning-engine.js';
import {renderProblemSolvingPage} from '../src/problem-solving-ui.js';
import {PROBLEM_SOLVING_CHAPTERS} from '../src/problem-solving-content.js';
import {emptyProblemSolvingProgress} from '../src/problem-solving-engine.js';
import {renderModellingPage} from '../src/modelling-ui.js';
import {MODELLING_CHAPTERS} from '../src/modelling-content.js';
import {emptyModellingProgress} from '../src/modelling-engine.js';

test('notebook scopes are stable per topic, mode, level, page and task',()=>{
  const base=['quadratics','reasoning','justify','main','conclusion'];
  const scope=workingScope(...base);
  assert.equal(scope,'quadratics:reasoning:justify:main:conclusion');
  assert.notEqual(scope,workingScope('sampling',...base.slice(1)));
  assert.notEqual(scope,workingScope(...base.slice(0,4),'other'));
  assert.throws(()=>workingScope('quadratics','games','level-1','main','task'));
  assert.throws(()=>workingScope('quadratics','reasoning','level-1','main','"><img'));
  assert.match(modeWorkingNotebook(...base),/Reasoning — equations and diagrams/);
  for(const mode of ['understand','reasoning','problemSolving','modelling'])
    assert.ok(MODE_NOTEBOOK_COPY[mode].guidance.length>45);
});
test('working content is present only for genuine typed content or drawn strokes',()=>{
  const empty=blankWorkingNotebook();
  assert.equal(hasWorkingContent(empty),false);
  let book=editWorkingNotebook(empty,{type:'set-block',id:'block-1',value:'   '});
  assert.equal(hasWorkingContent(book),false);
  book=editWorkingNotebook(book,{type:'set-block',id:'block-1',value:'x=3'});
  assert.equal(hasWorkingContent(book),true);
  book=editWorkingNotebook(book,{type:'set-block',id:'block-1',value:''});
  book=editWorkingNotebook(book,{type:'stroke',stroke:{ink:'#285c7c',width:2,
    points:[[10,10],[20,25]]}});
  assert.equal(hasWorkingContent(book),true);
  book=editWorkingNotebook(book,{type:'clear-ink'});
  assert.equal(hasWorkingContent(book),false);
  assert.equal(hasWorkingContent({invalid:true}),false);
});
test('notebook-only attempt needs explicit confirmation and existing review criteria',()=>{
  assert.equal(reasoningAttempt({draft:'' ,notebookConfirmed:true},false),false);
  assert.equal(reasoningAttempt({draft:'' ,notebookConfirmed:true},true),true);
  assert.equal(reasoningAttempt({draft:'A sufficiently long mathematical explanation.'},false),true);
  const raw={plan:'',working:'',notebookPlan:true,notebookWorking:true,
    modelComplete:true,assisted:false,modelFirst:false,
    checks:[true,true,true],rating:null};
  assert.equal(attemptedProblem(effectiveProblemAttempt(raw,false)),false);
  assert.equal(canRateProblem(effectiveProblemAttempt(raw,false),'independent'),false);
  assert.equal(attemptedProblem(effectiveProblemAttempt(raw,true)),true);
  assert.equal(canRateProblem(effectiveProblemAttempt(raw,true),'independent'),true);
  assert.equal(canRateProblem(effectiveProblemAttempt({...raw,assisted:true},true),'independent'),false);
  assert.equal(canRateProblem(effectiveProblemAttempt({...raw,checks:[true,true,false]},true),'supported'),false);
});
test('four modelling stage confirmations count as attempts, but not grades',()=>{
  const stages=Object.fromEntries(MODEL_PHASE_IDS.map(id=>[id,true]));
  const drafts=Object.fromEntries(MODEL_PHASE_IDS.map(id=>[id,'']));
  const entry={drafts,notebookStages:stages,compared:true,checked:[true,true,true],
    assisted:false,modelFirst:false,rating:null};
  assert.equal(attemptedModelling(effectiveModellingAttempt(entry,false)),false);
  assert.equal(attemptedModelling(effectiveModellingAttempt(entry,true)),true);
  assert.equal(canSelfRateModel(effectiveModellingAttempt(entry,true),'independent'),true);
  assert.equal(canSelfRateModel(effectiveModellingAttempt({...entry,modelFirst:true},true),'independent'),false);
  assert.equal(canSelfRateModel(effectiveModellingAttempt({...entry,
    notebookStages:{...stages,interpret:false}},true),'supported'),false);
});
test('completed notebook archive escapes content and exposes stable task scopes',()=>{
  const html=archivedWorkingNotebooks({topicId:'sampling',mode:'reasoning',
    sectionId:'justify',pageId:'main',
    items:[{id:'task-a',title:'First <script>'},{id:'task-b',title:'Second'}]});
  assert.match(html,/Review and download saved notebooks \(2\)/);
  assert.match(html,/sampling:reasoning:justify:main:task-a/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/<script>/);
});
test('Understand My turn offers a notebook while preserving original self-review fields',()=>{
  const section=UNDERSTAND_CONTENT.quadratics.find(s=>s.id==='worked-examples');
  const page=section.pages.find(p=>p.type==='workshop');
  assert.ok(page);
  const markup=renderWorkshop(page,
    {topicId:'quadratics',sectionId:'worked-examples',pageId:page.id}, {}, {});
  assert.match(markup,/data-understand-response/);
  assert.match(markup,/quadratics:understand:worked-examples:[a-z-]+:my-turn/);
  assert.match(markup,/Compare with model solution/);
});
test('all three advanced modes expose notebook evidence without automatic grades',()=>{
  const topic=TOPICS.quadratics;
  const rt={topicId:'quadratics',chapterId:'reasoning',sectionId:'justify',pageId:'main'};
  const task=tasksFor(topic.id,rt.sectionId)[0];
  const reasoning=renderReasoningPage(null,topic,rt,{selection:'all',index:0,
    ids:[task.id],entries:{},complete:false},emptyReasoningProgress());
  assert.match(reasoning,/data-reasoning-notebook-evidence/);
  assert.match(reasoning,/quadratics:reasoning:justify:main:/);
  const section=PROBLEM_SOLVING_CHAPTERS.quadratics[0],page=section.pages[0];
  const problem=renderProblemSolvingPage(page,topic,
    {topicId:topic.id,sectionId:section.id,pageId:page.id},
    {selection:'all',ids:[page.tasks[0].id],index:0,entries:{},complete:false},
    emptyProblemSolvingProgress());
  assert.match(problem,/data-ps-notebook-evidence="plan"/);
  assert.match(problem,/data-ps-notebook-evidence="working"/);
  const level=MODELLING_CHAPTERS.quadratics[0],modelPage=level.pages[0];
  const modelling=renderModellingPage(modelPage,topic,
    {topicId:topic.id,sectionId:level.id,pageId:modelPage.id},
    {selection:'all',ids:[modelPage.tasks[0].id],index:0,entries:{},
      stage:0,maxStage:0,complete:false},emptyModellingProgress());
  assert.match(modelling,/data-mdl-notebook-evidence="formulate"/);
  assert.match(modelling,/This notebook follows the same investigation/);
});
