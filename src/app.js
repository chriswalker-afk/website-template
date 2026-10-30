import {CHAPTER_LIBRARY,TOPICS,DEFAULT_TOPIC} from './topics.js';
import {buildFluencySet,checkFluencyAnswer,PRACTICE_LENGTHS} from './fluency-engine.js';
import {emptyFluencyProgress,hydrateFluencyProgress,saveFluencyRound} from './fluency-progress.js';
import {renderFluencyPage,roundScores} from './fluency-ui.js';
import {enhanceMathInputs,latexToFluencyText} from './math-input.js';
import {typesetSiteMath} from './math-notation.js';
import {mountWorkingNotebooks,hasSavedWorking} from './working-notebook.js';
import {workingScope} from './working-notebook-integration.js';
import {reasoningAttempt,effectiveProblemAttempt,effectiveModellingAttempt}
  from './working-notebook-evidence.js';
import {renderReasoningPage} from './reasoning-ui.js';
import {renderProblemSolvingPage} from './problem-solving-ui.js';
import {renderModellingPage} from './modelling-ui.js';
import {MODELLING_PHASES} from './modelling-content.js';
import {MODEL_PHASE_IDS,hydrateModellingProgress,blankModellingEntry,queueModelling,modellingTask,attemptedModelling,canSelfRateModel,saveModelReview} from './modelling-engine.js';
import {hydrateProblemSolvingProgress,emptyProblemSolvingProgress,queueProblems,problemFor,
  attemptedProblem,canRateProblem,reviewProblem} from './problem-solving-engine.js';
import {emptyReasoningProgress,hydrateReasoningProgress,queueReasoning,taskFor,
  reviewReasoning,REASONING_RATINGS} from './reasoning-engine.js';
import {emptyMemory,hydrateMemory,gradeCard,toggleCardFlag,deckQueue,matchRoundCards,
  assessTerm,recordFor} from './memorise-engine.js';
import {renderFlashcards as memoryFlashcards,renderMatch as memoryMatch,
  renderCloze as memoryCloze,renderSpeedRecall as memorySpeedRecall,
  renderReviewAll as memoryReviewAll,renderReviewList} from './memorise-ui.js';
import {generateWorksheet,generateWorksheetFromFluencySet,supportsWorksheets,worksheetSkills} from './worksheet-generator.js';
import {understandKey,renderSteps,renderConceptCheck,renderWalkthrough,renderWorkshop} from './understand-ui.js';
import {renderDiagram} from './visuals/diagrams.js';
import {diagramFor,explorerFor} from './visuals/registry.js';
import {renderVisualExplorer,refreshGraphExplorer,resetGraphModel,toggleGraphModel,updateGraphParameter} from './visuals/explorer-ui.js';
import {chaptersFor,sectionsFor,pagesFor,chapterFor,routeHref,resolveRoute,topicSwitchHref,escapeHTML as e,normaliseAnswer,cardForIndex,sampleMatchCards,validateTopics} from './logic.js';

const app=document.querySelector('#app');
const status=document.querySelector('#live-message');
const topicSwitch=document.querySelector('#topic-switcher');
// Populate the preview selector from the registry, never from hardcoded HTML options.
const installedTopics=Object.values(TOPICS);
topicSwitch.innerHTML=installedTopics.map(topic=>
  '<option value="'+topic.id+'">'+String(topic.title).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))+'</option>').join('');
topicSwitch.closest('.topic-switcher').hidden=installedTopics.length<2;
const brandLink=document.querySelector('#brand-link');
brandLink.href='#/'+encodeURIComponent(DEFAULT_TOPIC)+'/home';
const motionToggle=document.querySelector('#motion-toggle');
const motionLabel=document.querySelector('#motion-label');
const STORAGE='maths-notebook-pass1a:';
const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const safeStorage={
  get(key){try{return localStorage.getItem(STORAGE+key);}catch{return null;}},
  put(key,value){try{localStorage.setItem(STORAGE+key,value);}catch{/* private mode */}}
};
function getBookmarks(){
  try {
    const value=JSON.parse(safeStorage.get('bookmarks')||'[]');
    const links=Array.isArray(value)?value.filter(v=>typeof v==='string'&&v.startsWith('#/')):[];
    return new Set(links.map(href=>resolveRoute(href)).filter(r=>r.chapterId!=='home').map(r=>r.canonical));
  }
  catch{return new Set();}
}
const state={
  route:null, motionOff:safeStorage.get('motion-off')==='true', bookmarks:getBookmarks(),
  lastPage:safeStorage.get('last-page'),
  memory:{},
  flash:null,match:null,cloze:null,recall:null,review:null,
  understand:{steppers:{},checks:{},workshops:{},labs:{},graphs:{}},
  revealed:{},
  worksheets:{},
  fluencySessions:{},fluencyProgress:{},
  reasoningSessions:{},reasoningProgress:{},
  problemSessions:{},problemProgress:{},
  modellingSessions:{},modellingProgress:{}
};
let lastTopic=null;
function taskHasNotebook(mode,id){
  const route=state.route;
  if(!route||!id)return false;
  return hasSavedWorking(workingScope(route.topicId,mode,route.sectionId,route.pageId,id));
}
function problemWithNotebook(current){
  return effectiveProblemAttempt(current.response,
    taskHasNotebook('problemSolving',current.task.id));
}
function modellingWithNotebook(current){
  return effectiveModellingAttempt(current.entry,
    taskHasNotebook('modelling',current.task.id));
}

function memoryFor(topic){
  if(!state.memory[topic.id])
    state.memory[topic.id]=hydrateMemory(safeStorage.get('memorise:'+topic.id),topic);
  return state.memory[topic.id];
}
function saveMemory(topic,next){
  state.memory[topic.id]=next;
  safeStorage.put('memorise:'+topic.id,JSON.stringify(next));
}
function flashSession(topic,mode='all'){
  return {mode,ids:deckQueue(topic,memoryFor(topic),mode),index:0,flipped:false,complete:false,rated:0};
}
function clozeSession(topic,mode='all'){
  const priority=deckQueue(topic,memoryFor(topic),mode);
  const ids=mode==='all'?topic.clozes.map(c=>c.id):
    priority.flatMap(cardId=>topic.clozes.filter(c=>c.cardId===cardId).map(c=>c.id));
  return {mode,ids,
    index:0,value:'',hint:false,checked:false,correct:false,resultKind:null,complete:false,correctCount:0};
}
function recallSession(topic,mode='all'){
  return {mode,ids:deckQueue(topic,memoryFor(topic),mode),index:0,value:'',
    checked:false,correct:false,resultKind:null,complete:false,correctCount:0};
}
function resetMemoriseSessions(topic){
  // Topics may omit Memorise entirely; no fabricated flashcards are needed.
  if(!chaptersFor(topic).some(chapter=>chapter.id==='memorise')){
    state.flash={ids:[],index:0,flipped:false,complete:false};
    state.match={round:0,term:null,definition:null,matched:[],message:''};
    state.cloze={ids:[],index:0,complete:true};
    state.recall={ids:[],index:0,complete:true};
    state.review={query:'',filter:'all',showDefinitions:true,confirmReset:false};
    return;
  }
  state.flash=flashSession(topic);
  state.match={round:0,term:null,definition:null,matched:[],message:''};
  state.cloze=clozeSession(topic);
  state.recall=recallSession(topic);
  state.review={query:'',filter:'all',showDefinitions:true,confirmReset:false};
}
function fluencyProgressFor(topic){
  if(!state.fluencyProgress[topic.id])
    state.fluencyProgress[topic.id]=hydrateFluencyProgress(safeStorage.get('fluency:'+topic.id));
  return state.fluencyProgress[topic.id];
}
function saveFluencyProgress(topic,progress){
  state.fluencyProgress[topic.id]=progress;
  safeStorage.put('fluency:'+topic.id,JSON.stringify(progress));
}
const fluencyRouteKey=route=>[route.topicId,route.sectionId,route.pageId].join(':');
function freshFluencySet(route,seed,count=6){
  return {set:buildFluencySet({topicId:route.topicId,levelId:route.sectionId,
    pageId:route.pageId,seed,count}),configCount:count,index:0,answers:{},
    complete:false,confirmFresh:false,pendingCount:null};
}
function fluencySession(route=state.route){
  if(route?.chapterId!=='fluency')return null;
  const key=fluencyRouteKey(route);
  if(!state.fluencySessions[key]){
    let hashed=0;
    for(const ch of key)hashed=(Math.imul(hashed,31)+ch.charCodeAt(0))>>>0;
    const seed=1+((Date.now()+hashed)%999999998);
    state.fluencySessions[key]=freshFluencySet(route,seed);
  }
  return state.fluencySessions[key];
}
function fluencyAnswer(session){
  const question=session?.set.questions[session.index];
  return question?{question,response:session.answers[question.id]||{draft:'',working:'',tries:0}}:null;
}
function fluencyNewSet(route,count){
  const session=fluencySession(route);
  const nextSeed=1+((session.set.seed*1664525+1013904223)%999999998);
  state.fluencySessions[fluencyRouteKey(route)]=freshFluencySet(route,nextSeed,count);
}

function reasoningProgressFor(topic){
  if(!state.reasoningProgress[topic.id])
    state.reasoningProgress[topic.id]=hydrateReasoningProgress(
      safeStorage.get('reasoning:'+topic.id),topic.id);
  return state.reasoningProgress[topic.id];
}
function saveReasoningProgress(topic,value){
  state.reasoningProgress[topic.id]=value;
  safeStorage.put('reasoning:'+topic.id,JSON.stringify(value));
}
const reasoningRouteKey=route=>[route.topicId,route.sectionId].join(':');
function freshReasoningSession(route,selection='all'){
  return {selection,ids:queueReasoning(route.topicId,route.sectionId,
    reasoningProgressFor(TOPICS[route.topicId]),selection),
    index:0,entries:{},complete:false,confirmSwitch:false,pendingSelection:null};
}
function reasoningSession(route=state.route){
  if(route?.chapterId!=='reasoning')return null;
  const key=reasoningRouteKey(route);
  if(!state.reasoningSessions[key])
    state.reasoningSessions[key]=freshReasoningSession(route);
  return state.reasoningSessions[key];
}
function reasoningEntry(session){
  const task=taskFor(state.route.topicId,state.route.sectionId,session?.ids?.[session.index]);
  if(!task)return null;
  return {task,response:session.entries[task.id]||{
    draft:'',hint:false,usedHint:false,model:false,modelFirst:false,
    checks:[false,false,false],rating:null}};
}
function reasoningSelect(selection){
  state.reasoningSessions[reasoningRouteKey(state.route)]=
    freshReasoningSession(state.route,selection);
}

