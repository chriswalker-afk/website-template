import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {STAGE_IDS,createRegistry,validateRegistry,skillsForStage,
  getSkill,searchSkills,familyProgression,prerequisitesOf} from '../src/skills-registry/index.js';
const base = new URL('../src/skills-registry/data/',import.meta.url);
const get=name=>JSON.parse(readFileSync(fileURLToPath(new URL(name+'.json',base)),'utf8'));
const registry=createRegistry(Object.fromEntries(
  ['ks3','igcse','alevel','families','dependencies','manifest'].map(key=>[key,get(key)])));

test('all 652 source skills have stable unique IDs and valid references',()=>{
  assert.equal(registry.skills.length,652);
  assert.equal(registry.families.length,60);
  assert.deepEqual(validateRegistry(registry),[]);
  assert.equal(new Set(registry.skills.map(s=>s.id)).size,652);
});

test('JIS checklist stages and exam specification inheritances are distinct',()=>{
  assert.equal(skillsForStage(registry,'y7').length,83);
  assert.equal(skillsForStage(registry,'y8').length,72);
  assert.equal(skillsForStage(registry,'y9').length,59);
  assert.equal(skillsForStage(registry,'igcse-foundation').length,138);
  assert.equal(skillsForStage(registry,'igcse-higher').length,222);
  assert.equal(skillsForStage(registry,'a-level-y1').length,117);
  assert.equal(skillsForStage(registry,'a-level-y2').length,216);
});

test('scheduled Y12 full A level additions are not incorrectly AS-labelled',()=>{
  const y12 = skillsForStage(registry,'a-level-y1',{view:'planned'});
  assert.equal(y12.filter(s=>s.id.startsWith('alevel-')).length,141);
  assert.ok(y12.some(s=>s.scope.tier==='A-level-additional'));
  const additional=y12.find(s=>s.scope.tier==='A-level-additional');
  assert.ok(!additional.scope.qualificationCodes.includes('8MA0'));
});

test('the registry can find skills, families and proposed dependencies',()=>{
  const gradient=getSkill(registry,'igcse-g082');
  assert.ok(gradient.statement.toLowerCase().includes('gradient'));
  const results=searchSkills(registry,{text:'factoris',stage:'igcse-higher'});
  assert.ok(results.some(s=>s.id==='igcse-g069'));
  const progression=familyProgression(registry,gradient.familyId);
  assert.ok(progression.byStage['igcse-higher'].some(s=>s.id===gradient.id));
  assert.equal(prerequisitesOf(registry,'igcse-g082').length,0);
  assert.ok(prerequisitesOf(registry,'igcse-g082',{includeProposed:true}).length>=1);
  assert.deepEqual(prerequisitesOf(registry,'not-a-skill'),[]);
});

test('a dangling dependency, cycle, and unsupported approved generator fail validation',()=>{
  const broken=structuredClone(registry);
  broken.dependencies.edges.push({from:'igcse-g082',to:'missing-id',confidence:'teacher-verified',relationship:'prerequisite'});
  assert.ok(validateRegistry(broken).some(x=>x.includes('Dangling dependency')));
  const cycle=structuredClone(registry);
  cycle.dependencies.edges.push({from:'igcse-g082',to:'jis-y8-069',confidence:'teacher-verified',relationship:'prerequisite'});
  assert.ok(validateRegistry(cycle).some(x=>x.includes('Cyclic dependency')));
  const fakeReady=structuredClone(registry);
  fakeReady.skills[0].generator.status='approved';
  assert.ok(validateRegistry(fakeReady).some(x=>x.includes('Approved generator needs real families')));
});

test('stages listed in manifest match API stage list',()=>{
  assert.deepEqual(registry.manifest.stages.map(s=>s.id),STAGE_IDS);
});