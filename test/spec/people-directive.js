describe('people-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;

    beforeEach(module(require('../../app/scripts/people-components')));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $rootScope.entry = {};
    }));
    beforeEach(function() {
        sandbox.useFakeServer();

        element = angular.element('<div ng-controller=PeopleController></div>');
        $compile(element)($rootScope);
        $rootScope.$digest();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on requests', function() {
        beforeEach(function() {
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/first-account/FIRST_ID',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify([{ type: 'first-account',  id: 'FIRST_ID' },
                                                        { type: 'second-account', id: 'SECOND_ID' }])]);
        });

        it('should empty people', function() {
            $rootScope.requests = ['Something'];
            $rootScope.$digest();
            $rootScope.people = 'Something';
            $rootScope.$digest();
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();

            expect($rootScope.people).to.be.an('array');
            expect($rootScope.people).to.be.empty;
        });

        it('should unset people if null', function() {
            $rootScope.requests = ['Something'];
            $rootScope.$digest();
            $rootScope.people = 'Something';
            $rootScope.$digest();
            $rootScope.requests = null;
            $rootScope.$digest();

            expect($rootScope.people).not.to.exist;
        });

        it('should set selectedIndex to -1', function() {
            $rootScope.requests = ['Something'];
            $rootScope.$digest();
            $rootScope.people = 'Something';
            $rootScope.$digest();
            $rootScope.requests = null;
            $rootScope.$digest();

            expect($rootScope.selectedIndex).to.equal(-1);
        });

        it('should set selectedIndex to 0 if requests is not empty', function() {
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.selectedIndex).to.equal(0);
        });

        it('should set accounts to seperate people', function() {
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people).to.have.length(2);
            expect($rootScope.people[0].accounts).to.contain({ type: 'first-account',  id: 'FIRST_ID' });
            expect($rootScope.people[1].accounts).to.contain({ type: 'second-account', id: 'SECOND_ID' });
        });

        it('should set each person\'s selectedAccount to one of their accounts', function() {
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people[0].accounts).to.contain($rootScope.people[0].selectedAccount);
            expect($rootScope.people[1].accounts).to.contain($rootScope.people[1].selectedAccount);
        });

        it('should add accounts into a person who lists them', function() {
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/first-account/FIRST_ID',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify([{ type: 'first-account',  id: 'FIRST_ID', connected: [{ type: 'second-account', id: 'SECOND_ID' },
                                                                                                              { type: 'third-account',  id: 'THIRD_ID' }] },
                                                        { type: 'second-account', id: 'SECOND_ID' },
                                                        { type: 'third-account',  id: 'THIRD_ID' }])]);
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people).to.have.length(1);
            expect($rootScope.people[0].accounts).to.contain({ type: 'first-account',  id: 'FIRST_ID', connected: [{ type: 'second-account', id: 'SECOND_ID' }, { type: 'third-account',  id: 'THIRD_ID' }] });
            expect($rootScope.people[0].accounts).to.contain({ type: 'second-account', id: 'SECOND_ID' });
            expect($rootScope.people[0].accounts).to.contain({ type: 'third-account',  id: 'THIRD_ID' });
        });

        it('should merge people when an account references their accounts', function() {
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/first-account/FIRST_ID',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify([{ type: 'first-account',  id: 'FIRST_ID' },
                                                        { type: 'second-account', id: 'SECOND_ID' },
                                                        { type: 'third-account',  id: 'THIRD_ID', connected: [{ type: 'first-account',  id: 'FIRST_ID' },
                                                                                                              { type: 'second-account', id: 'SECOND_ID' }] }])]);
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people).to.have.length(1);
            expect($rootScope.people[0].accounts).to.contain({ type: 'first-account',  id: 'FIRST_ID' });
            expect($rootScope.people[0].accounts).to.contain({ type: 'second-account', id: 'SECOND_ID' });
            expect($rootScope.people[0].accounts).to.contain({ type: 'third-account',  id: 'THIRD_ID', connected: [{ type: 'first-account',  id: 'FIRST_ID' }, { type: 'second-account', id: 'SECOND_ID' }] });
        });

        it('should merge people who reference the same account', function() {
            sandbox.server.respondWith('GET', 'https://hovercards.herokuapp.com/v1/first-account/FIRST_ID',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify([{ type: 'first-account',  id: 'FIRST_ID',  connected: [{ type: 'third-account',  id: 'THIRD_ID' }] },
                                                        { type: 'second-account', id: 'SECOND_ID', connected: [{ type: 'third-account',  id: 'THIRD_ID' }] }])]);
            $rootScope.requests = [{ type: 'first-account', id: 'FIRST_ID' }];
            $rootScope.$digest();
            sandbox.server.respond();
            $rootScope.$digest();

            expect($rootScope.people).to.have.length(1);
            expect($rootScope.people[0].accounts).to.contain({ type: 'first-account',  id: 'FIRST_ID',  connected: [{ type: 'third-account',  id: 'THIRD_ID' }] });
            expect($rootScope.people[0].accounts).to.contain({ type: 'second-account', id: 'SECOND_ID', connected: [{ type: 'third-account',  id: 'THIRD_ID' }] });
        });
    });
});
