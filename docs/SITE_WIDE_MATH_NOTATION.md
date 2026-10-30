# Mathematical notation — site-wide display standard

All displayed **mathematical questions, examples, hints and solutions** should use properly typeset, readable mathematics, not raw text with occasional Unicode superscripts.

## Rendering

`src/math-notation.js` is the shared renderer. The app calls `typesetSiteMath()` after each page render so the same mathematical typography applies to **Understand, Memorise, Fluency, Reasoning, Problem Solving, Modelling and the worksheet-preview pages**. The dynamic graph readout is refreshed using the same renderer.

The browser displays native, semantic **MathML** (available in current major browsers). Mathematical variables are italicised appropriately; exponents, indices, square roots and fractional notation use mathematical layout and inherit the surrounding book typography. The renderer includes a readable accessible label on each formula. There is **no external typesetting dependency**, allowing existing lesson and question content to display correctly when the editable MathLive input is offline.

The existing historical authored content uses Unicode maths such as `x²`, slash fractions such as `36/480`, compact functions such as `f(x)=3x²+x−7`, and inequalities such as `0≤x≤8`. The display layer recognises a conservative subset of those expressions within normal prose, producing MathML without modifying the stored question text, deterministic question seeds or answer-checking logic.

### New content — write explicit LaTeX

Future topics should write mathematical expressions using delimiters to remove ambiguity:

| Authoring source | Intended result |
| --- | --- |
| `'For \\(f(x)=3x^2+x-7\\), find \\(f(-4)\\).'` | A typeset function with exponent |
| `'The sample fraction is \\(\\frac{36}{480}\\).'` | A stacked fraction |
| `'Solve \\(x^2-5x+6=0\\).'` | Typeset polynomial equation |
| `'For \\(0\\le x\\le 8\\), ...'` | Inequality and variable |
| `'Use \\(x_1\\) and \\(x_2\\).'` | Subscripts |
| `'\\(\\sqrt{b^2-4ac}\\)'` | Square root |

In JavaScript source, **escape backslashes** (e.g. `'\\(x^2\\)'`). The supported built-in commands include fractions, square roots, simple superscripts/subscripts, common Greek letters, sums/integrals, basic accents and comparison operators. For more advanced mathematical expressions, extend the renderer's validated subset and its tests instead of placing raw HTML, SVG or inaccessible Unicode art in question strings.

**Never put HTML into student-facing content as a way to render a formula.** All authored prose and mathematical token contents are escaped before insertion. Do not typeset editable inputs or keyboard controls as if they were answers.

### Parenthesised expressions and exponents

Superscripts **must attach to the complete mathematical base**. In particular,
\(2(x-1)^2+2\) must render with an exponent on the entire bracketed
expression \((x-1)\), not on a closing parenthesis. The shared renderer
treats matched parentheses and square brackets as single mathematical
groups before applying any superscript. Symbolic coordinates such as
\((h,k)\) are also treated as mathematical notation.

Regression tests cover turning-point prompts, guided method cues, negative
and nested powers, explicit LaTeX, and the visual position of the exponent
in Chromium. Do not regress to appending a superscript to a single
\`<mo>)</mo>\` node.

### Educational safeguards

- Display enhancement does **not** affect numerical checking, hints, score recording, practice ordering, completed-round summaries or LaTeX worksheet source generation.
- Equations and fractions in written arguments remain ungraded, as before.
- Inputs, scratch notebooks, custom diagrams, buttons, selectors and student freehand drawings are excluded from this enhancement.
- A formula too complex for the built-in renderer is shown as escaped plain text, not silently evaluated or treated as a correct answer.
- Update site-wide notation tests whenever a new family introduces a new mathematical syntax, and check the output at 320px and normal desktop widths.
