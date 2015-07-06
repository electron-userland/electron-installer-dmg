# electron-installer-dmg [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> Standard linting, formatting and more for [mongodb-js][mongodb-js] projects.

## Usage

`mongodb-js-precommit` provides a shortcut to the following useful tools:

- [`dependency-check`][dependency-check] Makes sure you didn't forget to update
  your `package.json` with new dependencies or remove dependencies your module
  isn't using anymore.
- [`jsfmt`][jsfmt] Formats your code to the syleguide for you.
- [`eslint`][eslint] Makes sure your code conforms to the syleguide for cases
  that aren't just simple formatting and are probably bugs.

## Example

First, install [pre-commit][pre-commit], which actually sets up the git precommit hook:

```bash
npm install --save-dev pre-commit mongodb-js-precommit
```

Next, update your `package.json` to add a new `check` script and condifure
[pre-commit][pre-commit] to run it:

```json
  "scripts": {
    "check": "mongodb-js-precommit"
  },
  "precommmit": ["check"]
```

To test that everything is working correctly, you can run:

```bash
npm run check
```

Now, sit back, relax and think about what you're going to do with your
new found free time that would have been spent on code reviews.

## Configuration

`mongodb-js-precommit` is easily configurable via your `package.json`.

### dependency-check

- `entries[]` extra [entry points for dependency-check][dependency-check_entry]
- `ignore[]` module names for [dependency-check to ignore][dependency-check_ignore]

```json
  "dependency-check": {
    "entries": ["bin/mongodb-js-precommit.js"],
    "ignore": ["mongodb-js-precommit", "mocha"]
  }
```

### precommit

Checkout the [pre-commit configuration docs][pre-commit_config] for more details.

### eslint

For more information, checkout [eslint-config-mongodb-js][eslint-config-mongodb-js].

## Todo

- [`npm-check-updates`][npm-check-updates] Can we safely update dependency
  versions to latest safely?
- [`nsp`][nsp] Are you using any modules with known security vulnerabilites?

## License

Apache 2.0


[pre-commit]: https://www.npmjs.com/package/pre-commit
[pre-commit_config]: https://www.npmjs.com/package/pre-commit#configuration
[travis_img]: https://img.shields.io/travis/mongodb-js/precommit.svg
[travis_url]: https://travis-ci.org/mongodb-js/precommit
[npm_img]: https://img.shields.io/npm/v/mongodb-js-precommit.svg
[npm_url]: https://npmjs.org/package/mongodb-js-precommit
[mongodb-js]: http://mongodb-js.github.io/
[dependency-check]: https://www.npmjs.com/package/dependency-check
[dependency-check_entry]: https://www.npmjs.com/package/dependency-check#entry
[dependency-check_ignore]: https://www.npmjs.com/package/dependency-check#ignore-module-i
[jsfmt]: https://github.com/rdio/jsfmt
[eslint]: http://eslint.org
[eslint-config-mongodb-js]: https://github.com/mongodb-js/eslint-config
[nsp]: https://www.npmjs.com/package/nsp
[npm-check-updates]: https://www.npmjs.com/package/npm-check-updates