function problemProgressFor(topic){
  if(!state.problemProgress[topic.id])
    state.problemProgress[topic.id]=hydrateProblemSolvingProgress(
      safeStorage.get('problem-solving:'+topic.id),topic.id);
  return state.problemProgress[topic.id];
}
function saveProblemProgress(topic,value){
  state.problemProgress[topic.id]=value;
  safeStorage.put('problem-solving:'+topic.id,JSON.stringify(value));
}
const problemRouteKey=route=>[route.topicId,route.sectionId,route.pageId].join(':');
function freshProblemSession(route,selection='all'){
  return {selection,ids:queueProblems(route.topicId,route.sectionId,route.pageId,
      problemProgressFor(TOPICS[route.topicId]),selection),
    index:0,entries:{},complete:false,confirmSwitch:false,pendingSelection:null};
}
function problemSession(route=state.route){
  if(route?.chapterId!=='problemSolving')return null;
  const key=problemRouteKey(route);
  if(!state.problemSessions[key])state.problemSessions[key]=freshProblemSession(route);
  return state.problemSessions[key];
}
function currentProblem(session=problemSession()){
  const task=problemFor(state.route.topicId,state.route.sectionId,state.route.pageId,
    session?.ids?.[session.index]);
  if(!task)return null;
  return {task,response:session.entries[task.id]||{
    plan:'',working:'',strategiesOpen:false,strategy:null,assisted:false,
    hintCount:0,solutionStep:0,modelFirst:false,modelComplete:false,
    checks:[false,false,false],rating:null}};
}
function selectProblemSet(selection){
  state.problemSessions[problemRouteKey(state.route)]=freshProblemSession(state.route,selection);
}

// Modelling: progress survives page changes, while free-text work stays in memory only.
function modellingProgressFor(topic){
  if(!state.modellingProgress[topic.id])
    state.modellingProgress[topic.id]=hydrateModellingProgress(
      safeStorage.get('modelling:'+topic.id),topic.id);
  return state.modellingProgress[topic.id];
}
function persistModellingProgress(topic,value){
  state.modellingProgress[topic.id]=value;
  safeStorage.put('modelling:'+topic.id,JSON.stringify(value));
}
const modellingRouteKey=route=>[route.topicId,route.sectionId,route.pageId].join(':');
function freshModellingSession(route,selection='all'){
  return {selection,ids:queueModelling(route.topicId,route.sectionId,route.pageId,
      modellingProgressFor(TOPICS[route.topicId]),selection),
    index:0,stage:0,maxStage:0,entries:{},complete:false,
    confirmSwitch:false,pendingSelection:null};
}
function modellingSession(route=state.route){
  if(route?.chapterId!=='modelling')return null;
  const key=modellingRouteKey(route);
  if(!state.modellingSessions[key])state.modellingSessions[key]=freshModellingSession(route);
  return state.modellingSessions[key];
}
function currentModelling(session=modellingSession()){
  const task=modellingTask(state.route.topicId,state.route.sectionId,state.route.pageId,
    session?.ids?.[session.index]);
  if(!task)return null;
  return {task,entry:session.entries[task.id]||blankModellingEntry()};
}
function selectModellingSet(selection){
  state.modellingSessions[modellingRouteKey(state.route)]=freshModellingSession(state.route,selection);
}
function currentFlashCard(topic){
  return topic.cards.find(c=>c.id===state.flash?.ids?.[state.flash.index]);
}

function announce(message){status.textContent='';status.textContent=message;}
function selected(value,expected){return value===expected?' selected':'';}
function chapterHref(topic,chapter){const section=sectionsFor(topic,chapter)[0];return routeHref(topic.id,chapter,section?.id);}
function pagePaper(route){
  if(route.chapterId==='home'||route.chapterId==='resources')return 'plain';
  if(['fluency','modelling','problemSolving'].includes(route.chapterId))return 'squared';
  if(route.chapterId==='understand'&&route.sectionId==='visual-explanations')return 'squared';
  if(['memorise','games'].includes(route.chapterId))return 'plain';
  return TOPICS[route.topicId]?.paper||'ruled';
}
function renderCoverArt(){
  return '<svg class="cover-illustration" viewBox="0 0 320 220" fill="none" aria-hidden="true">'+
    '<circle cx="160" cy="110" r="91" stroke="currentColor" opacity=".5"/><circle cx="160" cy="110" r="69" stroke="currentColor" opacity=".3"/>'+
    '<path d="M38 180C85 176 94 49 164 65s72 124 118 63" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'+
    '<path d="M160 9v202M33 111h255" stroke="currentColor" stroke-dasharray="3 7" opacity=".45"/>'+
    '<circle cx="164" cy="65" r="6" fill="currentColor"/><circle cx="97" cy="126" r="4" fill="currentColor"/>'+
    '</svg>';
}
function renderContents(topic){
  const chapterEntries=chaptersFor(topic).map((chapter,index)=>'<li>'+
    '<a class="contents-entry" href="'+chapterHref(topic,chapter.id)+'" style="--chapter-color:'+chapter.color+'">'+
      '<span class="chapter-marker" aria-hidden="true"></span>'+
      '<span class="entry-num" aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span>'+
      '<span class="entry-text"><strong>'+e(chapter.label)+'</strong><small>'+e(chapter.description)+'</small></span>'+
      icon('arrow')+'</a></li>').join('');
  const saved=[...state.bookmarks].map(href=>{
    const r=resolveRoute(href);
    if(r.canonical!==href||r.topicId!==topic.id||r.chapterId==='home')return '';
    const section=sectionsFor(topic,r.chapterId).find(item=>item.id===r.sectionId);
    return '<a href="'+r.canonical+'">'+e(chapterFor(r.chapterId)?.label||'Section')+' · '+e(section?.label||'Page')+(r.pageIndex>0?' (page '+(r.pageIndex+1)+')':'')+'</a>';
  }).filter(Boolean).slice(0,4).join('');
  const last=state.lastPage?resolveRoute(state.lastPage):null;
  const continuation=last?.topicId===topic.id&&last.chapterId!=='home'
    ?'<a class="action-button" href="'+last.canonical+'">Continue '+icon('arrow')+'</a>':'';
  const worksheetResource=supportsWorksheets(topic.id)
    ?'<a class="worksheet-resource" href="'+routeHref(topic.id,'resources','worksheet-generator')+'">'+
      '<span class="worksheet-resource__icon">'+icon('pen')+'</span>'+
      '<span><strong>Worksheet Generator</strong><small>Create printable LaTeX worksheets and solutions</small></span>'+
      icon('arrow')+'</a>':'';
  return '<div class="contents-layout">'+
    '<section class="contents-cover" aria-label="Book cover for '+e(topic.title)+'">'+
      '<span class="cover-mark">'+e((topic.subject||'Mathematics').toUpperCase())+'</span>'+
      '<p class="cover-title">'+e(topic.title)+'</p><span class="cover-rule"></span>'+
      renderCoverArt()+
    '</section>'+
    '<section class="contents-right">'+
      '<div class="contents-heading"><h1 id="page-title" tabindex="-1">Contents</h1>'+
        '<p>Choose a chapter to begin, or return to a bookmarked page.</p></div>'+
      '<ol class="contents-list">'+chapterEntries+'</ol>'+
      '<div class="contents-extras">'+worksheetResource+
        '<div class="saved-markers"><strong>'+icon('bookmark')+' Bookmarks</strong>'+
          (saved||'<span>No saved pages yet.</span>')+'</div>'+
      '</div>'+(continuation?'<div style="margin-top:19px">'+continuation+'</div>':'')+
    '</section></div>';
}

function worksheetState(topic){
  if(!state.worksheets[topic.id]){
    state.worksheets[topic.id]={
      options:{
        topicId:topic.id,title:topic.title+' Worksheet',count:8,
        seed:20261028,style:'independent',difficulty:'secure',solutions:'worked',
        skills:worksheetSkills(topic.id).map(skill=>skill.id)
      },
      result:null,error:''
    };
  }
  return state.worksheets[topic.id];
}
function renderWorksheetGenerator(topic){
  const worksheet=worksheetState(topic),opts=worksheet.options;
  const skills=worksheetSkills(topic.id);
  const selectOptions=(options,selected)=>options.map(([value,label])=>
    '<option value="'+e(value)+'"'+(selected===value?' selected':'')+'>'+e(label)+'</option>').join('');
  const results=worksheet.result;
  const preview=results?'<section class="worksheet-result" id="worksheet-preview" tabindex="-1" aria-label="Generated worksheet">'+
      '<div class="worksheet-result-head"><strong>'+results.questions.length+' questions generated</strong>'+
      '<span>Seed '+results.options.seed+'</span></div>'+
      '<ol class="worksheet-questions">'+results.questions.map((q,index)=>
        '<li><span>'+e(q.prompt)+'</span><small>'+q.marks+' marks</small></li>').join('')+'</ol>'+
      '<div class="worksheet-export">'+
        '<button class="action-button" type="button" data-action="worksheet-download" data-kind="student">'+
          icon('pen')+' Download worksheet.tex</button>'+
        '<button class="quiet-button" type="button" data-action="worksheet-download" data-kind="solutions">'+
          icon('check')+' Download '+e(results.solutionsFilename)+'</button>'+
        '<button class="quiet-button" type="button" data-action="worksheet-copy">Copy worksheet LaTeX</button>'+
      '</div>'+
      '<details class="worksheet-source"><summary>View LaTeX source</summary>'+
        '<pre tabindex="0">'+e(results.studentTex)+'</pre></details>'+
      '</section>':
    '<div class="worksheet-empty">Choose your settings and generate a worksheet to preview the questions.</div>';
  return heading('Worksheet Generator',
    'Choose skills, difficulty and length to create a LaTeX worksheet with matching answers or worked solutions.')+
    '<div class="worksheet-layout"><form id="worksheet-form" class="worksheet-form">'+
      '<label class="worksheet-field" for="worksheet-title">Worksheet title'+
        '<input id="worksheet-title" name="title" type="text" maxlength="80" required value="'+e(opts.title)+'"></label>'+
      '<fieldset class="worksheet-skills"><legend>Include skills</legend>'+
        '<div class="worksheet-skill-grid">'+skills.map(skill=>
          '<label><input type="checkbox" name="skill" value="'+e(skill.id)+'"'+
          (opts.skills.includes(skill.id)?' checked':'')+'><span>'+e(skill.label)+'</span></label>').join('')+'</div></fieldset>'+
      '<div class="worksheet-form-grid">'+
        '<label class="worksheet-field" for="worksheet-style">Style'+
          '<select name="style" id="worksheet-style">'+selectOptions([
            ['independent','Independent practice'],['scaffolded','Scaffolded practice'],['mixed','Mixed review']
          ],opts.style)+'</select></label>'+
        '<label class="worksheet-field" for="worksheet-difficulty">Difficulty'+
          '<select name="difficulty" id="worksheet-difficulty">'+selectOptions([
            ['developing','Developing'],['secure','Secure'],['stretch','Stretch']
          ],opts.difficulty)+'</select></label>'+
        '<label class="worksheet-field" for="worksheet-count">Questions'+
          '<select name="count" id="worksheet-count">'+selectOptions([
            ['6','6 questions'],['8','8 questions'],['10','10 questions'],
            ['12','12 questions'],['16','16 questions']
          ],String(opts.count))+'</select></label>'+
        '<label class="worksheet-field" for="worksheet-solutions">Solution file'+
          '<select name="solutions" id="worksheet-solutions">'+selectOptions([
            ['worked','Fully worked solutions'],['answers','Answers only']
          ],opts.solutions)+'</select></label>'+
        '<label class="worksheet-field worksheet-field--seed" for="worksheet-seed">Variation seed'+
          '<input id="worksheet-seed" name="seed" type="number" min="1" max="999999999" step="1" required value="'+opts.seed+'"></label>'+
      '</div>'+
      '<div class="worksheet-actions"><button class="action-button" type="submit">Generate worksheet</button>'+
        '<button type="button" class="quiet-button" data-action="worksheet-regenerate">New variation</button></div>'+
      (worksheet.error?'<p class="worksheet-error" id="worksheet-error" role="alert" tabindex="-1">'+e(worksheet.error)+'</p>':'')+
    '</form><div class="worksheet-preview">'+preview+'</div></div>';
}

