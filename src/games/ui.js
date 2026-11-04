// Three responsive, keyboard/touch accessible game views. The existing
// maths typesetter processes questions after the book is rendered.
import {escapeHTML as escape} from '../logic.js';
import {mathInputMarkup} from '../math-input.js';
import {STANDARD_GAMES} from './engine.js';
const e=value=>escape(String(value??''));
const button=(action,label,extra='',cls='')=>
  '<button type="button" class="game-action '+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
const LABELS={'loop-cards':'Loop Cards',concentration:'Concentration','hex-crossing':'Hex Crossing'};
function toolbar(state,{focused=true}={}){
  return '<header class="game-toolbar">'+
    '<div class="game-toolbar__identity"><span class="game-toolbar__eyebrow">Maths arcade · Set #'+state.seed+'</span>'+
      '<h2 class="game-play-title">'+e(LABELS[state.type])+'</h2></div>'+
    '<div class="game-toolbar__levels" role="group" aria-label="Question difficulty">'+
      ['core','mixed'].map(id=>button('game-difficulty',id==='core'?'Core':'Challenge',
        'data-level="'+id+'" aria-pressed="'+(state.difficulty===id)+'"',
        'game-action--level'+(state.difficulty===id?' is-active':''))).join('')+
    '</div>'+
    button('game-restart','Restart','','game-action--quiet')+
    button('game-new','New set ↻','','game-action--quiet')+
    button('game-focus-toggle',focused?'← Back to book':'Focus play ⛶',
      'aria-pressed="'+focused+'"','game-action--primary game-focus-toggle')+
    '</header>';
}
function message(state){
  return '<p class="game-feedback'+(state.solved||state.complete||state.winner!==null?
    ' game-feedback--success':'')+'" role="status" aria-live="polite">'+e(state.feedback)+'</p>';
}
function cardFaces(card){
  return '<span class="game-domino__half game-domino__question"><span class="game-domino__key">QUESTION</span>'+
    '<span class="game-domino__copy">'+e(card.question)+'</span></span>'+
    '<span class="game-domino__half game-domino__answer"><span class="game-domino__key">ANSWER</span>'+
    '<span class="game-domino__copy">'+e(card.answerDisplay)+'</span></span>';
}
function domino(card,{selected=false,placed=false}={}){
  return button('game-pick',cardFaces(card),'data-card="'+e(card.id)+'" data-game-draggable="'+e(card.id)+
      '" draggable="true" aria-pressed="'+selected+'" aria-label="'+
      (placed?'Pick up placed card: ':'Pick up unplaced card: ')+e(card.question)+'"',
    'game-domino'+(placed?' game-domino--placed':'')+(selected?' is-picked':''));
}
const LOOP_POSITIONS=['top-left','top','top-right','right','bottom-right','bottom','bottom-left','left'];
const LOOP_ARROWS=['→','→','↓','↓','←','←','↑','↑'];
function renderLoop(state){
  const byId=new Map(state.deck.map(c=>[c.id,c]));
  const slots=state.placements.map((id,index)=>{
    const card=byId.get(id),selected=state.selectedId===id;
    return '<div class="game-loop-slot game-loop-slot--'+LOOP_POSITIONS[index]+
      (index===0?' game-loop-slot--anchor':'')+(selected?' is-picked':'')+
      '" data-loop-slot="'+index+'" data-loop-position="'+LOOP_POSITIONS[index]+'">'+
      '<span class="game-loop-slot__index">'+(index===0?'START':index+1)+'</span>'+
      (card?(index===0?
        '<div class="game-domino game-domino--anchor">'+cardFaces(card)+'</div>':
        domino(card,{selected,placed:true})):
        button('game-slot','<span class="game-loop-empty__icon">+</span><span>Drop or tap to place</span>',
          'data-position="'+index+'" aria-label="Place picked-up card in position '+(index+1)+'"',
          'game-loop-empty'+(state.selectedId?' is-target':'')))+
      '<span class="game-loop-arrow" aria-hidden="true">'+LOOP_ARROWS[index]+'</span>'+
    '</div>';
  }).join('');
  const selected=byId.get(state.selectedId);
  const hub='<div class="game-loop-hub">'+
      '<span class="game-loop-hub__icon" aria-hidden="true">↻</span>'+
      '<strong>Close the loop</strong>'+
      '<span>Follow the arrows. Each question connects to the answer on the next card.</span>'+
      (selected?'<div class="game-loop-hub__picked"><strong>Holding</strong>'+
        '<span>'+e(selected.question)+'</span><em>'+e(selected.answerDisplay)+'</em></div>':
        '<span class="game-loop-hub__picked">Pick a card, then tap a position.</span>')+
      '</div>';
  const tray=state.tray.map(id=>domino(byId.get(id),{selected:state.selectedId===id})).join('');
  return '<section class="game-shell game-shell--loop">'+
    '<div class="game-slim-status"><strong>'+state.placements.filter(Boolean).length+'/'+state.count+
      ' cards placed</strong><span>'+state.attempts+' checks</span>'+
      '<span>'+ (state.solved?'Loop completed':'Clockwise · last links to start')+'</span></div>'+
    '<div class="game-loop-playfield">'+
      '<div class="game-loop-board" aria-label="Eight cards arranged around a closed clockwise loop">'+
        slots+hub+
      '</div>'+
      '<aside class="game-loop-hand" aria-label="Cards waiting to be placed">'+
        '<div class="game-loop-hand__head"><strong>Your cards</strong><span>'+state.tray.length+' remaining</span></div>'+
        '<div class="game-domino-tray">'+(state.solved?
          '<p class="game-complete">Every link is correct. The loop is closed!</p>':
          tray||'<p class="game-loop-hand__empty">All cards are in the ring. Check your loop or rearrange them.</p>')+
        '</div>'+
        '<div class="game-loop-hand__actions">'+
          button('game-check','Check loop ✓',
            (state.solved||state.tray.length?'disabled':'')+' aria-label="Check all eight connections"',
            'game-action--primary')+
          (state.selectedId?button('game-unpick','Put down','','game-action--quiet'):'')+
        '</div>'+
        message(state)+
      '</aside>'+
    '</div>'+
    '<p class="game-gesture-hint">Drag a card into the loop, or tap a card then tap a space. Swap two cards by dropping one on the other. The starting card stays fixed.</p>'+
    '</section>';
}
function renderConcentration(state){
  const cards=state.tiles.map((tile,index)=>{
    const visible=state.shown.includes(tile.id)||state.matched.includes(tile.pairId);
    const complete=state.matched.includes(tile.pairId);
    const label=visible?(tile.kind==='question'?'Question: ':'Answer: ')+tile.text:
      'Turn over card '+(index+1);
    return button('game-flip',
      visible?'<span class="game-memory-tile__type">'+e(tile.kind)+'</span>'+
        '<span class="game-memory-tile__text">'+e(tile.text)+'</span>':
        '<span class="game-memory-tile__back" aria-hidden="true">✦</span>'+
        '<span class="game-memory-tile__number">Card '+(index+1)+'</span>',
      'data-card="'+e(tile.id)+'" aria-label="'+e(label)+'"'+
        (complete||state.pendingMismatch||state.complete?' disabled':''),
      'game-memory-tile'+(visible?' is-open':'')+(complete?' is-matched':''));
  }).join('');
  const revealed=state.tiles.filter(tile=>state.shown.includes(tile.id));
  const reviewPlayer=state.players===1?0:state.reviewPlayer;
  const seen=state.seenByPlayer?.[reviewPlayer]||[];
  const reviewId=seen.includes(state.reviewPairId)?state.reviewPairId:seen.at(-1);
  const question=reviewId?state.tiles.find(tile=>tile.kind==='question'&&tile.pairId===reviewId):null;
  const working=question?state.reviewNotes?.[reviewPlayer+':'+reviewId]||'':'';
  const playerTabs=state.players===2?'<div class="game-memory-history__players" role="group" aria-label="Review question history by player">'+
    [0,1].map(player=>button('game-review-player',
      'P'+(player+1)+' · '+state.seenByPlayer[player].length,
      'data-player="'+player+'" aria-pressed="'+(reviewPlayer===player)+'"',
      'game-action--tiny'+(reviewPlayer===player?' is-active':''))).join('')+
    '</div>':'';
  const seenList=seen.length?
    '<div class="game-memory-history__list" role="group" aria-label="Previously seen questions">'+
      seen.map((id,index)=>{
        const card=state.tiles.find(tile=>tile.kind==='question'&&tile.pairId===id);
        return button('game-review-question',
          '<strong>Q'+(index+1)+'</strong><span>'+e(card?.text||'Question')+'</span>'+
          (state.reviewNotes?.[reviewPlayer+':'+id]?' <em>✎</em>':''),
          'data-pair="'+e(id)+'" data-player="'+reviewPlayer+
            '" aria-pressed="'+(id===reviewId)+'"',
          'game-memory-history__item'+(id===reviewId?' is-active':''));
      }).join('')+'</div>':
    '<p class="game-memory-detail__empty">Question cards you turn over will appear here. You can return to them while the next player takes a turn.</p>';
  const workingPanel=question?
    '<div class="game-memory-working" data-review-question="'+e(reviewId)+'">'+
      '<div class="game-memory-working__label"><strong>Question to think about</strong>'+
      (state.matched.includes(reviewId)?'<span>Pair matched</span>':'<span>Still in play</span>')+'</div>'+
      '<p class="game-memory-working__question">'+e(question.text)+'</p>'+
      '<label for="game-review-note">My working · notes</label>'+
      '<textarea id="game-review-note" data-game-note data-player="'+reviewPlayer+
        '" data-pair="'+e(reviewId)+'" rows="3" maxlength="1200" spellcheck="false" '+
        'placeholder="Calculate the answer here while the game continues…">'+
        e(working)+'</textarea>'+
      '<p class="game-memory-working__hint">Notes stay here until the game is restarted. Answers are not revealed in this panel.</p>'+
    '</div>':'';
  const live=revealed.length?'<div class="game-memory-live"><span>Currently face up</span>'+
    revealed.map(tile=>'<div><strong>'+e(tile.kind)+'</strong><p>'+e(tile.text)+'</p></div>').join('')+
    '</div>':'';
  const details='<aside class="game-memory-detail" aria-label="Questions I have seen">'+
    '<div class="game-memory-detail__header"><strong>Questions I’ve seen</strong>'+
      '<span>Review whilst the next player plays</span></div>'+
    playerTabs+seenList+workingPanel+live+
    (state.pendingMismatch?
      '<div class="game-memory-countdown" aria-label="Cards flip back in five seconds">'+
      '<strong>Not a pair · flipping back in 5 seconds</strong>'+
      '<span class="game-memory-countdown__track"><span></span></span></div>':'')+
    (state.complete?'<p class="game-complete">All matches found!</p>':'')+
    '</aside>';
  return '<section class="game-shell game-shell--memory">'+
    '<div class="game-memory-head">'+
      '<div class="game-player-choice" role="group" aria-label="Number of players">'+
        button('game-players','Solo','data-players="1" aria-pressed="'+(state.players===1)+'"',
          state.players===1?'is-active':'')+
        button('game-players','Two players','data-players="2" aria-pressed="'+(state.players===2)+'"',
          state.players===2?'is-active':'')+'</div>'+
      '<div class="game-slim-status"><strong>'+state.matched.length+' of '+(state.tiles.length/2)+
      ' pairs</strong><span>'+state.moves+' attempt'+(state.moves===1?'':'s')+'</span>'+
      (state.players===2?'<span>Player 1: '+state.scores[0]+' · Player 2: '+state.scores[1]+'</span>':
        '<span>Score: '+state.scores[0]+'</span>')+'</div></div>'+
    '<p class="game-turn">'+(state.players===2?'Player '+(state.turn+1)+' to play · ':
      '')+'Find a matching question and answer. Incorrect pairs turn back after five seconds.</p>'+
    '<div class="game-memory-stage">'+
      '<div class="game-memory-board" aria-label="Sixteen face-down matching cards">'+cards+'</div>'+
      details+'</div>'+message(state)+'</section>';
}
function renderHex(state,pairs){
  const byId=new Map(pairs.map(p=>[p.id,p]));
  const rows=Array.from({length:state.size},(_,row)=>{
    const cells=state.cells.slice(row*state.size,(row+1)*state.size);
    return '<div class="game-hex-row" role="group" aria-label="Row '+(row+1)+'">'+
      cells.map((cell,col)=>{
        const owner=cell.owner===null?'available':cell.owner===0?'forest':'gold';
        const cue=byId.get(cell.pairId)?.cue||String(cell.id+1);
        return button('game-hex-select',
          '<span class="game-hex-cell__cue">'+e(cue)+'</span>',
          'data-cell="'+cell.id+'" aria-label="Row '+(row+1)+', column '+(col+1)+
            ', '+(cell.owner===null?'unclaimed':cell.owner===0?'Player 1':'Player 2')+
          '"'+(cell.owner!==null||state.pending!==null||state.winner!==null?' disabled':''),
          'game-hex-cell game-hex-cell--'+owner);
      }).join('')+'</div>';
  }).join('');
  const pending=state.pending,chosen=pending?state.cells[pending.index]:null;
  const pair=chosen?byId.get(chosen.pairId):null;
  const maths=Boolean(pair&&pair.answer?.kind!=='text');
  // Mathematical answers always use the existing notation editor. It provides
  // visual MathLive input when available and LaTeX typing as its fallback.
  // Vocabulary answers use a separate conventional text field.
  const plainInput=pair&&!maths&&!pending.result?
    '<input id="game-hex-answer" type="text" aria-label="Answer in simple typing" '+
    'autocapitalize="off" autocomplete="off" maxlength="250" spellcheck="false"'+
    ' value="'+e(pending.simpleDraft||'')+'">':'';
  const editor=maths&&!pending.result?
    mathInputMarkup({targetId:'game-hex-answer',active:true,latex:pending.mathLatex||''}):'';
  const challenge=pair?
    '<div class="game-hex-challenge__meta">Player '+(state.turn+1)+
      ' · Hexagon '+(chosen.id+1)+'</div>'+
    '<p class="game-hex-challenge__question">'+e(pair.question)+'</p>'+
    (pending.result?
      '<p class="game-hex-result"><strong>'+(pending.result.correct?'Correct!':'Answer:')+
        '</strong> '+e(pending.result.answer)+'</p>'+
      (state.winner===null?button('game-continue','Next player →','','game-action--primary'):''):
      '<div class="game-hex-form__head">'+
        (maths?'<span id="game-hex-answer-label">Enter a mathematical answer</span>':
          '<label id="game-hex-answer-label" for="game-hex-answer">Your answer</label>')+
      '</div>'+
      '<div class="game-hex-form__row">'+
        '<form id="game-hex-form" class="game-hex-form" novalidate>'+
          '<div class="game-hex-form__editor">'+plainInput+editor+'</div>'+
        '</form>'+
        button('game-hex-submit','Claim hexagon','','game-action--primary')+
      '</div>'+button('game-cancel','Choose another tile','','game-action--quiet'))
    :'<div class="game-hex-placeholder"><span aria-hidden="true">⬡</span>'+
      '<strong>Choose an unclaimed hexagon</strong>'+
      '<p>Answer correctly to claim it for your path.</p></div>';
  return '<section class="game-shell game-shell--hex">'+
    '<div class="game-hex-legend"><span class="game-hex-legend--forest">Forest · Player 1 · left ↔ right</span>'+
      '<span class="game-hex-legend--gold">Gold · Player 2 · top ↕ bottom</span></div>'+
    '<div class="game-hex-stage">'+
      '<div class="game-hex-layout"><span class="game-hex-side game-hex-side--forest">Start</span>'+
        '<div class="game-hex-board" aria-label="Hexagon connection board">'+
        '<span class="game-hex-edge">Gold begins ↓</span>'+rows+
        '<span class="game-hex-edge">↑ Gold finishes</span></div>'+
        '<span class="game-hex-side game-hex-side--forest">Finish</span></div>'+
      '<aside class="game-hex-challenge" aria-label="Current question">'+challenge+'</aside>'+
    '</div>'+
    '<div class="game-slim-status"><strong>Player '+(state.turn+1)+' to play</strong>'+
      '<span>'+state.rounds+' attempted</span>'+
      '<span>'+state.cells.filter(c=>c.owner!==null).length+'/'+state.cells.length+
        ' claimed</span></div>'+
    (state.winner!==null?'<p class="game-complete">Player '+(state.winner+1)+
      ' connected their sides and wins!</p>':'')+
    message(state)+'</section>';
}
export function renderStandardGame(page,session,pairs,{focused=true}={}){
  if(!STANDARD_GAMES.includes(page.gameId)||!session)return '';
  return '<div class="game-workspace" data-standard-game="'+e(page.gameId)+'">'+
    toolbar(session,{focused})+
    (page.gameId==='loop-cards'?renderLoop(session):
      page.gameId==='concentration'?renderConcentration(session):renderHex(session,pairs))+
    '</div>';
}
