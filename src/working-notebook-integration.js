// Shared links between the topic/mode/task hierarchy and a reusable notebook.
// Scopes are intentionally independent of round order, hints and rating state.
import {workingStorageKey} from './working-notebook-model.js';
import {workingNotebookMarkup} from './working-notebook.js';
import {escapeHTML as e} from './logic.js';

const acceptable=/^[a-z][a-z0-9-]*$/i;
export const MODE_NOTEBOOK_COPY=Object.freeze({
  understand:{
    label:'My turn — mathematical working',
    guidance:'Try the question independently. Type equations, explain your steps or draw a diagram. Compare with the model only when ready.'
  },
  reasoning:{
    label:'Reasoning — equations and diagrams',
    guidance:'Support your argument with correctly written equations, explanations or drawings. The written-response box remains available.'
  },
  problemSolving:{
    label:'Problem-solving working',
    guidance:'Record your strategy, mathematical steps, diagrams and checks. Keep different approaches on separate pages if helpful.'
  },
  modelling:{
    label:'Modelling investigation notebook',
    guidance:'Keep assumptions, calculations, diagrams and evaluation together. This notebook follows the same investigation through all four stages.'
  }
});
export function workingScope(topicId,mode,sectionId,pageId,taskId){
  if(!MODE_NOTEBOOK_COPY[mode])throw new TypeError('Unsupported notebook mode');
  const parts=[topicId,mode,sectionId,pageId,taskId];
  if(parts.some(part=>typeof part!=='string'||!acceptable.test(part)))
    throw new TypeError('Invalid notebook route');
  const scope=parts.join(':');
  workingStorageKey(scope);
  return scope;
}
export function modeWorkingNotebook(topicId,mode,sectionId,pageId,taskId){
  const copy=MODE_NOTEBOOK_COPY[mode];
  const scope=workingScope(topicId,mode,sectionId,pageId,taskId);
  return workingNotebookMarkup({scope,label:copy.label,guidance:copy.guidance});
}
export function archivedWorkingNotebooks({topicId,mode,sectionId,pageId,items}){
  if(!Array.isArray(items)||!items.length)return '';
  return '<details class="working-notebook-archive">'+
    '<summary>Review and download saved notebooks ('+items.length+')</summary>'+
    '<p>These notebooks are saved on this device separately from your self-review results. '+
      'Open any notebook to review or export working.</p>'+
    '<div class="working-notebook-archive__items">'+
      items.map((item,i)=>{
        const title=String(item.title||'Task '+(i+1));
        return '<section class="working-notebook-archive__item"><h3>'+e(title)+'</h3>'+
          modeWorkingNotebook(topicId,mode,sectionId,pageId,item.id)+'</section>';
      }).join('')+
    '</div></details>';
}
