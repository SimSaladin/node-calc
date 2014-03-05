'use strict';

var nodeCalcApp = angular.module('nodeCalcApp');

nodeCalcApp.controller('MainCtrl', function ($scope, socket) {
  $scope.sheet = {};
  $scope.otherUsers = [];
  $scope.me = "?";

  socket.on('me', function (me) {
    $scope.me = me;
  });

  socket.on('users:all_users', function (users) {
    $scope.otherUsers = users;
  });

  socket.on('sheet:rewrite_sheet', function (sheet) {
    $scope.sheet = sheet;
  });

  socket.on('debug', function(data) {
    console.log(data);
  });

  socket.emit('joined');
});
