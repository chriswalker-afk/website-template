# Worksheet Generator — LaTeX export specification

**Status:** Planned optional module; **not yet implemented**. Design the shared question and solution data contract in Pass 1B; build the worksheet generator after that foundation is ready.

## Goal
Provide a reusable **Worksheet Generator** in individual Maths topic websites. Students or teachers can configure a worksheet and download editable, professionally formatted **LaTeX source** for student questions and worked solutions, using the current topic's vetted question bank and generator families.

LaTeX source generation is feasible in a static GitHub Pages site without a server or per-use cloud cost. **Directly compiling PDFs is a separate, optional capability**; users can compile the exported source in Overleaf or a local LaTeX installation.

## Placement and copy
- Place the optional tool under **Contents → Resources → Worksheet Generator**, rather than crowding the existing top-row learning tabs with another chapter.
- Apply the book design's **one title and one explanation** rule: title "Worksheet Generator"; explanation "Choose the skills, difficulty and length to create a printable LaTeX worksheet with worked solutions."
- Only show the resource when the topic has enough validated, printable question families.
- Default to a teacher-oriented utility, with an optional simplified student version. An unauthenticated public static page cannot enforce truly private teacher-only access.
- Retain the interactive-notebook styling for the interface. The exported worksheet should instead use a restrained, printable page layout.

## Configuration controls

| Setting | Choices |
| --- | --- |
| Topic and subskills | Current topic, selected objectives and subtopics |
| Worksheet style | Independent practice, Scaffolded practice, Mixed review, Challenge, Short assessment |
| Difficulty | Beginner, Developing, Secure, Stretch |
| Question count | Configurable, subject to available independent variants |
| Question mix | Fluency, Reasoning, Problem Solving, Modelling (no forced AO labels) |
| Scaffolding | None, hints, or backwards fading: modelled → partly completed → independent |
| Answers | Answers-only or fully worked solutions |
| Layout | A4 portrait initially; name/date, marks where applicable, room for working |
| Reproducibility | User-visible random seed + question family/bank version |
| Exports | Copy source, worksheet.tex, worked-solutions.tex; optional combined format later |

Keep the default UI compact; advanced options can be revealed when needed. If the selected bank cannot supply a requested mix, explain the limitation instead of padding with irrelevant or duplicate questions.

## Shared question architecture
**Do not build a separate PDF question bank.** Extend the shared topic-content contract so one question instance can be used in on-screen activities, printable worksheet pages and matching solutions.

Distinguish:
1. **Authored questions** with trusted question prompts, answer types, diagrams and fully worked solutions.
2. **Parameterised question families** with constrained variables, a deterministic seed, solution steps, skill and difficulty tags.
3. **Presentation renderers** producing HTML and LaTeX from the same **instantiated question and solution data**.
4. **Printable adaptations** for games and interactive questions only where a genuine written version has been authored and audited.

Suggested contract concepts: topic ID, skill ID, family ID, family version, learning purpose, difficulty, parameter constraints, answer type, instantiated values, question LaTeX, worked-solution steps, optional diagram specification and validated renderer.

Pipeline: filter families → select with seed → instantiate mathematical values → validate question/answer/solution together → render matched student and teacher documents → preview and export.

**Core generation does not need runtime AI.** Prefer tested mathematical algorithms and teacher-audited content to unpredictable fresh AI-generated questions or unchecked solutions. An AI-supported authoring workflow might be explored later, subject to review.

## LaTeX output rules
- Use small, tested document templates built around article, geometry, amsmath, amssymb and enumitem.
- Include TikZ and PGFPlots only for diagram families that need them, with original diagrams and clear axes/labels.
- Support student name/date, instructions, consistent numbering, sufficient handwriting space, optional marks and page breaks.
- Fully worked answer sheets show intermediate steps and reasoning, not just the final numerical answer.
- Student and teacher documents must use **identical generated numbers, diagrams, ordering and question IDs**.
- Escape user-supplied title/metadata safely. Mathematical TeX must come from controlled, reviewed family renderers, not arbitrary user-provided TeX or executable macros.
- Do not embed the website's decorative lined-paper visuals in worksheet files by default; professional printed worksheets take priority.

## Hosting and PDF compilation
- **MVP:** generate source strings client-side and offer Copy and Download .tex. This needs no Cloudflare Worker, account, external LaTeX service or server and works on GitHub Pages.
- **PDF option later:** start with Overleaf/local TeX compilation. If adding one-click PDF compilation, evaluate a compatible browser-side compiler or a dedicated sandboxed compilation service, with resource limits and clear error reporting.
- Do **not** silently send user-authored source to an external LaTeX API or expose unsafe server-side arbitrary TeX execution.
- An HTML print view is not equivalent to a tested, compiled LaTeX PDF; label the formats accurately.

## Mathematical and QA safeguards
- Property-test every generator across many seeds and corner cases: no unintended zero denominators, impossible graph configurations, ambiguous answers, inconsistent model assumptions or invalid sampling claims.
- Build student and worked-solution variants from one shared question instance, and verify consistency.
- Avoid near-identical question repetition within a worksheet; report genuinely insufficient variety.
- Validate whether each family supports hints, fading, diagrams, marks and solution depth before offering the related setting.
- Run automated TeX compilation of representative outputs in CI with an approved toolchain. Visually inspect sample rendered PDFs for equation wrapping, answer alignment, diagram clipping and working space.
- Validate long titles, missing solution steps, empty skill selections, unusually high requested question counts, invalid seeds, LaTeX special characters and no-diagram modes.
- First demonstrate one **terminology-heavy** topic (Sampling) and one **symbolic/graph-heavy** topic (Quadratic Functions).
- Prefer original and appropriately licensed questions; don't extract past papers or publisher questions without permission.

## Roadmap
**Pass 1B:** extend the reusable topic schema with stable question-family IDs, authored worked-solution steps, LaTeX rendering hooks and an optional worksheet-generator feature flag. Do not place an inert generator button in the live student UI.

**Pass 5A — Worksheet Generator MVP:** build compact settings, seeded selection, original question families from Sampling and Quadratic Functions, source preview, student worksheet.tex and worked-solutions.tex, and browser/unit/export/compile tests.

**Pass 5B — Advanced worksheets:** backwards-faded worked examples, richer mathematical types, original TikZ/PGFPlots diagrams, more question styles, better print layouts and extra solution formats.

**Optional later pass — Compile to PDF:** add direct PDF export only once a reliable, secure compilation approach meets performance and correctness requirements.

## Pass 5A acceptance criteria
- A single title/explanation with optional entry under Contents/Resources; no extra permanent chapter tab.
- Generates a student worksheet and matching **fully worked** solutions in editable LaTeX.
- Reproducible seed and family versions, stable question ordering and coherent marks/working space.
- Both Sampling and Quadratic Functions support useful, nontrivial worksheets.
- Every output type is demonstrably compilable in CI; rendered sample PDFs reviewed.
- Multi-seed tests validate mathematical correctness, content sufficiency and LaTeX escaping.
- Download works in modern desktop/mobile browsers, including 320 px width and keyboard-only.
- No cloud service, sign-in or student data is required for ordinary TeX creation.

**Design rationale:** a shared, reviewed mathematics content engine can power both digital practice and printable resources. The worksheet generator should be an optional reusable module, not a separate collection of hand-made PDFs.
