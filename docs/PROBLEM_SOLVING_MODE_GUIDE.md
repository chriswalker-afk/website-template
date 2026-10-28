# Problem Solving — reusable non-routine mathematics experience

**Status:** Quality-upgraded production-style demonstration for Sampling Methods and Quadratic Functions, integrated with the Maths Notebook shell and local review system.

## Educational boundary

**Fluency** develops accurate execution of familiar methods. **Reasoning** asks pupils to explain, justify, critique or generalise arguments. **Problem Solving** requires pupils to *select and combine* methods when the next step is not immediately specified, to manage multiple conditions, and to check whether the result answers the whole question. **Modelling** retains its own focus on formulating and evaluating representations of real situations.

The four distinct right-hand tabs have progressively fading scaffold levels, not qualification-specific assessment objectives:

| Right-hand tab | Cognitive demand and support |
| --- | --- |
| Level 1: Guided | Two-step unfamiliar questions. The first planning decision is visible; two optional support stages are available. |
| Level 2: Structured | Link different familiar procedures. An initial planning question is visible but the method is not given away. |
| Level 3: Independent | Choose the approach from the question. Strategic prompts only appear on demand. |
| Level 4: Challenge | Multi-condition, inverse and boundary-case problems. All support is optional and hidden initially. |

Each level has **two distinct book pages**, each page containing **two separate, original mathematical problems**. The right-hand tab stays on the same level as the pupil progresses through problems or turns to the next internal page. The two sample topics contain **16 worked problems each**, with entirely different task contexts and mathematical techniques. Sampling Methods, which previously had no Problem Solving chapter, now has a complete four-level demonstration.

## Student interaction

1. **Read the unfamiliar problem.** It appears as one clear prompt with no redundant subsection headings. At Levels 1–2 there is one concise first-decision planning question.
2. **Plan a route.** A dedicated strategy box asks what is known, what is required and how the conditions might connect.
3. **Work independently.** A larger, lined-paper calculation workspace is separate from the planning area. No automatic mark is assigned to this free text.
4. **Choose support when required.** The student may compare two plausible mathematical approaches. Each choice reveals educator-authored feedback on its usefulness or limitations; no fake numerical score is shown. A first nudge and a stronger hint are separately optional.
5. **Reveal the full mathematical solution gradually.** Every task has at least three logically distinct authored solution steps. Reveal is student-controlled, one step at a time, so the whole method is not exposed before the student chooses.
6. **Compare and review.** After all steps, the student sees three question-specific self-check criteria and a worthwhile reflection question. The pupil can self-rate a problem as **Retry this problem**, **Solved with support** or **Solved independently**.
7. **Revisit strategically.** The selected review status determines the next "Revisit weaker problems" queue: retry first, then supported, then unseen. Self-rated independent problems are still available in "All problems". Completed pages show a short review recap, while bottom book navigation moves between distinct pages.

### Honest assessment safeguards

- The site does not grade written plans or mathematical solutions. All ratings and checks are **student self-reports**, not guaranteed mastery.
- **Retry** is available after viewing all solution steps, even without an initial written attempt. Pupils can learn from a complete model without pretending to have solved the problem.
- **Solved with support** requires a sufficiently complete written strategy and calculations (minimum length to discourage accidental empty submissions) and all three self-check criteria selected.
- **Solved independently** additionally requires that no strategy-feedback or hint was requested and that the worked solution was not opened before a written attempt. It remains a self-report; text length is not evidence of mathematical correctness.
- Opening the possible-strategies panel counts as assistance, since reading its routes may influence the solution even without choosing an option. Assistance remains recorded if the panel is subsequently closed or the student navigates back to the question.
- An advanced problem does not become a Fluency problem simply because a student uses a known technique. It should require choosing the technique, linking conditions or checking a nontrivial constraint.

## Engineering and authoring contract

