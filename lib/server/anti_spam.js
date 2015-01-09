var spamData = new Object();
var spamFunctionsToCheck = ["hood message"];
var maxSpam = 9;

var maxSpamCheck = function (socket) {
  if (spamData[socket.id].spamScore >= maxSpam && !socket.spamViolated) {
    socket.spamViolated = true;
    socket.disconnect();
  }
}

var checkSpam = function () {
  Object.keys(spamData).forEach(function (socket_id) { 
    var user = spamData[socket_id];
    if (user.spamScore >= 1) user.spamScore -= 3;
  });
  return;
}

var addSpam = function (socket) {
  if(socket.spamViolated) return;
  spamData[socket.id].spamScore += 1;
  maxSpamCheck(socket);
}

var spamAuthenticate = function (socket) {
  socket.spamViolated = false;
  spamData[socket.id] = { spamScore: 0 };
}

module.exports = {
  spamAuthenticate: spamAuthenticate,
  spamFunctionsToCheck: spamFunctionsToCheck,
  addSpam: addSpam
}

Array.prototype.contains = function(k) {
  for (var p in this)
    if (this[p] === k) { return true; }
  return false;
};

setInterval(checkSpam, 3000);
