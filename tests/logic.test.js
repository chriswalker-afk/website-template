import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS,CHAPTER_LIBRARY} from '../src/topics.js';
import {validateTopics,chaptersFor,sectionsFor,pagesFor,resolveRoute,routeHref,
  topicSwitchHref,normaliseAnswer,escapeHTML,cardForIndex,sampleMatchCards} from '../src/logic.js';

test('demonstration topics pass a strict mode/subsection/page validation',()=>{
  assert.deepEqual(validateTopics(),[]);
  assert.equal(Object.keys(TOPICS).length,2);
});
test('top-level chapters remain qualification-neutral and fully spelled out',()=>{
  assert.ok(!CHAPTER_LIBRARY.some(ch=>/\bAO[123]\b/.test(ch.label)));
  assert.equal(CHAPTER_LIBRARY.find(ch=>ch.id==='problemSolving').short,'Problem Solving');
  for(const topic of Object.values(TOPICS)){
    assert.ok(chaptersFor(topic).every(ch=>sectionsFor(topic,ch.id).length>0));
  }
});
test('configurable modes hide unsupported chapters without dead tabs',()=>{
  assert.equal(chaptersFor(TOPICS.sampling).length,5);
  assert.equal(chaptersFor(TOPICS.sampling).some(ch=>ch.id==='modelling'),false);
  assert.equal(chaptersFor(TOPICS.quadratics).length,7);
  for(const chapter of ['fluency','reasoning','problemSolving','modelling']){
    assert.equal(chaptersFor(TOPICS.quadratics).some(ch=>ch.id===chapter),true);
  }
});
test('Understand includes four real subsections, some with multiple pages',()=>{
  const expected=['big-idea','how-it-works','visual-explanations','worked-examples'];
  for(const topic of Object.values(TOPICS)){
    assert.deepEqual(sectionsFor(topic,'understand').map(s=>s.id),expected);
    for(const section of sectionsFor(topic,'understand')){
      assert.ok(section.pages.length>=2);
      assert.ok(section.description.length>12);
    }
  }
});
test('practice and game modes only contain the intended activity types',()=>{
  for(const topic of Object.values(TOPICS)){
    for(const mode of ['fluency','reasoning','problemSolving','modelling']){
      for(const section of sectionsFor(topic,mode)){
        assert.ok(section.pages.every(page=>page.type==='questions'));
      }
    }
    for(const section of sectionsFor(topic,'games')){
      assert.equal(section.pages.length,1);
      assert.equal(section.pages[0].type,'game');
    }
    for(const section of sectionsFor(topic,'memorise'))assert.equal(section.pages.length,1);
  }
  for(const mode of ['fluency','problemSolving','modelling']){
    assert.deepEqual(sectionsFor(TOPICS.quadratics,mode).map(s=>s.id),
      ['level-1','level-2','level-3','level-4']);
  }
  assert.deepEqual(sectionsFor(TOPICS.sampling,'games').map(s=>s.id),
    ['sprint','puzzle-quest','sort-discover']);
  assert.deepEqual(sectionsFor(TOPICS.quadratics,'games').map(s=>s.id),
    ['sprint','puzzle-quest','curve-quest']);
});
test('deep links preserve subsection and page identity with compact first-page routes',()=>{
  const first=resolveRoute('#/sampling/understand/big-idea');
  assert.deepEqual(first,{topicId:'sampling',chapterId:'understand',
    sectionId:'big-idea',pageId:'population',pageIndex:0,
    canonical:'#/sampling/understand/big-idea'});
  const second=resolveRoute('#/sampling/understand/big-idea/representativeness');
  assert.equal(second.pageId,'representativeness');
  assert.equal(second.pageIndex,1);
  assert.equal(second.canonical,'#/sampling/understand/big-idea/representativeness');
  assert.equal(pagesFor(TOPICS.sampling,'understand','big-idea').length,2);
  assert.equal(resolveRoute('#/quadratics/understand/visual-explanations/position').pageIndex,1);
  assert.equal(resolveRoute('#/quadratics/understand/visual-explanations/no-such-page').pageIndex,0);
  assert.equal(resolveRoute('#/sampling/memorise/no-such-section').sectionId,'flashcards');
  assert.equal(resolveRoute('#/sampling/understand').sectionId,'big-idea');
  assert.equal(resolveRoute('#/unknown/home').topicId,'sampling');
});
test('topic switching preserves valid positions and falls back when a mode is unsupported',()=>{
  assert.equal(topicSwitchHref('quadratics','memorise','match-up'),
    '#/quadratics/memorise/match-up');
  assert.equal(topicSwitchHref('sampling','understand','big-idea','representativeness'),
    '#/sampling/understand/big-idea/representativeness');
  assert.equal(topicSwitchHref('sampling','modelling','level-3'),'#/sampling/home');
});
test('existing single-activity URLs and Resources worksheet route remain usable',()=>{
  assert.equal(resolveRoute('#/sampling/memorise/flashcards').canonical,
    '#/sampling/memorise/flashcards');
  assert.equal(resolveRoute('#/sampling/resources/worksheet-generator').canonical,
    '#/sampling/resources/worksheet-generator');
  assert.equal(routeHref('sampling','understand','big-idea','representativeness'),
    '#/sampling/understand/big-idea/representativeness');
  assert.equal(escapeHTML('a < b & "c"'),'a &lt; b &amp; &quot;c&quot;');
  assert.equal(normaliseAnswer('  Axis    of SYMMETRY '),'axis of symmetry');
});
test('flashcard bank and matching pool preserve existing behaviour',()=>{
  const topic=TOPICS.quadratics;
  assert.equal(cardForIndex(topic,topic.cards.length).id,topic.cards[0].id);
  assert.equal(cardForIndex(topic,-1).id,topic.cards.at(-1).id);
  const cards=sampleMatchCards(topic,3);
  assert.equal(cards.length,3);
  assert.equal(new Set(cards.map(c=>c.id)).size,3);
});
test('validation detects missing pages, duplicate IDs, wrong mode types and missing solutions',()=>{
  const bad={bad:{...TOPICS.sampling,id:'bad',chapters:{
    fluency:[{id:'level-1',label:'Level 1',description:'A suitable description',
      pages:[{id:'same',type:'graph'},{id:'same',type:'questions',
        problems:[{id:'x',prompt:'A question',marks:3}]}]}]
  }}};
  const issues=validateTopics(bad).join(' | ');
  assert.match(issues,/wrong page type graph in fluency/);
  assert.match(issues,/invalid\/duplicate page same/);
  assert.match(issues,/incomplete problem same/);
});
