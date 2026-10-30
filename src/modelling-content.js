// Compatibility facade: authored content is owned by individual topic packs.
import {TOPIC_PACKS} from './topic-packs/registry.js';
export const MODELLING_CHAPTERS=Object.freeze(Object.fromEntries(TOPIC_PACKS.filter(topic=>topic.chapters?.modelling?.length).map(topic=>[topic.id,topic.chapters.modelling])));
export {MODELLING_PHASES} from './topic-packs/builders/modelling.js';
