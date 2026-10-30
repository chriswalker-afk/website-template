import {test,expect} from '@playwright/test';
import {UNDERSTAND_CONTENT} from '../src/understand-content.js';
import {MODELLING_PHASES} from '../src/modelling-content.js';
import {PROBLEM_SOLVING_CHAPTERS} from '../src/problem-solving-content.js';

async function notebook(page){
  const details=page.locator('details[data-working-notebook]').first();
  await expect(details).toBeVisible();
  if(await details.getAttribute('open')===null)await details.locator('summary').click();
  await expect(details.locator('.working-book')).toBeVisible();
  return details;
}
async function typeMath(page,value){
  const book=await notebook(page);
  const input=book.locator('[data-book-kind="math"]').first();
  await input.fill(value);
}
async function drawStroke(page){
  const book=await notebook(page);
  await book.locator('[data-book-mode="both"]').click();
  const svg=book.locator('[data-book-ink]');
  await svg.scrollIntoViewIfNeeded();
  const bounds=await svg.boundingBox();
  await page.mouse.move(bounds.x+35,bounds.y+35);
  await page.mouse.down();
  await page.mouse.move(bounds.x+100,bounds.y+75,{steps:6});
  await page.mouse.up();
  await expect(book.locator('[data-book-ink] path')).toHaveCount(1);
}
test('Understand My turn stores maths across guidance reveal and refresh',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  const section=UNDERSTAND_CONTENT.quadratics.find(s=>s.id==='worked-examples');
  const workshop=section.pages.find(p=>p.type==='workshop');
  await page.goto('/#/quadratics/understand/worked-examples'+
    (section.pages[0]===workshop?'':'/'+workshop.id));
  await expect(page.locator('#own-response')).toBeVisible();
  await typeMath(page,'x=\\frac{1}{2}');
  const storage=await page.locator('details[data-working-notebook]').getAttribute('data-scope');
  expect(storage).toBe('quadratics:understand:worked-examples:'+workshop.id+':my-turn');
  await page.locator('[data-action="understand-own-hint"]').click();
  await notebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('x=\\frac{1}{2}');
  await page.reload();
  await notebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('x=\\frac{1}{2}');
});
test('Reasoning accepts a confirmed notebook argument for self-review without auto-grading',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  await page.goto('/#/quadratics/reasoning/justify');
  const scope=await page.locator('details[data-working-notebook]').getAttribute('data-scope');
  expect(scope).toMatch(/^quadratics:reasoning:justify:main:/);
  // Click instead of check: an empty notebook is deliberately rejected.
  await page.locator('input[data-reasoning-notebook-evidence]').click();
  await expect(page.locator('input[data-reasoning-notebook-evidence]')).not.toBeChecked();
  await typeMath(page,'x^2-(x+1)(x-1)=1');
  await page.locator('input[data-reasoning-notebook-evidence]').check();
  await expect(page.locator('input[data-reasoning-notebook-evidence]')).toBeChecked();
  await page.locator('[data-action="reasoning-model"]').click();
  await expect(page.locator('button[data-action="reasoning-rate"][data-rating="ready"]')).toBeDisabled();
  for(let i=0;i<3;i++)await page.locator('input[data-reasoning-criterion="'+i+'"]').check();
  await expect(page.locator('button[data-action="reasoning-rate"][data-rating="ready"]')).toBeEnabled();
  await page.locator('button[data-action="reasoning-rate"][data-rating="ready"]').click();
  await expect(page.locator('.reasoning-saved')).toContainText('Self-review saved');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:reasoning:quadratics')));
  expect(Object.values(saved.records).some(r=>r.attempted===true&&r.modelFirst===false)).toBe(true);
  await page.reload();
  await notebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('x^2-(x+1)(x-1)=1');
});
test('Problem Solving permits self-confirmed typed and drawn evidence per problem',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  const section=PROBLEM_SOLVING_CHAPTERS.quadratics[0],practice=section.pages[0];
  await page.goto('/#/quadratics/problemSolving/'+section.id);
  await typeMath(page,'x^2-5x+6=(x-2)(x-3)');
  await drawStroke(page);
  await page.locator('input[data-ps-notebook-evidence="plan"]').check();
  await page.locator('input[data-ps-notebook-evidence="working"]').check();
  const scope=await page.locator('details[data-working-notebook]').getAttribute('data-scope');
  expect(scope).toBe('quadratics:problemSolving:'+section.id+':'+practice.id+':'+practice.tasks[0].id);
  for(let i=0;i<practice.tasks[0].steps.length;i++){
    await page.locator('[data-action="ps-solution"]').click();
  }
  for(let i=0;i<3;i++)await page.locator('input[data-ps-criterion="'+i+'"]').check();
  await expect(page.locator('[data-action="ps-rate"][data-rating="independent"]')).toBeEnabled();
  await page.locator('[data-action="ps-rate"][data-rating="independent"]').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:problem-solving:quadratics')));
  expect(Object.values(saved.records).some(r=>r.attempted===true&&r.modelFirst===false&&r.rating==='independent')).toBe(true);
  await page.reload();
  await notebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('x^2-5x+6=(x-2)(x-3)');
  await page.locator('[data-book-mode="both"]').click().catch(()=>{});
  // Drawn strokes persist even after the session's short written drafts are reset.
  const wasDrawn=await page.evaluate(key=>{
    const b=JSON.parse(localStorage.getItem('maths-notebook:working:v1:'+key));
    return b.pages[0].strokes.length;
  },scope);
  expect(wasDrawn).toBeGreaterThan(0);
});
test('Modelling retains one investigation notebook through all four phases',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  await page.goto('/#/quadratics/modelling/level-1');
  const scope=await page.locator('details[data-working-notebook]').getAttribute('data-scope');
  expect(scope).toMatch(/^quadratics:modelling:level-1:/);
  await typeMath(page,'P(x)=2x^2+3x');
  for(let i=0;i<MODELLING_PHASES.length;i++){
    await expect(page.locator('input[data-mdl-notebook-evidence]')).toHaveAttribute('data-mdl-notebook-evidence',MODELLING_PHASES[i][0]);
    await page.locator('input[data-mdl-notebook-evidence]').check();
    await page.locator('button[data-action="mdl-next"]').click();
    if(i<MODELLING_PHASES.length-1){
      expect(await page.locator('details[data-working-notebook]').getAttribute('data-scope')).toBe(scope);
      await notebook(page);
      await expect(page.locator('[data-book-kind="math"]')).toHaveValue('P(x)=2x^2+3x');
    }
  }
  await expect(page.locator('.mdl-comparison')).toContainText('Mathematics recorded in the working notebook');
  for(let i=0;i<3;i++)await page.locator('input[data-mdl-check="'+i+'"]').check();
  await expect(page.locator('button[data-action="mdl-rate"][data-rating="independent"]')).toBeEnabled();
  await page.locator('button[data-action="mdl-rate"][data-rating="independent"]').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:modelling:quadratics')));
  expect(Object.values(saved.records).some(r=>r.attempted===true&&r.modelFirst===false&&r.rating==='independent')).toBe(true);
  await page.reload();
  await notebook(page);
  await expect(page.locator('[data-book-kind="math"]')).toHaveValue('P(x)=2x^2+3x');
});
test('working notebooks from all four modes remain usable at 320px',async({page})=>{
  await page.route('https://cdn.jsdelivr.net/**',r=>r.abort());
  await page.setViewportSize({width:320,height:820});
  for(const route of ['/quadratics/understand/worked-examples',
    '/quadratics/reasoning/justify','/quadratics/problemSolving/level-1',
    '/quadratics/modelling/level-1']){
    await page.goto('/#'+route);
    await notebook(page);
    const sizes=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
    expect(sizes.scroll,route).toBeLessThanOrEqual(sizes.viewport+1);
  }
});
