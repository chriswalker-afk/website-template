import {CHAPTER_LIBRARY,TOPICS} from './topics.js';
import {chaptersFor,sectionsFor,chapterFor,routeHref,resolveRoute,topicSwitchHref,escapeHTML as e,normaliseAnswer,cardForIndex,sampleMatchCards,validateTopics} from './logic.js';

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
  graph:{magnitude:1,h:0,k:-2,sign:1},
  revealed:{}
};
let lastTopic=null;

function announce(message){status.textContent='';status.textContent=message;}
function selected(value,expected){return value===expected?' selected':'';}
function chapterHref(topic,chapter){const section=sectionsFor(topic,chapter)[0];return routeHref(topic.id,chapter,section?.id);}
function pagePaper(route){
  if(route.chapterId==='home')return 'plain';
  if(['fluency','modelling','problemSolving'].includes(route.chapterId))return 'squared';
  if(['memorise','games'].includes(route.chapterId))return 'plain';
  return 'ruled';
}
function displayNumber(n){return Number.isInteger(n)?String(n):String(Number(n.toFixed(2)));}
function mathCurveLabel(){
  const {magnitude,h,k,sign}=state.graph;
  const a=magnitude*sign, hTerm=h===0?'x':('x '+(h>0?'− '+h:'+ '+Math.abs(h)));
  return 'y = '+(a===1?'':a===-1?'−':displayNumber(a))+'('+hTerm+')²'+(k===0?'':(' '+(k>0?'+':'−')+' '+Math.abs(k)));
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
      icon('arrow')+
    '</a></li>').join('');
  const saved=[...state.bookmarks].map(href=>{
    const r=resolveRoute(href);
    if(r.canonical!==href||r.topicId!==topic.id||r.chapterId==='home')return '';
    const section=sectionsFor(topic,r.chapterId).find(s=>s.id===r.sectionId);
    return '<a href="'+href+'">'+e(chapterFor(r.chapterId)?.label||'Section')+' · '+e(section?.label||'Page')+'</a>';
  }).filter(Boolean).slice(0,4).join('');
  const last=state.lastPage?resolveRoute(state.lastPage):null;
  const continuation=last?.topicId===topic.id&&last.chapterId!=='home'
    ?'<a class="action-button" href="'+last.canonical+'">Continue reading '+icon('arrow')+'</a>':'';
  return '<div class="contents-layout">'+
    '<section class="contents-cover" aria-label="Book cover for '+e(topic.title)+'">'+
      '<span class="cover-mark">THE MATHEMATICS COLLECTION / '+e(topic.mark)+'</span>'+
      '<p class="cover-title">'+e(topic.coverTitle)+'</p><span class="cover-rule"></span>'+
      renderCoverArt()+
      '<span class="cover-bottom"><span>INTERACTIVE FIELD NOTES</span><span>VOL. '+e(topic.mark)+'</span></span>'+
    '</section>'+
    '<section class="contents-right">'+
      '<div class="contents-heading"><p class="page-eyebrow">WELCOME TO YOUR NOTEBOOK</p>'+
        '<h1 id="page-title" tabindex="-1">Contents</h1>'+
        '<p>'+e(topic.strapline)+'</p></div>'+
      '<ol class="contents-list">'+chapterEntries+'</ol>'+
      '<div class="contents-extras">'+
        '<aside class="contents-sticky">“'+e(topic.bookNote)+'”</aside>'+
        '<div class="saved-markers"><strong>'+icon('bookmark')+' Your bookmarks</strong>'+
          (saved||'<span>Bookmark a page to keep it here.</span>')+'</div>'+
      '</div>'+ (continuation?'<div style="margin-top:19px">'+continuation+'</div>':'')+
    '</section></div>';
}
function renderDots(){
  const dots=Array.from({length:40},(_,i)=>'<span class="dot'+([2,6,11,15,19,26,30,36].includes(i)?' dot--chosen':'')+'"></span>').join('');
  return '<div class="dot-field" aria-hidden="true">'+dots+'</div><p class="figure-caption">Illustration: 8 selected from a population of 40</p>';
}
function renderSmallGraph(){
  return '<svg class="mini-curve" viewBox="0 0 280 195" role="img" aria-label="An upward-opening parabola, with turning point (1, minus 3)">'+
    '<path d="M15 150H268M137 13V182" stroke="#7b998a" stroke-width="1.6"/>'+
    '<path d="M15 73H268M15 111H268M15 188H268M92 13V183M182 13V183" stroke="#cfdbd1" stroke-width="1"/>'+
    '<path d="M48 8Q138 310 236 8" stroke="#367664" stroke-width="3.5" fill="none" stroke-linecap="round"/>'+
    '<circle cx="142" cy="160" r="5" fill="#bb8a53"/>'+
    '<text x="151" y="178" font-family="Georgia" font-size="13" fill="#355c4c">(1, −3)</text></svg>';
}
function heading(label,title,subtitle){
  return '<p class="page-eyebrow">'+e(label)+'</p><h1 class="page-title" id="page-title" tabindex="-1">'+e(title)+'</h1><p class="page-subtitle">'+e(subtitle)+'</p>';
}
function renderIntro(topic){
  const d=topic.intro;
  return heading(d.eyebrow,d.title,'A gentle introduction before you begin experimenting.')+
    '<div class="chapter-intro"><div class="lesson-copy"><p>'+e(d.body)+'</p>'+
      '<div class="callout"><span class="callout__label">'+e(d.kicker)+'</span><p>'+e(d.question)+'</p></div></div>'+
      '<figure class="math-figure"><figcaption class="math-figure__title">'+(topic.id==='sampling'?'THE WHOLE POPULATION':'THE SHAPE OF A CURVE')+'</figcaption>'+
      (topic.id==='sampling'?renderDots():renderSmallGraph())+'</figure></div>'+
      '<section class="lesson-small"><h2>'+e(d.exampleTitle)+'</h2><p>'+e(d.example)+'</p></section>'+
      '<div class="prototype-notice">This introduction demonstrates the reading-page layout. Full topic explanations and interactive discovery modules belong to Pass 3.</div>';
}
function renderDetail(topic,section){
  const detail=topic.details?.[section];
  if(!detail)return heading('PAGE PREVIEW','Page not authored','This section is not part of the Pass 1A demonstration.');
  let html=heading('A PAGE TO THINK ON',detail.title,detail.intro);
  if(detail.panels){
    html+='<div class="topic-panels">'+detail.panels.map(panel=>'<article class="topic-panel"><h2>'+e(panel.label)+'</h2><p>'+e(panel.text)+'</p></article>').join('')+'</div>';
  }
  if(detail.question){
    const key=topic.id+':'+section,shown=Boolean(state.revealed[key]);
    html+='<section class="hint-reveal" style="margin-top:30px"><h2>Try it yourself</h2><p>'+e(detail.question)+'</p>'+
      '<button class="quiet-button" type="button" data-action="reveal" data-key="'+e(key)+'" aria-expanded="'+shown+'">'+(shown?'Hide worked idea':'Show a worked idea')+'</button>'+
      (shown?'<div class="reveal-answer">'+e(detail.answer)+'</div>':'')+
    '</section>';
  }
  return html;
}
function renderFlashcards(topic){
  const f=state.flash,card=cardForIndex(topic,f.index);
  const rating=f.ratings[card.id];
  return heading('MEMORISE / INDEX CARDS','Make it stick.','Flip a card, recall the answer, then rate how confidently you knew it.')+
    '<div class="memory-layout">'+
      '<section><div class="flashcard-counter"><span>INDEX CARD '+String(f.index+1).padStart(2,'0')+' / '+String(topic.cards.length).padStart(2,'0')+'</span><span>'+(rating?'Last rating: '+e(rating):'Think before you flip')+'</span></div>'+
      '<div class="flashcard-stage"><button class="flashcard'+(f.flipped?' is-flipped':'')+'" type="button" id="flashcard" data-action="flash-flip" '+
        'aria-label="'+(f.flipped?'Show front of '+e(card.term):'Reveal answer for '+e(card.term))+'" aria-pressed="'+f.flipped+'">'+
        '<span class="flashcard__inner">'+
          '<span class="flashcard__face flashcard__face--front" aria-hidden="'+f.flipped+'">'+
            '<span class="flashcard__eyebrow">FRONT / RETRIEVE</span><span class="flashcard__main">'+e(card.term)+'</span>'+
            '<span class="flashcard__bottom">SELECT THE CARD TO REVEAL</span>'+
          '</span>'+
          '<span class="flashcard__face flashcard__face--back" aria-hidden="'+!f.flipped+'">'+
            '<span class="flashcard__eyebrow">BACK / CHECK</span><span class="flashcard__main">'+e(card.definition)+'</span>'+
            '<span class="flashcard__bottom">HOW WELL DID YOU REMEMBER?</span>'+
          '</span>'+
        '</span>'+
      '</button></div>'+
      '<div class="flashcard-controls">'+
        '<button class="nav-button" type="button" data-action="flash-prev" aria-label="Previous card">'+icon('arrow-left')+' Previous</button>'+
        '<button class="nav-button" type="button" data-action="flash-next">Next '+icon('arrow')+'</button>'+
        '<button class="quiet-button" type="button" data-action="flash-restart">'+icon('refresh')+' Restart</button>'+
      '</div>'+
      '<div class="self-ratings" id="ratings"'+(f.flipped?'':' hidden')+'><small>How did you do?</small>'+
        ['Again','Nearly','Know'].map(value=>'<button type="button" class="rating" data-action="flash-rate" data-rating="'+value+'">'+value+'</button>').join('')+'</div>'+
    '</section>'+
    '<aside class="memory-sidebar"><p class="preview-label">'+icon('layers')+' THE CARD BOX</p><h2>A little, often.</h2>'+
      '<p>Say the answer aloud before turning the card. Cards rated “Again” or “Nearly” can be revisited in the full Memorise engine.</p>'+
      '<div class="stat"><span>Cards in this deck</span><strong>'+topic.cards.length+'</strong></div>'+
      '<div class="stat"><span>Rated in this preview</span><strong>'+Object.keys(f.ratings).length+'</strong></div>'+
    '</aside></div>'+
    '<details class="deck-browser"><summary>Browse all '+topic.cards.length+' cards and definitions</summary>'+
      '<ol>'+topic.cards.map(c=>'<li><strong>'+e(c.term)+'</strong><span>'+e(c.definition)+'</span></li>').join('')+'</ol></details>';
}
function renderMatch(topic){
  const game=state.match,items=sampleMatchCards(topic),defOrder=[...items].reverse();
  const complete=game.matched.length===items.length;
  const button=(card,side,label)=>'<button type="button" class="match-choice" data-action="match-choice" data-side="'+side+'" data-id="'+e(card.id)+'" '+
    'aria-pressed="'+(game[side]===card.id)+'" '+(game.matched.includes(card.id)?'disabled':'')+'>'+e(label)+'</button>';
  return heading('MEMORISE / LANGUAGE GAMES','Match the meaning.','Choose a mathematical term, then find the definition that belongs to it.')+
    '<div class="match-columns">'+
      '<div class="match-column"><h2>01 / Terms</h2>'+items.map(card=>button(card,'term',card.term)).join('')+'</div>'+
      '<div class="match-column"><h2>02 / Definitions</h2>'+defOrder.map(card=>button(card,'definition',card.definition)).join('')+'</div>'+
    '</div>'+
    '<div class="game-feedback" id="match-feedback" role="status">'+
       e(complete?'All three pairs found. Excellent retrieval!':game.message||(game.matched.length+' of '+items.length+' pairs connected.'))+
    '</div><button type="button" class="quiet-button" data-action="match-reset">'+icon('refresh')+' Start again</button>'+
    '<div class="prototype-notice">Working interaction preview: this demonstrates the language-game page, not the final content bank or progression system.</div>';
}
function renderCloze(topic){
  const game=state.cloze,c=topic.cloze;
  return heading('MEMORISE / LANGUAGE GAMES','Find the missing words.','Retrieve the exact term from a sentence rather than picking from a list.')+
    '<section class="cloze-area"><p class="preview-label">'+icon('pen')+' A SMALL RETRIEVAL CHALLENGE</p>'+
      '<form id="cloze-form"><p class="cloze-line">'+e(c.before)+
        '<label class="sr-only" for="cloze-answer">Missing mathematical word or phrase</label>'+
        '<input class="cloze-input" id="cloze-answer" name="answer" autocomplete="off" spellcheck="false" value="'+e(game.value)+'" aria-describedby="cloze-feedback">'+
        e(c.after)+'</p>'+
      '<div class="form-actions"><button class="action-button" type="submit">Check answer '+icon('check')+'</button>'+
      '<button class="quiet-button" type="button" data-action="cloze-hint" aria-expanded="'+game.hint+'">'+(game.hint?'Hide hint':'Give me a hint')+'</button></div></form>'+
      (game.hint?'<p class="reveal-answer">Hint: '+e(c.hint)+'</p>':'')+
      '<div id="cloze-feedback" class="game-feedback" role="status" data-state="'+(game.checked?(game.correct?'correct':'incorrect'):'')+'">'+
        (game.checked?(game.correct?'Correct — the precise term matters.':'Not yet. Look for the specific mathematical term and try again.'):'Type your answer and select Check answer.')+
      '</div></section>';
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
    '<text x="605" y="407" font-size="11" text-anchor="end" fill="#71877a">LIVE GRAPH · COMPLETED-SQUARE FORM</text>'+
    '</svg>';
}
function renderGraphLab(topic,section){
  const isModel=section==='model-lab';
  const subtitle=isModel
    ?'Imagine a curved arch or a fountain jet. Change the parameters to explore how one mathematical model might describe its shape.'
    :'Move the controls and watch the parabola change, one property at a time.';
  const g=state.graph;
  return heading(isModel?'MODELLING / THE CURVE':'FLUENCY / GRAPH EXPLORER',isModel?'Shape a real-world curve.':'Turn the page into a graph.',subtitle)+
    '<div class="math-lab">'+
      '<div class="graph-card"><div class="graph-topline"><h2>Graph paper</h2><span>INTERACTIVE STUDY</span></div>'+
      renderGraphSvg()+'</div>'+
      '<div class="graph-controls"><h2>The controls</h2><p>Adjust the parameters and look for what stays the same. The dotted line is the axis of symmetry.</p>'+
        '<div class="equation-card"><span>YOUR FUNCTION</span><strong id="equation-display">'+e(mathCurveLabel())+'</strong></div>'+
        '<label class="graph-control"><span class="graph-control__label"><span>Steepness |a|</span><output id="out-a">'+displayNumber(g.magnitude)+'</output></span>'+
          '<input type="range" data-graph="magnitude" min="0.5" max="2.5" step="0.5" value="'+g.magnitude+'"></label>'+
        '<label class="graph-control"><span class="graph-control__label"><span>Horizontal shift h</span><output id="out-h">'+g.h+'</output></span>'+
          '<input type="range" data-graph="h" min="-3" max="3" step="1" value="'+g.h+'"></label>'+
        '<label class="graph-control"><span class="graph-control__label"><span>Vertical shift k</span><output id="out-k">'+g.k+'</output></span>'+
          '<input type="range" data-graph="k" min="-5" max="4" step="1" value="'+g.k+'"></label>'+
        '<button class="quiet-button" type="button" data-action="graph-reflect">'+icon('refresh')+' Flip opening direction</button>'+
        '<div class="vertex-note" style="margin-top:17px">Turning point <strong id="vertex-display">('+g.h+', '+g.k+')</strong></div>'+
      '</div></div>'+
      '<div class="callout"><span class="callout__label">NOTICE & EXPLAIN</span><p>'+(isModel?'Which assumptions would you need before using this curve to represent a real arch?':'What happens to the turning point when only the value of a changes?')+'</p></div>';
}
function renderGames(topic){
  const games=[
    {icon:'clock',title:'Sprint',detail:'A short round of mixed questions, with a calm untimed alternative.'},
    {icon:'puzzle',title:'Puzzle Quest',detail:'A sequence of clues and challenges that open the next part of the book.'},
    {icon:'grid',title:topic.id==='quadratics'?'Curve Quest':'Sort & Discover',detail:topic.id==='quadratics'?'Playful graph transformations and curve discoveries.':'A visual challenge built around choosing and evaluating methods.'}
  ];
  return heading('GAMES / THE CHALLENGE SHELF','Play with purpose.','A distinct place for longer games and mixed-topic challenges, not just quick vocabulary retrieval.')+
    '<div class="games-shelf">'+games.map((game,i)=>'<article class="shelf-game">'+icon(game.icon)+'<h2>'+e(game.title)+'</h2><p>'+e(game.detail)+'</p><span class="shelf-game__status">'+String(i+1).padStart(2,'0')+' · PASS 4 GAME MODULE</span></article>').join('')+'</div>'+
    '<div class="prototype-notice"><strong>Design prototype only:</strong> these are deliberately non-interactive previews. Gameplay, awards and challenge progression are scheduled for Pass 4.</div>';
}
function renderPageContent(route,topic){
  const {chapterId,sectionId}=route;
  if(chapterId==='home')return renderContents(topic);
  if(chapterId==='understand'&&sectionId==='big-idea')return renderIntro(topic);
  if(chapterId==='memorise'&&sectionId==='flashcards')return renderFlashcards(topic);
  if(chapterId==='memorise'&&sectionId==='match-up')return renderMatch(topic);
  if(chapterId==='memorise'&&sectionId==='missing-words')return renderCloze(topic);
  if((chapterId==='fluency'&&sectionId==='graph-lab')||(chapterId==='modelling'&&sectionId==='model-lab'))return renderGraphLab(topic,sectionId);
  if(chapterId==='games')return renderGames(topic);
  return renderDetail(topic,sectionId);
}
function renderTabNav(topic,route){
  return '<nav class="chapter-tabs" aria-label="Book chapters">'+chaptersFor(topic).map(chapter=>
    '<a class="chapter-tab" style="--chapter-color:'+chapter.color+'" href="'+chapterHref(topic,chapter.id)+'"'+
    (route.chapterId===chapter.id?' aria-current="page"':'')+'>'+icon(chapter.icon)+e(chapter.short)+'</a>'
  ).join('')+'</nav>';
}
function renderSideTabs(topic,route){
  if(route.chapterId==='home')return '';
  const chapter=chapterFor(route.chapterId),sections=sectionsFor(topic,route.chapterId);
  return '<nav class="side-tabs" aria-label="'+e(chapter.label)+' subsections">'+
    '<div class="side-tabs__eyebrow">PAGE INDEX</div>'+
    sections.map((section,index)=>'<a class="side-tab" href="'+routeHref(topic.id,route.chapterId,section.id)+'" '+
      'style="--side-color:'+chapter.color+'"'+(route.sectionId===section.id?' aria-current="page"':'')+'>'+
      '<span class="index-number" aria-hidden="true">'+(index+1)+'</span><span>'+e(section.label)+'</span></a>').join('')+
    '<p class="side-tabs__note">Find a page. Follow a thought.</p></nav>';
}
function renderMobileNavigation(topic,route){
  const currentSection=sectionsFor(topic,route.chapterId);
  return '<div class="mobile-navigation">'+
    '<div class="mobile-pick"><label for="mobile-chapter">Chapter</label><select id="mobile-chapter" data-role="chapter-select">'+
    '<option value="home"'+selected(route.chapterId,'home')+'>Contents</option>'+
    chaptersFor(topic).map(chapter=>'<option value="'+chapter.id+'"'+selected(route.chapterId,chapter.id)+'>'+e(chapter.label)+'</option>').join('')+
    '</select></div>'+
    '<div class="mobile-pick'+(route.chapterId==='home'?' mobile-pick--disabled':'')+'"><label for="mobile-section">Page index</label>'+
    '<select id="mobile-section" data-role="section-select"'+(route.chapterId==='home'?' disabled':'')+'>'+
      (route.chapterId==='home'?'<option>Choose a chapter</option>':currentSection.map(section=>
        '<option value="'+section.id+'"'+selected(route.sectionId,section.id)+'>'+e(section.label)+'</option>').join(''))+
    '</select></div></div>';
}
function renderBook(route,{animate=true}={}){
  const topic=TOPICS[route.topicId],chap=chapterFor(route.chapterId);
  const section=sectionsFor(topic,route.chapterId).find(s=>s.id===route.sectionId);
  const bookmarkCurrent=state.bookmarks.has(route.canonical);
  const previous=state.route;
  const motionClass=animate&&previous
    ? (previous.chapterId!==route.chapterId||previous.topicId!==route.topicId?'page-enter--turn':previous.sectionId!==route.sectionId?'page-enter--slide':'')
    : '';
  const crumbs='<a href="'+routeHref(topic.id)+'">Contents</a>'+
    (chap?'<span class="crumb-separator">/</span><span>'+e(chap.label)+'</span>':'')+
    (section?'<span class="crumb-separator">/</span><span>'+e(section.label)+'</span>':'');
  app.innerHTML='<div class="book-wrap">'+
    '<div class="book-kicker"><span>THE MATHS NOTEBOOK <span class="mobile-book-label">/ '+e(topic.title)+'</span></span><span>'+e(topic.subject)+' · VOL. '+e(topic.mark)+'</span></div>'+
    renderMobileNavigation(topic,route)+
    '<div class="book">'+
      renderTabNav(topic,route)+
      '<div class="book-paper"><main class="book-page '+motionClass+'" data-paper="'+pagePaper(route)+'" id="book-page">'+
        '<div class="paper-head"><div class="crumbs">'+crumbs+'</div>'+
          '<div class="page-tools">'+(route.chapterId!=='home'
            ?'<button type="button" class="bookmark-button" data-action="bookmark" aria-pressed="'+bookmarkCurrent+'" aria-label="'+
              (bookmarkCurrent?'Remove bookmark':'Bookmark this page')+'">'+icon('bookmark')+'<span>'+(bookmarkCurrent?'Saved':'Bookmark')+'</span></button>'
            :'')+'</div></div>'+
        '<div class="page-body">'+renderPageContent(route,topic)+'</div>'+
        '<footer class="page-foot"><span>THE MATHS NOTEBOOK · '+e(topic.title)+'</span><span class="page-number">'+
          (route.chapterId==='home'?'Contents':e(chap.label)+' / '+(sectionsFor(topic,route.chapterId).findIndex(s=>s.id===route.sectionId)+1))+
        '</span></footer>'+
      '</main></div>'+renderSideTabs(topic,route)+'</div></div>';
  topicSwitch.value=topic.id;
  state.route=route;
  document.title=(section?section.label+' · ':route.chapterId==='home'?'Contents · ':'')+topic.title+' | The Maths Notebook';
}
function navigate(){
  const hadPreviousPage=Boolean(state.route);
  const next=resolveRoute(location.hash);
  if(location.hash!==next.canonical){history.replaceState(null,'',next.canonical);}
  if(next.topicId!==lastTopic){
    state.flash={index:0,flipped:false,ratings:{}};
    state.match={term:null,definition:null,matched:[],message:''};
    state.cloze={value:'',hint:false,checked:false,correct:false};
    state.graph={magnitude:1,h:0,k:-2,sign:1};
    state.revealed={};
    lastTopic=next.topicId;
  }
  renderBook(next,{animate:true});
  if(next.chapterId!=='home'){
    state.lastPage=next.canonical;
    safeStorage.put('last-page',next.canonical);
  }
  const label=next.chapterId==='home'?'Contents':(chapterFor(next.chapterId)?.label+' — '+sectionsFor(TOPICS[next.topicId],next.chapterId).find(s=>s.id===next.sectionId)?.label);
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
  if(target.matches('input[data-graph]')){
    const key=target.dataset.graph;
    if(['magnitude','h','k'].includes(key)){state.graph[key]=Number(target.value);updateGraph();}
  }
});
app.addEventListener('submit',ev=>{
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
  location.hash=topicSwitchHref(topicSwitch.value,state.route?.chapterId,state.route?.sectionId);
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
