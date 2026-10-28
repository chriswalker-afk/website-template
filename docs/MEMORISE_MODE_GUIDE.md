# Memorise — revision quality and reusable content contract

**Status:** Functional, reusable prototype in the Sampling Methods and Quadratic Functions demonstration books. The shared engine is designed for other topics, but individual mathematical banks still require subject review.

## Learning design

**Memorise** develops precise recall of mathematical terminology, formulas and key facts. It should not become an alternative home for conceptual graph exploration, general question fluency or full modelling tasks. The five right-hand subsections remain:

| Right-hand tab | Learning purpose | Mechanism |
| --- | --- | --- |
| **Flashcards** | Self-retrieval before recognition | Full-page animated cards, flip, Again/Nearly/Know rating, priority and due queues, optional review flags |
| **Match Up** | Recognising accurate mathematical definitions | Four-term rounds covering the entire deck over successive rounds; explicit matched state and feedback |
| **Missing Words** | Retrieving mathematical language in context | Twelve authored contextual statements per demonstration topic; typed answer, optional hint/reveal, next prompt |
| **Speed Recall** | Independent definition-to-term retrieval | Typed answer, exact/approved alias/small spelling slip checking, visible correction and next prompt |
| **Review All** | Reviewing, locating and prioritising words | Search all terms, filter by new/due/priority/flagged, view definitions and next review dates, reset with confirmation |

A student should never need to use the **book's** Next Page button to move between cards, matches or prompts. Each is one distinct right-hand subsection with internal activity progress. Each subsection page has one title and one explanation.

## Shared progress

- All review activity updates a single **per-topic/per-card** store.
- **Self-ratings** are subjective. Only successfully checked typed answers or recognised matching pairs count as objective correct responses in the record.
- Merely seeing a card, advancing without a rating, viewing a model answer or browsing a definition **does not count** as successful recall.
- Wrong typed answers or revealed answers mark that item as needing another review. Correct answers with a revealed hint get a lower-confidence review interval.
- An incorrectly matched term is marked for retry; completing the correct match updates its latest review.
- New, flagged and due items appear in **Priority practice**. **Due now** includes only previously reviewed items whose scheduled review time has arrived.
- "Previously reviewed", "Due now", "Flagged" and "Building confidence" are operational statuses — **not grades, certificates or guaranteed long-term memory mastery**.
- The first round starts at the first deck card, but repeated games cover the entire deck rather than endlessly reusing a small subset.

### Simple transparent review prompts

The intervals below are **editable design heuristics**, not a scientifically validated individual-memory model.

| Review action | Next suggested practice |
| --- | --- |
| Again / answer revealed / wrong answer | Now |
| Nearly / correct with a hint / matching recognition | Next day |
| Know / independent checked correct (first confident recall) | In 3 days |
| Second consecutive confident recall | In 7 days |
| Third consecutive confident recall | In 14 days |
| Fourth and subsequent consecutive confident recalls | In 30 days |

An **Again** or **Nearly** review resets the confident streak. An earlier date automatically appears in the Due now queue once that time has passed. Review intervals use the browser's clock and are intended for planning, not precise measurement of learning.

## Data and privacy

Source files:
- \`src/memorise-content.js\` — authored context sentences, correct answers, hints and reviewed aliases
- \`src/topics.js\` — cards, definitions and per-topic cloze bank
- \`src/memorise-engine.js\` — pure grading, review scheduling, persisted-state validation, queues and answer checking
- \`src/memorise-ui.js\` — accessible UI for each learning activity, without state mutation
- \`src/app.js\` — local session state, accessible events and localStorage persistence

The store is versioned as \`{version:1,cards:{...}}\`, saved under the existing site's \`maths-notebook-pass1a:memorise:<topic-id>\` namespace. It contains review counts, last review time, due time, confidence streak and review flag. It **does not collect student identities**, send telemetry, connect to a server or sync across devices. Data may disappear when browser data is cleared or storage is unavailable. The code validates persisted content and drops unknown cards and corrupted entries before using it; no untrusted text is rendered without escaping.

**Reset saved progress** is confined to the selected topic and requires a second explicit confirmation. Restarting a flashcard or game round does not delete learning history. The reset does not affect saved bookmarks, worksheet drafts or Understand activities.

## Answer validation

- Check terms after Unicode normalisation, case/whitespace folding, standard dash mapping and only **explicitly reviewed aliases**.
- A single character insertion, deletion or replacement in a sufficiently long term is accepted at *Nearly* confidence **only if it cannot be confused with another term in the topic bank**.
- Short or easily confusable words require the correct spelling. Do **not** accept vague semantic matches or judge free-form mathematical explanations as if they were automatically verifiable.
- Contextual Missing Words prompts may have a different answer than the corresponding flashcard term (e.g. a missing \`square\` in \`completed-square form\`). Every prompt must link to a reviewed card and have a meaningful, non-answer-revealing hint.
- Wrong answers and revealed answers show the correct term explicitly; no penalties for requesting help and no hidden mastery scores.

## Accessible, responsive behaviours

- Every card flips on Enter or Space as well as touch/click; reduced-motion and site Motion Off options disable decorative animation.
- All game choices are buttons with meaningful selected/disabled states, not pointer-only draggable tiles.
- Inputs and dropdowns have associated labels; answer feedback is textual and announced.
- Card progress, round totals, matching completion and review statuses are written explicitly, not encoded in colour alone.
- On-screen filters and search should not unexpectedly erase progress or clear student input.
- Tested at 320, 390, 768, 1024 and 1440 px. No forced horizontal scroll, and the selected right-hand tab does not change when an internal card/prompt advances.

## Extending to a new topic

1. Add stable unique card IDs, technically accurate terms and concise definitions to the topic data.
2. Add a contextual \`clozes\` array, each with a unique id, linked \`cardId\`, statement \`before\` and \`after\`, correct \`answer\`, suitable \`hint\` and optional reviewed \`aliases\`.
3. Audit every accepted alias so synonymous spelling cannot accidentally change the mathematical meaning.
4. Ensure enough bank breadth to avoid games finishing in a few seconds; a new topic can have more cards than the two sample books.
5. Run \`npm run check\` (source/schema and mathematical tests) and \`npm run test:browser\` (desktop/mobile interaction tests).
6. Keep question generation, extended proofs, mathematical modelling and examination questions in their correct learning modes.

## Current limits

The two sample topics have twelve reviewed cards and twelve contextual prompts each; they illustrate the approach but are not complete exam-board coverage. Scheduling is lightweight and local; more advanced spaced learning, teacher insights or authenticated/cloud syncing should only be added later with a separate privacy, consent and data-management design.
