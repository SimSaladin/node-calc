'use strict';

var socketUrl = 'http://127.0.0.1:3000';

var app = angular.module('nodeCalcApp',
    [ 'angularFileUpload', 'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute' ]);

app.factory('socket', function ($rootScope) {
  var socket = io.connect(socketUrl);
  return {
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
    .otherwise({
      redirectTo: '/'
    });
});
