// Author-reviewed Understand exemplars for both visual/algebraic and language/statistics topics.
// New topics can replace these data objects without changing the rendering components.
const section=(id,label,description,pages)=>({id,label,description,pages});
const lesson=(id,...blocks)=>({id,type:'lesson',blocks});
const text=value=>({kind:'text',text:value});
const diagram=(variant,caption)=>({kind:'diagram',variant,caption});
const note=value=>({kind:'note',text:value});
const comparison=(...pairs)=>({kind:'comparison',items:pairs.map(([label,description])=>({label,description}))});
const check=(id,prompt,choices)=>({kind:'concept-check',id,prompt,choices:choices.map(([id,label,feedback,correct=false])=>({id,label,feedback,correct}))});
const method=(id,prompt,steps)=>({kind:'stepper',id,prompt,steps});
const workshop=(id,model,guided,independent)=>({id,type:'workshop',model,guided,independent});
const graph=(id,focus)=>({id,type:'graph',focus});
const samplingLab=(id,focus,methods)=>({id,type:'sampling-lab',focus,methods});

export const UNDERSTAND_CONTENT = {
  sampling:[
    section('big-idea','The big idea',
      'Distinguish the population from a sample, and consider whether the sample represents the population.',
      [lesson('population',
        text('The population is the whole group about which we want information. A census collects data from every member; a sample collects data from only some members.'),
        diagram('sampling-dots','A population of 40 people, with eight highlighted in one possible sample.'),
        check('target-population','A school investigates how all Year 11 students travel to school. What is the population?',[
          ['surveyed','Only the students who answer the questionnaire.','Those students form the sample, not the population.'],
          ['all-year-11','Every Year 11 student in that school.','The population is the entire group the school wants to investigate.',true],
          ['whole-school','Every student in the school.','That is larger than the group specified in the investigation.']
        ])
      ),lesson('representativeness',
        text('A sample is representative when it reflects the relevant characteristics of its intended population. The way people are selected matters as much as the number selected.'),
        note('A large but biased sample can be less informative than a smaller sample selected appropriately.'),
        check('representative','A student surveys the first 30 people to arrive at school about their journey times. What is the main concern?',[
          ['time','It takes too little time to collect data.','Time alone does not tell us whether the sample is representative.'],
          ['selection','Late arrivals cannot be included.','Excluding late arrivals could distort the estimate of journey times.',true],
          ['thirty','The sample size must be an even number.','There is no requirement that a sample size be even.']
        ])
      )]),
    section('how-it-works','How it works',
      'Follow the selection steps and explain why each sampling method uses them.',
      [lesson('random-systematic',
        comparison(
          ['Simple random','Choose a fixed-size set so every possible set of that size has an equal chance of selection.'],
          ['Systematic','Choose a random starting position, then use a fixed interval through an ordered sampling frame.']
        ),
        method('systematic-steps','Select a systematic sample of 6 from an ordered list of 30 people.',[
          'Calculate the interval: 30 ÷ 6 = 5.',
          'Choose a random starting position between 1 and 5 inclusive.',
          'Select that person and every fifth person afterwards. A start at 3 gives positions 3, 8, 13, 18, 23 and 28.',
          'Check that six different people have been selected. Beware of patterns in the list that coincide with the interval.'
        ])
      ),lesson('stratified',
        text('In proportional stratified sampling, the population is divided into non-overlapping strata, then an appropriate random sample is drawn within each stratum.'),
        method('stratified-steps','A school has 150 Year 10 students and 250 Year 11 students. Allocate a sample of 40.',[
          'Calculate the population total: 150 + 250 = 400.',
          'Year 10: (150 ÷ 400) × 40 = 15.',
          'Year 11: (250 ÷ 400) × 40 = 25.',
          'Select 15 students randomly within Year 10 and 25 randomly within Year 11. Check that 15 + 25 = 40.'
        ]),
        check('strata','Why is selecting 20 students from each year group not a proportional stratified sample here?',[
          ['fixed','Equal numbers are always required for stratified sampling.','Proportional allocation depends on group sizes, not equal numbers.'],
          ['ratios','It gives the smaller year group too much weight.','Year 10 forms 150/400 of the population, not half.',true],
          ['total','It selects fewer than 40 students.','Twenty plus twenty is 40; the issue is the group proportions.']
        ])
      )]),
    section('visual-explanations','Visual explanations',
      'Explore actual selections from a population and compare how well different methods reflect its groups.',
      [samplingLab('census-sample',
        'Select 10 people from a population of 40, or examine the full census. Compare the selected groups with the population.',
        ['census','random','systematic','convenience']),
       samplingLab('proportion',
        'Compare simple random and proportional stratified samples. Do they always contain exactly the same mix of groups?',
        ['random','stratified'])]),
    section('worked-examples','Worked examples',
      'Follow a worked model, check a guided question, then attempt a similar question independently.',
      [workshop('systematic',
        {prompt:'An ordered list has 240 names. Describe how to select a systematic sample of 30.',steps:[
          'Find the interval: 240 ÷ 30 = 8.',
          'Use a random method to choose one starting position from 1 to 8.',
          'Take every eighth entry after that start. For example, start at 5: 5, 13, 21, …, 237.',
          'There are 30 selected entries; the random start prevents choosing the same positions by default.'
        ]},
        {prompt:'A list has 180 names. What interval gives a systematic sample of 20?',choices:[
          ['six','6','Multiply 6 by the required sample size to check.'],
          ['nine','9','180 ÷ 20 = 9, then choose a random starting position from 1 to 9.',true],
          ['twenty','20','That is the desired sample size, not the interval.']
        ]},
        {prompt:'A list contains 168 names. Describe how to select a systematic sample of 24.',hint:'Find the interval and state how the random starting position is chosen.',
          steps:['Interval = 168 ÷ 24 = 7.','Choose a random starting position between 1 and 7 inclusive.',
            'Take the starting entry and every seventh entry thereafter until 24 people have been selected.']}
      ),workshop('bias',
        {prompt:'A researcher questions only gym members to estimate exercise habits in a town. Evaluate this method.',steps:[
          'Identify the target population: residents of the town.',
          'Identify who is actually eligible: gym members only.',
          'Gym members may be more active than other residents, so the estimate could be biased upwards.',
          'Improve the sampling frame to cover town residents and select appropriately from that wider frame.'
        ]},
        {prompt:'Which limitation most affects a survey of school travel answered only by students who arrive early?',choices:[
          ['timing','It can exclude students with different travel times.','Early arrivals may not represent every student.',true],
          ['words','Travel times must always be rounded to whole hours.','Measurement precision is not the main selection issue.'],
          ['large','The entire school is automatically included.','Students who arrive later are excluded.']
        ]},
        {prompt:'A survey about lunch choices is conducted only at after-school sports training. Explain one possible bias and an improvement.',
          hint:'Consider which students never attend sports training.',
          steps:['The sample excludes students who do not attend sports training.',
            'Athletes may have different preferences from other students, so the findings may not represent the full school.',
            'Sample students from a school-wide frame rather than only the training session.']}
      )])
  ],
  quadratics:[
    section('big-idea','The big idea',
      'Recognise how a quadratic graph behaves and connect its algebra to its turning point.',
      [lesson('parabolas',
        text('A quadratic function has the form y = ax² + bx + c, where a ≠ 0. Its graph is a parabola with a single turning point.'),
        diagram('quadratic-static','The parabola y = (x − 1)² − 3 has a minimum at (1, −3).'),
        check('quadratic-term','Which expression is quadratic?',[
          ['linear','4x + 3','This is linear because the highest power is x¹.'],
          ['quadratic','2x² − x + 1','The highest power of x is 2 and the coefficient is non-zero.',true],
          ['cubic','x³ + 2','This is cubic because its highest power is x³.']
        ])
      ),lesson('shape',
        text('For y = a(x − h)² + k, the turning point is (h, k). The sign of a controls whether the parabola opens upwards or downwards; |a| controls its steepness.'),
        note('A negative a does not mean every y-value is negative: it means the turning point is a maximum.'),
        check('opening','Which function has a maximum turning point?',[
          ['positive','y = 2(x − 1)² + 4','Since a = 2, the curve opens upwards and has a minimum.'],
          ['negative','y = −(x − 1)² + 4','The coefficient of the squared term is negative, so it opens downwards.',true],
          ['positive-small','y = 0.5(x + 1)² − 4','A positive coefficient gives a minimum, even if the turning point has negative y-coordinate.']
        ])
      )]),
    section('how-it-works','How it works',
      'Identify features from each algebraic form and follow a method for finding a turning point.',
      [lesson('forms',
        comparison(
          ['Expanded','y = ax² + bx + c. The y-intercept is (0, c).'],
          ['Factorised','y = a(x − p)(x − q). The x-intercepts are (p, 0) and (q, 0), provided p and q are real.'],
          ['Completed square','y = a(x − h)² + k. The turning point is (h, k).']
        ),
        check('best-form','Which form most directly reveals the turning point?',[
          ['expanded','Expanded form','Expanded form is useful for the y-intercept; it does not directly display both vertex coordinates.'],
          ['square','Completed-square form','Read off h and k from a(x − h)² + k.',true],
          ['factored','Factorised form','Factorised form is especially useful for finding the roots.']
        ])
      ),lesson('translate',
        method('completing-square','Rewrite x² + 6x + 5 in completed-square form and find its turning point.',[
          'Take half of 6: this gives 3.',
          'Write x² + 6x + 5 = (x + 3)² − 9 + 5.',
          'Simplify: y = (x + 3)² − 4.',
          'The turning point is (−3, −4), a minimum because the coefficient of the square is positive.'
        ]),
        note('The sign inside the bracket is opposite to the x-coordinate of the turning point.')
      )]),
    section('visual-explanations','Visual explanations',
      'Change one parameter at a time and connect its effect to the graph and equation.',
      [graph('shape','Change a while keeping the turning point fixed. Predict the opening direction and steepness.'),
       graph('position','Move h and k while keeping a fixed. Predict how the turning point and symmetry line move.')]),
    section('worked-examples','Worked examples',
      'Reveal a model solution, check the next technique, then solve a similar problem independently.',
      [workshop('turning-point',
        {prompt:'Find the turning point and its type for y = −2(x + 1)² + 5.',steps:[
          'Compare with y = a(x − h)² + k. Here a = −2, h = −1 and k = 5.',
          'The turning point is (−1, 5); the axis of symmetry is x = −1.',
          'Because a < 0, the parabola opens downwards, so (−1, 5) is a maximum.'
        ]},
        {prompt:'What is the turning point of y = 3(x − 4)² − 2?',choices:[
          ['wrong-sign','(−4, −2)','The form x − h gives h = 4, not −4.'],
          ['correct','(4, −2), a minimum','Here h = 4, k = −2 and a > 0.',true],
          ['wrong-y','(4, 2), a maximum','k = −2, and a positive coefficient opens upwards.']
        ]},
        {prompt:'Find the turning point and its type for y = −(x + 2)² + 7.',
          hint:'Write x + 2 as x − (−2); check the sign of a.',
          steps:['a = −1, h = −2 and k = 7.','The turning point is (−2, 7) and the axis of symmetry is x = −2.',
            'Since a < 0, the point is a maximum.']}
      ),workshop('roots',
        {prompt:'Solve x² − 5x + 6 = 0 by factorising.',steps:[
          'Find two integers with sum −5 and product 6: −2 and −3.',
          'Factorise: (x − 2)(x − 3) = 0.',
          'Set each factor equal to zero: x − 2 = 0 or x − 3 = 0.',
          'Therefore x = 2 or x = 3.'
        ]},
        {prompt:'For x² − 7x + 12 = 0, which factorisation is correct?',choices:[
          ['wrong-plus','(x + 3)(x + 4)','These factors would produce a positive coefficient of x.'],
          ['correct','(x − 3)(x − 4)','Correct: −3 + (−4) = −7 and (−3)(−4) = 12.',true],
          ['wrong-product','(x − 2)(x − 6)','Their product is 12, but their sum is −8.']
        ]},
        {prompt:'Solve x² − 8x + 15 = 0 by factorising.',
          hint:'Look for two integers with sum −8 and product 15.',
          steps:['The integers are −3 and −5.','(x − 3)(x − 5) = 0.','Therefore x = 3 or x = 5.']}
      )])
  ]
};
