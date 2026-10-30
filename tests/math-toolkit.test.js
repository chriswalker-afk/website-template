import test from 'node:test';
import assert from 'node:assert/strict';
import {TOOL_KINDS,TOOL_LABELS,defaultToolData,validToolData,renderToolPreview}
  from '../src/math-toolkit.js';
import {blankWorkingNotebook,editWorkingNotebook,hydrateWorkingNotebook,
  isWorkingNotebook,hasWorkingContent,exportWorkingHTML} from '../src/working-notebook-model.js';

const append=(book,kind)=>editWorkingNotebook(book,{type:'add-block',kind});
const toolOf=book=>book.pages[book.page].blocks.at(-1);
test('five reusable mathematical tools have valid safe defaults',()=>{
  assert.deepEqual(TOOL_KINDS,[
    'graph','table','number-line','geometry','probability-tree']);
  for(const kind of TOOL_KINDS){
    const a=defaultToolData(kind),b=defaultToolData(kind);
    assert.notStrictEqual(a,b);
    assert.equal(validToolData(kind,a),true,kind);
    assert.ok(TOOL_LABELS[kind]);
    const html=renderToolPreview(kind,a,{id:'block-30'});
    assert.ok(html.length>100);
    assert.match(html,kind==='table'?/<table /:/<svg /);
    assert.doesNotMatch(html,/\bNaN\b|\bInfinity\b/);
    assert.throws(()=>renderToolPreview(kind,{},{}));
  }
});
test('tool blocks persist through the existing version 1 notebook format',()=>{
  let book=blankWorkingNotebook();
  const previous=JSON.stringify(book);
  for(const kind of TOOL_KINDS)book=append(book,kind);
  assert.equal(book.version,1);
  assert.equal(book.pages[0].blocks.length,6);
  assert.ok(isWorkingNotebook(book));
  assert.ok(hasWorkingContent(book));
  assert.equal(JSON.stringify(blankWorkingNotebook()),previous);
  const restored=hydrateWorkingNotebook(JSON.stringify(book));
  assert.deepEqual(restored,book);
  const all=exportWorkingHTML(restored,{title:'Homework graphs and diagrams'});
  for(const label of ['Coordinate graph','Data table','Number line',
    'Geometry diagram','Probability tree'])assert.ok(all.includes(label));
  assert.match(all,/working-tool__svg/);
  assert.match(all,/<table /);
  assert.equal((all.match(/<figure /g)||[]).length,5);
});
test('students can update, move and remove individual mathematical tools',()=>{
  let book=append(blankWorkingNotebook(),'graph');
  const old=structuredClone(book),block=toolOf(book);
  const data={...block.data,title:'My quadratic',a:2,b:-3,c:1};
  book=editWorkingNotebook(book,{type:'set-tool',id:block.id,data});
  assert.equal(toolOf(book).data.a,2);
  assert.equal(toolOf(book).data.title,'My quadratic');
  data.title='Mutated outside notebook';
  assert.equal(toolOf(book).data.title,'My quadratic');
  assert.equal(toolOf(old).data.a,1);
  book=editWorkingNotebook(book,{type:'move-block',id:block.id,direction:-1});
  assert.equal(book.pages[0].blocks[0].kind,'graph');
  book=editWorkingNotebook(book,{type:'remove-block',id:block.id});
  assert.equal(book.pages[0].blocks[0].kind,'math');
  assert.throws(()=>editWorkingNotebook(book,{type:'set-tool',id:'block-1',data}));
  assert.throws(()=>editWorkingNotebook(book,{type:'add-block',kind:'iframe'}));
});
test('graph is deterministic, clipped and rejects invalid ranges',()=>{
  const data=defaultToolData('graph');
  const svg=renderToolPreview('graph',{...data,a:1,b:0,c:0},{id:'block-2'});
  assert.match(svg,/math-tool-clip-block-2/);
  assert.match(svg,/path d="M/);
  assert.match(svg,/clip-path="url\(#math-tool-clip-block-2\)"/);
  assert.equal(validToolData('graph',{...data,xMin:2,xMax:2}),false);
  assert.equal(validToolData('graph',{...data,a:Infinity}),false);
  assert.equal(validToolData('graph',{...data,mode:'javascript'}),false);
  assert.equal(validToolData('graph',{...data,points:Array(19).fill({x:1,y:1})}),false);
  const points={...data,mode:'scatter',points:[{x:-2,y:1},{x:2,y:4}]};
  const scatter=renderToolPreview('graph',points,{id:'block-3'});
  assert.equal((scatter.match(/<circle /g)||[]).length,2);
  assert.match(scatter,/\(-2, 1\)/);
});
test('tables stay rectangular with safe escaped text',()=>{
  const data=defaultToolData('table');
  data.title='<img src=x onerror=alert(1)>';
  data.headers=['x','<script>'];
  data.rows=[['1','<svg onload=alert(1)>'],['2','4']];
  assert.equal(validToolData('table',data),true);
  const html=renderToolPreview('table',data);
  assert.match(html,/&lt;script&gt;/);
  assert.match(html,/&lt;img/);
  assert.doesNotMatch(html,/<script>|<img/);
  assert.equal(validToolData('table',{...data,rows:[['1']]}),false);
  assert.equal(validToolData('table',{...data,headers:Array(7).fill('x')}),false);
  assert.equal(validToolData('table',{...data,rows:Array(13).fill(['1','2'])}),false);
});
test('number-line inequalities are open or closed correctly',()=>{
  const data=defaultToolData('number-line');
  for(const [relation,symbol,fill] of [
    ['lt','&lt;','#fffefa'],['le','≤','#27816e'],
    ['gt','&gt;','#fffefa'],['ge','≥','#27816e'],['eq','=','#27816e']
  ]){
    const svg=renderToolPreview('number-line',{...data,relation});
    assert.ok(svg.includes('x '+symbol),svg);
    assert.ok(svg.includes('fill="'+fill+'"'));
  }
  assert.equal(validToolData('number-line',{...data,boundary:9}),false);
});
test('geometry is schematic and probability trees flag inconsistent branches',()=>{
  const triangle=defaultToolData('geometry');
  triangle.vertices[0]='<A>';
  triangle.angles[0]='45°';
  triangle.rightAngle=true;
  const svg=renderToolPreview('geometry',triangle);
  assert.match(svg,/&lt;A&gt;/);
  assert.match(svg,/Not to scale/);
  assert.match(svg,/M 110 215 L 130 215 L 130 235/);
  const tree=defaultToolData('probability-tree');
  assert.match(renderToolPreview('probability-tree',tree),/Each pair of branch probabilities sums to 1/);
  tree.probabilities[2]=0.7;
  assert.match(renderToolPreview('probability-tree',tree),/does not sum to 1/);
  assert.equal(validToolData('probability-tree',{...tree,probabilities:[1,2,3,4,5,6]}),false);
});
test('malformed saved tool data is rejected and exported content is escaped',()=>{
  for(const kind of TOOL_KINDS){
    const valid=append(blankWorkingNotebook(),kind);
    const bad=structuredClone(valid);
    bad.pages[0].blocks.at(-1).data={not:'valid'};
    assert.deepEqual(hydrateWorkingNotebook(JSON.stringify(bad)),blankWorkingNotebook());
  }
  let b=append(blankWorkingNotebook(),'table');
  const block=toolOf(b),data={...block.data,title:'<svg onload=alert(1)>',
    rows:[['<script>alert(1)</script>','9']]};
  b=editWorkingNotebook(b,{type:'set-tool',id:block.id,data});
  const html=exportWorkingHTML(b);
  assert.doesNotMatch(html,/<svg onload=alert\(1\)>/);
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
  assert.match(html,/&lt;script&gt;/);
});
