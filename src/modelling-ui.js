// Modelling is an iterative four-stage investigation, not a markable short quiz.
// All authored material and transient student drafts are HTML-escaped before rendering.
import {escapeHTML as e} from './logic.js';
import {MODELLING_PHASES} from './modelling-content.js';
import {blankModellingEntry,attemptedModelling,canSelfRateModel,
  modellingTask,modellingRecord,modellingLevelSummary} from './modelling-engine.js';
const ratingLabel=x=>x==='independent'?'Modelled independently (self-rated)':
  x==='supported'?'Modelled with support (self-rated)':x==='retry'?'Revisit this model':'Not reviewed';
const current=(topic,route,session)=>modellingTask(topic.id,route.sectionId,route.pageId,
  session.ids[session.index]);
const entryFor=(session,task)=>session.entries[task.id]||blankModellingEntry();
const phaseButtons=(session,entry)=>'<div class="mdl-phases" role="group" aria-label="Modelling stages">'+
  MODELLING_PHASES.map(([id,label],i)=>'<button type="button" data-action="mdl-phase" data-phase="'+i+'" '+
    'aria-current="'+(session.stage===i?'step':'false')+'" '+
    (i>session.maxStage||entry.rating?'disabled':'')+'><span class="mdl-phase-number">'+(i+1)+'</span>'+e(label)+'</button>')
    .join('')+'</div>';
