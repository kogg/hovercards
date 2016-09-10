[![HoverCards banner](assets/images/facebeefbanner.jpg)](http://hovercards.com)

[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/dighmiipfpfdfbfmpodcmfdgkkcakbco.svg?style=flat-square&maxAge=3600000)](https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco)
[![Chrome Web Store Downloads](https://img.shields.io/chrome-web-store/d/dighmiipfpfdfbfmpodcmfdgkkcakbco.svg?style=flat-square&maxAge=3600000)](https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/dighmiipfpfdfbfmpodcmfdgkkcakbco.svg?style=flat-square&maxAge=3600000)](https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco/reviews)
[![Chrome Web Store Rating Count](https://img.shields.io/chrome-web-store/rating-count/dighmiipfpfdfbfmpodcmfdgkkcakbco.svg?style=flat-square&maxAge=3600000)](https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco/reviews)

[![npm Version](https://img.shields.io/npm/v/hovercards.svg?style=flat-square&maxAge=3600000)](https://www.npmjs.com/package/hovercards)
[![npm Downloads](https://img.shields.io/npm/dm/hovercards.svg?style=flat-square&maxAge=3600000)](https://www.npmjs.com/package/hovercards)

[![Gitter](https://img.shields.io/gitter/room/kogg/hovercards.js.svg?style=flat-square&maxAge=3600000)](https://gitter.im/kogg/hovercards)
[![Travis](https://img.shields.io/travis/kogg/hovercards/master.svg?style=flat-square&maxAge=3600000)](https://travis-ci.org/kogg/hovercards)
[![Codecov](https://img.shields.io/codecov/c/github/kogg/hovercards.svg?style=flat-square&maxAge=3600000)](https://codecov.io/gh/kogg/hovercards)
[![Website](https://img.shields.io/website-up-down-green-red/http/hovercards.com.svg?style=flat-square&maxAge=3600000)](http://hovercards.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square&maxAge=3600000)](http://commitizen.github.io/cz-cli/)

# HoverCards
HoverCards is a chrome extension that lets you see what's behind links from youtube, twitter, reddit, soundcloud, imgur, & instagram — all with out ever leaving the web page you're currently on.

## Usage

### [Chrome](https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco) (recommended)
Install HoverCards from [the chrome webstore](https://chrome.google.com/webstore/detail/hovercards/dighmiipfpfdfbfmpodcmfdgkkcakbco). Simple.

### npm
```bash
npm install -g hovercards
```

You will need to load the chrome extension as an unpacked extension, which there is [a guide](https://developer.chrome.com/extensions/getstarted#unpacked) for. The extension will be in the `dist` folder.

## Development
```bash
gem install foreman                          # https://devcenter.heroku.com/articles/heroku-local#run-your-app-locally-using-foreman
brew install redis                           # https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298
git clone git@github.com:kogg/hovercards.git
cd hovercards
echo INSTAGRAM_CLIENT_ID=41e56061c1e34fbbb16ab1d095dad78b\\nREDDIT_CLIENT_ID=0jXqEudQPqSL6w\\nSOUNDCLOUD_CLIENT_ID=78a827254bd7a5e3bba61aa18922bf2e > .env
npm start
```

You will need to load the chrome extension as an unpacked extension, which there is [a guide](https://developer.chrome.com/extensions/getstarted#unpacked) for. The extension will be in the `dist` folder.

There are a few environment variables that should be set in `.env` to get different functionality working. For example, to get imgur working, you'll need the `IMGUR_CLIENT_ID` environment variable. Most of these aren't provided, as they are the secret API keys for the running services. :smile:

Everything __except__ the content scripts are hot reloaded. This includes a local version of the [website](http://hovercards.com), which can be viewed at [localhost:5000](http://localhost:5000).

### Tests
Our tests are very incomplete. Currently, there are tests for the various integrations (eg. reddit, youtube, etc.) but none for the extension's logic or the website.

The tests run automatically on every pull request. They also run on `master` before releasing to our website, chrome webstore, and server.

### Code Style (linting/formatting)
There are included `.editorconfig`, `.eslintrc`, and `.stylelintrc` files which, on commit, should check (and attempt to fix) the code style. We have a custom set of rules, so look through those files to determine what's going on there.

## Join us!
We just opened up HoverCards to the world, so we're looking for this to be a community driven project. Our documentation is very spotty and looking for love. Feel free to create issues, chat with us in [our gitter](https://gitter.im/kogg/hovercards), and throw us some pull requests of your own!

![Bye!](assets/images/carlito-corner.png)
