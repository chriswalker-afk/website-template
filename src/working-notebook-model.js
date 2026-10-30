// Typed mathematics, explanations and vector ink share one versioned notebook
// contract. This module is pure: no DOM, network, storage, eval or automated marks.
import {escapeHTML} from './logic.js';
import {TOOL_KINDS,defaultToolData,validToolData,renderToolPreview,TOOL_LABELS} from './math-toolkit.js';

export const WORKING_NOTEBOOK_VERSION=1;
export const WORKING_NOTEBOOK_PREFIX='maths-notebook:working:v1:';
export const DRAW_WIDTH=720;
export const DRAW_HEIGHT=320;
export const MAX_NOTEBOOK_PAGES=8;
export const MAX_NOTEBOOK_BLOCKS=30;
export const MAX_NOTEBOOK_STROKES=160;
export const MAX_STROKE_POINTS=500;
const MAX_STORED_SIZE=1300000;
const modes=['type','draw','both'];
const papers=['squared','ruled','plain'];
const inks=['#285c7c','#754b83','#23694b'];
const idPattern=/^(page|block)-[1-9]\d{0,6}$/;
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;

export function workingStorageKey(scope){
  if(typeof scope!=='string'||scope.length>130||!/^[a-z0-9:/_-]+$/i.test(scope))
    throw new TypeError('Invalid notebook scope');
  return WORKING_NOTEBOOK_PREFIX+scope;
}
export function blankWorkingNotebook(){
  return {version:WORKING_NOTEBOOK_VERSION,mode:'type',paper:'squared',
    page:0,nextId:2,pages:[{id:'page-1',
      blocks:[{id:'block-1',kind:'math',value:''}],strokes:[]}]};
}
export function isWorkingNotebook(value){
  if(!value||value.version!==WORKING_NOTEBOOK_VERSION||
    !modes.includes(value.mode)||!papers.includes(value.paper)||
    !Number.isInteger(value.nextId)||value.nextId<2||value.nextId>9999999||
    !Array.isArray(value.pages)||value.pages.length<1||
    value.pages.length>MAX_NOTEBOOK_PAGES||
    !Number.isInteger(value.page)||value.page<0||value.page>=value.pages.length)return false;
  const ids=new Set();
  for(const page of value.pages){
    if(!page||typeof page.id!=='string'||!idPattern.test(page.id)||ids.has(page.id)||
      !Array.isArray(page.blocks)||page.blocks.length>MAX_NOTEBOOK_BLOCKS||
      !Array.isArray(page.strokes)||page.strokes.length>MAX_NOTEBOOK_STROKES)return false;
    ids.add(page.id);
    for(const block of page.blocks){
      if(!block||typeof block.id!=='string'||!idPattern.test(block.id)||
        ids.has(block.id))return false;
      if(TOOL_KINDS.includes(block.kind)){
        if(!validToolData(block.kind,block.data))return false;
      }else if(!['math','text'].includes(block.kind)||
        typeof block.value!=='string'||block.value.length>(block.kind==='math'?1200:5000))
        return false;
      ids.add(block.id);
    }
    for(const stroke of page.strokes){
      if(!stroke||!inks.includes(stroke.ink)||!finite(stroke.width,1,10)||
        !Array.isArray(stroke.points)||stroke.points.length<1||
        stroke.points.length>MAX_STROKE_POINTS)return false;
      for(const point of stroke.points)
        if(!Array.isArray(point)||point.length!==2||
          !finite(point[0],0,DRAW_WIDTH)||!finite(point[1],0,DRAW_HEIGHT))
          return false;
    }
  }
  return true;
}
export function hydrateWorkingNotebook(raw){
  try{
    if(typeof raw==='string'&&raw.length>MAX_STORED_SIZE)return blankWorkingNotebook();
    const value=typeof raw==='string'?JSON.parse(raw):raw;
    return isWorkingNotebook(value)?JSON.parse(JSON.stringify(value)):blankWorkingNotebook();
  }catch{return blankWorkingNotebook();}
}
export function hasWorkingContent(book){
  return isWorkingNotebook(book)&&book.pages.some(page=>
    page.strokes.length>0||page.blocks.some(block=>TOOL_KINDS.includes(block.kind)||
      block.value.trim().length>0));
}
const clone=book=>JSON.parse(JSON.stringify(book));

