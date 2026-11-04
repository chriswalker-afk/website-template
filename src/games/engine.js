// Reusable, deterministic mathematics game logic. No DOM, storage or timers.
// Topic-owned game packs supply the questions, answers and explicitly accepted forms.
import {rngFromSeed,checkFluencyAnswer,answerText} from '../fluency-engine.js';
import {checkExactAnswer,isExactAnswerKind} from '../question-foundation/verification.js';
import {gameTextKey as textKey,validateGamePairs} from './contracts.js';

export const STANDARD_GAMES=Object.freeze(['loop-cards','concentration','hex-crossing']);
export const GAME_DIFFICULTIES=Object.freeze(['core','mixed']);
export const GAME_PAIR_COUNT=8;
const asAnswer=pair=>pair.answer;
const isNumeric=kind=>['number','ordered','unordered'].includes(kind);
function shuffle(rng,items){
  const values=[...items];
  for(let i=values.length-1;i>0;i--){
    const j=Math.floor(rng()*(i+1));
    [values[i],values[j]]=[values[j],values[i]];
  }
  return values;
}
export {numericalGamePair,vocabularyGamePairs,validateGamePairs} from './contracts.js';
export function checkGameAnswer(raw,pair){
  const answer=asAnswer(pair);
  if(!answer)return {correct:false,kind:'unsupported',message:'No checkable answer was authored.'};
  if(answer.kind==='text'){
    const input=textKey(raw);
    if(!input||input.length>250)return {correct:false,kind:'format',message:'Enter a short answer.'};
    const accepted=answer.accepted||[answer.value];
    const correct=accepted.some(v=>textKey(v)===input);
    return {correct,kind:correct?'correct':'value',
      message:correct?'Correct.':'That does not match the answer for this clue.'};
  }
  if(isNumeric(answer.kind))return checkFluencyAnswer(raw,{
    answer,mistake:'Review the values and their signs.'
  });
  if(isExactAnswerKind(answer.kind))return checkExactAnswer(raw,answer);
  return {correct:false,kind:'unsupported',message:'This question needs teacher review.'};
}
export function selectGamePairs(pairs,seed,{difficulty='core',count=GAME_PAIR_COUNT}={}){
  const errors=validateGamePairs(pairs);
  if(errors.length)throw new TypeError(errors.join('; '));
  if(!GAME_DIFFICULTIES.includes(difficulty))throw new RangeError('Unknown game difficulty');
  if(!Number.isInteger(count)||count<1||count>pairs.length)throw new RangeError('Invalid pair count');
  const eligible=pairs.filter(p=>difficulty==='mixed'||p.level!=='challenge');
  if(eligible.length<count)throw new RangeError('Not enough question–answer pairs for this difficulty');
  const rng=rngFromSeed(seed),selected=shuffle(rng,eligible).slice(0,count);
  // Mixed mode must actually feature challenge material when it exists.
  if(difficulty==='mixed'&&count>=2&&!selected.some(p=>p.level==='challenge')){
    const challenges=eligible.filter(p=>p.level==='challenge');
    if(challenges.length)selected[count-1]=shuffle(rng,challenges)[0];
  }
  return selected;
}
function config(seed,difficulty){
  rngFromSeed(seed);
  if(!GAME_DIFFICULTIES.includes(difficulty))throw new RangeError('Unknown game difficulty');
}
export function createLoopGame(pairs,{seed=2026,difficulty='core',count=GAME_PAIR_COUNT}={}){
  config(seed,difficulty);
  const chosen=selectGamePairs(pairs,seed,{difficulty,count});
  // Card i contains question i and the answer to question i-1.
  // Therefore answer on card (i+1) matches question on card i in a closed cycle.
  const deck=chosen.map((item,index)=>({
    id:item.id,question:item.question,questionId:item.id,
    answerDisplay:chosen[(index-1+chosen.length)%chosen.length].answerDisplay,
    answerFor:chosen[(index-1+chosen.length)%chosen.length].id
  }));
  // Lock an anchor card: cyclic rotations should not create multiple UI solutions.
  return {type:'loop-cards',seed,difficulty,count,
    deck,placements:[deck[0].id,...Array(count-1).fill(null)],selectedId:null,
    tray:shuffle(rngFromSeed((seed%999999998)+1),deck.slice(1).map(c=>c.id)),
    attempts:0,solved:false,checked:false,feedback:'Pick up a card, then choose its place in the ring. Follow the arrows clockwise and connect the last card back to START.'};
}
// Select a physical card with a click/keyboard/tap; the next slot tap places it.
export function loopPick(state,id){
  if(state.type!=='loop-cards'||state.solved||
    !state.deck.some(card=>card.id===id)||state.placements[0]===id)return state;
  const selectedId=state.selectedId===id?null:id;
  return {...state,selectedId,feedback:selectedId?
    'Card picked up. Choose a space in the ring, or drag it to a different space.':
    'Card released. Pick a card to move it.'};
}
// Move a card into any non-anchor slot. Occupied slots exchange cards;
// a displaced card returns to the tray when the source was the tray.
export function loopMove(state,id,to){
  if(state.type!=='loop-cards'||state.solved||
    !Number.isInteger(to)||to<1||to>=state.count||!state.deck.some(card=>card.id===id))
    return state;
  const from=state.placements.indexOf(id),inTray=state.tray.includes(id);
  if(from===0||from===to||from<0&&!inTray)return state;
  const placements=[...state.placements],displaced=placements[to];
  const tray=[...state.tray];
  if(from>=1)placements[from]=displaced;
  else{
    tray.splice(tray.indexOf(id),1);
    if(displaced)tray.push(displaced);
  }
  placements[to]=id;
  return {...state,placements,tray,selectedId:null,checked:false,
    feedback:displaced?'Cards exchanged. Check the links in the ring.':
      'Card placed. Follow the arrows to connect the next question and answer.'};
}
export function loopPlace(state,id){
  if(state.type!=='loop-cards'||state.solved||!state.tray.includes(id))return state;
  const index=state.placements.findIndex(p=>p===null);
  if(index===-1)return state;
  const positions=[...state.placements];positions[index]=id;
  return {...state,placements:positions,tray:state.tray.filter(item=>item!==id),
    selectedId:null,checked:false,feedback:'Card placed. Keep linking the question to the answer on the next card.'};
}
export function loopRemove(state,index){
  if(state.type!=='loop-cards'||state.solved||!Number.isInteger(index)||
    index<=0||index>=state.count||!state.placements[index])return state;
  const id=state.placements[index],placements=[...state.placements];
  placements[index]=null;
  return {...state,placements,tray:[...state.tray,id],selectedId:null,checked:false,
    feedback:'Card returned to your collection.'};
}
export function swapLoop(state,from,to){
  if(state.type!=='loop-cards'||state.solved||
    !Number.isInteger(from)||!Number.isInteger(to)||
    from<=0||to<=0||from>=state.count||to>=state.count||
    Math.abs(from-to)!==1||!state.placements[from]||!state.placements[to])return state;
  const placements=[...state.placements];
  [placements[from],placements[to]]=[placements[to],placements[from]];
  return {...state,placements,selectedId:null,checked:false,
    feedback:'Cards swapped. Check how their neighbouring questions and answers connect.'};
}
export function checkLoop(state){
  if(state.type!=='loop-cards'||state.solved)return state;
  if(state.placements.some(p=>p===null))
    return {...state,feedback:'Place every card before checking your closed loop.',checked:false};
  const byId=new Map(state.deck.map(c=>[c.id,c]));
  const wrong=state.placements.filter((id,i)=>{
    const next=byId.get(state.placements[(i+1)%state.count]);
    return next?.answerFor!==id;
  }).length;
  const solved=wrong===0;
  return {...state,attempts:state.attempts+1,solved,checked:true,
    feedback:solved?'Complete loop! Every question connects to the answer on the next card, including the last card.':
      wrong+' connection'+(wrong===1?'':'s')+' do not match. Rearrange the cards and check again.'};
}
export function createConcentrationGame(pairs,{seed=2026,difficulty='core',players=1,count=GAME_PAIR_COUNT}={}){
  config(seed,difficulty);
  if(![1,2].includes(players))throw new RangeError('Choose one or two players');
  const chosen=selectGamePairs(pairs,seed,{difficulty,count});
  const tiles=shuffle(rngFromSeed((seed%999999998)+1),chosen.flatMap(pair=>[
    {id:pair.id+':question',pairId:pair.id,kind:'question',text:pair.question},
    {id:pair.id+':answer',pairId:pair.id,kind:'answer',text:pair.answerDisplay}
  ]));
  return {type:'concentration',seed,difficulty,players,tiles,
    shown:[],matched:[],moves:0,scores:[0,0],turn:0,pendingMismatch:false,
    seenByPlayer:[[],[]],reviewPlayer:0,reviewPairId:null,reviewNotes:{},
    complete:false,feedback:'Flip a question card and the answer that matches it.'};
}
// Capture only the *question* sides actually exposed by a player.
 // Review is independent of turn so one player can calculate while the other
 // flips cards. The history stores question IDs, never hidden answer text.
