# Pass 4 — New Topic Creator, readiness audit and standalone publishing

Passes 1–3 separated the notebook shell from subject-specific topic packs, question generators and diagrams. Pass 4 makes starting and releasing another topic a repeatable authoring workflow. It uses built-in Node.js 22 modules and the existing static website: no bundler, cloud service or external visual editor is required.

## Quick start: scaffold a new topic

Run the guided wizard in a terminal:

    npm run new-topic

Or provide the answers at once:

    npm run new-topic -- --id gradient-and-midpoint --title "Gradient and Midpoint" --subject "Coordinate Geometry" --qualification "4MA1" --level "Foundation" --paper squared --modes understand,memorise,fluency,reasoning,problemSolving,modelling,games

For a quick dry run, add --dry-run. The creator validates IDs to prevent path traversal, refuses existing topics, generates the required files and registers the pack. You do not edit the shared engines, routing, selector, mathematical renderers or tests to add the topic.

### Files created

src/topic-packs/<id>/ includes:

- manifest.js — title, subject, qualification, tier, paper style, authoring status and mode plan
- index.js — cloneable topic content and mode declarations
- understand.js — four distinct learning subsections with unmistakable TODO guidance
- memorise.js — vocabulary, missing-word data and retrieval page collections
- fluency.js, fluency-families.js and fluency-scaffolds.js — four-level practice and question generation contracts
- worksheet-families.js and question-bank.js — reviewed printable question generators and skills
- reasoning.js, problem-solving.js, modelling.js, games.js, exam-practice.js — mode-specific starter modules
- visuals.js — diagram and interactive explorer definitions
- AUTHORING.md — per-topic checklist and commands

The creator updates src/topic-packs/registry.js automatically using guarded insertion markers. This keeps the source directory stable and prevents duplicating live mathematical content.

## Draft safety

New topics have authoring.status='draft'. The hub does not expose draft topics in its selector or navigation, even after source files are committed to main. The new pack has an immediately navigable Understand section, but its content is deliberately marked TODO, and the other modes remain disabled until fully authored.

The --modes argument is a **planning list**, not permission to switch unfinished quizzes on. Understand is initially enabled. Fill the requested modes and change their modes flags to true after they pass their validators. Missing modes and TODOs are reported as publication blockers.

When all requested content has been reviewed, change authoring.status to 'ready' in manifest.js. A ready topic becomes visible in the public hub once committed. Do not mark it ready until the strict audit passes.

The normal CI check also prevents an incomplete topic marked ready from being merged. Draft packs are still allowed in the repository while work continues.

## Content and mathematical notation checks

Inspect a draft:

    npm run audit:topic -- --topic gradient-and-midpoint

Get a machine-readable report:

    npm run audit:topic -- --topic gradient-and-midpoint --json

Check publication readiness:

    npm run audit:topic -- --topic gradient-and-midpoint --strict

Audit all registered packs:

    npm run audit:topic -- --all

The report separates three categories:

- Structural errors: invalid topic/page schemas, duplicated IDs, broken visual references, missing mathematical question families or worksheet skills
- Publication blockers: explicit TODOs, missing diagnostic concept checks, absent worked methods, missing visual explanations, no graduated worked examples, incomplete requested modes, unspecified specification/tier or draft status
- Warnings: detected ambiguous notation, special limitations and author-review reminders

It also reports enabled modes, pages, vocabulary cards, question-family counts, printable families and visual diagrams/explorers. It samples deterministic Fluency and worksheet generator outputs to check that answer and worked-solution contracts are complete. It **cannot prove** all authored mathematical claims are correct: a teacher should review the mathematics, feedback, difficulty and curriculum alignment before publishing.

For new topics, ambiguous ASCII notation such as x^2 and sqrt(x) in student-facing prose is blocked unless it is typeset using explicit inline LaTeX (for example \(x^2\) and \(\sqrt{x}\)) or proper unambiguous Unicode mathematics. A balanced LaTeX wrapper check catches some transcription mistakes but cannot replace visual review.

The existing npm run check command now also audits every pack structurally. Draft content remains allowed during work, but broken schemas do not silently pass CI.

## Preview a topic as a standalone website

    npm run preview:topic -- --topic gradient-and-midpoint

This exports the selected topic to dist/preview/gradient-and-midpoint/ and starts a local HTTP server at http://127.0.0.1:4173. It uses the same application as the hub but with a single-topic configuration, no topic selector, the topic title in the header, a DRAFT PREVIEW banner and noindex metadata. The preview is intentionally isolated from the published hub.

Run the command again after changes to regenerate the snapshot. You may choose another port with --port 4180.

To generate a draft without starting a server:

    npm run build:site -- --topic gradient-and-midpoint --draft --out dist/gradient-preview

## Build and publish

Once the full audit passes and authoring.status='ready':

    npm run audit:topic -- --topic gradient-and-midpoint --strict
    npm run build:site -- --topic gradient-and-midpoint --out dist/gradient-and-midpoint

A production build refuses incomplete or draft topics and will never remove or overwrite source folders. Build outputs are restricted to subdirectories of dist/. The generated site has index.html, src/, styles/, favicon.svg, .nojekyll and a short site-build.json manifest. It uses existing hash routes for deep links and is ready for static hosting.

To export from the GitHub website without installing Node locally, open Actions → Export standalone topic website → Run workflow, then enter a reviewed topic ID. Download the artifact produced by that workflow. This **exports**, rather than deploys over, the existing template hub.

For a separate public URL, create a dedicated GitHub Pages repository for the topic and place the built site's contents at its publishing root (or use a Pages deployment workflow in that repository). Enable Pages in that repository's Settings. Keep the topic hub's existing Pages deployment unchanged. Static asset links are relative to the publishing root, so a project Pages URL works. Avoid uploading draft builds to any public site.

Note that the source-based build copies shared JavaScript and installed topic-pack files so their existing import paths continue to resolve. Standalone *navigation* exposes only the chosen topic; source-file isolation/minification is not part of this lightweight pass. The public repository already contains the original demonstration source. Do not place confidential or student-identifying information in topic packs.

## Before marking a new site ready

1. Confirm the course specification, tier/level, expected prerequisites and intended student audience.
2. Write topic-specific Big idea, How it works, Visual explanations and Worked examples content; include an appropriate representation, diagnostic feedback and graduated support.
3. Provide complete and independently checked worked solutions for every generated question. Use the built-in numerical answer contract only for answer types it actually supports.
4. Use named visual data and stable page/skill IDs; confirm mathematical notation, axis labels, probability values and interpretation text.
5. Verify student navigation, keyboard access, narrow-screen presentation, worksheet output and a published build in a local browser.
6. Run npm run check, npm run test:latex, and the browser suite before merging.

## Next — Pass 5

Prove the workflow by creating a genuinely different topic, such as Gradient and Midpoint, entirely through the authoring workflow. Populate all desired modes, question generators and visuals, publish a standalone preview, and record every shared-code change needed. The ideal outcome is **zero** changes to src/app.js or the reusable core. Afterwards, assess the site's teacher experience and any remaining bottlenecks for future topic creation.
