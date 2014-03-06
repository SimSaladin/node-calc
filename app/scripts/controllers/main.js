'use strict';

var nodeCalcApp = angular.module('nodeCalcApp');

nodeCalcApp.controller('MainCtrl', function ($scope, socket, $upload) {
  $scope.currentSheetName = "";
  $scope.currentSheet = {};
  $scope.otherUsers = [];
  $scope.notifications = [];
  $scope.result = "";

  function info(str) {
    $scope.notifications.push(str);
  }
  socket.on('notification', info);

  // Fileupload
  $scope.uploadFile = function ($files) {
    var file = $files[0];
    $scope.upload = $upload.upload({
      url: socketUrl + '/upload',
      data: {},
      file: file
    }).success(function(){ info("upload complete") });
    // XXX: for some reason the success callback is not launched
  }

  $scope.getCurrentCSV = function(){
    return $.csv.fromArrays($scope.currentSheet.values);
  }

  $scope.download = function(type, data, append) {
    var a = document.createElement('a');
    a.href = 'data:' + type + ',' + data.replace(/\n/g, '%0A');
    a.target = '_blank';
    a.download = $scope.currentSheetName + (append || '');
    document.body.appendChild(a);
    a.click();
  }

  $scope.export = function() {
    $scope.download('attachment/csv', $scope.getCurrentCSV());
  }

  $scope.exportResults = function() {
    $scope.download('attachment/text', $scope.results, '.txt');
  }

  $scope.save = function(data, callback) {
    if (!callback) callback = function(){};
    if (!data) data = {};
    data.csv = $scope.getCurrentCSV();
    $.post(socketUrl + '/save/' + $scope.currentSheetName, data, callback);
  }

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

  $scope.setSheet = function (sheet) {
    var sheet = $scope.nextSheet;
    if ($scope.currentSheetName !== sheet) {
      socket.emit('sheet:open', sheet);
    }
  }

  $scope.updateCursor = function(row, col) {
    var pos = { row : row, col : col };
    $scope.pos = pos;
    socket.emit("position", pos);
  }

  $scope.updateCurrentCell = function() {
    var pos = $scope.pos;
    var val = $scope.currentSheet.values[pos.row][pos.col];
    socket.emit("changevalue", { pos : pos, val : val });
  }

  socket.on('changevalue', function(data) {
    var pos = data.pos;
    $scope.currentSheet.values[pos.row][pos.col] = data.val;
  });

  socket.on('joined', function(sheet) {
    sheet.values = $.csv.toArrays(sheet.csv);
    $scope.currentSheet = sheet;
    $scope.currentSheetName = $scope.nextSheet;
  });

  socket.on('me', function (me) {
    $scope.me = me;
  });

  socket.on('users:all_users', function (users) {
    $scope.otherUsers = users.filter(function(x){return x.name!=$scope.me.name});
  });

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

  socket.on('sheet:sheet_listing', function (sheets) {
    $scope.sheets = sheets;
  });

  socket.emit('joined');

  // load sheet named first GET param key.
  var s = window.location.href.split("?")[1];
  if (s) {
    $scope.nextSheet = s.split("=")[0];
    $scope.setSheet();
  }

});
