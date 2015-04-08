'use strict';

describe('cards-directive', function() {
    var sandbox = sinon.sandbox.create();
    var element;
    var $compile;
    var $rootScope;

    beforeEach(function(done) {
        require(['cards-directive'], function() {
            sandbox.stub(chrome.runtime.onMessage, 'addListener');
            sandbox.useFakeServer();
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
            element = angular.element('<div cards="cardsets"></div>');

            $compile(element)($rootScope);
            $rootScope.$digest();
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should set cardsets to an array', function() {
        var scope = element.isolateScope();
        expect(scope.cardsets).to.deep.equal([]);
    });

    describe('on hide', function() {
        it('should empty cardsets', function() {
            var scope = element.isolateScope();
            scope.cardsets = [{ provider: 'somewhere', content: 'something' }];
            chrome.runtime.onMessage.addListener.yield({ msg: 'hide' });
            $rootScope.$digest();

            expect(scope.cardsets).to.deep.equal([]);
        });
    });

    describe('on load', function() {
        it('should retrieve cards from heroku', function() {
            sandbox.server.respondWith('https://hovercards.herokuapp.com/v1/cards?url=URL',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        '[\n' +
                                        JSON.stringify({ type: 'somewhere-something-1', network: 'somewhere', id: 'SOME_ID-1'}) + ',\n' +
                                        JSON.stringify({ type: 'somewhere-something-2', network: 'somewhere', id: 'SOME_ID-2'}) + ',\n' +
                                        JSON.stringify({ type: 'somewhere-something-3', network: 'somewhere', id: 'SOME_ID-3'}) + ',\n' +
                                        '{}]\n']);
            var scope = element.isolateScope();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            sandbox.server.respond();
            $rootScope.$digest();

            expect(scope.cardsets).to.deep.equal([{ cards:  [{ type: 'somewhere-something-1', network: 'somewhere', id: 'SOME_ID-1' },
                                                             { type: 'somewhere-something-2', network: 'somewhere', id: 'SOME_ID-2' },
                                                             { type: 'somewhere-something-3', network: 'somewhere', id: 'SOME_ID-3' }],
                                                    errors: [],
                                                    done: true }]);
        });

        it('should retrieve error cards from heroku', function() {
            sandbox.server.respondWith('https://hovercards.herokuapp.com/v1/cards?url=URL',
                                       [200,
                                        { 'Content-Type': 'application/json' },
                                        '[\n' +
                                        JSON.stringify({ type: 'somewhere-something-1', network: 'somewhere', id: 'SOME_ID-1'}) + ',\n' +
                                        JSON.stringify({ type: 'error', err: { type: 'somewhere-something-2', network: 'somewhere', code: 400, message: 'Something happened' } }) + ',\n' +
                                        JSON.stringify({ type: 'error', err: { type: 'somewhere-something-3', network: 'somewhere', code: 400, message: 'Something happened' } }) + ',\n' +
                                        '{}]\n']);
            var scope = element.isolateScope();
            chrome.runtime.onMessage.addListener.yield({ msg: 'load', url: 'URL' });
            sandbox.server.respond();
            $rootScope.$digest();

            expect(scope.cardsets).to.deep.equal([{ cards:  [{ type: 'somewhere-something-1', network: 'somewhere', id: 'SOME_ID-1' }],
                                                    errors: [{ type: 'somewhere-something-2', network: 'somewhere', code: 400, message: 'Something happened' },
                                                             { type: 'somewhere-something-3', network: 'somewhere', code: 400, message: 'Something happened' }],
                                                    done: true }]);
        });
    });
});
