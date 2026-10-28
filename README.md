# Maths Website Template

A reusable, topic-configurable foundation for high-quality Maths learning websites across age groups, curricula and qualifications.

**Current status:** Pass 1A — working interactive book-shell visual prototype. Production topic authoring, progress systems and complete learning activities are planned for later passes.

## Try the book prototype

The static application starts at **index.html** and includes two contrasting sample books:
- **Sampling Methods:** vocabulary-heavy study pages, flashcards, Match Up, Missing Words, Reasoning and a preview Games shelf.
- **Quadratic Functions:** algebra and graph-focused study pages, the same Memorise interactions, a live quadratic graph explorer, Problem Solving, Modelling and a preview Games shelf.

The book uses top chapter tabs and right-edge subsection tabs on desktop; on smaller screens these become labelled chapter and section selectors. The page-turn and flashcard motion follow reduced-motion preferences, with an additional manual motion control.

Launch locally (Node 22 or newer):

    node scripts/serve.mjs

Open **http://127.0.0.1:4173**. For automatic validation and browser tests:

    npm install
    npm run check
    npx playwright install chromium
    npm run test:browser

The application itself is dependency-free and works as a static GitHub Pages site. The npm dev dependency is only for browser tests. See [Pass 1A guide](docs/PASS_1A_PROTOTYPE.md) for what is and is not implemented. **GitHub Pages must be enabled for this repository before a public preview URL can be promised.**

## Signature experience: Interactive Maths Notebook

A modern, tabbed reference-book aesthetic built into the reusable shell: **chapter tabs across the top**, **subsection index tabs down the side**, a Contents page, paper-like ruled/squared/plain workspaces, flashcard and sticky-note elements, and subtle page-turn transitions. The book metaphor must not compromise access to graphs, mathematical working, navigation or keyboard input. On mobile, chapter/subsection menus replace crowded physical tabs. Motion can be reduced or removed.

- [Pass 0 learning architecture](docs/PASS_0_ARCHITECTURE.md) — learning modes, activities, configuration and implementation stages.
- [Book Design System](docs/BOOK_DESIGN_SYSTEM.md) — visual language, component behaviours, responsive layouts, motion, accessibility and acceptance checklist.
- [Worksheet Generator specification](docs/WORKSHEET_GENERATOR.md) — optional Contents/Resources tool, worksheet settings, reproducible question families, LaTeX output and worked-solution safeguards.

## Design principles

- **Qualification-neutral:** use learning modes such as Understand, Memorise, Fluency, Reasoning, Problem Solving and Modelling rather than AO1/AO2/AO3.
- **Memorise is a rich learning space:** flipping flashcards, browse/review all cards, self-rating and retry, Match Up, Missing Words, Speed Recall and other vocabulary/retrieval games.
- **Games has its own home:** playful, reusable whole-topic challenges such as Sprint and Quests, plus optional topic-specific games. Games can draw on the same validated question banks without duplicating progress.
- **Printable resources:** an optional, topic-aware Worksheet Generator will export editable LaTeX student worksheets and fully worked solutions, using vetted question families.
- **Modular:** no empty or disabled sections for a topic that does not need them.
- **Mathematically careful:** distinguish recall from exposure, support symbols and graphs, require reviewed answers and worked solutions.
- **Accessible:** responsive, keyboard-friendly, reduced-motion support and no compulsory timers.
- **Tactile but functional:** a recognizable notebook/book identity with chapter tabs, side indexes, readable paper surfaces and fast, optional page motion.
- **Independent by default:** work offline where practical, store progress locally, and make multiplayer an optional future extension.

## Roadmap

1. **Pass 0 — Blueprint and reuse audit:** modules, content contract, activity catalogue, testing and rollout plan.
2. **Pass 1A — Notebook visual prototype (implemented):** Contents, chapter and subsection tabs, page variants, transitions, two sample topics, interactive flashcards and graph workspace.
3. **Pass 1B — Reusable production shell (next):** validated topic loading, routing, responsive navigation, bookmarks, local progress and automated checks. Include a reusable question/solution data contract capable of future LaTeX export.
4. **Pass 2 — Memorise experience:** premium flashcards and playable language/retrieval games.
5. **Pass 3 — Other learning modes:** understanding, fluency, reasoning, problem solving and modelling engines.
6. **Pass 4 — Games arcade:** reusable challenges with optional special topic modules.
7. **Pass 5 — Assessment, authoring and deployment:** examination practice, validation, tests, GitHub Pages guides; plan a separate **Pass 5A Worksheet Generator** and **Pass 5B worksheet expansion** once the question engine exists.
8. **Pass 6 — Prove the template:** two very different topics; refine the authoring process.

The planning documents are maintained alongside this README in the Pass 0 architecture pull request.

## Existing projects for inspiration

- [Sampling Arcade](https://github.com/chriswalker-afk/Data-Collection) — retrieval activities, questions and progress.
- [A Level Calculus](https://github.com/chriswalker-afk/alevel-calculus) — learning-mode workspace and mathematical interactives.
- [Inequality Ink](https://github.com/chriswalker-afk/inequality-ink) — distinct, topic-specific mathematical game engines.

These are **design references**, not copied dependencies. Source code should be reused only after explicit review and generalisation.
