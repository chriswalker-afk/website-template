import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openNotebook} from './notebook-helpers.js';

async function addTool(page,kind){
  const notebook=await openNotebook(page);
  const toolbox=notebook.locator('[data-book-toolbox]');
  if(await toolbox.getAttribute('open')===null)
    await toolbox.locator('summary').click();
  await toolbox.locator('[data-book-add-tool="'+kind+'"]').click();
  const block=notebook.locator('[data-tool-id]').last();
  await expect(block).toBeVisible();
  return {notebook,block};
}
async function fillAndCommit(locator,value){
  await locator.fill(value);
  await locator.press('Tab');
}
test('graph is editable, restores from browser storage and supports undo/redo',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/fluency/level-1');
  const {notebook,block}=await addTool(page,'graph');
  const id=await block.getAttribute('data-tool-id');
  await expect(block.locator('svg')).toBeVisible();
  await block.locator('[data-tool-field="mode"]').selectOption('scatter');
  await expect(block.locator('[data-tool-point]')).toHaveCount(6);
  await fillAndCommit(block.locator('[data-tool-point="0"][data-tool-coordinate="x"]'),'-3');
  await expect(block.locator('svg circle')).toHaveCount(3);
  const scope=await notebook.getAttribute('data-scope');
  const stored=await page.evaluate(key=>
    JSON.parse(localStorage.getItem('maths-notebook:working:v1:'+key)),scope);
  const data=stored.pages[0].blocks.find(b=>b.id===id).data;
  expect(data.mode).toBe('scatter');
  expect(data.points[0].x).toBe(-3);
  await notebook.locator('[data-book-action="undo"]').click();
  await expect(block.locator('[data-tool-point="0"][data-tool-coordinate="x"]')).toHaveValue('-2');
  await notebook.locator('[data-book-action="redo"]').click();
  await expect(block.locator('[data-tool-point="0"][data-tool-coordinate="x"]')).toHaveValue('-3');
  await page.reload();
  const restored=await openNotebook(page);
  const graph=restored.locator('[data-tool-id="'+id+'"]');
  await expect(graph.locator('svg circle')).toHaveCount(3);
  await graph.locator('.working-tool__settings summary').click();
  await expect(graph.locator('[data-tool-point="0"][data-tool-coordinate="x"]')).toHaveValue('-3');
});
test('tables have editable cells, adjustable dimensions, safe HTML and exports',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/sampling/reasoning/explain');
  const {notebook,block}=await addTool(page,'table');
  await block.locator('[data-tool-command="add-column"]').click();
  await expect(block.locator('[data-tool-header]')).toHaveCount(3);
  await block.locator('[data-tool-command="add-row"]').click();
  await expect(block.locator('[data-tool-cell-row]')).toHaveCount(12);
  await fillAndCommit(block.locator('[data-tool-header="2"]'),'Sample size');
  await fillAndCommit(block.locator('[data-tool-cell-row="0"][data-tool-cell-col="2"]'),
    '<img src=x onerror=alert(1)>');
  await expect(block.locator('.working-tool__table')).toContainText('<img src=x onerror=alert(1)>');
  expect(await page.evaluate(()=>window.unsafe)).toBeUndefined();
  const htmlPromise=page.waitForEvent('download');
  await notebook.locator('[data-book-action="download-html"]').click();
  const download=await htmlPromise;
  const html=await readFile(await download.path(),'utf8');
  expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  expect(html).toContain('<table class="working-tool__table">');
  const jsonPromise=page.waitForEvent('download');
  await notebook.locator('[data-book-action="download-json"]').click();
  const backup=JSON.parse(await readFile(await (await jsonPromise).path(),'utf8'));
  expect(backup.version).toBe(1);
  expect(backup.pages[0].blocks.some(b=>b.kind==='table')).toBe(true);
  await page.reload();
  await openNotebook(page);
  await expect(page.locator('.working-tool__table')).toContainText('Sample size');
});
test('number line, labelled geometry and two-stage probability tree render correctly',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/problemSolving/level-1');
  const a=await addTool(page,'number-line');
  await a.block.locator('[data-tool-field="relation"]').selectOption('lt');
  await expect(a.block.locator('[data-tool-preview]')).toContainText('x < 2');
  await expect(a.block.locator('svg circle')).toHaveAttribute('fill','#fffefa');
  const geometry=await addTool(page,'geometry');
  await geometry.block.locator('[data-tool-field="rightAngle"]').check();
  await expect(geometry.block.locator('svg')).toContainText('Not to scale');
  await expect(geometry.block.locator('svg path')).toHaveCount(2);
  const tree=await addTool(page,'probability-tree');
  await expect(tree.block.locator('.working-tool__tree-check')).toContainText('sums to 1');
  await fillAndCommit(tree.block.locator('[data-tool-list="probabilities"][data-tool-index="2"]'),'0.7');
  await expect(tree.block.locator('.working-tool__tree-check')).toContainText('does not sum to 1');
  await page.reload();
  const restored=await openNotebook(page);
  await expect(restored.locator('[data-tool-id]')).toHaveCount(3);
  await expect(restored.locator('.working-tool__tree-check')).toContainText('does not sum to 1');
});
test('mathematical tools coexist with drawing and remain inside a 320px viewport',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.setViewportSize({width:320,height:760});
  await page.goto('/#/sampling/modelling/level-1');
  const {notebook,block}=await addTool(page,'table');
  await expect(block.locator('.working-tool__table')).toBeVisible();
  await notebook.locator('[data-book-mode="both"]').click();
  await expect(block.locator('.working-tool__table')).toBeVisible();
  await expect(notebook.locator('[data-book-ink]')).toBeVisible();
  await notebook.locator('[data-book-mode="type"]').click();
  await expect(block.locator('.working-tool__table')).toBeVisible();
  const dimensions=await page.evaluate(()=>({
    viewport:innerWidth,
    page:document.documentElement.scrollWidth
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport+1);
});
