#!/usr/bin/env python3
"""Convert the reviewed, privately held JIS audit XLSX into public-safe data.

Run: python scripts/import_audit.py /path/to/JIS_Maths_Curriculum_Audit_REVIEWED_2026-11-04.xlsx
Requires: openpyxl (only at authoring time, not on the website).

ID policy: IDs are allocated ONCE by the reviewed sheet's row ordering. When editing
existing records, retain ids from the published registry; do not run an unreviewed
workbook after inserting/re-ordering rows. This importer refuses to overwrite an
existing catalog if id->source-statement mapping changes without --allow-id-changes.
"""
import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from openpyxl import load_workbook

BASE=Path(__file__).resolve().parents[1]
DATA=BASE/'src/skills-registry/data'
STAGES=['y7','y8','y9','igcse-foundation','igcse-higher','a-level-y1','a-level-y2']
SOURCES={
  'JIS7':{'label':'JIS Year 7 student checklist','kind':'school-checklist','visibility':'internal','detail':'Source link held in the source workbook'},
  'JIS8':{'label':'JIS Year 8 student checklist','kind':'school-checklist','visibility':'internal','detail':'Source link held in the source workbook'},
  'JIS9':{'label':'JIS Year 9 student checklist','kind':'school-checklist','visibility':'internal','detail':'Source link held in the source workbook'},
  'PEARSON-4MA1':{'label':'Pearson Edexcel International GCSE Mathematics A 4MA1','kind':'qualification-specification','visibility':'public','reference':'Pearson 4MA1 Specification A'},
  'PEARSON-8MA0':{'label':'Pearson Edexcel AS Mathematics 8MA0, Issue 3 (2025)','kind':'qualification-specification','visibility':'public','reference':'AS 8MA0 specification'},
  'PEARSON-9MA0':{'label':'Pearson Edexcel A level Mathematics 9MA0, Issue 4','kind':'qualification-specification','visibility':'public','reference':'A level 9MA0 specification'},
  'JIS-2026-27-Y12':{'label':'JIS 2026/27 ACTIVE Year 12 plan','kind':'planned-teaching','visibility':'internal','detail':'Scheduled chapters, not individual student attainment'},
  'JIS-2026-27-Y13':{'label':'JIS 2026/27 ACTIVE Year 13 plan','kind':'planned-teaching','visibility':'internal','detail':'Scheduled chapters, not individual student attainment'},
}

# These are deliberately human-readable canonical groupings taken from the reviewed
# 60-row progression matrix. Classification at the atomic level is provisional.

def slug(s):
 s=str(s).lower().replace('&',' and ').replace('/',' ').replace('+',' plus ')
 s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
 return s

def clean(s):
 return re.sub(r'\s+',' ',str(s or '')).strip()

def family_id(domain, title):
 return f'{slug(domain)}--{slug(title)}'

