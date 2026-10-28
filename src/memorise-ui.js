import {cardStatus,deckQueue,matchRoundCards,progressSummary,recordFor,normaliseTerm} from './memorise-engine.js';
import {escapeHTML as e} from './logic.js';

const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const safe=v=>e(String(v??''));
const byId=(topic,id)=>topic.cards.find(c=>c.id===id);
const plural=(n,singular,pluralWord=singular+'s')=>n+' '+(n===1?singular:pluralWord);
const nav=(topicId,section)=>'#/'+topicId+'/memorise/'+section;
export function memoryPulse(topic,memory,now=Date.now()){
  const stats=progressSummary(topic,memory,now);
  return '<div class="memorise-pulse" aria-label="Saved revision progress">'+
    '<span><strong>'+stats.total+'</strong> cards</span>'+
    '<span><strong>'+stats.new+'</strong> new</span>'+
    '<span><strong>'+stats.due+'</strong> due</span>'+
    '<span><strong>'+stats.flagged+'</strong> flagged</span>'+
    '<span class="memorise-pulse__note">'+icon('bookmark')+' Saved on this device</span></div>';
}
function modeButtons(action,mode,includeDue=true){
  const entries=[['all','All cards'],['focus','Priority practice'],...(includeDue?[['due','Due now']]:[])];
  return '<div class="memorise-modes" role="group" aria-label="Choose revision cards">'+
    entries.map(([id,label])=>'<button type="button" data-action="'+action+'" data-mode="'+id+
      '" aria-pressed="'+(mode===id)+'">'+e(label)+'</button>').join('')+'</div>';
}
function emptyModeText(mode){
  return mode==='due'?
    'No cards are due right now. Continue with All cards or Priority practice.':
    'There are no priority cards right now. Choose All cards to practise again.';
}
export function renderFlashcards(topic,memory,flash,now=Date.now()){
  const queue=flash.ids||topic.cards.map(c=>c.id);
  const stats=progressSummary(topic,memory,now);
  const card=byId(topic,queue[flash.index]);
  const progress=card?recordFor(memory,card.id):null;
  const status=card?cardStatus(memory,card.id,now):'';
  const mode=flash.mode||'all';
  const completed=Boolean(flash.complete);
  const cardMarkup=!card?
    '<div class="memorise-empty">'+e(emptyModeText(mode))+'</div>':
    '<section class="memorise-flash-section">'+
      '<div class="flashcard-counter"><span>Card '+(flash.index+1)+' of '+queue.length+'</span>'+
        '<span>'+e(status)+'</span></div>'+
      '<div class="flashcard-stage"><button class="flashcard'+(flash.flipped?' is-flipped':'')+
        '" type="button" id="flashcard" data-action="flash-flip" '+
        'aria-label="'+(flash.flipped?'Show front of '+e(card.term):'Reveal answer for '+e(card.term))+
        '" aria-pressed="'+Boolean(flash.flipped)+'">'+
        '<span class="flashcard__inner">'+
          '<span class="flashcard__face flashcard__face--front" aria-hidden="'+Boolean(flash.flipped)+'">'+
            '<span class="flashcard__eyebrow">Recall the definition</span>'+
            '<span class="flashcard__main">'+e(card.term)+'</span>'+
            '<span class="flashcard__bottom">Tap or press Enter to reveal</span></span>'+
          '<span class="flashcard__face flashcard__face--back" aria-hidden="'+!flash.flipped+'">'+
            '<span class="flashcard__eyebrow">Check your recall</span>'+
            '<span class="flashcard__main">'+e(card.definition)+'</span>'+
            '<span class="flashcard__bottom">Rate your recall below</span></span>'+
        '</span></button></div>'+
      '<div class="flashcard-controls">'+
        '<button class="nav-button" type="button" data-action="flash-prev" '+(flash.index===0?'disabled':'')+
          ' aria-label="Previous card">'+icon('arrow-left')+' Previous</button>'+
        '<button class="nav-button" type="button" data-action="flash-next" '+
          (flash.index===queue.length-1?'disabled':'')+'>Next '+icon('arrow')+'</button>'+
        '<button class="quiet-button" type="button" data-action="flash-restart">'+icon('refresh')+' Restart round</button>'+
      '</div>'+
      '<div class="self-ratings" id="ratings" role="group" aria-label="Rate your recall"'+(flash.flipped?'':' hidden')+'>'+
        '<small>How well did you remember the definition?</small>'+
        [['again','Again'],['nearly','Nearly'],['know','Know']].map(([id,label])=>
          '<button type="button" class="rating" data-action="flash-rate" data-rating="'+id+'">'+
            label+'</button>').join('')+'</div>'+
    '</section>';
  const completion=completed?
    '<div class="memorise-finish" role="status"><strong>Round complete.</strong> '+
    plural(flash.rated||0,'card')+' self-rated. Your next review dates are saved locally.'+
    '<button class="quiet-button" type="button" data-action="flash-restart">Start another round</button></div>':'';
  return memoryPulse(topic,memory,now)+modeButtons('flash-mode',mode)+
    '<div class="memory-layout"><div>'+
      (completed?'':cardMarkup)+completion+
    '</div><aside class="memory-sidebar" aria-label="Deck progress">'+
      '<div class="stat"><span>Cards in this round</span><strong>'+queue.length+'</strong></div>'+
      '<div class="stat"><span>Cards rated this round</span><strong>'+Number(flash.rated||0)+'</strong></div>'+
      '<div class="stat"><span>Previously reviewed</span><strong>'+(stats.total-stats.new)+'</strong></div>'+
      '<p class="memory-sidebar__help">Flip to check the definition, then rate how well you recalled it. A rating is a self-assessment, not a test score.</p>'+
      (card?'<button class="memory-flag" type="button" data-action="memory-flag" data-id="'+
        e(card.id)+'" aria-pressed="'+Boolean(progress.flagged)+'">'+
        (progress.flagged?'Remove review flag':'Flag for review')+'</button>':'')+
    '</aside></div>'+
    '<details class="deck-browser"><summary>Browse all '+topic.cards.length+' cards</summary>'+
      '<ol>'+topic.cards.map(c=>'<li><strong>'+e(c.term)+'</strong><span>'+e(c.definition)+'</span></li>').join('')+'</ol></details>';
}
export function renderMatch(topic,memory,game,now=Date.now()){
  const items=matchRoundCards(topic,game.round||0,4);
  // Stable within a round, but not a predictable reversed column.
  const shuffled=(arr,salt)=>{
    const output=[...arr];
    let seed=(((game.round||0)+1)*1664525+salt)>>>0;
    for(let i=output.length-1;i>0;i--){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const j=seed%(i+1);
      [output[i],output[j]]=[output[j],output[i]];
    }
    return output;
  };
  const termOrder=shuffled(items,97);
  const defOrder=shuffled(items,3301);
  const complete=game.matched.length===items.length;
  const rounds=Math.ceil(topic.cards.length/4);
  const number=(game.round||0)%rounds+1;
  const cardButton=(card,side,label)=>
    '<button type="button" class="match-choice" data-action="match-choice" data-side="'+side+
    '" data-id="'+e(card.id)+'" aria-pressed="'+(game[side]===card.id)+
    '" '+(game.matched.includes(card.id)?'disabled':'')+'>'+e(label)+'</button>';
  return memoryPulse(topic,memory,now)+
    '<div class="memorise-round"><div><strong>Round '+number+' of '+rounds+'</strong>'+
    '<span>'+game.matched.length+' of '+items.length+' pairs connected</span></div>'+
    '<p>Match each term with its definition. A correct pair reinforces recognition; try Speed Recall to test recall without choices.</p></div>'+
    '<div class="match-columns">'+
      '<section class="match-column" aria-label="Terms"><p class="match-column__label">Terms</p>'+
        termOrder.map(card=>cardButton(card,'term',card.term)).join('')+'</section>'+
      '<section class="match-column" aria-label="Definitions"><p class="match-column__label">Definitions</p>'+
        defOrder.map(card=>cardButton(card,'definition',card.definition)).join('')+'</section>'+
    '</div>'+
    '<div class="game-feedback" id="match-feedback" role="status">'+
      e(complete?'All '+items.length+' pairs matched.':game.message||('Choose a term and its definition.'))+
    '</div><div class="memorise-actions">'+
    (complete?'<button class="action-button" type="button" data-action="match-next">Next round '+icon('arrow')+'</button>':'')+
    '<button type="button" class="quiet-button" data-action="match-reset">'+
      icon('refresh')+' Start this round again</button></div>';
}
export function renderCloze(topic,memory,game,now=Date.now()){
  const queue=game.ids||topic.clozes.map(c=>c.id);
  const item=topic.clozes.find(c=>c.id===queue[game.index]);
  const done=Boolean(game.complete);
  let content='';
  if(done){
    content='<div class="memorise-finish" role="status"><strong>Practice complete.</strong> '+
      game.correctCount+' of '+queue.length+' prompts answered correctly on the first attempt.'+
      '<button class="action-button" type="button" data-action="cloze-restart">Practise again</button></div>';
  }else if(!item){
    content='<div class="memorise-empty">'+e(emptyModeText(game.mode))+'</div>';
  }else{
    content='<section class="cloze-area">'+
      '<div class="memorise-round"><strong>Prompt '+(game.index+1)+' of '+queue.length+'</strong>'+
      '<span>'+e(cardStatus(memory,item.cardId,now))+'</span></div>'+
      '<form id="cloze-form"><p class="cloze-line">'+e(item.before)+
        '<label class="sr-only" for="cloze-answer">Missing mathematical word or phrase</label>'+
        '<input class="cloze-input" id="cloze-answer" name="answer" autocomplete="off" spellcheck="false" '+
        'value="'+e(game.value)+'" aria-describedby="cloze-feedback" '+(game.checked?'disabled':'required')+'>'+
        e(item.after)+'</p>'+
        '<div class="form-actions">'+
          '<button class="action-button" type="submit" '+(game.checked?'disabled':'')+'>'+
            'Check answer '+icon('check')+'</button>'+
          '<button class="quiet-button" type="button" data-action="cloze-hint" '+
            (game.checked?'disabled':'')+' aria-expanded="'+Boolean(game.hint)+'">'+
            (game.hint?'Hide hint':'Give me a hint')+'</button>'+
          (!game.checked?'<button class="quiet-button" type="button" data-action="cloze-reveal">Reveal answer</button>':'')+
        '</div></form>'+
      (game.hint?'<p class="reveal-answer">Hint: '+e(item.hint)+'</p>':'')+
      '<div id="cloze-feedback" class="game-feedback" role="status" data-state="'+
         (game.checked?(game.correct?'correct':'incorrect'):'')+'">'+
         (game.checked?(game.correct?'Correct. ':'Review this term: ')+e(item.answer)+
           (game.resultKind==='typo'?' (minor spelling slip accepted).':''):'')+'</div>'+
      (game.checked?'<button class="action-button memorise-next" type="button" data-action="cloze-next">'+
        (game.index===queue.length-1?'Finish round':'Next prompt')+' '+icon('arrow')+'</button>':'')+
    '</section>';
  }
  return memoryPulse(topic,memory,now)+modeButtons('cloze-mode',game.mode,false)+content;
}
export function renderSpeedRecall(topic,memory,recall,now=Date.now()){
  const queue=recall.ids||topic.cards.map(c=>c.id);
  const card=byId(topic,queue[recall.index]);
  let content='';
  if(recall.complete){
    content='<div class="memorise-finish" role="status"><strong>Round complete.</strong> '+
      recall.correctCount+' of '+queue.length+' definitions recalled on the first attempt.'+
      '<button class="action-button" type="button" data-action="recall-restart">Practise again</button></div>';
  }else if(!card){
    content='<div class="memorise-empty">'+e(emptyModeText(recall.mode))+'</div>';
  }else{
    content='<section class="recall-workspace">'+
      '<div class="flashcard-counter"><span>Definition '+(recall.index+1)+' of '+queue.length+'</span>'+
        '<span>'+e(cardStatus(memory,card.id,now))+'</span></div>'+
      '<p class="recall-definition">'+e(card.definition)+'</p>'+
      '<form id="recall-form" class="recall-form">'+
        '<label for="recall-answer">Mathematical term</label>'+
        '<input id="recall-answer" type="text" autocomplete="off" spellcheck="false" required '+
          'value="'+e(recall.value)+'" '+(recall.checked?'disabled':'')+'>'+
        '<div class="memorise-actions">'+
          '<button class="action-button" type="submit" '+(recall.checked?'disabled':'')+'>Check answer</button>'+
          (!recall.checked?'<button class="quiet-button" type="button" data-action="recall-reveal">Reveal term</button>':'')+
        '</div></form>'+
      (recall.checked?'<p class="game-feedback" role="status" data-state="'+(recall.correct?'correct':'incorrect')+'">'+
        (recall.correct?'Correct.':'Review: ')+' '+e(card.term)+
        (recall.resultKind==='typo'?' (minor spelling slip accepted).':'')+'</p>':'')+
      (recall.checked?'<button class="action-button recall-next" type="button" data-action="recall-next">'+
        (recall.index===queue.length-1?'Finish round':'Next definition')+' '+icon('arrow')+'</button>':'')+
    '</section>';
  }
  return memoryPulse(topic,memory,now)+modeButtons('recall-mode',recall.mode)+content;
}
export function filteredCards(topic,memory,review,now=Date.now()){
  const term=normaliseTerm(review.query||'');
  const mode=review.filter||'all';
  const allowed=new Set(deckQueue(topic,memory,
    mode==='new'||mode==='flagged'?'all':mode,now));
  return topic.cards.filter(card=>{
    const record=recordFor(memory,card.id);
    if(!allowed.has(card.id))return false;
    if(mode==='new'&&record.attempts!==0)return false;
    if(mode==='flagged'&&!record.flagged)return false;
    return !term||normaliseTerm(card.term+' '+card.definition+' '+(card.aliases||[]).join(' ')).includes(term);
  });
}
export function renderReviewList(topic,memory,review,now=Date.now()){
  const cards=filteredCards(topic,memory,review,now);
  return '<p class="review-count">'+plural(cards.length,'card')+' shown</p>'+
    (cards.length?'<ol class="review-deck review-deck--quality">'+cards.map(card=>{
      const entry=recordFor(memory,card.id);
      const status=cardStatus(memory,card.id,now);
      const due=entry.attempts>0&&entry.dueAt>now?
        '<small>Next review '+e(new Date(entry.dueAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}))+'</small>':'';
      return '<li><div class="review-item__row"><strong>'+e(card.term)+'</strong>'+
        '<button type="button" class="memory-flag" data-action="memory-flag" data-id="'+e(card.id)+
          '" aria-pressed="'+Boolean(entry.flagged)+'">'+
          (entry.flagged?'Unflag':'Flag for review')+'</button></div>'+
        '<span class="review-status">'+e(status)+'</span>'+due+
        (review.showDefinitions?'<p>'+e(card.definition)+'</p>':'')+
      '</li>';
    }).join('')+'</ol>':
      '<p class="memorise-empty">No matching cards. Change the search or filter.</p>');
}
export function renderReviewAll(topic,memory,review,now=Date.now()){
  const summary=progressSummary(topic,memory,now);
  return memoryPulse(topic,memory,now)+
    '<div class="review-summary" aria-label="Revision overview">'+
      '<div><strong>'+summary.attempts+'</strong><span>Total review actions</span></div>'+
      '<div><strong>'+(summary.total-summary.new)+'</strong><span>Cards practised</span></div>'+
      '<div><strong>'+summary.confident+'</strong><span>Repeated confident recalls</span></div>'+
      '<div><strong>'+summary.due+'</strong><span>Due for another review</span></div>'+
    '</div>'+
    '<div class="review-tools">'+
      '<label for="review-search">Search all terms</label>'+
      '<input id="review-search" type="search" placeholder="Search terms or definitions" value="'+e(review.query||'')+'">'+
      '<label for="review-filter">Show</label>'+
      '<select id="review-filter">'+[
        ['all','All cards'],['focus','Priority practice'],['due','Due now'],['new','New'],
        ['flagged','Flagged']
      ].map(([id,label])=>'<option value="'+id+'"'+(review.filter===id?' selected':'')+'>'+label+'</option>').join('')+
      '</select>'+
      '<button type="button" class="quiet-button" data-action="review-definitions" aria-pressed="'+
        Boolean(review.showDefinitions)+'">'+(review.showDefinitions?'Hide definitions':'Show definitions')+'</button>'+
      '<a class="quiet-button review-practice-link" href="'+nav(topic.id,'flashcards')+'">Practise flashcards</a>'+
    '</div>'+
    '<div id="review-results" aria-live="polite">'+renderReviewList(topic,memory,review,now)+'</div>'+
    '<div class="memory-privacy"><p>Review progress is saved on this device only, separately for each topic. '+
      'Self-ratings and the review dates are practice prompts, not verified mastery.</p>'+
      (review.confirmReset?'<p class="memory-reset-warning" role="alert">Reset all saved Memorise progress for '+
        e(topic.title)+' on this device? This cannot be undone.</p>'+
        '<div class="memorise-actions"><button class="quiet-button" data-action="memory-cancel-reset">Cancel</button>'+
        '<button class="memory-danger" data-action="memory-confirm-reset">Reset saved progress</button></div>':
        '<button type="button" class="quiet-button" data-action="memory-ask-reset">Reset topic progress</button>')+
    '</div>';
}
