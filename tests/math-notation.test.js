import test from 'node:test';
import assert from 'node:assert/strict';
import {NOTATION_VERSION,renderMathML,renderMathematicalText}
  from '../src/math-notation.js';
import {buildFluencySet,FLUENCY_CHAPTERS} from '../src/fluency-engine.js';
import {REASONING_CHAPTERS} from '../src/reasoning-content.js';
import {PROBLEM_SOLVING_CHAPTERS} from '../src/problem-solving-content.js';
import {MODELLING_CHAPTERS} from '../src/modelling-content.js';
import {UNDERSTAND_CONTENT} from '../src/understand-content.js';

test('renders the reported quadratic question with genuine maths semantics',()=>{
  const text='For f(x) = 3x² + x − 7, calculate f(-4).';
  const html=renderMathematicalText(text);
  assert.match(html,/^For <math /);
  assert.equal((html.match(/<math /g)||[]).length,2,html);
  assert.match(html,/<msup>/);
  assert.match(html,/<mn>3<\/mn>/);
  assert.match(html,/<mi>f<\/mi>/);
  assert.match(html,/<mo>−<\/mo>/);
  assert.ok(html.includes('calculate '));
  assert.ok(!html.replace(/aria-label="[^"]*"/g,'').includes('3x² + x'));
});
test('mathematical fractions and inequalities have proper structures',()=>{
  const html=renderMathematicalText(
    'The sampling fraction is 36/480 = 3/40. For 0≤x≤8, find x² − 4x + 3 = 0.');
  assert.ok((html.match(/<mfrac>/g)||[]).length>=2,html);
  assert.match(html,/<msup>/);
  assert.match(html,/<mo>≤<\/mo>/);
  assert.match(html,/<mo>=<\/mo>/);
  const rendered=renderMathML('x<2');
  assert.match(rendered,/<mo>&lt;<\/mo>/);
});
test('explicit LaTeX supports stacked fractions, roots, powers and subscripts',()=>{
  const source='Use \\(\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\), then compare \\(x_1\\) and \\(x_2\\).';
  const html=renderMathematicalText(source);
  assert.equal((html.match(/<math /g)||[]).length,3,html);
  assert.match(html,/<mfrac>/);
  assert.match(html,/<msqrt>/);
  assert.match(html,/<msup>/);
  assert.match(html,/<msub>/);
  assert.match(html,/<mo>±<\/mo>/);
  assert.equal(NOTATION_VERSION,1);
});
test('preserves ordinary English and does not treat random prose as equations',()=>{
  for(const s of [
    'Write a concise argument explaining whether the chosen sample is representative.',
    'The sample contains Year 10 and Year 12 students.',
    'Use the notebook to plan your calculation.',
    'The first step is to estimate the population size.'
  ])assert.equal(renderMathematicalText(s),s);
  assert.equal(renderMathematicalText(''), '');
});
test('escapes hostile HTML in prose, maths and future TeX content',()=>{
  const source='Explain x² < 5. <img src=x onerror=alert(1)> \\(\\frac{1}{2}\\)';
  const html=renderMathematicalText(source);
  assert.doesNotMatch(html,/<img /);
  assert.match(html,/&lt;img/);
  assert.match(html,/<mfrac>/);
  assert.match(html,/<msup>/);
  const unsafe='\\(\\text{<img src=x onerror=alert(1)>}\\)';
  assert.doesNotMatch(renderMathematicalText(unsafe),/<img /);
});
test('generates reproducible mathematical markup from all Fluency families',()=>{
  for(const topic of ['sampling','quadratics']){
    for(const level of FLUENCY_CHAPTERS[topic]){
      for(const page of level.pages){
        const set=buildFluencySet({topicId:topic,levelId:level.id,
          pageId:page.id,seed:203092,count:6});
        for(const question of set.questions){
          const parts=[question.prompt,question.hint,...question.steps,
            question.mistake,question.skill];
          for(const part of parts){
            const a=renderMathematicalText(part);
            assert.equal(typeof a,'string');
            assert.ok(!a.includes('<script'),topic+' '+question.family);
            assert.equal(a,renderMathematicalText(part),
              'Typesetting should be deterministic');
          }
        }
      }
    }
  }
});
test('sample authored content across the other modes is safely typeset',()=>{
  for(const content of [UNDERSTAND_CONTENT,REASONING_CHAPTERS,
    PROBLEM_SOLVING_CHAPTERS,MODELLING_CHAPTERS]){
    const snippets=JSON.stringify(content).match(/.{0,45}(?:x²|h\(x\)|y = |f\(x\)|\/480|≤).{0,45}/g)||[];
    assert.ok(snippets.length>0);
    for(const snippet of snippets.slice(0,70)){
      assert.equal(typeof renderMathematicalText(snippet),'string');
    }
  }
});
