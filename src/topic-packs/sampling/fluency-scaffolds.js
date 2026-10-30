// Family-specific method cues: no generated numerical answers.
export const scaffolds=Object.freeze({
  guided:Object.freeze({
'sample-percent':'Start with: percentage sampled = (number selected ÷ population size) × 100.',
'sample-count':'Start with: number selected = population size × percentage ÷ 100.',
'interval':'Start with: selection interval = population size ÷ number sampled.',
'sample-size':'Start with: number sampled = population size ÷ selection interval.'
  }),
  structured:Object.freeze({
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
  ]
  })
});
