// One registration entry for the complete sampling topic pack.
import {manifest} from './manifest.js';
import {questionBank} from './question-bank.js';
import {understand} from './understand.js';
import {cards,clozes,cloze,memorise} from './memorise.js';
import {fluency} from './fluency.js';
import {reasoning} from './reasoning.js';
import {problemSolving} from './problem-solving.js';
import {modelling} from './modelling.js';
import {games} from './games.js';
export const topic=Object.freeze({...manifest,cards,clozes,cloze,questionBank,chapters:{understand,memorise,fluency,reasoning,problemSolving,modelling,games}});
