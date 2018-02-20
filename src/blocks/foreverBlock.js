import Blockly from 'node-blockly/browser';

var checker;

export function init(_Blockly, _checker) {
  checker = _checker;
  Blockly.Blocks.forever = {
    init: function() {
      this.jsonInit({
        "type": "block_type",
        "message0": "loop %1",
        "args0": [{
          "type": "input_statement",
          "name": "do"
        }],
        "previousStatement": null,
        "colour": 130,//"%{BKY_LOOPS_HUE}",
        "tooltip": "Loops the statements forever",
        "helpUrl": ""
      });
    }
  };
  
  Blockly.JavaScript.forever = function(block) {
    var statements_do = Blockly.JavaScript.statementToCode(block, 'do');
    var code = 'var i = 4;\n while(true) {\n' + statements_do + '\nif (i > 1) i--; if (i == 1) {checker(); i = 0;} if (i == 0) waitForSeconds(0.001);}\n'; // TODO 3 magic
    return code;
  };
  
  Blockly.Python.forever = function(block) {
    var statements_do = Blockly.Python.statementToCode(block, 'do');
    var code = 'while(true):\n' + statements_do + '\n';
    return code;
  };
}

export function initInterpreterCheckra(interpreter, scope) {
  Blockly.JavaScript.addReservedWords('checker');
  var wrapper = interpreter.createNativeFunction(function(){
    checker();
  });
  interpreter.setProperty(scope, 'checker', wrapper);
}
