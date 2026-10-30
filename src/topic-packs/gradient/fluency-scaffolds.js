// Guided and Structured prompts support the first two Fluency levels.
export const scaffolds=Object.freeze({
  guided:Object.freeze({
    'rising-grid':'Find the rise and the run, then calculate rise ÷ run.',
    'rise-run':'A rise to the left-to-right direction is signed; divide by the rightward run.',
    'falling-grid':'Downhill from left to right has a negative vertical change.',
    'flat-grid':'A flat line has no rise, even if its y-coordinate is not zero.'
  }),
  structured:Object.freeze({
    'read-equation':['Find the form y = mx + c.','Read the coefficient of x, including the sign.','Check you did not use c as the gradient.'],
    'read-equation-zero':['Identify whether any x term is present.','Decide if y changes when x changes.','State the gradient of a flat line.'],
    'gradient-table':['Choose two matching columns.','Find the signed change in y and change in x.','Divide y-change by x-change.'],
    'gradient-context':['Identify the vertical and horizontal measurements.','Use vertical rise divided by horizontal run.','Interpret what the decimal means per horizontal unit.'],
    'rise-run':['Identify a positive horizontal run.','Make the vertical change signed up or down.','Divide signed rise by run.']
  })
});