function heading(title,description){
  return '<h1 class="page-title" id="page-title" tabindex="-1">'+e(title)+'</h1>'+
    '<p class="page-subtitle">'+e(description)+'</p>';
}
function renderLessonPage(page,topic,route){
  return '<div class="lesson-page">'+page.blocks.map(block=>{
    if(block.kind==='text')return '<p class="lesson-text">'+e(block.text)+'</p>';
    if(block.kind==='note')return '<aside class="callout"><p>'+e(block.text)+'</p></aside>';
    if(block.kind==='example')return '<div class="lesson-small"><p><strong>Example:</strong> '+
      e(block.prompt)+'</p><ol class="worked-steps">'+block.steps.map(step=>'<li>'+e(step)+'</li>').join('')+'</ol></div>';
    if(block.kind==='diagram'){
      const config=diagramFor(topic.id,block);
      const graphic=config?renderDiagram(config):'<p>Diagram unavailable.</p>';
      return '<figure class="math-figure">'+graphic+'<figcaption class="figure-caption">'+e(block.caption)+'</figcaption></figure>';
    }
    if(block.kind==='comparison'){
      return '<div class="topic-panels'+(block.items.length===2?' topic-panels--two':'')+'">'+block.items.map(item=>
        '<article class="topic-panel"><strong class="topic-panel__title">'+e(item.label)+'</strong>'+
        '<p>'+e(item.description)+'</p></article>').join('')+'</div>';
    }
    if(block.kind==='table'){
      return '<div class="lesson-table-wrap"><table class="lesson-table"><thead><tr>'+
        block.headers.map(h=>'<th scope="col">'+e(h)+'</th>').join('')+'</tr></thead><tbody>'+
        block.rows.map(row=>'<tr>'+row.map(value=>'<td>'+e(value)+'</td>').join('')+'</tr>').join('')+
        '</tbody></table></div>';
    }
    if(block.kind==='concept-check'){
      const key=understandKey(route,block.id);
      return renderConceptCheck(block,key,state.understand.checks[key]);
    }
    if(block.kind==='stepper'){
      const key=understandKey(route,block.id);
      return renderWalkthrough(block,key,state.understand.steppers[key]||0);
    }
    return '';
  }).join('')+'</div>';
}
function renderQuestionPage(page,route){
  return '<div class="practice-list">'+page.problems.map((problem,index)=>{
    const key=[route.topicId,route.chapterId,route.sectionId,page.id,problem.id].join(':');
    const shown=state.revealed[key]||{};
    return '<article class="practice-question">'+
      '<div class="practice-question__meta"><span>Question '+(index+1)+'</span>'+
        '<span>'+problem.marks+' marks</span></div>'+
      '<p class="practice-question__prompt">'+e(problem.prompt)+'</p>'+
      '<div class="practice-question__actions">'+
        (problem.hint?'<button type="button" class="quiet-button" data-action="reveal-problem" data-part="hint" data-key="'+e(key)+'" '+
          'aria-expanded="'+Boolean(shown.hint)+'">'+(shown.hint?'Hide hint':'Show hint')+'</button>':'')+
        '<button type="button" class="quiet-button" data-action="reveal-problem" data-part="solution" data-key="'+e(key)+'" '+
          'aria-expanded="'+Boolean(shown.solution)+'">'+(shown.solution?'Hide solution':'Show solution')+'</button></div>'+
      (shown.hint&&problem.hint?'<div class="practice-question__hint"><strong>Hint:</strong> '+e(problem.hint)+'</div>':'')+
      (shown.solution?'<div class="reveal-answer"><strong>Solution:</strong> '+e(problem.solution)+'</div>':'')+
    '</article>';
  }).join('')+'</div>';
}
function renderGamePage(page){
  const symbol=page.gameId==='sprint'?'clock':page.gameId==='puzzle-quest'?'puzzle':'grid';
  return '<section class="game-feature">'+
    '<div class="game-feature__icon">'+icon(symbol)+'</div>'+
    '<div class="game-feature__body"><p>'+e(page.objective)+'</p>'+
    '<p class="game-feature__notice"><strong>Planned game:</strong> '+e(page.mechanic)+'</p></div>'+
  '</section>';
}
function renderReviewAll(topic){return memoryReviewAll(topic,memoryFor(topic),state.review);}
function renderSpeedRecall(topic){return memorySpeedRecall(topic,memoryFor(topic),state.recall);}
function renderFlashcards(topic){return memoryFlashcards(topic,memoryFor(topic),state.flash);}
function renderMatch(topic){return memoryMatch(topic,memoryFor(topic),state.match);}
function renderCloze(topic){return memoryCloze(topic,memoryFor(topic),state.cloze);}

function renderPageContent(route,topic){
  const {chapterId,sectionId,pageId}=route;
  if(chapterId==='home')return renderContents(topic);
  if(chapterId==='resources'&&sectionId==='worksheet-generator')return renderWorksheetGenerator(topic);
  const section=sectionsFor(topic,chapterId).find(s=>s.id===sectionId);
  const page=section?.pages.find(p=>p.id===pageId);
  if(!section||!page)return heading('Page unavailable','This page could not be opened.');
  const intro=heading(section.label,section.description);
  const renderers={
    lesson:()=>renderLessonPage(page,topic,route),
    questions:()=>renderQuestionPage(page,route),
    fluency:()=>renderFluencyPage(page,topic,route,fluencySession(route),fluencyProgressFor(topic)),
    reasoning:()=>renderReasoningPage(page,topic,route,reasoningSession(route),reasoningProgressFor(topic)),
    'problem-solving':()=>renderProblemSolvingPage(page,topic,route,problemSession(route),problemProgressFor(topic)),
    modelling:()=>renderModellingPage(page,topic,route,modellingSession(route),modellingProgressFor(topic)),
    graph:()=>renderVisualExplorer(page,route,state.understand),
    'sampling-lab':()=>renderVisualExplorer(page,route,state.understand),
    visual:()=>renderVisualExplorer(page,route,state.understand),
    workshop:()=>renderWorkshop(page,route,state.understand.steppers,state.understand.workshops),
    flashcards:()=>renderFlashcards(topic),
    'match-up':()=>renderMatch(topic),
    'missing-words':()=>renderCloze(topic),
    'speed-recall':()=>renderSpeedRecall(topic),
    'review-all':()=>renderReviewAll(topic),
    game:()=>renderGamePage(page)
  };
  return intro+(renderers[page.type]?.()||'');
}
function renderTabNav(topic,route){
  return '<nav class="chapter-tabs" aria-label="Book chapters">'+chaptersFor(topic).map(chapter=>
    '<a class="chapter-tab" style="--chapter-color:'+chapter.color+'" href="'+chapterHref(topic,chapter.id)+'"'+
    (route.chapterId===chapter.id?' aria-current="page"':'')+'>'+icon(chapter.icon)+e(chapter.short)+'</a>'
  ).join('')+'</nav>';
}
function renderSideTabs(topic,route){
  if(route.chapterId==='home'||route.chapterId==='resources')return '';
  const chapter=chapterFor(route.chapterId),sections=sectionsFor(topic,route.chapterId);
  return '<nav class="side-tabs" aria-label="'+e(chapter.label)+' subsections">'+
    sections.map((section,index)=>'<a class="side-tab" href="'+routeHref(topic.id,route.chapterId,section.id)+'" '+
      'style="--side-color:'+chapter.color+'"'+(route.sectionId===section.id?' aria-current="page"':'')+'>'+
      '<span class="index-number" aria-hidden="true">'+(index+1)+'</span><span>'+e(section.label)+'</span></a>').join('')+
    '</nav>';
}
function renderMobileNavigation(topic,route){
  const currentSection=sectionsFor(topic,route.chapterId),resource=route.chapterId==='resources';
  return '<div class="mobile-navigation'+(resource?' mobile-navigation--single':'')+'">'+
    '<div class="mobile-pick"><label for="mobile-chapter">Chapter</label><select id="mobile-chapter" data-role="chapter-select">'+
    '<option value="home"'+selected(route.chapterId,'home')+'>Contents</option>'+
    chaptersFor(topic).map(chapter=>'<option value="'+chapter.id+'"'+selected(route.chapterId,chapter.id)+'>'+e(chapter.label)+'</option>').join('')+
    (supportsWorksheets(topic.id)?'<option value="resources"'+selected(route.chapterId,'resources')+'>Resources</option>':'')+
    '</select></div>'+
    (resource?'':'<div class="mobile-pick'+(route.chapterId==='home'?' mobile-pick--disabled':'')+'"><label for="mobile-section">Subsection</label>'+
      '<select id="mobile-section" data-role="section-select"'+(route.chapterId==='home'?' disabled':'')+'>'+
        (route.chapterId==='home'?'<option>Choose a chapter</option>':currentSection.map(section=>
          '<option value="'+section.id+'"'+selected(route.sectionId,section.id)+'>'+e(section.label)+'</option>').join(''))+
      '</select></div>')+'</div>';
}

