import {init as ledInit, initInterpreterLedSet} from '../blocks/ledBlock.js';
import {init as buttonInit} from '../blocks/buttonBlock.js';
import Interpreter from 'js-interpreter';
import Blockly from 'node-blockly/browser';

var stageCleared = [];
var myInterpreter = null; // TODO
var latestCode = ''; // TODO
var highlightPause;
var workspace;
var stages;
var nStages;
var mv;

export function init(_stages, _mv) {
  stages = _stages;
  mv = _mv;
  ledInit(mv.setLed);
  buttonInit(mv.buttonVal);
  workspace = setUpBlockly(stages, mv.blocklyDivId, mv.blocklyMediaPath);
  nStages = stages.problems.length;
  for (var i = 0; i < nStages; ++i) stageCleared.push(0); // TODO: look for fill
  var runner, previewRunner;
  setUpCallbacks(stages, workspace, mv, {runner, previewRunner});
}

export function applyLedState(mv, ar) {
  ar.forEach(function (ledVal, index) {
    mv.setLed(index, ledVal);
  });
}

export function resetLed(mv, st = mv.logicStates.unknown) {
  applyLedState(mv, [st, st, st]); 
}

function resetBlockHighlights() {
  workspace.highlightBlock(null);
  highlightPause = false;
}

// called either if blocks are changed or the run finishes.
function resetInterpreter() {
  myInterpreter = null;
}

function stopRuns(runnerObj) {
  if (runnerObj.runner != undefined && runnerObj.runner) {
    clearTimeout(runnerObj.runner);
    runnerObj.runner = null;
  }
  if (runnerObj.previewRunner) {
    clearTimeout(runnerObj.previewRunner);
    runnerObj.previewRunner = null;
  }
}

function resetAll(mv, workspace, runnerObj) {
  resetInterpreter();
  stopRuns(runnerObj);
  resetBlockHighlights();
  resetLed(mv);//, mv.logicStates.low);
}

function setUpRun(mv, workspace, runnerObj) {
  resetAll(mv, workspace, runnerObj);
  mv.changeStatus(mv.status.running); 
  Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  Blockly.JavaScript.addReservedWords('highlightBlock');
  latestCode = Blockly.JavaScript.workspaceToCode(workspace);
}

function tearDownRun(mv, workspace, runnerObj) {
  resetInterpreter();
  stopRuns(runnerObj);
  resetBlockHighlights();
  mv.changeStatus(mv.status.runStopped);
}

function setUpBlockly (stages, blocklyDivId, blocklyMediaPath, runnerObj) {
  workspace = Blockly.inject(blocklyDivId,
          {media: blocklyMediaPath,
           maxBlocks: stages.problems[0].maxBlocks,
           toolbox: stages.problems[0].toolbox});
  Blockly.JavaScript.addReservedWords('exit'); // TODO: why is it needed
  return workspace;
}

