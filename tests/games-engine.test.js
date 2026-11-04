import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS,QUESTION_BANKS} from '../src/topic-packs/registry.js';
import {validateQuestionBank} from '../src/question-bank.js';
import {validateGamePairs,numericalGamePair,vocabularyGamePairs} from '../src/games/contracts.js';
import {STANDARD_GAME_DETAILS,standardGameSections} from '../src/games/sections.js';
import {selectGamePairs,createGameSession,createLoopGame,loopPick,loopMove,loopPlace,loopRemove,checkLoop,
  createConcentrationGame,flipConcentration,continueConcentration,
  selectConcentrationHistory,noteConcentrationWorking,swapLoop,
  createHexGame,hexNeighbours,hexHasPath,selectHex,submitHex,continueHex,cancelHex,
  checkGameAnswer} from '../src/games/engine.js';
const gradient=QUESTION_BANKS.gradient.games.pairs;
const sampling=QUESTION_BANKS.sampling.games.pairs;
const quadratics=QUESTION_BANKS.quadratics.games.pairs;
test('all three topic banks share the same games with eight unambiguous pairs',()=>{
  for(const topic of [TOPICS.gradient,TOPICS.sampling,TOPICS.quadratics]){
    const bank=QUESTION_BANKS[topic.id];
    assert.deepEqual(validateGamePairs(bank.games.pairs),[]);
    assert.deepEqual(validateQuestionBank(topic),[],topic.id);
    const ids=topic.chapters.games.map(s=>s.id);
    assert.ok(['loop-cards','concentration','hex-crossing'].every(id=>ids.includes(id)));
    assert.ok(ids.length>=3);
  }
  assert.equal(gradient.length,16);
  assert.equal(sampling.length,12);
  assert.equal(quadratics.length,12);
  assert.equal(TOPICS.gradient.modes.games,true);
  assert.equal(standardGameSections().length,3);
  assert.ok(STANDARD_GAME_DETAILS['hex-crossing'].description.includes('Blockbusters'));
});
test('the topic bank rejects duplicate displayed answers, bad formats and missing core cards',()=>{
  const numeric=Array.from({length:8},(_,i)=>numericalGamePair('number-'+i,'Find a value '+i,i));
  assert.deepEqual(validateGamePairs(numeric),[]);
  const duplicate=numeric.map((card,i)=>i===7?{...card,answerDisplay:'6'}:card);
  assert.match(validateGamePairs(duplicate).join(' '),/duplicate visible answer/);
  assert.ok(validateGamePairs(numeric.slice(0,7)).length>0);
  const challenge=numeric.map((c,i)=>i===0?c:{...c,level:'challenge'});
  assert.match(validateGamePairs(challenge).join(' '),/eight core-level/);
  assert.throws(()=>standardGameSections(['unknown']),/Unknown standard/);
  const equivalent=numeric.map((card,i)=>i===7?{
    ...card,answerDisplay:'07',answer:{...card.answer,values:[7]}
  }:card);
  assert.ok(validateGamePairs(equivalent).length>0,'invalid printed numerical answer is rejected');
  const aliasDeck=Array.from({length:8},(_,i)=>({
    id:'term-'+i,question:'Describe term '+i,
    answerDisplay:'Term '+i,answer:{kind:'text',value:'Term '+i,accepted:['Term '+i]}
  }));
  aliasDeck[7].answer.accepted.push('Term 6');
  assert.match(validateGamePairs(aliasDeck).join(' '),/overlapping aliases/);
});
test('question/answer text checking recognises only explicit author-approved aliases',()=>{
  const pair=sampling.find(x=>x.id==='simple-random');
  assert.equal(checkGameAnswer('simple random sampling',pair).correct,true);
  assert.equal(checkGameAnswer('random sampling',pair).correct,false);
  assert.equal(checkGameAnswer('  SIMPLE   RANDOM   SAMPLE  ',pair).correct,true);
  assert.equal(checkGameAnswer(' ',pair).kind,'format');
  assert.equal(checkGameAnswer('3',gradient.find(x=>x.id==='rise-three')).correct,true);
  assert.equal(checkGameAnswer('4',gradient.find(x=>x.id==='rise-three')).correct,false);
  assert.deepEqual(vocabularyGamePairs([{id:'x',term:'Mean',definition:'Arithmetic average.'}])[0].answer.accepted,['Mean']);
});
test('loop cards contain the previous answer, enforce a closed cycle and can be corrected',()=>{
  let game=createLoopGame(gradient,{seed:2026});
  assert.equal(game.deck.length,8);
  assert.equal(game.placements.length,8);
  assert.deepEqual(game,createLoopGame(gradient,{seed:2026}));
  assert.equal(game.deck[0].answerFor,game.deck[7].id);
  assert.equal(game.deck[4].answerFor,game.deck[3].id);
  assert.equal(checkLoop(game).attempts,0);
  const wrongOrder=[...game.deck.slice(1)].reverse();
  for(const card of wrongOrder)game=loopPlace(game,card.id);
  assert.equal(game.tray.length,0);
  game=checkLoop(game);
  assert.equal(game.solved,false);
  assert.equal(game.attempts,1);
  game=loopRemove(game,3);
  assert.equal(game.tray.length,1);
  assert.equal(game.placements[3],null);
  game=loopPlace(game,game.tray[0].id);
  for(let i=1;i<8;i++)game=loopRemove(game,i);
  for(const card of game.deck.slice(1))game=loopPlace(game,card.id);
  game=swapLoop(game,1,2);
  assert.equal(game.solved,false);
  game=swapLoop(game,1,2);
  game=checkLoop(game);
  assert.equal(game.solved,true);
  assert.equal(game.attempts,2);
  assert.equal(loopRemove(game,1),game,'solved loops stay complete');
});

