import {test,expect} from '@playwright/test';
import {TOPICS} from '../src/topics.js';

test('Flashcards are a real review deck with focus mode, self-rating and persisted due dates',async({page})=>{
  await page.goto('/#/sampling/memorise/flashcards');
  await expect(page.locator('.memorise-pulse')).toContainText('12');
  await expect(page.locator('.memorise-pulse')).toContainText('new');
  await expect(page.locator('.flashcard__face--front')).toContainText('Census');
  await expect(page.locator('.self-ratings')).toBeHidden();
  await page.locator('#flashcard').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#flashcard')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.self-ratings')).toBeVisible();
  await page.getByRole('button',{name:'Again',exact:true}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 2 of 12');
  await page.reload();
  await expect(page.locator('.memorise-pulse')).toContainText('due');
  const saved=await page.evaluate(()=>localStorage.getItem('maths-notebook-pass1a:memorise:sampling'));
  const parsed=JSON.parse(saved);
  expect(parsed.version).toBe(1);
  expect(parsed.cards.census.lastGrade).toBe('again');
  expect(parsed.cards.census.attempts).toBe(1);
  expect(parsed.cards.census.correct).toBe(0);
  await page.locator('[data-action="flash-mode"][data-mode="due"]').click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 1 of 1');
  await expect(page.locator('.flashcard__face--front')).toContainText('Census');
  await page.locator('#flashcard').click();
  await page.getByRole('button',{name:'Know',exact:true}).click();
  await expect(page.locator('.memorise-finish')).toContainText('Round complete');
  await page.locator('[data-action="flash-mode"][data-mode="due"]').click();
  await expect(page.locator('.memorise-empty')).toContainText('No cards are due');
  await page.locator('[data-action="flash-mode"][data-mode="focus"]').click();
  await expect(page.locator('.flashcard')).toBeVisible(); // remaining new terms
});
test('Flashcards navigate without saving exposures and Restart never erases saved history',async({page})=>{
  await page.goto('/#/quadratics/memorise/flashcards');
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 2 of 12');
  await page.getByRole('button',{name:'Previous card'}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 1 of 12');
  await page.getByRole('button',{name:'Restart round'}).click();
  await expect(page.locator('.memorise-pulse')).toContainText('12 new');
  await page.locator('#flashcard').click();
  await page.getByRole('button',{name:'Nearly'}).click();
  await page.getByRole('button',{name:'Restart round'}).click();
  await expect(page.locator('.flashcard-counter')).toContainText('Card 1 of 12');
  await page.locator('.crumbs a').click();
  await page.goto('/#/quadratics/memorise/review-all');
  await expect(page.locator('.review-summary')).toContainText('1');
  await expect(page.locator('.review-deck--quality li').first()).toContainText('Practising');
});
test('Match Up cycles through all 12 terms in three distinct rounds',async({page})=>{
  await page.goto('/#/sampling/memorise/match-up');
  await expect(page.locator('.memorise-round')).toContainText('Round 1 of 3');
  await expect(page.locator('.match-choice[data-side="term"]')).toHaveCount(4);
  const groups=[['census','sample','stratified','systematic'],
    ['simple-random','sampling-frame','population','stratum'],
    ['sampling-interval','selection-bias','quota','opportunity']];
  for(let round=0;round<groups.length;round++){
    for(const id of groups[round]){
      await page.locator('.match-choice[data-side="term"][data-id="'+id+'"]').click();
      await page.locator('.match-choice[data-side="definition"][data-id="'+id+'"]').click();
    }
    await expect(page.locator('#match-feedback')).toContainText('All 4 pairs matched');
    await page.getByRole('button',{name:'Next round'}).click();
    await expect(page.locator('.memorise-round')).toContainText('Round '+((round+1)%3+1)+' of 3');
  }
  await page.goto('/#/sampling/memorise/review-all');
  await expect(page.locator('.review-summary')).toContainText('12');
});
test('a wrong matching connection gives corrective feedback and a review record',async({page})=>{
  await page.goto('/#/sampling/memorise/match-up');
  await page.locator('[data-side="term"][data-id="census"]').click();
  await page.locator('[data-side="definition"][data-id="sample"]').click();
  await expect(page.locator('#match-feedback')).toContainText('Not quite');
  const stored=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:memorise:sampling')));
  expect(stored.cards.census.lastGrade).toBe('again');
  await page.locator('[data-side="term"][data-id="census"]').click();
  await page.locator('[data-side="definition"][data-id="census"]').click();
  await expect(page.locator('#match-feedback')).toContainText('Correct pair connected');
  await expect(page.locator('[data-side="term"][data-id="census"]')).toBeDisabled();
});
test('Missing Words uses varied contextual prompts and does not count hints as mastery',async({page})=>{
  await page.goto('/#/sampling/memorise/missing-words');
  await expect(page.locator('.memorise-round')).toContainText('Prompt 1 of 12');
  await page.getByRole('button',{name:'Give me a hint'}).click();
  await expect(page.locator('.reveal-answer')).toContainText('Two words');
  await page.locator('#cloze-answer').fill('sampling frame');
  await page.locator('#cloze-answer').press('Enter');
  await expect(page.locator('#cloze-feedback')).toContainText('Correct');
  let saved=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:memorise:sampling')));
  expect(saved.cards['sampling-frame'].lastGrade).toBe('nearly');
  await page.getByRole('button',{name:'Next prompt'}).click();
  await expect(page.locator('.cloze-line')).toContainText('Collecting data from every member');
  await page.getByRole('button',{name:'Reveal answer'}).click();
  await expect(page.locator('#cloze-feedback')).toContainText('census');
  saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('maths-notebook-pass1a:memorise:sampling')));
  expect(saved.cards.census.lastGrade).toBe('again');
  await page.getByRole('button',{name:'Next prompt'}).click();
  await page.locator('#cloze-answer').fill('sample');
  await page.locator('#cloze-answer').press('Enter');
  await expect(page.locator('#cloze-feedback')).toContainText('Correct.');
  await page.reload();
  await expect(page.locator('.memorise-pulse')).toContainText('due');
  await page.locator('[data-action="cloze-mode"][data-mode="focus"]').click();
  await expect(page.locator('.cloze-line')).toContainText('Collecting data from every member'); // the due item is prioritised
});
test('Speed Recall accepts reviewed aliases and minor typos but rejects wrong concepts',async({page})=>{
  await page.goto('/#/quadratics/memorise/speed-recall');
  await expect(page.locator('.recall-workspace')).toContainText('Definition 1 of 12');
  await page.locator('#recall-answer').fill('Quadratic function');
  await page.locator('#recall-answer').press('Enter');
  await expect(page.locator('.game-feedback')).toContainText('Correct');
  await page.getByRole('button',{name:'Next definition'}).click();
  await page.locator('#recall-answer').fill('vertex');
  await page.locator('#recall-answer').press('Enter');
  await expect(page.locator('.game-feedback')).toContainText('Correct.');
  await page.getByRole('button',{name:'Next definition'}).click();
  await page.locator('#recall-answer').fill('axis of symetry');
  await page.locator('#recall-answer').press('Enter');
  await expect(page.locator('.game-feedback')).toContainText('minor spelling slip accepted');
  await page.getByRole('button',{name:'Next definition'}).click();
  await page.locator('#recall-answer').fill('sample');
  await page.locator('#recall-answer').press('Enter');
  await expect(page.locator('.game-feedback')).toContainText('Review');
  const saved=await page.evaluate(()=>JSON.parse(
    localStorage.getItem('maths-notebook-pass1a:memorise:quadratics')));
  expect(saved.cards.quadratic.lastGrade).toBe('know');
  expect(saved.cards.symmetry.lastGrade).toBe('nearly');
  expect(saved.cards.discriminant.lastGrade).toBe('again');
  await page.getByRole('button',{name:'Next definition'}).click();
  await page.locator('[data-action="recall-mode"][data-mode="due"]').click();
  await expect(page.locator('.recall-workspace')).toContainText('Definition 1 of 1');
});
test('Review All filters, searches and flags per card without affecting other topics',async({page})=>{
  await page.goto('/#/sampling/memorise/review-all');
  await expect(page.locator('.review-deck--quality li')).toHaveCount(12);
  await page.locator('#review-search').fill('quota sampling');
  await expect(page.locator('.review-deck--quality li')).toHaveCount(1);
  await expect(page.locator('.review-deck--quality')).toContainText('Quota sampling');
  await page.locator('#review-search').fill('');
  await page.locator('.review-deck--quality [data-action="memory-flag"]').first().click();
  await page.locator('#review-filter').selectOption('flagged');
  await expect(page.locator('.review-deck--quality li')).toHaveCount(1);
  await page.reload();
  await page.locator('#review-filter').selectOption('flagged');
  await expect(page.locator('.review-deck--quality li')).toHaveCount(1);
  await page.getByRole('button',{name:'Hide definitions'}).click();
  await expect(page.locator('.review-deck--quality p')).toHaveCount(0);
  await page.goto('/#/quadratics/memorise/review-all');
  await page.locator('#review-filter').selectOption('flagged');
  await expect(page.locator('.review-deck--quality li')).toHaveCount(0);
});
test('resetting progress requires explicit confirmation and affects only one topic',async({page})=>{
  await page.goto('/#/sampling/memorise/flashcards');
  await page.locator('#flashcard').click();
  await page.getByRole('button',{name:'Know',exact:true}).click();
  await page.goto('/#/quadratics/memorise/flashcards');
  await page.locator('#flashcard').click();
  await page.getByRole('button',{name:'Again',exact:true}).click();
  await page.goto('/#/sampling/memorise/review-all');
  await page.getByRole('button',{name:'Reset topic progress'}).click();
  await expect(page.getByText('cannot be undone')).toBeVisible();
  await page.getByRole('button',{name:'Cancel'}).click();
  await expect(page.locator('.review-summary')).toContainText('1');
  await page.getByRole('button',{name:'Reset topic progress'}).click();
  await page.getByRole('button',{name:'Reset saved progress'}).click();
  await expect(page.locator('.memorise-pulse')).toContainText('12 new');
  await page.reload();
  await expect(page.locator('.memorise-pulse')).toContainText('12 new');
  await page.goto('/#/quadratics/memorise/review-all');
  await expect(page.locator('.memorise-pulse')).toContainText('1 due');
});
for(const width of [320,390,768,1024,1440]){
  test('all five Memorise subsections are responsive at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:850});
    for(const section of ['flashcards','match-up','missing-words','speed-recall','review-all']){
      await page.goto('/#/sampling/memorise/'+section);
      await expect(page.locator('#page-title')).toBeVisible();
      await expect(page.locator('.book-page h1')).toHaveCount(1);
      await expect(page.locator('.page-subtitle')).toHaveCount(1);
      await expect(page.locator('.page-navigation')).toHaveCount(0);
      const result=await page.evaluate(()=>({
        scroll:document.documentElement.scrollWidth,width:window.innerWidth
      }));
      expect(result.scroll,'overflow in '+section+' at '+width).toBeLessThanOrEqual(result.width+1);
    }
  });
}
test('Memorise keyboard and reduced motion functionality is preserved',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#/sampling/memorise/flashcards');
  const duration=await page.locator('.flashcard__inner').evaluate(
    node=>getComputedStyle(node).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(.01);
  await page.locator('#flashcard').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#flashcard')).toHaveAttribute('aria-pressed','true');
  await page.goto('/#/sampling/memorise/match-up');
  await page.locator('[data-side="term"][data-id="census"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-side="term"][data-id="census"]')).toHaveAttribute('aria-pressed','true');
  await page.goto('/#/sampling/memorise/missing-words');
  await page.locator('#cloze-answer').fill('sampling frame');
  await page.keyboard.press('Enter');
  await expect(page.locator('#cloze-feedback')).toContainText('Correct');
});
