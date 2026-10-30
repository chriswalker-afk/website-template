import {test,expect} from '@playwright/test';
import {openNotebook,writeWorking,notebookContains} from './notebook-helpers.js';

test('Fluency shows one working notebook and retains a separate final answer',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  await page.goto('/#/sampling/fluency/level-1');
  await expect(page.locator('#fluency-answer')).toBeVisible();
  await expect(page.locator('#fluency-working')).toHaveCount(0);
  await expect(page.getByText('Working space (optional)')).toHaveCount(0);
  await expect(page.locator('details[data-working-notebook]')).toHaveCount(1);
  await writeWorking(page,'10% of 420 is 42.');
  await expect(page.locator('#fluency-answer')).toBeVisible();
  await page.getByRole('button',{name:'Show hint'}).click();
  await notebookContains(page,'10% of 420 is 42.');
});
test('extended-response modes use the notebook as their sole working surface',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  const modes=[
    {route:'/quadratics/understand/worked-examples',obsolete:['#own-response']},
    {route:'/quadratics/reasoning/justify',obsolete:['#reasoning-answer']},
    {route:'/quadratics/problemSolving/level-1',obsolete:['#ps-plan','#ps-work']},
    {route:'/quadratics/modelling/level-1',obsolete:['#mdl-answer']}
  ];
  for(const mode of modes){
    await page.goto('/#'+mode.route);
    for(const obsolete of mode.obsolete)await expect(page.locator(obsolete)).toHaveCount(0);
    const book=await openNotebook(page);
    await expect(book.locator('[data-book-kind="math"]')).toHaveCount(1);
    await book.locator('[data-book-action="add-text"]').click();
    await expect(book.locator('[data-book-kind="text"]')).toHaveCount(1);
    await expect(page.locator('details[data-working-notebook]')).toHaveCount(1);
  }
});
