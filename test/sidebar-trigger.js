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
    var spy;

    beforeEach(function() {
        sidebar_trigger = SidebarTrigger(spy = sandbox.spy());
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should not send anything on activate', function() {
        sidebar_trigger({ msg: 'activate', url: 'URL' });

        expect(spy).to.not.have.been.called;
    });

    it('should not send anything on hide', function() {
        sidebar_trigger({ msg: 'hide' });

        expect(spy).to.not.have.been.called;
    });

    it('should not send anything on ready', function() {
        sidebar_trigger({ msg: 'ready' });

        expect(spy).to.not.have.been.called;
    });

    it('should send load on ready & activate', function() {
        sidebar_trigger({ msg: 'ready' });
        sidebar_trigger({ msg: 'activate', url: 'URL' });

        expect(spy).to.have.been.calledWith({ msg: 'load', url: 'URL' });
    });

    it('should send load on activate & ready', function() {
        sidebar_trigger({ msg: 'activate', url: 'URL' });
        sidebar_trigger({ msg: 'ready' });

        expect(spy).to.have.been.calledWith({ msg: 'load', url: 'URL' });
    });

    it('should send hide on ready & hide', function() {
        sidebar_trigger({ msg: 'ready' });
        sidebar_trigger({ msg: 'hide' });

        expect(spy).to.have.been.calledWith({ msg: 'hide' });
    });

    it('should not send hide on hide & ready', function() {
        sidebar_trigger({ msg: 'hide' });
        sidebar_trigger({ msg: 'ready' });

        expect(spy).to.not.have.been.called;
    });
});
