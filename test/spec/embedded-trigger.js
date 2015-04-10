'use strict';

describe('embedded-trigger', function() {
    var sandbox = sinon.sandbox.create();
    var body;
    var embedded_trigger;

    beforeEach(function(done) {
        require(['embedded-trigger'], function(_embedded_trigger) {
            sandbox.stub(chrome.runtime, 'sendMessage');
            embedded_trigger = _embedded_trigger;
            done();
        });
    });

    afterEach(function() {
        sandbox.restore();
        body.remove();
        embedded_trigger.trigger = null;
    });

    describe('.on', function() {
        var obj;
        var get_url;
        var get_url_with_args;

        beforeEach(function() {
            body = $('<div id="body"></div>');
            obj = $('<embed id="obj" src="URL">').appendTo(body);
            get_url = sandbox.stub();
            get_url_with_args = get_url.withArgs(sinon.match(function(_obj) {
                return obj.is(_obj);
            }, 'is obj'));
            get_url_with_args.returns(obj.attr('src'));
        });

        describe('trigger element', function() {
            it('should exist', function() {
                embedded_trigger.on(body, '#obj', get_url);

                expect(body.find('.hovercards-embedded-trigger')).to.exist;
            });

            it('should be the only one', function() {
                embedded_trigger.on(body, '#obj', get_url);
                embedded_trigger.on(body, '#somethingelse', $.noop);

                expect(body.find('.hovercards-embedded-trigger').length).to.equal(1);
            });

            it('should be hidden', function() {
                embedded_trigger.on(body, '#obj', get_url);

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });

            it('should be visible on mouseenter', function() {
                embedded_trigger.on(body, '#obj', get_url);
                body.find('.hovercards-embedded-trigger').mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
            });

            it('should be hidden on mouseleave', function() {
                embedded_trigger.on(body, '#obj', get_url);
                body.find('.hovercards-embedded-trigger').show();
                body.find('.hovercards-embedded-trigger').mouseleave();

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });

            it('should send activate on click after obj mouseenter', function() {
                embedded_trigger.on(body, '#obj', get_url);
                obj.mouseenter();
                body.find('.hovercards-embedded-trigger').click();

                expect(chrome.runtime.sendMessage).to.have.been.calledWith({ msg: 'activate', url: 'URL' });
            });
        });

        describe('on fullscreen', function() {
            it('should make the trigger element visible on fullscreen', function() {
                embedded_trigger.on(body, '#obj', get_url);
                sandbox.stub(embedded_trigger, 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                    return obj.is(_obj);
                }, 'is obj')).returns(true);
                obj.trigger($.Event('fullscreenchange'));

                expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
            });

            it('should put the trigger element at the top left', function() {
                embedded_trigger.on(body, '#obj', get_url);
                obj.attr('src', null); // We don't want PhantomJS to get mad about the embed's URL when it gets attached to the document
                body.appendTo($('body')); // .offset won't mean anything unless the elements are attached to the document
                body.find('.hovercards-embedded-trigger').show(); // has to be visible to change its offset
                body.find('.hovercards-embedded-trigger').offset({ top: 20, left: 30 });
                body.find('.hovercards-embedded-trigger').hide();
                sandbox.stub(embedded_trigger, 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                    return obj.is(_obj);
                }, 'is obj')).returns(true);
                obj.trigger($.Event('fullscreenchange'));

                expect(body.find('.hovercards-embedded-trigger').offset()).to.deep.equal({ top: 0, left: 0 });
            });

            it('should make the trigger element hidden off fullscreen', function() {
                embedded_trigger.on(body, '#obj', get_url);
                body.find('.hovercards-embedded-trigger').show();
                sandbox.stub(embedded_trigger, 'is_fullscreen').withArgs(sinon.match(function(_obj) {
                    return obj.is(_obj);
                }, 'is obj')).returns(false);
                obj.trigger($.Event('fullscreenchange'));

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });
        });

        describe('on mouseenter', function() {
            it('should make the trigger element visible', function() {
                embedded_trigger.on(body, '#obj', get_url);
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).not.to.have.css('display', 'none');
            });

            it('should not make the trigger element visible if get_url is null', function() {
                embedded_trigger.on(body, '#obj', get_url);
                get_url_with_args.returns(null);
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });

            it('should add .hovercards-embedded-trigger-fullscreenable if param=true', function() {
                embedded_trigger.on(body, '#obj', get_url, true);
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).to.match('.hovercards-embedded-trigger-fullscreenable');
            });

            it('should remove .hovercards-embedded-trigger-fullscreenable if param!=true', function() {
                embedded_trigger.on(body, '#obj', get_url);
                body.find('.hovercards-embedded-trigger').addClass('hovercards-embedded-trigger-fullscreenable');
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger')).not.to.match('.hovercards-embedded-trigger-fullscreenable');
            });

            it('should move the trigger element\'s offset to match', function() {
                embedded_trigger.on(body, '#obj', get_url);
                obj.attr('src', null); // We don't want PhantomJS to get mad about the embed's URL when it gets attached to the document
                body.appendTo($('body')); // .offset won't mean anything unless the elements are attached to the document

                obj.offset({ top: 20, left: 30 });
                obj.mouseenter();

                expect(body.find('.hovercards-embedded-trigger').offset()).to.deep.equal({ top: 20, left: 30 });
            });
        });

        describe('on mouseleave', function() {
            it('should make the trigger element hidden', function() {
                embedded_trigger.on(body, '#obj', get_url);
                body.find('.hovercards-embedded-trigger').show();
                obj.mouseleave();

                expect(body.find('.hovercards-embedded-trigger')).to.have.css('display', 'none');
            });
        });
    });
});
