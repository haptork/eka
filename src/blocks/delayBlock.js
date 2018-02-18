var saveAndAppendRunState;
var resetBlockHighlights;

export default {init, initInterpreterDelay};

export function init(_saveAndAppendRunState, _resetBlockHighlights) {
  saveAndAppendRunState = _saveAndAppendRunState;
  resetBlockHighlights = _resetBlockHighlights; 
  Blockly.Blocks.delaySecs = {
    init: function () {
      this.jsonInit({
        "type": "delaySecs",
        "message0": " wait %1 seconds",
        "args0": [{
          "type": "field_number",
          "name": "SECONDS",
          "min": 0,
          "max": 600,
          "value": 1
        }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "230"
      });
    }
  };

  Blockly.JavaScript.delaySecs = function(block) {
    var seconds = Number(block.getFieldValue('SECONDS'));
    var code = 'waitForSeconds(' + seconds + ');\n';
    return code;
  };

  Blockly.Python.delaySecs = function(block) {
    var time = block.getFieldValue('SECONDS');
    return "delay(" + time * 1000 + ");\n";
  };
}

export function initInterpreterDelay(interpreter, scope) {
  // Ensure function name does not conflict with variable names.
  Blockly.JavaScript.addReservedWords('waitForSeconds');
  var wrapper = interpreter.createAsyncFunction(
    function(timeInSeconds, callback) {
      if (timeInSeconds > 0.01) { // TODO hack so that infinite loops don't hang
        saveAndAppendRunState();
      } else {
        resetBlockHighlights();
      }
      setTimeout(callback, timeInSeconds * 1000);
    });
  interpreter.setProperty(scope, 'waitForSeconds', wrapper);
}