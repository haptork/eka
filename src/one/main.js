import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import * as modelView from './modelView';
import * as gamePlay from './gamePlay';
import Blockly from 'node-blockly/browser';
import 'bootstrap';

export function main(stages) {
  modelView.init(stages);
  gamePlay.init(stages, modelView);
}