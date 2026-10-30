// Produce an independent single-topic static site from the existing no-build website.
import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {resolve,join,relative,sep,isAbsolute} from 'node:path';
import {auditTopic,loadTopic,reportText} from './lib/topic-audit.mjs';
export const PROJECT_ROOT=resolve(import.meta.dirname,'..');
const escape=value=>String(value).replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
export async function buildSite({topicId,outputDirectory,root=PROJECT_ROOT,draft=false}){
  if(typeof topicId!=='string'||!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(topicId))
    throw Error('Supply a valid --topic slug.');
  const {topic}=await loadTopic(topicId,{projectRoot:root});
  const audit=await auditTopic(topicId,{projectRoot:root});
  if(audit.structuralErrors.length)throw Error('Invalid topic structure:\n'+reportText(audit));
  if(!draft&&!audit.publicationReady)
    throw Error('Topic is not ready to publish. Use --draft for a labelled preview.\n'+reportText(audit));
  const dist=resolve(root,'dist');
  const output=resolve(root,outputDirectory||join('dist','topic-'+topicId));
  const rel=relative(dist,output);
  if(!rel||rel==='.'||rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel))
    throw Error('Output must be a subdirectory of dist/; refusing to overwrite source files.');
  await mkdir(dist,{recursive:true});
  await rm(output,{recursive:true,force:true});
  await mkdir(output,{recursive:true});
  for(const name of ['src','styles'])await cp(join(root,name),join(output,name),{recursive:true});
  for(const name of ['index.html','favicon.svg'])await cp(join(root,name),join(output,name));
  const siteConfig={mode:'standalone',topicId,previewDraft:Boolean(draft)};
  await writeFile(join(output,'src','site-config.js'),
    '// Generated site configuration; edit the original topic pack instead.\n'+
    'export const SITE_CONFIG=Object.freeze('+JSON.stringify(siteConfig,null,2)+');\n');
  const path=join(output,'index.html');
  let html=await readFile(path,'utf8');
  html=html.replace(/<title>[^<]*<\/title>/,
    '<title>'+escape(topic.title)+' | The Maths Notebook</title>');
  html=html.replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="'+escape(topic.title)+
      ' — interactive mathematics learning website.">');
  if(draft)html=html.replace('</head>',
    '  <meta name="robots" content="noindex, nofollow">\n</head>');
  await writeFile(path,html,'utf8');
  await writeFile(join(output,'.nojekyll'),'');
  const manifest={schemaVersion:1,mode:'standalone',topicId,title:topic.title,
    draft:Boolean(draft),qualification:topic.qualification||null,level:topic.level||null};
  await writeFile(join(output,'site-build.json'),JSON.stringify(manifest,null,2)+'\n');
  return {outputDirectory:output,manifest,audit};
}
function args(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const key=argv[i];
    if(!['--topic','--out','--draft','--help'].includes(key))throw Error('Unsupported build argument '+key);
    if(key==='--draft'||key==='--help'){out[key.slice(2)]=true;continue;}
    if(!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Missing value for '+key);
    out[key.slice(2)]=argv[++i];
  }
  return out;
}
const calledDirectly=process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename);
if(calledDirectly){
  try{
    const opts=args(process.argv.slice(2));
    if(opts.help||!opts.topic){
      console.log('Usage: npm run build:site -- --topic <id> [--out dist/site] [--draft]');
      if(!opts.help)process.exitCode=2;
    }else{
      const result=await buildSite({topicId:opts.topic,outputDirectory:opts.out,draft:Boolean(opts.draft)});
      console.log('Built '+(opts.draft?'DRAFT ':'')+'standalone site for '+
        result.manifest.title+' at '+result.outputDirectory);
      if(opts.draft)console.log('DRAFT preview only: do not publish or share with students.');
      else console.log('Ready for GitHub Pages or other static hosting.');
    }
  }catch(error){console.error('Site build: '+error.message);process.exitCode=1;}
}
