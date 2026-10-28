// Render-only multi-step Problem Solving studio. No free-text auto-grading.
import {escapeHTML as e} from './logic.js';
import {attemptedProblem,canRateProblem,summaryForLevel,recordFor,problemFor} from './problem-solving-engine.js';
const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const ratingText=rating=>rating==='independent'?'Solved independently (self-rated)':
  rating==='supported'?'Solved with support (self-rated)':rating==='retry'?'Retry this problem':'Not reviewed';
const problemEntry=(session,problem)=>session.entries[problem.id]||{
  plan:'',working:'',strategiesOpen:false,strategy:null,assisted:false,
  hintCount:0,solutionStep:0,modelFirst:false,modelComplete:false,
  checks:[false,false,false],rating:null
};
export function renderProblemSolvingPage(page,topic,route,session,progress){
  if(!session)return '<p>Problem Solving is unavailable.</p>';
  const level=Number(route.sectionId.replace('level-',''));
  const pulse=summaryForLevel(topic.id,route.sectionId,progress);
  const counts='<div class="ps-pulse" aria-label="Problem-solving level progress">'+
    '<span><strong>'+pulse.independent+'</strong> self-rated independent</span>'+
    '<span><strong>'+pulse.supported+'</strong> with support</span>'+
    '<span><strong>'+pulse.retry+'</strong> for retry</span>'+
    '<span><strong>'+pulse.new+'</strong> unseen</span></div>';
  const select='<div class="ps-selection" role="group" aria-label="Choose problem-solving practice">'+
    '<button type="button" data-action="ps-selection" data-mode="all" aria-pressed="'+
      (session.selection==='all')+'">All problems</button>'+
    '<button type="button" data-action="ps-selection" data-mode="focus" aria-pressed="'+
      (session.selection==='focus')+'">Revisit weaker problems</button></div>';
  return '<div class="ps-workspace">'+counts+select+
    (session.confirmSwitch?'<div class="ps-confirm" role="alert">'+
      '<p>Replace your unfinished practice on this page? Unsaved plans and working will be lost.</p>'+
      '<button type="button" class="quiet-button" data-action="ps-cancel">Keep my work</button>'+
      '<button type="button" class="action-button" data-action="ps-confirm">Replace practice</button>'+
      '</div>':'')+
    (session.complete?renderComplete(topic,route,session,progress):
      session.ids.length?renderCurrent(topic,route,session,level):
      '<div class="ps-empty">There are no unfinished or supported problems on this page. '+
      'Choose All problems to practise them again.</div>')+
    '<p class="ps-privacy">Your plan and calculations stay in this browser session only. '+
      'The device saves your chosen review status, not your written answers or mathematical grades.</p>'+
    '</div>';
}
function renderCurrent(topic,route,session,level){
  const problem=problemFor(topic.id,route.sectionId,route.pageId,session.ids[session.index]);
  if(!problem)return '<div class="ps-empty">Problem unavailable. Return to All problems.</div>';
  const entry=problemEntry(session,problem);
  const locked=Boolean(entry.rating);
  return '<section class="ps-case" aria-label="Problem '+(session.index+1)+'">'+
    '<div class="ps-meta"><span>Problem '+(session.index+1)+' of '+session.ids.length+'</span>'+
      '<span>Level '+level+'</span></div>'+
    '<p class="ps-prompt">'+e(problem.prompt)+'</p>'+
    (level<=2?'<p class="ps-first-decision"><strong>First decision:</strong> '+e(problem.plan)+'</p>':'')+
    '<div class="ps-writing-grid">'+
      '<div><label for="ps-plan">My strategy</label>'+
      '<textarea id="ps-plan" rows="3" maxlength="900" '+(locked?'disabled':'')+
        ' placeholder="What is known? Which approach might connect the facts?">'+e(entry.plan)+'</textarea></div>'+
      '<div><label for="ps-work">My working and result</label>'+
      '<textarea id="ps-work" rows="6" maxlength="3500" '+(locked?'disabled':'')+
        ' placeholder="Work through the mathematics and check your answer.">'+e(entry.working)+'</textarea></div>'+
    '</div>'+
    (!locked?'<div class="ps-tools">'+
      '<button type="button" class="quiet-button" data-action="ps-strategies" aria-expanded="'+
        Boolean(entry.strategiesOpen)+'">'+
        (entry.strategiesOpen?'Hide strategies':'Compare possible strategies')+'</button>'+
      '<button type="button" class="quiet-button" data-action="ps-hint" '+
        (entry.hintCount>=2?'disabled':'')+'>'+
        (entry.hintCount===0?'Get a nudge':entry.hintCount===1?'Get a stronger hint':'Both hints shown')+'</button>'+
      '<button type="button" class="quiet-button" data-action="ps-solution" '+
        (entry.modelComplete?'disabled':'')+'>'+
        (entry.solutionStep===0?'Reveal first worked step':
          entry.modelComplete?'Full working shown':'Reveal next worked step')+'</button>'+
    '</div>':'')+
    (entry.strategiesOpen?strategyOptions(problem,entry,locked):'')+
    (entry.hintCount?'<div class="ps-hints">'+problem.hints.slice(0,entry.hintCount)
      .map((hint,i)=>'<p><strong>'+ (i===0?'Nudge':'Stronger hint')+':</strong> '+e(hint)+'</p>').join('')+
      '</div>':'')+
    (entry.solutionStep?workedSteps(problem,entry):'')+
    (entry.modelComplete?reviewPanel(problem,entry,locked):'')+
    (locked?'<div class="ps-status" role="status">'+icon('check')+
      '<span>Saved: <strong>'+e(ratingText(entry.rating))+
      '</strong>. This is your self-review, not an automatically marked result.</span></div>'+
      '<button type="button" class="action-button ps-next" data-action="ps-next">'+
        (session.index===session.ids.length-1?'Finish this page':'Next problem')+' '+icon('arrow')+
      '</button>':'')+
    '</section>';
}
function strategyOptions(problem,entry,locked){
  return '<section class="ps-strategies" aria-label="Compare mathematical approaches">'+
    '<div class="ps-inner-heading"><strong>Possible approaches</strong>'+
      '<small>Choose a route to read feedback, not a mark.</small></div>'+
    '<div class="ps-strategy-options">'+problem.options.map(option=>
      '<button type="button" data-action="ps-choice" data-choice="'+e(option.id)+'" '+
        'aria-pressed="'+(entry.strategy===option.id)+'" '+(locked?'disabled':'')+'>'+
        e(option.label)+'</button>').join('')+'</div>'+
    (entry.strategy?'<div class="ps-strategy-feedback" role="status">'+
      e(problem.options.find(o=>o.id===entry.strategy)?.feedback||'')+'</div>':'')+
  '</section>';
}
function workedSteps(problem,entry){
  return '<section class="ps-worked" aria-label="Worked solution">'+
    '<div class="ps-inner-heading"><strong>Worked solution</strong><small>'+
      entry.solutionStep+' of '+problem.steps.length+' steps shown</small></div>'+
    (entry.modelFirst?'<p class="ps-model-warning">You opened the solution before completing a written attempt. '+
      'Use this as a supported example, not evidence of independent solving.</p>':'')+
    '<ol>'+problem.steps.slice(0,entry.solutionStep)
      .map(step=>'<li>'+e(step)+'</li>').join('')+'</ol>'+
    (entry.modelComplete?'<p class="ps-solution-final">All steps shown. Compare the strategy, calculations and final check with your own working.</p>':'')+
  '</section>';
}
function reviewPanel(problem,entry,locked){
  const selected=entry.checks.filter(Boolean).length;
  const checks='<div class="ps-criteria">'+problem.checks.map((check,i)=>
    '<label class="ps-criterion"><input type="checkbox" data-ps-criterion="'+i+'" '+
      (entry.checks[i]?'checked ':'')+(locked?'disabled ':'')+'><span>'+e(check)+'</span></label>'
  ).join('')+'</div>';
  const next=problem.checks.find((_,i)=>!entry.checks[i]);
  return '<section class="ps-review" aria-label="Review your problem-solving method">'+
    '<div class="ps-inner-heading"><strong>Check your solution</strong>'+
      '<small>'+selected+' of 3 checks selected</small></div>'+checks+
    (next?'<p class="ps-review-next"><strong>Next check:</strong> '+e(next)+'</p>':
      '<p class="ps-review-next">All three checks selected. Confirm these are evident in your own response before rating it.</p>')+
    '<p class="ps-reflection"><strong>Reflect:</strong> '+e(problem.reflection)+'</p>'+
    (!locked?'<div class="ps-ratings" role="group" aria-label="Choose your self-review result">'+
      '<button type="button" data-action="ps-rate" data-rating="retry">Retry this problem</button>'+
      '<button type="button" data-action="ps-rate" data-rating="supported" '+
        (canRateProblem(entry,'supported')?'':'disabled')+'>Solved with support</button>'+
      '<button type="button" data-action="ps-rate" data-rating="independent" '+
        (canRateProblem(entry,'independent')?'':'disabled')+'>Solved independently</button>'+
      '</div>':'')+
    '<p class="ps-rating-note">These are self-reported judgements. For a solved rating, write a plan and working and select all three checks. '+
    'Independent solving is unavailable after requesting assistance or opening the solution before attempting the problem.</p>'+
    '</section>';
}
function renderComplete(topic,route,session,progress){
  const reviewed=session.ids.map(id=>problemFor(topic.id,route.sectionId,route.pageId,id))
    .filter(Boolean);
  const counts={retry:0,supported:0,independent:0};
  for(const problem of reviewed){
    const record=recordFor(progress,route.sectionId,route.pageId,problem.id);
    if(record)counts[record.rating]++;
  }
  return '<section class="ps-complete" aria-label="Problem-solving page summary">'+
    '<p class="ps-complete-title">Page reviewed</p>'+
    '<div class="ps-complete-counts">'+
      '<div><strong>'+counts.independent+'</strong><span>Self-rated independent</span></div>'+
      '<div><strong>'+counts.supported+'</strong><span>With support</span></div>'+
      '<div><strong>'+counts.retry+'</strong><span>For retry</span></div></div>'+
    '<p>Consider whether your approach was efficient and whether you checked the original conditions. '+
      'Use the book’s page controls to continue through this level.</p>'+
    '<div class="ps-complete-actions"><button type="button" class="action-button" data-action="ps-repeat" data-mode="focus">'+
      'Revisit weaker problems</button>'+
      '<button type="button" class="quiet-button" data-action="ps-repeat" data-mode="all">'+
      'Practise this page again</button></div>'+
    '<details class="ps-review-list"><summary>See your review judgements</summary><ol>'+
      reviewed.map(problem=>{
        const r=recordFor(progress,route.sectionId,route.pageId,problem.id);
        return '<li><p>'+e(problem.prompt)+'</p><strong>'+e(ratingText(r?.rating))+'</strong></li>';
      }).join('')+'</ol></details></section>';
}
