import test from 'node:test';
import assert from 'node:assert/strict';
import {MODELLING_CHAPTERS,MODELLING_PHASES} from '../src/modelling-content.js';
import {MODELLING_VERSION,MODELLING_RATINGS,MODEL_DRAFT_LIMIT,MODEL_PHASE_IDS,
  modellingLevels,modellingPages,modellingTasks,modellingTask,emptyModellingProgress,
  modellingRecord,hydrateModellingProgress,blankModellingEntry,attemptedModelling,
  canSelfRateModel,saveModelReview,queueModelling,modellingLevelSummary,
  validateModellingChapters} from '../src/modelling-engine.js';
const topics=['quadratics','sampling'];
const ids=['formulate','calculate','interpret','evaluate'];
const written=()=>{const e=blankModellingEntry();for(const id of ids)e.drafts[id]='I used the mathematical information and checked the context carefully.';
  e.compared=true;e.checked=[true,true,true];return e;};
test('both example topics have 32 complete, genuinely four-stage modelling investigations',()=>{
  assert.deepEqual(validateModellingChapters(),[]);
  assert.deepEqual(MODELLING_PHASES.map(p=>p[0]),ids);
  assert.deepEqual(MODEL_PHASE_IDS,ids);
  assert.equal(MODEL_DRAFT_LIMIT,2500);
  assert.equal(MODELLING_VERSION,1);
  for(const topic of topics){
    const levels=modellingLevels(topic);assert.equal(levels.length,4);
    let n=0;const seen=new Set();
    for(let i=0;i<4;i++){
      const level=levels[i];assert.equal(level.id,'level-'+(i+1));
      assert.equal(modellingPages(topic,level.id).length,2);
      for(const page of level.pages){
        assert.equal(page.type,'modelling');assert.equal(page.tasks.length,2);
        for(const t of page.tasks){
          n++;assert.ok(!seen.has(t.scenario));seen.add(t.scenario);
          assert.equal(modellingTask(topic,level.id,page.id,t.id),t);
          assert.equal(t.phases.length,4);assert.equal(t.checks.length,3);
          assert.ok(t.scenario.length>=85);
          for(let j=0;j<4;j++){
            const phase=t.phases[j];assert.equal(phase.id,ids[j]);
            assert.ok(phase.model.length>=65);
            assert.ok(phase.nudge.length>=30);
            assert.ok(phase.prompt.length>=35);
          }
        }
      }
    }
    assert.equal(n,16);
  }
});
test('mathematical exemplars include exact constraints, quantification, domain and sensitivity',()=>{
  const model=(topic,level,page,id,phase)=>modellingTask(topic,level,page,id).phases
    .find(p=>p.id===phase).model;
  const check=[
    ['quadratics',1,'shapes','parabolic-arch','calculate','4.5 m'],
    ['quadratics',1,'shapes','fountain-path','evaluate','5.25 m'],
    ['quadratics',1,'motion','thrown-ball','calculate','21 m'],
    ['quadratics',1,'motion','advertising-canopy','evaluate','3.75 m'],
    ['quadratics',2,'design','wall-garden','evaluate','242 m²'],
    ['quadratics',2,'design','poster-area','calculate','400 cm²'],
    ['quadratics',2,'decisions','ticket-price','calculate','$500'],
    ['quadratics',2,'decisions','fundraising-tickets','calculate','$845'],
    ['quadratics',3,'measured-motion','projectile-data','calculate','13.25 m'],
    ['quadratics',3,'measured-motion','braking-distance','evaluate','40 m'],
    ['quadratics',3,'validation','solar-output','interpret','−4'],
    ['quadratics',3,'validation','canopy-residual','interpret','0.3 m'],
    ['quadratics',4,'constrained-optimisation','greenhouse-safety','calculate','432 m²'],
    ['quadratics',4,'constrained-optimisation','profit-versus-revenue','calculate','$312'],
    ['quadratics',4,'fit-and-robustness','held-out-measurement','interpret','−1 m'],
    ['quadratics',4,'fit-and-robustness','barrier-clearance','evaluate','√10'],
    ['sampling',1,'population-estimates','cinema-preference','calculate','360'],
    ['sampling',1,'population-estimates','lunch-choices','calculate','585'],
    ['sampling',1,'compare-predictions','bus-use','calculate','168'],
    ['sampling',1,'compare-predictions','weekly-library','calculate','432'],
    ['sampling',2,'two-group-weights','sports-club-weighting','calculate','400'],
    ['sampling',2,'two-group-weights','swimming-programme','calculate','425'],
    ['sampling',2,'multiple-group-weights','exercise-rates','calculate','420'],
    ['sampling',2,'multiple-group-weights','three-age-groups','calculate','340'],
    ['sampling',3,'response-uncertainty','nonresponse-range','calculate','1,400'],
    ['sampling',3,'response-uncertainty','ten-missing','calculate','520'],
    ['sampling',3,'coverage-and-validation','incomplete-frame','calculate','570'],
    ['sampling',3,'coverage-and-validation','held-out-survey','calculate','1,090'],
    ['sampling',4,'sensitivity','changing-population-mix','calculate','500'],
    ['sampling',4,'sensitivity','weighting-sensitivity','calculate','425'],
    ['sampling',4,'competing-models','volunteers-vs-random','calculate','2,100'],
    ['sampling',4,'competing-models','unequal-frame-check','calculate','490']
  ];
  for(const [topic,n,page,id,phase,expected] of check)
    assert.ok(model(topic,'level-'+n,page,id,phase).includes(expected),id+' missing '+expected);
  assert.equal(60*36/60,36); // sample scale is explicitly handled below
  assert.equal(600*36/60,360);
  assert.equal(200*.8+800*.3,400);
  assert.equal(300*.6+700*.35,425);
  assert.equal(200*.25+500*.4+300*.8,490);
  assert.equal(1200*18/50,432);
  assert.equal((54+30)/120*2000,1400);
  assert.equal(2*(10)**2,200);
  assert.equal(44**2/8,242);
  assert.equal((-2*(17.5**2)+70*17.5-300),312.5);
  assert.equal((-4*(.5**2)+16*.5+3),10);
  assert.equal((-4*(3.5**2)+16*3.5+3),10);
});
test('schema detects missing model phase, duplicate scenarios and generic review content',()=>{
  const bad=structuredClone(MODELLING_CHAPTERS);
  bad.sampling[0].pages[0].tasks[1].scenario=bad.sampling[0].pages[0].tasks[0].scenario;
  bad.quadratics[1].pages[1].tasks[0].phases.pop();
  bad.quadratics[2].pages[1].tasks[0].checks=[];
  bad.sampling[3].pages[1].type='questions';
  const errors=validateModellingChapters(bad).join(' | ');
  assert.match(errors,/repeated scenario/);
  assert.match(errors,/missing modelling phases/);
  assert.match(errors,/missing specific review checks/);
  assert.match(errors,/invalid page/);
});
test('self-review requires all four response stages and properly distinguishes assisted attempts',()=>{
  const fresh=blankModellingEntry();
  assert.deepEqual(MODELLING_RATINGS,['retry','supported','independent']);
  assert.equal(attemptedModelling(fresh),false);
  assert.equal(canSelfRateModel(fresh,'retry'),false);
  fresh.compared=true;
  assert.equal(canSelfRateModel(fresh,'retry'),true);
  assert.equal(canSelfRateModel(fresh,'supported'),false);
  const complete=written();
  assert.equal(attemptedModelling(complete),true);
  assert.equal(canSelfRateModel(complete,'independent'),true);
  assert.equal(canSelfRateModel({...complete,assisted:true},'independent'),false);
  assert.equal(canSelfRateModel({...complete,modelFirst:true},'independent'),false);
  assert.equal(canSelfRateModel({...complete,modelFirst:true},'supported'),true);
  assert.equal(canSelfRateModel({...complete,checked:[true,false,true]},'supported'),false);
  assert.equal(canSelfRateModel({...complete,rating:'retry'},'independent'),false);
  assert.equal(canSelfRateModel({...complete,compared:false},'retry'),false);
  assert.equal(canSelfRateModel({...complete,drafts:{...complete.drafts,evaluate:''}},'independent'),false);
  assert.equal(canSelfRateModel(complete,'auto-correct'),false);
});
test('only judgement metadata is saved locally, not any draft or model writing',()=>{
  const empty=emptyModellingProgress(),entry=written();
  entry.drafts.formulate='<script>unsafe()</script> This is the written model.';
  assert.throws(()=>saveModelReview(empty,'sampling','level-1','missing','unknown',entry,'retry'),/Unknown/);
  assert.throws(()=>saveModelReview(empty,'sampling','level-1','population-estimates','cinema-preference',
    {...entry,assisted:true},'independent'),/requirements not met/);
  const p=saveModelReview(empty,'sampling','level-1','population-estimates','cinema-preference',
    entry,'independent',1782901000100);
  assert.deepEqual(modellingRecord(p,'level-1','population-estimates','cinema-preference'),{
    rating:'independent',attempted:true,assisted:false,modelFirst:false,checked:3,
    reviews:1,reviewedAt:1782901000100
  });
  const saved=JSON.stringify(p);
  assert.ok(!saved.includes('<script>'));
  assert.ok(!saved.includes('written'));
  assert.ok(!saved.includes('drafts'));
  assert.ok(!saved.includes('This is the written model')); 
  assert.equal(modellingRecord(empty,'level-1','population-estimates','cinema-preference'),null);
});
test('targeted queue prioritises retry, then supported, then unseen; never overwrites other pages',()=>{
  const topic='quadratics',level='level-1',page='shapes';
  const ids=modellingTasks(topic,level,page).map(t=>t.id);
  let p=emptyModellingProgress();
  assert.deepEqual(queueModelling(topic,level,page,p,'all'),ids);
  assert.deepEqual(queueModelling(topic,level,page,p,'focus'),ids);
  p=saveModelReview(p,topic,level,page,ids[0],written(),'independent');
  assert.deepEqual(queueModelling(topic,level,page,p,'focus'),[ids[1]]);
  p=saveModelReview(p,topic,level,page,ids[1],{...written(),assisted:true},'supported');
  assert.deepEqual(queueModelling(topic,level,page,p,'focus'),[ids[1]]);
  assert.deepEqual(modellingLevelSummary(topic,level,p),{
    total:4,new:2,retry:0,supported:1,independent:1
  });
  p=saveModelReview(p,topic,level,page,ids[0],{...written(),modelFirst:true},'retry');
  assert.deepEqual(queueModelling(topic,level,page,p,'focus'),ids);
  assert.equal(modellingRecord(p,level,page,ids[0]).reviews,2);
  assert.throws(()=>queueModelling(topic,level,page,p,'due'),/Unknown/);
});
test('local restoration ignores corrupted, foreign, obsolete and inconsistent records',()=>{
  const p=saveModelReview(emptyModellingProgress(),'sampling','level-1','population-estimates',
    'cinema-preference',written(),'independent',1782901000100);
  assert.deepEqual(hydrateModellingProgress(JSON.stringify(p),'sampling'),p);
  assert.deepEqual(hydrateModellingProgress('broken json','sampling'),emptyModellingProgress());
  assert.deepEqual(hydrateModellingProgress({version:5,records:{}},'sampling'),emptyModellingProgress());
  assert.deepEqual(hydrateModellingProgress(p,'quadratics'),emptyModellingProgress());
  const r={version:1,records:{
    'level-1:population-estimates:cinema-preference':{
      rating:'independent',attempted:true,assisted:true,modelFirst:false,
      checked:3,reviews:1,reviewedAt:1782901000100},
    'level-1:population-estimates:lunch-choices':{
      rating:'supported',attempted:true,assisted:true,modelFirst:false,
      checked:3,reviews:1,reviewedAt:1782901000100},
    'unknown:unknown:unknown':{rating:'retry',attempted:false,assisted:false,
      modelFirst:false,checked:0,reviews:1,reviewedAt:1782901000100}
  }};
  const safe=hydrateModellingProgress(r,'sampling');
  assert.equal(Object.keys(safe.records).length,1);
  assert.equal(modellingRecord(safe,'level-1','population-estimates','lunch-choices').rating,'supported');
  assert.equal(modellingRecord(safe,'level-1','population-estimates','cinema-preference'),null);
});
