// Teacher-side read-only question preview. Never runs inside the student app.
import {AUTHORING_PACKS} from '../topic-packs/registry.js';
import {renderMathematicalText} from '../math-notation.js';
import {catalogueFor,previewFamily,acceptedAnswerExamples,testPreviewAnswer,
  auditFamily,auditTopicFamilies,validSeed,WORKSHOP_DIFFICULTIES,
  WORKSHOP_AUDIT_COUNTS} from './core.js';

const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const maths=value=>renderMathematicalText(String(value??''));
const state={registration:null,entries:[],familyKey:null,seed:2026,
  difficulty:'secure',preview:null,report:null};
const query=new URLSearchParams(location.search);
const starts={topic:query.get('topic'),family:query.get('family'),
  seed:validSeed(query.get('seed'))||2026,
  difficulty:WORKSHOP_DIFFICULTIES.includes(query.get('difficulty'))?
    query.get('difficulty'):'secure'};
function notice(message){$('studio-notice').textContent=message;}
function selectedEntry(){return state.entries.find(entry=>entry.key===state.familyKey)||null;}
function buildUrl(){
  const url=new URL(location.href);
  url.hash='';
  url.search='';
  url.searchParams.set('topic',state.registration.topic.id);
  if(state.familyKey)url.searchParams.set('family',state.familyKey);
  url.searchParams.set('seed',String(state.seed));
  url.searchParams.set('difficulty',state.difficulty);
  return url;
}
function syncUrl(){history.replaceState(null,'',buildUrl());}
function chooseTopic(topicId,preferFamily){
  state.registration=AUTHORING_PACKS.find(r=>r.topic.id===topicId)||AUTHORING_PACKS[0];
  if(!state.registration)throw new Error('No registered topic packs found');
  state.entries=catalogueFor(state.registration);
  state.familyKey=state.entries.find(f=>f.key===preferFamily)?.key||state.entries[0]?.key||null;
  state.preview=null;state.report=null;
  $('studio-topic').value=state.registration.topic.id;
  const topic=state.registration.topic;
  const status=topic.authoring?.status==='draft'?'Draft · not on student hub':
    topic.authoring?.status==='ready'?'Ready topic':'Published legacy topic';
  $('studio-topic-detail').textContent=[
    topic.qualification||topic.subject||'Mathematics',topic.level,status
  ].filter(Boolean).join(' · ');
  const student=$('studio-student-link');
  student.href='./index.html#/'+topic.id+'/home';
  if(topic.authoring?.status==='draft'){
    student.removeAttribute('href');student.setAttribute('aria-disabled','true');
    student.textContent='Draft hidden from students';
  }else{
    student.setAttribute('href','./index.html#/'+topic.id+'/home');
    student.removeAttribute('aria-disabled');
    student.textContent='Open student site ↗';
  }
  $('studio-search').value='';$('studio-type').value='all';
  renderFamilyList();
  resetAudit();
  showPreview();
  syncUrl();
}
function renderFamilyList(){
  const search=$('studio-search').value.trim().toLowerCase();
  const type=$('studio-type').value;
  const entries=state.entries.filter(x=>(type==='all'||x.type===type)&&
    (!search||[x.id,x.label,x.skill,...x.uses].join(' ').toLowerCase().includes(search)));
  $('studio-family-count').textContent='('+entries.length+' / '+state.entries.length+')';
  if(!entries.length){
    $('studio-families').innerHTML='<p class="qw-empty">No question families match this filter. Try another topic or search term.</p>';
    return;
  }
  let current='';
  $('studio-families').innerHTML=entries.map(item=>{
    const group=item.type==='fluency'?'Fluency':'Printable worksheets';
    const heading=group!==current?'<div class="qw-family-section">'+escapeHTML(group)+'</div>':'';
    current=group;
    return heading+'<button type="button" class="qw-family-button" data-family-key="'+escapeHTML(item.key)+'"'+
      ' aria-pressed="'+(item.key===state.familyKey)+'">'+
      '<span class="qw-family-button__title">'+escapeHTML(item.label)+'</span>'+
      '<span class="qw-family-button__meta">'+escapeHTML(item.skill)+'</span></button>';
  }).join('');
}
function chooseFamily(key){
  if(!state.entries.some(f=>f.key===key))return;
  state.familyKey=key;state.preview=null;
  renderFamilyList();showPreview();syncUrl();
}
function variationCard(seed){
  try{
    const q=previewFamily(state.registration,state.familyKey,{seed,difficulty:state.difficulty});
    return '<button class="qw-variation" type="button" data-variation-seed="'+seed+'">'+
      '<small>Seed #'+seed+'</small><span>'+escapeHTML(q.prompt)+'</span>'+
      '<strong>'+escapeHTML(String(q.marks))+' marks · Open variation ↗</strong></button>';
  }catch(error){
    return '<div class="qw-variation"><small>Seed #'+seed+'</small><span>'+
      escapeHTML(error.message)+'</span></div>';
  }
}
function renderQuestion(preview){
  const p=preview;
  const source='./src/topic-packs/'+p.topicId+'/'+
    (p.type==='worksheet'?'worksheet-families.js':'fluency-families.js');
  const answer=p.type==='fluency'?
    '<div class="qw-math">'+maths(p.answerDisplay)+'</div>':
    '<code>'+escapeHTML(p.answerDisplay)+'</code>';
  const solution=p.type==='fluency'?
    '<ol class="qw-paper__steps">'+p.steps.map(step=>'<li>'+maths(step)+'</li>').join('')+'</ol>':
    '<p class="qw-paper__secondary">Printable LaTeX solution source (not a compiled PDF):</p>'+
    '<pre class="qw-source">'+escapeHTML(p.steps[0])+'</pre>';
  const printable=p.type==='worksheet'?
    '<details><summary>Inspect printable question and hint LaTeX</summary>'+
    '<pre class="qw-source">'+escapeHTML(p.question.questionTex)+'\n\n'+
    escapeHTML(p.question.hintTex)+'</pre></details>':'';
  return '<div data-preview-seed="'+p.seed+'" data-preview-signature="'+escapeHTML(p.signature)+'">'+
    '<div class="qw-paper__topline"><span class="qw-paper__eyebrow">'+
    escapeHTML(p.type==='fluency'?'Fluency · '+p.answerKind:'Worksheet · '+p.difficulty)+
    '</span><span class="qw-paper__eyebrow">'+p.marks+' marks</span></div>'+
    '<p class="qw-paper__question">'+maths(p.prompt)+'</p>'+
    '<div class="qw-paper__answer"><strong>Expected answer</strong>'+answer+'</div>'+
    '<p class="qw-paper__eyebrow">Fully worked solution</p>'+solution+
    '<div class="qw-paper__hint"><strong>Hint:</strong> '+
    (p.type==='fluency'?maths(p.hint):'<code>'+escapeHTML(p.hint)+'</code>')+'</div>'+
    (p.misconception?'<p class="qw-paper__secondary"><strong>Common mistake:</strong> '+
      maths(p.misconception)+'</p>':'')+
    printable+
    '<p class="qw-paper__footer">Signature: <code>'+escapeHTML(p.signature)+'</code>'+
    ' · Source: <a href="'+escapeHTML(source)+'" target="_blank" rel="noopener">'+
    escapeHTML(source.split('/').at(-1))+' ↗</a></p></div>';
}
function renderExamples(){
  const examples=$('studio-answer-examples');
  const form=$('studio-answer-form');
  $('studio-answer-input').value='';
  $('studio-answer-result').dataset.state='';
  if(!state.preview||state.preview.type!=='fluency'){
    examples.innerHTML='<p class="qw-paper__secondary">Printable questions have teacher-authored LaTeX answers and are not automatically marked by this tool.</p>';
    form.hidden=true;
    $('studio-answer-result').textContent='Check the question wording, answer and working against your specification and compile the LaTeX worksheet to verify layout.';
    return;
  }
  form.hidden=false;
  const list=acceptedAnswerExamples(state.preview);
  examples.innerHTML=list.length?list.map(example=>
    '<button class="qw-example" type="button" data-example="'+escapeHTML(example.value)+'">'+
    '<span>✓ '+escapeHTML(example.label)+'</span><code>'+escapeHTML(example.value)+'</code></button>'
  ).join(''):'<p class="qw-paper__secondary">No verified accepted-answer examples are available for this response type.</p>';
  $('studio-answer-result').textContent='Select a verified example or type an answer to test the exact student checker. Incorrect form and incorrect mathematics are distinguished.';
}
function showPreview(){
  const entry=selectedEntry();
  if(!entry){
    $('studio-preview').innerHTML='<p>There are no enabled question generators in this topic pack yet. Add families to the topic question bank.</p>';
    $('studio-preview-metadata').textContent='';
    $('studio-family-badge').textContent='No family';
    $('studio-variations').innerHTML='';
    state.preview=null;renderExamples();return;
  }
  $('studio-family-badge').textContent=entry.type==='fluency'?'Fluency':'Worksheet';
  $('studio-difficulty').disabled=entry.type==='fluency';
  try{
    const p=previewFamily(state.registration,state.familyKey,{
      seed:state.seed,difficulty:state.difficulty});
    state.preview=p;
    $('studio-preview').innerHTML=renderQuestion(p);
    $('studio-preview-metadata').textContent=entry.label+' · '+p.marks+' marks';
    $('studio-variations').innerHTML=[1,2].map(i=>variationCard(
      state.seed+i>999999999?i:state.seed+i)).join('');
    renderExamples();notice('');
  }catch(error){
    state.preview=null;
    $('studio-preview').innerHTML='<p class="qw-empty">Generator error: '+
      escapeHTML(error.message)+'</p>';
    $('studio-preview-metadata').textContent='Preview unavailable';
    $('studio-variations').innerHTML='';
    renderExamples();notice('Inspect this generator: '+error.message);
  }
}
function setSeed(value){
  const seed=validSeed(value);
  if(seed===null){notice('Choose a whole-number seed from 1 to 999999999.');return false;}
  state.seed=seed;
  $('studio-seed').value=String(seed);
  showPreview();syncUrl();return true;
}
function resetAudit(){
  state.report=null;
  $('studio-audit-summary').textContent='No audit run yet. Select a family and choose a check.';
  $('studio-audit-results').innerHTML='';
  $('studio-download-report').disabled=true;
}
function reportFromSingle(result){
  const topic=state.registration.topic;
  return {schemaVersion:1,topicId:topic.id,title:topic.title,
    authoringStatus:topic.authoring?.status||'legacy',
    startSeed:state.seed,count:Number($('studio-audit-count').value),
    results:[result],summary:{families:1,passed:Number(result.passed),
      failed:Number(!result.passed),warnings:result.warnings.length},
    limitation:'Seeded checks do not prove mathematical correctness; review the maths, worked solutions and intended level.'};
}
function renderReport(report){
  state.report=report;
  $('studio-download-report').disabled=false;
  const s=report.summary;
  $('studio-audit-summary').textContent=
    s.passed+' of '+s.families+' families passed structural and reference-answer checks · '+
    s.failed+' failed · '+s.warnings+' warnings. '+report.count+
    ' seed(s) per family'+(report.results.some(r=>r.type==='worksheet')?
      '; worksheets checked at all three difficulties.':'')+
    ' No independent mathematical proof is implied.';
  $('studio-audit-results').innerHTML=report.results.map(result=>{
    const errors=result.errors||[],warnings=result.warnings||[];
    const state=result.passed?'passed':'failed';
    return '<div class="qw-audit__row" data-state="'+state+'">'+
      '<div><span class="qw-audit__name">'+escapeHTML(result.label||result.familyId)+
      '</span><span class="qw-audit__details"> · '+result.tested+' attempts · '+
      result.distinct+' variations</span></div>'+
      '<span class="qw-audit__details">'+(result.passed?'✓ Checks pass':'Needs attention')+'</span>'+
      (errors.length+warnings.length?
        '<details style="flex-basis:100%"><summary>'+errors.length+' errors · '+
          warnings.length+' warnings</summary>'+
          (errors.length?'<ul class="qw-audit__error">'+errors.map(x=>
            '<li>'+escapeHTML(x)+'</li>').join('')+'</ul>':'')+
          (warnings.length?'<ul class="qw-audit__warning">'+warnings.map(x=>
            '<li>'+escapeHTML(x)+'</li>').join('')+'</ul>':'')+'</details>':'')+
      '<button type="button" data-audit-family="'+escapeHTML(result.key)+'">Inspect family</button></div>';
  }).join('');
}
function auditSelected(){
  const entry=selectedEntry();
  if(!entry){notice('Add a question family before running its audit.');return;}
  try{
    const count=Number($('studio-audit-count').value);
    if(!WORKSHOP_AUDIT_COUNTS.includes(count))throw Error('Invalid audit count');
    const result=auditFamily(state.registration,entry.key,{startSeed:state.seed,count});
    renderReport(reportFromSingle({...result,key:entry.key,label:entry.label,skill:entry.skill}));
    notice('Selected-family audit complete.');
  }catch(error){notice('Audit could not run: '+error.message);}
}
function auditAll(){
  try{
    const count=Number($('studio-audit-count').value);
    if(!WORKSHOP_AUDIT_COUNTS.includes(count))throw Error('Invalid audit count');
    renderReport(auditTopicFamilies(state.registration,{startSeed:state.seed,count}));
    notice('Topic-wide audit complete.');
  }catch(error){notice('Audit could not run: '+error.message);}
}
function downloadReport(){
  if(!state.report)return;
  const report={...state.report,exportedAt:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='question-qa-'+report.topicId+'-'+report.startSeed+'.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),0);
  notice('QA report downloaded. Review warnings before publishing.');
}
async function copyPreview(){
  const url=buildUrl().toString();
  try{
    if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
    await navigator.clipboard.writeText(url);notice('Preview link copied.');
  }catch{
    $('studio-share-help').hidden=false;
    $('studio-share-url').value=url;
    $('studio-share-url').focus();
    $('studio-share-url').select();
    notice('Select and copy the preview link from the field.');
  }
}
function initialise(){
  if(!AUTHORING_PACKS.length)throw Error('No topics are registered');
  $('studio-topic').innerHTML=AUTHORING_PACKS.map(({topic})=>
    '<option value="'+escapeHTML(topic.id)+'">'+escapeHTML(topic.title)+
    (topic.authoring?.status==='draft'?' · DRAFT':'')+'</option>').join('');
  state.seed=starts.seed;state.difficulty=starts.difficulty;
  $('studio-seed').value=String(state.seed);$('studio-difficulty').value=state.difficulty;
  chooseTopic(starts.topic,starts.family);

  $('studio-topic').addEventListener('change',event=>chooseTopic(event.target.value,null));
  $('studio-search').addEventListener('input',renderFamilyList);
  $('studio-type').addEventListener('change',renderFamilyList);
  $('studio-families').addEventListener('click',event=>{
    const button=event.target.closest('[data-family-key]');
    if(button)chooseFamily(button.dataset.familyKey);
  });
  $('studio-variations').addEventListener('click',event=>{
    const button=event.target.closest('[data-variation-seed]');
    if(button)setSeed(button.dataset.variationSeed);
  });
  $('studio-seed').addEventListener('change',event=>setSeed(event.target.value));
  $('studio-next-seed').addEventListener('click',()=>setSeed(
    state.seed===999999999?1:state.seed+1));
  $('studio-difficulty').addEventListener('change',event=>{
    if(!WORKSHOP_DIFFICULTIES.includes(event.target.value))return;
    state.difficulty=event.target.value;showPreview();syncUrl();
  });
  $('studio-copy-link').addEventListener('click',copyPreview);
  $('studio-answer-examples').addEventListener('click',event=>{
    const button=event.target.closest('[data-example]');
    if(!button)return;
    $('studio-answer-input').value=button.dataset.example;
    $('studio-answer-input').focus();
  });
  $('studio-answer-form').addEventListener('submit',event=>{
    event.preventDefault();
    const verdict=testPreviewAnswer(state.preview,$('studio-answer-input').value);
    const result=$('studio-answer-result');
    result.dataset.state=verdict.kind;
    result.textContent=(verdict.correct?'Accepted · ':'Not accepted · ')+verdict.message;
  });
  $('studio-audit-family').addEventListener('click',auditSelected);
  $('studio-audit-topic').addEventListener('click',auditAll);
  $('studio-download-report').addEventListener('click',downloadReport);
  $('studio-audit-results').addEventListener('click',event=>{
    const button=event.target.closest('[data-audit-family]');
    if(button){
      chooseFamily(button.dataset.auditFamily);
      $('question-preview-title').scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
}
try{initialise();}
catch(error){
  $('studio-preview').textContent='Could not open the Question Workshop: '+error.message;
  notice('Question Workshop unavailable.');
}
