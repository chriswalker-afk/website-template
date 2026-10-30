import {test,expect} from '@playwright/test';
import {writeWorking,confirmReasoning,confirmProblem,confirmStage} from './notebook-helpers.js';
import {mkdir} from 'node:fs/promises';
import {buildFluencySet,answerText} from '../src/fluency-engine.js';

test('render representative visual-review images',async({page})=>{
  test.setTimeout(90000);
  await mkdir('visual-review',{recursive:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/#/sampling/home');
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
  await page.screenshot({path:'visual-review/01-contents-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/memorise/flashcards');
  await expect(page.getByRole('heading',{name:'Flashcards'})).toBeVisible();
  await page.screenshot({path:'visual-review/02-flashcards-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/understand/visual-explanations');
  await expect(page.locator('#graph-svg')).toBeVisible();
  await page.screenshot({path:'visual-review/03-understand-visual-explanations-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/problemSolving/level-1');
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
  await page.screenshot({path:'visual-review/08-levelled-problem-solving-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/games/curve-quest');
  await expect(page.getByRole('heading',{name:'Curve Quest'})).toBeVisible();
  await page.screenshot({path:'visual-review/09-games-right-tabs-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/sampling/memorise/flashcards');
  await expect(page.locator('#mobile-chapter')).toBeVisible();
  await page.screenshot({path:'visual-review/04-flashcards-mobile-390.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:720});
  await page.goto('/#/quadratics/home');
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
  await page.screenshot({path:'visual-review/05-contents-mobile-320.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/#/quadratics/resources/worksheet-generator');
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  await expect(page.locator('.worksheet-questions li')).toHaveCount(8);
  await page.screenshot({path:'visual-review/06-worksheet-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/sampling/resources/worksheet-generator');
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  await expect(page.locator('#worksheet-preview')).toBeVisible();
  await page.screenshot({path:'visual-review/07-worksheet-mobile-390.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:1440,height:980});
  await page.goto('/#/sampling/understand/big-idea');
  await page.locator('[data-action="understand-check"][data-choice="all-year-11"]').click();
  await page.screenshot({path:'visual-review/10-understand-big-idea-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/understand/how-it-works/translate');
  await page.getByRole('button',{name:'Show first step'}).click();
  await page.getByRole('button',{name:'Show next step'}).click();
  await page.screenshot({path:'visual-review/11-understand-method-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/understand/visual-explanations/proportion');
  await page.locator('[data-method="stratified"]').click();
  await page.screenshot({path:'visual-review/12-sampling-visual-lab-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/understand/worked-examples');
  await page.getByRole('button',{name:'Show first step'}).click();
  await page.locator('[data-action="understand-guided"][data-choice="correct"]').click();
  await page.screenshot({path:'visual-review/13-understand-worked-example-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:720});
  await page.goto('/#/sampling/understand/visual-explanations');
  await page.locator('[data-method="random"]').click();
  await page.screenshot({path:'visual-review/14-sampling-visual-lab-mobile-320.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/#/sampling/memorise/flashcards');
  await page.locator('#flashcard').click();
  await expect(page.locator('.self-ratings')).toBeVisible();
  await page.screenshot({path:'visual-review/15-memorise-flashcards-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/memorise/match-up');
  await page.locator('[data-side="term"][data-id="census"]').click();
  await page.locator('[data-side="definition"][data-id="census"]').click();
  await page.screenshot({path:'visual-review/16-memorise-match-up-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/memorise/missing-words');
  await page.locator('#cloze-answer').fill('sampling frame');
  await page.locator('#cloze-answer').press('Enter');
  await page.screenshot({path:'visual-review/17-memorise-missing-words-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/memorise/speed-recall');
  await page.locator('#recall-answer').fill('quadratic function');
  await page.locator('#recall-answer').press('Enter');
  await page.screenshot({path:'visual-review/18-memorise-speed-recall-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/memorise/review-all');
  await page.screenshot({path:'visual-review/19-memorise-review-all-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/sampling/memorise/review-all');
  await page.screenshot({path:'visual-review/20-memorise-review-all-mobile-390.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/#/sampling/memorise/flashcards');
  await page.screenshot({path:'visual-review/21-memorise-flashcards-mobile-320.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/#/sampling/fluency/level-1');
  await expect(page.locator('.fluency-question')).toBeVisible();
  await page.screenshot({path:'visual-review/22-fluency-foundations-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/fluency/level-2');
  await page.locator('#fluency-answer').fill('99999');
  await page.locator('#fluency-answer').press('Enter');
  await page.getByRole('button',{name:'Show hint'}).click();
  await page.screenshot({path:'visual-review/23-fluency-feedback-desktop.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/fluency/level-4');
  await page.getByRole('button',{name:'Show full solution'}).click();
  await page.screenshot({path:'visual-review/24-fluency-advanced-worked-solution.png',fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/fluency/level-1');
  const seed=Number((await page.locator('.fluency-seed').textContent()).replace('Set #','').trim());
  const set=buildFluencySet({topicId:'sampling',levelId:'level-1',pageId:'counts',seed,count:6});
  for(let i=0;i<set.questions.length;i++){
    await page.locator('#fluency-answer').fill(answerText(set.questions[i].answer));
    await page.locator('#fluency-answer').press('Enter');
    await page.getByRole('button',{name:i===set.questions.length-1?'Finish practice':'Next question'}).click();
  }
  await expect(page.locator('.fluency-complete')).toBeVisible();
  await page.screenshot({path:'visual-review/25-fluency-completion-desktop.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/quadratics/fluency/level-4');
  // This page was visited earlier in the sweep; reload resets its in-session
  // revealed-answer state before capturing a fresh mobile worked example.
  await page.reload();
  await page.getByRole('button',{name:'Show full solution'}).click();
  await page.screenshot({path:'visual-review/26-fluency-worked-solution-mobile-390.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/#/sampling/fluency/level-1');
  await page.screenshot({path:'visual-review/27-fluency-workspace-mobile-320.png',fullPage:true,animations:'disabled'});
});


test('render Reasoning writing, model, checklist, review and mobile screenshots',async({page})=>{
  test.setTimeout(70000);
  await mkdir('visual-review',{recursive:true});
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/#/sampling/reasoning/explain');
  await expect(page.locator('.reasoning-task')).toBeVisible();
  await page.screenshot({path:'visual-review/28-reasoning-write-desktop.png',
    fullPage:true,animations:'disabled'});
  await writeWorking(page,
    'The library-only sampling frame excludes students outside the library. The results may therefore be biased.');
  await confirmReasoning(page);
  await page.getByRole('button',{name:'Need a nudge?'}).click();
  await page.screenshot({path:'visual-review/29-reasoning-nudge-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'Compare with worked argument'}).click();
  await page.locator('input[data-reasoning-criterion="0"]').check();
  await page.screenshot({path:'visual-review/30-reasoning-comparison-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/reasoning/critique');
  await page.getByRole('button',{name:'Compare with worked argument'}).click();
  await page.screenshot({path:'visual-review/31-reasoning-critique-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/reasoning/generalise');
  await page.screenshot({path:'visual-review/32-reasoning-generalise-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/reasoning/justify');
  for(let i=0;i<4;i++){
    await page.getByRole('button',{name:'Compare with worked argument'}).click();
    await page.getByRole('button',{name:'Review again'}).click();
    await page.getByRole('button',{name:i===3?'Finish this set':'Next prompt'}).click();
  }
  await expect(page.locator('.reasoning-complete')).toBeVisible();
  await page.screenshot({path:'visual-review/33-reasoning-review-complete-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/quadratics/reasoning/explain');
  await page.getByRole('button',{name:'Compare with worked argument'}).click();
  await page.screenshot({path:'visual-review/34-reasoning-model-mobile-390.png',
    fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/#/sampling/reasoning/generalise');
  await page.screenshot({path:'visual-review/35-reasoning-write-mobile-320.png',
    fullPage:true,animations:'disabled'});
});


test('render Problem Solving strategy, hint, solution, review and mobile screenshots',async({page})=>{
  test.setTimeout(80000);
  await mkdir('visual-review',{recursive:true});
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/#/quadratics/problemSolving/level-1');
  await expect(page.locator('.ps-case')).toBeVisible();
  await page.screenshot({path:'visual-review/36-ps-guided-desktop.png',fullPage:true,animations:'disabled'});
  await writeWorking(page,'I should begin from the known roots and use the given intercept.\nUse a(x − 2)(x − 5), substitute x = 0 and calculate a.');
  await confirmProblem(page);
  await page.getByRole('button',{name:'Compare possible strategies'}).click();
  await page.locator('[data-action="ps-choice"][data-choice="s1"]').click();
  await page.screenshot({path:'visual-review/37-ps-strategy-feedback-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.getByRole('button',{name:'Get a nudge'}).click();
  await page.getByRole('button',{name:'Get a stronger hint'}).click();
  await page.screenshot({path:'visual-review/38-ps-gradual-hints-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/problemSolving/level-4');
  for(let i=0;i<3;i++)
    await page.getByRole('button',{name:i?'Reveal next worked step':'Reveal first worked step'}).click();
  await expect(page.locator('.ps-review')).toBeVisible();
  await page.screenshot({path:'visual-review/39-ps-challenge-worked-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/problemSolving/level-3');
  for(let i=0;i<2;i++){
    for(let step=0;step<3;step++)
      await page.getByRole('button',{name:step?'Reveal next worked step':'Reveal first worked step'}).click();
    await page.getByRole('button',{name:'Retry this problem'}).click();
    await page.getByRole('button',{name:i===1?'Finish this page':'Next problem'}).click();
  }
  await expect(page.locator('.ps-complete')).toBeVisible();
  await page.screenshot({path:'visual-review/40-ps-page-recap-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/sampling/problemSolving/level-2');
  await page.getByRole('button',{name:'Reveal first worked step'}).click();
  await page.screenshot({path:'visual-review/41-ps-solution-mobile-390.png',
    fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/#/quadratics/problemSolving/level-4');
  await page.screenshot({path:'visual-review/42-ps-writing-mobile-320.png',
    fullPage:true,animations:'disabled'});
});


test('render Modelling stages, comparisons and narrow-screen notebook screenshots',async({page})=>{
  test.setTimeout(80000);
  await mkdir('visual-review',{recursive:true});
  await page.setViewportSize({width:1440,height:960});
  await page.goto('/#/quadratics/modelling/level-1');
  await expect(page.locator('.mdl-case')).toBeVisible();
  await page.screenshot({path:'visual-review/43-modelling-formulate-desktop.png',
    fullPage:true,animations:'disabled'});
  await writeWorking(page,'Let x measure horizontal distance in metres; I will use the supplied parabola within the arch opening.');
  await confirmStage(page);
  await page.getByRole('button',{name:'Need a modelling nudge?'}).click();
  await page.getByRole('button',{name:'Compare this stage'}).click();
  await page.screenshot({path:'visual-review/44-modelling-guided-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/sampling/modelling/level-3');
  for(const label of ['Calculate','Interpret','Evaluate']){
    await page.getByRole('button',{name:'Continue to '+label}).click();
  }
  await page.getByRole('button',{name:'Review the whole model'}).click();
  await expect(page.locator('.mdl-comparison-stage')).toHaveCount(4);
  await page.screenshot({path:'visual-review/45-modelling-comparison-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.goto('/#/quadratics/modelling/level-4');
  await expect(page.locator('.mdl-stage')).toBeVisible();
  await page.screenshot({path:'visual-review/46-modelling-challenge-desktop.png',
    fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/quadratics/modelling/level-2');
  await page.getByRole('button',{name:'Continue to Calculate'}).click();
  await page.screenshot({path:'visual-review/47-modelling-calculate-mobile-390.png',
    fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:320,height:740});
  await page.goto('/#/sampling/modelling/level-1');
  await page.screenshot({path:'visual-review/48-modelling-formulate-mobile-320.png',
    fullPage:true,animations:'disabled'});
});
