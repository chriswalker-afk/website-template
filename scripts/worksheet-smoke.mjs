// Create deterministic source examples for LaTeX compilation and visual QA.
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {generateWorksheet} from '../src/worksheet-generator.js';
const root='test-artifacts/latex';
await mkdir(root,{recursive:true});
const cases=[
  {topicId:'sampling',seed:104,count:12,style:'mixed',difficulty:'secure',solutions:'worked'},
  {topicId:'quadratics',seed:205,count:12,style:'independent',difficulty:'stretch',solutions:'worked'},
  {topicId:'quadratics',seed:306,count:8,style:'scaffolded',difficulty:'developing',solutions:'answers'}
];
for(const opts of cases){
  const result=generateWorksheet(opts);
  const id=opts.topicId+'-'+opts.seed+'-'+opts.style;
  await writeFile(join(root,id+'-worksheet.tex'),result.studentTex,'utf8');
  await writeFile(join(root,id+'-solutions.tex'),result.solutionsTex,'utf8');
  console.log(id+': '+result.questions.length+' matched questions');
}
