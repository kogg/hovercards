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
        sandbox.stub(chrome.tabs, 'sendMessage');
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(undefined);
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields(undefined);
        sidebar_trigger = SidebarTrigger();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should not send anything on activate', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' }, spy);

        expect(spy).to.not.have.been.called;
    });

    it('should not send anything on hide', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'hide' }, spy);

        expect(spy).to.not.have.been.called;
    });

    it('should not send anything on ready', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'ready' }, spy);

        expect(spy).to.not.have.been.called;
    });

    it('should send load on ready & activate', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'ready' });
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true); // FIXME
        sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' }, spy);

        expect(spy).to.have.been.calledWith('TAB_ID', { msg: 'load', url: 'URL' });
    });

    it('should send load on activate & ready', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'activate', url: 'URL' });
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'sent' }).yields('URL'); // FIXME
        sidebar_trigger('TAB_ID', { msg: 'ready' }, spy);

        expect(spy).to.have.been.calledWith('TAB_ID', { msg: 'load', url: 'URL' });
    });

    it('should send hide on ready & hide', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'ready' });
        chrome.tabs.sendMessage.withArgs('TAB_ID', { msg: 'get', value: 'ready' }).yields(true); // FIXME
        sidebar_trigger('TAB_ID', { msg: 'hide' }, spy);

        expect(spy).to.have.been.calledWith('TAB_ID', { msg: 'hide' });
    });

    it('should not send hide on hide & ready', function() {
        var spy = sandbox.spy();
        sidebar_trigger('TAB_ID', { msg: 'hide' });
        sidebar_trigger('TAB_ID', { msg: 'ready' }, spy);

        expect(spy).to.not.have.been.called;
    });
});