function renderBook(route,{animate=true}={}){
  const topic=TOPICS[route.topicId],chap=chapterFor(route.chapterId);
  const section=sectionsFor(topic,route.chapterId).find(item=>item.id===route.sectionId);
  const pages=section?.pages||[];
  const bookmarkCurrent=state.bookmarks.has(route.canonical);
  const previous=state.route;
  const motionClass=animate&&previous
    ? (previous.chapterId!==route.chapterId||previous.topicId!==route.topicId?'page-enter--turn':
       previous.sectionId!==route.sectionId?'page-enter--slide':
       previous.pageId!==route.pageId?'page-enter--turn':'')
    : '';
  const chapterHeader=route.chapterId==='home'?'':(
    '<div class="paper-head"><div class="crumbs">'+
      '<a href="'+routeHref(topic.id)+'">Contents</a>'+
      '<span class="crumb-separator">/</span><span>'+e(chap.label)+'</span></div>'+
      '<div class="page-tools"><button type="button" class="bookmark-button" data-action="bookmark"'+
        ' aria-pressed="'+bookmarkCurrent+'" aria-label="'+
        (bookmarkCurrent?'Remove bookmark':'Bookmark this page')+'">'+icon('bookmark')+
        '<span>'+(bookmarkCurrent?'Saved':'Bookmark')+'</span></button></div></div>'
  );
  const pageNavigation=pages.length>1?
    '<nav class="page-navigation" aria-label="Pages within '+e(section.label)+'">'+
      (route.pageIndex>0?
        '<a class="page-navigation__link" href="'+routeHref(topic.id,route.chapterId,route.sectionId,
           route.pageIndex-1===0?undefined:pages[route.pageIndex-1].id)+'">'+icon('arrow-left')+' Previous page</a>':
        '<span class="page-navigation__edge">First page</span>')+
      '<span class="page-navigation__count">Page '+(route.pageIndex+1)+' of '+pages.length+'</span>'+
      (route.pageIndex<pages.length-1?
        '<a class="page-navigation__link" href="'+routeHref(topic.id,route.chapterId,route.sectionId,
           pages[route.pageIndex+1].id)+'">Next page '+icon('arrow')+'</a>':
        '<span class="page-navigation__edge">Last page</span>')+
    '</nav>':'';
  app.innerHTML='<div class="book-wrap">'+
    renderMobileNavigation(topic,route)+
    '<div class="book">'+renderTabNav(topic,route)+
      '<div class="book-paper"><main class="book-page '+motionClass+'" data-paper="'+pagePaper(route)+'" id="book-page">'+
        chapterHeader+
        '<div class="page-body">'+renderPageContent(route,topic)+'</div>'+
        pageNavigation+
      '</main></div>'+renderSideTabs(topic,route)+'</div></div>';
  topicSwitch.value=topic.id;
  brandLink.href=routeHref(topic.id);
  brandLink.setAttribute('aria-label',topic.title+': contents');
  document.title=topic.title+' — The Maths Notebook';
  state.route=route;
  // Apply native, accessible mathematical typography to every reading mode,
  // without touching inputs, working notebooks or live editing controls.
  typesetSiteMath(app);
  enhanceMathInputs(app,{
    onToggle(target,active){
      if(target!=='fluency-answer'||state.route?.chapterId!=='fluency')return;
      const current=fluencyAnswer(fluencySession());
      if(!current||current.response.correct||current.response.revealed)return;
      const response={...current.response,mathMode:active};
      if(active&&!response.mathLatex)response.mathLatex='';
      fluencySession().answers[current.question.id]=response;
      rerender();
      document.querySelector(active?'[data-math-source]':'#fluency-answer')?.focus({preventScroll:true});
    },
    onChange(target,latex){
      if(target!=='fluency-answer'||state.route?.chapterId!=='fluency')return;
      const current=fluencyAnswer(fluencySession());
      if(current&&!current.response.correct&&!current.response.revealed)
        fluencySession().answers[current.question.id]={...current.response,mathLatex:latex};
    }
  });
  mountWorkingNotebooks(app);
  document.title=(section?section.label+(pages.length>1?' · Page '+(route.pageIndex+1):'')+' · ':
    route.chapterId==='home'?'Contents · ':'')+topic.title+' | The Maths Notebook';
}
function navigate(){
  const hadPreviousPage=Boolean(state.route);
  const next=resolveRoute(location.hash);
  if(location.hash!==next.canonical){history.replaceState(null,'',next.canonical);}
  if(next.topicId!==lastTopic){
    resetMemoriseSessions(TOPICS[next.topicId]);
    state.understand={steppers:{},checks:{},workshops:{},labs:{},graphs:{}};
    state.revealed={};
    lastTopic=next.topicId;
  }
  renderBook(next,{animate:true});
  if(next.chapterId!=='home'){
    state.lastPage=next.canonical;
    safeStorage.put('last-page',next.canonical);
  }
  const label=next.chapterId==='home'?'Contents':(chapterFor(next.chapterId)?.label+' — '+sectionsFor(TOPICS[next.topicId],next.chapterId).find(s=>s.id===next.sectionId)?.label+(pagesFor(TOPICS[next.topicId],next.chapterId,next.sectionId).length>1?' — page '+(next.pageIndex+1):''));
  announce(label+' page opened');
  if(hadPreviousPage){ // Move focus on chapter navigation, not on first page load.
    const title=document.querySelector('#page-title');
    title?.focus({preventScroll:true});
  }
}
function rerender(){
  renderBook(state.route,{animate:false});
}
function updateFlashFlip(){
  const cardEl=document.querySelector('#flashcard');
  if(!cardEl)return;
  const f=state.flash,card=currentFlashCard(TOPICS[state.route.topicId]);
  if(!card)return;
  cardEl.classList.toggle('is-flipped',f.flipped);
  cardEl.setAttribute('aria-pressed',String(f.flipped));
  cardEl.setAttribute('aria-label',f.flipped?'Show front of '+card.term:'Reveal answer for '+card.term);
  cardEl.querySelector('.flashcard__face--front').setAttribute('aria-hidden',String(f.flipped));
  cardEl.querySelector('.flashcard__face--back').setAttribute('aria-hidden',String(!f.flipped));
  document.querySelector('#ratings').hidden=!f.flipped;
}
function updateGraph(){
  const route=state.route,topic=TOPICS[route.topicId];
  const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
  refreshGraphExplorer(app,route,state.understand.graphs,page);
  typesetSiteMath(app);
}

