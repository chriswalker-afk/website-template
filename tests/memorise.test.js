import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../src/topics.js';
import {validateTopics} from '../src/logic.js';
import {MEMORY_VERSION,DAY_MS,emptyMemory,hydrateMemory,recordFor,gradeCard,toggleCardFlag,
  progressSummary,cardStatus,deckQueue,matchRoundCards,normaliseTerm,assessTerm,
  validateMemoriseContent} from '../src/memorise-engine.js';
const sampling=TOPICS.sampling,quadratics=TOPICS.quadratics;
const clock=1782600000000;

test('each demo has twelve distinct, linked retrieval prompts without duplicate subsection content',()=>{
  assert.equal(validateTopics().length,0);
  for(const topic of [sampling,quadratics]){
    assert.equal(topic.cards.length,12);
    assert.equal(topic.clozes.length,12);
    assert.deepEqual(validateMemoriseContent(topic),[]);
    assert.equal(new Set(topic.cards.map(c=>c.id)).size,topic.cards.length);
    assert.equal(new Set(topic.clozes.map(c=>c.id)).size,topic.clozes.length);
    assert.ok(topic.clozes.every(cloze=>topic.cards.some(c=>c.id===cloze.cardId)));
    assert.ok(topic.clozes.every(cloze=>cloze.hint!==cloze.answer));
    assert.ok(topic.clozes.every(cloze=>cloze.before.trim().length>=20));
    assert.equal(topic.chapters.memorise.length,5);
    assert.deepEqual(topic.chapters.memorise.map(s=>s.id),
      ['flashcards','match-up','missing-words','speed-recall','review-all']);
  }
  assert.equal(sampling.clozes[0].answer,'sampling frame');
  assert.equal(quadratics.clozes[0].answer,'axis of symmetry');
});
test('new memory is independent, safe to hydrate, and ignores foreign card IDs',()=>{
  assert.equal(MEMORY_VERSION,1);
  const a=emptyMemory(),b=emptyMemory();
  assert.notEqual(a,b);
  assert.deepEqual(hydrateMemory('not json',sampling),a);
  assert.deepEqual(hydrateMemory('{"version":-1,"cards":{}}',sampling),a);
  const malformed={version:1,cards:{
    census:{attempts:2,correct:999,streak:999,lapses:-1,dueAt:Infinity,
      lastReviewed:-2,lastGrade:'unknown',lastSource:'bad',flagged:'yes'},
    'unknown-id':{attempts:999}
  }};
  const recovered=hydrateMemory(malformed,sampling);
  assert.deepEqual(Object.keys(recovered.cards),['census']);
  assert.equal(recovered.cards.census.correct,2);
  assert.equal(recovered.cards.census.streak,100);
  assert.equal(recovered.cards.census.lapses,0);
  assert.equal(recovered.cards.census.dueAt,0);
  assert.equal(recovered.cards.census.flagged,false);
  assert.deepEqual(hydrateMemory(JSON.stringify(recovered),quadratics),emptyMemory());
  assert.deepEqual(hydrateMemory({version:1,cards:{census:{attempts:0,
    streak:100,correct:20,flagged:true}}},sampling).cards.census,
  {...recordFor(emptyMemory(),'census'),flagged:true});
});
test('self-rated flashcards schedule transparently without claiming objective correctness',()=>{
  let memory=emptyMemory();
  memory=gradeCard(memory,sampling,'census','again','flashcards',clock,false);
  assert.equal(recordFor(memory,'census').attempts,1);
  assert.equal(recordFor(memory,'census').correct,0);
  assert.equal(recordFor(memory,'census').lapses,1);
  assert.equal(recordFor(memory,'census').dueAt,clock);
  assert.equal(cardStatus(memory,'census',clock),'Due now');
  memory=gradeCard(memory,sampling,'census','nearly','flashcards',clock+1000,false);
  assert.equal(recordFor(memory,'census').dueAt,clock+1000+DAY_MS);
  memory=gradeCard(memory,sampling,'census','know','flashcards',clock+2000,false);
  assert.equal(recordFor(memory,'census').dueAt,clock+2000+3*DAY_MS);
  assert.equal(recordFor(memory,'census').streak,1);
  assert.equal(recordFor(memory,'census').correct,0);
  for(const [step,days] of [[1,7],[2,14],[3,30],[4,30]]){
    memory=gradeCard(memory,sampling,'census','know','flashcards',clock+3000+step*1000,false);
    assert.equal(recordFor(memory,'census').dueAt,clock+3000+step*1000+days*DAY_MS);
  }
  assert.equal(progressSummary(sampling,memory,clock).new,11);
  assert.equal(progressSummary(sampling,memory,clock).objectiveCorrect,0);
});
test('correct and incorrect typed retrieval are distinguished, including hint usage',()=>{
  let memory=emptyMemory();
  memory=gradeCard(memory,quadratics,'symmetry','know','speed-recall',clock,true);
  assert.equal(recordFor(memory,'symmetry').correct,1);
  memory=gradeCard(memory,quadratics,'symmetry','nearly','missing-words',clock+1000,true);
  assert.equal(recordFor(memory,'symmetry').correct,2);
  memory=gradeCard(memory,quadratics,'symmetry','again','speed-recall',clock+2000,false);
  assert.equal(recordFor(memory,'symmetry').correct,2);
  assert.equal(recordFor(memory,'symmetry').attempts,3);
  assert.equal(progressSummary(quadratics,memory,clock+2000).due,1);
  assert.throws(()=>gradeCard(memory,quadratics,'unknown','know','flashcards',clock),/Unknown/);
  assert.throws(()=>gradeCard(memory,quadratics,'symmetry','wrong','flashcards',clock),/Invalid/);
  assert.throws(()=>gradeCard(memory,quadratics,'symmetry','know','wrong',clock),/Invalid/);
});
test('priority and due queues respect flags, weak attempts and scheduled reviews',()=>{
  let memory=emptyMemory();
  memory=gradeCard(memory,sampling,'census','know','flashcards',clock);
  memory=gradeCard(memory,sampling,'sample','again','speed-recall',clock);
  memory=gradeCard(memory,sampling,'stratified','nearly','match-up',clock);
  memory=toggleCardFlag(memory,sampling,'census');
  assert.equal(recordFor(memory,'census').flagged,true);
  const focus=deckQueue(sampling,memory,'focus',clock+1);
  assert.equal(focus[0],'census');
  assert.equal(focus[1],'sample');
  assert.ok(focus.includes('stratified'));
  assert.ok(focus.includes('sampling-frame')); // Unseen cards are included in priority practice.
  assert.ok(!deckQueue(sampling,memory,'due',clock).includes('census'));
  assert.ok(deckQueue(sampling,memory,'due',clock).includes('sample'));
  assert.ok(deckQueue(sampling,memory,'due',clock+DAY_MS).includes('stratified'));
  memory=toggleCardFlag(memory,sampling,'census');
  assert.equal(recordFor(memory,'census').flagged,false);
  assert.equal(deckQueue(sampling,memory,'all').length,12);
  assert.equal(progressSummary(sampling,memory,clock).flagged,0);
  assert.equal(progressSummary(sampling,memory,clock).new,9);
});
test('matching rounds cover every card without repeats or omissions',()=>{
  for(const topic of [sampling,quadratics]){
    const all=[];
    for(let round=0;round<3;round++){
      const batch=matchRoundCards(topic,round,4);
      assert.equal(batch.length,4);
      all.push(...batch.map(c=>c.id));
    }
    assert.deepEqual(all,topic.cards.map(c=>c.id));
    assert.deepEqual(matchRoundCards(topic,3,4).map(c=>c.id),
      matchRoundCards(topic,0,4).map(c=>c.id));
    assert.throws(()=>matchRoundCards(topic,-1,4),/Invalid/);
  }
});
test('normalisation and one-character typo tolerance are conservative',()=>{
  assert.equal(normaliseTerm('  AXIS   OF   SYMMETRY  '),'axis of symmetry');
  assert.equal(normaliseTerm('Y–Intercept'),'y-intercept');
  const others=sampling.cards.filter(c=>c.id!=='sampling-frame').map(c=>c.term);
  assert.deepEqual(assessTerm('Sampling Frame','Sampling frame',[],others),
    {correct:true,kind:'exact',grade:'know'});
  assert.equal(assessTerm('sampeling frame','Sampling frame',[],others).kind,'typo');
  assert.equal(assessTerm('simple random sampling','Simple random sample',
    ['Simple random sampling']).kind,'alias');
  assert.equal(assessTerm('sampling','Sampling frame',[],others).correct,false);
  assert.equal(assessTerm('','Sampling frame').kind,'blank');
  assert.equal(assessTerm('sampel','Sample').correct,false); // Short terms require precision.
  assert.equal(assessTerm('sample','Sampling frame',[],['Sample']).correct,false);
  assert.equal(assessTerm('axis of asymmetry','Axis of symmetry',[],
    ['Axis of asymmetry']).correct,false);
  assert.equal(assessTerm('vertex','Turning point',['Vertex']).kind,'alias');
  assert.equal(assessTerm('zeros','Roots',['Zeros']).correct,true);
});
test('bad cloze entries are rejected rather than silently treated as retrieval tasks',()=>{
  const invalid=structuredClone(sampling);
  invalid.clozes[0].cardId='nonexistent';
  invalid.clozes[1].answer='';
  invalid.clozes[2].hint=invalid.clozes[2].answer;
  invalid.clozes[3].id=invalid.clozes[2].id;
  const issues=validateMemoriseContent(invalid).join(' | ');
  assert.match(issues,/Invalid cloze ID or card link/);
  assert.match(issues,/Incomplete cloze prompt/);
  assert.match(issues,/Hint reveals answer directly/);
});
