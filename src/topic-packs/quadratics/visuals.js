// Topic-owned graph specifications. No SVG, DOM code or special page-ID logic.
const quadraticBase={kind:'quadratic',magnitude:1,sign:1,h:0,k:0};
const reference={...quadraticBase};
export const visuals=Object.freeze({
  schemaVersion:1,
  diagrams:{
    'quadratic-static':{
      type:'coordinate-plot',model:{kind:'quadratic',magnitude:1,sign:1,h:1,k:-3},
      view:{xMin:-3,xMax:4.5,yMin:-5,yMax:7}
    }
  },
  explorers:{
    shape:{
      type:'function-graph',initial:{...quadraticBase},
      controls:[{key:'magnitude',label:'Steepness |a|',min:0.5,max:2.5,step:0.5}],
      toggle:{key:'sign',label:'Flip opening direction',values:[1,-1]},
      reference,referenceLabel:'y = x²'
    },
    position:{
      type:'function-graph',initial:{...quadraticBase,k:-2},
      controls:[
        {key:'h',label:'Horizontal shift h',min:-3,max:3,step:1},
        {key:'k',label:'Vertical shift k',min:-5,max:4,step:1}
      ],
      reference,referenceLabel:'y = x²'
    }
  }
});
