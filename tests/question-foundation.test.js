import test from 'node:test';
import assert from 'node:assert/strict';
import {integer,choice,nonZeroInteger,gcd,rational,rationalChoice,shuffled,distinct,
  makeQuestionModel,validateQuestionModel,toFluencyQuestion,toWorksheetQuestion,presentQuestion} from '../src/question-foundation/index.js';
import {rngFromSeed,checkFluencyAnswer,validateFluencyQuestion} from '../src/fluency-engine.js';
import {fluencyFamilies} from '../src/topic-packs/gradient/fluency-families.js';

const model=()=>makeQuestionModel({topicId:'gradient',familyId:'rise-run',signature:'4:2',
  parameters:{rise:4,run:2},prompt:'Find the gradient when rise is 4 and run is 2.',
  marks:2,answer:{kind:'number',values:[2]},solutionSteps:['Signed rise = 4 and run = 2.','Gradient = 4 / 2 = 2.'],
  hint:'Divide rise by run.',skill:'Gradient',misconception:'Do not reverse the fraction.'});
test('parameter helpers are reproducible and handle rational signs',()=>{
  const sample=seed=>{const rng=rngFromSeed(seed);return [
    integer(rng,-3,3),choice(rng,['a','b','c']),nonZeroInteger(rng,-2,2),
    rationalChoice(rng,[2,4,6],[-8,3]),shuffled(rng,[1,2,3]),distinct(rng,[1,2,3],2)]};
  assert.deepEqual(sample(2026),sample(2026));
  assert.deepEqual(rational(6,-8),{numerator:-3,denominator:4});
  assert.equal(gcd(-18,12),6);
  for(let s=1;s<=100;s++)assert.notEqual(nonZeroInteger(rngFromSeed(s),-1,1),0);
  assert.throws(()=>integer(()=>1,0,2),/RNG/);
  assert.throws(()=>distinct(()=>0,[1,1],1),/unique/);
});
test('model contract validates and rejects incomplete questions',()=>{
  const q=model();assert.deepEqual(validateQuestionModel(q),[]);
  assert.equal(Object.isFrozen(q),true);
  assert.throws(()=>makeQuestionModel({...q,answer:{kind:'number',values:[Infinity]}}),/Numerical/);
  assert.throws(()=>makeQuestionModel({...q,solutionSteps:[]}),/solutionSteps/);
  assert.throws(()=>makeQuestionModel({...q,answer:{kind:'unrecognised'}}),/Unsupported/);
});
test('legacy Fluency adapter produces an auto-markable question',()=>{
  const q=toFluencyQuestion(model());
  assert.equal(validateFluencyQuestion(q),'');
  assert.equal(checkFluencyAnswer('2',q).correct,true);
  assert.equal(checkFluencyAnswer('3',q).correct,false);
  assert.equal(q.signature,'rise-run:4:2');
  assert.deepEqual(presentQuestion(model(),'fluency'),q);
});
test('worksheet and worked-example presentations use the same source',()=>{
  const p={questionTex:'Find the gradient.',answerTex:'2',solutionTex:'4/2=2',
    hintTex:'Rise over run.',spaceMm:24};
  const q=toWorksheetQuestion(model(),p);
  assert.equal(q.answerTex,'2');assert.equal(q.spaceMm,24);
  assert.deepEqual(presentQuestion(model(),'worksheet',p),q);
  assert.equal(presentQuestion(model(),'worked-example').steps.length,2);
  assert.throws(()=>toWorksheetQuestion(model(),{}),/LaTeX/);
});
test('supported expressions use exact marking while unsupported kinds remain self-review',()=>{
  const q=makeQuestionModel({...model(),answer:{kind:'expression',value:{latex:'2x+1'}}});
  const fluency=toFluencyQuestion(q);
  assert.equal(validateFluencyQuestion(fluency),'');
  assert.equal(checkFluencyAnswer('x+x+1',fluency).correct,true);
  assert.equal(checkFluencyAnswer('2x+2',fluency).correct,false);
  assert.equal(presentQuestion(q,'worked-example').prompt,q.prompt);
  const openEnded=makeQuestionModel({...model(),answer:{kind:'self-review'},reviewCriteria:['Explain reasoning.']});
  assert.throws(()=>toFluencyQuestion(openEnded),/No automatic checker/);
});
test('existing Gradient family output remains valid and unchanged by opt-in API',()=>{
  for(const [name,create] of Object.entries(fluencyFamilies)){
    const question=create(rngFromSeed(2026));
    assert.equal(validateFluencyQuestion(question),'',name);
    assert.ok(question.steps.length>0,name);
  }
});
