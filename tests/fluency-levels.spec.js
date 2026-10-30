import {test,expect} from '@playwright/test';
import {expectReadingText,expectReadingContains} from './math-assertions.js';
import {FLUENCY_LEVELS,fluencyQuestionScaffold} from '../src/fluency-levels.js';
import {buildFluencySet} from '../src/fluency-engine.js';

const names=['Guided','Structured','Independent','Challenge'];
async function currentQuestion(page,topic,level,pageId){
  const raw=await page.locator('.fluency-seed').textContent();
  const seed=Number(raw.replace('Set #','').trim());
  return buildFluencySet({topicId:topic,levelId:level,pageId,seed}).questions[0];
}
test('Fluency uses the same four right-hand stages as Problem Solving',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    await page.goto('/#/'+topic+'/fluency/level-1');
    await expect(page.locator('.side-tab')).toHaveCount(4);
    for(let i=0;i<names.length;i++)
      await expect(page.locator('.side-tab').nth(i)).toContainText(
        'Level '+(i+1)+': '+names[i]);
    await page.goto('/#/'+topic+'/problemSolving/level-1');
    for(let i=0;i<names.length;i++)
      await expect(page.locator('.side-tab').nth(i)).toContainText(
        'Level '+(i+1)+': '+names[i]);
  }
});
test('Guided shows a relevant start without revealing numerical worked steps',async({page})=>{
  for(const [topic,pageId] of [['sampling','counts'],['quadratics','values']]){
    await page.goto('/#/'+topic+'/fluency/level-1');
    const q=await currentQuestion(page,topic,'level-1',pageId);
    const scaffold=fluencyQuestionScaffold('level-1',q.family);
    await expect(page.locator('.fluency-level-intro')).toContainText('Guided practice');
    await expect(page.locator('.fluency-scaffold--guided')).toContainText(scaffold.steps[0]);
    await expect(page.locator('.fluency-question__skill')).toHaveText(q.skill);
    await expect(page.locator('.fluency-solution')).toHaveCount(0);
    await expectReadingText(page.locator('.fluency-question__prompt'),q.prompt);
    await expect(page.locator('details[data-working-notebook]')).toHaveCount(1);
    await expect(page.locator('#fluency-answer')).toBeEnabled();
  }
});
test('Structured shows a short method checklist and no automatic hints',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    await page.goto('/#/'+topic+'/fluency/level-2');
    const pageId=topic==='sampling'?'allocation':'factorise';
    const q=await currentQuestion(page,topic,'level-2',pageId);
    const guide=fluencyQuestionScaffold('level-2',q.family);
    await expect(page.locator('.fluency-scaffold--structured')).toBeVisible();
    await expect(page.locator('.fluency-scaffold li')).toHaveCount(3);
    await expect(page.locator('.fluency-scaffold')).toContainText(guide.steps[1]);
    await expect(page.locator('.practice-question__hint')).toHaveCount(0);
    await page.getByRole('button',{name:'Show hint'}).click();
    await expectReadingContains(page.locator('.practice-question__hint'),q.hint);
  }
});
test('Independent and Challenge conceal technique until answer is checked or revealed',async({page})=>{
  for(const [topic,level,pageId] of [
    ['sampling','level-3','mixed'],
    ['quadratics','level-3','mixed'],
    ['sampling','level-4','advanced'],
    ['quadratics','level-4','advanced']
  ]){
    await page.goto('/#/'+topic+'/fluency/'+level);
    const q=await currentQuestion(page,topic,level,pageId);
    await expect(page.locator('.fluency-scaffold')).toHaveCount(0);
    await expect(page.locator('.fluency-question__skill')).toHaveText('Choose the method');
    await expectReadingText(page.locator('.fluency-question__prompt'),q.prompt);
    await page.locator('[data-action="fluency-reveal"]').click();
    await expect(page.locator('.fluency-question__skill')).toHaveText(q.skill);
    await expectReadingContains(page.locator('.fluency-solution'),q.steps[0]);
    await expect(page.locator('.fluency-next')).toBeEnabled();
  }
});
test('narrow display keeps stage guidance inside page width',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  for(const level of FLUENCY_LEVELS){
    await page.goto('/#/quadratics/fluency/'+level.id);
    await expect(page.locator('.fluency-level-intro')).toBeVisible();
    const size=await page.evaluate(()=>({
      scroll:document.documentElement.scrollWidth,width:window.innerWidth
    }));
    expect(size.scroll,level.id).toBeLessThanOrEqual(size.width+1);
  }
});
