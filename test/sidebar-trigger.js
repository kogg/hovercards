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
        sidebar_trigger = SidebarTrigger();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should not send anything on activate', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'activate', url: 'URL' }, spy);

        expect(spy).to.not.have.been.called;
    });

    it('should not send anything on hide', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'hide' }, spy);

        expect(spy).to.not.have.been.called;
    });

    it('should not send anything on ready', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'ready' }, spy);

        expect(spy).to.not.have.been.called;
    });

    it('should send load on ready & activate', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'ready' });
        sidebar_trigger({ msg: 'activate', url: 'URL' }, spy);

        expect(spy).to.have.been.calledWith({ msg: 'load', url: 'URL' });
    });

    it('should send load on activate & ready', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'activate', url: 'URL' });
        sidebar_trigger({ msg: 'ready' }, spy);

        expect(spy).to.have.been.calledWith({ msg: 'load', url: 'URL' });
    });

    it('should send hide on ready & hide', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'ready' });
        sidebar_trigger({ msg: 'hide' }, spy);

        expect(spy).to.have.been.calledWith({ msg: 'hide' });
    });

    it('should not send hide on hide & ready', function() {
        var spy = sandbox.spy();
        sidebar_trigger({ msg: 'hide' });
        sidebar_trigger({ msg: 'ready' }, spy);

        expect(spy).to.not.have.been.called;
    });
});
