// Topic-owned visual data: change sizes, groups, method descriptions and diagram counts here.
export const SAMPLING_VISUAL={
  type:'sampling-selection',
  groups:[{label:'Group A',short:'A',size:16},{label:'Group B',short:'B',size:24}],
  sampleSize:10,
  methods:{
    census:{label:'Census',description:'Every person is included; this is not a sample.'},
    random:{label:'Simple random',description:'Every possible group of ten has the same chance of selection.'},
    systematic:{label:'Systematic',description:'Choose a random start from the first four positions, then take every fourth person.'},
    stratified:{label:'Stratified',description:'Randomly select four from Group A and six from Group B, preserving the population proportions.'},
    convenience:{label:'Convenience',description:'Take the first ten names from this group-ordered list. Group B is excluded.'}
  }
};
export const visuals=Object.freeze({
  schemaVersion:1,
  diagrams:{
    'sampling-dots':{type:'dot-grid',count:40,columns:8,
      selected:[2,6,11,15,19,26,30,36],
      label:'Population of 40 with eight people highlighted as one possible sample'}
  },
  explorers:{'census-sample':SAMPLING_VISUAL,proportion:SAMPLING_VISUAL}
});
