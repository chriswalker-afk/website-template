import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS,CHAPTER_LIBRARY} from '../src/topics.js';
import {validateTopics,chaptersFor,sectionsFor,resolveRoute,routeHref,topicSwitchHref,normaliseAnswer,escapeHTML,cardForIndex,sampleMatchCards} from '../src/logic.js';

test('both contrasting demonstration topics pass validation',()=>{
  assert.deepEqual(validateTopics(),[]);
  assert.equal(Object.keys(TOPICS).length,2);
});
test('qualification-neutral chapter names and no empty chapters',()=>{
  assert.ok(!CHAPTER_LIBRARY.some(ch=>/\bAO[123]\b/.test(ch.label)));
  for(const topic of Object.values(TOPICS)){
    const active=chaptersFor(topic);
    assert.ok(active.length>=4);
    assert.ok(active.every(ch=>sectionsFor(topic,ch.id).length>0));
  }
});
test('configure different sets of chapter tabs per topic',()=>{
  assert.equal(chaptersFor(TOPICS.sampling).some(ch=>ch.id==='fluency'),false);
  assert.equal(chaptersFor(TOPICS.quadratics).some(ch=>ch.id==='fluency'),true);
  assert.equal(chaptersFor(TOPICS.quadratics).some(ch=>ch.id==='reasoning'),false);
});
test('resolve route including omitted subsection, unknown section and unknown topic',()=>{
  assert.deepEqual(resolveRoute('#/sampling/memorise/flashcards'),{
    topicId:'sampling',chapterId:'memorise',sectionId:'flashcards',canonical:'#/sampling/memorise/flashcards'
  });
  assert.equal(resolveRoute('#/sampling/memorise').sectionId,'flashcards');
  assert.equal(resolveRoute('#/sampling/memorise/not-a-section').sectionId,'flashcards');
  assert.equal(resolveRoute('#/sampling/fluency/nothing').chapterId,'home');
  assert.equal(resolveRoute('#/unknown/home').topicId,'sampling');
  assert.equal(resolveRoute('#/quadratics/fluency/graph-lab').sectionId,'graph-lab');
});
test('topic selector preserves a chapter when both topics support it',()=>{
  assert.equal(topicSwitchHref('quadratics','memorise','match-up'),'#/quadratics/memorise/match-up');
  assert.equal(topicSwitchHref('sampling','fluency','graph-lab'),'#/sampling/home');
});
test('route links and safe HTML escaping',()=>{
  assert.equal(routeHref('sampling','understand','big-idea'),'#/sampling/understand/big-idea');
  assert.equal(escapeHTML('a < b & "c"'), 'a &lt; b &amp; &quot;c&quot;');
  assert.equal(normaliseAnswer('  Axis    of SYMMETRY '),'axis of symmetry');
});
test('flashcard list is cyclical and match pool has distinct pairs',()=>{
  const topic=TOPICS.quadratics;
  assert.equal(cardForIndex(topic,topic.cards.length).id,topic.cards[0].id);
  assert.equal(cardForIndex(topic,-1).id,topic.cards.at(-1).id);
  const cards=sampleMatchCards(topic,3);
  assert.equal(cards.length,3);
  assert.equal(new Set(cards.map(c=>c.id)).size,3);
});
test('content validator reports duplicate IDs, empty sections and missing answers',()=>{
  const bad={problem:{...TOPICS.sampling,id:'problem',chapters:{bad:[],memorise:[{id:'x',label:'A'},{id:'x',label:'B'}]},
    cards:[{id:'same',term:'A',definition:'B'},{id:'same',term:'C',definition:'D'},{id:'z',term:'',definition:'No'}],
    cloze:{answer:''}}};
  const problems=validateTopics(bad).join(' | ');
  assert.match(problems,/invalid or empty chapter bad/);
  assert.match(problems,/invalid section x/);
  assert.match(problems,/duplicate/);
  assert.match(problems,/no cloze answer/);
});
