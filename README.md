# fuse-box-eslint-plugin

[![Build Status](https://travis-ci.org/DoumanAsh/fuse-box-eslint-plugin.svg?branch=master)](https://travis-ci.org/DoumanAsh/fuse-box-eslint-plugin)
[![Package version](https://img.shields.io/npm/v/fuse-box-eslint-plugin.svg)](https://npmjs.org/package/fuse-box-eslint-plugin)

ESlint plugin for [fuse-box](https://github.com/fuse-box/fuse-box)

## Usage

```js
const fsbx = require('fuse-box');
const eslinter = require('fuse-box-eslint-plugin');

fsbx.FuseBox.init({
    homeDir: "src/",
    plugins: [
        eslinter()
    ],
    outFile: "build/out.js"
}).bundle(">index.ts [**/*.js]");
```

## Optional config

To configure plugin you only need to pass all options in form of Object:

```js
eslinter({
    pattern: /js(x)*$/
    eslint: {
        useEslintrc: false
    }
})
```

### pattern

Specifies regular expression to filter files.

**Default:** `/js$/`

### eslint

Specifies ESLint [options](http://eslint.org/docs/developer-guide/nodejs-api#cliengine) that are passed to ESlint engine.

**Defaults:**

* cwd - root of your project;
* configFile - `<root>/.eslintc.js` if presents
* baseConfig - `{"extends": ["eslint:recommended"]}`
