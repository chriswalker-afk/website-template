// Compatibility facade for the per-topic vocabulary banks.
import {TOPIC_PACKS} from './topic-packs/registry.js';
export const CLOZE_BANK=Object.freeze(Object.fromEntries(TOPIC_PACKS.map(topic=>[topic.id,topic.clozes||[]])));
