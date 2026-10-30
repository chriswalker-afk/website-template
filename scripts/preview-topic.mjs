#!/usr/bin/env node
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {buildSite,PROJECT_ROOT} from './build-site.mjs';
try{
  const argv=process.argv.slice(2),idIndex=argv.indexOf('--topic'),portIndex=argv.indexOf('--port');
  if(idIndex<0||!argv[idIndex+1]||argv.includes('--help')){
    console.log('Usage: npm run preview:topic -- --topic <id> [--port 4173]');
    process.exitCode=argv.includes('--help')?0:2;
  }else{
    const port=portIndex>=0?Number(argv[portIndex+1]):4173;
    if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid preview port.');
    const id=argv[idIndex+1],result=await buildSite({
      topicId:id,draft:true,outputDirectory:join('dist','preview',id)
    });
    console.log('Draft preview at http://127.0.0.1:'+port+'/#/'+id+'/home');
    console.log('Press Ctrl+C to stop; re-run after editing topic content.');
    const child=spawn(process.execPath,['scripts/serve.mjs'],{
      cwd:PROJECT_ROOT,env:{...process.env,PREVIEW_ROOT:result.outputDirectory,PORT:String(port)},
      stdio:'inherit'
    });
    child.on('error',error=>{console.error('Preview server: '+error.message);process.exitCode=1;});
    process.on('SIGINT',()=>child.kill('SIGINT'));
    process.on('SIGTERM',()=>child.kill('SIGTERM'));
    child.on('exit',code=>{process.exitCode=code||0;});
  }
}catch(error){console.error('Preview: '+error.message);process.exitCode=1;}
