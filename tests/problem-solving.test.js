import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../src/topics.js';
import {validateTopics,resolveRoute,sectionsFor} from '../src/logic.js';
import {PROBLEM_SOLVING_CHAPTERS,PROBLEM_SOLVING_LEVELS} from '../src/problem-solving-content.js';
import {PROBLEM_SOLVING_VERSION,PROBLEM_SOLVING_RATINGS,
  emptyProblemSolvingProgress,hydrateProblemSolvingProgress,levelsFor,
  pagesForLevel,problemsFor,problemFor,taskKey,recordFor,attemptedProblem,
  canRateProblem,reviewProblem,queueProblems,summaryForLevel,
  validateProblemSolvingChapters} from '../src/problem-solving-engine.js';
const topics=['sampling','quadratics'];
const written={plan:'Use the known conditions to choose a mathematical form.',
  working:'I linked the conditions and checked the computed result.'};
const prepared=({rating=null,assisted=false,modelFirst=false,checks=[true,true,true],
  modelComplete=true,plan=written.plan,working=written.working}={})=>({
  plan,working,checks,modelComplete,assisted,modelFirst,rating
});
test('both demo topics have four level tabs, eight internal pages and sixteen distinct multi-step tasks',()=>{
  assert.deepEqual(validateTopics(),[]);
  assert.deepEqual(validateProblemSolvingChapters(),[]);
  assert.deepEqual(PROBLEM_SOLVING_LEVELS,['level-1','level-2','level-3','level-4']);
  for(const topic of topics){
    const levels=levelsFor(topic);
    assert.deepEqual(levels,PROBLEM_SOLVING_CHAPTERS[topic]);
    assert.deepEqual(TOPICS[topic].chapters.problemSolving,levels);
    assert.equal(sectionsFor(TOPICS[topic],'problemSolving').length,4);
    assert.equal(levels.length,4);
    let count=0;
    for(const level of levels){
      assert.equal(level.pages.length,2);
      assert.ok(level.description.length>30);
      for(const page of level.pages){
        assert.equal(page.type,'problem-solving');
        assert.equal(page.tasks.length,2);
        assert.ok(page.focus.length>25);
        const route=resolveRoute('#/'+topic+'/problemSolving/'+level.id+'/'+page.id);
        assert.equal(route.pageId,page.id);
        assert.equal(route.sectionId,level.id);
        for(const problem of page.tasks){
          count++;
          assert.ok(problem.prompt.length>=60);
          assert.equal(problem.options.length,2);
          assert.equal(problem.hints.length,2);
          assert.ok(problem.steps.length>=3);
          assert.equal(problem.checks.length,3);
          assert.ok(problem.options.every(o=>o.feedback.length>=40));
          assert.ok(problem.steps.every(step=>step.length>=55));
          assert.equal(problemFor(topic,level.id,page.id,problem.id),problem);
        }
      }
    }
    assert.equal(count,16);
  }
  assert.equal(PROBLEM_SOLVING_VERSION,1);
  assert.deepEqual(PROBLEM_SOLVING_RATINGS,['retry','supported','independent']);
});
test('mathematical solutions and bounds remain consistent across prototype topics',()=>{
  const solution=(topic,level,page,id)=>problemFor(topic,level,page,id).steps.join(' ');
  const sample=[
    ['level-1','allocations','two-years','24 + 16 = 40'],
    ['level-1','allocations','starting-position','7 + 14 × 12 = 175'],
    ['level-1','sample-plan','boarders-day','9 places'],
    ['level-1','sample-plan','two-systematic-groups','90/9 = 150/15 = 10'],
    ['level-2','multi-strata','three-strata','6, 160 × 3/40 = 12'],
    ['level-2','multi-strata','random-start-check','11 + 19×15 = 296'],
    ['level-2','reverse-allocation','unknown-strata','B = 9/0.075 = 120'],
    ['level-2','reverse-allocation','systematic-in-strata','96/12 = 8'],
    ['level-3','integer-constraints','rounding-three','6, 11 and 20'],
    ['level-3','integer-constraints','periodic-frame','same category'],
    ['level-3','design-limits','missing-frame','7 boarders, 13'],
    ['level-3','design-limits','is-position-selected','234'],
    ['level-4','reverse-sequence','infer-systematic','84/6 = 14'],
    ['level-4','reverse-sequence','infer-populations','Total population is 96 + 144 + 80 = 320'],
    ['level-4','constraints','awkward-strata','14 and 26'],
    ['level-4','constraints','coverage-and-order','8 from the first group, 16']
  ];
  for(const [level,page,id,expected] of sample)
    assert.ok(solution('sampling',level,page,id).includes(expected),id+' missing '+expected);
  const quadratic=[
    ['level-1','roots-and-intercept','two-roots-intercept','y = 2(x − 2)(x − 5)'],
    ['level-1','roots-and-intercept','vertex-and-point','y = 2(x − 2)² − 3'],
    ['level-1','hidden-information','known-root-unknown-b','b = −7'],
    ['level-1','hidden-information','roots-and-minimum','(1, −8)'],
    ['level-2','form-choice','scaled-roots','y = 3(x + 1)(x − 4)'],
    ['level-2','form-choice','vertex-scaled','−2(x + 1)² + 5'],
    ['level-2','parameter-decisions','equal-roots-parameter','k = 4 or k = −8'],
    ['level-2','parameter-decisions','axis-two-points','roots x = 1 and x = 5'],
    ['level-3','constraints','roots-and-height','y = 2(x − 1)(x − 7)'],
    ['level-3','constraints','missing-root-axis','x² − 10x + 16'],
    ['level-3','cross-check','three-points-roots','−0.25'],
    ['level-3','cross-check','always-positive','m > 4'],
    ['level-4','parameter-roots','touching-parameter','k = 1 or 2'],
    ['level-4','parameter-roots','quadratics-touch','(3, 6)'],
    ['level-4','all-real-conditions','positive-parameter-range','1 − 2√5 < m < 1 + 2√5'],
    ['level-4','all-real-conditions','axis-and-values','roots x = 1 ± √6']
  ];
  for(const [level,page,id,expected] of quadratic)
    assert.ok(solution('quadratics',level,page,id).includes(expected),id+' missing '+expected);
  assert.equal(240/40,6);
  assert.equal(300/20,15);
  assert.equal(180/15,12);
  assert.equal((142-58)/(11-5),14);
  assert.equal(2+15*14,212);
  assert.deepEqual([50*37/300,90*37/300,160*37/300].map(Math.floor),[6,11,19]);
  assert.equal(14+26,40);
  assert.ok(137/14%1!==0&&263/26%1!==0);
  for(const k of [1,2])assert.equal((k+1)**2-(5*k-1),0);
  assert.equal(9-12+9,6);
  assert.equal(-9+24-9,6);
  assert.ok((1-2*Math.sqrt(5))<1&&(1+2*Math.sqrt(5))>1);
});
test('schema validation catches duplicate cases, incomplete worked steps and unrelated page types',()=>{
  const invalid=structuredClone(PROBLEM_SOLVING_CHAPTERS);
  invalid.sampling[0].pages[0].tasks[1].prompt=invalid.sampling[0].pages[0].tasks[0].prompt;
  invalid.quadratics[1].pages[0].tasks[0].steps=[];
  invalid.quadratics[3].pages[1].tasks[0].options=[];
  invalid.sampling[3].pages[1].type='questions';
  const issues=validateProblemSolvingChapters(invalid).join(' ');
  assert.match(issues,/repeated task/);
  assert.match(issues,/incomplete graduated support/);
  assert.match(issues,/invalid strategy comparison/);
  assert.match(issues,/invalid practice page/);
});
test('plans and working are necessary for claimed success but a stuck student can request retry',()=>{
  assert.equal(attemptedProblem(prepared()),true);
  assert.equal(attemptedProblem(prepared({plan:'a'})),false);
  assert.equal(attemptedProblem(prepared({working:'too short'})),false);
  assert.equal(canRateProblem(prepared(),'independent'),true);
  assert.equal(canRateProblem(prepared({assisted:true}),'independent'),false);
  assert.equal(canRateProblem(prepared({modelFirst:true}),'independent'),false);
  assert.equal(canRateProblem(prepared({checks:[true,false,true]}),'independent'),false);
  assert.equal(canRateProblem(prepared({modelComplete:false}),'retry'),false);
  assert.equal(canRateProblem(prepared({plan:'',working:''}),'retry'),true);
  assert.equal(canRateProblem(prepared({assisted:true}),'supported'),true);
  assert.equal(canRateProblem(prepared({modelFirst:true}),'supported'),true);
  assert.equal(canRateProblem(prepared({checks:[true,true,false]}),'supported'),false);
  assert.equal(canRateProblem(prepared({rating:'retry'}),'supported'),false);
  assert.equal(canRateProblem(prepared(),'correct'),false);
});
test('review saving requires completed model comparison and never stores student prose',()=>{
  const empty=emptyProblemSolvingProgress();
  const task=['quadratics','level-1','roots-and-intercept','two-roots-intercept'];
  assert.deepEqual(empty,{version:1,records:{}});
  assert.throws(()=>reviewProblem(empty,...task,prepared({modelComplete:false}),'retry'),/conditions not met/);
  assert.throws(()=>reviewProblem(empty,...task,prepared({assisted:true}),'independent'),/conditions not met/);
  assert.throws(()=>reviewProblem(empty,'quadratics','level-1','bad','bad',prepared(),'retry'),/Unknown/);
  let p=reviewProblem(empty,...task,prepared(),'independent',1782900000000);
  assert.deepEqual(recordFor(p,...task.slice(1)),{
    rating:'independent',attempted:true,checks:3,assisted:false,modelFirst:false,
    reviews:1,reviewedAt:1782900000000
  });
  assert.ok(!JSON.stringify(p).includes('known conditions'));
  assert.ok(!JSON.stringify(p).includes('I linked'));
  assert.ok(!JSON.stringify(p).includes('working'));
  p=reviewProblem(p,...task,prepared({assisted:true}),'supported',1782900005000);
  assert.equal(recordFor(p,...task.slice(1)).reviews,2);
  assert.equal(recordFor(p,...task.slice(1)).rating,'supported');
  assert.equal(recordFor(empty,...task.slice(1)),null);
  assert.throws(()=>reviewProblem(p,...task,prepared(),'independent',-2),/Invalid review time/);
});
test('priority practice orders retry, supported, unseen and excludes independent answers',()=>{
  const topic='sampling',level='level-1',page='allocations';
  const items=problemsFor(topic,level,page);
  let p=emptyProblemSolvingProgress();
  assert.deepEqual(queueProblems(topic,level,page,p,'all'),items.map(x=>x.id));
  assert.deepEqual(queueProblems(topic,level,page,p,'focus'),items.map(x=>x.id));
  p=reviewProblem(p,topic,level,page,items[0].id,prepared(),'independent');
  assert.deepEqual(queueProblems(topic,level,page,p,'focus'),[items[1].id]);
  p=reviewProblem(p,topic,level,page,items[1].id,prepared({assisted:true}),'supported');
  assert.deepEqual(queueProblems(topic,level,page,p,'focus'),[items[1].id]);
  assert.deepEqual(summaryForLevel(topic,level,p),
    {total:4,new:2,retry:0,supported:1,independent:1});
  p=reviewProblem(p,topic,level,page,items[0].id,prepared({plan:'',working:''}),'retry');
  assert.deepEqual(queueProblems(topic,level,page,p,'focus'),[items[0].id,items[1].id]);
  assert.deepEqual(queueProblems(topic,level,page,p,'all'),items.map(x=>x.id));
  assert.throws(()=>queueProblems(topic,level,page,p,'due'),/Invalid problem selection/);
});
test('corrupted, foreign and unsupported local progress is safely ignored',()=>{
  let p=reviewProblem(emptyProblemSolvingProgress(),'sampling','level-1','allocations',
    'two-years',prepared(),'independent',1782900000000);
  assert.deepEqual(hydrateProblemSolvingProgress(JSON.stringify(p),'sampling'),p);
  assert.deepEqual(hydrateProblemSolvingProgress('not json','sampling'),emptyProblemSolvingProgress());
  assert.deepEqual(hydrateProblemSolvingProgress({version:8,records:{}} ,'sampling'),emptyProblemSolvingProgress());
  assert.deepEqual(hydrateProblemSolvingProgress(JSON.stringify(p),'quadratics'),emptyProblemSolvingProgress());
  const damaged={version:1,records:{
    'level-1:allocations:two-years':{
      rating:'independent',attempted:true,assisted:true,modelFirst:false,
      checks:3,reviews:2,reviewedAt:1782900000000},
    'level-1:allocations:starting-position':{
      rating:'supported',attempted:true,assisted:true,modelFirst:false,
      checks:3,reviews:1,reviewedAt:1782900000000},
    'bad:foreign:task':{rating:'retry',attempted:false,assisted:false,
      modelFirst:false,checks:0,reviews:0,reviewedAt:1}
  }};
  const hydrated=hydrateProblemSolvingProgress(damaged,'sampling');
  assert.equal(recordFor(hydrated,'level-1','allocations','two-years'),null);
  assert.equal(recordFor(hydrated,'level-1','allocations','starting-position').rating,'supported');
  assert.equal(Object.keys(hydrated.records).length,1);
});
