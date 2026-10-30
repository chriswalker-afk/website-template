// Shared browser-test helpers for the single notebook-first working surface.
import {expect} from '@playwright/test';

export async function openNotebook(page){
  const details=page.locator('details[data-working-notebook]').first();
  await expect(details).toBeVisible();
  if(await details.getAttribute('open')===null)
    await details.locator('summary').click();
  await expect(details.locator('.working-book')).toBeVisible();
  return details;
}
export async function writeWorking(page,text){
  const book=await openNotebook(page);
  await book.locator('[data-book-action="add-text"]').click();
  const input=book.locator('textarea[data-book-kind="text"]').last();
  await input.fill(text);
  return input;
}
export async function notebookContains(page,text){
  await openNotebook(page);
  const values=await page.locator('textarea[data-book-kind="text"]').evaluateAll(
    nodes=>nodes.map(el=>el.value));
  expect(values.some(value=>value.includes(text))).toBe(true);
}
export async function notebookEmpty(page){
  await openNotebook(page);
  const values=await page.locator('[data-book-value]').evaluateAll(
    nodes=>nodes.map(el=>el.value));
  expect(values.every(value=>!value.trim())).toBe(true);
}
export async function confirmReasoning(page){
  await page.locator('input[data-reasoning-notebook-evidence]').check();
}
export async function confirmProblem(page){
  await page.locator('input[data-ps-notebook-evidence="plan"]').check();
  await page.locator('input[data-ps-notebook-evidence="working"]').check();
}
export async function confirmStage(page){
  await page.locator('input[data-mdl-notebook-evidence]').check();
}
