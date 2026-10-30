// Authored Understand lessons, concepts, diagrams and workshops for sampling.
import {section,lesson,text,diagram,note,comparison,check,method,workshop,graph,samplingLab} from '../builders/understand.js';
export const understand=[
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
  ];
