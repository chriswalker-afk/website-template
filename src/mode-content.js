// Compatibility facade for consumers of the original demo chapter map.
import {TOPIC_PACKS} from './topic-packs/registry.js';
export const DEMO_CHAPTERS=Object.freeze(Object.fromEntries(TOPIC_PACKS.map(topic=>[topic.id,topic.chapters])));
