import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../src/topics.js';
import {validateTopics} from '../src/logic.js';
import {FLUENCY_CHAPTERS,PRACTICE_LENGTHS,buildFluencySet,fluencyFamilyIds,
  makeFluencyQuestion,rngFromSeed,checkFluencyAnswer,answerText,
  validateFluencyChapters,validateFluencyQuestion,fluencySkillIds} from '../src/fluency-engine.js';
import {emptyFluencyProgress,hydrateFluencyProgress,saveFluencyRound} from '../src/fluency-progress.js';
import {generateWorksheet,generateWorksheetFromFluencySet,worksheetSkills} from '../src/worksheet-generator.js';
const sets=[...Object.entries(FLUENCY_CHAPTERS).flatMap(([topic,sections])=>
  sections.flatMap(section=>section.pages.map(page=>({
    topic,level:section.id,page:page.id,families:page.families
  }))))];
const match=(q,s)=>q.family===s.split(':')[0];
test('all four levels use generated maths-only pages and valid configs',()=>{
  assert.deepEqual(validateTopics(),[]);
  assert.deepEqual(validateFluencyChapters(),[]);
  assert.deepEqual(PRACTICE_LENGTHS,[6,10]);
  for(const topicId of ['sampling','quadratics']){
    assert.equal(TOPICS[topicId].chapters.fluency.length,4);
    const levels=TOPICS[topicId].chapters.fluency;
    assert.deepEqual(levels.map(s=>s.id),['level-1','level-2','level-3','level-4']);
    assert.ok(levels.every(s=>s.pages.every(p=>p.type==='fluency')));
    assert.ok(fluencySkillIds(topicId).length>=10);
  }
  assert.ok(sets.length>=10);
});
test('generated Fluency sets are deterministic, unique and fully worked',()=>{
  for(const row of sets){
    for(let seed=1;seed<=48;seed++){
      const opts={topicId:row.topic,levelId:row.level,pageId:row.page,seed,count:6};
      const a=buildFluencySet(opts),b=buildFluencySet(opts);
      assert.deepEqual(a,b);
      assert.equal(a.questions.length,6);
      assert.equal(new Set(a.questions.map(q=>q.signature)).size,6);
      assert.ok(a.questions.every(q=>row.families.includes(q.family)));
      for(const q of a.questions){
        assert.equal(validateFluencyQuestion(q),'');
        assert.ok(q.steps.length>=2);
        assert.ok(q.answer.values.every(Number.isFinite));
        assert.deepEqual(checkFluencyAnswer(answerText(q.answer),q).correct,true);
        assert.equal(checkFluencyAnswer('nonsense',q).correct,false);
        assert.ok(q.mistake.length>20&&q.hint.length>15);
        assert.ok(Number.isSafeInteger(q.marks)&&q.marks>0);
      }
    }
  }
  assert.notDeepEqual(
    buildFluencySet({topicId:'sampling',levelId:'level-1',pageId:'counts',seed:1}).questions.map(q=>q.signature),
    buildFluencySet({topicId:'sampling',levelId:'level-1',pageId:'counts',seed:2}).questions.map(q=>q.signature));
  assert.equal(buildFluencySet({topicId:'quadratics',levelId:'level-3',pageId:'mixed',seed:222,count:10}).questions.length,10);
  assert.throws(()=>buildFluencySet({topicId:'bad',levelId:'level-1',pageId:'x',seed:1}),/Unknown Fluency page/);
  assert.throws(()=>buildFluencySet({topicId:'sampling',levelId:'level-1',pageId:'counts',seed:0}),/Seed/);
  assert.throws(()=>buildFluencySet({topicId:'sampling',levelId:'level-1',pageId:'counts',seed:1,count:20}),/6 or 10/);
});
test('sampling answers preserve sampling fractions, intervals and reverse-stratification arithmetic',()=>{
  const rng=rngFromSeed(574);
  for(const skill of fluencySkillIds('sampling')){
    for(let i=0;i<75;i++){
      const q=makeFluencyQuestion('sampling',skill,rng);
      const [id,...parts]=q.signature.split(':'),v=parts.map(Number),a=q.answer.values;
      switch(id){
        case 'sample-percent':{
          const [N,p]=v;
          assert.equal(a[0],p);assert.ok(Number.isInteger(N*p/100));break;
        }
        case 'sample-count':{
          const [N,p]=v;assert.equal(a[0],N*p/100);break;
        }
        case 'interval':{
          const [N,n]=v;assert.equal(a[0],N/n);break;
        }
        case 'sample-size':{
          const [N,k]=v;assert.equal(a[0],N/k);break;
        }
        case 'stratified-two':{
          const [A,B,d]=v;assert.deepEqual(a,[A/d,B/d]);break;
        }
        case 'positions':{
          const [k,n,start]=v;
          assert.deepEqual(a,Array.from({length:5},(_,i)=>start+i*k));
          assert.ok(a.at(-1)<=k*n);break;
        }
        case 'stratified-three':{
          const [A,B,C,d]=v;
          assert.deepEqual(a,[A/d,B/d,C/d]);
          assert.equal(a.reduce((x,y)=>x+y,0),(A+B+C)/d);break;
        }
        case 'last-position':{
          const [k,n,start]=v;assert.equal(a[0],start+(n-1)*k);break;
        }
        case 'reverse-population':{
          const [A,B,C,d]=v;assert.equal(a[0],C);
          assert.equal((A+B+C)/d,A/d+B/d+C/d);break;
        }
        case 'reverse-sample':{
          const [A,B,C,d]=v;assert.equal(a[0],(A+B+C)/d);break;
        }
        case 'within-stratum-interval':{
          const [A,B,C,d]=v;assert.equal(a[0],d);
          assert.equal(((A+B+C)/d)*B/(A+B+C),B/d);break;
        }
        default:assert.fail('Unrecognised sampling family '+id);
      }
    }
  }
});
test('quadratic answers preserve roots, vertices, substitution and formula accuracy',()=>{
  const rng=rngFromSeed(712);
  for(const family of fluencySkillIds('quadratics')){
    for(let i=0;i<75;i++){
      const q=makeFluencyQuestion('quadratics',family,rng);
      const [id,...parts]=q.signature.split(':'),a=q.answer.values,p=parts.map(Number);
      switch(id){
        case 'evaluate':{
          const [A,B,C,x]=p;assert.equal(a[0],A*x*x+B*x+C);break;
        }
        case 'vertex':case 'monic-vertex':{
          const [A,h,k]=id==='vertex'?p:[1,...p];
          assert.deepEqual(a,[h,k]);break;
        }
        case 'factor-roots':case 'monic-roots':{
          assert.deepEqual([...a].sort((x,y)=>x-y),p);break;
        }
        case 'intercept':{
          assert.equal(a[0],p[2]);break;
        }
        case 'discriminant':{
          const [A,B,C]=p;assert.equal(a[0],B*B-4*A*C);break;
        }
        case 'scaled-roots':{
          const [A,r,s]=p;assert.deepEqual([...a].sort((x,y)=>x-y),[r,s]);
          const B=-A*(r+s),C=A*r*s;
          assert.equal(A*r*r+B*r+C,0);
          assert.equal(A*s*s+B*s+C,0);break;
        }
        case 'expanded-vertex':{
          const [A,h,k]=p;assert.deepEqual(a,[h,k]);
          const B=-2*A*h,C=A*h*h+k;
          assert.equal(2*A*h+B,0);
          assert.equal(A*h*h+B*h+C,k);break;
        }
        case 'formula-roots':{
          const [A,B,C]=p,D=B*B-4*A*C;
          assert.ok(D>0&&!Number.isInteger(Math.sqrt(D)));
          for(const root of a)assert.ok(Math.abs(A*root*root+B*root+C)<.25);
          assert.ok(Math.abs(a[0]-(-B-Math.sqrt(D))/(2*A))<=.0051);
          assert.ok(Math.abs(a[1]-(-B+Math.sqrt(D))/(2*A))<=.0051);break;
        }
        case 'unknown-coefficient':{
          const [A,r,B]=p,C=-A*r*r-B*r;
          assert.equal(a[0],B);assert.equal(A*r*r+B*r+C,0);
          assert.match(q.prompt,/bx/);break;
        }
        case 'extreme-value':{
          const [A,h,k]=p;assert.equal(a[0],k);
          const B=-2*A*h,C=A*h*h+k;
          assert.equal(A*h*h+B*h+C,k);break;
        }
        default:assert.fail('Unknown quadratic family '+id);
      }
    }
  }
});
test('numeric checking accepts equivalent exact values but rejects wrong formats and code',()=>{
  const source=buildFluencySet({topicId:'quadratics',levelId:'level-1',pageId:'roots',seed:2026}).questions;
  const roots=source.find(q=>q.answer.kind==='unordered');
  assert.ok(roots);
  const [r,s]=roots.answer.values;
  assert.equal(checkFluencyAnswer(s+', '+r,roots).correct,true);
  assert.equal(checkFluencyAnswer('x = '+r+' or x = '+s,roots).correct,true);
  assert.equal(checkFluencyAnswer(r+', '+r,roots).correct,false);
  assert.equal(checkFluencyAnswer('process.exit()',roots).kind,'format');
  assert.equal(checkFluencyAnswer('x = 1,2,3',roots).kind,'format');
  const sample=buildFluencySet({topicId:'sampling',levelId:'level-1',pageId:'counts',seed:15}).questions;
  const percent=sample.find(q=>q.answer.unit==='%');
  assert.ok(percent);
  assert.equal(checkFluencyAnswer(percent.answer.values[0]+'%',percent).correct,true);
  assert.equal(checkFluencyAnswer(' '+percent.answer.values[0],percent).correct,true);
  assert.equal(checkFluencyAnswer('999%',percent).correct,false);
  const ordered=buildFluencySet({topicId:'sampling',levelId:'level-2',pageId:'allocation',seed:9}).questions
    .find(q=>q.answer.kind==='ordered');
  assert.ok(ordered);
  assert.equal(checkFluencyAnswer(ordered.answer.values.slice().reverse().join(', '),ordered).correct,
    ordered.answer.values.every(v=>v===ordered.answer.values[0]));
  assert.equal(checkFluencyAnswer('',ordered).kind,'format');
  assert.throws(()=>rngFromSeed(NaN),/Seed/);
});
test('Fluency progress saves only validated aggregates, per topic and per level',()=>{
  assert.deepEqual(hydrateFluencyProgress('bad json'),emptyFluencyProgress());
  assert.deepEqual(hydrateFluencyProgress({version:7,levels:{}}),emptyFluencyProgress());
  let progress=saveFluencyRound(emptyFluencyProgress(),'level-1',
    {firstTry:3,supported:2,revealed:1});
  assert.deepEqual(progress.levels['level-1'],
    {rounds:1,completed:6,firstTry:3,withSupport:2,revealed:1});
  progress=saveFluencyRound(progress,'level-1',{firstTry:5,supported:0,revealed:1});
  assert.deepEqual(progress.levels['level-1'],
    {rounds:2,completed:12,firstTry:8,withSupport:2,revealed:2});
  progress=saveFluencyRound(progress,'level-4',{firstTry:1,supported:2,revealed:3});
  const hydrated=hydrateFluencyProgress(JSON.stringify(progress));
  assert.deepEqual(hydrated,progress);
  assert.equal(hydrated.levels['level-4'].rounds,1);
  assert.equal(JSON.stringify(hydrated).includes('studentWorking'),false);
  assert.throws(()=>saveFluencyRound(progress,'level-5',{firstTry:1,supported:0,revealed:0}),/Invalid/);
  assert.throws(()=>saveFluencyRound(progress,'level-1',{firstTry:-1,supported:0,revealed:0}),/Invalid/);
  const corrupted=hydrateFluencyProgress({version:1,levels:{
    'level-1':{rounds:99,completed:2,firstTry:20,withSupport:1,revealed:3},
    'level-2':{rounds:1,completed:6,firstTry:3,withSupport:1,revealed:2},
    injected:{rounds:100,completed:100}
  }});
  assert.equal(corrupted.levels['level-1'],undefined);
  assert.equal(corrupted.levels.injected,undefined);
  assert.equal(corrupted.levels['level-2'].firstTry,3);
});
test('worksheet generator and finished practice export reuse the same validated questions',()=>{
  assert.ok(worksheetSkills('sampling').some(s=>s.id==='fluency'));
  assert.ok(worksheetSkills('quadratics').some(s=>s.id==='fluency'));
  for(const topicId of ['sampling','quadratics']){
    for(const difficulty of ['developing','secure','stretch']){
      const opts={topicId,count:10,seed:505,difficulty,style:'independent',
        solutions:'worked',skills:['fluency']};
      const result=generateWorksheet(opts);
      assert.equal(result.questions.length,10);
      assert.ok(result.questions.every(q=>q.skill==='fluency'));
      assert.equal(new Set(result.questions.map(q=>q.signature)).size,10);
      assert.match(result.studentTex,/\\documentclass/);
      assert.match(result.solutionsTex,/\\begin\{enumerate\}/);
      assert.deepEqual(generateWorksheet(opts).questions,result.questions);
    }
    const level='level-1',page=topicId==='sampling'?'counts':'values';
    const set=buildFluencySet({topicId,levelId:level,pageId:page,seed:223,count:6});
    const output=generateWorksheetFromFluencySet(set);
    assert.deepEqual(output.questions.map(q=>q.prompt),set.questions.map(q=>q.prompt));
    assert.equal(output.options.skills[0],'fluency');
    assert.equal(output.questions.length,6);
    assert.match(output.solutionsTex,/\\begin\{enumerate\}/);
    assert.match(output.studentTex,/\\textsuperscript\{2\}|percentage/);
    assert.match(output.solutionsTex,/Seed: 223/);
  }
  assert.throws(()=>generateWorksheetFromFluencySet({topicId:'sampling',seed:1,questions:[]}),/Invalid/);
});
