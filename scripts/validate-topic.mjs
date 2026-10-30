#!/usr/bin/env node
// Review one or all topic packs. Draft warnings do not fail structural CI.
import {auditTopic,topicIds,reportText,failsPublicationGate} from './lib/topic-audit.mjs';
function flags(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(!['--topic','--all','--strict','--structural','--json','--help'].includes(arg))
      throw Error('Unknown option '+arg);
    if(arg==='--topic'){
      if(!argv[i+1])throw Error('Missing topic ID after --topic');
      out.topic=argv[++i];
    }else out[arg.slice(2)]=true;
  }
  if(out.topic&&out.all)throw Error('Choose --topic or --all, not both.');
  return out;
}
try{
  const args=flags(process.argv.slice(2));
  if(args.help||!args.topic&&!args.all){
    console.log('Usage: npm run audit:topic -- --topic <id> [--strict] [--json]\n'+
      '       npm run audit:topic -- --all [--structural]\n'+
      'For CI, --all --structural allows drafts but blocks incomplete ready topics.\n'+
      'Use --strict to enforce publication readiness, including pedagogy and notation.');
    process.exitCode=args.help?0:2;
  }else{
    const ids=args.all?await topicIds():[args.topic],results=[];
    for(const id of ids){
      try{results.push(await auditTopic(id));}
      catch(error){
        results.push({id,title:id,status:'invalid',structuralErrors:[error.message],
          blockers:[],warnings:[],counts:null,publicationReady:false});
      }
    }
    if(args.json)console.log(JSON.stringify(results.length===1?results[0]:results,null,2));
    else for(const result of results)console.log(reportText(result)+'\n');
    if(results.some(r=>failsPublicationGate(r,{strict:args.strict})))
      process.exitCode=1;
  }
}catch(error){console.error('Topic audit: '+error.message);process.exitCode=1;}
