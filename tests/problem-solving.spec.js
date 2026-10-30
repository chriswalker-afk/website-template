import {test,expect} from '@playwright/test';
import {expectReadingText,expectReadingContains} from './math-assertions.js';
import {PROBLEM_SOLVING_CHAPTERS} from '../src/problem-solving-content.js';
import {writeWorking,notebookContains,notebookEmpty,confirmProblem,openNotebook} from './notebook-helpers.js';
const plan='The known conditions suggest using a suitable form, then substituting to find an unknown.';
const working='I set up the expression, solved for the remaining values, and checked the original conditions.';
const tasks=(topic,level,pageId)=>PROBLEM_SOLVING_CHAPTERS[topic]
  .find(l=>l.id===level).pages.find(p=>p.id===pageId).tasks;
async function open(page,topic='quadratics',level='level-1',pageId=null){
  await page.goto('/#/'+topic+'/problemSolving/'+level+(pageId?'/'+pageId:''));
}
async function inputAttempt(page){
  await writeWorking(page,plan+'\n'+working);
  await confirmProblem(page);
}
async function revealAll(page,problem){
  for(let i=0;i<problem.steps.length;i++)
    await page.getByRole('button',{name:i?'Reveal next worked step':'Reveal first worked step'}).click();
}
async function checkAll(page){
  for(let i=0;i<3;i++)await page.locator('input[data-ps-criterion="'+i+'"]').check();
}
test('Problem Solving is available for both topics with four right tabs and book pages',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    for(const level of ['level-1','level-2','level-3','level-4']){
      await open(page,topic,level);
      const section=PROBLEM_SOLVING_CHAPTERS[topic].find(x=>x.id===level);
      await expect(page.getByRole('heading',{name:section.label})).toBeVisible();
      await expect(page.locator('.side-tab')).toHaveCount(4);
      await expect(page.locator('.side-tab[aria-current="page"]')).toContainText(section.label);
      await expect(page.locator('.book-page h1')).toHaveCount(1);
      await expect(page.locator('.page-subtitle')).toHaveCount(1);
      await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
      await expect(page.locator('.ps-case')).toBeVisible();
      await expectReadingText(page.locator('.ps-prompt'),section.pages[0].tasks[0].prompt);
      await expect(page.locator('.practice-question')).toHaveCount(0);
      await expect(page.locator('.fluency-question')).toHaveCount(0);
      await expect(page.locator('.reasoning-task')).toHaveCount(0);
      await expect(page.locator('#graph-svg')).toHaveCount(0);
      await page.getByRole('link',{name:'Next page'}).click();
      await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
      await expect(page.locator('.side-tab[aria-current="page"]')).toContainText(section.label);
      await expectReadingText(page.locator('.ps-prompt'),section.pages[1].tasks[0].prompt);
    }
  }
});
test('guided start, strategy feedback and staged hints preserve planning notes',async({page})=>{
  await open(page,'sampling','level-1');
  const first=tasks('sampling','level-1','allocations')[0];
  await expect(page.locator('.ps-first-decision')).toContainText(first.plan);
  await inputAttempt(page);
  await page.getByRole('button',{name:'Compare possible strategies'}).click();
  await expect(page.locator('.ps-strategy-options button')).toHaveCount(2);
  await page.locator('button[data-action="ps-choice"][data-choice="s2"]').click();
  await expect(page.locator('.ps-strategy-feedback')).toHaveText(first.options[1].feedback);
  await notebookContains(page,plan);
  await notebookContains(page,working);
  await page.getByRole('button',{name:'Get a nudge'}).click();
  await expectReadingContains(page.locator('.ps-hints'),first.hints[0]);
  await page.getByRole('button',{name:'Get a stronger hint'}).click();
  await expect(page.locator('.ps-hints p')).toHaveCount(2);
  await expectReadingContains(page.locator('.ps-hints'),first.hints[1]);
  await notebookContains(page,working);
  await expect(page.getByRole('button',{name:'Both hints shown'})).toBeDisabled();
  await revealAll(page,first);
  await checkAll(page);
  await expect(page.getByRole('button',{name:'Solved independently'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Solved with support'})).toBeEnabled();
  await page.getByRole('button',{name:'Solved with support'}).click();
  await expect(page.locator('.ps-status')).toContainText('Solved with support (self-rated)');
  const stored=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:problem-solving:sampling')));
  expect(stored.records['level-1:allocations:two-years']).toMatchObject({
    rating:'supported',assisted:true,checks:3,attempted:true,modelFirst:false
  });
  expect(JSON.stringify(stored)).not.toContain(plan);
  expect(JSON.stringify(stored)).not.toContain(working);
});
test('opening strategy suggestions alone prevents an independent self-rating',async({page})=>{
  await open(page,'quadratics','level-1');
  await inputAttempt(page);
  await page.getByRole('button',{name:'Compare possible strategies'}).click();
  await expect(page.locator('.ps-strategy-options')).toBeVisible();
  await page.getByRole('button',{name:'Hide strategies'}).click();
  await revealAll(page,tasks('quadratics','level-1','roots-and-intercept')[0]);
  await checkAll(page);
  await expect(page.getByRole('button',{name:'Solved independently'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Solved with support'})).toBeEnabled();
  await page.getByRole('button',{name:'Solved with support'}).click();
  const record=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:problem-solving:quadratics'))
    .records['level-1:roots-and-intercept:two-roots-intercept']);
  expect(record.assisted).toBe(true);
});
test('unattempted problem can be revealed and self-rated for retry without false success',async({page})=>{
  await open(page,'quadratics','level-3');
  const first=tasks('quadratics','level-3','constraints')[0];
  await expect(page.locator('.ps-first-decision')).toHaveCount(0);
  await expect(page.locator('.ps-review')).toHaveCount(0);
  await page.getByRole('button',{name:'Reveal first worked step'}).click();
  await expect(page.locator('.ps-model-warning')).toContainText('before completing a written attempt');
  await expect(page.locator('.ps-worked li')).toHaveCount(1);
  await expectReadingContains(page.locator('.ps-worked'),first.steps[0]);
  await expect(page.getByRole('button',{name:'Solved independently'})).toHaveCount(0);
  for(let i=1;i<first.steps.length;i++){
    await page.getByRole('button',{name:'Reveal next worked step'}).click();
    await expect(page.locator('.ps-worked li')).toHaveCount(i+1);
  }
  await expect(page.locator('.ps-criterion')).toHaveCount(3);
  await expect(page.getByRole('button',{name:'Solved independently'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Solved with support'})).toBeDisabled();
  await page.getByRole('button',{name:'Retry this problem'}).click();
  await expect(page.locator('.ps-status')).toContainText('Retry this problem');
  const saved=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:problem-solving:quadratics')));
  expect(saved.records['level-3:constraints:roots-and-height']).toMatchObject({
    rating:'retry',attempted:false,modelFirst:true,assisted:false
  });
});
test('full independent work, step comparison and three checks allow self-rating independently',async({page})=>{
  await open(page,'quadratics','level-2');
  const problem=tasks('quadratics','level-2','form-choice')[0];
  await inputAttempt(page);
  await revealAll(page,problem);
  await expect(page.locator('.ps-model-warning')).toHaveCount(0);
  await expect(page.locator('.ps-worked li')).toHaveCount(problem.steps.length);
  await expectReadingContains(page.locator('.ps-worked'),problem.steps.at(-1));
  await expect(page.getByRole('button',{name:'Solved independently'})).toBeDisabled();
  await page.locator('input[data-ps-criterion="0"]').check();
  await expectReadingContains(page.locator('.ps-review-next'),problem.checks[1]);
  await page.locator('input[data-ps-criterion="1"]').check();
  await page.locator('input[data-ps-criterion="2"]').check();
  await expect(page.getByRole('button',{name:'Solved independently'})).toBeEnabled();
  await page.getByRole('button',{name:'Solved independently'}).click();
  await expect(page.locator('.ps-status')).toContainText('Solved independently (self-rated)');
  await expect(page.locator('input[data-ps-notebook-evidence="plan"]')).toBeDisabled();
  await page.getByRole('button',{name:'Next problem'}).click();
  await expect(page.locator('.ps-meta')).toContainText('Problem 2 of 2');
  await expect(page.locator('.ps-pulse')).toContainText('self-rated independent');
  await expectReadingText(page.locator('.ps-prompt'),
    tasks('quadratics','level-2','form-choice')[1].prompt);
});
test('strategy-free higher-level problems begin without an automatic technique prompt',async({page})=>{
  for(const level of ['level-3','level-4']){
    await open(page,'quadratics',level);
    await expect(page.locator('.ps-first-decision')).toHaveCount(0);
    await expect(page.locator('.ps-strategy-options')).toHaveCount(0);
    await expect(page.locator('.ps-hints')).toHaveCount(0);
    await expect(page.locator('.ps-worked')).toHaveCount(0);
    await expect(page.locator('details[data-working-notebook]')).toBeVisible();
    await expect(page.locator('details[data-working-notebook]')).toBeVisible();
  }
});
test('replacing an unfinished selection requires confirmation and can be cancelled',async({page})=>{
  await open(page,'sampling','level-2');
  const first=tasks('sampling','level-2','multi-strata')[0];
  await writeWorking(page,'My original plan will be kept if I cancel the warning.');
  await page.locator('input[data-ps-notebook-evidence="plan"]').check();
  await page.getByRole('button',{name:'Revisit weaker problems'}).click();
  await expect(page.locator('.ps-confirm')).toContainText('Notebook pages are saved');
  await page.getByRole('button',{name:'Keep my work'}).click();
  await notebookContains(page,'My original plan will be kept if I cancel the warning.');
  await expectReadingText(page.locator('.ps-prompt'),first.prompt);
  await page.getByRole('button',{name:'Revisit weaker problems'}).click();
  await page.getByRole('button',{name:'Replace practice'}).click();
  await notebookContains(page,'My original plan will be kept if I cancel the warning.');
  await expect(page.locator('input[data-ps-notebook-evidence="plan"]')).not.toBeChecked();
  await expect(page.locator('.ps-selection button[data-mode="focus"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.ps-meta')).toContainText('Problem 1 of 2');
});
test('finish the page, revisit weak work and keep the book tab/page unchanged',async({page})=>{
  await open(page,'sampling','level-4');
  const list=tasks('sampling','level-4','reverse-sequence');
  await inputAttempt(page);
  await revealAll(page,list[0]);
  await checkAll(page);
  await page.getByRole('button',{name:'Solved independently'}).click();
  await page.getByRole('button',{name:'Next problem'}).click();
  await revealAll(page,list[1]);
  await page.getByRole('button',{name:'Retry this problem'}).click();
  await page.getByRole('button',{name:'Finish this page'}).click();
  await expect(page.locator('.ps-complete')).toBeVisible();
  await expect(page.locator('.ps-complete-counts')).toContainText('For retry');
  await page.locator('.ps-review-list summary').click();
  await expect(page.locator('.ps-review-list li')).toHaveCount(2);
  await page.getByRole('button',{name:'Revisit weaker problems'}).click();
  await expect(page.locator('.ps-meta')).toContainText('Problem 1 of 1');
  await expectReadingText(page.locator('.ps-prompt'),list[1].prompt);
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
  await expect(page).toHaveURL(/sampling\/problemSolving\/level-4$/);
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page).toHaveURL(/sampling\/problemSolving\/level-4\/constraints$/);
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Level 4');
});
test('all independently completed problems have a helpful empty focus state',async({page})=>{
  await open(page,'quadratics','level-1');
  const list=tasks('quadratics','level-1','roots-and-intercept');
  for(let i=0;i<2;i++){
    await inputAttempt(page);
    await revealAll(page,list[i]);
    await checkAll(page);
    await page.getByRole('button',{name:'Solved independently'}).click();
    await page.getByRole('button',{name:i===1?'Finish this page':'Next problem'}).click();
  }
  await page.getByRole('button',{name:'Revisit weaker problems'}).click();
  await expect(page.locator('.ps-empty')).toContainText('no unfinished or supported problems');
  await page.getByRole('button',{name:'All problems'}).click();
  await expectReadingText(page.locator('.ps-prompt'),list[0].prompt);
});
test('draft strategy and working survive changing internal book pages',async({page})=>{
  await open(page,'quadratics','level-1');
  await writeWorking(page,'Use factorised form because both roots are given.\nI begin with y = a(x − 2)(x − 5), then use the y-intercept to find a.');
  await page.getByRole('link',{name:'Next page'}).click();
  await notebookEmpty(page);
  await page.getByRole('link',{name:'Previous page'}).click();
  await notebookContains(page,'Use factorised form because both roots are given.');
  await notebookContains(page,'a(x − 2)(x − 5)');
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Level 1');
});
test('progress and locally saved notebooks remain separate across topics and pages',async({page})=>{
  await open(page,'sampling','level-1');
  await writeWorking(page,'<script>window.unsafe=true</script> Use the correct fraction.\nWrite the complete calculations and use evidence from the question.');
  await expect(page.locator('.ps-workspace script')).toHaveCount(0);
  await revealAll(page,tasks('sampling','level-1','allocations')[0]);
  await page.getByRole('button',{name:'Retry this problem'}).click();
  const saved=await page.evaluate(()=>localStorage.getItem('maths-notebook-pass1a:problem-solving:sampling'));
  expect(saved).not.toContain('<script>');
  expect(saved).not.toContain('complete calculations');
  await page.reload();
  await notebookContains(page,'Use the correct fraction.');
  await expect(page.locator('.ps-pulse')).toContainText('for retry');
  await open(page,'quadratics','level-1');
  await expect(page.locator('.ps-pulse')).toContainText('0');
  await open(page,'sampling','level-2');
  await expect(page.locator('.ps-pulse')).toContainText('4');
});
test('keyboard navigation works without artificial grading or timed gates',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page,'quadratics','level-1');
  const book=await openNotebook(page);
  await book.locator('[data-book-action="add-text"]').click();
  await page.locator('[data-book-kind="text"]').last().focus();
  await page.keyboard.type(plan+'\n'+working);
  await confirmProblem(page);
  await page.getByRole('button',{name:'Reveal first worked step'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.ps-worked li')).toHaveCount(1);
  await revealAllRemaining(page,tasks('quadratics','level-1','roots-and-intercept')[0]);
  await page.locator('input[data-ps-criterion="0"]').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.ps-review .ps-inner-heading')).toContainText('1 of 3');
  await expect(page.locator('.ps-workspace')).not.toContainText('Automated grade');
  await expect(page.locator('.ps-workspace')).not.toContainText('100% mastery');
  const duration=await page.locator('.ps-case').evaluate(el=>getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)||0).toBeLessThanOrEqual(.01);
});
async function revealAllRemaining(page,problem){
  for(let i=1;i<problem.steps.length;i++)await page.getByRole('button',{name:'Reveal next worked step'}).click();
}
for(const width of [320,390,768,1024,1440]){
  test('Problem Solving pages, support and worked steps fit '+width+'px',async({page})=>{
    test.setTimeout(70000);
    await page.setViewportSize({width,height:850});
    for(const topic of ['sampling','quadratics']){
      for(const level of ['level-1','level-2','level-3','level-4']){
        await open(page,topic,level);
        await expect(page.locator('.ps-case')).toBeVisible();
        const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
        expect(dims.scroll,topic+' '+level).toBeLessThanOrEqual(dims.width+1);
      }
    }
    await open(page,'quadratics','level-4');
    await page.getByRole('button',{name:'Compare possible strategies'}).click();
    await page.getByRole('button',{name:'Get a nudge'}).click();
    await revealAll(page,tasks('quadratics','level-4','parameter-roots')[0]);
    const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    expect(dims.scroll,'worked review @ '+width).toBeLessThanOrEqual(dims.width+1);
  });
}
