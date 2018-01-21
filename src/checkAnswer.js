function init() {}

function isEqualScalarArray(a1, a2) {
  return a1.length==a2.length && a1.every(function(v,i) { 
    return v == a2[i]
  });
}

function checkAnswerHelper(answer, correct) {
  return answer.length == correct.length &&
    answer.every(function(v, i) { return isEqualScalarArray(v, correct[i]); });
}

export function checkAnswer(correct, runStates) {
  var n = runStates.length;
  if (n > 1 && isEqualScalarArray(runStates[n - 1], runStates[n - 2])) { 
    runStates.pop();
    n = n - 1;
  }
  var n2 = correct.states.length;
  if (n != n2 * correct.loops) {
    return false;
  }
  for (var i = 0; i < correct.loops; i++) {
    var x = runStates.slice(i * n2, (i + 1) * n2);
    var y = correct.states;
    if (!checkAnswerHelper(x, y)) {
      return false;
    }
  }
  return true;
}
