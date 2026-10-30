import {test,expect} from '@playwright/test';
import {writeWorking,notebookContains} from './notebook-helpers.js';

test('Fluency has one working notebook and a distinct final-answer field',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/sampling/fluency/level-1');
  await expect(page.locator('#fluency-answer')).toBeVisible();
  await expect(page.locator('#fluency-working')).toHaveCount(0);
  await expect(page.getByText('Working space (optional)')).toHaveCount(0);
  await expect(page.locator('details[data-working-notebook]')).toHaveCount(1);
  await writeWorking(page,'10% of 420 = 42');
  await page.getByRole('button',{name:'Show hint'}).click();
  await notebookContains(page,'10% of 420 = 42');
  await expect(page.locator('#fluency-answer')).toBeVisible();
});
