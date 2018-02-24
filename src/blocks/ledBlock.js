import Blockly from 'node-blockly/browser';
export default {init, initInterpreterLedSet};

var setLed;

export function init(_setLed) {
  setLed = _setLed;

  Blockly.Blocks.digitalWrite = {
    init: function() {
      this.jsonInit({
        "message0": 'set %1 to %2',
        "args0": [
          {
            "type": "field_dropdown",
            "name": "pinNumber",
            "options": [
              ["0-Red","0"],
              ["1-Green","1"],
              ["2-Yellow","2"]
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
        "previousStatement": null,
        "nextStatement": null,
        "colour": 260,
        "tooltip": "Lights up an LED",
        "helpUrl": ""
      });
    }
  };

  var rmap = {0:"red", 1:"green", 2:"yellow"};
  
  Blockly.JavaScript.digitalWrite = function(block) {
    var pinNumber = block.getFieldValue('pinNumber');
    var highlow = block.getFieldValue('highlow');
    var code = "digitalWrite(" + rmap[pinNumber] + ", " + highlow + ");\n";
    return code;
  };
  
  Blockly.Python.digitalWrite = function(block) {
    var pinNumber = block.getFieldValue('pinNumber');
    var highlow = block.getFieldValue('highlow');
    var code = "digitalWrite(" + (parseInt(pinNumber) + 3)+ ", " + highlow +");\n";
    return code;
  };
}

export function initInterpreterLedSet(interpreter, scope) {
  Blockly.JavaScript.addReservedWords('digitalWrite');
  var wrapper = interpreter.createNativeFunction (
    function(pinNumber, highlow) {
      setLed(pinNumber, highlow);
    });
  interpreter.setProperty(scope, "digitalWrite", wrapper);
}