app.addEventListener('click',ev=>{
  const button=ev.target.closest('button[data-action]');
  if(!button)return;
  const action=button.dataset.action,topic=TOPICS[state.route.topicId];
  if(action==='mdl-hint'){
    const session=modellingSession(),current=currentModelling(session);
    if(!current||session.complete||session.stage>=4||current.entry.rating)return;
    const id=MODEL_PHASE_IDS[session.stage],open=!current.entry.hints[id];
    session.entries[current.task.id]={...current.entry,
      hints:{...current.entry.hints,[id]:open},
      assisted:Boolean(current.entry.assisted||open)};
    rerender();
    document.querySelector('button[data-action="mdl-hint"]')?.focus({preventScroll:true});
    announce(open?'Modelling nudge shown.':'Modelling nudge hidden.');
  }else if(action==='mdl-example'){
    const session=modellingSession(),current=currentModelling(session);
    if(!current||session.complete||session.stage>=4||current.entry.rating)return;
    const id=MODEL_PHASE_IDS[session.stage],open=!current.entry.examples[id];
    session.entries[current.task.id]={...current.entry,
      examples:{...current.entry.examples,[id]:open},
      modelFirst:Boolean(current.entry.modelFirst||
        (open&&!((current.entry.drafts[id]?.trim().length||0)>=20||
          modellingWithNotebook(current).notebookStages[id])))};
    rerender();
    document.querySelector('button[data-action="mdl-example"]')?.focus({preventScroll:true});
    announce(open?'Worked modelling stage shown.':'Worked modelling stage hidden.');
  }else if(action==='mdl-next'||action==='mdl-prev'||action==='mdl-review'){
    const session=modellingSession(),current=currentModelling(session);
    if(!current||session.complete||current.entry.rating)return;
    if(action==='mdl-prev')session.stage=Math.max(0,session.stage-1);
    else if(action==='mdl-review'||session.stage===3){
      if(action==='mdl-review'&&!current.entry.compared)return;
      session.stage=4;
      session.entries[current.task.id]={...current.entry,compared:true,
        modelFirst:Boolean(current.entry.modelFirst||!attemptedModelling(modellingWithNotebook(current)))};
    }else session.stage=Math.min(4,session.stage+1);
    session.maxStage=Math.max(session.maxStage,session.stage);
    rerender();
    document.querySelector(session.stage===4?'input[data-mdl-check="0"]':'details[data-working-notebook] > summary')
      ?.focus({preventScroll:true});
    announce(session.stage===4?'The model comparison and review are shown.':
      MODELLING_PHASES[session.stage][1]+' stage.');
  }else if(action==='mdl-phase'){
    const session=modellingSession(),current=currentModelling(session),index=Number(button.dataset.phase);
    if(!current||session.complete||current.entry.rating||!Number.isInteger(index)||
      index<0||index>=4||index>session.maxStage)return;
    session.stage=index;rerender();
    document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
    announce(MODELLING_PHASES[index][1]+' stage selected.');
  }else if(action==='mdl-rate'){
    const session=modellingSession(),current=currentModelling(session),rating=button.dataset.rating;
    if(!current||session.complete||session.stage!==4)return;
    const response=modellingWithNotebook(current);
    if(!canSelfRateModel(response,rating))return;
    try{persistModellingProgress(topic,saveModelReview(modellingProgressFor(topic),
      topic.id,state.route.sectionId,state.route.pageId,current.task.id,response,rating));}
    catch(error){announce(error instanceof Error?error.message:'Modelling review not saved.');return;}
    session.entries[current.task.id]={...current.entry,rating};
    rerender();
    document.querySelector('button[data-action="mdl-next-case"]')?.focus({preventScroll:true});
    announce('Self-review recorded as '+rating+'. This is not an automatic mark.');
  }else if(action==='mdl-next-case'){
    const session=modellingSession(),current=currentModelling(session);
    if(!current?.entry?.rating||session.complete)return;
    if(session.index===session.ids.length-1){
      session.complete=true;rerender();
      document.querySelector('button[data-action="mdl-repeat"]')?.focus({preventScroll:true});
      announce('This modelling page is reviewed.');
    }else{
      session.index++;session.stage=0;session.maxStage=0;
      rerender();document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
      announce('Next modelling scenario.');
    }
  }else if(action==='mdl-selection'){
    const session=modellingSession(),selection=button.dataset.selection;
    if(!session||!['all','focus'].includes(selection)||session.selection===selection)return;
    const current=currentModelling(session),entry=current?.entry;
    const unfinished=entry&&!entry.rating&&(MODEL_PHASE_IDS.some(id=>
      entry.drafts[id].trim()||entry.examples[id]||entry.hints[id]||entry.notebookStages?.[id])||session.maxStage>0);
    if(unfinished){
      session.confirmSwitch=true;session.pendingSelection=selection;
      rerender();document.querySelector('button[data-action="mdl-cancel"]')?.focus({preventScroll:true});
      announce('Confirm replacement of unfinished modelling work.');
    }else{
      selectModellingSet(selection);rerender();
      document.querySelector('button[data-action="mdl-selection"][data-selection="'+selection+'"]')
        ?.focus({preventScroll:true});
      announce('Modelling scenario selection changed.');
    }
  }else if(action==='mdl-cancel'){
    const session=modellingSession();if(!session)return;
    session.confirmSwitch=false;session.pendingSelection=null;
    rerender();document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
    announce('Your modelling work has been preserved.');
  }else if(action==='mdl-confirm'){
    const session=modellingSession();
    if(!session?.confirmSwitch||!['all','focus'].includes(session.pendingSelection))return;
    const selected=session.pendingSelection;selectModellingSet(selected);rerender();
    document.querySelector('button[data-action="mdl-selection"][data-selection="'+selected+'"]')
      ?.focus({preventScroll:true});
    announce('Previous unfinished modelling attempt replaced.');
  }else if(action==='mdl-repeat'){
    const session=modellingSession(),selected=button.dataset.selection;
    if(!session?.complete||!['all','focus'].includes(selected))return;
    selectModellingSet(selected);rerender();
    document.querySelector('details[data-working-notebook] > summary,button[data-action="mdl-selection"]')
      ?.focus({preventScroll:true});
    announce('Modelling practice restarted.');
  }else if(action==='ps-strategies'){
    const session=problemSession(),current=currentProblem(session);
    if(!current||session.complete||current.response.rating)return;
    session.entries[current.task.id]={...current.response,
      strategiesOpen:!current.response.strategiesOpen,
      assisted:Boolean(current.response.assisted||!current.response.strategiesOpen)};
    rerender();
    document.querySelector('button[data-action="ps-strategies"]')?.focus({preventScroll:true});
    announce('Possible approaches '+(session.entries[current.task.id].strategiesOpen?'shown.':'hidden.'));
  }else if(action==='ps-choice'){
    const session=problemSession(),current=currentProblem(session);
    if(!current||session.complete||current.response.rating)return;
    const id=button.dataset.choice;
    if(!current.task.options.some(o=>o.id===id))return;
    session.entries[current.task.id]={...current.response,strategy:id,
      strategiesOpen:true,assisted:true};
    rerender();
    document.querySelector('button[data-action="ps-choice"][data-choice="'+id+'"]')?.focus({preventScroll:true});
    announce('Strategy feedback shown. This counts as supported practice.');
  }else if(action==='ps-hint'){
    const session=problemSession(),current=currentProblem(session);
    if(!current||session.complete||current.response.rating||current.response.hintCount>=2)return;
    session.entries[current.task.id]={...current.response,assisted:true,
      hintCount:current.response.hintCount+1};
    rerender();
    document.querySelector('button[data-action="ps-hint"]')?.focus({preventScroll:true});
    announce('Problem-solving hint '+session.entries[current.task.id].hintCount+' shown.');
  }else if(action==='ps-solution'){
    const session=problemSession(),current=currentProblem(session);
    if(!current||session.complete||current.response.rating||
      current.response.solutionStep>=current.task.steps.length)return;
    const step=current.response.solutionStep+1;
    session.entries[current.task.id]={...current.response,solutionStep:step,
      modelFirst:Boolean(current.response.modelFirst||
        (current.response.solutionStep===0&&!attemptedProblem(problemWithNotebook(current)))),
      modelComplete:step===current.task.steps.length};
    rerender();
    document.querySelector(step===current.task.steps.length?
      'input[data-ps-criterion="0"]':'button[data-action="ps-solution"]')?.focus({preventScroll:true});
    announce('Worked solution step '+step+' of '+current.task.steps.length+' shown.');
  }else if(action==='ps-rate'){
    const session=problemSession(),current=currentProblem(session),rating=button.dataset.rating;
    if(!current||session.complete||current.response.rating)return;
    const response=problemWithNotebook(current);
    if(!canRateProblem(response,rating))return;
    try{
      saveProblemProgress(topic,reviewProblem(problemProgressFor(topic),
        topic.id,state.route.sectionId,state.route.pageId,current.task.id,response,rating));
    }catch(error){
      announce(error instanceof Error?error.message:'Could not save your problem review.');
      return;
    }
    session.entries[current.task.id]={...current.response,rating};
    rerender();
    document.querySelector('button[data-action="ps-next"]')?.focus({preventScroll:true});
    announce('Problem self-review saved as '+rating+'. This is not an automatic grade.');
  }else if(action==='ps-next'){
    const session=problemSession(),current=currentProblem(session);
    if(!current||!current.response.rating||session.complete)return;
    if(session.index===session.ids.length-1){
      session.complete=true;
      rerender();
      announce('All problems on this page have been reviewed.');
      document.querySelector('button[data-action="ps-repeat"]')?.focus({preventScroll:true});
    }else{
      session.index++;
      rerender();
      document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
      announce('Next problem.');
    }
  }else if(action==='ps-selection'){
    const session=problemSession(),selection=button.dataset.mode;
    if(!session||!['all','focus'].includes(selection)||selection===session.selection)return;
    const current=currentProblem(session);
    if(current&&!current.response.rating&&
      (current.response.plan.trim()||current.response.working.trim()||
       current.response.notebookPlan||current.response.notebookWorking||
       current.response.strategy||current.response.hintCount||current.response.solutionStep)){
      session.confirmSwitch=true;session.pendingSelection=selection;
      rerender();
      document.querySelector('button[data-action="ps-cancel"]')?.focus({preventScroll:true});
      announce('Confirm replacement of unfinished problem-solving work.');
    }else{
      selectProblemSet(selection);
      rerender();
      document.querySelector('button[data-action="ps-selection"][data-mode="'+selection+'"]')
        ?.focus({preventScroll:true});
      announce('Problem selection changed.');
    }
  }else if(action==='ps-confirm'){
    const session=problemSession();
    if(!session?.confirmSwitch||!['all','focus'].includes(session.pendingSelection))return;
    const selection=session.pendingSelection;
    selectProblemSet(selection);rerender();
    document.querySelector('button[data-action="ps-selection"][data-mode="'+selection+'"]')
      ?.focus({preventScroll:true});
    announce('Previous incomplete attempt replaced.');
  }else if(action==='ps-cancel'){
    const session=problemSession();
    if(!session)return;
    session.confirmSwitch=false;session.pendingSelection=null;
    rerender();
    document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
    announce('Unfinished problem-solving work preserved.');
  }else if(action==='ps-repeat'){
    const session=problemSession(),selection=button.dataset.mode;
    if(!session?.complete||!['all','focus'].includes(selection))return;
    selectProblemSet(selection);rerender();
    document.querySelector('details[data-working-notebook] > summary,button[data-action="ps-selection"]')?.focus({preventScroll:true});
    announce(selection==='focus'?'Revisiting problems needing support.':'Beginning the problem set again.');
  }else if(action==='reasoning-hint'){
    const session=reasoningSession(),current=reasoningEntry(session);
    if(!current||session.complete||current.response.rating)return;
    const old=current.response;
    session.entries[current.task.id]={...old,hint:!old.hint,usedHint:Boolean(old.usedHint||!old.hint)};
    rerender();
    document.querySelector('button[data-action="reasoning-hint"]')?.focus({preventScroll:true});
    announce(session.entries[current.task.id].hint?'A helpful reasoning prompt is shown.':'Nudge hidden.');
  }else if(action==='reasoning-model'){
    const session=reasoningSession(),current=reasoningEntry(session);
    if(!current||session.complete||current.response.rating)return;
    const old=current.response,show=!old.model;
    session.entries[current.task.id]={...old,model:show,
      modelFirst:Boolean(old.modelFirst||
        (show&&!reasoningAttempt(old,taskHasNotebook('reasoning',current.task.id))))};
    rerender();
    document.querySelector('button[data-action="reasoning-model"]')?.focus({preventScroll:true});
    announce(show?'Model argument and self-review criteria shown.':'Model argument hidden.');
  }else if(action==='reasoning-rate'){
    const session=reasoningSession(),current=reasoningEntry(session),
      rating=button.dataset.rating;
    if(!current||session.complete||current.response.rating||!current.response.model||
      !REASONING_RATINGS.includes(rating))return;
    const entry=current.response,review={
      rating,checked:entry.checks.filter(Boolean).length,
      attempted:reasoningAttempt(entry,taskHasNotebook('reasoning',current.task.id)),
      assisted:Boolean(entry.usedHint||entry.modelFirst),
      modelFirst:Boolean(entry.modelFirst)
    };
    try{
      saveReasoningProgress(topic,reviewReasoning(reasoningProgressFor(topic),
        topic.id,state.route.sectionId,current.task.id,review));
    }catch(error){
      announce(error instanceof Error?error.message:'Cannot save this self-review.');
      return;
    }
    session.entries[current.task.id]={...entry,rating};
    rerender();
    document.querySelector('button[data-action="reasoning-next"]')?.focus({preventScroll:true});
    announce('Self-review saved as '+rating+'. This is not an automatic grade.');
  }else if(action==='reasoning-next'){
    const session=reasoningSession(),current=reasoningEntry(session);
    if(!current||!current.response.rating||session.complete)return;
    if(session.index===session.ids.length-1){
      session.complete=true;
      rerender();
      announce('You have completed the '+state.route.sectionId+' review set.');
      document.querySelector('.reasoning-complete__lead')?.focus({preventScroll:true});
    }else{
      session.index++;
      rerender();
      document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
      announce('Next reasoning prompt.');
    }
  }else if(action==='reasoning-mode'){
    const session=reasoningSession(),selection=button.dataset.mode;
    if(!session||!['all','focus'].includes(selection)||session.selection===selection)return;
    const current=reasoningEntry(session);
    if(current&&!current.response.rating&&
      (current.response.draft.trim()||current.response.model||current.response.notebookConfirmed)){
      session.confirmSwitch=true;
      session.pendingSelection=selection;
      rerender();
      document.querySelector('button[data-action="reasoning-cancel-switch"]')?.focus({preventScroll:true});
      announce('Confirm replacing your unfinished reasoning prompt.');
    }else{
      reasoningSelect(selection);rerender();
      document.querySelector('button[data-action="reasoning-mode"][data-mode="'+selection+'"]')
        ?.focus({preventScroll:true});
      announce('Reasoning prompts changed to '+(selection==='focus'?'needs another look':'all')+'.');
    }
  }else if(action==='reasoning-cancel-switch'){
    const session=reasoningSession();
    if(!session)return;
    session.confirmSwitch=false;session.pendingSelection=null;
    rerender();announce('Your unfinished argument was preserved.');
    document.querySelector('details[data-working-notebook] > summary')?.focus({preventScroll:true});
  }else if(action==='reasoning-confirm-switch'){
    const session=reasoningSession();
    if(!session?.confirmSwitch||!['all','focus'].includes(session.pendingSelection))return;
    const choice=session.pendingSelection;
    reasoningSelect(choice);rerender();
    announce('Reasoning selection changed.');
    document.querySelector('button[data-action="reasoning-mode"][data-mode="'+choice+'"]')
      ?.focus({preventScroll:true});
  }else if(action==='reasoning-repeat'){
    const session=reasoningSession(),selection=button.dataset.mode;
    if(!session?.complete||!['all','focus'].includes(selection))return;
    reasoningSelect(selection);rerender();
    announce(selection==='focus'?'Reviewing selected weaker arguments.':'Starting the full argument set again.');
    document.querySelector('details[data-working-notebook] > summary,button[data-action="reasoning-mode"]')
      ?.focus({preventScroll:true});
  }else if(action==='fluency-hint'){
    const session=fluencySession(),current=fluencyAnswer(session);
    if(!current||session.complete)return;
    const a=current.response;
    session.answers[current.question.id]={...a,hint:!a.hint,usedHint:Boolean(a.usedHint||!a.hint)};
    rerender();
    document.querySelector('button[data-action="fluency-hint"]')?.focus({preventScroll:true});
    announce(session.answers[current.question.id].hint?'Hint displayed.':'Hint hidden.');
  }else if(action==='fluency-working'){
    const session=fluencySession(),current=fluencyAnswer(session);
    if(!current||!(current.response.correct||current.response.revealed))return;
    const a=current.response;
    session.answers[current.question.id]={...a,showWorking:!a.showWorking};
    rerender();
    document.querySelector('button[data-action="fluency-working"]')?.focus({preventScroll:true});
    announce('Worked solution '+(session.answers[current.question.id].showWorking?'shown.':'hidden.'));
  }else if(action==='fluency-reveal'){
    const session=fluencySession(),current=fluencyAnswer(session);
    if(!current||session.complete||current.response.correct||current.response.revealed)return;
    session.answers[current.question.id]={...current.response,correct:false,revealed:true,
      showWorking:true,feedback:'Full solution revealed for self-review. This does not count as a correct answer.'};
    rerender();
    document.querySelector('button[data-action="fluency-next"]')?.focus({preventScroll:true});
    announce('Full worked solution displayed. This question needs further practice.');
  }else if(action==='fluency-next'){
    const session=fluencySession(),current=fluencyAnswer(session);
    if(!current||session.complete||!(current.response.correct||current.response.revealed))return;
    if(session.index<session.set.questions.length-1){
      session.index++;
      rerender();announce('Next Fluency question.');
      document.querySelector('#fluency-answer')?.focus({preventScroll:true});
    }else{
      const summary=roundScores(session),topic=TOPICS[state.route.topicId];
      session.complete=true;
      saveFluencyProgress(topic,saveFluencyRound(fluencyProgressFor(topic),
        state.route.sectionId,summary));
      rerender();announce('Fluency round complete; practice totals saved locally.');
      document.querySelector('.fluency-complete__lead')?.focus?.({preventScroll:true});
    }
  }else if(action==='fluency-worksheet'){
    const session=fluencySession();
    if(!session?.complete)return;
    try{
      const worksheet=worksheetState(topic);
      const output=generateWorksheetFromFluencySet(session.set);
      worksheet.options=output.options;
      worksheet.result=output;worksheet.error='';
      announce('Matching LaTeX worksheet and worked solutions prepared.');
      location.hash=routeHref(topic.id,'resources','worksheet-generator');
    }catch(error){
      announce(error instanceof Error?error.message:'Unable to export Fluency worksheet.');
    }
  }else if(action==='fluency-retry'){
    const session=fluencySession();
    if(!session?.complete)return;
    const missed=session.set.questions.filter(q=>{
      const a=session.answers[q.id];
      return a?.revealed||(a?.correct&&(a.tries>1||a.usedHint));
    });
    if(!missed.length)return;
    state.fluencySessions[fluencyRouteKey(state.route)]={
      set:{...session.set,questions:missed,count:missed.length},configCount:session.configCount,
      index:0,answers:{},complete:false,confirmFresh:false,pendingCount:null
    };
    rerender();announce('Review practice started with '+missed.length+' questions.');
    document.querySelector('#fluency-answer')?.focus({preventScroll:true});
  }else if(action==='fluency-new'){
    const session=fluencySession();
    if(!session)return;
    if(!session.complete&&Object.values(session.answers).some(a=>a.tries||a.revealed||a.draft?.trim()||a.working?.trim()||a.mathLatex?.trim())){
      session.confirmFresh=true;session.pendingCount=session.configCount;rerender();
      document.querySelector('button[data-action="fluency-cancel-new"]')?.focus({preventScroll:true});
      announce('Confirm replacing your unfinished Fluency set.');
    }else{
      fluencyNewSet(state.route,session.configCount);rerender();
      document.querySelector('#fluency-answer')?.focus({preventScroll:true});
      announce('New Fluency questions generated.');
    }
  }else if(action==='fluency-confirm-new'){
    const session=fluencySession();
    if(!session?.confirmFresh)return;
    fluencyNewSet(state.route,session.pendingCount||session.configCount);
    rerender();announce('Replacement Fluency set created.');
    document.querySelector('#fluency-answer')?.focus({preventScroll:true});
  }else if(action==='fluency-cancel-new'){
    const session=fluencySession();
    if(!session)return;
    session.confirmFresh=false;session.pendingCount=null;
    rerender();announce('Unfinished practice kept.');
    document.querySelector('button[data-action="fluency-new"]')?.focus({preventScroll:true});
  }else if(action==='bookmark'){
    if(state.bookmarks.has(state.route.canonical))state.bookmarks.delete(state.route.canonical);
    else state.bookmarks.add(state.route.canonical);
    safeStorage.put('bookmarks',JSON.stringify([...state.bookmarks]));
    announce(state.bookmarks.has(state.route.canonical)?'Page bookmarked':'Bookmark removed');
    rerender();
    document.querySelector('button[data-action="bookmark"]')?.focus({preventScroll:true});
  }else if(action==='flash-mode'){
    const mode=button.dataset.mode;
    if(!['all','focus','due'].includes(mode))return;
    state.flash=flashSession(topic,mode);
    rerender();announce(mode==='focus'?'Priority practice selected.':'Flashcard mode changed.');
    document.querySelector('button[data-action="flash-mode"][data-mode="'+mode+'"]')?.focus({preventScroll:true});
  }else if(action==='flash-flip'){
    if(!currentFlashCard(topic)||state.flash.complete)return;
    state.flash.flipped=!state.flash.flipped;updateFlashFlip();
    announce(state.flash.flipped?'Definition revealed. Rate your recall.':'Term shown.');
  }else if(action==='flash-next'||action==='flash-prev'){
    const increment=action==='flash-next'?1:-1;
    const f=state.flash;
    f.index=Math.max(0,Math.min(f.ids.length-1,f.index+increment));
    f.flipped=false;rerender();
    document.querySelector('button[data-action="'+action+'"]:not(:disabled)')?.focus({preventScroll:true});
  }else if(action==='flash-restart'){
    state.flash=flashSession(topic,state.flash.mode);
    rerender();announce('New flashcard round. Saved reviews are retained.');
    document.querySelector('#flashcard,button[data-action="flash-mode"]')?.focus({preventScroll:true});
  }else if(action==='flash-rate'){
    const f=state.flash,card=currentFlashCard(topic),rating=button.dataset.rating;
    if(!f.flipped||!card||!['again','nearly','know'].includes(rating))return;
    saveMemory(topic,gradeCard(memoryFor(topic),topic,card.id,rating,'flashcards'));
    f.rated++;
    if(f.index===f.ids.length-1)f.complete=true;
    else f.index++;
    f.flipped=false;rerender();
    announce('Rated '+card.term+': '+rating+'. Progress saved locally.');
    document.querySelector('#flashcard,button[data-action="flash-restart"]')?.focus({preventScroll:true});
  }else if(action==='memory-flag'){
    const id=button.dataset.id;
    if(!topic.cards.some(c=>c.id===id))return;
    saveMemory(topic,toggleCardFlag(memoryFor(topic),topic,id));
    rerender();announce('Review flag updated for '+topic.cards.find(c=>c.id===id).term+'.');
    document.querySelector('button[data-action="memory-flag"][data-id="'+id+'"],#review-filter')
      ?.focus({preventScroll:true});
  }else if(action==='match-choice'){
    const side=button.dataset.side,id=button.dataset.id,m=state.match;
    const roundCards=matchRoundCards(topic,m.round,4);
    if(!['term','definition'].includes(side)||!roundCards.some(c=>c.id===id)||m.matched.includes(id))return;
    m[side]=m[side]===id?null:id;
    if(m.term&&m.definition){
      if(m.term===m.definition){
        m.matched.push(m.term);
        saveMemory(topic,gradeCard(memoryFor(topic),topic,m.term,'nearly','match-up',Date.now(),true));
        m.message='Correct pair connected.';
      }else{
        saveMemory(topic,gradeCard(memoryFor(topic),topic,m.term,'again','match-up'));
        m.message='Not quite. Compare the exact meaning of each term.';
      }
      announce(m.message);
      m.term=null;m.definition=null;
    }else m.message=side==='term'?'Term selected. Now choose its definition.':'Definition selected. Now choose its term.';
    rerender();
    const matching=document.querySelector('.match-choice[data-side="'+side+'"][data-id="'+id+'"]');
    (matching&&!matching.disabled?matching:document.querySelector('.match-choice:not(:disabled)'))?.focus({preventScroll:true});
  }else if(action==='match-next'){
    if(state.match.matched.length!==matchRoundCards(topic,state.match.round,4).length)return;
    state.match={round:state.match.round+1,term:null,definition:null,matched:[],message:''};
    rerender();announce('Next matching round opened.');
    document.querySelector('.match-choice')?.focus({preventScroll:true});
  }else if(action==='match-reset'){
    state.match={...state.match,term:null,definition:null,matched:[],message:''};
    rerender();announce('This matching round restarted. Saved learning history was retained.');
    document.querySelector('.match-choice')?.focus({preventScroll:true});
  }else if(action==='cloze-mode'){
    const mode=button.dataset.mode;
    if(!['all','focus'].includes(mode))return;
    state.cloze=clozeSession(topic,mode);rerender();
    announce('Missing Words '+mode+' practice selected.');
    document.querySelector('button[data-action="cloze-mode"][data-mode="'+mode+'"]')?.focus({preventScroll:true});
  }else if(action==='cloze-hint'){
    if(state.cloze.checked)return;
    state.cloze.hint=!state.cloze.hint;rerender();
    document.querySelector('#cloze-answer')?.focus({preventScroll:true});
  }else if(action==='cloze-reveal'){
    if(state.cloze.checked)return;
    const item=topic.clozes.find(c=>c.id===state.cloze.ids[state.cloze.index]);
    if(!item)return;
    saveMemory(topic,gradeCard(memoryFor(topic),topic,item.cardId,'again','missing-words'));
    Object.assign(state.cloze,{checked:true,correct:false,resultKind:'revealed'});
    rerender();announce('Answer revealed: '+item.answer+'. Marked for further review.');
    document.querySelector('button[data-action="cloze-next"]')?.focus({preventScroll:true});
  }else if(action==='cloze-next'){
    if(!state.cloze.checked)return;
    if(state.cloze.index===state.cloze.ids.length-1)state.cloze.complete=true;
    else state.cloze.index++;
    Object.assign(state.cloze,{value:'',hint:false,checked:false,correct:false,resultKind:null});
    rerender();
    document.querySelector('#cloze-answer,button[data-action="cloze-restart"]')?.focus({preventScroll:true});
  }else if(action==='cloze-restart'){
    state.cloze=clozeSession(topic,state.cloze.mode);
    rerender();announce('Missing Words round restarted. Saved reviews retained.');
    document.querySelector('#cloze-answer,button[data-action="cloze-mode"]')?.focus({preventScroll:true});
  }else if(action==='recall-mode'){
    const mode=button.dataset.mode;
    if(!['all','focus','due'].includes(mode))return;
    state.recall=recallSession(topic,mode);
    rerender();announce('Speed Recall '+mode+' practice selected.');
    document.querySelector('button[data-action="recall-mode"][data-mode="'+mode+'"]')?.focus({preventScroll:true});
  }else if(action==='recall-reveal'){
    if(state.recall.checked)return;
    const card=topic.cards.find(c=>c.id===state.recall.ids[state.recall.index]);
    if(!card)return;
    saveMemory(topic,gradeCard(memoryFor(topic),topic,card.id,'again','speed-recall'));
    Object.assign(state.recall,{checked:true,correct:false,resultKind:'revealed'});
    rerender();announce('Term revealed: '+card.term+'. Added to priority practice.');
    document.querySelector('button[data-action="recall-next"]')?.focus({preventScroll:true});
  }else if(action==='recall-next'){
    if(!state.recall.checked)return;
    if(state.recall.index===state.recall.ids.length-1)state.recall.complete=true;
    else state.recall.index++;
    Object.assign(state.recall,{value:'',checked:false,correct:false,resultKind:null});
    rerender();
    document.querySelector('#recall-answer,button[data-action="recall-restart"]')?.focus({preventScroll:true});
  }else if(action==='recall-restart'){
    state.recall=recallSession(topic,state.recall.mode);
    rerender();announce('Speed Recall restarted. Saved reviews retained.');
    document.querySelector('#recall-answer,button[data-action="recall-mode"]')?.focus({preventScroll:true});
  }else if(action==='review-definitions'){
    state.review.showDefinitions=!state.review.showDefinitions;
    rerender();
    document.querySelector('button[data-action="review-definitions"]')?.focus({preventScroll:true});
  }else if(action==='memory-ask-reset'){
    state.review.confirmReset=true;rerender();
    document.querySelector('button[data-action="memory-cancel-reset"]')?.focus({preventScroll:true});
  }else if(action==='memory-cancel-reset'){
    state.review.confirmReset=false;rerender();
    document.querySelector('button[data-action="memory-ask-reset"]')?.focus({preventScroll:true});
  }else if(action==='memory-confirm-reset'){
    if(!state.review.confirmReset)return;
    saveMemory(topic,emptyMemory());
    resetMemoriseSessions(topic);
    rerender();announce('Memorise progress reset for '+topic.title+' on this device.');
    document.querySelector('#review-filter')?.focus({preventScroll:true});
  }else if(action==='understand-check'){
    const route=state.route,key=button.dataset.key,id=button.dataset.choice;
    const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
    const block=page?.blocks?.find(b=>b.kind==='concept-check'&&understandKey(route,b.id)===key);
    const choice=block?.choices.find(c=>c.id===id);
    if(!choice)return;
    state.understand.checks[key]={choice:id};
    rerender();
    document.querySelector('button[data-action="understand-check"][data-choice="'+id+'"]')?.focus({preventScroll:true});
    announce((choice.correct?'Correct. ':'Not yet. ')+choice.feedback);
  }else if(action==='understand-step-next'||action==='understand-step-prev'||action==='understand-step-reset'){
    const key=button.dataset.key;
    const current=state.understand.steppers[key]||0;
    const total=Number(button.dataset.total)||current;
    state.understand.steppers[key]=action==='understand-step-reset'?0:
      action==='understand-step-prev'?Math.max(0,current-1):Math.min(total,current+1);
    rerender();
    const nextAction=action==='understand-step-reset'?'understand-step-next':
      (action==='understand-step-prev'?
        (state.understand.steppers[key]===0?'understand-step-next':'understand-step-prev'):
        state.understand.steppers[key]===total?'understand-step-reset':'understand-step-next');
    document.querySelector('button[data-action="'+nextAction+'"][data-key="'+key+'"]')?.focus({preventScroll:true});
    announce('Step '+state.understand.steppers[key]+' revealed.');
  }else if(action==='sampling-method'||action==='sampling-redraw'){
    const route=state.route,key=button.dataset.key;
    const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
    const explorer=page&&explorerFor(route.topicId,page);
    if(explorer?.type!=='sampling-selection')return;
    const available=page.methods?.length?page.methods:Object.keys(explorer.methods);
    if(key!==[route.topicId,route.sectionId,route.pageId,'sampling'].join(':'))return;
    const prior=state.understand.labs[key]||{method:available[0],run:1};
    const method=action==='sampling-method'?button.dataset.method:prior.method;
    if(!available.includes(method))return;
    state.understand.labs[key]={method,run:action==='sampling-method'?1:prior.run+1};
    rerender();
    const focus=action==='sampling-method'?
      'button[data-action="sampling-method"][data-method="'+method+'"]':
      'button[data-action="sampling-redraw"]';
    document.querySelector(focus)?.focus({preventScroll:true});
    announce(method+' selection updated.');
  }else if(action==='understand-guided'){
    const route=state.route,key=button.dataset.key,id=button.dataset.choice;
    const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
    const chosen=page?.type==='workshop'?page.guided.choices.find(c=>c[0]===id):null;
    if(!chosen||understandKey(route,'workshop')!==key)return;
    const prior=state.understand.workshops[key]||{};
    state.understand.workshops[key]={...prior,choice:id};
    rerender();
    document.querySelector('button[data-action="understand-guided"][data-choice="'+id+'"]')?.focus({preventScroll:true});
    announce((chosen[3]?'Correct. ':'Not yet. ')+chosen[2]);
  }else if(action==='understand-own-hint'||action==='understand-own-solution'){
    const key=button.dataset.key;
    if(key!==understandKey(state.route,'workshop'))return;
    const prior=state.understand.workshops[key]||{};
    const part=action==='understand-own-hint'?'hint':'solution';
    state.understand.workshops[key]={...prior,[part]:!prior[part]};
    rerender();
    document.querySelector('button[data-action="'+action+'"]')?.focus({preventScroll:true});
    announce(part+(state.understand.workshops[key][part]?' shown.':' hidden.'));
  }else if(action==='understand-self-rate'){
    const key=button.dataset.key,rating=button.dataset.rating;
    if(key!==understandKey(state.route,'workshop')||!['ready','review'].includes(rating))return;
    const prior=state.understand.workshops[key]||{};
    state.understand.workshops[key]={...prior,rating};
    rerender();
    document.querySelector('button[data-action="understand-self-rate"][data-rating="'+rating+'"]')
      ?.focus({preventScroll:true});
    announce(rating==='ready'?'Marked as confident for this session.':'Marked for review in this session.');
  }else if(action==='graph-reset'){
    const route=state.route;
    const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
    if(!resetGraphModel(route,state.understand.graphs,page&&explorerFor(topic.id,page)))return;
    rerender();
    document.querySelector('button[data-action="graph-reset"]')?.focus({preventScroll:true});
    announce('Graph reset to its starting position.');
  }else if(action==='graph-reflect'){
    const route=state.route;
    const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
    if(!toggleGraphModel(route,state.understand.graphs,page&&explorerFor(topic.id,page)))return;
    updateGraph();
    announce('Graph control updated.');
  }else if(action==='worksheet-regenerate'){
    const input=document.querySelector('#worksheet-seed');
    const previous=Number(input?.value)||20261028;
    input.value=String((previous*1664525+1013904223)%999999998+1);
    document.querySelector('#worksheet-form')?.requestSubmit();
  }else if(action==='worksheet-download'){
    const output=worksheetState(topic).result;
    if(!output)return;
    const student=button.dataset.kind==='student';
    const content=student?output.studentTex:output.solutionsTex;
    const filename=student?'worksheet.tex':output.solutionsFilename;
    const blob=new Blob([content],{type:'application/x-tex;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download=filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),2000);
    announce(filename+' downloaded');
  }else if(action==='worksheet-copy'){
    const output=worksheetState(topic).result;
    if(!output)return;
    if(!navigator.clipboard?.writeText){
      announce('Clipboard unavailable. Open View LaTeX source to copy it manually.');
    }else{
      navigator.clipboard.writeText(output.studentTex).then(
        ()=>announce('Worksheet LaTeX copied'),
        ()=>announce('Copy failed. Open View LaTeX source to copy it manually.')
      );
    }
  }else if(action==='reveal-problem'){
    const key=button.dataset.key,part=button.dataset.part;
    if(!['hint','solution'].includes(part))return;
    const parts=state.revealed[key]||{};
    state.revealed[key]={...parts,[part]:!parts[part]};
    rerender();
    document.querySelector('button[data-action="reveal-problem"][data-key="'+key+'"][data-part="'+part+'"]')
      ?.focus({preventScroll:true});
  }else if(action==='reveal'){
    const key=button.dataset.key;
    state.revealed[key]=!state.revealed[key];
    rerender();
    document.querySelector('button[data-key="'+key+'"]')?.focus({preventScroll:true});
  }
});
app.addEventListener('change',ev=>{
  if(ev.target.matches('input[data-reasoning-notebook-evidence]')&&state.route?.chapterId==='reasoning'){
    const session=reasoningSession(),current=reasoningEntry(session);
    if(!current||session.complete||current.response.rating)return;
    if(ev.target.checked&&!taskHasNotebook('reasoning',current.task.id)){
      ev.target.checked=false;
      announce('Add your argument or mathematical working to the notebook before confirming it.');
      return;
    }
    session.entries[current.task.id]={...current.response,notebookConfirmed:ev.target.checked};
    rerender();
    document.querySelector('input[data-reasoning-notebook-evidence]')?.focus({preventScroll:true});
    announce(ev.target.checked?'Notebook recorded as your written argument for self-review.':
      'Notebook evidence confirmation cleared.');
    return;
  }
  if(ev.target.matches('input[data-ps-notebook-evidence]')&&state.route?.chapterId==='problemSolving'){
    const session=problemSession(),current=currentProblem(session),
      kind=ev.target.dataset.psNotebookEvidence;
    if(!current||session.complete||current.response.rating||
      !['plan','working'].includes(kind))return;
    if(ev.target.checked&&!taskHasNotebook('problemSolving',current.task.id)){
      ev.target.checked=false;
      announce('Record your strategy or working in the notebook before confirming this option.');
      return;
    }
    const field=kind==='plan'?'notebookPlan':'notebookWorking';
    session.entries[current.task.id]={...current.response,[field]:ev.target.checked};
    rerender();
    document.querySelector('input[data-ps-notebook-evidence="'+kind+'"]')?.focus({preventScroll:true});
    announce(kind+' notebook evidence '+(ev.target.checked?'confirmed.':'cleared.'));
    return;
  }
  if(ev.target.matches('input[data-mdl-notebook-evidence]')&&state.route?.chapterId==='modelling'){
    const session=modellingSession(),current=currentModelling(session);
    if(!current||session.complete||session.stage>=4||current.entry.rating)return;
    const id=ev.target.dataset.mdlNotebookEvidence;
    if(id!==MODEL_PHASE_IDS[session.stage])return;
    if(ev.target.checked&&!taskHasNotebook('modelling',current.task.id)){
      ev.target.checked=false;
      announce('Record your work in the modelling notebook before confirming this stage.');
      return;
    }
    session.entries[current.task.id]={...current.entry,
      notebookStages:{...current.entry.notebookStages,[id]:ev.target.checked}};
    rerender();
    document.querySelector('input[data-mdl-notebook-evidence="'+id+'"]')?.focus({preventScroll:true});
    announce(id+' stage notebook evidence '+(ev.target.checked?'confirmed.':'cleared.'));
    return;
  }
  if(ev.target.matches('input[data-mdl-check]')&&state.route?.chapterId==='modelling'){
    const session=modellingSession(),current=currentModelling(session);
    if(!current||session.stage!==4||!current.entry.compared||current.entry.rating)return;
    const index=Number(ev.target.dataset.mdlCheck);
    if(!Number.isInteger(index)||index<0||index>=3)return;
    const checked=[...current.entry.checked];checked[index]=ev.target.checked;
    session.entries[current.task.id]={...current.entry,checked};
    rerender();
    document.querySelector('input[data-mdl-check="'+index+'"]')?.focus({preventScroll:true});
    announce('Modelling criterion '+(index+1)+(checked[index]?' checked.':' unchecked.'));
    return;
  }  if(ev.target.matches('input[data-ps-criterion]')&&state.route?.chapterId==='problemSolving'){
    const session=problemSession(),current=currentProblem(session);
    if(!current||!current.response.modelComplete||current.response.rating)return;
    const index=Number(ev.target.dataset.psCriterion);
    if(!Number.isInteger(index)||index<0||index>=current.task.checks.length)return;
    const checks=[...current.response.checks];checks[index]=ev.target.checked;
    session.entries[current.task.id]={...current.response,checks};
    rerender();
    document.querySelector('input[data-ps-criterion="'+index+'"]')?.focus({preventScroll:true});
    announce('Problem-solving check '+(index+1)+(checks[index]?' selected.':' cleared.'));
    return;
  }
  if(ev.target.matches('input[data-reasoning-criterion]')&&state.route?.chapterId==='reasoning'){
    const session=reasoningSession(),current=reasoningEntry(session);
    if(!current||!current.response.model||current.response.rating)return;
    const index=Number(ev.target.dataset.reasoningCriterion);
    if(!Number.isInteger(index)||index<0||index>=current.task.criteria.length)return;
    const checks=[...current.response.checks];
    checks[index]=ev.target.checked;
    session.entries[current.task.id]={...current.response,checks};
    rerender();
    document.querySelector('input[data-reasoning-criterion="'+index+'"]')?.focus({preventScroll:true});
    announce((checks[index]?'Criterion selected: ':'Criterion cleared: ')+current.task.criteria[index].label);
    return;
  }
  if(ev.target.id==='fluency-count'){
    const count=Number(ev.target.value),session=fluencySession();
    if(!session||!PRACTICE_LENGTHS.includes(count))return;
    if(session.complete||!Object.values(session.answers).some(a=>
      a.tries||a.revealed||a.draft?.trim()||a.working?.trim())){
      fluencyNewSet(state.route,count);rerender();
      announce('Fluency practice set changed to '+count+' questions.');
      document.querySelector('#fluency-count')?.focus({preventScroll:true});
    }else{
      session.confirmFresh=true;session.pendingCount=count;rerender();
      announce('Confirm replacing your unfinished Fluency set with '+count+' questions.');
      document.querySelector('button[data-action="fluency-cancel-new"]')?.focus({preventScroll:true});
    }
    return;
  }
  if(ev.target.id==='review-filter'){
    const filter=ev.target.value;
    if(!['all','new','focus','due','flagged'].includes(filter))return;
    state.review.filter=filter;rerender();
    document.querySelector('#review-filter')?.focus({preventScroll:true});
    announce('Review filter changed to '+filter+'.');
    return;
  }
  const select=ev.target.closest('select[data-role]');
  if(!select)return;
  const route=state.route,topic=TOPICS[route.topicId];
  if(select.dataset.role==='chapter-select'){
    location.hash=select.value==='home'?routeHref(topic.id):chapterHref(topic,select.value);
  }else if(select.dataset.role==='section-select'){
    location.hash=routeHref(topic.id,route.chapterId,select.value);
  }
});
app.addEventListener('input',ev=>{
  const target=ev.target;
  if(target.id==='fluency-answer'&&state.route?.chapterId==='fluency'){
    const session=fluencySession(),current=fluencyAnswer(session);
    if(current&&!session.complete)
      session.answers[current.question.id]={...current.response,draft:target.value};
  }
  if(target.id==='cloze-answer'){state.cloze.value=target.value;state.cloze.checked=false;}
  if(target.id==='recall-answer'){state.recall.value=target.value;state.recall.checked=false;}
  if(target.id==='review-search'){
    state.review.query=target.value;
    const results=document.getElementById('review-results');
    if(results)results.innerHTML=renderReviewList(TOPICS[state.route.topicId],
      memoryFor(TOPICS[state.route.topicId]),state.review);
  }
  if(target.matches('input[data-graph]')){
    const route=state.route,topic=TOPICS[route.topicId];
    const page=pagesFor(topic,route.chapterId,route.sectionId).find(p=>p.id===route.pageId);
    if(updateGraphParameter(route,state.understand.graphs,page&&explorerFor(topic.id,page),
      target.dataset.graph,Number(target.value)))updateGraph();
  }
});
app.addEventListener('submit',ev=>{
  if(ev.target.id==='fluency-answer-form'){
    ev.preventDefault();
    const session=fluencySession(),current=fluencyAnswer(session);
    if(!current||session.complete||current.response.correct||current.response.revealed)return;
    const latex=current.response.mathMode?(document.querySelector('[data-math-source]')?.value||''):'';
    const converted=current.response.mathMode?latexToFluencyText(latex,current.question.answer):null;
    const draft=current.response.mathMode?(converted??latex):(document.querySelector('#fluency-answer')?.value||'');
    const verdict=converted===null&&current.response.mathMode?
      {correct:false,kind:'format',message:'Enter a supported numerical expression or use simple typing.'}:
      checkFluencyAnswer(draft,current.question);
    const attempts=(current.response.tries||0)+(verdict.kind==='format'?0:1);
    session.answers[current.question.id]={
      ...current.response,draft,mathLatex:latex||current.response.mathLatex||'',tries:attempts,
      correct:verdict.correct,revealed:false,
      feedback:verdict.correct?
        'Correct. Compare your method with the worked solution if you wish.':
        verdict.message+(verdict.kind==='format'?'':' Try again or use a hint.')
    };
    rerender();
    announce(verdict.correct?'Correct answer.':'Answer needs review. '+verdict.message);
    document.querySelector(verdict.correct?'button[data-action="fluency-next"]':'#fluency-answer')
      ?.focus({preventScroll:true});
    return;
  }
  if(ev.target.id==='recall-form'){
    ev.preventDefault();
    if(state.recall.checked||state.recall.complete)return;
    const topic=TOPICS[state.route.topicId];
    const card=topic.cards.find(c=>c.id===state.recall.ids[state.recall.index]);
    if(!card)return;
    const input=document.querySelector('#recall-answer')?.value||'';
    const others=topic.cards.filter(c=>c.id!==card.id)
      .flatMap(c=>[c.term,...(c.aliases||[])]);
    const verdict=assessTerm(input,card.term,card.aliases||[],others);
    saveMemory(topic,gradeCard(memoryFor(topic),topic,card.id,verdict.grade,'speed-recall',
      Date.now(),verdict.correct));
    Object.assign(state.recall,{value:input,checked:true,correct:verdict.correct,
      resultKind:verdict.kind,correctCount:state.recall.correctCount+(verdict.correct?1:0)});
    rerender();
    announce(verdict.correct?'Term recalled correctly.':'Review the term: '+card.term);
    document.querySelector('button[data-action="recall-next"]')?.focus({preventScroll:true});
    return;
  }
  if(ev.target.id==='worksheet-form'){
    ev.preventDefault();
    const data=new FormData(ev.target);
    const topic=TOPICS[state.route.topicId];
    const ws=worksheetState(topic);
    ws.options={
      topicId:topic.id,
      title:String(data.get('title')||'').trim(),
      style:String(data.get('style')),
      difficulty:String(data.get('difficulty')),
      count:Number(data.get('count')),
      seed:Number(data.get('seed')),
      solutions:String(data.get('solutions')),
      skills:data.getAll('skill').map(String)
    };
    try{
      ws.result=generateWorksheet(ws.options);
      ws.error='';
      announce(ws.result.questions.length+' questions generated with seed '+ws.options.seed);
    }catch(error){
      ws.result=null;
      ws.error=error instanceof Error?error.message:'Unable to generate this worksheet.';
      announce(ws.error);
    }
    rerender();
    document.querySelector(ws.error?'#worksheet-error':'#worksheet-preview')?.focus({preventScroll:false});
    return;
  }
  if(ev.target.id!=='cloze-form')return;
  ev.preventDefault();
  const topic=TOPICS[state.route.topicId];
  if(state.cloze.checked||state.cloze.complete)return;
  const item=topic.clozes.find(c=>c.id===state.cloze.ids[state.cloze.index]);
  if(!item)return;
  const input=document.querySelector('#cloze-answer')?.value||'';
  const others=topic.clozes.filter(c=>c.id!==item.id).map(c=>c.answer);
  const verdict=assessTerm(input,item.answer,item.aliases||[],others);
  const grade=!verdict.correct?'again':state.cloze.hint?'nearly':verdict.grade;
  saveMemory(topic,gradeCard(memoryFor(topic),topic,item.cardId,grade,'missing-words',
    Date.now(),verdict.correct));
  Object.assign(state.cloze,{value:input,checked:true,correct:verdict.correct,
    resultKind:verdict.kind,correctCount:state.cloze.correctCount+(verdict.correct?1:0)});
  rerender();
  announce(verdict.correct?'Correct missing words.':'Review the missing term: '+item.answer);
  document.querySelector('button[data-action="cloze-next"]')?.focus({preventScroll:true});
});

document.querySelector('#skip-page').addEventListener('click',()=>{
  document.querySelector('#page-title')?.focus({preventScroll:false});
});

topicSwitch.addEventListener('change',()=>{
  location.hash=topicSwitchHref(topicSwitch.value,state.route?.chapterId,state.route?.sectionId,state.route?.pageId);
});
function syncMotion(){
  document.body.classList.toggle('motion-off',state.motionOff);
  motionToggle.setAttribute('aria-pressed',String(state.motionOff));
  motionLabel.textContent=state.motionOff?'Motion: Off':'Motion: Auto';
}
motionToggle.addEventListener('click',()=>{
  state.motionOff=!state.motionOff;
  safeStorage.put('motion-off',String(state.motionOff));
  syncMotion();announce(state.motionOff?'Decorative motion disabled':'Decorative motion follows system preferences');
});
syncMotion();

const problems=validateTopics();
if(problems.length){
  app.innerHTML='<div class="noscript"><h1>Prototype content needs attention</h1><p>'+e(problems.join(' · '))+'</p></div>';
  console.error('Topic configuration errors',problems);
}else{
  window.addEventListener('hashchange',navigate);
  navigate();
}
