"use strict";
const path = require('path');
const fs = require('fs');

const eslint = require('eslint');
const sinon = require('sinon');
const test = require('ava');
const eslinter = require('../src/');

const DEFAULT_ESLINT_CONFIG = path.normalize(path.join(__dirname, '..', '.eslintrc.js'));

test('init with defaults', async t => {
    const plugin = eslinter();

    t.is(plugin.root, path.normalize(path.join(__dirname, '..')));
    t.deepEqual(plugin.test, /js$/);
    t.is(plugin.eslint.cwd, plugin.root);
    t.deepEqual(plugin.eslint.baseConfig, { "extends": ["eslint:recommended"] });
    t.is(plugin.eslint.configFile, DEFAULT_ESLINT_CONFIG)
});

test.serial('init with defaults no ESLint default configFile', async t => {
    const eslint_plugin_stub = sinon.stub(eslint, "CLIEngine")
    const stub = sinon.stub(fs, "existsSync")
                      .withArgs(DEFAULT_ESLINT_CONFIG)
                      .returns(false);

    const plugin = eslinter();

    t.true(stub.called);
    t.is(plugin.root, path.normalize(path.join(__dirname, '..')));
    t.deepEqual(plugin.test, /js$/);
    t.is(plugin.eslint.cwd, plugin.root);
    t.deepEqual(plugin.eslint.baseConfig, { "extends": ["eslint:recommended"] });
    t.is(plugin.eslint.configFile, null);

    fs.existsSync.restore();

    plugin.init();

    t.true(eslint_plugin_stub.calledWithNew());
    t.true(eslint_plugin_stub.calledWith({
        cwd: plugin.root,
        baseConfig: {
            "extends": ["eslint:recommended"]
        },
        configFile: null
    }))
    t.true(!!plugin.inner);

    eslint.CLIEngine.restore();
});

test('init with plugin options only', async t => {
    const options = {
        pattern: "test!"
    };
    let plugin = eslinter(options);

    t.is(plugin.root, path.normalize(path.join(__dirname, '..')));
    t.is(plugin.test, options.pattern);
    t.is(plugin.eslint.cwd, plugin.root);
    t.deepEqual(plugin.eslint.baseConfig, { "extends": ["eslint:recommended"] });
    t.is(plugin.eslint.configFile, DEFAULT_ESLINT_CONFIG);
});

test('init with eslint options', async t => {
    const options = {
        eslint: {
            configFile: "dummy_config.json"
        }
    };
    let plugin = eslinter(options);

    t.is(plugin.root, path.normalize(path.join(__dirname, '..')));
    t.deepEqual(plugin.test, /js$/);
    t.is(plugin.eslint.cwd, plugin.root);
    t.deepEqual(plugin.eslint.baseConfig, { "extends": ["eslint:recommended"] });
    t.is(plugin.eslint.configFile, options.eslint.configFile);
});


test('transform some file', async t => {
    const eslint_plugin_stub = sinon.stub(eslint, "CLIEngine");
    let file = {
        contents: "file_content",
        absPath: "1.js",
        collection: {
            name: "1"
        },
        context: {
            defaultPackageName: "2"
        }
    }

    const plugin = eslinter();
    plugin.init();
    t.true(eslint_plugin_stub.calledWithNew());
    t.true(eslint_plugin_stub.calledWith({
        cwd: plugin.root,
        baseConfig: {
            "extends": ["eslint:recommended"]
        },
        configFile: DEFAULT_ESLINT_CONFIG
    }))
    t.true(!!plugin.inner);

    plugin.inner.executeOnText = () => {
        t.fail("Shouldn't call executeOnText!");
    }

    plugin.transform(file);

    file.context.defaultPackageName = file.collection.name;

    const lint_result = {
        errorCount: 0,
        warningCount: 0,
        results: {
            test: true,
            lolka: "lolka"
        }
    };

    let executeOnText_called = false;
    plugin.inner.executeOnText = (content, file_path) => {
        t.is(content, file.contents);
        t.is(file_path, path.relative(plugin.root, file.absPath))
        executeOnText_called = true;

        return lint_result;
    };

    plugin.transform(file);

    t.true(executeOnText_called);

    lint_result.errorCount += 1;
    executeOnText_called = false;
    let formatter_called = false;

    let formatter = (report) => {
        t.deepEqual(report, lint_result.results);
        formatter_called = true;
        return '';
    };

    plugin.inner.getFormatter = () => formatter;

    plugin.transform(file);

    t.true(executeOnText_called);
    t.true(formatter_called);

    eslint.CLIEngine.restore();
});