function reviewModel(task,entry,locked){
  return '<section class="mdl-comparison" aria-label="Model comparison and self-review">'+
    '<p class="mdl-compare-intro">Compare each decision with the worked model. These are examples of a valid approach, not automatic judgements of your writing.</p>'+
    '<div class="mdl-comparison-list">'+task.phases.map((phase,i)=>
      '<div class="mdl-comparison-stage"><div class="mdl-compare-heading"><span>'+(i+1)+'. '+e(phase.label)+'</span></div>'+
        '<div class="mdl-compare-columns"><div class="mdl-compare-own"><strong>Your response</strong><p>'+
        (entry.drafts[phase.id]?.trim()?e(entry.drafts[phase.id]):'<em>No written response</em>')+
        '</p></div><div class="mdl-compare-example"><strong>Worked example</strong><p>'+e(phase.model)+
        '</p></div></div></div>').join('')+'</div>'+
    (entry.modelFirst?'<p class="mdl-supported-notice">Some worked stages were opened before you had written an initial response. Treat those stages as supported examples, not unaided modelling.</p>':'')+
    '<div class="mdl-self-check"><div class="mdl-review-heading"><strong>Check your model</strong><small>'+
      entry.checked.filter(Boolean).length+' of 3 criteria selected</small></div>'+
      task.checks.map((criterion,i)=>'<label class="mdl-check"><input type="checkbox" data-mdl-check="'+i+'" '+
        (entry.checked[i]?'checked ':'')+(locked?'disabled':'')+'><span>'+e(criterion)+'</span></label>').join('')+
    '</div>'+
    (!locked?'<div class="mdl-rating-buttons" role="group" aria-label="Modelling self-review">'+
      '<button type="button" data-action="mdl-rate" data-rating="retry">Revisit this model</button>'+
      '<button type="button" data-action="mdl-rate" data-rating="supported" '+
        (canSelfRateModel(entry,'supported')?'':'disabled')+'>Modelled with support</button>'+
      '<button type="button" data-action="mdl-rate" data-rating="independent" '+
        (canSelfRateModel(entry,'independent')?'':'disabled')+'>Modelled independently</button></div>':'')+
    '<p class="mdl-rate-note">These are self-reported judgements. A solved rating requires a written response at all four stages and every criterion selected. The independent option is unavailable after opening guidance or a model before attempting that stage.</p>'+
    '</section>';
}
function stageView(task,session,entry){
  const i=session.stage,phase=task.phases[i],isLast=i===task.phases.length-1;
  return '<section class="mdl-stage" aria-label="'+e(phase.label)+' stage">'+
    '<div class="mdl-stage-heading"><span>Stage '+(i+1)+' of 4</span><span>'+e(phase.label)+'</span></div>'+
    '<p class="mdl-stage-prompt">'+e(phase.prompt)+'</p>'+
    '<label class="mdl-draft-label" for="mdl-answer">Your '+e(phase.label.toLowerCase())+' response</label>'+
    '<textarea id="mdl-answer" rows="6" maxlength="2500" placeholder="Record your mathematical decisions and evidence. This is not automatically marked.">'+
      e(entry.drafts[phase.id]||'')+'</textarea>'+
    '<div class="mdl-stage-tools">'+
      '<button class="quiet-button" type="button" data-action="mdl-hint" aria-expanded="'+
        entry.hints[phase.id]+'">'+(entry.hints[phase.id]?'Hide nudge':'Need a modelling nudge?')+'</button>'+
      '<button class="quiet-button" type="button" data-action="mdl-example" aria-expanded="'+
        entry.examples[phase.id]+'">'+(entry.examples[phase.id]?'Hide worked stage':'Compare this stage')+'</button></div>'+
    (entry.hints[phase.id]?'<div class="mdl-hint"><strong>Think about</strong><p>'+e(phase.nudge)+'</p></div>':'')+
    (entry.examples[phase.id]?'<div class="mdl-example"><strong>One worked modelling approach</strong><p>'+e(phase.model)+'</p></div>':'')+
    '<div class="mdl-stage-footer">'+
      (i>0?'<button class="quiet-button" type="button" data-action="mdl-prev">Previous stage</button>':'<span></span>')+
      (entry.compared?'<button class="quiet-button" type="button" data-action="mdl-review">Return to comparison</button>':'')+
      '<button class="action-button" type="button" data-action="mdl-next">'+
        (isLast?'Review the whole model':'Continue to '+e(task.phases[i+1].label))+'</button></div></section>';
}
function taskView(topic,route,session){
  const task=current(topic,route,session),entry=entryFor(session,task),locked=Boolean(entry.rating);
  return '<section class="mdl-case" aria-label="Modelling investigation">'+
    '<div class="mdl-case-meta"><span>Scenario '+(session.index+1)+' of '+session.ids.length+'</span>'+ 
      '<span>'+e(topic.title)+'</span></div>'+
    '<p class="mdl-scenario">'+e(task.scenario)+'</p>'+
    phaseButtons(session,entry)+
    (session.stage<4?stageView(task,session,entry):reviewModel(task,entry,locked))+
    (locked?'<div class="mdl-saved" role="status"><strong>Saved:</strong> '+
      e(ratingLabel(entry.rating))+'. This is your own review, not an automatically awarded grade.</div>'+
      '<button type="button" class="action-button mdl-next-case" data-action="mdl-next-case">'+
        (session.index===session.ids.length-1?'Finish this page':'Next scenario')+'</button>':'')+
    '</section>';
}
function completedView(topic,route,session,progress){
  const counts={retry:0,supported:0,independent:0};
  for(const id of session.ids){const r=modellingRecord(progress,route.sectionId,route.pageId,id);
    if(r)counts[r.rating]++;}
  return '<section class="mdl-complete" aria-label="Modelling page completed">'+
    '<p class="mdl-complete-title">Page reviewed</p>'+
    '<div class="mdl-complete-stats"><div><strong>'+counts.independent+'</strong><span>Self-rated independent</span></div>'+ 
      '<div><strong>'+counts.supported+'</strong><span>With support</span></div>'+ 
      '<div><strong>'+counts.retry+'</strong><span>For another look</span></div></div>'+
    '<p>Before moving on, consider whether the prediction held under altered assumptions and whether its domain was justified. Use the book’s page controls for the next scenarios.</p>'+
    '<div class="mdl-complete-actions"><button type="button" class="action-button" data-action="mdl-repeat" data-selection="focus">Revisit weaker scenarios</button>'+ 
      '<button type="button" class="quiet-button" data-action="mdl-repeat" data-selection="all">Practise this page again</button></div>'+ 
    '<details class="mdl-summary-list"><summary>Review your judgements</summary><ol>'+ 
      session.ids.map(id=>{const task=modellingTask(topic.id,route.sectionId,route.pageId,id),
        r=modellingRecord(progress,route.sectionId,route.pageId,id);
        return '<li><p>'+e(task.scenario)+'</p><strong>'+e(ratingLabel(r?.rating))+'</strong></li>';}).join('')+
      '</ol></details></section>';
}
export function renderModellingPage(page,topic,route,session,progress){
  if(!session)return '<p>This modelling page is unavailable.</p>';
  const s=modellingLevelSummary(topic.id,route.sectionId,progress);
  const pulse='<div class="mdl-pulse" aria-label="Modelling progress">'+
    '<span><strong>'+s.independent+'</strong> self-rated independent</span>'+ 
    '<span><strong>'+s.supported+'</strong> with support</span>'+ 
    '<span><strong>'+s.retry+'</strong> to revisit</span>'+ 
    '<span><strong>'+s.new+'</strong> not yet reviewed</span></div>';
  const selection='<div class="mdl-selection" role="group" aria-label="Modelling scenario selection">'+
    '<button type="button" data-action="mdl-selection" data-selection="all" aria-pressed="'+
      (session.selection==='all')+'">All scenarios</button>'+ 
    '<button type="button" data-action="mdl-selection" data-selection="focus" aria-pressed="'+
      (session.selection==='focus')+'">Revisit weaker scenarios</button></div>';
  const confirm=session.confirmSwitch?'<div class="mdl-confirm" role="alert">'+
    '<p>Replace this unfinished scenario? Unsaved written modelling decisions will be lost.</p>'+ 
    '<button type="button" class="quiet-button" data-action="mdl-cancel">Keep writing</button>'+ 
    '<button type="button" class="action-button" data-action="mdl-confirm">Replace scenario</button></div>':'';
  return '<div class="mdl-workspace">'+pulse+(session.complete?'':selection)+confirm+
    (session.complete?completedView(topic,route,session,progress):session.ids.length?
      taskView(topic,route,session):'<div class="mdl-empty">No new or supported scenarios remain on this page. '+
      'Choose All scenarios to practise them again.</div>')+
    '<p class="mdl-privacy">Your modelling work stays in this browser session and disappears after a refresh. '+
      'Only chosen self-review ratings and support flags are saved on this device. Written responses are never automatically graded.</p></div>';
}
