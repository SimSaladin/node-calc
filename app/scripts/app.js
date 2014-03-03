'use strict';

var socket_url = 'http://127.0.0.1:3000';

var app = angular.module('nodeCalcApp',
    [ 'ngCookies', 'ngResource', 'ngSanitize', 'ngRoute' ]);

app.factory('socket', function ($rootScope) {
  var socket = io.connect(socket_url);
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
      })
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


// Launch (the missiles!)
// socket.emit('ready');
