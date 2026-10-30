// Reusable four-level practice contract, aligned with Problem Solving.
// Fluency focuses on accuracy and method selection rather than extended
// reasoning. Cues contain no generated answers or worked numerical steps.
export const FLUENCY_LEVELS=Object.freeze([
  Object.freeze({
    id:'level-1',name:'Guided',
    overview:'The starting method is shown. Focus on setting up each calculation accurately.',
    cueLabel:'Start here',showSkill:true
  }),
  Object.freeze({
    id:'level-2',name:'Structured',
    overview:'Use a short method checklist to organise your working before calculating.',
    cueLabel:'Method checklist',showSkill:true
  }),
  Object.freeze({
    id:'level-3',name:'Independent',
    overview:'Select the method and carry out each calculation without a starting cue.',
    cueLabel:null,showSkill:false
  }),
  Object.freeze({
    id:'level-4',name:'Challenge',
    overview:'Tackle more demanding and combined calculations, deciding the method yourself.',
    cueLabel:null,showSkill:false
  })
]);

// A gentle method prompt for each Level 1 family; these are deliberately
// distinct from the full hint and do not disclose a numerical answer.
const GUIDED_CUES=Object.freeze({
  'sample-percent':'Start with: percentage sampled = (number selected ÷ population size) × 100.',
  'sample-count':'Start with: number selected = population size × percentage ÷ 100.',
  'interval':'Start with: selection interval = population size ÷ number sampled.',
  'sample-size':'Start with: number sampled = population size ÷ selection interval.',
  evaluate:'Substitute the given value of x into every term. Use brackets for negative values.',
  vertex:'Compare the expression with y = a(x − h)² + k. What are h and k?',
  'factor-roots':'Set each bracket equal to zero separately, then solve for x.',
  intercept:'The y-intercept is found by putting x = 0. Substitute this before simplifying.'
});

// Short ordered processes rather than numerical worked solutions.
const STRUCTURED_CUES=Object.freeze({
  'stratified-two':[
    'Find the population total and the two group proportions.',
    'Apply these proportions to the sample size.',
    'Check the allocations add to the required sample size.'
  ],
  positions:[
    'Identify the interval and the randomly selected starting position.',
    'Add one interval at a time to list the positions.',
    'Check that the positions stay within the list.'
  ],
  interval:[
    'Identify the population size and required number in the sample.',
    'Calculate their ratio to obtain the interval.',
    'Check that the interval makes sense for the list.'
  ],
  'monic-roots':[
    'Find the integer pair needed to factorise the quadratic.',
    'Write and solve the two linear factors.',
    'Check the roots in the original equation.'
  ],
  discriminant:[
    'Identify a, b and c, keeping the signs of the coefficients.',
    'Substitute into b² − 4ac.',
    'Simplify carefully and check the arithmetic.'
  ],
  'monic-vertex':[
    'Group the x terms and complete the square.',
    'Read the turning point from the new form.',
    'Check the signs of the turning-point coordinates.'
  ]
});

export function fluencyLevel(levelId){
  return FLUENCY_LEVELS.find(level=>level.id===levelId)||null;
}
export function fluencyQuestionScaffold(levelId,familyId){
  const level=fluencyLevel(levelId);
  if(!level||typeof familyId!=='string')return null;
  if(levelId==='level-1')return {
    label:level.cueLabel,
    steps:[GUIDED_CUES[familyId]||
      'Identify what is given and what needs to be calculated before substituting values.']
  };
  if(levelId==='level-2')return {
    label:level.cueLabel,
    steps:STRUCTURED_CUES[familyId]||[
      'Identify the quantities that are known and required.',
      'Choose an appropriate familiar method and calculate.',
      'Check that the result satisfies the question.'
    ]
  };
  return null;
}
export function showFluencySkill(levelId,answered){
  const level=fluencyLevel(levelId);
  return Boolean(level&&(level.showSkill||answered));
}
