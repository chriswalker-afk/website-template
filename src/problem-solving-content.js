// Compatibility facade: authored content is owned by individual topic packs.
import {TOPIC_PACKS} from './topic-packs/registry.js';
export const PROBLEM_SOLVING_CHAPTERS=Object.freeze(Object.fromEntries(TOPIC_PACKS.filter(topic=>topic.chapters?.problemSolving?.length).map(topic=>[topic.id,topic.chapters.problemSolving])));
export const PROBLEM_SOLVING_LEVELS=Object.freeze(['level-1','level-2','level-3','level-4']);
