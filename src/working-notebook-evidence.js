// Typed/handwritten notebook work counts only as a student-declared ATTEMPT
// in self-review. This module never judges mathematical correctness.
import {MODEL_PHASE_IDS} from './modelling-engine.js';
export function reasoningAttempt(entry,hasNotebook){
  return Boolean(entry?.draft?.trim().length>=20||
    (hasNotebook&&entry?.notebookConfirmed===true));
}
export function effectiveProblemAttempt(entry,hasNotebook){
  return {...entry,
    notebookPlan:Boolean(hasNotebook&&entry?.notebookPlan===true),
    notebookWorking:Boolean(hasNotebook&&entry?.notebookWorking===true)};
}
export function effectiveModellingAttempt(entry,hasNotebook){
  return {...entry,
    notebookStages:Object.fromEntries(MODEL_PHASE_IDS.map(id=>
      [id,Boolean(hasNotebook&&entry?.notebookStages?.[id]===true)]))};
}
