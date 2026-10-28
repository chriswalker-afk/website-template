// Data-driven language retrieval prompts for the two demonstration topics.
// Every prompt identifies the concept in topic.cards by cardId; never invent
// extra grading rules in the UI. Only reviewed aliases are accepted.
export const CLOZE_BANK={
  sampling:[
    {id:'frame',cardId:'sampling-frame',before:'A complete list identifying the members from whom a sample can be chosen is a ',after:'.',hint:'Two words: the source list used for selection.',answer:'sampling frame'},
    {id:'census',cardId:'census',before:'Collecting data from every member of the population is a ',after:'.',hint:'Six letters; it is not a sample.',answer:'census'},
    {id:'sample',cardId:'sample',before:'A subset of the population selected for investigation is a ',after:'.',hint:'Six letters; a part, not the whole.',answer:'sample'},
    {id:'random',cardId:'simple-random',before:'When every possible set of a specified size has the same probability of being selected, it is a ',after:'.',hint:'Three words, beginning with “simple”.',answer:'simple random sample',aliases:['simple random sampling']},
    {id:'systematic',cardId:'systematic',before:'Choosing a random start and then selecting every kth entry is called ',after:'.',hint:'A method based on a fixed interval.',answer:'systematic sampling'},
    {id:'stratified',cardId:'stratified',before:'Selecting randomly within groups while maintaining their population proportions is called ',after:'.',hint:'A method based on distinct strata.',answer:'stratified sampling'},
    {id:'population',cardId:'population',before:'The whole group about which an investigation seeks information is the ',after:'.',hint:'The complete target group.',answer:'population'},
    {id:'stratum',cardId:'stratum',before:'One distinct group within a stratified population is a ',after:'.',hint:'The singular of “strata”.',answer:'stratum'},
    {id:'interval',cardId:'sampling-interval',before:'The fixed step between selected entries in systematic sampling is the sampling ',after:'.',hint:'Think of a regular step.',answer:'interval'},
    {id:'bias',cardId:'selection-bias',before:'If some population members are systematically more likely to be included than others, there may be selection ',after:'.',hint:'A four-letter word for a systematic distortion.',answer:'bias'},
    {id:'quota',cardId:'quota',before:'Choosing respondents non-randomly until set numbers in different categories are met is ',after:'.',hint:'A method with category targets.',answer:'quota sampling'},
    {id:'opportunity',cardId:'opportunity',before:'Using people who are readily available is commonly called ',after:'.',hint:'Also known as convenience sampling.',answer:'opportunity sampling',aliases:['convenience sampling']}
  ],
  quadratics:[
    {id:'symmetry',cardId:'symmetry',before:'The vertical line passing through the turning point is the ',after:'.',hint:'Three words; it divides the parabola into mirror images.',answer:'axis of symmetry'},
    {id:'quadratic',cardId:'quadratic',before:'A polynomial function with highest power of x equal to 2 is a ',after:'.',hint:'Two words; its graph is a parabola.',answer:'quadratic function'},
    {id:'vertex',cardId:'turning-point',before:'The point where a parabola changes from increasing to decreasing (or vice versa) is its ',after:'.',hint:'Two words.',answer:'turning point'},
    {id:'discriminant',cardId:'discriminant',before:'The expression b² − 4ac is called the ',after:'.',hint:'It indicates the number of distinct real roots.',answer:'discriminant'},
    {id:'roots',cardId:'roots',before:'The x-values for which f(x) = 0 are the ',after:'.',hint:'Another name for the zeros of a function.',answer:'roots'},
    {id:'square',cardId:'completed-square',before:'The form a(x − h)² + k is the completed-',after:' form.',hint:'A word for a number multiplied by itself.',answer:'square'},
    {id:'parabola',cardId:'parabola',before:'The curved graph of a quadratic function is a ',after:'.',hint:'Starts with “para”.',answer:'parabola'},
    {id:'leading',cardId:'leading-coefficient',before:'In y = ax² + bx + c, the non-zero value a is the leading ',after:'.',hint:'A number multiplying a variable term.',answer:'coefficient'},
    {id:'yintercept',cardId:'y-intercept',before:'The point where a quadratic graph crosses the vertical axis is the ',after:'.',hint:'It is found by setting x = 0.',answer:'y-intercept',aliases:['y intercept']},
    {id:'factorised',cardId:'factorised-form',before:'The form a(x − p)(x − q), which displays real roots p and q, is the ',after:'.',hint:'A form built from factors.',answer:'factorised form',aliases:['factored form']},
    {id:'minimum',cardId:'minimum',before:'For a > 0, the turning point is a ',after:'.',hint:'The smallest y-value of the quadratic.',answer:'minimum'},
    {id:'maximum',cardId:'maximum',before:'For a < 0, the turning point is a ',after:'.',hint:'The greatest y-value of the quadratic.',answer:'maximum'}
  ]
};
