# Modelling Mode — Mathematics Notebook reusable specification

**Scope:** Qualification-neutral reusable Modelling mode with 16 worked scenarios each for **Sampling Methods** and **Quadratic Functions**. The top book chapter is Modelling; four right-hand tabs are progressive levels; each level has two internal pages, each with two modelling scenarios. The original paper, tabs and page-turn behaviour are preserved by the existing notebook shell.

## Educational distinction

- **Understand:** why mathematics works, explanations and visual demonstrations.
- **Memorise:** precise vocabulary and retrieval.
- **Fluency:** execute a familiar technique accurately.
- **Reasoning:** write and evaluate mathematical arguments.
- **Problem Solving:** select and combine techniques to solve an unfamiliar problem.
- **Modelling:** **formulate assumptions and variables → calculate from a model → interpret a prediction in context → evaluate its validity, sensitivity or residual.**

A Modelling question is not just a routine quadratic with “state one limitation” appended. Every scenario includes **mathematical evaluation**: a changed input, a residual, a missing-data range, a domain boundary, a weighted-versus-unweighted prediction or a competing forecast. Evaluate should distinguish *evidence*, *assumptions* and *hypothetical scenarios*.

## Level design

| Right-side tab | Mathematical demand | Scaffolding |
| --- | --- | --- |
| Level 1: Guided | Use supplied representations and a clearly stated context | Four structured prompts, with optional nudges and worked stages |
| Level 2: Structured | Formulate from given constraints or weighted groups | Students choose a model before using linked calculations |
| Level 3: Independent | Fit models, handle missing responses and test predictions against independent evidence | Optional help hidden; data validation matters |
| Level 4: Challenge | Optimise under constraints, compare forecasts and test sensitivity/robustness | More conditions and competing assumptions; no prescribed method before the student chooses |

Each scenario has **four stages**, available through a low-clutter progress strip **inside** the current page. The right-hand level tabs continue to link to distinct levels, not individual stage controls. Stage writing survives page navigation *within the current session*. Each level page has exactly **one subsection title and one explanatory sentence** provided by the book shell; there are no repetitive marketing headings or decorative flavour paragraphs.

### Student flow

1. Read an authentic mathematical situation with all essential numerical information.
2. **Formulate:** define variables and assumptions, produce an appropriate model and a realistic domain. Students type what they believe before seeing a model answer.
3. **Calculate:** compute a prediction, optimum, interval, residual or weighted estimate, including relevant units.
4. **Interpret:** explain what the mathematical output would mean for people, quantities or decisions and distinguish an estimate from a confirmed fact.
5. **Evaluate:** vary a parameter, compare against an observed result, test a domain restriction or quantify the consequences of missing data. Consider whether the model remains defensible.
6. **Compare:** optional individual stage nudges and authored examples; the final review presents all four model stages beside the student's four responses.
7. **Self-review:** tick three case-specific checks and choose **Revisit this model**, **Modelled with support** or **Modelled independently**. The two solved categories require four written stages and three selected criteria. Independent status is not allowed after a hint or an example viewed before a written attempt. **No free-text grading takes place.**
8. **Continue:** save a versioned local self-review (not the written answer). Revisit weaker scenarios first or practise the full page.

The checkboxes are self-reports, not mathematical grades. A length requirement on writing only discourages accidental empty submissions; it does **not** prove a response correct. Students can always view an example and choose Revisit without artificially submitting a fake attempt.

## Mathematical quality and provenance

The current 32 scenarios include:

**Quadratics** — arch geometry and clearance, water trajectories, projectile fits, revenue and profit constraints, three-sided garden optimisation, safety-limited greenhouse area, exact threshold intervals, braking-domain validity, measured residuals and sensitivity to changed dimensions, coefficients or costs.

**Sampling** — random-sample extrapolation, three-stratum population weighting, systematic vs unequal-response estimates, response and coverage uncertainty, held-out survey comparisons, respondent-versus-population differences, population-mix sensitivity and competing random versus volunteer forecasts.

