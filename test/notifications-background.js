var chai      = require('chai');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var nock      = require('nock');
var expect    = chai.expect;
chai.use(sinonChai);

require('./chrome');

describe('notifications-background', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {
        var notificationsBackground = require('../app/scripts/notifications-background');
        sandbox.stub(chrome.runtime.onMessage, 'addListener');
        sandbox.stub(chrome.tabs, 'sendMessage');
        sandbox.stub(chrome.storage.sync, 'get');
        sandbox.stub(chrome.storage.sync, 'set');
        chrome.storage.sync.get.yields({ });
        notificationsBackground();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('intro', function() {
        describe('state:introlevel === undefined', function() {
            beforeEach(function() {
                chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'introlevel' }).yields(undefined);
            });

            it('should send notify:firsthover on hovered', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hovered' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthover' });
            });

            it('should not send notify:firsthover on hovered if sync intro === true', function() {
                chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
                chrome.runtime.onMessage.addListener.yield({ msg: 'hovered' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthover' });
            });

            it('should set introlevel = 1 on hovered', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hovered' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { introlevel: 1 } });
            });

            it('should not set introlevel = 1 on hovered if sync intro === true', function() {
                chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
                chrome.runtime.onMessage.addListener.yield({ msg: 'hovered' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'set', value: { introlevel: 1 } });
            });

            it('should not send notify:firstload on loaded', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
            });

            it('should not send notify:firsthide on hidden', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthide' });
            });
        });

        describe('state:introlevel === 1', function() {
            beforeEach(function() {
                chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'introlevel' }).yields(1);
            });

            it('should not send notify:firsthover on hovered', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hovered' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthover' });
            });

            it('should send notify:firstload on loaded', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
            });

            it('should not send notify:firstload on loaded if sync intro === true', function() {
                chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
                chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
            });

            it('should set introlevel = 2 on loaded', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { introlevel: 2 } });
            });

            it('should not set introlevel = 2 on loaded if sync intro === true', function() {
                chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
                chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'set', value: { introlevel: 2 } });
            });

            it('should not send notify:firsthide on hidden', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthide' });
            });
        });

        describe('state:introlevel === 2', function() {
            beforeEach(function() {
                chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'introlevel' }).yields(2);
            });

            it('should not send notify:firsthover on hovered', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hovered' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthover' });
            });

            it('should not send notify:firstload on loaded', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'loaded' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
            });

            it('should send notify:firsthide on hidden', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firsthide' });
            });

            it('should not send notify:firsthide on hidden if sync intro === true', function() {
                chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'notify', type: 'firstload' });
            });

            it('should set introlevel = 3 on hidden', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { introlevel: 3 } });
            });

            it('should not set introlevel = 3 on hidden if sync intro === true', function() {
                chrome.storage.sync.get.withArgs('intro').yields({ intro: true });
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', { msg: 'set', value: { introlevel: 3 } });
            });

            it('should set storage.intro = 3 on hidden', function() {
                chrome.runtime.onMessage.addListener.yield({ msg: 'hidden' }, { tab: { id: 'TAB_ID' } });

                expect(chrome.storage.sync.set).to.have.been.calledWith({ intro: true });
            });
        });
    });
});
