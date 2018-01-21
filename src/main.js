// imports Blockly from <script> tag.
// import * as $ from 'jquery';
import * as modelView from './modelView';
import * as gamePlay from './gamePlay';

export function main(stages) {
  modelView.init(stages);
  gamePlay.init(stages, modelView);
}