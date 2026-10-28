import {CHAPTER_LIBRARY,TOPICS} from './topics.js';
import {generateWorksheet,supportsWorksheets,worksheetSkills} from './worksheet-generator.js';
import {chaptersFor,sectionsFor,pagesFor,chapterFor,routeHref,resolveRoute,topicSwitchHref,escapeHTML as e,normaliseAnswer,cardForIndex,sampleMatchCards,validateTopics} from './logic.js';

const app=document.querySelector('#app');
const status=document.querySelector('#live-message');
const topicSwitch=document.querySelector('#topic-switcher');
const motionToggle=document.querySelector('#motion-toggle');
const motionLabel=document.querySelector('#motion-label');
const STORAGE='maths-notebook-pass1a:';
const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const safeStorage={
  get(key){try{return localStorage.getItem(STORAGE+key);}catch{return null;}},
  put(key,value){try{localStorage.setItem(STORAGE+key,value);}catch{/* private mode */}}
};
function getBookmarks(){
  try {const value=JSON.parse(safeStorage.get('bookmarks')||'[]');return new Set(Array.isArray(value)?value.filter(v=>typeof v==='string'&&v.startsWith('#/')):[]);}
  catch{return new Set();}
}
const state={
  route:null, motionOff:safeStorage.get('motion-off')==='true', bookmarks:getBookmarks(),
  lastPage:safeStorage.get('last-page'),
  flash:{index:0,flipped:false,ratings:{}},
  match:{term:null,definition:null,matched:[],message:''},
  cloze:{value:'',hint:false,checked:false,correct:false},
  recall:{index:0,value:'',checked:false,correct:false},
  graph:{magnitude:1,h:0,k:-2,sign:1},
  revealed:{},
  worksheets:{}
};
let lastTopic=null;

