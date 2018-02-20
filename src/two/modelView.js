// import '../node_modules/bootstrap/js/modal';

export var blocklyDivId;
export var blocklyMediaPath;
export var popButton;
export var popArea;
export var popClose;
export var blocklyContainer;
export var carousel;
export var resetButton;
export var optHead1;
export var optHead2;
export var inputBut0;
export var inputBut1;
var statusMsg;

export function init(stages) {
  blocklyDivId = 'blocklyDiv';
  blocklyMediaPath = '../node_modules/blockly/media/';
  popButton = $("#popButton");
  popArea = $("#popUp");
  popClose = $("#popClose");
  blocklyContainer = $("#blocklyContainer");
  carousel = $("#myCarousel");
  resetButton = $("#resety");
  optHead1 = $("#optHead1");
  optHead2 = $("#optHead2");
  statusMsg = $('#statusMsg');
  inputBut0 = $('#inputBut0');
  inputBut1 = $('#inputBut1');
  changeMode(modes.goal, true);
  initialLayout(stages);
}

export var modes = Object.freeze({"goal":0, "program":1});
export var status = Object.freeze({
  "init": 0,
  "reset": 1,
  "readyForRun": 2,
  "running": 3,
  "runStopped": 4,
  "readyForPreview": 5,
  "previewing": 6,
  "previewStopped": 7,
  "finish": 8,
  "checking": 9,
  "checkingDone": 10
});

export var logicStates = Object.freeze({
  "low": 0,
  "high": 1,
  "unknown": 2
});

export var model = {
 "curStatus": status.init,
 "curMode": modes.goal,
 "curLed" : [logicStates.unknown,logicStates.unknown,logicStates.unknown],
 "curStageIndex": 0,
 "runStates": [],
 "curButton" : 0
};

var buttonStates = [[0, 0], [0, 1], [1, 1], [1, 0]];

export function curLed(pinNum) {
  if (pinNum != null || pinNum != undefined) return model.curLed[pinNum];
  return model.curLed;
}

export function changeLed(pinNum, val) {
  if (curStatus() == status.running || curStatus() == status.checking) {
    model.runStates[model.runStates.length - 1][pinNum] = val;
  }
  if (curLed(pinNum) == val) return;
  model.curLed[pinNum] = val;
  if (val == 1) setOutputHigh(pinNum);
  else if(val == 0) setOutputLow(pinNum);
  else if(val ==2) setOutputConfused(pinNum);
}

// TODO: defualt for a new state can be -1, -1, -1
export function saveAndAppendRunState() {
  if (model.runStates.length == 0) model.runStates.push([[0, 0, 0]]); 
  else model.runStates.push(model.runStates[model.runStates.length - 1].slice()); 
}

export function resetRunState() {
  model.runStates = [[logicStates.unknown,logicStates.unknown,logicStates.unknown]]; 
}

export function setLed(pinNum, val) {
  changeLed(pinNum, val);
}

export function changeCurStage(index) {
  model.curStageIndex = index;
}

export function curStage() {
  return model.curStageIndex;
}

export function curMode() {
  return model.curMode;
}

export function curStatus() {
  return model.curStatus;
}

export function changeMode(_mode, forced = false) {
  if (_mode == model.curMode && forced == false) return;
  model.curMode = _mode; 
  if (_mode == 1) {
    $("#optHead1").removeClass("active");
    $("#optHead2").addClass("active");
  } else {
    $("#optHead1").addClass("active");
    $("#optHead2").removeClass("active");
  }
}

export function changeStatus(_status) {
  if (model.curStatus == status.reset) {
    $("#inputyy").removeClass("inputy-checked");
  }
  model.curStatus = _status;
  if (_status == status.readyForRun) {
    statusMsg.text("...");
  } else if (_status == status.running) {
    statusMsg.text("- Running");
  } else if (_status == status.runStopped) {
    statusMsg.text("");
  } else if (_status == status.paused) {
    statusMsg.text("");
  } else if (_status == status.previewStopped) {
    statusMsg.text("- Finished! Press reset ->");
  } else if (_status == status.previewing) {
    statusMsg.text("- Playing Goal");
  } else if (_status == status.reset) {
    statusMsg.text("- Reset");
    $("#inputyy").addClass("inputy-checked");//.removeClass("inputy");
  } else if (_status == status.finish) {
    statusMsg.text("");
  } else if (_status == status.checking) {
    statusMsg.text("");
  } else if (_status == status.checkingDone) {
    statusMsg.text("");
  } else {
    console.log("Error: Not all statuses are mapped properly: " + _status);
  }
}

