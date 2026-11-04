# Question-generation foundation — Pass 2

Pass 2 adds **opt-in exact mathematics checking** and **seeded generator auditing**.
Existing Sampling, Quadratics and Gradient prompts, random seeds, progress keys
and numeric marking are unchanged.

## Supported exact response types

New topic generators may use makeQuestionModel() and
presentQuestion(model, 'fluency') with the following answers:

| Kind | Expected value | What is compared |
|---|---|---|
| rational | {numerator:1, denominator:2} | Reduced fractions and terminating decimals, exactly |
| expression | {latex:'x^2-x-6'} | Rational-coefficient polynomials, including equivalent factorised forms |
| equation | {latex:'x=2'} | Polynomial relations, up to a nonzero scalar factor |
| inequality | {latex:'x\\le2'} | Single polynomial inequalities; reverses the relation for negative factors |
| interval | {latex:'(-\\infty,2]'} | Endpoints and open/closed boundaries |
| coordinates | {latex:'(1/2,-3)'} | Ordered pair of rational values |
| set | {latex:'\\{1,2\\}'} | Unordered finite set of rational values |

Existing number, ordered and unordered answers still go through their
original numerical checking code.

## Conservative mathematical limits

This verifier does **not** pretend to be a general computer algebra system.

- It accepts ordinary and LaTeX fractions, rational decimals, basic
  operations, brackets, integer powers, implicit multiplication and a
  limited set of Latin variables. The tokenizer rejects unknown commands.
- Expressions are compared as exact polynomials. Only division by a
  **constant** is allowed; variable denominators and rational functions
  are rejected to avoid silently ignoring excluded domains. An ambiguous
  form such as 1/2x requires parentheses, a fraction template or an
  explicit multiplication sign.
- Equations and inequalities are compared after subtracting their sides.
  The resulting polynomials must be equal up to a nonzero rational factor.
  This handles rearrangements and negative scaling but is deliberately
  narrower than general solution-set equivalence.
- It does not automatically check trigonometric/logarithmic functions,
  square roots, arbitrary rational expressions, chained inequalities,
  complex numbers, unions of intervals or symbolic set-builder notation.
- A submitted relation is not credited if it changes a strict boundary
  to a non-strict boundary. An interval is not conflated with a different
  answer kind (for example, an inequality).
- Exponents, expression length, nesting, total degree, number of terms
  and arithmetic magnitude are bounded. There is no eval, Function,
  numerical sampling, external CAS or network dependency.
- The model's authored expected LaTeX should be a **bare expression**,
  not wrapped in inline math delimiters.
- Unsupported submitted notation gets **format** feedback and is not
  treated as an incorrect mathematical answer. An authored expected
  answer that cannot be verified is rejected at generation time.
- This checks the final mathematical answer, not the student's working
  or whether an answer obeys a particular representation request.
  For example, a request to "factorise completely" still needs a separate
  form-specific mark rule if expanded answers are not acceptable.

## Example generator

~~~js
import {makeQuestionModel,presentQuestion,integer}
  from '../../question-foundation/index.js';
function generate(rng){
  const a=integer(rng,1,4),b=integer(rng,1,5);
  const model=makeQuestionModel({
    topicId:'algebra',familyId:'factorise-monic',signature:a+':'+b,
    parameters:{a,b},marks:3,
    prompt:'Find an expression equivalent to x² + '+(a+b)+'x + '+(a*b)+'.',
    answer:{kind:'expression',value:{latex:'(x+'+a+')(x+'+b+')'}},
    solutionSteps:[
      'Look for two numbers with sum '+(a+b)+' and product '+(a*b)+'.',
      'The factorised form is (x+'+a+')(x+'+b+').'
    ],
    hint:'Find a suitable pair of numbers.',
    misconception:'Check the sum and the product.',
    skill:'Quadratic expressions'
  });
  return presentQuestion(model,'fluency');
}
~~~

The exact checker accepts the expanded form as well as the factorised form
in this example because the **mathematical expression** is equivalent.

## Quality assurance

- validateExactAnswer(): validates the expected answer before it can be
  automatically marked.
- checkExactAnswer(): produces correct, value, format or unsupported
  feedback and rejects unsupported forms.
- Import generator auditing helpers from src/question-foundation/audit.js
  (separate from the runtime authoring entrypoint to avoid module cycles).
- auditFluencyGenerator(create,{familyId,count:48,oracle}): 48 seeded
  samples by default; detects unstable generation, bad question contracts,
  reference-answer checking failures and suspiciously low variation.
- auditQuestionModelGenerator(create,{familyId,count,oracle}): analogous
  auditing directly on the mathematical question model.
- The topic-publication audit now tests **48 seeds per Fluency family**,
  up from 3. It includes the exact-checking reference round trip when
  appropriate.
- Independent author-supplied **oracle** functions can assert mathematical
  relationships from parameters. The system reports the failing seed.
  Reference-answer round trips alone **cannot independently prove**
  the authored answer or worked solution is correct, so teacher review
  remains required. This is explicitly reported in diagnostics.

Unit tests cover exact decimal fractions, algebraic factorisation,
equations, inequality sign reversal, endpoints, coordinates, finite sets,
rejected syntax, seeded tests and regressions across existing families.

Run npm run check, npm run test:latex and npm run test:browser. The site
still has no runtime build or CAS dependency.

## Pass 3 — Teacher Question Workshop

Pass 3 now provides a separate read-only teacher page with a family catalogue,
seeded previews, worksheet difficulty controls, verified accepted-answer
examples and a QA dashboard. See [the Pass 3 guide](QUESTION_FOUNDATION_PASS3.md)
for usage, tests and review limitations.
