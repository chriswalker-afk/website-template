import test from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile,rm,access} from 'node:fs/promises';
import {join} from 'node:path';
import {TOPICS,TOPIC_PACKS} from '../src/topics.js';
import {QUESTION_BANKS,VISUAL_LIBRARIES} from '../src/topic-packs/registry.js';
import {validateTopics,chaptersFor,sectionsFor,resolveRoute,routeHref} from '../src/logic.js';
import {auditTopicRecord,auditTopic} from '../scripts/lib/topic-audit.mjs';
import {fluencyFamilyIds,buildFluencySet,makeFluencyQuestion,rngFromSeed,
  checkFluencyAnswer,answerText} from '../src/fluency-engine.js';
import {generateWorksheet,generateWorksheetFromFluencySet,worksheetSkills} from '../src/worksheet-generator.js';
import {validateQuestionBank} from '../src/question-bank.js';
import {validateVisualLibrary} from '../src/visuals/validation.js';
import {validateReasoningContent} from '../src/reasoning-engine.js';
import {validateProblemSolvingChapters} from '../src/problem-solving-engine.js';
import {validateModellingChapters} from '../src/modelling-engine.js';
import {buildSite,PROJECT_ROOT} from '../scripts/build-site.mjs';

const id='gradient',topic=TOPICS[id],bank=QUESTION_BANKS[id],visuals=VISUAL_LIBRARIES[id];
test('the new topic is strictly Gradient, ready for Foundation and has no shared app edits',async()=>{
  assert.equal(topic?.id,'gradient');
  assert.equal(topic.title,'Gradient');
  assert.match(topic.qualification,/4MA1/);
  assert.equal(topic.level,'Foundation');
  assert.equal(topic.authoring.status,'ready');
  assert.deepEqual(topic.authoring.plannedModes,
    ['understand','memorise','fluency','reasoning','problemSolving','modelling']);
  assert.deepEqual(chaptersFor(topic).map(x=>x.id),topic.authoring.plannedModes);
  assert.ok(TOPIC_PACKS.some(x=>x.id===id));
  assert.deepEqual(validateTopics(),[]);
  assert.doesNotThrow(()=>structuredClone(topic));
  const dir=join(PROJECT_ROOT,'src','topic-packs',id);
  for(const file of (await readdir(dir)).filter(x=>x.endsWith('.js'))){
    const source=await readFile(join(dir,file),'utf8');
    assert.doesNotMatch(source,/midpoint/i,file+' contains unrelated topic content');
    assert.doesNotMatch(source,/\bTODO\b|placeholder/i,file+' has incomplete authored content');
  }
});
test('publication readiness is independently verified for the complete gradient site',async()=>{
  const report=await auditTopic(id);
  assert.deepEqual(report.structuralErrors,[]);
  assert.deepEqual(report.blockers,[]);
  assert.equal(report.publicationReady,true);
  assert.equal(report.counts.cards,15);
  assert.equal(report.counts.clozes,15);
  assert.equal(report.counts.fluencyFamilies,16);
  assert.equal(report.counts.worksheetFamilies,4);
  assert.equal(report.counts.diagrams,4);
  assert.equal(report.counts.explorers,3);
  assert.equal(report.counts.modes.understand.pages,15);
  assert.equal(report.counts.modes.fluency.pages,8);
  assert.equal(report.counts.modes.reasoning.pages,4);
  assert.equal(report.counts.modes.problemSolving.pages,8);
  assert.equal(report.counts.modes.modelling.pages,4);
  assert.equal(report.counts.modes.games.enabled,false);
  assert.equal(report.counts.modes.examPractice.enabled,false);
  assert.deepEqual(validateQuestionBank(topic),[]);
  assert.deepEqual(validateVisualLibrary(topic,visuals),[]);
  assert.deepEqual(validateReasoningContent({gradient:topic.chapters.reasoning}),[]);
  assert.deepEqual(validateProblemSolvingChapters({gradient:topic.chapters.problemSolving}),[]);
  assert.deepEqual(validateModellingChapters({gradient:topic.chapters.modelling}),[]);
  assert.deepEqual(worksheetSkills(id),topic.worksheetSkills);
});
test('Foundation practice dominates; the coordinate-pair formula stays in labelled stretch pages',()=>{
  const levels=topic.chapters.fluency;
  assert.deepEqual(levels.map(x=>x.id),['level-1','level-2','level-3','level-4']);
  for(const level of levels.slice(0,3))for(const page of level.pages){
    assert.doesNotMatch(page.focus,/extension|stretch|two coordinate/i);
    assert.ok(!page.families.some(f=>f.startsWith('coordinate-')));
  }
  assert.match(levels[3].description,/Stretch/i);
  assert.ok(levels[3].pages.some(p=>p.families.includes('coordinate-fraction')));
  assert.deepEqual(sectionsFor(topic,'understand').map(s=>s.id),
    ['big-idea','how-it-works','visual-explanations','worked-examples']);
  assert.ok(topic.chapters.understand[1].pages.some(p=>p.id==='two-coordinates-extension'));
  assert.equal(topic.chapters.understand[3].pages.filter(p=>p.type==='workshop').length,4);
  assert.deepEqual(topic.chapters.reasoning.map(s=>s.pages[0].tasks.length),[4,4,4,4]);
  assert.deepEqual(topic.chapters.problemSolving.map(s=>s.pages.length),[2,2,2,2]);
  assert.deepEqual(topic.chapters.modelling.map(s=>s.pages[0].tasks.length),[2,2,2,2]);
});
test('every generated family has valid numerical answers and stable questions',()=>{
  const familyIds=Object.keys(bank.fluency);
  assert.equal(familyIds.length,16);
  for(const family of familyIds)for(const seed of [1,2,7,39,2026,87421]){
    const q=makeFluencyQuestion(id,family,rngFromSeed(seed));
    const again=makeFluencyQuestion(id,family,rngFromSeed(seed));
    assert.deepEqual(q,again);
    assert.equal(checkFluencyAnswer(answerText(q.answer),q).correct,true);
    assert.ok(q.steps.length>=2);
    assert.ok(q.marks>=1&&q.marks<=8);
  }
  // Independent arithmetic spot checks protect the trickiest negative/decimal cases.
  const reversed=makeFluencyQuestion(id,'coordinate-reversed',rngFromSeed(1234));
  const coords=reversed.signature.split(':').slice(1).map(Number);
  const [x,y,dx,m]=coords;
  assert.equal(((y+m*dx)-y)/((x+dx)-x),reversed.answer.values[0]);
  const half=makeFluencyQuestion(id,'coordinate-fraction',rngFromSeed(231));
  assert.ok([-1.5,-0.5,0.5,1.5].includes(half.answer.values[0]));
});
test('all four levels support stable practice sets and mathematically identical worksheet exports',()=>{
  for(const level of topic.chapters.fluency)for(const page of level.pages){
    const options={topicId:id,levelId:level.id,pageId:page.id,seed:42021,count:10};
    const set=buildFluencySet(options);
    assert.deepEqual(set,buildFluencySet(options));
    assert.equal(set.questions.length,10);
    for(const question of set.questions){
      assert.ok(question.steps.length>=2);
      assert.equal(checkFluencyAnswer(answerText(question.answer),question).correct,true);
    }
    const sheet=generateWorksheetFromFluencySet(set);
    assert.deepEqual(sheet.questions.map(q=>q.signature),set.questions.map(q=>q.signature));
    assert.equal(sheet.questions.length,10);
    assert.ok(sheet.solutionsTex.includes('Worked Solutions'));
  }
});
test('four independent worksheet skills offer complete LaTeX and solutions',()=>{
  const groups=['grid','equations','tables','context'];
  for(const skill of groups){
    const options={topicId:id,seed:9876,count:12,skills:[skill],style:'independent',solutions:'worked'};
    const output=generateWorksheet(options);
    assert.equal(output.questions.length,12);
    assert.ok(output.questions.every(q=>q.answerTex&&q.solutionTex&&q.hintTex&&q.marks));
    assert.ok(output.studentTex.includes('documentclass'));
    assert.ok(output.solutionsTex.includes('Worked Solutions'));
    assert.deepEqual(output.questions.map(q=>q.signature),
      generateWorksheet(options).questions.map(q=>q.signature));
  }
  const mixed=generateWorksheet({topicId:id,seed:42124,count:16,style:'mixed'});
  assert.equal(mixed.questions.length,16);
  assert.ok(mixed.questions.some(q=>q.familyId==='fluency-generated'));
});
test('existing links remain stable and the ready site builds as a single-topic publication',async()=>{
  const href=routeHref(id,'understand','visual-explanations');
  assert.equal(resolveRoute(href).topicId,id);
  const out=join(PROJECT_ROOT,'dist','test-gradient-ready');
  try{
    const built=await buildSite({topicId:id,outputDirectory:out,draft:false});
    assert.equal(built.manifest.mode,'standalone');
    assert.equal(built.manifest.topicId,id);
    assert.equal(built.manifest.draft,false);
    await access(join(out,'index.html'));
    await access(join(out,'src','topic-packs',id,'understand.js'));
    const config=await readFile(join(out,'src','site-config.js'),'utf8');
    assert.match(config,/"previewDraft": false/);
    const html=await readFile(join(out,'index.html'),'utf8');
    assert.doesNotMatch(html,/noindex, nofollow/);
    assert.match(html,/<title>Gradient \| The Maths Notebook<\/title>/);
  }finally{await rm(out,{recursive:true,force:true});}
});
