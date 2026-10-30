// Compatibility facade: authored content is owned by individual topic packs.
import {TOPIC_PACKS} from './topic-packs/registry.js';
export const REASONING_CHAPTERS=Object.freeze(Object.fromEntries(TOPIC_PACKS.filter(topic=>topic.chapters?.reasoning?.length).map(topic=>[topic.id,topic.chapters.reasoning])));
export const REASONING_MODES=Object.freeze(['explain','justify','critique','generalise']);
