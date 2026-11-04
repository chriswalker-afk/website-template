// Accessible, dependency-free game views for the existing book UI.
// Every question and answer is escaped; the mathematical typesetter handles
// mathematical reading text after the page is rendered.
import {escapeHTML as escape} from '../logic.js';
import {STANDARD_GAMES} from './engine.js';
const e=value=>escape(String(value??''));
const button=(action,label,extra='',cls='')=>
  '<button type="button" class="game-action '+cls+'" data-action="'+action+'" '+extra+'>'+label+'</button>';
const span=(value,cls='')=>'<span class="'+cls+'">'+e(value)+'</span>';
const cardFaces=card=>
  '<span class="game-domino__half game-domino__question"><span class="game-domino__key">QUESTION</span>'+
    '<span class="game-domino__copy">'+e(card.question)+'</span></span>'+
  '<span class="game-domino__half game-domino__answer"><span class="game-domino__key">ANSWER</span>'+
    '<span class="game-domino__copy">'+e(card.answerDisplay)+'</span></span>';
function toolbar(state){
  const options=[{id:'core',label:'Core maths'},{id:'mixed',label:'Include challenge'}];
  return '<div class="game-toolbar" aria-label="Game settings">'+
    '<div class="game-toolbar__seed"><strong>Set #'+state.seed+'</strong><span>Repeatable shuffle</span></div>'+
    '<div class="game-toolbar__levels" role="group" aria-label="Question difficulty">'+
      options.map(o=>button('game-difficulty',e(o.label),
        'data-level="'+o.id+'" aria-pressed="'+(state.difficulty===o.id)+'"',
        'game-action--level'+(state.difficulty===o.id?' is-active':''))).join('')+'</div>'+
    button('game-restart','Restart','', 'game-action--quiet')+
    button('game-new','New shuffle ↻','','game-action--primary')+
  '</div>';
}
function message(state){
  return '<p class="game-feedback'+(state.solved||state.complete||state.winner!==null?' game-feedback--success':'')+
    '" role="status" aria-live="polite">'+e(state.feedback)+'</p>';
}
function renderLoop(state){
  const byId=new Map(state.deck.map(c=>[c.id,c]));
  const slots=state.placements.map((id,index)=>{
    const card=byId.get(id);
    return '<div class="game-loop-slot'+(index===0?' game-loop-slot--anchor':'')+
      '" data-slot="'+index+'">'+
      '<div class="game-loop-slot__head"><span>Card '+(index+1)+'</span>'+
      (index===0?'<strong>Start</strong>':card&&!state.solved?'<span>Tap to move</span>':'')+'</div>'+
      (card?(index===0||state.solved?
          '<div class="game-domino game-domino--placed">'+cardFaces(card)+'</div>':
          button('game-remove',cardFaces(card),'data-position="'+index+
            '" aria-label="Return card '+(index+1)+' to the tray"','game-domino game-domino--placed')
        ):'<div class="game-loop-empty"><span>+</span><span>Choose a card</span></div>')+
    '</div>';
  }).join('');
  const tray=state.tray.map(id=>{
    const card=byId.get(id);
    return button('game-place',cardFaces(card),'data-card="'+e(id)+
      '" aria-label="Place card containing question '+e(card.question)+'"','game-domino');
  }).join('');
  return '<section class="game-shell game-shell--loop">'+
    '<div class="game-stats"><span>'+state.placements.filter(Boolean).length+'/'+state.count+
      ' cards placed</span><span>'+state.attempts+' check'+(state.attempts===1?'':'s')+
      '</span><span>'+(state.solved?'Loop complete':'Last card must link to the first')+'</span></div>'+
    '<p class="game-intro">The <strong>question</strong> on each card must match the <strong>answer on the next card</strong>. The first card is fixed; rearrange the others to close the loop.</p>'+
    '<div class="game-loop-board" aria-label="Your loop card sequence">'+slots+'</div>'+
    '<p class="game-loop-closure"><span aria-hidden="true">↶</span> Loop back: the last question must match the first answer.</p>'+
    '<h3 class="game-subheading">Cards to place</h3>'+
    (state.solved?'<p class="game-complete">Every connection is correct. Try another shuffle or a challenge deck.</p>':
      '<div class="game-domino-tray" aria-label="Unplaced question and answer cards">'+tray+'</div>')+
    '<div class="game-bottom">'+button('game-check','Check my loop',
      (state.solved||state.tray.length?'disabled':''),'game-action--primary')+'</div>'+
    message(state)+'</section>';
}
function tileClass(state,tile){
  const visible=state.shown.includes(tile.id)||state.matched.includes(tile.pairId);
  return 'game-memory-tile'+(visible?' is-open':'')+
    (state.matched.includes(tile.pairId)?' is-matched':'');
}
function renderConcentration(state){
  const cards=state.tiles.map((tile,i)=>{
    const visible=state.shown.includes(tile.id)||state.matched.includes(tile.pairId);
    const complete=state.matched.includes(tile.pairId);
    const label=visible?(tile.kind==='question'?'Question: ':'Answer: ')+tile.text:
      'Turn over card '+(i+1);
    return button('game-flip',
      visible?'<span class="game-memory-tile__type">'+e(tile.kind)+'</span>'+
        '<span class="game-memory-tile__text">'+e(tile.text)+'</span>':
        '<span class="game-memory-tile__back" aria-hidden="true">✦</span>'+
        '<span class="game-memory-tile__number">Card '+(i+1)+'</span>',
      'data-card="'+e(tile.id)+'" aria-label="'+e(label)+'"'+
        (complete||state.pendingMismatch||state.complete?' disabled':''),
      tileClass(state,tile));
  }).join('');
  return '<section class="game-shell game-shell--memory">'+
    '<div class="game-toolbar__levels game-player-choice" role="group" aria-label="Number of players">'+
      button('game-players','Solo','data-players="1" aria-pressed="'+(state.players===1)+'"',
        state.players===1?'is-active':'')+
      button('game-players','Two players','data-players="2" aria-pressed="'+(state.players===2)+'"',
        state.players===2?'is-active':'')+
    '</div>'+
    '<div class="game-stats">'+
      '<span>'+state.matched.length+'/'+(state.tiles.length/2)+' pairs</span>'+
      '<span>'+state.moves+' attempts</span>'+
      (state.players===2?'<span>Player 1: '+state.scores[0]+' · Player 2: '+state.scores[1]+'</span>':
        '<span>Matched: '+state.scores[0]+'</span>')+
      '</div>'+
    (state.players===2?'<p class="game-turn">Player <strong>'+(state.turn+1)+
      '</strong> to play. A correct match keeps the turn; an incorrect pair passes it.</p>':
      '<p class="game-intro">Turn over a question and the answer that belongs to it. Find all matching pairs.</p>')+
    '<div class="game-memory-board" aria-label="Concentration matching cards">'+cards+'</div>'+
    (state.pendingMismatch?'<div class="game-bottom">'+button('game-continue','Hide cards and continue',
      '', 'game-action--primary')+'</div>':'')+
    (state.complete?'<p class="game-complete">All pairs found! '+
      (state.players===2?(state.scores[0]===state.scores[1]?'It is a draw.':
        'Player '+(state.scores[0]>state.scores[1]?'1':'2')+' wins.'):'Game complete.')+'</p>':'')+
    message(state)+'</section>';
}
function renderHex(state,pairs){
  const byId=new Map(pairs.map(p=>[p.id,p]));
  const rows=Array.from({length:state.size},(_,row)=>{
    const cells=state.cells.slice(row*state.size,(row+1)*state.size);
    return '<div class="game-hex-row" role="group" aria-label="Row '+(row+1)+'">'+
      cells.map((cell,c)=>{
        const owner=cell.owner===null?'available':cell.owner===0?'forest':'gold';
        const clue=byId.get(cell.pairId)?.cue||String(cell.id+1);
        return button('game-hex-select',
          '<span class="game-hex-cell__cue">'+e(clue)+'</span>',
          'data-cell="'+cell.id+'" aria-label="Row '+(row+1)+', column '+(c+1)+
          ', '+(cell.owner===null?'unclaimed':cell.owner===0?'Player 1':'Player 2')+
          '"'+(cell.owner!==null||state.pending!==null||state.winner!==null?' disabled':''),
          'game-hex-cell game-hex-cell--'+owner);
      }).join('')+'</div>';
  }).join('');
  const isPending=state.pending!==null,selected=isPending?
    state.cells[state.pending.index]:null,pair=selected?byId.get(selected.pairId):null;
  const prompt=pair?'<section class="game-hex-challenge" aria-label="Hexagon challenge">'+
    '<p class="game-hex-challenge__meta">Player '+(state.turn+1)+
      ' · Hexagon '+(selected.id+1)+'</p>'+
    '<p class="game-hex-challenge__question">'+e(pair.question)+'</p>'+
    (state.pending.result?
      '<p><strong>'+(state.pending.result.correct?'Correct!':'Answer to review:')+'</strong> '+
        e(state.pending.result.answer)+'</p>'+
      (state.winner===null?button('game-continue','Next turn →','','game-action--primary'):''):
      '<form id="game-hex-form" class="game-hex-form">'+
        '<label for="game-hex-answer">Your answer</label>'+
        '<div class="game-hex-form__row"><input id="game-hex-answer" type="text" required '+
          'autocapitalize="off" autocomplete="off" maxlength="250" spellcheck="false">'+
          '<button type="submit" class="game-action game-action--primary">Check answer</button></div>'+
        '</form>'+button('game-cancel','Choose another hexagon','','game-action--quiet'))+
    '</section>':'';
  return '<section class="game-shell game-shell--hex">'+
    '<p class="game-intro">Pass-and-play for two students. <strong>Player 1 (Forest)</strong> makes a connected path from left to right; <strong>Player 2 (Gold)</strong> goes from top to bottom. Hexagons are earned by correctly answering their questions.</p>'+
    '<div class="game-hex-legend"><span class="game-hex-legend--forest">Forest: left ↔ right</span>'+
      '<span class="game-hex-legend--gold">Gold: top ↕ bottom</span></div>'+
    '<div class="game-hex-layout"><span class="game-hex-side game-hex-side--forest">Start · 1</span>'+
      '<div class="game-hex-board" aria-label="Hexagon connection board">'+
      '<span class="game-hex-edge">Gold starts here ↓</span>'+rows+
      '<span class="game-hex-edge">↑ Gold finishes here</span></div>'+
      '<span class="game-hex-side game-hex-side--forest">Finish · 1</span></div>'+
    '<div class="game-stats"><span>Turn: Player '+(state.turn+1)+'</span>'+
      '<span>Answered: '+state.rounds+'</span>'+
      '<span>Claimed: '+state.cells.filter(c=>c.owner!==null).length+'/'+state.cells.length+'</span></div>'+
    prompt+
    (state.winner!==null?'<p class="game-complete">Player '+(state.winner+1)+
      ' has connected their sides of the board and wins!</p>':'')+
    message(state)+'</section>';
}
export function renderStandardGame(page,session,pairs){
  if(!STANDARD_GAMES.includes(page.gameId)||!session)return '';
  return '<div class="game-workspace" data-standard-game="'+e(page.gameId)+'">'+
    toolbar(session)+
    (page.gameId==='loop-cards'?renderLoop(session):
      page.gameId==='concentration'?renderConcentration(session):renderHex(session,pairs))+
    '<p class="game-privacy">Questions are selected from this topic’s reviewed game bank. '+
    'Game progress remains in this browser session; no account or online leaderboard is required.</p>'+
    '</div>';
}
