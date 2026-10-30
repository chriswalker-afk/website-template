// Reusable readiness audit: structural validation plus teaching-content requirements.
import {readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateTopics} from '../../src/logic.js';
import {validateFluencyQuestion,rngFromSeed} from '../../src/fluency-engine.js';
import {MODES} from './topic-scaffold.mjs';
const root=resolve(import.meta.dirname,'../..');
const SLUG=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const TODO=/\b(?:TODO|TBD|FIXME|LOREM IPSUM|PLACEHOLDER)\b/i;
const asciiMath=/\b[A-Za-z]\s*\^\s*\{?[0-9a-zA-Z]+\}?|\b(?:sqrt|frac)\s*\(|(?:<=|>=)/;
const fields=new Set(['text','definition','prompt','caption','description','focus','steps',
 'feedback','hint','solution','objective','mechanic','term','explanation','label','answer']);
function collectStudentText(node,path='',out=[]){
  if(Array.isArray(node)){
    node.forEach((item,i)=>collectStudentText(item,path+'['+i+']',out));return out;
  }
  if(!node||typeof node!=='object')return out;
  for(const [key,value] of Object.entries(node)){
    const current=path?path+'.'+key:key;
    if(typeof value==='string'&&fields.has(key))out.push({path:current,value});
    else if(value&&typeof value==='object')collectStudentText(value,current,out);
  }
  return out;
}
function hasBlock(section,kind){
  return section?.pages?.some(page=>
    (page.blocks||[]).some(block=>block.kind===kind))||false;
}
function hasVisual(section){
  return section?.pages?.some(page=>
    ['graph','visual','sampling-lab'].includes(page.type)||
    (page.blocks||[]).some(block=>block.kind==='diagram'))||false;
}
function hasWorkshop(section){
  return section?.pages?.some(page=>page.type==='workshop')||false;
}
function countsFor(topic,bank,visuals){
  const modes={};
  for(const mode of MODES){
    const sections=topic?.chapters?.[mode]||[];
    modes[mode]={enabled:topic?.modes?.[mode]===true,sections:sections.length,
      pages:sections.reduce((sum,s)=>sum+(s.pages?.length||0),0)};
  }
  return {modes,cards:topic?.cards?.length||0,clozes:topic?.clozes?.length||0,
    fluencyFamilies:Object.keys(bank?.fluency||{}).length,
    worksheetFamilies:bank?.worksheet?.length||0,
    diagrams:Object.keys(visuals?.diagrams||{}).length,
    explorers:Object.keys(visuals?.explorers||{}).length};
}
export function auditTopicRecord(topic,questionBank,visuals){
  const structuralErrors=[],blockers=[],warnings=[];
  const id=topic?.id||'(unnamed)';
  if(!topic||!questionBank||!visuals)return {
    id,structuralErrors:['Missing topic, question bank or visual pack.'],
    blockers:[],warnings:[],counts:null,publicationReady:false
  };
  try{
    const augmented={...topic,questionBank,visuals};
    structuralErrors.push(...validateTopics({[id]:augmented}));
  }catch(error){structuralErrors.push('Validation could not complete: '+error.message);}
  const sections=Object.fromEntries((topic.chapters?.understand||[]).map(s=>[s.id,s]));
  if(topic.modes?.understand!==false){
    if(!hasBlock(sections['big-idea'],'concept-check'))
      blockers.push('Understand / The big idea: add a diagnostic concept check with specific feedback.');
    if(!hasVisual(sections['big-idea'])&&!hasBlock(sections['big-idea'],'comparison'))
      blockers.push('Understand / The big idea: add a diagram or meaningful comparison.');
    if(!hasBlock(sections['how-it-works'],'stepper'))
      blockers.push('Understand / How it works: add a fully explained method stepper.');
    if(!hasVisual(sections['visual-explanations']))
      blockers.push('Understand / Visual explanations: add an authored visual or mathematical diagram.');
    if(!hasWorkshop(sections['worked-examples']))
      blockers.push('Understand / Worked examples: include a complete Show me → Help me → My turn workshop.');
  }
  const draft=topic.authoring?.status==='draft';
  if(topic.authoring&& !['draft','ready'].includes(topic.authoring.status))
    blockers.push('Set authoring.status to draft or ready.');
  if(draft)blockers.push('Publication is disabled while authoring.status is draft.');
  const planned=topic.authoring?.plannedModes||[];
  if(!Array.isArray(planned)||planned.some(m=>!MODES.includes(m)))
    blockers.push('authoring.plannedModes must contain recognised learning modes.');
  else for(const mode of planned){
    if(topic.modes?.[mode]!==true||!(topic.chapters?.[mode]?.length))
      blockers.push('Planned mode '+mode+' is not yet complete and enabled.');
  }
  if(topic.authoring){
    if(!topic.qualification||topic.qualification==='Unspecified')
      blockers.push('Set the qualification/specification before publishing.');
    if(!topic.level||topic.level==='Unspecified')
      blockers.push('Set the intended tier or level before publishing.');
  }
  const content=collectStudentText({
    chapters:topic.chapters,cards:topic.cards,clozes:topic.clozes
  });
  const locations=new Set();
  for(const entry of content){
    if(TODO.test(entry.value)){
      blockers.push('Replace placeholder content in '+entry.path+'.');
      locations.add(entry.path);
    }
    // Explicit LaTeX inline spans are fine; ambiguous ASCII operators in
    // plain prose are not silently rewritten into invented mathematics.
    const plain=entry.value.replace(/\\\([\s\S]*?\\\)/g,'').replace(/\\\[[\s\S]*?\\\]/g,'');
    const opens=(entry.value.match(/\\\(/g)||[]).length,closes=(entry.value.match(/\\\)/g)||[]).length;
    if(opens!==closes)blockers.push('Unbalanced inline LaTeX delimiters in '+entry.path+'.');
    if(asciiMath.test(plain)){
      const message='Use explicit LaTeX or proper mathematical notation in '+entry.path+'.';
      if(topic.authoring)blockers.push(message);else warnings.push(message);
    }
  }
  if(topic.modes?.fluency){
    for(const [family,create] of Object.entries(questionBank.fluency||{})){
      if(typeof create!=='function')continue;
      for(const seed of [1,47,2026]){
        try{
          const q=create(rngFromSeed(seed));
          const error=validateFluencyQuestion(q);
          if(error)blockers.push('Fluency '+family+' (seed '+seed+'): '+error);
          else if(q.family!==family)blockers.push('Fluency '+family+': generated family ID differs.');
        }catch(error){blockers.push('Fluency '+family+' (seed '+seed+') failed: '+error.message);}
      }
    }
  }
  for(const family of questionBank.worksheet||[]){
    if(typeof family.create!=='function')continue;
    try{
      const q=family.create(rngFromSeed(1234),'secure',topic);
      if(!q||!q.signature||!q.questionTex||!q.answerTex||!q.solutionTex||!q.hintTex||
         !Number.isInteger(q.marks)||q.marks<1)
        blockers.push('Worksheet '+family.id+': missing question, answer, hint or worked solution.');
    }catch(error){blockers.push('Worksheet '+family.id+': generation failed: '+error.message);}
  }
  if(topic.modes?.games)warnings.push('Games are currently previews; verify implementation before sharing as playable activities.');
  return {id,title:topic.title,status:topic.authoring?.status||'legacy',
    structuralErrors:[...new Set(structuralErrors)],
    blockers:[...new Set(blockers)],warnings:[...new Set(warnings)],
    counts:countsFor(topic,questionBank,visuals),
    publicationReady:!structuralErrors.length&&!blockers.length};
}
export async function loadTopic(id,{projectRoot=root}={}){
  if(!SLUG.test(id))throw Error('Invalid topic ID.');
  const dir=join(projectRoot,'src','topic-packs',id);
  const load=name=>import(pathToFileURL(join(dir,name)).href);
  const [{topic},{questionBank},{visuals}]=await Promise.all([
    load('index.js'),load('question-bank.js'),load('visuals.js')
  ]);
  if(topic?.id!==id)throw Error('Topic folder and manifest ID disagree.');
  return {topic,questionBank,visuals};
}
export async function auditTopic(id,options={}){
  const record=await loadTopic(id,options);
  return auditTopicRecord(record.topic,record.questionBank,record.visuals);
}
export async function topicIds({projectRoot=root}={}){
  const entries=await readdir(join(projectRoot,'src','topic-packs'),{withFileTypes:true});
  return entries.filter(entry=>entry.isDirectory()&&SLUG.test(entry.name)&&entry.name!=='builders')
    .map(entry=>entry.name).sort();
}
export function reportText(report){
  const c=report.counts;
  const lines=[
    report.title+' ('+report.id+') — '+(report.publicationReady?'READY':'NOT READY')+
      ' ['+report.status+']',
    c?'Teaching modes: '+Object.entries(c.modes).map(([mode,v])=>
      mode+':'+(v.enabled?v.pages+' pages':'off')).join(', '):'No valid topic',
    c?'Vocabulary '+c.cards+' | Fluency families '+c.fluencyFamilies+
      ' | Worksheet families '+c.worksheetFamilies+
      ' | Diagrams '+c.diagrams+' | Explorers '+c.explorers:'',
    'Structural errors: '+report.structuralErrors.length+
      ' | Publication blockers: '+report.blockers.length+
      ' | Notation/other warnings: '+report.warnings.length
  ];
  for(const [heading,items] of [['ERROR',report.structuralErrors],
    ['FIX',report.blockers],['CHECK',report.warnings]])
    for(const message of items)lines.push('  '+heading+': '+message);
  return lines.filter(Boolean).join('\n');
}
