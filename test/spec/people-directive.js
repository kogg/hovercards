'use strict';

describe('people-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var scope;

    beforeEach(function(done) {
        require(['people-directive'], function() {
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

            element = angular.element('<div people="people" request="request" selected-person="selectedPerson"></div>');
            $compile(element)($rootScope);
            $rootScope.$digest();
            scope = element.isolateScope();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should two way bind people', function() {
        $rootScope.people = 'Out => In';
        $rootScope.$digest();
        expect(scope.people).to.equal('Out => In');

        scope.people = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.people).to.equal('In => Out');
    });

    it('should two way bind request', function() {
        $rootScope.request = 'Out => In';
        $rootScope.$digest();
        expect(scope.request).to.equal('Out => In');

        scope.request = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.request).to.equal('In => Out');
    });

    it('should two way bind selectedPerson', function() {
        $rootScope.selectedPerson = 'Out => In';
        $rootScope.$digest();
        expect(scope.selectedPerson).to.equal('Out => In');

        scope.selectedPerson = 'In => Out';
        $rootScope.$digest();
        expect($rootScope.selectedPerson).to.equal('In => Out');
    });

    describe('on request', function() {
        beforeEach(function() {
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/accounts?accounts%5B0%5D%5Btype%5D=some-account&accounts%5B0%5D%5Bid%5D=ACCOUNT_ID',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify([{ type: 'an-account',      id: 'AN_ID' },
                                                        { type: 'another-account', id: 'ANOTHER_ID' }])]);
        });

        it('should empty people', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.people = 'Something';
            $rootScope.$digest();
            $rootScope.request = [{ type: 'some-account', id: 'ACCOUNT_ID' }];
            $rootScope.$digest();

            expect($rootScope.people).to.be.an('array');
        });

        it('should unset people if null', function() {
            $rootScope.request = 'Something';
            $rootScope.$digest();
            $rootScope.people = 'Something';
            $rootScope.$digest();
            $rootScope.request = null;
            $rootScope.$digest();

            expect($rootScope.people).not.to.exist;
        });

        it('should initially set accounts to seperate people', function() {
            $rootScope.request = [{ type: 'some-account', id: 'ACCOUNT_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people[0]).to.have.property('accounts').that.deep.equals([{ type: 'an-account',      id: 'AN_ID' }]);
            expect($rootScope.people[1]).to.have.property('accounts').that.deep.equals([{ type: 'another-account', id: 'ANOTHER_ID' }]);
        });

        it('should initially set a selectedPerson to the first account', function() {
            $rootScope.request = [{ type: 'some-account', id: 'ACCOUNT_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.selectedPerson).to.equal($rootScope.people[0]);
        });

        it('should initially set a person\'s selectedAccount to the first account', function() {
            $rootScope.request = [{ type: 'some-account', id: 'ACCOUNT_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people[0]).to.have.property('selectedAccount').that.equals($rootScope.people[0].accounts[0]);
            expect($rootScope.people[1]).to.have.property('selectedAccount').that.equals($rootScope.people[1].accounts[0]);
        });
    });
});
