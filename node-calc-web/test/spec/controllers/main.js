'use strict';

describe('Controller: MainCtrl', function () {

  var MainCtrl, scope;

  // load the controller's module
  beforeEach(module('nodeCalcApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {

    scope = $rootScope.$new();

    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
    });
  }));

  it('uploadFile() should be false', function () {
    expect(scope.uploadFile()).toBe(false);
  });

  it('should add into notifications on info()', function () {
    scope.info('Testi');
    expect(scope.notifications).toEqual(['Testi']);
  });

  it('getCurrentCSV should be defined', function () {
    expect(scope.getCurrentCSV).toBeDefined();
  });

  it('updateCursor should work', function () {
    expect(scope.updateCursor(0, 0)).not.toBeDefined();
  });

  it('download should do something', function () {
    expect(scope.download('attachment/csv', '')).not.toBeDefined();
  });

});
