// Topic-specific game preview declarations (mechanics follow in a later pass).
import {section,game} from '../builders/sections.js';
export const games=[
      section('sprint','Sprint','Answer a sequence of short questions against the clock, or play untimed.',
        game('sprint','Complete as many correct questions as possible in one round.','Rounds, scores and optional timers are planned for the Games pass.')),
      section('puzzle-quest','Puzzle Quest','Solve connected challenges to unlock the next stage.',
        game('puzzle-quest','Use sampling clues to solve a sequence of puzzles.','Stages and unlocks are planned for the Games pass.')),
      section('sort-discover','Sort & Discover','Sort statements into the right sampling method or category.',
        game('sort-discover','Assign advantages and disadvantages to the correct methods.','Drag, touch and keyboard sorting are planned for the Games pass.'))
    ];
