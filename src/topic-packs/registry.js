// Registered topic packs: teacher-authored data stays separate from executable question banks.
 // A topic with authoring.status='draft' is hidden from the public hub until released.
import {SITE_CONFIG} from '../site-config.js';
import {topic as sampling} from './sampling/index.js';
import {topic as quadratics} from './quadratics/index.js';
import {questionBank as samplingQuestions} from './sampling/question-bank.js';
import {questionBank as quadraticsQuestions} from './quadratics/question-bank.js';
import {visuals as samplingVisuals} from './sampling/visuals.js';
import {visuals as quadraticsVisuals} from './quadratics/visuals.js';
// @topic-creator:imports

const REGISTRATIONS=Object.freeze([
  {topic:sampling,questionBank:samplingQuestions,visuals:samplingVisuals},
  {topic:quadratics,questionBank:quadraticsQuestions,visuals:quadraticsVisuals},
  // @topic-creator:entries
]);
const enabled=SITE_CONFIG.mode==='standalone'?
  REGISTRATIONS.filter(entry=>entry.topic.id===SITE_CONFIG.topicId):
  REGISTRATIONS.filter(entry=>entry.topic.authoring?.status!=='draft');
if(SITE_CONFIG.mode==='standalone'&&enabled.length!==1)
  throw Error('Unknown standalone topic: '+SITE_CONFIG.topicId);
if(!enabled.length)throw Error('At least one published topic is required in the topic hub.');
if(new Set(REGISTRATIONS.map(e=>e.topic.id)).size!==REGISTRATIONS.length)
  throw Error('Duplicate topic IDs are not supported.');
export const TOPIC_PACKS=Object.freeze(enabled.map(entry=>entry.topic));
export const TOPICS=Object.freeze(Object.fromEntries(TOPIC_PACKS.map(topic=>[topic.id,topic])));
export const QUESTION_BANKS=Object.freeze(Object.fromEntries(
  enabled.map(entry=>[entry.topic.id,entry.questionBank])));
export const VISUAL_LIBRARIES=Object.freeze(Object.fromEntries(
  enabled.map(entry=>[entry.topic.id,entry.visuals])));
export const DEFAULT_TOPIC=TOPIC_PACKS[0].id;
