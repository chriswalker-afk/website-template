// Authored demonstration data. Pass 1B will introduce a validated external content schema.
export const CHAPTER_LIBRARY = Object.freeze([
  {id:'understand',label:'Understand',short:'Understand',color:'#d2a46d',description:'See the big idea',icon:'eye'},
  {id:'memorise',label:'Memorise',short:'Memorise',color:'#6f9d99',description:'Make it stick',icon:'layers'},
  {id:'fluency',label:'Fluency',short:'Fluency',color:'#97b27f',description:'Build confidence',icon:'pen'},
  {id:'reasoning',label:'Reasoning',short:'Reasoning',color:'#b38da8',description:'Explain and justify',icon:'spark'},
  {id:'problemSolving',label:'Problem Solving',short:'Problems',color:'#c18c76',description:'Find a way through',icon:'puzzle'},
  {id:'modelling',label:'Modelling',short:'Modelling',color:'#80a0bc',description:'Explore real situations',icon:'grid'},
  {id:'games',label:'Games',short:'Games',color:'#b6a36f',description:'Play with purpose',icon:'spark'},
  {id:'examPractice',label:'Exam Practice',short:'Exam',color:'#898c9f',description:'Put it all together',icon:'pen'}
]);

export const TOPICS = Object.freeze({
  sampling: {
    id:'sampling',
    title:'Sampling Methods',
    coverTitle:'The art of choosing fairly.',
    strapline:'A little vocabulary can change the way you see data.',
    subject:'STATISTICS · VOCABULARY & IDEAS',
    mark:'01',
    paper:'ruled',
    chapters:{
      understand:[{id:'big-idea',label:'The big idea'},{id:'methods',label:'Compare methods'}],
      memorise:[{id:'flashcards',label:'Flashcards'},{id:'match-up',label:'Match Up'},{id:'missing-words',label:'Missing Words'}],
      reasoning:[{id:'choose',label:'Which method?'},{id:'evaluate',label:'Evaluate'}],
      games:[{id:'arcade',label:'Games shelf'}]
    },
    cards:[
      {id:'census',term:'Census',definition:'Collecting information from every member of the population.'},
      {id:'sample',term:'Sample',definition:'A subset of the population selected for investigation.'},
      {id:'stratified',term:'Stratified sampling',definition:'Dividing a population into groups and taking a random sample from each group in proportion to its size.'},
      {id:'systematic',term:'Systematic sampling',definition:'Selecting units at regular intervals from a suitably arranged sampling frame after a random start.'},
      {id:'simple-random',term:'Simple random sample',definition:'A sample in which every possible group of the specified size has an equal chance of being chosen.'},
      {id:'sampling-frame',term:'Sampling frame',definition:'A list or other source that identifies the members of the population from which a sample may be drawn.'}
    ],
    cloze:{before:'A list of all the population members from which a sample can be drawn is called a ',answer:'sampling frame',after:'.',hint:'Two words. It describes the source list, not the individuals chosen.'},
    bookNote:'Definitions are tools for making precise decisions, not just words to memorise.',
    intro:{
      eyebrow:'LOOK CLOSER',
      title:'One population. Many ways to choose.',
      body:'Imagine you want to know how students travel to school. Asking everybody is a census; choosing only some students gives a sample. The way you choose that sample affects what you can reasonably conclude.',
      kicker:'The question to keep asking',
      question:'Who could be missed by this method — and why?',
      exampleTitle:'Try a thought experiment',
      example:'A school has 600 students across three year groups. Selecting 20 students at random from each group is not necessarily a proportional stratified sample. The group sizes matter.'
    },
    details:{
      methods:{title:'Similar names, different rules',intro:'Look for the selection rule, not merely the phrase “random”.',panels:[
        {label:'Simple random',text:'Choose a fixed-size group so each possible group has the same chance.'},
        {label:'Systematic',text:'Random starting position, then a fixed interval.'},
        {label:'Stratified',text:'Split into strata, then sample each stratum in proportion to its size.'}
      ]},
      choose:{title:'Which method fits?',intro:'A researcher randomly chooses a starting name from an ordered list and then selects every 12th name.',question:'What sampling method is being used?',answer:'Systematic sampling — the fixed interval is the decisive feature.'},
      evaluate:{title:'Think about fairness',intro:'A study of school meals surveys only students in the library at lunchtime.',question:'What is the main risk?',answer:'Opportunity sampling may exclude students who do not visit the library, producing a biased picture of the whole school.'}
    }
  },
  quadratics: {
    id:'quadratics',
    title:'Quadratic Functions',
    coverTitle:'Every curve tells a story.',
    strapline:'Discover how changing a number can reshape a whole graph.',
    subject:'ALGEBRA · SYMBOLS & GRAPHS',
    mark:'02',
    paper:'squared',
    chapters:{
      understand:[{id:'big-idea',label:'The big idea'},{id:'forms',label:'Useful forms'}],
      memorise:[{id:'flashcards',label:'Flashcards'},{id:'match-up',label:'Match Up'},{id:'missing-words',label:'Missing Words'}],
      fluency:[{id:'graph-lab',label:'Graph explorer'},{id:'practice',label:'Practice page'}],
      problemSolving:[{id:'strategy',label:'Choose a strategy'}],
      modelling:[{id:'model-lab',label:'Model a curve'}],
      games:[{id:'arcade',label:'Games shelf'}]
    },
    cards:[
      {id:'quadratic',term:'Quadratic function',definition:'A polynomial function of degree two, often written f(x) = ax² + bx + c with a ≠ 0.'},
      {id:'turning-point',term:'Turning point',definition:'The point on a quadratic graph where it changes from decreasing to increasing or vice versa.'},
      {id:'symmetry',term:'Axis of symmetry',definition:'The vertical line through the turning point that divides a parabola into mirror-image halves.'},
      {id:'discriminant',term:'Discriminant',definition:'The quantity b² − 4ac, which determines the number of distinct real roots of ax² + bx + c = 0.'},
      {id:'roots',term:'Roots',definition:'The x-values at which the function equals zero, shown as the x-intercepts of the graph.'},
      {id:'completed-square',term:'Completed-square form',definition:'The form a(x − h)² + k, which reveals a quadratic’s turning point (h, k).'}
    ],
    cloze:{before:'The vertical line through the turning point of a parabola is its ',answer:'axis of symmetry',after:'.',hint:'Three words; think of a line of reflection.'},
    bookNote:'Try changing one parameter at a time. Notice what moves — and what stays the same.',
    intro:{
      eyebrow:'LOOK CLOSER',
      title:'A function you can see.',
      body:'A quadratic changes direction at its turning point. Changing the coefficient in front of the squared term stretches, narrows or reflects the curve. Other parameters move the turning point.',
      kicker:'The question to keep asking',
      question:'Which parts of the graph change when I change just one parameter?',
      exampleTitle:'Try the completed-square form',
      example:'For y = 2(x − 1)² − 3, the turning point is (1, −3), the axis of symmetry is x = 1, and the parabola opens upwards.'
    },
    details:{
      forms:{title:'Three ways to write a quadratic',intro:'The form you choose can reveal a useful feature immediately.',panels:[
        {label:'Expanded',text:'ax² + bx + c makes the y-intercept easy to identify.'},
        {label:'Factorised',text:'a(x − p)(x − q) displays the roots when real factorisation is possible.'},
        {label:'Completed square',text:'a(x − h)² + k displays the turning point (h, k).'}
      ]},
      practice:{title:'A page to work on',intro:'For y = 2(x − 1)² − 3, identify the turning point and state whether it is a maximum or minimum.',question:'What are the coordinates and why?',answer:'(1, −3) is a minimum because the coefficient of the squared term is positive.'},
      strategy:{title:'Which form helps?',intro:'You need the roots of y = x² − 5x + 6. Choosing a helpful form can save several lines of working.',question:'What is your first move?',answer:'Factorise: x² − 5x + 6 = (x − 2)(x − 3). The roots are 2 and 3.'}
    }
  }
});
export const DEFAULT_TOPIC='sampling';
