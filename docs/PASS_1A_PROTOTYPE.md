# Pass 1A — Interactive Notebook Visual Prototype

**Status:** functioning prototype for design review, not a production learning platform.

## Purpose
Prove the shared book/notebook UI before developing the reusable mathematical question and assessment engines.

The prototype is deliberately **static-host compatible** and has no app framework, backend, sign-in or production data dependency. It runs as ordinary index.html, CSS and JavaScript modules, suitable for deployment from a GitHub Pages subdirectory. Paths are relative and all decorative effects are CSS or SVG.

## Demonstration books

| Topic | Character | Chapter configuration |
| --- | --- | --- |
| Sampling Methods | terminology, precise language, different selection methods | Understand, Memorise, Reasoning, Games |
| Quadratic Functions | algebra, graphs, exploring parameter changes | Understand, Memorise, Fluency, Problem Solving, Modelling, Games |

Changing topics demonstrates that unavailable chapters disappear cleanly, rather than yielding broken or empty navigation.

## Completed interactions
- **Contents:** physical-book-style cover; active chapter list; sensible links; local preview bookmarks and resume.
- **Desktop:** pastel chapter tabs on the **top edge** of the book; sticky-note subsection index tabs down the **right edge**.
- **Mobile/tablet:** native, labelled chapter and section selectors replace the physical tabs (not a forced horizontally scrolling navigation strip).
- **Paper styles:** plain, ruled and squared variants; substantive maths graphs use explicit axes and labels.
- **Motion:** brief chapter/page animations and physical 3D flashcard flips, respecting system reduced motion plus user override.
- **Memorise:** usable flip cards, rating buttons, whole-deck browser; keyboard-selectable Match Up; typed Missing Words.
- **Maths workspace:** an interactive quadratic graph with controls for coefficient magnitude and vertex location, plus an opening-direction toggle. The graph and formula update immediately.
- **Games:** a separately styled shelf of clearly **labelled previews**, not misleading clickable games.
- **Study pages:** topic-specific explanations, method comparisons, reflection questions and authored answer reveals.

## Explicitly deferred to future passes
The examples are a carefully limited *prototype bank*, not complete or exam-audited course content. Persistent progress/mastery, automatic activity registration, full learning modules, advanced answer equivalence, multiplayer, awards, game engines, exam practice, authoring tools and configurable themes are **not** implemented. Current bookmarks and last-page links use a small, namespaced local-storage preview only.

## Local review
Run the development preview:

    node scripts/serve.mjs

Open http://127.0.0.1:4173. To run checks:

    npm install
    npm run check
    npx playwright install chromium
    npm run test:browser

The static site works without the npm dependencies: they are used for browser testing only.

## QA requirements / review matrix

| Area | Evidence |
| --- | --- |
| Chapter navigation | Active top tab; side subsection tabs; deep links and browser back |
| Dynamic tabs | Sampling vs Quadratics uses different visible chapters |
| Memorise | Flipping cards, self-rating, matching, fill-the-blank |
| Mathematics | Coherent equation, real SVG curve, labelled axes and vertex |
| Page aesthetics | Cover, page shadow, pale ruled/squared/plain backgrounds, notes |
| Motion | Brief distinct chapter vs subsection animations; off/reduced alternatives |
| Keyboard | Actual links/buttons/selects and visible focus |
| Responsive | Explicit browser assertions at 320, 390, 768, 1024 and 1440 pixels |
| Reliability | Node syntax/unit tests and Chromium Playwright tests |
| Data privacy | No student account, tracking service or cross-device data storage |

Do not judge Pass 1A as finished merely because the visuals look good; both validation and browser checks must pass. Test real student workspaces at wide and narrow screens.

## Next steps
**Pass 1B:** build the production topic/content schema, proper bookmarks + progress foundation, robust route state and authored-activity adapters. Keep page styles optional and preserve maths-first readability.
