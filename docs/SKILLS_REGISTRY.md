# JIS Mathematics skills registry — v1

A **read-only curriculum catalogue**, converted from the reviewed 4 November 2026 JIS Mathematics Skills Audit. This is **data infrastructure**, not a released student-facing learning-path algorithm.

## Coverage

- 214 KS3 checklist targets: 83 Year 7, 72 Year 8, 59 Year 9.
- 222 IGCSE 4MA1 statements: 138 Foundation-and-Higher, 84 additional Higher-only.
- 216 A level statements: 117 AS 8MA0 requirements (also within 9MA0), 99 full-9MA0 additions.
- 60 broad topic families from the audit's progression matrix.
- 27 **proposed** skill-to-skill prerequisite edges and 30 descriptive assumed-knowledge transitions.

**Why A level has two different stage fields:** A 9MA0-only skill may already be *scheduled at JIS in Year 12*. `scope.targetStages` represents **qualification scope** (what AS or the full A level formally requires). `scope.plannedStages` represents the **JIS 2026/27 planned teaching year**, not proof that teaching has happened. Use the correct `view` in queries. Year 13 remains cumulative: all 8MA0-core requirements are included in full 9MA0.

## Data layout

| File | Purpose |
| --- | --- |
| `src/skills-registry/data/ks3.json` | Paraphrased Y7–Y9 checklist statements |
| `src/skills-registry/data/igcse.json` | Specification-linked Foundation and Higher requirements |
| `src/skills-registry/data/alevel.json` | Specification-linked AS and full-A-level requirements, plus local plans |
| `src/skills-registry/data/families.json` | Cross-stage topic families and original matrix signals |
| `src/skills-registry/data/dependencies.json` | Candidate prerequisite edges and descriptive transitions |
| `src/skills-registry/data/manifest.json` | Stage identifiers, provenance codes and public-data policy |
| `src/skills-registry/data/summary.json` | Generated record counts for auditing |
| `src/skills-registry/index.js` | Read-only browser/Node API and validator |
| `scripts/validate-skills-registry.mjs` | Structural integrity checks |
| `scripts/import_audit.py` | Authoring-only import from the private reviewed `.xlsx` |

All data is normal JSON. IDs are explicit and must not change when writing new wording or adding new skills. In particular, the importer **refuses to silently reassign existing KS3 row-order IDs**. For new curriculum items allocate fresh IDs; migrate old IDs deliberately, including dependencies.

## Skill contract (excerpt)

```json
{
  "id": "igcse-g082",
  "kind": "exam-specification",
  "statement": "Calculate gradient as change in y divided by change in x",
  "domain": "Graphs",
  "topic": "Coordinates and graphs",
  "familyId": "graphs--gradient-and-equations-of-lines",
  "familyMapping": "keyword-rule",
  "scope": {
    "targetStages": ["igcse-foundation", "igcse-higher"],
    "qualificationCodes": ["4MA1"],
    "tier": "Foundation-and-Higher",
    "plannedStages": [],
    "setEligibility": "unverified",
    "completion": "not-recorded"
  },
  "evidence": {
    "sourceId": "PEARSON-4MA1",
    "locator": "4MA1 3.3 / G082",
    "status": "documented-qualification-requirement"
  },
  "assumedKnowledgeText": ["Coordinates and tables"],
  "generator": {"status": "not-mapped", "questionFamilies": []},
  "review": {"required": true, "reason": "JIS Year 10/11 placement ... unverified"}
}
```

The `statement` field contains a **paraphrase** of an audited skill, not a verbatim copyrighted Pearson specification extract. `sourceId` resolves to a source label in `manifest.json`. Private JIS Google Drive links stay in the source workbook rather than the public repository.

## API examples

```js
import {loadSkillsRegistry, skillsForStage, searchSkills,
  familyProgression, prerequisitesOf, getSkill} from './src/skills-registry/index.js';
const registry = await loadSkillsRegistry();

const higherContent = skillsForStage(registry,'igcse-higher'); // Foundation + Higher
const year12AS = skillsForStage(registry,'a-level-y1'); // AS requirement only
const year12JIS = skillsForStage(registry,'a-level-y1',{view:'planned'});
const exactGradient = getSkill(registry,'igcse-g082');
const family = familyProgression(registry,exactGradient.familyId);
const matches = searchSkills(registry,{stage:'y9',text:'quadratic'});

// For a teacher planning review only:
const proposed = prerequisitesOf(registry,'igcse-g082',{includeProposed:true});
// Student-facing calls exclude proposed relationships:
const verifiedOnly = prerequisitesOf(registry,'igcse-g082');
```

The loader uses `fetch` and URLs relative to its module. It requires serving the project over HTTP(S) (the existing preview server works). Importing the API **does not load the data automatically** and does not alter existing topic menus, student settings or question generators.

## Evidence policy and known limitations

1. **Year 7–9:** checklist statements are evidence of curriculum targets, not confirmation of first-teaching dates or mastery. Some items are abbreviations (e.g. `Mean`) and need fuller learner-friendly wording before direct display.
2. **IGCSE:** the Higher tier inherits Foundation coverage. Current Year 10/11 class-by-class scheduling is not confirmed, so both planned-stage lists are blank. This is intentional.
3. **A level:** 8MA0 vs 9MA0 specification scope is distinct from the 2026/27 local teaching plan. Plans are chapter-level, not individual lesson or assessment evidence. `review.required=true` remains until curriculum sign-off.
4. **Topic-family mapping:** `keyword-rule`, `source-topic`, `coarse-topic-review`, `coarse-domain-review` show how the family was assigned. These are editorial grouping suggestions, not verified mathematical equivalences; review borderline groups.
5. **Prerequisites:** all 27 atomic links are flagged `proposed-teacher-review`. The separate 30 transitions retain the audit's broader prose; the absence of an edge means **unknown**, not independent.
6. **Question generation:** all records start `generator.status='not-mapped'` and `questionFamilies=[]`. No generic automatic marking or LaTeX generation is implied. Existing topic-specific generators in `src/topic-packs` continue to work unchanged.
7. **Privacy:** no student identifiers, grades, private URLs or staff-authenticated file links are shipped. Audit source links remain in the private workbook.

## Regenerate, validate, and extend

```bash
python -m pip install openpyxl
python scripts/import_audit.py /path/to/JIS_Maths_Curriculum_Audit_REVIEWED_2026-11-04.xlsx
node scripts/validate-skills-registry.mjs
node --test tests/skills-registry.test.js
npm run check
```

For a skill to become a student-facing generator target:

1. KS3 lead or exam lead approves the exact atomic statement, tier/set eligibility and source interpretation.
2. Approve prerequisite links, keeping the graph acyclic. The validator detects loops and missing IDs.
3. Map the skill explicitly to named, reviewed question families in the relevant topic pack. Confirm valid parameter ranges, worked solutions, mark totals, answer equivalence, domain restrictions, proper mathematical notation and age-appropriate feedback using existing workshop/QA tests.
4. Only then change the generator status to `approved` with non-empty `questionFamilies`; wire a separate UI/selector integration after independently testing it. Do **not** equate a documented curriculum target with generator readiness.

## Recommended next implementation pass

- Sign off Year 10/11 Foundation/Higher sequencing and KS3 All/Core/Extended distinctions.
- Validate the candidate prerequisite network, especially gradient, quadratics and probability.
- Map a **small curated sample** of skills to existing `gradient` and `quadratics` question families, with a teacher QA gate. Do not automatically enable all 652 skills in the student interface.