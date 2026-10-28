import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../src/topics.js';
import {validateTopics,resolveRoute} from '../src/logic.js';
import {REASONING_CHAPTERS,REASONING_MODES} from '../src/reasoning-content.js';
import {REASONING_VERSION,REASONING_RATINGS,REASONING_NOTE_LIMIT,
  emptyReasoningProgress,hydrateReasoningProgress,tasksFor,taskFor,
  reviewReasoning,recordFor,reasoningSummary,queueReasoning,validateReasoningContent
} from '../src/reasoning-engine.js';

const valid=(rating='revisit',other={})=>({
  rating,checked:rating==='ready'?3:0,attempted:rating!=='revisit',
  assisted:false,modelFirst:false,...other
});
test('four distinct reasoning modes contain 32 original, fully reviewed mathematical arguments',()=>{
  assert.deepEqual(validateTopics(),[]);
  assert.deepEqual(validateReasoningContent(),[]);
  assert.deepEqual(REASONING_MODES,['explain','justify','critique','generalise']);
  assert.equal(REASONING_NOTE_LIMIT,2500);
  assert.equal(REASONING_VERSION,1);
  for(const topicId of ['sampling','quadratics']){
    const sections=REASONING_CHAPTERS[topicId];
    assert.deepEqual(sections.map(s=>s.id),REASONING_MODES);
    assert.deepEqual(TOPICS[topicId].chapters.reasoning,sections);
    let count=0;
    for(const section of sections){
      assert.equal(section.pages.length,1);
      assert.equal(section.pages[0].type,'reasoning');
      assert.equal(section.pages[0].id,'main');
      assert.equal(section.pages[0].tasks.length,4);
      assert.equal(resolveRoute('#/'+topicId+'/reasoning/'+section.id).sectionId,section.id);
      const local=new Set();
      for(const task of section.pages[0].tasks){
        count++;
        assert.ok(!local.has(task.id));local.add(task.id);
        assert.ok(task.prompt.length>=45);
        assert.equal(task.criteria.length,3);
        assert.equal(task.model.length,3);
        assert.ok(task.model.every(m=>m.length>=22));
        assert.ok(task.criteria.every(c=>c.next.length>=14));
        assert.ok(!task.prompt.includes('AO1')&&!task.prompt.includes('AO2'));
      }
    }
    assert.equal(count,16);
  }
  assert.equal(tasksFor('missing','explain').length,0);
  assert.equal(tasksFor('sampling','absent').length,0);
  assert.equal(taskFor('sampling','explain','missing'),undefined);
});
test('worked reasoning examples contain correct mathematical checks and caveats',()=>{
  const get=(topic,mode,id)=>taskFor(topic,mode,id);
  const model=(topic,mode,id)=>get(topic,mode,id).model.join(' ');
  assert.match(model('sampling','explain','systematic-start'),/240 ÷ 30 = 8/);
  assert.match(model('sampling','justify','year-group-allocation'),/12 Year 12/);
  assert.match(model('sampling','justify','year-group-allocation'),/28 Year 13/);
  assert.match(model('sampling','critique','equal-strata'),/10 boarders and 30 day pupils/);
  assert.match(model('sampling','generalise','allocation-rule'),/nᵢ = nNᵢ\/N/);
  assert.match(model('sampling','generalise','inclusion-probability'),/n\/N/);
  assert.match(model('quadratics','explain','negative-vertex'),/maximum value is 4 at x = 2/);
  assert.match(model('quadratics','explain','discriminant-reason'),/−12/);
  assert.match(model('quadratics','critique','sign-vertex'),/\(−3, −2\)/);
  assert.match(model('quadratics','critique','complete-square-factor'),/2\(x \+ 2\)² − 5/);
  assert.match(model('quadratics','generalise','vertex-formula'),/x = −b\/\(2a\)/);
  assert.match(model('quadratics','generalise','symmetric-inputs'),/f\(h \+ t\) = f\(h − t\)/);
  for(const [topic,sections] of Object.entries(REASONING_CHAPTERS)){
    for(const section of sections)
      for(const t of section.pages[0].tasks)
        assert.ok(!t.model.join(' ').includes('automatically correct'),topic+'/'+t.id);
  }
});
test('content validator detects malformed task, missing success criteria and duplicate prompts',()=>{
  const invalid=structuredClone(REASONING_CHAPTERS);
  invalid.sampling[0].pages[0].tasks[1].prompt=invalid.sampling[0].pages[0].tasks[0].prompt;
  invalid.sampling[1].pages[0].tasks[2].model=[];
  invalid.quadratics[2].pages[0].tasks[0].criteria=[];
  invalid.quadratics[3].pages.push({id:'extra',type:'questions'});
  const errors=validateReasoningContent(invalid).join(' / ');
  assert.match(errors,/duplicate prompt/);
  assert.match(errors,/incomplete mathematical model/);
  assert.match(errors,/incomplete review criteria/);
  assert.match(errors,/activity subsection must contain one reasoning page/);
});
test('review status is explicit self-report and never auto-verifies text answers',()=>{
  const none=emptyReasoningProgress();
  assert.deepEqual(none,{version:1,records:{}});
  assert.notEqual(none,emptyReasoningProgress());
  assert.deepEqual(REASONING_RATINGS,['revisit','developing','ready']);
  assert.throws(()=>reviewReasoning(none,'sampling','explain','library-frame',
    valid('ready',{checked:2})),/Check every success criterion/);
  assert.throws(()=>reviewReasoning(none,'sampling','explain','library-frame',
    valid('developing',{attempted:false})),/Write an explanation/);
  assert.throws(()=>reviewReasoning(none,'sampling','explain','library-frame',
    valid('correct')),/Invalid reasoning self-review/);
  assert.throws(()=>reviewReasoning(none,'sampling','explain','no-id',
    valid('revisit')),/Unknown reasoning task/);
  assert.throws(()=>reviewReasoning(none,'quadratics','critique','sign-vertex',
    valid('ready'),-1),/Invalid review time/);
  const reviewed=reviewReasoning(none,'sampling','explain','library-frame',
    valid('ready',{assisted:true,modelFirst:true}),1782680000000);
  assert.deepEqual(recordFor(reviewed,'explain','library-frame'),
    {rating:'ready',checked:3,attempted:true,assisted:true,
     modelFirst:true,reviews:1,reviewedAt:1782680000000});
  assert.equal(recordFor(none,'explain','library-frame'),null);
  assert.equal(reviewed.records['explain:library-frame'].rating,'ready');
  assert.ok(!JSON.stringify(reviewed).includes('Students who use the library'));
  assert.ok(!Object.keys(reviewed.records).some(key=>key.includes('text')||key.includes('draft')));
  const updated=reviewReasoning(reviewed,'sampling','explain','library-frame',
    valid('revisit'),1782680010000);
  assert.equal(recordFor(updated,'explain','library-frame').reviews,2);
  assert.equal(recordFor(updated,'explain','library-frame').rating,'revisit');
});
test('priority practice orders revisit, developing, new and excludes self-rated ready',()=>{
  let progress=emptyReasoningProgress();
  const mode='justify',topic='sampling';
  const items=tasksFor(topic,mode);
  assert.deepEqual(queueReasoning(topic,mode,progress,'all'),items.map(t=>t.id));
  assert.deepEqual(queueReasoning(topic,mode,progress,'focus'),items.map(t=>t.id));
  progress=reviewReasoning(progress,topic,mode,items[0].id,valid('ready'));
  progress=reviewReasoning(progress,topic,mode,items[1].id,valid('developing'));
  progress=reviewReasoning(progress,topic,mode,items[2].id,valid('revisit'));
  assert.deepEqual(queueReasoning(topic,mode,progress,'focus'),
    [items[2].id,items[1].id,items[3].id]);
  assert.deepEqual(reasoningSummary(topic,mode,progress),
    {total:4,new:1,reviewed:3,revisit:1,developing:1,ready:1});
  assert.deepEqual(reasoningSummary(topic,'explain',progress),
    {total:4,new:4,reviewed:0,revisit:0,developing:0,ready:0});
  for(const task of items){
    if(!recordFor(progress,mode,task.id)||
       recordFor(progress,mode,task.id).rating!=='ready')
      progress=reviewReasoning(progress,topic,mode,task.id,valid('ready'));
  }
  assert.deepEqual(queueReasoning(topic,mode,progress,'focus'),[]);
  assert.throws(()=>queueReasoning(topic,mode,progress,'due'),/Unknown reasoning practice selection/);
});
test('hydration repairs corrupted and foreign records but preserves valid self-reviews',()=>{
  let progress=reviewReasoning(emptyReasoningProgress(),'sampling','explain','library-frame',
    valid('developing',{checked:2,assisted:true}),1782680000100);
  assert.deepEqual(hydrateReasoningProgress(JSON.stringify(progress),'sampling'),progress);
  assert.deepEqual(hydrateReasoningProgress('invalid json','sampling'),emptyReasoningProgress());
  assert.deepEqual(hydrateReasoningProgress({version:2,records:{}} ,'sampling'),emptyReasoningProgress());
  assert.deepEqual(hydrateReasoningProgress(progress,'quadratics'),emptyReasoningProgress());
  const damaged={version:1,records:{
    'explain:library-frame':{rating:'ready',checked:50,attempted:true,assisted:false,
      modelFirst:false,reviews:2,reviewedAt:1782680000000},
    'explain:systematic-start':{rating:'developing',checked:2,attempted:true,
      assisted:false,modelFirst:false,reviews:4,reviewedAt:1782680000000},
    '__proto__:evil':{rating:'ready',checked:3,attempted:true,assisted:false,modelFirst:false},
    'explain:nonexistent':{rating:'ready',checked:3,attempted:true,assisted:false,modelFirst:false}
  }};
  const hydrated=hydrateReasoningProgress(damaged,'sampling');
  assert.equal(recordFor(hydrated,'explain','library-frame'),null);
  assert.equal(Object.keys(hydrated.records).length,1);
  assert.equal(recordFor(hydrated,'explain','systematic-start').rating,'developing');
  assert.equal(hydrated.records['__proto__:evil'],undefined);
});
