import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,copyFile,access,rm,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {validateOptions,requestedModes,templateFiles,registerTopic,scaffoldTopic}
  from '../scripts/lib/topic-scaffold.mjs';
import {auditTopic,auditTopicRecord,topicIds} from '../scripts/lib/topic-audit.mjs';
import {buildSite,PROJECT_ROOT} from '../scripts/build-site.mjs';
import {TOPICS} from '../src/topics.js';
import {QUESTION_BANKS,VISUAL_LIBRARIES} from '../src/topic-packs/registry.js';

test('creator checks safe IDs, qualifications, tier and requested modes',()=>{
  const options=validateOptions({id:'gradient-and-midpoint',title:'Gradient and Midpoint',
    qualification:'4MA1',level:'Foundation',modes:'understand,fluency,problem-solving'});
  assert.equal(options.id,'gradient-and-midpoint');
  assert.deepEqual(options.plannedModes,['understand','fluency','problemSolving']);
  assert.deepEqual(requestedModes('memorise,games'),['understand','memorise','games']);
  assert.throws(()=>validateOptions({id:'../oops',title:'Bad'}),/lowercase hyphenated slug/);
  assert.throws(()=>validateOptions({id:'test',title:'Bad',paper:'script'}),/Paper/);
  assert.throws(()=>validateOptions({id:'test',title:'Bad',modes:'fake'}),/Unsupported mode/);
  const contents=templateFiles(options);
  assert.ok(contents.files['index.js'].includes('chapters:{understand,memorise'));
  assert.ok(contents.files['manifest.js'].includes('"status": "draft"'));
  assert.ok(contents.files['manifest.js'].includes('"qualification": "4MA1"'));
  assert.ok(contents.files['visuals.js'].includes('diagrams:{}'));
  assert.equal(Object.keys(contents.files).length>=15,true);
});

test('registry insertion is repeatable but refuses duplicate IDs and malformed registries',()=>{
  const base="import {topic as sampling} from './sampling/index.js';\n"+
    '// @topic-creator:imports\nconst REGISTRATIONS=[\n  // @topic-creator:entries\n];\n';
  const updated=registerTopic(base,'gradient-and-midpoint');
  assert.match(updated,/from '.\/gradient-and-midpoint\/index.js'/);
  assert.match(updated,/from '.\/gradient-and-midpoint\/question-bank.js'/);
  assert.match(updated,/topic:topic_gradient_and_midpoint/);
  assert.equal(updated.split('@topic-creator:imports').length,2);
  assert.throws(()=>registerTopic(updated,'gradient-and-midpoint'),/already exists/);
  assert.throws(()=>registerTopic('const x=2;','linear'),/markers missing/);
});

test('scaffolding creates a valid inactive draft, does not overwrite and reports TODOs',async()=>{
  const temp=await mkdtemp(join(tmpdir(),'maths-topic-'));
  try{
    const root=join(temp,'src','topic-packs');
    await mkdir(join(root,'builders'),{recursive:true});
    await copyFile(join(PROJECT_ROOT,'src','topic-packs','registry.js'),join(root,'registry.js'));
    await copyFile(join(PROJECT_ROOT,'src','topic-packs','builders','understand.js'),
      join(root,'builders','understand.js'));
    await writeFile(join(temp,'package.json'),'{"type":"module"}\n');
    const args={id:'gradient-midpoint-test',title:'Gradient and Midpoint',
      subject:'Coordinate Geometry',qualification:'4MA1',level:'Foundation',
      modes:'understand,memorise'};
    const pretend=await scaffoldTopic(args,{root:temp,dryRun:true});
    assert.equal(pretend.registered,false);
    await assert.rejects(access(join(root,args.id)));
    const created=await scaffoldTopic(args,{root:temp});
    assert.equal(created.registered,true);
    assert.equal(created.files.length>=15,true);
    await assert.rejects(scaffoldTopic(args,{root:temp}),/already exists/);
    const registry=await readFile(join(root,'registry.js'),'utf8');
    assert.match(registry,/topic_gradient_midpoint_test/);
    const dir=join(root,args.id);
    const [{topic},{questionBank},{visuals}]=await Promise.all([
      import(pathToFileURL(join(dir,'index.js')).href),
      import(pathToFileURL(join(dir,'question-bank.js')).href),
      import(pathToFileURL(join(dir,'visuals.js')).href)
    ]);
    assert.equal(topic.authoring.status,'draft');
    assert.equal(topic.modes.understand,true);
    assert.equal(topic.modes.memorise,false);
    assert.doesNotThrow(()=>structuredClone(topic));
    const report=auditTopicRecord(topic,questionBank,visuals);
    assert.deepEqual(report.structuralErrors,[]);
    assert.equal(report.publicationReady,false);
    assert.ok(report.blockers.some(x=>x.includes('Publication is disabled')));
    assert.ok(report.blockers.some(x=>x.includes('concept check')));
    assert.ok(report.blockers.some(x=>x.includes('Planned mode memorise')));
    assert.ok(report.blockers.some(x=>x.includes('placeholder')));
  }finally{await rm(temp,{recursive:true,force:true});}
});

