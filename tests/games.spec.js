import {test,expect} from '@playwright/test';
import {QUESTION_BANKS} from '../src/topic-packs/registry.js';
import {createLoopGame,createConcentrationGame,createHexGame}
  from '../src/games/engine.js';

const gradient=QUESTION_BANKS.gradient.games.pairs;
const loopRoute='/#/gradient/games/loop-cards';
const memoryRoute='/#/gradient/games/concentration';
const hexRoute='/#/gradient/games/hex-crossing';

test('Loop Cards builds a real closed question-answer cycle',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(loopRoute);
  await expect(page.getByRole('heading',{name:'Loop Cards'})).toBeVisible();
  await expect(page.locator('.game-loop-slot')).toHaveCount(8);
  await expect(page.locator('button[data-action="game-place"]')).toHaveCount(7);
  await expect(page.locator('.game-domino__question').first()).toBeVisible();
  const deck=createLoopGame(gradient,{seed:2026}).deck;
  await expect(page.locator('button[data-action="game-check"]')).toBeDisabled();
  await expect(page.locator('.game-feedback')).toContainText('Select a card');
  for(const card of deck.slice(1)){
    await page.locator('button[data-action="game-place"][data-card="'+card.id+'"]').click();
  }
  await page.locator('button[data-action="game-check"]').click();
  await expect(page.locator('.game-feedback')).toContainText('Complete loop');
  await expect(page.locator('button[data-action="game-check"]')).toBeDisabled();
  await page.locator('button[data-action="game-new"]').click();
  await expect(page.locator('button[data-action="game-place"]')).toHaveCount(7);
  expect(errors).toEqual([]);
});
test('Loop Cards supports returning cards and mixed challenge question sets',async({page})=>{
  await page.goto(loopRoute);
  await page.locator('button[data-action="game-place"]').first().click();
  await expect(page.locator('button[data-action="game-place"]')).toHaveCount(6);
  await page.locator('button[data-action="game-remove"][data-position="1"]').click();
  await expect(page.locator('button[data-action="game-place"]')).toHaveCount(7);
  await page.locator('button[data-action="game-place"]').first().click();
  await page.locator('button[data-action="game-place"]').first().click();
  await page.locator('button[data-action="game-swap"][data-from="1"][data-to="2"]').click();
  await expect(page.locator('.game-feedback')).toContainText('Cards swapped');
  await page.locator('button[data-action="game-difficulty"][data-level="mixed"]').click();
  await expect(page.locator('button[data-action="game-difficulty"][data-level="mixed"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.game-loop-slot')).toHaveCount(8);
});
test('Concentration matches a question with its specific answer and scores',async({page})=>{
  await page.goto(memoryRoute);
  await expect(page.getByRole('heading',{name:'Concentration'})).toBeVisible();
  await expect(page.locator('.game-memory-tile')).toHaveCount(16);
  const deck=createConcentrationGame(gradient,{seed:2026}).tiles;
  const q=deck.find(t=>t.kind==='question');
  const a=deck.find(t=>t.pairId===q.pairId&&t.kind==='answer');
  await page.locator('button[data-action="game-flip"][data-card="'+q.id+'"]').click();
  await expect(page.locator('button[data-action="game-flip"][data-card="'+q.id+'"]')).toContainText('question');
  await expect(page.locator('.game-memory-detail')).toContainText(q.text);
  await page.locator('button[data-action="game-flip"][data-card="'+a.id+'"]').click();
  await expect(page.locator('.game-stats')).toContainText('1/8 pairs');
  await expect(page.locator('button[data-action="game-flip"][data-card="'+q.id+'"]')).toBeDisabled();
  await page.locator('button[data-action="game-players"][data-players="2"]').click();
  await expect(page.locator('.game-turn')).toContainText('Player 1');
  const others=deck.filter(t=>t.pairId!==q.pairId);
  await page.locator('button[data-action="game-flip"][data-card="'+q.id+'"]').click();
  await page.locator('button[data-action="game-flip"][data-card="'+others[0].id+'"]').click();
  await expect(page.locator('button[data-action="game-continue"]')).toBeVisible();
  await page.locator('button[data-action="game-continue"]').click();
  await expect(page.locator('.game-turn')).toContainText('Player 2');
});
test('Hex Crossing needs a correct answer to claim a hexagon',async({page})=>{
  await page.goto(hexRoute);
  await expect(page.getByRole('heading',{name:'Hex Crossing'})).toBeVisible();
  await expect(page.locator('.game-hex-cell')).toHaveCount(25);
  const board=createHexGame(gradient,{seed:2026,size:5});
  const answer=gradient.find(pair=>pair.id===board.cells[0].pairId).answerDisplay;
  await page.locator('button[data-action="game-hex-select"][data-cell="0"]').click();
  await expect(page.locator('#game-hex-answer')).toBeFocused();
  await page.locator('#game-hex-answer').fill(answer);
  await page.locator('#game-hex-form button[type="submit"]').click();
  await expect(page.locator('button[data-action="game-hex-select"][data-cell="0"]')).toHaveClass(/game-hex-cell--forest/);
  await expect(page.locator('button[data-action="game-continue"]')).toBeVisible();
  await page.locator('button[data-action="game-continue"]').click();
  await expect(page.locator('.game-stats')).toContainText('Player 2');
  await page.locator('button[data-action="game-hex-select"][data-cell="1"]').click();
  await page.locator('#game-hex-answer').fill('90000');
  await page.locator('#game-hex-form button[type="submit"]').click();
  await expect(page.locator('button[data-action="game-hex-select"][data-cell="1"]')).toHaveClass(/game-hex-cell--available/);
  await expect(page.locator('.game-feedback')).toContainText('stays available');
});
test('The same three game templates work on Sampling and Quadratics',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    for(const game of ['loop-cards','concentration','hex-crossing']){
      await page.goto('/#/'+topic+'/games/'+game);
      await expect(page.locator('.game-workspace[data-standard-game="'+game+'"]')).toBeVisible();
      await expect(page.locator('body')).not.toContainText('Prototype content needs attention');
    }
  }
});
test('Game controls stay within the book on mobile and retain keyboard access',async({page})=>{
  await page.setViewportSize({width:375,height:800});
  for(const url of [loopRoute,memoryRoute,hexRoute]){
    await page.goto(url);
    await expect(page.locator('.game-workspace')).toBeVisible();
    const widths=await page.evaluate(()=>({
      viewport:window.innerWidth,scroll:document.documentElement.scrollWidth
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.viewport+2);
  }
  await page.goto(loopRoute);
  await page.locator('button[data-action="game-place"]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.game-loop-slot .game-domino')).toHaveCount(2);
});
