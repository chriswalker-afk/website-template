import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRegistry,validateRegistry} from '../src/skills-registry/index.js';
const base = new URL('../src/skills-registry/data/',import.meta.url);
const get = name => JSON.parse(readFileSync(fileURLToPath(new URL(name+'.json',base)),'utf8'));
const bundle = createRegistry(Object.fromEntries(
  ['ks3','igcse','alevel','families','dependencies','manifest'].map(key=>[key,get(key)])));
const errors = validateRegistry(bundle);
if (errors.length) {
  console.error('Skills registry validation failed:');
  for (const problem of errors) console.error(' - '+problem);
  process.exitCode = 1;
} else {
  console.log('Skills registry valid:',bundle.skills.length,'skills,',bundle.families.length,
    'families,',bundle.dependencies.edges.length,'proposed prerequisite edges.');
}