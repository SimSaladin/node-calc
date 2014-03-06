'use strict';

var nodeCalcApp = angular.module('nodeCalcApp');

nodeCalcApp.controller('MainCtrl', function ($scope, socket, $upload) {
  $scope.currentSheetName = "";
  $scope.currentSheet = {};
  $scope.otherUsers = [];
  $scope.me = "?";
  $scope.notifications = [];
  $scope.intermediate = { cell : undefined };

  // Fileupload
  $scope.uploadFile = function ($files) {
    var file = $files[0];
    $scope.upload = $upload.upload({
      url: socketUrl + '/upload',
      data: {},
      file: file
    }).progress(function(evt) {
      console.log( parseInt(100.0 * evt.loaded / evt.total) );
    }).success(function(data, status, headers, config) {
      console.log(data);
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

  socket.on('sheet:sheet_listing', function (sheets) {
    $scope.sheets = sheets;
  });

  socket.on('debug', function(data) {
    $scope.notifications.push("DEBUG: " + notif);
  });

  socket.on('notification', function(notif) {
    $scope.notifications.push(notif);
  });

  socket.emit('joined');

  // load sheet named first GET param key.
  var s = window.location.href.split("?")[1];
  if (s) {
    $scope.nextSheet = s.split("=")[0];
    $scope.setSheet();
  }

});
