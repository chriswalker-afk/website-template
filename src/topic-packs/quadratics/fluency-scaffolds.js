// Family-specific method cues: no generated numerical answers.
export const scaffolds=Object.freeze({
  guided:Object.freeze({
evaluate:'Substitute the given value of x into every term. Use brackets for negative values.',
vertex:'Compare the expression with y = a(x − h)² + k. What are h and k?',
'factor-roots':'Set each bracket equal to zero separately, then solve for x.',
intercept:'The y-intercept is found by putting x = 0. Substitute this before simplifying.'
  }),
  structured:Object.freeze({
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
  })
});
