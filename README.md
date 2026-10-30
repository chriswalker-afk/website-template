# Maths Website Template

A reusable, topic-configurable foundation for high-quality Maths learning websites across age groups, curricula and qualifications.

**Current status:** Interactive notebook prototype with a reusable typed/drawn working notebook integrated into Fluency, Understand, Reasoning, Problem Solving and Modelling, quality-upgraded **Understand, Memorise, Fluency, Reasoning, Problem Solving and Modelling** modes, three-level navigation and a reusable LaTeX Worksheet Generator. The two sample topics demonstrate the content architecture rather than complete curriculum coverage.

## Try the book prototype

The static application starts at **index.html** and includes two contrasting sample books:
- **Sampling Methods:** Understand includes conceptual checks, step-reveal methods, interactive sampling experiments and gradual-release worked examples. Memorise now includes twelve cards, twelve contextual language prompts, multi-round matching, adaptive recall and local progress. Fluency generates checked calculations, Reasoning offers 16 guided written-argument tasks, Problem Solving has 16 multi-step challenges, and Modelling offers 16 four-stage investigations; Games previews remain.
- **Quadratic Functions:** Understand includes concept diagnostics, completing-square walkthroughs, interactive graph explorations and Show me → Help me → My turn worked examples. Memorise has the same twelve-card adaptive retrieval system; Fluency has generated question practice, Reasoning includes 16 written arguments, and Problem Solving adds 16 unfamiliar multi-step questions with optional graduated support. Modelling adds 16 four-stage investigations with quantitative model evaluation; Games previews remain.

Open **Contents → Worksheet Generator** in either sample topic. Choose skills, difficulty, number of questions, style and solution depth. It creates an on-screen question preview and downloads editable `worksheet.tex` and a matching `worked-solutions.tex` (or `answers.tex`). The optional scaffolded style includes an early worked model and hints. Questions are reproducible from a numerical seed. Compile the source in Overleaf or a local TeX installation; **the website does not compile PDFs directly**.

Fluency now includes an expandable **Working notebook** replacing the former unsaved working textarea; the separate final-answer field is unchanged. Students can combine typeset maths, explanations, stylus/mouse drawing and multiple working pages, undo or redo edits, autosave locally, and export printable HTML or a data backup. Pass 4 adds structured coordinate graphs, data tables, number lines, geometry sketches and probability trees that remain editable after saving and exporting. The notebook does not mark mathematical working. Pass 3 also uses the notebook as the single mathematical working area in Understand, Reasoning, Problem Solving and Modelling, with explicit self-review evidence declarations. See [Working notebook — Pass 2](docs/WORKING_NOTEBOOK_PASS2.md) and [mode integration — Pass 3](docs/WORKING_NOTEBOOK_PASS3.md).

The book uses **top tabs for learning modes**, **right-edge tabs for distinct subsections**, and **Previous/Next page controls within multi-page subsections**. Page turns do not switch the active subsection. On smaller screens, labelled mode/subsection selectors replace the physical tabs. Flashcards and Games use their own internal activity navigation. Motion follows reduced-motion preferences, with a manual off setting.

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
- [Modes, subsections and pages](docs/MODE_SUBSECTION_PAGE_SYSTEM.md) — navigation hierarchy, default tabs, rules separating learning modes and deep links.
- [Understand mode quality guide](docs/UNDERSTAND_MODE_GUIDE.md) — reusable components, mathematics/diagram checks and Show me → Help me → My turn educational sequence.
- [Memorise mode quality guide](docs/MEMORISE_MODE_GUIDE.md) — reusable retrieval activities, saved per-card progress, review intervals, conservative terminology checks and privacy limitations.
- [Working notebook — Pass 2](docs/WORKING_NOTEBOOK_PASS2.md) — reusable typed and drawn working, storage, privacy, exports and limits.
- [Working notebook — Pass 3](docs/WORKING_NOTEBOOK_PASS3.md)
- [Mathematical toolkit — Pass 4](docs/MATH_TOOLKIT_PASS4.md) — editable coordinate graphs, tables, number lines, geometry and probability trees. — stable mode/task scopes, shared four-stage modelling working and student-confirmed self-review evidence.
- [Fluency mode quality guide](docs/FLUENCY_MODE_GUIDE.md) — Guided → Structured → Independent → Challenge, generated calculations, numerical checking, worked solutions and LaTeX export.
- [Reasoning mode quality guide](docs/REASONING_MODE_GUIDE.md) — distinctive written prompts, model arguments, criteria-based self-review, targeted practice and local privacy.
- [Problem Solving mode quality guide](docs/PROBLEM_SOLVING_MODE_GUIDE.md) — genuinely non-routine tasks, independent planning, graduated help, complete mathematical working and review evidence.
- [Modelling mode quality guide](docs/MODELLING_MODE_GUIDE.md) — authentic contexts, staged formulation, mathematical predictions, quantitative evaluation and private self-review.

