# Mathematical response system — Pass 1

## Scope
A reusable visual maths input component has been added, initially opt-in in **Fluency** through the “Use maths notation” button. The default simple numerical field, all existing question types and progress behaviour remain unchanged. The richer editor is the Pass 1 foundation for other modes; it does not yet replace written reasoning, modelling, or working areas.

## Student experience
- The default input remains fast simple typing; students may switch to the visual editor at any point.
- A fraction/root/power/inequality/arithmetic symbol palette supplements the keyboard.
- MathLive is loaded lazily from a version-pinned CDN only when the visual editor opens. An accessible LaTeX source input and palette remain usable if the CDN is unavailable.
- Mathematical answers are kept in session memory. The existing saved progress remains aggregate-only.
- Numerical, ordered and unordered fluency responses can be checked through the shared LaTeX-to-number bridge; unsupported symbolic expressions show a format message instead of being marked as incorrect.

## Technical contract
`makeMathResponse(latex)` returns `{version:1,format:'latex',latex}`.
`readMathResponse(record)` validates the envelope.
`parseMathNumber(latex)` handles a conservative arithmetic subset (fractions, radicals, powers, constants and arithmetic); it **never evaluates arbitrary JavaScript**. It does not claim to support equivalence of general expressions.
`latexToFluencyText(latex,answer)` converts suitable numerical results for the existing trusted Fluency checker, preserving ordered/unordered checking.

MathLive version is pinned in `src/math-input.js`. Because this pass uses a CDN, a visual editor requires a network connection the first time it is opened. The plain LaTeX input fallback remains available without it. Vendoring the dependency for robust offline usage is a future improvement.

## Test and review
- `npm run check` includes syntax checks and Node unit tests for the maths input contract, valid formats and unsafe expressions.
- Existing Playwright tests exercise ordinary numerical typing and fluency progression.
- Manual/browser smoke test: visit quadratics Fluency, choose “Use maths notation”, insert a fraction, submit; repeat with incorrect formula, switch modes, reveal solution and navigate; test small viewport, keyboard, and blocked CDN.
- The next planned pass is the typed/drawn working notebook. Broad integration across Reasoning, Problem Solving and Modelling is later.

## Deliberate limitations
This is a foundation, **not a general CAS**. Working/drawing, complex-number expressions, interval equivalence, matrices, and algebraic equivalence are not automatically checked here. Do not display automatic scores for written reasoning or modelling.
