// Pass 4 notebook tool editors. User input is verified by math-toolkit.js
// before it reaches localStorage or the printable SVG/HTML export.
import {escapeHTML as e} from './logic.js';
import {TOOL_KINDS,TOOL_LABELS,renderToolPreview,validToolData} from './math-toolkit.js';

const choices=(pairs,selected)=>pairs.map(([id,title])=>
  '<option value="'+e(id)+'"'+(id===selected?' selected':'')+'>'+
    e(title)+'</option>').join('');
const textField=(block,name,value,{max=90,type='text',step='any',min,maxNumber}={})=>
  '<label class="working-tool__field"><span>'+e(name)+'</span>'+
    '<input type="'+type+'" data-tool-field="'+e(name)+'" value="'+e(value)+
    '" maxlength="'+max+'"'+(type==='number'?' step="'+step+'"':'')+
    (min!==undefined?' min="'+min+'"':'')+
    (maxNumber!==undefined?' max="'+maxNumber+'"':'')+
    '/></label>';
const numeric=(name,value)=>textField(null,name,value,{type:'number'});
const selectField=(field,label,options,current)=>
  '<label class="working-tool__field"><span>'+e(label)+'</span>'+
    '<select data-tool-field="'+field+'">'+choices(options,current)+'</select></label>';
const arrayField=(name,index,value,title,{numeric=false,max=80}={})=>
  '<label class="working-tool__field"><span>'+e(title)+'</span>'+
    '<input '+(numeric?'type="number" step="any" min="0" max="1"':
      'type="text" maxlength="'+max+'"')+
    ' data-tool-list="'+name+'" data-tool-index="'+index+'" '+
    'value="'+e(value)+'"/></label>';
const fields=items=>'<div class="working-tool__fields">'+items.join('')+'</div>';
const sizeLimits=(title,max,limit)=>'<span class="working-tool__limit">'+e(title)+
  ': '+max+' / '+limit+'</span>';
