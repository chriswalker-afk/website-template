// Authoring-time schema checks for diagrams, experiments and visual references.
// No arbitrary function expressions or HTML in visual specifications.
import {isMathematicalModel} from './models.js';
import {SAMPLING_METHOD_IDS} from './sampling.js';
const slug=x=>typeof x==='string'&&/^[a-z][a-z0-9-]*$/.test(x);
const phrase=x=>typeof x==='string'&&x.trim().length>0;
const int=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
const finite=x=>Number.isFinite(x);
const array=Array.isArray;
const EMPTY={schemaVersion:1,diagrams:{},explorers:{}};
const allowedFields={quadratic:['magnitude','sign','h','k'],linear:['m','b']};
function validatePlot(model,view,label){
  const issues=[];
  if(!isMathematicalModel(model))issues.push(label+': invalid or unsupported model');
  if(view){
    if(![view.xMin,view.xMax,view.yMin,view.yMax].every(finite)||
       !(view.xMin<view.xMax&&view.yMin<view.yMax)||
       view.xMax-view.xMin>200||view.yMax-view.yMin>200)
      issues.push(label+': invalid coordinate bounds');
  }
  return issues;
}
export function validateDiagram(config,label='diagram'){
  if(!config||typeof config!=='object'||array(config))return [label+': missing diagram definition'];
  const issues=[];
  if(config.type==='dot-grid'){
    if(!int(config.count,1,200)||!int(config.columns||8,1,20)||
       !array(config.selected)||new Set(config.selected).size!==config.selected.length||
       config.selected.some(x=>!int(x,0,config.count-1)))
      issues.push(label+': invalid dot-grid count or selections');
  }else if(config.type==='coordinate-plot'){
    issues.push(...validatePlot(config.model,config.view,label));
    if(config.reference)issues.push(...validatePlot(config.reference,null,label+' reference'));
  }else if(config.type==='number-line'){
    if(!int(config.min,-100,100)||!int(config.max,-100,100)||
       config.max<=config.min||config.max-config.min>30)
      issues.push(label+': invalid number-line range');
    for(const part of config.intervals||[]){
      if(!finite(part.from)||!finite(part.to)||part.from<config.min||part.to>config.max||
         part.from>=part.to||part.openFrom!==undefined&&typeof part.openFrom!=='boolean'||
         part.openTo!==undefined&&typeof part.openTo!=='boolean')
        issues.push(label+': invalid number-line interval');
    }
    for(const p of config.points||[])if(!finite(p.value)||p.value<config.min||p.value>config.max)
      issues.push(label+': point outside number-line range');
  }else if(config.type==='probability-tree'){
    let leaves=0;
    function check(node,depth){
      if(!node||!phrase(node.label)||depth>4){issues.push(label+': malformed tree node');return;}
      const branches=node.branches||[];
      if(!array(branches)||branches.length>4){issues.push(label+': too many branches');return;}
      if(!branches.length){leaves++;return;}
      if(branches.length<2)issues.push(label+': decision needs at least two branches');
      let total=0,all=true;
      for(const branch of branches){
        if(!branch||!branch.to){issues.push(label+': incomplete branch');continue;}
        if(branch.probability!==undefined){
          if(!finite(branch.probability)||branch.probability<0||branch.probability>1)
            issues.push(label+': invalid branch probability');
          total+=branch.probability;
        }else all=false;
        check(branch.to,depth+1);
      }
      if(all&&Math.abs(total-1)>1e-9)issues.push(label+': branch probabilities must sum to 1');
    }
    check(config.root,0);
    if(leaves<2||leaves>24)issues.push(label+': expected 2 to 24 tree leaves');
  }else issues.push(label+': unsupported diagram type '+config.type);
  return issues;
}
export function validateExplorer(config,label='explorer'){
  if(!config||typeof config!=='object'||array(config))return [label+': missing visual configuration'];
  const issues=[];
  if(config.type==='function-graph'){
    issues.push(...validatePlot(config.initial,config.view,label));
    const allowed=allowedFields[config.initial?.kind]||[];
    if(config.reference)issues.push(...validatePlot(config.reference,null,label+' reference'));
    if(!array(config.controls)||!config.controls.length||config.controls.length>4)
      issues.push(label+': expected 1 to 4 slider controls');
    const used=new Set();
    for(const control of config.controls||[]){
      if(!allowed.includes(control.key)||used.has(control.key)||!phrase(control.label)||
        ![control.min,control.max,control.step].every(finite)||
        control.min>=control.max||control.step<=0||
        !finite(config.initial?.[control.key])||
        config.initial?.[control.key]<control.min||config.initial?.[control.key]>control.max||
        Math.abs((config.initial?.[control.key]-control.min)/control.step-
          Math.round((config.initial[control.key]-control.min)/control.step))>1e-7)
        issues.push(label+': invalid slider '+control.key);
      used.add(control.key);
    }
    if(config.toggle){
      const t=config.toggle;
      if(!allowed.includes(t.key)||used.has(t.key)||!phrase(t.label)||
         !array(t.values)||t.values.length<2||t.values.length>5||
         new Set(t.values).size!==t.values.length||!t.values.includes(config.initial?.[t.key])||
         t.values.some(v=>!finite(v)||!isMathematicalModel({...config.initial,[t.key]:v})))
        issues.push(label+': invalid toggle');
    }
  }else if(config.type==='sampling-selection'){
    if(!array(config.groups)||config.groups.length<2||config.groups.length>4||
       config.groups.some(g=>!phrase(g.label)||!int(g.size,1,160)))
      issues.push(label+': invalid population groups');
    const size=(config.groups||[]).reduce((sum,g)=>sum+(g.size||0),0);
    if(size>200||!int(config.sampleSize,1,size))issues.push(label+': invalid sample size');
    if(!config.methods||Object.keys(config.methods).length<2||
       Object.entries(config.methods).some(([id,v])=>!SAMPLING_METHOD_IDS.includes(id)||
         !phrase(v?.label)||!phrase(v?.description)))
      issues.push(label+': invalid sampling method descriptions');
    if(Object.hasOwn(config.methods||{},'systematic')&&size%config.sampleSize!==0)
      issues.push(label+': systematic interval must be a whole number');
  }else issues.push(label+': unsupported explorer type '+config.type);
  return issues;
}
export function validateVisualLibrary(topic,provided){
  const lib=provided||topic?.visuals||EMPTY,issues=[];
  if(lib.schemaVersion!==1)issues.push('unsupported visual library version');
  const diagrams=lib.diagrams||{},explorers=lib.explorers||{};
  if(!diagrams||typeof diagrams!=='object'||array(diagrams)||
     !explorers||typeof explorers!=='object'||array(explorers)){
    issues.push('visual diagrams and explorers must be named maps');return issues;
  }
  for(const [key,config] of Object.entries(diagrams)){
    if(!slug(key))issues.push('invalid diagram id '+key);
    issues.push(...validateDiagram(config,'diagram '+key));
  }
  for(const [key,config] of Object.entries(explorers)){
    if(!slug(key))issues.push('invalid explorer id '+key);
    issues.push(...validateExplorer(config,'explorer '+key));
  }
  if(topic?.modes?.understand===false)return issues;
  for(const section of topic?.chapters?.understand||[])for(const page of section.pages||[]){
    if(['graph','sampling-lab','visual'].includes(page.type)){
      const id=page.visualId||page.id,config=explorers[id];
      if(!config)issues.push('missing visual explorer '+id);
      else{
        if(page.type==='graph'&&config.type!=='function-graph'||
           page.type==='sampling-lab'&&config.type!=='sampling-selection')
          issues.push('mismatched explorer type '+id);
        if(page.type==='sampling-lab'||config.type==='sampling-selection'){
          const methods=page.methods||Object.keys(config.methods||{});
          if(!array(methods)||methods.length<2||new Set(methods).size!==methods.length||
             methods.some(method=>!config.methods?.[method]))
            issues.push('invalid sampling page methods '+id);
        }
      }
    }
    for(const block of page.blocks||[])if(block.kind==='diagram'){
      const diagram=typeof block.variant==='string'?diagrams[block.variant]:
        block.visual||block.variant;
      if(!diagram)issues.push('missing diagram '+block.variant);
      else if(typeof block.variant!=='string')
        issues.push(...validateDiagram(diagram,'inline diagram '+page.id));
    }
  }
  return issues;
}