Important distinctions enforced in the authored solutions:

- A predicted population total is **not** exact and is not a statistical confidence bound unless a method justifies that claim.
- A worst/best calculation for missing responses is a **sensitivity interval**, not a guaranteed interval for the true population quantity.
- A sample with more answers may still be more biased if it is voluntary or its sampling frame is incomplete.
- A zero residual at fitting points does not prove predictive validity. Independent observations are more informative.
- Any quadratic domain must be physically meaningful; a model for a projectile does not describe its post-impact behaviour, and an unconstrained vertex can cease to be feasible after constraints change.
- Real-valued optimisation can require checking the neighbouring integers for discrete ticket quantities.
- What-if assumptions must never be presented as collected or verified evidence.

When adding a new topic, review every numerical calculation, exact inequality, unit, domain, boundary case and contextual claim. If a topic does not support authentic mathematical modelling, it is better to leave this mode unsupported than fill it with pretend real-world exercises.

## Technical architecture

| File | Responsibility |
| --- | --- |
| `src/modelling-content.js` | 32 authentic four-stage authored cases, progressive level and page schema |
| `src/modelling-engine.js` | Pure schema validation, four-stage attempt and support guards, prioritised replay and safe local hydration |
| `src/modelling-ui.js` | Accessible paced stage view, optional nudges, comparison, review and summaries; all user content escaped |
| `styles/book.css` | Book-compatible modelling section styling appended by the integration script |
| `src/app.js` | Per-topic, level, page and scenario ephemeral writing, navigation and click handling |
| `tests/modelling.test.js` | Strict schema, numerical anchors, rating logic, privacy and data corruption tests |
| `tests/modelling.spec.js` | Browser workflow, keyboard, stage history, persistence and 320–1440 px responsiveness |
| `integration/apply.mjs` | Guarded one-shot integration into an existing repository checkout |

The activity relies on the existing `renderPageContent` registry and `safeStorage` system. Student writing is never persisted in `localStorage` or transmitted. Only a small record containing a chosen rating, whether assistance was used, three check counts, attempt presence and review timestamps is saved under `maths-notebook-pass1a:modelling:<topic>`.

### State policy

Drafts and stage flags live in in-memory state for the browser session. Navigating around the book preserves a draft until refresh, which clears it. Switching to a fresh practice selection while a scenario is unfinished requires explicit confirmation. Local records are checked against current case IDs and schema version so corrupt or foreign-topic data cannot be treated as valid progress. No login, teacher view, automatic scoring or cloud storage is implied.

### Accessibility

- Every draft has an explicit accessible label, every stage control is a real button and every check is a native checkbox.
- Controls are keyboard-operable. Focus is restored after rerenders and the book's existing live-region helper announces progress.
- Feedback does not depend on colour or animations. Existing Motion Off and reduced-motion behaviour remain intact.
- The four-stage strip wraps and the comparison view becomes single-column on mobile at narrow widths.
- Check 320, 390, 768, 1024 and 1440 px in browser tests.

## Integration and validation

The package is **not a GitHub merge**. To apply locally to a cloned repository:

```sh
node modelling-upgrade/integration/apply.mjs /path/to/website-template --dry-run
node modelling-upgrade/integration/apply.mjs /path/to/website-template --write
cd /path/to/website-template
npm ci
npm run check
npm run test:browser
```

The script aborts *before writing* if expected source anchors do not match the current repository. Review the changed files, create a feature branch and PR, and merge only after CI and screenshot QA pass. The local package tests run with:

```sh
cd modelling-upgrade
node --test tests/modelling.test.js
```

## Recommended next step

After completing integration and verification, upgrade **Games** as a distinct set of playful topic activities rather than reusing retrieval, numerical Fluency or non-routine Modelling exercises. Then address reusable authoring tools and a cross-mode content QA process.
