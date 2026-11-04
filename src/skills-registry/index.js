/**
 * JIS mathematics skills registry, v1. No student UI is automatically changed.
 * Data is auditable curriculum metadata; it is not proof of student mastery.
 */
export const STAGE_IDS = Object.freeze([
  'y7', 'y8', 'y9', 'igcse-foundation', 'igcse-higher',
  'a-level-y1', 'a-level-y2'
]);
export const REGISTRY_SCHEMA_VERSION = 1;
const ID = /^(?:jis-y[789]-\d{3}|igcse-g\d{3}|alevel-a\d{3})$/;
const FAMILY_ID = /^[a-z][a-z0-9-]*--[a-z0-9-]+$/;
const stageSet = new Set(STAGE_IDS);
const unique = items => new Set(items).size === items.length;

/** Compose the five data files and the manifest without mutation. */
export function createRegistry({ks3, igcse, alevel, families, dependencies, manifest}) {
  return {schemaVersion: REGISTRY_SCHEMA_VERSION,
    manifest, skills: [...ks3, ...igcse, ...alevel], families,
    dependencies};
}

/** Safe for any browser: fetches data only when explicitly called by a consumer. */
export async function loadSkillsRegistry(baseUrl = new URL('./data/', import.meta.url), fetcher = fetch) {
  const keys = ['ks3','igcse','alevel','families','dependencies','manifest'];
  const records = await Promise.all(keys.map(async key => {
    const response = await fetcher(new URL(key+'.json', baseUrl));
    if (!response.ok) throw new Error('Skills registry: '+key+' load failed ('+response.status+')');
    return response.json();
  }));
  const registry = createRegistry(Object.fromEntries(keys.map((key, i) => [key, records[i]])));
  const errors = validateRegistry(registry);
  if (errors.length) throw new Error('Invalid skills registry: '+errors.slice(0, 5).join('; '));
  return registry;
}

/** Validate referential integrity, qualification inheritance, privacy, and DAG. */
export function validateRegistry(registry) {
  const errors = [];
  if (!registry || registry.schemaVersion !== REGISTRY_SCHEMA_VERSION) return ['Invalid schemaVersion'];
  const {manifest, skills, families, dependencies} = registry;
  if (!manifest || manifest.schemaVersion !== 1 || !manifest.sources || !Array.isArray(manifest.stages))
    errors.push('Missing/invalid registry manifest');
  if (!Array.isArray(skills) || !Array.isArray(families))
    return [...errors,'Skills and families must be arrays'];
  if (!dependencies || !Array.isArray(dependencies.edges) ||
      !Array.isArray(dependencies.assumedKnowledgeTransitions))
    return [...errors,'Invalid dependency bundle'];
  const skillIds = skills.map(s => s?.id);
  if (!unique(skillIds)) errors.push('Duplicate skill ids');
  const familyIds = families.map(f => f?.id);
  if (!unique(familyIds)) errors.push('Duplicate family ids');
  const skillsById = new Map(skills.map(s => [s.id, s]));
  const sourceIds = new Set(Object.keys(manifest?.sources || {}));
  const knownFamilies = new Set(familyIds);
  for (const f of families) {
    if (!FAMILY_ID.test(f?.id || '')) errors.push('Invalid family id: '+f?.id);
    if (!f.title || !f.domain) errors.push('Missing family title/domain: '+f.id);
  }
  for (const s of skills) {
    if (!ID.test(s?.id || '')) errors.push('Invalid skill id: '+s?.id);
    if (!s.statement?.trim() || !s.topic?.trim()) errors.push('Missing statement/topic: '+s.id);
    if (!knownFamilies.has(s.familyId)) errors.push('Unknown family for '+s.id);
    const scope = s.scope;
    if (!scope || !Array.isArray(scope.targetStages) || !scope.targetStages.length ||
        !scope.targetStages.every(x => stageSet.has(x)) || !unique(scope.targetStages))
      errors.push('Invalid targetStages: '+s.id);
    if (!Array.isArray(scope?.plannedStages) || !scope.plannedStages.every(x => stageSet.has(x)))
      errors.push('Invalid plannedStages: '+s.id);
    if (!Array.isArray(scope?.qualificationCodes)) errors.push('Invalid qualifications: '+s.id);
    if (s.id.startsWith('igcse-')) {
      if (!scope?.qualificationCodes?.includes('4MA1')) errors.push('IGCSE must cite 4MA1: '+s.id);
      if (scope?.targetStages?.includes('igcse-foundation') &&
          !scope.targetStages.includes('igcse-higher')) errors.push('Higher must inherit Foundation: '+s.id);
    }
    if (s.id.startsWith('alevel-')) {
      if (!scope?.qualificationCodes?.includes('9MA0')) errors.push('A level must cite 9MA0: '+s.id);
      if (scope?.qualificationCodes?.includes('8MA0') &&
          !scope.targetStages.includes('a-level-y1')) errors.push('AS scope missing Y1: '+s.id);
      if (scope?.qualificationCodes?.includes('8MA0') &&
          !scope.targetStages.includes('a-level-y2')) errors.push('AS must be cumulative in Y2: '+s.id);
    }
    if (!sourceIds.has(s.evidence?.sourceId)) errors.push('Unknown evidence source: '+s.id);
    if (s.evidence?.localPlanSourceId && !sourceIds.has(s.evidence.localPlanSourceId))
      errors.push('Unknown plan source: '+s.id);
    if (!Array.isArray(s.assumedKnowledgeText) ||
        !s.generator || !Array.isArray(s.generator.questionFamilies)) errors.push('Invalid generator/prior text: '+s.id);
    if (s.generator?.status === 'approved' && s.generator.questionFamilies.length === 0)
      errors.push('Approved generator needs real families: '+s.id);
    if (/https?:\/\/|drive\.google\.com|docs\.google\.com/i.test(JSON.stringify(s)))
      errors.push('Unexpected source URL in public record: '+s.id);
  }
  const graph = new Map();
  const edgePairs = new Set();
  for (const edge of dependencies.edges) {
    if (!skillsById.has(edge?.from) || !skillsById.has(edge?.to))
      errors.push('Dangling dependency: '+edge?.from+' => '+edge?.to);
    if (edge?.from === edge?.to) errors.push('Self dependency: '+edge.from);
    if (edge?.relationship !== 'prerequisite') errors.push('Invalid relationship: '+edge?.from);
    if (!['proposed-teacher-review','teacher-verified'].includes(edge?.confidence))
      errors.push('Invalid confidence: '+edge?.from);
    const pair = edge.from+'|'+edge.to;
    if (edgePairs.has(pair)) errors.push('Duplicate dependency: '+pair);
    edgePairs.add(pair);
    if (!graph.has(edge.from)) graph.set(edge.from, []);
    graph.get(edge.from).push(edge.to);
  }
  const active = new Set(), visited = new Set();
  function walk(id) {
    if (active.has(id)) {errors.push('Cyclic dependency at '+id); return;}
    if (visited.has(id)) return;
    active.add(id);
    for (const child of graph.get(id) || []) walk(child);
    active.delete(id); visited.add(id);
  }
  for (const id of skillsById.keys()) walk(id);
  if (/docs\.google\.com|drive\.google\.com/.test(JSON.stringify(manifest)))
    errors.push('Internal document URL in public manifest');
  return errors;
}

