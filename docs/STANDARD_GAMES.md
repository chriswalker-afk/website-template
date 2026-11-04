# Standard topic games — reusable collection

The template includes three playable games. Mathematics comes from a
teacher-reviewed topic question/answer bank. The engines are shared and
the topic decides which games to enable.

## The three games

**Loop Cards (domino loop).** Eight cards form a closed cycle. Each card
shows a question and the answer to the *preceding* card. The starting card
is fixed to avoid ambiguous rotations. Students select seven shuffled
cards and check that the question on each card matches the answer on the
next, including the last linking back to the first. Incorrect loops report
how many connections are wrong without displaying the solution. Cards can
be returned to the tray or moved earlier/later in the loop by touch,
mouse or keyboard.

**Concentration.** Eight questions and their eight answers are placed face
down in a shuffled grid. Students flip two cards. Only one question and its
corresponding answer make a pair. There are solo and local two-player modes.
Each match scores one point and keeps the turn; a mismatch remains visible
until Continue is pressed, then the other player takes a turn.

**Hex Crossing (Blockbusters-style).** A 5-by-5 staggered hex board is
shared by two local players. Player 1 (Forest) connects left to right;
Player 2 (Gold) connects top to bottom. A correct answer claims an unowned
hexagon; a wrong answer leaves it available and shows the correct answer.
Input-format errors do not consume the turn. A true six-neighbour hex
search checks for a connected winning path.

All three are session-only and seed-reproducible; there are no accounts,
timers, networking or remote scores.

## Adding standard games to any topic

1. Add reviewed cards in the topic's game-pairs.js file. Each pair has
   a unique slug ID, question, answerDisplay, answer and optional
   level ('core' or 'challenge').

       export const gamePairs=Object.freeze([
         {
           id:'horizontal-line',
           question:'What is the gradient of a horizontal line?',
           answerDisplay:'0',
           answer:{kind:'number',values:[0],label:'Enter one number.'},
           level:'core'
         },
         // At least seven more distinct answers
       ]);

   A convenience constructor is available for numbers:

       import {numericalGamePair} from '../../games/contracts.js';
       const card=numericalGamePair(
         'rise-three',
         'A line moves 4 squares right and 12 up. Find the gradient.',
         3
       );

   The existing reviewed vocabulary cards can become question/term pairs
   automatically, avoiding duplicate authoring:

       import {cards} from './memorise.js';
       import {vocabularyGamePairs} from '../../games/contracts.js';
       export const gamePairs=Object.freeze(vocabularyGamePairs(cards));

2. Register the pairs alongside the topic's existing question bank:

       import {gamePairs} from './game-pairs.js';
       export const questionBank=Object.freeze({
         schemaVersion:1,
         fluency:fluencyFamilies,worksheet:worksheetFamilies,scaffolds,
         games:{schemaVersion:1,pairs:gamePairs}
       });

3. Set up games.js to use the shared sections:

       import {standardGameSections} from '../../games/sections.js';
       export const games=standardGameSections();

   Alternatively, choose only the games you need:

       export const games=standardGameSections(['loop-cards','concentration']);

4. Enable the Games mode in manifest.modes.games, and include games in
   authoring.plannedModes if applicable. A new Topic Creator scaffold
   includes an empty game-pairs.js and instructions in games.js, but
   games remain disabled until reviewed.

## Question and answer contracts

- **Eight unique answers** are necessary to produce an unambiguous loop.
  Duplicate displayed answer text, mathematically equivalent answers of
  the same checkable kind, and overlapping accepted text aliases are
  rejected at publication. There must also be at least eight
  non-challenge cards so Core mode is playable.
- Each question needs a unique slug ID and concise, reviewed wording.
- Numerical, ordered and unordered values use the site's existing
  numerical checker. Exact fractions, polynomial expressions, equations,
  single inequalities, interval, coordinate and set types use Pass 2's
  limited exact checker. Unsupported advanced mathematics is not graded.
- Text terms use explicit, reviewed aliases only. For example:

       answer:{
         kind:'text',value:'Systematic sampling',
         accepted:['Systematic sampling']
       }

  Matching is case-insensitive and normalises whitespace, but does not
  guess spelling or accept arbitrary synonyms.
- Core and Include Challenge settings select cards from the same topic
  bank. A new shuffle changes the seed; Restart reproduces the same deck.
- Do not feed unrelated random Fluency problems into the domino game
  without checking uniqueness and clarity: identical numerical answers
  would create competing possible links.

## Checking and publishing

Run the existing repository checks:

    npm run check
    npm run audit:topic -- --topic gradient --strict
    npm run test:latex
    npm run test:browser

The Gradient demonstration provides:

- #/gradient/games/loop-cards
- #/gradient/games/concentration
- #/gradient/games/hex-crossing

Sampling and Quadratics also have those games, using reviewed vocabulary
questions. Existing non-functional game previews remain clearly labelled
previews, rather than being silently removed.

The tests cover question/answer validation, deterministic generation,
loop closure and reordering, memory scoring, hex adjacency and connected
path wins, plus browser interaction, keyboard and narrow-screen layouts.

The quality gate cannot independently prove a mathematical solution or
pedagogical suitability. Review every question, hint, answer, alias,
difficulty and any anticipated misconceptions before publishing.

## Possible later refinements

A cut-out printable loop-card sheet, projector/class scoreboards, subskill
filters, larger hex boards, and a teacher game-deck preview in the
Question Workshop could be added without changing the topic-bank format.
