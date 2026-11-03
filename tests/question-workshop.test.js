import test from 'node:test';
import assert from 'node:assert/strict';
import {AUTHORING_PACKS,TOPICS} from '../src/topic-packs/registry.js';
import {catalogueFor,previewFamily,acceptedAnswerExamples,testPreviewAnswer,
  auditFamily,auditTopicFamilies,auditWorksheetFamily,validSeed,validateWorksheetPreview}
  from '../src/question-workshop/core.js';
import {makeQuestionModel,toFluencyQuestion} from '../src/question-foundation/index.js';
import {workshopUrl} from '../scripts/question-workshop.mjs';

const gradient=AUTHORING_PACKS.find(x=>x.topic.id==='gradient');
test('Pass 3 catalogues original registered families without changing the published hub',()=>{
  assert.ok(gradient);
  const items=catalogueFor(gradient);
  assert.equal(items.filter(item=>item.type==='fluency').length,16);
  assert.equal(items.filter(item=>item.type==='worksheet').length,4);
  assert.ok(items.some(item=>item.key==='fluency:rising-grid'));
  assert.ok(items.some(item=>item.key==='worksheet:gradient-grid'));
  assert.ok(items.find(item=>item.key==='fluency:rising-grid').uses.length>0);
  assert.equal(Object.keys(TOPICS).length,3);
  const fake={topic:{id:'unpublished-topic',title:'Draft',authoring:{status:'draft'},chapters:{fluency:[]}},
    questionBank:{fluency:{foo:()=>({})},worksheet:[]}};
  assert.equal(catalogueFor(fake).length,1);
  assert.equal(TOPICS['unpublished-topic'],undefined);
});
test('A seed always reproduces the same real generated question',()=>{
  const one=previewFamily(gradient,'fluency:rising-grid',{seed:2026});
  const again=previewFamily(gradient,'fluency:rising-grid',{seed:2026});
  assert.deepEqual(one,again);
  assert.ok(one.prompt.includes('squared grid'));
  assert.ok(one.answerDisplay.length>0);
  assert.equal(one.marks,2);
  assert.notEqual(one.signature,previewFamily(gradient,'fluency:rising-grid',{seed:4}).signature);
  assert.throws(()=>previewFamily(gradient,'fluency:__proto__',{seed:12}),/Unknown/);
  assert.throws(()=>previewFamily(gradient,'fluency:rising-grid',{seed:0}),/seed/);
  assert.equal(validSeed('3.5'),null);
});
test('Verified equivalent examples and manual answer checks use the student checker',()=>{
  const p=previewFamily(gradient,'fluency:rise-run',{seed:2026});
  const examples=acceptedAnswerExamples(p);
  assert.ok(examples.length>=1);
  assert.ok(examples.every(example=>testPreviewAnswer(p,example.value).correct));
  assert.equal(testPreviewAnswer(p,'not algebra').kind,'format');
  const fake={topic:{id:'algebra',title:'Algebra',chapters:{fluency:[]}},questionBank:{
    fluency:{'factorise-monic':()=>toFluencyQuestion(makeQuestionModel({
      topicId:'algebra',familyId:'factorise-monic',signature:'2:-3',
      parameters:{a:2,b:-3},prompt:'Write an equivalent polynomial.',marks:3,
      answer:{kind:'expression',value:{latex:'(x+2)(x-3)'}},
      solutionSteps:['Find the roots.','Write the two factors.'],hint:'Find the factors.',
      misconception:'Check the constant term.'
    }))},worksheet:[]}};
  const example=previewFamily(fake,'fluency:factorise-monic',{seed:19});
  assert.equal(testPreviewAnswer(example,'x^2-x-6').correct,true);
  assert.equal(testPreviewAnswer(example,'x^2-x-5').correct,false);
  assert.ok(acceptedAnswerExamples(example).length>=2);
});
test('Worksheet family previews honour difficulty and show LaTeX source',()=>{
  const secure=previewFamily(gradient,'worksheet:gradient-grid',{seed:2026,difficulty:'secure'});
  const developing=previewFamily(gradient,'worksheet:gradient-grid',{seed:2026,difficulty:'developing'});
  assert.ok(secure.question.questionTex.length>0);
  assert.ok(secure.question.solutionTex.length>0);
  assert.ok(developing.question.questionTex.length>0);
  assert.equal(secure.answerKind,'print-only');
  assert.equal(testPreviewAnswer(secure,'3').kind,'unsupported');
  assert.deepEqual(secure,previewFamily(gradient,'worksheet:gradient-grid',{seed:2026,difficulty:'secure'}));
  assert.equal(validateWorksheetPreview(secure.question),'');
  assert.match(validateWorksheetPreview({...secure.question,solutionTex:''}),/solutionTex/);
});
test('Seeded family audits and topic dashboard expose errors and review limitations',()=>{
  const fluency=auditFamily(gradient,'fluency:rising-grid',{startSeed:10,count:24});
  assert.equal(fluency.passed,true,fluency.errors.join('; '));
  assert.equal(fluency.tested,24);
  assert.ok(fluency.warnings.some(w=>w.includes('teacher review')));
  const print=auditWorksheetFamily(gradient,'worksheet:gradient-grid',{startSeed:10,count:8});
  assert.equal(print.tested,24);
  assert.equal(print.passed,true);
  assert.ok(print.warnings.some(w=>w.includes('teacher review')));
  const topic=auditTopicFamilies(gradient,{startSeed:10,count:8});
  assert.equal(topic.summary.families,20);
  assert.equal(topic.summary.passed,20,topic.results.filter(r=>!r.passed).map(r=>r.errors).join('; '));
  assert.equal(topic.summary.failed,0);
  assert.ok(topic.limitation.includes('do not prove'));
});
test('Worksheet audits identify a failing seed without assuming the answers are true',()=>{
  const broken={topic:{id:'demo',title:'Demo',chapters:{}},questionBank:{fluency:{},
    worksheet:[{id:'bad',skill:'test',create:rng=>({signature:'x',marks:2,
      questionTex:'Test',answerTex:'2',solutionTex:'',hintTex:'Hint'})}]}};
  const audit=auditFamily(broken,'worksheet:bad',{startSeed:47,count:4});
  assert.equal(audit.passed,false);
  assert.match(audit.errors[0],/seed 47.*solutionTex/);
});
test('Authoring launch links encode topic and seed safely',()=>{
  assert.equal(workshopUrl({topic:'gradient',seed:'2026',difficulty:'stretch',port:4173}),
    'http://127.0.0.1:4173/authoring.html?topic=gradient&seed=2026&difficulty=stretch');
});
