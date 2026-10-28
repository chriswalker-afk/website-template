import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('Worksheet Generator is a Contents resource, not an extra chapter tab',async({page})=>{
  await page.goto('/#/sampling/home');
  await expect(page.locator('.chapter-tab')).toHaveCount(6);
  await expect(page.getByRole('link',{name:/Worksheet Generator/})).toBeVisible();
  await page.getByRole('link',{name:/Worksheet Generator/}).click();
  await expect(page).toHaveURL(/#\/sampling\/resources\/worksheet-generator/);
  await expect(page.locator('.book-page h1')).toHaveText('Worksheet Generator');
  await expect(page.locator('.book-page .page-subtitle')).toHaveCount(1);
  await expect(page.locator('.chapter-tab')).toHaveCount(5);
  await expect(page.locator('.side-tabs')).toHaveCount(0);
  await expect(page.getByLabel('Variation seed')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
});

test('both topics generate a question preview and matching LaTeX downloads',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    await page.goto('/#/'+topic+'/resources/worksheet-generator');
    await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
    await expect(page.locator('#worksheet-preview')).toBeVisible();
    await expect(page.locator('.worksheet-questions li')).toHaveCount(8);
    const seed=await page.locator('#worksheet-seed').inputValue();
    const downloadStudent=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download worksheet.tex'}).click();
    const student=await downloadStudent;
    expect(student.suggestedFilename()).toBe('worksheet.tex');
    const tex=await readFile(await student.path(),'utf8');
    expect(tex).toContain('\\documentclass[11pt,a4paper]{article}');
    expect(tex).toContain('% Topic: '+topic+' | Seed: '+seed);
    expect((tex.match(/^% Question /gm)||[])).toHaveLength(8);
    const solutionWait=page.waitForEvent('download');
    await page.getByRole('button',{name:'Download worked-solutions.tex'}).click();
    const solution=await solutionWait;
    expect(solution.suggestedFilename()).toBe('worked-solutions.tex');
    const answers=await readFile(await solution.path(),'utf8');
    expect(answers).toContain('\\end{document}');
    expect(answers).toContain('% Topic: '+topic+' | Seed: '+seed);
    expect(answers.match(/^% Question .*/gm)).toEqual(tex.match(/^% Question .*/gm));
    await page.locator('.worksheet-source summary').click();
    await expect(page.locator('.worksheet-source pre')).toContainText('\\documentclass');
  }
});
test('scaffolding and answer-only exports are genuine variations',async({page})=>{
  await page.goto('/#/quadratics/resources/worksheet-generator');
  await page.locator('#worksheet-style').selectOption('scaffolded');
  await page.locator('#worksheet-solutions').selectOption('answers');
  await page.locator('#worksheet-count').selectOption('6');
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  await expect(page.locator('.worksheet-questions li')).toHaveCount(6);
  const studentWait=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download worksheet.tex'}).click();
  const student=await studentWait;
  const studentTex=await readFile(await student.path(),'utf8');
  expect(studentTex).toContain('Worked model:');
  expect(studentTex).toContain('\\textit{Hint:}');
  const solutionWait=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download answers.tex'}).click();
  const solution=await solutionWait;
  const answerTex=await readFile(await solution.path(),'utf8');
  expect(answerTex).toContain('\\textbf{Answer:}');
  expect(answerTex).not.toContain('\\textit{Worked model:}');
});
test('invalid skill selection reports an actionable error, then recovers',async({page})=>{
  await page.goto('/#/sampling/resources/worksheet-generator');
  for(const item of await page.locator('[name="skill"]').all())await item.uncheck();
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  await expect(page.locator('#worksheet-error')).toContainText('Select at least one');
  await page.getByLabel('Terminology').check();
  await page.locator('#worksheet-count').selectOption('6');
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  await expect(page.locator('.worksheet-questions li')).toHaveCount(6);
  await expect(page.locator('#worksheet-error')).toHaveCount(0);
});
test('new variation changes the seed and selection remains repeatable',async({page})=>{
  await page.goto('/#/quadratics/resources/worksheet-generator');
  await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
  const before=await page.locator('.worksheet-questions').innerText();
  const seed=await page.locator('#worksheet-seed').inputValue();
  await page.getByRole('button',{name:'New variation'}).click();
  await expect(page.locator('.worksheet-questions li')).toHaveCount(8);
  const after=await page.locator('.worksheet-questions').innerText();
  expect(after).not.toEqual(before);
  expect(await page.locator('#worksheet-seed').inputValue()).not.toEqual(seed);
});
for(const width of [320,390,768,1024,1440]){
  test('Worksheet Generator fits a '+width+'px viewport',async({page})=>{
    await page.setViewportSize({width,height:850});
    await page.goto('/#/sampling/resources/worksheet-generator');
    await expect(page.locator('#worksheet-form')).toBeVisible();
    await page.getByRole('button',{name:'Generate worksheet',exact:true}).click();
    await expect(page.locator('.worksheet-questions li')).toHaveCount(8);
    const result=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));
    expect(result.width).toBeLessThanOrEqual(result.viewport+1);
    if(width<=960){
      await expect(page.locator('#mobile-chapter')).toHaveValue('resources');
      await expect(page.locator('#mobile-section')).toHaveCount(0);
      await expect(page.locator('.chapter-tabs')).toBeHidden();
    }
  });
}
