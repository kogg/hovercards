'use strict';

describe('trigger-inject', function() {
    var sandbox;
    var body;
    var trigger_inject;
    var hover_trigger;

    beforeEach(function(done) {
        require(['trigger-inject', 'hover-trigger'], function(_trigger_inject, _hover_trigger) {
            sandbox = sinon.sandbox.create();
            body = $('<div id="body"></div>');
            trigger_inject = _trigger_inject;
            hover_trigger = _hover_trigger;
            sandbox.stub(hover_trigger, 'on');
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    it('should bind to a[href]', function() {
        trigger_inject.on(body);

        expect(hover_trigger.on).to.be.calledWith(
            sinon.match(function(element) {
                return body[0] === element[0];
            }, 'body'),
            'a[href]',
            sinon.match(function(func) {
                return func($('<a href="SOME_HREF">Some Link</a>')) === 'SOME_HREF';
            }, 'func that gets href')
        );
    });
});
