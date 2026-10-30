// Reusable mathematics working notebook. Student content remains on this device.
import {escapeHTML as e} from './logic.js';
import {loadMathLive,MATH_SYMBOLS} from './math-input.js';
import {DRAW_WIDTH,DRAW_HEIGHT,MAX_NOTEBOOK_PAGES,MAX_NOTEBOOK_BLOCKS,
  hasWorkingContent,
  blankWorkingNotebook,workingStorageKey,hydrateWorkingNotebook,
  editWorkingNotebook,findInkStroke,inkSVG,inkStrokePath,exportWorkingHTML}
  from './working-notebook-model.js';

const openScopes=new Set();
const closedScopes=new Set();
const controllers=new Map();
const item=(value,label,selected)=>'<option value="'+value+'"'+
  (value===selected?' selected':'')+'>'+label+'</option>';
const actionButton=(name,label,disabled=false)=>'<button type="button" data-book-action="'+name+
  '"'+(disabled?' disabled':'')+'>'+label+'</button>';

export function workingNotebookMarkup({scope,label='Working notebook',guidance='',initialOpen=false}={}){
  workingStorageKey(scope);
  return '<details class="working-notebook" data-working-notebook data-scope="'+e(scope)+
    '" data-label="'+e(label)+'"'+(openScopes.has(scope)||(initialOpen&&!closedScopes.has(scope))?' open':'')+'>'+
    '<summary><span class="working-notebook__summary-title">Working notebook</span>'+
      '<span class="working-notebook__summary-note">Type maths, draw, or combine both · saved on this device</span>'+
    '</summary>'+(guidance?'<p class="working-notebook__guidance">'+e(guidance)+'</p>':'')+
    '<div class="working-notebook__mount"></div></details>';
}
function storeFor(scope){
  if(controllers.has(scope))return controllers.get(scope);
  let raw=null;
  try{raw=localStorage.getItem(workingStorageKey(scope));}catch{/* unavailable */}
  const entry={book:hydrateWorkingNotebook(raw),undo:[],redo:[],
    editing:null,pen:'pen',color:'#285c7c',width:2.8,
    saveOk:true,confirmClear:false,expanded:false,activeMathId:null};
  controllers.set(scope,entry);
  return entry;
}
export function hasSavedWorking(scope){
  return hasWorkingContent(storeFor(scope).book);
}
function save(scope,entry){
  try{
    const serialized=JSON.stringify(entry.book);
    localStorage.setItem(workingStorageKey(scope),serialized);
    entry.saveOk=true;
  }catch{entry.saveOk=false;}
}
function downloadText(content,filename,mime){
  const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function renderBlock(block,index,length){
  const isMath=block.kind==='math';
  const label=(isMath?'Maths line':'Explanation')+' '+(index+1);
  return '<div class="working-book__block" data-book-block="'+e(block.id)+'">'+
    '<div class="working-book__block-head"><strong>'+label+'</strong>'+
      '<div class="working-book__block-actions">'+
        '<button type="button" data-book-move="-1" data-book-id="'+e(block.id)+
          '" aria-label="Move '+label+' up"'+(index===0?' disabled':'')+'>↑</button>'+
        '<button type="button" data-book-move="1" data-book-id="'+e(block.id)+
          '" aria-label="Move '+label+' down"'+(index===length-1?' disabled':'')+'>↓</button>'+
        '<button type="button" data-book-remove="'+e(block.id)+'" aria-label="Remove '+label+'">Remove</button>'+
      '</div></div>'+
    (isMath?
      '<div class="working-book__math-wrap">'+
        '<textarea data-book-value="'+e(block.id)+'" data-book-kind="math" rows="2"'+
          ' aria-label="'+label+' in LaTeX" maxlength="1200" spellcheck="false" '+
          'placeholder="e.g. \\frac{1}{2}x^2">'+e(block.value)+'</textarea>'+
      '</div>':
      '<textarea data-book-value="'+e(block.id)+'" data-book-kind="text" rows="3"'+
        ' aria-label="'+label+'" maxlength="5000" placeholder="Explain your method or decisions">'+
        e(block.value)+'</textarea>')+
    '</div>';
}
function paperName(paper){return {squared:'Grid',ruled:'Lined',plain:'Plain'}[paper];}
function renderWorkspace(host,scope,entry){
  const book=entry.book,page=book.pages[book.page];
  const typeVisible=book.mode!=='draw',drawVisible=book.mode!=='type';
  const modes=[['type','Type'],['draw','Draw'],['both','Both']].map(([id,label])=>
    '<button type="button" data-book-mode="'+id+'" aria-pressed="'+(id===book.mode)+
      '" class="'+(id===book.mode?'is-active':'')+'">'+label+'</button>').join('');
  const diagram=inkSVG(page.strokes).replace('<svg ','<svg data-book-ink class="working-book__ink" tabindex="0" ');
  host.innerHTML='<div class="working-book'+(entry.expanded?' working-book--expanded':'')+'" data-working-book>'+
    '<header class="working-book__header">'+
      '<div><strong>My mathematical working</strong>'+
        '<p>Build your solution in lines and sketches. It is not marked automatically.</p></div>'+
      '<span class="working-book__saved" role="status" data-book-saved>'+
        (entry.saveOk?'Saved on this device':'Unable to save — export your work')+'</span>'+
    '</header>'+
    '<div class="working-book__controls">'+
      '<div class="working-book__modes" role="group" aria-label="Working mode">'+modes+'</div>'+
      '<label>Paper <select data-book-paper aria-label="Paper style">'+
        item('squared','Squared',book.paper)+item('ruled','Ruled',book.paper)+
        item('plain','Plain',book.paper)+'</select></label>'+
      '<div class="working-book__history" role="group" aria-label="Edit history">'+
        actionButton('undo','Undo',!entry.undo.length)+
        actionButton('redo','Redo',!entry.redo.length)+'</div>'+
      actionButton('expand',entry.expanded?'Collapse':'Expand')+
    '</div>'+
    '<nav class="working-book__pages" aria-label="Notebook pages">'+
      actionButton('prev-page','Previous',book.page===0)+
      '<span aria-live="polite">Page '+(book.page+1)+' of '+book.pages.length+'</span>'+
      actionButton('next-page','Next',book.page===book.pages.length-1)+
      actionButton('add-page','+ Page',book.pages.length>=MAX_NOTEBOOK_PAGES)+
      actionButton('delete-page','Delete page',book.pages.length===1)+
    '</nav>'+
    (typeVisible?
      '<section class="working-book__typed" aria-label="Typed mathematical working">'+
        '<div class="working-book__blocks">'+
          page.blocks.map((block,i)=>renderBlock(block,i,page.blocks.length)).join('')+
          (!page.blocks.length?'<p class="working-book__empty">Add a maths line or an explanation to begin.</p>':'')+
        '</div>'+
        '<div class="working-book__palette" role="group" aria-label="Mathematical symbols">'+
          MATH_SYMBOLS.map(symbol=>'<button type="button" data-book-symbol="'+symbol.id+
            '" title="'+e(symbol.label)+'" aria-label="Insert '+e(symbol.label)+'">'+
            e(symbol.display)+'</button>').join('')+'</div>'+
        '<div class="working-book__add">'+
          actionButton('add-math','+ Maths line',page.blocks.length>=MAX_NOTEBOOK_BLOCKS)+
          actionButton('add-text','+ Explanation',page.blocks.length>=MAX_NOTEBOOK_BLOCKS)+
        '</div>'+
      '</section>':'')+
    (drawVisible?
      '<section class="working-book__draw" aria-label="Freehand mathematical working">'+
        '<div class="working-book__ink-tools" role="group" aria-label="Drawing tools">'+
          '<button type="button" data-book-pen="pen" aria-pressed="'+(entry.pen==='pen')+
            '">Pen</button>'+
          '<button type="button" data-book-pen="eraser" aria-pressed="'+(entry.pen==='eraser')+
            '">Eraser</button>'+
          '<label>Ink <select data-book-color aria-label="Ink colour">'+
            item('#285c7c','Blue',entry.color)+item('#754b83','Purple',entry.color)+
            item('#23694b','Green',entry.color)+'</select></label>'+
          actionButton('clear-ink','Clear drawing',!page.strokes.length)+
        '</div>'+
        '<div class="working-book__drawing" data-paper="'+book.paper+'">'+diagram+'</div>'+
        '<p class="working-book__draw-help">Draw with a mouse, finger or stylus. The eraser removes strokes. '+
          'Keyboard users can enter maths or explanations in Type mode.</p>'+
      '</section>':'')+
    '<footer class="working-book__footer">'+
      '<div>'+actionButton('download-html','Download printable work')+
        actionButton('download-json','Back up working (.json)')+'</div>'+
      '<div>'+actionButton('ask-clear','Clear notebook')+'</div>'+
    '</footer>'+
    (entry.confirmClear?'<div class="working-book__confirm" role="alert">'+
      '<p>Delete every page of this notebook from this device? This cannot be undone after refresh.</p>'+
      actionButton('confirm-clear','Yes, clear notebook')+
      actionButton('cancel-clear','Keep my working')+'</div>':'')+
    '<p class="working-book__privacy">Autosaved locally in this browser, separately from Fluency scores. '+
      'No student login, server upload or automatic marks. Save a copy before clearing browser data.</p>'+
    '</div>';
  connectControls(host,scope,entry);
  if(typeVisible)enhanceMathBlocks(host,scope,entry);
  if(drawVisible)connectDrawing(host,scope,entry);
}
function connectControls(host,scope,entry){
  function rerender(focusSelector){
    renderWorkspace(host,scope,entry);
    if(focusSelector)host.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  const page=()=>entry.book.pages[entry.book.page];
  function snapshot(){
    entry.undo.push(JSON.stringify(entry.book));
    if(entry.undo.length>60)entry.undo.shift();
    entry.redo=[];
  }
  function apply(action,{history=true,focus=null}={}){
    if(history)snapshot();
    try{
      entry.book=editWorkingNotebook(entry.book,action);
    }catch(error){
      if(history)entry.undo.pop();
      throw error;
    }
    entry.editing=null;
    save(scope,entry);
    rerender(focus);
  }
  const status=()=>host.querySelector('[data-book-saved]');
  function updateBlock(id,value){
    const block=page().blocks.find(b=>b.id===id);
    if(!block||value===block.value)return;
    if(entry.editing!==id){snapshot();entry.editing=id;}
    try{entry.book=editWorkingNotebook(entry.book,{type:'set-block',id,value});}
    catch{return;}
    save(scope,entry);
    const message=status();
    if(message)message.textContent=entry.saveOk?'Saved on this device':'Unable to save — export your work';
    // Update button state without replacing the focused editor.
    for(const name of ['undo','redo']){
      const button=host.querySelector('[data-book-action="'+name+'"]');
      if(button)button.disabled=!(name==='undo'?entry.undo.length:entry.redo.length);
    }
  }
  host.querySelectorAll('[data-book-value]').forEach(input=>{
    const id=input.dataset.bookValue;
    input.addEventListener('focus',()=>{
      if(input.dataset.bookKind==='math')entry.activeMathId=id;
    });
    input.addEventListener('input',()=>updateBlock(id,input.value));
    input.addEventListener('blur',()=>{entry.editing=null;});
  });
  host.querySelectorAll('[data-book-move]').forEach(button=>{
    button.addEventListener('click',()=>apply({type:'move-block',id:button.dataset.bookId,
      direction:Number(button.dataset.bookMove)}));
  });
  host.querySelectorAll('[data-book-remove]').forEach(button=>{
    button.addEventListener('click',()=>{
      apply({type:'remove-block',id:button.dataset.bookRemove});
    });
  });
  host.querySelector('[data-book-paper]').addEventListener('change',ev=>{
    apply({type:'paper',value:ev.target.value});
  });
  host.querySelectorAll('[data-book-mode]').forEach(button=>{
    button.addEventListener('click',()=>{
      if(entry.book.mode!==button.dataset.bookMode)
        apply({type:'mode',value:button.dataset.bookMode},
          {focus:'[data-book-mode="'+button.dataset.bookMode+'"]'});
    });
  });
  host.querySelectorAll('[data-book-pen]').forEach(button=>{
    button.addEventListener('click',()=>{
      entry.pen=button.dataset.bookPen;
      rerender('[data-book-pen="'+entry.pen+'"]');
    });
  });
  host.querySelector('[data-book-color]')?.addEventListener('change',ev=>{
    entry.color=ev.target.value;rerender('[data-book-color]');
  });
  host.querySelectorAll('[data-book-symbol]').forEach(button=>{
    button.addEventListener('click',()=>{
      const symbol=MATH_SYMBOLS.find(s=>s.id===button.dataset.bookSymbol);
      if(!symbol)return;
      let block=page().blocks.find(b=>b.id===entry.activeMathId&&b.kind==='math');
      if(!block)block=page().blocks.find(b=>b.kind==='math');
      if(!block){
        apply({type:'add-block',kind:'math'});
        block=page().blocks.findLast(b=>b.kind==='math');
      }
      const wrapper=host.querySelector('[data-book-block="'+block.id+'"]');
      const field=wrapper?.querySelector('math-field');
      const source=wrapper?.querySelector('[data-book-value]');
      if(field){
        field.focus();entry.activeMathId=block.id;
        field.insert(symbol.latex);
        source.value=field.getValue('latex');
        updateBlock(block.id,source.value);
      }else if(source){
        source.focus();entry.activeMathId=block.id;
        source.setRangeText(symbol.fallback,source.selectionStart,source.selectionEnd,'end');
        updateBlock(block.id,source.value);
      }
    });
  });
  const actionHandlers={
    'undo':()=>{
      if(!entry.undo.length)return;
      entry.redo.push(JSON.stringify(entry.book));
      entry.book=hydrateWorkingNotebook(entry.undo.pop());
      entry.editing=null;save(scope,entry);rerender('[data-book-action="redo"]');
    },
    'redo':()=>{
      if(!entry.redo.length)return;
      entry.undo.push(JSON.stringify(entry.book));
      entry.book=hydrateWorkingNotebook(entry.redo.pop());
      entry.editing=null;save(scope,entry);rerender('[data-book-action="undo"]');
    },
    'prev-page':()=>apply({type:'page',value:entry.book.page-1},{history:false}),
    'next-page':()=>apply({type:'page',value:entry.book.page+1},{history:false}),
    'add-page':()=>apply({type:'add-page'}),
    'delete-page':()=>apply({type:'delete-page'}),
    'add-math':()=>apply({type:'add-block',kind:'math'}),
    'add-text':()=>apply({type:'add-block',kind:'text'}),
    'clear-ink':()=>apply({type:'clear-ink'}),
    'ask-clear':()=>{entry.confirmClear=true;rerender('[data-book-action="cancel-clear"]');},
    'cancel-clear':()=>{entry.confirmClear=false;rerender('[data-book-action="ask-clear"]');},
    'confirm-clear':()=>{
      entry.book=blankWorkingNotebook();entry.undo=[];entry.redo=[];entry.editing=null;
      entry.activeMathId=null;entry.confirmClear=false;save(scope,entry);
      rerender('[data-book-action="ask-clear"]');
    },
    'download-html':()=>downloadText(exportWorkingHTML(entry.book,{title:host.closest('[data-working-notebook]')?.dataset.label||'My mathematics working'}),
      'maths-working-'+scope.replace(/[^a-z0-9_-]/gi,'-')+'.html','text/html;charset=utf-8'),
    'download-json':()=>downloadText(JSON.stringify(entry.book,null,2),
      'maths-working-'+scope.replace(/[^a-z0-9_-]/gi,'-')+'.json','application/json'),
    'expand':()=>{
      entry.expanded=!entry.expanded;
      document.body.classList.toggle('working-book-expanded',entry.expanded);
      rerender('[data-book-action="expand"]');
    }
  };
  host.querySelectorAll('[data-book-action]').forEach(button=>{
    button.addEventListener('click',()=>actionHandlers[button.dataset.bookAction]?.());
  });
  host.onkeydown=ev=>{
    if(ev.key==='Escape'&&entry.expanded){
      ev.stopPropagation();
      entry.expanded=false;document.body.classList.remove('working-book-expanded');
      rerender('[data-book-action="expand"]');
    }
  };
  // Exposed only to the ink and MathLive wiring within this render.
  host._bookApply=apply;
  host._bookUpdate=updateBlock;
}
function enhanceMathBlocks(host,scope,entry){
  for(const source of host.querySelectorAll('[data-book-kind="math"]')){
    const wrapper=source.parentElement,id=source.dataset.bookValue;
    loadMathLive().then(MathfieldElement=>{
      if(!source.isConnected||!wrapper.isConnected||wrapper.querySelector('math-field'))return;
      const field=new MathfieldElement();
      field.className='working-book__math-field';
      field.setAttribute('aria-label','Mathematical working');
      field.value=source.value;
      field.mathVirtualKeyboardPolicy='auto';
      field.addEventListener('focus',()=>{entry.activeMathId=id;});
      field.addEventListener('input',()=>{
        source.value=field.getValue('latex');
        if(source.value.length<=1200)host._bookUpdate?.(id,source.value);
      });
      field.addEventListener('blur',()=>{entry.editing=null;});
      wrapper.append(field);
      wrapper.classList.add('working-book__math-wrap--ready');
    }).catch(()=>{/* Keep the fully editable LaTeX fallback visible. */});
  }
}
function connectDrawing(host,scope,entry){
  const svg=host.querySelector('[data-book-ink]');
  if(!svg)return;
  let active=null;
  function coords(event){
    const rect=svg.getBoundingClientRect();
    return [Math.max(0,Math.min(DRAW_WIDTH,
      Math.round((event.clientX-rect.left)*DRAW_WIDTH/rect.width*10)/10)),
    Math.max(0,Math.min(DRAW_HEIGHT,
      Math.round((event.clientY-rect.top)*DRAW_HEIGHT/rect.height*10)/10))];
  }
  svg.addEventListener('pointerdown',event=>{
    if(event.button!==0||active||!svg.isConnected)return;
    const point=coords(event);
    if(entry.pen==='eraser'){
      const page=entry.book.pages[entry.book.page];
      const i=findInkStroke(page.strokes,point);
      if(i>=0)host._bookApply?.({type:'erase-stroke',index:i});
      return;
    }
    const page=entry.book.pages[entry.book.page];
    if(page.strokes.length>=160)return;
    event.preventDefault();
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('fill','none');
    path.setAttribute('stroke',entry.color);
    path.setAttribute('stroke-width',String(entry.width));
    path.setAttribute('stroke-linecap','round');
    path.setAttribute('stroke-linejoin','round');
    svg.append(path);
    active={id:event.pointerId,stroke:{ink:entry.color,width:entry.width,points:[point]},path};
    path.setAttribute('d',inkStrokePath(active.stroke));
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener('pointermove',event=>{
    if(!active||event.pointerId!==active.id)return;
    event.preventDefault();
    const points=active.stroke.points,last=points[points.length-1],next=coords(event);
    if(Math.abs(next[0]-last[0])+Math.abs(next[1]-last[1])<1.2)return;
    if(points.length<500)points.push(next);
    active.path.setAttribute('d',inkStrokePath(active.stroke));
  });
  function end(event,commit){
    if(!active||event.pointerId!==active.id)return;
    const stroke=active.stroke;
    active=null;
    if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);
    if(commit)host._bookApply?.({type:'stroke',stroke});
    else if(svg.isConnected)renderWorkspace(host,scope,entry);
  }
  svg.addEventListener('pointerup',event=>end(event,true));
  svg.addEventListener('pointercancel',event=>end(event,false));
}
export function mountWorkingNotebooks(root){
  for(const details of root.querySelectorAll('[data-working-notebook]')){
    const scope=details.dataset.scope,host=details.querySelector('.working-notebook__mount');
    if(!scope||!host)continue;
    function activate(){
      if(!details.isConnected)return;
      if(details.open){
        openScopes.add(scope);
        closedScopes.delete(scope);
        renderWorkspace(host,scope,storeFor(scope));
      }else{
        openScopes.delete(scope);
        closedScopes.add(scope);
        if(document.body.classList.contains('working-book-expanded'))
          document.body.classList.remove('working-book-expanded');
      }
    }
    details.addEventListener('toggle',activate);
    if(details.open)activate();
  }
}
