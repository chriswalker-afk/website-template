# Pass 2 — One question/skill library per topic

## Scope

Both demonstration topics now own **all authored Fluency question generators, worksheet-only generators, worksheet skill labels and Guided/Structured family-specific cues** inside `src/topic-packs/<topic-id>/`. The shared Fluency and Worksheet Generator engines contain no Sampling or Quadratics mathematical question definitions. The same generator powers interactive Fluency questions and exact corresponding printable LaTeX worksheets.

### Files in each topic pack

- `fluency.js` — existing four-level pages, referring to family IDs in `fluency-families.js`.
- `fluency-families.js` — deterministic generators producing prompt, answer contract, steps, hint, marks and misconception feedback.
- `fluency-scaffolds.js` — optional Guided opening cue and Structured three-step method checklist for each family.
- `worksheet-families.js` — reviewed question families requiring printable LaTeX questions, hints, answers and worked solutions.
- `question-bank.js` — the pack's **single versioned registration** of Fluency and worksheet families, and scaffolds.
- `manifest.js` — the worksheet skill IDs and their displayed labels. Each worksheet-only family refers to one of these skill IDs; `fluency` is a reserved option that automatically exposes generated Fluency questions as editable worksheets.

## How a new topic author proceeds

1. Author each mathematical technique once in `fluency-families.js`. Use `../builders/fluency-question.js` to construct a stable signature, checked numeric/ordered/unordered answer, complete worked solution, hint and misconception feedback. Never use arbitrary JavaScript expressions or external code execution for student checking.
2. Reference the family ID from the appropriate levels and pages in `fluency.js`. Guided and Structured cues live in the new topic's own `fluency-scaffolds.js`, not the shared UI or levels engine.
3. Add extra worksheet-only families in `worksheet-families.js` if needed and declare their `skill` groups/labels in `manifest.js`. The `create(rng,difficulty,topic)` contract allows a family to refer to its own pack's reviewed cards.
4. Expose the pack's combined `questionBank` in its `index.js`. There is **no need to edit** `src/fluency-engine.js`, `src/worksheet-generator.js`, `src/logic.js`, `src/fluency-levels.js`, or the shared UI for a new topic.
5. Run `npm run check` and `npm run test:latex` and verify the visual output. The shared `validateQuestionBank` and `validateFluencyChapters` report missing family IDs, invalid registrations, undeclared worksheet skills and cues pointing at missing generators.

## Compatibility and current limits

- Existing Sampling and Quadratics family IDs, signatures, random-number consumption, printed LaTeX, question wording and progress keys are preserved.
- Interactive Fluency currently validates **numerical, ordered numerical and unordered numerical** answers only; symbolic-equivalence checking is not claimed. Writing and extended mathematical reasoning use student self-review, not automatic grading.
- A topic can include Understand and Memorise with **no generated questions**. A topic with enabled Fluency must supply valid generators. The Worksheet Generator appears only if a reviewed worksheet family or supported Fluency generator matches a declared skill group.
- These worksheet and Fluency question families are now co-located; broader cross-mode reuse for Games/Exam Practice is available through the same versioned question bank in future passes.

Next: **Pass 3 — reusable mathematical visuals**; **Pass 4 — New Topic Creator and richer publishing/content QA**; **Pass 5 — demonstrate a new topic built without shared-engine edits**.
