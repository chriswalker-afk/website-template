import {test,expect} from '@playwright/test';
import {QUESTION_BANKS} from '../src/topic-packs/registry.js';
import {createLoopGame,createConcentrationGame,createHexGame}
  from '../src/games/engine.js';

const gradient=QUESTION_BANKS.gradient.games.pairs;
const loopRoute='/#/gradient/games/loop-cards';
const memoryRoute='/#/gradient/games/concentration';
const hexRoute='/#/gradient/games/hex-crossing';

test('Loop Cards is a visible clockwise circuit with cards and controls on screen',async({page})=>{
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.setViewportSize({width:1366,height:768});
  await page.goto(loopRoute);
  await expect(page.locator('body')).toHaveClass(/game-focus-mode/);
  await expect(page.locator('.game-play-title')).toHaveText('Loop Cards');
  await expect(page.locator('.game-loop-slot')).toHaveCount(8);
  for(const pos of ['top-left','top','top-right','right','bottom-right','bottom','bottom-left','left'])
    await expect(page.locator('[data-loop-position="'+pos+'"]')).toBeVisible();
  await expect(page.locator('.game-loop-hub')).toContainText('Close the loop');
  await expect(page.locator('.game-domino-tray [data-game-draggable]')).toHaveCount(7);
  const bounds=await page.evaluate(()=>{
    const shell=document.querySelector('.game-shell').getBoundingClientRect();
    const tray=document.querySelector('.game-loop-hand').getBoundingClientRect();
    return {shellTop:shell.top,shellBottom:shell.bottom,trayBottom:tray.bottom,height:innerHeight};
  });
  expect(bounds.shellTop).toBeGreaterThanOrEqual(0);
  expect(bounds.shellBottom).toBeLessThanOrEqual(bounds.height+2);
  expect(bounds.trayBottom).toBeLessThanOrEqual(bounds.height+2);
  expect(errors).toEqual([]);
});
test('Loop Cards supports tap-to-pick, slot selection and swapping two physical cards',async({page})=>{
  await page.goto(loopRoute);
  const deck=createLoopGame(gradient,{seed:2026}).deck;
  await expect(page.locator('button[data-action="game-check"]')).toBeDisabled();
  for(let index=1;index<deck.length;index++){
    const id=deck[index].id;
    await page.locator('.game-domino-tray [data-game-draggable="'+id+'"]').click();
    await expect(page.locator('.game-loop-hub')).toContainText('Holding');
    await page.locator('button[data-action="game-slot"][data-position="'+index+'"]').click();
  }
  await expect(page.locator('.game-domino-tray [data-game-draggable]')).toHaveCount(0);
  await expect(page.locator('button[data-action="game-check"]')).toBeEnabled();
  await page.locator('[data-loop-slot="1"] [data-game-draggable]').click();
  await page.locator('[data-loop-slot="2"] [data-game-draggable]').click();
  await page.locator('button[data-action="game-check"]').click();
  await expect(page.locator('.game-feedback')).toContainText('do not match');
  await page.locator('[data-loop-slot="1"] [data-game-draggable]').click();
  await page.locator('[data-loop-slot="2"] [data-game-draggable]').click();
  await page.locator('button[data-action="game-check"]').click();
  await expect(page.locator('.game-feedback')).toContainText('Complete loop');
  await expect(page.locator('button[data-action="game-check"]')).toBeDisabled();
  await page.locator('button[data-action="game-new"]').click();
  await expect(page.locator('.game-domino-tray [data-game-draggable]')).toHaveCount(7);
});
test('Loop Cards supports native drag-and-drop plus Enter to pick and place',async({page})=>{
  await page.goto(loopRoute);
  const first=page.locator('.game-domino-tray [data-game-draggable]').first();
  const id=await first.getAttribute('data-game-draggable');
  await first.dragTo(page.locator('[data-loop-slot="3"]'));
  await expect(page.locator('[data-loop-slot="3"] [data-game-draggable="'+id+'"]')).toBeVisible();
  await expect(page.locator('[data-loop-slot="0"] button[data-action="game-slot"]')).toHaveCount(0);
  await page.locator('.game-domino-tray [data-game-draggable]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.game-loop-hub')).toContainText('Holding');
  await page.locator('[data-loop-slot="1"] button[data-action="game-slot"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-loop-slot="1"] [data-game-draggable]')).toBeVisible();
});
test('Concentration auto-hides mismatched cards after five seconds and switches turns',async({page})=>{
  await page.clock.install();
  await page.goto(memoryRoute);
  await expect(page.locator('.game-play-title')).toHaveText('Concentration');
  await expect(page.locator('.game-memory-tile')).toHaveCount(16);
  await page.locator('[data-action="game-players"][data-players="2"]').click();
  const cards=createConcentrationGame(gradient,{seed:2026,players:2}).tiles;
  const one=cards[0],wrong=cards.find(t=>t.pairId!==one.pairId);
  await page.locator('[data-card="'+one.id+'"]').click();
  await page.locator('[data-card="'+wrong.id+'"]').click();
  await expect(page.locator('.game-memory-tile.is-open:not(.is-matched)')).toHaveCount(2);
  await expect(page.locator('.game-memory-countdown')).toContainText('5 seconds');
  await expect(page.locator('[data-action="game-continue"]')).toHaveCount(0);
  await page.clock.fastForward(4900);
  await expect(page.locator('.game-memory-tile.is-open:not(.is-matched)')).toHaveCount(2);
  await page.clock.fastForward(100);
  await expect(page.locator('.game-memory-tile.is-open:not(.is-matched)')).toHaveCount(0);
  await expect(page.locator('.game-turn')).toContainText('Player 2 to play');
});
test('Concentration history captures only seen questions per player and allows notes while play continues',async({page})=>{
  await page.clock.install();
  await page.goto(memoryRoute);
  await page.locator('[data-action="game-players"][data-players="2"]').click();
  const cards=createConcentrationGame(gradient,{seed:2026,players:2}).tiles;
  const q1=cards.find(t=>t.kind==='question');
  const wrongAnswer=cards.find(t=>t.kind==='answer'&&t.pairId!==q1.pairId);
  await page.locator('[data-card="'+q1.id+'"]').click();
  await expect(page.locator('.game-memory-working')).toHaveAttribute('data-review-question',q1.pairId);
  await expect(page.locator('.game-memory-history__item')).toHaveCount(1);
  await page.locator('[data-card="'+wrongAnswer.id+'"]').click();
  await page.locator('[data-game-note]').fill('rise / run = 12 / 4');
  await expect(page.locator('[data-game-note]')).toHaveValue('rise / run = 12 / 4');
  // Clicking between review tabs must not reset the mismatch countdown.
  await page.clock.fastForward(4000);
  await page.locator('[data-action="game-review-player"][data-player="1"]').click();
  await expect(page.locator('.game-memory-history__item')).toHaveCount(0);
  await page.locator('[data-action="game-review-player"][data-player="0"]').click();
  await expect(page.locator('[data-game-note]')).toHaveValue('rise / run = 12 / 4');
  await page.clock.fastForward(1000);
  await expect(page.locator('.game-turn')).toContainText('Player 2 to play');
  await expect(page.locator('.game-memory-working__question')).toHaveText(q1.text);
  await expect(page.locator('[data-game-note]')).toHaveValue('rise / run = 12 / 4');
  const q2=cards.find(t=>t.kind==='question'&&t.pairId!==q1.pairId);
  await page.locator('[data-card="'+q2.id+'"]').click();
  // Player 1's review stays visible while Player 2 plays.
  await expect(page.locator('[data-game-note]')).toHaveValue('rise / run = 12 / 4');
  await page.locator('[data-action="game-review-player"][data-player="1"]').click();
  await expect(page.locator('.game-memory-working')).toHaveAttribute('data-review-question',q2.pairId);
  await expect(page.locator('[data-game-note]')).toHaveValue('');
  await page.locator('[data-game-note]').fill('Player 2 working');
  await page.locator('[data-action="game-review-player"][data-player="0"]').click();
  await expect(page.locator('[data-game-note]')).toHaveValue('rise / run = 12 / 4');
  await page.locator('[data-action="game-review-player"][data-player="1"]').click();
  await expect(page.locator('[data-game-note]')).toHaveValue('Player 2 working');
});
test('Concentration restart cancels flip-back timer, clears review notes, and correctly scores matches',async({page})=>{
  await page.clock.install();
  await page.goto(memoryRoute);
  const deck=createConcentrationGame(gradient,{seed:2026}).tiles;
  const first=deck[0],wrong=deck.find(t=>t.pairId!==first.pairId);
  await page.locator('[data-card="'+first.id+'"]').click();
  await page.locator('[data-card="'+wrong.id+'"]').click();
  await page.locator('[data-action="game-restart"]').click();
  await page.clock.fastForward(5100);
  await expect(page.locator('.game-memory-head')).toContainText('0 of 8 pairs');
  await expect(page.locator('.game-memory-history__item')).toHaveCount(0);
  const q=deck.find(t=>t.kind==='question');
  const a=deck.find(t=>t.pairId===q.pairId&&t.kind==='answer');
  await page.locator('[data-card="'+q.id+'"]').click();
  await page.locator('[data-card="'+a.id+'"]').click();
  await expect(page.locator('.game-memory-head')).toContainText('1 of 8 pairs');
  await expect(page.locator('[data-card="'+q.id+'"]')).toBeDisabled();
});
test('Hex Crossing accepts mathematical notation and equivalent numerical fractions',async({page})=>{
  await page.goto(hexRoute);
  await expect(page.locator('.game-play-title')).toHaveText('Hex Crossing');
  await expect(page.locator('.game-hex-cell')).toHaveCount(25);
  const board=createHexGame(gradient,{seed:2026,size:5});
  const pair=gradient.find(p=>p.id===board.cells[0].pairId);
  await page.locator('[data-cell="0"]').click();
  await expect(page.locator('[data-math-input][data-active="true"]')).toBeVisible();
  const val=pair.answer.values[0];
  const latex='\\frac{'+(val*2)+'}{2}';
  await page.locator('[data-math-source]').evaluate((field,value)=>{
    field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));
  },latex);
  await page.locator('#game-hex-form button[type="submit"]').click();
  const claimClass=await page.locator('[data-cell="0"]').getAttribute('class');
  if(!claimClass.includes('game-hex-cell--forest'))
    console.log('Maths input diagnostic:',JSON.stringify({
      expected:val,latex,
      fieldValue:await page.locator('[data-math-source]').inputValue().catch(()=>null),
      feedback:await page.locator('.game-feedback').textContent(),
      verdict:await page.locator('.game-hex-result').textContent().catch(()=>null)
    }));
  await expect(page.locator('[data-cell="0"]')).toHaveClass(/game-hex-cell--forest/);
  await page.locator('[data-action="game-continue"]').click();
  await expect(page.locator('.game-slim-status')).toContainText('Player 2');
  await page.locator('[data-cell="1"]').click();
  await page.locator('[data-math-toggle]').click();
  const toggled=await page.evaluate(()=>({
    active:document.querySelector('[data-math-input]')?.dataset.active,
    html:document.querySelector('#game-hex-answer')?.outerHTML||null,
    context:document.querySelector('.game-hex-form__editor')?.innerHTML.slice(0,250)||null
  }));
  if(toggled.active!=='false'||!toggled.html||toggled.html.includes(' hidden'))
    console.log('Maths mode toggle diagnostic:',JSON.stringify(toggled));
  await expect(page.locator('#game-hex-answer:not([hidden])')).toBeVisible();
  await page.locator('#game-hex-answer').fill('90000');
  await page.locator('#game-hex-form button[type="submit"]').click();
  await expect(page.locator('[data-cell="1"]')).toHaveClass(/game-hex-cell--available/);
});
test('All three games keep board and major controls in the mobile viewport',async({page})=>{
  await page.setViewportSize({width:375,height:800});
  for(const route of [loopRoute,memoryRoute,hexRoute]){
    await page.goto(route);
    await expect(page.locator('.game-workspace')).toBeVisible();
    const bounds=await page.evaluate(()=>{
      const area=document.querySelector('.game-workspace').getBoundingClientRect();
      const board=document.querySelector('.game-loop-board, .game-memory-board, .game-hex-layout').getBoundingClientRect();
      const toolbar=document.querySelector('.game-toolbar').getBoundingClientRect();
      return {width:innerWidth,scroll:document.documentElement.scrollWidth,
        top:area.top,bottom:area.bottom,boardBottom:board.bottom,
        toolbarTop:toolbar.top,height:innerHeight};
    });
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.width+2);
    expect(bounds.top).toBeGreaterThanOrEqual(-2);
    expect(bounds.bottom).toBeLessThanOrEqual(bounds.height+2);
    expect(bounds.boardBottom).toBeLessThanOrEqual(bounds.height+2);
    expect(bounds.toolbarTop).toBeGreaterThanOrEqual(-2);
  }
  await page.locator('[data-action="game-focus-toggle"]').click();
  await expect(page.locator('body')).not.toHaveClass(/game-focus-mode/);
  await page.locator('[data-action="game-focus-toggle"]').click();
  await expect(page.locator('body')).toHaveClass(/game-focus-mode/);
});
test('All game interfaces remain reusable for Sampling and Quadratics',async({page})=>{
  for(const topic of ['sampling','quadratics']){
    for(const game of ['loop-cards','concentration','hex-crossing']){
      await page.goto('/#/'+topic+'/games/'+game);
      await expect(page.locator('.game-workspace[data-standard-game="'+game+'"]')).toBeVisible();
      await expect(page.locator('.game-play-title')).toBeVisible();
    }
  }
});