function graphEditor(data){
  const mode=selectField('mode','Plot type',[
    ['linear','Straight line'],['quadratic','Quadratic'],['scatter','Scatter points']],data.mode);
  const basic=fields([
    textField(null,'title',data.title),
    mode,
    textField(null,'xLabel',data.xLabel,{max:24}),
    textField(null,'yLabel',data.yLabel,{max:24})
  ]);
  const bounds='<div class="working-tool__label">Axis window</div>'+
    fields(['xMin','xMax','yMin','yMax'].map(k=>numeric(k,data[k])));
  let definition='';
  if(data.mode!=='scatter'){
    const hint=data.mode==='linear'?'y = bx + c':'y = ax² + bx + c';
    definition='<p class="working-tool__hint">Function: '+hint+'</p>'+
      fields((data.mode==='linear'?['b','c']:['a','b','c']).map(k=>numeric(k,data[k])));
  }else{
    definition='<p class="working-tool__hint">Enter plotted coordinates. '+
      'The graph is a scatter plot, not a fitted regression line.</p>'+
      '<div class="working-tool__points">'+data.points.map((p,i)=>
        '<div class="working-tool__point">'+
          '<span>Point '+(i+1)+'</span>'+
          '<label>x<input type="number" step="any" data-tool-point="'+i+
            '" data-tool-coordinate="x" value="'+e(p.x)+'"/></label>'+
          '<label>y<input type="number" step="any" data-tool-point="'+i+
            '" data-tool-coordinate="y" value="'+e(p.y)+'"/></label>'+
          '<button type="button" data-tool-command="remove-point" data-tool-index="'+i+
            '" aria-label="Remove point '+(i+1)+'">Remove</button>'+
        '</div>').join('')+'</div>'+
      '<button type="button" data-tool-command="add-point"'+
        (data.points.length>=18?' disabled':'')+'>+ Add point</button>'+
      sizeLimits('Points',data.points.length,18);
  }
  return basic+bounds+definition+
    '<label class="working-tool__check"><input type="checkbox" data-tool-field="grid"'+
      (data.grid?' checked':'')+'/> Show grid lines</label>';
}
function tableEditor(data){
  const cols=data.headers.length,rows=data.rows.length;
  const rowsMarkup=data.rows.map((row,i)=>
    '<tr><th scope="row">'+(i+1)+'</th>'+
      row.map((cell,j)=>'<td><input type="text" maxlength="150" '+
        'data-tool-cell-row="'+i+'" data-tool-cell-col="'+j+'" '+
        'aria-label="Row '+(i+1)+', column '+(j+1)+'" value="'+e(cell)+'"/></td>').join('')+
      '</tr>').join('');
  return fields([textField(null,'title',data.title)])+
    '<p class="working-tool__hint">Edit column names and cells. '+
      'All entries are preserved exactly; no calculation is automatic.</p>'+
    '<div class="working-tool__table-scroll"><table class="working-tool__edit-table">'+
      '<thead><tr><th scope="col">#</th>'+
      data.headers.map((header,j)=>'<th scope="col">'+
        '<input type="text" maxlength="80" data-tool-header="'+j+
        '" aria-label="Column '+(j+1)+' heading" value="'+e(header)+'"/></th>').join('')+
      '</tr></thead><tbody>'+rowsMarkup+'</tbody></table></div>'+
    '<div class="working-tool__row-actions">'+
      '<button type="button" data-tool-command="add-row"'+(rows>=12?' disabled':'')+
        '>+ Row</button>'+
      '<button type="button" data-tool-command="remove-row"'+(rows<=1?' disabled':'')+
        '>− Row</button>'+
      '<button type="button" data-tool-command="add-column"'+(cols>=6?' disabled':'')+
        '>+ Column</button>'+
      '<button type="button" data-tool-command="remove-column"'+(cols<=2?' disabled':'')+
        '>− Column</button>'+
      sizeLimits('Rows',rows,12)+sizeLimits('Columns',cols,6)+
    '</div>';
}
function numberLineEditor(data){
  return '<p class="working-tool__hint">Choose the inequality and a window that includes the boundary.</p>'+
    fields([
      textField(null,'variable',data.variable,{max:18}),
      numeric('min',data.min),numeric('max',data.max),
      numeric('boundary',data.boundary),
      selectField('relation','Relationship',[
        ['lt','Less than (<)'],['le','Less than or equal (≤)'],
        ['gt','Greater than (>)'],['ge','Greater than or equal (≥)'],
        ['eq','Equal to (=)']],data.relation)
    ]);
}
function geometryEditor(data){
  return '<p class="working-tool__hint">Label the vertices, opposite sides, and angles. '+
    'The diagram is schematic, not a measurement tool.</p>'+
    '<div class="working-tool__label">Vertices</div>'+
    fields(data.vertices.map((v,i)=>arrayField('vertices',i,v,['A','B','C'][i],{max:24})))+
    '<div class="working-tool__label">Opposite sides</div>'+
    fields(data.sides.map((v,i)=>arrayField('sides',i,v,['Opposite A','Opposite B','Opposite C'][i],{max:36})))+
    '<div class="working-tool__label">Angles (optional)</div>'+
    fields(data.angles.map((v,i)=>arrayField('angles',i,v,['At A','At B','At C'][i],{max:32})))+
    '<label class="working-tool__check"><input type="checkbox" data-tool-field="rightAngle" '+
      (data.rightAngle?'checked':'')+'/> Show a right-angle marker at A</label>';
}
function probabilityTreeEditor(data){
  const stages=[
    {label:'First event',indices:[0,1]},
    {label:'Second event after the first upper branch',indices:[2,3]},
    {label:'Second event after the first lower branch',indices:[4,5]}
  ];
  return '<p class="working-tool__hint">Two-stage binary tree: probability labels on each branch. '+
    'The tree checks whether each pair sums to 1, but does not grade a model.</p>'+
    stages.map(stage=>'<div class="working-tool__label">'+e(stage.label)+'</div>'+
      fields(stage.indices.flatMap(i=>[
        arrayField('labels',i,data.labels[i],'Outcome '+(i+1),{max:28}),
        arrayField('probabilities',i,data.probabilities[i],'Probability '+(i+1),{numeric:true})
      ]))).join('');
}
export function renderToolEditor(block,{open=false}={}){
  if(!TOOL_KINDS.includes(block.kind)||!validToolData(block.kind,block.data))
    throw new TypeError('Invalid tool block');
  const {data,kind,id}=block;
  const form=kind==='graph'?graphEditor(data):
    kind==='table'?tableEditor(data):
    kind==='number-line'?numberLineEditor(data):
    kind==='geometry'?geometryEditor(data):probabilityTreeEditor(data);
  return '<div class="working-tool" data-tool-id="'+e(id)+'">'+
    '<div class="working-tool__preview" data-tool-preview>'+
      renderToolPreview(kind,data,{id})+'</div>'+
    '<details class="working-tool__settings" '+(open?'open':'')+'>'+
      '<summary>Edit '+e(TOOL_LABELS[kind].toLowerCase())+'</summary>'+
      '<div class="working-tool__form">'+form+
        '<p class="working-tool__status" data-tool-status role="status">'+
          'Changes are saved when you leave a field or choose an option.</p>'+
      '</div></details></div>';
}

