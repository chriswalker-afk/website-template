import {UNDERSTAND_CONTENT} from './understand-content.js';
import {FLUENCY_CHAPTERS} from './fluency-engine.js';
import {REASONING_CHAPTERS} from './reasoning-content.js';

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
    problemSolving:[
      level(1,'Guided','Solve unfamiliar problems with prompts that help you choose a strategy.',
        practice('two-conditions',
          q('A quadratic has roots 2 and 5, and its y-intercept is 20. Find its equation.','Write y = a(x − 2)(x − 5). At x = 0, 20 = 10a, so a = 2. Thus y = 2(x − 2)(x − 5).','Start with a factorised quadratic using the two roots.',5)
        ),practice('unknown-coefficient',
          q('The curve y = x² + bx + 12 crosses the x-axis at x = 3. Find b and the other root.','At x = 3: 0 = 9 + 3b + 12, so b = −7. Then x² − 7x + 12 = (x − 3)(x − 4), so the other root is 4.','Substitute the known root into y = 0.',5)
        )),
      level(2,'Developing','Link more than one quadratic property without a specified method.',
        practice('conditions',
          q('A parabola has turning point (2, −3) and passes through (0, 5). Find its equation.','y = a(x − 2)² − 3. Using (0, 5): 5 = 4a − 3, so a = 2. Hence y = 2(x − 2)² − 3.','Use completed-square form.',5)
        )),
      level(3,'Independent','Choose and combine methods without guided steps.',
        practice('parameters',
          q('The quadratic x² − (k + 2)x + 9 = 0 has equal real roots. Find all possible values of k.','D = (k + 2)² − 36 = 0, so k + 2 = ±6 and k = 4 or k = −8.','',5)
        )),
      level(4,'Challenge','Investigate a more demanding problem and justify the result.',
        practice('always-positive',
          q('Find the set of real values of m for which x² − 4x + m is strictly positive for every real x.','Complete the square: (x − 2)² + m − 4. The minimum is m − 4, which must be positive, so m > 4.','',6)
        ))
    ],
    modelling:[
      level(1,'Guided','Use a supplied quadratic model and interpret the result.',
        practice('arch',
          q('An arch is modelled by h(x) = −(x − 3)² + 9, with x and h in metres. Find its maximum height and horizontal position. State one limitation of the model.','The maximum is 9 m at x = 3 m. The equation assumes the arch follows an exact parabola and neglects thickness or irregularities.','Use the completed-square form and interpret both coordinates.',5)
        )),
      level(2,'Structured','Create a model from given information and explain its assumptions.',
        practice('ball',
          q('The height of a ball is modelled by h(t) = −5t² + 20t + 1, where t is seconds. Find the maximum modelled height and time, then state the time interval for which the model makes physical sense.','h(t) = −5(t − 2)² + 21, so the maximum is 21 m at t = 2 s. The physically meaningful time runs from t = 0 until the positive root of h(t) = 0: t = (20 + √420)/10 ≈ 4.05 s.','Complete the square; then solve h(t) = 0.',6)
        )),
      level(3,'Independent','Formulate a quadratic model and evaluate how well it represents a situation.',
        practice('tunnel',
          q('A symmetric parabolic tunnel opening is 8 m wide at ground level and 6 m high at its centre. With x measured from the centre, find a quadratic model and estimate the height 2 m from the centre. State a limitation.','With vertex (0, 6), h = ax² + 6. At x = 4, h = 0, so 16a + 6 = 0 and a = −3/8. Thus h(x) = 6 − (3/8)x². At x = 2, h = 4.5 m. The real shape may not be an exact parabola.','',7)
        )),
      level(4,'Extended','Test a model, explain its weaknesses and suggest improvements.',
        practice('fountain',
          q('A water jet is modelled by h(x) = −0.5(x − 4)² + 8 (metres). A measured point is (6, 5.5). Calculate the predicted height there, find the residual (measured − predicted), and discuss whether one reading is enough to judge the model.','The prediction is h(6) = −0.5(2)² + 8 = 6 m. The residual is 5.5 − 6 = −0.5 m. One reading cannot establish the overall fit; take multiple measurements, consider uncertainty, and inspect residuals across the range.','',8)
        ))
    ],
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
