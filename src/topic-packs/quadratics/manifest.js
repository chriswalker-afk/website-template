// Site identity and enabled learning modes. Change this file to customise the topic.
export const manifest=Object.freeze({
  id:"quadratics",
  title:"Quadratic Functions",
  subject:"Algebra",
  paper:"squared",
  modes:{
    understand:true,
    memorise:true,
    fluency:true,
    reasoning:true,
    problemSolving:true,
    modelling:true,
    games:true
  },
  worksheetSkills:[
    {id:'vertex',label:'Turning points'},
    {id:'roots',label:'Factorised equations'},
    {id:'expanded',label:'Expanded equations'},
    {id:'discriminant',label:'Discriminant'},
    {id:'fluency',label:'Generated Fluency practice'}
  ]
});
