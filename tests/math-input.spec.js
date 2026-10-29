import {test,expect} from '@playwright/test';
import {buildFluencySet} from '../src/fluency-engine.js';

test('opt-in maths editor checks exact fractions, retains answer through hint, and falls back offline',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/fluency/level-1/roots');
  const label=await page.locator('.fluency-seed').textContent();
  const seed=Number(label.replace('Set #','').trim());
  const set=buildFluencySet({topicId:'quadratics',levelId:'level-1',pageId:'roots',seed,count:6});
  await expect(page.locator('#fluency-answer')).toBeVisible();
  await page.getByRole('button',{name:'Use maths notation'}).click();
  await expect(page.locator('[data-math-source]')).toBeVisible();
  await page.locator('[data-math-source]').fill(String(set.questions[0].answer.values[0]));
  await page.getByRole('button',{name:'Show hint'}).click();
  await expect(page.locator('[data-math-source]')).toHaveValue(String(set.questions[0].answer.values[0]));
  await page.getByRole('button',{name:'Hide hint'}).click();
  const current=set.questions[0];
  if(current.answer.kind==='unordered'){
    const values=current.answer.values;
    await page.locator('[data-math-source]').fill(values.map(x=>String(x)).join(', '));
  }
  await page.getByRole('button',{name:'Check answer'}).click();
  await expect(page.locator('#fluency-feedback')).toContainText('Correct');
  await expect(page.locator('.fluency-next')).toBeVisible();
});
test('source entry and palette remain available at narrow widths',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.setViewportSize({width:320,height:760});
  await page.goto('/#/sampling/fluency/level-1');
  await page.getByRole('button',{name:'Use maths notation'}).click();
  await page.getByRole('button',{name:'Fraction'}).click();
  await expect(page.locator('[data-math-source]')).toHaveValue('\\frac{1}{2}');
  const sizes=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width+1);
  await page.getByRole('button',{name:'Use simple typing'}).click();
  await expect(page.locator('[data-math-input][data-active="false"]')).toBeVisible();
});
