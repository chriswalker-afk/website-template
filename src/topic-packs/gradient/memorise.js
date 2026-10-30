// Reviewed Foundation gradient vocabulary and retrieval modes.
import {section,one} from '../builders/sections.js';
export const cards=[
  {
    "id": "gradient",
    "term": "Gradient",
    "definition": "The signed vertical change divided by horizontal change on a straight line; a measure of steepness and direction."
  },
  {
    "id": "rise",
    "term": "Rise",
    "definition": "The signed vertical change between two points on a graph; positive upwards and negative downwards."
  },
  {
    "id": "run",
    "term": "Run",
    "definition": "The horizontal change between the same two points, taken positive when moving to the right."
  },
  {
    "id": "positive-gradient",
    "term": "Positive gradient",
    "definition": "A straight line that goes uphill when read from left to right has positive gradient."
  },
  {
    "id": "negative-gradient",
    "term": "Negative gradient",
    "definition": "A straight line that goes downhill from left to right has negative gradient."
  },
  {
    "id": "zero-gradient",
    "term": "Zero gradient",
    "definition": "A horizontal line has gradient zero because its vertical change is zero."
  },
  {
    "id": "undefined-gradient",
    "term": "Undefined gradient",
    "definition": "A vertical line has no finite gradient because calculating rise divided by run would involve division by zero."
  },
  {
    "id": "horizontal-line",
    "term": "Horizontal line",
    "definition": "A line with a constant y-coordinate; its gradient is always zero."
  },
  {
    "id": "vertical-line",
    "term": "Vertical line",
    "definition": "A line with a constant x-coordinate; its gradient is undefined."
  },
  {
    "id": "slope-triangle",
    "term": "Slope triangle",
    "definition": "A right-angled triangle marked between two points on a line to count a rise and a run."
  },
  {
    "id": "rate-of-change",
    "term": "Rate of change",
    "definition": "How much one quantity changes when another quantity increases by one unit; on a straight-line graph this is constant."
  },
  {
    "id": "coefficient",
    "term": "Coefficient",
    "definition": "The number multiplying a variable: in y = mx + c, the coefficient m is the gradient."
  },
  {
    "id": "y-intercept",
    "term": "Y-intercept",
    "definition": "Where a line crosses the vertical axis. It is given by c in y = mx + c, not by m."
  },
  {
    "id": "parallel-lines",
    "term": "Parallel lines",
    "definition": "Distinct non-vertical straight lines with the same gradient are parallel. Vertical lines are also parallel to each other, although their gradients are undefined."
  },
  {
    "id": "steepness",
    "term": "Steepness",
    "definition": "How quickly a line changes vertically; a larger absolute gradient indicates a steeper line."
  }
];
export const clozes=[
  {
    "id": "gradient",
    "cardId": "gradient",
    "before": "The signed rise divided by the run of a straight line is its ",
    "after": ".",
    "hint": "A word for how steep a line is.",
    "answer": "gradient"
  },
  {
    "id": "rise",
    "cardId": "rise",
    "before": "The vertical change when moving from one point to another is the ",
    "after": ".",
    "hint": "It is positive for an upward change.",
    "answer": "rise"
  },
  {
    "id": "run",
    "cardId": "run",
    "before": "The horizontal change between the same points is called the ",
    "after": ".",
    "hint": "Count the movement to the right.",
    "answer": "run"
  },
  {
    "id": "positive",
    "cardId": "positive-gradient",
    "before": "A line sloping upwards from left to right has a ",
    "after": ".",
    "hint": "Think about the sign of the upward change.",
    "answer": "positive gradient"
  },
  {
    "id": "negative",
    "cardId": "negative-gradient",
    "before": "A line sloping down from left to right has a ",
    "after": ".",
    "hint": "Think about the sign of a downward change.",
    "answer": "negative gradient"
  },
  {
    "id": "zero",
    "cardId": "zero-gradient",
    "before": "A horizontal straight line has ",
    "after": ".",
    "hint": "There is no change in height.",
    "answer": "zero gradient"
  },
  {
    "id": "undefined",
    "cardId": "undefined-gradient",
    "before": "A vertical straight line has ",
    "after": ".",
    "hint": "The horizontal run would be zero.",
    "answer": "undefined gradient"
  },
  {
    "id": "horizontal",
    "cardId": "horizontal-line",
    "before": "A line with no vertical change is a ",
    "after": ".",
    "hint": "It is flat when read from left to right.",
    "answer": "horizontal line"
  },
  {
    "id": "vertical",
    "cardId": "vertical-line",
    "before": "A line with no horizontal change is a ",
    "after": ".",
    "hint": "It runs straight up and down.",
    "answer": "vertical line"
  },
  {
    "id": "triangle",
    "cardId": "slope-triangle",
    "before": "A right-angled drawing used to count rise and run is a ",
    "after": ".",
    "hint": "It has one horizontal and one vertical side.",
    "answer": "slope triangle"
  },
  {
    "id": "rate",
    "cardId": "rate-of-change",
    "before": "A gradient on a straight-line graph is a constant ",
    "after": ".",
    "hint": "It tells how much output changes per input unit.",
    "answer": "rate of change"
  },
  {
    "id": "coefficient",
    "cardId": "coefficient",
    "before": "In y = mx + c, the number multiplying x is the ",
    "after": ".",
    "hint": "It is a number beside a variable.",
    "answer": "coefficient"
  },
  {
    "id": "intercept",
    "cardId": "y-intercept",
    "before": "The point where a line crosses the vertical axis is its ",
    "after": ".",
    "hint": "Do not confuse it with the coefficient m.",
    "answer": "y-intercept"
  },
  {
    "id": "parallel",
    "cardId": "parallel-lines",
    "before": "Straight lines that never meet and have the same gradient are ",
    "after": ".",
    "hint": "They stay the same distance apart.",
    "answer": "parallel lines"
  },
  {
    "id": "steep",
    "cardId": "steepness",
    "before": "The size of a gradient, ignoring its sign, describes a line's ",
    "after": ".",
    "hint": "Compare the absolute values of gradients.",
    "answer": "steepness"
  }
];
export const cloze={before:'A horizontal line has ',answer:'zero gradient',after:'.',hint:'No vertical change.'};
export const memorise=[
  section('flashcards','Flashcards','Recall each term and explain it before revealing the answer.',one('flashcards')),
  section('match-up','Match Up','Match each mathematical term to its definition.',one('match-up')),
  section('missing-words','Missing Words','Retrieve the vocabulary within a complete mathematical statement.',one('missing-words')),
  section('speed-recall','Speed Recall','Type the mathematical term prompted by a definition.',one('speed-recall')),
  section('review-all','Review All','Review the complete gradient vocabulary deck.',one('review-all'))
];
