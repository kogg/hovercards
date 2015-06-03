describe('people-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;
    var $timeout;

    beforeEach(module(require('../../app/scripts/people-components')));
    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $rootScope.entry = {};
        $rootScope.data = {};
    }));
    beforeEach(function() {
        element = angular.element('<div ng-controller=PeopleController></div>');
        $compile(element)($rootScope);
        $rootScope.$digest();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('loading accounts', function() {
        beforeEach(function() {
            $rootScope.can_have_people = true;
            $rootScope.entry.accounts = [];
            sandbox.stub(chrome.runtime, 'sendMessage');
        });

        it('should load account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            expect($rootScope.data).to.have.property('accounts').that.has.property('first-api/account/FIRST_ID');
            expect($rootScope.data.accounts['first-api/account/FIRST_ID']).not.to.have.property('$resolved');
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID', key: 'value' }]);
            $rootScope.$digest();
            expect($rootScope.data.accounts['first-api/account/FIRST_ID']).to.have.property('$resolved', true);
            expect($rootScope.data.accounts['first-api/account/FIRST_ID']).to.have.property('key', 'value');
        });

        it('should not load the same account twice', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID', key: 'value' }]);
            $rootScope.$digest();
            expect($rootScope.data.accounts['first-api/account/FIRST_ID']).to.have.property('$resolved', true);
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            expect($rootScope.data.accounts['first-api/account/FIRST_ID']).to.have.property('$resolved', true);
        });

        it('should load accounts that are connected', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID',
                                connected: [{ api: 'second-api', type: 'account', id: 'SECOND_ID' },
                                            { api: 'third-api',  type: 'account', id: 'THIRD_ID' }] }]);
            $rootScope.$digest();
            expect($rootScope.data).to.have.property('accounts').that.has.property('second-api/account/SECOND_ID');
            expect($rootScope.data).to.have.property('accounts').that.has.property('third-api/account/THIRD_ID');
        });
    });

    describe('constructing people', function() {
        beforeEach(function() {
            $rootScope.can_have_people = true;
            $rootScope.entry.accounts = [];
            sandbox.stub(chrome.runtime, 'sendMessage');
        });

        it('should use accounts to make people', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ api: 'second-api', type: 'account', id: 'SECOND_ID' })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(2);

            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID']);

            expect($rootScope.data.people[1])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['second-api/account/SECOND_ID']);
            expect($rootScope.data.people[1])
                .to.have.property('selectedAccount', $rootScope.data.accounts['second-api/account/SECOND_ID']);
        });

        it('should set timeout error until we get an account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(0)
                    .and.not.to.have.property('$err');

            $timeout.flush(5000);

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(0)
                    .and.to.have.property('$err')
                        .to.have.property('still-waiting', true);

            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1)
                    .and.not.to.have.property('$err');
            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID']);
        });

        it('should set error until we get an account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.entry.accounts.push({ api: 'third-api', type: 'account', id: 'THIRD_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([{ status: 400 }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(0)
                    .and.to.have.property('$err');

            chrome.runtime.sendMessage
                .withArgs({ api: 'second-api', type: 'account', id: 'SECOND_ID' })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1)
                    .and.not.to.have.property('$err');

            chrome.runtime.sendMessage
                .withArgs({ api: 'third-api', type: 'account', id: 'THIRD_ID' })
                .yield([{ status: 400 }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1)
                    .and.not.to.have.property('$err');
        });

        it('should sort people by the accounts order, not the order they loaded', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'second-api', type: 'account', id: 'SECOND_ID' })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID']);

            expect($rootScope.data.people[1])
                .to.have.property('selectedAccount', $rootScope.data.accounts['second-api/account/SECOND_ID']);
        });

        it('should merge people that are connected to a new account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.entry.accounts.push({ api: 'third-api', type: 'account', id: 'THIRD_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID',
                                connected: [{ api: 'third-api', type: 'account', id: 'THIRD_ID' }] }]);
            chrome.runtime.sendMessage
                .withArgs({ api: 'second-api', type: 'account', id: 'SECOND_ID' })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID',
                                connected: [{ api: 'third-api', type: 'account', id: 'THIRD_ID' }] }]);
            chrome.runtime.sendMessage
                .withArgs({ api: 'third-api', type: 'account', id: 'THIRD_ID' })
                .yield([null, { api: 'third-api', type: 'account', id: 'THIRD_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1);

            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID'])
                    .and.contains($rootScope.data.accounts['second-api/account/SECOND_ID'])
                    .and.contains($rootScope.data.accounts['third-api/account/THIRD_ID']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID']);
        });

        it('should merge people that are connected by a new account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.entry.accounts.push({ api: 'third-api', type: 'account', id: 'THIRD_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ api: 'first-api', type: 'account', id: 'FIRST_ID' })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ api: 'second-api', type: 'account', id: 'SECOND_ID' })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ api: 'third-api', type: 'account', id: 'THIRD_ID' })
                .yield([null, { api: 'third-api', type: 'account', id: 'THIRD_ID',
                                connected: [{ api: 'first-api', type: 'account', id: 'FIRST_ID' },
                                            { api: 'second-api', type: 'account', id: 'SECOND_ID' }] }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1);

            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID'])
                    .and.contains($rootScope.data.accounts['second-api/account/SECOND_ID'])
                    .and.contains($rootScope.data.accounts['third-api/account/THIRD_ID']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID']);
        });
    });

    /*
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
    */
});
