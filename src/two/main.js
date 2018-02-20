import $ from 'jquery';
window.jQuery = $;
window.$ = $;
import * as modelView from './modelView';
import * as gamePlay from './gamePlay';
import Blockly from 'node-blockly/browser';
import 'bootstrap';

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';

export function main(stages) {
  modelView.init(stages);
  gamePlay.init(stages, modelView);
}