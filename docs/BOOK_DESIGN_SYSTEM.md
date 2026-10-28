# Book Design System — Interactive Maths Notebook
**Status:** Approved design direction for the Pass 1 prototype; this document is a specification, not an implemented UI.

## 1. Design intent
A topic website should feel like opening and navigating a well-crafted **personal Maths notebook / tabbed reference book**. Take cues from the user's two reference photographs: prominent chapter dividers along a book edge and dense, easy-to-find side index tabs. The result should be contemporary and classroom-friendly, **not** an antique book, a decorative scrapbook, or an animation-heavy novelty.

A *book metaphor* describes visual form and navigation, not an inflexible simulation of paper. The priority order is:
1. mathematical readability, input accuracy, accessibility and fast task switching;
2. clear chapter/subsection navigation;
3. expressive paper, tabs, bookmarks and motion.

A user should be able to work with a keyboard, screen reader or touch screen without needing to understand the decorative metaphor.

### Editorial hierarchy: one title, one explanation
- **Each section/subsection page has exactly one visible page title (`h1`)**. Use the configured subsection name, not a second creative headline (for example, `Flashcards` rather than both `Memorise / Index Cards` and `Make it stick`).
- **Directly under that title, show one useful, concise explanation** of the concept or what to do. For an understanding page, this can be the real mathematical explanation, not an introductory sentence followed by the same explanation again.
- The Contents page has **Contents** and one short orientation. The topic's actual name belongs on the book cover; avoid a second slogan or tagline competing with it.
- Breadcrumbs identify **Contents and the chapter**, not the current subsection already displayed as the heading. Side tabs remain navigation, not additional body headings.
- Remove decorative eyebrows, repeated instruction strips, filler slogans, duplicated headings in graphs/cards/sidebars, verbose prototype notices, redundant footers and vague motivational copy.
- Retain meaningful **questions, worked examples, task labels, field labels, headings of individual game cards, feedback, hints and comparison labels**. These are learning content or operational UI, not duplicate page introductions.
- Future topic content should be reviewed for specificity and readability. Prefer `Change a, h and k to see how the parabola moves` over `Explore the magic of curves`.
- Browser QA checks that every route has one main `h1`, one nonempty page explanation, and no template-level filler labels. The book aesthetic comes from styling and movement, **not extra words**.

## 2. Information architecture as a book

### A. Front matter: Contents
- The first view resembles an elegant **Contents** page with site/topic title, a short orientation, chapters, progress summaries, a **Continue where you left off** link and user-made bookmarks.
- Each chapter has a stable destination, optional short description and a meaningful completion indicator. Do not lock chapters behind compulsory linear progression.
- Chapter names remain qualification-neutral: **Understand, Memorise, Fluency, Reasoning, Problem Solving, Modelling, Games**; optionally **Exam Practice**. Only show configured sections that contain content.
- Contents and progress must remain useful with every animation disabled; no decorative placeholders for missing chapters.

### B. Primary navigation: chapter tabs *across the top*
- Horizontal, coloured or gently differentiated **physical-looking tabs** projecting from the book's top edge.
- Tabs are individually named and selectable, with a clear active state that visually joins the tab to the page underneath.
- Subtle shadows/overlap can suggest paper depth. The active tab may lift then settle, but navigation must not wait for the animation.
- Preserve a consistent order when optional chapters are absent; do **not** replace absent chapters with dead tabs.
- Include a permanent, clearly labelled **Contents/Home** control and accessible navigation landmarks.
- Colours are supportive, not the only means of distinguishing active or completed chapters.

### C. Secondary navigation: subsection index tabs *down the side*
- Narrow **right-edge index tabs**, inspired by the second photograph, for the selected chapter's subtopics/activities. On desktop, they remain visible without covering working content.
- Examples for Memorise: **Flashcards**, **Match Up**, **Missing Words**, **Speed Recall**, and other configured recall games. Optionally group larger sets under **Language & Recall Games**.
- A side tab uses a legible text label or accessible short label; do not rely solely on sideways/rotated text or colour.
- Current subsection appears attached to the active page. Others have distinct pointer, hover, focus and selected appearances.
- When there are many subsections, use grouping/side index navigation rather than dozens of compressed, overlapping tabs; never truncate away a critical unique label.
- The side rail contains only items available for the active chapter. It must remain navigable with keyboard, mouse and touch.
- Do not confuse **Memorise's language/retrieval games** with the separate **Games chapter** for broader challenges.

