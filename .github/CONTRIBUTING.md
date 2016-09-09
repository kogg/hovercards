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

## Tests
Our tests are very incomplete. Currently, there are tests for the various integrations (eg. reddit, youtube, etc.) but none for the extension's logic or the website.

## Code Style (linting/formatting)
There are included `.editorconfig`, `.eslintrc`, and `.stylelintrc` files which, on commit, should check (and attempt to fix) the code style. We have a custom set of rules, so look through those files to determine what's going on there.

## Join us!
We just opened up HoverCards to the world, so we're looking for this to be a community driven project. Our documentation is very spotty and looking for love. Feel free to create issues, chat with us in [our gitter](https://gitter.im/kogg/hovercards), and throw us some pull requests of your own!

![Bye!](../assets/images/carlito-corner.png)
