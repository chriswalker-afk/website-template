# Pass 5 — Gradient (Edexcel IGCSE Mathematics A, 4MA1 Foundation)

## Scope

This is the first genuinely new teaching website built from the template's **Topic Creator architecture**. It covers **gradient only**. No other coordinate-geometry topic is required.

The Foundation core is finding a straight-line gradient from a graph, including a slope triangle, positive/negative/zero gradients, and reading the coefficient of x in y = mx + c. Tables and familiar rates of change help explain the same concept. The fourth Fluency level and one Understand lesson include a clearly labelled **stretch beyond the Foundation core**: calculating gradient from two coordinate pairs. Students can complete the other three Fluency levels without that extension.

Mathematical inputs remain numeric where the common checker reliably supports them. Students self-review reasoning, multi-step problems and modelling using explicit worked solutions and criteria; the site does not pretend to automatically check long written arguments.

## Complete learning experience

- **Understand:** four distinct subsections, 15 pages, concept checks, method steppers and four backward-faded Show me / Help me / My turn workshops.
- **Memorise:** 15 reviewed gradient vocabulary flashcards and 15 matching retrieval/cloze prompts, in five retrieval activities.
- **Fluency:** four difficulty levels, eight distinct pages, 16 deterministic question generators, guided and structured method prompts, signed/fractional gradients and full numerical working.
- **Reasoning:** four subsections (Explain, Justify, Critique, Generalise), four unique tasks per subsection, specific hints, full mathematical arguments and self-review criteria.
- **Problem Solving:** four levels with two pages and two multistep problems per page (16 problems), including complete worked answers and review.
- **Modelling:** eight complete Formulate → Calculate → Interpret → Evaluate investigations, with measured rises, rates and assumptions.
- **Worksheet Generator:** four independent printable question groups plus exact exports from generated Fluency rounds, with editable LaTeX and separate worked solutions.
- **Visuals:** four data-defined straight-line diagrams and three interactive explorers (gradient sign, steepness and parallel gradients).

Games and Exam Practice remain **disabled** because the template currently has only game previews and no reviewed topic-specific Exam Practice engine. The learning modes that are enabled are fully authored, rather than filler pages.

## Template reuse proof

The new topic was added in src/topic-packs/gradient/ and registered through the standard src/topic-packs/registry.js topic, question-bank and visual-pack entries. No edits were needed to src/app.js, src/logic.js, shared question checking, mathematical SVG rendering, styles or progress storage.

The only changes outside the topic pack are regression tests, documentation and updated assertions about the number of published topics. The original Sampling and Quadratics topics remain unchanged.

## Test and publish

Run from the repository root:

    npm run audit:topic -- --topic gradient --strict
    npm run check
    npm run test:latex
    npm run test:browser
    npm run build:site -- --topic gradient --out dist/gradient-site

For an isolated draft preview instead:

    npm run preview:topic -- --topic gradient

Once merged, Gradient appears in the existing hub:

    https://chriswalker-afk.github.io/website-template/#/gradient/home

To create a separate public URL, use GitHub Actions → **Export standalone topic website**, enter gradient, then put the exported static site at the publishing root of a dedicated GitHub Pages repository. The export workflow never overwrites the existing hub.

The regression suite checks readiness, every question generator, repeated seeds, all eight Fluency pages, all printable skills, mathematical validation, student navigation and a production standalone build.

## Evaluation and next actions

This pass demonstrates that a whole mathematical topic can be created without changing the common engine. Next actions are a **teacher review** on the live site (including mobile/interactive maths notation), a quick check against the intended cohort's prior skills, and a decision about whether to publish an independent URL. If this workflow is genuinely quick enough, no further architectural pass is needed; any follow-up can target the specific points of friction discovered during authoring.
