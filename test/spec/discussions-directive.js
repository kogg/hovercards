'use strict';

describe('discussions-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['discussions-directive'], function() {
            done();
        });
    });
    beforeEach(module('app'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));
    beforeEach(function(done) {
        require(['angular'], function(angular) {
            sandbox.useFakeServer();

            element = angular.element('<div discussions="discussions" requests="requests" selected-index="selectedIndex"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on requests', function() {
        it('should empty discussions', function() {
            $rootScope.requests = ['Something'];
            $rootScope.$digest();
            $rootScope.discussions = 'Something';
            $rootScope.$digest();
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();

            expect($rootScope.discussions).to.be.an('array');
            expect($rootScope.discussions).to.be.empty;
        });

        it('should unset discussions if null', function() {
            $rootScope.requests = ['Something'];
            $rootScope.$digest();
            $rootScope.discussions = 'Something';
            $rootScope.$digest();
            $rootScope.requests = null;
            $rootScope.$digest();

            expect($rootScope.discussions).not.to.exist;
        });

        it('should set selectedIndex to -1', function() {
            $rootScope.requests = ['Something'];
            $rootScope.$digest();
            $rootScope.discussions = 'Something';
            $rootScope.$digest();
            $rootScope.requests = null;
            $rootScope.$digest();

            expect($rootScope.selectedIndex).to.equal(-1);
        });

        it('should set selectedIndex to 0 if requests is not null', function() {
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.selectedIndex).to.equal(0);
        });
    });

    describe('on selectedIndex', function() {
        beforeEach(function() {
            $rootScope.requests = [{ type: 'first-type',  id: 'first-id' },
                                   { type: 'second-type', id: 'second-id' },
                                   { type: 'third-type',  id: 'third-id' }];
            $rootScope.$digest();
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/first-type/first-id',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify('FIRST DISCUSSION')]);
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/second-type/second-id',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify('SECOND DISCUSSION')]);
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/third-type/third-id',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify('THIRD DISCUSSION')]);
        });

        it('should load first discussion when 0', function() {
            // Starts at 0;
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.discussions[0]).to.equal('FIRST DISCUSSION');
        });

        it('should load other discussions when n', function() {
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();
            $rootScope.selectedIndex = 1;
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.discussions[1]).to.equal('SECOND DISCUSSION');
        });

        it('should not load those between 0 & n', function() {
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();
            $rootScope.selectedIndex = 2;
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.discussions[1]).to.not.exist;
        });

        it('should not reload discussions', function() {
            // Starts at 0
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();
            $rootScope.selectedIndex = 1;
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/first-type/first-id',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify('FIRST DISCUSSION AGAIN')]);
            $rootScope.selectedIndex = 0;
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.discussions[0]).not.to.equal('FIRST DISCUSSION AGAIN');
        });
    });
});
