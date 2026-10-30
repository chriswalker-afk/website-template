import {samplingExperiment,SAMPLING_METHODS,POPULATION_SIZE,STRATUM_A,STRATUM_B} from './understand-engine.js';
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

export function renderSamplingLab(page,route,labs){
  const key=understandKey(route,'sampling');
  const saved=labs[key]||{method:page.methods[0],run:1};
  const method=page.methods.includes(saved.method)?saved.method:page.methods[0];
  const result=samplingExperiment(method,1024+saved.run*37+route.pageIndex*11);
  const picked=new Set(result.selected);
  const group=(start,length,label,color)=>{
    const dots=Array.from({length},(_,i)=>{
      const index=start+i;
      return '<span class="population-person population-person--'+color+
        (picked.has(index)?' population-person--selected':'')+'" aria-hidden="true"></span>';
    }).join('');
    return '<div class="population-stratum">'+
      '<div class="population-stratum__label"><strong>'+e(label)+'</strong><span>'+length+' people</span></div>'+
      '<div class="population-stratum__people">'+dots+'</div></div>';
  };
  const sampleCount=result.size===POPULATION_SIZE?'40 (census)':result.size;
  const summary=result.method==='census'?'This is a census: the entire population is included.':
    result.method==='convenience'?'In this ordered list, the first ten names all belong to Group A.':
    result.method==='systematic'?'The random starting position is '+result.randomStart+'.':
    result.method==='stratified'?'The allocation is proportional: 4 from A and 6 from B.':
    'This random sample may have different proportions from the population.';
  return '<div class="sampling-lab">'+
    '<div class="sampling-lab__controls"><div class="sampling-lab__methods" role="group" aria-label="Sampling method">'+
      page.methods.map(id=>'<button type="button" class="sampling-method'+(method===id?' is-selected':'')+
        '" aria-pressed="'+(method===id)+'" data-action="sampling-method" data-key="'+e(key)+
        '" data-method="'+id+'">'+e(SAMPLING_METHODS[id].label)+'</button>').join('')+
      '</div><button type="button" class="quiet-button" data-action="sampling-redraw" data-key="'+e(key)+
      '" '+(['census','convenience'].includes(method)?'disabled title="This selection is fixed"':'')+
      '>Draw another sample</button></div>'+
    '<p class="sampling-lab__method">'+e(SAMPLING_METHODS[method].description)+'</p>'+
    '<div class="sampling-lab__population" role="img" aria-label="'+
      e('Population of 40, with 16 in Group A and 24 in Group B. '+result.size+
      ' are highlighted: '+result.groupA+' from A and '+result.groupB+' from B.')+'">'+
      group(0,STRATUM_A,'Group A','a')+group(STRATUM_A,STRATUM_B,'Group B','b')+
    '</div>'+
    '<p class="sampling-lab__legend"><span class="population-legend-dot"></span>Outlined = selected</p>'+
    '<div class="sampling-lab__metrics">'+
      '<div><span>Population</span><strong>'+POPULATION_SIZE+'</strong></div>'+
      '<div><span>Selected</span><strong>'+sampleCount+'</strong></div>'+
      '<div><span>Group A</span><strong>'+result.groupA+' / '+STRATUM_A+'</strong></div>'+
      '<div><span>Group B</span><strong>'+result.groupB+' / '+STRATUM_B+'</strong></div>'+
    '</div>'+
    '<div class="sampling-lab__compare"><table><caption>Group proportions</caption>'+
      '<thead><tr><th scope="col">Group</th><th scope="col">Population</th><th scope="col">Selection</th></tr></thead>'+
      '<tbody><tr><th scope="row">A</th><td>40%</td><td>'+result.proportionA+'%</td></tr>'+
        '<tr><th scope="row">B</th><td>60%</td><td>'+result.proportionB+'%</td></tr></tbody>'+
    '</table></div>'+
    '<p class="sampling-lab__interpretation" role="status">'+e(summary)+
      ' One selection does not prove a method is always representative.</p>'+
  '</div>';
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
