import {test,expect} from '@playwright/test';
import {expectReadingContains} from './math-assertions.js';
test('configured diagrams and the original quadrant graph remain accessible',async({page})=>{
  await page.goto('/#/sampling/understand/big-idea');
  await expect(page.locator('.dot-field[role="img"]')).toHaveCount(1);
  await expect(page.locator('.dot--chosen')).toHaveCount(8);
  await page.goto('/#/quadratics/understand/big-idea');
  await expect(page.locator('.mini-curve[role="img"]')).toHaveCount(1);
  await page.goto('/#/quadratics/understand/visual-explanations');
  await expect(page.locator('#graph-svg')).toHaveAttribute('aria-label',/Graph of/);
  await page.locator('input[data-graph="magnitude"]').evaluate(el=>{
    el.value='1.5';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expectReadingContains(page.locator('#equation-display'),'1.5x²');
  await page.getByRole('button',{name:'Flip opening direction'}).click();
  await expectReadingContains(page.locator('#graph-observation'),'Opens downwards');
  await page.getByRole('button',{name:'Reset graph'}).click();
  await expectReadingContains(page.locator('#equation-display'),'y = x²');
});
test('topic-scoped graph pages keep independent slider states',async({page})=>{
  await page.goto('/#/quadratics/understand/visual-explanations/position');
  await page.locator('input[data-graph="h"]').evaluate(el=>{
    el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expectReadingContains(page.locator('#equation-display'),'x − 3');
  await page.goto('/#/quadratics/understand/visual-explanations');
  await expectReadingContains(page.locator('#equation-display'),'y = x²');
  await page.goto('/#/quadratics/understand/visual-explanations/position');
  await expect(page.locator('input[data-graph="h"]')).toHaveValue('3');
});
test('configurable sampling retains correct counts and alternative methods',async({page})=>{
  await page.goto('/#/sampling/understand/visual-explanations');
  await expect(page.locator('.sampling-lab__population')).toHaveAttribute('aria-label',/Population of 40/);
  await page.getByRole('button',{name:'Simple random'}).click();
  await expect(page.locator('.population-person--selected')).toHaveCount(10);
  await page.getByRole('button',{name:'Systematic'}).click();
  await expect(page.locator('.sampling-lab__interpretation')).toContainText('random starting position');
  await page.goto('/#/sampling/understand/visual-explanations/proportion');
  await page.getByRole('button',{name:'Stratified'}).click();
  await expect(page.locator('.sampling-lab__population')).toHaveAttribute('aria-label',/4 from A and 6 from B/);
});
