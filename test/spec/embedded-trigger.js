var $ = require('jquery');

describe('embedded-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var embedded_trigger;
    var get_url_with_args;
    var obj;
    var sendMessage;

    beforeEach(function() {
        embedded_trigger = require('./scripts/embedded-trigger');
        body = $('<div id="body"></div>');
        obj = $('<embed id="obj" src="URL">').appendTo(body);
        var get_url = sandbox.stub();
        get_url_with_args = get_url.withArgs(sinon.match(function(_obj) {
            return obj.is(_obj);
        }, 'is obj'));
        get_url_with_args.returns(obj.attr('src'));
        embedded_trigger(body, '#obj', get_url, sendMessage = sandbox.spy());
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
    });

    describe('trigger element', function() {
        it('should exist', function() {
            expect(body.find('.hovercards-embedded-trigger').length).to.equal(1);
        });

        it('should be the only one', function() {
            embedded_trigger(body, '#somethingelse', $.noop);

            expect(body.find('.hovercards-embedded-trigger').length).to.equal(1);
        });

        it('should be hidden', function() {
            expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
        });

        it('should be visible on mouseenter', function() {
            body.find('.hovercards-embedded-trigger').mouseenter();

            expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
        });

        it('should be hidden on mouseleave', function() {
            body.find('.hovercards-embedded-trigger').show();
            body.find('.hovercards-embedded-trigger').mouseleave();

            expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
        });

        it('should send activate on click after obj mouseenter', function() {
            obj.mouseenter();
            body.find('.hovercards-embedded-trigger').click();

            expect(sendMessage).to.have.been.calledWith({ msg: 'activate', url: 'URL' });
        });
    });

    describe('on fullscreen', function() {
        it('should make the trigger element visible on fullscreen', function() {
            sandbox.stub(require('./scripts/common'), 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                return obj.is(_obj);
            }, 'is obj')).returns(true);
            obj.trigger($.Event('fullscreenchange'));

            expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
        });

        it('should put the trigger element at the top left', function() {
            obj.attr('src', null); // We don't want PhantomJS to get mad about the embed's URL when it gets attached to the document
            body.appendTo($('body')); // .offset won't mean anything unless the elements are attached to the document
            body.find('.hovercards-embedded-trigger').show(); // has to be visible to change its offset
            body.find('.hovercards-embedded-trigger').offset({ top: 20, left: 30 });
            body.find('.hovercards-embedded-trigger').hide();
            sandbox.stub(require('./scripts/common'), 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                return obj.is(_obj);
            }, 'is obj')).returns(true);
            obj.trigger($.Event('fullscreenchange'));

            expect(body.find('.hovercards-embedded-trigger').offset()).to.deep.equal({ top: 32, left: 8 });
        });

        it('should make the trigger element hidden off fullscreen', function() {
            body.find('.hovercards-embedded-trigger').show();
            sandbox.stub(require('./scripts/common'), 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                return obj.is(_obj);
            }, 'is obj')).returns(false);
            obj.trigger($.Event('fullscreenchange'));

            expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
        });
    });

    describe('on mouseenter', function() {
        it('should make the trigger element visible', function() {
            obj.mouseenter();

            expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
        });

        it('should not make the trigger element visible if get_url is null', function() {
            get_url_with_args.returns(null);
            obj.mouseenter();

            expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
        });

        it('should move the trigger element\'s offset to match', function() {
            obj.attr('src', null); // We don't want PhantomJS to get mad about the embed's URL when it gets attached to the document
            body.appendTo($('body')); // .offset won't mean anything unless the elements are attached to the document

            obj.offset({ top: 20, left: 30 });
            obj.mouseenter();

            expect(body.find('.hovercards-embedded-trigger').offset()).to.deep.equal({ top: 52, left: 38 });
        });
    });

    describe('on mouseleave', function() {
        it('should make the trigger element hidden', function() {
            body.find('.hovercards-embedded-trigger').show();
            obj.mouseleave();

            expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
        });
    });
});
