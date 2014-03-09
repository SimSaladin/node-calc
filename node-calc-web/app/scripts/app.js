'use strict';

var socketUrl = 'http://node-calc-server.herokuapp.com:80';

var app = angular.module('nodeCalcApp', [ 'angularFileUpload', 'ngRoute' ]);

app.factory('socket', function ($rootScope) {
  var socket = io.connect(socketUrl);
  return {
    url: socketUrl,

    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});

app.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  })
.otherwise({ redirectTo: '/' });
});
