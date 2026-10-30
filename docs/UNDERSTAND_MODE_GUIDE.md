# Understand — reusable quality standard and component contract

**Status:** Interactive, working prototype in both sample books. This is an authored teaching component system rather than a complete topic curriculum.

## Educational principle
**Understand** develops conceptual meaning, causes, procedures and the ability to explain results. It is not a second Fluency, Memorise or Modelling mode. Mathematical questions can appear here to diagnose understanding or support a worked model, but bulk practice belongs in its own mode.

The notebook keeps the established hierarchy:
- Top tab: Understand
- Right tabs: **The big idea / How it works / Visual explanations / Worked examples**
- Previous/Next: pages **within** each selected subsection

Every subsection page has **one h1 and one concise explanation** (provided by the subsection). Activity labels such as "Check your understanding", "Show me", "Help me" and "My turn" are functional labels, not redundant page headings. Avoid decorative filler or double titles.

## Four distinct subsection purposes

| Subsection | Required learning activity | Demonstrations |
| --- | --- | --- |
| **The big idea** | Concise accurate explanation, an appropriate diagram/contrast, and a misconception or concept check with specific feedback | Sampling: population vs sample and selection bias. Quadratics: shape, turning point and sign of a |
| **How it works** | A method shown one step at a time. Each step should be meaningful and mathematically justified. Optional checking question | Systematic/stratified selection; expanded/factorised/completed-square forms and completing the square |
| **Visual explanations** | Dynamic, mathematically correct representation that asks students to change one relevant feature, observe and interpret | Sampling selection experiment and group proportions; separate quadratic shape and translation explorers |
| **Worked examples** | Three-stage gradual release: **Show me** (step reveal) → **Help me** (guided discriminating question) → **My turn** (student response, hint, full comparison model and self-reflection) | Sampling method and bias evaluation; quadratic turning point and factorising |

The first and last subsections deliberately use a low-text UI: mathematical content and response controls carry the learning.

## Component/data contract

Topic content lives in **src/topic-packs/<topic-id>/understand.js**, and visual definitions in **src/topic-packs/<topic-id>/visuals.js**. Shared mathematical renderers and engines live in **src/visuals/**. The former Understand modules remain compatibility facades. See [Pass 3 visual guide](VISUAL_PACK_PASS3.md).

Reusable page/block types:
- visual: generic configured mathematical graph or sampling explorer (preferred for new topics)
- \`lesson\`: supported blocks \`text\`, \`note\`, \`comparison\`, \`diagram\`, \`concept-check\`, \`stepper\`
- \`graph\`: legacy graph page type, now using the topic-defined graph configuration and shared renderer
- \`sampling-lab\`: legacy sampling page type, now using topic-defined group sizes, sample size and supported methods
- \`workshop\`: a complete model, one guided question and an independent written attempt

A concept check provides a unique ID, precise prompt, at least two distinct choices, one correct response and **individual feedback for every choice**. The student can change an answer. A stepper has an ID, problem/context statement and an authored sequence of meaningful steps. Never hide an incomplete explanation behind randomised generic text.

A workshop holds:
\`\`\`js
{
  id: 'turning-point',
  type: 'workshop',
  model: {prompt: '...', steps: ['...', '...', '...']},
  guided: {
    prompt: '...',
    choices: [
      ['a', '...', 'Specific incorrect reasoning'],
      ['b', '...', 'Why this is correct', true],
      ['c', '...', 'Another targeted explanation']
    ]
  },
  independent: {
    prompt: 'Different but related problem',
    hint: 'A targeted next step',
    steps: ['Mathematical step 1', 'Step 2', 'Final interpretation']
  }
}
\`\`\`
Written responses are **not auto-graded**. Revealing a model solution allows comparison, followed by an explicit student self-assessment. The confidence/review flag is **session state only**; do not claim it persists or implies a verified correct answer.

## Mathematical integrity

**Sampling visualisation**
- Illustrative population contains 40 ordered entries, Group A = 16 (40%), Group B = 24 (60%).
- Simple random: uniform shuffle without replacement, 10 entries. Do not imply each drawn group is perfectly representative.
- Systematic: random start among positions 1–4 then every fourth entry, making 10.
- Stratified: independent random selection of 4 from A and 6 from B; preserves 40%/60% exactly in this example.
- Convenience: first ten entries, which are all A because the list is deliberately grouped; this **illustrates** a possible selection bias, not a claim that every convenience sample is biased to the same extent.
- Census: all 40 entries, explicitly distinguished from a sample. Only redraw selections that can actually change.
- All methods show the group counts and selection proportions. **One sample does not prove that a method is always representative.**
- A deterministic seed per redraw makes the implementation reproducible; this is an educational demonstration, not a research-grade random-number source.

**Quadratic visualisation**
- Formula: \`y = a(x − h)² + k\`; a is never zero. SVG curve is sampled from that exact equation.
- The axis of symmetry is \`x = h\`, vertex \`(h,k)\`, upward/minimum for a > 0 and downward/maximum for a < 0.
- Shape page edits **|a| and sign only**; position page edits **h and k only**. Each page has its own state, reset, turning-point explanation and a labelled reference \`y = x²\`.
- The mathematical reference line and generated curve use the same coordinate system. Tick labels and axes remain visible; no misleading scale tricks or unlabelled points.
- The introductory static quadratic sketch is generated from the stated equation, not a decorative hand-drawn curve.

## Accessibility and interaction behaviour
- Every meaningful control is a real button, range input, select or labelled textarea; no pointer-only or canvas-only activities.
- Changing an answer, revealing a step or redrawing a sample updates a screen-reader status and preserves logical keyboard focus.
- A concept check's correctness is reported in **text**, not only by colour.
- The sampling graphic has descriptive text alternatives and an accompanying counts/proportions table.
- The graph SVG has a descriptive accessible name; its equation and feature readout remain text outside the SVG.
- Motion follows system reduced-motion preferences plus the manual motion-off setting.
- Screens at 320, 390, 768, 1024 and 1440 px must retain all content with no page-wide horizontal scroll.
- Do not couple the independent activity stepper to the **book's** Previous/Next page controls.
- Do not persist students' written attempts or self-rating without an explicit, designed and reviewed progress feature.

## Verification and non-goals
- Node unit tests validate the authoring schema, single-correct-answer diagnostics, 300 seeded selections for each sampling method and many combinations of quadratic coefficients, signs and vertices.
- Browser tests verify wrong/right feedback, step reveal/reset, deterministic sampling counts, chart controls, complete workshop flow, keyboard use, motion and narrow screens.
- Static deployment remains compatible with GitHub Pages, and the Worksheet Generator/other modes are unchanged.
- These are **two rich exemplar topics**, not full audited course content. A later authoring pass should add broad coverage, teacher editing, localisation and optional progress persistence.
