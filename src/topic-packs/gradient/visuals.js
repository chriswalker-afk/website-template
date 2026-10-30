// Linear graphs only: configurable gradient demonstrations and diagrams.
export const visuals=Object.freeze({
  schemaVersion:1,
  diagrams:{
    'rising-line':{type:'coordinate-plot',model:{kind:'linear',m:2,b:-1},
      view:{xMin:-4,xMax:4,yMin:-7,yMax:7}},
    'falling-line':{type:'coordinate-plot',model:{kind:'linear',m:-1,b:2},
      view:{xMin:-4,xMax:4,yMin:-6,yMax:7}},
    'horizontal-line':{type:'coordinate-plot',model:{kind:'linear',m:0,b:3},
      view:{xMin:-4,xMax:4,yMin:-5,yMax:7}},
    'gradient-comparison':{type:'coordinate-plot',model:{kind:'linear',m:2,b:1},
      reference:{kind:'linear',m:1,b:1},
      view:{xMin:-3,xMax:3,yMin:-5,yMax:7}}
  },
  explorers:{
    'slope-explorer':{
      type:'function-graph',initial:{kind:'linear',m:1,b:0},
      controls:[
        {key:'m',label:'Gradient m',min:-3,max:3,step:0.5},
        {key:'b',label:'Starting height c',min:-3,max:3,step:1}
      ],
      reference:{kind:'linear',m:1,b:0},referenceLabel:'y = x',
      resetLabel:'Reset line'
    },
    'parallel-explorer':{
      type:'function-graph',initial:{kind:'linear',m:2,b:1},
      controls:[{key:'b',label:'Starting height c',min:-3,max:3,step:1}],
      reference:{kind:'linear',m:2,b:-2},referenceLabel:'y = 2x − 2',
      resetLabel:'Reset line'
    },
    'sign-explorer':{
      type:'function-graph',initial:{kind:'linear',m:-1,b:0},
      controls:[{key:'m',label:'Gradient m',min:-3,max:3,step:1}],
      reference:{kind:'linear',m:0,b:0},referenceLabel:'y = 0',
      resetLabel:'Reset line'
    }
  }
});