export function setButton(butNo, highlow) {
  var st = buttonStates[model.curButton].slice();
  if (st[butNo] == highlow) return;
  st[butNo] = highlow;
  model.curButton = buttonStates.findIndex(function (elem) {
    return elem[0] == st[0] && elem[1] == st[1];
  });
  if (curStatus() == status.checking) return;
  var id = "#check" + butNo;
  // console.log(model.curButton);
  // console.log(buttonStates[model.curButton]);
  if (highlow) {
    $(id).addClass("inputy-checked");
  } else {
    $(id).removeClass("inputy-checked");
  }
}

export function setButtonState(i) {
  var st = buttonStates[i];
  setButton(0, st[0]);
  setButton(1, st[1]);
}

export function nextButtonState() {
  setButtonState((model.curButton + 1) % 4);
}

export function buttonVal(butNo) {
  return buttonStates[model.curButton][butNo];
}

export function setSourceCode(code) {
  $('#output').text(code);
}

function initialLayout(stages) {
  $("#myModal").modal({
    show: false
  });
  var nStages = stages.problems.length;
  var stageIndicators = $("#stageIndicators");
  var stageCards = $("#stageCards");
  var indi = $('<li/>', {
    'data-target': '#myCarousel'
  });
  var badge = $('<div/>', {
    class: 'success-label badge badge-success',
    text: 'Finished'
  });
  var prBut = $("<button/>", {
    class: "btn btn-sm",
    name: "preview",
    text: "Preview"
  });
  prBut.css('float','right');
  var crHead = $("<h3/>", {
    class: "card-header"
  });
  var crBlock = $("<div/>", {
    class: "card-block"
  });
  var crDiv = $("<div/>", {
    class: "card mb-3 bg-danger border-warning",
  });
  crDiv.css("margin", "0 40px 0 40px").css("padding-bottom", "20px");
  var parentDiv = $("<div/>", {
    class: "carousel-item"
  });
  for (var i = 0; i < nStages; ++i) {
    var a = indi.clone().attr("data-slide-to", i).text(i + 1);
    var b = badge.clone().attr("id", "successBadge-" + i);
    var c = crHead.clone().text(stages.problems[i].title)
      //c.append(prBut.clone());
    var d = crBlock.clone().text(stages.problems[i].statement);
    var e = parentDiv.clone();
    var f = crDiv.clone().attr("id", "stageCard-" + i);
    if (i == 0) {
      a.addClass("active");
      e.addClass("active");
    }
    stageIndicators.append(a);
    stageCards.append(
       e.append(
         f.append(b).append(c).append(d)
       )
    );
  }
}

function setOutputHigh(pinNum) {
  var dice = Math.random();
  $("#creature_" + pinNum).removeClass("mod-tall creature-box mod-sleepy " + 
      "mod-hyper mod-hungry mod-angry mod-sleepyPos mod-sleepyNeg");
  if (dice < 0.4) {
    $("#creature_" + pinNum).addClass("creature-box-focus " + 
                                         "mod-sleepy-focus mod-hyper");
  } else if (dice < 0.7){
    $("#creature_" + pinNum).addClass("creature-box-focus " + 
                                         "mod-sleepy-focus mod-hungry");
  } else {
    $("#creature_" + pinNum).addClass("creature-box-focus " + 
                                         "mod-sleepy-focus mod-angry");
  }
  $("#led_" + pinNum).removeClass("led-" + pinNum);
  $("#led_" + pinNum).addClass("led-" + pinNum + "-focus");
}

function setOutputLow(pinNum) {
  var dice = Math.random();
  $("#creature_" + pinNum).removeClass("mod-tall creature-box-focus " + 
        "mod-sleepy-focus mod-hyper mod-hungry mod-angry mod-sleepyPos mod-sleepyNeg");
  if (dice < 0.5) {
    $("#creature_" + pinNum).addClass("creature-box mod-sleepy mod-sleepyPos");
  } else {
    $("#creature_" + pinNum).addClass("creature-box mod-sleepy mod-sleepyNeg");
  }
  $("#led_" + pinNum).addClass("led-" + pinNum);
  $("#led_" + pinNum).removeClass("led-" + pinNum + "-focus");
}

function setOutputConfused(pinNum) {
  setOutputLow(pinNum);
  /*
  var dice = Math.random();
  if (dice < 0.5) {
    setOutputHigh(pinNum);
  } else {
    setOutputLow(pinNum);
  }
  */
  //$("#creature_" + pinNum).addClass("mod-tall");
}



export function setModalMsg(msg) {
  $("#myModal").find(".modal-body").text(msg);
  $("#myModal").modal("show");
}

export function onStageClear(curStage, callback) {
  $("#stageCard-" + curStage).removeClass("border-warning")
                                                .addClass("border-success");
  $("#successBadge-" + curStage).fadeIn("slow", callback);
}

export function onStageFailure(curStageIndex, callback) {
  $("#stageCard-" + curStageIndex).addClass("border-warning")
                                  .removeClass("border-success");
  $("#successBadge-" + curStageIndex).fadeOut("slow", callback);
}