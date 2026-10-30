// Generic visual activity UI. Topic packs own defaults, controls and numerical context.
import {explorerFor,explorerKey} from './registry.js';
import {equationFor,observationFor,isMathematicalModel} from './models.js';
import {renderCoordinatePlot} from './plot-svg.js';
import {sampleSelection} from './sampling.js';
const e=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const fmt=n=>String(Number(Number(n).toFixed(2)));
const icon='<svg class="icon" aria-hidden="true"><use href="#i-refresh"></use></svg>';
export function graphStateFor(route,graphs,config){
  const key=explorerKey(route);
  if(!graphs[key])graphs[key]={...config.initial};
  return graphs[key];
}
export function resetGraphModel(route,graphs,config){
  if(config?.type!=='function-graph')return false;
  graphs[explorerKey(route)]={...config.initial};
  return true;
}
export function toggleGraphModel(route,graphs,config){
  const spec=config?.toggle;
  if(config?.type!=='function-graph'||!spec)return false;
  const model=graphStateFor(route,graphs,config);
  const index=spec.values.indexOf(model[spec.key]);
  if(index<0)return false;
  model[spec.key]=spec.values[(index+1)%spec.values.length];
  return true;
}
export function updateGraphParameter(route,graphs,config,key,value){
  if(config?.type!=='function-graph'||!Number.isFinite(value))return false;
  const control=config.controls?.find(c=>c.key===key);
  if(!control||value<control.min||value>control.max||
     Math.abs((value-control.min)/control.step-Math.round((value-control.min)/control.step))>1e-7)return false;
  const updated={...graphStateFor(route,graphs,config),[key]:value};
  if(!isMathematicalModel(updated))return false;
  graphs[explorerKey(route)]=updated;
  return true;
}
export function renderGraphLab(page,route,graphs){
  const config=explorerFor(route.topicId,page);
  if(config?.type!=='function-graph')return '<p>Graph configuration unavailable.</p>';
  const model=graphStateFor(route,graphs,config);
  const readout=c=>'<label class="graph-control"><span class="graph-control__label"><span>'+e(c.label)+'</span>'+
    '<output id="out-'+e(c.key)+'">'+fmt(model[c.key])+'</output></span>'+
    '<input type="range" data-graph="'+e(c.key)+'" min="'+c.min+'" max="'+c.max+
      '" step="'+c.step+'" value="'+model[c.key]+'"></label>';
  return '<div class="math-lab">'+
      '<div class="graph-card">'+renderCoordinatePlot({
        model,reference:config.reference||null,view:config.view})+
        (config.reference?'<div class="graph-legend"><span><i class="graph-legend__current"></i>Your function</span>'+
          '<span><i class="graph-legend__reference"></i>Reference: '+e(config.referenceLabel||equationFor(config.reference))+
          '</span></div>':'')+
      '</div>'+
      '<div class="graph-controls">'+
        '<div class="equation-card"><span>Function</span><strong id="equation-display">'+
          e(equationFor(model))+'</strong></div>'+
        (config.controls||[]).map(readout).join('')+
        (config.toggle?'<button class="quiet-button" type="button" data-action="graph-reflect">'+icon+
          ' '+e(config.toggle.label)+'</button>':'')+
        '<p class="graph-property" id="graph-observation">'+e(observationFor(model))+'</p>'+
        '<button class="quiet-button graph-reset" type="button" data-action="graph-reset">'+
          e(config.resetLabel||'Reset graph')+'</button>'+
      '</div></div>'+
      '<div class="callout graph-prompt" aria-label="Question to consider"><p>'+e(page.focus)+'</p></div>';
}
export function refreshGraphExplorer(root,route,graphs){
  const config=explorerFor(route.topicId,{id:route.pageId});
  if(config?.type!=='function-graph')return;
  const svg=root.querySelector('#graph-svg');
  if(!svg)return;
  const model=graphStateFor(route,graphs,config);
  svg.outerHTML=renderCoordinatePlot({model,reference:config.reference||null,view:config.view});
  const equation=root.querySelector('#equation-display');
  if(equation)equation.textContent=equationFor(model);
  const observation=root.querySelector('#graph-observation');
  if(observation)observation.textContent=observationFor(model);
  for(const control of config.controls||[]){
    const output=root.querySelector('[id="out-'+control.key+'"]');
    if(output)output.textContent=fmt(model[control.key]);
  }
}
const pct=n=>fmt(n)+'%';
function summaryFor(method,result){
  if(method==='census')return 'This is a census: the entire population is included.';
  if(method==='convenience')return 'In this ordered list, the first '+result.sampleSize+
    ' names are selected; people later in the list may be excluded.';
  if(method==='systematic')return 'The random starting position is '+result.randomStart+'.';
  if(method==='stratified')return 'The proportional allocation is '+result.groups.map(g=>
    g.selected+' from '+g.label).join(', ')+'.';
  return 'This random sample may have different proportions from the population.';
}
export function renderSamplingLab(page,route,labs){
  const config=explorerFor(route.topicId,page);
  if(config?.type!=='sampling-selection')return '<p>Sampling visualisation unavailable.</p>';
  const methods=page.methods?.length?page.methods:Object.keys(config.methods||{});
  const key=[route.topicId,route.sectionId,route.pageId,'sampling'].join(':');
  const saved=labs[key]||{method:methods[0],run:1};
  const method=methods.includes(saved.method)?saved.method:methods[0];
  const result=sampleSelection(config,method,1024+saved.run*37+route.pageIndex*11);
  const selected=new Set(result.selected);
  const people=result.groups.map((g,i)=>{
    const dots=Array.from({length:g.size},(_,j)=>'<span class="population-person population-person--'+
      String.fromCharCode(97+i)+(selected.has(g.offset+j)?' population-person--selected':'')+
      '" aria-hidden="true"></span>').join('');
    return '<div class="population-stratum">'+
      '<div class="population-stratum__label"><strong>'+e(g.label)+'</strong><span>'+
      g.size+' people</span></div><div class="population-stratum__people">'+dots+'</div></div>';
  }).join('');
  const sampleCount=result.size===result.population?result.size+' (census)':result.size;
  const counts=result.groups.map(g=>g.selected+' from '+(g.short||g.label)).join(' and ');
  const context=result.groups.map(g=>g.size+' in '+g.label).join(' and ');
  return '<div class="sampling-lab">'+
    '<div class="sampling-lab__controls"><div class="sampling-lab__methods" role="group" aria-label="Sampling method">'+
      methods.map(id=>'<button type="button" class="sampling-method'+(method===id?' is-selected':'')+
        '" aria-pressed="'+(method===id)+'" data-action="sampling-method" data-key="'+e(key)+
        '" data-method="'+e(id)+'">'+e(config.methods[id].label)+'</button>').join('')+
      '</div><button type="button" class="quiet-button" data-action="sampling-redraw" data-key="'+e(key)+
      '" '+(['census','convenience'].includes(method)?'disabled title="This selection is fixed"':'')+
      '>Draw another sample</button></div>'+
    '<p class="sampling-lab__method">'+e(config.methods[method].description)+'</p>'+
    '<div class="sampling-lab__population" role="img" aria-label="'+
      e('Population of '+result.population+', with '+context+'. '+result.size+
      ' are highlighted: '+counts+'.')+'">'+people+'</div>'+
    '<p class="sampling-lab__legend"><span class="population-legend-dot"></span>Outlined = selected</p>'+
    '<div class="sampling-lab__metrics">'+
      '<div><span>Population</span><strong>'+result.population+'</strong></div>'+
      '<div><span>Selected</span><strong>'+sampleCount+'</strong></div>'+
      result.groups.map(g=>'<div><span>'+e(g.label)+'</span><strong>'+g.selected+
        ' / '+g.size+'</strong></div>').join('')+'</div>'+
    '<div class="sampling-lab__compare"><table><caption>Group proportions</caption>'+
      '<thead><tr><th scope="col">Group</th><th scope="col">Population</th>'+
        '<th scope="col">Selection</th></tr></thead>'+
      '<tbody>'+result.groups.map(g=>'<tr><th scope="row">'+e(g.short||g.label)+'</th>'+
        '<td>'+pct(g.populationPercent)+'</td><td>'+pct(g.selectionPercent)+'</td></tr>').join('')+
      '</tbody></table></div>'+
    '<p class="sampling-lab__interpretation" role="status">'+e(summaryFor(method,result))+
      ' One selection does not prove a method is always representative.</p>'+
  '</div>';
}
export function renderVisualExplorer(page,route,understand){
  const config=explorerFor(route.topicId,page);
  if(config?.type==='function-graph')return renderGraphLab(page,route,understand.graphs);
  if(config?.type==='sampling-selection')return renderSamplingLab(page,route,understand.labs);
  return '<p>Unsupported visual activity.</p>';
}
