// Shared, deterministic LaTeX Worksheet Generator. Authored mathematical
// question families and skill catalogues live in self-contained topic packs.
import {TOPICS} from './topics.js';
import {FLUENCY_CHAPTERS,makeFluencyQuestion,answerText,validateFluencyQuestion} from './fluency-engine.js';
import {fluencyFamiliesFor,worksheetFamiliesFor,worksheetSkillOptionsFor} from './question-bank.js';
import {escapeLatexText,makeRng,pick,shuffle} from './topic-packs/builders/worksheet-authoring.js';
export {escapeLatexText,makeRng};

export const WORKSHEET_VERSION=1;
export function worksheetSkills(topicId){return worksheetSkillOptionsFor(topicId);}
export function supportsWorksheets(topicId){return worksheetSkills(topicId).length>0;}

function fluencyTextTex(text){
  const symbols={
    '²':'\\textsuperscript{2}','−':'\\( - \\)','×':'\\(\\times\\)',
    '÷':'\\(\\div\\)','±':'\\(\\pm\\)','≈':'\\(\\approx\\)'
  };
  const parts=String(text).match(/√\([^()]*\)|√(?:\d+|[A-Za-z])|./gu)||[];
  return parts.map(part=>{
    if(part.startsWith('√')){
      const token=part.slice(1).replace(/^\((.*)\)$/u,'$1')
        .replaceAll('²','^{2}').replaceAll('−','-');
      return '\\(\\sqrt{'+token+'}\\)';
    }
    return symbols[part]||escapeLatexText(part);
  }).join('');
}
function toWorksheetFluencyQuestion(q){
  const list='\\begin{enumerate}[label=(\\alph*),leftmargin=*,itemsep=3pt]'+
    q.steps.map(step=>'\\item '+fluencyTextTex(step)).join('')+'\\end{enumerate}';
  return {
    signature:q.signature,marks:q.marks,spaceMm:Math.max(24,q.steps.length*12),
    prompt:q.prompt,questionTex:fluencyTextTex(q.prompt),
    answerTex:fluencyTextTex(answerText(q.answer)),
    solutionTex:list,hintTex:fluencyTextTex(q.hint)
  };
}
function fluencyFamily(topicId){
  return {id:'fluency-generated',skill:'fluency',create(rng,difficulty){
    const levels=difficulty==='developing'?[1]:difficulty==='stretch'?[3,4]:[2,3];
    const section=FLUENCY_CHAPTERS[topicId][pick(rng,levels)-1];
    const page=pick(rng,section.pages);
    const familyId=pick(rng,page.families);
    const q=makeFluencyQuestion(topicId,familyId,rng);
    const result=toWorksheetFluencyQuestion(q);
    return {...result,signature:section.id+':'+q.signature};
  }};
}
// The same generated Fluency questions can be exported into worksheets. The
// worksheet-only families are registered by topic rather than by this engine.
function allWorksheetFamilies(topicId){
  const result=[...worksheetFamiliesFor(topicId)];
  const topic=TOPICS[topicId];
  if(topic?.modes?.fluency!==false&&topic?.chapters?.fluency?.length&&
     Object.keys(fluencyFamiliesFor(topicId)).length)result.push(fluencyFamily(topicId));
  return result;
}
function settings(options){
  const topicId=options.topicId;
  if(!supportsWorksheets(topicId))throw Error('No worksheet question families exist for this topic.');
  const seed=Number(options.seed),count=Number(options.count);
  if(!Number.isSafeInteger(seed)||seed<1||seed>999999999)throw Error('The seed must be a whole number between 1 and 999999999.');
  if(!Number.isSafeInteger(count)||count<4||count>16)throw Error('Choose between 4 and 16 questions.');
  const style=options.style||'independent';
  if(!['independent','scaffolded','mixed'].includes(style))throw Error('Select a supported worksheet style.');
  const difficulty=options.difficulty||'secure';
  if(!['developing','secure','stretch'].includes(difficulty))throw Error('Select a supported difficulty.');
  const solutions=options.solutions||'worked';
  if(!['worked','answers'].includes(solutions))throw Error('Select a supported solution format.');
  const allowed=worksheetSkills(topicId).map(x=>x.id);
  const skills=options.skills===undefined?[...allowed]:options.skills;
  if(!Array.isArray(skills)||!skills.length||skills.some(x=>!allowed.includes(x)))throw Error('Select at least one available skill.');
  const title=String(options.title||TOPICS[topicId].title+' Worksheet').trim();
  if(!title||title.length>80)throw Error('Enter a worksheet title of 1–80 characters.');
  return {topicId,seed,count,style,difficulty,solutions,skills:[...new Set(skills)],title};
}
function renderDocument(topic,opts,questions,answers){
  const student=!answers;
  const title=escapeLatexText(opts.title)+(student?'':opts.solutions==='worked'?' - Worked Solutions':' - Answers');
  const lines=[
    '% Maths Notebook worksheet generator, version '+WORKSHEET_VERSION,
    '% Topic: '+topic.id+' | Seed: '+opts.seed+' | Style: '+opts.style,
    '\\documentclass[11pt,a4paper]{article}',
    '\\usepackage[T1]{fontenc}',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[a4paper,margin=20mm]{geometry}',
    '\\usepackage{amsmath,amssymb,enumitem}',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\parskip}{4pt}',
    '\\begin{document}',
    '\\begin{center}',
    '{\\Large\\bfseries '+title+'}',
    '\\end{center}'
  ];
  if(student){
    lines.push('\\noindent Name: \\rule{67mm}{0.4pt}\\hfill Date: \\rule{32mm}{0.4pt}',
      '\\par\\medskip',
      opts.style==='scaffolded'?'Use the model and early hints, then complete the remaining questions.':
      'Show your working where appropriate.');
  }else{
    lines.push('\\noindent Seed: '+opts.seed+'\\hfill '+questions.length+' questions.');
  }
  lines.push('\\begin{enumerate}[label=\\textbf{\\arabic*.},leftmargin=*,itemsep=1.5em]');
  for(let i=0;i<questions.length;i++){
    const q=questions[i];
    lines.push('% Question '+(i+1)+' | '+q.familyId+' | '+q.signature);
    if(student){
      lines.push('\\item \\begin{minipage}[t]{0.79\\linewidth}'+q.questionTex+'\\end{minipage}'+
        '\\hfill\\begin{minipage}[t]{0.19\\linewidth}\\raggedleft\\textit{['+q.marks+' marks]}\\end{minipage}');
      if(opts.style==='scaffolded'&&i===0){
        lines.push('\\par\\smallskip\\textit{Worked model:}\\par '+q.solutionTex+'\\par\\vspace{5mm}');
      }else{
        if(opts.style==='scaffolded'&&i<Math.min(3,questions.length)){
          lines.push('\\par\\textit{Hint:} '+q.hintTex);
        }
        lines.push('\\par\\vspace{'+q.spaceMm+'mm}');
      }
    }else{
      lines.push('\\item '+(opts.solutions==='worked'?q.solutionTex:'\\textbf{Answer:} '+q.answerTex));
    }
  }
  lines.push('\\end{enumerate}','\\end{document}','');
  return lines.join('\n');
}
export function generateWorksheet(options){
  const opts=settings(options);
  const families=allWorksheetFamilies(opts.topicId).filter(f=>opts.skills.includes(f.skill));
  if(!families.length)throw Error('No printable questions match those skills.');
  const topic=TOPICS[opts.topicId],rng=makeRng(opts.seed);
  const order=shuffle(rng,families);
  const seen=new Set(),questions=[];
  for(let attempt=0;attempt<opts.count*150&&questions.length<opts.count;attempt++){
    const family=order[attempt%order.length],q=family.create(rng,opts.difficulty,topic);
    const signature=family.id+':'+q.signature;
    if(seen.has(signature))continue;
    seen.add(signature);
    questions.push({...q,familyId:family.id,skill:family.skill,key:signature});
  }
  if(questions.length<opts.count){
    throw Error('Only '+questions.length+' distinct questions were available. Choose fewer questions or more skills.');
  }
  if(opts.style==='mixed'){
    const mixed=shuffle(rng,questions);
    questions.splice(0,questions.length,...mixed);
  }
  const studentTex=renderDocument(topic,opts,questions,false);
  const solutionsTex=renderDocument(topic,opts,questions,true);
  return {options:opts,questions,studentTex,solutionsTex,
    solutionsFilename:opts.solutions==='worked'?'worked-solutions.tex':'answers.tex'};
}

// Export precisely the current interactive set as an editable LaTeX worksheet.
export function generateWorksheetFromFluencySet(set){
  if(!set||!supportsWorksheets(set.topicId)||!Number.isSafeInteger(set.seed)||
     !Array.isArray(set.questions)||set.questions.length<1||set.questions.length>16||
     set.questions.some(q=>validateFluencyQuestion(q)))throw Error('Invalid Fluency practice set.');
  const topic=TOPICS[set.topicId];
  const levelNumber=Number(set.levelId?.replace('level-',''))||1;
  const options={topicId:topic.id,seed:set.seed,count:set.questions.length,
    difficulty:levelNumber===1?'developing':levelNumber===4?'stretch':'secure',
    style:'independent',solutions:'worked',skills:['fluency'],
    title:topic.title+' Fluency Practice'};
  const questions=set.questions.map(q=>({...toWorksheetFluencyQuestion(q),
    familyId:'fluency-generated',skill:'fluency',key:q.signature}));
  return {options,questions,studentTex:renderDocument(topic,options,questions,false),
    solutionsTex:renderDocument(topic,options,questions,true),
    solutionsFilename:'worked-solutions.tex'};
}
