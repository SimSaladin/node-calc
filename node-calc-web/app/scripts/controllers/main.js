'use strict';

var nodeCalcApp = angular.module('nodeCalcApp');

nodeCalcApp.controller('MainCtrl', function ($scope, socket, $upload) {

  $scope.currentSheetName = "";
  $scope.currentSheet = {};
  $scope.otherUsers = [];
  $scope.notifications = [];
  $scope.result = "";

  // Present an info block to user
  function info(str) {
    $scope.notifications.push(str);
  }

  // Upload some sheet to /upload
  $scope.uploadFile = function ($files) {
    var file = $files[0];
    $scope.upload = $upload.upload({
      url: socketUrl + '/upload',
      data: {},
      file: file
    }).success(function(){ info("upload complete") });
    // XXX: for some reason the success callback is not launched
  }

  // Return current CSV.
  $scope.getCurrentCSV = function(){
    return $.csv.fromArrays($scope.currentSheet.values);
  }

  // Helper to launch some download link.
  $scope.download = function(type, data, append) {
    var a = document.createElement('a');
    a.href = 'data:' + type + ',' + data.replace(/\n/g, '%0A');
    a.target = '_blank';
    a.download = $scope.currentSheetName + (append || '');
    document.body.appendChild(a);
    a.click();
  }

  // Export current sheet as CSV.
  $scope.export = function() {
    $scope.download('attachment/csv', $scope.getCurrentCSV());
  }

  // Assign browser to download current results.
  $scope.exportResults = function() {
    $scope.download('attachment/text', $scope.results, '.txt');
  }

  // Save the sheet server side.
  $scope.save = function(data, callback) {
    if (!callback) callback = function(){};
    if (!data) data = {};
    data.csv = $scope.getCurrentCSV();
    $.post(socketUrl + '/save/' + $scope.currentSheetName, data, callback);
  }

  // Calculate current values at server via hcalc.
  $scope.saveAndCalculate = function() {
    $scope.save({}, function(){
      $.get(socketUrl + '/calculate/' + $scope.currentSheetName, function(data) {
        console.log("got results");
        console.log(data);
        $scope.result = data;
        $scope.$apply();
      });
    });
  }

  // When user clicks to open a sheet, we sent the "sheet:open" event to server
  // which goes on to send us the sheet join notification.
  $scope.setSheet = function (sheet) {
    var sheet = $scope.nextSheet;
    if ($scope.currentSheetName !== sheet) {
      socket.emit('sheet:open', sheet);
    }
  }

  // Updates my current cursor position. 
  $scope.updateCursor = function(row, col) {
    var pos = { row : row, col : col };
    $scope.pos = pos;
    socket.emit("position", pos);
  }

  // This bound to onChange event in cells. It registers the change to the cell
  // and emits it to server, to be propagated along clients in same room.
  $scope.updateCurrentCell = function() {
    var pos = $scope.pos;
    var val = $scope.currentSheet.values[pos.row][pos.col];
    socket.emit("changevalue", { pos : pos, val : val });
  }

  // ----------------- socket.io listeners -------

  // When opening a sheet we call it joining (as in joining the sheet editing
  // room)
  socket.on('joined', function(sheet) {
    sheet.values = $.csv.toArrays(sheet.csv);
    $scope.currentSheet = sheet;
    $scope.currentSheetName = $scope.nextSheet;
  });

  // Assign my user data.
  socket.on('me', function (me) {
    $scope.me = me;
  });

  // When receiving a listing of all users.
  socket.on('users:all_users', function (users) {
    $scope.otherUsers = users.filter(function(x){return x.name!=$scope.me.name});
  });

  // When receiving a change to some cell, apply it.
  socket.on('changevalue', function(data) {
    var pos = data.pos;
    $scope.currentSheet.values[pos.row][pos.col] = data.val;
  });

  // when a user's properties change, update them. Properties include currently
  // the cursor position.
  socket.on('changeuser', function (props) {
    var uid, user;
    for (uid in $scope.otherUsers) {
      user = $scope.otherUsers[uid];
      if (user.name == props.name) {
        info(user.name + " -> (" + props.pos.col + ', ' + props.pos.row + ')');
        user.pos = props.pos;
      }
    }
  })

  // update the sheet listing
  socket.on('sheet:sheet_listing', function (sheets) {
    $scope.sheets = sheets;
  });

  // broadcast joining to teh app
  socket.emit('joined');

  // bind socket "notification" events to info blocks
  socket.on('notification', info);


  // ------------------------ Initialization ------

  // load sheet named first GET param key.
  var s = window.location.href.split("?")[1];
  if (s) {
    $scope.nextSheet = s.split("=")[0];
    $scope.setSheet();
  }

});
