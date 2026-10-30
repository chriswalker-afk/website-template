// Single entrypoint for installed topic packs. Register new packs here, not in the shared engines.
import {topic as sampling} from './sampling/index.js';
import {topic as quadratics} from './quadratics/index.js';

export const TOPIC_PACKS=Object.freeze([sampling,quadratics]);
export const TOPICS=Object.freeze(Object.fromEntries(TOPIC_PACKS.map(topic=>[topic.id,topic])));
export const DEFAULT_TOPIC='sampling';
