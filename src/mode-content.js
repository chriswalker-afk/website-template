import {UNDERSTAND_CONTENT} from './understand-content.js';
import {FLUENCY_CHAPTERS} from './fluency-engine.js';
import {REASONING_CHAPTERS} from './reasoning-content.js';
import {PROBLEM_SOLVING_CHAPTERS} from './problem-solving-content.js';
import {MODELLING_CHAPTERS} from './modelling-content.js';

// Demonstration *content*, not a second navigation system.
// Modes → subsections (right tabs) → pages (bottom controls).
// A self-contained game or retrieval activity normally has exactly one page.
const section=(id,label,description,pages)=>({id,label,description,pages});
const practice=(id,...problems)=>({id,type:'questions',problems:problems.map((p,i)=>({id:'q'+(i+1),...p}))});
const q=(prompt,solution,hint='',marks=3)=>({prompt,solution,hint,marks});
const one=(type)=>[{id:'main',type}];
const game=(id,objective,mechanic)=>[{id:'main',type:'game',gameId:id,objective,mechanic}];
const level=(n,label,description,...pages)=>section('level-'+n,'Level '+n+': '+label,description,pages);

export const DEMO_CHAPTERS = Object.freeze({
  sampling:{
    understand:UNDERSTAND_CONTENT.sampling,
    memorise:[
      section('flashcards','Flashcards','Recall each definition before flipping the card and rating your recall.',one('flashcards')),
      section('match-up','Match Up','Match mathematical terms to their precise definitions.',one('match-up')),
      section('missing-words','Missing Words','Complete statements by retrieving the correct term.',one('missing-words')),
      section('speed-recall','Speed Recall','Type the term that matches each definition.',one('speed-recall')),
      section('review-all','Review All','Browse the full vocabulary deck and its definitions.',one('review-all'))
    ],
    fluency:FLUENCY_CHAPTERS.sampling,
    reasoning:REASONING_CHAPTERS.sampling,
    problemSolving:PROBLEM_SOLVING_CHAPTERS.sampling,
    modelling:MODELLING_CHAPTERS.sampling,
    games:[
      section('sprint','Sprint','Answer a sequence of short questions against the clock, or play untimed.',
        game('sprint','Complete as many correct questions as possible in one round.','Rounds, scores and optional timers are planned for the Games pass.')),
      section('puzzle-quest','Puzzle Quest','Solve connected challenges to unlock the next stage.',
        game('puzzle-quest','Use sampling clues to solve a sequence of puzzles.','Stages and unlocks are planned for the Games pass.')),
      section('sort-discover','Sort & Discover','Sort statements into the right sampling method or category.',
        game('sort-discover','Assign advantages and disadvantages to the correct methods.','Drag, touch and keyboard sorting are planned for the Games pass.'))
    ]
  },
  quadratics:{
    understand:UNDERSTAND_CONTENT.quadratics,
    memorise:[
      section('flashcards','Flashcards','Recall each definition before flipping the card and rating your recall.',one('flashcards')),
      section('match-up','Match Up','Match mathematical terms to their precise definitions.',one('match-up')),
      section('missing-words','Missing Words','Complete statements by retrieving the correct term.',one('missing-words')),
      section('speed-recall','Speed Recall','Type the term that matches each definition.',one('speed-recall')),
      section('review-all','Review All','Browse the full vocabulary deck and its definitions.',one('review-all'))
    ],
    fluency:FLUENCY_CHAPTERS.quadratics,
    reasoning:REASONING_CHAPTERS.quadratics,
    problemSolving:PROBLEM_SOLVING_CHAPTERS.quadratics,
    modelling:MODELLING_CHAPTERS.quadratics,
    games:[
      section('sprint','Sprint','Answer a sequence of short questions against the clock, or play untimed.',
        game('sprint','Complete as many correct quadratic questions as possible in one round.','Rounds, scores and optional timers are planned for the Games pass.')),
      section('puzzle-quest','Puzzle Quest','Solve connected challenges to unlock the next stage.',
        game('puzzle-quest','Use algebraic clues to open a sequence of locks.','Stages and unlocks are planned for the Games pass.')),
      section('curve-quest','Curve Quest','Investigate how quadratic graphs change in a playful challenge.',
        game('curve-quest','Make target parabolas by choosing coefficients.','Graph puzzles and scoring are planned for the Games pass.'))
    ]
  }
});