function announce(message){status.textContent='';status.textContent=message;}
function selected(value,expected){return value===expected?' selected':'';}
function chapterHref(topic,chapter){const section=sectionsFor(topic,chapter)[0];return routeHref(topic.id,chapter,section?.id);}
function pagePaper(route){
  if(route.chapterId==='home'||route.chapterId==='resources')return 'plain';
  if(['fluency','modelling','problemSolving'].includes(route.chapterId))return 'squared';
  if(route.chapterId==='understand'&&route.sectionId==='visual-explanations')return 'squared';
  if(['memorise','games'].includes(route.chapterId))return 'plain';
  return 'ruled';
}
function displayNumber(n){return Number.isInteger(n)?String(n):String(Number(n.toFixed(2)));}
function mathCurveLabel(){
  const {magnitude,h,k,sign}=state.graph;
  const a=magnitude*sign;
  const squared=h===0?'x²':'(x '+(h>0?'− '+h:'+ '+Math.abs(h))+')²';
  return 'y = '+(a===1?'':a===-1?'−':displayNumber(a))+squared+
    (k===0?'':(' '+(k>0?'+':'−')+' '+Math.abs(k)));
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
      '<span class="cover-mark">'+e(topic.subject.toUpperCase())+'</span>'+
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

function renderDots(){
  const dots=Array.from({length:40},(_,i)=>'<span class="dot'+([2,6,11,15,19,26,30,36].includes(i)?' dot--chosen':'')+'"></span>').join('');
  return '<div class="dot-field" aria-hidden="true">'+dots+'</div>';
}
function renderSmallGraph(){
  return '<svg class="mini-curve" viewBox="0 0 280 195" role="img" aria-label="An upward-opening parabola, with turning point (1, minus 3)">'+
    '<path d="M15 150H268M137 13V182" stroke="#7b998a" stroke-width="1.6"/>'+
    '<path d="M15 73H268M15 111H268M15 188H268M92 13V183M182 13V183" stroke="#cfdbd1" stroke-width="1"/>'+
    '<path d="M48 8Q138 310 236 8" stroke="#367664" stroke-width="3.5" fill="none" stroke-linecap="round"/>'+
    '<circle cx="142" cy="160" r="5" fill="#bb8a53"/>'+
    '<text x="151" y="178" font-family="Georgia" font-size="13" fill="#355c4c">(1, −3)</text></svg>';
}
function heading(title,description){
  return '<h1 class="page-title" id="page-title" tabindex="-1">'+e(title)+'</h1>'+
    '<p class="page-subtitle">'+e(description)+'</p>';
}
function renderLessonPage(page,topic){
  return '<div class="lesson-page">'+page.blocks.map(block=>{
    if(block.kind==='text')return '<p class="lesson-text">'+e(block.text)+'</p>';
    if(block.kind==='note')return '<aside class="callout"><p>'+e(block.text)+'</p></aside>';
    if(block.kind==='example')return '<div class="lesson-small"><p><strong>Example:</strong> '+
      e(block.prompt)+'</p><ol class="worked-steps">'+block.steps.map(step=>'<li>'+e(step)+'</li>').join('')+'</ol></div>';
    if(block.kind==='diagram'){
      const graphic=block.variant==='sampling-dots'?renderDots():renderSmallGraph();
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
function renderReviewAll(topic){
  return '<ol class="review-deck">'+topic.cards.map(card=>
    '<li><strong>'+e(card.term)+'</strong><p>'+e(card.definition)+'</p></li>').join('')+'</ol>';
}
function renderSpeedRecall(topic){
  const recall=state.recall,card=cardForIndex(topic,recall.index);
  return '<div class="recall-workspace">'+
    '<div class="flashcard-counter">Definition '+(recall.index+1)+' of '+topic.cards.length+'</div>'+
    '<p class="recall-definition">'+e(card.definition)+'</p>'+
    '<form id="recall-form" class="recall-form">'+
      '<label for="recall-answer">Mathematical term</label>'+
      '<input id="recall-answer" type="text" autocomplete="off" spellcheck="false" required value="'+e(recall.value)+'">'+
      '<button class="action-button" type="submit">Check answer</button></form>'+
    (recall.checked?'<p class="game-feedback" role="status" data-state="'+(recall.correct?'correct':'incorrect')+'">'+
      (recall.correct?'Correct.':('The term is '+e(card.term)+'.'))+'</p>':'')+
    '<button class="quiet-button recall-next" type="button" data-action="recall-next">'+
      'Next definition '+icon('arrow')+'</button></div>';
}
function renderFlashcards(topic){
  const f=state.flash,card=cardForIndex(topic,f.index),rating=f.ratings[card.id];
  return '<div class="memory-layout">'+
      '<section><div class="flashcard-counter"><span>Card '+(f.index+1)+' of '+topic.cards.length+'</span>'+
        (rating?'<span>Last rated: '+e(rating)+'</span>':'')+'</div>'+
      '<div class="flashcard-stage"><button class="flashcard'+(f.flipped?' is-flipped':'')+
        '" type="button" id="flashcard" data-action="flash-flip" '+
        'aria-label="'+(f.flipped?'Show front of '+e(card.term):'Reveal answer for '+e(card.term))+
        '" aria-pressed="'+f.flipped+'">'+
        '<span class="flashcard__inner">'+
          '<span class="flashcard__face flashcard__face--front" aria-hidden="'+f.flipped+'">'+
            '<span class="flashcard__main">'+e(card.term)+'</span>'+
          '</span>'+
          '<span class="flashcard__face flashcard__face--back" aria-hidden="'+!f.flipped+'">'+
            '<span class="flashcard__main">'+e(card.definition)+'</span>'+
          '</span>'+
        '</span></button></div>'+
      '<div class="flashcard-controls">'+
        '<button class="nav-button" type="button" data-action="flash-prev" aria-label="Previous card">'+icon('arrow-left')+' Previous</button>'+
        '<button class="nav-button" type="button" data-action="flash-next">Next '+icon('arrow')+'</button>'+
        '<button class="quiet-button" type="button" data-action="flash-restart">'+icon('refresh')+' Restart</button>'+
      '</div>'+
      '<div class="self-ratings" id="ratings" role="group" aria-label="Rate your recall"'+(f.flipped?'':' hidden')+'>'+
        '<small>Rate your recall:</small>'+
        ['Again','Nearly','Know'].map(value=>'<button type="button" class="rating" data-action="flash-rate" data-rating="'+value+'">'+value+'</button>').join('')+
      '</div></section>'+
    '<aside class="memory-sidebar" aria-label="Deck progress">'+
      '<div class="stat"><span>Cards in deck</span><strong>'+topic.cards.length+'</strong></div>'+
      '<div class="stat"><span>Cards rated</span><strong>'+Object.keys(f.ratings).length+'</strong></div>'+
    '</aside></div>'+
    '<details class="deck-browser"><summary>Browse all '+topic.cards.length+' cards</summary>'+
      '<ol>'+topic.cards.map(c=>'<li><strong>'+e(c.term)+'</strong><span>'+e(c.definition)+'</span></li>').join('')+'</ol></details>';
}
function renderMatch(topic){
  const game=state.match,items=sampleMatchCards(topic),defOrder=[...items].reverse();
  const complete=game.matched.length===items.length;
  const button=(card,side,label)=>'<button type="button" class="match-choice" data-action="match-choice" data-side="'+side+'" data-id="'+e(card.id)+'" '+
    'aria-pressed="'+(game[side]===card.id)+'" '+(game.matched.includes(card.id)?'disabled':'')+'>'+e(label)+'</button>';
  return '<div class="match-columns">'+
      '<section class="match-column" aria-label="Terms"><p class="match-column__label">Terms</p>'+
        items.map(card=>button(card,'term',card.term)).join('')+'</section>'+
      '<section class="match-column" aria-label="Definitions"><p class="match-column__label">Definitions</p>'+
        defOrder.map(card=>button(card,'definition',card.definition)).join('')+'</section>'+
    '</div>'+
    '<div class="game-feedback" id="match-feedback" role="status">'+
       e(complete?'All '+items.length+' pairs matched.':game.message||(game.matched.length+' of '+items.length+' pairs matched.'))+
    '</div><button type="button" class="quiet-button" data-action="match-reset">'+icon('refresh')+' Start again</button>';
}
function renderCloze(topic){
  const game=state.cloze,c=topic.cloze;
  return '<section class="cloze-area">'+
      '<form id="cloze-form"><p class="cloze-line">'+e(c.before)+
        '<label class="sr-only" for="cloze-answer">Missing mathematical word or phrase</label>'+
        '<input class="cloze-input" id="cloze-answer" name="answer" autocomplete="off" spellcheck="false" value="'+e(game.value)+'" aria-describedby="cloze-feedback">'+
        e(c.after)+'</p>'+
      '<div class="form-actions"><button class="action-button" type="submit">Check answer '+icon('check')+'</button>'+
      '<button class="quiet-button" type="button" data-action="cloze-hint" aria-expanded="'+game.hint+'">'+(game.hint?'Hide hint':'Give me a hint')+'</button></div></form>'+
      (game.hint?'<p class="reveal-answer">Hint: '+e(c.hint)+'</p>':'')+
      '<div id="cloze-feedback" class="game-feedback" role="status" data-state="'+(game.checked?(game.correct?'correct':'incorrect'):'')+'">'+
        (game.checked?(game.correct?'Correct.':'Check the term and try again.'):'')+'</div>'+
    '</section>';
}
function renderGraphSvg(){
  const {magnitude,h,k,sign}=state.graph, a=magnitude*sign;
  const X=x=>60+(x+5)*55,Y=y=>210-y*22;
  const gridX=Array.from({length:11},(_,i)=>i-5).map(x=>'<line x1="'+X(x)+'" y1="34" x2="'+X(x)+'" y2="386" stroke="#e4ece6" stroke-width="1"/>').join('');
  const gridY=Array.from({length:17},(_,i)=>i-8).map(y=>'<line x1="60" y1="'+Y(y)+'" x2="610" y2="'+Y(y)+'" stroke="#e4ece6" stroke-width="1"/>').join('');
  const labelsX=[-4,-2,0,2,4].map(x=>'<text x="'+X(x)+'" y="'+(Y(0)+19)+'" text-anchor="middle" font-size="13" fill="#667c6d">'+x+'</text>').join('');
  const labelsY=[-6,-3,3,6].map(y=>'<text x="'+(X(0)-10)+'" y="'+(Y(y)+4)+'" text-anchor="end" font-size="13" fill="#667c6d">'+y+'</text>').join('');
  const path=Array.from({length:221},(_,i)=>-5+i/22).map((x,i)=>{
    const y=a*(x-h)**2+k;
    return (i===0?'M':'L')+X(x).toFixed(1)+' '+Y(y).toFixed(1);
  }).join(' ');
  const vertexY=Y(k), vertexX=X(h);
  return '<svg id="graph-svg" class="graph-svg" viewBox="0 0 640 420" role="img" aria-label="'+
    e('Graph of '+mathCurveLabel()+'. Turning point ('+h+', '+k+').')+'">'+
    '<rect x="0" y="0" width="640" height="420" rx="7" fill="#fdfefd"/>'+
    '<defs><clipPath id="graph-clip"><rect x="60" y="34" width="550" height="352"/></clipPath></defs>'+
    gridX+gridY+
    '<line x1="'+X(0)+'" y1="34" x2="'+X(0)+'" y2="386" stroke="#647f71" stroke-width="1.9"/>'+
    '<line x1="60" y1="'+Y(0)+'" x2="610" y2="'+Y(0)+'" stroke="#647f71" stroke-width="1.9"/>'+
    labelsX+labelsY+
    '<text x="611" y="'+(Y(0)-10)+'" font-family="Georgia" font-size="16" fill="#355b48">x</text>'+
    '<text x="'+(X(0)+12)+'" y="28" font-family="Georgia" font-size="16" fill="#355b48">y</text>'+
    '<g clip-path="url(#graph-clip)"><path d="'+path+'" fill="none" stroke="#2d755f" stroke-width="4" stroke-linecap="round"/>'+
    '<line x1="'+vertexX+'" y1="34" x2="'+vertexX+'" y2="386" stroke="#c69b64" stroke-dasharray="5 6" stroke-width="1.5"/>'+
    '<circle cx="'+vertexX+'" cy="'+vertexY+'" r="5.7" fill="#d5a665" stroke="#fff" stroke-width="2"/></g>'+
    ''+
    '</svg>';
}
function renderGraphLab(page){
  const g=state.graph;
  return '<div class="math-lab">'+
      '<div class="graph-card">'+renderGraphSvg()+'</div>'+
      '<div class="graph-controls">'+
        '<div class="equation-card"><span>Function</span><strong id="equation-display">'+e(mathCurveLabel())+'</strong></div>'+
        '<label class="graph-control"><span class="graph-control__label"><span>Steepness |a|</span><output id="out-a">'+displayNumber(g.magnitude)+'</output></span>'+
          '<input type="range" data-graph="magnitude" min="0.5" max="2.5" step="0.5" value="'+g.magnitude+'"></label>'+
        '<label class="graph-control"><span class="graph-control__label"><span>Horizontal shift h</span><output id="out-h">'+g.h+'</output></span>'+
          '<input type="range" data-graph="h" min="-3" max="3" step="1" value="'+g.h+'"></label>'+
        '<label class="graph-control"><span class="graph-control__label"><span>Vertical shift k</span><output id="out-k">'+g.k+'</output></span>'+
          '<input type="range" data-graph="k" min="-5" max="4" step="1" value="'+g.k+'"></label>'+
        '<button class="quiet-button" type="button" data-action="graph-reflect">'+icon('refresh')+' Flip opening direction</button>'+
        '<div class="vertex-note" style="margin-top:17px">Turning point <strong id="vertex-display">('+g.h+', '+g.k+')</strong></div>'+
      '</div></div>'+
      '<div class="callout" aria-label="Question to consider"><p>'+e(page.focus)+'</p></div>';
}
function renderPageContent(route,topic){
  const {chapterId,sectionId,pageId}=route;
  if(chapterId==='home')return renderContents(topic);
  if(chapterId==='resources'&&sectionId==='worksheet-generator')return renderWorksheetGenerator(topic);
  const section=sectionsFor(topic,chapterId).find(s=>s.id===sectionId);
  const page=section?.pages.find(p=>p.id===pageId);
  if(!section||!page)return heading('Page unavailable','This page could not be opened.');
  const intro=heading(section.label,section.description);
  const renderers={
    lesson:()=>renderLessonPage(page,topic),
    questions:()=>renderQuestionPage(page,route),
    graph:()=>renderGraphLab(page),
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
  state.route=route;
  document.title=(section?section.label+(pages.length>1?' · Page '+(route.pageIndex+1):'')+' · ':
    route.chapterId==='home'?'Contents · ':'')+topic.title+' | The Maths Notebook';
}
function navigate(){
  const hadPreviousPage=Boolean(state.route);
  const next=resolveRoute(location.hash);
  if(location.hash!==next.canonical){history.replaceState(null,'',next.canonical);}
  if(next.topicId!==lastTopic){
    state.flash={index:0,flipped:false,ratings:{}};
    state.match={term:null,definition:null,matched:[],message:''};
    state.cloze={value:'',hint:false,checked:false,correct:false};
    state.recall={index:0,value:'',checked:false,correct:false};
    state.graph={magnitude:1,h:0,k:-2,sign:1};
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
  const f=state.flash,card=cardForIndex(TOPICS[state.route.topicId],f.index);
  cardEl.classList.toggle('is-flipped',f.flipped);
  cardEl.setAttribute('aria-pressed',String(f.flipped));
  cardEl.setAttribute('aria-label',f.flipped?'Show front of '+card.term:'Reveal answer for '+card.term);
  cardEl.querySelector('.flashcard__face--front').setAttribute('aria-hidden',String(f.flipped));
  cardEl.querySelector('.flashcard__face--back').setAttribute('aria-hidden',String(!f.flipped));
  document.querySelector('#ratings').hidden=!f.flipped;
}
function updateGraph(){
  const svg=document.querySelector('#graph-svg');
  if(!svg)return;
  svg.outerHTML=renderGraphSvg();
  document.querySelector('#equation-display').textContent=mathCurveLabel();
  document.querySelector('#vertex-display').textContent='('+state.graph.h+', '+state.graph.k+')';
  for(const [key,id] of [['magnitude','out-a'],['h','out-h'],['k','out-k']]){
    document.getElementById(id).textContent=displayNumber(state.graph[key]);
  }
}

app.addEventListener('click',ev=>{
  const button=ev.target.closest('button[data-action]');
  if(!button)return;
  const action=button.dataset.action,topic=TOPICS[state.route.topicId];
  if(action==='bookmark'){
    if(state.bookmarks.has(state.route.canonical))state.bookmarks.delete(state.route.canonical);
    else state.bookmarks.add(state.route.canonical);
    safeStorage.put('bookmarks',JSON.stringify([...state.bookmarks]));
    announce(state.bookmarks.has(state.route.canonical)?'Page bookmarked':'Bookmark removed');
    rerender();
    document.querySelector('button[data-action="bookmark"]')?.focus({preventScroll:true});
  }else if(action==='flash-flip'){
    state.flash.flipped=!state.flash.flipped;updateFlashFlip();
    announce(state.flash.flipped?'Answer revealed. Rate your recall.':'Question shown.');
  }else if(action==='flash-next'||action==='flash-prev'){
    const increment=action==='flash-next'?1:-1;
    state.flash.index=(state.flash.index+increment+topic.cards.length)%topic.cards.length;
    state.flash.flipped=false;rerender();
    document.querySelector('button[data-action="'+action+'"]')?.focus({preventScroll:true});
  }else if(action==='flash-restart'){
    state.flash={index:0,flipped:false,ratings:{}};rerender();announce('Deck restarted');
    document.querySelector('button[data-action="flash-restart"]')?.focus({preventScroll:true});
  }else if(action==='flash-rate'){
    if(!state.flash.flipped)return;
    const card=cardForIndex(topic,state.flash.index);
    state.flash.ratings[card.id]=button.dataset.rating;
    state.flash.index=(state.flash.index+1)%topic.cards.length;
    state.flash.flipped=false;rerender();announce('Rated '+card.term+' '+button.dataset.rating+'. Next card.');
    document.querySelector('#flashcard')?.focus({preventScroll:true});
  }else if(action==='match-choice'){
    const side=button.dataset.side,id=button.dataset.id,m=state.match;
    if(m.matched.includes(id))return;
    m[side]=m[side]===id?null:id;
    if(m.term&&m.definition){
      if(m.term===m.definition){m.matched.push(m.term);m.message='Correct pair connected.';announce(m.message);}
      else {m.message='Not quite. Compare the defining details and try again.';announce(m.message);}
      m.term=null;m.definition=null;
    }else m.message=side==='term'?'Term selected. Now choose its definition.':'Definition selected. Now choose its term.';
    rerender();
    const matching=document.querySelector('.match-choice[data-side="'+side+'"][data-id="'+id+'"]');
    (matching&&!matching.disabled?matching:document.querySelector('.match-choice:not(:disabled)'))?.focus({preventScroll:true});
  }else if(action==='match-reset'){
    state.match={term:null,definition:null,matched:[],message:''};rerender();announce('Matching game restarted');
    document.querySelector('button[data-action="match-reset"]')?.focus({preventScroll:true});
  }else if(action==='cloze-hint'){
    const input=document.querySelector('#cloze-answer');state.cloze.value=input?.value||state.cloze.value;
    state.cloze.hint=!state.cloze.hint;rerender();
    document.querySelector('#cloze-answer')?.focus({preventScroll:true});
  }else if(action==='graph-reflect'){
    state.graph.sign*=-1;updateGraph();announce('Parabola opening reversed: '+mathCurveLabel());
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
  }else if(action==='recall-next'){
    state.recall={
      index:(state.recall.index+1)%topic.cards.length,
      value:'',checked:false,correct:false
    };
    rerender();
    document.querySelector('#recall-answer')?.focus({preventScroll:true});
  }else if(action==='reveal'){
    const key=button.dataset.key;
    state.revealed[key]=!state.revealed[key];
    rerender();
    document.querySelector('button[data-key="'+key+'"]')?.focus({preventScroll:true});
  }
});
app.addEventListener('change',ev=>{
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
  if(target.id==='cloze-answer'){state.cloze.value=target.value;state.cloze.checked=false;}
  if(target.id==='recall-answer'){state.recall.value=target.value;state.recall.checked=false;}
  if(target.matches('input[data-graph]')){
    const key=target.dataset.graph;
    if(['magnitude','h','k'].includes(key)){state.graph[key]=Number(target.value);updateGraph();}
  }
});
app.addEventListener('submit',ev=>{
  if(ev.target.id==='recall-form'){
    ev.preventDefault();
    const card=cardForIndex(TOPICS[state.route.topicId],state.recall.index);
    state.recall.value=document.querySelector('#recall-answer').value;
    state.recall.checked=true;
    state.recall.correct=normaliseAnswer(state.recall.value)===normaliseAnswer(card.term);
    rerender();
    announce(state.recall.correct?'Correct recall':'Answer revealed: '+card.term);
    document.querySelector('#recall-answer')?.focus({preventScroll:true});
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
  state.cloze.value=document.querySelector('#cloze-answer').value;
  state.cloze.checked=true;
  state.cloze.correct=normaliseAnswer(state.cloze.value)===normaliseAnswer(TOPICS[state.route.topicId].cloze.answer);
  rerender();announce(state.cloze.correct?'Correct missing words':'Not yet; try again');
  document.querySelector('#cloze-answer')?.focus({preventScroll:true});
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
