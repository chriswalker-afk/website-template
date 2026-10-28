# Pass 0 — Learning architecture and reusable activity contract

## Goal
Build an adaptable website **engine**, not a blank visual clone or an A Level-only application. A topic should be configurable and independently deployable. The navigation must not expose empty modes.

## Visual identity: an Interactive Maths Notebook

**Core design decision:** the reusable website shell should look and feel like a **modern tabbed Maths notebook / reference book**, based on the user-supplied photographs of physical book index tabs.

- A **Contents** opening page acts as the home/journey view, with progress, bookmarks and resume links.
- **Primary sections have chapter tabs across the top** of the book. The active tab visually connects to the open page.
- **Subsections have smaller index tabs down the right side** on desktop, e.g. Flashcards / Match Up / Missing Words / Speed Recall inside Memorise. Those tabs select a distinct subsection, **not an individual page**.
- **Pages within a subsection have their own Previous/Next controls** when needed; the active right tab stays unchanged as pages turn. A self-contained flashcard deck/game has internal progress instead.
- Slight paper shadows, a modest book edge/spine, faint ruled or squared paper, paper flashcards and small sticky-note hints establish the notebook feel.
- **Page-turn and tab animations** may enhance chapter changes, but must be brief, interruptible, reduced-motion aware and never block interaction; **do not** flip a whole page for every practice question.
- Desktop defaults to a **single spacious working page**; mathematical inputs, graphs, wide diagrams and worked solutions take priority over cosmetic book geometry.
- On small screens, use accessible chapter/subsection pickers rather than squeezing/scrolling decorative tabs; preserve the stationery feel without stealing space.
- Chapter and subsection lists are always generated from the configured, non-empty learning modes.

The full design contract, components, motion guidelines, breakpoints and Pass 1 acceptance checklist are in **[BOOK_DESIGN_SYSTEM.md](BOOK_DESIGN_SYSTEM.md)**. This is a fundamental requirement for Pass 1, not an optional theme that gets added after the learning activities.

## Student-facing structure

| Area | Purpose | Shared component types |
| --- | --- | --- |
| Home | Learning journey, progress, resume, suggestions | Topic introduction, progress, activity cards |
| Understand | Explanations, diagrams, misconceptions and structured discovery | Guided examples, interactive visuals, concept checks |
| Memorise | Definitions, properties, formulas and precise mathematical language | **Flipping flashcards; browse/review all; review uncertain cards; Match Up; Missing Words; Speed Recall; Sort vocabulary; retrieval challenge** |
| Fluency | Master methods efficiently and accurately | Graduated practice, answer input, immediate feedback, fully worked solutions |
| Reasoning | Explain why, justify, compare methods and spot errors | Explain-the-step, spot-the-error, analyse-a-claim |
| Problem Solving | Unfamiliar problems, strategies, multiple steps | Hints that fade, strategy choices, independent challenges |
| Modelling | Real contexts, assumptions, interpretation and limitations | Scenario lab, variable/assumption builder, model evaluation |
| Games | Engaging gameplay across the topic | Sprint, quests, puzzles, unlocking/collecting, topic-specific games |
| Exam Practice | Optional qualification-specific assessed practice | Mark schemes, command words, timed/untimed papers |

Do not show AO1/AO2/AO3 in global navigation or shared learning-mode names. Examination assessment objectives, where relevant, are optional **metadata** on a course's questions.

### Memorise is not merely flashcards
- A first-class Memorise dashboard with **Flashcards** and **Language & Recall Games** subsections.
- Flashcards: animated 3D-style flip with reduced-motion fallback, keyboard flip, front/back reversal where suitable, full deck browser, decks by subtopic, session review, self-rating (Again / Nearly / Know), retry weaker cards, reset, and optional mixing.
- Evaluation and formula cards may have multi-part back faces; reverse mode only when semantically sensible.
- Language games: Match Up, Missing Words, Speed Recall, Sort the Terms, Definition Detective (find distinguishing features), and error-in-definition challenges. All are configurable, not compulsory.
- Separate **recognition**, **self-reported familiarity**, and **independent recall**. Do not award retrieval mastery merely for flipping/reviewing a card.
- Synonyms and equivalent answers should be author-approved, not generated ad hoc. Provide clear feedback when a near miss changes meaning.

