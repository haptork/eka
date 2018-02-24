var stages_2 = {
  "version": 0.1,
  "level": 2,
  "type": "LedsButtons",
  "tags": ["logic", "if-else", "leds", "loop"],
  "description": "The stages for basic logic with leds and buttons.",
  "finishMsg": "Now you understand the basic logic structures.",
  "problems": [
     {
       "title":"Red Up and Get Down!",
       "statement":"Turn up the red light when button A is pressed and turn it down when it is not.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
          <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
        </xml>`,
       "states": {"loops": 1, "states": [[0,2,2], [0,2,2], [1,2,2],[1,2,2]]},
       "codegen": {"primary": 0, "avail": [true, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20
     },
     {
       "title":"And, It takes two to Tango!",
       "statement":"Turn up the red light only when both button A and button B are pressed.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
          <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation'></block>
        </xml>`,
       "states": {"loops": 1, "states": [[0,2,2], [0,2,2], [1,2,2],[0,2,2]]},
       "codegen": {"primary": 0, "avail": [true, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 6 
     },
     {
       "title":"Exclusive!",
       "statement":`Turn up the red light only when button A is pressed alone without button B
       being pressed.`,
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
          <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation'></block>
          <block type="logic_negate"></block>
        </xml>`,
       "states": {"loops": 1, "states": [[0,2,2], [0,2,2], [0,2,2],[1,2,2]]},
       "codegen": {"primary": 0, "avail": [true, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20
     },
     {
       "title":"This or That!",
       "statement":"Turn up the yellow light when any of the button A or button B is pressed.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
           <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation'></block>
          <block type="logic_negate"></block>
        </xml>`,
       "states": {"loops": 1, "states": [[2,2,0], [2,2,1], [2,2,1],[2,2,1]]},
       "codegen": {"primary": 0, "avail": [true, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 6 
     },
     {
       "title":"Go Green with text!",
       "statement":"Turn up the green light when button B is not pressed and turn it down when it is.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
          <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
        </xml>`,
       "states": {"loops": 1, "states": [[2,1,2], [2,0,2], [2,0,2],[2,1,2]]},
       "codegen": {"primary": 1, "avail": [false, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20
     },
     {
       "title":"Pairs!",
       "statement":`Turn up the red light only when button A is pressed and turn up the
       green only when button B is pressed.`,
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
           <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation'></block>
          <block type="logic_negate"></block>
        </xml>`,
       "states": {"loops": 1, "states": [[0,0,2], [0,1,2], [1,1,2],[1,0,2]]},
       "codegen": {"primary": 0, "avail": [true, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20
     },
     {
       "title":"Two Ifs make an Or!",
       "statement":"Turn up the yellow light when any of the button A or button B is pressed. Remember to turn it down when none of the buttons are pressed.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
            <block type="controls_if"></block>
            <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation' disabled='true'></block>
        </xml>`,
       "states": {"loops": 1, "states": [[2,2,0], [2,2,1], [2,2,1],[2,2,1]]},
       "codegen": {"primary": 0, "avail": [true, false]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20 
     },
     {
       "title":"All but green!",
       "statement":`Turn up all the lights if no buttons are pressed, 
                    turn down green only if button A is pressed.`,
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
             <block type="controls_if"> </block>
          <block type='logic_operation'></block>
          <block type="logic_negate"></block>
       </xml>`,
       "states": {"loops": 1, "states": [[1,1,1], [1,1,1], [1,0,1],[1,0,1]]},
       "codegen": {"primary": 1, "avail": [false, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 6
     },
     {
       "title":"One for all!",
       "statement":`Turn up the red light only when button A is pressed alone and turn up the
       green only when button B is pressed alone. If both the buttons are pressed then turn on yellow.`,
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
            <block type="controls_if"></block>
            <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation'></block>
        </xml>`,
       "states": {"loops": 1, "states": [[0,0,0], [0,1,0], [0,0,1],[1,0,0]]},
       "codegen": {"primary": 1, "avail": [true, true]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20
     },
     {
       "title":"If, if, it takes two to clap!",
       "statement":"Turn up the red light only when both button A and button B are pressed.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
             <block type="controls_if"> </block>
              <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
        <block type='logic_operation' disabled='true'></block>
        </xml>`,
       "states": {"loops": 1, "states": [[0,2,2], [0,2,2], [1,2,2],[0,2,2]]},
       "codegen": {"primary": 0, "avail": [true, false]},
       "transitions": "two_input_buttons",
       "maxBlocks": 20
     },
     {
       "title":"Nothing matters",
       "statement":"Turn up the red light when button A is pressed. It does not matter what states are there in any other input condition.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":`<xml>
          <block type='digitalWrite'></block> 
          <block type='digitalRead'></block> 
               <block type="controls_if">
            <mutation else="1"></mutation>
          </block>
          <block type='logic_operation'></block>
          <block type="logic_negate"></block>
     </xml>`, "states": {"loops": 1, "states": [[2,2,2], [2,2,2], [1,2,2],[1,2,2]]},
       "codegen": {"primary": 0, "avail": [true, false]},
       "transitions": "two_input_buttons",
       "maxBlocks": 1
     }
  ]
}

