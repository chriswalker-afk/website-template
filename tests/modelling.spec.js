import {test,expect} from '@playwright/test';
import {MODELLING_CHAPTERS} from '../src/modelling-content.js';
const phases=['Formulate','Calculate','Interpret','Evaluate'];
const texts={
  formulate:'The input and output variables are defined, and the domain and assumptions are explicitly stated.',
  calculate:'I calculated the relevant result from the mathematical model using the supplied figures.',
  interpret:'The numerical result is an estimate with a practical meaning and appropriate units.',
  evaluate:'The sensitivity and residual or revised assumption are quantified, with model limitations.'
};
const tasks=(topic,level,page)=>MODELLING_CHAPTERS[topic]
  .find(l=>l.id===level).pages.find(p=>p.id===page).tasks;
async function open(page,topic='quadratics',level='level-1',pageId){
  await page.goto('/#/'+topic+'/modelling/'+level+(pageId?'/'+pageId:''));
}
async function advance(page,fill=true){
  for(let i=0;i<4;i++){
    await expect(page.locator('.mdl-stage-heading')).toContainText(phases[i]);
    if(fill)await page.locator('#mdl-answer').fill(texts[phases[i].toLowerCase()]);
    await page.getByRole('button',{name:i===3?'Review the whole model':'Continue to '+phases[i+1]}).click();
  }
  await expect(page.locator('.mdl-comparison')).toBeVisible();
}
async function allChecks(page){
  for(let i=0;i<3;i++)await page.locator('input[data-mdl-check="'+i+'"]').check();
}
test('both topics have all four distinct modelling levels with two internal book pages',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    for(let n=1;n<=4;n++){
      const level='level-'+n,chapter=MODELLING_CHAPTERS[topic][n-1];
      await open(page,topic,level);
      await expect(page.getByRole('heading',{name:chapter.label,exact:true})).toBeVisible();
      await expect(page.locator('.book-page h1')).toHaveCount(1);
      await expect(page.locator('.page-subtitle')).toHaveCount(1);
      await expect(page.locator('.side-tab')).toHaveCount(4);
      await expect(page.locator('.side-tab[aria-current="page"]')).toContainText(chapter.label);
      await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
      await expect(page.locator('.mdl-case')).toBeVisible();
      await expect(page.locator('.mdl-scenario')).toHaveText(chapter.pages[0].tasks[0].scenario);
      await expect(page.locator('.practice-question')).toHaveCount(0);
      await expect(page.locator('.fluency-question')).toHaveCount(0);
      await expect(page.locator('.reasoning-task')).toHaveCount(0);
      await expect(page.locator('.ps-case')).toHaveCount(0);
      await page.getByRole('link',{name:'Next page'}).click();
      await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
      await expect(page.locator('.mdl-scenario')).toHaveText(chapter.pages[1].tasks[0].scenario);
      await expect(page.locator('.side-tab[aria-current="page"]')).toContainText(chapter.label);
    }
  }
});
test('the staged model starts with Formulate and hides all model answers',async({page})=>{
  await open(page);
  await expect(page.locator('.mdl-stage-heading')).toContainText('Formulate');
  await expect(page.locator('.mdl-phases button')).toHaveCount(4);
  await expect(page.locator('.mdl-phases button[aria-current="step"]')).toContainText('Formulate');
  await expect(page.locator('.mdl-phases button').nth(3)).toBeDisabled();
  await expect(page.locator('.mdl-hint')).toHaveCount(0);
  await expect(page.locator('.mdl-example')).toHaveCount(0);
  await expect(page.locator('.mdl-comparison')).toHaveCount(0);
  await expect(page.locator('#mdl-answer')).toBeVisible();
});
test('nudge and stage comparison preserve writing and correctly record support',async({page})=>{
  await open(page,'sampling');
  const task=tasks('sampling','level-1','population-estimates')[0];
  await page.locator('#mdl-answer').fill(texts.formulate);
  await page.getByRole('button',{name:'Need a modelling nudge?'}).click();
  await expect(page.locator('.mdl-hint')).toContainText(task.phases[0].nudge);
  await page.getByRole('button',{name:'Compare this stage'}).click();
  await expect(page.locator('.mdl-example')).toContainText(task.phases[0].model);
  await expect(page.locator('#mdl-answer')).toHaveValue(texts.formulate);
  await page.getByRole('button',{name:'Hide nudge'}).click();
  await page.getByRole('button',{name:'Hide worked stage'}).click();
  await page.getByRole('button',{name:'Continue to Calculate'}).click();
  await expect(page.locator('.mdl-stage-heading')).toContainText('Calculate');
  await page.getByRole('button',{name:'Previous stage'}).click();
  await expect(page.locator('#mdl-answer')).toHaveValue(texts.formulate);
  await page.getByRole('button',{name:'Continue to Calculate'}).click();
  for(let i=1;i<4;i++){
    await page.locator('#mdl-answer').fill(texts[phases[i].toLowerCase()]);
    await page.getByRole('button',{name:i===3?'Review the whole model':'Continue to '+phases[i+1]}).click();
  }
  await allChecks(page);
  await expect(page.getByRole('button',{name:'Modelled independently'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Modelled with support'})).toBeEnabled();
  await page.getByRole('button',{name:'Modelled with support'}).click();
  await expect(page.locator('.mdl-saved')).toContainText('Modelled with support');
  const raw=await page.evaluate(()=>localStorage.getItem('maths-notebook-pass1a:modelling:sampling'));
  const record=JSON.parse(raw).records['level-1:population-estimates:cinema-preference'];
  expect(record).toMatchObject({rating:'supported',attempted:true,assisted:true,modelFirst:false,checked:3});
  expect(raw).not.toContain(texts.formulate);
});
test('complete unaided writing supports an honest independent self-rating',async({page})=>{
  await open(page);
  const task=tasks('quadratics','level-1','shapes')[0];
  await advance(page);
  await expect(page.locator('.mdl-comparison-stage')).toHaveCount(4);
  await expect(page.locator('.mdl-comparison-stage').first()).toContainText(task.phases[0].model);
  await expect(page.locator('.mdl-comparison')).toContainText(task.phases[3].model);
  await expect(page.getByRole('button',{name:'Modelled independently'})).toBeDisabled();
  await allChecks(page);
  await expect(page.getByRole('button',{name:'Modelled independently'})).toBeEnabled();
  await page.getByRole('button',{name:'Modelled independently'}).click();
  await expect(page.locator('.mdl-saved')).toContainText('Modelled independently (self-rated)');
  await expect(page.locator('.mdl-pulse')).toContainText('self-rated independent');
  await page.getByRole('button',{name:'Next scenario'}).click();
  await expect(page.locator('.mdl-case-meta')).toContainText('Scenario 2 of 2');
  await expect(page.locator('.mdl-scenario')).toHaveText(tasks('quadratics','level-1','shapes')[1].scenario);
  await expect(page).toHaveURL(/quadratics\/modelling\/level-1$/);
});
test('revealing model stages before writing is accurately classified as supported',async({page})=>{
  await open(page,'quadratics','level-3');
  await page.getByRole('button',{name:'Compare this stage'}).click();
  await expect(page.locator('.mdl-example')).toBeVisible();
  await advance(page);
  await expect(page.locator('.mdl-supported-notice')).toBeVisible();
  await allChecks(page);
  await expect(page.getByRole('button',{name:'Modelled independently'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Modelled with support'})).toBeEnabled();
});
test('student can review a model without inventing independent working',async({page})=>{
  await open(page,'sampling','level-3');
  await advance(page,false);
  await expect(page.locator('.mdl-compare-own em')).toHaveCount(4);
  await expect(page.locator('.mdl-supported-notice')).toBeVisible();
  await expect(page.getByRole('button',{name:'Modelled with support'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Modelled independently'})).toBeDisabled();
  await page.getByRole('button',{name:'Revisit this model'}).click();
  await expect(page.locator('.mdl-saved')).toContainText('Revisit this model');
});
test('review comparison allows returning to a stage and preserving the draft',async({page})=>{
  await open(page);
  await advance(page,false);
  await page.locator('.mdl-phases button[data-phase="0"]').click();
  await page.locator('#mdl-answer').fill('This is a proposed model with explicit variables, domain and assumptions.');
  await page.getByRole('button',{name:'Return to comparison'}).click();
  await expect(page.locator('.mdl-compare-own').first()).toContainText('This is a proposed model');
});
test('unfinished scenario changes require confirmation and can be cancelled',async({page})=>{
  await open(page,'sampling','level-2');
  await page.locator('#mdl-answer').fill('My initial modelling assumptions must not disappear without confirmation.');
  await page.getByRole('button',{name:'Revisit weaker scenarios'}).click();
  await expect(page.locator('.mdl-confirm')).toContainText('Unsaved written modelling decisions will be lost');
  await page.getByRole('button',{name:'Keep writing'}).click();
  await expect(page.locator('#mdl-answer')).toContainText('initial modelling assumptions');
  await page.getByRole('button',{name:'Revisit weaker scenarios'}).click();
  await page.getByRole('button',{name:'Replace scenario'}).click();
  await expect(page.locator('#mdl-answer')).toHaveValue('');
  await expect(page.locator('.mdl-selection [data-selection="focus"]')).toHaveAttribute('aria-pressed','true');
});
test('stage drafts survive internal book page turns but are never stored locally',async({page})=>{
  await open(page,'quadratics','level-2');
  await page.locator('#mdl-answer').fill('I have started modelling with a physical domain and stated assumptions.');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page.locator('#mdl-answer')).toHaveValue('');
  await page.getByRole('link',{name:'Previous page'}).click();
  await expect(page.locator('#mdl-answer')).toContainText('physical domain');
  const storage=await page.evaluate(()=>JSON.stringify(localStorage));
  expect(storage).not.toContain('physical domain');
});
test('completed scenarios replay weaker tasks or show an informative empty review state',async({page})=>{
  await open(page,'sampling');
  await advance(page);
  await allChecks(page);
  await page.getByRole('button',{name:'Modelled independently'}).click();
  await page.getByRole('button',{name:'Next scenario'}).click();
  await advance(page,false);
  await page.getByRole('button',{name:'Revisit this model'}).click();
  await page.getByRole('button',{name:'Finish this page'}).click();
  await expect(page.locator('.mdl-complete')).toBeVisible();
  await expect(page.locator('.mdl-complete-stats')).toContainText('For another look');
  await page.getByRole('button',{name:'Revisit weaker scenarios'}).click();
  await expect(page.locator('.mdl-case-meta')).toContainText('Scenario 1 of 1');
  await expect(page.locator('.mdl-scenario')).toHaveText(tasks('sampling','level-1','population-estimates')[1].scenario);
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
});
test('review metadata survives refresh but free-text drafting does not',async({page})=>{
  await open(page,'sampling','level-4');
  await page.locator('#mdl-answer').fill('<script>window.unsafe=true</script> I am defining the model.');
  await expect(page.locator('.mdl-workspace script')).toHaveCount(0);
  await advance(page,false);
  await page.getByRole('button',{name:'Revisit this model'}).click();
  const stored=await page.evaluate(()=>localStorage.getItem('maths-notebook-pass1a:modelling:sampling'));
  expect(stored).not.toContain('<script>');
  await page.reload();
  await expect(page.locator('#mdl-answer')).toHaveValue('');
  await expect(page.locator('.mdl-pulse')).toContainText('to revisit');
  await open(page,'quadratics','level-4');
  await expect(page.locator('.mdl-pulse')).toContainText('4');
});
test('full workflow is operable by keyboard with reduced-motion preferences',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page);
  await page.locator('#mdl-answer').focus();
  await page.keyboard.type(texts.formulate);
  await page.getByRole('button',{name:'Need a modelling nudge?'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mdl-hint')).toBeVisible();
  await page.getByRole('button',{name:'Continue to Calculate'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mdl-stage-heading')).toContainText('Calculate');
  const duration=await page.locator('.mdl-case').evaluate(el=>getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)||0).toBeLessThanOrEqual(.01);
});
for(const width of [320,390,768,1024,1440]){
  test('all modelling levels, stage comparisons and book navigation fit '+width+'px',async({page})=>{
    test.setTimeout(80000);
    await page.setViewportSize({width,height:840});
    for(const topic of ['sampling','quadratics']){
      for(let i=1;i<=4;i++){
        await open(page,topic,'level-'+i);
        await expect(page.locator('.mdl-case')).toBeVisible();
        let d=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
        expect(d.scroll,topic+' level '+i+' '+width).toBeLessThanOrEqual(d.w+1);
      }
    }
    await advance(page,false);
    const d=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(d.scroll,'comparison '+width).toBeLessThanOrEqual(d.w+1);
  });
}