### Worksheet Generator is an optional resource, not a learning-mode chapter
Allow supported topics to provide an accessible **Contents → Resources → Worksheet Generator** tool which generates reproducible, editable LaTeX student worksheets and matching fully worked solutions. Keep it outside the primary chapter tabs. Share the validated question and worked-solution engine with on-screen practice; do not create an unrelated question bank. See **[WORKSHEET_GENERATOR.md](WORKSHEET_GENERATOR.md)** for controls, source export, mathematical verification and PDF compilation boundaries.

### Games is a separate section
Games are not the same as Memorise's short language games. Games focus on multi-round goals, exploration, speed or collaboration. They may reuse retrieval questions but have their own progression and feel. Suggested types: Sprint (customisable duration, untimed alternative), Puzzle Quest (multi-stage unlock), Mystery / Escape, Art Reveal, Challenge Ladder and mixed-topic tournament. Different topics may register specialised modules (e.g. graph shading, visual number-line art). Multiplayer is optional and should not be required for ordinary lessons.

## Adaptive navigation rules
- `Home`, `Understand`, `Memorise`, `Fluency`, `Reasoning`, `Problem Solving`, `Modelling`, `Games`, and `Exam Practice` are stable IDs.
- Topics **opt in** to relevant modules; automatically hide sections with no meaningful content.
- Desktop exposes the active modules as **top chapter tabs** and the selected module's activities as **right-side index tabs**. The Contents page always provides an accessible alternative.
- On mobile, top/side tabs reflow to **Chapter** and **Section** controls; never require horizontally scrolling main navigation or tiny rotated labels.
- Within Memorise, flashcards and language games have independently configurable entries. Games is a separate mode with **one right-hand tab per named game**.
- Understand defaults to **The big idea, How it works, Visual explanations, Worked examples**. Move concept visualisations such as quadratic graph explorers to Understand; Fluency, Problem Solving and Modelling contain properly designed questions at different levels, not repackaged concept explorers.
- Default levels: Fluency (Foundations/Standard/Mixed/Advanced), Problem Solving (Guided/Developing/Independent/Challenge), Modelling (Guided/Structured/Independent/Extended).
- Refer to [the implemented mode/subsection/page hierarchy](MODE_SUBSECTION_PAGE_SYSTEM.md) for content types, routes and all learning-mode boundaries.
- Students can learn in any order. Recommended pathways do not block navigation.
- Use age-neutral language and theme presets instead of hard-coded grade or exam-board labels.

## Content contract (initial proposal)

```json
{
  "schemaVersion": 1,
  "site": {
    "id": "example-topic",
    "title": "Example Topic",
    "subtitle": "A configurable maths learning space",
    "ageRange": "optional",
    "qualification": null
  },
  "appearance": {
    "theme": "modern-notebook",
    "accent": "teal",
    "defaultPage": "ruled",
    "pageByMode": {
      "memorise": "plain",
      "fluency": "squared",
      "problemSolving": "squared",
      "examPractice": "plain"
    },
    "motion": "system"
  },
  "learningModes": {
    "understand": true,
    "memorise": true,
    "fluency": true,
    "reasoning": true,
    "problemSolving": true,
    "modelling": false,
    "games": true,
    "examPractice": false
  },
  "memorise": {
    "flashcards": { "enabled": true, "decks": ["core-terms"] },
    "languageGames": ["match-up", "missing-words", "speed-recall"]
  },
  "games": ["sprint", "puzzle-quest"],
  "features": { "localProgress": true, "awards": false, "multiplayer": false }
}
```

Content in the prototype already follows `Topic → Mode → Subsection → Page`, with stable page IDs and separate typed content. The earlier JSON above illustrates site-level capabilities only; [the detailed authoring contract](MODE_SUBSECTION_PAGE_SYSTEM.md) specifies chapter sections and pages.

Content must be separate from runtime code. Future schemas should define `concepts`, `questions`, `workedSolutions`, `activityConfigurations`, `games`, `diagrams` and optional **parameterised worksheet question families with LaTeX renderers**. Use stable IDs and strict per-activity validation. The same concept can appear in several modes without copying its definition. Do not assume all answers are simple strings: support structured mathematical answer types and authored equivalence rules.

## Reuse audit (source inspection, 28 Oct 2026)