function setUpCallbacks(stages, workspace, mv, runnerObj) {
  workspace.addChangeListener(function(event) {
    mv.setSourceCode(Blockly.Python.workspaceToCode(workspace));
    if (!(event instanceof Blockly.Events.Ui)) {
      // Something changed. Parser needs to be reloaded.
      resetOnBlockChange();
    }
  });

  function autoRun() {
    stopRuns(runnerObj);
    var x = mv.model.curButton;
    quickCheck(cb);
    function cb(isEq) {
      successOrFail(isEq); // TODO
      mv.changeStatus(mv.status.running);
      mv.setButtonState(x);
      runCode();
    }
  }

  function quickCheck(cb) {
    // resetAll(mv, workspace, runnerObj);
    mv.changeStatus(mv.status.checking);
    rr(0);
    function rr(i) {
      if (i == 4) {
        mv.changeStatus(mv.status.checkingDone);
        cb(true);
      } else {
        mv.resetRunState();
        mv.setButtonState(i);
        latestCode = Blockly.JavaScript.workspaceToCode(workspace);
        if (!myInterpreter) {
          setTimeout(function() {
            // Begin execution
            highlightPause = false;
            myInterpreter = new Interpreter(latestCode, initApi);
            mv.changeMode(mv.modes.none);
            runnerObj.runner = function() {
              if (myInterpreter) {
                var hasMore = myInterpreter.run();
                if (hasMore) {
                  // Execution is currently blocked by some async call.
                  // Try again later.
                  setTimeout(runnerObj.runner, 10);
                } else {
                  // Program is complete.
                  let y = mv.model.runStates[0];
                  let z = stages.problems[mv.curStage()].states.states[i];
                  let isEq = ((z[0] == mv.logicStates.unknown || z[0] == y[0]) &&
                              (z[1] == mv.logicStates.unknown || z[1] == y[1]) &&
                              (z[2] == mv.logicStates.unknown || z[2] == y[2]));
                  /*
                  console.log(i);
                  console.log(mv.buttonVal(0));
                  console.log(y[0]);
                  console.log(z[0]);
                  console.log(isEq);
                  */
                  resetInterpreter();
                  stopRuns(runnerObj);
                  resetBlockHighlights();
                  if (isEq == true) {
                    rr(i + 1);
                    //console.log("+++");
                  } else {
                    cb(false); 
                    //console.log("---");
                  }
                }
              }
            };
            runnerObj.runner();
          }, 1);
        }
      }
    return;
  }
}

  // called initially and when code changes
  function resetOnBlockChange() {
    if (mv.curMode() == mv.modes.goal && workspace.getAllBlocks().length == 0) return;
    // curPlaying is preview when there is no block.
    resetAll(mv, workspace, runnerObj);
    mv.changeStatus(mv.status.readyForRun);    
    if (mv.curMode() == mv.modes.goal && workspace.getAllBlocks().length != 0) {
      mv.changeMode(mv.modes.program);
    }
    runnerObj.runner = setTimeout(autoRun, 1000);
    // Generate JavaScript code and parse it.
  }
 
  mv.inputBut0.mousedown(function() {
    if (mv.model.curButton < 2) {
      mv.setButton(0, 1);
    } else {
      mv.setButton(0, 0);
    }
    playCur();
  });

  mv.inputBut1.mousedown(function() {
    if (mv.model.curButton == 0 || mv.model.curButton == 3) {
      mv.setButton(1, 1);
    } else {
      mv.setButton(1, 0);
    }
    playCur();
  });


  mv.resetButton.mousedown(function() {
    mv.changeStatus(mv.status.reset);
    resetAll(mv, workspace, runnerObj);
  });

  mv.resetButton.mouseup(function() {
    playCur();
  });

  mv.optHead2.click(function() {
    mv.changeMode(mv.modes.program);
    resetAll(mv, workspace, runnerObj);
    playCur();
  });

  mv.optHead1.click(function() {
    mv.changeMode(mv.modes.goal);
    resetAll(mv, workspace, runnerObj);
    playCur();
  });

  function setUpCarosel(mv, workspace, runnerObj) {
    var replies = []; 
    for(var i = 0; i < nStages; ++i) replies.push(null); // TODO: look for fill
    mv.carousel.on("slide.bs.carousel", function(e) {
      resetAll(mv, workspace, runnerObj);
      mv.changeStatus(mv.status.finish);
      replies[mv.curStage()] = Blockly.Xml.workspaceToDom(workspace);
      workspace.clear();
      if (replies[e.to]) Blockly.Xml.domToWorkspace(replies[e.to], workspace);
      mv.changeCurStage(e.to);
      workspace.updateToolbox(stages.problems[e.to].toolbox);
      workspace.options.maxBlocks = stages.problems[e.to].maxBlocks;
      if (workspace.getAllBlocks().length == 0) {
        mv.changeMode(mv.modes.goal);
        mv.changeStatus(mv.status.previewing);
        playCur();
      } else {
        mv.changeMode(mv.modes.program);
        mv.changeStatus(mv.status.running);
      }
    });
  }
  setUpCarosel(mv, workspace, runnerObj);

  function previewStageHelper(curStage, nState, loopCount) {
    var delaySec = 1.1;
    if (nState == curStage.length) {
      if (loopCount == 1) {
        mv.changeStatus(mv.status.previewStopped);
        return;
      } else {
        nState = 0;
      }
    }
    // mv.nextButtonState();
    applyLedState(mv, curStage[nState]); 
    runnerObj.previewRunner = setTimeout(previewStageHelper, delaySec * 1000,
                              curStage, nState + 1, loopCount);
  }

  function previewStage(isAgain) {
    // mv.setButtonState(0);
    if (stages.problems[mv.curStage()].transitions == "two_input_buttons") {
      mv.changeStatus(mv.status.previewing);
      runnerObj.previewRunner = setTimeout(function(){
        applyLedState(mv, stages.problems[mv.curStage()].states.states[mv.model.curButton]);
      }, 300);
    } else {
      mv.changeStatus(mv.status.previewing);
      resetAll(mv, workspace, runnerObj);
      runnerObj.previewRunner = setTimeout(function() {
      previewStageHelper(stages.problems[mv.curStage()].states.states, 0, stages.problems[mv.curStage()].states.loops, runnerObj.previewRunner);
      }, 700);
    }
  }

  function playCur() {
    if (mv.curMode() == mv.modes.goal) {
      previewStage();
    }
    else {
      runCode();
    }
  }
  playCur();

  mv.popButton.click(popCode);
  mv.popClose.click(function() { popArea.hide(); });
  function popCode(event) {
    var x = mv.blocklyContainer.width() - mv.popArea.width()  - (mv.popButton.width());
    var y = 2 * mv.popButton.height();
    mv.popArea.css({left:x, top: y});
    mv.popArea.toggle();
  }

  function runCode(event) {
    if (runnerObj.runner) {
      resetAll(mv, workspace, runnerObj);
      mv.changeStatus(mv.status.runStopped);
      return;
    } else {
      setUpRun(mv, workspace, runnerObj);
    }
    mv.changeStatus(mv.status.running);
    mv.resetRunState();
    if (!myInterpreter) {
      setTimeout(function() {
        // Begin execution
        highlightPause = false;
        myInterpreter = new Interpreter(latestCode, initApi);
        mv.changeMode(mv.modes.program);
        runnerObj.runner = function() {
          if (myInterpreter) {
            var hasMore = myInterpreter.run();
            if (hasMore) {
              // Execution is currently blocked by some async call.
              // Try again later.
              setTimeout(runnerObj.runner, 10);
            } else {
              // Program is complete.
              tearDownRun(mv, workspace, runnerObj);
            }
          }
        };
        runnerObj.runner();
      }, 1);
      return;
    } else {
      //console.log("run code but not null interpreter");
    }
  }

  function initApi(interpreter, scope) {
    // Add an API for the functions in different blocks.
    initInterpreterLedSet(interpreter, scope);
    // Add an API function for highlighting blocks.
    var wrapper = function(id) {
      id = id ? id.toString() : '';
      return interpreter.createPrimitive(highlightBlock(id));
    };
    interpreter.setProperty(scope, 'highlightBlock',
        interpreter.createNativeFunction(wrapper));
  }

  highlightPause = false;

  function highlightBlock(id) {
    workspace.highlightBlock(id);
    highlightPause = true;
  }
}

function successOrFail(isEq) {
  if (isEq) {
    mv.changeStatus(mv.status.running);
    let cb = function() {
      var isMsgShow = false;
      if (stageCleared[mv.curStage()] == 0) {
        stageCleared[mv.curStage()] = 1;
        isMsgShow = true;
      }
      var firstUncleared;
      var allClear = true;
      stageCleared.some(function(item, index) {
        if (item == 0) {
          allClear = false;
          firstUncleared = index;
        }
        return item == 0;
      });
      if (isMsgShow) {
        if (allClear) {
          mv.setModalMsg(stages.finishMsg);
        } else {
          mv.setModalMsg(stages.problems[mv.curStage()].finishMsg);
          mv.carousel.carousel(firstUncleared);
        }
      }
    };
    mv.onStageClear(mv.curStage(), cb);
  } else {
    mv.onStageFailure(mv.curStage(), null);
    stageCleared[mv.curStage()] = 0;
  }
}