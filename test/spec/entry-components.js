describe('entry-components', function() {
    var sandbox = sinon.sandbox.create();
    var $rootScope;
    var $scope;
    var $controller;

    beforeEach(module(require('../../app/scripts/entry-components')));
    beforeEach(inject(function(_$controller_, _$rootScope_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
    }));
    beforeEach(function() {
        sandbox.useFakeTimers();
        sandbox.stub(window, 'addEventListener');

        $scope = $rootScope.$new();
        $controller('EntryController', { $scope: $scope });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on load', function() {
        it('should empty entry', function() {
            $scope.entry = 'Something';
            window.addEventListener.yield({ data: { msg: 'load', url: 'URL' } });

            expect($scope.entry).not.to.exist;
        });
    });

    describe('on hide', function() {
        it('should empty entry', function() {
            $scope.entry = 'Something';
            $scope.$digest();
            window.addEventListener.yield({ data: { msg: 'hide' } });
            $scope.$digest();

            expect($scope.entry).not.to.exist;
        });
    });
});
