import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../src/topics.js';
import {QUESTION_BANKS} from '../src/topic-packs/registry.js';
import {questionBankFor,fluencyFamiliesFor,worksheetFamiliesFor,
  worksheetSkillOptionsFor,validateQuestionBank} from '../src/question-bank.js';
import {buildFluencySet,rngFromSeed,makeFluencyQuestion,checkFluencyAnswer,
  answerText} from '../src/fluency-engine.js';
import {generateWorksheet,worksheetSkills,supportsWorksheets} from '../src/worksheet-generator.js';
import {fluencyQuestionScaffold} from '../src/fluency-levels.js';

for(const id of ['sampling','quadratics']){
  test(id+' question bank registers checked interactive and printable families',()=>{
    const topic=TOPICS[id],bank=questionBankFor(id);
    assert.strictEqual(bank,QUESTION_BANKS[id]);
    assert.doesNotThrow(()=>structuredClone(topic));
    assert.equal(bank.schemaVersion,1);
    assert.deepEqual(validateQuestionBank(topic),[]);
    assert.ok(Object.keys(fluencyFamiliesFor(id)).length>=10);
    assert.ok(worksheetFamiliesFor(id).length>=4);
    assert.deepEqual(worksheetSkills(id),topic.worksheetSkills);
    assert.deepEqual(worksheetSkillOptionsFor(id),topic.worksheetSkills);
    assert.equal(supportsWorksheets(id),true);
    for(const group of topic.chapters.fluency)for(const page of group.pages)
      for(const familyId of page.families)assert.equal(typeof bank.fluency[familyId],'function');
    const section=topic.chapters.fluency[0],page=section.pages[0];
    const a=buildFluencySet({topicId:id,levelId:section.id,pageId:page.id,seed:76542,count:6});
    const b=buildFluencySet({topicId:id,levelId:section.id,pageId:page.id,seed:76542,count:6});
    assert.deepEqual(a,b);
    for(const q of a.questions)assert.equal(checkFluencyAnswer(answerText(q.answer),q).correct,true);
    const worksheet=generateWorksheet({topicId:id,seed:32112,count:8});
    assert.equal(worksheet.questions.length,8);
    assert.ok(worksheet.questions.every(q=>q.answerTex&&q.solutionTex&&q.hintTex));
    assert.deepEqual(worksheet.questions.map(q=>q.signature),
      generateWorksheet({topicId:id,seed:32112,count:8}).questions.map(q=>q.signature));
  });
}
test('family-specific cues can be selected by topic without changing the shared levels',()=>{
  const sampling=fluencyQuestionScaffold('level-1','interval','sampling');
  assert.match(sampling.steps[0],/interval/);
  assert.deepEqual(sampling,fluencyQuestionScaffold('level-1','interval'));
  assert.equal(fluencyQuestionScaffold('level-3','interval','sampling'),null);
  assert.equal(fluencyQuestionScaffold('level-4','vertex','quadratics'),null);
});
test('independently authored topic banks are checked without predefined topic names',()=>{
  const newTopic={id:'linear',modes:{fluency:true},chapters:{fluency:[{
    id:'level-1',pages:[{id:'gradient',families:['gradient']}]
  }]},worksheetSkills:[{id:'fluency',label:'Fluency practice'}],
    questionBank:{schemaVersion:1,
      fluency:{gradient:()=>({family:'gradient',signature:'gradient:1'})},
      worksheet:[],scaffolds:{guided:{gradient:'Find the rise and run.'}}}};
  assert.deepEqual(validateQuestionBank(newTopic),[]);
  assert.deepEqual(validateQuestionBank({...newTopic,questionBank:{...newTopic.questionBank,fluency:{}}})
    .some(e=>e.includes('missing Fluency generator')),true);
  assert.deepEqual(validateQuestionBank({...newTopic,worksheetSkills:[{id:'unsupported',label:'Missing'}]})
    .some(e=>e.includes('worksheet skill has no question family')),true);
});
