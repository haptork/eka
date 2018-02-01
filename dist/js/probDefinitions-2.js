var stages_2 = {
  "version": 0.1,
  "level": 1,
  "type": "Leds",
  "tags": ["commands", "repeat", "delay", "leds"],
  "description": "The initial stages built for the leds.",
  "finishMsg": "Now you understand the commands for setting pins high and low which thereby turn the Leds up and down. The delay is needed to sustain the high / low signal on a pin. Next you will create interesting patterns with the Leds and in the process observe the importance of variables and indexed / range loops.",
  "problems": [
     {
       "title":"Light Up",
       "statement":"Use blocks in the Program section to turn up all the three lights as shown above.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":"<xml><block type='digitalWrite'></block></xml>",
       "states": {"loops": 1, "states": [[1,1,1]]},
       "maxBlocks": 3
     },
     {
       "title":"Step Up",
       "statement":"Turn up the lights one by one.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":"<xml><block type='digitalWrite'></block><block type='delaySecs'></block></xml>",
       "states": {"loops": 1, "states": [[1,0,0],[1,1,0],[1,1,1]]},
       "maxBlocks": 12
     },
     {
       "title":"Blinky",
       "statement":"Toggle the red light on and off, continuosly.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":"<xml><block type='digitalWrite'></block><block type='delaySecs'></block><sep gap='50'></sep><block type='forever'></block></xml>",
       "states": {"loops": 3, "states": [[1,0,0],[0,0,0]]},
       "maxBlocks": 9
     },
     {
       "title":"Rivals",
       "statement":"Red up while green is down, then green up while red is down, continuously.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":"<xml><block type='digitalWrite'></block><block type='delaySecs'></block><sep gap='50'></sep><block type='forever'></block></xml>",
       "states": {"loops": 3, "states": [[1,0,0],[0,1,0]]},
       "maxBlocks": 7
     },
     {
       "title":"Stuck in the middle",
       "statement":"Green goes down, red & yellow are up, and vice versa.",
       "finishMsg": "Get ready for the next stage!",
       "toolbox":"<xml><block type='digitalWrite'></block><block type='delaySecs'></block><sep gap='50'></sep><block type='forever'></block></xml>",
       "states": {"loops": 3, "states": [[1,0,1],[0,1,0]]},
       "maxBlocks": 9
     }

  ]
};

