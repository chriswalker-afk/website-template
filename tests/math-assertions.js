import {expect} from '@playwright/test';

// MathML replaces the visual text structure of an expression. Compare the
// original accessible formula with surrounding prose to verify not one
// number, sign or word has changed during rendering.
export async function readableMathText(locator){
  return locator.evaluate(element=>{
    const clone=element.cloneNode(true);
    clone.querySelectorAll('math').forEach(math=>{
      math.replaceWith(document.createTextNode(
        math.getAttribute('aria-label')||math.textContent||''
      ));
    });
    return clone.textContent.replace(/\s+/g,' ').trim();
  });
}
const normalise=value=>String(value).replace(/\s+/g,' ').trim();
export async function expectReadingText(locator,expected){
  await expect.poll(()=>readableMathText(locator)).toBe(normalise(expected));
}
export async function expectReadingContains(locator,expected){
  if(expected instanceof RegExp)
    await expect.poll(()=>readableMathText(locator)).toMatch(expected);
  else
    await expect.poll(()=>readableMathText(locator)).toContain(normalise(expected));
}
