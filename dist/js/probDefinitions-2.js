var stages_2 = {
  "version": 0.1,
  "level": 2,
  "type": "LedsButtons",
  "tags": ["logic", "if-else", "leds", "loop"],
  "description": "The stages for basic logic with leds and buttons.",
  "finishMsg": "Now you understand the basic logic structures.",
  "problems": [
     {
       "title":"Intro",
       "statement":"Turn up the red light when button A is pressed and turn it down when it is not.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":"<xml><block type='digitalWrite'></block> <block type='digitalRead'></block> <block type='controls_if'></block><block type='logic_operation'></block><block type='logic_negate'></block></xml>",
       "states": {"loops": 1, "states": [[0,0,0], [0,0,0], [1,0,0],[1,0,0]]},
       "maxBlocks": 20
     }
  ]
}

