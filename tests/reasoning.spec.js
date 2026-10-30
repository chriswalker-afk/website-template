import {test,expect} from '@playwright/test';
import {REASONING_CHAPTERS} from '../src/reasoning-content.js';
import {writeWorking,notebookContains,confirmReasoning,openNotebook} from './notebook-helpers.js';

const modes=['explain','justify','critique','generalise'];
async function open(page,topic='sampling',mode='explain'){
  await page.goto('/#/'+topic+'/reasoning/'+mode);
}
async function compare(page){
  await page.getByRole('button',{name:'Compare with worked argument'}).click();
}
async function completeFirst(page,text='This argument uses the correct mathematical rule and explains why the conclusion follows.'){
  await writeWorking(page,text);
  await confirmReasoning(page);
  await compare(page);
  for(let i=0;i<3;i++)await page.locator('input[data-reasoning-criterion="'+i+'"]').check();
  await page.getByRole('button',{name:'Ready to move on'}).click();
}
test('Reasoning has four distinct subsections, one introduction and its own internal prompts',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    for(const mode of modes){
      await open(page,topic,mode);
      const current=REASONING_CHAPTERS[topic].find(s=>s.id===mode);
      await expect(page.locator('.side-tab')).toHaveCount(4);
      await expect(page.getByRole('heading',{name:current.label,exact:true})).toBeVisible();
      await expect(page.locator('.book-page h1')).toHaveCount(1);
      await expect(page.locator('.page-subtitle')).toHaveCount(1);
      await expect(page.locator('.page-navigation')).toHaveCount(0);
      await expect(page.locator('.practice-question')).toHaveCount(0);
      await expect(page.locator('.fluency-question')).toHaveCount(0);
      await expect(page.locator('#graph-svg')).toHaveCount(0);
      await expect(page.locator('.reasoning-task')).toBeVisible();
      await expect(page.locator('.reasoning-task-prompt')).toHaveText(current.pages[0].tasks[0].prompt);
      await expect(page.locator('.reasoning-task-meta')).toContainText('Prompt 1 of 4');
      await expect(page.locator('.side-tab[aria-current="page"]')).toContainText(current.label);
      await expect(page.locator('.reasoning-review-panel')).toHaveCount(0);
    }
  }
});
test('student writes, gets optional nudge, compares mathematical argument, then self-reviews',async({page})=>{
  await open(page);
  const task=REASONING_CHAPTERS.sampling[0].pages[0].tasks[0];
  await expect(page.getByRole('button',{name:'Ready to move on'})).toHaveCount(0);
  await writeWorking(page,
    'The library-only sample excludes pupils elsewhere, who might prefer different meals.');
  await confirmReasoning(page);
  await page.getByRole('button',{name:'Need a nudge?'}).click();
  await expect(page.locator('.reasoning-hint')).toContainText(task.hint);
  await expect(page.locator('.reasoning-hint')).toContainText(task.starter);
  await notebookContains(page,'The library-only sample');
  await page.getByRole('button',{name:'Hide nudge'}).click();
  await notebookContains(page,'The library-only sample');
  await compare(page);
  await expect(page.locator('.reasoning-model-steps li')).toHaveCount(3);
  await expect(page.locator('.reasoning-model-steps')).toContainText(task.model[0]);
  await expect(page.locator('.reasoning-criterion')).toHaveCount(3);
  await expect(page.locator('.reasoning-next-steps')).toContainText(task.criteria[0].next);
  await expect(page.getByRole('button',{name:'Ready to move on'})).toBeDisabled();
  await page.locator('input[data-reasoning-criterion="0"]').check();
  await expect(page.locator('.reasoning-check-heading')).toContainText('1 of 3');
  await expect(page.locator('.reasoning-next-steps')).toContainText(task.criteria[1].next);
  await page.locator('input[data-reasoning-criterion="1"]').check();
  await page.locator('input[data-reasoning-criterion="2"]').check();
  await expect(page.getByRole('button',{name:'Ready to move on'})).toBeEnabled();
  await page.getByRole('button',{name:'Ready to move on'}).click();
  await expect(page.locator('.reasoning-saved')).toContainText('Ready to move on');
  await expect(page.locator('.reasoning-pulse')).toContainText('self-rated ready');
  await expect(page.locator('input[data-reasoning-criterion="0"]')).toBeDisabled();
  const saved=await page.evaluate(()=>localStorage.getItem('maths-notebook-pass1a:reasoning:sampling'));
  const record=JSON.parse(saved).records['explain:library-frame'];
  expect(record.rating).toBe('ready');
  expect(record.checked).toBe(3);
  expect(record.assisted).toBe(true);
  expect(record.modelFirst).toBe(false);
  expect(saved).not.toContain('library-only sample excludes');
  await page.getByRole('button',{name:'Next prompt'}).click();
  await expect(page.locator('.reasoning-task-meta')).toContainText('Prompt 2 of 4');
  await expect(page.locator('.reasoning-task-prompt')).toHaveText(
    REASONING_CHAPTERS.sampling[0].pages[0].tasks[1].prompt);
  await expect(page).toHaveURL(/sampling\/reasoning\/explain$/);
});
test('students can view a model without an attempt but cannot claim independent readiness',async({page})=>{
  await open(page,'quadratics','justify');
  await compare(page);
  await expect(page.locator('.reasoning-note')).toHaveCount(1);
  await expect(page.locator('.reasoning-note')).toContainText('before an independent written attempt');
  await expect(page.locator('.reasoning-note')).toContainText('supported example');
  await expect(page.getByRole('button',{name:'Ready to move on'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Still developing'})).toBeDisabled();
  await page.getByRole('button',{name:'Review again'}).click();
  await expect(page.locator('.reasoning-saved')).toContainText('Review again');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:reasoning:quadratics')));
  expect(saved.records['justify:no-real-roots']).toMatchObject({
    rating:'revisit',attempted:false,modelFirst:true
  });
  await page.getByRole('button',{name:'Next prompt'}).click();
  await expect(page.locator('.reasoning-task-prompt')).toContainText('x² − 6x + 9');
});
test('self-review distinguishes developing from ready and supports targeted corrections',async({page})=>{
  await open(page,'quadratics','critique');
  const task=REASONING_CHAPTERS.quadratics[2].pages[0].tasks[0];
  await writeWorking(page,
    'The horizontal coordinate is negative three, not positive three, because the bracket is x plus three.');
  await confirmReasoning(page);
  await compare(page);
  await expect(page.locator('.reasoning-model-steps')).toContainText('(−3, −2)');
  await page.locator('input[data-reasoning-criterion="0"]').check();
  await expect(page.locator('.reasoning-next-steps')).toContainText(task.criteria[1].next);
  await page.getByRole('button',{name:'Still developing'}).click();
  await expect(page.locator('.reasoning-saved')).toContainText('Still developing');
  const storage=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:reasoning:quadratics')));
  expect(storage.records['critique:sign-vertex']).toMatchObject({
    rating:'developing',checked:1,attempted:true
  });
  await page.locator('.side-tabs').getByRole('link',{name:'Explain'}).click();
  await expect(page.locator('.reasoning-pulse')).toContainText('0 / 4 reviewed');
});
test('mode switch confirms that unfinished student writing would be lost',async({page})=>{
  await open(page);
  await writeWorking(page,'A student writes a draft explanation of how sampling works.');
  await confirmReasoning(page);
  await page.getByRole('button',{name:'Needs another look'}).click();
  await expect(page.locator('.reasoning-confirm')).toContainText('current self-review confirmations');
  await page.getByRole('button',{name:'Keep writing'}).click();
  await notebookContains(page,'A student writes a draft explanation of how sampling works.');
  await page.getByRole('button',{name:'Needs another look'}).click();
  await page.getByRole('button',{name:'Change practice'}).click();
  await notebookContains(page,'A student writes a draft explanation of how sampling works.');
  await expect(page.locator('.reasoning-modes [data-mode="focus"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.reasoning-task-meta')).toContainText('Prompt 1 of 4');
});
test('students can finish, see a self-review summary and retry weaker tasks',async({page})=>{
  await open(page,'sampling','critique');
  const ids=REASONING_CHAPTERS.sampling[2].pages[0].tasks.map(t=>t.id);
  await completeFirst(page,'The statement is too broad because sample size alone does not make the selection representative.');
  await page.getByRole('button',{name:'Next prompt'}).click();
  for(let i=1;i<4;i++){
    await compare(page);
    await page.getByRole('button',{name:'Review again'}).click();
    await page.getByRole('button',{name:i===3?'Finish this set':'Next prompt'}).click();
  }
  await expect(page.locator('.reasoning-complete')).toBeVisible();
  await expect(page.locator('.reasoning-complete__stats')).toContainText('3');
  await page.locator('.reasoning-review-list summary').click();
  await expect(page.locator('.reasoning-review-list li')).toHaveCount(4);
  await page.getByRole('button',{name:'Revisit weaker prompts'}).click();
  await expect(page.locator('.reasoning-task-meta')).toContainText('Prompt 1 of 3');
  await expect(page.locator('.reasoning-task-prompt')).toHaveText(
    REASONING_CHAPTERS.sampling[2].pages[0].tasks[1].prompt);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:reasoning:sampling')));
  expect(stored.records['critique:'+ids[0]].rating).toBe('ready');
  await page.getByRole('button',{name:'All prompts'}).click();
  await expect(page.locator('.reasoning-task-meta')).toContainText('Prompt 1 of 4');
});
test('all-ready sections show an informative empty focus state without a dead end',async({page})=>{
  await open(page,'quadratics','generalise');
  for(let i=0;i<4;i++){
    await completeFirst(page,'This follows from the algebraic identity and holds under the stated conditions for all real inputs.');
    await page.getByRole('button',{name:i===3?'Finish this set':'Next prompt'}).click();
  }
  await page.getByRole('button',{name:'Revisit weaker prompts'}).click();
  await expect(page.locator('.reasoning-empty')).toContainText('Nothing currently needs another look');
  await page.getByRole('button',{name:'All prompts'}).click();
  await expect(page.locator('.reasoning-task-prompt')).toBeVisible();
});
test('saved self-review stays separate from locally saved mathematical notebook work',async({page})=>{
  await open(page,'sampling','generalise');
  await writeWorking(page,'<script>alert("student answer")</script> Explanation about fractions and proportional allocation.');
  await confirmReasoning(page);
  await page.getByRole('button',{name:'Need a nudge?'}).click();
  await compare(page);
  await page.locator('input[data-reasoning-criterion="0"]').check();
  await expect(page.locator('.reasoning-workspace script')).toHaveCount(0);
  await notebookContains(page,'<script>alert');
  await page.getByRole('button',{name:'Still developing'}).click();
  const notebookKey=await page.locator('details[data-working-notebook]').getAttribute('data-scope');
  const localNotebook=await page.evaluate(key=>localStorage.getItem('maths-notebook:working:v1:'+key),notebookKey);
  expect(localNotebook).toContain('student answer');
  const saved=await page.evaluate(()=>localStorage.getItem('maths-notebook-pass1a:reasoning:sampling'));
  expect(JSON.parse(saved).records['generalise:allocation-rule'].rating).toBe('developing');
  await page.reload();
  await notebookContains(page,'A student writes a draft explanation of how sampling works.');
  await notebookContains(page,'student answer');
  await expect(page.locator('.reasoning-pulse')).toContainText('1 / 4 reviewed');
  await page.getByRole('button',{name:'Needs another look'}).click();
  await expect(page.locator('.reasoning-task-prompt')).toContainText('For strata of sizes');
  await open(page,'quadratics','generalise');
  await expect(page.locator('.reasoning-pulse')).toContainText('0 / 4 reviewed');
});
test('the written answer cannot accidentally trigger form submission or a fake marking score',async({page})=>{
  await open(page);
  await writeWorking(page,'x = 2 and this is the conclusion.\nThe next line is why it follows.');
  await page.locator('[data-book-kind="text"]').last().press('Enter');
  await notebookContains(page,'The next line');
  await expect(page.locator('.reasoning-task-meta')).toContainText('Prompt 1 of 4');
  await expect(page.locator('.reasoning-workspace')).not.toContainText('100% mastery');
  await expect(page.locator('.reasoning-workspace')).not.toContainText('Auto-graded');
  await expect(page.locator('.reasoning-review-panel')).toHaveCount(0);
});
test('written mathematics, model steps and navigation remain keyboard accessible',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,'quadratics','explain');
  await openNotebook(page);
  await page.locator('[data-book-action="add-text"]').click();
  await page.locator('[data-book-kind="text"]').last().focus();
  await page.keyboard.type('For every real x, a squared term is nonnegative and so a negative coefficient gives an upper bound.');
  await confirmReasoning(page);
  await page.getByRole('button',{name:'Compare with worked argument'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.reasoning-review-panel')).toBeVisible();
  await page.locator('input[data-reasoning-criterion="0"]').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.reasoning-check-heading')).toContainText('1 of 3');
  await page.getByRole('button',{name:'Still developing'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.reasoning-saved')).toContainText('Still developing');
  const duration=await page.locator('.reasoning-task').evaluate(el=>getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)||0).toBeLessThanOrEqual(.01);
});
for(const width of [320,390,768,1024,1440]){
  test('all eight Reasoning subsections and worked-argument views fit at '+width+'px',async({page})=>{
    test.setTimeout(60000);
    await page.setViewportSize({width,height:850});
    for(const topic of ['sampling','quadratics']){
      for(const mode of modes){
        await open(page,topic,mode);
        await expect(page.locator('.reasoning-task')).toBeVisible();
        await expect(page.locator('.book-page h1')).toHaveCount(1);
        await expect(page.locator('.page-subtitle')).toHaveCount(1);
        const dimensions=await page.evaluate(()=>({
          scroll:document.documentElement.scrollWidth,width:innerWidth
        }));
        expect(dimensions.scroll,topic+' '+mode+' @ '+width).toBeLessThanOrEqual(dimensions.width+1);
      }
    }
    await open(page,'quadratics','generalise');
    await compare(page);
    const values=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    expect(values.scroll).toBeLessThanOrEqual(values.width+1);
  });
}