export function editWorkingNotebook(previous,action){
  if(!isWorkingNotebook(previous)||!action||typeof action.type!=='string')
    throw new TypeError('Invalid notebook action');
  const book=clone(previous),page=book.pages[book.page];
  const index=page.blocks.findIndex(block=>block.id===action.id);
  const freshId=prefix=>prefix+'-'+book.nextId++;
  switch(action.type){
    case 'mode':
      if(!modes.includes(action.value))throw new RangeError('Invalid working mode');
      book.mode=action.value;break;
    case 'paper':
      if(!papers.includes(action.value))throw new RangeError('Invalid paper');
      book.paper=action.value;break;
    case 'page':
      if(!Number.isInteger(action.value)||action.value<0||
        action.value>=book.pages.length)throw new RangeError('Invalid page');
      book.page=action.value;break;
    case 'add-page':
      if(book.pages.length>=MAX_NOTEBOOK_PAGES)return book;
      book.pages.push({id:freshId('page'),blocks:[],strokes:[]});
      book.page=book.pages.length-1;
      break;
    case 'delete-page':
      if(book.pages.length===1)return book;
      book.pages.splice(book.page,1);
      book.page=Math.min(book.page,book.pages.length-1);
      break;
    case 'add-block':
      if(page.blocks.length>=MAX_NOTEBOOK_BLOCKS)return book;
      if(!['math','text',...TOOL_KINDS].includes(action.kind))
        throw new TypeError('Invalid block type');
      page.blocks.push(TOOL_KINDS.includes(action.kind)?
        {id:freshId('block'),kind:action.kind,data:defaultToolData(action.kind)}:
        {id:freshId('block'),kind:action.kind,value:''});
      break;
    case 'set-block':
      if(index<0||!['math','text'].includes(page.blocks[index].kind)||
        typeof action.value!=='string'||action.value.length>
        (page.blocks[index].kind==='math'?1200:5000))throw new TypeError('Invalid block value');
      page.blocks[index].value=action.value;break;
    case 'set-tool':
      if(index<0||!TOOL_KINDS.includes(page.blocks[index].kind)||
        !validToolData(page.blocks[index].kind,action.data))
        throw new TypeError('Invalid mathematical tool data');
      page.blocks[index].data=clone(action.data);break;
    case 'move-block':{
      if(index<0||![-1,1].includes(action.direction))throw new TypeError('Invalid block move');
      const destination=index+action.direction;
      if(destination<0||destination>=page.blocks.length)return book;
      [page.blocks[index],page.blocks[destination]]=
        [page.blocks[destination],page.blocks[index]];
      break;
    }
    case 'remove-block':
      if(index<0)throw new TypeError('Unknown block');
      page.blocks.splice(index,1);break;
    case 'stroke':
      if(page.strokes.length>=MAX_NOTEBOOK_STROKES)return book;
      if(!isWorkingNotebook({...book,pages:book.pages.map((p,i)=>i===book.page?
        {...p,strokes:[...p.strokes,action.stroke]}:p)}))
        throw new TypeError('Invalid ink stroke');
      page.strokes.push(clone(action.stroke));break;
    case 'erase-stroke':
      if(!Number.isInteger(action.index)||action.index<0||
        action.index>=page.strokes.length)return book;
      page.strokes.splice(action.index,1);break;
    case 'clear-ink':
      page.strokes=[];break;
    default:throw new RangeError('Unknown working action');
  }
  if(!isWorkingNotebook(book))throw new Error('Invalid edited notebook');
  return book;
}
const segmentDistanceSquared=(point,a,b)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=dx||dy?Math.max(0,Math.min(1,
    ((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy))):0;
  const x=a[0]+t*dx,y=a[1]+t*dy;
  return (point[0]-x)**2+(point[1]-y)**2;
};
export function findInkStroke(strokes,point,radius=12){
  if(!Array.isArray(strokes)||!Array.isArray(point)||point.length!==2)return -1;
  for(let i=strokes.length-1;i>=0;i--){
    const points=strokes[i].points;
    for(let j=0;j<points.length;j++){
      const a=points[j],b=points[j+1]||a;
      if(segmentDistanceSquared(point,a,b)<=(radius+strokes[i].width/2)**2)return i;
    }
  }
  return -1;
}
const coord=x=>Number(x).toFixed(1).replace(/\.0$/,'');
export function inkStrokePath(stroke){
  if(!stroke?.points?.length)return '';
  const points=stroke.points;
  return 'M '+coord(points[0][0])+' '+coord(points[0][1])+
    (points.length===1?' l 0 .01':points.slice(1).map(p=>' L '+coord(p[0])+' '+coord(p[1])).join(''));
}
export function inkSVG(strokes,accessibilityLabel='Freehand mathematical working'){
  if(!Array.isArray(strokes))throw new TypeError('Invalid strokes');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+DRAW_WIDTH+' '+DRAW_HEIGHT+
    '" role="img" aria-label="'+escapeHTML(accessibilityLabel)+'" preserveAspectRatio="xMidYMid meet">'+
    strokes.map(stroke=>'<path d="'+inkStrokePath(stroke)+'" fill="none" stroke="'+
      escapeHTML(stroke.ink)+'" stroke-width="'+Number(stroke.width)+
      '" stroke-linecap="round" stroke-linejoin="round"/>').join('')+'</svg>';
}
export function exportWorkingHTML(input,{title='My mathematics working'}={}){
  const book=hydrateWorkingNotebook(input);
  const safeTitle=escapeHTML(String(title).slice(0,160));
  const pages=book.pages.map((page,index)=>{
    const blocks=page.blocks.map(block=>{
      if(TOOL_KINDS.includes(block.kind))
        return '<figure class="math-tool"><figcaption>'+
          escapeHTML(TOOL_LABELS[block.kind])+'</figcaption>'+
          renderToolPreview(block.kind,block.data,{id:block.id})+'</figure>';
      if(block.kind==='math')
        return '<div class="equation" aria-label="Mathematical expression">'+
          '<span>\\('+escapeHTML(block.value)+'\\)</span></div>';
      return '<p class="note">'+escapeHTML(block.value).replace(/\n/g,'<br>')+'</p>';
    }).join('');
    return '<section class="page"><h2>Page '+(index+1)+'</h2>'+blocks+
      (page.strokes.length?'<div class="drawing">'+inkSVG(page.strokes)+'</div>':'')+'</section>';
  }).join('');
  // MathJax improves the mathematical display when online; without it,
  // readable LaTeX remains in the exported standalone file.
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width, initial-scale=1">'+
    '<title>'+safeTitle+'</title><style>'+
    'body{font:16px/1.65 system-ui,sans-serif;max-width:850px;margin:35px auto;padding:0 20px;color:#203c31}'+
    'h1{font:32px Georgia,serif}h2{font:22px Georgia,serif;border-bottom:1px solid #c8d8ca}'+
    '.page{margin:28px 0 46px;break-after:page}.note{white-space:normal;overflow-wrap:anywhere}'+
    '.equation{padding:14px 0;font:18px Georgia,serif;overflow-wrap:anywhere}'+
    '.drawing{border:1px solid #cbd9cc;background:#fff}.drawing svg{display:block;width:100%;height:auto}'+
    '.math-tool{break-inside:avoid;margin:18px 0;border:1px solid #cbd9cc;padding:12px;border-radius:8px}'+
    '.math-tool figcaption{font:600 15px system-ui,sans-serif;margin-bottom:8px}'+
    '.math-tool svg{display:block;width:100%;height:auto;max-height:340px}'+
    '.working-tool__table-scroll{max-width:100%;overflow-x:auto}'+
    '.working-tool__table{border-collapse:collapse;width:100%}'+
    '.working-tool__table caption{padding:6px}'+
    '.working-tool__table :is(td,th){padding:8px;border:1px solid #abc1ad;text-align:left}'+
    '.working-tool__tree-check{font-size:12px;color:#526f58}'+
    '@media print{body{margin:0;max-width:none}.page{break-after:page}}'+
    '</style><script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>'+
    '</head><body><h1>'+safeTitle+'</h1><p>Typed mathematics and freehand working</p>'+
    pages+'</body></html>';
}
