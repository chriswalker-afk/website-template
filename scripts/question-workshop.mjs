// Start the same local preview server, with a direct link to the teacher workshop.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const SLUG=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
function parseOptions(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const key=argv[i];
    if(key==='--help'){out.help=true;continue;}
    if(!['--topic','--seed','--difficulty','--port'].includes(key)||
      Object.hasOwn(out,key))throw Error('Unknown or duplicate option '+key);
    if(!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Missing value after '+key);
    out[key.slice(2)]=argv[++i];
  }
  if(out.topic&&!SLUG.test(out.topic))throw Error('Topic must be a valid slug');
  if(out.seed!==undefined&&(!Number.isSafeInteger(Number(out.seed))||
    Number(out.seed)<1||Number(out.seed)>999999999))throw Error('Invalid seed');
  if(out.difficulty&&!['developing','secure','stretch'].includes(out.difficulty))
    throw Error('Difficulty must be developing, secure or stretch');
  const port=out.port===undefined?4173:Number(out.port);
  if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Port must be 1024–65535');
  return {...out,port};
}
export function workshopUrl(options){
  const url=new URL('http://127.0.0.1:'+options.port+'/authoring.html');
  if(options.topic)url.searchParams.set('topic',options.topic);
  if(options.seed)url.searchParams.set('seed',options.seed);
  if(options.difficulty)url.searchParams.set('difficulty',options.difficulty);
  return url.toString();
}
const direct=process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename);
if(direct){
  try{
    const options=parseOptions(process.argv.slice(2));
    if(options.help){
      console.log('Usage: npm run author:questions -- [--topic gradient] [--seed 2026] [--difficulty secure] [--port 4173]');
    }else{
      process.env.PORT=String(options.port);
      console.log('Teacher Question Workshop: '+workshopUrl(options));
      console.log('This is a read-only local authoring preview; it does not publish or edit question content.');
      await import('./serve.mjs');
    }
  }catch(error){console.error('Question Workshop: '+error.message);process.exitCode=1;}
}
