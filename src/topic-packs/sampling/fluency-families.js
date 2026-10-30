// Sampling Fluency question families. IDs and question generation preserved for saved sets.
import {int,pick,fmt,poly,bracket,factored,vertexForm,rnd2,question} from '../builders/fluency-question.js';
export const fluencyFamilies=Object.freeze({
  'sample-percent':rng=>{
    const N=20*int(rng,8,35),p=pick(rng,[5,10,15,20,25,30,40,50]),n=N*p/100;
    return question({family:'sample-percent',signature:N+':'+p,skill:'Sample percentages',
      prompt:'A population contains '+N+' people. A sample of '+n+' is chosen. What percentage of the population is sampled?',
      values:[p],unit:'%',steps:['Sample fraction = '+n+' ÷ '+N+'.',
        'Multiply by 100: ('+n+' ÷ '+N+') × 100 = '+p+'%.'],
      hint:'Divide the sample size by the population size, then multiply by 100.',
      mistake:'Check that you divided the number sampled by the entire population.',
      marks:2});
  },
  'sample-count':rng=>{
    const N=20*int(rng,6,40),p=pick(rng,[5,10,15,20,25,30,40,50]),n=N*p/100;
    return question({family:'sample-count',signature:N+':'+p,skill:'Sample sizes',
      prompt:'A '+p+'% sample is required from a population of '+N+'. How many people should be selected?',
      values:[n],steps:['Convert the percentage: '+p+'% = '+p+'/100.',
        'Sample size = '+N+' × '+p+'/100 = '+n+'.'],hint:'Multiply the population size by the percentage as a fraction.',
      mistake:'Remember that '+p+'% means '+p+' out of 100, not '+p+' times the population.',marks:2});
  },
  interval:rng=>{
    const step=int(rng,3,15),n=int(rng,12,48),N=step*n;
    return question({family:'interval',signature:N+':'+n,skill:'Systematic intervals',
      prompt:'A systematic sample of '+n+' is needed from an ordered list of '+N+'. Find the sampling interval.',
      values:[step],steps:['Interval = list size ÷ required sample size.',
        'Interval = '+N+' ÷ '+n+' = '+step+'.'],
      hint:'Divide the length of the list by the number to be sampled.',
      mistake:'The sampling interval is not the sample size. Check '+n+' × interval = '+N+'.',marks:2});
  },
  'sample-size':rng=>{
    const step=int(rng,3,15),n=int(rng,10,45),N=step*n;
    return question({family:'sample-size',signature:N+':'+step,skill:'Systematic sample size',
      prompt:'An ordered list has '+N+' entries. A systematic sample uses interval '+step+'. How many people are selected?',
      values:[n],steps:['Number selected = list size ÷ interval.',
        'Number selected = '+N+' ÷ '+step+' = '+n+'.'],
      hint:'Reverse the interval calculation.',mistake:'Use total entries ÷ interval, not total entries × interval.',marks:2});
  },
  'stratified-two':rng=>{
    const a=20*int(rng,4,16),b=20*int(rng,4,18),d=pick(rng,[4,5,10]),n=(a+b)/d,na=a/d,nb=b/d;
    return question({family:'stratified-two',signature:a+':'+b+':'+d,skill:'Proportional allocation',
      prompt:'Group A has '+a+' people and Group B has '+b+'. Allocate a proportional stratified sample of '+n+
        '. Give the numbers from A and B, in that order.',
      values:[na,nb],kind:'ordered',
      steps:['Population total = '+a+' + '+b+' = '+(a+b)+'.',
        'A: '+n+' × '+a+'/'+(a+b)+' = '+na+'.',
        'B: '+n+' × '+b+'/'+(a+b)+' = '+nb+'. Check '+na+' + '+nb+' = '+n+'.'],
      hint:'Multiply the sample size by each stratum’s share of the total population.',
      mistake:'Allocate proportionally to the group sizes; do not split the sample equally.',marks:3});
  },
  positions:rng=>{
    const step=int(rng,3,12),size=int(rng,9,20),start=int(rng,1,step),N=step*size;
    const values=Array.from({length:5},(_,i)=>start+i*step);
    return question({family:'positions',signature:step+':'+size+':'+start,skill:'Systematic positions',
      prompt:'From an ordered list of '+N+' entries, a systematic sample uses interval '+step+
        ' and a random start at position '+start+'. List the first five selected positions in order.',
      values,kind:'ordered',steps:['Start at the selected position '+start+'.',
        'Add '+step+' repeatedly: '+values.join(', ')+'.'],
      hint:'Add the interval to the starting position each time.',
      mistake:'Your first position should be '+start+', followed by steps of '+step+'.',marks:3});
  },
  'stratified-three':rng=>{
    const sizes=[20*int(rng,3,12),20*int(rng,4,14),20*int(rng,3,13)],d=pick(rng,[4,5,10]);
    const N=sizes.reduce((a,b)=>a+b,0),n=N/d,values=sizes.map(x=>x/d);
    return question({family:'stratified-three',signature:sizes.join(':')+':'+d,skill:'Three-stratum allocation',
      prompt:'Strata A, B and C contain '+sizes.join(', ')+' people. A proportional stratified sample of '+
        n+' is taken. Give the allocations A, B and C in order.',
      values,kind:'ordered',steps:['Total population = '+sizes.join(' + ')+' = '+N+'.',
        'Sampling fraction = '+n+'/'+N+' = 1/'+d+'.',
        'Allocations: '+sizes.map((x,i)=>' '+('ABC'[i])+': '+x+'/'+d+' = '+values[i]).join(';')+'.',
        'Check: '+values.join(' + ')+' = '+n+'.'],
      hint:'Calculate the sampling fraction and apply it to all three strata.',
      mistake:'Each stratum uses the same sampling fraction. Check that allocations add up to '+n+'.',marks:4});
  },
  'last-position':rng=>{
    const step=int(rng,4,13),size=int(rng,10,35),start=int(rng,1,step),N=size*step;
    const last=start+(size-1)*step;
    return question({family:'last-position',signature:step+':'+size+':'+start,skill:'Systematic sequence',
      prompt:'A systematic sample of '+size+' is taken from an ordered list of '+N+' people, starting at position '+
        start+'. What is the position of the final selected person?',
      values:[last],steps:['Interval = '+N+'/'+size+' = '+step+'.',
        'The first selected position is '+start+'; there are '+(size-1)+' further steps.',
        'Final position = '+start+' + '+(size-1)+' × '+step+' = '+last+'.'],
      hint:'Find the interval first. The final position comes after one fewer interval than the sample size.',
      mistake:'There are '+(size-1)+' jumps between '+size+' selected people, not '+size+'.',marks:3});
  },
  'reverse-population':rng=>{
    const a=20*int(rng,4,15),b=20*int(rng,4,14),c=20*int(rng,4,13),d=pick(rng,[4,5,10]);
    const n=(a+b+c)/d,na=a/d,nb=b/d,nc=c/d;
    return question({family:'reverse-population',signature:a+':'+b+':'+c+':'+d,skill:'Reverse stratification',
      prompt:'A proportional stratified sample of '+n+' is selected from three groups. Group A has '+
        a+' people and contributes '+na+' to the sample. Group B has '+b+
        ' people. How many people are in Group C if the same sampling fraction is used throughout?',
      values:[c],steps:['Sampling fraction = '+na+'/'+a+' = 1/'+d+'.',
        'Total population = sample size ÷ sampling fraction = '+n+' × '+d+' = '+(a+b+c)+'.',
        'C = '+(a+b+c)+' − '+a+' − '+b+' = '+c+'.'],
      hint:'Use Group A to find the sampling fraction; then reverse it to find the total population.',
      mistake:'Do not confuse the population size of Group C with its sample allocation of '+nc+'.',marks:5});
  },
  'reverse-sample':rng=>{
    const a=20*int(rng,5,14),b=20*int(rng,5,17),c=20*int(rng,4,16),d=pick(rng,[4,5,10]);
    const n=(a+b+c)/d,na=a/d;
    return question({family:'reverse-sample',signature:a+':'+b+':'+c+':'+d,skill:'Reverse sample size',
      prompt:'Three strata contain '+a+', '+b+' and '+c+' people. In a proportional sample, Group A contributes '+
        na+' people. Find the total sample size.',
      values:[n],steps:['Sampling fraction = '+na+'/'+a+' = 1/'+d+'.',
        'Population total = '+a+' + '+b+' + '+c+' = '+(a+b+c)+'.',
        'Sample size = '+(a+b+c)+' ÷ '+d+' = '+n+'.'],
      hint:'Work out the sample fraction from Group A, then apply it to the population total.',
      mistake:'The whole sample is larger than Group A’s allocation of '+na+'.',marks:4});
  },
  'within-stratum-interval':rng=>{
    const a=20*int(rng,4,14),b=20*int(rng,4,18),c=20*int(rng,4,15),d=pick(rng,[4,5,10]);
    const n=(a+b+c)/d,nb=b/d;
    return question({family:'within-stratum-interval',signature:a+':'+b+':'+c+':'+d,skill:'Combined sampling calculations',
      prompt:'Strata A, B and C have sizes '+a+', '+b+' and '+c+'. A proportional sample of '+n+
        ' is taken. If the '+nb+' people allocated to Group B are selected systematically from its '+
        b+' listed members, find the sampling interval within Group B.',
      values:[d],steps:['Population total = '+(a+b+c)+' and sample size = '+n+'.',
        'B allocation = '+n+' × '+b+'/'+(a+b+c)+' = '+nb+'.',
        'Interval within B = '+b+' ÷ '+nb+' = '+d+'.'],
      hint:'First find the proportional allocation for Group B, then divide its size by that allocation.',
      mistake:'Use Group B’s size and sample allocation for the interval, not the entire population.',marks:5});
  }
});
