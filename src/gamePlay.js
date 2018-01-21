import {init as ledInit, initInterpreterLedSet} from './ledBlock.js';
import {init as delayInit, initInterpreterDelay} from './delayBlock.js';
import {init as foreverInit, initInterpreterCheckra} from './foreverBlock.js';
import {checkAnswer} from "./checkAnswer";
import Interpreter from 'js-interpreter';

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
  delayInit(mv.saveAndAppendRunState, resetBlockHighlights);
  foreverInit(checkra);
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

export function resetLed(mv) {
  applyLedState(mv, [0,0,0]); 
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
  resetLed(mv);
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
    mv.changeStatus(mv.status.running);
    runCode();
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
    applyLedState(mv, curStage[nState]); 
    runnerObj.previewRunner = setTimeout(previewStageHelper, delaySec * 1000,
                              curStage, nState + 1, loopCount);
  }

  function previewStage(isAgain) {
    resetAll(mv, workspace, runnerObj);
    mv.changeStatus(mv.status.previewing);
    runnerObj.previewRunner = setTimeout(function() {
    previewStageHelper(stages.problems[mv.curStage()].states.states, 0, stages.problems[mv.curStage()].states.loops, runnerObj.previewRunner);
    }, 700);
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
              checkra();
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
    initInterpreterDelay(interpreter, scope);
    initInterpreterLedSet(interpreter, scope);
    initInterpreterCheckra(interpreter, scope);
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

// assuming global variables
export function checkra() {
  if (checkAnswer(stages.problems[mv.curStage()].states, mv.model.runStates)) {
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
          mv.allClearMsg(stages.finishMsg);
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