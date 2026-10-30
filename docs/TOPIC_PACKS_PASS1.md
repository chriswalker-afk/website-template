# Pass 1 — Self-contained topic packs

## Purpose

The book shell, navigation, notebook, retrieval engines, task-review engines, maths notation and styles remain shared. Mathematical content for the two prototype topics now lives in `src/topic-packs/<topic-id>/`. Existing URLs, page IDs, memorisation records, notebook scopes, and question family signatures are unchanged.

## Add a topic

1. Copy a topic folder under `src/topic-packs/`; replace its manifest, terms and authored content. Keep the stable IDs unique inside their scope. For a new small topic it is fine to start with only Understand and hide other modes.
2. Edit `manifest.js`: set a lowercase hyphenated `id`, title, subject, paper (`ruled`, `squared`, or `plain`), and boolean `modes`. Set unused modes to `false` or omit them from `chapters` in your pack index. An enabled mode must contain authored pages.
3. Export one `topic` from the folder's `index.js`. It must contain `id`, `title`, `chapters` and any relevant optional `cards` and `clozes` for Memorise. Consult the existing packs and `docs/MODE_SUBSECTION_PAGE_SYSTEM.md` for page schemas. No cards are necessary unless Memorise is enabled.
4. Register the new topic and its independent `questionBank` (if needed) in `src/topic-packs/registry.js`. Keep executable question generators out of the plain-data topic record so test tooling and authoring workflows can clone it. Leave `src/app.js`, `src/logic.js`, the HTML selector and shared engines untouched.
5. Run `npm run check`, `npm run test:latex` and `npm run test:browser`; review the page content and maths typography at mobile and desktop widths.

## What this pass makes reusable

- A single installation registry controls the available topics, defaults and the preview selector.
- A topic manifest controls its title, subject, default paper, mode visibility and worksheet skill labels.
- Understand, vocabulary/clozes, Fluency level/page declarations, Reasoning, Problem Solving, Modelling, and game declarations are authored in topic-specific modules.
- Shared content builders provide the original validated shapes; compatibility exports maintain existing module APIs.
- Validation checks authored content for each enabled topic rather than comparing it with two fixed demonstration banks. Optional modes no longer force unrelated flashcards into a new topic.

## Pass 1 boundaries, now updated by Pass 2

**Pass 2 — shared questions and skills (implemented):** all authored Fluency, worksheet and level-scaffold families now live inside each topic pack. The shared engines resolve families through the versioned per-topic question bank. New topics can opt into generated questions by registering reviewed families and worksheet skill labels; never invent fallback mathematical answers. See [Pass 2 guide](QUESTION_BANK_PASS2.md).

**Pass 3 — reusable visuals:** the underlying quadratic graph/sampling lab algorithms still live in shared Understand modules and `src/app.js`. Their configuration and any new visual models become topic-owned in Pass 3. For now, a brand new topic can use generic lesson and concept-check blocks without adding bespoke visuals.

**Pass 4 — Topic Creator and checks:** add a CLI for copying a starter pack, richer content-specific diagnostics, publishing help and automatic site/preview selection.

**Pass 5 — prove reuse:** produce a fresh topic from the authoring workflow without editing the application shell.

## Backwards compatibility

The original `src/topics.js`, `src/mode-content.js` and mode content exports remain import-compatible facades. Existing `sampling` and `quadratics` routes, subsection/page identifiers, progress storage and notes remain stable. Do not rename those identifiers while converting content.
