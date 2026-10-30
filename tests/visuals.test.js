import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../src/topics.js';
import {validateTopics} from '../src/logic.js';
import {visualLibraryFor,diagramFor,explorerFor} from '../src/visuals/registry.js';
import {validateVisualLibrary,validateDiagram,validateExplorer} from '../src/visuals/validation.js';
import {renderDiagram} from '../src/visuals/diagrams.js';
import {renderCoordinatePlot} from '../src/visuals/plot-svg.js';
import {linearEquation,linearValue,observationFor,valueAt} from '../src/visuals/models.js';
import {sampleSelection} from '../src/visuals/sampling.js';
import {renderGraphLab,renderSamplingLab,graphStateFor,resetGraphModel,
  toggleGraphModel,updateGraphParameter} from '../src/visuals/explorer-ui.js';

const route=(topicId,pageId)=>({topicId,sectionId:'visual-explanations',pageId,pageIndex:0});
test('example topic visual packs validate and preserve original student content',()=>{
  assert.deepEqual(validateTopics(),[]);
  for(const id of ['sampling','quadratics']){
    const lib=visualLibraryFor(id);
    assert.deepEqual(validateVisualLibrary(TOPICS[id],lib),[]);
    assert.equal(lib.schemaVersion,1);
    assert.doesNotThrow(()=>structuredClone(lib));
  }
  assert.equal(visualLibraryFor('sampling').diagrams['sampling-dots'].count,40);
  assert.equal(visualLibraryFor('sampling').diagrams['sampling-dots'].selected.length,8);
  assert.equal(visualLibraryFor('quadratics').diagrams['quadratic-static'].type,'coordinate-plot');
  assert.equal(explorerFor('quadratics',{id:'shape'}).controls[0].key,'magnitude');
  assert.strictEqual(diagramFor('sampling',{variant:'sampling-dots'}),
    visualLibraryFor('sampling').diagrams['sampling-dots']);
});
test('linear and quadratic SVG plots use actual authored functions',()=>{
  const model={kind:'linear',m:-2,b:3};
  assert.equal(linearEquation(model),'y = -2x + 3'.replace('-', '−'));
  assert.equal(linearValue(4,model),-5);
  assert.match(observationFor(model),/Gradient -2/);
  const svg=renderCoordinatePlot({model,reference:{kind:'linear',m:0,b:0}});
  assert.match(svg,/id="graph-svg"/);
  assert.match(svg,/stroke="#2d755f"/);
  assert.match(svg,/stroke="#9caaa3"/);
  assert.equal(valueAt(5,{kind:'quadratic',magnitude:1,h:2,k:-4,sign:1}),5);
  assert.deepEqual(validateDiagram({type:'coordinate-plot',model}),[]);
  assert.match(renderDiagram({type:'coordinate-plot',model}),/class="mini-curve"/);
});
test('dot grids, number lines and probability trees are reusable and accessible',()=>{
  const dots={type:'dot-grid',count:24,columns:6,selected:[0,5,13],label:'Three chosen'};
  assert.deepEqual(validateDiagram(dots),[]);
  const html=renderDiagram(dots);
  assert.equal((html.match(/<span class="dot/g)||[]).length,24);
  assert.equal((html.match(/dot--chosen/g)||[]).length,3);
  const line={type:'number-line',min:-3,max:5,intervals:[{from:1,to:5,openFrom:true}],
    points:[{value:-2,label:'A'}]};
  assert.deepEqual(validateDiagram(line),[]);
  assert.match(renderDiagram(line),/number-line/);
  const tree={type:'probability-tree',root:{label:'Start',branches:[
    {probability:0.4,to:{label:'A',branches:[
      {probability:0.5,to:{label:'Yes'}},{probability:0.5,to:{label:'No'}}]}},
    {probability:0.6,to:{label:'B'}}
  ]}};
  assert.deepEqual(validateDiagram(tree),[]);
  assert.match(renderDiagram(tree),/probability-tree/);
  assert.ok(validateDiagram({...tree,root:{label:'Start',branches:[
    {probability:0.3,to:{label:'A'}},{probability:0.5,to:{label:'B'}}
  ]}}).some(x=>x.includes('sum to 1')));
  assert.ok(validateDiagram({...dots,selected:[3,3]}).length>0);
});
test('configurable sampling works for groups and proportions beyond the two demos',()=>{
  const data={groups:[{label:'A',size:20},{label:'B',size:30},{label:'C',size:50}],sampleSize:10};
  for(let seed=1;seed<=100;seed++){
    const s=sampleSelection(data,'stratified',seed);
    assert.deepEqual(s.counts,[2,3,5]);
    assert.equal(new Set(s.selected).size,10);
    assert.deepEqual(sampleSelection(data,'random',seed),sampleSelection(data,'random',seed));
    assert.equal(sampleSelection(data,'systematic',seed).size,10);
  }
  const rounding={groups:[{label:'A',size:12},{label:'B',size:17},{label:'C',size:21}],sampleSize:11};
  assert.equal(sampleSelection(rounding,'stratified',5).counts.reduce((a,b)=>a+b),11);
  assert.throws(()=>sampleSelection(rounding,'systematic',5),/integer interval/);
});
test('graph controls, reset and toggles are configured rather than inferred from page IDs',()=>{
  const lib=visualLibraryFor('quadratics'),shape=lib.explorers.shape,position=lib.explorers.position,
    store={},r=route('quadratics','shape');
  assert.equal(graphStateFor(r,store,shape).magnitude,1);
  assert.equal(updateGraphParameter(r,store,shape,'h',2),false);
  assert.equal(updateGraphParameter(r,store,shape,'magnitude',2),true);
  assert.equal(toggleGraphModel(r,store,shape),true);
  assert.equal(graphStateFor(r,store,shape).sign,-1);
  assert.equal(resetGraphModel(r,store,shape),true);
  assert.equal(graphStateFor(r,store,shape).sign,1);
  assert.equal(updateGraphParameter(route('quadratics','position'),store,position,'h',2),true);
  const graph=renderGraphLab({id:'position',focus:'Move the point'},route('quadratics','position'),store);
  assert.match(graph,/data-graph="h"/);
  assert.doesNotMatch(graph,/data-graph="magnitude"/);
  const sample=renderSamplingLab({id:'census-sample',methods:['random','stratified']},
    route('sampling','census-sample'),{});
  assert.match(sample,/Population of 40/);
  assert.match(sample,/40%/);
  assert.match(sample,/60%/);
});
test('an entirely new linear topic passes visual and whole-topic validation with no engine edits',()=>{
  const lab={type:'function-graph',initial:{kind:'linear',m:1,b:0},controls:[
    {key:'m',label:'Gradient m',min:-4,max:4,step:1},
    {key:'b',label:'Intercept b',min:-5,max:5,step:1}
  ]};
  assert.deepEqual(validateExplorer(lab),[]);
  const sections=['big-idea','how-it-works','visual-explanations','worked-examples'].map(id=>({
    id,label:'Label '+id,description:'An original mathematical explanation for '+id+'.',
    pages:id==='visual-explanations'?
      [{id:'explore',type:'visual',visualId:'linear-graph',focus:'Explore the gradient.'}]:
      [{id:'lesson',type:'lesson',blocks:[{kind:'text',text:'Learn the definition.'},
        ...(id==='big-idea'?[{kind:'diagram',variant:'line-figure',caption:'Straight line'}]:[])]}]
  }));
  const topic={id:'linear',title:'Linear Graphs',modes:{understand:true},
    chapters:{understand:sections},visuals:{schemaVersion:1,
      diagrams:{'line-figure':{type:'coordinate-plot',model:{kind:'linear',m:2,b:1}}},
      explorers:{'linear-graph':lab}}};
  assert.deepEqual(validateVisualLibrary(topic,topic.visuals),[]);
  assert.deepEqual(validateTopics({linear:topic}),[]);
  assert.ok(validateVisualLibrary({...topic,visuals:{...topic.visuals,explorers:{}}},
    {...topic.visuals,explorers:{}}).some(x=>x.includes('missing visual explorer')));
  assert.ok(validateExplorer({...lab,controls:[{key:'unknown',label:'X',min:0,max:3,step:1}]})
    .some(x=>x.includes('invalid slider')));
  assert.ok(validateExplorer({...lab,initial:{kind:'quadratic',magnitude:0,sign:1,h:0,k:0}})
    .some(x=>x.includes('invalid')));
  assert.equal(validateDiagram({type:'script',content:'alert(1)'}).length,1);
});
