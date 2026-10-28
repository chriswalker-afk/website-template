import {test,expect} from '@playwright/test';
import {TOPICS} from '../src/topics.js';

test('Contents and chapter tabs offer real navigation',async({page})=>{
  await page.goto('/#/sampling/home');
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
  await expect(page.locator('.chapter-tab')).toHaveCount(4);
  await expect(page.locator('.chapter-tabs')).toBeVisible();
  await expect(page.locator('.side-tabs')).toHaveCount(0);
  await page.locator('.chapter-tabs').getByRole('link',{name:'Memorise'}).click();
  await expect(page.getByRole('heading',{name:'Flashcards'})).toBeVisible();
  await expect(page.locator('.chapter-tab[aria-current="page"]')).toContainText('Memorise');
  await expect(page.locator('.side-tab')).toHaveCount(3);
  await expect(page.locator('.side-tab[aria-current="page"]')).toContainText('Flashcards');
  await expect(page.locator('.book-page')).toHaveAttribute('data-paper','plain');
  await page.goBack();
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
});

test('topic selection reconfigures chapters without dead tabs',async({page})=>{
  await page.goto('/#/sampling/home');
  await page.locator('#topic-switcher').selectOption('quadratics');
  await expect(page).toHaveURL(/#\/quadratics\/home/);
  await expect(page.locator('.chapter-tab')).toHaveCount(6);
  await expect(page.locator('.chapter-tabs').getByRole('link',{name:'Fluency'})).toBeVisible();
  await expect(page.locator('.chapter-tabs').getByRole('link',{name:'Reasoning'})).toHaveCount(0);
  await expect(page.locator('.cover-title').getByText('Quadratic Functions')).toBeVisible();
});

test('flashcards flip, rate and show the whole deck',async({page})=>{
  await page.goto('/#/sampling/memorise/flashcards');
  const flash=page.locator('#flashcard');
  await expect(page.locator('#ratings')).toBeHidden();
  const outer=await flash.boundingBox();
  const face=await page.locator('.flashcard__face--front').boundingBox();
  expect(face.width).toBeGreaterThan(outer.width*0.96);
  expect(face.height).toBeGreaterThan(outer.height*0.96);
  await expect(flash).toHaveAttribute('aria-pressed','false');
  await flash.focus();
  await page.keyboard.press('Enter');
  await expect(flash).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#ratings')).toBeVisible();
  await page.getByRole('button',{name:'Know'}).click();
  await expect(page.locator('#flashcard')).toHaveAttribute('aria-pressed','false');
  await expect(page.getByText('Cards rated')).toBeVisible();
  await page.locator('.deck-browser summary').click();
  await expect(page.locator('.deck-browser li')).toHaveCount(6);
  await page.getByRole('button',{name:'Restart'}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 1 of 6');
});

test('Match Up and Missing Words are keyboard-friendly',async({page})=>{
  await page.goto('/#/sampling/memorise/match-up');
  await page.locator('[data-side="term"][data-id="census"]').click();
  await page.locator('[data-side="definition"][data-id="census"]').click();
  await expect(page.locator('#match-feedback')).toContainText('Correct pair connected');
  await expect(page.locator('[data-side="term"][data-id="census"]')).toBeDisabled();
  await page.goto('/#/sampling/memorise/missing-words');
  await page.locator('#cloze-answer').fill('sampling frame');
  await page.locator('#cloze-answer').press('Enter');
  await expect(page.locator('#cloze-feedback')).toContainText('Correct');
});

test('graph explorer updates the curve and its turning point',async({page})=>{
  await page.goto('/#/quadratics/fluency/graph-lab');
  await expect(page.locator('.book-page')).toHaveAttribute('data-paper','squared');
  const original=await page.locator('#graph-svg path[stroke="#2d755f"]').getAttribute('d');
  await page.locator('input[data-graph="h"]').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await expect(page.locator('#vertex-display')).toContainText('(2, -2)');
  const changed=await page.locator('#graph-svg path[stroke="#2d755f"]').getAttribute('d');
  expect(changed).not.toBe(original);
  await page.getByRole('button',{name:'Flip opening direction'}).click();
  await expect(page.locator('#equation-display')).toContainText('−');
  await expect(page.locator('#graph-svg')).toHaveAttribute('role','img');
});

test('bookmarks appear in Contents and decorative motion can be switched off',async({page})=>{
  await page.goto('/#/sampling/understand/big-idea');
  await page.getByRole('button',{name:'Bookmark this page'}).click();
  await expect(page.getByRole('button',{name:'Remove bookmark'})).toBeVisible();
  await page.locator('.crumbs a').click();
  await expect(page.locator('.saved-markers')).toContainText('The big idea');
  await page.getByRole('button',{name:/Motion:/}).click();
  await expect(page.locator('body')).toHaveClass(/motion-off/);
  await expect(page.getByRole('button',{name:/Motion:/})).toHaveAttribute('aria-pressed','true');
});

for(const width of [320,390,768,1024,1440]){
  test('no viewport overflow at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:850});
    for(const path of ['/#/quadratics/home','/#/sampling/memorise/flashcards','/#/quadratics/fluency/graph-lab']){
      await page.goto(path);
      await expect(page.locator('#page-title')).toBeVisible();
      const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
      expect(size.scroll,'Horizontal overflow at '+width+' on '+path).toBeLessThanOrEqual(size.inner+1);
      if(width<=960){
        await expect(page.locator('#mobile-chapter')).toBeVisible();
        await expect(page.locator('.chapter-tabs')).toBeHidden();
      }else{
        await expect(page.locator('.chapter-tabs')).toBeVisible();
      }
    }
  });
}
test('reduced motion and keyboard controls retain content access',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/sampling/memorise/flashcards');
  await expect(page.locator('#flashcard')).toBeVisible();
  const duration=await page.locator('.flashcard__inner').evaluate(el=>getComputedStyle(el).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  await page.locator('#flashcard').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#flashcard')).toHaveAttribute('aria-pressed','true');
});


test('each contents page has one heading and one description',async({page})=>{
  for(const topic of Object.values(TOPICS)){
    await page.goto('/#/'+topic.id+'/home');
    await expect(page.locator('.book-page h1')).toHaveCount(1);
    await expect(page.locator('.book-page h1')).toHaveText('Contents');
    await expect(page.locator('.contents-heading > p')).toHaveCount(1);
    await expect(page.locator('.cover-title')).toHaveText(topic.title);
    await expect(page.locator('.contents-sticky, .page-eyebrow, .book-kicker')).toHaveCount(0);
  }
});

test('every subsection uses its real title and one helpful description',async({page})=>{
  for(const topic of Object.values(TOPICS)){
    for(const [chapterId,sections] of Object.entries(topic.chapters)){
      for(const section of sections){
        await page.goto('/#/'+topic.id+'/'+chapterId+'/'+section.id);
        await expect(page.locator('.book-page h1')).toHaveCount(1);
        await expect(page.locator('#page-title')).toHaveText(section.label);
        await expect(page.locator('.page-subtitle')).toHaveCount(1);
        const text=await page.locator('.page-subtitle').innerText();
        expect(text.trim().length,topic.id+'/'+chapterId+'/'+section.id).toBeGreaterThan(15);
        await expect(page.locator('.page-eyebrow, .preview-label, .prototype-notice, .book-kicker, .side-tabs__note')).toHaveCount(0);
        await expect(page.locator('.crumbs')).not.toContainText(section.label);
      }
    }
  }
});

test('page instructions do not repeat within activity panels',async({page})=>{
  await page.goto('/#/sampling/memorise/flashcards');
  await expect(page.locator('.memory-sidebar h2, .memory-sidebar p, .flashcard__eyebrow, .flashcard__bottom')).toHaveCount(0);
  await expect(page.locator('.self-ratings')).toBeHidden();
  await page.goto('/#/quadratics/fluency/graph-lab');
  await expect(page.locator('.graph-card h2, .graph-controls h2, .graph-controls > p, .graph-topline')).toHaveCount(0);
  await expect(page.locator('#equation-display')).toBeVisible();
  await page.goto('/#/sampling/memorise/match-up');
  await expect(page.locator('.match-column h2, .prototype-notice')).toHaveCount(0);
  await expect(page.locator('.match-column__label')).toHaveText(['Terms','Definitions']);
});
