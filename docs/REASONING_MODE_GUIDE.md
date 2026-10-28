# Reasoning — mode quality and reusable writing contract

**Status:** Reusable, writing-first Reasoning activity implemented for the Sampling Methods and Quadratic Functions demonstration topics.

## Educational purpose

Reasoning is not a numerical quiz, a terminology flashcard or a substitute for exploring concepts. Its purpose is to help students develop accurate, explicit, independently written mathematical arguments that connect a conclusion to sufficient evidence. Four right-hand subsections each have a distinct purpose:

| Tab | What a strong response does | Example |
| --- | --- | --- |
| **Explain** | Makes the cause-and-effect relationship explicit | Explain why a negative completed-square coefficient creates a maximum |
| **Justify** | Gives sufficient evidence to support a claim or selection | Prove the absence of real roots or justify proportional allocation |
| **Critique** | Identifies an exact flaw, explains it and repairs the argument | Correct lost roots after dividing by x |
| **Generalise** | Establishes a rule, its underlying logic and necessary conditions | Derive the turning-point formula or stratum allocation rule |

There are **four distinct, authored prompts per subsection in each of the two sample topics** (32 prompts total). Prompts are not artificially repetitive variations of one numerical calculation. Each task includes an optional hint, a sentence starter, a rigorous three-step model argument, three specific success criteria with corresponding improvement prompts and a meaningful follow-up reflection.

## Student sequence

1. **Write independently.** The initial page displays one clear task and a lined answer space. Students are not shown the answer immediately.
2. **Ask for support only if needed.** "Need a nudge?" exposes one mathematical hint and a sentence starter. It does not put the model on screen.
3. **Compare with a worked argument.** The three-step model explains the evidence, connection and conclusion. Students can compare without an attempt if genuinely stuck; the interface states this is not independent completion.
4. **Check three criteria.** These relate to the specific prompt, rather than generic "good reasoning". Unchecked criteria display precise next-step feedback.
5. **Choose a self-review judgement.** "Review again" can be selected after viewing a model even if no full response was written. "Still developing" requires a written response. "Ready to move on" additionally requires all three criteria to be checked. The site does **not** infer correctness or give automatically awarded marks.
6. **Move to the next prompt.** Completing a subsection reveals a concise review summary and a choice to revisit weaker prompts or practise the complete set again.

Progression through prompts happens *inside* each right-hand tab. The right-hand tab is a distinct subsection, not a Next Page control. Each section page has **one title and one explanatory sentence**, retaining the established Maths Notebook paper, chapter tabs and responsive selectors. The next internal task does not trigger a book-page turn or change the URL. No additional tutorial pages, "motivation" banners or repeated instructional headings are added.

## Honest feedback and assessment boundaries

**No automatically marked open-text answers.** A prose response may be mathematically correct using unexpected words, while a superficially keyword-rich paragraph may be wrong. This static site uses neither keyword-count grading nor undisclosed AI assessment.

- The three criteria are **student-ticked checkboxes**. Their count describes what the student reports having checked, not a verified assessment score.
- "Ready to move on" is a **self-report**, even after all criteria are selected; it is not a mastery claim.
- A student who opens the model before completing an independent draft is told explicitly that the example is supported practice.
- A student can choose "Review again" without submitting an unconvincing paragraph merely to satisfy an interface.
- We do not give marks or percentages that might be mistaken for examination grading.
- Error-specific advice is provided for **unchecked criteria**, drawing directly on the authored mathematical checklist, not inferred from a student's prose.

## Progress and privacy

- The only persistent data is a versioned, validated per-task self-review record in localStorage under \`maths-notebook-pass1a:reasoning:<topic-id>\`.
- It records a user's selected judgement, number of criteria checked, whether a full response was attempted, whether a hint/model was consulted early, number of reviews and the last review time.
- **No written answer, prompt draft, scratch work, password, name or free-text reflection is persisted**, transmitted or analysed.
- Drafts remain only in memory for the active browser tab/session. Changing topics within the session retains work; refreshing clears free text. Switching from an unfinished prompt to another practice selection asks for explicit confirmation.
- "Needs another look" prioritises tasks self-rated "Review again", followed by "Still developing" and then unseen tasks. It omits self-rated ready tasks. "All prompts" is always available, including after every task is marked ready.
- Records are validated against **the current topic's authored IDs**, so unknown, corrupted and foreign-topic records are ignored. One topic's self-rating cannot overwrite another topic's history.
- Local data is device/browser specific. No sign-in, cloud sharing, remote marking or teacher dashboard is implied. Clearing browser data or blocked storage loses the local record.

## Source contract

- \`src/reasoning-content.js\` — approved content and the four-tab structure. Each task has an ID, prompt, hint, starter, three model steps, three labelled criteria with targeted improvement advice and one reflection question.
- \`src/reasoning-engine.js\` — schema checks, per-task review guards, corruption-safe hydration, summary calculation and priority queue. No browser API and no state mutation.
- \`src/reasoning-ui.js\` — accessible display of written space, hints, models, comparison checkboxes, self-ratings and summaries. All student-supplied text is HTML-escaped.
- \`src/app.js\` — transient writing/session state, student-triggered events and local aggregate persistence.
- \`src/mode-content.js\` and \`src/logic.js\` — integration with the existing routing hierarchy; invalid modes, duplicate IDs and missing mathematical content fail validation.

Every new topic requires a mathematics teacher to check **truth, completeness, assumptions, counterexamples and accepted conclusions**, not merely grammatical polish. In particular, mathematical qualifiers such as "under a random selection mechanism", "when N/n is an integer" and "for real x" should not be omitted if they affect the statement.

### New topic authoring

1. Create the exact four \`section\` IDs: \`explain\`, \`justify\`, \`critique\`, \`generalise\`. Give each subsection one content page \`{id:'main',type:'reasoning',tasks:[...]}\`.
2. Author four or more distinct prompts per subsection, each with three correct model steps and three mathematically specific criteria with next-step advice.
3. Avoid outsourcing all mathematical decisions to a generic model, restating memorisation definitions or duplicating a Fluency calculation as "justify".
4. Ensure all model arguments can withstand counterexamples and use the right mathematical assumptions and language.
5. Add schema tests, content/mathematics assertions, browser interactions, keyboard and mobile checks, and appropriate visual screenshots before merge.

## Accessibility, responsiveness and QA

- Semantic labels for the writing field, checkboxes, buttons and logical progress language.
- Focus restored after rerendered hints and checkbox changes; success and error messages also announced by the site's existing live-region system.
- Every choice can be made using a keyboard or touchscreen; success is not conveyed by colour alone.
- Reduced-motion preferences and the established Motion Off setting remain in effect; no required page-flip animation.
- Check layouts at 320, 390, 768, 1024 and 1440px. Model steps, criterion labels and answer areas must not cause horizontal page overflow.
- Unit tests verify all 32 sample prompts and their models/criteria, sample mathematics, schema failures, progress isolation and corrupted-state restoration.
- Browser tests verify the complete write → support → compare → check → self-rate → review flow, an honest "no written attempt" path, persistence and privacy, a confirm-before-discard interaction and regressions in all other learning modes.

## Future opportunities

After the other core modes have been upgraded, consider adding optional teacher-authored rubric variations and export of **student-owned** written responses on user action, while preserving privacy. Do not automatically grade unconstrained proof or explanation until a separately reviewed assessment design can reliably distinguish valid alternative arguments.
