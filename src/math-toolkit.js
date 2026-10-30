// Pass 4: reusable, structured mathematics tools. Pure module: no DOM,
// remote requests, eval or automated marking. All SVG/HTML is escaped.
import {escapeHTML as e} from './logic.js';

export const TOOL_KINDS=Object.freeze(['graph','table','number-line','geometry','probability-tree']);
export const TOOL_LABELS=Object.freeze({
  graph:'Coordinate graph',
  table:'Data table',
  'number-line':'Number line',
  geometry:'Geometry diagram',
  'probability-tree':'Probability tree'
});
const finite=(n,min=-1000,max=1000)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const label=(s,n=36)=>typeof s==='string'&&s.length<=n;
const precision=n=>String(Number(n.toFixed(4)));
const number=n=>Number.isInteger(n)?String(n):String(Number(n.toFixed(2)));
const safe=x=>e(String(x));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

export function defaultToolData(kind){
  switch(kind){
    case 'graph':return {title:'Graph',mode:'quadratic',xLabel:'x',yLabel:'y',
      xMin:-5,xMax:5,yMin:-5,yMax:5,a:1,b:0,c:0,
      points:[{x:-2,y:2},{x:0,y:0},{x:2,y:3}],grid:true};
    case 'table':return {title:'Values table',headers:['x','y'],
      rows:[['',''],['',''],['','']]};
    case 'number-line':return {variable:'x',min:-5,max:5,boundary:2,relation:'ge'};
    case 'geometry':return {vertices:['A','B','C'],
      sides:['a','b','c'],angles:['','',''],rightAngle:false};
    case 'probability-tree':return {labels:['A','B','C','D','C','D'],
      probabilities:[0.5,0.5,0.6,0.4,0.2,0.8]};
    default:throw new RangeError('Unknown mathematical tool');
  }
}
export function validToolData(kind,data){
  if(!data||typeof data!=='object'||Array.isArray(data)||!TOOL_KINDS.includes(kind))return false;
  if(kind==='graph'){
    return label(data.title,90)&&['quadratic','linear','scatter'].includes(data.mode)&&
      label(data.xLabel,24)&&label(data.yLabel,24)&&
      ['xMin','xMax','yMin','yMax','a','b','c'].every(k=>finite(data[k]))&&
      data.xMax-data.xMin>=0.5&&data.xMax-data.xMin<=2000&&
      data.yMax-data.yMin>=0.5&&data.yMax-data.yMin<=2000&&
      typeof data.grid==='boolean'&&
      Array.isArray(data.points)&&data.points.length<=18&&
      data.points.every(p=>p&&finite(p.x)&&finite(p.y));
  }
  if(kind==='table'){
    return label(data.title,90)&&Array.isArray(data.headers)&&
      data.headers.length>=2&&data.headers.length<=6&&
      data.headers.every(x=>label(x,80))&&
      Array.isArray(data.rows)&&data.rows.length>=1&&data.rows.length<=12&&
      data.rows.every(row=>Array.isArray(row)&&row.length===data.headers.length&&
        row.every(x=>label(x,150)));
  }
  if(kind==='number-line'){
    return label(data.variable,18)&&finite(data.min)&&finite(data.max)&&
      finite(data.boundary)&&data.max-data.min>=0.5&&
      data.max-data.min<=2000&&data.boundary>=data.min&&
      data.boundary<=data.max&&['lt','le','gt','ge','eq'].includes(data.relation);
  }
  if(kind==='geometry'){
    return Array.isArray(data.vertices)&&data.vertices.length===3&&
      data.vertices.every(s=>label(s,24))&&
      Array.isArray(data.sides)&&data.sides.length===3&&
      data.sides.every(s=>label(s,36))&&
      Array.isArray(data.angles)&&data.angles.length===3&&
      data.angles.every(s=>label(s,32))&&typeof data.rightAngle==='boolean';
  }
  if(kind==='probability-tree'){
    return Array.isArray(data.labels)&&data.labels.length===6&&
      data.labels.every(s=>label(s,28))&&
      Array.isArray(data.probabilities)&&data.probabilities.length===6&&
      data.probabilities.every(n=>finite(n,0,1));
  }
  return false;
}
const svgStart=(description,viewBox='0 0 560 310')=>
  '<svg class="working-tool__svg" xmlns="http://www.w3.org/2000/svg" '+
  'viewBox="'+viewBox+'" role="img" aria-label="'+safe(description)+'" '+
  'preserveAspectRatio="xMidYMid meet">';