export function getSkill(registry, skillId) {
  return registry.skills.find(skill => skill.id === skillId) || null;
}

/** Distinguish explicit qualification coverage from JIS planned teaching. */
export function skillsForStage(registry, stage, {view='qualification'}={}) {
  if (!stageSet.has(stage)) throw new RangeError('Unknown stage: '+String(stage));
  if (!['qualification','planned'].includes(view)) throw new RangeError('Unknown stage view');
  const key = view === 'planned' ? 'plannedStages' : 'targetStages';
  return registry.skills.filter(skill => skill.scope[key].includes(stage));
}

export function searchSkills(registry,{text='',stage=null,view='qualification',familyId=null,limit=100}={}) {
  const candidates = stage ? skillsForStage(registry,stage,{view}) : registry.skills;
  const query = text.toLocaleLowerCase().trim();
  return candidates.filter(skill =>
    (!familyId || skill.familyId === familyId) &&
    (!query || (skill.statement+' '+skill.topic).toLocaleLowerCase().includes(query))
  ).slice(0,Math.max(0,limit));
}

/** A family is a conceptual grouping, not a teacher-verified prerequisite sequence. */
export function familyProgression(registry,familyId) {
  const family = registry.families.find(x => x.id === familyId);
  if (!family) return null;
  return {family,byStage:Object.fromEntries(STAGE_IDS.map(stage=>
    [stage,registry.skills.filter(s=>s.familyId===familyId && s.scope.targetStages.includes(stage))]))};
}

/** Proposed links are ignored by default for student-facing remediation. */
export function prerequisitesOf(registry,skillId,{includeProposed=false,recursive=false}={}) {
  if (!getSkill(registry,skillId)) return [];
  const permitted = edge => includeProposed || edge.confidence === 'teacher-verified';
  const links = registry.dependencies.edges.filter(permitted);
  const seen = new Set();
  const result = [];
  function visit(id) {
    for (const e of links.filter(x => x.to === id)) {
      if (seen.has(e.from)) continue;
      seen.add(e.from);
      if (recursive) visit(e.from);
      result.push(getSkill(registry,e.from));
    }
  }
  visit(skillId);
  return result;
}