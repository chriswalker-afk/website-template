import {CHAPTER_LIBRARY,TOPICS,DEFAULT_TOPIC} from './topics.js';
import {supportsWorksheets} from './worksheet-generator.js';


export const CHAPTER_BY_ID = Object.fromEntries(CHAPTER_LIBRARY.map(x=>[x.id,x]));
export const KNOWN_CHAPTER_IDS = CHAPTER_LIBRARY.map(x=>x.id);
const RESOURCE_CHAPTER={id:'resources',label:'Resources'};
const RESOURCE_SECTIONS=[{id:'worksheet-generator',label:'Worksheet Generator'}];
const isSlug=value=>/^[a-z][a-z0-9-]*$/.test(value);
export const chaptersFor=topic=>CHAPTER_LIBRARY.filter(chapter=>Array.isArray(topic?.chapters?.[chapter.id])&&topic.chapters[chapter.id].length>0);
export const sectionsFor=(topic,chapter)=>chapter==='resources'?
  (supportsWorksheets(topic?.id)?RESOURCE_SECTIONS:[]):(topic?.chapters?.[chapter]||[]);
export const chapterFor=id=>CHAPTER_BY_ID[id]??(id==='resources'?RESOURCE_CHAPTER:null);
export function routeHref(topicId,chapterId='home',sectionId){
  return '#/'+[topicId,chapterId,...(sectionId?[sectionId]:[])].map(encodeURIComponent).join('/');
}
export function resolveRoute(hash){
  const path=String(hash??'').replace(/^#\/?/,'').split('/').filter(Boolean);
  const [requestedTopic,requestedChapter,requestedSection]=path;
  const topic=TOPICS[requestedTopic]||TOPICS[DEFAULT_TOPIC];
  const chapters=chaptersFor(topic);
  const chapterId=chapters.some(x=>x.id===requestedChapter)||
    (requestedChapter==='resources'&&supportsWorksheets(topic.id))?requestedChapter:'home';
  const sections=sectionsFor(topic,chapterId);
  const sectionId=chapterId==='home'?null:(sections.some(x=>x.id===requestedSection)?requestedSection:sections[0].id);
  return {topicId:topic.id,chapterId,sectionId,canonical:routeHref(topic.id,chapterId,sectionId)};
}
export function topicSwitchHref(targetTopic,currentChapter='home',currentSection=null){
  const topic=TOPICS[targetTopic]||TOPICS[DEFAULT_TOPIC];
  const chapter=chaptersFor(topic).some(c=>c.id===currentChapter)||
    (currentChapter==='resources'&&supportsWorksheets(topic.id))?currentChapter:'home';
  const section=sectionsFor(topic,chapter).find(s=>s.id===currentSection)?.id||sectionsFor(topic,chapter)[0]?.id;
  return routeHref(topic.id,chapter,chapter==='home'?undefined:section);
}
export function escapeHTML(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
export function normaliseAnswer(value){
  return String(value??'').trim().toLocaleLowerCase('en-GB').replace(/\s+/g,' ');
}
export function cardForIndex(topic,index){
  return topic.cards[((index%topic.cards.length)+topic.cards.length)%topic.cards.length];
}
export function sampleMatchCards(topic,count=3){
  return topic.cards.slice(0,Math.min(count,topic.cards.length));
}
export function validateTopics(topics=TOPICS){
  const issues=[];
  for(const [key,topic] of Object.entries(topics)){
    if(!isSlug(key)||topic.id!==key)issues.push(key+': invalid topic ID');
    if(!topic.title)issues.push(key+': missing title');
    if(!Array.isArray(topic.cards)||topic.cards.length<3)issues.push(key+': at least three flashcards required');
    const ids=new Set();
    for(const card of (topic.cards||[])){
      if(!isSlug(card.id)||ids.has(card.id)||!card.term||!card.definition)issues.push(key+': invalid/duplicate/incomplete card '+card.id);
      ids.add(card.id);
    }
    if(!topic.chapters||!Object.keys(topic.chapters).length)issues.push(key+': missing chapters');
    for(const [chapter,sections] of Object.entries(topic.chapters||{})){
      if(!CHAPTER_BY_ID[chapter]||!Array.isArray(sections)||sections.length===0)issues.push(key+': invalid or empty chapter '+chapter);
      const seen=new Set();
      for(const section of (Array.isArray(sections)?sections:[])){
        if(!isSlug(section.id)||seen.has(section.id)||!section.label)issues.push(key+': invalid section '+section.id);
        seen.add(section.id);
      }
    }
    if(topic.chapters?.memorise?.length&&!topic.cloze?.answer)issues.push(key+': no cloze answer');
  }
  return issues;
}
