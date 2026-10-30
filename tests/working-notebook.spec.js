import {test,expect} from '@playwright/test';

async function openNotebook(page){
  const details=page.locator('details[data-working-notebook]');
  await expect(details).toBeVisible();
  if(!(await details.getAttribute('open'))) {
    await details.locator('summary').click();
  }
  await expect(page.locator('.working-book')).toBeVisible();
  return details;
}
test('typed mathematics and explanations autosave across rerender, refresh and route changes',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/fluency/level-1');
  await openNotebook(page);
  await page.locator('[data-book-kind="math"]').fill('\\frac{1}{2}x^2');
  await page.locator('[data-book-action="add-text"]').click();
  await page.locator('[data-book-kind="text"]').fill('Using the quadratic formula.');
  await page.locator('[data-book-paper]').selectOption('ruled');
  await page.locator('[data-action="fluency-hint"]').click();
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('\\frac{1}{2}x^2');
  await expect(page.locator('[data-book-kind="text"]')).toHaveValue('Using the quadratic formula.');
  await page.reload();
  await openNotebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('\\frac{1}{2}x^2');
  await expect(page.locator('[data-book-kind="text"]')).toHaveValue('Using the quadratic formula.');
  await expect(page.locator('[data-book-paper]')).toHaveValue('ruled');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem(
    'maths-notebook:working:v1:quadratics:fluency:level-1:values')));
  expect(stored.pages[0].blocks.map(b=>b.value)).toEqual([
    '\\frac{1}{2}x^2','Using the quadratic formula.']);
  await page.goto('/#/sampling/fluency/level-1');
  await openNotebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('');
  await page.goto('/#/quadratics/fluency/level-1');
  await openNotebook(page);
  await expect(page.locator('[data-book-kind="text"]')).toHaveValue('Using the quadratic formula.');
});
test('drawing, mixed mode, eraser, undo and redo preserve vector strokes',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/sampling/fluency/level-1');
  await openNotebook(page);
  await page.locator('[data-book-mode="both"]').click();
  const canvas=page.locator('[data-book-ink]');
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x+30,box.y+30);
  await page.mouse.down();
  await page.mouse.move(box.x+100,box.y+60,{steps:5});
  await page.mouse.up();
  await expect(canvas.locator('path')).toHaveCount(1);
  await page.locator('[data-book-action="undo"]').click();
  await expect(page.locator('[data-book-ink] path')).toHaveCount(0);
  await page.locator('[data-book-action="redo"]').click();
  await expect(page.locator('[data-book-ink] path')).toHaveCount(1);
  await page.reload();
  await openNotebook(page);
  await expect(page.locator('[data-book-mode="both"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-book-ink] path')).toHaveCount(1);
  await page.locator('[data-book-pen="eraser"]').click();
  const again=await page.locator('[data-book-ink]').boundingBox();
  await page.mouse.click(again.x+60,again.y+45);
  await expect(page.locator('[data-book-ink] path')).toHaveCount(0);
});
test('multiple pages, export and deliberate clear work without affecting scoring',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/fluency/level-2');
  await openNotebook(page);
  await page.locator('[data-book-kind="math"]').fill('x^2+1');
  await page.locator('[data-book-action="add-page"]').click();
  await expect(page.locator('.working-book__pages')).toContainText('Page 2 of 2');
  await page.locator('[data-book-action="add-math"]').click();
  await page.locator('[data-book-kind="math"]').fill('x=3');
  await page.locator('[data-book-action="prev-page"]').click();
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('x^2+1');
  const html=page.waitForEvent('download');
  await page.locator('[data-book-action="download-html"]').click();
  expect((await html).suggestedFilename()).toMatch(/maths-working-.*\.html/);
  const backup=page.waitForEvent('download');
  await page.locator('[data-book-action="download-json"]').click();
  expect((await backup).suggestedFilename()).toMatch(/maths-working-.*\.json/);
  await page.locator('[data-book-action="ask-clear"]').click();
  await expect(page.locator('.working-book__confirm')).toBeVisible();
  await page.locator('[data-book-action="cancel-clear"]').click();
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('x^2+1');
  await page.locator('[data-book-action="ask-clear"]').click();
  await page.locator('[data-book-action="confirm-clear"]').click();
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('');
  await expect(page.locator('.working-book__pages')).toContainText('Page 1 of 1');
});
test('notebook is responsive at narrow width with keyboard-accessible operations',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.setViewportSize({width:320,height:760});
  await page.goto('/#/quadratics/fluency/level-1');
  await openNotebook(page);
  await page.locator('[data-book-mode="draw"]').click();
  await expect(page.locator('[data-book-ink]')).toBeVisible();
  await page.locator('[data-book-mode="type"]').click();
  await page.locator('[data-book-action="add-text"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-book-kind="text"]')).toHaveCount(1);
  const dimension=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,
    width:window.innerWidth}));
  expect(dimension.scroll).toBeLessThanOrEqual(dimension.width+1);
});
