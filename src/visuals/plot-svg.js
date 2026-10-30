// One reusable coordinate plot for static diagrams and interactive graph explorers.
// Only vetted model types are evaluated; arbitrary expressions are never executed.
import {equationFor,valueAt,quadraticProperties,isMathematicalModel} from './models.js';
const e=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const n=value=>Number(value.toFixed(2));
const defaults=Object.freeze({xMin:-5,xMax:5,yMin:-8,yMax:8});
const fmt=n=>String(Number(n.toFixed(2)));
export function renderCoordinatePlot({model,reference=null,view=defaults,compact=false}){
  if(!isMathematicalModel(model)||reference&&!isMathematicalModel(reference))
    throw Error('Invalid coordinate plot model');
  const bounds={...defaults,...view};
  if(![bounds.xMin,bounds.xMax,bounds.yMin,bounds.yMax].every(Number.isFinite)||
     bounds.xMin>=bounds.xMax||bounds.yMin>=bounds.yMax)throw Error('Invalid plot bounds');
  const left=compact?24:60,right=compact?278:610,top=compact?14:34,bottom=compact?198:386;
  const width=compact?300:640,height=compact?220:420;
  const X=x=>left+(x-bounds.xMin)*(right-left)/(bounds.xMax-bounds.xMin);
  const Y=y=>bottom-(y-bounds.yMin)*(bottom-top)/(bounds.yMax-bounds.yMin);
  const withinX=x=>x>=bounds.xMin&&x<=bounds.xMax;
  const withinY=y=>y>=bounds.yMin&&y<=bounds.yMax;
  const grid=(axis,start,end,step)=>
    Array.from({length:Math.min(51,Math.floor((end-start)/step)+1)},(_,i)=>Number((start+i*step).toFixed(7)))
      .filter(v=>axis==='x'?withinX(v):withinY(v)).map(v=>axis==='x'?
        '<line x1="'+fmt(X(v))+'" y1="'+top+'" x2="'+fmt(X(v))+'" y2="'+bottom+'" stroke="#e4ece6" stroke-width="1"/>':
        '<line x1="'+left+'" y1="'+fmt(Y(v))+'" x2="'+right+'" y2="'+fmt(Y(v))+'" stroke="#e4ece6" stroke-width="1"/>').join('');
  const xStep=compact?2:1,yStep=compact?2:1;
  const lines=grid('x',Math.ceil(bounds.xMin/xStep)*xStep,bounds.xMax,xStep)+
    grid('y',Math.ceil(bounds.yMin/yStep)*yStep,bounds.yMax,yStep);
  const axisX=withinX(0)?'<line x1="'+fmt(X(0))+'" y1="'+top+'" x2="'+fmt(X(0))+'" y2="'+bottom+'" stroke="#647f71" stroke-width="1.9"/>':'';
  const axisY=withinY(0)?'<line x1="'+left+'" y1="'+fmt(Y(0))+'" x2="'+right+'" y2="'+fmt(Y(0))+'" stroke="#647f71" stroke-width="1.9"/>':'';
  const labels=compact?'':[-4,-2,0,2,4].filter(withinX).map(x=>
    '<text x="'+fmt(X(x))+'" y="'+fmt(Math.min(height-8,Y(0)+19))+'" text-anchor="middle" font-size="13" fill="#667c6d">'+x+'</text>').join('')+
    [-6,-3,3,6].filter(withinY).map(y=>
      '<text x="'+fmt(Math.max(12,X(0)-10))+'" y="'+fmt(Y(y)+4)+'" text-anchor="end" font-size="13" fill="#667c6d">'+y+'</text>').join('');
  const curve=fn=>Array.from({length:221},(_,i)=>{
    const x=bounds.xMin+(bounds.xMax-bounds.xMin)*i/220,y=fn(x);
    return (i===0?'M':'L')+fmt(X(x))+' '+fmt(Y(y));
  }).join(' ');
  const ref=reference?'<path d="'+curve(x=>valueAt(x,reference))+
    '" stroke="#9caaa3" stroke-width="2.5" fill="none" stroke-dasharray="6 7"/>':'';
  const current='<path d="'+curve(x=>valueAt(x,model))+
    '" stroke="#2d755f" stroke-width="'+(compact?3.5:4)+'" fill="none" stroke-linecap="round"/>';
  let feature='';
  if(model.kind==='quadratic'){
    const {h,k}=quadraticProperties(model);
    if(withinX(h)&&withinY(k))feature=
      '<line x1="'+fmt(X(h))+'" y1="'+top+'" x2="'+fmt(X(h))+'" y2="'+bottom+
      '" stroke="#c69b64" stroke-dasharray="5 6" stroke-width="1.6"/>'+
      '<circle cx="'+fmt(X(h))+'" cy="'+fmt(Y(k))+
      '" r="'+(compact?5:6)+'" fill="#d5a665" stroke="#fff" stroke-width="2"/>'+
      (compact?'<text x="'+fmt(X(h)+9)+'" y="'+fmt(Y(k)+17)+'" font-size="13" font-family="Georgia" fill="#315b47">'+e('('+h+', '+k+')')+'</text>':'');
  }else if(model.kind==='linear'&&withinX(0)&&withinY(model.b)){
    feature='<circle cx="'+fmt(X(0))+'" cy="'+fmt(Y(model.b))+
      '" r="5" fill="#d5a665" stroke="#fff" stroke-width="2"/>';
  }
  const id=compact?'mini-coordinate-clip':'graph-clip';
  const alt='Graph of '+equationFor(model)+
    (model.kind==='quadratic'?'; turning point ('+model.h+', '+model.k+')':'; y-intercept (0, '+model.b+')')+
    (reference?'; dotted reference '+equationFor(reference):'');
  return '<svg '+(compact?'class="mini-curve"':'id="graph-svg" class="graph-svg"')+
    ' viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+e(alt)+'">'+
    '<rect x="0" y="0" width="'+width+'" height="'+height+'" rx="7" fill="#fdfefd"/>'+
    '<defs><clipPath id="'+id+'"><rect x="'+left+'" y="'+top+
      '" width="'+(right-left)+'" height="'+(bottom-top)+'"/></clipPath></defs>'+
    lines+axisX+axisY+labels+
    '<text x="'+(right+1)+'" y="'+fmt(Y(0)-10)+'" font-family="Georgia" font-size="16" fill="#355b48">x</text>'+
    '<text x="'+fmt(X(0)+12)+'" y="'+(top-6)+'" font-family="Georgia" font-size="16" fill="#355b48">y</text>'+
    '<g clip-path="url(#'+id+')">'+ref+feature+current+'</g></svg>';
}
