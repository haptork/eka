// imports Blockly from <script> tag.
import $ from 'jquery';
window.jQuery = $;
window.$ = $;

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';

import * as modelView from './modelView';
import * as gamePlay from './gamePlay';

export function main(stages) {
  modelView.init(stages);
  gamePlay.init(stages, modelView);
}