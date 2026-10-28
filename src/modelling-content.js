// Author-reviewed, qualification-neutral modelling examples.
// Each case follows Formulate -> Calculate -> Interpret -> Evaluate.
// The review is always a student judgement, never a machine grade.
export const MODELLING_PHASES=Object.freeze([
  ['formulate','Formulate'],['calculate','Calculate'],
  ['interpret','Interpret'],['evaluate','Evaluate']
]);
const task=(id,scenario,formulate,calculate,interpret,evaluate,checks)=>({
  id,scenario,
  phases:[formulate,calculate,interpret,evaluate].map((a,i)=>({
    id:MODELLING_PHASES[i][0],label:MODELLING_PHASES[i][1],
    prompt:a[0],nudge:a[1],model:a[2]
  })),checks
});
const page=(id,...cases)=>({id,type:'modelling',tasks:cases});
const level=(number,name,description,...pages)=>({
  id:'level-'+number,label:'Level '+number+': '+name,description,pages
});
export const MODELLING_CHAPTERS={
  quadratics:[
    level(1,'Guided','Build and interpret quadratic models when the main assumptions and form are supplied.',
      page('shapes',
        task('parabolic-arch',
          'A symmetric arch is 8 m wide at ground level and 6 m high at its centre. Let x be horizontal distance in metres from the centre. Assume the opening follows a parabola.',
          ['Choose a quadratic form and a meaningful domain.','The centre is a turning point and each ground contact is 4 m away.','Use h(x)=ax²+6 with −4≤x≤4 and a<0; this models the opening above ground, not the full wall.'],
          ['Find the model and its height 2 m from the centre.','Insert the ground point (4,0) before evaluating h(2).','Substituting the ground endpoint gives 0=16a+6, so a=−3/8. Hence h(x)=6−(3/8)x² and h(2)=6−1.5=4.5 m.'],
          ['Interpret the predicted value for a person moving under the arch.','Explain exactly what x=2 and h=4.5 mean.','At a point 2 m from the centre, the model predicts 4.5 m of vertical clearance, subject to the assumed shape and ignoring arch thickness.'],
          ['A revised design is 6.4 m high but still 8 m wide. Assess how h(2) changes and one limitation.','The new shape must still pass through (4,0).','The updated model is h(x)=6.4−0.4x², giving h(2)=4.8 m, a 0.3 m increase. Real construction may not be an exact thin parabola.'],
          ['Variables, vertex, endpoints and domain agree.','The height prediction has the correct unit.','The changed-height prediction and limitation are justified.']
        ),
        task('fountain-path',
          'A water jet leaves ground level, reaches its highest point 8 m above ground after travelling 4 m horizontally, then meets the ground 8 m from its start. Assume a parabolic trajectory.',
          ['Define the horizontal variable, model form and valid range.','The turning point is (4,8) and the path is symmetric.','Let x be horizontal distance in m. Set h(x)=a(x−4)²+8, with 0≤x≤8; ignore drag and air currents.'],
          ['Find a and predict the water height at x=6 m.','Substitute h(0)=0 into the proposed vertex form to determine a.','Since 0=16a+8, the coefficient is a=−1/2. Therefore the model predicts h(6)=−(1/2)(2²)+8=6 m.'],
          ['Explain what h(6) means and whether x=10 is meaningful.','The stated water path ends after 8 m.','The model predicts water 6 m above ground 6 m from the nozzle. Extrapolating to x=10 describes beyond the landing point and is not meaningful here.'],
          ['If the peak becomes 7 m but the horizontal range stays 8 m, predict h(6).','Keep endpoints at x=0 and x=8 and recompute a.','With h(x)=7−(7/16)(x−4)², h(6)=7−7/4=5.25 m, a drop of 0.75 m. A real jet is affected by air resistance.'],
          ['A parabola with domain 0≤x≤8 is formulated.','The 6 m prediction is calculated and interpreted.','Sensitivity is calculated and model limits are acknowledged.']
        )
      ),
      page('motion',
        task('thrown-ball',
          'The height of a ball in metres is modelled by h(t)=−5t²+20t+1, where t is time in seconds after release. Ignore air resistance.',
          ['Identify the input, output, assumptions and physical domain.','The clock starts at release and the model stops when h=0.','Here t is seconds and h is metres. Assume constant gravitational acceleration, no drag and ground height zero. Use 0≤t≤positive root of h(t)=0.'],
          ['Find the maximum height, the time at the maximum and an approximate landing time.','Complete the square and solve h(t)=0.','h(t)=−5(t−2)²+21, so the maximum is 21 m at t=2 s. The positive root is (20+√420)/10≈4.05 s.'],
          ['Interpret the maximum and explain why negative time or later times are unsuitable.','The flight starts at t=0 and ends on contact with the ground.','The ball is predicted to peak at 21 m after 2 s and land after about 4.05 s. The quadratic should not be used for earlier or post-landing motion.'],
          ['If the initial height increases from 1 m to 2 m but other terms remain, predict the new peak and discuss uncertainty.','Adding one to h(t) moves every height up one metre.','The revised peak is 22 m at t=2 s. The launch height has a direct +1 m effect on the peak; drag and measurement errors remain unmodelled.'],
          ['The time and height variables and domain are clear.','The peak and approximate landing are correct.','The sensitivity and physical limitations are explained.']
        ),
        task('advertising-canopy',
          'A symmetric canopy is 8 m wide and 4 m high at its centre. Its edges touch the ground in the simplified design. A parabolic cross-section is assumed.',
          ['Choose a coordinate system and parabolic model with domain.','Measure x from the left edge, so the vertex is (4,4).','With x in metres from the left edge, h(x)=a(x−4)²+4 for 0≤x≤8, assuming a symmetric thin canopy.'],
          ['Find the model and the predicted height at x=2 m.','Use h(0)=0 and then substitute x=2.','Substituting the left edge gives 0=16a+4, hence a=−1/4. At x=2, the model predicts h=4−(1/4)(4)=3 m.'],
          ['Explain the design significance of the height and the domain.','A 2 m offset from the edge gives a particular vertical clearance.','At 2 m from the left edge the model predicts 3 m of clearance. Outside 0–8 m the model is not a description of the canopy.'],
          ['Suppose the peak rises to 5 m with the width unchanged. Estimate h(2) again.','Recalculate a using (0,0) and vertex (4,5).','The updated model is h(x)=5−(5/16)(x−4)². Thus h(2)=3.75 m, an increase of 0.75 m. Material thickness is ignored.'],
          ['The chosen coordinate system is consistent.','The 3 m clearance is calculated with units.','The revised estimate and a physical limitation are stated.']
        )
      )
    ),
    level(2,'Structured','Form quadratic relationships from constraints and interpret optima in context.',
      page('design',
        task('wall-garden',
          'A rectangular garden is built against a straight wall. Exactly 40 m of fencing forms the other three sides. Let x be the width perpendicular to the wall.',
          ['Model the area and specify the range of allowed widths.','Only two widths and the opposite length need fencing.','If the length is y, then 2x+y=40, so A(x)=x(40−2x), with 0≤x≤20. The wall needs no fence.'],
          ['Find the dimensions with maximum modelled area.','Complete the square or use the vertex of the area quadratic.','Completing the square gives A(x)=−2(x−10)²+200, so x=10 m, y=20 m and maximum area=200 m².'],
          ['Interpret the optimum in practical units.','Explain what each dimension represents.','Two 10 m sides and one 20 m side use exactly 40 m of fencing and enclose 200 m² against the wall.'],
          ['If the available fencing becomes 44 m, compare maximum areas and identify an assumption.','The general maximum is L²/8 when the three fenced sides total L.','At L=44 m, x=11 m, y=22 m and Amax=44²/8=242 m², 42 m² more. The model neglects gates and irregular ground.'],
          ['The three-sided constraint and feasible interval are correct.','The area maximum and dimensions are computed.','The revised resource optimum and omitted feature are evaluated.']
        ),
        task('poster-area',
          'A rectangular sign uses exactly 80 cm of border material around all four edges. Let x be its width and y its height. Assume no wastage at corners.',
          ['Express y and the display area in terms of x.','For a four-sided rectangle, 2x+2y=80.','The perimeter constraint gives y=40−x, hence A(x)=x(40−x), with 0≤x≤40 cm.'],
          ['Determine maximum area and compare it with x=15 cm.','Complete the square A=−(x−20)²+400.','The maximum is 400 cm² at x=y=20 cm. At x=15, y=25 and area is 375 cm², 25 cm² less.'],
          ['Explain why the best design is square within this model.','The area curve is symmetric about x=20.','For a fixed rectangular perimeter of 80 cm, the greatest area occurs at the square 20 cm by 20 cm. Other design criteria might change this preference.'],
          ['What happens to the maximum area if the border length becomes 84 cm?','For square optimum each side is one quarter of the border length.','A square of side 21 cm has area 441 cm², 41 cm² more. This assumes the usable area equals the full geometric rectangle, without margins.'],
          ['The perimeter restriction is modelled correctly.','Both maximum and alternative area are correct.','The sensitivity to border length is quantified.']
        )
      ),
      page('decisions',
        task('ticket-price',
          'A venue estimates that selling q tickets requires a ticket price p=20−0.2q dollars, for 0≤q≤100. The linear demand rule is an assumption based on recent sales.',
          ['Create a quadratic revenue model and identify the usable domain.','Revenue equals ticket price multiplied by number sold.','Use R(q)=q(20−0.2q)=20q−0.2q² dollars, with 0≤q≤100 and non-negative price.'],
          ['Calculate the revenue-maximising sales number and revenue.','Use the vertex formula or complete the square.','R(q)=−0.2(q−50)²+500, so the model predicts 50 tickets at $10 each and maximum revenue $500.'],
          ['Interpret the prediction and distinguish revenue from profit.','No expenses were included in the model.','A sales target of 50 tickets is predicted to maximise revenue at $500, not profit. Costs and actual buyer behaviour could change the optimum.'],
          ['Compare the prediction for q=40 and explain why the result might not transfer to a different event.','Use the given demand relation to calculate the price for 40 sales.','At q=40, p=$12 and R=$480, only $20 less than the maximum. Another event could have a different demand curve, so the fitted relationship needs validation.'],
          ['Revenue is correctly related to price and quantity.','The optimal ticket number and revenue are correct.','A nearby prediction and a demand limitation are assessed.']
        ),
        task('fundraising-tickets',
          'At a school event 80 tickets are expected to sell at $10 each. An organiser predicts that every $1 price increase reduces sales by 5 tickets. Let x be the dollar increase, treated as continuous for the initial model.',
          ['Make a formula for expected revenue with a realistic domain.','Both ticket price and attendance change with x.','Set price=10+x, sales=80−5x, so R(x)=(10+x)(80−5x)=800+30x−5x², with 0≤x≤16.'],
          ['Find the modelled maximum and the associated ticket number.','Find the vertex of the quadratic and substitute it into both factors.','Completing the square gives R=−5(x−3)²+845. At x=3 the predicted price is $13, sales are 65 and revenue is $845.'],
          ['Interpret the gain over the baseline.','Compare the new revenue with 80 tickets at $10.','The model predicts $845, which is $45 more than the $800 baseline, from selling 15 fewer tickets at a higher price.'],
          ['How robust is the result if the $1 increase loses 6 sales rather than 5?','Form the revised R(x)=(10+x)(80−6x).','Now R(x)=800+20x−6x², maximised at x=5/3≈1.67, revenue≈$816.67. The best price is sensitive to the unverified demand response.'],
          ['Ticket demand, price and domain are modelled.','The $845 revenue optimum is correctly found.','The changed-demand optimum is calculated and evaluated.']
        )
      )
    ),
    level(3,'Independent','Fit and validate models from measurements, then test whether their domains remain sensible.',
      page('measured-motion',
        task('projectile-data',
          'A camera records a launched object at heights 2 m at t=0 s, 12 m at t=1 s and 12 m at t=2 s. Fit h(t)=at²+bt+c. Treat measurements as exact for fitting.',
          ['Define the quadratic parameters and physically meaningful time.','Each measured pair supplies an equation; the launch height gives c.','Take t in seconds and h in metres. With h(0)=2, set c=2 and fit a,b using t=1,2; restrict use to the non-negative flight until h=0.'],
          ['Find the fitted model and maximum height.','Subtract the two nonzero-time equations to find a.','a+b=10 and 4a+2b=10 give a=−5, b=15. Thus h=−5t²+15t+2, peaking at t=1.5 s with h=13.25 m.'],
          ['Explain the peak and the eventual landing prediction.','The model loses physical meaning after reaching the ground.','The object is predicted to peak at 13.25 m after 1.5 s. It lands at t=(15+√265)/10≈3.13 s, if the parabolic trajectory holds.'],
          ['If the height at t=1 is 13 m instead, refit and compare the peak.','Keep h(0)=2 and h(2)=12 unchanged, and solve the two revised equations.','The updated equations a+b=11 and 2a+b=5 give a=−6, b=17. Peak occurs at t=17/12≈1.42 s, height 2+289/24≈14.04 m: a 1 m measurement change notably shifts the peak.'],
          ['The three measurements constrain all coefficients.','The fitted peak and flight-domain prediction are correct.','The refitted model demonstrates quantitative sensitivity.']
        ),
        task('braking-distance',
          'An idealised vehicle travels with displacement d(t)=20t−2t² metres after braking starts, where t is seconds. Assume constant deceleration until the car stops.',
          ['Define the model, its assumptions and its valid interval.','Velocity is the rate of change of displacement.','d is distance along the road in metres; t≥0. For constant deceleration, v(t)=20−4t, so the model ends when v=0 at t=5 s.'],
          ['Predict stopping time and stopping distance.','Solve v(t)=0 then substitute into d(t).','The velocity v(t)=20−4t reaches zero at t=5 s. Substituting gives d(5)=20(5)−2(25)=50 m.'],
          ['Interpret what the quadratic predicts, including why later values should not be used.','The model is valid only up to the stop, not for reversing motion.','The predicted braking distance is 50 m over 5 s. Continuing the formula beyond t=5 would predict backward motion, not the stationary car.'],
          ['If deceleration magnitude increases to 5 m/s², compare stopping distance, keeping initial speed 20 m/s.','Under constant deceleration use d(t)=20t−2.5t².','The new stop is at t=4 s and distance d(4)=80−40=40 m, 10 m shorter. Real road grip and reaction time are omitted.'],
          ['The velocity and stopping-domain conditions are clear.','The stopping distance and time are right.','A changed acceleration prediction and a limitation are given.']
        )
      ),
      page('validation',
        task('solar-output',
          'A simplified solar panel output model is quadratic in hours t after sunrise. Measurements are 0 units at t=0, 24 units at t=2 and 32 units at t=4. A separate reading at t=6 is 20 units.',
          ['Choose a quadratic model using the first three points and define its range.','The zero reading at sunrise suggests a zero constant term.','Let P(t)=at²+bt for 0≤t≤8 hours as an initial daylight approximation, ignoring clouds and temperature effects.'],
          ['Fit the model and calculate its prediction at t=6.','Solve the simultaneous equations 4a+2b=24 and 16a+4b=32.','The equations give a=−2,b=16, so P(t)=−2t²+16t. At t=6, P(6)=−72+96=24 units.'],
          ['Interpret the difference between prediction and the independent reading.','Use residual = observed − predicted.','The independent observation is 20 units, 4 units below the prediction: residual 20−24=−4. One mismatch does not by itself establish systematic bias.'],
          ['Evaluate how the model might be improved for variable conditions.','Do not infer an entire day of accuracy from three fitting points.','Collect readings at more times and under several cloud conditions, then inspect residuals. The symmetric parabola ignores asymmetric weather and panel orientation effects.'],
          ['A quadratic is fitted from the stated data.','The t=6 prediction and residual are correct.','Validation uses an independent reading and identifies limitations.']
        ),
        task('canopy-residual',
          'A proposed canopy has a maximum height of 5 m at x=3 m along a horizontal cross-section. A fitted point is (1,3). An independent measurement at x=5 is 2.7 m.',
          ['Choose a quadratic using the vertex and state what x represents.','Vertex form is useful when the peak is known.','Set h(x)=a(x−3)²+5, where x is distance in metres along the cross-section; the thin symmetric parabolic shape is an assumption.'],
          ['Fit the model, calculate h(5) and find the measurement residual.','Use the fitted point at x=1 for a.','3=4a+5 gives a=−1/2. Thus h(5)=5−(1/2)×4=3 m, and the residual is 2.7−3=−0.3 m.'],
          ['Interpret the sign and size of the residual.','Residual compares measured height with the model prediction.','The actual canopy is 0.3 m lower at x=5 than the parabolic model predicts; the model overpredicts that height.'],
          ['Identify a useful next measurement and explain why.','The assumption is symmetry about x=3.','Measure heights at paired positions such as x=2 and x=4 to test symmetry, and measure more points to distinguish noise from a poor geometric model.'],
          ['The vertex form reflects the centre.','The model prediction and −0.3 m residual are right.','Evaluation suggests a targeted check of symmetry.']
        )
      )
    ),
    level(4,'Challenge','Use quadratic optimisation and residual evidence to test decisions when assumptions change.',
      page('constrained-optimisation',
        task('greenhouse-safety',
          'A greenhouse rectangle is built against a wall with 60 m of fencing for its other three sides. Width x is perpendicular to the wall. A safety rule later restricts the width to at most 12 m.',
          ['Formulate the original area model and both feasible domains.','Only three sides are fenced and the width restriction changes the optimisation problem.','A(x)=x(60−2x), with 0≤x≤30 originally. The safety requirement changes the domain to 0≤x≤12.'],
          ['Find the unconstrained and safety-constrained maximum areas.','The unconstrained vertex lies outside the new interval.','A(x)=−2(x−15)²+450, so original maximum is 450 m² at x=15. On 0≤x≤12 the area is increasing, hence maximum A(12)=12×36=432 m².'],
          ['Explain the decision-making cost of the restriction.','Compare maximum achievable area, not simply widths.','The width limit reduces maximum modelled area by 450−432=18 m². The best permitted design is 12 m by 36 m rather than 15 m by 30 m.'],
          ['Evaluate an assumption or further real constraint.','Real greenhouse design also has doors, access and structural support.','The area model ignores paths, door width and building restrictions; check those constraints before adopting 12 m by 36 m. The computed optimum is conditional on the stated geometric rules.'],
          ['Both original and restricted domains are appropriate.','450 m² and 432 m² maxima are calculated correctly.','The design implication and omitted practical constraints are assessed.']
        ),
        task('profit-versus-revenue',
          'A seller models revenue from q units by R(q)=80q−2q² dollars, valid for 0≤q≤40. Fixed and variable costs are C(q)=300+10q dollars.',
          ['Define a profit model and its physical domain.','Profit differs from revenue by costs.','P(q)=R(q)−C(q)=−2q²+70q−300 dollars for 0≤q≤40. Quantities sold are integers, so the continuous vertex needs checking.'],
          ['Find the continuous optimum and the best integer sales target.','Use the quadratic vertex, then compare neighbouring integers.','The vertex occurs at q=17.5 with P=$312.50. At integers q=17 and q=18 the profit is $312, both optimal integer targets under this model.'],
          ['Interpret break-even quantities and the difference from maximising revenue.','The zero-profit solutions divide loss and profit ranges.','P=0 gives (q−5)(q−30)=0 after dividing by −2, so break-even is q=5 or 30; positive profit occurs strictly between. Revenue alone peaks at q=20, not q=17 or 18.'],
          ['If the fixed cost rises by $40, assess what changes.','Adding a fixed charge shifts profit vertically without moving the vertex.','New profit is Pnew=P−40. Continuous optimal quantity stays 17.5 and optimal integer quantities remain 17 and 18, but their profit falls to $272. The model assumes constant marginal cost.'],
          ['The profit expression and integer domain are correct.','Continuous and integer optima are distinguished.','Break-even and increased fixed cost are interpreted.']
        )
      ),
      page('fit-and-robustness',
        task('held-out-measurement',
          'An object has recorded heights (t,h) of (0,1), (2,13), (4,17) in seconds and metres. Use these for a quadratic fit. A fourth, independent reading at t=6 is 12 m.',
          ['Construct a model from three data points and justify its valid use.','The t=0 point supplies the intercept.','Let h(t)=at²+bt+1 for non-negative flight times; the measured points are assumed reliable and the motion approximately parabolic.'],
          ['Fit the model and predict the held-out height.','Solve the simultaneous equations 4a+2b=12 and 16a+4b=16.','Solving yields a=−1,b=8, so h(t)=−t²+8t+1. The prediction h(6)=−36+48+1=13 m.'],
          ['Quantify and interpret the held-out residual.','Compute observed minus predicted.','The held-out reading is 12 m, giving residual 12−13=−1 m: the fitted model is 1 m too high at t=6. Fitting the original three points exactly is not proof of predictive accuracy.'],
          ['Suggest how to improve and compare the model without hiding the disagreement.','A change in a fitted parameter might improve one reading but worsen others.','Collect more observations across the flight and compare residuals away from the fitting points. Refitting solely to the held-out point risks disguising error elsewhere; use a separate validation set.'],
          ['The three fitted points yield h=−t²+8t+1.','The independent residual −1 m is correctly interpreted.','The evaluation separates fitting from validation.']
        ),
        task('barrier-clearance',
          'A simulated ball follows h(t)=−4t²+16t+3 metres after release, where t is seconds. A safety zone requires the ball to stay higher than 10 m. Ignore air resistance.',
          ['Define the time domain and a clearance condition for the model.','The ball is airborne for non-negative time until h=0.','Take t≥0 until landing; require h(t)>10. The quadratic assumes fixed launch velocity, constant gravity and no drag.'],
          ['Find the times when the height is exactly 10 m and the interval above it.','Solve a quadratic inequality, not just the vertex.','h=10 gives 4t²−16t+7=0, with roots t=0.5 and t=3.5. Since the parabola opens downwards, h>10 for 0.5<t<3.5 s.'],
          ['Interpret the clearance interval as a modelled safety statement.','The interval endpoints have exactly 10 m height.','The model puts the ball above the 10 m threshold for 3 seconds, excluding the boundary instants. This does not establish safe clearance under variable launches.'],
          ['If the release height increases by 1 m, compare the clearance times and assess robustness.','Replace the +3 constant by +4, then solve h=10.','The new threshold times are t=2±√10/2≈0.419 and 3.581 s; the above-10-m interval widens. Real variation in speed or angle could also change the result.'],
          ['The physical domain and strict clearance criterion are defined.','The interval 0.5<t<3.5 is correct.','The sensitivity to launch height is quantified.']
        )
      )
    )
  ],
  sampling:[
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
  ]
};
