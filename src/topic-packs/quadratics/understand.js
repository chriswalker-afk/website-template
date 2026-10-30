// Authored Understand lessons, concepts, diagrams and workshops for quadratics.
import {section,lesson,text,diagram,note,comparison,check,method,workshop,graph,samplingLab} from '../builders/understand.js';
export const understand=[
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
  ];
