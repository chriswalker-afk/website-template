// One topic record, plus two external executable/configuration registrations.
import {manifest} from './manifest.js';
import {understand} from './understand.js';
import {cards,clozes,cloze,memorise} from './memorise.js';
import {fluency} from './fluency.js';
import {reasoning} from './reasoning.js';
import {problemSolving} from './problem-solving.js';
import {modelling} from './modelling.js';
import {games} from './games.js';
import {examPractice} from './exam-practice.js';
export const topic=Object.freeze({...manifest,cards,clozes,cloze,
  chapters:{understand,memorise,fluency,reasoning,problemSolving,modelling,games,examPractice}});
