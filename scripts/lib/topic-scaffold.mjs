// Node-only Topic Creator: writes source files but never evaluates authored mathematics.
import {mkdir,readFile,writeFile,rm,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
export const MODES=Object.freeze(['understand','memorise','fluency','reasoning','problemSolving',
  'modelling','games','examPractice']);
const SLUG=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ALIASES={'problem-solving':'problemSolving','exam-practice':'examPractice'};
const q=value=>JSON.stringify(String(value));
export function requestedModes(raw){
  const items=Array.isArray(raw)?raw:String(raw||'understand').split(',').map(s=>s.trim()).filter(Boolean);
  const result=new Set(['understand']);
  for(const rawMode of items){
    const mode=ALIASES[rawMode]||rawMode;
    if(!MODES.includes(mode))throw Error('Unsupported mode '+rawMode+'. Use '+MODES.join(', '));
    result.add(mode);
  }
  return MODES.filter(mode=>result.has(mode));
}
export function validateOptions(options){
  const id=options.id||'',title=options.title||'';
  if(!SLUG.test(id)||id.length>54)throw Error('Topic ID must be a lowercase hyphenated slug (max 54 characters).');
  if(typeof title!=='string'||title.trim().length<3||title.length>90)
    throw Error('Title must contain 3–90 characters.');
  for(const key of ['subject','qualification','level']){
    const value=options[key];
    if(value!==undefined&&(typeof value!=='string'||!value.trim()||value.length>100))
      throw Error(key+' must be plain text of 1–100 characters.');
  }
  if(options.paper&&!['ruled','squared','plain'].includes(options.paper))
    throw Error('Paper must be ruled, squared or plain.');
  return {
    id,title:title.trim(),subject:(options.subject||'Mathematics').trim(),
    qualification:(options.qualification||'Unspecified').trim(),
    level:(options.level||'Unspecified').trim(),
    paper:options.paper||'squared',plannedModes:requestedModes(options.modes)
  };
}
const simple=name=>'// Author reviewed '+name+' pages before enabling this mode in manifest.js.\n'+
  'export const '+name+'=[];\n';
export function templateFiles(raw){
  const o=validateOptions(raw);
  const modes=Object.fromEntries(MODES.map(mode=>[mode,mode==='understand']));
  const manifest={id:o.id,title:o.title,subject:o.subject,paper:o.paper,
    qualification:o.qualification,level:o.level,
    authoring:{status:'draft',plannedModes:o.plannedModes},modes,worksheetSkills:[]};
  const files={
    'manifest.js':'// Authoring status controls whether this topic appears in the hub.\n'+
      'export const manifest=Object.freeze('+JSON.stringify(manifest,null,2)+');\n',
    'understand.js':String.raw`// Replace all TODO text with real maths, visual representations and reviewed examples.
import {section,lesson,text,note,comparison,diagram,check,method,workshop,visual} from '../builders/understand.js';
export const understand=[
  section('big-idea','The big idea',
    'Explain the key mathematical concepts and why they matter.',
    [lesson('overview',
      text('TODO: Explain the central concept with correct mathematical notation.'),
      note('TODO: Identify a misconception and explain why it is incorrect.'))]),
  section('how-it-works','How it works',
    'Build a method logically and explain each mathematical step.',
    [lesson('method',text('TODO: Add a step-by-step method and diagnostic question.'))]),
  section('visual-explanations','Visual explanations',
    'Connect a useful representation to mathematical reasoning.',
    [lesson('visual-introduction',text('TODO: Add a diagram or interactive explorer.'))]),
  section('worked-examples','Worked examples',
    'Use Show me, Help me and My turn to develop independence.',
    [lesson('practice-introduction',text('TODO: Add a complete workshop with worked and independent examples.'))])
];
`,
    'memorise.js':String.raw`// Define cards, clozes and retrieval pages before enabling Memorise.
export const cards=[];
export const clozes=[];
export const cloze=[];
export const memorise=[];
`,
    'fluency.js':simple('fluency'),
    'fluency-families.js':String.raw`// Each reviewed generator returns a prompt, numerical answer, steps, hint,
// targeted misconception feedback, marks and deterministic signature.
export const fluencyFamilies=Object.freeze({});
`,
    'fluency-scaffolds.js':String.raw`export const scaffolds=Object.freeze({
  guided:Object.freeze({}),structured:Object.freeze({})
});
`,
    'worksheet-families.js':String.raw`// A worksheet family has an id, skill and create(rng,difficulty,topic).
// Each question needs a fully checked answer, working and LaTeX representation.
export const worksheetFamilies=Object.freeze([]);
`,
    'reasoning.js':simple('reasoning'),
    'problem-solving.js':simple('problemSolving'),
    'modelling.js':simple('modelling'),
    'games.js':simple('games'),
    'exam-practice.js':simple('examPractice'),
    'question-bank.js':String.raw`// Executable generators stay outside cloneable topic data.
import {fluencyFamilies} from './fluency-families.js';
import {worksheetFamilies} from './worksheet-families.js';
import {scaffolds} from './fluency-scaffolds.js';
export const questionBank=Object.freeze({
  schemaVersion:1,fluency:fluencyFamilies,worksheet:worksheetFamilies,scaffolds
});
`,
    'visuals.js':String.raw`// Named diagrams and explorers go here; see docs/VISUAL_PACK_PASS3.md.
export const visuals=Object.freeze({schemaVersion:1,diagrams:{},explorers:{}});
`,
    'index.js':String.raw`// The topic object contains only serialisable lesson content.
import {manifest} from './manifest.js';
import {understand} from './understand.js';
import {cards,clozes,cloze,memorise} from './memorise.js';
import {fluency} from './fluency.js';
import {reasoning} from './reasoning.js';
import {problemSolving} from './problem-solving.js';
import {modelling} from './modelling.js';
import {games} from './games.js';
import {examPractice} from './exam-practice.js';
export const topic=Object.freeze({...manifest,cards,clozes,cloze,
  chapters:{understand,memorise,fluency,reasoning,problemSolving,modelling,games,examPractice}});
`,
    'AUTHORING.md':'# '+o.title+'\n\nThis pack is a DRAFT and hidden from the public hub.\n\n'+
      '1. Replace all TODO text with accurate subject-specific explanations.\n'+
      '2. Add a diagram and concept check, method stepper, interactive visual and complete workshop.\n'+
      '3. Build requested modes, then enable them in manifest.modes once validated.\n'+
      '4. Register reviewed question families and visual definitions where needed.\n'+
      '5. Run npm run audit:topic -- --topic '+o.id+'.\n'+
      '6. Run npm run preview:topic -- --topic '+o.id+' to review the book.\n'+
      '7. After passing all quality checks, change authoring.status to ready.\n'+
      '8. Run npm run build:site -- --topic '+o.id+' to export a publishable site.\n\n'+
      'Planned modes: '+o.plannedModes.join(', ')+'.\n'
  };
  return {options:o,files};
}
export function registerTopic(source,id){
  if(!SLUG.test(id))throw Error('Invalid topic slug');
  const imports='// @topic-creator:imports',entries='  // @topic-creator:entries';
  if(source.split(imports).length!==2||source.split(entries).length!==2)
    throw Error('Topic registry markers missing or duplicated.');
  if(source.includes("from './"+id+"/"))throw Error('Topic already exists in registry.');
  const symbol=id.replaceAll('-','_'),t='topic_'+symbol,q='question_'+symbol,v='visual_'+symbol;
  const importLines=[
    "import {topic as "+t+"} from './"+id+"/index.js';",
    "import {questionBank as "+q+"} from './"+id+"/question-bank.js';",
    "import {visuals as "+v+"} from './"+id+"/visuals.js';"
  ].join('\n');
  return source.replace(imports,importLines+'\n'+imports)
    .replace(entries,'  {topic:'+t+',questionBank:'+q+',visuals:'+v+'},\n'+entries);
}
export async function scaffoldTopic(options,{root=resolve(import.meta.dirname,'../..'),dryRun=false}={}){
  const {options:o,files}=templateFiles(options);
  const directory=join(root,'src','topic-packs',o.id);
  const registryPath=join(root,'src','topic-packs','registry.js');
  try{await access(directory);throw Error('Topic already exists: '+o.id);}
  catch(error){if(error.code!=='ENOENT')throw error;}
  const original=await readFile(registryPath,'utf8');
  const updated=registerTopic(original,o.id);
  if(dryRun)return {topicId:o.id,files:Object.keys(files),directory,registered:false,dryRun:true};
  await mkdir(directory,{recursive:false});
  try{
    for(const [file,content] of Object.entries(files))await writeFile(join(directory,file),content,'utf8');
    await writeFile(registryPath,updated,'utf8');
  }catch(error){
    await rm(directory,{recursive:true,force:true});
    try{await writeFile(registryPath,original,'utf8');}catch{/* registry may be read-only */}
    throw error;
  }
  return {topicId:o.id,files:Object.keys(files),directory,registered:true,dryRun:false};
}
