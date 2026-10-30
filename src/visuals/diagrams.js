// Content-driven, accessible visual primitives for Understand lesson figures.
import {renderCoordinatePlot} from './plot-svg.js';
const e=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const coord=(x,min,max,left,right)=>left+(x-min)*(right-left)/(max-min);
function dotGrid(config){
  const chosen=new Set(config.selected||[]);
  return '<div class="dot-field" role="img" aria-label="'+
    e(config.label||chosen.size+' selected out of '+config.count+' dots')+
    '" style="grid-template-columns:repeat('+Number(config.columns||8)+',1fr)">'+
    Array.from({length:config.count},(_,i)=>
      '<span class="dot'+(chosen.has(i)?' dot--chosen':'')+'" aria-hidden="true"></span>').join('')+
    '</div>';
}
function numberLine(config){
  const min=config.min,max=config.max,X=value=>coord(value,min,max,45,535),y=91;
  const ticks=Array.from({length:Math.floor(max-min)+1},(_,i)=>min+i).filter(x=>x<=max);
  const line='<line x1="35" y1="'+y+'" x2="545" y2="'+y+
    '" stroke="#355b48" stroke-width="2"/><path d="M535 85l10 6-10 6 M45 85l-10 6 10 6" fill="none" stroke="#355b48" stroke-width="1.5"/>';
  const marks=ticks.map(x=>'<line x1="'+X(x)+'" y1="84" x2="'+X(x)+
    '" y2="98" stroke="#456554" stroke-width="1.5"/><text x="'+X(x)+
    '" y="118" text-anchor="middle" font-size="13" fill="#355b48">'+e(x)+'</text>').join('');
  const intervals=(config.intervals||[]).map(v=>{
    const a=X(v.from),b=X(v.to);
    return '<line x1="'+a+'" y1="'+y+'" x2="'+b+'" y2="'+y+
      '" stroke="#2d755f" stroke-width="6" stroke-linecap="round"/>'+
      [v.from,v.to].map((value,i)=>'<circle cx="'+X(value)+'" cy="'+y+
        '" r="7" fill="'+((i===0?v.openFrom:v.openTo)?'#fff':'#2d755f')+
        '" stroke="#2d755f" stroke-width="2.5"/>').join('');
  }).join('');
  const points=(config.points||[]).map(p=>'<circle cx="'+X(p.value)+'" cy="'+y+
    '" r="6" fill="#d5a665" stroke="#254d3b" stroke-width="2"/>'+
    (p.label?'<text x="'+X(p.value)+'" y="64" text-anchor="middle" font-size="14" fill="#315b47">'+
      e(p.label)+'</text>':'')).join('');
  return '<svg class="visual-diagram visual-diagram--number-line" role="img" viewBox="0 0 580 145" aria-label="'+
    e(config.label||'Number line from '+min+' to '+max)+'">'+line+marks+intervals+points+'</svg>';
}
function probabilityTree(config){
  const leaves=[];
  function walk(node,depth,path){
    if(!node.branches?.length){leaves.push(path);return;}
    node.branches.forEach((branch,i)=>walk(branch.to,depth+1,path.concat(i)));
  }
  walk(config.root,0,[]);
  const maxDepth=Math.max(1,...leaves.map(l=>l.length));
  const height=Math.max(160,leaves.length*52),left=85,right=560;
  const entries=[],edges=[];
  function visit(node,depth,path){
    const relevant=leaves.map((leaf,i)=>leaf.slice(0,path.length).join(':')===path.join(':')?i:-1).filter(i=>i>=0);
    const y=35+(relevant[0]+relevant.at(-1))*.5*(height-70)/Math.max(1,leaves.length-1);
    const x=left+depth*(right-left)/maxDepth;
    entries.push('<circle cx="'+x+'" cy="'+y+'" r="4" fill="#2d755f"/>'+
      '<text x="'+(x+6)+'" y="'+(y-9)+'" font-size="13" fill="#315b47">'+e(node.label)+'</text>');
    (node.branches||[]).forEach((branch,i)=>{
      const next=path.concat(i),subset=leaves.map((leaf,index)=>leaf.slice(0,next.length).join(':')===next.join(':')?index:-1).filter(z=>z>=0);
      const y2=35+(subset[0]+subset.at(-1))*.5*(height-70)/Math.max(1,leaves.length-1);
      const x2=left+(depth+1)*(right-left)/maxDepth;
      edges.push('<line x1="'+x+'" y1="'+y+'" x2="'+x2+'" y2="'+y2+'" stroke="#6d927d" stroke-width="2"/>'+
        '<text x="'+((x+x2)/2)+'" y="'+((y+y2)/2-8)+'" text-anchor="middle" font-size="12" fill="#365b48">'+
          e(branch.probability===undefined?'':branch.probability)+'</text>');
      visit(branch.to,depth+1,next);
    });
  }
  visit(config.root,0,[]);
  return '<svg class="visual-diagram visual-diagram--probability-tree" role="img" viewBox="0 0 640 '+height+
    '" aria-label="'+e(config.label||'Probability tree')+'">'+edges.join('')+entries.join('')+'</svg>';
}
export function renderDiagram(config){
  if(config?.type==='dot-grid')return dotGrid(config);
  if(config?.type==='coordinate-plot')return renderCoordinatePlot({...config,compact:true});
  if(config?.type==='number-line')return numberLine(config);
  if(config?.type==='probability-tree')return probabilityTree(config);
  throw Error('Unsupported diagram type: '+config?.type);
}