def cls_family(dom,topic,statement,families):
    """Conservative keyword classification; audits retain the original source topic."""
    t=clean(statement).lower()
    topic=clean(topic).lower()
    # First protect context-sensitive branches before matching generic phrases.
    # A binomial SERIES is not a binomial DISTRIBUTION, and kinematics
    # differentiation is not the same teaching family as pure calculus.
    if dom=='Number' and topic=='integers and arithmetic':return family_id('Number','Place value and operations'),'source-topic'
    if dom=='Pure':
      if 'binomial' in t:return family_id('Sequences','Binomial expansion'),'source-topic'
      if 'sequence' in topic:return family_id('Sequences','Arithmetic/geometric series, sigma'),'source-topic'
      if 'vector' in topic:return family_id('Vectors','Vector algebra and proofs'),'source-topic'
      if 'trigonometry' in topic:
        return family_id('Pure A level','Radians and compound-angle identities'),'source-topic'
    if dom=='Mechanics':
      if 'unit' in topic:return family_id('Mechanics','SI units and vector quantities'),'source-topic'
      if 'moment' in topic or 'friction' in topic:return family_id('Mechanics','Friction, moments and inclined planes'),'source-topic'
      if 'projectile' in topic or 'variable' in topic:return family_id('Mechanics','Projectiles, variable acceleration'),'source-topic'
      if 'kinematic' in topic:return family_id('Mechanics','Graphs, SUVAT and forces'),'source-topic'
      if 'force' in topic:return family_id('Mechanics','Graphs, SUVAT and forces'),'source-topic'
    if dom=='Statistics':
      if 'sampl' in topic:return family_id('Statistics','Sampling and large data set'),'source-topic'
      if 'data presentation' in topic:return family_id('Statistics','Histograms, CF, quartiles and IQR'),'source-topic'
      if 'bivariate' in topic:return family_id('Statistics','Scatter plots, correlation, regression'),'source-topic'
      if 'hypothesis' in topic:return family_id('Probability','Hypothesis testing'),'source-topic'
      if 'distribution' in topic:return family_id('Probability','Binomial and normal distributions'),'source-topic'
      if 'probability' in topic:return family_id('Probability','Tree and conditional probability') if 'conditional' in topic else family_id('Probability','Simple, Venn and sample-space probability'),'source-topic'
      if 'data' in topic:return family_id('Statistics','Averages, range, tables and bar charts'),'source-topic'
    if dom=='Probability':
      if 'distribution' in topic:return family_id('Probability','Binomial and normal distributions'),'source-topic'
      if 'hypothesis' in topic:return family_id('Probability','Hypothesis testing'),'source-topic'
    if dom=='Graphs' and 'gradient' in t:return family_id('Graphs','Gradient and equations of lines'),'keyword-source-domain'
    if dom=='Statistics' and 'frequency density' in t:return family_id('Statistics','Histograms, CF, quartiles and IQR'),'keyword-source-domain'
    # Favor specific statement text rather than broad KS3 unit headings. Order matters.
    r=[
      ('Calculus','Numerical roots and integration',r'newton.?raphson|trapezium rule|iteration|root by sign change|numerical method|converg|trapezoidal'),
      ('Calculus','Differential equations',r'differential equation|separat(?:e|ion) of variable'),
      ('Calculus','Chain, product, quotient and implicit',r'chain rule|product rule|quotient rule|implicit|parametric differentiati|connected rates of change|second derivative'),
      ('Calculus','Integration and area',r'integrat|antideriv|area under.*curve|area between.*curve|fundamental theorem'),
      ('Calculus','Tangents, normals, stationary points',r'stationary point|turning point|tangent(?: to)? (?:curve|at)|normal to|gradient function|optimis|maxim(?:a|um)|minim(?:a|um)|inflection'),
      ('Calculus','First principles and differentiating powers',r'first principle|differentiat|derivative|rate of change of (?:a curve|a function)'),
      ('Pure A level','Exponentials and logarithms',r'logarith|exponent(?:ial|ials|ial function)|e\^|natural log|ln x|ln\('),
      ('Pure A level','Radians and compound-angle identities',r'radian|small.angle|secant|cosecant|cotangent|double.angle|addition formula|compound.angle|\btrigonometr(?:ic|y) identit|exact trig'),
      ('Statistics','Sampling and large data set',r'\bsampling\b|\bsample\b.*population|stratified|systematic.*sample|large data set|census'),
      ('Statistics','Standard deviation and data critique',r'standard deviation|\bvariance\b|\bspread\b|coding.*data|outlier'),
      ('Probability','Hypothesis testing',r'hypothesi|significance level|critical region|\bp.value\b|one.tailed|two.tailed'),
      ('Probability','Binomial and normal distributions',r'binomial (?:distribution|random|probabilit)|normal distribution|poisson|geometric distribution|discrete random|probability distribution'),
      ('Probability','Tree and conditional probability',r'conditional prob|probability trees?|tree diagram|independen(?:t|ce) events|dependent.events'),
      ('Probability','Simple, Venn and sample-space probability',r'probability|probabilities|venn diagram|sample.space|expected frequenc|relative frequency|set notation|set membership|sets and membership|subset|universal set'),
      ('Statistics','Scatter plots, correlation, regression',r'scatter|correlat|regress|line of best fit|bivariate'),
      ('Statistics','Histograms, CF, quartiles and IQR',r'histogram|cumulative frequency|quartile|interquartile|box plot|stem.and.leaf'),
      ('Statistics','Averages, range, tables and bar charts',r'\bmean\b|\bmedian\b|\bmode\b|\brange\b|frequency table|two.way table|bar (?:graph|chart)|pie chart|frequency polygon|central tendency'),
      ('Mechanics','Friction, moments and inclined planes',r'\bmoment\b|\bfriction\b|rough plane|inclined plane|equilibrium|centre of mass|tilting|connected particle'),
      ('Mechanics','Projectiles, variable acceleration',r'projectile|variable.accelerat|motion under gravity|horizontal project|vertical project'),
      ('Mechanics','Graphs, SUVAT and forces',r'suvat|velocity.time|displacement.time|force|newton.s law|acceleration|displacement|distance.time|speed.time|motion graph'),
      ('Mechanics','SI units and vector quantities',r'\bmechanic|\bweight\b|\bmass\b|\bsi units\b|\bunit conversion\b'),
      ('Vectors','Vector algebra and proofs',r'\bvector|position vector|column vector|unit vector|magnitude of a vector'),
      ('Geometry','Circle theorems and sector measures',r'circle theorem|cyclic quadrilateral|alternate segment|angle at centre|intersecting chord|sector|arc length|segment area'),
      ('Geometry','Circle vocabulary, chords and tangents',r'\bchord\b|\btangent\b.*circle|circle propert|circumference|radius|diameter|circle equation'),
      ('Geometry','Sine/cosine rules, 3D trig',r'sine rule|cosine rule|3d trigonometry|angle of elevation|angle of depression|ambiguous case'),
      ('Geometry','Pythagoras and right-angle trig',r'pythagoras|sohcahtoa|sine cosine tangent|trigonometr|inverse trigonometric'),
      ('Geometry','Constructions, bearings and scale',r'construct|perpendicular bisector|compass(?:es)?|\bbearing\b|scale drawing|scale factor.*map|map scale|protractor'),
      ('Geometry','Transformations and enlargement',r'translat|reflect|rotat|enlarg|transformation'),
      ('Geometry','Congruence and similarity',r'congruen|similar(?:ity)?|scale factor.*area|scale factor.*volume'),
      ('Geometry','Properties of 2D/3D shapes and nets',r'\bnets?\b|\bsolid\b|cuboid|\bprism\b|\bpolyhedron\b|shape propert|quadrilateral|vertices|faces|edges'),
      ('Geometry','Perimeter, area, surface area, volume',r'\bvolume\b|\barea\b|perimeter|surface area|capacity|density|\bmeasures\b|\blength\b'),
      ('Geometry','Angles, triangles and polygons',r'\bangle\b|polygon|triangle|parallel line.*angle|interior.*exterior'),
      ('Sequences','Binomial expansion',r'binomial|\(1\+x\)\^|pascal'),
      ('Sequences','Arithmetic/geometric series, sigma',r'\bseries\b|\bsum to\b|sigma|sum of.*terms|infinite sum'),
      ('Sequences','Quadratic and geometric patterns',r'quadratic sequence|geometric sequence|multiplicative sequence|geometric pattern|second difference'),
      ('Sequences','Arithmetic nth term',r'sequence|nth term|term.to.term|position.to.term'),
      ('Functions','Modulus graphs and equations',r'modulus|absolute value|\|f\('),
      ('Functions','Composite and inverse functions',r'composite function|inverse function|inverse mapping'),
      ('Functions','Function notation, domain and range',r'function notation|\bf\(x\)\b|\bdomain\b|\brange\b|\bmapping\b'),
      ('Graphs','Gradient and equations of lines',r'gradient|y\s*=\s*mx|straight.line equation|parallel or perpendicular.*line|perpendicular gradient|line through'),
      ('Graphs','Quadratic, cubic, reciprocal graphs',r'graph.*quadratic|graph.*cubic|graph.*reciprocal|non.linear graph|graphs of polynomials'),
      ('Graphs','Graph transformations and modelling',r'graph transformation|translate.*graph|transform.*graph|sketch.*graph|transformations of functions'),
      ('Graphs','Real-life graphs / kinematics',r'real.life graph|distance.time|velocity.time|speed.time|conversion graph|time graph|travel graph'),
      ('Graphs','Coordinates, tables and linear graphs',r'coordinate|plot.*(point|line|graph)|graph from table|linear graph|straight.line graph|axes|midpoint|intersection.*graph'),
      ('Algebra','Algebraic fractions / partial fractions',r'partial fraction|algebraic fraction|rational expression|denominator.*algebra'),
      ('Algebra','Quadratics and discriminant',r'quadratic|discriminant|completing? the square|square a linear|x\^2\+'),
      ('Algebra','Linear and quadratic inequalities',r'inequalit|number line|solution region'),
      ('Algebra','Simultaneous equations',r'simultaneous|elimination method|substitution method.*equations'),
      ('Algebra','Common factor and polynomial expansion',r'factoris|expand|bracket|polynomial|factor theorem|remainder theorem|division of algebra'),
      ('Algebra','Linear equations and rearranging',r'equation|rearrang|change the subject|unknown|formulae|formula|identity'),
      ('Algebra','Expressions, substitution, single brackets',r'expression|substitut|like terms|simplif.*algebra'),
      ('Number','Bounds and error intervals',r'upper bound|lower bound|error interval|\bbound\b|degree of accuracy|estimate.*accuracy'),
      ('Number','Index laws and standard form',r'\bindex\b|\bindices\b|\bpower\b|standard form|scientific notation|exponent'),
      ('Number','Surds',r'\bsurd\b|rationalis.*denominator|root.*expression'),
      ('Number','Prime factors, HCF and LCM',r'prime factor|highest common factor|lowest common multiple|\bhcf\b|\blcm\b|factor pairs|divisib'),
      ('Number','Ratio and proportion',r'ratio|proportion|direct variation|inverse variation|speed.*ratio|scale.*ratio'),
      ('Number','Fractions and mixed numbers',r'fraction|reciprocal|mixed number|improper|numerator|denominator'),
      ('Number','Decimals, rounding and percentages',r'decimal|percentage|percent|round|significant figure|VAT|discount|compound interest|tax|profit|depreciat'),
      ('Number','Place value and operations',r'place value|integer|signed|negative|operation|arithmetic|square and cube number|square root|cube root|calculat|multiply|divide'),
    ]
    for dom,title,pat in r:
      fid=family_id(dom,title)
      if fid in families and re.search(pat,t):return fid,'keyword-rule'
    # Explicit topic fallbacks as an auditable coarse grouping (not an atomic guarantee).
    coarse=[
      (r'proba|distribution|hypothes',('Probability','Simple, Venn and sample-space probability')),
      (r'graph|coordinate',('Graphs','Coordinates, tables and linear graphs')),
      (r'quadratic',('Algebra','Quadratics and discriminant')),
      (r'function',('Functions','Function notation, domain and range')),
      (r'geometry|shape|angle|trigonometr',('Geometry','Angles, triangles and polygons')),
      (r'algebra|equation|expression|inequal',('Algebra','Expressions, substitution, single brackets')),
      (r'number|fraction|decimal|ratio|percentage|power|surds|accuracy|index',('Number','Place value and operations')),
      (r'series|sequence|binomial',('Sequences','Arithmetic nth term')),
      (r'statistic|data|chart|sampling|averages',('Statistics','Averages, range, tables and bar charts')),
      (r'differentiat|integrat|calculus|numerical',('Calculus','First principles and differentiating powers')),
      (r'vector',('Vectors','Vector algebra and proofs')),
      (r'mechanic|kinematic|force',('Mechanics','Graphs, SUVAT and forces')),
    ]
    for pat,(d,title) in coarse:
      if re.search(pat,topic):return family_id(d,title),'coarse-topic-review'
    fallback_domains={
      'Number':('Number','Place value and operations'),
      'Algebra':('Algebra','Expressions, substitution, single brackets'),
      'Graphs':('Graphs','Coordinates, tables and linear graphs'),
      'Functions':('Functions','Function notation, domain and range'),
      'Calculus':('Calculus','First principles and differentiating powers'),
      'Geometry':('Geometry','Angles, triangles and polygons'),
      'Statistics':('Statistics','Averages, range, tables and bar charts'),
      'Probability':('Probability','Simple, Venn and sample-space probability'),
      'Sequences':('Sequences','Arithmetic nth term'),
      'Mechanics':('Mechanics','Graphs, SUVAT and forces'),
      'Pure':('Algebra','Expressions, substitution, single brackets'),
      'Vectors':('Vectors','Vector algebra and proofs'),
    }
    if dom in fallback_domains:
      d,title=fallback_domains[dom]
      return family_id(d,title),'coarse-domain-review'
    return family_id('Number','Place value and operations'),'coarse-unknown-review'


