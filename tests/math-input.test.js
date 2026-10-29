import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMathResponse,readMathResponse,parseMathNumber,latexToFluencyText,
  mathInputMarkup,MATH_SYMBOLS} from '../src/math-input.js';
import {checkFluencyAnswer} from '../src/fluency-engine.js';

test('math response contract keeps LaTeX, rejects malformed content',()=>{
  assert.deepEqual(makeMathResponse('\\frac{1}{2}'),{version:1,format:'latex',latex:'\\frac{1}{2}'});
  assert.equal(readMathResponse(makeMathResponse('x^2')),'x^2');
  assert.equal(readMathResponse({version:2,format:'latex',latex:'x'}),null);
  assert.throws(()=>makeMathResponse('x'.repeat(1001)));
});
test('safe numeric LaTeX parsing supports exact arithmetic, rejects instructions',()=>{
  for(const [latex,value] of [
    ['\\frac{1}{2}',.5],['-\\dfrac{3}{4}',-.75],['\\sqrt{9}',3],
    ['(2+3)^2',25],['\\frac{1+2}{3}',1],['2\\times 3',6],
    ['2^3^2',512],['\\pi',Math.PI]
  ]) assert.ok(Math.abs(parseMathNumber(latex)-value)<1e-9,latex);
  for(const latex of ['x','alert(1)','1/0','\\sqrt{-1}','\\frac{1}{0}',
    'process.exit()','1; 2','\\text{hello}','2\\le 3', '2'.repeat(501)])
    assert.equal(parseMathNumber(latex),null,latex);
});
test('LaTeX bridge permits multi-answer roots without hiding format mistakes',()=>{
  const roots={kind:'unordered',values:[3,-.5]};
  const converted=latexToFluencyText('x=3, x=-\\frac{1}{2}',roots);
  assert.equal(converted,'3, -0.5');
  assert.equal(checkFluencyAnswer(converted,{answer:roots,mistake:'Check the roots.'}).correct,true);
  assert.equal(latexToFluencyText('x=3',roots),null);
  assert.equal(latexToFluencyText('x^2=9',roots),null);
  assert.equal(latexToFluencyText('\\frac{1}{2}',{kind:'number',values:[.5]}),'0.5');
  assert.equal(latexToFluencyText('25\\%',{kind:'number',values:[25],unit:'%'}),'25');
});
test('maths input safely escapes student LaTeX and exposes accessible palette',()=>{
  const html=mathInputMarkup({targetId:'fluency-answer',active:true,latex:'&quot; <img src=x>'});
  assert.ok(html.includes('aria-label="Insert mathematical notation"'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img'));
  assert.ok(MATH_SYMBOLS.some(symbol=>symbol.id==='fraction'));
  assert.throws(()=>mathInputMarkup({targetId:'a" onclick="foo'}));
});
