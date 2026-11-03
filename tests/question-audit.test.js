import test from 'node:test';
import assert from 'node:assert/strict';
import {rngFromSeed} from '../src/fluency-engine.js';
import {makeQuestionModel,integer,nonZeroInteger,
  toFluencyQuestion} from '../src/question-foundation/index.js';
import {auditFluencyGenerator,auditQuestionModelGenerator} from '../src/question-foundation/audit.js';
import {fluencyFamilies} from '../src/topic-packs/gradient/fluency-families.js';

const modelGenerator=rng=>{
  const rise=nonZeroInteger(rng,-9,9),run=integer(rng,2,8);
  return makeQuestionModel({
    topicId:'gradient',familyId:'model-gradient',signature:rise+':'+run,
    parameters:{rise,run},prompt:'Calculate rise/run.',marks:2,
    answer:{kind:'rational',value:{numerator:rise,denominator:run}},
    solutionSteps:['Record the signed rise and run.','Divide rise by run.'],
    hint:'Rise over run.',skill:'Gradient',misconception:'Do not reverse them.'
  });
};
test('Pass 2 model audits check seeds, answers, and independent mathematical oracle',()=>{
  const audit=auditQuestionModelGenerator(modelGenerator,{
    count:100,familyId:'model-gradient',
    oracle:q=>q.answer.value.numerator===q.parameters.rise&&
      q.answer.value.denominator===q.parameters.run
  });
  assert.deepEqual(audit.errors,[]);
  assert.equal(audit.passed,true);
  assert.equal(audit.tested,100);
  assert.ok(audit.distinct>=30);
  const replay=seed=>modelGenerator(rngFromSeed(seed));
  assert.deepEqual(replay(2026),replay(2026));
});
test('Audits detect inconsistent generated reference answers using separate oracle',()=>{
  const bad=rng=>{
    const model=modelGenerator(rng);
    return makeQuestionModel({...model,
      answer:{kind:'rational',value:{numerator:model.parameters.rise+1,denominator:model.parameters.run}}});
  };
  const report=auditQuestionModelGenerator(bad,{
    count:12,familyId:'model-gradient',
    oracle:q=>q.answer.value.numerator===q.parameters.rise
  });
  assert.equal(report.passed,false);
  assert.ok(report.errors.some(e=>e.includes('Independent oracle failed')));
});
test('Audits reject malformed or nondeterministic generated questions',()=>{
  const bad=()=>({prompt:'Incomplete'});
  const invalid=auditFluencyGenerator(bad,{count:3,familyId:'broken'});
  assert.equal(invalid.passed,false);
  assert.match(invalid.errors[0],/seed 1/);
  let tick=0;
  const unstable=rng=>{
    const q=toFluencyQuestion(modelGenerator(rng));
    q.signature='random-'+(++tick);return q;
  };
  const report=auditFluencyGenerator(unstable,{count:3});
  assert.equal(report.passed,false);
  assert.ok(report.errors.some(e=>e.includes('Not reproducible')));
});
test('Existing Gradient generators remain valid under a wider seed audit',()=>{
  for(const [familyId,create] of Object.entries(fluencyFamilies)){
    const report=auditFluencyGenerator(create,{familyId,count:64});
    assert.equal(report.passed,true,familyId+': '+report.errors.join(' / '));
    assert.ok(report.distinct>=3,familyId);
  }
});
test('Audits distinguish mathematical review from reference round-trips',()=>{
  const report=auditFluencyGenerator(fluencyFamilies['rise-run'],{
    familyId:'rise-run',count:10
  });
  assert.equal(report.passed,true);
  assert.ok(report.warnings.some(w=>w.includes('No independent mathematical oracle')));
  assert.throws(()=>auditFluencyGenerator(()=>{}, {count:0}),/seeds/);
});
