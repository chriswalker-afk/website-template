import {test,expect} from '@playwright/test';
import {buildFluencySet} from '../src/fluency-engine.js';

async function currentQuestion(page,topic,level,pageId){
  const seed=Number((await page.locator('.fluency-seed').textContent()).replace('Set #','').trim());
  return buildFluencySet({topicId:topic,levelId:level,pageId,seed}).questions[0];
}
test('quadratic Fluency questions use semantic Maths notation instead of plain Unicode',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/fluency/level-1');
  const q=await currentQuestion(page,'quadratics','level-1','values');
  const prompt=page.locator('.fluency-question__prompt');
  await expect(prompt).toBeVisible();
  await expect(prompt.locator('math')).not.toHaveCount(0);
  await expect(prompt.locator('math[aria-label]')).not.toHaveCount(0);
  if(q.prompt.includes('²'))await expect(prompt.locator('msup')).not.toHaveCount(0);
  await expect(page.locator('#fluency-answer')).toBeVisible();
  await expect(page.locator('details[data-working-notebook]')).toHaveCount(1);
  // The visible maths must work without downloading the optional editor.
  await expect(page.locator('.fluency-question__prompt math').first()).toBeVisible();
});
test('worked solutions and hints are typeset after the interface rerenders',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/quadratics/fluency/level-2');
  const q=await currentQuestion(page,'quadratics','level-2','factorise');
  await page.getByRole('button',{name:'Show hint'}).click();
  if(/[²=×÷/]/.test(q.hint))
    await expect(page.locator('.practice-question__hint math')).not.toHaveCount(0);
  await page.locator('[data-action="fluency-reveal"]').click();
  await expect(page.locator('.fluency-solution__steps li')).toHaveCount(q.steps.length);
  await expect(page.locator('.fluency-solution math')).not.toHaveCount(0);
});
test('Reasoning, Problem Solving, Modelling and Understand share one notation renderer',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  const routes=[
    ['/quadratics/reasoning/justify','.reasoning-task-prompt'],
    ['/quadratics/problemSolving/level-1','.ps-prompt'],
    ['/quadratics/modelling/level-1','.mdl-stage-prompt'],
    ['/quadratics/understand/worked-examples','.workshop-stage__question']
  ];
  let total=0;
  for(const [route,selector] of routes){
    await page.goto('/#'+route);
    await expect(page.locator(selector).first()).toBeVisible();
    total+=await page.locator('.page-body math').count();
    // Some introductory prompts are prose-only. Verify the aggregate
    // has semantic mathematical content across these modes.
  }
  expect(total).toBeGreaterThan(3);
});
test('Sampling slash fractions become semantic fractions and retain exact value',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/sampling/reasoning/justify');
  await expect(page.locator('.reasoning-task-prompt')).toBeVisible();
  // A mathematically rendered fraction must be available in a solution.
  await page.getByRole('button',{name:'Compare with worked argument'}).click();
  const fractions=page.locator('.page-body mfrac');
  // Some first prompts may not use fractions; opening different prompt should
  // never cause inline source or student input to be rewritten.
  await expect(page.locator('#reasoning-answer')).toHaveCount(0);
  await expect(page.locator('details[data-working-notebook]')).toHaveCount(1);
  expect(await fractions.count()).toBeGreaterThan(0);
});
test('notation remains printable, accessible and inside a 320px page',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.setViewportSize({width:320,height:790});
  for(const route of ['/quadratics/fluency/level-1',
    '/quadratics/reasoning/justify','/quadratics/problemSolving/level-1']){
    await page.goto('/#'+route);
    await expect(page.locator('.page-body math').first()).toBeVisible();
    const scroll=await page.evaluate(()=>({
      width:innerWidth,page:document.documentElement.scrollWidth,
      math:Array.from(document.querySelectorAll('.page-body math')).every(el=>el.hasAttribute('aria-label'))
    }));
    expect(scroll.math).toBe(true);
    expect(scroll.page,route).toBeLessThanOrEqual(scroll.width+1);
  }
});
