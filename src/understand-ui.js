export {renderSamplingLab} from './visuals/explorer-ui.js';
import {modeWorkingNotebook} from './working-notebook-integration.js';

const e=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
export const understandKey=(route,id)=>[route.topicId,route.sectionId,route.pageId,id].join(':');

export function renderSteps(steps,key,progress=0){
  const count=Math.max(0,Math.min(steps.length,Number(progress)||0));
  return '<div class="explain-steps">'+
    '<div class="explain-steps__meta"><span>Steps revealed</span><strong>'+count+' of '+steps.length+'</strong></div>'+
    (count?'<ol class="explain-steps__list">'+steps.slice(0,count).map((line,i)=>
      '<li><span class="explain-step__number" aria-hidden="true">'+(i+1)+'</span>'+
        '<span>'+e(line)+'</span></li>').join('')+'</ol>':
      '<p class="explain-steps__empty">Think about the first step before revealing it.</p>')+
    '<div class="explain-steps__buttons">'+
      (count>0?'<button type="button" class="quiet-button" data-action="understand-step-prev" data-key="'+
        e(key)+'">Previous step</button>':'')+
      (count<steps.length?'<button type="button" class="action-button" data-action="understand-step-next" data-key="'+
        e(key)+'" data-total="'+steps.length+'">'+(count===0?'Show first step':'Show next step')+'</button>':
        '<button type="button" class="quiet-button" data-action="understand-step-reset" data-key="'+
          e(key)+'">Start again</button>')+
    '</div></div>';
}

export function renderConceptCheck(block,key,selection){
  const choices=block.choices.map(choice=>{
    const active=selection?.choice===choice.id;
    return '<button type="button" class="concept-choice'+(active?' concept-choice--selected':'')+
      '" data-action="understand-check" data-key="'+e(key)+'" data-choice="'+e(choice.id)+'" '+
      'aria-pressed="'+Boolean(active)+'">'+e(choice.label)+'</button>';
  }).join('');
  const result=selection?block.choices.find(c=>c.id===selection.choice):null;
  return '<section class="concept-check" aria-label="Check your understanding">'+
    '<p class="concept-check__label">Check your understanding</p>'+
    '<p class="concept-check__question">'+e(block.prompt)+'</p>'+
    '<div class="concept-check__choices" role="group" aria-label="Choose an answer">'+choices+'</div>'+
    (result?'<div class="concept-check__feedback'+(result.correct?' is-correct':' is-incorrect')+
      '" role="status"><strong>'+(result.correct?'Correct.':'Not yet.')+'</strong> '+e(result.feedback)+'</div>':'')+
  '</section>';
}

export function renderWalkthrough(block,key,progress){
  return '<section class="method-walkthrough" aria-label="Method walkthrough">'+
    '<p class="method-walkthrough__problem">'+e(block.prompt)+'</p>'+
    renderSteps(block.steps,key,progress)+
  '</section>';
}

function renderGuided(guided,key,choice){
  const choices=guided.choices.map(option=>
    '<button type="button" class="concept-choice'+(choice===option[0]?' concept-choice--selected':'')+
    '" data-action="understand-guided" data-key="'+e(key)+'" data-choice="'+e(option[0])+
    '" aria-pressed="'+(choice===option[0])+'">'+e(option[1])+'</button>').join('');
  const chosen=guided.choices.find(option=>option[0]===choice);
  return '<div class="workshop-stage"><span class="workshop-stage__label">Help me</span>'+
    '<p class="workshop-stage__question">'+e(guided.prompt)+'</p>'+
    '<div class="concept-check__choices" role="group" aria-label="Guided answer choices">'+choices+'</div>'+
    (chosen?'<p class="concept-check__feedback'+(chosen[3]?' is-correct':' is-incorrect')+
      '" role="status"><strong>'+(chosen[3]?'Correct.':'Not yet.')+'</strong> '+e(chosen[2])+'</p>':'')+
  '</div>';
}

export function renderWorkshop(page,route,steppers,workshops){
  const key=understandKey(route,'workshop');
  const modelKey=key+':model',own=workshops[key]||{};
  const model=page.model,tryIt=page.independent;
  return '<div class="workshop">'+
    '<section class="workshop-stage"><span class="workshop-stage__label">Show me</span>'+
      '<p class="workshop-stage__question">'+e(model.prompt)+'</p>'+
      renderSteps(model.steps,modelKey,steppers[modelKey]||0)+'</section>'+
    renderGuided(page.guided,key,own.choice)+
    '<section class="workshop-stage"><span class="workshop-stage__label">My turn</span>'+
      '<p class="workshop-stage__question">'+e(tryIt.prompt)+'</p>'+
      // The editable notebook is now the single working area for My turn.

      modeWorkingNotebook(route.topicId,'understand',route.sectionId,route.pageId,'my-turn')+
      '<div class="workshop-stage__actions">'+
        '<button type="button" class="quiet-button" data-action="understand-own-hint" data-key="'+e(key)+
          '" aria-expanded="'+Boolean(own.hint)+'">'+(own.hint?'Hide hint':'Show hint')+'</button>'+
        '<button type="button" class="action-button" data-action="understand-own-solution" data-key="'+
          e(key)+'" aria-expanded="'+Boolean(own.solution)+'">'+
          (own.solution?'Hide model solution':'Compare with model solution')+'</button></div>'+
      (own.hint?'<p class="practice-question__hint">'+e(tryIt.hint)+'</p>':'')+
      (own.solution?'<div class="workshop-stage__model"><ol>'+tryIt.steps.map(step=>
        '<li>'+e(step)+'</li>').join('')+'</ol>'+
        '<p>Compare each step with your notebook; checking the method matters as much as the final answer. Your working remains saved on this device.</p>'+
        '<div class="workshop-stage__rating" role="group" aria-label="Self-assess your attempt">'+
          '<button type="button" data-action="understand-self-rate" data-key="'+e(key)+
            '" data-rating="ready" aria-pressed="'+(own.rating==='ready')+'">I can do this</button>'+
          '<button type="button" data-action="understand-self-rate" data-key="'+e(key)+
            '" data-rating="review" aria-pressed="'+(own.rating==='review')+'">I need more practice</button>'+
        '</div>'+
        (own.rating?'<p class="workshop-stage__rating-note" role="status">'+
           (own.rating==='ready'?'Marked as confident for this session.':'Marked for review in this session.')+'</p>':'')+
      '</div>':'')+
    '</section>'+
  '</div>';
}
