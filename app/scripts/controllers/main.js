'use strict';

var nodeCalcApp = angular.module('nodeCalcApp');

nodeCalcApp.controller('MainCtrl', function ($scope, socket) {

  socket.on('sheet:rewrite_sheet', function (sheet) {
    $scope.columns = sheet;
  }
  $scope.columns = [];
});
