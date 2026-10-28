import {DEMO_CHAPTERS} from './mode-content.js';

// Authored demonstration data. Pass 1B will introduce a validated external content schema.
export const CHAPTER_LIBRARY = Object.freeze([
  {id:'understand',label:'Understand',short:'Understand',color:'#d2a46d',description:'Explanations and examples',icon:'eye'},
  {id:'memorise',label:'Memorise',short:'Memorise',color:'#6f9d99',description:'Definitions and retrieval',icon:'layers'},
  {id:'fluency',label:'Fluency',short:'Fluency',color:'#97b27f',description:'Practise techniques',icon:'pen'},
  {id:'reasoning',label:'Reasoning',short:'Reasoning',color:'#b38da8',description:'Justify and evaluate',icon:'spark'},
  {id:'problemSolving',label:'Problem Solving',short:'Problem Solving',color:'#c18c76',description:'Unfamiliar problems',icon:'puzzle'},
  {id:'modelling',label:'Modelling',short:'Modelling',color:'#80a0bc',description:'Real-world applications',icon:'grid'},
  {id:'games',label:'Games',short:'Games',color:'#b6a36f',description:'Topic challenges',icon:'spark'},
  {id:'examPractice',label:'Exam Practice',short:'Exam',color:'#898c9f',description:'Questions and mark schemes',icon:'pen'}
]);

export const TOPICS = Object.freeze({
  sampling: {
    id:'sampling',
    title:'Sampling Methods',
    subject:'Statistics',
    paper:'ruled',
    chapters: DEMO_CHAPTERS.sampling,
    cards:[
      {id:'census',term:'Census',definition:'Collecting information from every member of the population.'},
      {id:'sample',term:'Sample',definition:'A subset of the population selected for investigation.'},
      {id:'stratified',term:'Stratified sampling',definition:'Dividing a population into groups and taking a random sample from each group in proportion to its size.'},
      {id:'systematic',term:'Systematic sampling',definition:'Selecting units at regular intervals from a suitably arranged sampling frame after a random start.'},
      {id:'simple-random',term:'Simple random sample',definition:'A sample in which every possible group of the specified size has an equal chance of being chosen.'},
      {id:'sampling-frame',term:'Sampling frame',definition:'A list or other source that identifies the members of the population from which a sample may be drawn.'}
    ],
    cloze:{before:'A list of all the population members from which a sample can be drawn is called a ',answer:'sampling frame',after:'.',hint:'Two words. It describes the source list, not the individuals chosen.'},
  },
  quadratics: {
    id:'quadratics',
    title:'Quadratic Functions',
    subject:'Algebra',
    paper:'squared',
    chapters: DEMO_CHAPTERS.quadratics,
    cards:[
      {id:'quadratic',term:'Quadratic function',definition:'A polynomial function of degree two, often written f(x) = ax² + bx + c with a ≠ 0.'},
      {id:'turning-point',term:'Turning point',definition:'The point on a quadratic graph where it changes from decreasing to increasing or vice versa.'},
      {id:'symmetry',term:'Axis of symmetry',definition:'The vertical line through the turning point that divides a parabola into mirror-image halves.'},
      {id:'discriminant',term:'Discriminant',definition:'The quantity b² − 4ac, which determines the number of distinct real roots of ax² + bx + c = 0.'},
      {id:'roots',term:'Roots',definition:'The x-values at which the function equals zero, shown as the x-intercepts of the graph.'},
      {id:'completed-square',term:'Completed-square form',definition:'The form a(x − h)² + k, which reveals a quadratic’s turning point (h, k).'}
    ],
    cloze:{before:'The vertical line through the turning point of a parabola is its ',answer:'axis of symmetry',after:'.',hint:'Three words; think of a line of reflection.'},
  }
});
export const DEFAULT_TOPIC='sampling';
