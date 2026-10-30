// Reusable Understand authoring helpers (topic-independent).
export const section=(id,label,description,pages)=>({id,label,description,pages});
export const lesson=(id,...blocks)=>({id,type:'lesson',blocks});
export const text=value=>({kind:'text',text:value});
export const diagram=(variant,caption)=>({kind:'diagram',variant,caption});
export const note=value=>({kind:'note',text:value});
export const comparison=(...pairs)=>({kind:'comparison',items:pairs.map(([label,description])=>({label,description}))});
export const check=(id,prompt,choices)=>({kind:'concept-check',id,prompt,choices:choices.map(([id,label,feedback,correct=false])=>({id,label,feedback,correct}))});
export const method=(id,prompt,steps)=>({kind:'stepper',id,prompt,steps});
export const workshop=(id,model,guided,independent)=>({id,type:'workshop',model,guided,independent});
export const graph=(id,focus)=>({id,type:'graph',focus});
export const samplingLab=(id,focus,methods)=>({id,type:'sampling-lab',focus,methods});
