import test from 'node:test';
import assert from 'node:assert/strict';
import {samplingExperiment,quadraticProperties,quadraticValue,quadraticEquation,
  validateUnderstandContent,STRATUM_A,STRATUM_B,POPULATION_SIZE,SAMPLE_SIZE,GRAPH_DEFAULTS} from '../src/understand-engine.js';
import {UNDERSTAND_CONTENT} from '../src/understand-content.js';
import {TOPICS} from '../src/topics.js';
import {validateTopics} from '../src/logic.js';

test('all Understand subsections use the intended high-quality content types',()=>{
  assert.deepEqual(validateTopics(),[]);
  for(const topicId of ['sampling','quadratics']){
    const sections=UNDERSTAND_CONTENT[topicId];
    assert.deepEqual(validateUnderstandContent(sections),[]);
    assert.deepEqual(sections.map(s=>s.id),[
      'big-idea','how-it-works','visual-explanations','worked-examples']);
    assert.equal(TOPICS[topicId].chapters.understand,sections);
    assert.ok(sections.every(s=>s.pages.length>=2));
    for(const page of sections[0].pages){
      assert.equal(page.type,'lesson');
      assert.ok(page.blocks.some(b=>b.kind==='concept-check'));
    }
    for(const page of sections[1].pages){
      assert.equal(page.type,'lesson');
      assert.ok(page.blocks.some(b=>b.kind==='stepper'||b.kind==='concept-check'));
    }
    assert.ok(sections[3].pages.every(p=>p.type==='workshop'));
    for(const page of sections[3].pages){
      assert.ok(page.model.steps.length>=3);
      assert.ok(page.independent.steps.length>=2);
      assert.equal(page.guided.choices.filter(c=>c[3]).length,1);
    }
  }
  assert.deepEqual(UNDERSTAND_CONTENT.sampling[2].pages.map(p=>p.type),
    ['sampling-lab','sampling-lab']);
  assert.deepEqual(UNDERSTAND_CONTENT.quadratics[2].pages.map(p=>p.type),
    ['graph','graph']);
});
test('sampling selections are reproducible, valid and never contain duplicates',()=>{
  for(let seed=1;seed<=300;seed++){
    for(const method of ['census','random','systematic','stratified','convenience']){
      const result=samplingExperiment(method,seed);
      assert.deepEqual(result,samplingExperiment(method,seed));
      assert.equal(result.size,method==='census'?POPULATION_SIZE:SAMPLE_SIZE);
      assert.equal(new Set(result.selected).size,result.size);
      assert.ok(result.selected.every(i=>Number.isInteger(i)&&i>=0&&i<POPULATION_SIZE));
      assert.equal(result.groupA+result.groupB,result.size);
      assert.equal(result.proportionA+result.proportionB,100);
      assert.equal(result.groupA,result.selected.filter(i=>i<STRATUM_A).length);
      assert.equal(result.groupB,result.selected.filter(i=>i>=STRATUM_A).length);
      if(method==='stratified'){
        assert.equal(result.groupA,4);
        assert.equal(result.groupB,6);
      }
      if(method==='systematic'){
        assert.ok(result.randomStart>=1&&result.randomStart<=4);
        assert.deepEqual(result.selected,
          Array.from({length:SAMPLE_SIZE},(_,i)=>result.randomStart-1+i*4));
      }
      if(method==='convenience'){
        assert.equal(result.groupA,10);
        assert.equal(result.groupB,0);
      }
      if(method==='census'){
        assert.equal(result.groupA,STRATUM_A);
        assert.equal(result.groupB,STRATUM_B);
      }
    }
  }
  assert.notDeepEqual(samplingExperiment('random',10).selected,
    samplingExperiment('random',11).selected);
  assert.throws(()=>samplingExperiment('unrecognised'),/Unknown sampling method/);
});
test('quadratic vertex and displayed algebra match the plotted function',()=>{
  for(const magnitude of [0.5,1,1.5,2,2.5]){
    for(const sign of [-1,1]){
      for(const h of [-3,-1,0,2,3]){
        for(const k of [-5,-2,0,4]){
          const model={magnitude,h,k,sign},props=quadraticProperties(model);
          assert.deepEqual(props.vertex,[h,k]);
          assert.equal(props.axis,h);
          assert.equal(props.turningType,sign===1?'minimum':'maximum');
          assert.equal(quadraticValue(h,model),k);
          for(const distance of [1,2,3]){
            assert.equal(quadraticValue(h-distance,model),
              quadraticValue(h+distance,model));
            const offset=quadraticValue(h+distance,model)-k;
            assert.equal(Math.sign(offset),sign);
          }
          assert.ok(quadraticEquation(model).startsWith('y = '));
        }
      }
    }
  }
  assert.equal(quadraticEquation({magnitude:1,sign:1,h:0,k:0}),'y = x²');
  assert.equal(quadraticEquation({magnitude:2,sign:-1,h:-3,k:5}),'y = −2(x + 3)² + 5');
  assert.equal(quadraticEquation({magnitude:.5,sign:1,h:2,k:-4}),'y = 0.5(x − 2)² − 4');
  assert.deepEqual(quadraticProperties(GRAPH_DEFAULTS.shape).vertex,[0,0]);
  assert.deepEqual(quadraticProperties(GRAPH_DEFAULTS.position).vertex,[0,-2]);
  assert.throws(()=>quadraticProperties({magnitude:0,sign:1,h:0,k:0}),/Invalid/);
});
test('schema validator rejects invalid concept answers and incomplete worked examples',()=>{
  const bad=structuredClone(UNDERSTAND_CONTENT.sampling);
  bad[0].pages[0].blocks.find(b=>b.kind==='concept-check').choices
    .forEach(c=>{c.correct=false;});
  bad[3].pages[0].guided.choices[0][3]=true;
  bad[3].pages[0].guided.choices[1][3]=true;
  bad[1].pages[0].blocks.find(b=>b.kind==='stepper').steps=[];
  const issues=validateUnderstandContent(bad).join(' | ');
  assert.match(issues,/Incomplete concept check/);
  assert.match(issues,/Guided question requires one correct answer/);
  assert.match(issues,/Incomplete method steps/);
});
test('sample explanations and examples use mathematically consistent values',()=>{
  const sampling=UNDERSTAND_CONTENT.sampling;
  const steps=sampling[1].pages[0].blocks.find(b=>b.kind==='stepper').steps;
  assert.equal(30/6,5);
  assert.match(steps.join(' '),/30 ÷ 6 = 5/);
  assert.match(steps.join(' '),/3, 8, 13, 18, 23 and 28/);
  assert.equal(150/400*40,15);
  assert.equal(250/400*40,25);
  const quadratic=UNDERSTAND_CONTENT.quadratics;
  const turning=quadratic[3].pages[0].model.steps.join(' ');
  assert.match(turning,/\(−1, 5\)/);
  const roots=quadratic[3].pages[1].model.steps.join(' ');
  assert.match(roots,/x = 2 or x = 3/);
});
