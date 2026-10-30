// Additional printable Edexcel Foundation gradient questions with worked solutions.
import {between,pick,math} from '../builders/worksheet-authoring.js';
const number=n=>String(Math.round(n*10000)/10000);
const signed=n=>n<0?'−'+number(-n):number(n);
const texSigned=n=>String(n);
const makeEquation=(m,c)=>{
  const term=m===0?'':m===1?'x':m===-1?'-x':number(m)+'x';
  const constant=c===0?'':term?(c>0?'+'+c:String(c)):String(c);
  return 'y='+(term+constant||'0');
};
export const worksheetFamilies=Object.freeze([
  {id:'gradient-grid',skill:'grid',create(rng,difficulty){
    const run=between(rng,2,difficulty==='stretch'?8:6);
    const slope=pick(rng,difficulty==='developing'?[1,2,3]:
      [-3,-2,-1,-0.5,0.5,1,2,3]);
    const rise=run*Math.abs(slope),direction=slope<0?'down':'up';
    return {signature:'grid:'+run+':'+slope,marks:2,spaceMm:25,
      prompt:'A straight line moves '+run+' squares right and '+number(rise)+
        ' squares '+direction+'. Calculate the gradient.',
      questionTex:'A straight line moves '+run+' squares right and '+number(rise)+
        ' squares '+direction+'. Calculate its gradient.',
      answerTex:math('m='+texSigned(slope)),
      solutionTex:'Signed rise = '+math(texSigned(slope*run))+
        ' and horizontal run = '+math(String(run))+'. So '+
        math('m=\\frac{'+texSigned(slope*run)+'}{'+run+'}='+texSigned(slope))+'.',
      hintTex:'Gradient = '+math('\\frac{\\text{signed rise}}{\\text{horizontal run}}')+'.'};
  }},
  {id:'gradient-equation',skill:'equations',create(rng,difficulty){
    const slope=pick(rng,difficulty==='developing'?[1,2,3,-1]:
      [-4,-3,-2,-1,0,0.5,1,2,3,4]),c=between(rng,-9,9),eq=makeEquation(slope,c);
    return {signature:'equation:'+slope+':'+c,marks:2,spaceMm:22,
      prompt:'The line has equation '+eq+'. State its gradient.',
      questionTex:'State the gradient of the straight line '+math(eq)+'.',
      answerTex:math('m='+texSigned(slope)),
      solutionTex:'In '+math('y=mx+c')+', the coefficient multiplying '+
        math('x')+' is '+math(texSigned(slope))+', so the gradient is '+
        math('m='+texSigned(slope))+'. The constant is not the gradient.',
      hintTex:'Find the coefficient of '+math('x')+' in '+math('y=mx+c')+'.'};
  }},
  {id:'gradient-table',skill:'tables',create(rng,difficulty){
    const m=pick(rng,difficulty==='developing'?[1,2,3]:[-3,-2,-1,0,1,2,3]);
    const x1=between(rng,-3,2),dx=between(rng,2,5),x2=x1+dx;
    const y1=between(rng,-7,7),y2=y1+m*dx;
    return {signature:'table:'+m+':'+x1+':'+dx+':'+y1,marks:3,spaceMm:32,
      prompt:'A table gives (x, y) = ('+signed(x1)+', '+signed(y1)+') and ('+
        signed(x2)+', '+signed(y2)+'). Find the gradient.',
      questionTex:'A straight-line table contains '+math('('+x1+','+y1+')')+
        ' and '+math('('+x2+','+y2+')')+'. Find the gradient.',
      answerTex:math('m='+m),
      solutionTex:'The change in '+math('y')+' is '+math('('+y2+')-('+y1+')='+m*dx)+
        '. The change in '+math('x')+' is '+math('('+x2+')-('+x1+')='+dx)+
        '. Hence '+math('m=\\frac{'+(m*dx)+'}{'+dx+'}='+m)+'.',
      hintTex:'Divide the signed change in '+math('y')+' by the change in '+math('x')+'.'};
  }},
  {id:'gradient-real-world',skill:'context',create(rng,difficulty){
    const run=pick(rng,[2,4,5,8,10]),slope=pick(rng,
      difficulty==='developing'?[0.5,1,2]:[0.2,0.25,0.5,1,1.5,2]);
    const rise=Math.round(run*slope*100)/100;
    return {signature:'context:'+run+':'+slope,marks:3,spaceMm:32,
      prompt:'In a scale diagram, a ramp gains '+number(rise)+' m in height over '+
        run+' m horizontally. Find its gradient and interpret the answer.',
      questionTex:'In a scale diagram, a ramp gains '+number(rise)+' m in height over '+
        run+' m horizontally. Find the gradient and interpret it.',
      answerTex:math('m='+slope),
      solutionTex:'Rise = '+math(String(rise))+' m and run = '+math(String(run))+
        ' m. Therefore '+math('m=\\frac{'+rise+'}{'+run+'}='+slope)+
        '. The height increases by '+number(slope)+' m per horizontal metre.',
      hintTex:'Use the horizontal distance, not the sloping length, for the run.'};
  }}
]);
