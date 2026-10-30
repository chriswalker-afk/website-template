# Pass 4 — Mathematical toolkit in the working notebook

## Overview

The existing reusable **working notebook** can now store five new mathematical
objects alongside typeset equations, written explanations and freehand strokes.

| Object | Editable information | Student preview |
| --- | --- | --- |
| Coordinate graph | Quadratic coefficients `a,b,c`, straight-line `b,c`, or scatter coordinates; axis bounds, labels and grid | Labelled and scaled SVG axes, clipped function curve or plotted points |
| Data table | Title, column headings and cell content; 1–12 rows and 2–6 columns | Real HTML table with accessible headings |
| Number line | Variable, number-line range, inequality boundary, `<,≤,>,≥,=` | Correct open or closed endpoint with shaded direction |
| Geometry diagram | Triangle vertices, opposite side labels, optional angles and an explicit right-angle marker | Labelled triangle diagram, **not to scale** |
| Probability tree | Two-stage binary branch labels and probabilities | SVG branch tree and warning if any branch pair fails to sum to 1 |

Students open **Insert mathematical tool** in the notebook. Each inserted
object appears as a distinct ordered block, with an *Edit…* panel for inputs,
a visual preview, Move Up/Down and Remove. Blocks coexist on any page with
maths lines, written explanations and pen drawings. They inherit **local
autosave, undo/redo, page navigation, clearing, printable HTML and JSON
backup**. This is a reusable feature across Fluency, Understand, Reasoning,
Problem Solving and Modelling; the contents of the selected topic do not
hardcode the tools.

### Preservation and privacy

The Pass 2/3 version 1 notebook schema and storage key
`maths-notebook:working:v1:<scope>` remain unchanged. Existing `math`
and `text` blocks are loaded exactly as before. Five new block kinds store
editable `data` objects with strongly validated numeric/string fields;
they are **not** flattened into images. Strict upper limits for axes, point
counts, table dimensions, labels, branch probabilities and numbers protect
browser storage and renderer stability. Invalid or malicious stored data
cannot be rendered. User-provided strings are HTML-escaped.

These tools do not send work to a server or change final-answer marking.
The probability tree checks whether branch probabilities sum to 1 but does
not infer whether a model is appropriate for the question. The graph
displays a specified quadratic or line or scatter plot; it does not
automatically calculate a regression line. Geometry sketches have fixed
schematic vertices and cannot be used to measure lengths or angles.
Number lines handle one-boundary inequalities; compound intervals may be
added later.

### Accessibility and offline use

Editors use labelled native text, number, checkbox and select controls and
keyboard-accessible block actions. SVG graphs and diagrams carry accessible
descriptions; tables use semantic headings. Each preview scales to the
working notebook width, including 320px mobile. The toolkit has **no runtime
library dependency**, so it renders and saves locally without a network
connection. The separate visual *maths expression* editor still uses the
version-pinned MathLive loading behaviour from Pass 1, with source-LaTeX
fallback.

### Printing and exporting

Printable HTML includes the **actual SVG plots and diagrams** and **semantic
HTML tables**, with all labels escaped; mathematical lines use the previous
LaTeX export. JSON backups preserve numeric settings, coordinate points,
table cells and every label so they are editable in a future import tool.

### Testing

- Node unit tests: safe defaults, validation, boundaries, open/closed
  inequalities, graph clipping, branch checks, object persistence,
  version 1 compatibility, structured edits, security and HTML export.
- Playwright: adding/editing each tool, dimension changes, undo/redo,
  refresh/localStorage, print/JSON exports and 320px layout.
- Existing browser suite: all modes, assessments, notebooks, worksheet
  generation and screenshots are preserved.

### Future options (outside Pass 4)

Moveable geometric vertices, more general graph/function expressions,
compound number-line inequalities, full probability trees, linked tables
and graphs, JSON import, and handwriting recognition would benefit from
separate requirements and testing. No handwriting interpretation or
automatic marking of working is claimed in this pass.
