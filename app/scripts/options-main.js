var $ = require('jquery');

$(function() {
    chrome.storage.sync.get('disabled', function(obj) {
        var disabled;

        function set_disabled(new_disabled) {
            disabled = new_disabled;
            $('#imgur-content').prop('checked',      !(disabled && disabled.imgur      && disabled.imgur.content));
            $('#imgur-account').prop('checked',      !(disabled && disabled.imgur      && disabled.imgur.account));
            $('#instagram-content').prop('checked',  !(disabled && disabled.instagram  && disabled.instagram.content));
            $('#instagram-account').prop('checked',  !(disabled && disabled.instagram  && disabled.instagram.account));
            $('#reddit-content').prop('checked',     !(disabled && disabled.reddit     && disabled.reddit.content));
            $('#reddit-account').prop('checked',     !(disabled && disabled.reddit     && disabled.reddit.account));
            $('#soundcloud-content').prop('checked', !(disabled && disabled.soundcloud && disabled.soundcloud.content));
            $('#soundcloud-account').prop('checked', !(disabled && disabled.soundcloud && disabled.soundcloud.account));
            $('#twitter-content').prop('checked',    !(disabled && disabled.twitter    && disabled.twitter.content));
            $('#twitter-account').prop('checked',    !(disabled && disabled.twitter    && disabled.twitter.account));
            $('#youtube-content').prop('checked',    !(disabled && disabled.youtube    && disabled.youtube.content));
            $('#youtube-account').prop('checked',    !(disabled && disabled.youtube    && disabled.youtube.account));
        }
        set_disabled(obj.disabled);

        chrome.storage.onChanged.addListener(function(changes, area_name) {
            if (area_name !== 'sync' || !('disabled' in changes)) {
                return;
            }
            set_disabled(changes.disabled.newValue);
        });

        $('body').on('click', '.setting-card', function() {
            var input = $(this).find('input');
            input.prop('checked', !input.prop('checked'));
        });

        $('#save').on('click', function() {
            console.log('trying to save...');
            chrome.storage.sync.set({ disabled : { imgur:      { content: !$('#imgur-content').prop('checked'),      account: !$('#imgur-account').prop('checked') },
                                                   instagram:  { content: !$('#instagram-content').prop('checked'),  account: !$('#instagram-account').prop('checked') },
                                                   reddit:     { content: !$('#reddit-content').prop('checked'),     account: !$('#reddit-account').prop('checked') },
                                                   soundcloud: { content: !$('#soundcloud-content').prop('checked'), account: !$('#soundcloud-account').prop('checked') },
                                                   twitter:    { content: !$('#twitter-content').prop('checked'),    account: !$('#twitter-account').prop('checked') },
                                                   youtube:    { content: !$('#youtube-content').prop('checked'),    account: !$('#youtube-account').prop('checked') } } },
                function() {
                    console.log('saved!');
                });
        });
    });
});
