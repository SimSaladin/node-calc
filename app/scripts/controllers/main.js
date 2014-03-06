'use strict';

var nodeCalcApp = angular.module('nodeCalcApp');

nodeCalcApp.controller('MainCtrl', function ($scope, socket, $upload) {
  $scope.currentSheetName = "";
  $scope.currentSheet = {};
  $scope.otherUsers = [];
  $scope.me = "?";
  $scope.notifications = [];

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

  socket.on('joined', function(sheet) {
    $scope.currentSheetName = $scope.nextSheet;
    $scope.currentSheet = sheet;
    console.log(sheet);
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

  socket.on('sheet:new_sheet', function (sheet) {
    $scope.sheet = sheet;
  });

  socket.on('debug', function(data) {
    $scope.notifications.push("DEBUG: " + notif);
  });

  socket.on('notification', function(notif) {
    $scope.notifications.push(notif);
  });

  socket.emit('joined');
});
