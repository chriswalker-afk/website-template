import {DEMO_CHAPTERS} from './mode-content.js';
import {CLOZE_BANK} from './memorise-content.js';

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
      {id:'simple-random',term:'Simple random sample',definition:'A sample in which every possible group of the specified size has an equal chance of being chosen.',aliases:['Simple random sampling']},
      {id:'sampling-frame',term:'Sampling frame',definition:'A list or other source that identifies the members of the population from which a sample may be drawn.'},
      {id:'population',term:'Population',definition:'The entire group of individuals or units about which a statistical investigation seeks information.'},
      {id:'stratum',term:'Stratum',definition:'One distinct group into which a population is divided for stratified sampling.'},
      {id:'sampling-interval',term:'Sampling interval',definition:'The fixed number of list positions between units selected in a systematic sample.'},
      {id:'selection-bias',term:'Selection bias',definition:'A systematic distortion caused when some members of the target population are more likely than others to be included.'},
      {id:'quota',term:'Quota sampling',definition:'Choosing individuals non-randomly until specified category targets have been reached.'},
      {id:'opportunity',term:'Opportunity sampling',definition:'Selecting people who are readily available to the investigator.',aliases:['Convenience sampling']}
    ],
    clozes:CLOZE_BANK.sampling,
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
      {id:'turning-point',term:'Turning point',definition:'The point on a quadratic graph where it changes from decreasing to increasing or vice versa.',aliases:['Vertex']},
      {id:'symmetry',term:'Axis of symmetry',definition:'The vertical line through the turning point that divides a parabola into mirror-image halves.'},
      {id:'discriminant',term:'Discriminant',definition:'The quantity b² − 4ac, which determines the number of distinct real roots of ax² + bx + c = 0.'},
      {id:'roots',term:'Roots',definition:'The x-values at which the function equals zero, shown as the x-intercepts of the graph.',aliases:['Zeros']},
      {id:'completed-square',term:'Completed-square form',definition:'The form a(x − h)² + k, which reveals a quadratic’s turning point (h, k).'},
      {id:'parabola',term:'Parabola',definition:'The U-shaped or inverted U-shaped curve that forms the graph of a quadratic function.'},
      {id:'leading-coefficient',term:'Leading coefficient',definition:'The non-zero coefficient a of x² in ax² + bx + c.'},
      {id:'y-intercept',term:'Y-intercept',definition:'The point where the graph crosses the y-axis; for ax² + bx + c it has coordinates (0, c).'},
      {id:'factorised-form',term:'Factorised form',definition:'A quadratic written as a product, such as a(x − p)(x − q), showing real roots p and q when this factorisation exists.',aliases:['Factored form']},
      {id:'minimum',term:'Minimum',definition:'The smallest value of a quadratic with a positive leading coefficient, reached at its turning point.'},
      {id:'maximum',term:'Maximum',definition:'The largest value of a quadratic with a negative leading coefficient, reached at its turning point.'}
    ],
    clozes:CLOZE_BANK.quadratics,
    cloze:{before:'The vertical line through the turning point of a parabola is its ',answer:'axis of symmetry',after:'.',hint:'Three words; think of a line of reflection.'},
  }
});
export const DEFAULT_TOPIC='sampling';