function nextInputData(block,input){
  const data=JSON.parse(JSON.stringify(block.data));
  const field=input.dataset.toolField;
  if(field){
    if(!Object.prototype.hasOwnProperty.call(data,field))return null;
    if(input.type==='checkbox')data[field]=input.checked;
    else if(input.type==='number') {
      if(input.value.trim()==='')return null;
      data[field]=Number(input.value);
    }else data[field]=input.value;
    return data;
  }
  const list=input.dataset.toolList;
  if(list&&Array.isArray(data[list])){
    const i=Number(input.dataset.toolIndex);
    if(!Number.isInteger(i)||i<0||i>=data[list].length)return null;
    if(input.type==='number'){
      if(input.value.trim()==='')return null;
      data[list][i]=Number(input.value);
    }else data[list][i]=input.value;
    return data;
  }
  if(input.dataset.toolHeader!==undefined){
    const i=Number(input.dataset.toolHeader);
    if(!Number.isInteger(i)||i<0||i>=data.headers.length)return null;
    data.headers[i]=input.value;
    return data;
  }
  if(input.dataset.toolCellRow!==undefined){
    const row=Number(input.dataset.toolCellRow),col=Number(input.dataset.toolCellCol);
    if(!Number.isInteger(row)||!Number.isInteger(col)||!data.rows[row]||
      col<0||col>=data.headers.length)return null;
    data.rows[row][col]=input.value;
    return data;
  }
  if(input.dataset.toolPoint!==undefined){
    const i=Number(input.dataset.toolPoint),coordinate=input.dataset.toolCoordinate;
    if(!Number.isInteger(i)||i<0||i>=data.points.length||
      !['x','y'].includes(coordinate)||input.value.trim()==='')return null;
    data.points[i][coordinate]=Number(input.value);
    return data;
  }
  return null;
}
export function connectToolEditors(host,{getBlock,onChange,onCommand,onToggle}){
  for(const wrapper of host.querySelectorAll('[data-tool-id]')){
    const id=wrapper.dataset.toolId;
    const settings=wrapper.querySelector('.working-tool__settings');
    settings?.querySelector('summary')?.addEventListener('click',()=>{
      // The click runs before <details> changes its open state.
      onToggle(id,!settings.open);
    });
    wrapper.querySelectorAll('input,select').forEach(input=>{
      input.addEventListener('change',()=>{
        const block=getBlock(id);
        if(!block)return;
        const data=nextInputData(block,input);
        if(data&&validToolData(block.kind,data)){
          onChange(id,data);
        }else{
          const status=wrapper.querySelector('[data-tool-status]');
          if(status)status.textContent='Check this value. The previous valid version is still saved.';
          input.setAttribute('aria-invalid','true');
        }
      });
    });
    wrapper.querySelectorAll('[data-tool-command]').forEach(button=>{
      button.addEventListener('click',()=>{
        const block=getBlock(id);
        if(!block)return;
        const data=JSON.parse(JSON.stringify(block.data));
        const action=button.dataset.toolCommand;
        if(action==='add-point'&&data.points.length<18)
          data.points.push({x:0,y:0});
        else if(action==='remove-point'&&data.points.length>0)
          data.points.splice(Number(button.dataset.toolIndex),1);
        else if(action==='add-row'&&data.rows.length<12)
          data.rows.push(data.headers.map(()=>''));
        else if(action==='remove-row'&&data.rows.length>1)
          data.rows.pop();
        else if(action==='add-column'&&data.headers.length<6){
          data.headers.push('Column '+(data.headers.length+1));
          for(const row of data.rows)row.push('');
        }else if(action==='remove-column'&&data.headers.length>2){
          data.headers.pop();
          for(const row of data.rows)row.pop();
        }else return;
        if(validToolData(block.kind,data))onCommand(id,data);
      });
    });
  }
}
