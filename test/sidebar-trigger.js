var chai      = require('chai');
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
var expect    = chai.expect;
chai.use(sinonChai);

require('./chrome');

var SidebarTrigger = require('../app/scripts/sidebar-trigger');

describe('sidebar-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var sidebar_trigger;

    beforeEach(function() {
        sandbox.stub(chrome.runtime.onMessage, 'addListener');
        sandbox.stub(chrome.tabs, 'sendMessage');
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(undefined);
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields(undefined);
        sidebar_trigger = SidebarTrigger();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('on ready', function() {
        it('should set ready', function() {
            sidebar_trigger('TAB_ID', { msg: 'ready' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { ready: true } });
        });

        it('should not send load', function() {
            sidebar_trigger('TAB_ID', { msg: 'ready' });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'load'));
        });

        it('should send load if sent is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields('URL');
            sidebar_trigger('TAB_ID', { msg: 'ready' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', url: 'URL' });
        });
    });

    describe('on activate', function() {
        it('should set sent', function() {
            sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: 'URL' } });
        });

        it('should not send anything', function() {
            sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'load'));
            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'hide'));
        });

        it('should send load if ready is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'load', url: 'URL' });
        });

        it('should send hide if ready is set & sent === URL', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields('URL');
            sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });

        it('should unset sent if ready is set & sent === URL', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields('URL');
            sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: null } });
        });
    });

    describe('on hide', function() {
        it('should unset sent', function() {
            sidebar_trigger('TAB_ID', { msg: 'hide' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'set', value: { sent: null } });
        });

        it('should not send hide', function() {
            sidebar_trigger('TAB_ID', { msg: 'hide' });

            expect(chrome.tabs.sendMessage).not.to.have.been.calledWith('TAB_ID', sinon.match.has('msg', 'hide'));
        });

        it('should send hide if ready is set', function() {
            chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true);
            sidebar_trigger('TAB_ID', { msg: 'hide' });

            expect(chrome.tabs.sendMessage).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
        });
    });
});