def read_rows(wb,tab):
 sh=wb[tab]
 sh.reset_dimensions()
 rows=iter(sh.values)
 h=tuple(clean(x) for x in next(rows))
 return h,[dict(zip(h,row)) for row in rows if any(x not in ('',None) for x in row)]

def write_json(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True)
 if isinstance(obj,list):
  # One skill per line: stable diffs, small static asset, easy line-window inspection.
  data='[\n'+',\n'.join(json.dumps(item,ensure_ascii=False,separators=(',',':')) for item in obj)+'\n]\n'
 else:
  data=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
 path.write_text(data,encoding='utf-8')


def find(records,needle,kind=None):
 matches=[r for r in records if (kind is None or r['kind']==kind) and needle.casefold() in r['statement'].casefold()]
 return matches


def render_dependencies(records,assumed_rows):
 # Workbook assumptions are preserved as pedagogical ideas, not invented atomic links.
 assumptions=[]
 for i,r in enumerate(assumed_rows,1):
  assumptions.append({'id':f'knowledge-transition-{i:02d}','transition':clean(r['Transition']),
    'domain':clean(r['Domain']), 'fromDescription':clean(r['Assumed knowledge at entry']),
    'toDescription':clean(r['Next skill/extension dependent on it']),
    'reason':clean(r['Evidence / interpretation']), 'status':'proposed-unverified'})
 # Narrow, reviewed-by-description candidate edges: never infer every related item
 # in a whole topic as a prerequisite. G/A endpoints are stable source IDs.
 ks={s['id']:s for s in records}
 rules=[
   ('jis-y7-066','jis-y8-068','coordinate plotting before straight-line plotting'),
   ('jis-y7-067','jis-y8-072','table plotting before drawing from slope/intercept'),
   ('jis-y8-069','igcse-g082','rise/run before specification gradient'),
   ('jis-y8-070','igcse-g083','intercept recognition before y=mx+c reading'),
   ('igcse-g082','alevel-a025','gradient before coordinate-geometry extension'),
   ('alevel-a025','alevel-a027','two-point gradient before parallel/perpendicular slopes'),
   ('jis-y7-019','jis-y8-017','collecting terms before common factorisation'),
   ('jis-y8-015','jis-y9-018','one bracket before two brackets'),
   ('jis-y9-018','jis-y9-019','double brackets before monic factorisation'),
   ('jis-y9-019','jis-y9-020','factorising before solving quadratic equations'),
   ('jis-y9-020','igcse-g069','Y9 roots before Foundation monic equation fluency'),
   ('igcse-g069','igcse-g161','monic factorisation before general quadratic factorisation'),
   ('igcse-g161','igcse-g162','factoring methods before quadratic formula application'),
   ('igcse-g162','alevel-a010','quadratic roots before discriminant reasoning'),
   ('igcse-g162','alevel-a009','quadratic root methods before parameter conditions'),
   ('jis-y7-078','jis-y8-040','probability language before relative frequency'),
   ('jis-y7-081','igcse-g131','elementary outcome models before probability scale'),
   ('igcse-g131','igcse-g219','one-event probability before trees'),
   ('igcse-g219','alevel-a090','tree diagrams before dependent probability'),
   ('alevel-a090','alevel-a190','dependent trees before formal conditional probability'),
   ('jis-y7-011','jis-y8-003','HCF/LCM listing before prime factor methods'),
   ('jis-y7-015','jis-y8-007','index notation before index laws'),
   ('jis-y8-007','jis-y9-001','basic laws before standard-form operations'),
   ('jis-y7-029','jis-y8-048','FDP equivalence before percentage changes'),
   ('jis-y8-049','jis-y8-052','multipliers before reverse percentages'),
   ('igcse-g031','igcse-g146','basic percentage change before repeated percentage change'),
   ('igcse-g143','alevel-a004','fractional indices before A level rational indices'),
 ]
 deps=[]
 for a,b,why in rules:
  if a not in ks or b not in ks:
   print('WARNING: invalid candidate edge',a,b,why,file=sys.stderr)
   continue
  deps.append({'from':a,'to':b,'relationship':'prerequisite','confidence':'proposed-teacher-review',
    'reason':why})
 return {'schemaVersion':1,'edges':deps,'assumedKnowledgeTransitions':assumptions,
  'policy':'Only proposed edges are present. Missing edges do not imply independence; validate before enabling automatic remediation.'}


