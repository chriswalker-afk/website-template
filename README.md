# Maths Website Template

A reusable, topic-configurable foundation for high-quality Maths learning websites across age groups, curricula and qualifications.

**Current status:** Architecture/Pass 0. The template application has not been implemented yet.

## Signature experience: Interactive Maths Notebook

A modern, tabbed reference-book aesthetic built into the reusable shell: **chapter tabs across the top**, **subsection index tabs down the side**, a Contents page, paper-like ruled/squared/plain workspaces, flashcard and sticky-note elements, and subtle page-turn transitions. The book metaphor must not compromise access to graphs, mathematical working, navigation or keyboard input. On mobile, chapter/subsection menus replace crowded physical tabs. Motion can be reduced or removed.

- [Pass 0 learning architecture](docs/PASS_0_ARCHITECTURE.md) — learning modes, activities, configuration and implementation stages.
- [Book Design System](docs/BOOK_DESIGN_SYSTEM.md) — visual language, component behaviours, responsive layouts, motion, accessibility and acceptance checklist.

## Design principles

- **Qualification-neutral:** use learning modes such as Understand, Memorise, Fluency, Reasoning, Problem Solving and Modelling rather than AO1/AO2/AO3.
- **Memorise is a rich learning space:** flipping flashcards, browse/review all cards, self-rating and retry, Match Up, Missing Words, Speed Recall and other vocabulary/retrieval games.
- **Games has its own home:** playful, reusable whole-topic challenges such as Sprint and Quests, plus optional topic-specific games. Games can draw on the same validated question banks without duplicating progress.
- **Modular:** no empty or disabled sections for a topic that does not need them.
- **Mathematically careful:** distinguish recall from exposure, support symbols and graphs, require reviewed answers and worked solutions.
- **Accessible:** responsive, keyboard-friendly, reduced-motion support and no compulsory timers.
- **Tactile but functional:** a recognizable notebook/book identity with chapter tabs, side indexes, readable paper surfaces and fast, optional page motion.
- **Independent by default:** work offline where practical, store progress locally, and make multiplayer an optional future extension.

## Roadmap

1. **Pass 0 — Blueprint and reuse audit:** modules, content contract, activity catalogue, testing and rollout plan.
2. **Pass 1A — Notebook visual prototype:** Contents, chapter and subsection tabs, page variants, transitions and small-screen/keyboard proof.
3. **Pass 1B — Reusable production shell:** validated topic loading, routing, responsive navigation, bookmarks, local progress and automated checks.
4. **Pass 2 — Memorise experience:** premium flashcards and playable language/retrieval games.
5. **Pass 3 — Other learning modes:** understanding, fluency, reasoning, problem solving and modelling engines.
6. **Pass 4 — Games arcade:** reusable challenges with optional special topic modules.
7. **Pass 5 — Assessment, authoring and deployment:** examination practice, validation, tests, GitHub Pages guides.
8. **Pass 6 — Prove the template:** two very different topics; refine the authoring process.

The planning documents are maintained alongside this README in the Pass 0 architecture pull request.

## Existing projects for inspiration

- [Sampling Arcade](https://github.com/chriswalker-afk/Data-Collection) — retrieval activities, questions and progress.
- [A Level Calculus](https://github.com/chriswalker-afk/alevel-calculus) — learning-mode workspace and mathematical interactives.
- [Inequality Ink](https://github.com/chriswalker-afk/inequality-ink) — distinct, topic-specific mathematical game engines.

These are **design references**, not copied dependencies. Source code should be reused only after explicit review and generalisation.
