import {init as ledInit, initInterpreterLedSet} from '../blocks/ledBlock.js';
import {init as buttonInit, initInterpreterButtonCheck} from '../blocks/buttonBlock.js';
import Interpreter from 'js-interpreter';
import Blockly from 'node-blockly/browser';
import CodeMirror from 'codemirror';

var stageCleared = [];
var myInterpreter = null; // TODO
var latestCode = ''; // TODO
var workspace;
var codespace;
var stages;
var nStages;
var mv;
var isBlocklyLoaded = true;

export function init(_stages, _mv) {
  stages = _stages;
  mv = _mv;
  ledInit(mv.setLed);
  buttonInit(mv.buttonVal);
  workspace = setUpBlockly(stages, mv.blocklyDivId, mv.blocklyMediaPath);
  codespace = CodeMirror(mv.codeDiv, {
    mode:  'javascript'
  });
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
  resetLed(mv);//, mv.logicStates.low);
}

function addToCode(code) {
  return "var red = 0;\nvar green = 1;\nvar yellow = 2;\nvar buttonA = 0;\nvar buttonB = 1;\n" + code;
}

function cookCode(mv, workspace) {
  var x;
  if (mv.codeGen() == mv.CodeGen.blockly) {
    x = Blockly.JavaScript.workspaceToCode(workspace);
  } else {
    x = codespace.getValue();
  }
  return x;
}

function setUpRun(mv, workspace, runnerObj) {
  resetAll(mv, workspace, runnerObj);
  mv.changeStatus(mv.status.running); 
  latestCode = cookCode(mv, workspace);
}

function tearDownRun(mv, workspace, runnerObj) {
  resetInterpreter();
  stopRuns(runnerObj);
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
    mv.setSourceCode(Blockly.JavaScript.workspaceToCode(workspace));
    if (!(event instanceof Blockly.Events.Ui)) {
      // Something changed. Parser needs to be reloaded.
      resetOnBlockChange();
    }
  });
  codespace.on("change", function(event) {
    mv.setSourceCode(codespace.getValue());
    resetOnBlockChange();
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
        latestCode = cookCode(mv, workspace);
        if (!myInterpreter) {
          setTimeout(function() {
            // Begin execution
            myInterpreter = new Interpreter(addToCode(latestCode), initApi);
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
    var thereIsCode = mv.codeGen() == mv.CodeGen.blockly ? workspace.getAllBlocks().length > 0
                                                         : codespace.getValue().length > 0;
    if (mv.curMode() == mv.modes.goal && !thereIsCode) return;
    // curPlaying is preview when there is no block.
    resetAll(mv, workspace, runnerObj);
    mv.changeStatus(mv.status.readyForRun);    
    if (mv.curMode() == mv.modes.goal && thereIsCode) {
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

  var replies = []; 
  mv.blocklyTab.click(function(){
    mv.setCodeGen(mv.CodeGen.blockly);
    if (!isBlocklyLoaded) {
      isBlocklyLoaded = true;
      workspace.updateToolbox(stages.problems[mv.curStage()].toolbox);
      if (replies[mv.curStage()] && replies[mv.curStage()][1]) {
        Blockly.Xml.domToWorkspace(replies[mv.curStage()][1], workspace);
      } else if(stages.problems[mv.curStage()].defaultBlocks) {
        Blockly.Xml.domToWorkspace(replies[mv.curStage()][1], workspace);
      }
    }
    mv.setSourceCode(Blockly.JavaScript.workspaceToCode(workspace));
    resetOnBlockChange();
  });
  
  mv.textTab.click(function(){
    mv.setCodeGen(mv.CodeGen.code);
    mv.setSourceCode(codespace.getValue());
    resetOnBlockChange();
  });


  function setUpCarosel(mv, workspace, runnerObj) {
    for(var i = 0; i < nStages; ++i) replies.push(null); // TODO: look for fill
    mv.carousel.on("slide.bs.carousel", function(e) {
      mv.changeStatus(mv.status.reset);
      resetAll(mv, workspace, runnerObj);
      mv.changeStatus(mv.status.finish);
      replies[mv.curStage()] = [mv.codeGen(), Blockly.Xml.workspaceToDom(workspace),
                                codespace.getValue()];
      workspace.clear();
      codespace.setValue(''); 
      mv.changeCurStage(e.to, stages);
      if (replies[e.to]) {
        mv.setCodeGen(replies[e.to][0]);
        isBlocklyLoaded = (mv.codeGen() == mv.CodeGen.blockly);
        if (replies[e.to][1] && isBlocklyLoaded) Blockly.Xml.domToWorkspace(replies[e.to][1], workspace);
        if (replies[e.to][2]) codespace.setValue(replies[e.to][2], workspace);
      } else {
        // load from stages default
        mv.setCodeGen(stages.problems[e.to].codegen.primary);
        isBlocklyLoaded = (mv.codeGen() == mv.CodeGen.blockly);
        if (stages.problems[e.to].defaultBlocks && isBlocklyLoaded) Blockly.Xml.domToWorkspace(stages.problems[e.to].defaultBlocks);
        if (stages.problems[e.to].defaultCode) codespace.setValue(stages.problems[e.to].defaultCode);
      }
      if (isBlocklyLoaded) workspace.updateToolbox(stages.problems[e.to].toolbox);
      workspace.options.maxBlocks = stages.problems[e.to].maxBlocks;
      var thereIsCode = (mv.codeGen() == mv.CodeGen.blockly) ? workspace.getAllBlocks().length > 0
                                                             : codespace.getValue().length > 0;
      if (thereIsCode) {
        mv.changeMode(mv.modes.program);
        //mv.changeStatus(mv.status.running);
      } else {
        mv.changeMode(mv.modes.goal);
        mv.changeStatus(mv.status.previewing);
        playCur();
      }
    });
  }
  setUpCarosel(mv, workspace, runnerObj);
        // load from stages default
        if (stages.problems[0].defaultBlocks) Blockly.Xml.domToWorkspace(stages.problems[e.to].defaultBlocks);
        if (stages.problems[0].defaultCode) codespace.setValue(stages.problems[e.to].defaultCode);
        mv.setCodeGen(stages.problems[0].codegen.primary);


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
    mv.changeStatus(mv.status.previewing);
    runnerObj.previewRunner = setTimeout(function(){
      applyLedState(mv, stages.problems[mv.curStage()].states.states[mv.model.curButton]);
    }, 300);
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
        myInterpreter = new Interpreter(addToCode(latestCode), initApi);
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
    initInterpreterButtonCheck(interpreter, scope);
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
          mv.setModalMsg(stages.problems[mv.curStage()].finishMsg, latestCode);
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