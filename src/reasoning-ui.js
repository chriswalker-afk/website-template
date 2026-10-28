// Render-only Reasoning workspace; authored content and temporary student writing
// are escaped, and no automated correctness judgement is implied.
import {escapeHTML as e} from './logic.js';
import {reasoningSummary,recordFor,taskFor} from './reasoning-engine.js';
const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const labelFor=rating=>rating==='ready'?'Ready to move on':
  rating==='developing'?'Still developing':rating==='revisit'?'Review again':'Not reviewed';
const toneFor=rating=>rating==='ready'?'ready':rating==='developing'?'developing':
  rating==='revisit'?'revisit':'new';
const written=entry=>Boolean(entry?.draft?.trim()?.length>=20);
function currentTask(topic,route,session){
  return taskFor(topic.id,route.sectionId,session?.ids?.[session.index]);
}
function currentEntry(task,session){
  return session.entries[task.id]||{draft:'',hint:false,usedHint:false,model:false,
    modelFirst:false,checks:[false,false,false],rating:null};
}
function statusRow(topic,route,progress){
  const summary=reasoningSummary(topic.id,route.sectionId,progress);
  return '<div class="reasoning-pulse" aria-label="Reasoning review progress">'+
    '<span><strong>'+summary.reviewed+'</strong> / '+summary.total+' reviewed</span>'+
    '<span><strong>'+summary.revisit+'</strong> for another look</span>'+
    '<span><strong>'+summary.developing+'</strong> developing</span>'+
    '<span><strong>'+summary.ready+'</strong> self-rated ready</span></div>';
}
function selectionControls(session){
  return '<div class="reasoning-modes" role="group" aria-label="Reasoning prompt selection">'+
    '<button type="button" data-action="reasoning-mode" data-mode="all" aria-pressed="'+
      (session.selection==='all')+'">All prompts</button>'+
    '<button type="button" data-action="reasoning-mode" data-mode="focus" aria-pressed="'+
      (session.selection==='focus')+'">Needs another look</button></div>';
}
function reviewPanel(task,entry){
  const checked=entry.checks.filter(Boolean).length;
  const canWrite=written(entry);
  const all=checked===task.criteria.length;
  const canReady=canWrite&&all;
  const criteria=task.criteria.map((criterion,i)=>
    '<label class="reasoning-criterion">'+
    '<input type="checkbox" data-reasoning-criterion="'+i+'" '+(entry.checks[i]?'checked ':'')+
      (entry.rating?'disabled ':'')+'>'+
    '<span class="reasoning-criterion__body"><strong>'+e(criterion.label)+'</strong>'+
      (entry.checks[i]?'': '<small>'+e(criterion.next)+'</small>')+
    '</span></label>').join('');
  const revise=task.criteria.filter((_,i)=>!entry.checks[i]);
  const advice=revise.length?
    '<div class="reasoning-next-steps"><strong>Next improvement</strong><p>'+e(revise[0].next)+'</p></div>':
    '<div class="reasoning-next-steps"><strong>All criteria checked</strong><p>'+
      'You have identified the key features in the model. Check that your own argument contains them before choosing a rating.</p></div>';
  return '<section class="reasoning-review-panel" aria-label="Compare and self-review">'+
    '<div class="reasoning-model-head"><span>Worked argument</span>'+
      '<small>One possible mathematically sound explanation</small></div>'+
    '<ol class="reasoning-model-steps">'+task.model.map(step=>'<li>'+e(step)+'</li>').join('')+'</ol>'+
    (!canWrite?'<p class="reasoning-note">You have viewed the model without writing a full response. '+
      'You can mark this prompt for review, or write your own argument before choosing a stronger self-rating.</p>':'')+
    (entry.modelFirst?'<p class="reasoning-note">The model was opened before an independent written attempt. '+
      'Use this as a supported example, not evidence of unaided recall.</p>':'')+
    '<div class="reasoning-check-heading"><strong>Check your own argument</strong>'+
      '<span>'+checked+' of '+task.criteria.length+' criteria selected</span></div>'+
    '<div class="reasoning-criteria">'+criteria+'</div>'+advice+
    '<p class="reasoning-reflect"><strong>Reflect:</strong> '+e(task.reflection)+'</p>'+
    '<div class="reasoning-rate-group" role="group" aria-label="Self-review judgement">'+
      '<button type="button" data-action="reasoning-rate" data-rating="revisit" '+
        (entry.rating?'disabled':'')+'>Review again</button>'+
      '<button type="button" data-action="reasoning-rate" data-rating="developing" '+
        (!canWrite||entry.rating?'disabled':'')+'>Still developing</button>'+
      '<button type="button" data-action="reasoning-rate" data-rating="ready" '+
        (!canReady||entry.rating?'disabled':'')+'>Ready to move on</button>'+
    '</div>'+
    '<p class="reasoning-review-explainer">These are your judgements, not automatically marked results. '+
      '“Ready” requires a written attempt and all three criteria checked.</p>'+
  '</section>';
}
function taskView(topic,route,session){
  const task=currentTask(topic,route,session);
  if(!task)return '<div class="reasoning-empty">There are no prompts in this selection. Choose All prompts to practise the full set.</div>';
  const entry=currentEntry(task,session),rating=entry.rating;
  const compare='<button class="quiet-button" type="button" data-action="reasoning-model" '+
    'aria-expanded="'+entry.model+'" '+(rating?'disabled':'')+'>'+
    (entry.model?'Hide worked argument':'Compare with worked argument')+'</button>';
  return '<section class="reasoning-task" aria-label="Reasoning prompt '+(session.index+1)+'">'+
    '<div class="reasoning-task-meta"><span>Prompt '+(session.index+1)+' of '+session.ids.length+'</span>'+
      '<span>'+e(route.sectionId[0].toUpperCase()+route.sectionId.slice(1))+'</span></div>'+
    '<p class="reasoning-task-prompt">'+e(task.prompt)+'</p>'+
    '<label class="reasoning-writing-label" for="reasoning-answer">Your mathematical argument</label>'+
    '<textarea id="reasoning-answer" class="reasoning-writing" maxlength="2500" rows="6" '+
      'placeholder="Write a precise explanation using mathematical evidence." '+
      (rating?'disabled':'')+'>'+e(entry.draft)+'</textarea>'+
    '<div class="reasoning-actions">'+
      '<button type="button" class="quiet-button" data-action="reasoning-hint" '+
        'aria-expanded="'+entry.hint+'" '+(rating?'disabled':'')+'>'+
        (entry.hint?'Hide nudge':'Need a nudge?')+'</button>'+
      compare+'</div>'+
    (entry.hint?'<div class="reasoning-hint"><p><strong>Think about:</strong> '+e(task.hint)+'</p>'+
      '<p><strong>Possible start:</strong> '+e(task.starter)+'</p></div>':'')+
    (entry.model?reviewPanel(task,entry):'')+
    (rating?'<div class="reasoning-saved" role="status">'+icon('check')+
      '<span>Self-review saved: <strong>'+e(labelFor(rating))+'</strong>. '+
      'This does not mean your writing was automatically assessed.</span></div>'+
      '<button type="button" class="action-button reasoning-next" data-action="reasoning-next">'+
      (session.index===session.ids.length-1?'Finish this set':'Next prompt')+' '+icon('arrow')+
      '</button>':'')+
  '</section>';
}
function finished(topic,route,session,progress){
  const summary=reasoningSummary(topic.id,route.sectionId,progress);
  const tasks=session.ids.map(id=>taskFor(topic.id,route.sectionId,id)).filter(Boolean);
  return '<section class="reasoning-complete" aria-label="Reasoning review summary">'+
    '<p class="reasoning-complete__lead">Set reviewed</p>'+
    '<p>Use the self-review judgements to decide what to revisit. No written answer was automatically graded.</p>'+
    '<div class="reasoning-complete__stats"><div><strong>'+summary.ready+'</strong>'+
      '<span>Self-rated ready</span></div><div><strong>'+(summary.revisit+summary.developing)+'</strong>'+
      '<span>Need more work</span></div><div><strong>'+summary.new+'</strong>'+
      '<span>Not yet reviewed</span></div></div>'+
    '<div class="reasoning-complete__actions">'+
      '<button type="button" class="action-button" data-action="reasoning-repeat" data-mode="focus">'+
      'Revisit weaker prompts</button>'+
      '<button type="button" class="quiet-button" data-action="reasoning-repeat" data-mode="all">'+
      'Review the full set again</button></div>'+
    '<details class="reasoning-review-list"><summary>See your review judgements</summary><ol>'+
      tasks.map(t=>{
        const record=recordFor(progress,route.sectionId,t.id);
        return '<li><strong>'+e(t.prompt)+'</strong><span class="reasoning-review-label reasoning-review-label--'+
          toneFor(record?.rating)+'">'+e(labelFor(record?.rating))+'</span></li>';
      }).join('')+'</ol></details>'+
    '</section>';
}
export function renderReasoningPage(page,topic,route,session,progress){
  if(!session)return '<p>Reasoning practice is not available for this topic.</p>';
  return '<div class="reasoning-workspace">'+
    statusRow(topic,route,progress)+selectionControls(session)+
    (session.confirmSwitch?'<div class="reasoning-confirm" role="alert"><p>'+
      'Replace this unfinished prompt? Your unsaved written response will be lost.</p>'+
      '<button class="quiet-button" type="button" data-action="reasoning-cancel-switch">Keep writing</button>'+
      '<button class="action-button" type="button" data-action="reasoning-confirm-switch">Change practice</button>'+
      '</div>':'')+
    (session.complete?finished(topic,route,session,progress):
      session.ids.length?taskView(topic,route,session):
      '<div class="reasoning-empty">Nothing currently needs another look in this subsection. '+
      'Choose All prompts to revisit any argument.</div>')+
    '<p class="reasoning-privacy">Written arguments stay in this browser session and disappear on refresh. '+
      'Only your chosen self-review status and number of checked criteria are saved on this device.</p>'+
  '</div>';
}
