import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWorksheet,escapeLatexText,worksheetSkills,supportsWorksheets,WORKSHEET_VERSION} from '../src/worksheet-generator.js';

const defaults=(topicId,extra={})=>({
  topicId,count:8,seed:123456,difficulty:'secure',style:'mixed',solutions:'worked',
  ...extra
});
test('both sample Maths topics offer distinct worksheet skill menus',()=>{
  assert.equal(supportsWorksheets('sampling'),true);
  assert.equal(supportsWorksheets('quadratics'),true);
  assert.equal(supportsWorksheets('nonexistent'),false);
  assert.equal(worksheetSkills('sampling').length,4);
  assert.equal(worksheetSkills('quadratics').length,4);
});
test('deterministic worksheets have distinct question IDs and matching source metadata',()=>{
  for(const topicId of ['sampling','quadratics']){
    const a=generateWorksheet(defaults(topicId));
    const b=generateWorksheet(defaults(topicId));
    assert.deepEqual(a.questions,b.questions);
    assert.equal(a.studentTex,b.studentTex);
    assert.equal(a.solutionsTex,b.solutionsTex);
    assert.equal(a.questions.length,8);
    assert.equal(new Set(a.questions.map(q=>q.key)).size,a.questions.length);
    assert.match(a.studentTex,/\\documentclass\[11pt,a4paper\]\{article\}/);
    assert.match(a.studentTex,/\\begin\{enumerate\}/);
    assert.match(a.solutionsTex,/\\end\{document\}/);
    assert.match(a.studentTex,/Seed: 123456/);
    assert.match(a.solutionsTex,/Seed: 123456/);
    const questionMarkers=a.studentTex.match(/^% Question .*$/gm);
    const answerMarkers=a.solutionsTex.match(/^% Question .*$/gm);
    assert.deepEqual(questionMarkers,answerMarkers);
  }
});
test('changing the seed gives a new variation while preserving internal coherence',()=>{
  for(const topic of ['sampling','quadratics']){
    const a=generateWorksheet(defaults(topic,{seed:123}));
    const b=generateWorksheet(defaults(topic,{seed:124}));
    assert.notDeepEqual(a.questions.map(q=>q.key),b.questions.map(q=>q.key));
    assert.notEqual(a.studentTex,b.studentTex);
  }
});
test('scaffolded worksheets include one model, two hints and independently answered questions',()=>{
  const a=generateWorksheet(defaults('quadratics',{style:'scaffolded',count:10}));
  assert.equal((a.studentTex.match(/Worked model:/g)||[]).length,1);
  assert.equal((a.studentTex.match(/\\textit\{Hint:\}/g)||[]).length,2);
  assert.equal((a.solutionsTex.match(/Worked model:/g)||[]).length,0);
});
test('answers-only format changes teacher output but not the student questions',()=>{
  const opts=defaults('sampling',{style:'independent',seed:8812});
  const worked=generateWorksheet(opts);
  const answers=generateWorksheet({...opts,solutions:'answers'});
  assert.equal(worked.studentTex,answers.studentTex);
  assert.notEqual(worked.solutionsTex,answers.solutionsTex);
  assert.equal(answers.solutionsFilename,'answers.tex');
  assert.equal(worked.solutionsFilename,'worked-solutions.tex');
});
test('invalid settings give useful errors rather than duplicates or silent defaults',()=>{
  assert.throws(()=>generateWorksheet(defaults('unknown')),/No worksheet/);
  assert.throws(()=>generateWorksheet(defaults('sampling',{count:20})),/4 and 16/);
  assert.throws(()=>generateWorksheet(defaults('sampling',{seed:0})),/whole number/);
  assert.throws(()=>generateWorksheet(defaults('sampling',{seed:'not-a-number'})),/whole number/);
  assert.throws(()=>generateWorksheet(defaults('sampling',{skills:[]})),/at least one/);
  assert.throws(()=>generateWorksheet(defaults('sampling',{skills:['broken']})),/at least one/);
  assert.throws(()=>generateWorksheet(defaults('sampling',{count:8,skills:['terms']})),/Only 6 distinct questions/);
  assert.throws(()=>generateWorksheet(defaults('quadratics',{style:'impossible'})),/supported worksheet style/);
});
test('plain user-entered titles are escaped in LaTeX, not interpreted as TeX macros',()=>{
  const title='Math & Proofs_50% #1 {Part} $x^2$ ~ \\';
  const worksheet=generateWorksheet(defaults('quadratics',{title}));
  assert.ok(worksheet.studentTex.includes(escapeLatexText(title)));
  assert.ok(worksheet.studentTex.includes('\\$x\\textasciicircum{}2\\
  assert.match(worksheet.studentTex,/\\textasciitilde\{\}/);
  assert.match(worksheet.studentTex,/\\textbackslash\{\}/);
  assert.ok(!worksheet.studentTex.includes(title));
  assert.equal(WORKSHEET_VERSION,1);
  assert.equal(escapeLatexText('A&B'),'A\\&B');
});
test('stratified allocations always sum to the specified sample size',()=>{
  for(let seed=1;seed<=35;seed++){
    const w=generateWorksheet(defaults('sampling',{seed,count:16,skills:['allocation']}));
    for(const q of w.questions){
      const m=q.signature.match(/^alloc:(\d+):(\d+):(\d+):(\d+)$/);
      assert.ok(m);
      const [a,b,c,divisor]=m.slice(1).map(Number);
      const n=(a+b+c)/divisor;
      assert.ok(Number.isInteger(n));
      for(const x of [a,b,c])assert.ok(Number.isInteger(x/divisor));
      assert.equal(a/divisor+b/divisor+c/divisor,n);
      assert.match(q.solutionTex,new RegExp(String(n)+'\\\\times'));
    }
  }
});
test('factorised and expanded quadratic questions preserve the exact roots',()=>{
  for(let seed=1;seed<=35;seed++){
    const w=generateWorksheet(defaults('quadratics',{seed,count:16,skills:['roots','expanded']}));
    for(const q of w.questions){
      const m=q.signature.match(/^(?:roots|expanded):(-?\d+):(-?\d+)$/);
      assert.ok(m);
      const [p,r]=m.slice(1).map(Number);
      assert.notEqual(p,r);
      assert.ok(q.answerTex.includes('x='+p));
      assert.ok(q.answerTex.includes('x='+r));
      if(q.skill==='expanded'){
        assert.ok(q.solutionTex.includes(String(p*r)));
        assert.ok(q.hintTex.includes(String(p+r)));
      }
    }
  }
});
test('discriminants are calculated and classified consistently',()=>{
  for(let seed=1;seed<=30;seed++){
    const w=generateWorksheet(defaults('quadratics',{seed,count:16,skills:['discriminant']}));
    for(const q of w.questions){
      const m=q.signature.match(/^disc:(-?\d+):(-?\d+):(-?\d+)$/);
      assert.ok(m);
      const [a,b,c]=m.slice(1).map(Number),D=b*b-4*a*c;
      const n=D>0?2:D===0?1:0;
      assert.ok(q.answerTex.includes('\\Delta='+D));
      assert.ok(q.answerTex.includes(n+' distinct real'));
      assert.ok(q.solutionTex.includes('='+D+'.'));
    }
  }
});
));
  assert.match(worksheet.studentTex,/\\textasciitilde\{\}/);
  assert.match(worksheet.studentTex,/\\textbackslash\{\}/);
  assert.ok(!worksheet.studentTex.includes(title));
  assert.equal(WORKSHEET_VERSION,1);
  assert.equal(escapeLatexText('A&B'),'A\\&B');
});
test('stratified allocations always sum to the specified sample size',()=>{
  for(let seed=1;seed<=35;seed++){
    const w=generateWorksheet(defaults('sampling',{seed,count:16,skills:['allocation']}));
    for(const q of w.questions){
      const m=q.signature.match(/^alloc:(\d+):(\d+):(\d+):(\d+)$/);
      assert.ok(m);
      const [a,b,c,divisor]=m.slice(1).map(Number);
      const n=(a+b+c)/divisor;
      assert.ok(Number.isInteger(n));
      for(const x of [a,b,c])assert.ok(Number.isInteger(x/divisor));
      assert.equal(a/divisor+b/divisor+c/divisor,n);
      assert.match(q.solutionTex,new RegExp(String(n)+'\\\\times'));
    }
  }
});
test('factorised and expanded quadratic questions preserve the exact roots',()=>{
  for(let seed=1;seed<=35;seed++){
    const w=generateWorksheet(defaults('quadratics',{seed,count:16,skills:['roots','expanded']}));
    for(const q of w.questions){
      const m=q.signature.match(/^(?:roots|expanded):(-?\d+):(-?\d+)$/);
      assert.ok(m);
      const [p,r]=m.slice(1).map(Number);
      assert.notEqual(p,r);
      assert.ok(q.answerTex.includes('x='+p));
      assert.ok(q.answerTex.includes('x='+r));
      if(q.skill==='expanded'){
        assert.ok(q.solutionTex.includes(String(p*r)));
        assert.ok(q.hintTex.includes(String(p+r)));
      }
    }
  }
});
test('discriminants are calculated and classified consistently',()=>{
  for(let seed=1;seed<=30;seed++){
    const w=generateWorksheet(defaults('quadratics',{seed,count:16,skills:['discriminant']}));
    for(const q of w.questions){
      const m=q.signature.match(/^disc:(-?\d+):(-?\d+):(-?\d+)$/);
      assert.ok(m);
      const [a,b,c]=m.slice(1).map(Number),D=b*b-4*a*c;
      const n=D>0?2:D===0?1:0;
      assert.ok(q.answerTex.includes('\\Delta='+D));
      assert.ok(q.answerTex.includes(n+' distinct real'));
      assert.ok(q.solutionTex.includes('='+D+'.'));
    }
  }
});
