// A single, independently authored vocabulary and language-recall pack.
import {section,one} from '../builders/sections.js';
export const cards=[
      {id:'census',term:'Census',definition:'Collecting information from every member of the population.'},
      {id:'sample',term:'Sample',definition:'A subset of the population selected for investigation.'},
      {id:'stratified',term:'Stratified sampling',definition:'Dividing a population into groups and taking a random sample from each group in proportion to its size.'},
      {id:'systematic',term:'Systematic sampling',definition:'Selecting units at regular intervals from a suitably arranged sampling frame after a random start.'},
      {id:'simple-random',term:'Simple random sample',definition:'A sample in which every possible group of the specified size has an equal chance of being chosen.',aliases:['Simple random sampling']},
      {id:'sampling-frame',term:'Sampling frame',definition:'A list or other source that identifies the members of the population from which a sample may be drawn.'},
      {id:'population',term:'Population',definition:'The entire group of individuals or units about which a statistical investigation seeks information.'},
      {id:'stratum',term:'Stratum',definition:'One distinct group into which a population is divided for stratified sampling.'},
      {id:'sampling-interval',term:'Sampling interval',definition:'The fixed number of list positions between units selected in a systematic sample.'},
      {id:'selection-bias',term:'Selection bias',definition:'A systematic distortion caused when some members of the target population are more likely than others to be included.'},
      {id:'quota',term:'Quota sampling',definition:'Choosing individuals non-randomly until specified category targets have been reached.'},
      {id:'opportunity',term:'Opportunity sampling',definition:'Selecting people who are readily available to the investigator.',aliases:['Convenience sampling']}
    ];
export const clozes=[
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
  ];
export const cloze={before:'A list of all the population members from which a sample can be drawn is called a ',answer:'sampling frame',after:'.',hint:'Two words. It describes the source list, not the individuals chosen.'};
export const memorise=[
      section('flashcards','Flashcards','Recall each definition before flipping the card and rating your recall.',one('flashcards')),
      section('match-up','Match Up','Match mathematical terms to their precise definitions.',one('match-up')),
      section('missing-words','Missing Words','Complete statements by retrieving the correct term.',one('missing-words')),
      section('speed-recall','Speed Recall','Type the term that matches each definition.',one('speed-recall')),
      section('review-all','Review All','Browse the full vocabulary deck and its definitions.',one('review-all'))
    ];
