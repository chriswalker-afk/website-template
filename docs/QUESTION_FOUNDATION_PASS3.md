# Question-generation foundation — Pass 3: Teacher Question Workshop

Pass 3 adds a **read-only teacher workspace** for inspecting and quality-checking
real question generators in registered topic packs. It reuses the existing
student question contracts and the exact verifier from Pass 2; it does not
reimplement generation, publish drafts or change student marking.

## Open the workshop

From the repository root, with Node.js 22 or newer:

    npm run author:questions -- --topic gradient

Optional flags:

    npm run author:questions -- --topic gradient --seed 2026 --difficulty stretch --port 4173

Open the URL printed in the terminal (usually
http://127.0.0.1:4173/authoring.html?topic=gradient).
Alternatively, use the normal npm run preview server and open /authoring.html
directly. On the template hub's GitHub Pages site, the same page is at
/website-template/authoring.html.

**Do not treat this public page as an authenticated admin tool.** It is intended
for local/repository authoring, and no student or confidential data should
be placed in topic source files. It cannot write to GitHub or edit any pack.

## Typical workflow

1. Create a draft with the Topic Creator:

       npm run new-topic -- --id percentage-change --title "Percentage Change" --qualification 4MA1 --level Foundation

2. Add reviewed mathematical families to the new topic's fluency-families.js
   and/or worksheet-families.js, and register them in question-bank.js.
3. Launch the workshop with --topic percentage-change. Unlike the student
   topic selector, the workshop's catalogue **includes registered drafts**,
   without publishing them.
4. Search/filter the library to pick a family. Open the same seeded example
   again, or inspect two adjacent seeds for variety.
5. Inspect question wording, mark total, full solution, hint, common error,
   signature and source path. Worksheet previews show the authored LaTeX
   source, not a compiled PDF. Change Developing/Secure/Stretch to see
   worksheet parameter changes. Fluency levels are defined by their topic
   pages, so worksheet difficulty does not secretly alter Fluency output.
6. Use the Accepted-answer explorer to view **verified** example inputs.
   Test your own alternatives with the same checker used by students.
   Unsupported forms are reported as such; they are not assumed to be
   incorrect mathematics. Printable-only families cannot auto-mark.
7. Run a family audit, then a topic-wide audit. The default checks **48 seeds
   per Fluency family** and **48 seeds at each of three worksheet difficulties**
   per worksheet family. A quick scan of 8 and a stress test of 96 are available.
8. Download the JSON QA report to keep failing family/seed details. Share a
   reproducible preview URL using Copy preview link. Correct errors in the
   topic source and run the checks again.
9. Run the formal publication checks before releasing the topic:

       npm run audit:topic -- --topic percentage-change --strict
       npm run check
       npm run test:latex
       npm run test:browser

The workshop's QA report does not publish a topic or replace these checks.

## What is checked

The browser/Node compatible question-workshop/core.js:
- Reads actual AUTHORING_PACKS registrations, including draft packs.
  Student-facing TOPICS and QUESTION_BANKS **still exclude drafts**.
- Generates deterministic Fluency and printable questions from a seed.
- Validates existing Fluency answer contracts and worksheet LaTeX fields.
- Repeats each seed to find nondeterministic generators.
- Runs reference-answer round trips using the exact/numeric student checker.
- For worksheets, covers Developing, Secure and Stretch, validates mark totals,
  question/answer/hint/solution LaTeX, and catches TODO placeholders.
- Reports suspiciously little variation and seed-specific errors.
- Supports independent topic-authored mathematical oracles via the Pass 2
  audit APIs, without claiming existing families have them when they don't.

## Limits and review requirements

The checker compares final mathematical values and a bounded set of
equivalent symbolic forms. It cannot prove the prompt is correct, the
worked solution is valid, the difficulty is calibrated, LaTeX compiles
or instructions such as "factorise completely" are satisfied.
Teacher mathematical review remains essential. For printable questions,
compile the exported worksheet with Overleaf or local LaTeX.

The workshop is a review environment, **not** a no-code source editor.
The existing Topic Creator scaffolds source files; authors update these
files or develop them through GitHub PRs. No student responses are
stored or transmitted by the workshop.
Standalone topic exports do **not** include authoring.html.

## Architecture and tests

- authoring.html — independent teacher entrypoint
- styles/question-workshop.css — responsive book-inspired studio design
- src/question-workshop/core.js — catalogue, preview and quality checks
- src/question-workshop/ui.js — browser controls, mathematical rendering,
  URL seed sharing and downloadable QA JSON
- scripts/question-workshop.mjs — Node launch
- tests/question-workshop.test.js and .spec.js — seed validation,
  real families, answer examples, UI flow, student isolation and mobile

The existing books, question families and student marking are unchanged.
