// Create deterministic source examples for LaTeX compilation and visual QA.
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {generateWorksheet,generateWorksheetFromFluencySet} from '../src/worksheet-generator.js';
import {buildFluencySet} from '../src/fluency-engine.js';
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

for(const [topicId,levelId,pageId,seed] of [
  ['sampling','level-3','mixed',42021],
  ['quadratics','level-4','advanced',42022]
]){
  const set=buildFluencySet({topicId,levelId,pageId,seed,count:6});
  const result=generateWorksheetFromFluencySet(set);
  const name=topicId+'-fluency-exact-'+seed;
  await writeFile(join(root,name+'-worksheet.tex'),result.studentTex,'utf8');
  await writeFile(join(root,name+'-worked-solutions.tex'),result.solutionsTex,'utf8');
  console.log(name+': '+set.questions.length+' identical generated Fluency questions exported');
}
