import test from 'node:test';
import assert from 'node:assert/strict';
import {blankWorkingNotebook,hydrateWorkingNotebook,isWorkingNotebook,
  editWorkingNotebook,workingStorageKey,findInkStroke,inkSVG,exportWorkingHTML,
  MAX_NOTEBOOK_PAGES} from '../src/working-notebook-model.js';

const ink={ink:'#285c7c',width:2.8,points:[[15,20],[35,45],[65,52]]};
test('notebook begins with independently editable mathematical and drawing data',()=>{
  const fresh=blankWorkingNotebook();
  assert.equal(fresh.version,1);
  assert.equal(fresh.mode,'type');
  assert.equal(fresh.pages[0].blocks[0].kind,'math');
  assert.ok(isWorkingNotebook(fresh));
  assert.equal(workingStorageKey('quadratics:fluency:level-1:values'),
    'maths-notebook:working:v1:quadratics:fluency:level-1:values');
  assert.throws(()=>workingStorageKey('<script>'));
});
test('typed mathematics, explanations and page operations are lossless',()=>{
  const original=blankWorkingNotebook();
  const id=original.pages[0].blocks[0].id;
  let book=editWorkingNotebook(original,{type:'set-block',id,value:'\\frac{1}{2}x^2'});
  book=editWorkingNotebook(book,{type:'add-block',kind:'text'});
  book=editWorkingNotebook(book,{type:'set-block',id:book.pages[0].blocks[1].id,
    value:'Then I check both solutions.'});
  book=editWorkingNotebook(book,{type:'add-page'});
  book=editWorkingNotebook(book,{type:'mode',value:'both'});
  book=editWorkingNotebook(book,{type:'paper',value:'ruled'});
  assert.equal(book.pages.length,2);
  assert.equal(book.page,1);
  assert.equal(book.pages[0].blocks[0].value,'\\frac{1}{2}x^2');
  assert.equal(book.pages[0].blocks[1].value,'Then I check both solutions.');
  assert.equal(original.pages.length,1);
  assert.deepEqual(hydrateWorkingNotebook(JSON.stringify(book)),book);
  book=editWorkingNotebook(book,{type:'page',value:0});
  book=editWorkingNotebook(book,{type:'move-block',id:book.pages[0].blocks[1].id,direction:-1});
  assert.equal(book.pages[0].blocks[0].kind,'text');
  book=editWorkingNotebook(book,{type:'remove-block',id:book.pages[0].blocks[0].id});
  assert.equal(book.pages[0].blocks.length,1);
  assert.throws(()=>editWorkingNotebook(book,{type:'mode',value:'fish'}));
});
test('pages and vector strokes are bounded, with stroke-level erasure',()=>{
  let book=blankWorkingNotebook();
  book=editWorkingNotebook(book,{type:'stroke',stroke:ink});
  assert.equal(book.pages[0].strokes.length,1);
  assert.equal(findInkStroke(book.pages[0].strokes,[36,44]),0);
  assert.equal(findInkStroke(book.pages[0].strokes,[700,300]),-1);
  const image=inkSVG(book.pages[0].strokes);
  assert.match(image,/M 15 20 L 35 45 L 65 52/);
  assert.match(image,/role="img"/);
  book=editWorkingNotebook(book,{type:'erase-stroke',index:0});
  assert.equal(book.pages[0].strokes.length,0);
  assert.throws(()=>editWorkingNotebook(book,{type:'stroke',
    stroke:{...ink,ink:'red" onload="alert(1)'}}));
  for(let i=1;i<MAX_NOTEBOOK_PAGES;i++)book=editWorkingNotebook(book,{type:'add-page'});
  assert.equal(book.pages.length,MAX_NOTEBOOK_PAGES);
  assert.equal(editWorkingNotebook(book,{type:'add-page'}).pages.length,MAX_NOTEBOOK_PAGES);
  book=editWorkingNotebook(book,{type:'delete-page'});
  assert.equal(book.pages.length,MAX_NOTEBOOK_PAGES-1);
});
test('corrupted and oversized saved data cannot inject HTML or break hydration',()=>{
  const defaults=blankWorkingNotebook();
  for(const value of ['broken',JSON.stringify({version:999,pages:[]}),
    'z'.repeat(1300001),{...defaults,pages:[]}])
    assert.deepEqual(hydrateWorkingNotebook(value),defaults);
  const clean=editWorkingNotebook(defaults,{type:'set-block',id:'block-1',
    value:'\\frac{1}{2}<img src=x onerror=alert(1)>'});
  const note=editWorkingNotebook(clean,{type:'add-block',kind:'text'});
  const other=editWorkingNotebook(note,{type:'set-block',
    id:note.pages[0].blocks[1].id,value:'<script>alert(1)</script>'});
  const html=exportWorkingHTML(other,{title:'My working <danger>'});
  assert.ok(html.startsWith('<!doctype html>'));
  assert.match(html,/&lt;script&gt;/);
  assert.match(html,/&lt;img/);
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
  assert.match(html,/\\frac\{1\}\{2\}/);
  assert.match(html,/My working &lt;danger&gt;/);
});
