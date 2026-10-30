import test from 'node:test';
import assert from 'node:assert/strict';
import {FLUENCY_LEVELS,fluencyLevel,fluencyQuestionScaffold,
  showFluencySkill} from '../src/fluency-levels.js';
import {FLUENCY_CHAPTERS,validateFluencyChapters} from '../src/fluency-engine.js';
import {PROBLEM_SOLVING_CHAPTERS} from '../src/problem-solving-content.js';

const expected=['Guided','Structured','Independent','Challenge'];
test('Fluency and Problem Solving share four stage names and stable level IDs',()=>{
  assert.deepEqual(FLUENCY_LEVELS.map(x=>x.name),expected);
  assert.deepEqual(FLUENCY_LEVELS.map(x=>x.id),['level-1','level-2','level-3','level-4']);
  for(const topic of ['sampling','quadratics']){
    const fluency=FLUENCY_CHAPTERS[topic];
    const solving=PROBLEM_SOLVING_CHAPTERS[topic];
    assert.deepEqual(fluency.map(x=>x.id),solving.map(x=>x.id));
    assert.deepEqual(fluency.map(x=>x.label),solving.map(x=>x.label));
    assert.equal(fluency.length,4);
    assert.deepEqual(fluency.map(x=>x.label),expected.map((name,i)=>
      'Level '+(i+1)+': '+name));
    assert.ok(fluency.every(x=>x.pages.length>=1&&x.description.length>25));
  }
  assert.deepEqual(validateFluencyChapters(),[]);
  assert.equal(fluencyLevel('level-5'),null);
});
test('Guided and Structured offer targeted method scaffolds without worked answers',()=>{
  for(const topic of ['sampling','quadratics']){
    for(const level of ['level-1','level-2']){
      const section=FLUENCY_CHAPTERS[topic].find(x=>x.id===level);
      const families=[...new Set(section.pages.flatMap(page=>page.families))];
      for(const family of families){
        const cue=fluencyQuestionScaffold(level,family);
        assert.ok(cue,labelFor(topic,level,family));
        assert.equal(cue.label,level==='level-1'?'Start here':'Method checklist');
        assert.equal(cue.steps.length,level==='level-1'?1:3);
        assert.ok(cue.steps.every(step=>step.length>24));
        assert.ok(!cue.steps.some(step=>/\d{3,}/.test(step)),
          'Cues should not contain generated numerical answers');
        assert.ok(!cue.steps.some(step=>step.includes('Check the final value = ')));
      }
    }
  }
});
function labelFor(topic,level,family){return topic+' '+level+' '+family;}
test('Independent and Challenge do not reveal the method until a result is checked',()=>{
  for(const level of ['level-3','level-4']){
    assert.equal(fluencyQuestionScaffold(level,'discriminant'),null);
    assert.equal(fluencyQuestionScaffold(level,'sample-percent'),null);
    assert.equal(showFluencySkill(level,false),false);
    assert.equal(showFluencySkill(level,true),true);
  }
  for(const level of ['level-1','level-2']){
    assert.equal(showFluencySkill(level,false),true);
    assert.equal(showFluencySkill(level,true),true);
  }
  assert.equal(showFluencySkill('bad-level',true),false);
});
test('Level labels are validated rather than silently accepting incorrect names',()=>{
  const copies=Object.fromEntries(Object.entries(FLUENCY_CHAPTERS).map(
    ([key,sections])=>[key,sections.map(s=>({...s}))]));
  copies.quadratics[0].label='Level 1: Foundations';
  assert.ok(validateFluencyChapters(copies).some(s=>s.includes('invalid Fluency level')));
  copies.quadratics[0].label='Level 1: Guided';
  assert.deepEqual(validateFluencyChapters(copies),[]);
});