| Existing project | Evidence examined | Reuse decision |
| --- | --- | --- |
| Sampling Arcade | `src/flashcards.js` | Adapt deck/session separation, self-rating, review, reversibility; remove topic assumptions |
| Sampling Arcade | `src/core.js`, `src/match-up.js` | Extract activity matching and answer normalisation; replace sampling-specific routes and taxonomies |
| Sampling Arcade | `src/progress.js` | Adopt defensive local persistence and independent-recall principle; namespace data by topic and schema |
| Sampling Arcade | `content/`, `scripts/validate-content.mjs` | Use topic-separated, validated question banks; ensure errors cite question IDs |
| A Level Calculus | `src/index.html` | Reuse concept of distinct learning workspaces and topic navigation; **not** hard-coded qualification/AO modes |
| Inequality Ink | `PICTURE_GUIDE.md` | Adopt data-driven bespoke games, explicit authoring constraints and validators rather than generic quizzes |

This is a **targeted architecture audit**; it does not claim comprehensive implementation or browser testing of each existing site.

## Non-functional requirements
- Static GitHub Pages hosting, relative asset paths, no sign-in needed for standard single-player use.
- Book/navigation design tokens and page variants independent of learning logic; faint lines and grids are decorative and must not impair Maths clarity.
- Accessible primary and secondary navigation at 320/390/768/1024/1440 px, without viewport-wide overflow; support keyboard, touch, screen-reader updates, zoom and browser history.
- Motion respects user/system preference and never delays input, consumes focus, or stacks transitions; no page turn between individual practice questions.
- Light theme, high-contrast/print and reduced-motion fallbacks; strong text and control contrast even on ruled/squared paper.
- No production dependencies on the previous repositories.
- Strict content validation: missing/duplicate IDs, missing answers or worked solutions, bad links, unsatisfiable game configurations, unsupported maths-answer types.
- Unit tests for learning logic; integration tests for mode routing, persistence and game selection; browser tests for responsive layouts, keyboard-only, reduced motion, and colour contrast.
- No game or assessment should mark prose self-review as an independently correct answer.
- Avoid all-device sharing of progress until a deliberate privacy and storage design is agreed.
- Modular route ownership; only initialise/render the selected activity to reduce loading overhead.

## First implementation passes: acceptance criteria

**Pass 1A — Notebook prototype:** visual proof of the Contents page, top chapter tabs, right-side subsection tabs, lined/squared/plain paper and two contrasting dummy topic workspaces. Exercise tab and page motion, keyboard accessibility, reduced motion and 320/390/768/1440 px layouts **before** building multiple learning engines. See the [book design acceptance checklist](BOOK_DESIGN_SYSTEM.md#8-acceptance--qa-checklist-for-pass-1).

**Pass 1B — Production shell:** works on GitHub Pages from a subdirectory, loads a topic with configurable modes/theme/page types, hides absent chapters/subsections, supports deep links and browser history, has coherent mobile/desktop navigation, accessible focus and landmarks, local progress/bookmarks, and smoke tests. Define a reusable question/answer/worked-solution instance contract and opt-in worksheet capability for future offline LaTeX exports; no worksheet generator UI is expected yet.

**Pass 2 — Memorise:** enjoyable flip animation and reduced-motion fallback; all cards view; self-rating and weak-card review; at least Match Up, Missing Words and typed Speed Recall; synonyms, hints and feedback; state restored safely; tests for valid/invalid banks and mastery credit.

**Pass 3 — Learning:** one fully functioning activity pattern per mode, support for maths notation and worked solutions, content-driven progression. Do not invent mathematical answers to fill gaps.

**Pass 4 — Games:** separate Games landing page, Sprint + one multi-stage game, plugin interface for mathematical interactives, no forced timers, shared progress IDs, tests.

**Pass 5 — Authoring:** documented new-topic workflow, robust validators, exam practice as optional, starter theme and deployment checks.

**Pass 5A / 5B — Optional Worksheet Generator:** produce tested, seeded LaTeX student worksheets and matching fully worked solutions from shared question families, then extend scaffolding, TikZ/PGFPlots diagrams and worksheet formats. Compile representative TeX in CI; direct one-click PDF output remains a separate capability. See **[worksheet specification](WORKSHEET_GENERATOR.md)**.

**Pass 6 — Trial:** populate two distinct test topics (one vocabulary-heavy and one algebra/graphs-heavy) to establish true reuse before scaling.

## Major decisions deliberately postponed
The **book/notebook identity, primary top tabs, secondary side tabs, Contents page and paper/page-turn language are decided**. Exact palette, typography, shadow treatment, final animation implementation, JS framework, backend/multiplayer architecture, game artwork, student profile system and question engine syntax remain open. Make those choices against the [book design criteria](BOOK_DESIGN_SYSTEM.md) and prototype tests, not by coupling the template to any one existing website.
