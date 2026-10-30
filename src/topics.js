// Shared chapter definitions and backward-compatible registry facade.
export const CHAPTER_LIBRARY = Object.freeze([
  {id:'understand',label:'Understand',short:'Understand',color:'#d2a46d',description:'Explanations and examples',icon:'eye'},
  {id:'memorise',label:'Memorise',short:'Memorise',color:'#6f9d99',description:'Definitions and retrieval',icon:'layers'},
  {id:'fluency',label:'Fluency',short:'Fluency',color:'#97b27f',description:'Practise techniques',icon:'pen'},
  {id:'reasoning',label:'Reasoning',short:'Reasoning',color:'#b38da8',description:'Justify and evaluate',icon:'spark'},
  {id:'problemSolving',label:'Problem Solving',short:'Problem Solving',color:'#c18c76',description:'Unfamiliar problems',icon:'puzzle'},
  {id:'modelling',label:'Modelling',short:'Modelling',color:'#80a0bc',description:'Real-world applications',icon:'grid'},
  {id:'games',label:'Games',short:'Games',color:'#b6a36f',description:'Topic challenges',icon:'spark'},
  {id:'examPractice',label:'Exam Practice',short:'Exam',color:'#898c9f',description:'Questions and mark schemes',icon:'pen'}
]);

export {TOPIC_PACKS,TOPICS,DEFAULT_TOPIC} from './topic-packs/registry.js';
