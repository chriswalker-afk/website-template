import {test,expect} from '@playwright/test';

const open='/authoring.html?topic=gradient&family=fluency%3Arising-grid&seed=2026&difficulty=secure';

test('Question Workshop opens real Gradient generators with reproducible seed and maths preview',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(open);
  await expect(page.getByRole('heading',{name:/Question Workshop/})).toBeVisible();
  await expect(page.locator('#studio-topic')).toHaveValue('gradient');
  await expect(page.locator('#studio-family-count')).toContainText('20');
  await expect(page.locator('#studio-preview [data-preview-seed]')).toHaveAttribute('data-preview-seed','2026');
  await expect(page.locator('#studio-preview')).toContainText('squared grid');
  await expect(page.locator('#studio-difficulty')).toBeDisabled();
  await expect(page.locator('#studio-answer-examples .qw-example').first()).toBeVisible();
  await page.locator('#studio-answer-examples .qw-example').first().click();
  await page.locator('#studio-answer-form button[type=submit]').click();
  await expect(page.locator('#studio-answer-result')).toContainText('Accepted');
  await page.locator('#studio-next-seed').click();
  await expect(page.locator('#studio-preview [data-preview-seed]')).toHaveAttribute('data-preview-seed','2027');
  await expect(page).toHaveURL(/seed=2027/);
  expect(errors).toEqual([]);
});
test('Family library filters and printable difficulty produce real LaTeX previews',async({page})=>{
  await page.goto(open);
  await page.locator('#studio-type').selectOption('worksheet');
  await expect(page.locator('.qw-family-button')).toHaveCount(4);
  await page.locator('[data-family-key="worksheet:gradient-grid"]').click();
  await expect(page.locator('#studio-difficulty')).toBeEnabled();
  await page.locator('#studio-difficulty').selectOption('stretch');
  await expect(page.locator('#studio-preview')).toContainText('Printable LaTeX solution source');
  await expect(page.locator('#studio-answer-examples')).toContainText('not automatically marked');
  await expect(page.locator('#studio-answer-form')).toBeHidden();
  await expect(page).toHaveURL(/family=worksheet%3Agradient-grid/);
  await page.locator('#studio-type').selectOption('all');
  await page.locator('#studio-search').fill('coordinate-fraction');
  await expect(page.locator('.qw-family-button')).toHaveCount(1);
  await expect(page.locator('.qw-family-button')).toContainText('Coordinate Fraction');
});
test('Teacher QA audits selected families and entire topic, then exports a JSON report',async({page})=>{
  await page.goto(open);
  await page.locator('#studio-audit-count').selectOption('8');
  await page.locator('#studio-audit-family').click();
  await expect(page.locator('#studio-audit-summary')).toContainText('1 of 1 families passed');
  await page.locator('#studio-audit-topic').click();
  await expect(page.locator('#studio-audit-summary')).toContainText('20 of 20 families passed');
  await expect(page.locator('.qw-audit__row')).toHaveCount(20);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#studio-download-report').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^question-qa-gradient-2026\.json$/);
});
test('A different topic can be selected without changing student topic navigation',async({page})=>{
  await page.goto(open);
  await page.locator('#studio-topic').selectOption('sampling');
  await expect(page.locator('#studio-topic-detail')).toContainText('Statistics');
  await expect(page.locator('#studio-preview [data-preview-seed]')).toHaveCount(1);
  await expect(page).toHaveURL(/topic=sampling/);
  await page.goto('/#/sampling/home');
  await expect(page.locator('#topic-switcher option')).toHaveCount(3);
  await expect(page.locator('#studio-topic')).toHaveCount(0);
});
test('Workshop remains usable on a narrow screen',async({page})=>{
  await page.setViewportSize({width:375,height:800});
  await page.goto(open);
  await expect(page.getByRole('heading',{name:/Question Workshop/})).toBeVisible();
  await expect(page.locator('#studio-preview [data-preview-seed]')).toHaveCount(1);
  const widths=await page.evaluate(()=>({content:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(widths.content).toBeLessThanOrEqual(widths.viewport+2);
});
