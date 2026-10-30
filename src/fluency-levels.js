import {TOPICS,TOPIC_PACKS} from './topics.js';
// Reusable four-level practice contract, aligned with Problem Solving.
// Fluency focuses on accuracy and method selection rather than extended
// reasoning. Cues contain no generated answers or worked numerical steps.
export const FLUENCY_LEVELS=Object.freeze([
  Object.freeze({
    id:'level-1',name:'Guided',
    overview:'The starting method is shown. Focus on setting up each calculation accurately.',
    cueLabel:'Start here',showSkill:true
  }),
  Object.freeze({
    id:'level-2',name:'Structured',
    overview:'Use a short method checklist to organise your working before calculating.',
    cueLabel:'Method checklist',showSkill:true
  }),
  Object.freeze({
    id:'level-3',name:'Independent',
    overview:'Select the method and carry out each calculation without a starting cue.',
    cueLabel:null,showSkill:false
  }),
  Object.freeze({
    id:'level-4',name:'Challenge',
    overview:'Tackle more demanding and combined calculations, deciding the method yourself.',
    cueLabel:null,showSkill:false
  })
]);

export function fluencyLevel(levelId){
  return FLUENCY_LEVELS.find(level=>level.id===levelId)||null;
}
export function fluencyQuestionScaffold(levelId,familyId,topicId){
  const level=fluencyLevel(levelId);
  if(!level||typeof familyId!=='string')return null;
  // A topic ID avoids collisions when two topic packs use the same family name.
  // Two-argument calls remain supported for existing integrations and tests.
  const topic=topicId?TOPICS[topicId]:TOPIC_PACKS.find(t=>
    Object.prototype.hasOwnProperty.call(t.questionBank?.fluency||{},familyId));
  const guided=topic?.questionBank?.scaffolds?.guided||{};
  const structured=topic?.questionBank?.scaffolds?.structured||{};
  if(levelId==='level-1')return {
    label:level.cueLabel,
    steps:[guided[familyId]||
      'Identify what is given and what needs to be calculated before substituting values.']
  };
  if(levelId==='level-2')return {
    label:level.cueLabel,
    steps:structured[familyId]||[
      'Identify the quantities that are known and required.',
      'Choose an appropriate familiar method and calculate.',
      'Check that the result satisfies the question.'
    ]
  };
  return null;
}
export function showFluencySkill(levelId,answered){
  const level=fluencyLevel(levelId);
  return Boolean(level&&(level.showSkill||answered));
}
