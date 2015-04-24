module.exports = function() {
    return function(messagename) {
        if (!messagename) {
            return messagename;
        }
        return chrome.i18n.getMessage(messagename.replace(/\-/g, '_')) || messagename;
    };
};
