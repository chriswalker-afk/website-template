import {test,expect} from '@playwright/test';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {buildSite,PROJECT_ROOT} from '../scripts/build-site.mjs';
const name='dist/ci-standalone-quadratics';
test.beforeAll(async()=>{
  await buildSite({topicId:'quadratics',draft:true,outputDirectory:name});
});
test.afterAll(async()=>{
  await rm(join(PROJECT_ROOT,name),{recursive:true,force:true});
});
test('a standalone preview only exposes the selected topic, with explicit draft warning',async({page})=>{
  await page.goto('/dist/ci-standalone-quadratics/index.html#/quadratics/home');
  await expect(page.locator('.authoring-banner')).toContainText('DRAFT PREVIEW');
  await expect(page.locator('#topic-switcher')).toHaveCount(1);
  await expect(page.locator('.topic-switcher')).toBeHidden();
  await expect(page.locator('.brand__wordmark')).toContainText('Quadratic Functions');
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
  await expect(page.locator('.contents-cover')).toContainText('Quadratic Functions');
  await page.goto('/dist/ci-standalone-quadratics/index.html#/sampling/home');
  await expect(page).toHaveURL(/#\/quadratics\/home/);
  await expect(page.locator('.contents-cover')).toContainText('Quadratic Functions');
});
test('the hub still offers both published topics and has no draft warning',async({page})=>{
  await page.goto('/#/sampling/home');
  await expect(page.locator('.authoring-banner')).toHaveCount(0);
  await expect(page.locator('#topic-switcher option')).toHaveCount(2);
  await page.locator('#topic-switcher').selectOption('quadratics');
  await expect(page).toHaveURL(/#\/quadratics\/home/);
});