test('loop cards can be picked up, placed anywhere, exchanged and replayed without losing the fixed start',()=>{
  let state=createLoopGame(gradient,{seed:2026});
  const first=state.tray[0],second=state.tray[1];
  state=loopPick(state,first);
  assert.equal(state.selectedId,first);
  state=loopMove(state,first,7);
  assert.equal(state.placements[7],first);
  assert.equal(state.selectedId,null);
  state=loopMove(state,second,2);
  assert.equal(state.placements[2],second);
  state=loopMove(state,first,2);
  assert.equal(state.placements[2],first);
  assert.equal(state.placements[7],second,'occupied positions exchange');
  assert.equal(state.tray.includes(first),false);
  state=loopPick(state,second);
  assert.equal(state.selectedId,second);
  state=loopPick(state,second);
  assert.equal(state.selectedId,null,'a second tap puts the card down');
  assert.equal(loopMove(state,first,0),state,'start card is fixed');
  assert.equal(loopPick(state,state.deck[0].id),state,'start card cannot be picked up');
});
test('Concentration remembers only viewed questions for each player and preserves working',()=>{
  let state=createConcentrationGame(gradient,{seed:12,players:2});
  const q1=state.tiles.find(tile=>tile.kind==='question');
  const wrongAnswer=state.tiles.find(tile=>tile.kind==='answer'&&tile.pairId!==q1.pairId);
  state=flipConcentration(state,q1.id);
  assert.deepEqual(state.seenByPlayer[0],[q1.pairId]);
  assert.deepEqual(state.seenByPlayer[1],[]);
  assert.equal(state.reviewPairId,q1.pairId);
  state=flipConcentration(state,wrongAnswer.id);
  assert.deepEqual(state.seenByPlayer[0],[q1.pairId],
    'answer sides do not go into the question review history');
  state=noteConcentrationWorking(state,0,q1.pairId,'rise / run');
  assert.equal(state.reviewNotes['0:'+q1.pairId],'rise / run');
  assert.equal(noteConcentrationWorking(state,1,q1.pairId,'Should not be allowed'),state);
  assert.equal(noteConcentrationWorking(state,0,q1.pairId,'x'.repeat(1201)),state);
  const before=state;
  state=selectConcentrationHistory(state,1);
  assert.equal(state.reviewPlayer,1);
  assert.equal(state.reviewPairId,null);
  assert.equal(state.pendingMismatch,true,'review does not change the current card pair');
  state=selectConcentrationHistory(state,0);
  assert.equal(state.reviewPairId,q1.pairId);
  assert.deepEqual(state.shown,before.shown);
  state=continueConcentration(state);
  assert.equal(state.turn,1);
  const q2=state.tiles.find(tile=>tile.kind==='question'&&tile.pairId!==q1.pairId);
  state=flipConcentration(state,q2.id);
  assert.deepEqual(state.seenByPlayer[1],[q2.pairId]);
  assert.equal(state.reviewPairId,q1.pairId,
    'the previous player can keep studying while the next player plays');
  state=selectConcentrationHistory(state,1);
  assert.equal(state.reviewPairId,q2.pairId);
  state=noteConcentrationWorking(state,1,q2.pairId,'different calculation');
  assert.equal(state.reviewNotes['0:'+q1.pairId],'rise / run');
  assert.equal(state.reviewNotes['1:'+q2.pairId],'different calculation');
  assert.deepEqual(createConcentrationGame(gradient,{seed:12,players:2}).seenByPlayer,[[],[]],
    'a new set has no notes or question history');
});