function withSeenQuestion(state,tile){
  if(tile.kind!=='question')return state;
  const seenByPlayer=state.seenByPlayer.map(ids=>[...ids]);
  if(!seenByPlayer[state.turn].includes(tile.pairId))
    seenByPlayer[state.turn].push(tile.pairId);
  return {...state,seenByPlayer,
    reviewPairId:state.reviewPlayer===state.turn?
      tile.pairId:state.reviewPairId};
}
export function selectConcentrationHistory(state,player,pairId=null){
  if(state.type!=='concentration'||!Number.isInteger(player)||
    player<0||player>=state.players)return state;
  const list=state.seenByPlayer[player];
  if(pairId!==null&&!list.includes(pairId))return state;
  const selected=pairId===null?
    (player===state.reviewPlayer&&list.includes(state.reviewPairId)?
      state.reviewPairId:list.at(-1)||null):pairId;
  if(player===state.reviewPlayer&&selected===state.reviewPairId)return state;
  return {...state,reviewPlayer:player,reviewPairId:selected};
}
export function noteConcentrationWorking(state,player,pairId,working){
  if(state.type!=='concentration'||!Number.isInteger(player)||
    player<0||player>=state.players||
    !state.seenByPlayer[player].includes(pairId)||
    typeof working!=='string'||working.length>1200)return state;
  const key=player+':'+pairId;
  return {...state,reviewNotes:{...state.reviewNotes,[key]:working}};
}
export function flipConcentration(state,id){
  if(state.type!=='concentration'||state.complete||state.pendingMismatch||
    state.shown.includes(id)||state.tiles.every(t=>t.id!==id))return state;
  const tile=state.tiles.find(t=>t.id===id);
  if(state.matched.includes(tile.pairId))return state;
  state=withSeenQuestion(state,tile);
  if(state.shown.length===0)return {...state,shown:[id],feedback:'Find the matching question or answer.'};
  const other=state.tiles.find(t=>t.id===state.shown[0]),correct=
    tile.pairId===other.pairId&&tile.kind!==other.kind;
  const moves=state.moves+1;
  if(!correct)return {...state,shown:[state.shown[0],id],moves,
    pendingMismatch:true,feedback:'No match. Both cards will flip back automatically in 5 seconds.'};
  const matched=[...state.matched,tile.pairId],scores=[...state.scores];
  scores[state.turn]++;
  const complete=matched.length===state.tiles.length/2;
  return {...state,shown:[],matched,moves,scores,complete,
    feedback:complete?'All pairs found! '+(state.players===2?
      (scores[0]===scores[1]?'It is a draw.':'Player '+(scores[0]>scores[1]?'1':'2')+' wins.'):'Well done!'):
      'Matching pair! '+(state.players===2?'The same player takes another turn.':'Find another pair.')};
}
export function continueConcentration(state){
  if(state.type!=='concentration'||!state.pendingMismatch)return state;
  return {...state,shown:[],pendingMismatch:false,
    turn:state.players===2?1-state.turn:0,
    feedback:state.players===2?'Player '+(2-state.turn)+' to play. Choose two cards.':'Try another pair.'};
}

