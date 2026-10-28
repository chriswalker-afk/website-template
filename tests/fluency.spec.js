import {test,expect} from '@playwright/test';
import {buildFluencySet,answerText} from '../src/fluency-engine.js';

async function activeSet(page,topic,level,pageId,count=6){
  const label=await page.locator('.fluency-seed').textContent();
  const seed=Number(label.replace('Set #','').trim());
  return buildFluencySet({topicId:topic,levelId:level,pageId,seed,count});
}
async function enterAnswer(page,text){
  await page.locator('#fluency-answer').fill(text);
  await page.locator('#fluency-answer').press('Enter');
}
test('Fluency preserves the book hierarchy, distinct pages and no extra teaching mode',async({page})=>{
  await page.goto('/#/quadratics/fluency/level-1');
  await expect(page.getByRole('heading',{name:'Level 1: Foundations'})).toBeVisible();
  await expect(page.locator('.side-tab')).toHaveCount(4);
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
  await expect(page.locator('.fluency-question')).toBeVisible();
  await expect(page.locator('.book-page h1')).toHaveCount(1);
  await expect(page.locator('.page-subtitle')).toHaveCount(1);
  await expect(page.locator('.practice-question')).toHaveCount(0);
  await expect(page.locator('#graph-svg')).toHaveCount(0);
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page).toHaveURL(/quadratics\/fluency\/level-1\/roots/);
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Level 1');
  await expect(page.locator('.fluency-question__skill')).toBeVisible();
  await page.locator('.side-tabs a[href$="level-4"]').click();
  await expect(page.locator('.page-navigation')).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Level 4: Advanced'})).toBeVisible();
  await expect(page.locator('.fluency-question')).toBeVisible();
});
test('generated questions have repeatable answer checking and full worked solutions',async({page})=>{
  await page.goto('/#/quadratics/fluency/level-1');
  const set=await activeSet(page,'quadratics','level-1','values');
  const q=set.questions[0];
  await expect(page.locator('.fluency-question__prompt')).toHaveText(q.prompt);
  await expect(page.locator('.fluency-answer-form label')).toHaveText(q.answer.label);
  await enterAnswer(page,'invalid formula');
  await expect(page.locator('#fluency-feedback')).toContainText('Use the requested numerical answer format');
  await expect(page.locator('.fluency-question__meta')).toContainText('Question 1 of 6');
  await enterAnswer(page,q.answer.values.map((n,i)=>String(n+(i===0?999:0))).join(', '));
  await expect(page.locator('#fluency-feedback')).toContainText('Not quite');
  await expect(page.locator('.fluency-next')).toHaveCount(0);
  await page.locator('#fluency-working').fill('I substitute the chosen x value.');
  await page.getByRole('button',{name:'Show hint'}).click();
  await expect(page.locator('.practice-question__hint')).toContainText(q.hint);
  await expect(page.locator('#fluency-working')).toHaveValue('I substitute the chosen x value.');
  await page.getByRole('button',{name:'Hide hint'}).click();
  await expect(page.locator('#fluency-working')).toHaveValue('I substitute the chosen x value.');
  await enterAnswer(page,answerText(q.answer));
  await expect(page.locator('#fluency-feedback')).toContainText('Correct');
  await page.getByRole('button',{name:'View worked solution'}).click();
  await expect(page.locator('.fluency-solution__steps li')).toHaveCount(q.steps.length);
  await expect(page.locator('.fluency-solution')).toContainText(q.steps[0]);
  await expect(page.locator('#fluency-working')).toHaveValue('I substitute the chosen x value.');
  await page.getByRole('button',{name:'Next question'}).click();
  await expect(page.locator('.fluency-question__meta')).toContainText('Question 2 of 6');
  await expect(page.locator('.fluency-round-summary')).toContainText('with support');
});
test('typed answer formats check ordered allocations and unordered quadratic roots',async({page})=>{
  await page.goto('/#/sampling/fluency/level-2');
  const sampling=await activeSet(page,'sampling','level-2','allocation');
  const q=sampling.questions[0];
  await enterAnswer(page,answerText(q.answer));
  await expect(page.locator('#fluency-feedback')).toContainText('Correct');
  await page.goto('/#/quadratics/fluency/level-1/roots');
  const quadratics=await activeSet(page,'quadratics','level-1','roots');
  const roots=quadratics.questions.findIndex(q=>q.answer.kind==='unordered');
  if(roots>0){
    for(let i=0;i<roots;i++){
      await enterAnswer(page,answerText(quadratics.questions[i].answer));
      await page.getByRole('button',{name:'Next question'}).click();
    }
  }
  const current=quadratics.questions[roots];
  const reversed=[...current.answer.values].reverse().join(', ');
  await enterAnswer(page,reversed);
  await expect(page.locator('#fluency-feedback')).toContainText('Correct');
});
test('length choice and regeneration protect an unfinished practice set',async({page})=>{
  await page.goto('/#/sampling/fluency/level-1');
  const original=await activeSet(page,'sampling','level-1','counts');
  await page.locator('#fluency-working').fill('My first calculation');
  await page.locator('#fluency-count').selectOption('10');
  await expect(page.locator('.fluency-confirm')).toContainText('Replace this unfinished set');
  await page.getByRole('button',{name:'Keep practising'}).click();
  await expect(page.locator('.fluency-question__prompt')).toHaveText(original.questions[0].prompt);
  await expect(page.locator('#fluency-working')).toHaveValue('My first calculation');
  await page.getByRole('button',{name:'New questions'}).click();
  await expect(page.locator('.fluency-confirm')).toBeVisible();
  await page.getByRole('button',{name:'Replace set'}).click();
  const changed=await activeSet(page,'sampling','level-1','counts');
  expect(changed.seed).not.toBe(original.seed);
  await expect(page.locator('#fluency-working')).toHaveValue('');
  await page.locator('#fluency-count').selectOption('10');
  await expect(page.locator('.fluency-question__meta')).toContainText('Question 1 of 10');
  const ten=await activeSet(page,'sampling','level-1','counts',10);
  assertNotEqual(ten.questions.length,original.questions.length);
});
function assertNotEqual(a,b){expect(a).not.toBe(b);}
test('help and revealed solutions are not marked as independent success',async({page})=>{
  await page.goto('/#/quadratics/fluency/level-2');
  const set=await activeSet(page,'quadratics','level-2','factorise');
  await page.getByRole('button',{name:'Show full solution'}).click();
  await expect(page.locator('.fluency-solution__steps li')).toHaveCount(set.questions[0].steps.length);
  await expect(page.locator('#fluency-feedback')).toContainText('does not count as a correct answer');
  await page.getByRole('button',{name:'Next question'}).click();
  await expect(page.locator('.fluency-round-summary')).toContainText('solutions revealed');
  for(let i=1;i<set.questions.length;i++){
    await enterAnswer(page,answerText(set.questions[i].answer));
    await page.getByRole('button',{name:i===set.questions.length-1?'Finish practice':'Next question'}).click();
  }
  await expect(page.locator('.fluency-complete')).toBeVisible();
  await expect(page.locator('.fluency-complete__stats')).toContainText('1');
  await expect(page.locator('.fluency-review-details')).toBeVisible();
  await page.locator('.fluency-review-details summary').click();
  await expect(page.locator('.fluency-review-details > ol > li')).toHaveCount(6);
  await page.getByRole('button',{name:'Retry 1 review question'}).click();
  await expect(page.locator('.fluency-question__meta')).toContainText('Question 1 of 1');
  await expect(page.locator('.fluency-question__prompt')).toHaveText(set.questions[0].prompt);
});
test('a completed Fluency round is saved per level, survives refresh and isolates topics',async({page})=>{
  await page.goto('/#/sampling/fluency/level-1');
  const set=await activeSet(page,'sampling','level-1','counts');
  for(let i=0;i<set.questions.length;i++){
    await enterAnswer(page,answerText(set.questions[i].answer));
    await page.getByRole('button',{name:i===set.questions.length-1?'Finish practice':'Next question'}).click();
  }
  await expect(page.locator('.fluency-complete')).toContainText('Practice round complete');
  await expect(page.locator('.fluency-history')).toContainText('1 completed round');
  const saved=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:fluency:sampling')));
  expect(saved.version).toBe(1);
  expect(saved.levels['level-1']).toEqual({
    rounds:1,completed:6,firstTry:6,withSupport:0,revealed:0
  });
  expect(JSON.stringify(saved)).not.toContain('My working');
  await page.reload();
  await expect(page.locator('.fluency-history')).toContainText('1 completed round');
  await page.goto('/#/quadratics/fluency/level-1');
  await expect(page.locator('.fluency-history')).toContainText('0 completed rounds');
  await page.goto('/#/sampling/fluency/level-2');
  await expect(page.locator('.fluency-history')).toContainText('0 completed rounds');
});
test('completed exact question set can be exported to matching LaTeX worksheet',async({page})=>{
  await page.goto('/#/quadratics/fluency/level-3');
  const set=await activeSet(page,'quadratics','level-3','mixed');
  for(let i=0;i<set.questions.length;i++){
    await enterAnswer(page,answerText(set.questions[i].answer));
    await page.getByRole('button',{name:i===set.questions.length-1?'Finish practice':'Next question'}).click();
  }
  await page.getByRole('button',{name:'Create a matching LaTeX worksheet'}).click();
  await expect(page).toHaveURL(/quadratics\/resources\/worksheet-generator/);
  await expect(page.locator('.worksheet-questions li')).toHaveCount(6);
  for(let i=0;i<set.questions.length;i++)
    await expect(page.locator('.worksheet-questions li').nth(i)).toContainText(set.questions[i].prompt);
  await expect(page.locator('input[name="skill"][value="fluency"]')).toBeChecked();
  await expect(page.locator('#worksheet-seed')).toHaveValue(String(set.seed));
  await expect(page.locator('#worksheet-preview')).toBeVisible();
  await expect(page.locator('.worksheet-export')).toContainText('worked-solutions.tex');
});
test('generated Fluency skill also produces independent editable worksheets',async({page})=>{
  await page.goto('/#/sampling/resources/worksheet-generator');
  await page.locator('input[name="skill"]').uncheck({force:true}).catch(()=>{});
  for(const box of await page.locator('input[name="skill"]').all()){
    if(await box.getAttribute('value')!=='fluency')await box.uncheck();
  }
  await expect(page.locator('input[name="skill"][value="fluency"]')).toBeChecked();
  await page.locator('#worksheet-count').selectOption('10');
  await page.locator('#worksheet-difficulty').selectOption('stretch');
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  await expect(page.locator('.worksheet-questions li')).toHaveCount(10);
  await expect(page.locator('#worksheet-preview')).toBeVisible();
});
for(const width of [320,390,768,1024,1440]){
  test('Fluency question and review UI works without overflow at '+width+'px',async({page})=>{
    test.setTimeout(60000);
    await page.setViewportSize({width,height:880});
    for(const topic of ['sampling','quadratics']){
      for(const level of ['level-1','level-2','level-3','level-4']){
        await page.goto('/#/'+topic+'/fluency/'+level);
        await expect(page.locator('.fluency-question')).toBeVisible();
        await expect(page.locator('.page-subtitle')).toHaveCount(1);
        await expect(page.locator('.book-page h1')).toHaveCount(1);
        const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
        expect(w.scroll,topic+' '+level+' @ '+width).toBeLessThanOrEqual(w.width+1);
      }
    }
    await page.goto('/#/quadratics/fluency/level-4');
    await page.getByRole('button',{name:'Show full solution'}).click();
    const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    expect(w.scroll).toBeLessThanOrEqual(w.width+1);
  });
}
test('Fluency is usable with keyboard and reduced-motion preferences',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/sampling/fluency/level-1');
  const set=await activeSet(page,'sampling','level-1','counts');
  await page.locator('#fluency-answer').focus();
  await page.keyboard.type(answerText(set.questions[0].answer));
  await page.keyboard.press('Enter');
  await expect(page.locator('#fluency-feedback')).toContainText('Correct');
  await page.getByRole('button',{name:'View worked solution'}).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.fluency-solution')).toBeVisible();
  await page.getByRole('button',{name:'Next question'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.fluency-question__meta')).toContainText('Question 2 of 6');
  const duration=await page.locator('.fluency-question').evaluate(x=>getComputedStyle(x).animationDuration);
  expect(parseFloat(duration)||0).toBeLessThanOrEqual(0.01);
});
