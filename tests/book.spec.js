import {test,expect} from '@playwright/test';
import {TOPICS} from '../src/topics.js';

test('Contents, top modes and right-hand subsections are separate navigation levels',async({page})=>{
  await page.goto('/#/sampling/home');
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
  await expect(page.locator('.chapter-tab')).toHaveCount(5);
  await expect(page.locator('.side-tabs')).toHaveCount(0);
  await page.locator('.chapter-tabs').getByRole('link',{name:'Understand'}).click();
  await expect(page.getByRole('heading',{name:'The big idea'})).toBeVisible();
  await expect(page.locator('.side-tab')).toHaveCount(4);
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('The big idea');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page).toHaveURL(/#\/sampling\/understand\/big-idea\/representativeness/);
  await expect(page.getByRole('heading',{name:'The big idea'})).toBeVisible();
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('The big idea');
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
  await expect(page.locator('.page-navigation')).toContainText('Last page');
  await page.goBack();
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
  await page.locator('.side-tabs').getByRole('link',{name:/Visual explanations/}).click();
  await expect(page.getByRole('heading',{name:'Visual explanations'})).toBeVisible();
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
});

test('topic selector reflects available modes and uses full Problem Solving name',async({page})=>{
  await page.goto('/#/sampling/home');
  await page.locator('#topic-switcher').selectOption('quadratics');
  await expect(page).toHaveURL(/#\/quadratics\/home/);
  await expect(page.locator('.chapter-tab')).toHaveCount(7);
  await expect(page.locator('.chapter-tabs').getByRole('link',{name:'Problem Solving'})).toBeVisible();
  await expect(page.locator('.chapter-tabs').getByRole('link',{name:'Modelling'})).toBeVisible();
  await expect(page.locator('.cover-title')).toHaveText('Quadratic Functions');
  await page.locator('.chapter-tabs').getByRole('link',{name:'Problem Solving'}).click();
  await expect(page.getByRole('heading',{name:'Level 1: Guided'})).toBeVisible();
  await expect(page.locator('.side-tab')).toHaveCount(4);
  await page.locator('#topic-switcher').selectOption('sampling');
  await expect(page).toHaveURL(/#\/sampling\/home/);
});

test('flashcards preserve internal card progression without extra book pages',async({page})=>{
  await page.goto('/#/sampling/memorise/flashcards');
  const flash=page.locator('#flashcard');
  await expect(page.locator('#ratings')).toBeHidden();
  const outer=await flash.boundingBox();
  const face=await page.locator('.flashcard__face--front').boundingBox();
  expect(face.width).toBeGreaterThan(outer.width*0.96);
  expect(face.height).toBeGreaterThan(outer.height*0.96);
  await flash.focus();
  await page.keyboard.press('Enter');
  await expect(flash).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Know'}).click();
  await expect(flash).toHaveAttribute('aria-pressed','false');
  await expect(page.getByText('Cards rated this round')).toBeVisible();
  await expect(page.locator('.page-navigation')).toHaveCount(0);
  await page.locator('.deck-browser summary').click();
  await expect(page.locator('.deck-browser li')).toHaveCount(12);
  await page.getByRole('button',{name:'Restart'}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 1 of 12');
});

test('Memorise subsections have independent retrieval activities',async({page})=>{
  await page.goto('/#/sampling/memorise/match-up');
  await page.locator('[data-side="term"][data-id="census"]').click();
  await page.locator('[data-side="definition"][data-id="census"]').click();
  await expect(page.locator('#match-feedback')).toContainText('Correct pair connected');
  await page.goto('/#/sampling/memorise/missing-words');
  await page.locator('#cloze-answer').fill('sampling frame');
  await page.locator('#cloze-answer').press('Enter');
  await expect(page.locator('#cloze-feedback')).toContainText('Correct');
  await page.goto('/#/sampling/memorise/speed-recall');
  await expect(page.getByRole('heading',{name:'Speed Recall'})).toBeVisible();
  await page.locator('#recall-answer').fill('census');
  await page.locator('#recall-answer').press('Enter');
  await expect(page.locator('.recall-workspace .game-feedback')).toContainText('Correct');
  await page.getByRole('button',{name:'Next definition'}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Definition 2 of 12');
  await page.goto('/#/sampling/memorise/review-all');
  await expect(page.locator('.review-deck li')).toHaveCount(12);
});

test('the quadratic graph teaches shape separately from translations',async({page})=>{
  await page.goto('/#/quadratics/understand/visual-explanations');
  await expect(page.locator('.book-page')).toHaveAttribute('data-paper','squared');
  await expect(page.locator('#graph-svg')).toBeVisible();
  await expect(page.locator('input[data-graph="magnitude"]')).toBeVisible();
  await expect(page.locator('input[data-graph="h"]')).toHaveCount(0);
  await expect(page.locator('#graph-svg path[stroke="#9caaa3"]')).toBeVisible();
  const original=await page.locator('#graph-svg path[stroke="#2d755f"]').getAttribute('d');
  await page.locator('input[data-graph="magnitude"]').evaluate(el=>{
    el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#graph-observation')).toContainText('narrower than y = x²');
  const updated=await page.locator('#graph-svg path[stroke="#2d755f"]').getAttribute('d');
  expect(updated).not.toBe(original);
  await page.getByRole('button',{name:'Flip opening direction'}).click();
  await expect(page.locator('#equation-display')).toContainText('−2x²');
  await expect(page.locator('#graph-observation')).toContainText('Opens downwards');
  await page.getByRole('button',{name:'Reset graph'}).click();
  await expect(page.locator('#equation-display')).toHaveText('y = x²');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page).toHaveURL(/#\/quadratics\/understand\/visual-explanations\/position/);
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Visual explanations');
  await expect(page.locator('input[data-graph="magnitude"]')).toHaveCount(0);
  await expect(page.locator('input[data-graph="h"]')).toBeVisible();
  await expect(page.locator('input[data-graph="k"]')).toBeVisible();
  await page.locator('input[data-graph="h"]').evaluate(el=>{
    el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('#graph-observation')).toContainText('Turning point (2, -2)');
  await page.goto('/#/quadratics/fluency/level-1');
  await expect(page.locator('#graph-svg')).toHaveCount(0);
  await expect(page.locator('.fluency-question')).toHaveCount(1);
  await expect(page.locator('.fluency-settings')).toBeVisible();
});

test('Fluency, Problem Solving and Modelling stay educationally distinct',async({page})=>{
  await page.goto('/#/quadratics/fluency/level-1');
  await expect(page.locator('.side-tab')).toHaveCount(4);
  await expect(page.locator('.fluency-question')).toBeVisible();
  await expect(page.locator('.practice-question')).toHaveCount(0);
  await expect(page.locator('#graph-svg')).toHaveCount(0);
  await page.locator('.side-tabs a[href$="level-4"]').click();
  await expect(page.getByRole('heading',{name:/Level 4:/})).toBeVisible();
  await expect(page.locator('.fluency-answer-form')).toBeVisible();
  await page.getByRole('button',{name:'Show full solution'}).click();
  await expect(page.locator('.fluency-solution__steps li').first()).toBeVisible();
  for(const mode of ['problemSolving','modelling']){
    await page.goto('/#/quadratics/'+mode+'/level-1');
    await expect(page.locator('.side-tab')).toHaveCount(4);
    await expect(page.locator('.practice-question').first()).toBeVisible();
    await expect(page.locator('.fluency-question')).toHaveCount(0);
    await page.locator('.side-tabs a[href$="level-4"]').click();
    await expect(page.getByRole('heading',{name:/Level 4:/})).toBeVisible();
    await page.locator('.practice-question').first().getByRole('button',{name:'Show solution'}).click();
    await expect(page.locator('.practice-question .reveal-answer').first()).toBeVisible();
  }
});
test('a level can contain multiple pages without changing its right tab',async({page})=>{
  await page.goto('/#/quadratics/problemSolving/level-1');
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 1 of 2');
  await page.getByRole('link',{name:'Next page'}).click();
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Level 1: Guided');
  await expect(page).toHaveURL(/#\/quadratics\/problemSolving\/level-1\/unknown-coefficient/);
  await page.getByRole('link',{name:'Previous page'}).click();
  await expect(page).toHaveURL(/#\/quadratics\/problemSolving\/level-1$/);
});

test('each game option is its own right-side tab and is clearly a preview',async({page})=>{
  await page.goto('/#/quadratics/games/sprint');
  await expect(page.locator('.side-tab')).toHaveCount(3);
  await expect(page.getByRole('heading',{name:'Sprint'})).toBeVisible();
  await expect(page.locator('.game-feature')).toContainText('Planned game');
  await expect(page.locator('.games-shelf')).toHaveCount(0);
  await page.locator('.side-tabs').getByRole('link',{name:/Puzzle Quest/}).click();
  await expect(page.getByRole('heading',{name:'Puzzle Quest'})).toBeVisible();
  await page.locator('.side-tabs').getByRole('link',{name:/Curve Quest/}).click();
  await expect(page.getByRole('heading',{name:'Curve Quest'})).toBeVisible();
  await expect(page.locator('.page-navigation')).toHaveCount(0);
});

test('a bookmark and resume link preserve the exact page position',async({page})=>{
  await page.goto('/#/sampling/understand/big-idea/representativeness');
  await page.getByRole('button',{name:'Bookmark this page'}).click();
  await page.locator('.crumbs a').click();
  await expect(page.locator('.saved-markers')).toContainText('page 2');
  await page.locator('.saved-markers a').click();
  await expect(page).toHaveURL(/\/representativeness$/);
  await page.reload();
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
  await page.getByRole('button',{name:/Motion:/}).click();
  await expect(page.locator('body')).toHaveClass(/motion-off/);
});

for(const width of [320,390,768,1024,1440]){
  test('new hierarchy fits '+width+'px without clipped navigation or maths',async({page})=>{
    await page.setViewportSize({width,height:850});
    for(const path of ['/#/quadratics/home','/#/sampling/understand/how-it-works',
      '/#/quadratics/understand/visual-explanations','/#/quadratics/fluency/level-1',
      '/#/quadratics/games/puzzle-quest']){
      await page.goto(path);
      await expect(page.locator('#page-title')).toBeVisible();
      const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));
      expect(size.scroll,'Horizontal overflow at '+width+' on '+path).toBeLessThanOrEqual(size.width+1);
      if(width<=960){
        await expect(page.locator('#mobile-chapter')).toBeVisible();
        await expect(page.locator('.chapter-tabs')).toBeHidden();
      }else{
        await expect(page.locator('.chapter-tabs')).toBeVisible();
      }
    }
    if(width<=960){
      await page.goto('/#/quadratics/understand/visual-explanations');
      await expect(page.locator('#mobile-section')).toHaveValue('visual-explanations');
      await page.locator('#mobile-section').selectOption('worked-examples');
      await expect(page.getByRole('heading',{name:'Worked examples'})).toBeVisible();
    }
  });
}
test('reduced motion and keyboard still work through pages and cards',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/sampling/memorise/flashcards');
  const duration=await page.locator('.flashcard__inner').evaluate(node=>getComputedStyle(node).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  await page.locator('#flashcard').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#flashcard')).toHaveAttribute('aria-pressed','true');
  await page.goto('/#/sampling/understand/big-idea');
  await page.getByRole('link',{name:'Next page'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.page-navigation__count')).toHaveText('Page 2 of 2');
});

for(const topic of Object.values(TOPICS)){
  test(topic.id+' has one heading and explanation for every subsection/page',async({page})=>{
    test.setTimeout(60000);
    await page.goto('/#/'+topic.id+'/home');
    await expect(page.locator('.book-page h1')).toHaveCount(1);
    await expect(page.locator('.contents-heading > p')).toHaveCount(1);
    for(const [mode,sections] of Object.entries(topic.chapters)){
      for(const section of sections){
        for(const [index,p] of section.pages.entries()){
          const path='/#/'+topic.id+'/'+mode+'/'+section.id+(index?'/' +p.id:'');
          await page.goto(path);
          await expect(page.locator('.book-page h1')).toHaveCount(1);
          await expect(page.locator('#page-title')).toHaveText(section.label);
          await expect(page.locator('.page-subtitle')).toHaveCount(1);
          await expect(page.locator('.page-subtitle')).toHaveText(section.description);
          await expect(page.locator('.page-eyebrow, .preview-label, .prototype-notice')).toHaveCount(0);
          if(section.pages.length>1){
            await expect(page.locator('.page-navigation__count')).toHaveText(
              'Page '+(index+1)+' of '+section.pages.length);
          }else await expect(page.locator('.page-navigation')).toHaveCount(0);
        }
      }
    }
  });
}