test('concentration matches question to answer only, supports two players and completion',()=>{
  let game=createConcentrationGame(quadratics,{seed:17,players:2});
  assert.deepEqual(game,createConcentrationGame(quadratics,{seed:17,players:2}));
  assert.equal(game.tiles.length,16);
  const first=game.tiles[0],other=game.tiles.find(t=>t.pairId!==first.pairId);
  game=flipConcentration(game,first.id);
  game=flipConcentration(game,other.id);
  assert.equal(game.moves,1);
  assert.equal(game.pendingMismatch,true);
  assert.equal(game.scores[0],0);
  game=continueConcentration(game);
  assert.equal(game.turn,1);
  const a=game.tiles.find(t=>t.pairId===first.pairId&&t.kind==='question');
  const b=game.tiles.find(t=>t.pairId===first.pairId&&t.kind==='answer');
  game=flipConcentration(flipConcentration(game,a.id),b.id);
  assert.equal(game.scores[1],1);
  assert.equal(game.turn,1,'correct matches retain the turn');
  for(const key of new Set(game.tiles.map(t=>t.pairId))){
    if(game.matched.includes(key))continue;
    const q=game.tiles.find(t=>t.pairId===key&&t.kind==='question');
    const ans=game.tiles.find(t=>t.pairId===key&&t.kind==='answer');
    game=flipConcentration(flipConcentration(game,q.id),ans.id);
  }
  assert.equal(game.complete,true);
  assert.equal(game.matched.length,8);
  assert.equal(game.scores[1],8);
  assert.equal(flipConcentration(game,first.id),game);
});
test('true hex neighbours and BFS find only connected left-right or top-bottom paths',()=>{
  assert.deepEqual(hexNeighbours(0,3).sort((a,b)=>a-b),[1,3]);
  assert.ok(hexNeighbours(4,3).includes(7));
  assert.ok(hexNeighbours(4,3).includes(8));
  const board=Array.from({length:9},(_,id)=>({id,owner:null}));
  for(const id of [0,1,2])board[id].owner=0;
  assert.equal(hexHasPath(board,0,3),true);
  assert.equal(hexHasPath(board,1,3),false);
  board.forEach(c=>c.owner=null);
  for(const id of [0,3,6])board[id].owner=1;
  assert.equal(hexHasPath(board,1,3),true);
  assert.equal(hexHasPath(board,0,3),false);
  assert.throws(()=>hexNeighbours(50,3),/Invalid hex/);
});
test('hex board offers repeatable questions, passes on a wrong answer and claims only on a correct answer',()=>{
  let game=createHexGame(gradient,{seed:42,size:3});
  assert.deepEqual(game,createHexGame(gradient,{seed:42,size:3}));
  assert.equal(game.cells.length,9);
  game=selectHex(game,0);
  assert.equal(game.pending.index,0);
  const pair=gradient.find(p=>p.id===game.cells[0].pairId);
  const invalid=submitHex(game,gradient,'not maths');
  assert.equal(invalid.pending.result,null);
  assert.equal(invalid.turn,0);
  game=submitHex(game,gradient,'99999999');
  assert.equal(game.pending.result.correct,false);
  assert.equal(game.cells[0].owner,null);
  game=continueHex(game);
  assert.equal(game.turn,1);
  game=selectHex(game,0);
  game=submitHex(game,gradient,pair.answerDisplay);
  assert.equal(game.pending.result.correct,true);
  assert.equal(game.cells[0].owner,1);
  game=continueHex(game);
  assert.equal(game.turn,0);
  game=selectHex(game,1);
  game=cancelHex(game);
  assert.equal(game.pending,null);
  assert.equal(game.rounds,2);
});
test('all three games can be created from a different topic with no game-specific code',()=>{
  for(const pairs of [gradient,sampling,quadratics]){
    for(const type of ['loop-cards','concentration','hex-crossing']){
      const game=createGameSession(type,pairs,{seed:4917,difficulty:'core'});
      assert.equal(game.type,type);
    }
    assert.equal(selectGamePairs(pairs,4917).length,8);
    assert.equal(createGameSession('concentration',pairs,{seed:2,players:1}).players,1);
  }
  const mixed=selectGamePairs(gradient,12,{difficulty:'mixed',count:16});
  assert.ok(mixed.some(p=>p.level==='challenge'));
  for(let seed=1;seed<=60;seed++)
    assert.ok(selectGamePairs(gradient,seed,{difficulty:'mixed'}).some(p=>p.level==='challenge'),
      'Mixed mode should feature a challenge card on seed '+seed);
  assert.throws(()=>createGameSession('new',gradient),/Unknown standard game/);
});
