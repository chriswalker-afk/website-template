import {test,expect} from '@playwright/test';

test('Contents and chapter tabs offer real navigation',async({page})=>{
  await page.goto('/#/sampling/home');
  await expect(page.getByRole('heading',{name:'Contents'})).toBeVisible();
  await expect(page.locator('.chapter-tab')).toHaveCount(4);
  await expect(page.locator('.chapter-tabs')).toBeVisible();
  await expect(page.locator('.side-tabs')).toHaveCount(0);
  await page.locator('.chapter-tabs').getByRole('link',{name:'Memorise'}).click();
  await expect(page.getByRole('heading',{name:'Make it stick.'})).toBeVisible();
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
  await expect(page.getByText('Every curve tells a story.')).toBeVisible();
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
  await expect(page.getByText('Rated in this preview')).toBeVisible();
  await page.locator('.deck-browser summary').click();
  await expect(page.locator('.deck-browser li')).toHaveCount(6);
  await page.getByRole('button',{name:'Restart'}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('01 / 06');
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
