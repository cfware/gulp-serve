# @cfware/gulp-serve

[![Greenkeeper badge](https://badges.greenkeeper.io/cfware/gulp-serve.svg)](https://greenkeeper.io/)

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

Basic HTTP connect gulp task.

### Install @cfware/gulp-serve

```sh
npm i --save-dev @cfware/gulp-serve
```

## Usage

```js
'use strict';

const gulp = require('gulp');
const gulpServe = require('@cfware/gulp-serve');

gulp.task('serve', () => gulpServe({
	ports: [8081, 0],
	statics: {'/': 'test'},
	redirects: {'/': '/my-app'},
}));
```

## Running tests

The only test currently provided is eslint.

```sh
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/@cfware/gulp-serve.svg
[npm-url]: https://npmjs.org/package/@cfware/gulp-serve
[downloads-image]: https://img.shields.io/npm/dm/@cfware/gulp-serve.svg
[downloads-url]: https://npmjs.org/package/@cfware/gulp-serve
[license-image]: https://img.shields.io/github/license/cfware/gulp-serve.svg
