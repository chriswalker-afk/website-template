// Authored mathematical modelling investigations.
import {task,page,level} from '../builders/modelling.js';
export const modelling=[
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
  ];
