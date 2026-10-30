import {test,expect} from '@playwright/test';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {buildSite,PROJECT_ROOT} from '../scripts/build-site.mjs';
import {expectReadingContains} from './math-assertions.js';
const dir='dist/ci-gradient-published';
test.beforeAll(async()=>{
  await buildSite({topicId:'gradient',draft:false,outputDirectory:dir});
});
test.afterAll(async()=>{
  await rm(join(PROJECT_ROOT,dir),{recursive:true,force:true});
});
test('published Gradient is a complete standalone site with no unrelated topics',async({page})=>{
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto('/dist/ci-gradient-published/index.html#/gradient/home');
  await expect(page.locator('.authoring-banner')).toHaveCount(0);
  await expect(page.locator('.topic-switcher')).toBeHidden();
  await expect(page.locator('#topic-switcher option')).toHaveCount(1);
  await expect(page.locator('.contents-cover')).toContainText('Gradient');
  await expect(page.locator('.contents-list li')).toHaveCount(6);
  await expect(page.locator('.worksheet-resource')).toHaveCount(1);
  await page.goto('/dist/ci-gradient-published/index.html#/quadratics/home');
  await expect(page).toHaveURL(/#\/gradient\/home/);
  expect(errors).toEqual([]);
});
test('Foundation content displays a grid, clear notation and a functioning gradient slider',async({page})=>{
  await page.goto('/dist/ci-gradient-published/index.html#/gradient/understand/big-idea');
  await expect(page.locator('.mini-curve[role="img"]')).toHaveCount(1);
  await expect(page.getByText('Gradient tells you the vertical change', {exact:false})).toBeVisible();
  await page.goto('/dist/ci-gradient-published/index.html#/gradient/understand/visual-explanations');
  await expect(page.locator('input[data-graph="m"]')).toHaveCount(1);
  await expect(page.locator('#graph-svg')).toHaveAttribute('aria-label',/Gradient|Graph of/);
  await page.locator('input[data-graph="m"]').evaluate(el=>{
    el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expectReadingContains(page.locator('#graph-observation'),'Gradient 2');
  await page.getByRole('button',{name:'Reset line'}).click();
  await expectReadingContains(page.locator('#graph-observation'),'Gradient -1');
});
test('the core learning modes and printable resource are populated',async({page})=>{
  const root='/dist/ci-gradient-published/index.html';
  const checks=[
    ['#/gradient/memorise/flashcards','Gradient'],
    ['#/gradient/fluency/level-1','Guided'],
    ['#/gradient/reasoning/explain','Explain'],
    ['#/gradient/problemSolving/level-1','Guided'],
    ['#/gradient/modelling/level-1','Guided'],
    ['#/gradient/resources/worksheet-generator','Worksheet Generator']
  ];
  for(const [hash,name] of checks){
    await page.goto(root+hash);
    await expect(page.locator('#page-title')).toBeVisible();
    await expect(page.locator('body')).toContainText(name);
    await expect(page.locator('.noscript')).toHaveCount(0);
  }
});