### D. Content workspace: a modern, usable page
- On desktop, the **default is one wide working page** framed by an understated cover/spine and layered-paper edge. Do not force a two-page spread, especially when working with maths inputs, graphing and diagrams.
- A two-page layout may be an *optional reading variant* for introductory content at ample widths. It must collapse to one reading order for keyboard, screen readers and smaller windows.
- Page numbering may be shown subtly, preferably as **Chapter / Subsection** plus an optional page index, never at the expense of actual navigation.
- Space for graphs, tall equations, handwritten-style working grids and wide interactive canvases must take precedence over visual page margins.
- Content length must scroll naturally. Do not put the primary work into an arbitrarily short fake-page viewport, nested vertical scroller or page-by-page pagination that interrupts answers.

## 3. Page surfaces and stationery motifs
- **Ruled paper:** very pale, widely spaced horizontal lines for explanations, vocabulary and reflection. Use behind generous whitespace, not behind dense formulas or input controls.
- **Squared/graph paper:** subtle grid for fluency, coordinate geometry, sketching or graph-related work. Axes plotted by interactive diagrams remain explicit; background squares must never be mistaken for graph scales.
- **Plain paper:** a calm, near-white/cream option for exam practice, multi-step calculations, dense solutions, accessibility needs and complex diagrams.
- **Index cards:** visually distinct card stock for Memorise flashcards, with front/back surfaces, slight shadow and an accessible non-motion flip alternative.
- **Sticky-note / annotation motifs:** small, purposeful, optional notes for hints, misconceptions, memory cues, glossary and teacher prompts. Never let notes occlude question text, answer inputs or graphs.
- **Bookmarks and stamps:** modest saved-position indicators, progress markers and awards that support learning, not visual noise.
- Prefer lightweight CSS gradients/borders and theme variables over heavy textures, downloaded background photographs or raster pages. A light tactile effect is enough.
- Paper lines and gridlines are **decorative** and should be omitted or strongly softened in print, high-contrast modes and dense interactive regions.

### Typography and colour
- Use highly legible UI and maths fonts, not handwritten fonts for question bodies. A slightly literary display face is optional for headings only; apply a reliable fallback.
- Prefer warm off-white surfaces, a neutral ink colour, muted book-edge shadows and clear but restrained tab colours.
- Ensure normal text and functional UI meet **WCAG 2.2 AA** contrast (at least 4.5:1 for normal text and 3:1 for large text); interactive boundaries, state indicators and focus treatment need suitable non-text contrast.
- Never depend on red/green alone to distinguish correct/incorrect answers or chapter states.
- Preserve conventional maths typography: visually correct fractions, superscripts, roots, symbols, axes labels and readable solutions.

## 4. Interaction and motion specification
Motion should support a sense of *opening and turning through pages*, never slow down practice.

| Interaction | Suggested treatment | Duration target |
| --- | --- | --- |
| Choose chapter (top tab) | Brief page-turn/curl suggestion, subtle shadow shift and content transition | ~180–300 ms |
| Choose subsection (side tab) | A lighter page slide/crossfade, not a full book turn | ~120–200 ms |
| Hover/focus tab | Tiny lift/edge highlight with immediate label | ~80–150 ms |
| Flip a flashcard | Card rotates to reveal its other face | ~250–400 ms |
| Reveal a note | Small slide/fade, no content obstruction | ~120–200 ms |
| Answer next question | **No page-turn**; immediate question change to preserve flow | Instant or minimal feedback transition |

Engineering constraints:
- Navigational state, URL and answer preservation must update promptly; never hold an input behind an animation.
- Animations should be interruptible (rapid tab switching), not queue up. They should not cause layout jumps, scroll drift or lost focus.
- Prefer transform/opacity animation; treat clip-path/3D page curls as progressive enhancement, not a rendering dependency.
- Respect `prefers-reduced-motion: reduce` by removing page turns, flips and transitions while preserving clear state changes. Also offer a visible **Motion: Reduced/Off** setting if feasible.
- No sounds by default. Avoid autoplay, parallax, persistent bobbing, flashing, confetti overload or time-critical motion.
- On transitions, maintain screen-reader announcements, sensible focus placement and accessible URLs/back navigation.

## 5. Responsive behaviour (non-negotiable)
**Desktop (>= 1024 px):** top chapter tabs attach to the page shell; side subsection tabs are visible on the right; one wide work area. Decorative cover/spine has a low space cost.

**Tablet (~768–1023 px):** adapt the tab system to available width; prefer compact chapter labels/a chapter picker when necessary; side tabs may become a labelled vertical menu or accessible subsection button.

**Mobile (320–767 px, test 320 and 390 px):** chapter navigation becomes a **single clear Chapter selector / Contents menu**, not eight squashed tabs or a horizontally scrolling strip. Subsections become a **Section picker** or accessible expandable list, not protruding tabs that steal text width. Retain warm paper, small tab accents, progress and page headers to carry the metaphor. The page uses nearly full available width for mathematical content.

