// Single entrypoint for installed topic packs. Register new packs here, not in the shared engines.
import {topic as sampling} from './sampling/index.js';
import {topic as quadratics} from './quadratics/index.js';
import {questionBank as samplingQuestions} from './sampling/question-bank.js';
import {questionBank as quadraticsQuestions} from './quadratics/question-bank.js';
import {visuals as samplingVisuals} from './sampling/visuals.js';
import {visuals as quadraticsVisuals} from './quadratics/visuals.js';

export const TOPIC_PACKS=Object.freeze([sampling,quadratics]);
export const TOPICS=Object.freeze(Object.fromEntries(TOPIC_PACKS.map(topic=>[topic.id,topic])));
// Keep executable generators outside the serialisable topic records.
export const QUESTION_BANKS=Object.freeze({sampling:samplingQuestions,quadratics:quadraticsQuestions});
export const VISUAL_LIBRARIES=Object.freeze({sampling:samplingVisuals,quadratics:quadraticsVisuals});
export const DEFAULT_TOPIC='sampling';
