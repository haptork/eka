import Blockly from 'node-blockly/browser';
export default {init, initInterpreterButtonCheck};

var inputState;

export function init(_inputState) {
  inputState = _inputState;

  Blockly.Blocks.digitalRead = {
    init: function() {
      this.jsonInit({
        "message0": '%1 is %2',
        "args0": [
          {
            "type": "field_dropdown",
            "name": "pinNumber",
            "options": [
              ["button-A","0"],
              ["button-B","1"]
            ]
          },
          {
            "type": "field_dropdown",
            "name": "highlow",
            "options": [
              ["HIGH","1"],
              ["LOW","0"]
            ]
          }
        ],
        "output": "Boolean",
        "colour": 160,
        "tooltip": "Returns current state of the button.",
        "helpUrl": ""
      });
    }
  };

  var rmap = {0:"buttonA", 1:"buttonB"};

  Blockly.JavaScript.digitalRead = function(block) {
    var pinNumber = block.getFieldValue('pinNumber');
    var highlow = block.getFieldValue('highlow');
    var code = 'digitalRead(' + rmap[pinNumber] + ') == ' + highlow;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

  Blockly.Python.digitalRead = function(block) {
    var pinNumber = block.getFieldValue('pinNumber');
    var highlow = block.getFieldValue('highlow');
    var code = "digitalRead(" + (parseInt(pinNumber) + 6)+ ") == " + highlow;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  };

}

export function initInterpreterButtonCheck(interpreter, scope) {
  // Ensure function name does not conflict with variable names.
  Blockly.JavaScript.addReservedWords('digitalRead');
  var wrapper = interpreter.createNativeFunction (
    function(pinNumber) {
      return inputState(pinNumber);
    });
  interpreter.setProperty(scope, "digitalRead", wrapper);
}