// Pointy-top hexes in an odd-r offset grid, with alternate rows shifted right.
export function hexNeighbours(index,size=5){
  if(!Number.isInteger(size)||size<2||size>9||!Number.isInteger(index)||index<0||index>=size*size)
    throw new RangeError('Invalid hex cell');
  const row=Math.floor(index/size),col=index%size,out=[];
  for(const dc of [-1,1])if(col+dc>=0&&col+dc<size)out.push(index+dc);
  for(const dr of [-1,1]){
    const r=row+dr;
    if(r<0||r>=size)continue;
    for(const c of (row%2===0?[col-1,col]:[col,col+1]))
      if(c>=0&&c<size)out.push(r*size+c);
  }
  return out;
}
export function hexHasPath(cells,owner,size=5){
  if(![0,1].includes(owner)||cells?.length!==size*size)return false;
  const starts=[];
  for(let i=0;i<cells.length;i++){
    if(cells[i].owner===owner&&
      (owner===0?i%size===0:Math.floor(i/size)===0))starts.push(i);
  }
  const seen=new Set(starts),stack=[...starts];
  while(stack.length){
    const i=stack.pop();
    if(owner===0?i%size===size-1:Math.floor(i/size)===size-1)return true;
    for(const neighbour of hexNeighbours(i,size)){
      if(cells[neighbour].owner===owner&&!seen.has(neighbour)){
        seen.add(neighbour);stack.push(neighbour);
      }
    }
  }
  return false;
}
export function createGameSession(type,pairs,options={}){
  if(!STANDARD_GAMES.includes(type))throw new TypeError('Unknown standard game '+type);
  if(type==='loop-cards')return createLoopGame(pairs,options);
  if(type==='concentration')return createConcentrationGame(pairs,options);
  return createHexGame(pairs,options);
}
export function createHexGame(pairs,{seed=2026,difficulty='core',size=5}={}){
  config(seed,difficulty);
  if(!Number.isInteger(size)||size<3||size>7)throw new RangeError('Choose a 3–7 hex grid');
  const eligible=selectGamePairs(pairs,seed,{difficulty,count:Math.min(pairs.filter(
    p=>difficulty==='mixed'||p.level!=='challenge').length,size*size)});
  const cells=Array.from({length:size*size},(_,i)=>({
    id:i,owner:null,pairId:eligible[i%eligible.length].id
  }));
  return {type:'hex-crossing',seed,difficulty,size,cells,turn:0,
    pending:null,feedback:'Player 1 (Forest) connects left to right. Player 2 (Gold) connects top to bottom. Answer a question to claim a hexagon.',winner:null,rounds:0};
}
export function selectHex(state,index){
  if(state.type!=='hex-crossing'||state.winner!==null||state.pending!==null||
    !Number.isInteger(index)||index<0||index>=state.cells.length||
    state.cells[index].owner!==null)return state;
  return {...state,pending:{index,result:null,mathMode:null,mathLatex:'',simpleDraft:''},
    feedback:'Answer correctly to claim this hexagon.'};
}
export function submitHex(state,pairs,raw){
  if(state.type!=='hex-crossing'||state.winner!==null||!state.pending||
    state.pending.result!==null)return state;
  const pair=pairs.find(p=>p.id===state.cells[state.pending.index].pairId);
  if(!pair)return {...state,feedback:'No question found for this cell.'};
  const result=checkGameAnswer(raw,pair);
  if(result.kind==='format'||result.kind==='unsupported')
    return {...state,feedback:result.message};
  let cells=state.cells,winner=state.winner;
  if(result.correct){
    cells=state.cells.map((cell,i)=>i===state.pending.index?{...cell,owner:state.turn}:cell);
    if(hexHasPath(cells,state.turn,state.size))winner=state.turn;
  }
  return {...state,cells,winner,rounds:state.rounds+1,
    pending:{...state.pending,result:{correct:result.correct,
      answer:pair.answerDisplay,kind:result.kind}},
    feedback:winner!==null?'Player '+(winner+1)+' wins — connected across the board!':
      result.correct?'Correct. Hexagon claimed.':'Not quite. This hexagon stays available for another attempt.'};
}
export function continueHex(state){
  if(state.type!=='hex-crossing'||!state.pending?.result||state.winner!==null)return state;
  return {...state,turn:1-state.turn,pending:null,
    feedback:'Player '+(2-state.turn)+' to play. Choose a hexagon.'};
}
export function cancelHex(state){
  if(state.type!=='hex-crossing'||!state.pending||state.pending.result)return state;
  return {...state,pending:null,feedback:'Choose a hexagon to attempt.'};
}