## Design principles

- **Qualification-neutral:** use learning modes such as Understand, Memorise, Fluency, Reasoning, Problem Solving and Modelling rather than AO1/AO2/AO3.
- **Memorise is a rich learning space:** flipping flashcards, searchable Review All, self-ratings, multi-round Match Up, contextual Missing Words and typed Speed Recall. Shared, locally saved progress prioritises new/due/flagged cards; no backend or student sign-in is needed.
- **Games has its own home:** playful, reusable whole-topic challenges such as Sprint and Quests, plus optional topic-specific games. Games can draw on the same validated question banks without duplicating progress.
- **Printable resources:** the optional, topic-aware Worksheet Generator prototype exports editable LaTeX student worksheets and matching worked solutions from vetted, reproducible example question families.
- **Modular:** no empty or disabled sections for a topic that does not need them; no right-hand tab for each page. Each subsection can contain one or several pages.
- **Mathematically careful:** distinguish recall from exposure, support symbols and graphs, require reviewed answers and worked solutions. Understand uses real mathematical/selection models rather than illustrations that merely resemble mathematical diagrams.
- **Generated Fluency:** four levels matching Problem Solving (Guided → Structured → Independent → Challenge), with progressively faded method scaffolds; question families produce six/ten distinct questions per round, strict numerical checking, optional hints, fully worked methods, review of weak attempts, local aggregate progress and printable LaTeX sets.
- **Written Reasoning:** Explain, Justify, Critique and Generalise have dedicated authored question banks, optional hints, three-step model arguments, specific self-check criteria and no misleading automatic free-text scores.
- **Problem Solving:** Four levels of original two-stage or multi-condition questions. Plan → work → optional strategy/hints → step-by-step solution → specific self-checks; no fake automatic marks.
- **Modelling:** Four-stage Formulate → Calculate → Interpret → Evaluate investigations, with mathematical sensitivity or validation checks, optional guidance and honest student self-review.
- **Accessible:** responsive, keyboard-friendly, reduced-motion support and no compulsory timers.
- **Tactile but functional:** a recognizable notebook/book identity with chapter tabs, side indexes, readable paper surfaces and fast, optional page motion.
- **Independent by default:** work offline where practical, store progress locally, and make multiplayer an optional future extension.

## Roadmap

1. **Pass 0 — Blueprint and reuse audit:** modules, content contract, activity catalogue, testing and rollout plan.
2. **Pass 1A — Notebook visual prototype (implemented):** Contents, chapter and subsection tabs, page variants, transitions, two sample topics, interactive flashcards and graph workspace.
3. **Pass 1B — Reusable production shell (navigation prototype in place; remaining authoring work next):** mode/subsection/page routing, validated example content, deep links, responsive navigation and bookmarks now work. A generalised content-authoring workflow, persistent learning progress and cross-topic publishing pipeline remain future work.
4. **Pass 2 — Memorise experience (quality upgrade implemented):** reusable flashcards, multi-round matching, contextual Missing Words, typed recall, locally saved adaptive review and card review dashboard. Broader curriculum banks and optional future sync remain separate tasks.
5. **Pass 2W — Working notebook (implemented):** mixed mathematical typing, explanation and vector ink, local autosave, multi-page editing and printable export. First demonstrated in Fluency; now reused in Understand, Reasoning, Problem Solving and Modelling (Pass 3).
6. **Pass 3 — Other learning modes:** Understand, Memorise, Fluency, Reasoning, Problem Solving and Modelling prototypes completed. Next expand the Games arcade and establish an efficient, teacher-reviewed content-authoring workflow.
6. **Pass 4 — Games arcade:** reusable challenges with optional special topic modules.
7. **Pass 5 — Assessment, authoring and deployment:** examination practice, validation, tests, GitHub Pages guides; plan a separate **Pass 5A Worksheet Generator** and **Pass 5B worksheet expansion** once the question engine exists.
8. **Pass 6 — Prove the template:** two very different topics; refine the authoring process.

The architecture and implementation notes are maintained alongside the code in the `docs/` directory.

## Existing projects for inspiration

- [Sampling Arcade](https://github.com/chriswalker-afk/Data-Collection) — retrieval activities, questions and progress.
- [A Level Calculus](https://github.com/chriswalker-afk/alevel-calculus) — learning-mode workspace and mathematical interactives.
- [Inequality Ink](https://github.com/chriswalker-afk/inequality-ink) — distinct, topic-specific mathematical game engines.

These are **design references**, not copied dependencies. Source code should be reused only after explicit review and generalisation.
