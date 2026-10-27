# Pass 0 — Learning architecture and reusable activity contract

## Goal
Build an adaptable website **engine**, not a blank visual clone or an A Level-only application. A topic should be configurable and independently deployable. The navigation must not expose empty modes.

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

### Games is a separate section
Games are not the same as Memorise's short language games. Games focus on multi-round goals, exploration, speed or collaboration. They may reuse retrieval questions but have their own progression and feel. Suggested types: Sprint (customisable duration, untimed alternative), Puzzle Quest (multi-stage unlock), Mystery / Escape, Art Reveal, Challenge Ladder and mixed-topic tournament. Different topics may register specialised modules (e.g. graph shading, visual number-line art). Multiplayer is optional and should not be required for ordinary lessons.

## Adaptive navigation rules
- `Home`, `Understand`, `Memorise`, `Fluency`, `Reasoning`, `Problem Solving`, `Modelling`, `Games`, and `Exam Practice` are stable IDs.
- Topics **opt in** to relevant modules; automatically hide sections with no meaningful content.
- Within Memorise, flashcards and games have independently configurable entries.
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

Content must be separate from runtime code. Future schemas should define `concepts`, `questions`, `workedSolutions`, `activityConfigurations`, `games` and `diagrams`. Use stable IDs and strict per-activity validation. The same concept can appear in several modes without copying its definition. Do not assume all answers are simple strings: support structured mathematical answer types and authored equivalence rules.

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
- No production dependencies on the previous repositories.
- Strict content validation: missing/duplicate IDs, missing answers or worked solutions, bad links, unsatisfiable game configurations, unsupported maths-answer types.
- Unit tests for learning logic; integration tests for mode routing, persistence and game selection; browser tests for responsive layouts, keyboard-only, reduced motion, and colour contrast.
- No game or assessment should mark prose self-review as an independently correct answer.
- Avoid all-device sharing of progress until a deliberate privacy and storage design is agreed.
- Modular route ownership; only initialise/render the selected activity to reduce loading overhead.

## First implementation passes: acceptance criteria

**Pass 1 — Shell:** works on GitHub Pages from a subdirectory, loads a dummy topic with configurable modes, hides absent modes, provides coherent mobile/desktop navigation, accessible keyboard focus, local progress, and smoke tests.

**Pass 2 — Memorise:** enjoyable flip animation and reduced-motion fallback; all cards view; self-rating and weak-card review; at least Match Up, Missing Words and typed Speed Recall; synonyms, hints and feedback; state restored safely; tests for valid/invalid banks and mastery credit.

**Pass 3 — Learning:** one fully functioning activity pattern per mode, support for maths notation and worked solutions, content-driven progression. Do not invent mathematical answers to fill gaps.

**Pass 4 — Games:** separate Games landing page, Sprint + one multi-stage game, plugin interface for mathematical interactives, no forced timers, shared progress IDs, tests.

**Pass 5 — Authoring:** documented new-topic workflow, robust validators, exam practice as optional, starter theme and deployment checks.

**Pass 6 — Trial:** populate two distinct test topics (one vocabulary-heavy and one algebra/graphs-heavy) to establish true reuse before scaling.

## Major decisions deliberately postponed
Exact visual theme, JS framework, backend/multiplayer architecture, game artwork, student profile system and question engine syntax. Choose after the shell prototype and test cases, not by coupling the template to any one existing website.