Across breakpoints:
- No viewport-wide horizontal overflow caused by tabs, cover, shadows or paper margins.
- Tap targets target at least 44 × 44 CSS px where possible (minimum WCAG target sizing requirements).
- Maths-specific content can have intentional, labelled local horizontal scroll when unavoidable (e.g. a very wide table), never as the principal navigation strategy.
- Do not make key functions hover-only.
- Reflow navigation sensibly at 200% zoom and for long or translated labels.

## 6. Theme and content separation
The book appearance is a shared **theme system**, not HTML duplicated for every subject. Configure via semantic tokens (e.g. `--book-cover`, `--paper`, `--paper-ink`, `--paper-rule`, `--page-shadow`, `--tab-active`, `--focus-ring`) and stable component APIs.

Topic/site configuration may specify:
```json
{
  "appearance": {
    "theme": "modern-notebook",
    "accent": "teal",
    "defaultPage": "ruled",
    "pageByMode": {
      "understand": "ruled",
      "memorise": "plain",
      "fluency": "squared",
      "reasoning": "ruled",
      "problemSolving": "squared",
      "modelling": "plain",
      "games": "plain",
      "examPractice": "plain"
    },
    "motion": "system"
  }
}
```
Values are illustrative. Define a validated schema before accepting configuration. A theme can shift between cheerful younger-student stationery and restrained senior-study styling **without changing learning logic**.

Component candidates:
- `BookShell` (cover/paper, content sizing)
- `ContentsPage` (chapters, continue, bookmarks)
- `ChapterTabs` (primary desktop navigation)
- `SectionIndex` (secondary desktop navigation)
- `CompactBookNavigation` (tablet/mobile menus)
- `PaperPage` (plain/ruled/squared)
- `PageTransition` (progressively enhanced and reduced-motion aware)
- `StickyNote`, `Bookmark`, `ProgressStamp`, `FlipIndexCard`

The application should provide a *usable static/no-JS failure message* where appropriate. Decorative stationery is never required for a valid answer.

## 7. Visual prototype required before full implementation
**Pass 1A — Book shell visual proof:** implement a prototype with realistic placeholder content for both a vocabulary-heavy and an algebra/graph-heavy topic. Demonstrate:
1. Contents page and chapter tabs;
2. Memorise with side tabs, a flipping flashcard and a language-game placeholder;
3. a wide interactive maths workspace with a graph or equations;
4. page-turn and subsection transitions including reduced-motion;
5. desktop (1440 px), tablet (~768 px), mobile (390 and 320 px), keyboard and focus;
6. plain, ruled and squared paper variants.

**Pass 1B — Production shell:** after visual proof, integrate validated topic configuration, routes/deep links/back navigation, local progress foundation and automated tests. Do not build the entire activity library before the shell design is proven.

## 8. Acceptance / QA checklist for Pass 1
- [ ] The UI visibly resembles a modern notebook/reference book without looking like a flat generic dashboard.
- [ ] Top chapter tabs and right-side subsection tabs are clearly functional and visibly selected at desktop widths.
- [ ] Hiding a mode/subsection removes its corresponding tab cleanly with stable ordering.
- [ ] The Contents page links to all active chapters, can resume work and supports bookmarks.
- [ ] Paper styles vary by configured activity while keeping question/solution text high contrast.
- [ ] A complete mathematical expression, wide graph, working area and keyboard input fit without visual clipping.
- [ ] Page transitions work and can be interrupted; repeated practice does not trigger distracting page turns.
- [ ] Reduced-motion users see instant, comprehensible state changes; no required 3D gesture.
- [ ] Keyboard tab order, visible focus, active-state announcements and browser back/forward are correct.
- [ ] 320/390/768/1024/1440 px layouts are checked; no primary-navigation horizontal scroll or obscured work area.
- [ ] Automated accessibility and smoke checks cover theme and nav; high-contrast and print fallbacks work.
- [ ] Core interactions remain understandable if the tactile CSS styling is unavailable.

## 9. What not to do
- Don't copy an exact physical book photograph or scan as the website background.
- Don't force an animated page flip for every answer, dialog or activity.
- Don't use tiny diagonal/vertical text labels as the only way to navigate.
- Don't push graphs or text into narrow columns to preserve a decorative spine.
- Don't let the aesthetics make all Maths modes look or behave identically.
- Don't hard-code A Level assessment objectives into the shared tabs.

**Reference:** Two user-supplied photos of physical book index tabs (one with large edge dividers; one with many small index labels), provided in the October 2026 design discussion. They are inspiration only, not required site assets.
