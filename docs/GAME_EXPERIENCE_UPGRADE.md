# Game Experience Upgrade — single-screen mathematics arcade

The three reusable standard games now open in a **focused playing view** by
default. The book/navigation remains available via **Back to book**, and
**Focus play** returns to the compact, single-screen game. On large and small
screens the board, primary controls and feedback share one playing surface.
The live content still comes from the existing topic-owned \`game-pairs.js\`
banks, so new topics require no game-specific rendering code.

## Concentration

- An incorrect question/answer pair remains face-up for **exactly five
  seconds**, then turns face-down automatically. In two-player mode, that
  is when the turn changes. There is no extra Continue click.
- The countdown only starts when the second incorrect card is chosen.
  Reopening the question history or taking notes **does not restart it**.
  Changing game difficulty, choosing a new set or restarting cancels any
  pending countdown, avoiding a delayed flip of a different deck.
- The right-hand **Questions I've seen** margin records each player's
  previously flipped **question** cards (not unseen answers). Player
  1 / Player 2 tabs show separate histories, and each question has its
  own short scratchpad for working out the answer.
- The review margin does **not** reveal hidden answers. A player can
  keep their previous question selected and type working while the next
  player is flipping cards; their notes and focus survive game updates.
  Notes are held in this browser's game session only and reset with
  the game. The UI does not save or send them.
- The recently flipped cards are also visible in the margin at a larger
  reading size, while the 4×4 grid stays on screen.

## Hex Crossing

- Numerical and exact-maths questions open using the site's existing
  mathematical notation editor, including a fraction palette and
  MathLive when available.
- The entered LaTeX is passed through the same bounded numerical/exact
  mathematics checker already used in Fluency. Students can switch to
  simple typing; vocabulary questions retain the normal text field.
- The current question/input and hex board occupy adjacent panels on
  desktop and stacked panels within the viewport on small screens.
- Mathematical notation is an input aid, not a new claim of full symbolic
  equivalence. Unsupported expressions still receive the normal
  feedback.

## Loop Cards — physical closed cycle

- Eight cards are visibly arranged around a **clockwise ring** with
  corners, directional arrows and an explicit link from last to start.
  The first position is fixed as an anchor.
- Move cards by **drag-and-drop** with a mouse, or dragging a touch/stylus
  card onto a ring position. To avoid reliance on dragging, users can
  **tap or press Enter on a card**, then tap/Enter a destination.
- Dropping a card onto an occupied position **swaps** the two cards;
  moving a card from the hand onto an occupied position returns the
  displaced card to the hand.
- The central reading area displays the selected card and explains how
  to close the loop. All eight positions, the remaining card hand,
  Check loop and the feedback are in the same play view.
- The mathematical loop rules and the topic answer bank are unchanged;
  every link is still validated, including the return to the first card.

## Quality and accessibility

- All previous question decks, game scoring and course topics are retained.
- Focus mode can be exited without losing the in-session game or notes.
- Keyboard/tap alternatives, accessible card labels and distinct
  player scores are retained.
- Browser tests check the ring layout, drag/drop, keyboard placement,
  an actual mathematical fraction input, the 5-second flip timer,
  independent seen-question histories/notes and mobile containment.
- Mathematical question banks are still subject to the existing strict
  topic validation and teacher review.

To test on the reusable Gradient topic:

- \`#/gradient/games/loop-cards\`
- \`#/gradient/games/concentration\`
- \`#/gradient/games/hex-crossing\`

Run \`npm run check\`, \`npm run test:browser\`, and
\`npm run audit:topic -- --topic gradient --strict\` before merging.