test('publishing audit checks pedagogical and notation quality, not only schema shape',()=>{
  const pages=[
    {id:'big-idea',label:'The big idea',description:'Meaningful conceptual connections.',
      pages:[{id:'idea',type:'lesson',blocks:[
        {kind:'text',text:'The gradient is the vertical change divided by the horizontal change.'},
        {kind:'comparison',items:[{label:'Gradient',description:'The rate of change.'}]},
        {kind:'concept-check',id:'ratio',prompt:'Which ratio gives the gradient?',
          choices:[{id:'correct',label:'Rise divided by run',feedback:'Correct.',correct:true},
            {id:'wrong',label:'Run divided by rise',feedback:'Reverse the ratio.',correct:false}]}
      ]}]},
    {id:'how-it-works',label:'How it works',description:'Explain each calculation clearly.',
      pages:[{id:'method',type:'lesson',blocks:[
        {kind:'stepper',id:'gradient-method',prompt:'Find the gradient of the line.',
          steps:['Find the change in y.','Find the change in x.','Divide the two changes.']}
      ]}]},
    {id:'visual-explanations',label:'Visual explanations',description:'Explore the gradient dynamically.',
      pages:[{id:'gradient',type:'visual',focus:'How does slope change?',visualId:'gradient-explorer'}]},
    {id:'worked-examples',label:'Worked examples',description:'Apply the method independently.',
      pages:[{id:'guided',type:'workshop',
        model:{prompt:'Find the gradient between two points.',steps:[
          'Find both coordinate differences.','Divide rise by run.','Interpret the gradient.']},
        guided:{prompt:'Which quotient is correct?',choices:[
          ['a','Rise over run','The correct quotient.',true],
          ['b','Run over rise','The quotient is reversed.',false]]},
        independent:{prompt:'Calculate the gradient of another line.',
          hint:'Subtract the coordinates in the same order.',steps:[
            'Find the rise.','Find the run.','Calculate the gradient.']}
      }]}
  ];
  const visuals={schemaVersion:1,diagrams:{},explorers:{
    'gradient-explorer':{type:'function-graph',initial:{kind:'linear',m:1,b:0},
      controls:[{key:'m',label:'Gradient',min:-3,max:3,step:1}]}
  }};
  const topic={id:'linear',title:'Straight Lines',subject:'Algebra',qualification:'4MA1',level:'Foundation',
    paper:'squared',authoring:{status:'ready',plannedModes:['understand']},
    modes:{understand:true},worksheetSkills:[],
    chapters:{understand:pages}};
  const bank={schemaVersion:1,fluency:{},worksheet:[],scaffolds:{}};
  const ready=auditTopicRecord(topic,bank,visuals);
  assert.deepEqual(ready.structuralErrors,[]);
  assert.deepEqual(ready.blockers,[]);
  assert.equal(ready.publicationReady,true);
  const wrong=auditTopicRecord({...topic,chapters:{understand:structuredClone(pages)}},bank,visuals);
  assert.equal(wrong.publicationReady,true);
  const changed=structuredClone(pages);
  changed[0].pages[0].blocks[0].text='The formula is y = x^2. TODO: revise this.';
  const bad=auditTopicRecord({...topic,chapters:{understand:changed}},bank,visuals);
  assert.equal(bad.publicationReady,false);
  assert.ok(bad.blockers.some(x=>x.includes('placeholder')));
  assert.ok(bad.blockers.some(x=>x.includes('notation')));
});
test('existing example topics remain cloneable, structurally valid and discoverable',async()=>{
  const ids=await topicIds();
  assert.ok(ids.includes('sampling')&&ids.includes('quadratics'));
  for(const id of ['sampling','quadratics']){
    const report=auditTopicRecord(TOPICS[id],QUESTION_BANKS[id],VISUAL_LIBRARIES[id]);
    assert.deepEqual(report.structuralErrors,[]);
    assert.ok(report.counts.modes.understand.pages>=8);
    assert.ok(report.counts.fluencyFamilies>=10);
  }
});
test('static build isolates one topic, labels drafts and never writes into source directories',async()=>{
  const path=join(PROJECT_ROOT,'dist','unit-'+randomUUID());
  try{
    const result=await buildSite({topicId:'quadratics',outputDirectory:path,draft:true});
    assert.equal(result.manifest.topicId,'quadratics');
    assert.equal(result.manifest.draft,true);
    const html=await readFile(join(path,'index.html'),'utf8');
    assert.match(html,/Quadratic Functions \| The Maths Notebook/);
    assert.match(html,/noindex, nofollow/);
    const conf=await readFile(join(path,'src','site-config.js'),'utf8');
    assert.match(conf,/"mode": "standalone"/);
    assert.match(conf,/"topicId": "quadratics"/);
    assert.match(conf,/"previewDraft": true/);
    assert.ok((await stat(join(path,'styles','book.css'))).size>100);
    await access(join(path,'.nojekyll'));
    await assert.rejects(buildSite({topicId:'quadratics',
      outputDirectory:join(PROJECT_ROOT,'src'),draft:true}),/subdirectory of dist/);
    await assert.rejects(buildSite({topicId:'missing',
      outputDirectory:join(PROJECT_ROOT,'dist','bad'),draft:true}),/Cannot find module|ENOENT/);
  }finally{await rm(path,{recursive:true,force:true});}
});
