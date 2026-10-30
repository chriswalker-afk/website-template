// Authored mathematical modelling investigations.
import {task,page,level} from '../builders/modelling.js';
export const modelling=[
    level(1,'Guided','Use sample information to predict population quantities, while identifying the assumptions involved.',
      page('population-estimates',
        task('cinema-preference',
          'A cinema wants an estimate of how many of its 600 registered members prefer weekday screenings. A simple random sample of 60 members gives 36 in favour.',
          ['Define a quantity to model and why the sampling procedure matters.','Treat the sample share as an estimate for the population share, not as an exact count.','Let p be the unknown proportion preferring weekdays. Model p by the sample proportion 36/60, assuming a complete frame, random selection and truthful responses.'],
          ['Estimate the population number preferring weekday screenings.','Multiply the estimated share by the population total.','The sample proportion is p̂=36/60=0.60, so the model predicts 0.60×600=360 members.'],
          ['Explain what 360 means and does not mean.','A prediction is not a confirmed population census result.','About 360 members are predicted to prefer weekdays if the sampled 60 are representative. Exactly 360 is not established by the sample.'],
          ['If 33 rather than 36 of the sampled members had preferred weekdays, compare the estimate and note an uncertainty.','Recalculate the predicted count as 33/60 of the total 600 members.','The revised prediction would be 330, 30 fewer. Sampling variation can shift estimates; even a valid simple random sample does not remove sampling uncertainty.'],
          ['The modelled population proportion is defined.','The estimate of 360 is correct and not treated as exact.','Sensitivity and sampling uncertainty are acknowledged.']
        ),
        task('lunch-choices',
          'A school with 900 pupils surveys a simple random sample of 80 pupils about their preferred lunch. Of those, 52 choose the hot meal.',
          ['Set up a model for the number choosing the hot meal.','The model assumes the sampled preference rate carries to the population.','Let p be the hot-meal preference proportion. Estimate p using 52/80, assuming pupils were selected randomly from a full list and responded honestly.'],
          ['Use the model to estimate how many pupils prefer the hot meal.','First calculate the sample proportion.','The sample preference rate is p̂=52/80=0.65, giving a predicted population count of 900×0.65=585 pupils.'],
          ['Interpret the predicted number for kitchen planning.','The school is making an estimate, not counting actual orders.','About 585 pupils might prefer the hot meal. The kitchen should not treat 585 as a guaranteed number of purchases on any particular day.'],
          ['Suppose 48 of the 80 respondents had chosen hot food instead. Compare the prediction.','Work out the new sample proportion and scale it to 900.','The new prediction is 48/80×900=540, 45 fewer pupils. Daily absences and changes in the menu could also change demand.'],
          ['A sample proportion model and assumptions are specified.','585 pupils is correctly calculated and interpreted.','The altered sample and planning uncertainty are evaluated.']
        )
      ),
      page('compare-predictions',
        task('bus-use',
          'A college has 480 students. A simple random sample of 40 shows that 14 regularly travel by bus. The college wishes to forecast bus users.',
          ['Define an estimated bus-user share and name a necessary assumption.','The sample must be drawn from all 480 students.','Use p̂=14/40 to model the population share if the sample represents all travel patterns, not only students already at the bus stop.'],
          ['Predict the number of regular bus users.','Apply the sample proportion to the college total.','The sample share of regular bus users is p̂=14/40=0.35, so the estimated college count is 480×0.35=168 students.'],
          ['Explain what the estimate tells a transport planner.','An estimate of people is not a measurement of bus occupancy on a specific journey.','The college might expect around 168 regular bus users, but different timetables and journey times determine how many arrive together.'],
          ['What if the sample had 16 regular users instead of 14? Quantify the effect.','Recalculate with 16/40 and compare.','The forecast becomes 480×16/40=192, 24 more. This sensitivity illustrates why one small sample should not be treated as a fixed total.'],
          ['The target population and sample model match.','168 students is calculated correctly.','The +24 change and forecasting limitation are explained.']
        ),
        task('weekly-library',
          'A town has 1,200 registered library members. In a random sample of 50 members, 18 say they visit the library at least once a week.',
          ['Define an appropriate estimate of weekly visits.','The quantity is members visiting weekly, not total weekly visits.','Estimate the proportion of members visiting at least weekly by 18/50, assuming the full list and random selection give reasonable coverage.'],
          ['Estimate the population number of weekly visitors.','Multiply the sample share by 1,200.','The estimate is 18/50=0.36, giving 1,200×0.36=432 members who visit at least weekly.'],
          ['Explain why the number of visits cannot be inferred from this alone.','One person might visit more than once per week.','432 is a prediction of how many distinct members visit weekly, not the number of library visits. Repeat visits would need additional data.'],
          ['If 20 respondents instead said they visited weekly, update the forecast and consider recall error.','Calculate the new share 20/50 and scale it to the full 1,200-member population.','The alternative forecast is 480, 48 higher. Self-reported frequency may be misremembered, creating response measurement error.'],
          ['The target quantity is distinct weekly visitors.','432 is calculated and correctly described.','The revised forecast and self-report limitation are evaluated.']
        )
      )
    ),
    level(2,'Structured','Combine different group estimates using population weights instead of averaging unequal samples.',
      page('two-group-weights',
        task('sports-club-weighting',
          'A club has 200 juniors and 800 adults. A survey samples 40 juniors, of whom 32 want a new timetable, and 20 adults, of whom 6 want it. Estimate support across all 1,000 members.',
          ['Decide how to combine the two sample proportions.','The two sample sizes do not match the proportions of juniors and adults in the club.','Model support separately: pJ=32/40=0.8 and pA=6/20=0.3. Combine with the population counts, not the unweighted respondent total.'],
          ['Find the estimated number and percentage of members supporting the change.','Scale each group rate to its population size before adding.','Predicted support is 200×0.8+800×0.3=160+240=400 members, or 40% of the club.'],
          ['Compare that prediction with the unweighted respondent percentage.','Compare the share among the 60 respondents: (32+6)/(40+20).','The overall respondent share is 38/60≈63.3%, far higher than the population-weighted 40%; juniors are overrepresented among respondents.'],
          ['If adult support were actually 40% while junior support remained 80%, update the model.','Keep population sizes fixed but change one group rate.','The revised total is 200×0.8+800×0.4=480 (48%). The estimate changes by 80 members, so the adult-group response rate is important.'],
          ['Separate group rates and weights are correctly formed.','400 (40%) is computed from population weights.','Unweighted bias and altered adult rate are evaluated.']
        ),
        task('swimming-programme',
          'A city sports scheme includes 250 children and 750 adults. In a survey, 24 of 30 sampled children favour swimming lessons, while 18 of 60 sampled adults favour them.',
          ['Form a population-weighted support estimate.','There are two rates and two population sizes.','Assume each group sample is representative of its group. Model child support as 24/30=0.8 and adult support as 18/60=0.3.'],
          ['Calculate estimated supporters across the scheme.','Apply each rate to the relevant group, then add.','Estimated child supporters=250×0.8=200; adult supporters=750×0.3=225. Total=425 of 1,000, or 42.5%.'],
          ['Explain why a simple average of 80% and 30% is misleading.','One group is three times larger than the other.','The average (80%+30%)/2=55% weights children and adults equally. The city actually has three times as many adults, producing a 42.5% weighted prediction.'],
          ['How would the estimated total change if the number of adults were 850 instead?','Keep both group preference rates fixed and change the adult population.','The revised estimate is 200+850×0.3=455 supporters from 1,100 members. That is about 41.4%, showing the importance of knowing population composition.'],
          ['Both group rates are identified and weighted.','425 supporters and 42.5% are correct.','Equal-weighting error and composition sensitivity are explained.']
        )
      ),
      page('multiple-group-weights',
        task('exercise-rates',
          'A school has 400 pupils in group A and 600 in group B. In separate group samples, 15 of 25 in A and 9 of 30 in B report exercising daily.',
          ['Model daily exercise across the school without treating the two samples as the same size.','Use group rates, then weight by the two population counts.','Estimate pA=15/25=0.6 and pB=9/30=0.3, assuming each group sample is representative.'],
          ['Predict the total number exercising daily.','Multiply each rate by its group size and add.','Predicted pupils =400×0.6+600×0.3=240+180=420, or 42% of the school.'],
          ['Compare the population-weighted estimate with pooled sample responses.','Pooled sample proportion is 24/55.','Pooled respondents give 24/55≈43.6%, not the population-weighted 42%. The sample allocation differs from school proportions.'],
          ['What happens if group B daily exercise is actually 40%?','Change only pB to 0.4; keep both population sizes and pA fixed.','The prediction becomes 400×0.6+600×0.4=480 (48%). The 60-pupil change demonstrates sensitivity to the larger group’s reported rate.'],
          ['Two valid subgroup rates are defined.','420 pupils and 42% are calculated.','Pooled-versus-weighted and sensitivity differences are discussed.']
        ),
        task('three-age-groups',
          'A town survey estimates demand for a new facility across age groups of 100, 300 and 600 people. Their samples show 14 of 20, 15 of 30 and 8 of 40 in favour.',
          ['Write a model that accounts for three different group sizes.','Each sample provides a group-specific rate.','Set support rates to 0.7, 0.5 and 0.2 for the three age groups, assuming group-level sampling is representative.'],
          ['Estimate overall support count and percentage.','Multiply each rate by its actual group size.','Predicted support=100×0.7+300×0.5+600×0.2=70+150+120=340 of 1,000, or 34%.'],
          ['Explain why the sample total alone can distort the town result.','The group sample sizes are 20, 30 and 40, not proportional to 100, 300 and 600.','The pooled survey share is (14+15+8)/(20+30+40)=37/90≈41.1%, whereas population weighting predicts 34%.'],
          ['If the largest group’s approval rises from 20% to 25%, update the forecast.','The third group contains 600 people.','The model changes by 600×0.05=30 supporters, giving 370 of 1,000 (37%). It is a hypothetical rate change, not observed evidence.'],
          ['Three rates and group sizes are correctly matched.','340 supporters and 34% are correct.','Pooled distortion and what-if change are quantified.']
        )
      )
    ),
    level(3,'Independent','Test estimates against nonresponse, missing coverage and validation evidence.',
      page('response-uncertainty',
        task('nonresponse-range',
          'A simple random sample of 120 people from a 2,000-person population is invited to answer a yes/no question. Exactly 90 respond and 54 say yes. The other 30 give no answer.',
          ['Construct a sensitivity model for the 30 unknown sampled preferences.','Different assumptions about nonrespondents lead to different sample proportions.','Let u be the number of yes answers among the 30 nonrespondents, 0≤u≤30. The possible full-sample yes share is (54+u)/120.'],
          ['Find the range of population forecasts produced by the unknown responses.','Evaluate the model at u=0 and u=30.','At u=0, (54/120)×2,000=900; at u=30, (84/120)×2,000=1,400. Thus the response assumptions produce estimates ranging from 900 to 1,400.'],
          ['Explain what that range does and does not guarantee.','Unknown nonresponses are only one source of error.','The interval 900–1,400 shows sensitivity of modelled population forecasts to the missing sampled responses. It is not a guaranteed bound on the true population total because sampling variation remains.'],
          ['Suggest a specific improvement to the investigation.','Try to understand which of the 30 failed to respond.','Follow up nonrespondents or use a justified response-adjustment model, and report the remaining uncertainty. Assuming all nonrespondents behave like respondents is unverified.'],
          ['Unknown yes responses are represented by a bounded variable.','900–1,400 is correctly labelled a forecast range.','Sampling and nonresponse uncertainty are not confused.']
        ),
        task('ten-missing',
          'A sample of 80 people from a population of 800 is chosen randomly. Of 70 respondents, 42 support a proposal; the other 10 sampled people do not respond.',
          ['Represent the missing preferences rather than silently discarding them.','The number of yes answers among 10 nonrespondents ranges from 0 to 10.','Let u be the missing yes count, 0≤u≤10. Model the full invited sample rate by p̂=(42+u)/80.'],
          ['Calculate the range of population support forecasts.','Scale both extreme proportions to 800.','At u=0, 800×42/80=420. At u=10, 800×52/80=520. The forecasts therefore range from 420 to 520 people.'],
          ['Interpret the range relative to the responding-only estimate.','The responding-only figure assumes unknown respondents are like known ones.','Using only respondents gives 42/70×800=480. That lies within the sensitivity range but depends on an untested nonresponse assumption.'],
          ['Explain what further evidence would narrow this modelled range.','Aim to recover missing responses and investigate why they are missing.','Follow up the 10 nonrespondents to refine u and inspect possible response bias. The range is about model assumptions, not a formal confidence interval.'],
          ['A bounded missing-response parameter is used.','420–520 forecasts are calculated correctly.','Nonresponse sensitivity is distinguished from statistical confidence.']
        )
      ),
      page('coverage-and-validation',
        task('incomplete-frame',
          'A city has 1,000 households. A survey frame covers 700 centrally located households and excludes 300 outlying households. The observed support rate in the 700-household frame is 60%. Assume the outlying support rate could be anywhere from 20% to 50%.',
          ['Write a model that explicitly includes the unobserved households.','Do not scale the 60% centre rate to all 1,000 without a coverage assumption.','Let r be the outlying support rate with 0.2≤r≤0.5. Model total supporters by S(r)=700×0.6+300r=420+300r.'],
          ['Calculate a range of support counts and percentages.','Evaluate S at r=0.2 and r=0.5.','At the assumed minimum r=0.2, S=420+60=480 (48%). At the maximum r=0.5, S=420+150=570 (57%).'],
          ['Compare those values with naïvely extending the central rate to everyone.','The naïve estimate uses 1,000×0.6.','The central-only forecast is 600 supporters (60%), above both assumed-range predictions. Coverage exclusions could make a larger apparent sample misleading.'],
          ['Identify a better survey design and one remaining limitation.','The omitted 300 households need a sampling frame of their own.','Create a frame for outlying households, sample both groups randomly and weight by 700 and 300. The assumed 20–50% range is hypothetical until supported by real responses.'],
          ['The omitted group is explicitly parameterised.','The forecasts 480–570 are computed.','Coverage bias and a practical remedy are evaluated.']
        ),
        task('held-out-survey',
          'A town with 2,000 residents tests a sampling-based estimate of support for a new service. An initial random sample of 100 gives 62 supporters. An independent second random sample of 100 gives 47.',
          ['Define how the two samples could be used to assess stability.','Each sample independently estimates the same population proportion.','Assume both samples are independently and fairly drawn from the full population. Calculate separate estimates and compare them rather than declaring either exact.'],
          ['Find the two population forecasts and a pooled estimate.','Scale each proportion by 2,000, then combine the equal-size samples.','First forecast=0.62×2,000=1,240; second=0.47×2,000=940; difference 300. Combined rate=(62+47)/200=0.545 predicts 1,090.'],
          ['Interpret the disagreement without asserting bias from one result.','Different random samples need not produce the same share.','The 300-person difference shows the forecast is sensitive to observed sample variation; it does not prove that either random sample was systematically biased.'],
          ['Suggest validation and communication improvements.','More data, consistent questions and proper selection matter.','Check sampling frames, nonresponse and question wording, use further random data, and report uncertainty rather than presenting 1,090 as a census count.'],
          ['Separate and combined sample rates are formed.','1,240, 940 and 1,090 estimates are correct.','The disagreement is interpreted without an unsupported causal claim.']
        )
      )
    ),
    level(4,'Challenge','Build competing population scenarios and assess sensitivity and bias before recommending an estimate.',
      page('sensitivity',
        task('changing-population-mix',
          'A district population initially has 400 people in group A and 600 in group B. Representative group samples suggest 75% support in A and 25% in B. Next year the district expects 500 in each group.',
          ['Define a population-mix model with conditional assumptions.','The group rates are treated as stable while membership counts change.','Let n be the number in group A from a total of 1,000. Under unchanged within-group rates, S(n)=0.75n+0.25(1,000−n).'],
          ['Calculate predicted support before and after the composition change.','Evaluate S at n=400 and n=500.','Initially S(400)=0.75×400+0.25×600=450. Later S(500)=0.75×500+0.25×500=500, an increase of 50.'],
          ['Interpret why the overall rate changes even with unchanged group rates.','The population weights changed.','The projected proportion rises from 45% to 50% solely because the higher-support group becomes larger. The calculation does not establish that preferences themselves changed.'],
          ['If group B support rises to 30% in the second year, update and critique the forecast.','Only one within-group rate now changes.','The new second-year forecast is 500×0.75+500×0.30=525 (52.5%). The prediction depends on both population forecasts and unverified stability of support rates.'],
          ['Population mixture and group rates are explicit.','Both 450 and 500 predictions are accurate.','Rate-change sensitivity and assumptions are evaluated.']
        ),
        task('weighting-sensitivity',
          'A region has 300 residents in stratum A and 700 in B. A survey of 30 from A shows 18 supporters and a survey of 70 from B shows 28 supporters. A researcher fears that B support could be 5 percentage points lower than the survey suggests.',
          ['Form a baseline weighted forecast and a revised assumption.','Different group rates are combined with the correct population sizes.','Let pA=18/30=0.6 and pB=28/70=0.4. Model S=300pA+700pB; consider alternative pB=0.35.'],
          ['Calculate the baseline and the changed forecast.','Change only pB in the weighted formula.','Baseline S=300×0.6+700×0.4=460. Alternative S=180+700×0.35=425, a difference of −35 residents.'],
          ['Explain why a five-point change matters more in the larger stratum.','Each percentage point in B applies to 700 residents.','A 0.05 change in B affects 700×0.05=35 people, whereas the same change in A affects only 15. The model is more sensitive to B’s estimated rate.'],
          ['Describe evidence required before replacing the observed rate with 0.35.','A hypothetical concern must be tested against a more representative sample.','Collect more representative data for B and investigate response bias. The 425 estimate is a scenario, not evidence that B’s actual support is 35%.'],
          ['The baseline group weighting is valid.','460 and 425 predictions and the −35 difference are right.','The hypothetical status of the revision is clear.']
        )
      ),
      page('competing-models',
        task('volunteers-vs-random',
          'A population has 3,000 residents. A small random sample of 100 contains 58 supporters. A larger online volunteer survey of 400 contains 280 supporters. Both surveys ask the same question.',
          ['Set up competing population forecasts and evaluate their data collection mechanisms.','Sample size alone does not measure selection bias.','Model A uses the random sample rate 58/100=0.58. Model B uses the volunteer response rate 280/400=0.70, which might overrepresent motivated respondents.'],
          ['Calculate both forecasts and their difference.','Scale each observed sample share by 3,000.','Random-sample forecast=3,000×0.58=1,740; volunteer forecast=3,000×0.70=2,100. The difference is 360 people.'],
          ['Explain why the larger volunteer result is not necessarily more reliable.','Randomness of selection and sample size address different errors.','The 400-volunteer survey has more responses but may suffer systematic selection bias. The 100-person random sample can be more defensible if its frame and response rate are sound.'],
          ['If the volunteer share overestimates population support by 12 percentage points, reassess the comparison.','Treat the overestimate as an explicit hypothetical assumption.','Correcting 70% by 12 percentage points gives 58%, predicting 1,740—matching Model A. This illustrates a possible bias explanation, not proof of the true population rate.'],
          ['Both model rates and collection mechanisms are distinguished.','1,740, 2,100 and the difference 360 are calculated.','The hypothetical bias correction is not claimed as fact.']
        ),
        task('unequal-frame-check',
          'A municipality has 200, 500 and 300 households in three districts. Random district samples of 40, 25 and 15 households show 10, 10 and 12 supporting a renovation. A colleague pools all 80 responses to estimate total support.',
          ['Build a population-weighted model and identify why pooling could mislead.','The sample shares of the three districts differ from their population shares.','District support rates are 10/40=0.25, 10/25=0.40, 12/15=0.80. Weight by household counts 200,500,300, not by sample sizes 40,25,15.'],
          ['Calculate the weighted forecast and the unweighted pooled forecast.','Scale each rate to the corresponding district.','Weighted total=200×0.25+500×0.40+300×0.80=50+200+240=490 of 1,000 (49%). Pooled sample=32/80=40%, predicting only 400.'],
          ['Interpret the 90-household discrepancy.','Excess sample share from the lowest-rate district depresses the pooled result.','The pooled forecast underestimates weighted model support by 490−400=90 households; the smallest-support district received half the sample but only a fifth of the population.'],
          ['How would your forecast change if 20% rather than 25% of District 1 supported the plan?','Change only the first district rate.','The revised weighted prediction is 200×0.2+500×0.4+300×0.8=480, 10 fewer. Both outcomes remain estimates subject to subgroup sampling uncertainty.'],
          ['All three subgroup rates and weights are correct.','490 weighted and 400 pooled forecasts are computed.','The direction, cause and sensitivity of disagreement are justified.']
        )
      )
    )
  ];