const txt=(x,y,value,attr='')=>'<text x="'+precision(x)+'" y="'+precision(y)+
  '" '+attr+'>'+safe(value)+'</text>';
const line=(x1,y1,x2,y2,attributes='')=>
  '<line x1="'+precision(x1)+'" y1="'+precision(y1)+'" x2="'+precision(x2)+
  '" y2="'+precision(y2)+'" '+attributes+'/>';
const tickStep=range=>{
  const raw=range/8,exponent=10**Math.floor(Math.log10(raw));
  const ratio=raw/exponent;
  return (ratio<=1?1:ratio<=2?2:ratio<=5?5:10)*exponent;
};
const ticks=(min,max)=>{
  const step=tickStep(max-min),result=[];
  for(let i=Math.ceil(min/step);i*step<=max+1e-10&&result.length<35;i++)
    result.push(Number((i*step).toPrecision(12)));
  return result;
};
function graphSVG(data,id){
  const left=62,top=24,width=450,height=225;
  const xp=x=>left+(x-data.xMin)/(data.xMax-data.xMin)*width;
  const yp=y=>top+height-(y-data.yMin)/(data.yMax-data.yMin)*height;
  const xTicks=ticks(data.xMin,data.xMax),yTicks=ticks(data.yMin,data.yMax);
  const clip='math-tool-clip-'+id.replace(/[^a-zA-Z0-9-]/g,'');
  let output=svgStart('Coordinate graph '+data.title+' with '+data.xLabel+
    ' and '+data.yLabel+' axes');
  output+='<defs><clipPath id="'+clip+'"><rect x="'+left+'" y="'+top+
    '" width="'+width+'" height="'+height+'"/></clipPath></defs>';
  output+='<rect x="'+left+'" y="'+top+'" width="'+width+'" height="'+height+
    '" fill="#fffefa" stroke="#a8bfb0"/>';
  if(data.grid){
    for(const x of xTicks)output+=line(xp(x),top,xp(x),top+height,
      'stroke="#e2eae1" stroke-width="1"');
    for(const y of yTicks)output+=line(left,yp(y),left+width,yp(y),
      'stroke="#e2eae1" stroke-width="1"');
  }
  if(data.xMin<=0&&data.xMax>=0)
    output+=line(xp(0),top,xp(0),top+height,'stroke="#476859" stroke-width="1.7"');
  if(data.yMin<=0&&data.yMax>=0)
    output+=line(left,yp(0),left+width,yp(0),'stroke="#476859" stroke-width="1.7"');
  for(const x of xTicks)output+=
    txt(xp(x),top+height+16,number(x),'font-size="11" fill="#5a7060" text-anchor="middle"');
  for(const y of yTicks)output+=
    txt(left-9,yp(y)+4,number(y),'font-size="11" fill="#5a7060" text-anchor="end"');
  output+=txt(left+width/2,293,data.xLabel,'text-anchor="middle" font-size="15" font-weight="600" fill="#305745"')+
    txt(20,14,data.yLabel,'font-size="15" font-weight="600" fill="#305745"');
  if(data.mode==='scatter'){
    output+='<g clip-path="url(#'+clip+')" fill="#2d718a" stroke="#fffefa" stroke-width="1.5">';
    for(const point of data.points)
      output+='<circle cx="'+precision(xp(point.x))+'" cy="'+precision(yp(point.y))+
        '" r="5.5"><title>'+safe('('+number(point.x)+', '+number(point.y)+')')+'</title></circle>';
    output+='</g>';
  }else{
    const coords=[];
    for(let i=0;i<=180;i++){
      const x=data.xMin+(data.xMax-data.xMin)*i/180;
      const y=data.mode==='linear'?data.b*x+data.c:data.a*x*x+data.b*x+data.c;
      if(Number.isFinite(y))coords.push((coords.length?'L':'M')+
        precision(xp(x))+' '+precision(clamp(yp(y),-100000,100000)));
    }
    output+='<g clip-path="url(#'+clip+')"><path d="'+coords.join(' ')+
      '" fill="none" stroke="#2d718a" stroke-width="3" stroke-linejoin="round"/></g>';
  }
  return output+'</svg>';
}
function tableHTML(data){
  return '<div class="working-tool__table-scroll"><table class="working-tool__table">'+
    '<caption>'+safe(data.title)+'</caption><thead><tr>'+
    data.headers.map(h=>'<th scope="col">'+safe(h)+'</th>').join('')+
    '</tr></thead><tbody>'+data.rows.map(row=>'<tr>'+
      row.map(cell=>'<td>'+safe(cell)+'</td>').join('')+'</tr>').join('')+
    '</tbody></table></div>';
}
const symbols={lt:'<',le:'≤',gt:'>',ge:'≥',eq:'='};
function numberLineSVG(data){
  const x0=55,x1=512,y=155;
  const x=n=>x0+(n-data.min)/(data.max-data.min)*(x1-x0);
  const bx=x(data.boundary);
  const right=['ge','gt'].includes(data.relation);
  const left=['le','lt'].includes(data.relation);
  const eq=data.relation==='eq';
  let svg=svgStart('Number line '+data.variable+' '+symbols[data.relation]+' '+
    number(data.boundary),'0 0 560 235');
  svg+=line(x0,y,x1,y,'stroke="#698175" stroke-width="2"');
  svg+='<path d="M 55 155 l 9 -5 v 10 Z M 512 155 l -9 -5 v 10 Z" fill="#698175"/>';
  for(const tick of ticks(data.min,data.max)){
    const tx=x(tick);
    svg+=line(tx,y-7,tx,y+7,'stroke="#698175" stroke-width="1.2"')+
      txt(tx,y+28,number(tick),'font-size="12" text-anchor="middle" fill="#456b57"');
  }
  if(!eq){
    svg+=line(right?bx:x0,y,right?x1:bx,y,
      'stroke="#27816e" stroke-width="7" stroke-linecap="round"');
    // Arrow at the end of a ray.
    const ax=right?x1:x0;
    svg+='<path d="M '+precision(ax)+' '+y+' l '+(right?-14:14)+
      ' -8 v 16 Z" fill="#27816e"/>';
  }
  svg+='<circle cx="'+precision(bx)+'" cy="'+y+
    '" r="8.5" fill="'+(data.relation==='lt'||data.relation==='gt'?'#fffefa':'#27816e')+
    '" stroke="#27816e" stroke-width="3"/>';
  svg+=txt(280,47,data.variable+' '+symbols[data.relation]+' '+number(data.boundary),
    'font-size="22" text-anchor="middle" fill="#274f40" font-weight="600"');
  return svg+'</svg>';
}
function geometrySVG(data){
  const [a,b,c]=data.rightAngle?[[110,235],[110,55],[430,235]]:
    [[110,230],[240,45],[430,230]];
  const [va,vb,vc]=data.vertices;
  let svg=svgStart('Triangle diagram, not to scale','0 0 560 310');
  svg+='<path d="M '+a.join(' ')+' L '+b.join(' ')+' L '+c.join(' ')+
    ' Z" fill="#eaf3e9" stroke="#306958" stroke-width="3" stroke-linejoin="round"/>';
  if(data.rightAngle)svg+='<path d="M 110 215 L 130 215 L 130 235" '+
    'fill="none" stroke="#306958" stroke-width="2"/>';
  svg+=txt(a[0]-24,a[1]+18,va,'font-size="18" fill="#274f40" font-weight="650"')+
    txt(b[0]-6,b[1]-16,vb,'font-size="18" fill="#274f40" font-weight="650"')+
    txt(c[0]+12,c[1]+14,vc,'font-size="18" fill="#274f40" font-weight="650"');
  const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
  const positions=[mid(b,c),mid(a,c),mid(a,b)];
  const shifts=[[20,-4],[0,23],[-24,-3]];
  for(let i=0;i<3;i++){
    svg+=txt(positions[i][0]+shifts[i][0],positions[i][1]+shifts[i][1],
      data.sides[i],'font-size="17" fill="#265b78" text-anchor="middle"');
  }
  const anglePlaces=[[a[0]+28,a[1]-14],[b[0]+6,b[1]+40],[c[0]-38,c[1]-14]];
  for(let i=0;i<3;i++)if(data.angles[i])
    svg+=txt(anglePlaces[i][0],anglePlaces[i][1],data.angles[i],
      'font-size="15" fill="#764f7c" text-anchor="middle"');
  svg+=txt(280,292,'Not to scale','font-size="13" fill="#738475" text-anchor="middle"');
  return svg+'</svg>';
}
function treeSVG(data){
  const from=[[56,156],[238,80],[238,232]];
  const to=[[238,80],[238,232],[468,36],[468,115],[468,195],[468,273]];
  const edges=[[from[0],to[0]],[from[0],to[1]],
    [from[1],to[2]],[from[1],to[3]],[from[2],to[4]],[from[2],to[5]]];
  let svg=svgStart('Two-stage probability tree','0 0 560 325');
  svg+=txt(56,27,'Start','font-size="14" fill="#52705e" text-anchor="middle"')+
    txt(235,27,'First event','font-size="14" fill="#52705e" text-anchor="middle"')+
    txt(474,20,'Second event','font-size="14" fill="#52705e" text-anchor="middle"');
  for(let i=0;i<6;i++){
    const [a,b]=edges[i],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    svg+=line(a[0],a[1],b[0],b[1],'stroke="#377361" stroke-width="2.3"')+
      txt(mid[0],mid[1]-9,number(data.probabilities[i]),
        'font-size="13" fill="#785383" text-anchor="middle"')+
      txt(b[0]+10,b[1]+4,data.labels[i],'font-size="14" fill="#264f3c" font-weight="650"');
  }
  svg+='<circle cx="56" cy="156" r="4" fill="#377361"/>';
  for(const [p] of edges)svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="#377361"/>';
  svg+='</svg>';
  const validPair=(a,b)=>Math.abs(a+b-1)<1e-8;
  const consistent=validPair(data.probabilities[0],data.probabilities[1])&&
    validPair(data.probabilities[2],data.probabilities[3])&&
    validPair(data.probabilities[4],data.probabilities[5]);
  return '<div class="working-tool__tree">'+svg+
    '<p class="working-tool__tree-check">'+(consistent?
      'Each pair of branch probabilities sums to 1.':
      'Check your probability model: at least one pair of branches does not sum to 1.')+
    '</p></div>';
}
export function renderToolPreview(kind,data,{id='block-1'}={}){
  if(!validToolData(kind,data))throw new TypeError('Invalid mathematical tool content');
  if(typeof id!=='string'||!/^[a-z0-9-]+$/i.test(id))
    throw new TypeError('Invalid tool block identifier');
  switch(kind){
    case 'graph':return graphSVG(data,id);
    case 'table':return tableHTML(data);
    case 'number-line':return numberLineSVG(data);
    case 'geometry':return geometrySVG(data);
    case 'probability-tree':return treeSVG(data);
    default:throw new RangeError('Unknown mathematical tool');
  }
}