| Source module | Responsibility |
| --- | --- |
| \`src/problem-solving-content.js\` | Four levels per topic, two pages per level, two problems per page; mathematical prompt, planning question, two strategy choices and feedback, two graduated hints, three-or-more fully worked steps, three check criteria, reflection |
| \`src/problem-solving-engine.js\` | Pure validators, safe local review record hydration, support-aware rating conditions, queue priority and level summaries |
| \`src/problem-solving-ui.js\` | Accessible writing/strategy/working workspace, optional hint and staged solution interfaces, self-check, replay and recaps |
| \`src/app.js\` | Ephemeral per-topic/per-level/per-page writing sessions, event handlers, browser focus management and local review persistence |
| \`src/mode-content.js\` and \`src/logic.js\` | Main mode routing, right tabs, internal book pages and schema checks |
| \`tests/problem-solving.test.js\`, \`tests/problem-solving.spec.js\` | Mathematical and schema review, honest rating guards, privacy, responsive/keyboard behaviour and full workflow regression |

The schema includes a stable problem ID and three independent educational layers:

\`\`\`js
{
  id: 'my-new-problem',
  prompt: 'An unfamiliar multi-condition mathematical problem.',
  plan: 'One planning prompt, not a complete method.',
  options: [
    {id:'s1',label:'A promising strategy',feedback:'Why it could help...'},
    {id:'s2',label:'A tempting but incomplete route',feedback:'What is missing...'}
  ],
  hints: ['A light nudge.', 'A more specific, actionable nudge.'],
  steps: [
    'A justified mathematical starting step.',
    'A full calculation or deduction.',
    'A correct conclusion and verification.'
  ],
  checks: [
    'The strategy addresses all conditions.',
    'The mathematical working is accurate.',
    'The result is checked in the original context.'
  ],
  reflection: 'A follow-up that helps transfer the strategy.'
}
\`\`\`

New content must be **teacher-reviewed** for correct mathematics, complete coverage of cases, assumptions, appropriate subject level and genuinely distinct problem-solving demand. The three check criteria are *specific to each problem*, not blindly reused across different topics. Avoid artificial "mystery" questions whose only difficulty is hiding what has already been explained in Understand.

## Browser data and privacy

- Student plan, calculations, temporary strategy selections, hint states, and revealed steps live **only in the current browser session**. Switching between book pages within the same session preserves draft work; refreshing clears it.
- Persistent per-topic storage is under \`maths-notebook-pass1a:problem-solving:<topic-id>\`. It contains only task IDs, self-review status, checked-criterion count, whether writing was attempted, support/early-model flags, review counts and review timestamps.
- There is **no login**, remote account, transmission or teacher tracking built into this standalone template. No student prose or mathematics is saved persistently.
- Corrupted, unrecognised and foreign-topic review records are ignored when loading.
- Replacing an unfinished practice selection requires confirmation; refreshing the tab is not treated as submitting an answer.
- Progress is device-specific, subject to local storage availability and browser clearing.

## Accessibility and checks

- Explicit labels for plan/working, controls with accessible buttons and pressed/expanded states, semantic checkboxes and text feedback.
- Keyboard operation is tested for planning, hints, strategies, steps and self-checks; focus returns to meaningful controls after rerender.
- Mobile widths **320, 390, 768, 1024 and 1440px** are included in browser checks; the two-column writing layout becomes one column on narrow screens.
- All important outcomes have text descriptions and do not rely solely on colour or animation.
- The established book page-turn motion and reduced-motion toggle are preserved.
- Mathematical unit tests validate representative calculations, parameter limits, sampling design conditions and fully authored content. Browser tests cover incomplete attempts, assistance-aware rating constraints, privacy, local progress isolation, deep links and regressions in all other modes.

## Suggested next passes

After Problem Solving, prioritise **Modelling** to develop its own formulate → calculate → interpret → evaluate cycle, instead of reusing either the numerical Fluency checker or the open-ended reasoning studio. Later develop Games and a teacher authoring workflow that makes these high-quality modes straightforward to populate for completely different mathematical topics.
