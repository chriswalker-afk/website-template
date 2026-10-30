import {test,expect} from '@playwright/test';
import {writeWorking,notebookContains} from './notebook-helpers.js';

test('Big idea concept checks give specific feedback without duplicate headings',async({page})=>{
  for(const [topic,wrong,correct] of [
    ['sampling','surveyed','all-year-11'],
    ['quadratics','linear','quadratic']
  ]){
    await page.goto('/#/'+topic+'/understand/big-idea');
    await expect(page.locator('.book-page h1')).toHaveCount(1);
    await expect(page.locator('.page-subtitle')).toHaveCount(1);
    await expect(page.locator('.concept-check')).toHaveCount(1);
    await page.locator('button[data-action="understand-check"][data-choice="'+wrong+'"]').click();
    await expect(page.locator('.concept-check__feedback')).toContainText('Not yet.');
    await expect(page.locator('.concept-choice--selected')).toHaveCount(1);
    await page.locator('button[data-action="understand-check"][data-choice="'+correct+'"]').click();
    await expect(page.locator('.concept-check__feedback')).toContainText('Correct.');
    await expect(page.locator('.concept-check__feedback')).not.toContainText('Correct. Correct.');
    await expect(page.locator('.concept-check__feedback')).toHaveClass(/is-correct/);
    await page.getByRole('link',{name:'Next page'}).click();
    await expect(page.getByRole('heading',{name:'The big idea'})).toBeVisible();
    await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('The big idea');
  }
});
test('How it works reveals and resets meaningful mathematical steps',async({page})=>{
  await page.goto('/#/sampling/understand/how-it-works');
  await expect(page.locator('.method-walkthrough')).toBeVisible();
  await expect(page.locator('.explain-steps__meta')).toContainText('0 of 4');
  await page.getByRole('button',{name:'Show first step'}).click();
  await expect(page.locator('.explain-steps__meta')).toContainText('1 of 4');
  await expect(page.locator('.explain-steps__list li')).toHaveCount(1);
  await expect(page.locator('.explain-steps__list')).toContainText('30 ÷ 6 = 5');
  await page.getByRole('button',{name:'Previous step'}).click();
  await expect(page.locator('.explain-steps__list li')).toHaveCount(0);
  await page.getByRole('button',{name:'Show first step'}).click();
  for(let i=0;i<3;i++)await page.getByRole('button',{name:'Show next step'}).click();
  await expect(page.locator('.explain-steps__meta')).toContainText('4 of 4');
  await expect(page.locator('.explain-steps__list li')).toHaveCount(4);
  await page.getByRole('button',{name:'Start again'}).click();
  await expect(page.locator('.explain-steps__meta')).toContainText('0 of 4');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
  await expect(page.locator('.method-walkthrough')).toContainText('150 Year 10');
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('How it works');
});
test('quadratics How it works uses completed-square reasoning and avoids a graph editor',async({page})=>{
  await page.goto('/#/quadratics/understand/how-it-works');
  await expect(page.locator('.topic-panel')).toHaveCount(3);
  await page.locator('button[data-action="understand-check"][data-choice="square"]').click();
  await expect(page.locator('.concept-check__feedback')).toContainText('Correct.');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page.locator('.method-walkthrough')).toContainText('x² + 6x + 5');
  await page.getByRole('button',{name:'Show first step'}).click();
  await expect(page.locator('.explain-steps__list')).toContainText('Take half of 6');
  await expect(page.locator('#graph-svg')).toHaveCount(0);
});
test('Sampling lab supports census, simple random, systematic and convenience selections',async({page})=>{
  await page.goto('/#/sampling/understand/visual-explanations');
  await expect(page.locator('.sampling-lab')).toBeVisible();
  await expect(page.locator('.sampling-lab__population')).toHaveAttribute('role','img');
  await expect(page.locator('.population-person--selected')).toHaveCount(40);
  await expect(page.getByRole('button',{name:'Draw another sample'})).toBeDisabled();
  await page.locator('[data-action="sampling-method"][data-method="random"]').click();
  await expect(page.locator('.population-person--selected')).toHaveCount(10);
  await expect(page.getByRole('button',{name:'Draw another sample'})).toBeEnabled();
  const first=await page.locator('.sampling-lab__population').getAttribute('aria-label');
  await page.getByRole('button',{name:'Draw another sample'}).click();
  const second=await page.locator('.sampling-lab__population').getAttribute('aria-label');
  // Random group counts may coincide, so test selected identity rather than proportions alone.
  const selectedIndex=()=>page.locator('.population-person').evaluateAll(items=>items.map((x,i)=>
    x.classList.contains('population-person--selected')?i:-1).filter(i=>i>=0));
  const secondIndices=await selectedIndex();
  await page.getByRole('button',{name:'Draw another sample'}).click();
  expect(await selectedIndex()).not.toEqual(secondIndices);
  await page.locator('[data-action="sampling-method"][data-method="systematic"]').click();
  await expect(page.locator('.sampling-lab__interpretation')).toContainText('starting position');
  await expect(page.locator('.population-person--selected')).toHaveCount(10);
  await page.locator('[data-action="sampling-method"][data-method="convenience"]').click();
  await expect(page.locator('.sampling-lab__population')).toHaveAttribute('aria-label',/10 from A and 0 from B/);
  await expect(page.locator('.sampling-lab__interpretation')).toContainText('Group A');
  expect(first).toContain('Population of 40');
  expect(second).toContain('Population of 40');
});
test('stratified sampling always preserves the 40% / 60% population mix',async({page})=>{
  await page.goto('/#/sampling/understand/visual-explanations/proportion');
  await expect(page.locator('.sampling-method')).toHaveCount(2);
  await page.locator('[data-action="sampling-method"][data-method="stratified"]').click();
  await expect(page.locator('.sampling-lab__population')).toHaveAttribute('aria-label',/4 from A and 6 from B/);
  await expect(page.locator('.sampling-lab__compare')).toContainText('40%');
  await expect(page.locator('.sampling-lab__compare')).toContainText('60%');
  await page.getByRole('button',{name:'Draw another sample'}).click();
  await expect(page.locator('.sampling-lab__population')).toHaveAttribute('aria-label',/4 from A and 6 from B/);
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Visual explanations');
});
test('Show me → Help me → My turn retains writing and supports self-assessment',async({page})=>{
  await page.goto('/#/quadratics/understand/worked-examples');
  await expect(page.locator('.workshop-stage')).toHaveCount(3);
  await expect(page.locator('.workshop-stage__label')).toHaveText(['Show me','Help me','My turn']);
  await expect(page.locator('.explain-steps__meta')).toContainText('0 of 3');
  await page.getByRole('button',{name:'Show first step'}).click();
  await expect(page.locator('.explain-steps__list')).toContainText('h = −1');
  await page.locator('button[data-action="understand-guided"][data-choice="wrong-sign"]').click();
  await expect(page.locator('.workshop-stage .concept-check__feedback')).toContainText('Not yet.');
  await page.locator('button[data-action="understand-guided"][data-choice="correct"]').click();
  await expect(page.locator('.workshop-stage .concept-check__feedback')).toContainText('Correct.');
  await writeWorking(page,'The turning point is (-2, 7), a maximum.');
  await page.getByRole('button',{name:'Show hint'}).click();
  await notebookContains(page,'The turning point is (-2, 7), a maximum.');
  await expect(page.locator('.practice-question__hint')).toBeVisible();
  await page.getByRole('button',{name:'Compare with model solution'}).click();
  await expect(page.locator('.workshop-stage__model li')).toHaveCount(3);
  await notebookContains(page,'The turning point is (-2, 7), a maximum.');
  await page.getByRole('button',{name:'I can do this'}).click();
  await expect(page.locator('.workshop-stage__rating-note')).toContainText('confident');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page.getByRole('heading',{name:'Worked examples'})).toBeVisible();
  await page.getByRole('link',{name:'Previous page'}).click();
  await notebookContains(page,'The turning point is (-2, 7), a maximum.');
  await expect(page.locator('.workshop-stage__rating-note')).toContainText('confident');
});
test('Sampling worked examples support qualitative written responses without false automatic grading',async({page})=>{
  await page.goto('/#/sampling/understand/worked-examples/bias');
  await expect(page.locator('.workshop-stage')).toHaveCount(3);
  await writeWorking(page,'The sample excludes students who do not attend.');
  await page.getByRole('button',{name:'Compare with model solution'}).click();
  await expect(page.locator('.workshop-stage__model')).toContainText('The sample excludes students');
  await expect(page.locator('.workshop-stage__model')).toContainText('Compare your working');
  await expect(page.locator('.workshop-stage__model')).not.toContainText('Correct answer');
  await page.getByRole('button',{name:'I need more practice'}).click();
  await expect(page.locator('.workshop-stage__rating-note')).toContainText('review');
});
for(const width of [320,390,768,1024,1440]){
  test('Understand interactions fit '+width+'px without horizontal overflow',async({page})=>{
    await page.setViewportSize({width,height:850});
    for(const path of [
      '/#/sampling/understand/big-idea',
      '/#/sampling/understand/how-it-works',
      '/#/sampling/understand/visual-explanations',
      '/#/quadratics/understand/visual-explanations/position',
      '/#/quadratics/understand/worked-examples'
    ]){
      await page.goto(path);
      await expect(page.locator('#page-title')).toBeVisible();
      if(path.endsWith('worked-examples')){
        await page.getByRole('button',{name:'Compare with model solution'}).click();
      }
      if(width<=390&&path.endsWith('visual-explanations')){
        const table=page.locator('.sampling-lab__compare');
        const layout=await table.evaluate(node=>({
          scroll:node.scrollWidth,width:node.clientWidth
        }));
        expect(layout.scroll).toBeLessThanOrEqual(layout.width+1);
      }
      const measure=await page.evaluate(()=>({
        width:document.documentElement.scrollWidth,
        viewport:window.innerWidth
      }));
      expect(measure.width,'overflow at '+width+' on '+path).toBeLessThanOrEqual(measure.viewport+1);
    }
  });
}
test('keyboard and reduced motion remain usable throughout Understand',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/sampling/understand/big-idea');
  const button=page.locator('button[data-action="understand-check"]').first();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.concept-check__feedback')).toBeVisible();
  await page.goto('/#/sampling/understand/how-it-works');
  await page.getByRole('button',{name:'Show first step'}).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.explain-steps__list li')).toHaveCount(1);
  await page.goto('/#/sampling/understand/visual-explanations');
  await page.locator('button[data-action="sampling-method"][data-method="random"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.population-person--selected')).toHaveCount(10);
  await expect(page.locator('.book-page')).toBeVisible();
});
