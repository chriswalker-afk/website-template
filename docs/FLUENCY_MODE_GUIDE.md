# Fluency — reusable generated-practice quality standard

**Status:** Working generative prototype for Sampling Methods and Quadratic Functions, integrated with the existing Maths Notebook and LaTeX Worksheet Generator.

## Educational purpose

Fluency is for accurate and efficient execution of **familiar** mathematical procedures: calculating, manipulating, substituting, factorising, completing the square, and using sampling formulas. It does **not** house conceptual graph demonstrations (Understand), simple definition retrieval (Memorise), unfamiliar strategy problems (Problem Solving) or model formulation/evaluation (Modelling).

The four right-hand subsections are **Level 1: Foundations**, **Level 2: Standard**, **Level 3: Mixed** and **Level 4: Advanced**. They are always levels of *Fluency*, not qualification-specific assessment objectives. Levels can contain meaningful internal pages (e.g. count calculations vs systematic intervals) that use bottom book-page navigation. Advancing one question **does not** turn the book page or change the highlighted right tab.

One title and one subsection explanation are displayed; the generated exercise carries the prompt, skill, marks and response interface without another decorative heading.

## Learning experience

- Each authored level/page lists approved mathematical question families and a focus, but **not** a small fixed list of repeated prompts.
- A reproducible numeric seed generates six or ten **distinct** questions. New questions change the seed; cancelling an unfinished-set replacement preserves both prompt and student working.
- Exactly one question is active at a time to reduce distraction. A lined, optional working space is kept **only for the current browser session**.
- A typed answer is checked by strict numerical logic, not by a remote service, AI judgement or ambiguous string matching.
- Answers can be a **number** (including equivalent fractions), an **ordered list** (e.g. vertex coordinates or allocations), or **unordered roots**. Explicitly requested two-decimal-place answers use a tolerance tied to rounding.
- Wrong numerical values produce a **family-specific mathematical hint** and allow correction. Empty or malformed answers don't count as a mathematical attempt.
- Students may request a hint, reveal the full worked solution, and view the individual steps after checking their answer.
- End-of-round feedback distinguishes **correct first try**, **completed with support**, and **solution revealed**. Viewing a solution is never counted as success.
- After completing a round, students can revisit the full prompt/answer/step-by-step solutions, retry only questions that needed help or regenerate a new set.
- A matching **LaTeX worksheet and fully worked solutions file** can be created from **the exact questions in a completed set**. The Resources → Worksheet Generator also offers a *Generated Fluency practice* skill for additional new printable practice.

### Level progression

| Level | Sampling Methods | Quadratic Functions |
| --- | --- | --- |
| 1 Foundations | Sample percentages and sizes; systematic intervals and sample counts | Substitute values into quadratic functions; identify turning points; simple factorised roots; y-intercepts |
| 2 Standard | Two-stratum allocations, sample positions and interval calculations | Solve monic quadratic equations, calculate discriminants and find vertices by completing the square |
| 3 Mixed | Three-stratum allocations, final systematic positions and familiar calculations in a mixed sequence | Non-monic factorising, non-monic vertices, discriminants and monic roots |
| 4 Advanced | Reverse proportional allocation and combined stratified/systematic calculations | Quadratic formula to 2 d.p., solve for an unknown coefficient and calculate extreme values from completed-square form |

Different levels change the **mathematics**, not merely the size of the numbers. They are not intended to substitute for Reasoning or Modelling.

## Technical contracts

- \`src/fluency-engine.js\`: source of truth for topic/level/page configuration, deterministic question families, numeric answer specifications, step-by-step generated working and response validation.
- \`src/fluency-ui.js\`: accessible one-question-at-a-time interface, response feedback, progress and full-solution rendering.
- \`src/fluency-progress.js\`: versioned, validated, per-level aggregate progress model with no typed student responses.
- \`src/worksheet-generator.js\`: generates additional Fluency questions or converts the *actual* completed practice set into editable LaTeX with corresponding worked solutions.
- \`src/mode-content.js\` registers the Fluency subsection/page structure; \`src/app.js\` owns transient state and event actions.
- \`src/logic.js\` rejects a concept explorer or unreviewed page shape in the Fluency mode.

A new question family must return:
\`\`\`js
{
  family: 'unique-family',
  signature: 'unique-family:parameter-values',
  prompt: 'A parameter-dependent, mathematical question.',
  answer: {
    kind: 'number' | 'ordered' | 'unordered',
    values: [2, 3],
    precision: 0,        // optional numerical tolerance for specified rounded answers
    unit: '',            // e.g. '%'
    label: 'Enter both roots separated by a comma.'
  },
  steps: ['A correct first step.', 'A second step and conclusion.'],
  hint: 'A useful mathematical next step, not the final answer.',
  mistake: 'Specific guidance for a likely calculation error.',
  skill: 'Standard mathematical technique',
  marks: 3
}
\`\`\`

Identifiers and numerical signatures must remain stable and unique inside each generated set. Question generators may not use \`eval\`, execute user responses, or send data to a backend. Accepting equivalent roots does **not** mean accepting arbitrary equivalent algebra: this is a numerical fluency checker, not a general CAS.

The printable implementation escapes external text before LaTeX export and represents mathematical Unicode symbols explicitly, rather than silently replacing them with question marks. The printed set and worked-solutions document must include the same questions, order and numerical answers as the on-screen practice.

## Local progress and privacy

Only aggregate completed-round records are saved in \`localStorage\` under the per-topic key \`maths-notebook-pass1a:fluency:<topic-id>\`. A record contains completed rounds and counts of first-try successes, supported completions and revealed solutions by level. Working notes and raw typed answers are **not persisted**. A refreshed unfinished round restarts with new questions; previous completed-round totals remain. Progress on one topic does not alter another.

Aggregate counts are **practice evidence**, not student grades, diagnostic mastery scores, teacher surveillance or accounts. The site remains static/offline-capable after asset download and needs no sign-in, cloud storage or data submission. When local storage is blocked or cleared, progress will not persist.

## Accessibility and testing

- Form labels explain the required format, buttons are keyboard-operable and feedback is described in text.
- Focus moves to the next answer field or meaningful action following a state change. A hint may be hidden without erasing evidence that it was viewed.
- The optional writing area accepts mathematical scratch work without automated grading or storage.
- A reduced-motion preference and the existing Motion Off toggle remain respected.
- The minimum tested width is 320px, alongside 390, 768, 1024 and 1440px; question controls and worked solutions must not cause page-wide overflow.
- Mathematical property tests reconstruct generated parameters and verify sample fractions, allocations, roots, vertices, discriminants and inverse calculations over many random seeds.
- Browser tests cover feedback, equivalent values, retries, seeded regeneration, unfinished-set confirmation, persistence, exact LaTeX export and regression testing of other learning modes.
- New topic families require teacher review for assessment suitability, unambiguous answer formats, correct worked reasoning and appropriate numerical ranges.

## Remaining opportunities

The template now has robust Fluency infrastructure but only two demonstration topics. Future passes can add genuinely new skills, calculator guidance when appropriate, optional question-level difficulty adaptation, teacher-authored family editors, and a wider audited question bank. Do not claim automatic grading for proof, extended reasoning, modelling explanations or symbolic expressions until those input types have their own validated assessment contracts.
