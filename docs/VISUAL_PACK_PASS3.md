# Pass 3 — Reusable mathematical visualisations

The shared website no longer hardcodes quadratic graph page names or a sampling population of 40. Each topic provides a visual pack of serialisable data, and the shared engines render graphs, diagrams and interactive experiments.

## How to create visuals for a new topic

Create src/topic-packs/<topic-id>/visuals.js exporting visuals, then register it with VISUAL_LIBRARIES in src/topic-packs/registry.js. Each visual pack has schemaVersion:1, a diagrams map and an explorers map.

Example topic visual pack:

    export const visuals={
      schemaVersion:1,
      diagrams:{
        'line-plot':{type:'coordinate-plot',model:{kind:'linear',m:2,b:1},
          view:{xMin:-4,xMax:4,yMin:-5,yMax:7}}
      },
      explorers:{
        'gradient-lab':{
          type:'function-graph',
          initial:{kind:'linear',m:1,b:0},
          controls:[
            {key:'m',label:'Gradient m',min:-4,max:4,step:1},
            {key:'b',label:'Intercept b',min:-5,max:5,step:1}
          ],
          reference:{kind:'linear',m:0,b:0},referenceLabel:'y = 0'
        }
      }
    };

In the Understand authoring file:

    diagram('line-plot','The line has gradient 2 and intercept 1.')
    visual('gradient-lab','Change gradient and intercept. What happens?')

New pages use generic type visual; older graph and sampling-lab types are retained so links and contents continue to work.

## Built-in visual types

- Coordinate plot: linear y=mx+b, quadratic y=a(x-h)^2+k, visible axes, common scale, labelled turning point/intercept and optional reference curve.
- Dot grid: configurable dot count, columns and highlighted indices.
- Number line: integer ticks, marked intervals with open/closed endpoints and labelled points.
- Probability tree: labelled branches, probabilities, and validation that full outgoing probability sets sum to one.
- Interactive sampling explorer: two to four groups, configurable group sizes, method labels and sample size, supporting census, random, systematic, stratified and convenience selection.

Three-group sampling configuration:

    'team-sampling':{
      type:'sampling-selection',
      groups:[
        {label:'Team A',short:'A',size:20},
        {label:'Team B',short:'B',size:30},
        {label:'Team C',short:'C',size:50}
      ],
      sampleSize:10,
      methods:{
        random:{label:'Simple random',description:'Choose ten without replacement.'},
        stratified:{label:'Stratified',description:'Choose in proportion to group sizes.'}
      }
    }

## Integrity and safety

Data-defined graph models are evaluated by reviewed mathematical functions, never arbitrary user-supplied code or remote scripts. Validation catches missing visual references, invalid model types and ranges, unsafe slider parameters, duplicate dot selections, incorrect group sizes and impossible systematic samples.

Selections are seeded and without replacement. Stratified allocations use the largest-remainder method when exact whole-number proportional allocations are impossible; systematic selection requires an integer interval. Results never claim that one random sample is necessarily representative.

The graph SVG and textual feature summary use the same parameters. Figures expose text alternatives and controls use native, labelled HTML inputs and buttons.

## Existing examples and architecture

Sampling-dots is now a 40-dot data definition. Census-sample and proportion use the same configured population with different method choices. Quadratic-static is a generated plot; shape and position have separate controls but the same graph renderer.

The common maths models, SVG plot, sampling algorithm, diagram renderers, interactive UI, validation and registry are all under src/visuals/. Legacy numerical APIs are re-exported from src/understand-engine.js. Existing page URLs, notebook scope and progress storage remain stable.

Next: Pass 4 (New Topic Creator, richer authoring/content checks, fast preview and publishing); Pass 5 (build a completely new topic with no shared-engine changes).
