import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPIC_PACKS,TOPICS,DEFAULT_TOPIC} from '../src/topics.js';
import {chaptersFor,sectionsFor,validateTopics,routeHref,resolveRoute} from '../src/logic.js';
import {UNDERSTAND_CONTENT} from '../src/understand-content.js';
import {FLUENCY_CHAPTERS} from '../src/fluency-engine.js';
import {REASONING_CHAPTERS} from '../src/reasoning-content.js';
import {PROBLEM_SOLVING_CHAPTERS} from '../src/problem-solving-content.js';
import {MODELLING_CHAPTERS} from '../src/modelling-content.js';
import {worksheetSkills} from '../src/worksheet-generator.js';

test('the registry retains both examples and registers the independent Gradient pack',()=>{
  assert.equal(DEFAULT_TOPIC,'sampling');
  assert.deepEqual(TOPIC_PACKS.map(t=>t.id),['sampling','quadratics','gradient']);
  for(const topic of TOPIC_PACKS){
    assert.strictEqual(TOPICS[topic.id],topic);
    assert.strictEqual(UNDERSTAND_CONTENT[topic.id],topic.chapters.understand);
    assert.strictEqual(FLUENCY_CHAPTERS[topic.id],topic.chapters.fluency);
    assert.strictEqual(REASONING_CHAPTERS[topic.id],topic.chapters.reasoning);
    assert.strictEqual(PROBLEM_SOLVING_CHAPTERS[topic.id],topic.chapters.problemSolving);
    assert.strictEqual(MODELLING_CHAPTERS[topic.id],topic.chapters.modelling);
    assert.deepEqual(worksheetSkills(topic.id),topic.worksheetSkills);
    assert.equal(chaptersFor(topic).length,topic.id==='gradient'?6:7);
  }
  assert.deepEqual(validateTopics(),[]);
});

test('a new authored topic can omit Memorise and unused modes without changing shared validation',()=>{
  const newTopic={id:'linear',title:'Straight Line Graphs',subject:'Algebra',paper:'squared',
    modes:{understand:true,memorise:false,games:false},
    chapters:{understand:[
      ...['big-idea','how-it-works','visual-explanations','worked-examples'].map((id,i)=>({
        id,label:['The big idea','How it works','Visual explanations','Worked examples'][i],
        description:'A complete original explanation of straight lines.',
        pages:[{id:'overview',type:'lesson',blocks:[{kind:'text',text:'A straight-line graph has constant gradient.'}]}]
      }))
    ]}
  };
  assert.deepEqual(validateTopics({linear:newTopic}),[]);
  assert.deepEqual(chaptersFor(newTopic).map(c=>c.id),['understand']);
  assert.deepEqual(sectionsFor(newTopic,'memorise'),[]);
  assert.deepEqual(sectionsFor(newTopic,'understand').map(s=>s.id),
    ['big-idea','how-it-works','visual-explanations','worked-examples']);
  const broken={...newTopic,modes:{...newTopic.modes,fluency:true}};
  assert.ok(validateTopics({linear:broken}).some(e=>e.includes('enabled mode has no content fluency')));
});

test('existing deep links remain stable after moving content into packs',()=>{
  for(const id of ['sampling','quadratics']){
    const href=routeHref(id,'understand','how-it-works');
    const route=resolveRoute(href);
    assert.equal(route.topicId,id);
    assert.equal(route.chapterId,'understand');
    assert.equal(route.sectionId,'how-it-works');
    assert.equal(route.canonical,href);
  }
});
