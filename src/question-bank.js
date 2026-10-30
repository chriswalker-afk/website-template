// Shared, read-only topic question registry for interactive practice and printable work.
// All authored mathematical families belong to topic packs; no topic switch statements here.
import {TOPICS} from './topics.js';

const EMPTY=Object.freeze({fluency:Object.freeze({}),worksheet:Object.freeze([]),scaffolds:Object.freeze({})});
const slug=value=>typeof value==='string'&&/^[a-z][a-z0-9-]*$/.test(value);
export function questionBankFor(topicId){return TOPICS[topicId]?.questionBank||EMPTY;}
export function fluencyFamiliesFor(topicId){return questionBankFor(topicId).fluency||EMPTY.fluency;}
export function worksheetFamiliesFor(topicId){return questionBankFor(topicId).worksheet||EMPTY.worksheet;}
export function fluencyScaffoldsFor(topicId){return questionBankFor(topicId).scaffolds||EMPTY.scaffolds;}
export function worksheetSkillOptionsFor(topicId){
  const topic=TOPICS[topicId];if(!topic)return [];
  const available=new Set(worksheetFamiliesFor(topicId).map(family=>family.skill));
  if(topic.modes?.fluency!==false&&topic.chapters?.fluency?.length&&
     Object.keys(fluencyFamiliesFor(topicId)).length)available.add('fluency');
  return (topic.worksheetSkills||[]).filter(skill=>available.has(skill.id));
}
// This validator also accepts an unregistered pack, so a new topic can be checked
// independently before adding it to the app registry.
export function validateQuestionBank(topic){
  const errors=[],bank=topic?.questionBank||EMPTY;
  const fluency=bank.fluency||{},worksheet=bank.worksheet||[];
  if(topic?.questionBank&&bank.schemaVersion!==1)errors.push('unsupported question-bank schema version');
  if(!fluency||typeof fluency!=='object'||Array.isArray(fluency))
    errors.push('Fluency family registry must be an object');
  for(const [id,create] of Object.entries(fluency||{}))
    if(!slug(id)||typeof create!=='function')errors.push('invalid Fluency family '+id);
  if(!Array.isArray(worksheet))errors.push('worksheet family registry must be an array');
  const ids=new Set(),availableSkills=new Set();
  for(const family of Array.isArray(worksheet)?worksheet:[]){
    if(!slug(family.id)||family.id==='fluency-generated'||ids.has(family.id)||
       !slug(family.skill)||typeof family.create!=='function')
      errors.push('invalid or duplicated worksheet family '+family.id);
    ids.add(family.id);availableSkills.add(family.skill);
  }
  const enabled=topic?.modes?.fluency!==false&&Boolean(topic?.chapters?.fluency?.length);
  if(enabled){
    if(!Object.keys(fluency).length)errors.push('enabled Fluency has no question families');
    for(const section of topic.chapters.fluency)for(const page of section.pages||[])
      for(const familyId of page.families||[])
        if(typeof fluency[familyId]!=='function')
          errors.push('missing Fluency generator '+section.id+'/'+page.id+'/'+familyId);
    availableSkills.add('fluency');
  }
  const options=topic?.worksheetSkills||[];
  if(!Array.isArray(options))errors.push('worksheet skill labels must be an array');
  const defined=new Set();
  for(const skill of Array.isArray(options)?options:[]){
    if(!slug(skill.id)||defined.has(skill.id)||typeof skill.label!=='string'||!skill.label.trim())
      errors.push('invalid or duplicated worksheet skill '+skill.id);
    defined.add(skill.id);
    if(!availableSkills.has(skill.id))errors.push('worksheet skill has no question family '+skill.id);
  }
  for(const id of availableSkills)if(id!=='fluency'&&!defined.has(id))
    errors.push('worksheet family references undeclared skill '+id);
  const scaffolds=bank.scaffolds||{};
  for(const mode of ['guided','structured'])for(const [familyId,cue] of Object.entries(scaffolds[mode]||{})){
    if(typeof fluency[familyId]!=='function')errors.push('scaffold references missing family '+familyId);
    if(mode==='guided'&&typeof cue!=='string')errors.push('guided cue must be text '+familyId);
    if(mode==='structured'&&(!Array.isArray(cue)||cue.length!==3||cue.some(t=>typeof t!=='string')))
      errors.push('structured cue needs three steps '+familyId);
  }
  return errors;
}
