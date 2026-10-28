import {CHAPTER_LIBRARY,TOPICS,DEFAULT_TOPIC} from './topics.js';
import {supportsWorksheets} from './worksheet-generator.js';
import {validateUnderstandContent} from './understand-engine.js';
import {validateMemoriseContent} from './memorise-engine.js';
import {validateFluencyChapters,FLUENCY_CHAPTERS} from './fluency-engine.js';
import {validateReasoningContent} from './reasoning-engine.js';
import {REASONING_CHAPTERS} from './reasoning-content.js';
import {PROBLEM_SOLVING_CHAPTERS} from './problem-solving-content.js';
import {validateProblemSolvingChapters} from './problem-solving-engine.js';

export const CHAPTER_BY_ID=Object.fromEntries(CHAPTER_LIBRARY.map(c=>[c.id,c]));
export const KNOWN_CHAPTER_IDS=CHAPTER_LIBRARY.map(c=>c.id);
const RESOURCE_CHAPTER={id:'resources',label:'Resources'};
const RESOURCE_SECTIONS=[{
  id:'worksheet-generator',label:'Worksheet Generator',
  description:'Choose skills, difficulty and length to create a LaTeX worksheet with matching answers or worked solutions.',
  pages:[{id:'main',type:'worksheet'}]
}];
const LEGACY_ROUTES={
  'sampling/understand/methods':'sampling/understand/how-it-works',
  'quadratics/understand/forms':'quadratics/understand/how-it-works',
  'quadratics/fluency/graph-lab':'quadratics/understand/visual-explanations',
  'quadratics/fluency/practice':'quadratics/fluency/level-1',
  'quadratics/modelling/model-lab':'quadratics/understand/visual-explanations',
  'quadratics/problemSolving/strategy':'quadratics/problemSolving/level-1',
  'sampling/reasoning/choose':'sampling/reasoning/justify',
  'sampling/reasoning/evaluate':'sampling/reasoning/critique',
  'sampling/games/arcade':'sampling/games/sprint',
  'quadratics/games/arcade':'quadratics/games/sprint'
};
const isSlug=value=>typeof value==='string'&&/^[a-z][a-z0-9-]*$/.test(value);
const MODE_PAGE_TYPES={
  understand:new Set(['lesson','graph','sampling-lab','workshop']),
  memorise:new Set(['flashcards','match-up','missing-words','speed-recall','review-all']),
  fluency:new Set(['fluency']),
  reasoning:new Set(['reasoning']),
  problemSolving:new Set(['problem-solving']),
  modelling:new Set(['questions']),
  games:new Set(['game']),
  examPractice:new Set(['questions'])
};
export const chaptersFor=topic=>CHAPTER_LIBRARY.filter(chapter=>
  Array.isArray(topic?.chapters?.[chapter.id])&&topic.chapters[chapter.id].length>0);
export const sectionsFor=(topic,chapter)=>chapter==='resources'?
  (supportsWorksheets(topic?.id)?RESOURCE_SECTIONS:[]):(topic?.chapters?.[chapter]||[]);
export const chapterFor=id=>CHAPTER_BY_ID[id]??(id==='resources'?RESOURCE_CHAPTER:null);
export const pagesFor=(topic,chapter,section)=>sectionsFor(topic,chapter)
  .find(item=>item.id===section)?.pages||[];
