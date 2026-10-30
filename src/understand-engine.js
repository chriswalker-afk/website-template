// Compatibility facade for legacy Understand APIs.
// The plot and sampling mathematics are now shared, configurable engines.
import {sampleSelection} from './visuals/sampling.js';
import {SAMPLING_VISUAL} from './topic-packs/sampling/visuals.js';
import {visuals as quadraticVisuals} from './topic-packs/quadratics/visuals.js';
export {seededRandom} from './visuals/sampling.js';
export {quadraticProperties,quadraticValue,quadraticEquation} from './visuals/models.js';
export const POPULATION_SIZE=SAMPLING_VISUAL.groups.reduce((n,g)=>n+g.size,0);
export const SAMPLE_SIZE=SAMPLING_VISUAL.sampleSize;
export const STRATUM_A=SAMPLING_VISUAL.groups[0].size;
export const STRATUM_B=SAMPLING_VISUAL.groups[1].size;
export const SAMPLING_METHODS=SAMPLING_VISUAL.methods;
export function samplingExperiment(method,seed=1){
  if(!Object.hasOwn(SAMPLING_METHODS,method))throw Error('Unknown sampling method');
  const result=sampleSelection(SAMPLING_VISUAL,method,seed);
  const [groupA,groupB]=result.counts;
  return {method,seed,selected:result.selected,groupA,groupB,randomStart:result.randomStart,
    size:result.size,proportionA:100*groupA/result.size,proportionB:100*groupB/result.size};
}
const omitKind=({kind,...model})=>({...model});
export const GRAPH_DEFAULTS={
  shape:omitKind(quadraticVisuals.explorers.shape.initial),
  position:omitKind(quadraticVisuals.explorers.position.initial)
};
export function validateUnderstandContent(sections){
  const problems=[];
  const ids=['big-idea','how-it-works','visual-explanations','worked-examples'];
  if(!Array.isArray(sections)||sections.map(s=>s.id).join()!==ids.join())
    problems.push('Understand needs its four ordered subsections');
  for(const section of sections||[]){
    if(!Array.isArray(section.pages)||!section.pages.length)continue;
    for(const page of section.pages){
      if(!['lesson','graph','sampling-lab','visual','workshop'].includes(page.type))
        problems.push('Unsupported Understand page type: '+page.type);
      // Page IDs no longer imply a particular quadratic graph or sampling experiment.
      // Topic pack visual definitions and their mathematical contracts are validated
      // separately by validateVisualLibrary.
      if(page.type==='workshop'){
        if(!page.model?.prompt||!page.model?.steps?.length||
          !page.guided?.prompt||!page.guided?.choices?.length||
          !page.independent?.prompt||!page.independent?.steps?.length)
          problems.push('Incomplete worked example '+page.id);
        const answers=page.guided?.choices?.filter(c=>c[3])||[];
        if(answers.length!==1)problems.push('Guided question requires one correct answer '+page.id);
        if(new Set((page.guided?.choices||[]).map(c=>c[0])).size!==page.guided?.choices?.length)
          problems.push('Duplicate guided options '+page.id);
      }
      if(page.type==='lesson'){
        for(const block of page.blocks||[]){
          if(!['text','note','comparison','diagram','concept-check','stepper'].includes(block.kind))
            problems.push('Unsupported concept block '+block.kind);
          if(block.kind==='concept-check'){
            if(!block.id||!block.prompt||block.choices?.filter(c=>c.correct).length!==1)
              problems.push('Incomplete concept check '+block.id);
            if(new Set((block.choices||[]).map(c=>c.id)).size!==block.choices?.length)
              problems.push('Duplicate concept-check option '+block.id);
          }
          if(block.kind==='stepper'&&(!block.id||!block.prompt||!block.steps?.length))
            problems.push('Incomplete method steps');
        }
      }
    }
  }
  return problems;
}
