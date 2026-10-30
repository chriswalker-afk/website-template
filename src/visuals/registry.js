// Visual entries are registered alongside topic packs, never switched on topic names in the UI.
import {VISUAL_LIBRARIES} from '../topic-packs/registry.js';
const EMPTY=Object.freeze({schemaVersion:1,diagrams:Object.freeze({}),explorers:Object.freeze({})});
export function visualLibraryFor(topicId){return VISUAL_LIBRARIES[topicId]||EMPTY;}
export function diagramFor(topicId,block){
  return typeof block.variant==='string'?visualLibraryFor(topicId).diagrams?.[block.variant]:
    block.visual||block.variant;
}
export function explorerFor(topicId,page){
  return visualLibraryFor(topicId).explorers?.[page.visualId||page.id]||null;
}
export function explorerKey(route){
  return [route.topicId,route.sectionId,route.pageId].join(':');
}