export function routeHref(topicId,chapterId='home',sectionId,pageId){
  return '#/'+[topicId,chapterId,...(sectionId?[sectionId]:[]),...(pageId?[pageId]:[])]
    .map(encodeURIComponent).join('/');
}
export function resolveRoute(hash){
  const path=String(hash??'').replace(/^#\/?/,'').split('/').filter(Boolean);
  const [requestedTopic,requestedChapter,requestedSection,requestedPage]=path;
  const legacy=LEGACY_ROUTES[[requestedTopic,requestedChapter,requestedSection].join('/')];
  if(legacy)return resolveRoute('#/'+legacy);
  const topic=TOPICS[requestedTopic]||TOPICS[DEFAULT_TOPIC];
  const chapterId=chaptersFor(topic).some(c=>c.id===requestedChapter)||
    (requestedChapter==='resources'&&supportsWorksheets(topic.id))?requestedChapter:'home';
  const sections=sectionsFor(topic,chapterId);
  const section=chapterId==='home'?null:
    sections.find(item=>item.id===requestedSection)||sections[0];
  const pages=section?.pages||[];
  const pageIndex=Math.max(0,pages.findIndex(p=>p.id===requestedPage));
  const pageId=pages[pageIndex]?.id||null;
  const sectionId=section?.id||null;
  // The first page keeps the compact legacy link; later pages get a deep link.
  const canonical=routeHref(topic.id,chapterId,sectionId,pageIndex===0?undefined:pageId);
  return {topicId:topic.id,chapterId,sectionId,pageId,pageIndex,canonical};
}
export function topicSwitchHref(targetTopic,currentChapter='home',currentSection=null,currentPage=null){
  const topic=TOPICS[targetTopic]||TOPICS[DEFAULT_TOPIC];
  const chapter=chaptersFor(topic).some(c=>c.id===currentChapter)||
    (currentChapter==='resources'&&supportsWorksheets(topic.id))?currentChapter:'home';
  const section=sectionsFor(topic,chapter).find(s=>s.id===currentSection)||
    sectionsFor(topic,chapter)[0];
  const pages=section?.pages||[];
  const index=pages.findIndex(p=>p.id===currentPage);
  return routeHref(topic.id,chapter,section?.id,index>0?currentPage:undefined);
}
export function escapeHTML(value){
  return String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));
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
    const cardIds=new Set();
    for(const card of topic.cards||[]){
      if(!isSlug(card.id)||cardIds.has(card.id)||!card.term||!card.definition)
        issues.push(key+': invalid/duplicate/incomplete card '+card.id);
      cardIds.add(card.id);
    }
    if(!topic.chapters||!Object.keys(topic.chapters).length)issues.push(key+': missing chapters');
    for(const [chapter,sections] of Object.entries(topic.chapters||{})){
      if(!CHAPTER_BY_ID[chapter]||!Array.isArray(sections)||sections.length===0){
        issues.push(key+': invalid or empty chapter '+chapter);
        continue;
      }
      const seenSections=new Set();
      for(const section of sections){
        if(!isSlug(section.id)||seenSections.has(section.id)||!section.label||
          typeof section.description!=='string'||section.description.trim().length<12)
          issues.push(key+': invalid section '+section.id);
        seenSections.add(section.id);
        if(!Array.isArray(section.pages)||!section.pages.length){
          issues.push(key+': subsection has no pages '+section.id);
          continue;
        }
        const seenPages=new Set();
        for(const page of section.pages){
          if(!isSlug(page.id)||seenPages.has(page.id))issues.push(key+': invalid/duplicate page '+page.id);
          seenPages.add(page.id);
          if(!MODE_PAGE_TYPES[chapter]?.has(page.type))
            issues.push(key+': wrong page type '+page.type+' in '+chapter);
          if(page.type==='lesson'&&(!Array.isArray(page.blocks)||!page.blocks.length))
            issues.push(key+': missing lesson blocks '+page.id);
          if(page.type==='questions'&&(!Array.isArray(page.problems)||!page.problems.length))
            issues.push(key+': missing problems '+page.id);
          if(page.type==='problem-solving'&&(!Array.isArray(page.tasks)||page.tasks.length<2))
            issues.push(key+': missing problem-solving tasks '+page.id);
          if(page.type==='reasoning'&&(!Array.isArray(page.tasks)||page.tasks.length<4))
            issues.push(key+': insufficient reasoning tasks '+page.id);
          for(const problem of page.problems||[]){
            if(!problem.id||!problem.prompt||!problem.solution||!Number.isInteger(problem.marks))
              issues.push(key+': incomplete problem '+page.id);
          }
          if(page.type==='game'&&(!page.gameId||!page.objective||!page.mechanic))
            issues.push(key+': incomplete game '+page.id);
        }
        if(['memorise','games','reasoning'].includes(chapter)&&section.pages.length!==1)
          issues.push(key+': activity subsection must own its internal progression '+section.id);
      }
    }
    if(topic.chapters?.understand?.length)
      issues.push(...validateUnderstandContent(topic.chapters.understand).map(message=>key+': '+message));
    if(topic.chapters?.memorise?.length)
      issues.push(...validateMemoriseContent(topic).map(message=>key+': '+message));
    if(topic.chapters?.fluency?.length&&
      JSON.stringify(topic.chapters.fluency)!==JSON.stringify(FLUENCY_CHAPTERS[key]))
      issues.push(key+': invalid Fluency level/page definitions');
    if(topic.chapters?.reasoning?.length&&
      JSON.stringify(topic.chapters.reasoning)!==JSON.stringify(REASONING_CHAPTERS[key]))
      issues.push(key+': invalid Reasoning subsection/task definitions');
    if(topic.chapters?.problemSolving?.length&&
      JSON.stringify(topic.chapters.problemSolving)!==JSON.stringify(PROBLEM_SOLVING_CHAPTERS[key]))
      issues.push(key+': invalid Problem Solving level/page/task definitions');
  }
  issues.push(...validateFluencyChapters().map(message=>'Fluency: '+message));
  issues.push(...validateReasoningContent().map(message=>'Reasoning: '+message));
  issues.push(...validateProblemSolvingChapters().map(message=>'Problem Solving: '+message));
  return issues;
}
