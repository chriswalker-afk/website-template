// Level/page/family definitions; family implementations migrate in Pass 2.
import {level} from '../builders/fluency.js';
export const fluency=[
    level(1,'Guided','Use a visible starting cue to practise sample percentages, sample sizes and systematic intervals accurately.',[
      ['counts','Practise calculating sample sizes and percentages.',['sample-percent','sample-count']],
      ['intervals','Practise systematic sampling intervals and sample sizes.',['interval','sample-size']]]),
    level(2,'Structured','Follow a short method checklist for proportional allocations and systematic selections.',[
      ['allocation','Practise two-stratum allocations and listing systematic selections.',['stratified-two','positions','interval']]]),
    level(3,'Independent','Choose independently between familiar sampling calculations in a mixed set.',[
      ['mixed','Combine three-stratum allocations, positions and percentages.',['stratified-three','last-position','sample-percent','stratified-two']]]),
    level(4,'Challenge','Challenge your fluency with reverse and combined sampling calculations.',[
      ['advanced','Find missing group sizes and combine proportional and systematic calculations.',['reverse-population','reverse-sample','within-stratum-interval','stratified-three']]])
  ];
