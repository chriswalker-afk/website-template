// Display-only Fluency workspace. All generated questions are safe plain text
// and all student-originated strings are escaped before inserting in HTML.
import {escapeHTML as e} from './logic.js';
import {answerText} from './fluency-engine.js';
const escape=v=>e(String(v??''));
const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const plural=(n,s)=>n+' '+s+(n===1?'':'s');
const outcome=a=>a?.revealed?'Shown solution':
  a?.correct?(a.hint||a.tries>1?'Completed with support':'Correct first try'):
  a?.tries?'Try again':'Not started';
const outcomeTone=a=>a?.revealed?'review':a?.correct?'correct':a?.tries?'retry':'new';
export function roundScores(session){
  let firstTry=0,supported=0,revealed=0,answered=0;
  for(const q of session.set.questions){
    const a=session.answers[q.id];
    if(!a)continue;
    if(a.correct||a.revealed)answered++;
    if(a.revealed)revealed++;
    else if(a.correct){
      if(a.tries===1&&!a.hint)firstTry++;
      else supported++;
    }
  }
  return {firstTry,supported,revealed,answered};
}
export function roundProgressMarkup(session){
  const count=session.set.questions.length,score=roundScores(session);
  return '<div class="fluency-round-summary" aria-label="Current practice progress">'+
    '<span><strong>'+score.answered+'</strong> / '+count+' completed</span>'+
    '<span><strong>'+score.firstTry+'</strong> first try</span>'+
    '<span><strong>'+score.supported+'</strong> with support</span>'+
    '<span><strong>'+score.revealed+'</strong> solutions revealed</span></div>';
}
function completedStats(progress,levelId){
  const record=progress.levels[levelId]||{rounds:0,completed:0,firstTry:0,withSupport:0,revealed:0};
  return '<div class="fluency-history"><span>'+plural(record.rounds,'completed round')+' saved for this level</span>'+
    '<span>'+record.firstTry+' first-try answers</span>'+
    '<span>'+record.withSupport+' completed with support</span></div>';
}
function answerForm(q,a){
  return '<form id="fluency-answer-form" class="fluency-answer-form">'+
    '<label for="fluency-answer">'+e(q.answer.label)+'</label>'+
    '<div class="fluency-answer-form__row">'+
      '<input id="fluency-answer" name="response" type="text" autocomplete="off" spellcheck="false" '+
        'value="'+escape(a?.draft||'')+'" aria-describedby="fluency-feedback" '+
        (a?.correct||a?.revealed?'disabled':'required')+'>'+
      '<button type="submit" class="action-button" '+(a?.correct||a?.revealed?'disabled':'')+
        '>Check answer</button></div></form>';
}
function worked(q,open){
  return open?'<div class="fluency-solution" id="fluency-solution">'+
    '<p><strong>Answer:</strong> '+e(answerText(q.answer))+'</p>'+
    '<ol class="fluency-solution__steps">'+q.steps.map(step=>'<li>'+e(step)+'</li>').join('')+'</ol>'+
    '</div>':'';
}
function activeQuestion(session){
  const q=session.set.questions[session.index],a=session.answers[q.id]||{};
  const checked=Boolean(a.correct||a.revealed);
  const score=roundScores(session);
  return '<section class="fluency-question" aria-label="Fluency question '+(session.index+1)+'">'+
    '<div class="fluency-question__meta"><span>Question '+(session.index+1)+' of '+session.set.questions.length+
      '</span><span>'+q.marks+' marks</span></div>'+
    '<div class="fluency-question__skill">'+e(q.skill)+'</div>'+
    '<p class="fluency-question__prompt">'+e(q.prompt)+'</p>'+
    '<label class="fluency-working-label" for="fluency-working">Working space (optional)</label>'+
    '<textarea id="fluency-working" class="fluency-working" rows="3" '+
      'placeholder="Use this space to plan your calculations. It is not marked or saved.">'+
       escape(a.working||'')+'</textarea>'+
    answerForm(q,a)+
    '<div class="fluency-assistance">'+
      '<button type="button" class="quiet-button" data-action="fluency-hint" '+
        'aria-expanded="'+Boolean(a.hint)+'">'+(a.hint?'Hide hint':'Show hint')+'</button>'+
      (!checked?'<button type="button" class="quiet-button" data-action="fluency-reveal">'+
        'Show full solution</button>':
        '<button type="button" class="quiet-button" data-action="fluency-working" '+
        'aria-expanded="'+Boolean(a.showWorking)+'">'+
        (a.showWorking?'Hide worked solution':'View worked solution')+'</button>')+
    '</div>'+
    (a.hint?'<div class="practice-question__hint"><strong>Hint:</strong> '+e(q.hint)+'</div>':'')+
    '<div class="fluency-feedback'+(a.correct?' is-correct':a.revealed?' is-revealed':a.tries?' is-incorrect':'')+
      '" id="fluency-feedback" role="status">'+
      (a.feedback?e(a.feedback):'Check your answer when you are ready.')+'</div>'+
    worked(q,Boolean(a.showWorking||a.revealed))+
    (checked?'<button type="button" class="action-button fluency-next" data-action="fluency-next">'+
      (session.index===session.set.questions.length-1?'Finish practice':'Next question')+
      ' '+icon('arrow')+'</button>':'')+
    '<div class="fluency-position"><div class="fluency-position__track" aria-hidden="true">'+
      '<span style="width:'+(100*score.answered/session.set.questions.length).toFixed(1)+'%"></span></div>'+
      '<small>'+score.answered+' / '+session.set.questions.length+' completed</small></div>'+
    '</section>';
}
function recap(session){
  const scores=roundScores(session);
  const missed=session.set.questions.filter(q=>{
    const a=session.answers[q.id];
    return a?.revealed||(a?.correct&&(a.tries>1||a.hint));
  });
  return '<section class="fluency-complete" aria-label="Practice round summary">'+
    '<p class="fluency-complete__lead">Practice round complete</p>'+
    '<div class="fluency-complete__stats"><div><strong>'+scores.firstTry+'</strong><span>Correct first try</span></div>'+
      '<div><strong>'+scores.supported+'</strong><span>Completed with support</span></div>'+
      '<div><strong>'+scores.revealed+'</strong><span>Solutions revealed</span></div></div>'+
    '<p>Review your working before moving on. A revealed solution is not counted as an independently correct answer.</p>'+
    '<div class="fluency-complete__actions">'+
      (missed.length?'<button class="action-button" type="button" data-action="fluency-retry">'+
        'Retry '+missed.length+' review '+(missed.length===1?'question':'questions')+'</button>':'')+
      '<button class="quiet-button" type="button" data-action="fluency-new">Generate another set</button>'+
      '<a class="quiet-button fluency-print-link" href="#/'+e(session.set.topicId)+
        '/resources/worksheet-generator">Create a printable worksheet</a>'+
    '</div>'+
    '<details class="fluency-review-details"><summary>Review questions and worked solutions</summary>'+
      '<ol>'+session.set.questions.map(q=>{
        const a=session.answers[q.id]||{};
        return '<li><p><strong>'+e(q.prompt)+'</strong></p>'+
          '<span class="fluency-review-status fluency-review-status--'+outcomeTone(a)+'">'+e(outcome(a))+'</span>'+
          worked(q,true)+'</li>';
      }).join('')+'</ol></details>'+
    '</section>';
}
export function renderFluencyPage(page,topic,route,session,progress){
  if(!session?.set)return '<p>Fluency practice is not available for this page.</p>';
  const count=session.configCount||6;
  return '<div class="fluency-workspace">'+
    '<div class="fluency-intro"><p>'+e(page.focus)+'</p>'+
      '<span class="fluency-intro__level">Level '+e(route.sectionId.replace('level-',''))+'</span></div>'+
    completedStats(progress,route.sectionId)+
    '<div class="fluency-settings"><label for="fluency-count">Questions per set</label>'+
      '<select id="fluency-count"><option value="6"'+(count===6?' selected':'')+'>6 questions</option>'+
        '<option value="10"'+(count===10?' selected':'')+'>10 questions</option></select>'+
      '<button class="quiet-button" type="button" data-action="fluency-new">'+
        icon('refresh')+' New questions</button>'+
      '<span class="fluency-seed">Set #'+session.set.seed+'</span></div>'+
    (session.confirmFresh?'<div class="fluency-confirm" role="alert">'+
      '<p>Replace this unfinished set? Unchecked work and typed notes will be lost.</p>'+
      '<button type="button" class="quiet-button" data-action="fluency-cancel-new">Keep practising</button>'+
      '<button type="button" class="action-button" data-action="fluency-confirm-new">Replace set</button></div>':'')+
    roundProgressMarkup(session)+
    (session.complete?recap(session):activeQuestion(session))+
    '<p class="fluency-privacy">Answers are checked numerically, with equivalent root orders and suitable fractions accepted. '+
    'Only completed-round summaries are saved locally on this device; working notes are not saved.</p>'+
    '</div>';
}
