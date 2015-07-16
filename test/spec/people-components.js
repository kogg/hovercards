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
        $rootScope.entry = { timing: { account: function() {} } };
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
            $rootScope.entry.can_have_people = true;
            $rootScope.entry.accounts = [];
            sandbox.stub(chrome.runtime, 'sendMessage');
        });

        it('should load account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            expect($rootScope.data).to.have.property('accounts').that.has.property('first-api/account/FIRST_ID/');
            expect($rootScope.data.accounts['first-api/account/FIRST_ID/']).not.to.have.property('$resolved');
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID', key: 'value' }]);
            $rootScope.$digest();
            expect($rootScope.data.accounts['first-api/account/FIRST_ID/']).to.have.property('$resolved', true);
            expect($rootScope.data.accounts['first-api/account/FIRST_ID/']).to.have.property('key', 'value');
        });

        it('should not load the same account twice', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID', key: 'value' }]);
            $rootScope.$digest();
            expect($rootScope.data.accounts['first-api/account/FIRST_ID/']).to.have.property('$resolved', true);
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            expect($rootScope.data.accounts['first-api/account/FIRST_ID/']).to.have.property('$resolved', true);
        });

        it('should load accounts that are connected', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID',
                                connected: [{ api: 'second-api', type: 'account', id: 'SECOND_ID' },
                                            { api: 'third-api',  type: 'account', id: 'THIRD_ID' }] }]);
            $rootScope.$digest();
            expect($rootScope.data).to.have.property('accounts').that.has.property('second-api/account/SECOND_ID/');
            expect($rootScope.data).to.have.property('accounts').that.has.property('third-api/account/THIRD_ID/');
        });
    });

    describe('constructing people', function() {
        beforeEach(function() {
            $rootScope.entry.can_have_people = true;
            $rootScope.entry.accounts = [];
            sandbox.stub(chrome.runtime, 'sendMessage');
        });

        it('should use accounts to make people', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'second-api', type: 'account', id: 'SECOND_ID' } })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(2);

            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID/']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID/']);

            expect($rootScope.data.people[1])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['second-api/account/SECOND_ID/']);
            expect($rootScope.data.people[1])
                .to.have.property('selectedAccount', $rootScope.data.accounts['second-api/account/SECOND_ID/']);
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
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1)
                    .and.not.to.have.property('$err');
            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID/']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID/']);
        });

        it('should set error until we get an account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.entry.accounts.push({ api: 'third-api', type: 'account', id: 'THIRD_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([{ status: 400 }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(0)
                    .and.to.have.property('$err');

            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'second-api', type: 'account', id: 'SECOND_ID' } })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1)
                    .and.not.to.have.property('$err');

            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'third-api', type: 'account', id: 'THIRD_ID' } })
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
                .withArgs({ type: 'service', request: { api: 'second-api', type: 'account', id: 'SECOND_ID' } })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID/']);

            expect($rootScope.data.people[1])
                .to.have.property('selectedAccount', $rootScope.data.accounts['second-api/account/SECOND_ID/']);
        });

        it('should merge people that are connected to a new account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.entry.accounts.push({ api: 'third-api', type: 'account', id: 'THIRD_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID',
                                connected: [{ api: 'third-api', type: 'account', id: 'THIRD_ID' }] }]);
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'second-api', type: 'account', id: 'SECOND_ID' } })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID',
                                connected: [{ api: 'third-api', type: 'account', id: 'THIRD_ID' }] }]);
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'third-api', type: 'account', id: 'THIRD_ID' } })
                .yield([null, { api: 'third-api', type: 'account', id: 'THIRD_ID' }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1);

            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID/'])
                    .and.contains($rootScope.data.accounts['second-api/account/SECOND_ID/'])
                    .and.contains($rootScope.data.accounts['third-api/account/THIRD_ID/']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID/']);
        });

        it('should merge people that are connected by a new account', function() {
            $rootScope.entry.accounts.push({ api: 'first-api', type: 'account', id: 'FIRST_ID' });
            $rootScope.entry.accounts.push({ api: 'second-api', type: 'account', id: 'SECOND_ID' });
            $rootScope.entry.accounts.push({ api: 'third-api', type: 'account', id: 'THIRD_ID' });
            $rootScope.$digest();
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'first-api', type: 'account', id: 'FIRST_ID' } })
                .yield([null, { api: 'first-api', type: 'account', id: 'FIRST_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'second-api', type: 'account', id: 'SECOND_ID' } })
                .yield([null, { api: 'second-api', type: 'account', id: 'SECOND_ID' }]);
            chrome.runtime.sendMessage
                .withArgs({ type: 'service', request: { api: 'third-api', type: 'account', id: 'THIRD_ID' } })
                .yield([null, { api: 'third-api', type: 'account', id: 'THIRD_ID',
                                connected: [{ api: 'first-api', type: 'account', id: 'FIRST_ID' },
                                            { api: 'second-api', type: 'account', id: 'SECOND_ID' }] }]);
            $rootScope.$digest();

            expect($rootScope.data)
                .to.have.property('people')
                    .that.has.length(1);

            expect($rootScope.data.people[0])
                .to.have.property('accounts')
                    .that.contains($rootScope.data.accounts['first-api/account/FIRST_ID/'])
                    .and.contains($rootScope.data.accounts['second-api/account/SECOND_ID/'])
                    .and.contains($rootScope.data.accounts['third-api/account/THIRD_ID/']);
            expect($rootScope.data.people[0])
                .to.have.property('selectedAccount', $rootScope.data.accounts['first-api/account/FIRST_ID/']);
        });
    });
});
