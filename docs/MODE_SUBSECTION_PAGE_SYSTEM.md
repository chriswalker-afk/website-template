# Modes, subsections and pages

**Implemented in the Pass 1B navigation prototype.** This is the information architecture for future Maths topic sites, not a complete bank of course activities.

## Three levels of the book

1. **Top chapter tabs = learning modes.** Understand, Memorise, Fluency, Reasoning, Problem Solving, Modelling, Games, and optional Exam Practice. Use the full label **Problem Solving**; do not use "Problems" or assessment objective codes.
2. **Right-hand index tabs = distinct subsections.** Each tab has a stable ID, one meaningful title, one helpful explanation, and at least one page or one self-contained interactive activity. Tabs are *not* paginated steps.
3. **Bottom Previous/Next page controls = pages within the selected subsection.** Show these controls **only if that subsection has more than one authored page**. Turning a page does not change the selected chapter or right-hand tab. A page deep link and browser Back/Forward must work.

On mobile/tablet, the chapter/subsection selectors replace physical top/right tabs. Page navigation remains at the bottom, after the actual content. "Subsection" is a selector; "Page X of Y" denotes internal page progress. Avoid horizontal tab-scroll navigation.

### Stable URLs

First page, including a single-page activity: \`#/quadratics/understand/visual-explanations\`

Later page in the same subsection: \`#/quadratics/understand/visual-explanations/position\`

Legacy links to the old Graph explorer, Game library and initial activity pages redirect to their closest meaningful subsection. Old bookmarks are normalised on load.

### Appearance, headings and motion

- Exactly **one h1 and one useful explanation per subsection page**, matching the subsection's right-hand tab label.
- Learning material below that may contain paragraphs, diagrams, example steps, questions, hints, solutions and tables — but no duplicate second promotional headline.
- A chapter switch can use the larger book-turn animation. Selecting another subsection uses the lighter index transition. Turning the actual page is a brief, interruptible page turn.
- Flashcards and game questions advance **inside their activity**, not through the book's page-turn system. A one-page interactive subsection therefore does **not** show a Previous/Next page footer.
- Respect reduced-motion and off settings. Keep focus, browser history, and bookmarks usable with motion disabled.

## Default mode contracts

| Mode | Suggested right-hand subsections | Content boundary |
| --- | --- | --- |
| **Understand** | The big idea; How it works; Visual explanations; Worked examples | Teach a concept and show its meaning, methods and illustrations. A graph explorer belongs here, **not** in Fluency or Modelling. |
| **Memorise** | Flashcards; Match Up; Missing Words; Speed Recall; Review All | Definitions, precise mathematical language and recall. Each activity manages its own cards/rounds. |
| **Fluency** | Level 1: Foundations; Level 2: Standard; Level 3: Mixed; Level 4: Advanced | Familiar methods, numerical/algebraic accuracy and efficiency. Questions increase in complexity, without becoming concept explanations. |
| **Reasoning** | Explain; Justify; Critique; Generalise | Mathematical explanations, arguments, error analysis and generalisations. Proof can be a topic-specific subsection. |
| **Problem Solving** | Level 1: Guided; Level 2: Developing; Level 3: Independent; Level 4: Challenge | Genuine unfamiliar, multi-step or strategic problems. Increase independence and connections rather than simply increasing arithmetic. |
| **Modelling** | Level 1: Guided; Level 2: Structured; Level 3: Independent; Level 4: Extended | Real-world tasks requiring assumptions, formulation, solution, interpretation and model evaluation. The tasks must *be modelling problems*, not interactive concept explorers. |
| **Games** | Sprint; Puzzle Quest; topic-specific options such as Curve Quest or Sort & Discover | Each game has its **own right-hand tab**, plus internal rounds and difficulty. Do not make a separate "Game library" subsection that merely links to actual games. |
| **Exam Practice (optional)** | Topic-specific paper/task subsections | Questions and reviewed mark schemes, not the general mode names or qualification-specific learning taxonomy. |

These are **defaults, not obligatory content**. Empty modes and subsections stay hidden. A subsection may have 1, 2 or many pages if the topic benefits; avoid unnecessary pagination.

**Fluency quality upgrade:** The four levels now use a deterministic, topic-specific question generator with strictly checked numerical, ordered-allocation and unordered-root answers; one problem at a time, hints, fully worked solutions, retry of assisted attempts and locally saved aggregate round counts. The same generated bank produces printable LaTeX worksheets, including exact export of a completed on-screen set. See [Fluency mode quality guide](FLUENCY_MODE_GUIDE.md). Existing Problem Solving and Modelling remain distinct from procedural Fluency.

**Memorise quality upgrade:** Flashcards, Match Up, Missing Words, Speed Recall and Review All now use a shared locally persisted per-card revision model. Flashcards can focus on new/due/flagged items, Match Up covers the full deck over multiple rounds, contextual Missing Words and typed Speed Recall share reviewed terminology data, and Review All supports searching, filtering, flags and a guarded reset. See [Memorise mode quality guide](MEMORISE_MODE_GUIDE.md) for scheduling, privacy and correctness limits.

**Understand quality upgrade:** The shared Understand component system now supports explanatory concept checks with choice-specific feedback, step-by-step method reveals, data-driven sampling visualisation, separate quadratic shape/translation graph experiments, and Show me → Help me → My turn worked-example workshops. See [Understand mode quality guide](UNDERSTAND_MODE_GUIDE.md). These blocks belong only to Understand; Fluency, Problem Solving and Modelling still contain levelled questions.

The demo illustrates both a terminology-heavy subject (Sampling Methods) and a graph/algebra-heavy subject (Quadratic Functions). Sampling currently omits Problem Solving and Modelling because suitable topic-authored examples have not been added; Quadratics demonstrates all seven core modes.

## Topic content contract

Data for the demo lives in \`src/mode-content.js\` and is attached to topics by \`src/topics.js\`.

\`\`\`js
{
  understand: [
    {
      id: 'visual-explanations',
      label: 'Visual explanations',
      description: 'Explore how parameters change a quadratic graph.',
      pages: [
        { id: 'shape', type: 'graph', focus: 'Investigate the effect of a.' },
        { id: 'position', type: 'graph', focus: 'Investigate the effects of h and k.' }
      ]
    }
  ],
  fluency: [
    {
      id: 'level-1',
      label: 'Level 1: Foundations',
      description: 'Practise the fundamentals.',
      pages: [
        {id:'values',type:'questions',problems:[
          {id:'q1',prompt:'Calculate ...',solution:'...',hint:'...',marks:2}
        ]}
      ]
    }
  ],
  games: [
    {
      id:'sprint', label:'Sprint', description:'...',
      pages:[{id:'main',type:'game',gameId:'sprint',objective:'...',mechanic:'...'}]
    }
  ]
}
\`\`\`

Each page has a stable ID unique *within its subsection*. The first page uses the 3-segment subsection URL; subsequent pages use their page ID as a fourth path segment. The renderer supports \`lesson\`, \`graph\`, \`questions\`, \`flashcards\`, \`match-up\`, \`missing-words\`, \`speed-recall\`, \`review-all\` and \`game\` page types. The optional resource subsystem separately supports the \`worksheet\` tool.

\`src/logic.js\` validates supported page types for each mode (e.g. it deliberately rejects graphs in Fluency, Problem Solving or Modelling), missing content, duplicate IDs and activity progression assigned to the wrong navigation level.

## Implementation and scope

Current pages are **original demonstration material**, with authored example questions, explanations, solution reveals and a working quadratic graph explorer in Understand. Memorise includes working Flashcards, Match Up, Missing Words, Speed Recall and Review All. The named Games tabs currently show **honestly labelled previews**; complete gaming mechanics remain a planned later pass.

The **Worksheet Generator remains an optional Contents/Resources utility**, not a main learning mode. It continues to create editable LaTeX documents from its validated question families.

Before scaling, each new topic must be audited for mathematical validity, varied tasks, adequate questions at every advertised level, accessibility, proper page lengths and honest descriptions of unimplemented modes.
