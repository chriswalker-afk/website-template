import test from 'node:test';
import assert from 'node:assert/strict';
import {parseExactScalar,fractionText,parsePolynomial,equivalentAlgebra,parseRelation,
  parseInterval,makeQuestionModel,toFluencyQuestion,
  validateExactAnswer,checkExactAnswer,checkFluencyAnswer,
  validateFluencyQuestion,integer,nonZeroInteger} from '../src/question-foundation/index.js';
import {checkFluencyAnswer as checkLegacy,rngFromSeed} from '../src/fluency-engine.js';

const answer=(kind,latex)=>({kind,value:{latex}});
const mark=(kind,expected,raw)=>checkExactAnswer(raw,answer(kind,expected));
const base=(kind,value)=>makeQuestionModel({
  topicId:'algebra',familyId:'test-family',signature:'v1',
  parameters:{a:1},prompt:'Solve a mathematics question.',marks:3,
  answer:{kind,value},solutionSteps:['Set up the expression.','Simplify and check.'],
  hint:'Use equivalent forms.',misconception:'Check the sign.'
});
test('exact fractions reduce sign and preserve decimal precision without floats',()=>{
  assert.equal(fractionText(parseExactScalar('0.1+0.2')),'3/10');
  assert.equal(fractionText(parseExactScalar('\\frac{-6}{-8}')),'3/4');
  assert.equal(fractionText(parseExactScalar('1.25')),'5/4');
  assert.equal(checkExactAnswer('\\frac{2}{4}',{
    kind:'rational',value:{numerator:1,denominator:2}}).correct,true);
  assert.equal(checkExactAnswer('0.50',{
    kind:'rational',value:{numerator:1,denominator:2}}).correct,true);
  assert.equal(checkExactAnswer('0.3333333333',{
    kind:'rational',value:{numerator:1,denominator:3}}).correct,false);
  assert.equal(checkExactAnswer('1/0',{
    kind:'rational',value:{numerator:1,denominator:2}}).kind,'format');
});
test('symbolic polynomial expansion and factorisation use exact coefficients',()=>{
  const equivalent=[
    ['(x+2)(x-3)','x^2-x-6'],
    ['\\left(x+2\\right)\\left(x-3\\right)','x^{2}-x-6'],
    ['\\frac{1}{2}(x+2)','0.5x+1'],
    ['(x+y)^2','x^2+2xy+y^2'],
    ['-x^2+2x','-1(x^2-2x)']
  ];
  for(const [left,right] of equivalent)
    assert.equal(equivalentAlgebra('expression',left,right),true,left+' = '+right);
  assert.equal(mark('expression','x^2-x-6','(x+2)(x-3)').correct,true);
  assert.equal(mark('expression','x^2-x-6','(x+1)(x-6)').correct,false);
  assert.equal(mark('expression','-x^2','(-x)^2').correct,false);
  assert.ok(parsePolynomial('x(x+1)').size>0);
});
test('equation checker accepts scalar multiples but not extra roots',()=>{
  assert.equal(mark('equation','x=2','3x=6').correct,true);
  assert.equal(mark('equation','x=2','-x=-2').correct,true);
  assert.equal(mark('equation','x=2','2=x').correct,true);
  assert.equal(mark('equation','x^2=4','(x-2)(x+2)=0').correct,true);
  assert.equal(mark('equation','x=2','(x-2)(x+1)=0').correct,false);
  assert.equal(mark('equation','x=2','x=3').correct,false);
  assert.equal(mark('equation','x=2','x^2=4').correct,false);
  assert.equal(mark('equation','x=2','x=2=2').kind,'format');
  assert.equal(parseRelation('2x=4','equation').op,'=');
});
test('inequality checker flips direction under negative scaling',()=>{
  assert.equal(mark('inequality','x<2','-x>-2').correct,true);
  assert.equal(mark('inequality','x<2','2>x').correct,true);
  assert.equal(mark('inequality','x\\le2','2x\\le4').correct,true);
  assert.equal(mark('inequality','x\\le2','2-x\\ge0').correct,true);
  assert.equal(mark('inequality','x<2','x\\le2').correct,false);
  assert.equal(mark('inequality','x<2','x>2').correct,false);
  assert.equal(mark('inequality','x<2','0<x<2').kind,'format');
});
test('interval boundaries, infinity, sets and coordinates retain exact meaning',()=>{
  assert.equal(mark('interval','(-\\infty,2]','(-\\infty,\\frac{4}{2}]').correct,true);
  assert.equal(mark('interval','[0,1)','(0,1)').correct,false);
  assert.equal(mark('interval','(-\\infty,2]','[-\\infty,2]').kind,'format');
  assert.equal(mark('interval','(1,3]','(3,1]').kind,'format');
  assert.equal(parseInterval('(0,1]').end,']');
  assert.equal(mark('coordinates','\\left(\\frac{1}{2},-3\\right)','(0.5,-3)').correct,true);
  assert.equal(mark('coordinates','(2,-3)','(-3,2)').correct,false);
  assert.equal(mark('set','\\{1,\\frac{1}{2}\\}','\\{\\frac{2}{4},1\\}').correct,true);
  assert.equal(mark('set','\\{1,2\\}','\\{1,2,2\\}').kind,'format');
});
test('unsupported syntax is rejected rather than guessed from samples',()=>{
  const expected=answer('expression','x+1');
  for(const input of ['\\sqrt{4}+x','\\sin(x)+1','x^{-1}+1',
    '(x^2-1)/(x-1)+2','globalThis.alert(1)','x^999','x^2+'])
    assert.notEqual(checkExactAnswer(input,expected).correct,true,input);
  assert.equal(validateExactAnswer(answer('expression','\\sqrt{x}'))!=='',true);
  assert.equal(checkExactAnswer('x+1',answer('expression','\\sqrt{x}')).kind,'unsupported');
  assert.equal(checkExactAnswer('x+1',{kind:'self-review'}).kind,'unsupported');
});
test('Fluency adapter supports opt-in exact contracts while legacy numeric remains unchanged',()=>{
  const rational=base('rational',{numerator:1,denominator:2}),q=toFluencyQuestion(rational);
  assert.equal(validateFluencyQuestion(q),'');
  assert.equal(checkLegacy('\\frac{2}{4}',q).correct,true);
  const poly=toFluencyQuestion(base('expression',{latex:'x^2-x-6'}));
  assert.equal(checkLegacy('(x-3)(x+2)',poly).correct,true);
  assert.equal(validateFluencyQuestion(poly),'');
  assert.throws(()=>toFluencyQuestion(base('expression',{latex:'\\sqrt{x}'})),/Exact answer/);
  const legacy={answer:{kind:'number',values:[2],precision:0,unit:'%',
    label:'Enter a percentage.'},mistake:'Check.',prompt:'Answer 2%',steps:['a','b'],family:'f',signature:'f:1',hint:'h',marks:2};
  assert.equal(checkLegacy('2%',legacy).correct,true);
});
test('generated algebraic families remain correct across 200 deterministic seeds',()=>{
  for(let seed=1;seed<=200;seed++){
    const rng=rngFromSeed(seed),r=nonZeroInteger(rng,-6,6),s=integer(rng,-6,6);
    const factor=k=>k>=0?'(x-'+k+')':'(x+'+(-k)+')';
    const expected=factor(r)+factor(s);
    const expanded='x^2+('+(-r-s)+')x+('+(r*s)+')';
    assert.equal(mark('expression',expected,expanded).correct,true,'seed '+seed);
    const wrong='x^2+('+(-r-s)+')x+('+(r*s+1)+')';
    assert.equal(mark('expression',expected,wrong).correct,false,'seed '+seed);
  }
});
