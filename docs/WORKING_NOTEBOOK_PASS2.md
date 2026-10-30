# Working-out notebook — Pass 2

## What is implemented

The reusable working notebook lives in `src/working-notebook-model.js` (pure
versioned data and SVG export), `src/working-notebook.js` (accessible browser
controls), and `styles/working-notebook.css`.

In the **Fluency** demonstration topic, expand **Working notebook** under the
existing quick-notes box. Students can:

- Type mathematics with MathLive's visual field, or with a LaTeX source editor
  when the library is unavailable.
- Insert common symbols using the same palette introduced in Pass 1.
- Add explanations between equations and reorder or remove working blocks.
- Switch between Type, Draw and Both without discarding either kind of work.
- Draw with mouse, touch or stylus and erase individual strokes.
- Change squared, ruled or plain paper; navigate up to eight working pages.
- Undo or redo editing, block operations and drawing strokes.
- Expand the notebook to a larger workspace and collapse it again.
- Download self-contained printable HTML with SVG drawings, or a lossless
  JSON backup of the notebook data.
- Clear the notebook deliberately using a confirmation prompt.

This notebook is independent of the final-answer checker; **it never assigns
marks to working or assumes the method is correct.**

## Data and privacy

The data contract is version 1:

- `version`: 1; `mode`: `type`, `draw`, or `both`
- `paper`: `squared`, `ruled`, or `plain`
- `page`: active page index; `nextId`: stable editable block/page IDs
- `pages`: ordered pages, each containing ordered `math`/`text` blocks
  and ink strokes with normalized points in a 720×320 coordinate system

The notebook saves immediately to the browser's localStorage under
`maths-notebook:working:v1:<scope>`; it is **separate from** the existing
`maths-notebook-pass1a:fluency:...` aggregate progress keys.
No account, remote storage or automatic submission is used. On shared devices
other people using the same browser profile can access the work. Clearing
browser storage also deletes the notebook; students should export a copy
when the work matters. If storage is blocked, the UI warns the student.

Scopes are stable per Fluency topic/level/page. The notebook is a *page-level
scratchbook*, not tied to a generated question seed: changing questions
does not delete the student's earlier pages. Quick notes retain their prior
temporary per-question/session behaviour. A completed Fluency round retains
the notebook so students can export after finishing.

Draft state is strictly validated on restore. Excessively large, invalid,
malformed, or unsafe content is rejected. Text is HTML-escaped. Strokes are
editable vector paths, not screenshot bitmaps. Limits are eight pages,
30 mixed blocks per page, 160 strokes per page and 500 points per stroke.

## Export and offline behaviour

HTML export includes all pages, typed content and SVG drawings. The standalone
HTML references MathJax for optional online mathematical rendering; without
it, the formula remains available as readable LaTeX text. JSON backup
preserves all coordinates and LaTeX without loss. Pass 2 does **not** yet
provide a JSON import workflow.

The visual maths editor is the Pass 1 CDN-pinned MathLive component and needs
network access on first load; the fallback source editor, drawing and save
work without the library. The notebook is otherwise client-side.

## Testing and next stage

`npm run check` runs model tests covering versioning, malicious/corrupt
data, cross-page edits, stroke erasure and export. Browser tests cover
persistence across navigation/refresh, real mouse drawing, eraser/undo/redo,
download and narrow viewport use. Existing numerical Fluency regression
tests must also pass.

**Pass 3** will integrate the shared notebook into Understand, Reasoning,
Problem Solving and Modelling with mode-specific prompts and stage linking;
it should not duplicate the model or canvas code. Future enhancements could
include pressure-sensitive strokes, lasso selection, pen-on-diagram annotations,
offline vendoring of the visual editor, import and optional device sync.
