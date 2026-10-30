// A single, independently authored vocabulary and language-recall pack.
import {section,one} from '../builders/sections.js';
export const cards=[
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
    ];
export const clozes=[
    {id:'symmetry',cardId:'symmetry',before:'The vertical line passing through the turning point is the ',after:'.',hint:'Three words; it divides the parabola into mirror images.',answer:'axis of symmetry'},
    {id:'quadratic',cardId:'quadratic',before:'A polynomial function with highest power of x equal to 2 is a ',after:'.',hint:'Two words; its graph is a parabola.',answer:'quadratic function'},
    {id:'vertex',cardId:'turning-point',before:'The point where a parabola changes from increasing to decreasing (or vice versa) is its ',after:'.',hint:'Two words.',answer:'turning point'},
    {id:'discriminant',cardId:'discriminant',before:'The expression b² − 4ac is called the ',after:'.',hint:'It indicates the number of distinct real roots.',answer:'discriminant'},
    {id:'roots',cardId:'roots',before:'The x-values for which f(x) = 0 are the ',after:'.',hint:'Another name for the zeros of a function.',answer:'roots'},
    {id:'square',cardId:'completed-square',before:'The form a(x − h)² + k is the completed-',after:' form.',hint:'A word for a number multiplied by itself.',answer:'square'},
    {id:'parabola',cardId:'parabola',before:'The curved graph of a quadratic function is a ',after:'.',hint:'Starts with “para”.',answer:'parabola'},
    {id:'leading',cardId:'leading-coefficient',before:'In y = ax² + bx + c, the non-zero value a is the leading ',after:'.',hint:'A number multiplying a variable term.',answer:'coefficient'},
    {id:'yintercept',cardId:'y-intercept',before:'The point where a quadratic graph crosses the vertical axis is the ',after:'.',hint:'It is found by setting x = 0.',answer:'y-intercept',aliases:['y intercept']},
    {id:'factorised',cardId:'factorised-form',before:'The form a(x − p)(x − q), which displays real roots p and q, is the ',after:'.',hint:'A form built from factors.',answer:'factorised form',aliases:['factored form']},
    {id:'minimum',cardId:'minimum',before:'For a > 0, the turning point is a ',after:'.',hint:'The smallest y-value of the quadratic.',answer:'minimum'},
    {id:'maximum',cardId:'maximum',before:'For a < 0, the turning point is a ',after:'.',hint:'The greatest y-value of the quadratic.',answer:'maximum'}
  ];
export const cloze={before:'The vertical line through the turning point of a parabola is its ',answer:'axis of symmetry',after:'.',hint:'Three words; think of a line of reflection.'};
export const memorise=[
      section('flashcards','Flashcards','Recall each definition before flipping the card and rating your recall.',one('flashcards')),
      section('match-up','Match Up','Match mathematical terms to their precise definitions.',one('match-up')),
      section('missing-words','Missing Words','Complete statements by retrieving the correct term.',one('missing-words')),
      section('speed-recall','Speed Recall','Type the term that matches each definition.',one('speed-recall')),
      section('review-all','Review All','Browse the full vocabulary deck and its definitions.',one('review-all'))
    ];