def main():
 parser=argparse.ArgumentParser()
 parser.add_argument('workbook',type=Path)
 parser.add_argument('--allow-id-changes',action='store_true')
 args=parser.parse_args()
 wb=load_workbook(args.workbook,read_only=True,data_only=True)
 _,progression=read_rows(wb,'Progression matrix')
 families={}
 for r in progression:
  d=clean(r['Domain']);title=clean(r['Topic / skill family']);fid=family_id(d,title)
  families[fid]={ 'id':fid,'domain':d,'title':title,'progression':{
     'y7':clean(r['Year 7']),'y8':clean(r['Year 8']),'y9':clean(r['Year 9']),
     'igcse-foundation':clean(r['4MA1 F']),'igcse-higher':clean(r['4MA1 H']),
     'a-level-y1':clean(r['AS 8MA0 specification']),
     'a-level-y2':clean(r['Full 9MA0 additional specification'])},
     'curriculumNote':clean(r['Curriculum/progression interpretation'])}
 # Validate no duplicate family slugs
 assert len(families)==len(progression),len(families)
 skills=[]
 _,ks3=read_rows(wb,'JIS Y7-9 checklist')
 counter=Counter()
 for source in ks3:
  year=clean(source['Source stage'])
  assert year in ('Year 7','Year 8','Year 9'),year
  stage='y'+year[-1];counter[stage]+=1
  sid=f'jis-{stage}-{counter[stage]:03d}'
  unit=clean(source['JIS unit number']);topic=clean(source['JIS unit heading'])
  statement=clean(source['Subskills from JIS checklist (paraphrase)'])
  fid,why=cls_family('KS3',topic,statement,families)
  skills.append({'id':sid,'kind':'jis-checklist','statement':statement,'domain':families[fid]['domain'] if fid else 'Unmapped',
    'topic':topic,'familyId':fid,'familyMapping':why,
    'scope':{'targetStages':[stage],'qualificationCodes':[],'tier':'not-applicable',
      'plannedStages':[stage],'setEligibility':'unverified','completion':'not-recorded'},
    'evidence':{'sourceId':'JIS'+year[-1],'locator':f'{unit} / checklist item {counter[stage]}',
      'status':'documented-checklist-target'},
    'assumedKnowledgeText':[], 'generator':{'status':'not-mapped','questionFamilies':[]},
    'review':{'required':True,'reason':'Granularity and set eligibility need a curriculum-owner review' if len(statement)<26 else 'Local set eligibility and generator mapping unverified'}})
 _,igcse=read_rows(wb,'IGCSE subskills')
 for source in igcse:
  orig=clean(source['Skill ID']);assert re.fullmatch(r'G\d{3}',orig),orig
  sid=f'igcse-{orig.lower()}'
  tier=clean(source['Scope']);assert tier in ('F','H+'),tier
  topic=clean(source['Topic']);statement=clean(source['Atomic subskill (paraphrase)'])
  fid,why=cls_family(clean(source['Domain']),topic,statement,families)
  skills.append({'id':sid,'kind':'exam-specification','statement':statement,
    'domain':clean(source['Domain']),'topic':topic,'familyId':fid,'familyMapping':why,
    'scope':{'targetStages':['igcse-foundation','igcse-higher'] if tier=='F' else ['igcse-higher'],
      'qualificationCodes':['4MA1'],'tier':'Foundation-and-Higher' if tier=='F' else 'Higher-only',
      'plannedStages':[],'setEligibility':'unverified','completion':'not-recorded'},
    'evidence':{'sourceId':'PEARSON-4MA1','locator':f'4MA1 {clean(source["Specification ref"])} / {orig}',
       'status':'documented-qualification-requirement'},
    'assumedKnowledgeText':[clean(source['Assumed foundations'])] if clean(source['Assumed foundations']) else [],
    'generator':{'status':'not-mapped','questionFamilies':[]},
    'review':{'required':True,'reason':'JIS Year 10/11 placement, set eligibility and generator mapping unverified'}})
 _,alevel=read_rows(wb,'A level subskills')
 for source in alevel:
  orig=clean(source['Skill ID']);assert re.fullmatch(r'A\d{3}',orig),orig
  sid=f'alevel-{orig.lower()}'
  qualification=clean(source['Qualification scope (not a JIS year)']);is_as=qualification.startswith('AS 8MA0')
  stage=clean(source['JIS 2026/27 planned teaching'])
  if stage=='Y12':planned=['a-level-y1']
  elif stage=='Y13':planned=['a-level-y2']
  elif stage=='Y12 + Y13 revisit':planned=['a-level-y1','a-level-y2']
  elif stage.startswith('Y13'):planned=['a-level-y2']
  else:planned=[]
  topic=clean(source['Topic']);statement=clean(source['Atomic subskill (paraphrase)'])
  fid,why=cls_family(clean(source['Area']),topic,statement,families)
  skills.append({'id':sid,'kind':'exam-specification','statement':statement,
    'domain':clean(source['Area']),'topic':topic,'familyId':fid,'familyMapping':why,
    'scope':{'targetStages':['a-level-y1','a-level-y2'] if is_as else ['a-level-y2'],
      'qualificationCodes':['8MA0','9MA0'] if is_as else ['9MA0'],
      'tier':'AS-core' if is_as else 'A-level-additional',
      'plannedStages':planned,'setEligibility':'unverified','completion':'not-recorded'},
    'evidence':{'sourceId':'PEARSON-8MA0' if is_as else 'PEARSON-9MA0',
      'locator':f'{clean(source["Specification ref"])} / {orig}',
      'status':'documented-qualification-requirement',
      'localPlanSourceId':'JIS-2026-27-Y12' if 'a-level-y1' in planned else ('JIS-2026-27-Y13' if planned else None),
      'localPlanStatus':'scheduled-topic-in-plan' if planned else 'unverified'},
    'assumedKnowledgeText':[clean(source['Assumed foundations'])] if clean(source['Assumed foundations']) else [],
    'generator':{'status':'not-mapped','questionFamilies':[]},
    'review':{'required':True,'reason':clean(source['Delivery confidence / review note']) or 'Chapter-level timing, not individual teaching record'}})

 # Audit prior ID mapping so regenerating after insertion cannot silently reassign skills.
 if not args.allow_id_changes:
  old={}
  for part in ('ks3','igcse','alevel'):
   f=DATA/f'{part}.json'
   if f.exists():
    for x in json.loads(f.read_text()):old[x['id']]=(x['statement'],x['topic'])
  for s in skills:
   if s['id'] in old and old[s['id']] != (s['statement'],s['topic']):
    raise SystemExit('ID reassignment detected: '+s['id']+'; use a stable-id migration rather than overwriting')

 allids=[r['id'] for r in skills]
 assert len(allids)==len(set(allids)), 'Nonunique skills'
 assert len(skills)==652,len(skills)
 for s in skills:
  assert s['statement'] and s['familyId'] in families,(s['id'],s['statement'],s['familyId'],s['topic'])

 _,assumed=read_rows(wb,'Assumed knowledge')
 dependencies=render_dependencies(skills,assumed)
 source_manifest={'schemaVersion':1,'registryVersion':'1.0.0','reviewDate':'2026-11-04',
   'sourceAudit':'JIS_Maths_Curriculum_Audit_REVIEWED_2026-11-04.xlsx',
   'policy':{'stageMeaning':'Target stages are specification scope / checklist stage, not mastery.',
    'asScope':'AS 8MA0 is a qualification scope, not an exclusive JIS Year 12 teaching boundary.',
    'higherInheritance':'4MA1 Higher includes all 4MA1 Foundation requirements.',
    'teachingStatus':'JIS local schedule is planned only; completion is not asserted.',
    'privacy':'Private Google Drive source URLs and internal school files are excluded from public website assets.',
    'generation':'No skill is treated as auto-generator-ready until teacher quality validation.'},
   'sources':SOURCES,'stages':[{'id':x,'label':dict(zip(STAGES,['Year 7','Year 8','Year 9','IGCSE Foundation','IGCSE Higher','A level Year 1','A level Year 2']))[x]} for x in STAGES],
   'dataFiles':['ks3.json','igcse.json','alevel.json','families.json','dependencies.json']}
 DATA.mkdir(parents=True,exist_ok=True)
 for key,part in [('ks3','jis-checklist'),('igcse','igcse'),('alevel','alevel')]:
  if key=='ks3':items=[s for s in skills if s['kind']=='jis-checklist']
  elif key=='igcse':items=[s for s in skills if s['id'].startswith('igcse-')]
  else:items=[s for s in skills if s['id'].startswith('alevel-')]
  write_json(DATA/f'{key}.json',items)
 write_json(DATA/'families.json',list(families.values()))
 write_json(DATA/'dependencies.json',dependencies)
 write_json(DATA/'manifest.json',source_manifest)
 summary={
   'schemaVersion':1,'skillCount':len(skills),'familyCount':len(families),
   'countsByKind':dict(Counter(s['kind'] for s in skills)),
   'countsByStage':{p:sum(p in s['scope']['targetStages'] for s in skills) for p in STAGES},
   'countsPlannedY12':sum('a-level-y1' in s['scope']['plannedStages'] for s in skills if s['id'].startswith('alevel-')),
   'countsByExamTier':dict(Counter(s['scope']['tier'] for s in skills)),
   'familyMappings':dict(Counter(s['familyMapping'] for s in skills)),
   'prerequisiteEdgesProposed':len(dependencies['edges']),
   'assumedKnowledgeTransitions':len(dependencies['assumedKnowledgeTransitions']),
 }
 write_json(DATA/'summary.json',summary)
 print(json.dumps(summary,indent=2))

if __name__=='__main__':main()