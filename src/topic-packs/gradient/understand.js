// Foundation-first explanations with diagnostic feedback and graduated examples.
import {section,lesson,text,note,comparison,diagram,check,method,workshop,visual} from '../builders/understand.js';
export const understand=[
  section('big-idea','The big idea',
    'Gradient measures how quickly a straight line rises or falls as you move to the right.',
    [
      lesson('rise-over-run',
        text('Gradient tells you the vertical change for each unit you move to the right. On a square grid, choose two points on the line and compare the rise with the run.'),
        diagram('rising-line','The line y = 2x − 1 rises two squares for every one square to the right. Its gradient is 2.'),
        comparison(
          ['Rise','Count the change upwards or downwards between two points on the line. Downwards means a negative change.'],
          ['Run','Count the horizontal change to the right between the same two points.'],
          ['Gradient','Divide the signed rise by the run. Two right and one down gives gradient −0.5.']
        ),
        check('identify-rise','A line rises six squares while you move three squares right. What is its gradient?',[
          ['six','6','That is only the rise; gradient compares rise with run.'],
          ['three','3','The line rises six, but the horizontal run is three.'],
          ['two','2','Correct: 6 ÷ 3 = 2.',true]
        ])
      ),
      lesson('sign-of-gradient',
        text('Read a straight-line graph from left to right: an uphill line has positive gradient, a downhill line has negative gradient and a horizontal line has zero gradient.'),
        diagram('falling-line','The line y = −x + 2 falls one unit for every one unit right, so its gradient is −1.'),
        check('falling','A line falls four squares while you move two squares right. Which gradient is correct?',[
          ['positive','2','The direction is downhill, so the gradient must be negative.'],
          ['negative','−2','Correct: the signed rise is −4 and the run is 2.',true],
          ['zero','0','Zero gradient means a horizontal line, not a falling line.']
        ]),
        note('A vertical line has undefined gradient because its horizontal run is zero; division by zero is not possible.')
      ),
      lesson('steepness',
        text('A larger absolute gradient means a steeper line. The sign tells you the direction; the size tells you how fast the line changes.'),
        diagram('gradient-comparison','Both lines rise, but gradient 2 is steeper than gradient 1. The dotted reference has gradient 1.'),
        check('steeper','Which line is steeper, regardless of whether it rises or falls?',[
          ['negative-two','Gradient −2','Correct: its magnitude 2 is greater than 0.5.',true],
          ['positive-half','Gradient 0.5','This changes by only half a square vertically per square horizontally.'],
          ['equal','They are equally steep','Steepness depends on the size of the gradient, ignoring its sign.']
        ])
      )
    ]),
  section('how-it-works','How it works',
    'Use a consistent method to find a gradient, then connect it to the equation of a line.',
    [
      lesson('count-the-grid',
        method('grid-method','Find the gradient by counting squares between two clear points on a line.',[
          'Choose two exact grid intersections on the straight line, preferably far enough apart to count reliably.',
          'From the first point, move horizontally right to the second point. Count that positive run.',
          'Count the signed vertical change: positive for up, negative for down.',
          'Divide signed rise by run. For a rise of 6 and run of 3, gradient = 6 ÷ 3 = 2.',
          'Check the sign against the overall direction of the line.'
        ]),
        note('Do not divide run by rise. A rise of two and a run of four gives a gradient of 0.5, not 2.')
      ),
      lesson('read-equation',
        text('In the straight-line form \\(y=mx+c\\), the gradient is \\(m\\), the number multiplying \\(x\\). The number \\(c\\) gives the vertical intercept and does not change the gradient.'),
        method('coefficient-method','Find the gradient of y = −3x + 5.',[
          'Write the equation in the form y = mx + c.',
          'Identify the number multiplying x. Here m = −3.',
          'The gradient is −3. The +5 is a starting height, not the gradient.'
        ]),
        check('coefficient','Which is the gradient of y = 4x − 7?',[
          ['negative-seven','−7','That is the y-intercept, not the gradient.'],
          ['four','4','Correct: m is the coefficient of x.',true],
          ['negative-four','−4','The sign belongs to the constant −7, not to 4x.']
        ])
      ),
      lesson('tables-and-changes',
        text('When x increases in equal steps along a straight line, y changes by the same amount each time. Gradient compares the two changes, including their signs.'),
        method('table-method','From the table x = 0, 2, 4 and y = 5, 1, −3, find the gradient.',[
          'Take two matching columns: from x = 0 to x = 2, the run is 2.',
          'Over the same columns, y goes from 5 to 1, so the signed rise is −4.',
          'Gradient = −4 ÷ 2 = −2. The next columns confirm the same gradient.'
        ]),
        check('table','A table shows x increasing by 3 while y decreases by 6 each time. What is the gradient?',[
          ['negative-two','−2','Correct: −6 ÷ 3 = −2.',true],
          ['positive-two','2','A decrease in y makes the gradient negative.'],
          ['negative-half','−0.5','That divides run by rise instead of rise by run.']
        ])
      ),
      lesson('two-coordinates-extension',
        text('Stretch practice: if a line is given by two coordinates rather than a graph, use the signed differences in the same order: \\(m=\\frac{y_2-y_1}{x_2-x_1}\\). This is an optional extension beyond the main Foundation graph skill.'),
        method('point-method','Find the gradient through A(1, 2) and B(4, 8).',[
          'Find the vertical change: 8 − 2 = 6.',
          'Find the horizontal change in the same order: 4 − 1 = 3.',
          'Divide: gradient = 6 ÷ 3 = 2.',
          'Check against the points: x grows by 3 while y grows by 6, so the line rises.'
        ]),
        note('Subtract the coordinate pairs in the same order. Reversing only one subtraction changes the sign incorrectly.')
      )
    ]),
  section('visual-explanations','Visual explanations',
    'Change one part of a straight-line model at a time and explain the effect on gradient.',
    [
      visual('explore-sign','Move gradient m through negative, zero and positive values. Predict the direction before moving the slider.','sign-explorer'),
      visual('explore-steepness','Change the gradient by halves, then adjust starting height c. Which change affects steepness?','slope-explorer'),
      visual('explore-parallel','Move the line up or down without changing its gradient. Explain why the two straight lines stay parallel.','parallel-explorer'),
      lesson('zero-gradient',
        diagram('horizontal-line','Every point on y = 3 has the same height. Its gradient is zero.'),
        text('A horizontal line has no vertical change: rise = 0, so its gradient is zero for any nonzero run.'),
        check('horizontal','A line passes through points with y = 3 at every x-value. Its gradient is ...',[
          ['zero','0','Correct: the height does not change as x changes.',true],
          ['three','3','Three is the height of the line, not its gradient.'],
          ['undefined','Undefined','That describes a vertical line with zero run, not a horizontal one.']
        ])
      )
    ]),
  section('worked-examples','Worked examples',
    'Move from fully worked solutions to selecting a method and completing a similar question independently.',
    [
      workshop('grid-up',
        {prompt:'A straight line passes through (0, 1) and (3, 7). Find its gradient.',steps:[
          'As x moves from 0 to 3, the horizontal run is 3.',
          'As y moves from 1 to 7, the vertical rise is 6.',
          'Gradient = rise ÷ run = 6 ÷ 3 = 2. The positive sign matches an uphill line.'
        ]},
        {prompt:'A line rises 8 squares in a horizontal run of 4 squares. What is its gradient?',choices:[
          ['four','4','This multiplies or miscounts the change instead of dividing.'],
          ['two','2','Correct: gradient = 8 ÷ 4 = 2.',true],
          ['half','0.5','This is run ÷ rise rather than rise ÷ run.']
        ]},
        {prompt:'A line passes through (−1, 0) and (2, 9). Find its gradient.',
          hint:'Count the movement to the right and the upward change; divide rise by run.',
          steps:['The horizontal run is 2 − (−1) = 3.',
            'The vertical rise is 9 − 0 = 9.',
            'Gradient = 9 ÷ 3 = 3. The line rises to the right.']}
      ),
      workshop('grid-down',
        {prompt:'A line falls from y = 6 to y = −2 while moving four squares to the right. Find its gradient.',steps:[
          'The horizontal run to the right is 4.',
          'The vertical change is −2 − 6 = −8, because the line falls.',
          'Gradient = −8 ÷ 4 = −2. The negative sign indicates a downhill line.'
        ]},
        {prompt:'Moving right by 3 squares, a line falls by 6 squares. What is its gradient?',choices:[
          ['positive','2','The magnitude is 2 but the direction is downhill.'],
          ['negative','−2','Correct: signed rise −6 ÷ run 3 = −2.',true],
          ['minus-half','−0.5','This reverses the rise/run fraction.']
        ]},
        {prompt:'A straight line moves right 5 and down 10. Find its gradient and state its direction.',
          hint:'The signed rise is negative. Divide that by the positive run.',
          steps:['Moving right by 5 gives run = 5.',
            'Moving down by 10 gives rise = −10.',
            'Gradient = −10 ÷ 5 = −2, so the line falls from left to right.']}
      ),
      workshop('half-gradient',
        {prompt:'A line rises by 3 while the horizontal run is 6. Find the gradient.',steps:[
          'Rise = 3 and run = 6.',
          'Gradient = 3 ÷ 6 = 0.5, or one half.',
          'It rises one half of a vertical unit for each one unit to the right.'
        ]},
        {prompt:'A line falls by 2 over a run of 4. Find the signed gradient.',choices:[
          ['minus-half','−0.5','Correct: −2 ÷ 4 = −0.5.',true],
          ['plus-half','0.5','The line falls, so the gradient must be negative.'],
          ['minus-two','−2','You divided the run by the rise.']
        ]},
        {prompt:'A line rises 5 squares over a horizontal run of 10 squares. Find its gradient.',
          hint:'Divide 5 by 10, then simplify or express it as a decimal.',
          steps:['Rise = 5 and run = 10.',
            'Gradient = 5 ÷ 10 = 0.5.',
            'The line has a positive, gentle gradient of one half.']}
      ),
      workshop('equation-gradient',
        {prompt:'State the gradient of the line y = −2x + 7 and explain your answer.',steps:[
          'Compare the equation with y = mx + c.',
          'Here the coefficient of x is m = −2 and the intercept is c = 7.',
          'The gradient is −2; the line falls by two units for each unit to the right.'
        ]},
        {prompt:'Which is the gradient of y = 3x − 4?',choices:[
          ['negative-four','−4','That is the intercept on the y-axis.'],
          ['three','3','Correct: the coefficient of x is 3.',true],
          ['four','4','The final constant is not the gradient.']
        ]},
        {prompt:'The line is y = −0.5x + 6. Find its gradient and describe its direction.',
          hint:'Read the number multiplying x, including its sign.',
          steps:['The equation is in the form y = mx + c.',
            'The coefficient of x is m = −0.5.',
            'Its gradient is −0.5, so the line gently falls from left to right.']}
      )
    ])
];
