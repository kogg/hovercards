'use strict';

describe('sidebar', function() {
    var $controller;

    beforeEach(function(done) {
        require(['cards-controller'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$controller_) {
        $controller = _$controller_;
    }));

    it('should have a test', function() {
        var $scope = {};
        $controller('CardsController', { $scope: $scope });
    });
});
