#!/usr/bin/env node
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {scaffoldTopic,MODES} from './lib/topic-scaffold.mjs';
const usage=[
 'Create: npm run new-topic -- --id linear-graphs --title "Linear Graphs"',
 '  --subject Algebra --qualification 4MA1 --level Foundation',
 '  --paper squared --modes understand,memorise,fluency',
 'Run without arguments in a terminal for a guided setup.',
 'Optional --dry-run (only list files).',
 'Modes: '+MODES.join(', ')
].join('\n');
function flags(args){
  const allowed=new Set(['id','title','subject','qualification','level','paper','modes','dry-run','help']),result={};
  for(let i=0;i<args.length;i++){
    const flag=args[i],key=flag.slice(2);
    if(!flag.startsWith('--')||!allowed.has(key)||Object.hasOwn(result,key))
      throw Error('Unsupported or repeated option: '+flag);
    if(key==='dry-run'||key==='help'){result[key]=true;continue;}
    if(i+1===args.length||args[i+1].startsWith('--'))throw Error('Missing value for '+flag);
    result[key]=args[++i];
  }
  return result;
}
async function guided(){
  const rl=createInterface({input:stdin,output:stdout});
  try{
    const title=(await rl.question('Topic title: ')).trim();
    const suggested=title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,'')
      .trim().replace(/\s+/g,'-');
    const ask=async(label,fallback)=>{
      const answer=(await rl.question(label+' ['+fallback+']: ')).trim();
      return answer||fallback;
    };
    return {title,id:await ask('Topic ID',suggested),
      subject:await ask('Subject','Mathematics'),
      qualification:await ask('Qualification','Not specified'),
      level:await ask('Level / tier','Not specified'),
      paper:await ask('Page style (ruled, squared, plain)','squared'),
      modes:await ask('Learning modes (comma-separated)','understand')};
  }finally{rl.close();}
}
try{
  const args=flags(process.argv.slice(2));
  if(args.help){console.log(usage);process.exit(0);}
  if(!Object.keys(args).length&&!stdin.isTTY){console.error(usage);process.exit(2);}
  const values=Object.keys(args).length?args:await guided();
  const created=await scaffoldTopic(values,{dryRun:Boolean(args['dry-run'])});
  console.log((created.dryRun?'Would create ':'Created ')+created.topicId+
    ' ('+created.files.length+' files) in '+created.directory);
  if(!created.dryRun)console.log([
    'Draft hidden from the public hub until authoring.status becomes ready.',
    'Audit: npm run audit:topic -- --topic '+created.topicId,
    'Preview: npm run preview:topic -- --topic '+created.topicId
  ].join('\n'));
}catch(error){console.error('Topic Creator: '+error.message);process.exitCode=1;}
