// Compatibility facade: authored content is owned by individual topic packs.
import {TOPIC_PACKS} from './topic-packs/registry.js';
export const UNDERSTAND_CONTENT=Object.freeze(Object.fromEntries(TOPIC_PACKS.filter(topic=>topic.chapters?.understand?.length).map(topic=>[topic.id,topic.chapters.understand])));
